-- Fix: Mở rộng cột token từ VARCHAR(128) lên VARCHAR(512)
-- để lưu được JWT (thường dài 300-500 ký tự)
-- Chạy 1 lần trên DB ecommerce

ALTER TABLE password_reset_token
    DROP INDEX token,
    MODIFY COLUMN token VARCHAR(512) NOT NULL,
    ADD UNIQUE INDEX idx_token_unique (token(255));
