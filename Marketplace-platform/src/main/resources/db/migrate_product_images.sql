-- ============================================================
-- Migration: Product images persistence
-- Date: 2026-04-22
-- ============================================================
-- Ảnh sản phẩm được lưu trong bảng `product_image` (đã có sẵn).
-- Script này đảm bảo bảng tồn tại với các cột cần thiết và
-- đồng thời thêm cột `images_json` dự phòng trên bảng `product`
-- dùng cho trường hợp MySQL version thấp không hỗ trợ JSON_ARRAYAGG.
-- ============================================================

-- 1) Bảng product_image (cấu trúc chính)
CREATE TABLE IF NOT EXISTS product_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    is_thumbnail TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    CONSTRAINT fk_product_image_product FOREIGN KEY (product_id)
        REFERENCES product(id) ON DELETE CASCADE
);

-- 2) Fallback: thêm cột images_json trên product (TEXT lưu JSON array URL)
-- Chạy câu lệnh này nếu MySQL version < 5.7.22
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS images_json TEXT NULL
    COMMENT 'JSON array of image URLs, fallback when product_image is unused';

-- 3) Đảm bảo có display_order / is_thumbnail cho các record cũ
ALTER TABLE product_image
    ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_thumbnail TINYINT(1) DEFAULT 0;

-- 4) Đánh dấu ảnh đầu tiên của mỗi product làm thumbnail
UPDATE product_image pi
JOIN (
    SELECT MIN(id) AS min_id, product_id
    FROM product_image
    GROUP BY product_id
) first_img ON pi.id = first_img.min_id
SET pi.is_thumbnail = 1
WHERE pi.is_thumbnail = 0;
