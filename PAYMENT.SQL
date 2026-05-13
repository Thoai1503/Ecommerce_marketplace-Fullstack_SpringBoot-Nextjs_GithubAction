-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 103.90.225.130    Database: payment_db
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `payment_revenue_snapshot`
--

DROP TABLE IF EXISTS `payment_revenue_snapshot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_revenue_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint NOT NULL COMMENT 'Tham chiếu payment_transaction.id (status SUCCESS)',
  `txn_code` varchar(64) NOT NULL,
  `txn_type` varchar(30) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'VND',
  `recognized_at` datetime NOT NULL COMMENT 'Thời điểm ghi nhận doanh thu (thường là completed_at)',
  `gross_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Giá trị gross của transaction hiện tại',
  `discount_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Giảm giá của transaction hiện tại',
  `fee_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Phí của transaction hiện tại',
  `net_amount` bigint NOT NULL DEFAULT '0' COMMENT 'Giá trị net của transaction hiện tại',
  `cumulative_success_count` bigint NOT NULL COMMENT 'Tổng số transaction SUCCESS cộng dồn',
  `cumulative_gross_amount` bigint NOT NULL COMMENT 'Tổng gross cộng dồn',
  `cumulative_discount_amount` bigint NOT NULL COMMENT 'Tổng discount cộng dồn',
  `cumulative_fee_amount` bigint NOT NULL COMMENT 'Tổng fee cộng dồn',
  `cumulative_net_amount` bigint NOT NULL COMMENT 'Tổng net cộng dồn',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_revenue_snapshot_txn` (`transaction_id`),
  UNIQUE KEY `uk_revenue_snapshot_txn_code` (`txn_code`),
  KEY `idx_revenue_recognized_at` (`recognized_at`),
  KEY `idx_revenue_txn_type_time` (`txn_type`,`recognized_at`),
  KEY `idx_revenue_cumulative_net` (`cumulative_net_amount`),
  CONSTRAINT `fk_revenue_snapshot_txn` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_revenue_snapshot_chk_1` CHECK ((`currency` = _utf8mb4'VND')),
  CONSTRAINT `payment_revenue_snapshot_chk_10` CHECK ((`cumulative_net_amount` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_2` CHECK ((`gross_amount` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_3` CHECK ((`discount_amount` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_4` CHECK ((`fee_amount` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_5` CHECK ((`net_amount` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_6` CHECK ((`cumulative_success_count` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_7` CHECK ((`cumulative_gross_amount` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_8` CHECK ((`cumulative_discount_amount` >= 0)),
  CONSTRAINT `payment_revenue_snapshot_chk_9` CHECK ((`cumulative_fee_amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Snapshot doanh thu cộng dồn theo từng giao dịch SUCCESS';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_revenue_snapshot`
--

LOCK TABLES `payment_revenue_snapshot` WRITE;
/*!40000 ALTER TABLE `payment_revenue_snapshot` DISABLE KEYS */;
INSERT INTO `payment_revenue_snapshot` VALUES (1,9001,'TXN-ORD-20260424-9001','ORDER_PAYMENT','VND','2026-04-24 09:00:00',500000,20000,10000,470000,1,500000,20000,10000,470000,'2026-04-24 04:17:26'),(2,9002,'TXN-ORD-20260424-9002','ORDER_PAYMENT','VND','2026-04-24 09:15:00',1200000,50000,15000,1135000,2,1700000,70000,25000,1605000,'2026-04-24 04:17:26'),(3,9003,'TXN-ORD-20260424-9003','ORDER_PAYMENT','VND','2026-04-24 09:30:00',800000,0,12000,788000,3,2500000,70000,37000,2393000,'2026-04-24 04:17:26'),(4,9004,'571-1777005310568119901','ORDER_PAYMENT','VND','2026-04-24 04:35:39',453190,0,0,453190,4,2953190,70000,37000,2846190,'2026-04-24 04:35:39'),(5,9005,'573-1777035316784318603','ORDER_PAYMENT','VND','2026-04-24 12:56:19',20500,0,0,20500,4,2520500,70000,37000,2413500,'2026-04-24 12:56:19'),(6,9006,'589-1777043022685294914','ORDER_PAYMENT','VND','2026-04-24 15:04:34',4196500,0,0,4196500,5,6717000,70000,37000,6610000,'2026-04-24 15:04:34'),(7,9007,'594-1777165215600831484','ORDER_PAYMENT','VND','2026-04-26 01:01:37',27015500,0,0,27015500,6,33732500,70000,37000,33625500,'2026-04-26 01:01:37'),(8,9008,'595-1777166217857112991','ORDER_PAYMENT','VND','2026-04-26 01:17:44',453710,0,0,453710,7,34186210,70000,37000,34079210,'2026-04-26 01:17:44'),(9,9010,'637-1777544908678568493','ORDER_PAYMENT','VND','2026-04-30 10:29:12',5459000,0,0,5459000,8,39645210,70000,37000,39538210,'2026-04-30 10:29:12'),(10,9011,'640-1777697698982149975','ORDER_PAYMENT','VND','2026-05-02 04:55:53',439190,0,0,439190,9,40084400,70000,37000,39977400,'2026-05-02 04:55:53'),(11,9012,'641-1777700767738638219','ORDER_PAYMENT','VND','2026-05-02 05:47:31',8444000,0,0,8444000,10,48528400,70000,37000,48421400,'2026-05-02 05:47:31'),(12,9013,'642-1777700912620500768','ORDER_PAYMENT','VND','2026-05-02 05:58:15',4254000,0,0,4254000,11,52782400,70000,37000,52675400,'2026-05-02 05:58:15'),(13,9014,'643-1777702560208812498','ORDER_PAYMENT','VND','2026-05-02 06:17:27',304000,0,0,304000,12,53086400,70000,37000,52979400,'2026-05-02 06:17:27'),(14,9015,'644-1777718265368839156','ORDER_PAYMENT','VND','2026-05-02 10:39:22',7816000,0,0,7816000,13,60902400,70000,37000,60795400,'2026-05-02 10:39:22');
/*!40000 ALTER TABLE `payment_revenue_snapshot` ENABLE KEYS */;
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
  UNIQUE KEY uniq_txn_status (`transaction_id`, `to_status`, `changed_by`, `actor_id`, `reason`, `created_at`),
  KEY `idx_txn_status_history` (`transaction_id`,`created_at`),
  CONSTRAINT `fk_status_history_txn` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử trạng thái giao dịch thanh toán';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_status_history`
--

LOCK TABLES `payment_status_history` WRITE;
/*!40000 ALTER TABLE `payment_status_history` DISABLE KEYS */;
INSERT INTO `payment_status_history` VALUES (1,1,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-20 12:25:16'),(2,2,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-20 14:43:22'),(3,3,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-20 14:47:17'),(4,4,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-20 14:50:56'),(5,6,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-20 19:34:12'),(6,7,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-21 13:21:28'),(7,8,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-21 15:13:15'),(8,9,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-21 15:29:41'),(9,10,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-21 17:27:32'),(10,11,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-21 18:47:56'),(11,12,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-21 18:58:51'),(12,13,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-21 18:59:52'),(13,15,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-21 19:54:31'),(14,16,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-21 21:34:36'),(15,17,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 10:17:28'),(16,18,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 10:52:46'),(17,19,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 11:14:56'),(18,20,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 13:16:56'),(19,21,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 13:45:35'),(20,22,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 15:24:50'),(21,23,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 15:30:48'),(22,24,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 15:36:22'),(23,25,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 17:11:40'),(24,26,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 17:21:20'),(25,27,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 17:26:35'),(26,28,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 17:29:46'),(27,29,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 18:26:22'),(28,30,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 18:29:37'),(29,31,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 19:46:13'),(30,32,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 19:52:22'),(31,33,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 20:27:38'),(32,34,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 20:29:23'),(33,35,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 20:46:54'),(34,36,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 20:48:30'),(35,37,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 20:50:12'),(36,38,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-22 20:51:56'),(37,39,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 21:51:01'),(38,40,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-22 21:53:30'),(39,41,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-23 11:44:20'),(40,42,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-23 12:43:53'),(41,43,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-23 18:03:06'),(42,44,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-23 20:32:10'),(43,36,'FAILED','CANCELLED','ADMIN',NULL,NULL,NULL,'2026-04-23 21:29:53'),(44,45,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-23 22:14:36'),(45,46,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-23 22:25:47'),(46,47,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-23 22:42:59'),(47,48,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-23 22:45:43'),(48,9004,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-24 11:35:40'),(49,9005,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-24 19:56:20'),(50,9006,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-24 22:04:34'),(51,9007,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-26 08:01:38'),(52,9008,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-26 08:17:45'),(53,9009,'PENDING','FAILED','SYSTEM',0,'VNPay callback code=24',NULL,'2026-04-28 14:42:58'),(54,9010,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-04-30 17:29:12'),(55,9011,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-05-02 11:55:53'),(56,9012,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-05-02 12:47:32'),(57,9013,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-05-02 12:58:15'),(58,9014,NULL,'PROCESSING','SYSTEM',0,'Transaction created with status: PROCESSING',NULL,'2026-05-02 13:16:00'),(59,9014,'PROCESSING','PENDING','SYSTEM',NULL,'Status changed to: PENDING','{\"net_amount\": 304000, \"completed_at\": null, \"gateway_code\": \"VNPAY\", \"gateway_txn_id\": null, \"payment_method\": \"VNPAY\", \"gateway_response_msg\": \"PAYMENT_URL_CREATED\", \"gateway_response_code\": null}','2026-05-02 06:16:00'),(60,9014,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-05-02 13:17:27'),(61,9014,'PENDING','SUCCESS','SYSTEM',NULL,'Payment successful. Gateway response: N/A','{\"net_amount\": 304000, \"completed_at\": null, \"gateway_code\": \"VNPAY\", \"gateway_txn_id\": null, \"payment_method\": \"VNPAY\", \"gateway_response_msg\": \"PAYMENT_URL_CREATED\", \"gateway_response_code\": null}','2026-05-02 06:17:27'),(62,9015,NULL,'PROCESSING','SYSTEM',0,'Transaction created with status: PROCESSING',NULL,'2026-05-02 17:37:45'),(63,9015,'PROCESSING','PENDING','SYSTEM',NULL,'Status changed to: PENDING','{\"net_amount\": 7816000, \"completed_at\": null, \"gateway_code\": \"VNPAY\", \"gateway_txn_id\": null, \"payment_method\": \"VNPAY\", \"gateway_response_msg\": \"PAYMENT_URL_CREATED\", \"gateway_response_code\": null}','2026-05-02 10:37:45'),(64,9015,'PENDING','SUCCESS','SYSTEM',0,'VNPay callback code=00',NULL,'2026-05-02 17:39:22'),(65,9015,'PENDING','SUCCESS','SYSTEM',NULL,'Payment successful. Gateway response: N/A','{\"net_amount\": 7816000, \"completed_at\": null, \"gateway_code\": \"VNPAY\", \"gateway_txn_id\": null, \"payment_method\": \"VNPAY\", \"gateway_response_msg\": \"PAYMENT_URL_CREATED\", \"gateway_response_code\": null}','2026-05-02 10:39:22');
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
) ENGINE=InnoDB AUTO_INCREMENT=9016 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng giao dịch tổng quát: đơn hàng, nạp ví, rút ví, thanh toán shop, hoàn tiền, phí nền tảng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transaction`
--

LOCK TABLES `payment_transaction` WRITE;
/*!40000 ALTER TABLE `payment_transaction` DISABLE KEYS */;
INSERT INTO `payment_transaction` VALUES (1,'499-1776662598511385174','ORDER_PAYMENT','ORDER',499,NULL,NULL,NULL,NULL,NULL,499,NULL,NULL,5235710,0,0,5235710,'VND','VNPAY','VNPAY','15504307','499','499-1776662598511385174','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=523571000&vnp_Command=pay&vnp_CreateDate=20260420122318&vnp_CurrCode=VND&vnp_ExpireDate=20260420123818&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800143A3EA73&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8082%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=499-1776662598511385174&vnp_Version=2.1.0&vnp_SecureHash=831d0cc927b6ed6dec02b69c17ed51c1edf3b5b96c8afe6189fdf9d1db7876033d152d890076c174b1d9c4b2276808f87147ad5c5942f2b89856e19dd7e1ffe9','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-20 12:38:18','2026-04-20 12:25:16','2026-04-20 12:25:16','2026-04-20 12:23:18','2026-04-20 12:25:16','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(2,'501-1776670883250133879','ORDER_PAYMENT','ORDER',501,NULL,NULL,NULL,NULL,NULL,501,NULL,NULL,453710,0,0,453710,'VND','VNPAY','VNPAY','15504532','501','501-1776670883250133879','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45371000&vnp_Command=pay&vnp_CreateDate=20260420144123&vnp_CurrCode=VND&vnp_ExpireDate=20260420145623&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180014D52F495&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8082%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=501-1776670883250133879&vnp_Version=2.1.0&vnp_SecureHash=82217198c478c1b817f9096a450af0df2df0eebe6e7d6bf0002b1568d3b2111d5273767adaa3778dfb66ceb46659ec4d81df5d1c686c432cdc3ad4874e62bbf4','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-20 14:56:23','2026-04-20 14:43:22','2026-04-20 14:43:22','2026-04-20 14:41:23','2026-04-20 14:43:22','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(3,'502-1776671201288563509','ORDER_PAYMENT','ORDER',502,NULL,NULL,NULL,NULL,NULL,502,NULL,NULL,478710,0,0,478710,'VND','VNPAY','VNPAY','15504546','502','502-1776671201288563509','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=47871000&vnp_Command=pay&vnp_CreateDate=20260420144641&vnp_CurrCode=VND&vnp_ExpireDate=20260420150141&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180015494F57A&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8082%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=502-1776671201288563509&vnp_Version=2.1.0&vnp_SecureHash=3dbc753447c49e9fdf633e405c4012fa45a5d8046b6a258a1bf73131765cbeea9eff9b879825d4db41e8a4eadb5b6e15b954be5c5464f3a8322af89ee9699727','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-20 15:01:41','2026-04-20 14:47:17','2026-04-20 14:47:17','2026-04-20 14:46:41','2026-04-20 14:47:17','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(4,'503-1776671419893504108','ORDER_PAYMENT','ORDER',503,NULL,NULL,NULL,NULL,NULL,503,NULL,NULL,249000,0,0,249000,'VND','VNPAY','VNPAY','15504566','503','503-1776671419893504108','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=24900000&vnp_Command=pay&vnp_CreateDate=20260420145019&vnp_CurrCode=VND&vnp_ExpireDate=20260420150519&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001E93EF8E7&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8082%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=503-1776671419893504108&vnp_Version=2.1.0&vnp_SecureHash=b11be26cdcd100475dcd64d93bfecc1130b55a0486893714bf2808e5cc36c2cd422b943aa9bc17edb6c8efbb5a36e21254332837441a1c9896440324ca1f6284','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-20 15:05:19','2026-04-20 14:50:56','2026-04-20 14:50:56','2026-04-20 14:50:20','2026-04-20 14:50:56','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(5,'514-1776686886831976995','ORDER_PAYMENT','ORDER',514,NULL,NULL,NULL,NULL,NULL,514,NULL,NULL,52210,0,0,52210,'VND','VNPAY','VNPAY',NULL,'514','514-1776686886831976995',NULL,'PAYMENT_URL_CREATED','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=5221000&vnp_Command=pay&vnp_CreateDate=20260420190806&vnp_CurrCode=VND&vnp_ExpireDate=20260420192306&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001766CEA7E&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8082%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=514-1776686886831976995&vnp_Version=2.1.0&vnp_SecureHash=fc650ccaa45c7a2fc0d7ffb6c31d0709dc8d514036fc4edfd69b4c91ab73a3d0a15103e7e6de04cec52ff7eaafad9a0d12b0a92deb3de45db9a889ec7b767f62',NULL,NULL,NULL,NULL,'PENDING',NULL,'2026-04-20 19:23:06',NULL,NULL,'2026-04-20 19:08:07','2026-04-20 19:08:07','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(6,'520-1776688411528139210','ORDER_PAYMENT','ORDER',520,NULL,NULL,NULL,NULL,NULL,520,NULL,NULL,27828210,0,0,27828210,'VND','VNPAY','VNPAY','15505161','520','520-1776688411528139210','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2782821000&vnp_Command=pay&vnp_CreateDate=20260420193331&vnp_CurrCode=VND&vnp_ExpireDate=20260420194831&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001C42BE7CA&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=520-1776688411528139210&vnp_Version=2.1.0&vnp_SecureHash=fba0081b7248ddf99c88c189b5502a32a56253cd3e49d710954318532715772c0c5528e905a49874b3442f189316682c95084ee72516ecea10e2f9e1396bc98e','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-20 19:48:31','2026-04-20 19:34:12','2026-04-20 19:34:12','2026-04-20 19:33:31','2026-04-20 19:34:12','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(7,'521-1776752409672616686','ORDER_PAYMENT','ORDER',521,NULL,NULL,NULL,NULL,NULL,521,NULL,NULL,31572000,0,0,31572000,'VND','VNPAY','VNPAY','15506191','521','521-1776752409672616686','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=3157200000&vnp_Command=pay&vnp_CreateDate=20260421132009&vnp_CurrCode=VND&vnp_ExpireDate=20260421133509&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180016E71808A&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=521-1776752409672616686&vnp_Version=2.1.0&vnp_SecureHash=68a96378fe688201e0c12c714da21586887454b4173c88571dcbc04c46521a8e0bd22ffd6c8d1dfed0041c48612a886741424ae432fc0af80bcf4d45bc914f8a','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-21 13:35:09','2026-04-21 13:21:28','2026-04-21 13:21:28','2026-04-21 13:20:09','2026-04-21 13:21:28','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(8,'525-1776759162084487016','ORDER_PAYMENT','ORDER',525,NULL,NULL,NULL,NULL,NULL,525,NULL,NULL,18773000,0,0,18773000,'VND','VNPAY','VNPAY','15506527','525','525-1776759162084487016','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1877300000&vnp_Command=pay&vnp_CreateDate=20260421151242&vnp_CurrCode=VND&vnp_ExpireDate=20260421152742&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001A7F1F879&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=525-1776759162084487016&vnp_Version=2.1.0&vnp_SecureHash=d41e1731128d15022204ae6bc73fad5d543bb2ad43dddf8c01d04e6e6f2fedfd567abe089f8fee99f20115d18ac976cb7fa46546a3f6a3bfababe3c3368e8de9','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-21 15:27:42','2026-04-21 15:13:15','2026-04-21 15:13:15','2026-04-21 15:12:42','2026-04-21 15:13:15','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9,'527-1776760125685300909','ORDER_PAYMENT','ORDER',527,NULL,NULL,NULL,NULL,NULL,527,NULL,NULL,65190,0,0,65190,'VND','VNPAY','VNPAY','15506575','527','527-1776760125685300909','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=6519000&vnp_Command=pay&vnp_CreateDate=20260421152845&vnp_CurrCode=VND&vnp_ExpireDate=20260421154345&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001366B79EA&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=527-1776760125685300909&vnp_Version=2.1.0&vnp_SecureHash=d90b7b9f717e29c4a370b750fbb6cded31819b479128256af2b230a20c8525b19249445ea7f69c44120f0e5cf04b70ad6aacb346791681dde562888eef82b433','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-21 15:43:45','2026-04-21 15:29:41','2026-04-21 15:29:41','2026-04-21 15:28:46','2026-04-21 15:29:41','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(10,'528-1776767191712310135','ORDER_PAYMENT','ORDER',528,NULL,NULL,NULL,NULL,NULL,528,NULL,NULL,204190,0,0,204190,'VND','VNPAY','VNPAY','15506924','528','528-1776767191712310135','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=20419000&vnp_Command=pay&vnp_CreateDate=20260421172631&vnp_CurrCode=VND&vnp_ExpireDate=20260421174131&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180016E99F5ED&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=528-1776767191712310135&vnp_Version=2.1.0&vnp_SecureHash=9c853cf00c0c6399335775ff50ea702e9d16db52cbc3a34229d3314e57b2a98d387b0776ecdbdc58ae5f0938261ec0a6999e69ef75681c47821651a4664bcf94','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-21 17:41:31','2026-04-21 17:27:32','2026-04-21 17:27:32','2026-04-21 17:26:32','2026-04-21 17:27:32','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(11,'529-1776772024618732738','ORDER_PAYMENT','ORDER',529,NULL,NULL,NULL,NULL,NULL,529,NULL,NULL,2804000,0,0,2804000,'VND','VNPAY','VNPAY','15507032','529','529-1776772024618732738','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=280400000&vnp_Command=pay&vnp_CreateDate=20260421184704&vnp_CurrCode=VND&vnp_ExpireDate=20260421190204&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800124A07C04&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=529-1776772024618732738&vnp_Version=2.1.0&vnp_SecureHash=35e97f06d2cf5937dfa422dce1320048b517ea87e0019363f40ee701d8cac264431d6dafc84afc676e00e489b514ae8fd07c7157d078b254a66602303e3693cf','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-21 19:02:04','2026-04-21 18:47:56','2026-04-21 18:47:56','2026-04-21 18:47:05','2026-04-21 18:47:56','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(12,'530-1776772691744576378','ORDER_PAYMENT','ORDER',530,NULL,NULL,NULL,NULL,NULL,530,NULL,NULL,4768000,0,0,4768000,'VND','VNPAY','VNPAY','15507038','530','530-1776772691744576378','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=476800000&vnp_Command=pay&vnp_CreateDate=20260421185811&vnp_CurrCode=VND&vnp_ExpireDate=20260421191311&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001D57E460F&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=530-1776772691744576378&vnp_Version=2.1.0&vnp_SecureHash=81996c0c832fb9838b040ee30ad3fe907900125c3e452c0461be74432960448f00071b3b1b88987e6dbcb9002a0a7d1cd7f1643c8f7fa0dd6e1f196192e69882','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-21 19:13:11','2026-04-21 18:58:51','2026-04-21 18:58:51','2026-04-21 18:58:12','2026-04-21 18:58:51','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(13,'531-1776772786088330325','ORDER_PAYMENT','ORDER',531,NULL,NULL,NULL,NULL,NULL,531,NULL,NULL,26810500,0,0,26810500,'VND','VNPAY','VNPAY','0','531','531-1776772786088330325','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2681050000&vnp_Command=pay&vnp_CreateDate=20260421185946&vnp_CurrCode=VND&vnp_ExpireDate=20260421191446&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180011D5E13C8&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=531-1776772786088330325&vnp_Version=2.1.0&vnp_SecureHash=748c2931d41860b84db18c93dfdfe5c8d546d6d89e8cfba5feba07f337fe072d790490ff126e2d25a06739048bba3851f179c64585a2ad868684915421b8cfff','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-21 19:14:46',NULL,NULL,'2026-04-21 18:59:46','2026-04-21 18:59:52','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(14,'532-1776775512025107701','ORDER_PAYMENT','ORDER',532,NULL,NULL,NULL,NULL,NULL,532,NULL,NULL,64967000,0,0,64967000,'VND','VNPAY','VNPAY',NULL,'532','532-1776775512025107701',NULL,'PAYMENT_URL_CREATED','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=6496700000&vnp_Command=pay&vnp_CreateDate=20260421194512&vnp_CurrCode=VND&vnp_ExpireDate=20260421200012&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180015DDA5B15&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=532-1776775512025107701&vnp_Version=2.1.0&vnp_SecureHash=81dd9ea6dc5d331d9f9c072c9b3a6ee2fb8f52b9fdb9f9b42e18981c9b89857a86097ace4035e8e27ef9803c3f891beaf2c038242a1af9c0997e227f88575bae',NULL,NULL,NULL,NULL,'PENDING',NULL,'2026-04-21 20:00:12',NULL,NULL,'2026-04-21 19:45:11','2026-04-21 19:45:12','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(15,'533-1776776000089939105','ORDER_PAYMENT','ORDER',533,NULL,NULL,NULL,NULL,NULL,533,NULL,NULL,11387000,0,0,11387000,'VND','VNPAY','VNPAY','15507071','533','533-1776776000089939105','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1138700000&vnp_Command=pay&vnp_CreateDate=20260421195320&vnp_CurrCode=VND&vnp_ExpireDate=20260421200820&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180019E38AD0E&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=533-1776776000089939105&vnp_Version=2.1.0&vnp_SecureHash=be3ab52ba5d3ce19f112231908477b724874d5fcc16e462c2985effd79715a39e6bab8a7031761c996443c5b563875cc9fa0fe329a5f32025ffa01f6096f54bd','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-21 20:08:20','2026-04-21 19:54:31','2026-04-21 19:54:31','2026-04-21 19:53:20','2026-04-21 19:54:31','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(16,'534-1776782012002123343','ORDER_PAYMENT','ORDER',534,NULL,NULL,NULL,NULL,NULL,534,NULL,NULL,8190,0,0,8190,'VND','VNPAY','VNPAY','15507158','534','534-1776782012002123343','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=819000&vnp_Command=pay&vnp_CreateDate=20260421213332&vnp_CurrCode=VND&vnp_ExpireDate=20260421214832&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001880441FE&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=534-1776782012002123343&vnp_Version=2.1.0&vnp_SecureHash=716cea9cba994785e43681d709872e1493b7f578edc19a3943a7912ad5b5c16147f5e341677a8b43e30cadeb787f951afc0e1bf985155ed733689b61e46ea1b0','NCB',NULL,NULL,'ATM','FAILED','VNPay response code: 24','2026-04-21 21:48:32',NULL,NULL,'2026-04-21 21:33:32','2026-04-21 21:34:36','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(17,'536-1776827824013161309','ORDER_PAYMENT','ORDER',536,NULL,NULL,NULL,NULL,NULL,536,NULL,NULL,17212000,0,0,17212000,'VND','VNPAY','VNPAY','0','536','536-1776827824013161309','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1721200000&vnp_Command=pay&vnp_CreateDate=20260422101704&vnp_CurrCode=VND&vnp_ExpireDate=20260422103204&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180011D82FFA0&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=536-1776827824013161309&vnp_Version=2.1.0&vnp_SecureHash=a7d41bac43d573eaa65d5cd5d32a7a5ede55f6e5fcd94146a351acefcafa541c1e965253c94eb1652e51c2cfddd771af0a8b123976a3006491b497f0a1fc56cb','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 10:32:04',NULL,NULL,'2026-04-22 10:17:04','2026-04-22 10:17:28','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(18,'537-1776829921272592537','ORDER_PAYMENT','ORDER',537,NULL,NULL,NULL,NULL,NULL,537,NULL,NULL,642190,0,0,642190,'VND','VNPAY','VNPAY','15507931','537','537-1776829921272592537','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=64219000&vnp_Command=pay&vnp_CreateDate=20260422105201&vnp_CurrCode=VND&vnp_ExpireDate=20260422110701&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800103B4AB04&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=537-1776829921272592537&vnp_Version=2.1.0&vnp_SecureHash=1d9eb23e55fdc4cfc3db2422946b1fff3718cb0f1a8fea90b78724158ff750da36f3703bd097251064145a900456ccee5b0edfe89ce1b44412975a3559e21762','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 11:07:01','2026-04-22 10:52:46','2026-04-22 10:52:46','2026-04-22 10:52:01','2026-04-22 10:52:46','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(19,'538-1776831245390449232','ORDER_PAYMENT','ORDER',538,NULL,NULL,NULL,NULL,NULL,538,NULL,NULL,9604000,0,0,9604000,'VND','VNPAY','VNPAY','15507983','538','538-1776831245390449232','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=960400000&vnp_Command=pay&vnp_CreateDate=20260422111405&vnp_CurrCode=VND&vnp_ExpireDate=20260422112905&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001504B2E15&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=538-1776831245390449232&vnp_Version=2.1.0&vnp_SecureHash=84343f0c1197df8234e8cbc4cc62b6d25bbe9f89681f6b5ebdeebd23dfae0a8ee486be15a6f4163db1dd2c6e8a8d0f845de608a9b9c6ef9224be8860feb352ba','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 11:29:05','2026-04-22 11:14:56','2026-04-22 11:14:56','2026-04-22 11:14:05','2026-04-22 11:14:56','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(20,'540-1776838505503561471','ORDER_PAYMENT','ORDER',540,NULL,NULL,NULL,NULL,NULL,540,NULL,NULL,16963000,0,0,16963000,'VND','VNPAY','VNPAY','15508158','540','540-1776838505503561471','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1696300000&vnp_Command=pay&vnp_CreateDate=20260422131505&vnp_CurrCode=VND&vnp_ExpireDate=20260422133005&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800189945F31&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=540-1776838505503561471&vnp_Version=2.1.0&vnp_SecureHash=c14dab4f7b922129d61d3e67aad686c1e6a768d1a2a6c1565a95809d949f4ec25a1fa8cab8a26c2f8e0cfc39ab75211bd2985557b643bd58ce32dd423e5296d1','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 13:30:05','2026-04-22 13:16:56','2026-04-22 13:16:56','2026-04-22 13:15:05','2026-04-22 13:16:56','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(21,'541-1776840263683845557','ORDER_PAYMENT','ORDER',541,NULL,NULL,NULL,NULL,NULL,541,NULL,NULL,2428000,0,0,2428000,'VND','VNPAY','VNPAY','15508217','541','541-1776840263683845557','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=242800000&vnp_Command=pay&vnp_CreateDate=20260422134423&vnp_CurrCode=VND&vnp_ExpireDate=20260422135923&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001F5559073&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=541-1776840263683845557&vnp_Version=2.1.0&vnp_SecureHash=9a173039f5078f8d45b16f53619e443953eac3adc70e0b09d6f5fec9bce57ba1b2112f7bf0575bf086fdf5481d12b5ee6ea303bd77438fb995a27e88ef1c0b41','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 13:59:23','2026-04-22 13:45:35','2026-04-22 13:45:35','2026-04-22 13:44:23','2026-04-22 13:45:35','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(22,'542-1776846246054319605','ORDER_PAYMENT','ORDER',542,NULL,NULL,NULL,NULL,NULL,542,NULL,NULL,2791190,0,0,2791190,'VND','VNPAY','VNPAY','15508517','542','542-1776846246054319605','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=279119000&vnp_Command=pay&vnp_CreateDate=20260422152406&vnp_CurrCode=VND&vnp_ExpireDate=20260422153906&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180014F9FF2C0&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=542-1776846246054319605&vnp_Version=2.1.0&vnp_SecureHash=7b04d08a1f585284ba9d16bfbb49619d2e9823eaf175e5b61ccdeddbcc6005335f137d2dca58984810080e9fc879002f09eb77227a7c8eec2499f005a6871cee','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 15:39:06','2026-04-22 15:24:50','2026-04-22 15:24:50','2026-04-22 15:24:06','2026-04-22 15:24:50','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(23,'543-1776846619256344318','ORDER_PAYMENT','ORDER',543,NULL,NULL,NULL,NULL,NULL,543,NULL,NULL,3039000,0,0,3039000,'VND','VNPAY','VNPAY','15508534','543','543-1776846619256344318','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=303900000&vnp_Command=pay&vnp_CreateDate=20260422153019&vnp_CurrCode=VND&vnp_ExpireDate=20260422154519&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800161461784&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=543-1776846619256344318&vnp_Version=2.1.0&vnp_SecureHash=2a1c296ac792a5ffce10e7a172bb672d438720c6fbede571cbeba457faa5322d3684e574baf0ca3a13f6eb2e1e0e2c728a193ff51da75dba9203bb0454a70da8','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 15:45:19','2026-04-22 15:30:48','2026-04-22 15:30:48','2026-04-22 15:30:19','2026-04-22 15:30:48','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(24,'544-1776846911286763172','ORDER_PAYMENT','ORDER',544,NULL,NULL,NULL,NULL,NULL,544,NULL,NULL,21171000,0,0,21171000,'VND','VNPAY','VNPAY','0','544','544-1776846911286763172','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2117100000&vnp_Command=pay&vnp_CreateDate=20260422153511&vnp_CurrCode=VND&vnp_ExpireDate=20260422155011&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800140846CA4&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=544-1776846911286763172&vnp_Version=2.1.0&vnp_SecureHash=bccaddac95e9140a9d806123a2613ddba8b54f1f1b28e414d8ced275fae530a317a61d49bc4dbc5cdf977ac9ffc7b74bd7a9eb8fe4df362452f7ca60400f6a40','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 15:50:11',NULL,NULL,'2026-04-22 15:35:11','2026-04-22 15:36:22','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(25,'545-1776852409999562427','ORDER_PAYMENT','ORDER',545,NULL,NULL,NULL,NULL,NULL,545,NULL,NULL,15190,0,0,15190,'VND','VNPAY','VNPAY','0','545','545-1776852409999562427','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1519000&vnp_Command=pay&vnp_CreateDate=20260422170650&vnp_CurrCode=VND&vnp_ExpireDate=20260422172150&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001D89757E2&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=545-1776852409999562427&vnp_Version=2.1.0&vnp_SecureHash=d483230576b45f463a8636ea7b451904abc85b212d543f8f0643c015218dbed9ef8867e21fdaea27044fdf591c10aa688ae67d25d99d997636ad6d2d1ced7bab','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 17:21:50',NULL,NULL,'2026-04-22 17:06:50','2026-04-22 17:11:40','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(26,'546-1776853271762304983','ORDER_PAYMENT','ORDER',546,NULL,NULL,NULL,NULL,NULL,546,NULL,NULL,452000,0,0,452000,'VND','VNPAY','VNPAY','0','546','546-1776853271762304983','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45200000&vnp_Command=pay&vnp_CreateDate=20260422172111&vnp_CurrCode=VND&vnp_ExpireDate=20260422173611&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180014ABEDCD5&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=546-1776853271762304983&vnp_Version=2.1.0&vnp_SecureHash=41562aca2ba65d94d3a96bf08ebba794f5025243e6e26b450938a142608bdcdae5e7385bdb1fa0e7957cd787a13168aa0e792313eae0ddb5aa601b22b42e7e45','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 17:36:11',NULL,NULL,'2026-04-22 17:21:12','2026-04-22 17:21:20','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(27,'547-1776853512479210106','ORDER_PAYMENT','ORDER',547,NULL,NULL,NULL,NULL,NULL,547,NULL,NULL,5628000,0,0,5628000,'VND','VNPAY','VNPAY','15508838','547','547-1776853512479210106','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=562800000&vnp_Command=pay&vnp_CreateDate=20260422172512&vnp_CurrCode=VND&vnp_ExpireDate=20260422174012&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001C765EEFC&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=547-1776853512479210106&vnp_Version=2.1.0&vnp_SecureHash=f17cea298dfe8b3febb03d8801bbbdad7420a3e21598168902f319672082454fd10177ca6d6579e850d3da5ddd172aaf59408720c4ce641f93469ea024f1b902','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 17:40:12','2026-04-22 17:26:35','2026-04-22 17:26:35','2026-04-22 17:25:12','2026-04-22 17:26:35','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(28,'548-1776853714309937237','ORDER_PAYMENT','ORDER',548,NULL,NULL,NULL,NULL,NULL,548,NULL,NULL,4204000,0,0,4204000,'VND','VNPAY','VNPAY','15508846','548','548-1776853714309937237','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=420400000&vnp_Command=pay&vnp_CreateDate=20260422172834&vnp_CurrCode=VND&vnp_ExpireDate=20260422174334&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180016F1639CC&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=548-1776853714309937237&vnp_Version=2.1.0&vnp_SecureHash=3ce64b7e59a25a6f97bf7307a1dbe220d1e513ea70d90eacd7ab52cfe7836760befffcb3e85072b7accc5345ae068b90d1364a7ed5648daf1a1d3ac9f1fef2ac','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 17:43:34','2026-04-22 17:29:46','2026-04-22 17:29:46','2026-04-22 17:28:34','2026-04-22 17:29:46','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(29,'550-1776856615586188552','ORDER_PAYMENT','ORDER',550,NULL,NULL,NULL,NULL,NULL,550,NULL,NULL,796500,0,0,796500,'VND','VNPAY','VNPAY','15508938','550','550-1776856615586188552','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=79650000&vnp_Command=pay&vnp_CreateDate=20260422181655&vnp_CurrCode=VND&vnp_ExpireDate=20260422183155&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180013B7E9468&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=550-1776856615586188552&vnp_Version=2.1.0&vnp_SecureHash=eed78eef1355e6d681c4a47b8c13a256a324df00b27b996897c838ce14b22c5a4b0e1cfedaefaed6cc74ea93fffbbcd303c004e7531350ff5f2f02c56a39f892','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 18:31:55','2026-04-22 18:26:22','2026-04-22 18:26:22','2026-04-22 18:16:56','2026-04-22 18:26:22','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(30,'551-1776857328629667360','ORDER_PAYMENT','ORDER',551,NULL,NULL,NULL,NULL,NULL,551,NULL,NULL,189000,0,0,189000,'VND','VNPAY','VNPAY','15508942','551','551-1776857328629667360','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=18900000&vnp_Command=pay&vnp_CreateDate=20260422182848&vnp_CurrCode=VND&vnp_ExpireDate=20260422184348&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180010DE0FE05&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=551-1776857328629667360&vnp_Version=2.1.0&vnp_SecureHash=50142c6ee9af613bcc50eff294beef31b47cd3cdd225b57a2297ca0e02d7c69877442b01f847980aa68b67a2c126d184e92104a86b66078951e5910db5021f83','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 18:43:48','2026-04-22 18:29:37','2026-04-22 18:29:37','2026-04-22 18:28:49','2026-04-22 18:29:37','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(31,'552-1776861913780389467','ORDER_PAYMENT','ORDER',552,NULL,NULL,NULL,NULL,NULL,552,NULL,NULL,1533000,0,0,1533000,'VND','VNPAY','VNPAY','15509034','552','552-1776861913780389467','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=153300000&vnp_Command=pay&vnp_CreateDate=20260422194513&vnp_CurrCode=VND&vnp_ExpireDate=20260422200013&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800142339408&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=552-1776861913780389467&vnp_Version=2.1.0&vnp_SecureHash=6b9a436e847d1f8ca4a1fb2350f233b1cf4e62846a26aa00cba1f13e6b15f5742d0e1ef7b195064ddfe8a294d9082a0efcb9d630088cf620e6d164a4fba5a19a','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 20:00:13','2026-04-22 19:46:13','2026-04-22 19:46:13','2026-04-22 19:45:14','2026-04-22 19:46:13','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(32,'553-1776862043365548628','ORDER_PAYMENT','ORDER',553,NULL,NULL,NULL,NULL,NULL,553,NULL,NULL,1533000,0,0,1533000,'VND','VNPAY','VNPAY','15509040','553','553-1776862043365548628','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=153300000&vnp_Command=pay&vnp_CreateDate=20260422194723&vnp_CurrCode=VND&vnp_ExpireDate=20260422200223&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001B8FB41BD&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=553-1776862043365548628&vnp_Version=2.1.0&vnp_SecureHash=64db4ef71bf0d1e65fd35398b831bb94b7d9f3fd655ac22dd3a60b397fc7b8e651f0ee73fdb58ed0efc4f775b59ffe1701df699366d9ae1694bef1d1d5a0622e','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 20:02:23','2026-04-22 19:52:22','2026-04-22 19:52:22','2026-04-22 19:47:23','2026-04-22 19:52:22','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(33,'554-1776864399581803274','ORDER_PAYMENT','ORDER',554,NULL,NULL,NULL,NULL,NULL,554,NULL,NULL,378000,0,0,378000,'VND','VNPAY','VNPAY','0','554','554-1776864399581803274','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=37800000&vnp_Command=pay&vnp_CreateDate=20260422202639&vnp_CurrCode=VND&vnp_ExpireDate=20260422204139&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001591470AA&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=554-1776864399581803274&vnp_Version=2.1.0&vnp_SecureHash=c4f5e63eb7f9ca6ab1ce231fa32f7dd6a7d9ab42374cfdac5d2a3f3ce7efd21e8c97d7712eaa6f11357252e1279486de668780a3d9dcdec5098a0feaa25b8d95','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 20:41:39',NULL,NULL,'2026-04-22 20:26:40','2026-04-22 20:27:38','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(34,'556-1776864544073156110','ORDER_PAYMENT','ORDER',556,NULL,NULL,NULL,NULL,NULL,556,NULL,NULL,438000,0,0,438000,'VND','VNPAY','VNPAY','0','556','556-1776864544073156110','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=43800000&vnp_Command=pay&vnp_CreateDate=20260422202904&vnp_CurrCode=VND&vnp_ExpireDate=20260422204404&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180012877445B&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=556-1776864544073156110&vnp_Version=2.1.0&vnp_SecureHash=3bed2b1f2798cbc7a7e7155d8afb75e1657d7219b5f2dc2fdab04f8c7407b3afcf54b77c412ef5d723b17182c08b24aebea73775be567cc195c98e6f0007a4e3','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 20:44:04',NULL,NULL,'2026-04-22 20:29:04','2026-04-22 20:29:23','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(35,'557-1776865500795857979','ORDER_PAYMENT','ORDER',557,NULL,NULL,NULL,NULL,NULL,557,NULL,NULL,189000,0,0,189000,'VND','VNPAY','VNPAY','0','557','557-1776865500795857979','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=18900000&vnp_Command=pay&vnp_CreateDate=20260422204500&vnp_CurrCode=VND&vnp_ExpireDate=20260422210000&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180010034D465&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=557-1776865500795857979&vnp_Version=2.1.0&vnp_SecureHash=ebdb00b66e57c8c976ab4e998990b26986c1c664b953dd4f2aa20bd20156deadea00075e797c8ea91ec7b0c61a174ea04807513969dcce6843d8a5f04b3619bf','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 21:00:00',NULL,NULL,'2026-04-22 20:45:01','2026-04-22 20:46:54','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(36,'558-1776865686898448883','ORDER_PAYMENT','ORDER',558,NULL,NULL,NULL,NULL,NULL,558,NULL,NULL,438000,0,0,438000,'VND','VNPAY','VNPAY','0','558','558-1776865686898448883','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=43800000&vnp_Command=pay&vnp_CreateDate=20260422204806&vnp_CurrCode=VND&vnp_ExpireDate=20260422210306&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001F2548BF1&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=558-1776865686898448883&vnp_Version=2.1.0&vnp_SecureHash=cebd93d6d01d08702f53175e34f50374bbed29a93013402e1d83f248a25b408b3c4994dbc7d503c41b247b68729b910c0321ada763ae1c026d623cb7db1f9d48','VNPAY',NULL,NULL,'QRCODE','CANCELLED','VNPay response code: 24','2026-04-22 21:03:06',NULL,NULL,'2026-04-22 20:48:07','2026-04-23 21:29:53','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(37,'559-1776865744904337682','ORDER_PAYMENT','ORDER',559,NULL,NULL,NULL,NULL,NULL,559,NULL,NULL,16760000,0,0,16760000,'VND','VNPAY','VNPAY','15509113','559','559-1776865744904337682','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1676000000&vnp_Command=pay&vnp_CreateDate=20260422204904&vnp_CurrCode=VND&vnp_ExpireDate=20260422210404&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180019415DE85&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=559-1776865744904337682&vnp_Version=2.1.0&vnp_SecureHash=16c3708dcb944ff21cff83d0fdede2648eade6829587a69a0470f8a701287525c4e5a123712a1fd166bdc40af340882c92e2dabdbc219c59d6af900b9600d03e','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 21:04:04','2026-04-22 20:50:12','2026-04-22 20:50:12','2026-04-22 20:49:05','2026-04-22 20:50:12','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(38,'560-1776865898994328170','ORDER_PAYMENT','ORDER',560,NULL,NULL,NULL,NULL,NULL,560,NULL,NULL,1190,0,0,1190,'VND','VNPAY','VNPAY','0','560','560-1776865898994328170','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=119000&vnp_Command=pay&vnp_CreateDate=20260422205138&vnp_CurrCode=VND&vnp_ExpireDate=20260422210638&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001D7741228&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=560-1776865898994328170&vnp_Version=2.1.0&vnp_SecureHash=417372619ef1a48341aef50b75c26dbe7f9a07ad3aa9c2a57402134e968d2e685c94c1b17bb0dfaf111873a78ce6f07714a62b88c96411a1bde32db1a5a4eade','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-22 21:06:38',NULL,NULL,'2026-04-22 20:51:39','2026-04-22 20:51:56','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(39,'561-1776869377696970338','ORDER_PAYMENT','ORDER',561,NULL,NULL,NULL,NULL,NULL,561,NULL,NULL,12570000,0,0,12570000,'VND','VNPAY','VNPAY','15509188','561','561-1776869377696970338','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1257000000&vnp_Command=pay&vnp_CreateDate=20260422214937&vnp_CurrCode=VND&vnp_ExpireDate=20260422220437&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800149818BF6&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=561-1776869377696970338&vnp_Version=2.1.0&vnp_SecureHash=f267918749245ae645e8fca4ae57ac6a8a4a96db2f6614a394795af63f484c38fa9cad3de46ae50b00668d40bea20546d8674e70f19d49068fcad7a599a8ef8d','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 22:04:37','2026-04-22 21:51:01','2026-04-22 21:51:01','2026-04-22 21:49:38','2026-04-22 21:51:01','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(40,'562-1776869539296389291','ORDER_PAYMENT','ORDER',562,NULL,NULL,NULL,NULL,NULL,562,NULL,NULL,12570000,0,0,12570000,'VND','VNPAY','VNPAY','15509192','562','562-1776869539296389291','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1257000000&vnp_Command=pay&vnp_CreateDate=20260422215219&vnp_CurrCode=VND&vnp_ExpireDate=20260422220719&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001D959650C&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=562-1776869539296389291&vnp_Version=2.1.0&vnp_SecureHash=12d71b18657231ce74a54003dde96b073dec431aaa48784e95484d8f726252a3306a51d8882f8fbf28b24600959dab059c259e970ddafe184f4bb23412976352','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-22 22:07:19','2026-04-22 21:53:30','2026-04-22 21:53:30','2026-04-22 21:52:19','2026-04-22 21:53:30','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(41,'563-1776919407475891841','ORDER_PAYMENT','ORDER',563,NULL,NULL,NULL,NULL,NULL,563,NULL,NULL,3039000,0,0,3039000,'VND','VNPAY','VNPAY','15510146','563','563-1776919407475891841','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=303900000&vnp_Command=pay&vnp_CreateDate=20260423114327&vnp_CurrCode=VND&vnp_ExpireDate=20260423115827&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180014593FF89&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=563-1776919407475891841&vnp_Version=2.1.0&vnp_SecureHash=7d3debf2d2fdb9765a30080267b17daa4c1cb93e93bff0ca6419645e4441cdbfdcf7f0d5a7757fac9ecc9cabbe266ce3c5113985ad29bd821cf95e276258ee5b','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-23 11:58:27','2026-04-23 11:44:20','2026-04-23 11:44:20','2026-04-23 11:43:27','2026-04-23 11:44:20','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(42,'564-1776922987772778430','ORDER_PAYMENT','ORDER',564,NULL,NULL,NULL,NULL,NULL,564,NULL,NULL,252500,0,0,252500,'VND','VNPAY','VNPAY','15510237','564','564-1776922987772778430','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=25250000&vnp_Command=pay&vnp_CreateDate=20260423124307&vnp_CurrCode=VND&vnp_ExpireDate=20260423125807&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001E9988282&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=564-1776922987772778430&vnp_Version=2.1.0&vnp_SecureHash=3661d598158eafbb3ec3db75b7d2703245d1ae394637c2b1c9f7bfdbf942069754f2f13d9b909b61ac18fa1f141abf958377dd2014f358874b1d4fd73858dcfb','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-23 12:58:07','2026-04-23 12:43:53','2026-04-23 12:43:53','2026-04-23 12:43:08','2026-04-23 12:43:53','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(43,'565-1776942144175268278','ORDER_PAYMENT','ORDER',565,NULL,NULL,NULL,NULL,NULL,565,NULL,NULL,584500,0,0,584500,'VND','VNPAY','VNPAY','15511119','565','565-1776942144175268278','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=58450000&vnp_Command=pay&vnp_CreateDate=20260423180224&vnp_CurrCode=VND&vnp_ExpireDate=20260423181724&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180019354337D&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=565-1776942144175268278&vnp_Version=2.1.0&vnp_SecureHash=f1be5c4483d0a68e6223aa4681d2f9c26012967645163cc2cfc4dfc08027e03ae94e33f745e68643cbb3e5742bc8646d50f06a2f8cb5def928ed8d4ca9966f65','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-23 18:17:24','2026-04-23 18:03:06','2026-04-23 18:03:06','2026-04-23 18:02:24','2026-04-23 18:03:06','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(44,'566-1776951103787103363','ORDER_PAYMENT','ORDER',566,NULL,NULL,NULL,NULL,NULL,566,NULL,NULL,452000,0,0,452000,'VND','VNPAY','VNPAY','0','566','566-1776951103787103363','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45200000&vnp_Command=pay&vnp_CreateDate=20260423203143&vnp_CurrCode=VND&vnp_ExpireDate=20260423204643&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180012D196D70&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=566-1776951103787103363&vnp_Version=2.1.0&vnp_SecureHash=a16b2cebfa144d66281be29e5e79deab0f41dd888873bb116756520248aa11cdd8ee6974adcce21eb61c48c66d42d97df6e0b0d84594a3aa70f419a2096d699e','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-23 20:46:43',NULL,NULL,'2026-04-23 20:31:43','2026-04-23 20:32:10','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(45,'567-1776957221873779199','ORDER_PAYMENT','ORDER',567,NULL,NULL,NULL,NULL,NULL,567,NULL,NULL,803500,0,0,803500,'VND','VNPAY','VNPAY','15511405','567','567-1776957221873779199','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=80350000&vnp_Command=pay&vnp_CreateDate=20260423221341&vnp_CurrCode=VND&vnp_ExpireDate=20260423222841&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800170FA7CFC&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=567-1776957221873779199&vnp_Version=2.1.0&vnp_SecureHash=fae023fef88c1e44a562c38bbf93ad492d2290fe7c108cc37dd57b2fe1513132d2eda37d201b090fbbe8e77d813f7dd4330e086f4e2f8a76f909445925b0f96d','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-23 22:28:41','2026-04-23 22:14:36','2026-04-23 22:14:36','2026-04-23 22:13:42','2026-04-23 22:14:36','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(46,'568-1776957903632901367','ORDER_PAYMENT','ORDER',568,NULL,NULL,NULL,NULL,NULL,568,NULL,NULL,598500,0,0,598500,'VND','VNPAY','VNPAY','15511418','568','568-1776957903632901367','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=59850000&vnp_Command=pay&vnp_CreateDate=20260423222503&vnp_CurrCode=VND&vnp_ExpireDate=20260423224003&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800143F37A6D&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=568-1776957903632901367&vnp_Version=2.1.0&vnp_SecureHash=f7536996c3d0ebab2e0f695ad0ab6fb1067eb7ecab0f41f38d23b2d63461142ec267b89c60bf31bc82972072fa8c4c7b2a9b1273e0a005d8883016d0ca38cc95','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-23 22:40:03','2026-04-23 22:25:47','2026-04-23 22:25:47','2026-04-23 22:25:04','2026-04-23 22:25:47','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(47,'569-1776958940567624047','ORDER_PAYMENT','ORDER',569,NULL,NULL,NULL,NULL,NULL,569,NULL,NULL,8190,0,0,8190,'VND','VNPAY','VNPAY','15511434','569','569-1776958940567624047','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=819000&vnp_Command=pay&vnp_CreateDate=20260423224220&vnp_CurrCode=VND&vnp_ExpireDate=20260423225720&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180011C5321D2&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=569-1776958940567624047&vnp_Version=2.1.0&vnp_SecureHash=37a51b625d841b98b71c5c1d59e63eb900d48cdd4237ff08de682de38f31952aa294b25bccdd16c9757d34afb6ac535bae35ab143bcc5db2c378d0dec63e4793','NCB',NULL,NULL,'ATM','FAILED','VNPay response code: 24','2026-04-23 22:57:20',NULL,NULL,'2026-04-23 22:42:21','2026-04-23 22:42:59','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(48,'570-1776959087355643296','ORDER_PAYMENT','ORDER',570,NULL,NULL,NULL,NULL,NULL,570,NULL,NULL,45710,0,0,45710,'VND','VNPAY','VNPAY','15511440','570','570-1776959087355643296','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=4571000&vnp_Command=pay&vnp_CreateDate=20260423224447&vnp_CurrCode=VND&vnp_ExpireDate=20260423225947&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800103939ACC&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=570-1776959087355643296&vnp_Version=2.1.0&vnp_SecureHash=f21af6accc4a7a361073f45b238798b0fb6c647ce6eb9c3820ff2c30d3ccbc8c08f18997780dc45194c1b31973aae0c8c50e5bd36a67b1c9231af8e901745d5b','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-23 22:59:47','2026-04-23 22:45:43','2026-04-23 22:45:43','2026-04-23 22:44:47','2026-04-23 22:45:43','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9001,'TXN-ORD-20260424-9001','ORDER_PAYMENT','ORDER',90001,'ORD-90001','USER',101,'PLATFORM',NULL,90001,'ORD-90001',101,500000,10000,20000,470000,'VND','VNPAY','VNPAY',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SUCCESS',NULL,NULL,'2026-04-24 09:00:00',NULL,'2026-04-24 04:17:02','2026-04-24 04:17:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9002,'TXN-ORD-20260424-9002','ORDER_PAYMENT','ORDER',90002,'ORD-90002','USER',102,'PLATFORM',NULL,90002,'ORD-90002',102,1200000,15000,50000,1135000,'VND','VNPAY','VNPAY',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SUCCESS',NULL,NULL,'2026-04-24 09:15:00',NULL,'2026-04-24 04:17:02','2026-04-24 04:17:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9003,'TXN-ORD-20260424-9003','ORDER_PAYMENT','ORDER',90003,'ORD-90003','USER',103,'PLATFORM',NULL,90003,'ORD-90003',103,800000,12000,0,788000,'VND','MOMO','MOMO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SUCCESS',NULL,NULL,'2026-04-24 09:30:00',NULL,'2026-04-24 04:17:02','2026-04-24 04:17:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9004,'571-1777005310568119901','ORDER_PAYMENT','ORDER',571,NULL,NULL,NULL,NULL,NULL,571,NULL,NULL,453190,0,0,453190,'VND','VNPAY','VNPAY','15512131','571','571-1777005310568119901','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45319000&vnp_Command=pay&vnp_CreateDate=20260424113510&vnp_CurrCode=VND&vnp_ExpireDate=20260424115010&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001C822D2DE&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=571-1777005310568119901&vnp_Version=2.1.0&vnp_SecureHash=120b4c9fb68c9bc2313d794d9d4983bc4fea8bda28fe7580ac307d63d6fb0babe688fd7b62d75ef17dd79ab84afa586c135846a75252a2ce158512f396239f19','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-24 11:50:10','2026-04-24 11:35:40','2026-04-24 11:35:40','2026-04-24 11:35:11','2026-04-24 11:35:40','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9005,'573-1777035316784318603','ORDER_PAYMENT','ORDER',573,NULL,NULL,NULL,NULL,NULL,573,NULL,NULL,20500,0,0,20500,'VND','VNPAY','VNPAY','15512993','573','573-1777035316784318603','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2050000&vnp_Command=pay&vnp_CreateDate=20260424195516&vnp_CurrCode=VND&vnp_ExpireDate=20260424201016&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180015B967836&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=573-1777035316784318603&vnp_Version=2.1.0&vnp_SecureHash=eaac31a1b10acf474ceb67723ba22d7f14f0b430757e1bcca303d64c9bb6c4fac2aad1a1cb18cd842adff1a1d86464318704e789ed58aada6b6925324371e260','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-24 20:10:16','2026-04-24 19:56:20','2026-04-24 19:56:20','2026-04-24 19:55:16','2026-04-24 19:56:20','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(9006,'589-1777043022685294914','ORDER_PAYMENT','ORDER',589,NULL,NULL,NULL,NULL,NULL,589,NULL,NULL,4196500,0,0,4196500,'VND','VNPAY','VNPAY','15513102','589','589-1777043022685294914','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=419650000&vnp_Command=pay&vnp_CreateDate=20260424220342&vnp_CurrCode=VND&vnp_ExpireDate=20260424221842&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001E8C9D1FC&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=589-1777043022685294914&vnp_Version=2.1.0&vnp_SecureHash=b26a27edbd2afa25956d25aa0bda703e0d688e3b8f174190c20c6e5a8e73fa214da9afe1a0b06a4fc80f00e28015a0654e76d45de53de9c77bbb73b3fc7fcb82','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-24 22:18:42','2026-04-24 22:04:34','2026-04-24 22:04:34','2026-04-24 22:03:42','2026-04-24 22:04:34','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(9007,'594-1777165215600831484','ORDER_PAYMENT','ORDER',594,NULL,NULL,NULL,NULL,NULL,594,NULL,NULL,27015500,0,0,27015500,'VND','VNPAY','VNPAY','15514178','594','594-1777165215600831484','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2701550000&vnp_Command=pay&vnp_CreateDate=20260426080015&vnp_CurrCode=VND&vnp_ExpireDate=20260426081515&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180012E6DB262&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=594-1777165215600831484&vnp_Version=2.1.0&vnp_SecureHash=6d82476984afff2148e1427c288e8c994af40b4adbd1f3bca1bd13612eb45b915ea1a55bb935e6e3df4d903c62016d467e0a2314883315602174a678773ed60e','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-26 08:15:15','2026-04-26 08:01:38','2026-04-26 08:01:38','2026-04-26 08:00:15','2026-04-26 08:01:38','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(9008,'595-1777166217857112991','ORDER_PAYMENT','ORDER',595,NULL,NULL,NULL,NULL,NULL,595,NULL,NULL,453710,0,0,453710,'VND','VNPAY','VNPAY','15514179','595','595-1777166217857112991','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=45371000&vnp_Command=pay&vnp_CreateDate=20260426081657&vnp_CurrCode=VND&vnp_ExpireDate=20260426083157&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001FA6A1B72&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=595-1777166217857112991&vnp_Version=2.1.0&vnp_SecureHash=70096c6d5af4d2a1456914843f3ba9ff731adddced254ddcbc470c3585fa045e30f4b09ca6691e87fdd846b2f52162d0965158c11af4fb56726954d3646d708b','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-26 08:31:57','2026-04-26 08:17:45','2026-04-26 08:17:45','2026-04-26 08:16:58','2026-04-26 08:17:45','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(9009,'618-1777362165163146039','ORDER_PAYMENT','ORDER',618,NULL,NULL,NULL,NULL,NULL,618,NULL,NULL,3039000,0,0,3039000,'VND','VNPAY','VNPAY','0','618','618-1777362165163146039','24','Payment failed','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=303900000&vnp_Command=pay&vnp_CreateDate=20260428144245&vnp_CurrCode=VND&vnp_ExpireDate=20260428145745&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800146EAA1BA&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=618-1777362165163146039&vnp_Version=2.1.0&vnp_SecureHash=eabc209fa93d2f87a9733d3313c31200a68752c87fa49fdc5cb2a546095c4944ae9dcb6125479e391d6c3840f228442df05a454badb854aee3183a3dc6297b85','VNPAY',NULL,NULL,'QRCODE','FAILED','VNPay response code: 24','2026-04-28 14:57:45',NULL,NULL,'2026-04-28 14:42:45','2026-04-28 14:42:58','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9010,'637-1777544908678568493','ORDER_PAYMENT','ORDER',637,NULL,NULL,NULL,NULL,NULL,637,NULL,NULL,5459000,0,0,5459000,'VND','VNPAY','VNPAY','15518223','637','637-1777544908678568493','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=545900000&vnp_Command=pay&vnp_CreateDate=20260430172828&vnp_CurrCode=VND&vnp_ExpireDate=20260430174328&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800160C1F17A&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2F103.90.225.130%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=637-1777544908678568493&vnp_Version=2.1.0&vnp_SecureHash=d0c081a7f99d2bb1e970ccb2541cc7317930f0c3a8e64506d23b643bc3056475bf7c4443495bb10bb4edaf8643284f6edb986a146b7271676c367ea48543010b','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-04-30 17:43:28','2026-04-30 17:29:12','2026-04-30 17:29:12','2026-04-30 17:28:28','2026-04-30 17:29:12','SYSTEM',0,'172.21.0.1',NULL,NULL,'Create payment URL request',NULL),(9011,'640-1777697698982149975','ORDER_PAYMENT','ORDER',640,NULL,NULL,NULL,NULL,NULL,640,NULL,NULL,439190,0,0,439190,'VND','VNPAY','VNPAY','15519405','640','640-1777697698982149975','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=43919000&vnp_Command=pay&vnp_CreateDate=20260502115458&vnp_CurrCode=VND&vnp_ExpireDate=20260502120958&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001750E8240&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=640-1777697698982149975&vnp_Version=2.1.0&vnp_SecureHash=267009f560dacb624879feac7f4d2395f293d5af21122847c9bb557751a4cf05ec9267c3ba4ccaf3ef9a2ebc7fe9cf4fe08579d79644d036436ce1d3c6cfde45','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-05-02 12:09:58','2026-05-02 11:55:53','2026-05-02 11:55:53','2026-05-02 11:54:59','2026-05-02 11:55:53','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9012,'641-1777700767738638219','ORDER_PAYMENT','ORDER',641,NULL,NULL,NULL,NULL,NULL,641,NULL,NULL,8444000,0,0,8444000,'VND','VNPAY','VNPAY','15519426','641','641-1777700767738638219','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=844400000&vnp_Command=pay&vnp_CreateDate=20260502124607&vnp_CurrCode=VND&vnp_ExpireDate=20260502130107&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180013C3D1960&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=641-1777700767738638219&vnp_Version=2.1.0&vnp_SecureHash=63562193b9d929dd0ff512c1f5d4e50e6568ccebfb598fb829bb951268ab1d964b2ab0f64fb4d0d8b6bca10a94c55807fe1a7cbf95cc8a26ea135db7872c77f9','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-05-02 13:01:07','2026-05-02 12:47:32','2026-05-02 12:47:32','2026-05-02 12:46:08','2026-05-02 12:47:32','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9013,'642-1777700912620500768','ORDER_PAYMENT','ORDER',642,NULL,NULL,NULL,NULL,NULL,642,NULL,NULL,4254000,0,0,4254000,'VND','VNPAY','VNPAY','15519428','642','642-1777700912620500768','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=425400000&vnp_Command=pay&vnp_CreateDate=20260502124832&vnp_CurrCode=VND&vnp_ExpireDate=20260502130332&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD202503180019B4C6DED&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=642-1777700912620500768&vnp_Version=2.1.0&vnp_SecureHash=31879fedd4ca021ed28ef549ca9f71d949a11d0ae053f4d2c7ae24a49dc4bc9f9d2a6f8f1c08cfb17f7502ca5aff4316bf10a9bbfef9ce7c547b4d04e4ae24af','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-05-02 13:03:32','2026-05-02 12:58:15','2026-05-02 12:58:15','2026-05-02 12:48:33','2026-05-02 12:58:15','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9014,'643-1777702560208812498','ORDER_PAYMENT','ORDER',643,NULL,NULL,NULL,NULL,NULL,643,NULL,NULL,304000,0,0,304000,'VND','VNPAY','VNPAY','15519447','643','643-1777702560208812498','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=30400000&vnp_Command=pay&vnp_CreateDate=20260502131600&vnp_CurrCode=VND&vnp_ExpireDate=20260502133100&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD2025031800127A9ECA0&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=643-1777702560208812498&vnp_Version=2.1.0&vnp_SecureHash=2bba6fe99df9bfbe4b30c82702586e26b010153a16590a087ae13734e49cf3ad21d571dcf78b0e8cd1b5883bc693a3c680a11b6fdfead19a197ab45d5ea02bda','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-05-02 13:31:00','2026-05-02 13:17:27','2026-05-02 13:17:27','2026-05-02 13:16:00','2026-05-02 13:17:27','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL),(9015,'644-1777718265368839156','ORDER_PAYMENT','ORDER',644,NULL,NULL,NULL,NULL,NULL,644,NULL,NULL,7816000,0,0,7816000,'VND','VNPAY','VNPAY','15519648','644','644-1777718265368839156','00','Payment successful','https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=781600000&vnp_Command=pay&vnp_CreateDate=20260502173745&vnp_CurrCode=VND&vnp_ExpireDate=20260502175245&vnp_IpAddr=10.0.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Payment+for+order+ORD20250318001836C047C&vnp_OrderType=ecommerce&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8008%2Fapi%2Fpayments%2Freturn&vnp_TmnCode=WK7FXXYK&vnp_TxnRef=644-1777718265368839156&vnp_Version=2.1.0&vnp_SecureHash=5e1fc774476855674ee93b511efffc81ba30625e7dd052202431124019ba73ef5909c6c5b84eec427a6a94daa2d0b735e110ca6ce8d6ae9a08ab5565b600b859','NCB',NULL,NULL,'ATM','SUCCESS',NULL,'2026-05-02 17:52:45','2026-05-02 17:39:22','2026-05-02 17:39:22','2026-05-02 17:37:45','2026-05-02 17:39:22','SYSTEM',0,'127.0.0.1',NULL,NULL,'Create payment URL request',NULL);
/*!40000 ALTER TABLE `payment_transaction` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`developer`@`%`*/ /*!50003 TRIGGER `trg_payment_transaction_status_on_insert` AFTER INSERT ON `payment_transaction` FOR EACH ROW BEGIN
  -- Chèn record đầu tiên vào payment_status_history với from_status = NULL
  -- (thể hiện đây là trạng thái khởi tạo của giao dịch)
  INSERT INTO `payment_status_history` (
    `transaction_id`,
    `from_status`,
    `to_status`,
    `changed_by`,
    `actor_id`,
    `reason`,
    `gateway_data`,
    `created_at`
  ) VALUES (
    NEW.`id`,
    NULL,                          -- NULL = trạng thái khởi tạo (chưa có trạng thái trước)
    NEW.`status`,                  -- Trạng thái ban đầu (thường là 'PENDING')
    COALESCE(NEW.`initiated_by`, 'SYSTEM'),
    NEW.`initiator_id`,
    CONCAT('Transaction created with status: ', NEW.`status`),
    NULL,
    NEW.`created_at`
  );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_payment_transaction_revenue_snapshot` AFTER UPDATE ON `payment_transaction` FOR EACH ROW BEGIN
  DECLARE v_prev_count    BIGINT DEFAULT 0;
  DECLARE v_prev_gross    BIGINT DEFAULT 0;
  DECLARE v_prev_discount BIGINT DEFAULT 0;
  DECLARE v_prev_fee      BIGINT DEFAULT 0;
  DECLARE v_prev_net      BIGINT DEFAULT 0;

  
  IF NEW.`status` = 'SUCCESS' AND OLD.`status` <> 'SUCCESS' THEN

    
    SELECT
      COALESCE(cumulative_success_count, 0),
      COALESCE(cumulative_gross_amount, 0),
      COALESCE(cumulative_discount_amount, 0),
      COALESCE(cumulative_fee_amount, 0),
      COALESCE(cumulative_net_amount, 0)
    INTO
      v_prev_count,
      v_prev_gross,
      v_prev_discount,
      v_prev_fee,
      v_prev_net
    FROM `payment_revenue_snapshot`
    ORDER BY `recognized_at` DESC, `id` DESC
    LIMIT 1;

    
    INSERT INTO `payment_revenue_snapshot` (
      `transaction_id`,
      `txn_code`,
      `txn_type`,
      `currency`,
      `recognized_at`,
      `gross_amount`,
      `discount_amount`,
      `fee_amount`,
      `net_amount`,
      `cumulative_success_count`,
      `cumulative_gross_amount`,
      `cumulative_discount_amount`,
      `cumulative_fee_amount`,
      `cumulative_net_amount`
    ) VALUES (
      NEW.`id`,
      NEW.`txn_code`,
      NEW.`txn_type`,
      NEW.`currency`,
      COALESCE(NEW.`completed_at`, NOW()),
      NEW.`gross_amount`,
      NEW.`discount_amount`,
      NEW.`fee_amount`,
      NEW.`net_amount`,
      v_prev_count    + 1,
      v_prev_gross    + NEW.`gross_amount`,
      v_prev_discount + NEW.`discount_amount`,
      v_prev_fee      + NEW.`fee_amount`,
      v_prev_net      + NEW.`net_amount`
    );

  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`developer`@`%`*/ /*!50003 TRIGGER `trg_payment_transaction_status_on_update` AFTER UPDATE ON `payment_transaction` FOR EACH ROW BEGIN
  -- Chỉ ghi lịch sử khi status thực sự thay đổi
  IF NEW.`status` <> OLD.`status` THEN

    INSERT INTO `payment_status_history` (
      `transaction_id`,
      `from_status`,
      `to_status`,
      `changed_by`,
      `actor_id`,
      `reason`,
      `gateway_data`,
      `created_at`
    ) VALUES (
      NEW.`id`,
      OLD.`status`,
      NEW.`status`,
      'SYSTEM',                    -- Mặc định là SYSTEM; tuỳ chỉnh theo logic nghiệp vụ nếu cần
      NULL,
      -- Tự động sinh reason dựa theo trạng thái mới
      CASE NEW.`status`
        WHEN 'SUCCESS'    THEN CONCAT('Payment successful. Gateway response: ', COALESCE(NEW.`gateway_response_code`, 'N/A'))
        WHEN 'FAILED'     THEN CONCAT('Payment failed. Reason: ', COALESCE(NEW.`failure_reason`, CONCAT('Gateway code: ', COALESCE(NEW.`gateway_response_code`, 'N/A'))))
        WHEN 'CANCELLED'  THEN CONCAT('Transaction cancelled. Reason: ', COALESCE(NEW.`failure_reason`, 'N/A'))
        WHEN 'EXPIRED'    THEN 'Transaction expired (timeout)'
        WHEN 'PROCESSING' THEN 'Transaction moved to processing'
        WHEN 'REFUNDED'   THEN 'Transaction has been refunded'
        ELSE CONCAT('Status changed to: ', NEW.`status`)
      END,
      -- Snapshot một số thông tin gateway tại thời điểm đổi trạng thái
      JSON_OBJECT(
        'gateway_code',          NEW.`gateway_code`,
        'gateway_txn_id',        NEW.`gateway_txn_id`,
        'gateway_response_code', NEW.`gateway_response_code`,
        'gateway_response_msg',  NEW.`gateway_response_msg`,
        'payment_method',        NEW.`payment_method`,
        'net_amount',            NEW.`net_amount`,
        'completed_at',          NEW.`completed_at`
      ),
      NOW()
    );

  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-02 18:02:09
