-- ============================================================
-- LOGISTICS MICROSERVICE - DATABASE SCHEMA
-- Database: logistics_db (hoàn toàn độc lập với ecommerce_db)
--
-- Nguyên tắc thiết kế:
--   - KHÔNG có FK sang bảng nào thuộc ecommerce service
--   - Các ID từ ecommerce (order_id, shop_id) chỉ lưu dạng
--     VARCHAR thuần tuý để tham chiếu lỏng (loose coupling)
--   - Giao tiếp với ecommerce qua REST API hoặc Kafka event
-- ============================================================

CREATE DATABASE IF NOT EXISTS logistics_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE logistics_db;

-- ============================================================
-- 1. LOGISTICS_PARTNER
-- Thông tin đối tác shop đã đăng ký dùng logistics service.
-- Dữ liệu này do logistics service tự quản lý (không lấy từ
-- ecommerce DB). Ecommerce gửi shop_ref_id khi tạo shipment,
-- logistics dùng để tra cứu nội bộ.
-- ============================================================
CREATE TABLE `logistics_partner` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT,
  `shop_ref_id`   VARCHAR(100) NOT NULL                    COMMENT 'ID shop bên ecommerce service (loose ref, không phải FK)',
  `shop_name`     VARCHAR(255) NOT NULL                    COMMENT 'Tên shop (copy từ ecommerce lúc đăng ký)',
  `api_key`       VARCHAR(255) NOT NULL                    COMMENT 'API key để shop gọi logistics API',
  `contact_email` VARCHAR(255) DEFAULT NULL,
  `phone`         VARCHAR(20)  DEFAULT NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partner_api_key`  (`api_key`),
  UNIQUE KEY `uq_partner_shop_ref` (`shop_ref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Đối tác shop đã đăng ký logistics service';


-- ============================================================
-- 2. RECIPIENT
-- Thông tin người nhận hàng.
-- Logistics service tự lưu lại, KHÔNG phụ thuộc customer
-- table của ecommerce. Mỗi lần tạo shipment sẽ snapshot
-- thông tin người nhận tại thời điểm đó.
-- ============================================================
CREATE TABLE `recipient` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL                       COMMENT 'Họ tên người nhận',
  `phone`      VARCHAR(20)  NOT NULL                       COMMENT 'Số điện thoại',
  `email`      VARCHAR(255) DEFAULT NULL,
  `address`    TEXT         NOT NULL                       COMMENT 'Địa chỉ đầy đủ',
  `province`   VARCHAR(100) DEFAULT NULL,
  `district`   VARCHAR(100) DEFAULT NULL,
  `ward`       VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Thông tin người nhận hàng (snapshot tại thời điểm tạo shipment)';


-- ============================================================
-- 3. SHIPMENT
-- Vận đơn chính - đơn vị trung tâm của logistics service.
--
-- order_ref_id : ID đơn hàng bên ecommerce, chỉ lưu để
--                đối chiếu / callback, KHÔNG là FK.
-- shop_ref_id  : ID shop bên ecommerce, tương tự.
-- partner_id   : FK nội bộ sang logistics_partner.
--
-- Vòng đời status:
--   PENDING -> CONFIRMED -> PICKED_UP -> IN_TRANSIT
--           -> OUT_FOR_DELIVERY -> DELIVERED
--           -> FAILED | RETURNED
-- ============================================================
CREATE TABLE `shipment` (
  `id`                    BIGINT         NOT NULL AUTO_INCREMENT,
  `tracking_code`         VARCHAR(100)   NOT NULL                COMMENT 'Mã tracking hiển thị cho khách (VD: LOG20240001)',
  `order_ref_id`          VARCHAR(100)   NOT NULL                COMMENT 'order_id bên ecommerce service (loose ref, không phải FK)',
  `shop_ref_id`           VARCHAR(100)   NOT NULL                COMMENT 'shop_id bên ecommerce service (loose ref, không phải FK)',
  `partner_id`            BIGINT         NOT NULL                COMMENT 'FK nội bộ -> logistics_partner',
  `recipient_id`          BIGINT         NOT NULL                COMMENT 'FK nội bộ -> recipient',
  `status`                VARCHAR(50)    NOT NULL DEFAULT 'PENDING'
                                                                 COMMENT 'PENDING|CONFIRMED|PICKED_UP|IN_TRANSIT|OUT_FOR_DELIVERY|DELIVERED|FAILED|RETURNED',
  `shipping_fee`          DECIMAL(15,2)  DEFAULT 0.00            COMMENT 'Phí vận chuyển (VNĐ)',
  `cod_amount`            DECIMAL(15,2)  DEFAULT 0.00            COMMENT 'Số tiền COD cần thu hộ',
  `weight_gram`           INT            DEFAULT NULL            COMMENT 'Khối lượng gói hàng (gram)',
  `note`                  TEXT           DEFAULT NULL            COMMENT 'Ghi chú giao hàng',
  `estimated_delivery_at` TIMESTAMP      NULL DEFAULT NULL,
  `delivered_at`          TIMESTAMP      NULL DEFAULT NULL       COMMENT 'Thời điểm giao thành công thực tế',
  `created_at`            TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tracking_code`         (`tracking_code`),
  KEY `idx_shipment_order_ref`          (`order_ref_id`),
  KEY `idx_shipment_shop_ref`           (`shop_ref_id`),
  KEY `idx_shipment_partner`            (`partner_id`),
  KEY `idx_shipment_recipient`          (`recipient_id`),
  KEY `idx_shipment_status`             (`status`),
  CONSTRAINT `fk_shipment_partner`   FOREIGN KEY (`partner_id`)   REFERENCES `logistics_partner` (`id`),
  CONSTRAINT `fk_shipment_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `recipient`         (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Vận đơn - đơn vị trung tâm của logistics service';


-- ============================================================
-- 4. SHIPMENT_ITEM
-- Danh sách sản phẩm trong vận đơn.
-- Dữ liệu được copy (snapshot) từ ecommerce khi tạo shipment,
-- KHÔNG join ngược về ecommerce DB.
-- ============================================================
CREATE TABLE `shipment_item` (
  `id`           BIGINT         NOT NULL AUTO_INCREMENT,
  `shipment_id`  BIGINT         NOT NULL,
  `product_name` VARCHAR(500)   NOT NULL                   COMMENT 'Tên sản phẩm tại thời điểm tạo vận đơn',
  `sku`          VARCHAR(100)   DEFAULT NULL               COMMENT 'SKU để đối chiếu (tuỳ chọn)',
  `quantity`     INT            NOT NULL DEFAULT 1,
  `price`        DECIMAL(15,2)  DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_shipment_item_shipment` (`shipment_id`),
  CONSTRAINT `fk_item_shipment` FOREIGN KEY (`shipment_id`)
    REFERENCES `shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Sản phẩm trong vận đơn (snapshot, không join về ecommerce DB)';


-- ============================================================
-- 5. SHIPMENT_STATUS_HISTORY
-- Toàn bộ lịch sử thay đổi trạng thái của một vận đơn.
-- Đây là nguồn dữ liệu cho trang tracking của khách hàng.
-- ============================================================
CREATE TABLE `shipment_status_history` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `shipment_id` BIGINT       NOT NULL,
  `status`      VARCHAR(50)  NOT NULL                      COMMENT 'Trạng thái tại sự kiện này',
  `description` TEXT         DEFAULT NULL                  COMMENT 'Mô tả sự kiện (VD: Đã lấy hàng tại kho Bình Thạnh)',
  `location`    VARCHAR(255) DEFAULT NULL                  COMMENT 'Địa điểm xảy ra sự kiện',
  `updated_by`  VARCHAR(100) DEFAULT NULL                  COMMENT 'Ai/hệ thống nào cập nhật: admin | driver_app | webhook | system',
  `updated_at`  TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_history_shipment` (`shipment_id`),
  KEY `idx_status_history_time`     (`updated_at`),
  CONSTRAINT `fk_history_shipment` FOREIGN KEY (`shipment_id`)
    REFERENCES `shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Lịch sử trạng thái vận đơn - nguồn dữ liệu tracking page';


-- ============================================================
-- 6. ORDER_SHIPMENT_MAPPING
-- Hỗ trợ multi-tracking: 1 order ecommerce -> N vận đơn.
-- Bảng này thuộc logistics service, lưu mối quan hệ giữa
-- order_ref_id (từ ecommerce) và các shipment nội bộ.
-- Ecommerce query endpoint logistics để lấy danh sách này,
-- KHÔNG join DB chéo service.
-- ============================================================
CREATE TABLE `order_shipment_mapping` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT,
  `order_ref_id`    VARCHAR(100) NOT NULL                   COMMENT 'order_id bên ecommerce (loose ref)',
  `shop_ref_id`     VARCHAR(100) NOT NULL                   COMMENT 'shop_id bên ecommerce (loose ref)',
  `shipment_id`     BIGINT       NOT NULL                   COMMENT 'FK nội bộ -> shipment',
  `tracking_number` VARCHAR(100) NOT NULL                   COMMENT 'Bằng tracking_code của shipment liên kết',
  `carrier_name`    VARCHAR(100) DEFAULT NULL               COMMENT 'Đơn vị vận chuyển: GHN, GHTK, Viettel Post...',
  `created_at`      TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mapping_tracking`  (`tracking_number`),
  KEY `idx_mapping_order_ref`       (`order_ref_id`),
  KEY `idx_mapping_shop_ref`        (`shop_ref_id`),
  KEY `idx_mapping_shipment`        (`shipment_id`),
  CONSTRAINT `fk_mapping_shipment` FOREIGN KEY (`shipment_id`)
    REFERENCES `shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Mapping 1 order ecommerce -> N vận đơn (multi-tracking)';


-- ============================================================
-- TRIGGER: Ghi lịch sử tự động khi INSERT shipment mới
-- ============================================================
DELIMITER $$

CREATE TRIGGER `trg_shipment_after_insert`
AFTER INSERT ON `shipment`
FOR EACH ROW
BEGIN
  INSERT INTO `shipment_status_history`
    (`shipment_id`, `status`, `description`, `updated_by`, `updated_at`)
  VALUES
    (NEW.id, NEW.status, 'Vận đơn được tạo', 'system', NOW());
END$$

-- ============================================================
-- TRIGGER: Ghi lịch sử tự động khi status thay đổi
-- ============================================================
CREATE TRIGGER `trg_shipment_after_status_update`
AFTER UPDATE ON `shipment`
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO `shipment_status_history`
      (`shipment_id`, `status`, `description`, `updated_by`, `updated_at`)
    VALUES
      (NEW.id, NEW.status,
       CONCAT('Trạng thái cập nhật: ', OLD.status, ' → ', NEW.status),
       'system', NOW());
  END IF;
END$$

DELIMITER ;


-- ============================================================
-- SEED DATA (dev/test)
-- ============================================================

INSERT INTO `logistics_partner` (`shop_ref_id`, `shop_name`, `api_key`, `contact_email`, `phone`) VALUES
  ('101', 'Shop Điện Tử A',    'lp_key_dienta_abc123',    'dienta@example.com',     '0901234567'),
  ('102', 'Shop Thời Trang B', 'lp_key_thoitrang_xyz789', 'thoitrangb@example.com', '0912345678');

INSERT INTO `recipient` (`name`, `phone`, `address`, `province`, `district`, `ward`) VALUES
  ('Nguyễn Văn An', '0987654321', '12 Nguyễn Huệ, P.Bến Nghé, Q.1, TP.HCM',      'TP.HCM',     'Quận 1',   'Phường Bến Nghé'),
  ('Trần Thị Bình', '0976543210', '45 Lê Lợi, P.Đông Hòa, TP.Dĩ An, Bình Dương', 'Bình Dương', 'TP.Dĩ An', 'Phường Đông Hòa');

-- order_ref_id='1001' có 2 vận đơn -> minh hoạ multi-tracking
INSERT INTO `shipment`
  (`tracking_code`, `order_ref_id`, `shop_ref_id`, `partner_id`, `recipient_id`,
   `status`, `shipping_fee`, `cod_amount`, `weight_gram`, `estimated_delivery_at`)
VALUES
  ('LOG2024000001', '1001', '101', 1, 1, 'PICKED_UP',         25000, 450000, 500,  DATE_ADD(NOW(), INTERVAL 2 DAY)),
  ('LOG2024000002', '1001', '102', 2, 1, 'CONFIRMED',          30000,      0, 1200, DATE_ADD(NOW(), INTERVAL 3 DAY)),
  ('LOG2024000003', '1002', '101', 1, 2, 'OUT_FOR_DELIVERY',   20000, 180000, 300,  DATE_ADD(NOW(), INTERVAL 1 DAY));

INSERT INTO `order_shipment_mapping` (`order_ref_id`, `shop_ref_id`, `shipment_id`, `tracking_number`, `carrier_name`) VALUES
  ('1001', '101', 1, 'LOG2024000001', 'GHN'),
  ('1001', '102', 2, 'LOG2024000002', 'GHTK'),
  ('1002', '101', 3, 'LOG2024000003', 'Viettel Post');

INSERT INTO `shipment_item` (`shipment_id`, `product_name`, `sku`, `quantity`, `price`) VALUES
  (1, 'Chuột không dây Logitech M185',    'MOUSE-001',  1, 350000),
  (1, 'Bàn phím cơ AKKO 3098B',           'KBD-005',    1, 100000),
  (2, 'Áo sơ mi nam Oxford trắng size L', 'SHIRT-L-W',  2, 250000),
  (3, 'Tai nghe Sony WH-1000XM5',         'SONY-XM5',   1, 180000);

INSERT INTO `shipment_status_history`
  (`shipment_id`, `status`, `description`, `location`, `updated_by`, `updated_at`)
VALUES
  (1, 'PENDING',          'Vận đơn được tạo',                        'Hệ thống',          'system',     DATE_SUB(NOW(), INTERVAL 2  DAY)),
  (1, 'CONFIRMED',        'Đơn hàng xác nhận, chờ lấy hàng',         'Hệ thống',          'system',     DATE_SUB(NOW(), INTERVAL 36 HOUR)),
  (1, 'PICKED_UP',        'Đã lấy hàng tại kho shop',                'Q.Bình Thạnh, HCM', 'driver_app', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  (2, 'PENDING',          'Vận đơn được tạo',                        'Hệ thống',          'system',     DATE_SUB(NOW(), INTERVAL 2  DAY)),
  (2, 'CONFIRMED',        'Đơn xác nhận, đang chờ shipper đến lấy',  'Hệ thống',          'system',     DATE_SUB(NOW(), INTERVAL 1  DAY)),
  (3, 'PENDING',          'Vận đơn được tạo',                        'Hệ thống',          'system',     DATE_SUB(NOW(), INTERVAL 3  DAY)),
  (3, 'CONFIRMED',        'Đơn xác nhận',                            'Hệ thống',          'system',     DATE_SUB(NOW(), INTERVAL 2  DAY)),
  (3, 'PICKED_UP',        'Đã lấy hàng tại shop',                    'Dĩ An, Bình Dương', 'driver_app', DATE_SUB(NOW(), INTERVAL 1  DAY)),
  (3, 'IN_TRANSIT',       'Trung chuyển qua bưu cục Thủ Đức',        'Thủ Đức, HCM',      'system',     DATE_SUB(NOW(), INTERVAL 6  HOUR)),
  (3, 'OUT_FOR_DELIVERY', 'Shipper đang trên đường giao hàng',        'Dĩ An, Bình Dương', 'driver_app', NOW());
