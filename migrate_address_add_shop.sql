-- Migration: allow address to belong to user or shop
-- Compatible with existing user addresses

ALTER TABLE `address`
  MODIFY COLUMN `user_id` bigint NULL,
  ADD COLUMN `shop_id` bigint NULL AFTER `user_id`;

ALTER TABLE `address`
  ADD INDEX `idx_shop_id` (`shop_id`),
  ADD CONSTRAINT `address_ibfk_2`
    FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chk_address_owner`
    CHECK (
      (`user_id` IS NOT NULL AND `shop_id` IS NULL)
      OR (`user_id` IS NULL AND `shop_id` IS NOT NULL)
    );

-- Optional sanity checks
-- 1) user addresses
-- SELECT * FROM address WHERE user_id IS NOT NULL AND shop_id IS NULL;
-- 2) shop addresses
-- SELECT * FROM address WHERE user_id IS NULL AND shop_id IS NOT NULL;
