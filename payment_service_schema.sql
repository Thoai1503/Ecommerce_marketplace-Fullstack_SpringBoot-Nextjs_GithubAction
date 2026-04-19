-- ============================================================
-- Payment Service Database Schema
-- Database: payment_db (độc lập với ecommerce DB)
-- MySQL 8.0+
-- Chuẩn: microservice, không dùng FK cross-DB
-- ============================================================

CREATE DATABASE IF NOT EXISTS `payment_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE `payment_db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. GATEWAY CONFIG
--    Cấu hình các cổng thanh toán được hỗ trợ
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_gateway_config` (
    `id`             INT           NOT NULL AUTO_INCREMENT,
    `code`           VARCHAR(30)   NOT NULL             COMMENT 'COD, VNPAY, MOMO, ZALOPAY, BANK_TRANSFER, CREDIT_CARD',
    `name`           VARCHAR(100)  NOT NULL             COMMENT 'Tên hiển thị',
    `provider`       VARCHAR(50)   NOT NULL             COMMENT 'INTERNAL, VNPAY, MOMO, ZALOPAY, STRIPE',
    `logo_url`       VARCHAR(500)  NULL,
    `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
    `is_online`      TINYINT(1)    NOT NULL DEFAULT 1   COMMENT '0 = COD (offline), 1 = online payment',
    `min_amount`     BIGINT        NOT NULL DEFAULT 0   COMMENT 'Số tiền tối thiểu (VND)',
    `max_amount`     BIGINT        NULL                 COMMENT 'Số tiền tối đa (VND), NULL = không giới hạn',
    `timeout_minute` INT           NOT NULL DEFAULT 15  COMMENT 'Timeout chờ thanh toán (phút)',
    `config_json`    JSON          NULL                 COMMENT 'API key, endpoint, merchant_id (encrypted at app level)',
    `sort_order`     INT           NOT NULL DEFAULT 100,
    `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_gateway_code` (`code`),
    KEY `idx_gateway_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Cấu hình cổng thanh toán được hỗ trợ';

-- ============================================================
-- 2. PAYMENT TRANSACTION
--    Bảng giao dịch tổng quát — dùng chung cho mọi loại luồng tiền:
--    ORDER_PAYMENT   : user thanh toán đơn hàng
--    WALLET_TOPUP    : user nạp tiền vào ví
--    WALLET_WITHDRAW : user rút tiền từ ví ra tài khoản ngân hàng
--    SETTLEMENT_PAYOUT: sàn chuyển tiền bán hàng cho shop
--    REFUND_PAYOUT   : hoàn tiền về ví/tài khoản user
--    PLATFORM_FEE    : thu phí nền tảng từ shop
--    ADJUSTMENT      : điều chỉnh thủ công bởi admin
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_transaction` (
    `id`                   BIGINT        NOT NULL AUTO_INCREMENT,
    `txn_code`             VARCHAR(64)   NOT NULL             COMMENT 'Mã giao dịch nội bộ unique. VD: TXN-ORD-20260419XXXXX',

    -- Loại giao dịch — xác định toàn bộ ngữ nghĩa của bản ghi
    `txn_type`             VARCHAR(30)   NOT NULL             COMMENT 'ORDER_PAYMENT, WALLET_TOPUP, WALLET_WITHDRAW, SETTLEMENT_PAYOUT, REFUND_PAYOUT, PLATFORM_FEE, ADJUSTMENT',

    -- Tham chiếu đối tượng gốc (linh hoạt theo txn_type)
    -- ORDER_PAYMENT    : ref_type=ORDER,      ref_id=orders.id,          ref_code=order_number
    -- WALLET_TOPUP     : ref_type=TOPUP,      ref_id=topup_request.id,   ref_code=NULL
    -- SETTLEMENT_PAYOUT: ref_type=SETTLEMENT, ref_id=seller_settlement.id,ref_code=settlement_code
    -- REFUND_PAYOUT    : ref_type=REFUND,     ref_id=refund_request.id,  ref_code=refund_code
    -- PLATFORM_FEE     : ref_type=SETTLEMENT, ref_id=seller_settlement.id,ref_code=settlement_code
    `ref_type`             VARCHAR(30)   NULL                 COMMENT 'ORDER, TOPUP, SETTLEMENT, REFUND, DISPUTE, ADJUSTMENT',
    `ref_id`               BIGINT        NULL                 COMMENT 'ID của đối tượng tham chiếu',
    `ref_code`             VARCHAR(64)   NULL                 COMMENT 'Mã đọc được của đối tượng (order_number, refund_code...)',

    -- Bên gửi tiền
    `payer_type`           VARCHAR(20)   NULL                 COMMENT 'USER, SHOP, PLATFORM',
    `payer_id`             BIGINT        NULL                 COMMENT 'ID của bên gửi (user_id / shop_id / NULL nếu là PLATFORM)',

    -- Bên nhận tiền
    `payee_type`           VARCHAR(20)   NULL                 COMMENT 'USER, SHOP, PLATFORM',
    `payee_id`             BIGINT        NULL                 COMMENT 'ID của bên nhận (user_id / shop_id / NULL nếu là PLATFORM)',

    -- Giữ lại order_id / user_id tiện query cho luồng đơn hàng (ORDER_PAYMENT)
    `order_id`             BIGINT        NULL                 COMMENT 'Chỉ có giá trị khi txn_type=ORDER_PAYMENT',
    `order_number`         VARCHAR(64)   NULL                 COMMENT 'Chỉ có giá trị khi txn_type=ORDER_PAYMENT',
    `user_id`              BIGINT        NULL                 COMMENT 'Tham chiếu ecommerce.user.id (nếu có)',

    -- Số tiền
    `gross_amount`         BIGINT        NOT NULL             COMMENT 'Tổng giá trị giao dịch trước khi trừ (VND)',
    `fee_amount`           BIGINT        NOT NULL DEFAULT 0   COMMENT 'Phí giao dịch / phí nền tảng',
    `discount_amount`      BIGINT        NOT NULL DEFAULT 0   COMMENT 'Giảm giá / voucher áp dụng',
    `net_amount`           BIGINT        NOT NULL             COMMENT 'Số tiền thực tế thanh toán/nhận (gross - fee - discount)',
    `currency`             CHAR(3)       NOT NULL DEFAULT 'VND',

    -- Phương thức và cổng (chỉ dùng cho online payment)
    `payment_method`       VARCHAR(30)   NULL                 COMMENT 'COD, VNPAY, MOMO, ZALOPAY, BANK_TRANSFER, CREDIT_CARD, WALLET, INSTALLMENT, INTERNAL',
    `gateway_code`         VARCHAR(30)   NULL                 COMMENT 'FK logic -> payment_gateway_config.code',

    -- Thông tin từ gateway
    `gateway_txn_id`       VARCHAR(128)  NULL                 COMMENT 'Transaction ID do gateway cấp',
    `gateway_order_id`     VARCHAR(128)  NULL                 COMMENT 'Order ID gửi lên gateway',
    `gateway_ref_code`     VARCHAR(128)  NULL                 COMMENT 'Mã tham chiếu khác của gateway',
    `gateway_response_code`VARCHAR(20)   NULL                 COMMENT 'Response code từ gateway (00, 07, 09...)',
    `gateway_response_msg` VARCHAR(255)  NULL,
    `payment_url`          TEXT          NULL                 COMMENT 'URL redirect user đến gateway',

    -- Thông tin ngân hàng/tài khoản (nếu có)
    `bank_code`            VARCHAR(20)   NULL                 COMMENT 'Mã ngân hàng (BIDV, VCB, TCB...)',
    `bank_account_name`    VARCHAR(100)  NULL,
    `bank_account_number`  VARCHAR(30)   NULL,
    `card_type`            VARCHAR(20)   NULL                 COMMENT 'ATM, CREDIT, DEBIT',

    -- Trạng thái
    `status`               VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                                         COMMENT 'PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, EXPIRED, REFUNDED',
    `failure_reason`       VARCHAR(255)  NULL,

    -- Thời gian
    `expired_at`           DATETIME      NULL                 COMMENT 'Thời điểm hết hạn (chỉ áp dụng online payment)',
    `completed_at`         DATETIME      NULL                 COMMENT 'Thời điểm giao dịch hoàn tất (SUCCESS hoặc FAILED)',
    `confirmed_at`         DATETIME      NULL                 COMMENT 'Thời điểm xác nhận thủ công (VD: COD sau giao hàng)',
    `created_at`           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Context người khởi tạo (chống fraud, audit)
    `initiated_by`         VARCHAR(20)   NULL                 COMMENT 'USER, ADMIN, SYSTEM, SCHEDULER',
    `initiator_id`         BIGINT        NULL                 COMMENT 'user_id / admin_id tương ứng',
    `ip_address`           VARCHAR(45)   NULL,
    `user_agent`           VARCHAR(500)  NULL,
    `device_type`          VARCHAR(20)   NULL                 COMMENT 'APP, WEB, MOBILE_WEB',

    -- Metadata mở rộng
    `note`                 VARCHAR(500)  NULL                 COMMENT 'Ghi chú nội bộ / lý do điều chỉnh',
    `extra_data`           JSON          NULL                 COMMENT 'Dữ liệu bổ sung tuỳ gateway hoặc luồng nghiệp vụ',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_txn_code` (`txn_code`),
    -- order_id unique chỉ có ý nghĩa khi không NULL (MySQL cho phép nhiều NULL trong UNIQUE index)
    UNIQUE KEY `uk_order_id` (`order_id`)   COMMENT 'Mỗi đơn hàng chỉ có 1 transaction ORDER_PAYMENT',
    KEY `idx_txn_type_status` (`txn_type`, `status`, `created_at`),
    KEY `idx_ref` (`ref_type`, `ref_id`),
    KEY `idx_payer` (`payer_type`, `payer_id`),
    KEY `idx_payee` (`payee_type`, `payee_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_order_number` (`order_number`),
    KEY `idx_gateway_txn_id` (`gateway_txn_id`),
    KEY `idx_status_created` (`status`, `created_at`),
    KEY `idx_completed_at` (`completed_at`),
    KEY `idx_expired_at` (`expired_at`, `status`),

    CHECK (`txn_type` IN ('ORDER_PAYMENT','WALLET_TOPUP','WALLET_WITHDRAW','SETTLEMENT_PAYOUT','REFUND_PAYOUT','PLATFORM_FEE','ADJUSTMENT')),
    CHECK (`status` IN ('PENDING','PROCESSING','SUCCESS','FAILED','CANCELLED','EXPIRED','REFUNDED')),
    CHECK (`payment_method` IS NULL OR `payment_method` IN ('COD','VNPAY','MOMO','ZALOPAY','BANK_TRANSFER','CREDIT_CARD','WALLET','INSTALLMENT','INTERNAL')),
    CHECK (`net_amount` >= 0),
    CHECK (`gross_amount` >= 0),
    CHECK (`currency` = 'VND')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Bảng giao dịch tổng quát: đơn hàng, nạp ví, rút ví, thanh toán shop, hoàn tiền, phí nền tảng';

-- ============================================================
-- 3. PAYMENT STATUS HISTORY
--    Lưu vết toàn bộ thay đổi trạng thái giao dịch
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_status_history` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `transaction_id` BIGINT       NOT NULL,
    `from_status`    VARCHAR(20)  NULL     COMMENT 'NULL = trạng thái khởi tạo',
    `to_status`      VARCHAR(20)  NOT NULL,
    `changed_by`     VARCHAR(50)  NOT NULL COMMENT 'USER, SYSTEM, GATEWAY, ADMIN, WEBHOOK',
    `actor_id`       BIGINT       NULL     COMMENT 'user_id hoặc admin_id nếu có',
    `reason`         VARCHAR(255) NULL,
    `gateway_data`   JSON         NULL     COMMENT 'Snapshot dữ liệu gateway tại thời điểm đổi trạng thái',
    `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_txn_status_history` (`transaction_id`, `created_at`),
    CONSTRAINT `fk_status_history_txn`
        FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Lịch sử trạng thái giao dịch thanh toán';

-- ============================================================
-- 4. PAYMENT GATEWAY LOG
--    Log chi tiết từng request/response giao tiếp với cổng
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_gateway_log` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `transaction_id` BIGINT       NULL     COMMENT 'NULL khi webhook chưa match được transaction',
    `gateway_code`   VARCHAR(30)  NOT NULL,
    `log_type`       VARCHAR(20)  NOT NULL COMMENT 'REQUEST, RESPONSE, WEBHOOK, CALLBACK, IPN',
    `direction`      VARCHAR(10)  NOT NULL COMMENT 'OUTBOUND (ta gọi gateway), INBOUND (gateway gọi ta)',
    `endpoint`       VARCHAR(500) NULL     COMMENT 'URL được gọi',
    `http_method`    VARCHAR(10)  NULL     COMMENT 'GET, POST',
    `http_status`    INT          NULL     COMMENT 'HTTP status code',
    `request_headers`JSON         NULL,
    `request_body`   LONGTEXT     NULL,
    `response_headers`JSON        NULL,
    `response_body`  LONGTEXT     NULL,
    `duration_ms`    INT          NULL     COMMENT 'Thời gian xử lý (milliseconds)',
    `is_success`     TINYINT(1)   NULL,
    `error_message`  TEXT         NULL,
    `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_gateway_log_txn` (`transaction_id`),
    KEY `idx_gateway_log_type` (`gateway_code`, `log_type`, `created_at`),
    CONSTRAINT `fk_gateway_log_txn`
        FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Log request/response với cổng thanh toán';

-- ============================================================
-- 5. PAYMENT WEBHOOK EVENT
--    Lưu toàn bộ webhook inbound để đảm bảo idempotency
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_webhook_event` (
    `id`                 BIGINT       NOT NULL AUTO_INCREMENT,
    `gateway_code`       VARCHAR(30)  NOT NULL,
    `event_id`           VARCHAR(128) NULL     COMMENT 'ID sự kiện do gateway cấp (dùng cho idempotency)',
    `event_type`         VARCHAR(50)  NULL     COMMENT 'payment.success, payment.failed, refund.completed...',
    `raw_payload`        LONGTEXT     NOT NULL COMMENT 'Payload thô chưa xử lý',
    `signature`          VARCHAR(512) NULL     COMMENT 'Chữ ký để verify',
    `is_verified`        TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1 = đã verify chữ ký thành công',
    `is_processed`       TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1 = đã xử lý (gọi business logic)',
    `process_result`     VARCHAR(50)  NULL     COMMENT 'SUCCESS, FAILED, IGNORED, DUPLICATE',
    `transaction_id`     BIGINT       NULL     COMMENT 'Transaction được map sau khi xử lý',
    `process_note`       VARCHAR(500) NULL,
    `retry_count`        INT          NOT NULL DEFAULT 0,
    `received_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `processed_at`       DATETIME     NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_gateway_event` (`gateway_code`, `event_id`) COMMENT 'Idempotency: không xử lý 2 lần cùng event',
    KEY `idx_webhook_processed` (`is_processed`, `received_at`),
    KEY `idx_webhook_txn` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Webhook events nhận từ cổng thanh toán';

-- ============================================================
-- 6. REFUND REQUEST
--    Yêu cầu hoàn tiền cho đơn hàng
-- ============================================================
CREATE TABLE IF NOT EXISTS `refund_request` (
    `id`                  BIGINT        NOT NULL AUTO_INCREMENT,
    `refund_code`         VARCHAR(64)   NOT NULL             COMMENT 'Mã hoàn tiền nội bộ, VD: REF20260419XXXXX',
    `transaction_id`      BIGINT        NOT NULL,
    `order_id`            BIGINT        NOT NULL,
    `order_number`        VARCHAR(64)   NOT NULL,
    `user_id`             BIGINT        NOT NULL,
    `shop_id`             BIGINT        NULL,

    -- Số tiền
    `refund_amount`       BIGINT        NOT NULL             COMMENT 'Số tiền hoàn (VND)',
    `shipping_refund`     BIGINT        NOT NULL DEFAULT 0   COMMENT 'Phần hoàn phí vận chuyển',
    `currency`            CHAR(3)       NOT NULL DEFAULT 'VND',

    -- Lý do và loại
    `refund_type`         VARCHAR(30)   NOT NULL             COMMENT 'CANCELLED_BY_USER, CANCELLED_BY_SHOP, ITEM_NOT_RECEIVED, ITEM_DEFECTIVE, OVERPAID, SYSTEM_ERROR',
    `reason`              TEXT          NULL,
    `evidence_urls`       JSON          NULL                 COMMENT 'Danh sách URL ảnh/video bằng chứng',

    -- Phương thức hoàn
    `refund_method`       VARCHAR(30)   NOT NULL             COMMENT 'ORIGINAL_METHOD, WALLET, BANK_TRANSFER',
    `bank_account_name`   VARCHAR(100)  NULL,
    `bank_account_number` VARCHAR(30)   NULL,
    `bank_code`           VARCHAR(20)   NULL,

    -- Gateway refund tracking
    `gateway_refund_id`   VARCHAR(128)  NULL                 COMMENT 'Refund ID do gateway cấp',
    `gateway_response`    JSON          NULL,

    -- Trạng thái và người xử lý
    `status`              VARCHAR(20)   NOT NULL DEFAULT 'REQUESTED'
                                        COMMENT 'REQUESTED, APPROVED, REJECTED, PROCESSING, COMPLETED, FAILED',
    `reviewed_by`         BIGINT        NULL                 COMMENT 'Admin ID duyệt',
    `review_note`         VARCHAR(500)  NULL,

    -- Thời gian
    `requested_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `approved_at`         DATETIME      NULL,
    `completed_at`        DATETIME      NULL,
    `created_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_refund_code` (`refund_code`),
    KEY `idx_refund_transaction` (`transaction_id`),
    KEY `idx_refund_order` (`order_id`),
    KEY `idx_refund_user` (`user_id`, `status`),
    KEY `idx_refund_status_created` (`status`, `created_at`),
    CONSTRAINT `fk_refund_transaction`
        FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`),

    CHECK (`status` IN ('REQUESTED','APPROVED','REJECTED','PROCESSING','COMPLETED','FAILED')),
    CHECK (`refund_type` IN ('CANCELLED_BY_USER','CANCELLED_BY_SHOP','ITEM_NOT_RECEIVED','ITEM_DEFECTIVE','OVERPAID','SYSTEM_ERROR','DUPLICATE_PAYMENT')),
    CHECK (`refund_method` IN ('ORIGINAL_METHOD','WALLET','BANK_TRANSFER')),
    CHECK (`refund_amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Yêu cầu hoàn tiền';

-- ============================================================
-- 7. REFUND STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS `refund_status_history` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `refund_id`   BIGINT       NOT NULL,
    `from_status` VARCHAR(20)  NULL,
    `to_status`   VARCHAR(20)  NOT NULL,
    `changed_by`  VARCHAR(50)  NOT NULL COMMENT 'USER, ADMIN, SYSTEM, GATEWAY',
    `actor_id`    BIGINT       NULL,
    `note`        VARCHAR(500) NULL,
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_refund_status_history` (`refund_id`, `created_at`),
    CONSTRAINT `fk_refund_status_history_refund`
        FOREIGN KEY (`refund_id`) REFERENCES `refund_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Lịch sử trạng thái hoàn tiền';

-- ============================================================
-- 8. SELLER SETTLEMENT (Thanh toán cho shop)
--    Lô thanh toán tiền hàng đã collected về cho shop
-- ============================================================
CREATE TABLE IF NOT EXISTS `seller_settlement` (
    `id`                BIGINT        NOT NULL AUTO_INCREMENT,
    `settlement_code`   VARCHAR(64)   NOT NULL             COMMENT 'Mã lô thanh toán, VD: SET20260419SHOP1',
    `shop_id`           BIGINT        NOT NULL             COMMENT 'Tham chiếu ecommerce.shop.id',
    `period_from`       DATE          NOT NULL             COMMENT 'Kỳ thanh toán từ',
    `period_to`         DATE          NOT NULL             COMMENT 'Kỳ thanh toán đến',

    -- Số tiền
    `gross_amount`      BIGINT        NOT NULL             COMMENT 'Tổng tiền hàng chưa trừ phí',
    `platform_fee`      BIGINT        NOT NULL DEFAULT 0   COMMENT 'Phí nền tảng/hoa hồng (VND)',
    `shipping_subsidy`  BIGINT        NOT NULL DEFAULT 0   COMMENT 'Nền tảng hỗ trợ phí ship cho shop',
    `voucher_cost`      BIGINT        NOT NULL DEFAULT 0   COMMENT 'Chi phí voucher shop chịu',
    `adjustment_amount` BIGINT        NOT NULL DEFAULT 0   COMMENT 'Điều chỉnh thủ công (có thể âm)',
    `net_amount`        BIGINT        NOT NULL             COMMENT 'Số tiền thực thanh toán cho shop',
    `currency`          CHAR(3)       NOT NULL DEFAULT 'VND',

    -- Thông tin tài khoản shop nhận tiền
    `bank_account_name`   VARCHAR(100) NULL,
    `bank_account_number` VARCHAR(30)  NULL,
    `bank_code`           VARCHAR(20)  NULL,

    -- Trạng thái
    `status`            VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                                      COMMENT 'PENDING, PROCESSING, PAID, ON_HOLD, CANCELLED',
    `on_hold_reason`    VARCHAR(500)  NULL,
    `paid_at`           DATETIME      NULL,
    `bank_transfer_ref` VARCHAR(128)  NULL     COMMENT 'Mã tham chiếu chuyển khoản',

    `processed_by`      BIGINT        NULL     COMMENT 'Admin ID xử lý',
    `note`              TEXT          NULL,
    `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_settlement_code` (`settlement_code`),
    KEY `idx_settlement_shop` (`shop_id`, `status`),
    KEY `idx_settlement_period` (`period_from`, `period_to`),
    KEY `idx_settlement_status` (`status`, `created_at`),

    CHECK (`status` IN ('PENDING','PROCESSING','PAID','ON_HOLD','CANCELLED')),
    CHECK (`net_amount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Lô thanh toán tiền hàng cho shop';

-- ============================================================
-- 9. SELLER SETTLEMENT ITEM
--    Chi tiết từng giao dịch trong lô thanh toán
-- ============================================================
CREATE TABLE IF NOT EXISTS `seller_settlement_item` (
    `id`                BIGINT   NOT NULL AUTO_INCREMENT,
    `settlement_id`     BIGINT   NOT NULL,
    `transaction_id`    BIGINT   NOT NULL,
    `order_id`          BIGINT   NOT NULL,
    `order_number`      VARCHAR(64) NOT NULL,
    `item_type`         VARCHAR(20)  NOT NULL COMMENT 'SALE, REFUND, ADJUSTMENT',
    `gross_amount`      BIGINT   NOT NULL,
    `platform_fee`      BIGINT   NOT NULL DEFAULT 0,
    `voucher_cost`      BIGINT   NOT NULL DEFAULT 0,
    `net_amount`        BIGINT   NOT NULL,
    `order_paid_at`     DATETIME NULL,
    `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_settlement_item_set` (`settlement_id`),
    KEY `idx_settlement_item_txn` (`transaction_id`),
    KEY `idx_settlement_item_order` (`order_id`),
    CONSTRAINT `fk_settlement_item_settlement`
        FOREIGN KEY (`settlement_id`) REFERENCES `seller_settlement` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_settlement_item_txn`
        FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`),

    CHECK (`item_type` IN ('SALE','REFUND','ADJUSTMENT'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Chi tiết đơn hàng trong lô thanh toán shop';

-- ============================================================
-- 10. PAYMENT WALLET (Ví nội bộ)
--     Store credit / cashback / xu của user
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_wallet` (
    `id`             BIGINT        NOT NULL AUTO_INCREMENT,
    `user_id`        BIGINT        NOT NULL UNIQUE       COMMENT 'Tham chiếu ecommerce.user.id',
    `balance`        BIGINT        NOT NULL DEFAULT 0    COMMENT 'Số dư hiện tại (VND/xu)',
    `locked_balance` BIGINT        NOT NULL DEFAULT 0    COMMENT 'Số dư đang tạm giữ (đặt cọc, chờ xác nhận)',
    `currency`       CHAR(3)       NOT NULL DEFAULT 'VND',
    `is_active`      TINYINT(1)    NOT NULL DEFAULT 1,
    `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_wallet_user` (`user_id`),
    CHECK (`balance` >= 0),
    CHECK (`locked_balance` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Ví điện tử nội bộ của người dùng';

-- ============================================================
-- 11. WALLET TRANSACTION
--     Lịch sử biến động số dư ví
-- ============================================================
CREATE TABLE IF NOT EXISTS `wallet_transaction` (
    `id`                 BIGINT        NOT NULL AUTO_INCREMENT,
    `wallet_id`          BIGINT        NOT NULL,
    `user_id`            BIGINT        NOT NULL,
    `txn_type`           VARCHAR(30)   NOT NULL             COMMENT 'CREDIT, DEBIT, LOCK, UNLOCK, REFUND_CREDIT, CASHBACK, EXPIRE',
    `amount`             BIGINT        NOT NULL             COMMENT 'Số tiền biến động (luôn dương)',
    `balance_before`     BIGINT        NOT NULL             COMMENT 'Số dư trước khi biến động',
    `balance_after`      BIGINT        NOT NULL             COMMENT 'Số dư sau khi biến động',
    `ref_type`           VARCHAR(30)   NULL                 COMMENT 'PAYMENT, REFUND, PROMOTION, MANUAL',
    `ref_id`             BIGINT        NULL                 COMMENT 'ID của transaction/refund liên quan',
    `description`        VARCHAR(255)  NULL,
    `expired_at`         DATETIME      NULL                 COMMENT 'Nếu là cashback có thời hạn',
    `created_at`         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    KEY `idx_wallet_txn_wallet` (`wallet_id`, `created_at`),
    KEY `idx_wallet_txn_user` (`user_id`, `created_at`),
    KEY `idx_wallet_txn_ref` (`ref_type`, `ref_id`),
    CONSTRAINT `fk_wallet_txn_wallet`
        FOREIGN KEY (`wallet_id`) REFERENCES `payment_wallet` (`id`),

    CHECK (`txn_type` IN ('CREDIT','DEBIT','LOCK','UNLOCK','REFUND_CREDIT','CASHBACK','EXPIRE','ADJUSTMENT')),
    CHECK (`amount` > 0),
    CHECK (`balance_after` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Lịch sử biến động ví điện tử';

-- ============================================================
-- 12. PAYMENT DISPUTE (Tranh chấp giao dịch)
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_dispute` (
    `id`                BIGINT       NOT NULL AUTO_INCREMENT,
    `dispute_code`      VARCHAR(64)  NOT NULL,
    `transaction_id`    BIGINT       NOT NULL,
    `order_id`          BIGINT       NOT NULL,
    `user_id`           BIGINT       NOT NULL,
    `shop_id`           BIGINT       NULL,
    `dispute_type`      VARCHAR(30)  NOT NULL COMMENT 'CHARGEBACK, NOT_RECEIVED, ITEM_DEFECTIVE, FRAUD, DUPLICATE_CHARGE',
    `dispute_amount`    BIGINT       NOT NULL,
    `description`       TEXT         NULL,
    `evidence_urls`     JSON         NULL,
    `status`            VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                                     COMMENT 'OPEN, UNDER_REVIEW, RESOLVED_BUYER, RESOLVED_SELLER, CLOSED',
    `resolution_note`   TEXT         NULL,
    `resolved_by`       BIGINT       NULL,
    `opened_at`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `resolved_at`       DATETIME     NULL,
    `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dispute_code` (`dispute_code`),
    KEY `idx_dispute_txn` (`transaction_id`),
    KEY `idx_dispute_order` (`order_id`),
    KEY `idx_dispute_user` (`user_id`, `status`),
    CONSTRAINT `fk_dispute_txn`
        FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`),

    CHECK (`status` IN ('OPEN','UNDER_REVIEW','RESOLVED_BUYER','RESOLVED_SELLER','CLOSED')),
    CHECK (`dispute_type` IN ('CHARGEBACK','NOT_RECEIVED','ITEM_DEFECTIVE','FRAUD','DUPLICATE_CHARGE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Tranh chấp giao dịch thanh toán';

-- ============================================================
-- SEED: Default gateway configurations
-- ============================================================
INSERT IGNORE INTO `payment_gateway_config`
    (`code`, `name`, `provider`, `is_active`, `is_online`, `min_amount`, `max_amount`, `timeout_minute`, `sort_order`)
VALUES
    ('COD',           'Thanh toán khi nhận hàng', 'INTERNAL', 1, 0, 0,       NULL,       0,  1),
    ('MOMO',          'Ví MoMo',                  'MOMO',     1, 1, 1000,    50000000,   15, 2),
    ('ZALOPAY',       'ZaloPay',                  'ZALOPAY',  1, 1, 1000,    50000000,   15, 3),
    ('VNPAY',         'VNPay',                    'VNPAY',    1, 1, 5000,    100000000,  15, 4),
    ('BANK_TRANSFER', 'Chuyển khoản ngân hàng',   'INTERNAL', 1, 1, 10000,  NULL,        60, 5),
    ('CREDIT_CARD',   'Thẻ tín dụng/ghi nợ',     'STRIPE',   0, 1, 50000,   200000000,  15, 6),
    ('INSTALLMENT',   'Trả góp 0%',               'KREDIVO',  0, 1, 1000000, NULL,        30, 7);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Quick verification queries
-- ============================================================
-- SHOW TABLES;
-- SELECT code, name, is_active, timeout_minute FROM payment_gateway_config ORDER BY sort_order;
-- DESC payment_transaction;
-- DESC refund_request;
-- DESC seller_settlement;
-- DESC payment_wallet;
