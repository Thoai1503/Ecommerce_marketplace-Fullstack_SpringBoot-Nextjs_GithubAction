-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: mysql-2acda025-vothoai1503-2915.l.aivencloud.com    Database: payment_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2c59c582-18f2-11f1-bd8d-5aa896c9ebaa:1-2754,
623d5015-006c-11f1-9997-862ccfb0601c:1-55,
c092d620-3959-11f0-ab88-862ccfb006c1:1-123,
c2164987-7c01-11f0-abd1-862ccfb03b82:1-293';

--
-- Table structure for table `payment_dispute`
--

DROP TABLE IF EXISTS `payment_dispute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_dispute` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dispute_code` varchar(64) NOT NULL,
  `transaction_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `shop_id` bigint DEFAULT NULL,
  `dispute_type` varchar(30) NOT NULL COMMENT 'CHARGEBACK, NOT_RECEIVED, ITEM_DEFECTIVE, FRAUD, DUPLICATE_CHARGE',
  `dispute_amount` bigint NOT NULL,
  `description` text,
  `evidence_urls` json DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN, UNDER_REVIEW, RESOLVED_BUYER, RESOLVED_SELLER, CLOSED',
  `resolution_note` text,
  `resolved_by` bigint DEFAULT NULL,
  `opened_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dispute_code` (`dispute_code`),
  KEY `idx_dispute_txn` (`transaction_id`),
  KEY `idx_dispute_order` (`order_id`),
  KEY `idx_dispute_user` (`user_id`,`status`),
  CONSTRAINT `fk_dispute_txn` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`),
  CONSTRAINT `payment_dispute_chk_1` CHECK ((`status` in (_utf8mb4'OPEN',_utf8mb4'UNDER_REVIEW',_utf8mb4'RESOLVED_BUYER',_utf8mb4'RESOLVED_SELLER',_utf8mb4'CLOSED'))),
  CONSTRAINT `payment_dispute_chk_2` CHECK ((`dispute_type` in (_utf8mb4'CHARGEBACK',_utf8mb4'NOT_RECEIVED',_utf8mb4'ITEM_DEFECTIVE',_utf8mb4'FRAUD',_utf8mb4'DUPLICATE_CHARGE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tranh chấp giao dịch thanh toán';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_dispute`
--

LOCK TABLES `payment_dispute` WRITE;
/*!40000 ALTER TABLE `payment_dispute` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_dispute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_gateway_config`
--

DROP TABLE IF EXISTS `payment_gateway_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_gateway_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL COMMENT 'COD, VNPAY, MOMO, ZALOPAY, BANK_TRANSFER, CREDIT_CARD',
  `name` varchar(100) NOT NULL COMMENT 'Tên hiển thị',
  `provider` varchar(50) NOT NULL COMMENT 'INTERNAL, VNPAY, MOMO, ZALOPAY, STRIPE',
  `logo_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_online` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = COD (offline), 1 = online payment',
  `min_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Số tiền tối thiểu (VND)',
  `max_amount` bigint DEFAULT NULL COMMENT 'Số tiền tối đa (VND), NULL = không giới hạn',
  `timeout_minute` int NOT NULL DEFAULT '15' COMMENT 'Timeout chờ thanh toán (phút)',
  `config_json` json DEFAULT NULL COMMENT 'API key, endpoint, merchant_id (encrypted at app level)',
  `sort_order` int NOT NULL DEFAULT '100',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gateway_code` (`code`),
  KEY `idx_gateway_active` (`is_active`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Cấu hình cổng thanh toán được hỗ trợ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_gateway_config`
--

LOCK TABLES `payment_gateway_config` WRITE;
/*!40000 ALTER TABLE `payment_gateway_config` DISABLE KEYS */;
INSERT INTO `payment_gateway_config` VALUES (1,'COD','Thanh toán khi nhận hàng','INTERNAL',NULL,1,0,0,NULL,0,NULL,1,'2026-04-19 03:47:33','2026-04-19 03:47:33'),(2,'MOMO','Ví MoMo','MOMO',NULL,1,1,1000,50000000,15,NULL,2,'2026-04-19 03:47:33','2026-04-19 03:47:33'),(3,'ZALOPAY','ZaloPay','ZALOPAY',NULL,1,1,1000,50000000,15,NULL,3,'2026-04-19 03:47:33','2026-04-19 03:47:33'),(4,'VNPAY','VNPay','VNPAY',NULL,1,1,5000,100000000,15,NULL,4,'2026-04-19 03:47:33','2026-04-19 03:47:33'),(5,'BANK_TRANSFER','Chuyển khoản ngân hàng','INTERNAL',NULL,1,1,10000,NULL,60,NULL,5,'2026-04-19 03:47:33','2026-04-19 03:47:33'),(6,'CREDIT_CARD','Thẻ tín dụng/ghi nợ','STRIPE',NULL,0,1,50000,200000000,15,NULL,6,'2026-04-19 03:47:33','2026-04-19 03:47:33'),(7,'INSTALLMENT','Trả góp 0%','KREDIVO',NULL,0,1,1000000,NULL,30,NULL,7,'2026-04-19 03:47:33','2026-04-19 03:47:33');
/*!40000 ALTER TABLE `payment_gateway_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_gateway_log`
--

DROP TABLE IF EXISTS `payment_gateway_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_gateway_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint DEFAULT NULL COMMENT 'NULL khi webhook chưa match được transaction',
  `gateway_code` varchar(30) NOT NULL,
  `log_type` varchar(20) NOT NULL COMMENT 'REQUEST, RESPONSE, WEBHOOK, CALLBACK, IPN',
  `direction` varchar(10) NOT NULL COMMENT 'OUTBOUND (ta gọi gateway), INBOUND (gateway gọi ta)',
  `endpoint` varchar(500) DEFAULT NULL COMMENT 'URL được gọi',
  `http_method` varchar(10) DEFAULT NULL COMMENT 'GET, POST',
  `http_status` int DEFAULT NULL COMMENT 'HTTP status code',
  `request_headers` json DEFAULT NULL,
  `request_body` longtext,
  `response_headers` json DEFAULT NULL,
  `response_body` longtext,
  `duration_ms` int DEFAULT NULL COMMENT 'Thời gian xử lý (milliseconds)',
  `is_success` tinyint(1) DEFAULT NULL,
  `error_message` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gateway_log_txn` (`transaction_id`),
  KEY `idx_gateway_log_type` (`gateway_code`,`log_type`,`created_at`),
  CONSTRAINT `fk_gateway_log_txn` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Log request/response với cổng thanh toán';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_gateway_log`
--

LOCK TABLES `payment_gateway_log` WRITE;
/*!40000 ALTER TABLE `payment_gateway_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_gateway_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_status_history`
--

DROP TABLE IF EXISTS `payment_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint NOT NULL,
  `from_status` varchar(20) DEFAULT NULL COMMENT 'NULL = trạng thái khởi tạo',
  `to_status` varchar(20) NOT NULL,
  `changed_by` varchar(50) NOT NULL COMMENT 'USER, SYSTEM, GATEWAY, ADMIN, WEBHOOK',
  `actor_id` bigint DEFAULT NULL COMMENT 'user_id hoặc admin_id nếu có',
  `reason` varchar(255) DEFAULT NULL,
  `gateway_data` json DEFAULT NULL COMMENT 'Snapshot dữ liệu gateway tại thời điểm đổi trạng thái',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_txn_status_history` (`transaction_id`,`created_at`),
  CONSTRAINT `fk_status_history_txn` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử trạng thái giao dịch thanh toán';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_status_history`
--

LOCK TABLES `payment_status_history` WRITE;
/*!40000 ALTER TABLE `payment_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transaction`
--

DROP TABLE IF EXISTS `payment_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `txn_code` varchar(64) NOT NULL COMMENT 'Mã giao dịch nội bộ unique. VD: TXN-ORD-20260419XXXXX',
  `txn_type` varchar(30) NOT NULL COMMENT 'ORDER_PAYMENT, WALLET_TOPUP, WALLET_WITHDRAW, SETTLEMENT_PAYOUT, REFUND_PAYOUT, PLATFORM_FEE, ADJUSTMENT',
  `ref_type` varchar(30) DEFAULT NULL COMMENT 'ORDER, TOPUP, SETTLEMENT, REFUND, DISPUTE, ADJUSTMENT',
  `ref_id` bigint DEFAULT NULL COMMENT 'ID của đối tượng tham chiếu',
  `ref_code` varchar(64) DEFAULT NULL COMMENT 'Mã đọc được của đối tượng (order_number, refund_code...)',
  `payer_type` varchar(20) DEFAULT NULL COMMENT 'USER, SHOP, PLATFORM',
  `payer_id` bigint DEFAULT NULL COMMENT 'ID của bên gửi (user_id / shop_id / NULL nếu là PLATFORM)',
  `payee_type` varchar(20) DEFAULT NULL COMMENT 'USER, SHOP, PLATFORM',
  `payee_id` bigint DEFAULT NULL COMMENT 'ID của bên nhận (user_id / shop_id / NULL nếu là PLATFORM)',
  `order_id` bigint DEFAULT NULL COMMENT 'Chỉ có giá trị khi txn_type=ORDER_PAYMENT',
  `order_number` varchar(64) DEFAULT NULL COMMENT 'Chỉ có giá trị khi txn_type=ORDER_PAYMENT',
  `user_id` bigint DEFAULT NULL COMMENT 'Tham chiếu ecommerce.user.id (nếu có)',
  `gross_amount` bigint NOT NULL COMMENT 'Tổng giá trị giao dịch trước khi trừ (VND)',
  `fee_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Phí giao dịch / phí nền tảng',
  `discount_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Giảm giá / voucher áp dụng',
  `net_amount` bigint NOT NULL COMMENT 'Số tiền thực tế thanh toán/nhận (gross - fee - discount)',
  `currency` char(3) NOT NULL DEFAULT 'VND',
  `payment_method` varchar(30) DEFAULT NULL COMMENT 'COD, VNPAY, MOMO, ZALOPAY, BANK_TRANSFER, CREDIT_CARD, WALLET, INSTALLMENT, INTERNAL',
  `gateway_code` varchar(30) DEFAULT NULL COMMENT 'FK logic -> payment_gateway_config.code',
  `gateway_txn_id` varchar(128) DEFAULT NULL COMMENT 'Transaction ID do gateway cấp',
  `gateway_order_id` varchar(128) DEFAULT NULL COMMENT 'Order ID gửi lên gateway',
  `gateway_ref_code` varchar(128) DEFAULT NULL COMMENT 'Mã tham chiếu khác của gateway',
  `gateway_response_code` varchar(20) DEFAULT NULL COMMENT 'Response code từ gateway (00, 07, 09...)',
  `gateway_response_msg` varchar(255) DEFAULT NULL,
  `payment_url` text COMMENT 'URL redirect user đến gateway',
  `bank_code` varchar(20) DEFAULT NULL COMMENT 'Mã ngân hàng (BIDV, VCB, TCB...)',
  `bank_account_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(30) DEFAULT NULL,
  `card_type` varchar(20) DEFAULT NULL COMMENT 'ATM, CREDIT, DEBIT',
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, EXPIRED, REFUNDED',
  `failure_reason` varchar(255) DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL COMMENT 'Thời điểm hết hạn (chỉ áp dụng online payment)',
  `completed_at` datetime DEFAULT NULL COMMENT 'Thời điểm giao dịch hoàn tất (SUCCESS hoặc FAILED)',
  `confirmed_at` datetime DEFAULT NULL COMMENT 'Thời điểm xác nhận thủ công (VD: COD sau giao hàng)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `initiated_by` varchar(20) DEFAULT NULL COMMENT 'USER, ADMIN, SYSTEM, SCHEDULER',
  `initiator_id` bigint DEFAULT NULL COMMENT 'user_id / admin_id tương ứng',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `device_type` varchar(20) DEFAULT NULL COMMENT 'APP, WEB, MOBILE_WEB',
  `note` varchar(500) DEFAULT NULL COMMENT 'Ghi chú nội bộ / lý do điều chỉnh',
  `extra_data` json DEFAULT NULL COMMENT 'Dữ liệu bổ sung tuỳ gateway hoặc luồng nghiệp vụ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_txn_code` (`txn_code`),
  UNIQUE KEY `uk_order_id` (`order_id`) COMMENT 'Mỗi đơn hàng chỉ có 1 transaction ORDER_PAYMENT',
  KEY `idx_txn_type_status` (`txn_type`,`status`,`created_at`),
  KEY `idx_ref` (`ref_type`,`ref_id`),
  KEY `idx_payer` (`payer_type`,`payer_id`),
  KEY `idx_payee` (`payee_type`,`payee_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_gateway_txn_id` (`gateway_txn_id`),
  KEY `idx_status_created` (`status`,`created_at`),
  KEY `idx_completed_at` (`completed_at`),
  KEY `idx_expired_at` (`expired_at`,`status`),
  CONSTRAINT `payment_transaction_chk_1` CHECK ((`txn_type` in (_utf8mb4'ORDER_PAYMENT',_utf8mb4'WALLET_TOPUP',_utf8mb4'WALLET_WITHDRAW',_utf8mb4'SETTLEMENT_PAYOUT',_utf8mb4'REFUND_PAYOUT',_utf8mb4'PLATFORM_FEE',_utf8mb4'ADJUSTMENT'))),
  CONSTRAINT `payment_transaction_chk_2` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'PROCESSING',_utf8mb4'SUCCESS',_utf8mb4'FAILED',_utf8mb4'CANCELLED',_utf8mb4'EXPIRED',_utf8mb4'REFUNDED'))),
  CONSTRAINT `payment_transaction_chk_3` CHECK (((`payment_method` is null) or (`payment_method` in (_utf8mb4'COD',_utf8mb4'VNPAY',_utf8mb4'MOMO',_utf8mb4'ZALOPAY',_utf8mb4'BANK_TRANSFER',_utf8mb4'CREDIT_CARD',_utf8mb4'WALLET',_utf8mb4'INSTALLMENT',_utf8mb4'INTERNAL')))),
  CONSTRAINT `payment_transaction_chk_4` CHECK ((`net_amount` >= 0)),
  CONSTRAINT `payment_transaction_chk_5` CHECK ((`gross_amount` >= 0)),
  CONSTRAINT `payment_transaction_chk_6` CHECK ((`currency` = _utf8mb4'VND'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng giao dịch tổng quát: đơn hàng, nạp ví, rút ví, thanh toán shop, hoàn tiền, phí nền tảng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transaction`
--

LOCK TABLES `payment_transaction` WRITE;
/*!40000 ALTER TABLE `payment_transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_wallet`
--

DROP TABLE IF EXISTS `payment_wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_wallet` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT 'Tham chiếu ecommerce.user.id',
  `balance` bigint NOT NULL DEFAULT '0' COMMENT 'Số dư hiện tại (VND/xu)',
  `locked_balance` bigint NOT NULL DEFAULT '0' COMMENT 'Số dư đang tạm giữ (đặt cọc, chờ xác nhận)',
  `currency` char(3) NOT NULL DEFAULT 'VND',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_wallet_user` (`user_id`),
  CONSTRAINT `payment_wallet_chk_1` CHECK ((`balance` >= 0)),
  CONSTRAINT `payment_wallet_chk_2` CHECK ((`locked_balance` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ví điện tử nội bộ của người dùng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_wallet`
--

LOCK TABLES `payment_wallet` WRITE;
/*!40000 ALTER TABLE `payment_wallet` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_webhook_event`
--

DROP TABLE IF EXISTS `payment_webhook_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_webhook_event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `gateway_code` varchar(30) NOT NULL,
  `event_id` varchar(128) DEFAULT NULL COMMENT 'ID sự kiện do gateway cấp (dùng cho idempotency)',
  `event_type` varchar(50) DEFAULT NULL COMMENT 'payment.success, payment.failed, refund.completed...',
  `raw_payload` longtext NOT NULL COMMENT 'Payload thô chưa xử lý',
  `signature` varchar(512) DEFAULT NULL COMMENT 'Chữ ký để verify',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = đã verify chữ ký thành công',
  `is_processed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = đã xử lý (gọi business logic)',
  `process_result` varchar(50) DEFAULT NULL COMMENT 'SUCCESS, FAILED, IGNORED, DUPLICATE',
  `transaction_id` bigint DEFAULT NULL COMMENT 'Transaction được map sau khi xử lý',
  `process_note` varchar(500) DEFAULT NULL,
  `retry_count` int NOT NULL DEFAULT '0',
  `received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gateway_event` (`gateway_code`,`event_id`) COMMENT 'Idempotency: không xử lý 2 lần cùng event',
  KEY `idx_webhook_processed` (`is_processed`,`received_at`),
  KEY `idx_webhook_txn` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Webhook events nhận từ cổng thanh toán';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_webhook_event`
--

LOCK TABLES `payment_webhook_event` WRITE;
/*!40000 ALTER TABLE `payment_webhook_event` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_webhook_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refund_request`
--

DROP TABLE IF EXISTS `refund_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refund_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `refund_code` varchar(64) NOT NULL COMMENT 'Mã hoàn tiền nội bộ, VD: REF20260419XXXXX',
  `transaction_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `order_number` varchar(64) NOT NULL,
  `user_id` bigint NOT NULL,
  `shop_id` bigint DEFAULT NULL,
  `refund_amount` bigint NOT NULL COMMENT 'Số tiền hoàn (VND)',
  `shipping_refund` bigint NOT NULL DEFAULT '0' COMMENT 'Phần hoàn phí vận chuyển',
  `currency` char(3) NOT NULL DEFAULT 'VND',
  `refund_type` varchar(30) NOT NULL COMMENT 'CANCELLED_BY_USER, CANCELLED_BY_SHOP, ITEM_NOT_RECEIVED, ITEM_DEFECTIVE, OVERPAID, SYSTEM_ERROR',
  `reason` text,
  `evidence_urls` json DEFAULT NULL COMMENT 'Danh sách URL ảnh/video bằng chứng',
  `refund_method` varchar(30) NOT NULL COMMENT 'ORIGINAL_METHOD, WALLET, BANK_TRANSFER',
  `bank_account_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(30) DEFAULT NULL,
  `bank_code` varchar(20) DEFAULT NULL,
  `gateway_refund_id` varchar(128) DEFAULT NULL COMMENT 'Refund ID do gateway cấp',
  `gateway_response` json DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'REQUESTED' COMMENT 'REQUESTED, APPROVED, REJECTED, PROCESSING, COMPLETED, FAILED',
  `reviewed_by` bigint DEFAULT NULL COMMENT 'Admin ID duyệt',
  `review_note` varchar(500) DEFAULT NULL,
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refund_code` (`refund_code`),
  KEY `idx_refund_transaction` (`transaction_id`),
  KEY `idx_refund_order` (`order_id`),
  KEY `idx_refund_user` (`user_id`,`status`),
  KEY `idx_refund_status_created` (`status`,`created_at`),
  CONSTRAINT `fk_refund_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`),
  CONSTRAINT `refund_request_chk_1` CHECK ((`status` in (_utf8mb4'REQUESTED',_utf8mb4'APPROVED',_utf8mb4'REJECTED',_utf8mb4'PROCESSING',_utf8mb4'COMPLETED',_utf8mb4'FAILED'))),
  CONSTRAINT `refund_request_chk_2` CHECK ((`refund_type` in (_utf8mb4'CANCELLED_BY_USER',_utf8mb4'CANCELLED_BY_SHOP',_utf8mb4'ITEM_NOT_RECEIVED',_utf8mb4'ITEM_DEFECTIVE',_utf8mb4'OVERPAID',_utf8mb4'SYSTEM_ERROR',_utf8mb4'DUPLICATE_PAYMENT'))),
  CONSTRAINT `refund_request_chk_3` CHECK ((`refund_method` in (_utf8mb4'ORIGINAL_METHOD',_utf8mb4'WALLET',_utf8mb4'BANK_TRANSFER'))),
  CONSTRAINT `refund_request_chk_4` CHECK ((`refund_amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Yêu cầu hoàn tiền';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund_request`
--

LOCK TABLES `refund_request` WRITE;
/*!40000 ALTER TABLE `refund_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `refund_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refund_status_history`
--

DROP TABLE IF EXISTS `refund_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refund_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `refund_id` bigint NOT NULL,
  `from_status` varchar(20) DEFAULT NULL,
  `to_status` varchar(20) NOT NULL,
  `changed_by` varchar(50) NOT NULL COMMENT 'USER, ADMIN, SYSTEM, GATEWAY',
  `actor_id` bigint DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_refund_status_history` (`refund_id`,`created_at`),
  CONSTRAINT `fk_refund_status_history_refund` FOREIGN KEY (`refund_id`) REFERENCES `refund_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử trạng thái hoàn tiền';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund_status_history`
--

LOCK TABLES `refund_status_history` WRITE;
/*!40000 ALTER TABLE `refund_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `refund_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_settlement`
--

DROP TABLE IF EXISTS `seller_settlement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_settlement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `settlement_code` varchar(64) NOT NULL COMMENT 'Mã lô thanh toán, VD: SET20260419SHOP1',
  `shop_id` bigint NOT NULL COMMENT 'Tham chiếu ecommerce.shop.id',
  `period_from` date NOT NULL COMMENT 'Kỳ thanh toán từ',
  `period_to` date NOT NULL COMMENT 'Kỳ thanh toán đến',
  `gross_amount` bigint NOT NULL COMMENT 'Tổng tiền hàng chưa trừ phí',
  `platform_fee` bigint NOT NULL DEFAULT '0' COMMENT 'Phí nền tảng/hoa hồng (VND)',
  `shipping_subsidy` bigint NOT NULL DEFAULT '0' COMMENT 'Nền tảng hỗ trợ phí ship cho shop',
  `voucher_cost` bigint NOT NULL DEFAULT '0' COMMENT 'Chi phí voucher shop chịu',
  `adjustment_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Điều chỉnh thủ công (có thể âm)',
  `net_amount` bigint NOT NULL COMMENT 'Số tiền thực thanh toán cho shop',
  `currency` char(3) NOT NULL DEFAULT 'VND',
  `bank_account_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(30) DEFAULT NULL,
  `bank_code` varchar(20) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PROCESSING, PAID, ON_HOLD, CANCELLED',
  `on_hold_reason` varchar(500) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `bank_transfer_ref` varchar(128) DEFAULT NULL COMMENT 'Mã tham chiếu chuyển khoản',
  `processed_by` bigint DEFAULT NULL COMMENT 'Admin ID xử lý',
  `note` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settlement_code` (`settlement_code`),
  KEY `idx_settlement_shop` (`shop_id`,`status`),
  KEY `idx_settlement_period` (`period_from`,`period_to`),
  KEY `idx_settlement_status` (`status`,`created_at`),
  CONSTRAINT `seller_settlement_chk_1` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'PROCESSING',_utf8mb4'PAID',_utf8mb4'ON_HOLD',_utf8mb4'CANCELLED'))),
  CONSTRAINT `seller_settlement_chk_2` CHECK ((`net_amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lô thanh toán tiền hàng cho shop';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_settlement`
--

LOCK TABLES `seller_settlement` WRITE;
/*!40000 ALTER TABLE `seller_settlement` DISABLE KEYS */;
/*!40000 ALTER TABLE `seller_settlement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_settlement_item`
--

DROP TABLE IF EXISTS `seller_settlement_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_settlement_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `settlement_id` bigint NOT NULL,
  `transaction_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `order_number` varchar(64) NOT NULL,
  `item_type` varchar(20) NOT NULL COMMENT 'SALE, REFUND, ADJUSTMENT',
  `gross_amount` bigint NOT NULL,
  `platform_fee` bigint NOT NULL DEFAULT '0',
  `voucher_cost` bigint NOT NULL DEFAULT '0',
  `net_amount` bigint NOT NULL,
  `order_paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_settlement_item_set` (`settlement_id`),
  KEY `idx_settlement_item_txn` (`transaction_id`),
  KEY `idx_settlement_item_order` (`order_id`),
  CONSTRAINT `fk_settlement_item_settlement` FOREIGN KEY (`settlement_id`) REFERENCES `seller_settlement` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_settlement_item_txn` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`),
  CONSTRAINT `seller_settlement_item_chk_1` CHECK ((`item_type` in (_utf8mb4'SALE',_utf8mb4'REFUND',_utf8mb4'ADJUSTMENT')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chi tiết đơn hàng trong lô thanh toán shop';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_settlement_item`
--

LOCK TABLES `seller_settlement_item` WRITE;
/*!40000 ALTER TABLE `seller_settlement_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `seller_settlement_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_transaction`
--

DROP TABLE IF EXISTS `wallet_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_transaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `wallet_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `txn_type` varchar(30) NOT NULL COMMENT 'CREDIT, DEBIT, LOCK, UNLOCK, REFUND_CREDIT, CASHBACK, EXPIRE',
  `amount` bigint NOT NULL COMMENT 'Số tiền biến động (luôn dương)',
  `balance_before` bigint NOT NULL COMMENT 'Số dư trước khi biến động',
  `balance_after` bigint NOT NULL COMMENT 'Số dư sau khi biến động',
  `ref_type` varchar(30) DEFAULT NULL COMMENT 'PAYMENT, REFUND, PROMOTION, MANUAL',
  `ref_id` bigint DEFAULT NULL COMMENT 'ID của transaction/refund liên quan',
  `description` varchar(255) DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL COMMENT 'Nếu là cashback có thời hạn',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_txn_wallet` (`wallet_id`,`created_at`),
  KEY `idx_wallet_txn_user` (`user_id`,`created_at`),
  KEY `idx_wallet_txn_ref` (`ref_type`,`ref_id`),
  CONSTRAINT `fk_wallet_txn_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `payment_wallet` (`id`),
  CONSTRAINT `wallet_transaction_chk_1` CHECK ((`txn_type` in (_utf8mb4'CREDIT',_utf8mb4'DEBIT',_utf8mb4'LOCK',_utf8mb4'UNLOCK',_utf8mb4'REFUND_CREDIT',_utf8mb4'CASHBACK',_utf8mb4'EXPIRE',_utf8mb4'ADJUSTMENT'))),
  CONSTRAINT `wallet_transaction_chk_2` CHECK ((`amount` > 0)),
  CONSTRAINT `wallet_transaction_chk_3` CHECK ((`balance_after` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử biến động ví điện tử';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_transaction`
--

LOCK TABLES `wallet_transaction` WRITE;
/*!40000 ALTER TABLE `wallet_transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallet_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'payment_db'
--

--
-- Dumping routines for database 'payment_db'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 11:22:12
