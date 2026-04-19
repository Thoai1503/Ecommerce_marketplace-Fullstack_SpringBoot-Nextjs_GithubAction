-- Variant V2 Phase 1 Schema (non-breaking)
-- Apply in staging first. Compatible with existing product_variant usage.

START TRANSACTION;

-- 1) Classification groups per product (e.g., Color, Size)
CREATE TABLE IF NOT EXISTS variant_group (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  group_name VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 1,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_variant_group_product (product_id),
  CONSTRAINT fk_variant_group_product
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional: enforce unique group name per product
CREATE UNIQUE INDEX uq_variant_group_product_name
  ON variant_group (product_id, group_name);

-- 2) Options under a group (e.g., Black, XL)
CREATE TABLE IF NOT EXISTS variant_option (
  id BIGINT NOT NULL AUTO_INCREMENT,
  variant_group_id BIGINT NOT NULL,
  option_value VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 1,
  image_url VARCHAR(500) DEFAULT NULL,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_variant_option_group (variant_group_id),
  CONSTRAINT fk_variant_option_group
    FOREIGN KEY (variant_group_id) REFERENCES variant_group(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX uq_variant_option_group_value
  ON variant_option (variant_group_id, option_value);

-- 3) Mapping between purchasable variant and selected options
CREATE TABLE IF NOT EXISTS product_variant_option (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_variant_id BIGINT NOT NULL,
  variant_group_id BIGINT NOT NULL,
  variant_option_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_pvo_variant (product_variant_id),
  KEY idx_pvo_group (variant_group_id),
  KEY idx_pvo_option (variant_option_id),
  CONSTRAINT fk_pvo_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variant(id) ON DELETE CASCADE,
  CONSTRAINT fk_pvo_group
    FOREIGN KEY (variant_group_id) REFERENCES variant_group(id) ON DELETE CASCADE,
  CONSTRAINT fk_pvo_option
    FOREIGN KEY (variant_option_id) REFERENCES variant_option(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Ensure one selected option per group for each variant
CREATE UNIQUE INDEX uq_pvo_variant_group
  ON product_variant_option (product_variant_id, variant_group_id);

-- 4) Add option signature to avoid duplicate combinations
ALTER TABLE product_variant
  ADD COLUMN option_signature VARCHAR(255) DEFAULT NULL;

CREATE UNIQUE INDEX uq_product_variant_signature
  ON product_variant (product_id, option_signature);

COMMIT;

-- Notes:
-- - Existing API remains functional; these are additive changes.
-- - For products without group-based variants, option_signature can remain NULL.
-- - Next phase should backfill signature and create group/option data.
