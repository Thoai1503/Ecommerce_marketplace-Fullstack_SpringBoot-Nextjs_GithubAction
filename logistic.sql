-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 103.90.225.130    Database: logistic_service
-- ------------------------------------------------------
-- Server version	9.6.0

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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2c59c582-18f2-11f1-bd8d-5aa896c9ebaa:1-1806,
623d5015-006c-11f1-9997-862ccfb0601c:1-55,
81ef4829-2dbc-11f1-ad1f-82b74a1b389c:1-141,
c092d620-3959-11f0-ab88-862ccfb006c1:1-123,
c2164987-7c01-11f0-abd1-862ccfb03b82:1-293';

--
-- Table structure for table `logistics_partner`
--

DROP TABLE IF EXISTS `logistics_partner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logistics_partner` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `shop_ref_id` varchar(100) NOT NULL COMMENT 'ID shop bên ecommerce service (loose ref, không phải FK)',
  `shop_name` varchar(255) NOT NULL COMMENT 'Tên shop (copy từ ecommerce lúc đăng ký)',
  `api_key` varchar(255) NOT NULL COMMENT 'API key để shop gọi logistics API',
  `contact_email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_partner_api_key` (`api_key`),
  UNIQUE KEY `uq_partner_shop_ref` (`shop_ref_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Đối tác shop đã đăng ký logistics service';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logistics_partner`
--

LOCK TABLES `logistics_partner` WRITE;
/*!40000 ALTER TABLE `logistics_partner` DISABLE KEYS */;
INSERT INTO `logistics_partner` VALUES (1,'101','Shop Điện Tử A','lp_key_dienta_abc123','dienta@example.com','0901234567',1,'2026-03-25 11:42:25','2026-03-25 11:42:25'),(2,'102','Shop Thời Trang B','lp_key_thoitrang_xyz789','thoitrangb@example.com','0912345678',1,'2026-03-25 11:42:25','2026-03-25 11:42:25');
/*!40000 ALTER TABLE `logistics_partner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipient`
--

DROP TABLE IF EXISTS `recipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipient` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'Họ tên người nhận',
  `phone` varchar(20) NOT NULL COMMENT 'Số điện thoại',
  `email` varchar(255) DEFAULT NULL,
  `address` text NOT NULL COMMENT 'Địa chỉ đầy đủ',
  `province` bigint DEFAULT NULL,
  `district` bigint DEFAULT NULL,
  `ward` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông tin người nhận hàng (snapshot tại thời điểm tạo shipment)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipient`
--

LOCK TABLES `recipient` WRITE;
/*!40000 ALTER TABLE `recipient` DISABLE KEYS */;
INSERT INTO `recipient` VALUES (128,'Vo Giang Thoai','0862830787','vpthpo@gmail.com','341 Cao Thang',2,4,5,'2026-03-27 06:17:02'),(129,'Vo Quang Teo','0869990787',NULL,'341 Cao Thang',2,4,5,'2026-03-28 12:31:36'),(131,'Vo Quang Teo Em','0860000787',NULL,'341 Cao Thang',2,4,5,'2026-03-28 12:45:43'),(132,'dvzsx','0987654243',NULL,'dvsvsv',1,1,1,'2026-03-29 22:25:44'),(133,'thoai','0867677888',NULL,'456 vnnvn, Phường 1, Quận 1, Hà Nội',NULL,NULL,NULL,'2026-04-01 19:14:20');
/*!40000 ALTER TABLE `recipient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment`
--

DROP TABLE IF EXISTS `shipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tracking_code` varchar(100) NOT NULL COMMENT 'Mã tracking hiển thị cho khách (VD: LOG20240001)',
  `order_shipment_ref_id` bigint NOT NULL COMMENT 'order_id bên ecommerce service (loose ref, không phải FK)',
  `shop_ref_id` bigint NOT NULL COMMENT 'shop_id bên ecommerce service (loose ref, không phải FK)',
  `partner_id` bigint NOT NULL COMMENT 'FK nội bộ -> logistics_partner',
  `recipient_id` bigint NOT NULL COMMENT 'FK nội bộ -> recipient',
  `status` varchar(50) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING|CONFIRMED|PICKED_UP|IN_TRANSIT|OUT_FOR_DELIVERY|DELIVERED|FAILED|RETURNED',
  `shipping_fee` double DEFAULT '0' COMMENT 'Phí vận chuyển (VNĐ)',
  `cod_amount` double DEFAULT '0' COMMENT 'Số tiền COD cần thu hộ',
  `weight_gram` int DEFAULT NULL COMMENT 'Khối lượng gói hàng (gram)',
  `note` text COMMENT 'Ghi chú giao hàng',
  `estimated_delivery_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm giao thành công thực tế',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tracking_code` (`tracking_code`),
  KEY `idx_shipment_order_ref` (`order_shipment_ref_id`),
  KEY `idx_shipment_shop_ref` (`shop_ref_id`),
  KEY `idx_shipment_partner` (`partner_id`),
  KEY `idx_shipment_recipient` (`recipient_id`),
  KEY `idx_shipment_status` (`status`),
  CONSTRAINT `fk_shipment_partner` FOREIGN KEY (`partner_id`) REFERENCES `logistics_partner` (`id`),
  CONSTRAINT `fk_shipment_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `recipient` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vận đơn - đơn vị trung tâm của logistics service';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment`
--

LOCK TABLES `shipment` WRITE;
/*!40000 ALTER TABLE `shipment` DISABLE KEYS */;
INSERT INTO `shipment` VALUES (211,'LOGD6F9AACC',228,1,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-03-29 19:06:18','2026-03-29 19:06:18'),(212,'LOGD6BCEEBF',229,2,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-03-29 19:06:18','2026-03-29 19:06:18'),(213,'LOGE0ABB021',230,1,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-03-29 19:23:05','2026-03-29 19:23:05'),(214,'LOGD0D7AF45',231,2,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-03-29 19:23:05','2026-03-29 19:23:05'),(215,'LOG4676E9CC',232,1,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-03-29 19:27:31','2026-03-29 19:27:31'),(216,'LOG457098BF',233,2,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-03-29 19:27:31','2026-03-29 19:27:31'),(217,'LOG195BCC4F',240,1,1,132,'PENDING',9000,109000,NULL,NULL,NULL,NULL,'2026-03-29 22:25:44','2026-03-29 22:25:44'),(218,'LOG9F55C697',241,2,1,132,'PENDING',9000,109000,NULL,NULL,NULL,NULL,'2026-03-29 22:25:44','2026-03-29 22:25:44'),(239,'LOGDB29A1F3',251,1,1,133,'PENDING',9000,109000,NULL,NULL,NULL,NULL,'2026-04-01 19:14:20','2026-04-01 19:14:20'),(240,'LOG4EF5EF9A',252,1,1,133,'PENDING',9000,109000,NULL,NULL,NULL,NULL,'2026-04-01 19:15:01','2026-04-01 19:15:01'),(241,'LOG9B9E3729',253,1,1,133,'PENDING',9000,109000,NULL,NULL,NULL,NULL,'2026-04-01 22:42:27','2026-04-01 22:42:27'),(242,'LOG38F12469',254,2,1,133,'PENDING',9000,109000,NULL,NULL,NULL,NULL,'2026-04-01 22:42:27','2026-04-01 22:42:27'),(243,'LOG0E129F6C',256,2,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-04-02 22:28:02','2026-04-02 22:28:02'),(244,'LOG4404FD15',255,1,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-04-02 22:28:02','2026-04-02 22:28:02'),(245,'LOG059E73DD',257,1,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-04-03 18:52:46','2026-04-03 18:52:46'),(246,'LOG12C96F8A',258,2,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-04-03 18:52:46','2026-04-03 18:52:46'),(247,'LOGF5BEC92E',259,1,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-04-03 18:53:23','2026-04-03 18:53:23'),(248,'LOG6C18A5CE',260,2,1,131,'PENDING',9000,29000,NULL,NULL,NULL,NULL,'2026-04-03 18:53:23','2026-04-03 18:53:23'),(249,'LOG69FE94AF',261,1,1,131,'CONFIRMED',9000,29000,NULL,NULL,NULL,NULL,'2026-04-03 18:56:51','2026-04-04 06:40:42'),(250,'LOGB516749E',262,2,1,131,'CONFIRMED',9000,29000,NULL,NULL,NULL,NULL,'2026-04-03 18:56:51','2026-04-04 07:10:52');
/*!40000 ALTER TABLE `shipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment_item`
--

DROP TABLE IF EXISTS `shipment_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `shipment_id` bigint NOT NULL,
  `product_name` varchar(500) NOT NULL COMMENT 'Tên sản phẩm tại thời điểm tạo vận đơn',
  `sku` varchar(100) DEFAULT NULL COMMENT 'SKU để đối chiếu (tuỳ chọn)',
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_shipment_item_shipment` (`shipment_id`),
  CONSTRAINT `fk_item_shipment` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Sản phẩm trong vận đơn (snapshot, không join về ecommerce DB)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_item`
--

LOCK TABLES `shipment_item` WRITE;
/*!40000 ALTER TABLE `shipment_item` DISABLE KEYS */;
INSERT INTO `shipment_item` VALUES (165,211,'Động cơ 555 Kieu 2',NULL,6,1999000.00),(166,212,'Động cơ 775',NULL,2,10000000.00),(167,212,'Động cơ 775',NULL,13,90000.00),(168,213,'Động cơ 555 Kieu 2',NULL,6,1999000.00),(169,214,'Động cơ 775',NULL,2,10000000.00),(170,214,'Động cơ 775',NULL,13,90000.00),(171,215,'Động cơ 555 Kieu 2',NULL,6,1999000.00),(172,216,'Động cơ 775',NULL,2,10000000.00),(173,216,'Động cơ 775',NULL,13,90000.00),(174,217,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,7,219000.00),(175,217,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,20,189000.00),(176,218,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,3,289000.00),(197,239,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,7,219000.00),(198,239,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,20,189000.00),(199,240,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,7,219000.00),(200,240,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,20,189000.00),(201,241,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,20,189000.00),(202,242,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(203,242,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,3,289000.00),(204,243,'Động cơ 775',NULL,2,10000000.00),(205,243,'Động cơ 775',NULL,13,90000.00),(206,244,'Động cơ 555 Kieu 2',NULL,6,1999000.00),(207,245,'Động cơ 555 Kieu 2',NULL,6,1999000.00),(208,246,'Động cơ 775',NULL,2,10000000.00),(209,246,'Động cơ 775',NULL,13,90000.00),(210,247,'Động cơ 555 Kieu 2',NULL,6,1999000.00),(211,248,'Động cơ 775',NULL,2,10000000.00),(212,248,'Động cơ 775',NULL,13,90000.00),(213,249,'Động cơ 555 Kieu 2',NULL,6,1999000.00),(214,250,'Động cơ 775',NULL,2,10000000.00),(215,250,'Động cơ 775',NULL,13,90000.00);
/*!40000 ALTER TABLE `shipment_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment_status_history`
--

DROP TABLE IF EXISTS `shipment_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `shipment_id` bigint NOT NULL,
  `status` varchar(50) NOT NULL COMMENT 'Trạng thái tại sự kiện này',
  `description` text COMMENT 'Mô tả sự kiện (VD: Đã lấy hàng tại kho Bình Thạnh)',
  `location` varchar(255) DEFAULT NULL COMMENT 'Địa điểm xảy ra sự kiện',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Ai/hệ thống nào cập nhật: admin | driver_app | webhook | system',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status_history_shipment` (`shipment_id`),
  KEY `idx_status_history_time` (`updated_at`),
  CONSTRAINT `fk_history_shipment` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử trạng thái vận đơn - nguồn dữ liệu tracking page';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_status_history`
--

LOCK TABLES `shipment_status_history` WRITE;
/*!40000 ALTER TABLE `shipment_status_history` DISABLE KEYS */;
INSERT INTO `shipment_status_history` VALUES (191,211,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 12:06:17'),(192,212,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 12:06:17'),(193,213,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 12:23:04'),(194,214,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 12:23:04'),(195,215,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 12:27:30'),(196,216,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 12:27:30'),(197,217,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 15:25:45'),(198,218,'PENDING','Vận đơn được tạo',NULL,'system','2026-03-29 15:25:45');
/*!40000 ALTER TABLE `shipment_status_history` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-04  7:27:44
