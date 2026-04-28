-- ============================================================================
-- ALTER ORDER TABLES FOR RETURN / REFUND TRACKING (V2 - PACKAGE + ITEM LINES)
-- ============================================================================
-- Purpose:
--   1) 1 return_request belongs to exactly 1 order_shipment (package)
--   2) returned items are stored in return_request_item lines
--   3) summary fields for order/shipment/item are rebuilt from return_request_item
--   4) when return_request -> REFUNDED, auto create financial_adjustment + settlement_adjustment
--
-- Usage order:
--   1. Apply ECOMMERCE.sql
--   2. Apply return_refund_schema.sql
--   3. Apply payment_financial_adjustment_schema.sql (if using payment_db automation)
--   4. Apply this file
-- ============================================================================

START TRANSACTION;

-- ============================================================================
-- 1. ORDERS: aggregate return/refund information for whole order
-- ============================================================================

ALTER TABLE `orders`
  ADD COLUMN `return_status_summary` VARCHAR(50) NOT NULL DEFAULT 'NONE'
    COMMENT 'NONE, PARTIAL_RETURN_IN_PROGRESS, PARTIAL_RETURNED, FULL_RETURN_IN_PROGRESS, FULL_RETURNED'
    AFTER `order_status`,
  ADD COLUMN `return_request_count` INT NOT NULL DEFAULT 0
    COMMENT 'Total number of return requests created for this order'
    AFTER `return_status_summary`,
  ADD COLUMN `total_return_requested_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total amount requested by buyer across all return requests of this order'
    AFTER `return_request_count`,
  ADD COLUMN `total_return_approved_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total approved amount across all return requests of this order'
    AFTER `total_return_requested_amount`,
  ADD COLUMN `total_refunded_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total successfully refunded amount for this order'
    AFTER `total_return_approved_amount`,
  ADD COLUMN `total_return_shipping_fee_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total reverse-logistics fee caused by return requests of this order'
    AFTER `total_refunded_amount`,
  ADD COLUMN `last_return_request_id` BIGINT NULL
    COMMENT 'Latest related return_request id for quick navigation'
    AFTER `total_return_shipping_fee_amount`,
  ADD COLUMN `last_refunded_at` TIMESTAMP NULL DEFAULT NULL
    COMMENT 'Timestamp of latest successful refund for this order'
    AFTER `last_return_request_id`;

ALTER TABLE `orders`
  ADD INDEX `idx_orders_return_status_summary` (`return_status_summary`),
  ADD INDEX `idx_orders_last_return_request_id` (`last_return_request_id`),
  ADD INDEX `idx_orders_last_refunded_at` (`last_refunded_at`);

-- ============================================================================
-- 2. ORDER_SHIPMENT: aggregate return/refund information per seller shipment
-- ============================================================================

ALTER TABLE `order_shipment`
  ADD COLUMN `return_status_summary` VARCHAR(50) NOT NULL DEFAULT 'NONE'
    COMMENT 'NONE, RETURN_IN_PROGRESS, PARTIAL_RETURNED, FULL_RETURNED'
    AFTER `shipping_status`,
  ADD COLUMN `return_request_count` INT NOT NULL DEFAULT 0
    COMMENT 'Total number of return requests linked to this shipment'
    AFTER `return_status_summary`,
  ADD COLUMN `total_return_item_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total merchandise amount approved for return within this shipment'
    AFTER `return_request_count`,
  ADD COLUMN `total_refunded_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total refunded amount for this shipment'
    AFTER `total_return_item_amount`,
  ADD COLUMN `return_shipping_fee_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Reverse-logistics fee allocated to this shipment'
    AFTER `total_refunded_amount`,
  ADD COLUMN `last_return_request_id` BIGINT NULL
    COMMENT 'Latest related return_request id for this shipment'
    AFTER `return_shipping_fee_amount`,
  ADD COLUMN `return_completed_at` TIMESTAMP NULL DEFAULT NULL
    COMMENT 'Timestamp when latest return for this shipment was fully completed'
    AFTER `last_return_request_id`;

ALTER TABLE `order_shipment`
  ADD INDEX `idx_order_shipment_return_status_summary` (`return_status_summary`),
  ADD INDEX `idx_order_shipment_last_return_request_id` (`last_return_request_id`),
  ADD INDEX `idx_order_shipment_return_completed_at` (`return_completed_at`);

-- ============================================================================
-- 3. ORDER_ITEM: detailed quantity and amount tracking for partial return
-- ============================================================================

ALTER TABLE `order_item`
  ADD COLUMN `return_status_summary` VARCHAR(50) NOT NULL DEFAULT 'NONE'
    COMMENT 'NONE, RETURN_REQUESTED, PARTIALLY_RETURNED, REFUND_IN_PROGRESS, REFUNDED'
    AFTER `is_adjusted`,
  ADD COLUMN `returnable_quantity` INT NULL
    COMMENT 'Current maximum quantity still eligible for return'
    AFTER `return_status_summary`,
  ADD COLUMN `returned_quantity` INT NOT NULL DEFAULT 0
    COMMENT 'Quantity already physically accepted back by warehouse'
    AFTER `returnable_quantity`,
  ADD COLUMN `refunded_quantity` INT NOT NULL DEFAULT 0
    COMMENT 'Quantity already financially refunded'
    AFTER `returned_quantity`,
  ADD COLUMN `total_return_requested_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total requested refund amount for this order item'
    AFTER `refunded_quantity`,
  ADD COLUMN `total_return_approved_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total approved refund amount for this order item'
    AFTER `total_return_requested_amount`,
  ADD COLUMN `total_refunded_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00
    COMMENT 'Total successfully refunded amount for this order item'
    AFTER `total_return_approved_amount`,
  ADD COLUMN `last_return_request_id` BIGINT NULL
    COMMENT 'Latest related return_request id for this item'
    AFTER `total_refunded_amount`;

-- Backfill returnable quantity from effective sold quantity.
UPDATE `order_item`
SET `returnable_quantity` = CASE
  WHEN `is_adjusted` = 1 AND `final_quantity` IS NOT NULL THEN GREATEST(`final_quantity`, 0)
  ELSE GREATEST(`quantity`, 0)
END
WHERE `id` > 0;

ALTER TABLE `order_item`
  MODIFY COLUMN `returnable_quantity` INT NOT NULL,
  ADD INDEX `idx_order_item_return_status_summary` (`return_status_summary`),
  ADD INDEX `idx_order_item_last_return_request_id` (`last_return_request_id`),
  ADD INDEX `idx_order_item_order_return_status` (`order_id`, `return_status_summary`);

COMMIT;

-- ============================================================================
-- 4. RETURN REQUEST STRUCTURE FOR PACKAGE + ITEM LINES
-- ============================================================================

ALTER TABLE `return_request`
  ADD COLUMN `order_shipment_id` BIGINT NULL
    COMMENT 'Package(shipment) being returned; one return request belongs to one shipment'
    AFTER `order_id`;

-- Backfill shipment for legacy rows from old order_item_id.
UPDATE `return_request` rr
JOIN `order_item` oi ON oi.id = rr.order_item_id
SET rr.order_shipment_id = oi.shipment_id
WHERE rr.id > 0
  AND rr.order_shipment_id IS NULL;

ALTER TABLE `return_request`
  MODIFY COLUMN `order_item_id` BIGINT NULL,
  ADD INDEX `idx_return_request_order_shipment_id` (`order_shipment_id`),
  DROP INDEX `uq_order_item_return`;

ALTER TABLE `return_request`
  ADD CONSTRAINT `fk_return_request_order_shipment`
    FOREIGN KEY (`order_shipment_id`) REFERENCES `order_shipment` (`id`) ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS `return_request_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `order_item_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL,
  `requested_amount` DECIMAL(18,2) NULL,
  `approved_amount` DECIMAL(18,2) NULL,
  `refunded_amount` DECIMAL(18,2) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_return_request_item` (`return_request_id`, `order_item_id`),
  KEY `idx_rri_order_item_id` (`order_item_id`),
  CONSTRAINT `fk_rri_return_request`
    FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rri_order_item`
    FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_rri_quantity_positive` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Item lines of a package-based return request';

-- CREATE TABLE IF NOT EXISTS `return_shipment_item` (
--   `id` BIGINT NOT NULL AUTO_INCREMENT,
--   `return_shipment_id` BIGINT NOT NULL,
--   `return_request_id` BIGINT NULL,
--   `order_item_id` BIGINT NOT NULL,
--   `quantity` INT NOT NULL,
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `uq_return_shipment_item` (`return_shipment_id`, `order_item_id`),
--   KEY `idx_rsi_return_request_id` (`return_request_id`),
--   KEY `idx_rsi_order_item_id` (`order_item_id`),
--   CONSTRAINT `fk_rsi_return_shipment`
--     FOREIGN KEY (`return_shipment_id`) REFERENCES `return_shipment` (`id`) ON DELETE CASCADE,
--   CONSTRAINT `fk_rsi_return_request`
--     FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE SET NULL,
--   CONSTRAINT `fk_rsi_order_item`
--     FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE RESTRICT,
--   CONSTRAINT `chk_rsi_quantity_positive` CHECK (`quantity` > 0)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
-- COMMENT='Items and quantities physically included in each return shipment';

-- Backfill item lines from legacy single-item return_request rows.
INSERT INTO `return_request_item` (
  `return_request_id`,
  `order_item_id`,
  `quantity`,
  `requested_amount`,
  `approved_amount`,
  `refunded_amount`
)
SELECT
  rr.id,
  rr.order_item_id,
  rr.quantity,
  rr.requested_amount,
  rr.approved_amount,
  rr.refunded_amount
FROM `return_request` rr
WHERE rr.order_item_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `return_request_item` rri
    WHERE rri.return_request_id = rr.id
      AND rri.order_item_id = rr.order_item_id
  );

-- Backfill shipment items from package-level return request item lines.
INSERT INTO `return_shipment_item` (
  `return_shipment_id`,
  `return_request_id`,
  `order_item_id`,
  `quantity`
)
SELECT
  rr.return_shipment_id,
  rr.id,
  rri.order_item_id,
  rri.quantity
FROM `return_request` rr
JOIN `return_request_item` rri ON rri.return_request_id = rr.id
WHERE rr.return_shipment_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `return_shipment_item` rsi
    WHERE rsi.return_shipment_id = rr.return_shipment_id
      AND rsi.order_item_id = rri.order_item_id
  );

-- ============================================================================
-- 5. PROCEDURES & TRIGGERS FOR SUMMARY REFRESH + FINANCIAL AUTOMATION
-- ============================================================================

DROP TRIGGER IF EXISTS `trg_return_request_after_insert_refresh_summary`;
DROP TRIGGER IF EXISTS `trg_return_request_after_update_refresh_summary`;
DROP TRIGGER IF EXISTS `trg_return_request_after_delete_refresh_summary`;
DROP TRIGGER IF EXISTS `trg_return_request_before_insert_validate_package`;
DROP TRIGGER IF EXISTS `trg_return_request_before_update_validate_package`;
DROP TRIGGER IF EXISTS `trg_return_request_item_before_insert_validate_scope`;
DROP TRIGGER IF EXISTS `trg_return_request_item_before_update_validate_scope`;
DROP TRIGGER IF EXISTS `trg_return_request_item_after_insert_refresh_summary`;
DROP TRIGGER IF EXISTS `trg_return_request_item_after_update_refresh_summary`;
DROP TRIGGER IF EXISTS `trg_return_request_item_after_delete_refresh_summary`;
DROP TRIGGER IF EXISTS `trg_return_request_item_after_insert_sync_shipment_item`;
DROP TRIGGER IF EXISTS `trg_return_request_item_after_update_sync_shipment_item`;
DROP TRIGGER IF EXISTS `trg_return_request_item_after_delete_sync_shipment_item`;
DROP PROCEDURE IF EXISTS `sp_refresh_return_refund_summary`;
DROP PROCEDURE IF EXISTS `sp_refresh_return_request_item_lines_summary`;
DROP PROCEDURE IF EXISTS `sp_generate_financial_settlement_from_refunded_return`;

DELIMITER $$

CREATE PROCEDURE `sp_refresh_return_refund_summary`(
  IN p_order_id BIGINT,
  IN p_order_item_id BIGINT
)
BEGIN
  DECLARE v_shipment_id BIGINT DEFAULT NULL;
  DECLARE v_effective_item_quantity INT DEFAULT 0;
  DECLARE v_item_request_count INT DEFAULT 0;
  DECLARE v_item_requested_qty INT DEFAULT 0;
  DECLARE v_item_refunded_qty INT DEFAULT 0;
  DECLARE v_item_in_progress_qty INT DEFAULT 0;
  DECLARE v_order_total_quantity INT DEFAULT 0;
  DECLARE v_order_requested_qty INT DEFAULT 0;
  DECLARE v_order_refunded_qty INT DEFAULT 0;
  DECLARE v_order_in_progress_qty INT DEFAULT 0;
  DECLARE v_shipment_total_quantity INT DEFAULT 0;
  DECLARE v_shipment_requested_qty INT DEFAULT 0;
  DECLARE v_shipment_refunded_qty INT DEFAULT 0;
  DECLARE v_shipment_in_progress_qty INT DEFAULT 0;

  SELECT oi.shipment_id,
         CASE
           WHEN oi.is_adjusted = 1 AND oi.final_quantity IS NOT NULL THEN GREATEST(oi.final_quantity, 0)
           ELSE GREATEST(oi.quantity, 0)
         END
  INTO v_shipment_id, v_effective_item_quantity
  FROM `order_item` oi
  WHERE oi.id = p_order_item_id
  LIMIT 1;

  IF p_order_item_id IS NULL OR v_shipment_id IS NULL THEN
    LEAVE BEGIN;
  END IF;

  -- 5.1 Refresh order_item summary from return_request_item lines.
  SELECT
    COUNT(DISTINCT rr.id),
    COALESCE(SUM(rri.quantity), 0),
    COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED' THEN rri.quantity ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN rr.status IN ('PENDING_APPROVAL', 'APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED') THEN rri.quantity ELSE 0 END), 0)
  INTO v_item_request_count, v_item_requested_qty, v_item_refunded_qty, v_item_in_progress_qty
  FROM `return_request_item` rri
  JOIN `return_request` rr ON rr.id = rri.return_request_id
  WHERE rri.order_item_id = p_order_item_id;

  UPDATE `order_item` oi
  SET oi.return_status_summary = CASE
        WHEN v_item_request_count = 0 THEN 'NONE'
        WHEN v_item_in_progress_qty > 0 AND (v_item_refunded_qty + v_item_in_progress_qty) >= v_effective_item_quantity THEN 'REFUND_IN_PROGRESS'
        WHEN v_item_in_progress_qty > 0 THEN 'RETURN_REQUESTED'
        WHEN v_item_refunded_qty >= v_effective_item_quantity AND v_effective_item_quantity > 0 THEN 'REFUNDED'
        WHEN v_item_refunded_qty > 0 THEN 'PARTIALLY_RETURNED'
        ELSE 'NONE'
      END,
      oi.returnable_quantity = GREATEST(v_effective_item_quantity - v_item_refunded_qty, 0),
      oi.returned_quantity = (
        SELECT COALESCE(SUM(rri2.quantity), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        WHERE rri2.order_item_id = p_order_item_id
          AND rr2.status IN ('RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
      ),
      oi.refunded_quantity = v_item_refunded_qty,
      oi.total_return_requested_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.requested_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        WHERE rri2.order_item_id = p_order_item_id
      ),
      oi.total_return_approved_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.approved_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        WHERE rri2.order_item_id = p_order_item_id
      ),
      oi.total_refunded_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.refunded_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        WHERE rri2.order_item_id = p_order_item_id
          AND rr2.status = 'REFUNDED'
      ),
      oi.last_return_request_id = (
        SELECT MAX(rr2.id)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        WHERE rri2.order_item_id = p_order_item_id
      )
  WHERE oi.id = p_order_item_id;

  -- 5.2 Refresh order_shipment summary from all item lines in shipment.
  SELECT
    COALESCE(SUM(CASE
      WHEN oi.is_adjusted = 1 AND oi.final_quantity IS NOT NULL THEN GREATEST(oi.final_quantity, 0)
      ELSE GREATEST(oi.quantity, 0)
    END), 0)
  INTO v_shipment_total_quantity
  FROM `order_item` oi
  WHERE oi.shipment_id = v_shipment_id;

  SELECT
    COALESCE(SUM(rri.quantity), 0),
    COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED' THEN rri.quantity ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN rr.status IN ('PENDING_APPROVAL', 'APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED') THEN rri.quantity ELSE 0 END), 0)
  INTO v_shipment_requested_qty, v_shipment_refunded_qty, v_shipment_in_progress_qty
  FROM `return_request_item` rri
  JOIN `return_request` rr ON rr.id = rri.return_request_id
  JOIN `order_item` oi ON oi.id = rri.order_item_id
  WHERE oi.shipment_id = v_shipment_id;

  UPDATE `order_shipment` os
  SET os.return_status_summary = CASE
        WHEN v_shipment_requested_qty = 0 THEN 'NONE'
        WHEN v_shipment_in_progress_qty > 0 THEN 'RETURN_IN_PROGRESS'
        WHEN v_shipment_refunded_qty >= v_shipment_total_quantity AND v_shipment_total_quantity > 0 THEN 'FULL_RETURNED'
        WHEN v_shipment_refunded_qty > 0 THEN 'PARTIAL_RETURNED'
        ELSE 'NONE'
      END,
      os.return_request_count = (
        SELECT COUNT(DISTINCT rr.id)
        FROM `return_request` rr
        WHERE rr.order_shipment_id = v_shipment_id
      ),
      os.total_return_item_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.approved_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        JOIN `order_item` oi2 ON oi2.id = rri2.order_item_id
        WHERE oi2.shipment_id = v_shipment_id
      ),
      os.total_refunded_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.refunded_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        JOIN `order_item` oi2 ON oi2.id = rri2.order_item_id
        WHERE oi2.shipment_id = v_shipment_id
          AND rr2.status = 'REFUNDED'
      ),
      os.return_shipping_fee_amount = 0.00,
      os.last_return_request_id = (
        SELECT MAX(rr2.id)
        FROM `return_request` rr2
        WHERE rr2.order_shipment_id = v_shipment_id
      ),
      os.return_completed_at = (
        SELECT MAX(rr2.updated_at)
        FROM `return_request` rr2
        WHERE rr2.order_shipment_id = v_shipment_id
          AND rr2.status = 'REFUNDED'
      )
  WHERE os.id = v_shipment_id;

  -- 5.3 Refresh order summary from all item lines in order.
  SELECT
    COALESCE(SUM(CASE
      WHEN oi.is_adjusted = 1 AND oi.final_quantity IS NOT NULL THEN GREATEST(oi.final_quantity, 0)
      ELSE GREATEST(oi.quantity, 0)
    END), 0)
  INTO v_order_total_quantity
  FROM `order_item` oi
  WHERE oi.order_id = p_order_id;

  SELECT
    COALESCE(SUM(rri.quantity), 0),
    COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED' THEN rri.quantity ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN rr.status IN ('PENDING_APPROVAL', 'APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED') THEN rri.quantity ELSE 0 END), 0)
  INTO v_order_requested_qty, v_order_refunded_qty, v_order_in_progress_qty
  FROM `return_request_item` rri
  JOIN `return_request` rr ON rr.id = rri.return_request_id
  JOIN `order_item` oi ON oi.id = rri.order_item_id
  WHERE oi.order_id = p_order_id;

  UPDATE `orders` o
  SET o.return_status_summary = CASE
        WHEN v_order_requested_qty = 0 THEN 'NONE'
        WHEN v_order_in_progress_qty > 0 AND (v_order_refunded_qty + v_order_in_progress_qty) >= v_order_total_quantity AND v_order_total_quantity > 0 THEN 'FULL_RETURN_IN_PROGRESS'
        WHEN v_order_in_progress_qty > 0 THEN 'PARTIAL_RETURN_IN_PROGRESS'
        WHEN v_order_refunded_qty >= v_order_total_quantity AND v_order_total_quantity > 0 THEN 'FULL_RETURNED'
        WHEN v_order_refunded_qty > 0 THEN 'PARTIAL_RETURNED'
        ELSE 'NONE'
      END,
      o.return_request_count = (
        SELECT COUNT(DISTINCT rr2.id)
        FROM `return_request` rr2
        WHERE rr2.order_id = p_order_id
      ),
      o.total_return_requested_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.requested_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        JOIN `order_item` oi2 ON oi2.id = rri2.order_item_id
        WHERE oi2.order_id = p_order_id
      ),
      o.total_return_approved_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.approved_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        JOIN `order_item` oi2 ON oi2.id = rri2.order_item_id
        WHERE oi2.order_id = p_order_id
      ),
      o.total_refunded_amount = (
        SELECT COALESCE(SUM(COALESCE(rri2.refunded_amount, 0)), 0)
        FROM `return_request_item` rri2
        JOIN `return_request` rr2 ON rr2.id = rri2.return_request_id
        JOIN `order_item` oi2 ON oi2.id = rri2.order_item_id
        WHERE oi2.order_id = p_order_id
          AND rr2.status = 'REFUNDED'
      ),
      o.total_return_shipping_fee_amount = 0.00,
      o.last_return_request_id = (
        SELECT MAX(rr2.id)
        FROM `return_request` rr2
        WHERE rr2.order_id = p_order_id
      ),
      o.last_refunded_at = (
        SELECT MAX(rr2.updated_at)
        FROM `return_request` rr2
        WHERE rr2.order_id = p_order_id
          AND rr2.status = 'REFUNDED'
      )
  WHERE o.id = p_order_id;
END$$

CREATE PROCEDURE `sp_refresh_return_request_item_lines_summary`(
  IN p_return_request_id BIGINT
)
BEGIN
  DECLARE v_done INT DEFAULT 0;
  DECLARE v_order_id BIGINT;
  DECLARE v_order_item_id BIGINT;

  DECLARE cur_items CURSOR FOR
    SELECT rr.order_id, rri.order_item_id
    FROM `return_request_item` rri
    JOIN `return_request` rr ON rr.id = rri.return_request_id
    WHERE rr.id = p_return_request_id;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

  OPEN cur_items;

  read_loop: LOOP
    FETCH cur_items INTO v_order_id, v_order_item_id;
    IF v_done = 1 THEN
      LEAVE read_loop;
    END IF;

    CALL `sp_refresh_return_refund_summary`(v_order_id, v_order_item_id);
  END LOOP;

  CLOSE cur_items;
END$$

CREATE PROCEDURE `sp_generate_financial_settlement_from_refunded_return`(
  IN p_return_request_id BIGINT
)
proc_financial: BEGIN
  DECLARE v_financial_table_exists INT DEFAULT 0;
  DECLARE v_allocation_table_exists INT DEFAULT 0;
  DECLARE v_settlement_table_exists INT DEFAULT 0;
  DECLARE v_refund_request_table_exists INT DEFAULT 0;

  DECLARE v_rr_id BIGINT DEFAULT NULL;
  DECLARE v_order_id BIGINT DEFAULT NULL;
  DECLARE v_order_item_id BIGINT DEFAULT NULL;
  DECLARE v_shop_id BIGINT DEFAULT NULL;
  DECLARE v_customer_id BIGINT DEFAULT NULL;
  DECLARE v_order_number VARCHAR(64) DEFAULT NULL;
  DECLARE v_shipment_id BIGINT DEFAULT NULL;
  DECLARE v_rr_status VARCHAR(50) DEFAULT NULL;
  DECLARE v_rr_reason VARCHAR(255) DEFAULT NULL;
  DECLARE v_refunded_amount DECIMAL(18,2) DEFAULT 0;
  DECLARE v_adjustment_amount BIGINT DEFAULT 0;
  DECLARE v_existing_financial_id BIGINT DEFAULT NULL;
  DECLARE v_financial_id BIGINT DEFAULT NULL;
  DECLARE v_seller_allocation_id BIGINT DEFAULT NULL;
  DECLARE v_financial_code VARCHAR(64) DEFAULT NULL;
  DECLARE v_adjustment_reason VARCHAR(50) DEFAULT 'SELLER_LIABILITY';
  DECLARE v_line_refunded_amount DECIMAL(18,2) DEFAULT 0;

  SELECT COUNT(*) INTO v_financial_table_exists
  FROM information_schema.tables
  WHERE table_schema = 'payment_db' AND table_name = 'financial_adjustment';

  SELECT COUNT(*) INTO v_allocation_table_exists
  FROM information_schema.tables
  WHERE table_schema = 'payment_db' AND table_name = 'financial_adjustment_allocation';

  SELECT COUNT(*) INTO v_settlement_table_exists
  FROM information_schema.tables
  WHERE table_schema = 'payment_db' AND table_name = 'settlement_adjustment';

  SELECT COUNT(*) INTO v_refund_request_table_exists
  FROM information_schema.tables
  WHERE table_schema = 'payment_db' AND table_name = 'refund_request';

  IF v_financial_table_exists = 0
     OR v_allocation_table_exists = 0
     OR v_settlement_table_exists = 0 THEN
    LEAVE proc_financial;
  END IF;

  SELECT COALESCE(SUM(COALESCE(rri.refunded_amount, rri.approved_amount, rri.requested_amount, 0)), 0)
  INTO v_line_refunded_amount
  FROM `return_request_item` rri
  WHERE rri.return_request_id = p_return_request_id;

  SELECT rr.id,
         rr.order_id,
         rr.order_item_id,
         rr.shop_id,
         rr.customer_id,
         rr.status,
         rr.reason,
         COALESCE(rr.refunded_amount, v_line_refunded_amount, rr.approved_amount, rr.requested_amount, 0),
         COALESCE(rr.order_shipment_id, oi.shipment_id),
         o.order_number
  INTO v_rr_id,
       v_order_id,
       v_order_item_id,
       v_shop_id,
       v_customer_id,
       v_rr_status,
       v_rr_reason,
       v_refunded_amount,
       v_shipment_id,
       v_order_number
  FROM `return_request` rr
  LEFT JOIN `order_item` oi ON oi.id = rr.order_item_id
  LEFT JOIN `orders` o ON o.id = rr.order_id
  WHERE rr.id = p_return_request_id
  LIMIT 1;

  IF v_rr_id IS NULL OR v_rr_status <> 'REFUNDED' THEN
    LEAVE proc_financial;
  END IF;

  SET v_adjustment_amount = CAST(ROUND(COALESCE(v_refunded_amount, 0), 0) AS SIGNED);

  IF v_adjustment_amount <= 0 THEN
    LEAVE proc_financial;
  END IF;

  SELECT fa.id
  INTO v_existing_financial_id
  FROM payment_db.financial_adjustment fa
  WHERE fa.source_service = 'ECOMMERCE'
    AND fa.source_type = 'RETURN_REFUND'
    AND fa.source_ref_type = 'RETURN_REQUEST'
    AND fa.source_ref_id = p_return_request_id
  ORDER BY fa.id DESC
  LIMIT 1;

  IF v_existing_financial_id IS NOT NULL THEN
    LEAVE proc_financial;
  END IF;

  SET v_financial_code = CONCAT('FA-RR-', p_return_request_id);

  IF LOWER(COALESCE(v_rr_reason, '')) IN ('changed_mind', 'buyer_remorse') THEN
    SET v_adjustment_reason = 'MANUAL_CORRECTION';
  ELSEIF LOWER(COALESCE(v_rr_reason, '')) IN ('wrong_item', 'not_as_described') THEN
    SET v_adjustment_reason = 'NOT_AS_DESCRIBED';
  ELSE
    SET v_adjustment_reason = 'SELLER_LIABILITY';
  END IF;

  INSERT INTO payment_db.financial_adjustment (
    adjustment_code,
    source_service,
    source_type,
    source_ref_type,
    source_ref_id,
    source_ref_code,
    order_id,
    order_number,
    shop_id,
    user_id,
    return_request_id,
    return_shipment_id,
    adjustment_reason,
    gross_adjustment_amount,
    status,
    approved_at,
    effective_at,
    note,
    extra_data
  ) VALUES (
    v_financial_code,
    'ECOMMERCE',
    'RETURN_REFUND',
    'RETURN_REQUEST',
    p_return_request_id,
    v_financial_code,
    v_order_id,
    v_order_number,
    v_shop_id,
    v_customer_id,
    p_return_request_id,
    v_shipment_id,
    v_adjustment_reason,
    v_adjustment_amount,
    'ALLOCATED',
    NOW(),
    NOW(),
    CONCAT('Auto generated from return_request REFUNDED: ', p_return_request_id),
    JSON_OBJECT(
      'return_request_id', p_return_request_id,
      'order_item_id', v_order_item_id,
      'refunded_amount', v_adjustment_amount,
      'generated_by', 'trg_return_request_after_update_refresh_summary'
    )
  );

  SET v_financial_id = LAST_INSERT_ID();

  INSERT INTO payment_db.financial_adjustment_allocation (
    financial_adjustment_id,
    party_type,
    party_id,
    entry_direction,
    amount,
    settlement_eligible,
    settlement_status,
    netting_group,
    note
  ) VALUES (
    v_financial_id,
    'SELLER',
    v_shop_id,
    'DEBIT',
    v_adjustment_amount,
    1,
    'UNSETTLED',
    'RETURN',
    'Seller liability for refunded return'
  );

  SET v_seller_allocation_id = LAST_INSERT_ID();

  INSERT INTO payment_db.financial_adjustment_allocation (
    financial_adjustment_id,
    party_type,
    party_id,
    entry_direction,
    amount,
    settlement_eligible,
    settlement_status,
    netting_group,
    note
  ) VALUES (
    v_financial_id,
    'BUYER',
    v_customer_id,
    'CREDIT',
    v_adjustment_amount,
    0,
    'WAIVED',
    'REFUND',
    'Buyer refund mirror entry'
  );

  INSERT INTO payment_db.settlement_adjustment (
    adjustment_allocation_id,
    settlement_target_type,
    settlement_target_id,
    entry_type,
    amount,
    period_from,
    period_to,
    status,
    note
  ) VALUES (
    v_seller_allocation_id,
    'SELLER',
    v_shop_id,
    'DEDUCTION',
    v_adjustment_amount,
    DATE(NOW()),
    DATE(NOW()),
    'PENDING',
    CONCAT('Pending seller deduction from refunded return request ', p_return_request_id)
  );

  IF v_refund_request_table_exists > 0 THEN
    UPDATE payment_db.refund_request pr
    SET pr.financial_adjustment_id = v_financial_id
    WHERE pr.order_id = v_order_id
      AND pr.user_id = v_customer_id
      AND pr.financial_adjustment_id IS NULL
      AND pr.status IN ('PROCESSING', 'COMPLETED', 'APPROVED');
  END IF;
END$$

CREATE TRIGGER `trg_return_request_before_insert_validate_package`
BEFORE INSERT ON `return_request`
FOR EACH ROW
BEGIN
  DECLARE v_order_from_shipment BIGINT;

  IF NEW.order_shipment_id IS NOT NULL THEN
    SELECT os.order_id INTO v_order_from_shipment
    FROM `order_shipment` os
    WHERE os.id = NEW.order_shipment_id
    LIMIT 1;

    IF v_order_from_shipment IS NULL OR v_order_from_shipment <> NEW.order_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'return_request.order_shipment_id must belong to return_request.order_id';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_return_request_before_update_validate_package`
BEFORE UPDATE ON `return_request`
FOR EACH ROW
BEGIN
  DECLARE v_order_from_shipment BIGINT;

  IF NEW.order_shipment_id IS NOT NULL THEN
    SELECT os.order_id INTO v_order_from_shipment
    FROM `order_shipment` os
    WHERE os.id = NEW.order_shipment_id
    LIMIT 1;

    IF v_order_from_shipment IS NULL OR v_order_from_shipment <> NEW.order_id THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'return_request.order_shipment_id must belong to return_request.order_id';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_return_request_after_insert_refresh_summary`
AFTER INSERT ON `return_request`
FOR EACH ROW
BEGIN
  CALL `sp_refresh_return_request_item_lines_summary`(NEW.id);
END$$

CREATE TRIGGER `trg_return_request_after_update_refresh_summary`
AFTER UPDATE ON `return_request`
FOR EACH ROW
BEGIN
  CALL `sp_refresh_return_request_item_lines_summary`(NEW.id);

  IF OLD.status <> 'REFUNDED' AND NEW.status = 'REFUNDED' THEN
    CALL `sp_generate_financial_settlement_from_refunded_return`(NEW.id);
  END IF;

  IF OLD.order_id <> NEW.order_id THEN
    CALL `sp_refresh_return_request_item_lines_summary`(OLD.id);
  END IF;
END$$

CREATE TRIGGER `trg_return_request_after_delete_refresh_summary`
AFTER DELETE ON `return_request`
FOR EACH ROW
BEGIN
  -- summary rows are refreshed by item triggers during delete cascade from return_request_item
  -- kept intentionally empty
END$$

CREATE TRIGGER `trg_return_request_item_before_insert_validate_scope`
BEFORE INSERT ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_rr_order_id BIGINT;
  DECLARE v_rr_shipment_id BIGINT;
  DECLARE v_item_order_id BIGINT;
  DECLARE v_item_shipment_id BIGINT;

  SELECT rr.order_id, rr.order_shipment_id
  INTO v_rr_order_id, v_rr_shipment_id
  FROM `return_request` rr
  WHERE rr.id = NEW.return_request_id
  LIMIT 1;

  SELECT oi.order_id, oi.shipment_id
  INTO v_item_order_id, v_item_shipment_id
  FROM `order_item` oi
  WHERE oi.id = NEW.order_item_id
  LIMIT 1;

  IF v_rr_order_id IS NULL OR v_item_order_id IS NULL OR v_rr_order_id <> v_item_order_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'return_request_item.order_item_id must belong to same order as return_request';
  END IF;

  IF v_rr_shipment_id IS NOT NULL AND v_rr_shipment_id <> v_item_shipment_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'return_request_item.order_item_id must belong to return_request.order_shipment_id';
  END IF;
END$$

CREATE TRIGGER `trg_return_request_item_before_update_validate_scope`
BEFORE UPDATE ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_rr_order_id BIGINT;
  DECLARE v_rr_shipment_id BIGINT;
  DECLARE v_item_order_id BIGINT;
  DECLARE v_item_shipment_id BIGINT;

  SELECT rr.order_id, rr.order_shipment_id
  INTO v_rr_order_id, v_rr_shipment_id
  FROM `return_request` rr
  WHERE rr.id = NEW.return_request_id
  LIMIT 1;

  SELECT oi.order_id, oi.shipment_id
  INTO v_item_order_id, v_item_shipment_id
  FROM `order_item` oi
  WHERE oi.id = NEW.order_item_id
  LIMIT 1;

  IF v_rr_order_id IS NULL OR v_item_order_id IS NULL OR v_rr_order_id <> v_item_order_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'return_request_item.order_item_id must belong to same order as return_request';
  END IF;

  IF v_rr_shipment_id IS NOT NULL AND v_rr_shipment_id <> v_item_shipment_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'return_request_item.order_item_id must belong to return_request.order_shipment_id';
  END IF;
END$$

CREATE TRIGGER `trg_return_request_item_after_insert_refresh_summary`
AFTER INSERT ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_order_id BIGINT;
  SELECT rr.order_id INTO v_order_id
  FROM `return_request` rr
  WHERE rr.id = NEW.return_request_id
  LIMIT 1;

  CALL `sp_refresh_return_refund_summary`(v_order_id, NEW.order_item_id);
END$$

CREATE TRIGGER `trg_return_request_item_after_insert_sync_shipment_item`
AFTER INSERT ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_return_shipment_id BIGINT;

  SELECT rr.return_shipment_id
  INTO v_return_shipment_id
  FROM `return_request` rr
  WHERE rr.id = NEW.return_request_id
  LIMIT 1;

  IF v_return_shipment_id IS NOT NULL THEN
    INSERT INTO `return_shipment_item` (
      `return_shipment_id`,
      `return_request_id`,
      `order_item_id`,
      `quantity`
    ) VALUES (
      v_return_shipment_id,
      NEW.return_request_id,
      NEW.order_item_id,
      NEW.quantity
    )
    ON DUPLICATE KEY UPDATE
      `return_request_id` = VALUES(`return_request_id`),
      `quantity` = VALUES(`quantity`),
      `updated_at` = CURRENT_TIMESTAMP;
  END IF;
END$$

CREATE TRIGGER `trg_return_request_item_after_update_refresh_summary`
AFTER UPDATE ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_new_order_id BIGINT;
  DECLARE v_old_order_id BIGINT;

  SELECT rr.order_id INTO v_new_order_id
  FROM `return_request` rr
  WHERE rr.id = NEW.return_request_id
  LIMIT 1;

  SELECT rr.order_id INTO v_old_order_id
  FROM `return_request` rr
  WHERE rr.id = OLD.return_request_id
  LIMIT 1;

  CALL `sp_refresh_return_refund_summary`(v_new_order_id, NEW.order_item_id);

  IF OLD.order_item_id <> NEW.order_item_id OR OLD.return_request_id <> NEW.return_request_id THEN
    CALL `sp_refresh_return_refund_summary`(v_old_order_id, OLD.order_item_id);
  END IF;
END$$

CREATE TRIGGER `trg_return_request_item_after_update_sync_shipment_item`
AFTER UPDATE ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_new_return_shipment_id BIGINT;
  DECLARE v_old_return_shipment_id BIGINT;

  SELECT rr.return_shipment_id
  INTO v_new_return_shipment_id
  FROM `return_request` rr
  WHERE rr.id = NEW.return_request_id
  LIMIT 1;

  SELECT rr.return_shipment_id
  INTO v_old_return_shipment_id
  FROM `return_request` rr
  WHERE rr.id = OLD.return_request_id
  LIMIT 1;

  IF v_new_return_shipment_id IS NOT NULL THEN
    INSERT INTO `return_shipment_item` (
      `return_shipment_id`,
      `return_request_id`,
      `order_item_id`,
      `quantity`
    ) VALUES (
      v_new_return_shipment_id,
      NEW.return_request_id,
      NEW.order_item_id,
      NEW.quantity
    )
    ON DUPLICATE KEY UPDATE
      `return_request_id` = VALUES(`return_request_id`),
      `quantity` = VALUES(`quantity`),
      `updated_at` = CURRENT_TIMESTAMP;
  END IF;

  IF v_old_return_shipment_id IS NOT NULL
     AND (OLD.return_request_id <> NEW.return_request_id OR OLD.order_item_id <> NEW.order_item_id) THEN
    DELETE FROM `return_shipment_item`
    WHERE `return_shipment_id` = v_old_return_shipment_id
      AND `order_item_id` = OLD.order_item_id;
  END IF;
END$$

CREATE TRIGGER `trg_return_request_item_after_delete_refresh_summary`
AFTER DELETE ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_order_id BIGINT;
  DECLARE v_order_item_id BIGINT;

  SELECT rr.order_id, rr.order_item_id
  INTO v_order_id, v_order_item_id
  FROM `return_request` rr
  WHERE rr.id = OLD.return_request_id
  LIMIT 1;

  CALL `sp_refresh_return_refund_summary`(COALESCE(v_order_id, 0), OLD.order_item_id);

  IF v_order_item_id IS NOT NULL AND v_order_item_id <> OLD.order_item_id THEN
    CALL `sp_refresh_return_refund_summary`(v_order_id, v_order_item_id);
  END IF;
END$$

CREATE TRIGGER `trg_return_request_item_after_delete_sync_shipment_item`
AFTER DELETE ON `return_request_item`
FOR EACH ROW
BEGIN
  DECLARE v_return_shipment_id BIGINT;

  SELECT rr.return_shipment_id
  INTO v_return_shipment_id
  FROM `return_request` rr
  WHERE rr.id = OLD.return_request_id
  LIMIT 1;

  IF v_return_shipment_id IS NOT NULL THEN
    DELETE FROM `return_shipment_item`
    WHERE `return_shipment_id` = v_return_shipment_id
      AND `order_item_id` = OLD.order_item_id;
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT
  rr.id,
  rr.order_id,
  rr.order_shipment_id,
  rr.status,
  COUNT(rri.id) AS line_count,
  COALESCE(SUM(rri.quantity), 0) AS total_line_quantity
FROM `return_request` rr
LEFT JOIN `return_request_item` rri ON rri.return_request_id = rr.id
GROUP BY rr.id, rr.order_id, rr.order_shipment_id, rr.status
ORDER BY rr.id DESC
LIMIT 10;

SELECT
  rsi.return_shipment_id,
  rsi.return_request_id,
  rsi.order_item_id,
  rsi.quantity,
  rsi.updated_at
FROM `return_shipment_item` rsi
ORDER BY rsi.return_shipment_id DESC, rsi.order_item_id ASC
LIMIT 20;

SELECT
  id,
  order_number,
  return_status_summary,
  return_request_count,
  total_refunded_amount
FROM `orders`
LIMIT 5;

SELECT
  id,
  order_id,
  return_status_summary,
  return_request_count,
  total_refunded_amount
FROM `order_shipment`
LIMIT 5;

SELECT
  id,
  order_id,
  return_status_summary,
  returnable_quantity,
  returned_quantity,
  refunded_quantity,
  total_refunded_amount
FROM `order_item`
LIMIT 10;
