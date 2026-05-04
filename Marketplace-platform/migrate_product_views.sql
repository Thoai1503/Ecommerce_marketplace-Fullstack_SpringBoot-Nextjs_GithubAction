-- ============================================================
-- Migration: product performance views
-- Date: 2026-04-26
-- ============================================================

CREATE TABLE IF NOT EXISTS product_view (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_viewed (product_id, viewed_at),
  INDEX idx_user (user_id),
  CONSTRAINT fk_product_view_product
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW product_daily_stats AS
SELECT
  daily.product_id,
  daily.date,
  COALESCE(v.view_count, 0) AS view_count,
  COALESCE(v.unique_visitors, 0) AS unique_visitors,
  COALESCE(o.order_count, 0) AS order_count,
  COALESCE(o.revenue, 0) AS revenue
FROM (
  SELECT product_id, DATE(viewed_at) AS date FROM product_view
  UNION
  SELECT product_id, DATE(created_at) AS date FROM order_item
) daily
LEFT JOIN (
  SELECT
    product_id,
    DATE(viewed_at) AS date,
    COUNT(*) AS view_count,
    COUNT(DISTINCT COALESCE(CAST(user_id AS CHAR), ip_address)) AS unique_visitors
  FROM product_view
  GROUP BY product_id, DATE(viewed_at)
) v ON v.product_id = daily.product_id AND v.date = daily.date
LEFT JOIN (
  SELECT
    product_id,
    DATE(created_at) AS date,
    COUNT(DISTINCT order_id) AS order_count,
    SUM(total_price) AS revenue
  FROM order_item
  GROUP BY product_id, DATE(created_at)
) o ON o.product_id = daily.product_id AND o.date = daily.date;
