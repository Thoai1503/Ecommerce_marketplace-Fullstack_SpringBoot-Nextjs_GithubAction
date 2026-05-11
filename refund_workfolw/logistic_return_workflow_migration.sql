-- ============================================================================
-- LOGISTIC SERVICE - RETURN WORKFLOW MIGRATION
-- ============================================================================
-- Purpose:
--   Extend logistic_service schema so it can serve the full return workflow
--   defined in ecommerce.return_request / return_shipment.
--
-- Core design decisions:
--   1. Reuse `shipment` as the central parcel entity for both forward and return.
--   2. Add reverse-shipment references to ecommerce return tables as loose refs.
--   3. Reuse `shipment_item` as snapshot lines for returned items by adding
--      ecommerce refs to order_item / return_request_item.
--   4. Strengthen `shipment_status_history` with event metadata and idempotency.
--   5. Add webhook outbox table so logistics can push status changes back to ecommerce.
--
-- Apply after:
--   1. logistic.sql
--   2. ecommerce return/refund schema on ecommerce service side
-- ============================================================================

START TRANSACTION;

-- ============================================================================
-- 1. EXTEND SHIPMENT FOR RETURN DIRECTION
-- ============================================================================

ALTER TABLE `shipment`
  MODIFY COLUMN `order_shipment_ref_id` BIGINT NULL COMMENT 'order_shipment.id bên ecommerce service cho shipment chiều đi',
  ADD COLUMN `shipment_direction` ENUM('FORWARD', 'RETURN') NOT NULL DEFAULT 'FORWARD'
    COMMENT 'FORWARD: giao hàng đi, RETURN: kiện hàng trả về'
    AFTER `tracking_code`,
  ADD COLUMN `business_ref_type` ENUM('ORDER_SHIPMENT', 'RETURN_SHIPMENT') NOT NULL DEFAULT 'ORDER_SHIPMENT'
    COMMENT 'Loại nghiệp vụ nguồn ở ecommerce'
    AFTER `order_shipment_ref_id`,
  ADD COLUMN `return_request_ref_id` BIGINT NULL
    COMMENT 'return_request.id bên ecommerce cho workflow trả hàng'
    AFTER `business_ref_type`,
  ADD COLUMN `return_shipment_ref_id` BIGINT NULL
    COMMENT 'return_shipment.id bên ecommerce'
    AFTER `return_request_ref_id`,
  ADD COLUMN `original_shipment_id` BIGINT NULL
    COMMENT 'shipment.id chiều đi gốc mà kiện trả này tham chiếu'
    AFTER `return_shipment_ref_id`,
  ADD COLUMN `pickup_contact_id` BIGINT NULL
    COMMENT 'Snapshot địa chỉ/người giao kiện cho bên vận chuyển; dùng cho buyer pickup trong return'
    AFTER `recipient_id`,
  ADD COLUMN `external_tracking_code` VARCHAR(100) NULL
    COMMENT 'Mã tracking từ đối tác vận chuyển nếu khác tracking_code nội bộ'
    AFTER `status`,
  ADD COLUMN `pickup_requested_at` TIMESTAMP NULL DEFAULT NULL
    COMMENT 'Thời điểm yêu cầu lấy hàng được tạo'
    AFTER `note`,
  ADD COLUMN `picked_up_at` TIMESTAMP NULL DEFAULT NULL
    COMMENT 'Thời điểm lấy hàng thực tế'
    AFTER `pickup_requested_at`,
  ADD COLUMN `failed_reason` VARCHAR(255) NULL
    COMMENT 'Lý do giao/lấy hàng thất bại'
    AFTER `delivered_at`,
  ADD COLUMN `cancelled_at` TIMESTAMP NULL DEFAULT NULL
    COMMENT 'Thời điểm huỷ vận đơn'
    AFTER `failed_reason`,
  ADD COLUMN `cancelled_reason` VARCHAR(255) NULL
    COMMENT 'Lý do huỷ vận đơn'
    AFTER `cancelled_at`;

UPDATE `shipment`
SET `shipment_direction` = 'FORWARD',
    `business_ref_type` = 'ORDER_SHIPMENT'
WHERE `id` > 0;

ALTER TABLE `shipment`
  ADD KEY `idx_shipment_direction` (`shipment_direction`),
  ADD KEY `idx_shipment_business_ref` (`business_ref_type`, `order_shipment_ref_id`, `return_shipment_ref_id`),
  ADD KEY `idx_shipment_return_request_ref` (`return_request_ref_id`),
  ADD KEY `idx_shipment_return_shipment_ref` (`return_shipment_ref_id`),
  ADD KEY `idx_shipment_original_shipment` (`original_shipment_id`),
  ADD KEY `idx_shipment_pickup_contact` (`pickup_contact_id`),
  ADD KEY `idx_shipment_external_tracking` (`external_tracking_code`),
  ADD CONSTRAINT `fk_shipment_original_shipment`
    FOREIGN KEY (`original_shipment_id`) REFERENCES `shipment` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_shipment_pickup_contact`
    FOREIGN KEY (`pickup_contact_id`) REFERENCES `recipient` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `chk_shipment_return_ref_scope`
    CHECK (
      (`shipment_direction` = 'FORWARD'
        AND `business_ref_type` = 'ORDER_SHIPMENT'
        AND `order_shipment_ref_id` IS NOT NULL)
      OR
      (`shipment_direction` = 'RETURN'
        AND `business_ref_type` = 'RETURN_SHIPMENT'
        AND `return_request_ref_id` IS NOT NULL
        AND `return_shipment_ref_id` IS NOT NULL)
    );

-- ============================================================================
-- 2. EXTEND SHIPMENT_ITEM FOR RETURN ITEM SNAPSHOT
-- ============================================================================

ALTER TABLE `shipment_item`
  ADD COLUMN `order_item_ref_id` BIGINT NULL
    COMMENT 'order_item.id bên ecommerce nếu cần đối chiếu item'
    AFTER `shipment_id`,
  ADD COLUMN `return_request_item_ref_id` BIGINT NULL
    COMMENT 'return_request_item.id bên ecommerce cho item line trả hàng'
    AFTER `order_item_ref_id`,
  ADD COLUMN `product_variant_ref_id` BIGINT NULL
    COMMENT 'product_variant.id bên ecommerce để hỗ trợ nhập kho/đối soát'
    AFTER `sku`,
  ADD COLUMN `item_note` VARCHAR(255) NULL
    COMMENT 'Ghi chú cho item line trong vận đơn trả'
    AFTER `price`;

ALTER TABLE `shipment_item`
  ADD KEY `idx_shipment_item_order_item_ref` (`order_item_ref_id`),
  ADD KEY `idx_shipment_item_return_request_item_ref` (`return_request_item_ref_id`),
  ADD KEY `idx_shipment_item_variant_ref` (`product_variant_ref_id`),
  ADD CONSTRAINT `chk_shipment_item_quantity_positive` CHECK (`quantity` > 0);

-- ============================================================================
-- 3. EXTEND SHIPMENT_STATUS_HISTORY FOR WEBHOOK / IDEMPOTENCY
-- ============================================================================

ALTER TABLE `shipment_status_history`
  ADD COLUMN `event_code` VARCHAR(50) NULL
    COMMENT 'Mã sự kiện chuẩn hoá để sync sang ecommerce return_shipment_history'
    AFTER `status`,
  ADD COLUMN `external_event_id` VARCHAR(255) NULL
    COMMENT 'ID sự kiện từ courier/provider để chống xử lý trùng'
    AFTER `event_code`,
  ADD COLUMN `source_service` VARCHAR(50) NULL
    COMMENT 'Nguồn phát sinh: COURIER_WEBHOOK | DRIVER_APP | OPS_PORTAL | SYSTEM'
    AFTER `updated_by`,
  ADD COLUMN `event_payload` JSON NULL
    COMMENT 'Payload gốc hoặc payload chuẩn hoá của sự kiện'
    AFTER `source_service`;

ALTER TABLE `shipment_status_history`
  ADD KEY `idx_status_history_event_code` (`event_code`),
  ADD KEY `idx_status_history_external_event` (`external_event_id`),
  ADD CONSTRAINT `uq_status_history_external_event`
    UNIQUE (`shipment_id`, `external_event_id`);

-- ============================================================================
-- 4. WEBHOOK OUTBOX FOR ECOMMERCE SYNC
-- ============================================================================

CREATE TABLE IF NOT EXISTS `shipment_webhook_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shipment_id` BIGINT NOT NULL,
  `target_service` VARCHAR(50) NOT NULL COMMENT 'ECOMMERCE_ORDER | ECOMMERCE_RETURN',
  `event_type` VARCHAR(100) NOT NULL COMMENT 'shipment.status_changed | return_shipment.status_changed',
  `event_id` VARCHAR(100) NOT NULL COMMENT 'Idempotency key của event gửi sang service khác',
  `payload` JSON NOT NULL,
  `delivery_status` ENUM('PENDING', 'SENT', 'FAILED', 'DEAD') NOT NULL DEFAULT 'PENDING',
  `retry_count` INT NOT NULL DEFAULT 0,
  `next_retry_at` TIMESTAMP NULL DEFAULT NULL,
  `last_error` TEXT NULL,
  `sent_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shipment_webhook_event_id` (`event_id`),
  KEY `idx_shipment_webhook_status` (`delivery_status`, `next_retry_at`),
  KEY `idx_shipment_webhook_shipment` (`shipment_id`),
  CONSTRAINT `fk_shipment_webhook_event_shipment`
    FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Outbox event để logistics service đẩy webhook trạng thái sang ecommerce';

COMMIT;

-- ============================================================================
-- 5. VALIDATION TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS `trg_shipment_before_insert_validate_return_scope`;
DROP TRIGGER IF EXISTS `trg_shipment_before_update_validate_return_scope`;
DROP TRIGGER IF EXISTS `trg_shipment_item_before_insert_validate_return_scope`;
DROP TRIGGER IF EXISTS `trg_shipment_item_before_update_validate_return_scope`;
DROP TRIGGER IF EXISTS `trg_shipment_after_update_enqueue_webhook_event`;

DELIMITER $$

CREATE TRIGGER `trg_shipment_before_insert_validate_return_scope`
BEFORE INSERT ON `shipment`
FOR EACH ROW
BEGIN
  IF NEW.shipment_direction = 'FORWARD' THEN
    SET NEW.business_ref_type = 'ORDER_SHIPMENT';

    IF NEW.order_shipment_ref_id IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FORWARD shipment requires order_shipment_ref_id';
    END IF;

    IF NEW.return_request_ref_id IS NOT NULL OR NEW.return_shipment_ref_id IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FORWARD shipment cannot reference return_request_ref_id or return_shipment_ref_id';
    END IF;
  ELSEIF NEW.shipment_direction = 'RETURN' THEN
    SET NEW.business_ref_type = 'RETURN_SHIPMENT';

    IF NEW.return_request_ref_id IS NULL OR NEW.return_shipment_ref_id IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RETURN shipment requires return_request_ref_id and return_shipment_ref_id';
    END IF;

    IF NEW.pickup_contact_id IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RETURN shipment requires pickup_contact_id';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_shipment_before_update_validate_return_scope`
BEFORE UPDATE ON `shipment`
FOR EACH ROW
BEGIN
  IF NEW.shipment_direction = 'FORWARD' THEN
    SET NEW.business_ref_type = 'ORDER_SHIPMENT';

    IF NEW.order_shipment_ref_id IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FORWARD shipment requires order_shipment_ref_id';
    END IF;

    IF NEW.return_request_ref_id IS NOT NULL OR NEW.return_shipment_ref_id IS NOT NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'FORWARD shipment cannot reference return_request_ref_id or return_shipment_ref_id';
    END IF;
  ELSEIF NEW.shipment_direction = 'RETURN' THEN
    SET NEW.business_ref_type = 'RETURN_SHIPMENT';

    IF NEW.return_request_ref_id IS NULL OR NEW.return_shipment_ref_id IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RETURN shipment requires return_request_ref_id and return_shipment_ref_id';
    END IF;

    IF NEW.pickup_contact_id IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RETURN shipment requires pickup_contact_id';
    END IF;
  END IF;

  IF NEW.original_shipment_id IS NOT NULL AND NEW.original_shipment_id = NEW.id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'shipment.original_shipment_id cannot reference itself';
  END IF;
END$$

CREATE TRIGGER `trg_shipment_item_before_insert_validate_return_scope`
BEFORE INSERT ON `shipment_item`
FOR EACH ROW
BEGIN
  DECLARE v_shipment_direction VARCHAR(20);

  SELECT s.shipment_direction
  INTO v_shipment_direction
  FROM `shipment` s
  WHERE s.id = NEW.shipment_id
  LIMIT 1;

  IF v_shipment_direction = 'RETURN' AND NEW.return_request_item_ref_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RETURN shipment item requires return_request_item_ref_id';
  END IF;

  IF v_shipment_direction = 'FORWARD' AND NEW.return_request_item_ref_id IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FORWARD shipment item cannot reference return_request_item_ref_id';
  END IF;
END$$

CREATE TRIGGER `trg_shipment_item_before_update_validate_return_scope`
BEFORE UPDATE ON `shipment_item`
FOR EACH ROW
BEGIN
  DECLARE v_shipment_direction VARCHAR(20);

  SELECT s.shipment_direction
  INTO v_shipment_direction
  FROM `shipment` s
  WHERE s.id = NEW.shipment_id
  LIMIT 1;

  IF v_shipment_direction = 'RETURN' AND NEW.return_request_item_ref_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'RETURN shipment item requires return_request_item_ref_id';
  END IF;

  IF v_shipment_direction = 'FORWARD' AND NEW.return_request_item_ref_id IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FORWARD shipment item cannot reference return_request_item_ref_id';
  END IF;
END$$

-- Outbox event is created every time shipment status changes.
CREATE TRIGGER `trg_shipment_after_update_enqueue_webhook_event`
AFTER UPDATE ON `shipment`
FOR EACH ROW
BEGIN
  IF NOT (OLD.status <=> NEW.status) THEN
    INSERT INTO `shipment_webhook_event` (
      `shipment_id`,
      `target_service`,
      `event_type`,
      `event_id`,
      `payload`,
      `delivery_status`,
      `next_retry_at`
    ) VALUES (
      NEW.id,
      CASE
        WHEN NEW.shipment_direction = 'RETURN' THEN 'ECOMMERCE_RETURN'
        ELSE 'ECOMMERCE_ORDER'
      END,
      CASE
        WHEN NEW.shipment_direction = 'RETURN' THEN 'return_shipment.status_changed'
        ELSE 'shipment.status_changed'
      END,
      UUID(),
      JSON_OBJECT(
        'shipment_id', NEW.id,
        'tracking_code', NEW.tracking_code,
        'external_tracking_code', NEW.external_tracking_code,
        'shipment_direction', NEW.shipment_direction,
        'status_old', OLD.status,
        'status_new', NEW.status,
        'order_shipment_ref_id', NEW.order_shipment_ref_id,
        'return_request_ref_id', NEW.return_request_ref_id,
        'return_shipment_ref_id', NEW.return_shipment_ref_id,
        'occurred_at', CURRENT_TIMESTAMP
      ),
      'PENDING',
      CURRENT_TIMESTAMP
    );
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

SELECT
  id,
  tracking_code,
  shipment_direction,
  business_ref_type,
  order_shipment_ref_id,
  return_request_ref_id,
  return_shipment_ref_id,
  original_shipment_id,
  status
FROM `shipment`
ORDER BY id DESC
LIMIT 20;

SELECT
  shipment_id,
  order_item_ref_id,
  return_request_item_ref_id,
  product_variant_ref_id,
  product_name,
  quantity,
  price
FROM `shipment_item`
ORDER BY shipment_id DESC, id DESC
LIMIT 20;

SELECT
  shipment_id,
  status,
  event_code,
  external_event_id,
  source_service,
  updated_at
FROM `shipment_status_history`
ORDER BY id DESC
LIMIT 20;

SELECT
  shipment_id,
  target_service,
  event_type,
  delivery_status,
  retry_count,
  created_at
FROM `shipment_webhook_event`
ORDER BY id DESC
LIMIT 20;
