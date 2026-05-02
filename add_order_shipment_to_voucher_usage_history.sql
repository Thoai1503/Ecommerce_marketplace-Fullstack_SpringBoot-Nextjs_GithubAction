SET @has_order_shipment_col := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'voucher_usage_history_legacy'
    AND column_name = 'order_shipment_id'
);

SET @add_order_shipment_col := IF(
  @has_order_shipment_col = 0,
  'ALTER TABLE `voucher_usage_history_legacy` ADD COLUMN `order_shipment_id` BIGINT NULL AFTER `order_id`',
  'SELECT "skip add order_shipment_id"'
);
PREPARE stmt FROM @add_order_shipment_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_order_shipment_idx := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'voucher_usage_history_legacy'
    AND index_name = 'idx_voucher_usage_order_shipment'
);

SET @add_order_shipment_idx := IF(
  @has_order_shipment_idx = 0,
  'CREATE INDEX `idx_voucher_usage_order_shipment` ON `voucher_usage_history_legacy` (`order_shipment_id`)',
  'SELECT "skip add idx_voucher_usage_order_shipment"'
);
PREPARE stmt FROM @add_order_shipment_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_order_shipment_fk := (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'voucher_usage_history_legacy'
    AND constraint_name = 'fk_voucher_usage_order_shipment'
);

SET @add_order_shipment_fk := IF(
  @has_order_shipment_fk = 0,
  'ALTER TABLE `voucher_usage_history_legacy` ADD CONSTRAINT `fk_voucher_usage_order_shipment` FOREIGN KEY (`order_shipment_id`) REFERENCES `order_shipment` (`id`)',
  'SELECT "skip add fk_voucher_usage_order_shipment"'
);
PREPARE stmt FROM @add_order_shipment_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
