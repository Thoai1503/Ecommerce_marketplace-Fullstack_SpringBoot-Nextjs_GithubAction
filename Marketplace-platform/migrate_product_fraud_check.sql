-- ============================================================
-- Migration: product fraud detection cache
-- Date: 2026-04-26
-- ============================================================

CREATE TABLE IF NOT EXISTS product_fraud_check (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL UNIQUE,
  fraud_score INT NOT NULL DEFAULT 0,
  concerns JSON,
  recommendation VARCHAR(20),
  reasoning TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checked_by VARCHAR(50),
  INDEX idx_score (fraud_score DESC),
  CONSTRAINT fk_product_fraud_check_product
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);
