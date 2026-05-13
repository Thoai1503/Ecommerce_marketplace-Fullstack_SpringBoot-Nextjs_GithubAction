-- ============================================================
-- Voucher V2 Migration
-- Target: MySQL 8.0+
-- Purpose: Restructure voucher schema for marketplace workflow
-- Notes:
-- 1) Script keeps old tables by renaming to *_legacy for rollback/reference.
-- 2) It migrates base data from old `voucher` into new `voucher`.
-- 3) Historical usage tables are preserved as legacy and not force-mapped.
-- ============================================================

SET NAMES utf8mb4;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1) Detach FK from orders -> voucher (old table)
-- ------------------------------------------------------------
SET @has_orders_fk_voucher := (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'orders'
      AND constraint_name = 'orders_ibfk_4'
);
SET @sql := IF(
    @has_orders_fk_voucher > 0,
    'ALTER TABLE `orders` DROP FOREIGN KEY `orders_ibfk_4`',
    'SELECT "orders_ibfk_4 does not exist, skip drop FK"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 2) Preserve legacy tables (idempotent-safe style with checks)
-- ------------------------------------------------------------
SET @has_voucher_source := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher'
);
SET @has_voucher_legacy := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher_legacy'
);
SET @sql := IF(
    @has_voucher_source = 1 AND @has_voucher_legacy = 0,
    'RENAME TABLE `voucher` TO `voucher_legacy`',
    'SELECT "skip rename voucher -> voucher_legacy"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_voucher_condition_source := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher_condition'
);
SET @has_voucher_condition_legacy := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher_condition_legacy'
);
SET @sql := IF(
    @has_voucher_condition_source = 1 AND @has_voucher_condition_legacy = 0,
    'RENAME TABLE `voucher_condition` TO `voucher_condition_legacy`',
    'SELECT "skip rename voucher_condition -> voucher_condition_legacy"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_voucher_condition_type_source := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher_condition_type'
);
SET @has_voucher_condition_type_legacy := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher_condition_type_legacy'
);
SET @sql := IF(
    @has_voucher_condition_type_source = 1 AND @has_voucher_condition_type_legacy = 0,
    'RENAME TABLE `voucher_condition_type` TO `voucher_condition_type_legacy`',
    'SELECT "skip rename voucher_condition_type -> voucher_condition_type_legacy"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_voucher_usage_history_source := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher_usage_history'
);
SET @has_voucher_usage_history_legacy := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = 'voucher_usage_history_legacy'
);
SET @sql := IF(
    @has_voucher_usage_history_source = 1 AND @has_voucher_usage_history_legacy = 0,
    'RENAME TABLE `voucher_usage_history` TO `voucher_usage_history_legacy`',
    'SELECT "skip rename voucher_usage_history -> voucher_usage_history_legacy"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fallback for rerun environments where voucher_legacy is absent.
-- Keep structure only for migration SELECT compatibility.
CREATE TABLE IF NOT EXISTS `voucher_legacy` (
    `id` BIGINT NOT NULL,
    `shop_id` BIGINT NULL,
    `voucher_code` VARCHAR(50) NOT NULL,
    `voucher_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `discount_type` VARCHAR(20) NOT NULL,
    `discount_value` DECIMAL(15,2) NOT NULL,
    `min_order_value` DECIMAL(15,2) NULL,
    `max_discount` DECIMAL(15,2) NULL,
    `usage_limit` INT NULL,
    `used_count` INT NULL,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `is_active` TINYINT(1) NULL,
    `created_at` DATETIME NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_voucher_legacy_code` (`voucher_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 3) Create new voucher schema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `voucher_campaign` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `start_at` DATETIME NOT NULL,
    `end_at` DATETIME NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    `created_by` BIGINT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_voucher_campaign_code` (`code`),
    CHECK (`start_at` < `end_at`),
    CHECK (`status` IN ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `voucher` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `campaign_id` BIGINT NULL,
    `code` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `issuer_type` VARCHAR(20) NOT NULL,
    `issuer_id` BIGINT NULL,
    `discount_type` VARCHAR(20) NOT NULL,
    `discount_percent` DECIMAL(5,2) NULL,
    `discount_amount` DECIMAL(18,2) NULL,
    `max_discount_amount` DECIMAL(18,2) NULL,
    `min_order_value` DECIMAL(18,2) NOT NULL DEFAULT 0,
    `max_order_value` DECIMAL(18,2) NULL,
    `total_quota` INT NOT NULL,
    `claimed_count` INT NOT NULL DEFAULT 0,
    `redeemed_count` INT NOT NULL DEFAULT 0,
    `per_user_quota` INT NOT NULL DEFAULT 1,
    `stackable` BOOLEAN NOT NULL DEFAULT FALSE,
    `claim_start_at` DATETIME NOT NULL,
    `claim_end_at` DATETIME NOT NULL,
    `valid_from` DATETIME NOT NULL,
    `valid_to` DATETIME NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    `priority` INT NOT NULL DEFAULT 100,
    `created_by` BIGINT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_voucher_code` (`code`),
    KEY `idx_voucher_status_time` (`status`, `claim_start_at`, `claim_end_at`, `valid_from`, `valid_to`),
    KEY `idx_voucher_issuer` (`issuer_type`, `issuer_id`, `status`),
    CONSTRAINT `fk_voucher_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `voucher_campaign` (`id`),
    CHECK (`issuer_type` IN ('PLATFORM', 'SHOP', 'BRAND')),
    CHECK (`discount_type` IN ('PERCENT', 'FIXED', 'FREE_SHIPPING', 'GIFT_ITEM')),
    CHECK (`status` IN ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED', 'ARCHIVED')),
    CHECK (`claim_start_at` < `claim_end_at`),
    CHECK (`valid_from` <= `valid_to`),
    CHECK (`total_quota` >= 0),
    CHECK (`per_user_quota` >= 1),
    CHECK (
        (`discount_type` = 'PERCENT' AND `discount_percent` IS NOT NULL AND `discount_amount` IS NULL)
        OR (`discount_type` = 'FIXED' AND `discount_amount` IS NOT NULL AND `discount_percent` IS NULL)
        OR (`discount_type` IN ('FREE_SHIPPING', 'GIFT_ITEM'))
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `voucher_gift_item` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `voucher_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `variant_id` BIGINT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_voucher_gift_item` (`voucher_id`, `product_id`, `variant_id`),
    CONSTRAINT `fk_voucher_gift_item_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_voucher_gift_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
    CONSTRAINT `fk_voucher_gift_item_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`),
    CHECK (`quantity` >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `voucher_scope_rule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `voucher_id` BIGINT NOT NULL,
    `scope_type` VARCHAR(30) NOT NULL,
    `scope_id` BIGINT NOT NULL,
    `include_exclude` VARCHAR(10) NOT NULL DEFAULT 'INCLUDE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_scope_rule` (`voucher_id`, `scope_type`, `scope_id`, `include_exclude`),
    KEY `idx_scope_rule_lookup` (`scope_type`, `scope_id`, `include_exclude`),
    CONSTRAINT `fk_scope_rule_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON DELETE CASCADE,
    CHECK (`scope_type` IN ('SHOP', 'CATEGORY', 'PRODUCT', 'BRAND', 'PAYMENT_METHOD', 'SHIPPING_METHOD')),
    CHECK (`include_exclude` IN ('INCLUDE', 'EXCLUDE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `voucher_user_segment_rule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `voucher_id` BIGINT NOT NULL,
    `segment_type` VARCHAR(30) NOT NULL,
    `segment_value` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_segment_rule` (`voucher_id`, `segment_type`, `segment_value`),
    CONSTRAINT `fk_user_segment_rule_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON DELETE CASCADE,
    CHECK (`segment_type` IN ('NEW_USER', 'VIP', 'APP_ONLY', 'MEMBERSHIP_TIER', 'FIRST_ORDER'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_voucher` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `voucher_id` BIGINT NOT NULL,
    `claim_channel` VARCHAR(20) NOT NULL DEFAULT 'APP',
    `claimed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) NOT NULL DEFAULT 'CLAIMED',
    `reserved_order_id` BIGINT NULL,
    `reserved_at` DATETIME NULL,
    `expired_at` DATETIME NULL,
    `redeemed_at` DATETIME NULL,
    PRIMARY KEY (`id`),
    KEY `idx_user_voucher_user_status` (`user_id`, `status`),
    KEY `idx_user_voucher_voucher_status` (`voucher_id`, `status`),
    KEY `idx_user_voucher_lookup` (`user_id`, `voucher_id`, `status`),
    CONSTRAINT `fk_user_voucher_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
    CONSTRAINT `fk_user_voucher_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`),
    CONSTRAINT `fk_user_voucher_order` FOREIGN KEY (`reserved_order_id`) REFERENCES `orders` (`id`),
    CHECK (`claim_channel` IN ('APP', 'WEB', 'AUTO_ISSUE', 'CS_SUPPORT')),
    CHECK (`status` IN ('CLAIMED', 'RESERVED', 'REDEEMED', 'CANCELLED', 'EXPIRED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `voucher_redemption` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_voucher_id` BIGINT NOT NULL,
    `voucher_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `order_id` BIGINT NOT NULL,
    `order_code` VARCHAR(50) NULL,
    `original_shipping_fee` DECIMAL(18,2) NULL,
    `original_order_amount` DECIMAL(18,2) NOT NULL,
    `discount_amount_applied` DECIMAL(18,2) NOT NULL,
    `final_order_amount` DECIMAL(18,2) NOT NULL,
    `redeemed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    `failure_reason` VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_redemption_order_voucher` (`order_id`, `voucher_id`),
    KEY `idx_redemption_user` (`user_id`),
    KEY `idx_redemption_voucher_time` (`voucher_id`, `redeemed_at`),
    KEY `idx_redemption_order` (`order_id`, `status`),
    CONSTRAINT `fk_redemption_user_voucher` FOREIGN KEY (`user_voucher_id`) REFERENCES `user_voucher` (`id`),
    CONSTRAINT `fk_redemption_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`),
    CONSTRAINT `fk_redemption_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
    CONSTRAINT `fk_redemption_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
    CHECK (`status` IN ('SUCCESS', 'FAILED', 'ROLLED_BACK'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `voucher_audit_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `voucher_id` BIGINT NOT NULL,
    `event_type` VARCHAR(40) NOT NULL,
    `actor_type` VARCHAR(20) NOT NULL,
    `actor_id` BIGINT NULL,
    `entity_type` VARCHAR(40) NOT NULL,
    `entity_id` BIGINT NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `note` VARCHAR(255) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_voucher_time` (`voucher_id`, `created_at`),
    CONSTRAINT `fk_audit_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- 4) Migrate base data from old voucher to new voucher
-- ------------------------------------------------------------
INSERT INTO `voucher` (
    `id`, `campaign_id`, `code`, `title`, `description`,
    `issuer_type`, `issuer_id`,
    `discount_type`, `discount_percent`, `discount_amount`, `max_discount_amount`,
    `min_order_value`, `max_order_value`,
    `total_quota`, `claimed_count`, `redeemed_count`, `per_user_quota`,
    `stackable`,
    `claim_start_at`, `claim_end_at`, `valid_from`, `valid_to`,
    `status`, `priority`,
    `created_by`, `created_at`, `updated_at`
)
SELECT
    vl.`id` AS `id`,
    NULL AS `campaign_id`,
    vl.`voucher_code` AS `code`,
    vl.`voucher_name` AS `title`,
    vl.`description` AS `description`,
    CASE WHEN vl.`shop_id` IS NULL THEN 'PLATFORM' ELSE 'SHOP' END AS `issuer_type`,
    vl.`shop_id` AS `issuer_id`,
    CASE WHEN vl.`discount_type` = 'percentage' THEN 'PERCENT' ELSE 'FIXED' END AS `discount_type`,
    CASE WHEN vl.`discount_type` = 'percentage' THEN vl.`discount_value` ELSE NULL END AS `discount_percent`,
    CASE WHEN vl.`discount_type` = 'fixed' THEN vl.`discount_value` ELSE NULL END AS `discount_amount`,
    vl.`max_discount` AS `max_discount_amount`,
    IFNULL(vl.`min_order_value`, 0) AS `min_order_value`,
    NULL AS `max_order_value`,
    IFNULL(vl.`usage_limit`, 2147483647) AS `total_quota`,
    IFNULL(vl.`used_count`, 0) AS `claimed_count`,
    IFNULL(vl.`used_count`, 0) AS `redeemed_count`,
    1 AS `per_user_quota`,
    FALSE AS `stackable`,
    vl.`start_date` AS `claim_start_at`,
    vl.`end_date` AS `claim_end_at`,
    vl.`start_date` AS `valid_from`,
    vl.`end_date` AS `valid_to`,
    CASE
        WHEN vl.`is_active` = 0 THEN 'PAUSED'
        WHEN vl.`end_date` < NOW() THEN 'EXPIRED'
        WHEN IFNULL(vl.`usage_limit`, 2147483647) <= IFNULL(vl.`used_count`, 0) THEN 'DEPLETED'
        ELSE 'ACTIVE'
    END AS `status`,
    100 AS `priority`,
    NULL AS `created_by`,
    IFNULL(vl.`created_at`, NOW()) AS `created_at`,
    NOW() AS `updated_at`
FROM `voucher_legacy` vl
LEFT JOIN `voucher` v ON v.`id` = vl.`id`
WHERE v.`id` IS NULL;

-- Keep AUTO_INCREMENT correct after inserting explicit ids
SET @next_auto_id := (SELECT IFNULL(MAX(`id`), 0) + 1 FROM `voucher`);
SET @sql := CONCAT('ALTER TABLE `voucher` AUTO_INCREMENT = ', @next_auto_id);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 5) Reconnect FK orders.voucher_id -> new voucher.id
-- ------------------------------------------------------------
SET @has_orders_fk_voucher := (
    SELECT COUNT(*)
    FROM information_schema.referential_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'orders'
      AND constraint_name = 'orders_ibfk_4'
);
SET @sql := IF(
    @has_orders_fk_voucher = 0,
    'ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`)',
    'SELECT "orders_ibfk_4 already exists, skip add FK"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- ============================================================
-- Post-migration checklist (manual):
-- - Update application code to new voucher columns/table names.
-- - Build new voucher claim/redeem APIs on tables user_voucher/voucher_redemption.
-- - Decide whether to migrate voucher_usage_history_legacy into new tables.
-- ============================================================
