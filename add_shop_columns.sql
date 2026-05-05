-- Add missing columns to shop table for representative name and ID card images

ALTER TABLE `shop`
ADD COLUMN `owner_name` varchar(255) DEFAULT NULL AFTER `user_id`,
ADD COLUMN `id_card_front` varchar(500) DEFAULT NULL AFTER `owner_name`,
ADD COLUMN `id_card_back` varchar(500) DEFAULT NULL AFTER `id_card_front`;