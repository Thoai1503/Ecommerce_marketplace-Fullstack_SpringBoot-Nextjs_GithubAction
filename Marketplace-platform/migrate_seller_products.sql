-- ============================================================
-- Migration: seller product workflow support
-- Date: 2026-04-26
-- ============================================================
-- Run on the Marketplace database before testing /seller/products.
-- MySQL 8.0+ supports ADD COLUMN IF NOT EXISTS.

ALTER TABLE product
    ADD COLUMN IF NOT EXISTS description TEXT NULL,
    ADD COLUMN IF NOT EXISTS reject_reason VARCHAR(500) NULL AFTER is_active,
    ADD COLUMN IF NOT EXISTS images_json TEXT NULL COMMENT 'Fallback JSON array of image URLs',
    ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2) NULL,
    ADD COLUMN IF NOT EXISTS length DECIMAL(8,2) NULL,
    ADD COLUMN IF NOT EXISTS width DECIMAL(8,2) NULL,
    ADD COLUMN IF NOT EXISTS height DECIMAL(8,2) NULL;

CREATE TABLE IF NOT EXISTS product_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    is_thumbnail TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_image_product (product_id),
    CONSTRAINT fk_product_image_product
        FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

ALTER TABLE product_image
    ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_thumbnail TINYINT(1) DEFAULT 0;

CREATE TABLE IF NOT EXISTS product_variant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_name VARCHAR(255) NULL,
    sku VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(500) NULL,
    attributes JSON NULL,
    status VARCHAR(50) DEFAULT 'active',
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_variant_product (product_id),
    UNIQUE KEY uk_product_variant_sku (sku),
    CONSTRAINT fk_product_variant_product
        FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

ALTER TABLE product_variant
    ADD COLUMN IF NOT EXISTS attributes JSON NULL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1;

CREATE TABLE IF NOT EXISTS inventory_adjustment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NULL,
    variant_id INT NULL,
    type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inventory_product (product_id),
    INDEX idx_inventory_variant (variant_id),
    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL,
    CONSTRAINT fk_inventory_variant
        FOREIGN KEY (variant_id) REFERENCES product_variant(id) ON DELETE SET NULL
);
