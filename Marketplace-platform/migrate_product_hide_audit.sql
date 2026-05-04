-- ============================================================
-- Migration: product hide audit trail
-- Date: 2026-04-26
-- ============================================================
-- MySQL 8.0+ supports ADD COLUMN IF NOT EXISTS.

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMP NULL AFTER reject_reason,
  ADD COLUMN IF NOT EXISTS hidden_by BIGINT NULL AFTER hidden_at,
  ADD COLUMN IF NOT EXISTS hidden_reason VARCHAR(500) NULL AFTER hidden_by,
  ADD COLUMN IF NOT EXISTS hidden_by_role VARCHAR(20) NULL AFTER hidden_reason;

CREATE TABLE IF NOT EXISTS product_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  from_status VARCHAR(20) NOT NULL,
  to_status VARCHAR(20) NOT NULL,
  reason VARCHAR(500),
  changed_by BIGINT,
  changed_by_role VARCHAR(20),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id, changed_at),
  CONSTRAINT fk_product_status_history_product
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);
