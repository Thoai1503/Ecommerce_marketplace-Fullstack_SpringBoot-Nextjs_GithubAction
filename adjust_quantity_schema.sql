-- =========================================================
-- ADJUST QUANTITY SCHEMA (Ecommerce)
-- Recreate schema for out-of-stock adjustment workflow
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1) Cleanup FK from order_shipment -> shipment_adjustment_request
-- ---------------------------------------------------------
ALTER TABLE `order_shipment`
  DROP FOREIGN KEY `fk_order_shipment_latest_adjustment`;

-- ---------------------------------------------------------
-- 2) Drop adjustment tables (recreate)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `shipment_adjustment_financial`;
DROP TABLE IF EXISTS `shipment_adjustment_item`;
DROP TABLE IF EXISTS `shipment_adjustment_request`;

-- ---------------------------------------------------------
-- 3) Ensure extended columns in base tables
-- NOTE:
-- - If these columns already exist, comment this section out.
-- ---------------------------------------------------------
ALTER TABLE `order_shipment`
  ADD COLUMN `business_status` varchar(50) NOT NULL DEFAULT 'NORMAL' COMMENT 'NORMAL|ADJUSTMENT_PENDING_BUYER|ADJUSTMENT_ACCEPTED|ADJUSTMENT_REJECTED|CANCELLED_BY_OOS',
  ADD COLUMN `latest_adjustment_request_id` bigint DEFAULT NULL,
  ADD COLUMN `adjusted_total_amount` decimal(15,2) DEFAULT NULL,
  ADD COLUMN `adjustment_required` tinyint(1) NOT NULL DEFAULT '0';

ALTER TABLE `order_item`
  ADD COLUMN `final_quantity` int DEFAULT NULL COMMENT 'So luong chot sau khi buyer chap nhan dieu chinh',
  ADD COLUMN `is_adjusted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 neu item da duoc dieu chinh so luong';

-- ---------------------------------------------------------
-- 4) Create table: shipment_adjustment_request
-- ---------------------------------------------------------
CREATE TABLE `shipment_adjustment_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `request_code` varchar(50) NOT NULL COMMENT 'Ma request dieu chinh de tra cuu',
  `order_shipment_id` bigint NOT NULL COMMENT 'Kien hang bi thieu',
  `order_id` bigint NOT NULL COMMENT 'Order cha',
  `shop_id` bigint NOT NULL COMMENT 'Shop gui de xuat',
  `status` varchar(50) NOT NULL DEFAULT 'PENDING_BUYER' COMMENT 'PENDING_BUYER|ACCEPTED_BY_BUYER|REJECTED_BY_BUYER|CANCELLED_BY_SHOP|EXPIRED',
  `shop_reason` text COMMENT 'Ly do shop khong du hang',
  `buyer_note` text COMMENT 'Phan hoi cua buyer',
  `total_original_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_adjusted_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_diff_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `expires_at` timestamp NULL DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_adjustment_request_code` (`request_code`),
  KEY `idx_adjustment_order_shipment_status` (`order_shipment_id`,`status`),
  KEY `idx_adjustment_order_id` (`order_id`),
  KEY `idx_adjustment_shop_id` (`shop_id`),
  CONSTRAINT `fk_adjustment_request_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_request_order_shipment` FOREIGN KEY (`order_shipment_id`) REFERENCES `order_shipment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_request_shop` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- 5) Create table: shipment_adjustment_item
-- ---------------------------------------------------------
CREATE TABLE `shipment_adjustment_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adjustment_request_id` bigint NOT NULL,
  `order_item_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  `old_quantity` int NOT NULL,
  `new_quantity` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `old_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `new_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diff_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_adjustment_item_request` (`adjustment_request_id`),
  KEY `idx_adjustment_item_order_item` (`order_item_id`),
  CONSTRAINT `chk_adjustment_new_quantity` CHECK ((`new_quantity` >= 0)),
  CONSTRAINT `chk_adjustment_quantity_not_exceed_old` CHECK ((`new_quantity` <= `old_quantity`)),
  CONSTRAINT `fk_adjustment_item_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_item_request` FOREIGN KEY (`adjustment_request_id`) REFERENCES `shipment_adjustment_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- 6) Create table: shipment_adjustment_financial
-- ---------------------------------------------------------
CREATE TABLE `shipment_adjustment_financial` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adjustment_request_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `payment_method_snapshot` varchar(20) NOT NULL COMMENT 'cod|vnpay|...',
  `action_type` varchar(30) NOT NULL COMMENT 'REFUND_NON_COD|REDUCE_COD|NONE',
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING|PROCESSED|FAILED',
  `external_txn_ref` varchar(100) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_adjustment_financial_request_status` (`adjustment_request_id`,`status`),
  KEY `idx_adjustment_financial_order` (`order_id`),
  CONSTRAINT `fk_adjustment_financial_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_financial_request` FOREIGN KEY (`adjustment_request_id`) REFERENCES `shipment_adjustment_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------
-- 7) Re-add FK from order_shipment to latest request
-- ---------------------------------------------------------
ALTER TABLE `order_shipment`
  ADD CONSTRAINT `fk_order_shipment_latest_adjustment`
  FOREIGN KEY (`latest_adjustment_request_id`) REFERENCES `shipment_adjustment_request` (`id`) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;

