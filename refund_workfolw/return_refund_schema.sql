-- ============================================================================
-- RETURN & REFUND SCHEMA - Ecommerce Database
-- ============================================================================
-- Purpose: Create all necessary tables for return and refund workflow
-- Date: 2026-04-24
-- ============================================================================

SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- ============================================================================
-- 1. RETURN POLICY TABLE (Chính sách trả hàng của Seller)
-- ============================================================================

DROP TABLE IF EXISTS `return_policy`;

CREATE TABLE `return_policy` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shop_id` BIGINT NOT NULL,
  `category_id` BIGINT,                    -- NULL = áp dụng toàn bộ shop
  `return_days` INT NOT NULL DEFAULT 30,   -- Số ngày được trả
  `is_free_return_shipping` BOOLEAN DEFAULT TRUE,  -- Có trả shipping
  `accepted_conditions` JSON,              -- Điều kiện sản phẩm được trả: ["no_use", "minor_defects"]
  `rejected_reasons` JSON,                 -- Lý do không được trả: ["major_damage", "used_intensively"]
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `product_category` (`id`) ON DELETE SET NULL,
  INDEX idx_shop_id (`shop_id`),
  INDEX idx_category_id (`category_id`),
  UNIQUE KEY uq_shop_category (shop_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Quản lý chính sách trả hàng của mỗi shop';

-- ============================================================================
-- 2. RETURN REQUEST TABLE (Yêu cầu trả hàng từ khách hàng)
-- ============================================================================

DROP TABLE IF EXISTS `return_request`;

CREATE TABLE `return_request` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `order_item_id` BIGINT NOT NULL,        -- Chỉ sản phẩm cụ thể
  `shop_id` BIGINT NOT NULL,
  `customer_id` BIGINT NOT NULL,
  `status` ENUM(
    'PENDING_APPROVAL',     -- Chờ phê duyệt
    'APPROVED',             -- Đã phê duyệt
    'REJECTED',             -- Bị từ chối
    'SHIPPING',             -- Đang vận chuyển hàng trả
    'RECEIVED',             -- Nhập kho, chờ kiểm hàng
    'INSPECTION_PASSED',    -- Kiểm duyệt thành công
    'INSPECTION_FAILED',    -- Kiểm duyệt thất bại
    'REFUNDED',             -- Đã hoàn tiền
    'CANCELLED'             -- Đã hủy
  ) DEFAULT 'PENDING_APPROVAL',
  `reason` VARCHAR(255) NOT NULL COMMENT '理由: product_defective, not_as_described, wrong_item, changed_mind',
  `description` TEXT,                     -- Mô tả chi tiết
  `quantity` INT NOT NULL,                -- Số lượng trả
  `requested_amount` DECIMAL(15,2),       -- Số tiền muốn hoàn lại
  `approved_amount` DECIMAL(15,2),        -- Số tiền được hoàn
  `refunded_amount` DECIMAL(15,2),        -- Số tiền đã hoàn
  `is_auto_rejected` BOOLEAN DEFAULT FALSE,  -- Tự động từ chối
  `rejection_reason` VARCHAR(255),        -- Lý do từ chối
  `approved_by` BIGINT,                   -- Admin/Seller phê duyệt
  `approved_at` TIMESTAMP NULL,
  `return_shipment_id` BIGINT,            -- Tham chiếu tới đơn vận chuyển trả
  `inspection_notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`customer_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  INDEX idx_order_id (`order_id`),
  INDEX idx_customer_id (`customer_id`),
  INDEX idx_shop_id (`shop_id`),
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_return_shipment_id (`return_shipment_id`),
  INDEX idx_order_item_id (`order_item_id`),
  UNIQUE KEY uq_order_item_return (order_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Yêu cầu trả hàng từ khách hàng';

-- ============================================================================
-- 3. RETURN SHIPMENT TABLE (Đơn vận chuyển trả hàng)
-- ============================================================================

DROP TABLE IF EXISTS `return_shipment`;

CREATE TABLE `return_shipment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `tracking_code` VARCHAR(100) UNIQUE,    -- Mã vận đơn từ logistics service
  `status` ENUM(
    'PENDING',              -- Chờ xác nhận
    'CONFIRMED',            -- Đã xác nhận
    'PICKED_UP',            -- Đã lấy hàng
    'SHIPPING',             -- Đang vận chuyển
    'DELIVERED',            -- Đã nhập kho
    'FAILED'                -- Vận chuyển thất bại
  ) DEFAULT 'PENDING',
  `pickup_address_id` BIGINT,             -- Địa chỉ lấy hàng (khách hàng)
  `return_address_id` BIGINT,             -- Địa chỉ trả về (seller/warehouse)
  `scheduled_pickup_date` DATE,           -- Ngày lấy hàng dự kiến
  `actual_pickup_date` DATE,              -- Ngày lấy hàng thực tế
  `delivery_date` DATE,                   -- Ngày nhập kho
  `courier_id` BIGINT,                    -- ID của đơn vị vận chuyển
  `courier_name` VARCHAR(100),            -- Tên đơn vị vận chuyển
  `logistics_webhook_count` INT DEFAULT 0,-- Số lần nhận webhook từ logistics
  `notes` TEXT,
  `failed_reason` VARCHAR(255),
  `retry_count` INT DEFAULT 0,            -- Số lần retry vận chuyển
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pickup_address_id`) REFERENCES `address` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`return_address_id`) REFERENCES `address` (`id`) ON DELETE SET NULL,
  INDEX idx_tracking_code (`tracking_code`),
  INDEX idx_status (`status`),
  INDEX idx_return_request_id (`return_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Đơn vận chuyển trả hàng - tích hợp với logistics service';

-- ============================================================================
-- 4. RETURN SHIPMENT HISTORY TABLE (Lịch sử vận chuyển trả)
-- ============================================================================

DROP TABLE IF EXISTS `return_shipment_history`;

CREATE TABLE `return_shipment_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_shipment_id` BIGINT NOT NULL,
  `status` VARCHAR(50),                   -- Trạng thái từ logistics service
  `description` TEXT,                     -- Mô tả (từ logistics service)
  `location` VARCHAR(255),                -- Vị trí (từ logistics service)
  `event_code` VARCHAR(50),               -- Mã sự kiện từ logistics
  `source` VARCHAR(50),                   -- Nguồn: 'LOGISTICS_WEBHOOK', 'MANUAL'
  `external_event_id` VARCHAR(255),       -- ID sự kiện từ logistics service
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_shipment_id`) REFERENCES `return_shipment` (`id`) ON DELETE CASCADE,
  INDEX idx_return_shipment_id (`return_shipment_id`),
  INDEX idx_timestamp (`timestamp`),
  INDEX idx_status (`status`),
  UNIQUE KEY uq_external_event (return_shipment_id, external_event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lịch sử cập nhật vận chuyển từ logistics service';

-- ============================================================================
-- 5. RETURN INSPECTION TABLE (Kiểm duyệt hàng trả)
-- ============================================================================

DROP TABLE IF EXISTS `return_inspection`;

CREATE TABLE `return_inspection` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `status` ENUM(
    'PENDING',              -- Chờ kiểm duyệt
    'IN_PROGRESS',          -- Đang kiểm duyệt
    'PASSED',               -- Thông qua
    'FAILED'                -- Thất bại
  ) DEFAULT 'PENDING',
  `inspection_date` TIMESTAMP NULL,       -- Ngày kiểm duyệt
  `inspected_by` BIGINT,                  -- Người kiểm duyệt
  `condition_assessment` VARCHAR(255),    -- Đánh giá tình trạng
  `found_issues` TEXT,                    -- Các vấn đề phát hiện
  `passed_reason` TEXT,                   -- Lý do thông qua
  `failed_reason` TEXT,                   -- Lý do không thông qua
  `photos` JSON,                          -- Ảnh chứng minh [{url, description}, ...]
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inspected_by`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  INDEX idx_status (`status`),
  INDEX idx_return_request_id (`return_request_id`),
  UNIQUE KEY uq_return_inspection (return_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Kiểm duyệt hàng trả nhập kho';

-- ============================================================================
-- 6. REFUND TRANSACTION TABLE (Giao dịch hoàn tiền)
-- ============================================================================

DROP TABLE IF EXISTS `refund_transaction`;

CREATE TABLE `refund_transaction` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `order_id` BIGINT NOT NULL,
  `order_payment_id` BIGINT,              -- Tham chiếu tới giao dịch thanh toán gốc
  `refund_amount` DECIMAL(15,2) NOT NULL,
  `refund_method` ENUM(
    'ORIGINAL_PAYMENT',     -- Hoàn vào phương thức thanh toán gốc
    'WALLET',               -- Hoàn vào ví nội bộ
    'BANK_TRANSFER'         -- Chuyển khoản ngân hàng
  ) DEFAULT 'ORIGINAL_PAYMENT',
  `payment_gateway_refund_id` VARCHAR(255),  -- ID hoàn tiền từ payment gateway
  `status` ENUM(
    'PENDING',              -- Chờ xử lý
    'PROCESSING',           -- Đang xử lý
    'SUCCESS',              -- Thành công
    'FAILED',               -- Thất bại
    'CANCELLED'             -- Đã hủy
  ) DEFAULT 'PENDING',
  `failure_reason` TEXT,
  `processed_by` BIGINT,
  `processed_at` TIMESTAMP NULL,
  `retry_count` INT DEFAULT 0,            -- Số lần retry
  `next_retry_at` TIMESTAMP NULL,         -- Thời gian retry tiếp theo
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`processed_by`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_order_id (`order_id`),
  INDEX idx_return_request_id (`return_request_id`),
  UNIQUE KEY uq_return_refund (return_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Giao dịch hoàn tiền cho khách hàng';

-- ============================================================================
-- 7. STOCK ADJUSTMENT FROM RETURN TABLE (Điều chỉnh tồn kho từ trả hàng)
-- ============================================================================

DROP TABLE IF EXISTS `stock_adjustment_from_return`;

CREATE TABLE `stock_adjustment_from_return` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `product_variant_id` BIGINT NOT NULL,
  `adjustment_type` ENUM(
    'ADD',                  -- Cộng tồn kho
    'REMOVE',               -- Trừ tồn kho
    'HOLD'                  -- Giữ hàng chờ xử lý
  ) DEFAULT 'ADD',
  `quantity` INT NOT NULL,
  `reason` VARCHAR(255),                  -- Lý do điều chỉnh
  `notes` TEXT,
  `applied_at` TIMESTAMP NULL,            -- Thời gian áp dụng
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`id`) ON DELETE RESTRICT,
  INDEX idx_product_variant_id (`product_variant_id`),
  INDEX idx_return_request_id (`return_request_id`),
  INDEX idx_applied_at (`applied_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ghi nhận điều chỉnh tồn kho từ quá trình trả hàng';

-- ============================================================================
-- 8. RETURN REQUEST ATTACHMENT TABLE (Ảnh/Tài liệu của yêu cầu trả)
-- ============================================================================

DROP TABLE IF EXISTS `return_request_attachment`;

CREATE TABLE `return_request_attachment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,       -- URL ảnh/tài liệu
  `file_type` VARCHAR(50),                -- 'IMAGE', 'VIDEO', 'DOCUMENT'
  `description` TEXT,                     -- Mô tả ảnh
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  INDEX idx_return_request_id (`return_request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ảnh/Tài liệu đính kèm yêu cầu trả hàng';

-- ============================================================================
-- 9. RETURN REQUEST TIMELINE TABLE (Timeline sự kiện)
-- ============================================================================

DROP TABLE IF EXISTS `return_request_timeline`;

CREATE TABLE `return_request_timeline` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_request_id` BIGINT NOT NULL,
  `event_type` VARCHAR(100),              -- Ví dụ: CREATED, APPROVED, SHIPPED, DELIVERED, INSPECTED, REFUNDED
  `event_details` JSON,                   -- Chi tiết sự kiện
  `actor_id` BIGINT,                      -- Người thực hiện hành động
  `actor_type` VARCHAR(50),               -- CUSTOMER, SELLER, ADMIN, SYSTEM, LOGISTICS
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`actor_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  INDEX idx_return_request_id (`return_request_id`),
  INDEX idx_timestamp (`timestamp`),
  INDEX idx_event_type (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Timeline các sự kiện của yêu cầu trả hàng';

-- ============================================================================
-- 10. LOGISTICS WEBHOOK LOG TABLE (Ghi nhật ký webhook từ logistics service)
-- ============================================================================

DROP TABLE IF EXISTS `logistics_webhook_log`;

CREATE TABLE `logistics_webhook_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `return_shipment_id` BIGINT,            -- NULL nếu không nhận dạng được
  `tracking_code` VARCHAR(100),           -- Mã tracking
  `webhook_payload` JSON NOT NULL,        -- Toàn bộ payload từ webhook
  `webhook_status` VARCHAR(50),           -- Trạng thái webhook
  `processed` BOOLEAN DEFAULT FALSE,      -- Đã xử lý hay chưa
  `error_message` TEXT,                   -- Thông báo lỗi nếu có
  `received_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `processed_at` TIMESTAMP NULL,
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`return_shipment_id`) REFERENCES `return_shipment` (`id`) ON DELETE SET NULL,
  INDEX idx_tracking_code (`tracking_code`),
  INDEX idx_received_at (`received_at`),
  INDEX idx_processed (`processed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ghi nhật ký webhook từ logistics service';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Return request quick search
ALTER TABLE `return_request` ADD FULLTEXT INDEX ft_reason_description (reason, description);

-- Performance indexes
ALTER TABLE `return_request` ADD INDEX idx_status_created (status, created_at);
ALTER TABLE `return_shipment` ADD INDEX idx_status_updated (status, updated_at);
ALTER TABLE `refund_transaction` ADD INDEX idx_status_updated (status, updated_at);

-- ============================================================================
-- TRIGGERS FOR BUSINESS LOGIC
-- ============================================================================

-- Trigger: Tự động từ chối yêu cầu trả hàng quá thời gian
DROP TRIGGER IF EXISTS trg_auto_reject_expired_returns;

DELIMITER $$

CREATE TRIGGER trg_auto_reject_expired_returns
BEFORE INSERT ON return_request
FOR EACH ROW
BEGIN
  DECLARE days_since_delivery INT;
  DECLARE return_policy_days INT;
  DECLARE order_delivered_date DATETIME;
  
  -- Lấy ngày giao hàng từ order_shipment
  SELECT DATE(os.delivery_date)
  INTO order_delivered_date
  FROM order_shipment os
  WHERE os.order_id = NEW.order_id
  ORDER BY os.delivery_date DESC
  LIMIT 1;
  
  -- Nếu không tìm thấy, lấy từ order
  IF order_delivered_date IS NULL THEN
    SELECT DATE(o.delivery_date)
    INTO order_delivered_date
    FROM `order` o
    WHERE o.id = NEW.order_id
    LIMIT 1;
  END IF;
  
  -- Lấy số ngày trả hàng từ chính sách
  SELECT rp.return_days
  INTO return_policy_days
  FROM return_policy rp
  WHERE rp.shop_id = NEW.shop_id
    AND (rp.category_id IS NULL OR rp.category_id = (
      SELECT oi.product_category_id 
      FROM order_item oi 
      WHERE oi.id = NEW.order_item_id
    ))
  ORDER BY rp.category_id DESC
  LIMIT 1;
  
  -- Default: 30 ngày nếu không tìm thấy chính sách
  IF return_policy_days IS NULL THEN
    SET return_policy_days = 30;
  END IF;
  
  -- Tính số ngày từ giao hàng đến hiện tại
  SET days_since_delivery = DATEDIFF(CURDATE(), order_delivered_date);
  
  -- Nếu vượt quá thời gian → tự động từ chối
  IF days_since_delivery > return_policy_days THEN
    SET NEW.status = 'REJECTED';
    SET NEW.is_auto_rejected = TRUE;
    SET NEW.rejection_reason = CONCAT('Return period expired. Allowed: ', return_policy_days, ' days, Actual: ', days_since_delivery, ' days');
  END IF;
END$$

DELIMITER ;

-- Trigger: Tạo return shipment khi phê duyệt
DROP TRIGGER IF EXISTS trg_create_return_shipment_on_approval;

DELIMITER $$

CREATE TRIGGER trg_create_return_shipment_on_approval
AFTER UPDATE ON return_request
FOR EACH ROW
BEGIN
  DECLARE pickup_addr_id BIGINT;
  DECLARE return_addr_id BIGINT;
  
  IF NEW.status = 'APPROVED' AND OLD.status = 'PENDING_APPROVAL' THEN
    -- Lấy địa chỉ giao hàng của khách hàng
    SELECT ad.id
    INTO pickup_addr_id
    FROM `order` o
    LEFT JOIN address ad ON o.delivery_address_id = ad.id
    WHERE o.id = NEW.order_id
    LIMIT 1;
    
    -- Lấy địa chỉ của shop (nơi trả về)
    SELECT ad.id
    INTO return_addr_id
    FROM shop s
    LEFT JOIN address ad ON s.id = ad.shop_id AND ad.is_default = TRUE
    WHERE s.id = NEW.shop_id
    LIMIT 1;
    
    -- Tạo return shipment
    INSERT INTO return_shipment (
      return_request_id,
      status,
      pickup_address_id,
      return_address_id
    ) VALUES (
      NEW.id,
      'PENDING',
      pickup_addr_id,
      return_addr_id
    );
    
    -- Ghi nhật ký
    INSERT INTO return_request_timeline (
      return_request_id,
      event_type,
      event_details,
      actor_id,
      actor_type
    ) VALUES (
      NEW.id,
      'RETURN_SHIPMENT_CREATED',
      JSON_OBJECT('approved_by', NEW.approved_by, 'approved_amount', NEW.approved_amount),
      NEW.approved_by,
      'ADMIN'
    );
  END IF;
END$$

DELIMITER ;

-- Trigger: Ghi nhật ký khi cập nhật trạng thái return request
DROP TRIGGER IF EXISTS trg_log_return_status_change;

DELIMITER $$

CREATE TRIGGER trg_log_return_status_change
AFTER UPDATE ON return_request
FOR EACH ROW
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO return_request_timeline (
      return_request_id,
      event_type,
      event_details,
      actor_id,
      actor_type,
      timestamp
    ) VALUES (
      NEW.id,
      CONCAT('STATUS_CHANGED_TO_', NEW.status),
      JSON_OBJECT(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'reason', NEW.rejection_reason
      ),
      COALESCE(NEW.approved_by, NULL),
      'SYSTEM',
      NOW()
    );
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Return request summary
DROP VIEW IF EXISTS vw_return_request_summary;

CREATE VIEW vw_return_request_summary AS
SELECT 
  rr.id,
  rr.order_id,
  rr.status,
  rr.reason,
  rr.requested_amount,
  rr.approved_amount,
  rr.refunded_amount,
  u.name AS customer_name,
  u.email AS customer_email,
  s.name AS shop_name,
  p.name AS product_name,
  pv.sku AS product_sku,
  rr.created_at,
  rr.updated_at,
  DATEDIFF(NOW(), rr.created_at) AS days_pending
FROM return_request rr
LEFT JOIN `user` u ON rr.customer_id = u.id
LEFT JOIN shop s ON rr.shop_id = s.id
LEFT JOIN order_item oi ON rr.order_item_id = oi.id
LEFT JOIN product p ON oi.product_id = p.id
LEFT JOIN product_variant pv ON oi.product_variant_id = pv.id;

-- View: Return shipment tracking
DROP VIEW IF EXISTS vw_return_shipment_tracking;

CREATE VIEW vw_return_shipment_tracking AS
SELECT 
  rs.id,
  rs.return_request_id,
  rs.tracking_code,
  rs.status,
  rr.customer_id,
  u.name AS customer_name,
  u.email AS customer_email,
  rs.scheduled_pickup_date,
  rs.actual_pickup_date,
  rs.delivery_date,
  rs.courier_name,
  rs.created_at,
  rs.updated_at
FROM return_shipment rs
LEFT JOIN return_request rr ON rs.return_request_id = rr.id
LEFT JOIN `user` u ON rr.customer_id = u.id;

-- View: Pending approvals
DROP VIEW IF EXISTS vw_pending_return_approvals;

CREATE VIEW vw_pending_return_approvals AS
SELECT 
  rr.id,
  rr.order_id,
  rr.reason,
  rr.requested_amount,
  u.name AS customer_name,
  u.email AS customer_email,
  s.name AS shop_name,
  p.name AS product_name,
  DATEDIFF(DATE_ADD(rr.created_at, INTERVAL 3 DAY), CURDATE()) AS days_left_to_approve,
  rr.created_at
FROM return_request rr
LEFT JOIN `user` u ON rr.customer_id = u.id
LEFT JOIN shop s ON rr.shop_id = s.id
LEFT JOIN order_item oi ON rr.order_item_id = oi.id
LEFT JOIN product p ON oi.product_id = p.id
WHERE rr.status = 'PENDING_APPROVAL'
ORDER BY rr.created_at ASC;

-- View: Pending inspections
DROP VIEW IF EXISTS vw_pending_inspections;

CREATE VIEW vw_pending_inspections AS
SELECT 
  ri.id,
  ri.return_request_id,
  rs.tracking_code,
  p.name AS product_name,
  rr.quantity,
  u.name AS customer_name,
  rs.delivery_date,
  DATEDIFF(CURDATE(), DATE(rs.delivery_date)) AS days_in_warehouse,
  rr.created_at
FROM return_inspection ri
LEFT JOIN return_request rr ON ri.return_request_id = rr.id
LEFT JOIN return_shipment rs ON rr.return_shipment_id = rs.id
LEFT JOIN order_item oi ON rr.order_item_id = oi.id
LEFT JOIN product p ON oi.product_id = p.id
LEFT JOIN `user` u ON rr.customer_id = u.id
WHERE ri.status IN ('PENDING', 'IN_PROGRESS')
ORDER BY rs.delivery_date ASC;

-- View: Pending refunds
DROP VIEW IF EXISTS vw_pending_refunds;

CREATE VIEW vw_pending_refunds AS
SELECT 
  rt.id,
  rt.return_request_id,
  rt.order_id,
  rt.refund_amount,
  rt.refund_method,
  rt.status,
  u.name AS customer_name,
  u.email AS customer_email,
  rr.reason AS return_reason,
  rt.retry_count,
  DATEDIFF(CURDATE(), DATE(rt.created_at)) AS days_pending,
  rt.created_at
FROM refund_transaction rt
LEFT JOIN return_request rr ON rt.return_request_id = rr.id
LEFT JOIN `user` u ON rr.customer_id = u.id
WHERE rt.status IN ('PENDING', 'PROCESSING')
  OR (rt.status = 'FAILED' AND rt.next_retry_at <= NOW())
ORDER BY rt.created_at ASC;

-- ============================================================================
-- INITIAL DATA INSERTION
-- ============================================================================

-- Insert default return policies for shops (adjust shop_id as needed)
INSERT INTO return_policy (shop_id, return_days, is_free_return_shipping, accepted_conditions, rejected_reasons, is_active)
SELECT 
  s.id,
  30,
  TRUE,
  JSON_ARRAY('no_use', 'minor_defects', 'unopened'),
  JSON_ARRAY('major_damage', 'used_intensively', 'no_box'),
  TRUE
FROM shop s
WHERE NOT EXISTS (
  SELECT 1 FROM return_policy rp WHERE rp.shop_id = s.id AND rp.category_id IS NULL
);

-- ============================================================================
-- RESET SAFE MODE
-- ============================================================================

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Kiểm tra các bảng được tạo
SELECT TABLE_NAME, TABLE_TYPE 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME LIKE '%return%' 
  OR TABLE_NAME LIKE '%refund%'
  OR TABLE_NAME LIKE '%logistics_webhook%'
  OR TABLE_NAME LIKE '%stock_adjustment_from_return%'
ORDER BY TABLE_NAME;

-- Kiểm tra số lượng policy
SELECT COUNT(*) as total_return_policies FROM return_policy;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
