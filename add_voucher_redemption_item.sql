CREATE TABLE IF NOT EXISTS `voucher_redemption_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `voucher_redemption_id` BIGINT NOT NULL,
  `order_item_id` BIGINT NOT NULL,
  `discount_amount` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_voucher_redemption_item_redemption` (`voucher_redemption_id`),
  KEY `idx_voucher_redemption_item_order_item` (`order_item_id`),
  CONSTRAINT `fk_voucher_redemption_item_redemption`
    FOREIGN KEY (`voucher_redemption_id`) REFERENCES `voucher_redemption` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_voucher_redemption_item_order_item`
    FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
