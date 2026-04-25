-- Migration: add reject_reason column to product table
-- Author: admin product module — Phase 3
-- Usage: mysql -u <user> -p <db> < migrate_product_reject_reason.sql

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS reject_reason VARCHAR(500) NULL AFTER is_active;
