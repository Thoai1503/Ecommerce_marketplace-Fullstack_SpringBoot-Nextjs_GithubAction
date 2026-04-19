-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: mysql-2acda025-vothoai1503-2915.l.aivencloud.com    Database: ecommerce
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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2c59c582-18f2-11f1-bd8d-5aa896c9ebaa:1-2698,
623d5015-006c-11f1-9997-862ccfb0601c:1-55,
c092d620-3959-11f0-ab88-862ccfb006c1:1-123,
c2164987-7c01-11f0-abd1-862ccfb03b82:1-293';

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `shop_id` bigint DEFAULT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `address_line` varchar(500) NOT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `district` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_shop_id` (`shop_id`),
  CONSTRAINT `address_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `address_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_address_owner` CHECK ((((`user_id` is not null) and (`shop_id` is null)) or ((`user_id` is null) and (`shop_id` is not null))))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (1,1,NULL,'test 1','0909000000','123 test','2','2','2','70000',0,'2026-03-06 12:17:53','2026-03-26 15:17:53'),(2,7,NULL,'thoai','0867677888','456 vnnvn','90768','3695','202','70000',1,'2026-03-20 14:09:02','2026-04-08 05:34:15'),(3,NULL,1,'','','564 3 tháng 2','13010','3440','201',NULL,1,'2026-04-08 06:10:22','2026-04-08 06:20:56'),(4,NULL,2,'','','Ap cai bang','55079','3317','220',NULL,0,'2026-04-08 06:20:56','2026-04-08 06:20:56'),(5,NULL,3,'','','Ap Tieu Ho','550809','1576','220',NULL,0,'2026-04-08 06:22:28','2026-04-08 06:22:28'),(6,7,NULL,'Tu dien','0987967543','31 Tân Hoà Đông','20614','1448','202','',0,'2026-04-08 23:19:35','2026-04-08 23:19:35'),(7,8,NULL,'Thoại Chợ Lớn','0976499267','51 Hiệp Bình','90741','3695','202','',0,'2026-04-09 15:18:28','2026-04-12 14:13:20'),(8,25,NULL,'Vo Thoai','0980747476','23sf sfsf','130324','2047','263','',0,'2026-04-10 19:20:33','2026-04-10 19:20:33'),(9,33,NULL,'User 8','0888989898','561 An Dương Vương','21901','1458','202','',0,'2026-04-11 10:06:35','2026-04-11 10:06:35'),(10,37,NULL,'Cu Tèo','0983156792','Ấp 51 Cần Giuộc','491301','1907','211','',0,'2026-04-11 11:02:07','2026-04-11 11:02:07'),(11,38,NULL,'Cu Tí','0968561302','Ấp Cá Tra','580309','2091','214','',1,'2026-04-11 11:06:22','2026-04-11 06:02:16'),(12,39,NULL,'Mãnh Long Quá Giang','0903453921','1011 Lạc Long Quân','21101','1453','202','',0,'2026-04-11 11:20:16','2026-04-11 11:20:16'),(13,40,NULL,'Buyer 15','0988756435','51 Tây Thạnh','21511','1456','202','',1,'2026-04-11 20:57:16','2026-04-11 20:57:16'),(14,41,NULL,'Lý Tiểu Long','0912341232','180 Nguyễn Hữu Cảnh','21615','1462','202','',1,'2026-04-11 21:34:23','2026-04-11 21:34:23'),(15,42,NULL,'Lý Liên Kiệt','0989644354','Ấp 3T Dương Công Khi','22212','1459','202','',1,'2026-04-11 22:20:59','2026-04-11 22:20:59'),(16,43,NULL,'Long Ân','0986547454','T3T Đông Hoà 3','440504','1540','205','',1,'2026-04-12 22:14:51','2026-04-12 22:14:51');
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attribute`
--

DROP TABLE IF EXISTS `attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribute`
--

LOCK TABLES `attribute` WRITE;
/*!40000 ALTER TABLE `attribute` DISABLE KEYS */;
INSERT INTO `attribute` VALUES (1,'Screen Size','screen-size',1),(2,'RAM capacity','ram-capacity',1),(3,'Internal memory','internal-memory',1),(4,'Color','color',1),(5,'Number of cores','number-of-cores',1),(6,'Processor','processor',1),(7,'CPU frequency','cpu-frequency',1),(8,'Storage capacity','storage-capacity',1),(9,'Operating system','operating-system',1),(10,'Material','material',1),(11,'Sample','sample',1),(12,'Battery capacity','battery-capacity',1),(17,'Scanning Frequency','scanning-frequency',1),(18,'Screen Technology','screen-technology',1),(19,'Resolution','resolution',1),(20,'Connection Port','connection-port',1),(21,'Audio and video technology','audio-and-video-technology',1),(22,'Smart Features & Others','smart-features-others',1),(23,'Length','length',1);
/*!40000 ALTER TABLE `attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attribute_unit`
--

DROP TABLE IF EXISTS `attribute_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attribute_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribute_unit`
--

LOCK TABLES `attribute_unit` WRITE;
/*!40000 ALTER TABLE `attribute_unit` DISABLE KEYS */;
INSERT INTO `attribute_unit` VALUES (1,8,1,1),(4,1,2,1),(7,17,14,1),(8,19,15,1),(9,23,5,1);
/*!40000 ALTER TABLE `attribute_unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attribute_value`
--

DROP TABLE IF EXISTS `attribute_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute_value` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attribute_id` int NOT NULL,
  `unit_id` int DEFAULT NULL,
  `value` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribute_value`
--

LOCK TABLES `attribute_value` WRITE;
/*!40000 ALTER TABLE `attribute_value` DISABLE KEYS */;
INSERT INTO `attribute_value` VALUES (1,13,NULL,'Snapdragon 865 Plus'),(2,13,NULL,'Snapdragon 865'),(3,13,NULL,'Exynos 990'),(4,13,NULL,'Exynos 7885'),(5,13,NULL,'Apple A12 Bionic'),(6,8,1,'32'),(7,8,1,'64'),(8,8,1,'128'),(9,8,9,'1'),(10,1,2,'32'),(11,1,2,'43'),(12,1,2,'50'),(13,1,2,'55'),(14,1,2,'65'),(15,1,2,'75'),(17,17,14,'60'),(18,17,14,'120'),(19,17,14,'144'),(20,17,14,'165'),(21,17,14,'240'),(22,4,NULL,'Black'),(23,4,NULL,'While'),(24,18,NULL,'OLED'),(25,18,NULL,'QLED'),(27,18,NULL,'LCD'),(28,18,NULL,'LED'),(29,18,NULL,'NanoCell'),(30,18,NULL,'Mini LED'),(31,18,NULL,'Micro LED'),(32,18,NULL,'IPS'),(33,18,NULL,'TN (Twisted Nematic)'),(34,18,NULL,'VA'),(35,18,NULL,'OLED/AMOLED'),(36,18,NULL,'AMOLED/Super AMOLED'),(37,18,NULL,'IPS LCD'),(38,18,NULL,'LTPO (Low-Temperature Polycrystalline Oxide)'),(39,18,NULL,'ClearBlack'),(44,19,15,'HD (720p): 1280 × 720'),(45,19,15,'Full HD (1080p): 1920 × 1080'),(46,19,15,'2K (QHD): 2560 × 1440'),(47,19,15,'4K (Ultra HD):	3840 × 2160'),(48,19,15,'8K: 7680 × 4320'),(49,20,NULL,'HDMI (High-Definition Multimedia Interface)'),(50,20,NULL,'HDMI ARC/eARC'),(51,20,NULL,'USB (Universal Serial Bus)'),(52,20,NULL,'Optical (Digital Audio Out)'),(53,20,NULL,'AV (Composite - 3 màu trắng/đỏ/vàng)'),(54,20,NULL,'Component (Y/Pb/Pr)'),(55,20,NULL,'LAN/Ethernet'),(56,20,NULL,'RF In (Ăng-ten)'),(57,4,NULL,'Gray'),(58,4,NULL,'Silver'),(59,4,NULL,'Red'),(60,4,NULL,'Yellow'),(61,4,NULL,'Orange'),(62,4,NULL,'Blue'),(63,4,NULL,'Green'),(64,4,NULL,'Pink'),(65,4,NULL,'Purple'),(66,4,NULL,'Pastel'),(67,4,NULL,'Brown'),(68,4,NULL,'Beige'),(69,4,NULL,'Cream'),(70,4,NULL,'Gradient'),(71,4,NULL,'Metallic'),(72,4,NULL,'Transparent'),(73,23,5,'90'),(74,23,5,'95'),(75,23,5,'100'),(76,23,5,'105'),(77,23,5,'110'),(78,23,5,'115'),(79,23,5,'120'),(80,10,NULL,'Leather'),(81,10,NULL,'PU Leather'),(82,10,NULL,'Canvas'),(83,10,NULL,'Cotton'),(84,10,NULL,'Polyester'),(86,10,NULL,'Nylon'),(87,10,NULL,'Stainless Steel'),(88,10,NULL,'Alloy'),(89,10,NULL,'Silve'),(90,10,NULL,'Gold'),(91,10,NULL,'Plastic'),(92,10,NULL,'Rubber');
/*!40000 ALTER TABLE `attribute_value` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `logo` varchar(255) NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES (2,'Nike','nike','/image/brand/1775194767226-nike.jpg',1),(3,'Adidas','adidas','/image/brand/1775194927055-adidas.jpg',1),(4,'No Brand','no-brand','/image/brand/1775195163286-no-brand.png',1),(5,'samsung','samsung','/image/brand/1775195441895-samsung.jpg',1),(6,'LG','lg','/image/brand/1775207954103-LG.png',1),(7,'Sony','sony','/image/brand/1775208345795-Sony.jpg',1),(8,'Panasonic','panasonic','/image/brand/1775208713408-Panasonic.jpg',1),(9,'Toshiba','toshiba','/image/brand/1775208755531-Toshiba.png',1),(10,'Xiaomi','xiaomi','/image/brand/1775208947613-Xiaomi.png',1),(11,'Casper','casper','/image/brand/1775209343544-Casper.png',1);
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `variant_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`,`variant_id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (2,1,4,1,2,'2026-02-22 21:07:26','2026-02-22 21:07:26'),(3,1,4,2,2,'2026-02-24 06:10:43','2026-02-24 06:10:43'),(30,7,4,2,4,'2026-03-08 17:47:24','2026-04-09 21:20:37'),(31,7,4,1,7,'2026-03-08 17:47:35','2026-03-20 18:28:02'),(37,7,111,8,2,'2026-03-16 22:29:39','2026-04-09 21:20:30'),(38,7,112,9,3,'2026-03-22 20:10:47','2026-04-09 21:20:07'),(39,7,114,11,3,'2026-03-22 20:42:49','2026-04-08 23:40:30'),(40,7,115,12,3,'2026-03-22 21:39:53','2026-03-23 18:55:12'),(42,7,113,10,2,'2026-04-08 14:30:40','2026-04-09 05:46:03'),(44,2,111,8,2,'2026-04-09 19:49:51','2026-04-10 22:31:32'),(48,8,115,12,9,'2026-04-09 22:16:24','2026-04-10 10:28:15'),(49,8,116,13,3,'2026-04-10 02:15:33','2026-04-10 19:23:37'),(50,8,117,14,1,'2026-04-10 09:56:51','2026-04-12 17:52:10'),(51,2,117,14,3,'2026-04-10 13:54:25','2026-04-10 14:22:33'),(52,8,111,8,4,'2026-04-10 14:24:47','2026-04-11 06:44:36'),(53,8,4,1,2,'2026-04-10 14:28:13','2026-04-11 06:44:22'),(54,25,117,14,2,'2026-04-10 19:17:29','2026-04-10 19:17:53'),(55,32,111,8,1,'2026-04-11 10:02:18','2026-04-11 10:02:18'),(56,33,111,8,2,'2026-04-11 10:04:01','2026-04-12 07:24:43'),(57,33,117,14,3,'2026-04-11 10:17:43','2026-04-11 10:27:16'),(58,34,111,8,3,'2026-04-11 10:30:42','2026-04-11 10:30:42'),(59,35,111,8,3,'2026-04-11 10:33:22','2026-04-11 10:33:22'),(60,36,111,8,3,'2026-04-11 10:41:22','2026-04-11 10:41:22'),(61,37,111,8,1,'2026-04-11 10:53:39','2026-04-11 10:58:09'),(62,38,111,8,1,'2026-04-11 11:04:04','2026-04-11 11:04:04'),(63,38,112,9,1,'2026-04-11 11:04:49','2026-04-11 11:04:49'),(64,38,4,2,1,'2026-04-11 11:05:15','2026-04-11 11:05:15'),(65,38,115,12,1,'2026-04-11 11:05:29','2026-04-11 11:05:29'),(66,39,111,8,1,'2026-04-11 11:19:10','2026-04-11 11:19:10'),(67,38,4,1,1,'2026-04-11 12:22:55','2026-04-11 12:22:55'),(68,8,114,11,2,'2026-04-11 17:44:54','2026-04-11 22:27:43'),(69,5,117,14,2,'2026-04-11 19:59:25','2026-04-12 17:33:01'),(70,4,117,14,1,'2026-04-11 20:51:52','2026-04-11 20:52:33'),(71,4,115,12,1,'2026-04-11 20:52:26','2026-04-11 20:52:26'),(72,40,115,12,1,'2026-04-11 20:54:42','2026-04-11 20:54:42'),(73,40,114,11,1,'2026-04-11 20:54:42','2026-04-11 20:54:42'),(74,40,116,13,2,'2026-04-11 20:54:42','2026-04-11 20:54:50'),(75,41,115,12,2,'2026-04-11 21:32:47','2026-04-11 21:32:47'),(76,41,114,11,1,'2026-04-11 21:32:47','2026-04-11 21:32:47'),(77,41,112,9,1,'2026-04-11 21:32:47','2026-04-11 21:32:47'),(78,41,117,14,1,'2026-04-11 22:08:42','2026-04-11 22:08:42'),(79,42,115,12,2,'2026-04-11 22:18:43','2026-04-11 22:18:43'),(80,42,114,11,2,'2026-04-11 22:18:43','2026-04-13 07:07:11'),(81,42,112,9,1,'2026-04-11 22:18:43','2026-04-11 22:18:43'),(82,8,113,10,2,'2026-04-11 22:27:29','2026-04-11 22:27:32'),(83,33,115,12,1,'2026-04-12 07:25:06','2026-04-12 07:25:06'),(84,42,111,8,1,'2026-04-12 09:16:55','2026-04-12 09:16:55'),(85,42,117,14,1,'2026-04-12 09:17:02','2026-04-12 09:17:02'),(86,5,116,13,1,'2026-04-12 17:33:20','2026-04-12 17:33:20'),(87,41,125,22,1,'2026-04-12 21:10:05','2026-04-12 21:10:05'),(88,43,111,8,2,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(89,43,125,22,1,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(90,43,4,2,1,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(91,43,114,11,1,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(92,8,4,2,1,'2026-04-13 08:15:01','2026-04-13 08:15:01'),(93,8,125,22,1,'2026-04-13 08:15:09','2026-04-13 08:15:09'),(94,2,125,22,1,'2026-04-16 09:53:28','2026-04-16 09:53:28'),(95,2,114,11,1,'2026-04-16 09:53:35','2026-04-16 09:53:35'),(96,2,112,9,1,'2026-04-16 21:03:53','2026-04-16 21:03:53'),(97,41,129,26,1,'2026-04-18 13:12:01','2026-04-18 13:12:01');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_slug` varchar(255) NOT NULL,
  `category_icon` varchar(500) DEFAULT NULL,
  `level` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`category_slug`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (101,0,'Men\'s Fashion','mens-fashion','/image/category/1773484013285-Thoitrangnam.png',0,1,'2026-03-14 10:26:42','2026-03-26 04:10:48'),(103,101,'Áo Khoác','ao-khoac','',1,1,'2026-03-14 10:28:11','2026-03-14 10:28:11'),(104,101,'Áo Vest và Blazer','ao-vest-va-blazer','',1,1,'2026-03-14 10:31:13','2026-03-14 10:31:13'),(105,101,'Áo Hoodie, Áo Len & Áo Nỉ','ao-hoodie-ao-len-ao-ni','',1,1,'2026-03-14 10:31:26','2026-03-14 10:31:26'),(106,101,'Quần Jeans','quan-jeans','',1,1,'2026-03-14 10:32:25','2026-03-14 10:32:25'),(107,101,'Quần Dài/Quần Âu','quan-daiquan-au','',1,1,'2026-03-14 10:32:38','2026-03-14 10:32:38'),(108,101,'Quần Short','quan-short','',1,1,'2026-03-14 10:33:17','2026-03-14 10:33:17'),(109,101,'Áo','ao','',1,1,'2026-03-14 10:33:26','2026-03-14 10:33:26'),(110,101,'Áo Ba Lỗ','ao-ba-lo','',1,1,'2026-03-14 10:38:16','2026-03-14 10:38:16'),(111,101,'Đồ Lót','do-lot','',1,1,'2026-03-14 10:38:36','2026-03-14 10:38:36'),(112,101,'Đồ Ngủ','do-ngu','',1,1,'2026-03-14 10:41:33','2026-03-14 10:41:33'),(113,101,'Đồ Bộ','do-bo','',1,1,'2026-03-14 10:41:44','2026-03-14 10:41:44'),(114,101,'Vớ/Tất','votat','',1,1,'2026-03-14 10:41:59','2026-03-14 10:41:59'),(115,101,'Trang Phục Truyền Thống','trang-phuc-truyen-thong','',1,1,'2026-03-14 10:42:11','2026-03-14 10:42:11'),(116,101,'Costumes','costumes','/image/no-image.png',1,1,'2026-03-14 10:42:25','2026-03-26 10:20:21'),(117,101,'Professional Clothing','professional-clothing','/image/no-image.png',1,1,'2026-03-14 10:42:40','2026-03-26 10:20:01'),(118,101,'Other','other','/image/no-image.png',1,1,'2026-03-14 10:42:49','2026-03-26 10:19:43'),(119,101,'Men\'s Jewelry','mens-jewelry','/image/no-image.png',1,1,'2026-03-14 10:43:02','2026-03-26 10:18:13'),(120,101,'Men\'s Eyeglasses','mens-eyeglasses','/image/no-image.png',1,1,'2026-03-14 10:43:12','2026-03-26 10:15:47'),(121,101,'Men\'s Belts','mens-belts','/image/no-image.png',1,1,'2026-03-14 10:43:24','2026-03-26 10:06:33'),(122,101,'Ties and bow ties','ties-and-bow-ties','/image/no-image.png',1,1,'2026-03-14 10:43:36','2026-03-26 10:00:56'),(124,101,'Men\'s Accessories','mens-accessories','/image/no-image.png',1,1,'2026-03-14 10:52:01','2026-03-26 09:59:31'),(125,0,'Women\'s Fashion','womens-fashion','/image/category/1773485985156-thoitrangnu.png',0,1,'2026-03-14 10:59:34','2026-03-26 04:10:34'),(126,125,'Quần','quan','',1,1,'2026-03-14 11:01:20','2026-03-14 11:01:20'),(127,125,'Quần đùi','quan-dui','',1,1,'2026-03-14 11:01:31','2026-03-14 11:01:31'),(128,125,'Chân váy','chan-vay','',1,1,'2026-03-14 11:02:17','2026-03-14 11:02:17'),(129,125,'Quần jeans','quan-jeans','',1,1,'2026-03-14 11:02:37','2026-03-14 11:02:37'),(130,125,'Đầm/Váy','damvay','',1,1,'2026-03-14 11:03:06','2026-03-14 11:03:06'),(131,125,'Váy cưới','vay-cuoi','',1,1,'2026-03-14 11:03:36','2026-03-14 11:03:36'),(132,125,'Đồ liền thân','do-lien-than','',1,1,'2026-03-14 11:03:49','2026-03-14 11:03:49'),(133,125,'Áo khoác, Áo choàng & Vest','ao-khoac-ao-choang-vest','',1,1,'2026-03-14 11:04:00','2026-03-14 11:04:00'),(134,125,'Áo len & Cardigan','ao-len-cardigan','',1,1,'2026-03-14 11:04:09','2026-03-14 11:04:09'),(135,125,'Hoodie và Áo nỉ','hoodie-va-ao-ni','',1,1,'2026-03-14 11:04:25','2026-03-14 11:04:25'),(136,125,'Bộ','bo','',1,1,'2026-03-14 11:04:39','2026-03-14 11:04:39'),(137,125,'Đồ lót','do-lot','',1,1,'2026-03-14 11:04:47','2026-03-14 11:04:47'),(138,125,'Đồ ngủ','do-ngu','',1,1,'2026-03-14 11:05:02','2026-03-14 11:05:02'),(139,125,'Áo','ao','',1,1,'2026-03-14 11:05:16','2026-03-14 11:05:16'),(140,125,'Đồ tập','do-tap','',1,1,'2026-03-14 11:05:32','2026-03-14 11:05:32'),(141,125,'Đồ Bầu','do-bau','',1,1,'2026-03-14 11:05:42','2026-03-14 11:05:42'),(142,125,'Đồ truyền thống','do-truyen-thong','',1,1,'2026-03-14 11:05:53','2026-03-14 11:05:53'),(143,125,'Đồ hóa trang','do-hoa-trang','',1,1,'2026-03-14 11:06:03','2026-03-14 11:06:03'),(144,125,'Vải','vai','',1,1,'2026-03-14 11:06:23','2026-03-14 11:06:23'),(145,125,'Vớ/ Tất','vo-tat','',1,1,'2026-03-14 11:06:35','2026-03-14 11:06:35'),(146,125,'Khác','khac','',1,1,'2026-03-14 11:06:45','2026-03-14 11:06:45'),(147,0,'Phones & Accessories','phones-accessories','/image/category/1773486491750-dienthoaivaphukien.png',0,1,'2026-03-14 11:08:03','2026-03-26 04:10:18'),(148,147,'Điện thoại','dien-thoai','',1,1,'2026-03-14 11:08:30','2026-03-14 11:08:30'),(149,147,'Máy tính bảng','may-tinh-bang','',1,1,'2026-03-14 11:08:41','2026-03-14 11:08:41'),(150,147,'Pin Dự Phòng','pin-du-phong','',1,1,'2026-03-14 11:08:53','2026-03-14 11:08:53'),(151,147,'Pin Gắn Trong, Cáp và Bộ Sạc','pin-gan-trong-cap-va-bo-sac','',1,1,'2026-03-14 11:09:07','2026-03-14 11:09:07'),(152,147,'Ốp lưng, bao da, Miếng dán điện thoại','op-lung-bao-da-mieng-dan-dien-thoai','',1,1,'2026-03-14 11:09:17','2026-03-14 11:09:17'),(153,147,'Bảo vệ màn hình','bao-ve-man-hinh','',1,1,'2026-03-14 11:09:33','2026-03-14 11:09:33'),(154,147,'Đế giữ điện thoại','de-giu-dien-thoai','',1,1,'2026-03-14 11:09:44','2026-03-14 11:09:44'),(155,147,'Thẻ nhớ','the-nho','',1,1,'2026-03-14 11:09:59','2026-03-14 11:09:59'),(156,147,'Sim','sim','',1,1,'2026-03-14 11:10:07','2026-03-14 11:10:07'),(157,147,'Phụ kiện khác','phu-kien-khac','',1,1,'2026-03-14 11:10:26','2026-03-14 11:10:26'),(158,147,'Thiết bị khác','thiet-bi-khac','',1,1,'2026-03-14 11:10:40','2026-03-14 11:10:40'),(159,0,'Mother & Baby','mother-baby','/image/category/1773486740125-MevaBe.png',0,1,'2026-03-14 11:12:09','2026-03-26 04:09:58'),(160,159,'Đồ dùng du lịch cho bé','do-dung-du-lich-cho-be','',1,1,'2026-03-14 11:12:45','2026-03-14 11:12:45'),(161,159,'Đồ dùng ăn dặm cho bé','do-dung-an-dam-cho-be','',1,1,'2026-03-14 11:12:54','2026-03-14 11:12:54'),(162,159,'Phụ kiện cho mẹ','phu-kien-cho-me','',1,1,'2026-03-14 11:13:08','2026-03-14 11:13:08'),(163,159,'Chăm sóc sức khỏe mẹ','cham-soc-suc-khoe-me','',1,1,'2026-03-14 11:13:17','2026-03-14 11:13:17'),(164,159,'Đồ dùng phòng tắm & Chăm sóc cơ thể bé','do-dung-phong-tam-cham-soc-co-the-be','',1,1,'2026-03-14 11:13:33','2026-03-14 11:13:33'),(165,159,'Đồ dùng phòng ngủ cho bé','do-dung-phong-ngu-cho-be','',1,1,'2026-03-14 11:13:52','2026-03-14 11:13:52'),(166,159,'An toàn cho bé','an-toan-cho-be','',1,1,'2026-03-14 11:14:04','2026-03-14 11:14:04'),(167,159,'Thực phẩm cho bé','thuc-pham-cho-be','',1,1,'2026-03-14 11:14:15','2026-03-14 11:14:15'),(168,159,'Chăm sóc sức khỏe bé','cham-soc-suc-khoe-be','',1,1,'2026-03-14 11:14:23','2026-03-14 11:14:23'),(169,159,'Tã & bô em bé','ta-bo-em-be','',1,1,'2026-03-14 11:14:39','2026-03-14 11:14:39'),(170,159,'Đồ chơi','do-choi','',1,1,'2026-03-14 11:14:47','2026-03-14 11:14:47'),(171,159,'Bộ & Gói quà tặng','bo-goi-qua-tang','',1,1,'2026-03-14 11:14:57','2026-03-14 11:14:57'),(172,159,'Khác','khac','',1,1,'2026-03-14 11:15:07','2026-03-14 11:15:07'),(173,159,'Sữa công thức trên 24 tháng','sua-cong-thuc-tren-24-thang','',1,1,'2026-03-14 11:15:15','2026-03-14 11:15:15'),(174,159,'Sữa công thức 0-24 tháng tuổi','sua-cong-thuc-0-24-thang-tuoi','',1,1,'2026-03-14 11:15:28','2026-03-14 11:15:28'),(175,0,'Electronic Devices','electronic-devices','/image/category/1773658851522-thietbidientu.png',0,1,'2026-03-16 11:00:40','2026-03-26 04:09:41'),(176,175,'TV accessories','tv-accessories','/image/no-image.png',1,1,'2026-03-16 11:01:28','2026-03-26 09:52:30'),(177,175,'Game Console','game-console','/image/no-image.png',1,1,'2026-03-16 11:01:40','2026-03-26 09:52:14'),(178,175,'Console Accessories','console-accessories','/image/no-image.png',1,1,'2026-03-16 11:01:53','2026-03-26 09:49:05'),(179,175,'Game disc','game-disc','/image/no-image.png',1,1,'2026-03-16 11:02:04','2026-03-26 09:48:45'),(180,175,'Accessories','accessories','/image/no-image.png',1,1,'2026-03-16 11:02:16','2026-03-26 09:48:24'),(181,175,'Earphones','earphones','/image/no-image.png',1,1,'2026-03-16 11:02:45','2026-03-26 09:46:37'),(182,175,'Loudspeaker','loudspeaker','/image/no-image.png',1,1,'2026-03-16 11:02:56','2026-03-26 09:46:09'),(183,175,'Tivi','tivi','/image/no-image.png',1,1,'2026-03-16 11:03:09','2026-04-03 09:45:39'),(184,175,'Tivi Box','tivi-box','',1,1,'2026-03-16 11:03:18','2026-03-16 11:03:18'),(185,175,'Headphones','headphones','',1,1,'2026-03-16 11:03:26','2026-03-16 11:03:26'),(186,0,'Home & Living','home-living','/image/category/1773659052669-NhaCuaVaDoiSong.png',0,1,'2026-03-16 11:04:01','2026-03-26 04:09:26'),(187,186,'Chăn, Ga, Gối & Nệm','chan-ga-goi-nem','',1,1,'2026-03-16 11:04:21','2026-03-16 11:04:21'),(188,186,'Đồ nội thất','do-noi-that','',1,1,'2026-03-16 11:04:30','2026-03-16 11:04:30'),(189,186,'Trang trí nhà cửa','trang-tri-nha-cua','',1,1,'2026-03-16 11:04:39','2026-03-16 11:04:39'),(190,186,'Dụng cụ & Thiết bị tiện ích','dung-cu-thiet-bi-tien-ich','',1,1,'2026-03-16 11:04:47','2026-03-16 11:04:47'),(191,186,'Đồ dùng nhà bếp và hộp đựng thực phẩm','do-dung-nha-bep-va-hop-dung-thuc-pham','',1,1,'2026-03-16 11:04:56','2026-03-16 11:04:56'),(192,186,'Đèn','den','',1,1,'2026-03-16 11:05:11','2026-03-16 11:05:11'),(193,186,'Ngoài trời & Sân vườn','ngoai-troi-san-vuon','',1,1,'2026-03-16 11:05:19','2026-03-16 11:05:19'),(194,186,'Đồ dùng phòng tắm','do-dung-phong-tam','',1,1,'2026-03-16 11:05:28','2026-03-16 11:05:28'),(195,186,'Vật phẩm thờ cúng','vat-pham-tho-cung','',1,1,'2026-03-16 11:05:37','2026-03-16 11:05:37'),(196,186,'Đồ trang trí tiệc','do-trang-tri-tiec','',1,1,'2026-03-16 11:05:48','2026-03-16 11:05:48'),(197,186,'Chăm sóc nhà cửa và giặt ủi','cham-soc-nha-cua-va-giat-ui','',1,1,'2026-03-16 11:05:59','2026-03-16 11:05:59'),(198,186,'Sắp xếp nhà cửa','sap-xep-nha-cua','',1,1,'2026-03-16 11:06:08','2026-03-16 11:06:08'),(199,186,'Dụng cụ pha chế','dung-cu-pha-che','',1,1,'2026-03-16 11:06:18','2026-03-16 11:06:18'),(200,186,'Tinh dầu thơm phòng','tinh-dau-thom-phong','',1,1,'2026-03-16 11:06:26','2026-03-16 11:06:26'),(202,0,'Computers & Laptops','computers-laptops','/image/category/1773659281290-maytinhvalaptop.png',0,1,'2026-03-16 11:07:49','2026-04-04 12:55:01'),(204,203,'Sách tiếng Việt','sach-tieng-viet',NULL,1,1,'2026-03-22 14:27:20','2026-03-22 14:27:20'),(205,186,'Đồ dùng phòng ăn','do-dung-phong-an','/image/no-image.png',1,1,'2026-03-25 12:03:15','2026-03-25 12:18:17'),(206,202,'Máy Tính Bàn','may-tinh-ban','',1,1,'2026-03-25 12:19:14','2026-03-25 12:19:14'),(207,202,'Màn Hình','man-hinh','',1,1,'2026-03-25 12:19:55','2026-03-25 12:19:55'),(208,202,'Linh Kiện Máy Tính','linh-kien-may-tinh','',1,1,'2026-03-25 12:20:07','2026-03-25 12:20:07'),(209,202,'Thiết Bị Lưu Trữ','thiet-bi-luu-tru','',1,1,'2026-03-25 12:20:18','2026-03-25 12:20:18'),(210,202,'Thiết Bị Mạng','thiet-bi-mang','',1,1,'2026-03-25 12:20:27','2026-03-25 12:20:27'),(211,202,'Máy In, Máy Scan & Máy Chiếu','may-in-may-scan-may-chieu','',1,1,'2026-03-25 12:24:05','2026-03-25 12:24:05'),(212,202,'Phụ Kiện Máy Tính','phu-kien-may-tinh','',1,1,'2026-03-25 12:24:16','2026-03-25 12:24:16'),(213,0,' Beauty','beauty','/image/category/1774926816954-SacDep.png',0,1,'2026-03-31 02:55:25','2026-03-31 03:13:23'),(214,0,'Nhà sách','nha-sách',NULL,0,1,'2026-04-12 12:10:20','2026-04-12 12:10:20');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_attribute`
--

DROP TABLE IF EXISTS `category_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_attribute` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `attribute_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_attribute`
--

LOCK TABLES `category_attribute` WRITE;
/*!40000 ALTER TABLE `category_attribute` DISABLE KEYS */;
INSERT INTO `category_attribute` VALUES (1,12,12,1),(2,12,1,1),(3,12,8,1),(4,12,13,1),(5,183,1,1),(18,183,4,1),(19,183,17,1),(20,183,18,1),(21,183,19,1),(22,183,20,1),(25,124,4,1),(26,148,4,1),(27,109,4,1),(28,185,4,1),(29,124,23,1),(30,124,10,1);
/*!40000 ALTER TABLE `category_attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_brand`
--

DROP TABLE IF EXISTS `category_brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_brand` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `brand_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_brand`
--

LOCK TABLES `category_brand` WRITE;
/*!40000 ALTER TABLE `category_brand` DISABLE KEYS */;
INSERT INTO `category_brand` VALUES (3,183,5,1),(4,183,7,1),(5,183,6,1),(6,183,11,1),(7,183,9,1),(9,183,10,1),(10,183,8,1),(11,185,7,1),(12,185,4,1);
/*!40000 ALTER TABLE `category_brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation` (
  `conversation_id` bigint NOT NULL AUTO_INCREMENT,
  `buyer_id` bigint NOT NULL,
  `shop_id` bigint NOT NULL,
  `last_message` text,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  UNIQUE KEY `unique_conversation` (`buyer_id`,`shop_id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_shop_id` (`shop_id`),
  CONSTRAINT `conversation_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation`
--

LOCK TABLES `conversation` WRITE;
/*!40000 ALTER TABLE `conversation` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flash_sale`
--

DROP TABLE IF EXISTS `flash_sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flash_sale` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `sale_price` decimal(15,2) NOT NULL,
  `stock_quantity` int NOT NULL,
  `sold_quantity` int DEFAULT '0',
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_time` (`start_time`,`end_time`),
  CONSTRAINT `flash_sale_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flash_sale`
--

LOCK TABLES `flash_sale` WRITE;
/*!40000 ALTER TABLE `flash_sale` DISABLE KEYS */;
/*!40000 ALTER TABLE `flash_sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `message_text` text,
  `image_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`conversation_id`) ON DELETE CASCADE,
  CONSTRAINT `message_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` enum('order','promotion','shop','system') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `shipment_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `variant_id` bigint DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  `image` varchar(100) DEFAULT NULL,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `total_price` double NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shop_id` bigint NOT NULL,
  `final_quantity` int DEFAULT NULL COMMENT 'So luong chot sau khi buyer chap nhan dieu chinh',
  `is_adjusted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 neu item da duoc dieu chinh so luong',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `fk_item_shipment` (`shipment_id`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `order_item_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=945 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (913,447,402,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-12 13:36:16',2,NULL,0),(914,447,402,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-12 13:36:16',2,NULL,0),(915,447,403,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-12 13:36:16',1,NULL,0),(916,448,404,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-12 14:11:41',1,NULL,0),(917,448,404,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-12 14:11:41',1,NULL,0),(918,448,405,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-12 14:11:41',2,NULL,0),(919,449,406,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-12 15:09:14',1,NULL,0),(920,449,407,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-12 15:09:14',2,NULL,0),(921,449,407,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-12 15:09:14',2,NULL,0),(922,451,408,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-12 15:15:37',1,NULL,0),(923,451,408,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-12 15:15:37',1,NULL,0),(924,451,409,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-12 15:15:37',2,NULL,0),(925,452,410,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-13 01:16:15',1,NULL,0),(926,452,410,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-13 01:16:15',1,NULL,0),(927,452,411,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-13 01:16:15',2,NULL,0),(928,452,411,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-13 01:16:15',2,NULL,0),(929,453,412,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-16 02:46:01',1,NULL,0),(930,453,412,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',6190000,3,18570000,'2026-04-16 02:46:01',1,NULL,0),(931,453,413,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-16 02:46:01',2,NULL,0),(932,454,414,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-16 02:55:01',1,NULL,0),(933,454,414,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-16 02:55:01',1,NULL,0),(934,454,415,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-16 02:55:01',2,NULL,0),(935,461,418,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-18 03:28:50',1,NULL,0),(936,461,418,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-18 03:28:50',1,NULL,0),(937,461,418,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-18 03:28:50',1,NULL,0),(938,461,419,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-18 03:28:50',2,NULL,0),(939,461,419,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-18 03:28:50',2,NULL,0),(940,462,420,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-18 03:56:21',1,NULL,0),(941,462,420,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-18 03:56:21',1,NULL,0),(942,462,420,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-18 03:56:21',1,NULL,0),(943,462,421,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-18 03:56:21',2,NULL,0),(944,462,421,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-18 03:56:21',2,NULL,0);
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_shipment`
--

DROP TABLE IF EXISTS `order_shipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_shipment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `shop_id` bigint NOT NULL,
  `carrier_name` varchar(255) NOT NULL,
  `shipping_fee` double NOT NULL DEFAULT '0',
  `tracking_number` varchar(255) DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `shipping_status` varchar(255) NOT NULL,
  `estimated_delivery_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `business_status` varchar(50) NOT NULL DEFAULT 'NORMAL' COMMENT 'NORMAL|ADJUSTMENT_PENDING_BUYER|ADJUSTMENT_ACCEPTED|ADJUSTMENT_REJECTED|CANCELLED_BY_OOS',
  `latest_adjustment_request_id` bigint DEFAULT NULL,
  `adjusted_total_amount` decimal(15,2) DEFAULT NULL,
  `adjustment_required` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tracking_number` (`tracking_number`),
  KEY `idx_order_id` (`order_id`),
  KEY `fk_order_shipment_latest_adjustment` (`latest_adjustment_request_id`),
  CONSTRAINT `fk_order_shipment_latest_adjustment` FOREIGN KEY (`latest_adjustment_request_id`) REFERENCES `shipment_adjustment_request` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_shipment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=422 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_shipment`
--

LOCK TABLES `order_shipment` WRITE;
/*!40000 ALTER TABLE `order_shipment` DISABLE KEYS */;
INSERT INTO `order_shipment` VALUES (402,447,2,'LOG',50000,'LOG66796BE8',2665000,'IN_TRANSIT',NULL,'2026-04-12 13:36:16','2026-04-12 14:14:44','NORMAL',NULL,NULL,0),(403,447,1,'LOG',25000,'LOG034EEC52',26815000,'PICKED_UP',NULL,'2026-04-12 13:36:16','2026-04-12 13:40:39','NORMAL',NULL,NULL,0),(404,448,1,'LOG',50000,'LOGAD1962D8',5246500,'CONFIRMED',NULL,'2026-04-12 14:11:41','2026-04-12 14:13:51','NORMAL',NULL,NULL,0),(405,448,2,'LOG',25000,NULL,32000,'PENDING',NULL,'2026-04-12 14:11:41','2026-04-12 14:11:41','NORMAL',NULL,NULL,0),(406,449,1,'LOG',50000,'LOG8AD35EEA',56500,'PICKED_UP',NULL,'2026-04-12 15:09:14','2026-04-13 00:33:02','NORMAL',NULL,NULL,0),(407,449,2,'LOG',50000,NULL,635000,'PENDING',NULL,'2026-04-12 15:09:14','2026-04-12 15:09:14','NORMAL',NULL,NULL,0),(408,451,1,'LOG',50000,'LOGD3AFCA14',5429000,'CONFIRMED',NULL,'2026-04-12 15:15:37','2026-04-12 15:17:36','NORMAL',NULL,NULL,0),(409,451,2,'LOG',0,NULL,7000,'PENDING',NULL,'2026-04-12 15:15:37','2026-04-12 15:15:37','NORMAL',NULL,NULL,0),(410,452,1,'LOG',50000,NULL,5429000,'PENDING',NULL,'2026-04-13 01:16:15','2026-04-13 01:16:15','NORMAL',NULL,NULL,0),(411,452,2,'LOG',50000,'LOG1D8C5C87',2665000,'CONFIRMED',NULL,'2026-04-13 01:16:15','2026-04-13 01:17:43','NORMAL',NULL,NULL,0),(412,453,1,'LOG',0,NULL,18759000,'PENDING',NULL,'2026-04-16 02:46:01','2026-04-16 03:17:30','ADJUSTMENT_PENDING_BUYER',1,NULL,1),(413,453,2,'LOG',0,NULL,14000,'PENDING',NULL,'2026-04-16 02:46:01','2026-04-16 02:46:01','NORMAL',NULL,NULL,0),(414,454,1,'LOG',50000,'LOG6643E846',26846500,'CONFIRMED',NULL,'2026-04-16 02:55:01','2026-04-16 02:57:05','NORMAL',NULL,NULL,0),(415,454,2,'LOG',25000,NULL,39000,'PENDING',NULL,'2026-04-16 02:55:01','2026-04-16 02:55:01','NORMAL',NULL,NULL,0),(418,461,1,'LOG',0,'LOG986D5A2E',31986500,'CONFIRMED',NULL,'2026-04-18 03:28:50','2026-04-19 01:16:03','NORMAL',NULL,NULL,0),(419,461,2,'LOG',0,NULL,585000,'PENDING',NULL,'2026-04-18 03:28:50','2026-04-18 03:28:50','NORMAL',NULL,NULL,0),(420,462,1,'LOG',50000,'LOG3C8366E4',32036500,'CONFIRMED',NULL,'2026-04-18 03:56:21','2026-04-19 01:19:03','NORMAL',NULL,NULL,0),(421,462,2,'LOG',50000,NULL,635000,'PENDING',NULL,'2026-04-18 03:56:21','2026-04-18 03:56:21','NORMAL',NULL,NULL,0);
/*!40000 ALTER TABLE `order_shipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_shipment_status_history`
--

DROP TABLE IF EXISTS `order_shipment_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_shipment_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_shipment_id` bigint NOT NULL,
  `old_status` varchar(255) DEFAULT NULL,
  `new_status` varchar(255) NOT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `changed_by` varchar(100) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_shipment_status_history_shipment_id` (`order_shipment_id`),
  KEY `idx_order_shipment_status_history_changed_at` (`changed_at`),
  CONSTRAINT `fk_order_shipment_status_history_shipment` FOREIGN KEY (`order_shipment_id`) REFERENCES `order_shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_shipment_status_history`
--

LOCK TABLES `order_shipment_status_history` WRITE;
/*!40000 ALTER TABLE `order_shipment_status_history` DISABLE KEYS */;
INSERT INTO `order_shipment_status_history` VALUES (2,403,'PENDING','CONFIRMED','2026-04-12 13:38:45','root','status changed from order_shipment update'),(3,403,'CONFIRMED','PICKED_UP','2026-04-12 13:40:39','root','status changed from order_shipment update'),(4,402,'PENDING','CONFIRMED','2026-04-12 13:56:15','root','status changed from order_shipment update'),(5,402,'CONFIRMED','PICKED_UP','2026-04-12 14:08:58','root','status changed from order_shipment update'),(6,404,'PENDING','CONFIRMED','2026-04-12 14:13:51','root','status changed from order_shipment update'),(7,402,'PICKED_UP','IN_TRANSIT','2026-04-12 14:14:44','root','status changed from order_shipment update'),(8,408,'PENDING','CONFIRMED','2026-04-12 15:17:36','root','status changed from order_shipment update'),(9,406,'PENDING','CONFIRMED','2026-04-13 07:32:31','SYSTEM','status changed by confirm-packaged'),(10,406,'PENDING','CONFIRMED','2026-04-13 00:32:30','root','status changed from order_shipment update'),(11,406,'CONFIRMED','PICKED_UP','2026-04-13 07:33:02','SYSTEM','status changed from logistics event'),(12,406,'CONFIRMED','PICKED_UP','2026-04-13 00:33:02','root','status changed from order_shipment update'),(13,410,NULL,'PENDING','2026-04-13 01:16:15','root','pending - waiting shop confirmation'),(14,411,NULL,'PENDING','2026-04-13 01:16:15','root','pending - waiting shop confirmation'),(16,411,'PENDING','CONFIRMED','2026-04-13 01:17:43','root','status changed from order_shipment update'),(17,412,NULL,'PENDING','2026-04-16 02:46:01','root','pending - waiting shop confirmation'),(18,413,NULL,'PENDING','2026-04-16 02:46:01','root','pending - waiting shop confirmation'),(19,414,NULL,'PENDING','2026-04-16 02:55:01','root','pending - waiting shop confirmation'),(20,415,NULL,'PENDING','2026-04-16 02:55:01','root','pending - waiting shop confirmation'),(21,414,'PENDING','CONFIRMED','2026-04-16 02:57:05','root','status changed from order_shipment update'),(24,418,NULL,'PENDING','2026-04-18 03:28:50','avnadmin','pending - waiting shop confirmation'),(25,419,NULL,'PENDING','2026-04-18 03:28:50','avnadmin','pending - waiting shop confirmation'),(26,420,NULL,'PENDING','2026-04-18 03:56:21','avnadmin','pending - waiting shop confirmation'),(27,421,NULL,'PENDING','2026-04-18 03:56:21','avnadmin','pending - waiting shop confirmation'),(28,418,'PENDING','CONFIRMED','2026-04-19 01:16:03','avnadmin','status changed from order_shipment update'),(29,420,'PENDING','CONFIRMED','2026-04-19 01:19:03','avnadmin','status changed from order_shipment update');
/*!40000 ALTER TABLE `order_shipment_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  `address_id` bigint NOT NULL,
  `total_amount` double NOT NULL,
  `shipping_fee` bigint NOT NULL,
  `discount_amount` bigint NOT NULL,
  `final_amount` bigint NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `order_status` varchar(255) NOT NULL,
  `note` text,
  `voucher_id` bigint DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `cancelled_reason` text,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `address_id` (`address_id`),
  KEY `voucher_id` (`voucher_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`order_status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=463 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (447,'ORD202503180011D05D3BE',1,7,29405000,75000,0,29480000,'cod','PENDING','SHIPPED',NULL,NULL,'LOG66796BE8',NULL,NULL,NULL,'2026-04-12 13:36:16','2026-04-12 14:08:58'),(448,'ORD20250318001FFE91440',1,14,5203500,75000,0,5278500,'cod','PENDING','CONFIRMED',NULL,NULL,'LOGAD1962D8',NULL,NULL,NULL,'2026-04-12 14:11:41','2026-04-12 14:13:51'),(449,'ORD202503180012F8494E5',1,15,591500,100000,0,691500,'cod','PENDING','SHIPPED',NULL,NULL,'LOG8AD35EEA',NULL,NULL,NULL,'2026-04-12 15:09:14','2026-04-13 00:33:02'),(451,'ORD202503180011D075260',1,16,5386000,50000,0,5436000,'cod','PENDING','CONFIRMED',NULL,NULL,'LOGD3AFCA14',NULL,NULL,NULL,'2026-04-12 15:15:37','2026-04-12 15:17:36'),(452,'ORD20250318001ECFC6787',1,7,7994000,100000,0,8094000,'cod','PENDING','CONFIRMED',NULL,NULL,'LOG1D8C5C87',NULL,NULL,NULL,'2026-04-13 01:16:15','2026-04-13 01:17:43'),(453,'ORD20250318001655AA577',1,7,18773000,0,0,18773000,'cod','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-16 02:46:01','2026-04-16 02:46:01'),(454,'ORD20250318001F8CB0FDA',1,15,26810500,75000,0,26885500,'cod','PENDING','CONFIRMED',NULL,NULL,'LOG6643E846',NULL,NULL,NULL,'2026-04-16 02:55:00','2026-04-16 02:57:06'),(461,'ORD2025031800118AAB870',1,14,32571500,0,0,32571500,'cod','PENDING','CONFIRMED',NULL,NULL,'LOG986D5A2E',NULL,NULL,NULL,'2026-04-18 03:28:50','2026-04-19 01:16:03'),(462,'ORD20250318001BFE3C461',1,14,32571500,100000,0,32671500,'cod','PENDING','CONFIRMED',NULL,NULL,'LOG3C8366E4',NULL,NULL,NULL,'2026-04-18 03:56:21','2026-04-19 01:19:03');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `shop_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `product_name` varchar(500) NOT NULL,
  `product_slug` varchar(500) NOT NULL,
  `description` text,
  `price` decimal(15,2) NOT NULL,
  `original_price` decimal(15,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `sold_count` int DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '0.00',
  `review_count` bigint DEFAULT '0',
  `weight` bigint DEFAULT NULL,
  `length` bigint DEFAULT NULL,
  `width` bigint DEFAULT NULL,
  `height` bigint DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `status` varchar(20) DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (4,1,12,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','csfdxgc-gfjcrh','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',980000.00,NULL,2,0,0.00,0,700,2000,5000,2500,NULL,1,'ACTIVE','2026-03-10 12:55:58','2026-04-06 10:40:41'),(109,1,50,'Hosting chất lượng cao','hosting-chat-luong-cao','',999000.00,9.00,0,0,0.00,0,2000,2000,2000,2000,NULL,1,'PENDING','2026-03-10 13:11:56','2026-04-06 10:42:17'),(110,1,50,'Ốp lưng MagSafe iPhone 15','op-lung-magsafe-iphone-15','',125000.00,12500.00,0,0,0.00,0,900,2000,1500,3000,NULL,1,'PENDING','2026-03-10 13:15:05','2026-04-06 10:42:17'),(111,1,175,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','may-khoan-dong-luc-dung-pin-20v-dewalt-dcd1007n-b1','',4190000.00,0.00,0,0,0.00,0,800,500,1000,2000,NULL,1,'PENDING','2026-03-10 14:46:01','2026-04-08 08:42:05'),(112,1,50,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','tai-nghe-bluetooth-55-pin-20h-b02-ket-noi-2-dien-thoai','',65000.00,6500.00,0,0,0.00,0,1000,1000,3000,3000,NULL,1,'PENDING','2026-03-10 15:04:36','2026-04-06 10:42:17'),(113,1,50,'60W 5A 3-12V Nguồn Adapter điều chỉnh điện áp / tốc độ / nhiệt độ EU 100-240V chất lượng tốt','60w-5a-3-12v-nguon-adapter-dieu-chinh-dien-ap-toc-do-nhiet-do-eu-100-240v-chat-luong-tot','',118800.00,11880.00,0,0,0.00,0,5000,5000,5000,5000,NULL,1,'PENDING','2026-03-13 11:57:39','2026-04-06 10:42:17'),(114,2,198,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','dau-chuyen-doi-may-siet-bulong-sang-khoan-13mm-chuyen-doi-tu-bulong-12-sang-khoan-hang-cao-capben-bi','',70000.00,7000.00,0,0,0.00,0,10000,2500,2500,3000,NULL,1,'PENDING','2026-03-22 13:36:32','2026-04-08 03:42:49'),(115,2,204,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','sach-lap-trinh-huong-doi-tuong-java-core-danh-cho-nguoi-moi-bat-dau-hoc-lap-trinh','',289000.00,289000.00,0,0,0.00,0,8000,600,5000,5000,NULL,1,'PENDING','2026-03-22 14:30:10','2026-04-08 03:43:33'),(116,1,183,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','google-tv-philips-43-inch-fullhd-led-43pft6509-hang-chinh-hang','',6190000.00,6809000.00,0,0,0.00,0,NULL,NULL,NULL,NULL,NULL,1,'PENDING','2026-04-09 12:36:51','2026-04-12 05:03:55'),(117,1,183,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','tivi-philips-mediasuite-65hfl5214u-hang-chinh-hang','',26790000.00,29469000.00,0,0,0.00,0,NULL,NULL,NULL,NULL,NULL,1,'PENDING','2026-04-09 12:40:30','2026-04-12 05:03:00'),(125,1,148,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','dien-thoai-samsung-galaxy-a26-5g-8128gb-mat-lung-kinh-ai-circle-to-search-camera-hdr-chup-dem-sang-ro-hang-chinh-hang','',5190000.00,519000.00,0,0,0.00,0,NULL,NULL,NULL,NULL,NULL,1,'PENDING','2026-04-12 12:21:06','2026-04-12 12:21:06'),(126,1,148,'Điện Thoại Samsung Galaxy A16 5G (4GB/128GB) -  Đã Kích Hoạt Bảo Hành Điện Tử -  Hàng Chính Hãng','dien-thoai-samsung-galaxy-a16-5g-4gb128gb-da-kich-hoat-bao-hanh-dien-tu-hang-chinh-hang','',4990000.00,499000.00,0,0,0.00,0,800,12,9,10,NULL,1,'PENDING','2026-04-18 04:37:31','2026-04-18 04:37:31'),(127,1,191,'Nồi Chiên Không Dầu Philips HD9280 /90 Essential size XL Digital Connected - Hàng Chính Hãng','noi-chien-khong-dau-philips-hd9280-90-essential-size-xl-digital-connected-hang-chinh-hang','',2475000.00,247500.00,15,0,0.00,0,7,30,30,50,NULL,1,'PENDING','2026-04-18 04:52:16','2026-04-18 04:52:16'),(128,1,186,'Bình giữ nhiệt METRO CAFE TUMBLER LocknLock LHC4359 - Dung tích 650ml','binh-giu-nhiet-metro-cafe-tumbler-locknlock-lhc4359-dung-tich-650ml','',424000.00,42400.00,19,0,0.00,0,450,17,7,7,NULL,1,'PENDING','2026-04-18 05:00:09','2026-04-18 05:00:09'),(129,1,180,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','mach-sac-pin-1s-37v-lithium-18650-usb-type-c-1a-tp4056-co-ic-bao-ve-dong-cao-cap-sac-xa-an-toan','',11900.00,1190.00,1000,0,0.00,0,20,5,5,5,NULL,1,'PENDING','2026-04-18 05:04:58','2026-04-18 05:04:58');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attribute`
--

DROP TABLE IF EXISTS `product_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_attribute` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `attribute_id` int NOT NULL,
  `attribute_value_id` int DEFAULT NULL,
  `value_text` text,
  `value_number` decimal(15,4) DEFAULT NULL,
  `value_date` date DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attribute`
--

LOCK TABLES `product_attribute` WRITE;
/*!40000 ALTER TABLE `product_attribute` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_image`
--

DROP TABLE IF EXISTS `product_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_image` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `display_order` int DEFAULT '0',
  `is_thumbnail` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `product_image_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_image`
--

LOCK TABLES `product_image` WRITE;
/*!40000 ALTER TABLE `product_image` DISABLE KEYS */;
INSERT INTO `product_image` VALUES (9,4,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1768728032/ntpuzzwfqrdtpqkodfii.jpg',0,0,'2026-01-18 09:20:34'),(11,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1768736560/pbgf6h5xpedlrloz8ivi.jpg',0,0,'2026-01-18 11:42:41'),(12,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1768736716/luiljyqal1ulflbtvhv6.jpg',0,0,'2026-01-18 11:45:17'),(13,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1768740515/te17hgwd5lwmtojods8k.jpg',0,0,'2026-01-18 12:48:36'),(15,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769262639/pfelstatu2oxzyrbjtu6.png',0,0,'2026-01-24 13:50:40'),(16,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769262710/nb400ehdevejjsx3pdt6.png',0,0,'2026-01-24 13:51:51'),(17,24,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769264250/cotk5hxlpcxxxfo3jxij.png',0,0,'2026-01-24 14:17:31'),(18,25,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769264783/qjyzjdxyvqtlxhvcxqts.png',0,0,'2026-01-24 14:26:24'),(19,25,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769264785/bcawkqnzqc0r5blx4qmi.png',0,0,'2026-01-24 14:26:26'),(20,32,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',0,0,'2026-01-25 12:54:50'),(21,33,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769346480/vlsmnlglrp3o2c5fhudu.jpg',0,0,'2026-01-25 13:08:00'),(22,34,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769348663/gvj0kwzqqa74oliytirb.jpg',0,0,'2026-01-25 13:44:24'),(23,35,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769348744/xfd3bzcvjzxult1bfwf5.jpg',0,0,'2026-01-25 13:45:45'),(24,36,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769348940/cb5fotim05m7qtm1p0cq.jpg',0,0,'2026-01-25 13:49:01'),(25,37,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769948126/ipo6c2iwsls7tgulx0vi.png',0,0,'2026-02-01 12:15:27'),(26,38,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769950883/g2oev0rptvfh2hsygghv.webp',0,0,'2026-02-01 13:01:24'),(29,109,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773148318/hjmrika0uexxviqjo8u8.png',0,0,'2026-03-10 13:11:59'),(30,110,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773148507/yv8pqkhstzzx4sxnuae9.webp',0,0,'2026-03-10 13:15:07'),(31,111,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',0,0,'2026-03-10 14:46:03'),(32,112,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',0,0,'2026-03-10 15:04:39'),(33,113,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773403061/pislb09dvnecogzzl272.webp',0,0,'2026-03-13 11:57:42'),(41,114,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',0,0,'2026-03-22 13:36:35'),(42,115,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',0,0,'2026-03-22 14:30:12'),(43,116,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',0,0,'2026-04-09 12:36:53'),(44,117,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',0,0,'2026-04-09 12:40:33'),(52,125,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/xmhmsp50bbyx9audu8ni.webp',0,0,'2026-04-12 12:21:08'),(53,126,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776487052/ufwxl8khabs5ey4brolu.webp',0,0,'2026-04-18 04:37:33'),(54,127,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776487937/u7jjx6ioij4elavvy7qh.webp',0,0,'2026-04-18 04:52:18'),(55,128,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488410/agkcedarws1wbyi1iami.webp',0,0,'2026-04-18 05:00:10'),(56,128,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488411/s4su5huhebeomxfn15fv.webp',0,0,'2026-04-18 05:00:12'),(57,129,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/cytfeaufzzvg7aw049dh.webp',0,0,'2026-04-18 05:05:00');
/*!40000 ALTER TABLE `product_image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_review`
--

DROP TABLE IF EXISTS `product_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `is_anonymous` tinyint(1) DEFAULT '0',
  `shop_reply` text,
  `shop_replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `product_review_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_review_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `product_review_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `product_review_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_review`
--

LOCK TABLES `product_review` WRITE;
/*!40000 ALTER TABLE `product_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variant`
--

DROP TABLE IF EXISTS `product_variant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variant` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `variant_name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `width` bigint DEFAULT NULL,
  `weight` bigint DEFAULT NULL,
  `height` bigint DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_sku` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variant`
--

LOCK TABLES `product_variant` WRITE;
/*!40000 ALTER TABLE `product_variant` DISABLE KEYS */;
INSERT INTO `product_variant` VALUES (1,4,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','dfkaww',219000.00,10,5,700,20,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',1,'2026-02-06 14:01:29','2026-04-11 05:26:05'),(2,4,'Động Cơ Motor Giảm Tốc 36GP - 555 BCD','sdxsd',189000.00,10,5,700,20,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',1,'2026-02-07 13:48:39','2026-04-11 05:26:05'),(8,111,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','SKU-111',4190000.00,12,1000,800,2000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',1,'2026-03-10 14:46:01','2026-04-09 04:08:48'),(9,112,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','SKU-112',6500.00,8,3000,1000,3000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',1,'2026-03-10 15:04:36','2026-04-09 04:08:48'),(10,113,'60W 5A 3-12V Nguồn Adapter điều chỉnh điện áp / tốc độ / nhiệt độ EU 100-240V chất lượng tốt','SKU-113',11880.00,9,5000,5000,5000,'',1,'2026-03-13 11:57:39','2026-04-09 04:08:48'),(11,114,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','SKU-114',7000.00,67,10000,10000,10000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',1,'2026-03-22 13:36:32','2026-04-09 04:08:48'),(12,115,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','SKU-115',289000.00,45,5,500,20,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',1,'2026-03-22 14:30:10','2026-04-10 03:13:25'),(13,116,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','SKU-116',6190000.00,80,2000,9000,5000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',1,'2026-04-09 12:36:51','2026-04-10 02:46:09'),(14,117,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','SKU-117',26790000.00,80,20000,13000,12000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',1,'2026-04-09 12:40:30','2026-04-12 05:20:13'),(22,125,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','SKU-125',5190000.00,0,NULL,NULL,NULL,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',1,'2026-04-12 12:21:06','2026-04-12 14:10:55'),(23,126,'Điện Thoại Samsung Galaxy A16 5G (4GB/128GB) -  Đã Kích Hoạt Bảo Hành Điện Tử -  Hàng Chính Hãng','SKU-126',499000.00,0,NULL,NULL,NULL,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776487052/kuepur2wblnr8fpvtwbg.webp',1,'2026-04-18 04:37:31','2026-04-18 04:37:33'),(24,127,'Nồi Chiên Không Dầu Philips HD9280 /90 Essential size XL Digital Connected - Hàng Chính Hãng','SKU-127',247500.00,15,NULL,NULL,NULL,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776487937/qjxvuhl8tnlatefelzhg.webp',1,'2026-04-18 04:52:16','2026-04-18 04:52:18'),(25,128,'Bình giữ nhiệt METRO CAFE TUMBLER LocknLock LHC4359 - Dung tích 650ml','SKU-128',42400.00,19,7,450,17,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488410/lehkxlojm9l8wjtkvaha.webp',1,'2026-04-18 05:00:09','2026-04-18 05:01:11'),(26,129,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','SKU-129',1190.00,1000,5,20,5,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1,'2026-04-18 05:04:58','2026-04-18 05:05:00');
/*!40000 ALTER TABLE `product_variant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_image`
--

DROP TABLE IF EXISTS `review_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_image` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `review_id` bigint NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_review_id` (`review_id`),
  CONSTRAINT `review_image_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `product_review` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_image`
--

LOCK TABLES `review_image` WRITE;
/*!40000 ALTER TABLE `review_image` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_history`
--

DROP TABLE IF EXISTS `search_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `search_query` varchar(500) NOT NULL,
  `result_count` int DEFAULT '0',
  `searched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_searched_at` (`searched_at`),
  CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_history`
--

LOCK TABLES `search_history` WRITE;
/*!40000 ALTER TABLE `search_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `search_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller`
--

DROP TABLE IF EXISTS `seller`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `shop_description` text,
  `shop_logo` varchar(500) DEFAULT NULL,
  `shop_banner` varchar(500) DEFAULT NULL,
  `business_license` varchar(255) DEFAULT NULL,
  `tax_code` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `rejection_reason` text,
  `rating` double DEFAULT '0',
  `total_products` int DEFAULT '0',
  `total_orders` int DEFAULT '0',
  `response_rate` double DEFAULT '0',
  `response_time` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller`
--

LOCK TABLES `seller` WRITE;
/*!40000 ALTER TABLE `seller` DISABLE KEYS */;
INSERT INTO `seller` VALUES (1,2,'Nguyen Van A','contact@zara.vn','0901234567','ZARA International','123 Dong Khoi, Quan 1, TP.HCM','https://ui-avatars.com/api/?name=ZARA&background=000&color=fff&length=1',NULL,'BL001','Tax001','ACTIVE',NULL,4.5,865,4500,95.5,120,'2023-01-15 08:00:00','2026-03-25 22:16:18',NULL,NULL),(2,3,'Lee Byung','sales@samsung.vn','0909888777','Samsung Official','Khu Cong Nghe Cao, TP. Thu Duc','https://ui-avatars.com/api/?name=Samsung&background=034EA2&color=fff&length=1',NULL,'BL002','Tax002','ACTIVE',NULL,4.8,420,12000,98,60,'2023-02-20 10:00:00','2023-02-20 10:00:00',NULL,NULL),(3,4,'Tran Thi B','vn.rolex@autho.com','0911223344','Rolex Watch','Trang Tien Plaza, Ha Noi','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773154033/sellers/logos/cnwsgneraamwbqgknrns.png',NULL,'BL003','Tax003','ACTIVE',NULL,4.9,50,120,85,180,'2024-02-10 14:30:00','2026-03-25 22:16:54',NULL,NULL),(4,5,'Pham Minh C','support@anker.vn','0988776655','Anker Vietnam','Quan 3, TP.HCM','https://ui-avatars.com/api/?name=Anker&background=00A3E0&color=fff&length=1',NULL,'BL004','Tax004','BLOCKED',NULL,4.2,200,3500,75,240,'2023-05-05 09:15:00','2026-03-10 14:10:26',NULL,NULL),(5,1774451806910,'Test Seller','test@test.com','0900000001','Test Shop','Test Description',NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-25 22:16:47','2026-03-25 22:16:47',NULL,NULL),(6,1774452812114,'Test Owner','test@example.com','0900000000','Test Shop New','Test Description',NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-25 22:33:32','2026-03-25 22:33:32',NULL,NULL),(7,1774453018985,'Owner Name','test123@example.com','0909123456','Test Shop','Test Location','',NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-25 22:36:59','2026-03-25 22:36:59',NULL,NULL),(8,1774453039088,'Owner','test@duplicate.com','0909000000','Dup Shop',NULL,NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-25 22:37:19','2026-03-25 22:37:19',NULL,NULL),(9,1774453309774,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE',NULL,0,0,0,0,0,'2026-03-25 22:41:50','2026-03-25 23:09:42',NULL,NULL),(12,14,'E2E Test Seller','e2e_1774602773635@test.com','0909888999','E2E Test Shop 1774602773635','Test shop from E2E automation',NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 16:13:04','2026-03-27 16:13:04',NULL,NULL),(13,15,'Nguyen Van Demo','demo_p0@test.com','0909888111','Demo P0 Shop','Shop de test flow moi',NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 16:33:32','2026-03-27 16:33:32',NULL,NULL),(14,17,'E2E Test Seller','e2e_1774604073905@test.com','0904073905','E2E Test Shop 1774604073905','Test shop from E2E automation',NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 16:34:37','2026-03-27 16:34:37',NULL,NULL),(15,18,'Final Test Seller','final_test_${Date.now()}@test.com','09$(date +%s)','Final Test Shop','Final test',NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 16:35:00','2026-03-27 16:35:00',NULL,NULL),(16,19,'Test Seller','testseller123@example.com','0999999001','Test Shop',NULL,NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 18:22:00','2026-03-27 18:22:00',NULL,NULL),(17,20,'Test Seller 2','testseller456@example.com','0999999002','Test Shop 2',NULL,NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 18:31:32','2026-03-27 18:31:32',NULL,NULL),(18,21,'Debug Test','debugtest999@example.com','0999999999','Debug Shop',NULL,NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 18:33:21','2026-03-27 18:33:21',NULL,NULL),(19,22,'Recalc Test','recalc9999@example.com','0799999001','Recalc Shop',NULL,NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 18:49:29','2026-03-27 19:27:07',NULL,NULL),(20,23,'API Test','apitest9999@example.com','0699999001','API Test Shop',NULL,NULL,NULL,NULL,NULL,'PENDING',NULL,0,0,0,0,0,'2026-03-27 19:08:41','2026-03-27 19:08:41',NULL,NULL);
/*!40000 ALTER TABLE `seller` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment_adjustment_financial`
--

DROP TABLE IF EXISTS `shipment_adjustment_financial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_adjustment_financial` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adjustment_request_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `payment_method_snapshot` varchar(20) NOT NULL COMMENT 'cod|vnpay|...',
  `action_type` varchar(30) NOT NULL COMMENT 'REFUND_NON_COD|REDUCE_COD|NONE',
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING|PROCESSED|FAILED',
  `external_txn_ref` varchar(100) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_adjustment_financial_request_status` (`adjustment_request_id`,`status`),
  KEY `idx_adjustment_financial_order` (`order_id`),
  CONSTRAINT `fk_adjustment_financial_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_financial_request` FOREIGN KEY (`adjustment_request_id`) REFERENCES `shipment_adjustment_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_adjustment_financial`
--

LOCK TABLES `shipment_adjustment_financial` WRITE;
/*!40000 ALTER TABLE `shipment_adjustment_financial` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipment_adjustment_financial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment_adjustment_item`
--

DROP TABLE IF EXISTS `shipment_adjustment_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_adjustment_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adjustment_request_id` bigint NOT NULL,
  `order_item_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  `old_quantity` int NOT NULL,
  `new_quantity` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `old_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `new_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `diff_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_adjustment_item_request` (`adjustment_request_id`),
  KEY `idx_adjustment_item_order_item` (`order_item_id`),
  CONSTRAINT `fk_adjustment_item_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_item_request` FOREIGN KEY (`adjustment_request_id`) REFERENCES `shipment_adjustment_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_adjustment_new_quantity` CHECK ((`new_quantity` >= 0)),
  CONSTRAINT `chk_adjustment_quantity_not_exceed_old` CHECK ((`new_quantity` <= `old_quantity`))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_adjustment_item`
--

LOCK TABLES `shipment_adjustment_item` WRITE;
/*!40000 ALTER TABLE `shipment_adjustment_item` DISABLE KEYS */;
INSERT INTO `shipment_adjustment_item` VALUES (1,1,930,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ',3,2,6190000.00,18570000.00,12380000.00,6190000.00,NULL);
/*!40000 ALTER TABLE `shipment_adjustment_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment_adjustment_request`
--

DROP TABLE IF EXISTS `shipment_adjustment_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_adjustment_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `request_code` varchar(50) NOT NULL COMMENT 'Ma request dieu chinh de tra cuu',
  `order_shipment_id` bigint NOT NULL COMMENT 'Kien hang bi thieu',
  `order_id` bigint NOT NULL COMMENT 'Order cha',
  `shop_id` bigint NOT NULL COMMENT 'Shop gui de xuat',
  `status` varchar(50) NOT NULL DEFAULT 'PENDING_BUYER' COMMENT 'PENDING_BUYER|ACCEPTED_BY_BUYER|REJECTED_BY_BUYER|CANCELLED_BY_SHOP|EXPIRED',
  `shop_reason` text COMMENT 'Ly do shop khong du hang',
  `buyer_note` text COMMENT 'Phan hoi cua buyer',
  `total_original_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_adjusted_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_diff_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `expires_at` timestamp NULL DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_adjustment_request_code` (`request_code`),
  KEY `idx_adjustment_order_shipment_status` (`order_shipment_id`,`status`),
  KEY `idx_adjustment_order_id` (`order_id`),
  KEY `idx_adjustment_shop_id` (`shop_id`),
  CONSTRAINT `fk_adjustment_request_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_request_order_shipment` FOREIGN KEY (`order_shipment_id`) REFERENCES `order_shipment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_request_shop` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_adjustment_request`
--

LOCK TABLES `shipment_adjustment_request` WRITE;
/*!40000 ALTER TABLE `shipment_adjustment_request` DISABLE KEYS */;
INSERT INTO `shipment_adjustment_request` VALUES (1,'ADJ-708A0A9C',412,453,1,'PENDING_BUYER','Hết 1 tivi',NULL,0.00,0.00,0.00,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `shipment_adjustment_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop`
--

DROP TABLE IF EXISTS `shop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `shop_name` varchar(255) NOT NULL,
  `shop_description` text,
  `shop_logo` varchar(500) DEFAULT NULL,
  `shop_banner` varchar(500) DEFAULT NULL,
  `business_license` varchar(100) DEFAULT NULL,
  `tax_code` varchar(50) NOT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_products` int DEFAULT '0',
  `total_orders` int DEFAULT '0',
  `response_rate` decimal(5,2) DEFAULT '0.00',
  `response_time` int DEFAULT '0',
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('PENDING','ACTIVE','REJECTED','BLOCKED') DEFAULT 'PENDING',
  `rejection_reason` text,
  `category` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_shop_name` (`shop_name`),
  KEY `idx_rating` (`rating`),
  KEY `idx_shop_is_deleted` (`is_deleted`),
  KEY `idx_shop_status` (`status`),
  CONSTRAINT `shop_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop`
--

LOCK TABLES `shop` WRITE;
/*!40000 ALTER TABLE `shop` DISABLE KEYS */;
INSERT INTO `shop` VALUES (1,2,'FSAFAFc','cdfdsv','cvcs','vds','fsb','vcbsd',0.00,0,0,0.00,0,1,1,'2026-01-14 15:42:37','2026-01-14 15:42:37','PENDING',NULL,NULL,NULL,0),(2,4,'Điện tử 247','Chuyên đồ điện tử DIY','http://res.cloudinary.com/dizx3mbgw/raw/upload/v1774889994/sellers/logos/jsxotfhpn5uy6p42a3uq',NULL,NULL,'abc',0.00,0,0,0.00,0,0,1,'2026-02-01 10:38:52','2026-03-30 23:59:56','PENDING',NULL,NULL,NULL,0),(3,24,'Cua Hang Vu','Shop ban hang dien tu',NULL,NULL,NULL,'1234567890',0.00,0,0,0.00,0,0,0,'2026-03-30 22:58:36','2026-03-30 23:35:10','REJECTED','Giay phep khong hop le',NULL,NULL,1),(4,44,'zara internation','123 đường xyz','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776479533/djc38jib12ydwq22vkh9.png',NULL,'','',0.00,0,0,0.00,0,0,1,'2026-04-18 09:32:55','2026-04-18 09:32:55','PENDING',NULL,'General',NULL,0);
/*!40000 ALTER TABLE `shop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop_follower`
--

DROP TABLE IF EXISTS `shop_follower`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_follower` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `shop_id` bigint NOT NULL,
  `followed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`user_id`,`shop_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_shop_id` (`shop_id`),
  CONSTRAINT `shop_follower_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shop_follower_ibfk_2` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_follower`
--

LOCK TABLES `shop_follower` WRITE;
/*!40000 ALTER TABLE `shop_follower` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop_follower` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL,
  `symbol` varchar(45) NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit`
--

LOCK TABLES `unit` WRITE;
/*!40000 ALTER TABLE `unit` DISABLE KEYS */;
INSERT INTO `unit` VALUES (1,'Kilogam','Kg',1),(2,'Inch','inch',1),(3,'Miliampe giờ','mAh',1),(4,'Kilogram','kg',1),(5,'Centimet','cm',1),(6,'Gigahertz','GHz',1),(7,'Megapixel','MP',1),(8,'Watt','W',1),(9,'Terabyte','TB',1),(10,'Vol','V',1),(11,'Watt giờ','Wh',1),(12,'Cell','cell',1),(14,'Hertz','Hz',1),(15,'Pixel','px',1),(17,'mi-li-mét','mm',1);
/*!40000 ALTER TABLE `unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `user_type` enum('buyer','seller','both') DEFAULT 'buyer',
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin@ecommerce.com','0900000001','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Admin System',NULL,'1995-01-01','male','both',1,1,'2025-12-29 11:54:43','2026-01-09 12:14:11','2025-12-29 11:54:43'),(2,'seller01@shop.com','0968443564','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Seller One',NULL,'1998-05-10','female','seller',1,1,'2025-12-29 11:54:43','2026-02-01 13:58:37',NULL),(3,'buyer01@gmail.com','0900000003','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Buyer One',NULL,NULL,'other','buyer',1,1,'2025-12-29 11:54:43','2026-01-14 11:43:50',NULL),(4,'buyer02@gmail.com','0932334354','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Buyer 2',NULL,NULL,'other','both',1,1,'2026-01-17 03:08:13','2026-01-17 03:08:13',NULL),(5,'dangvanthanhdiep2711@gmail.com',NULL,'$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Đặng Văn Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 11:56:16','2026-02-02 10:56:15',NULL),(6,'dangvanthanhdiep2000@gmail.com',NULL,'$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Đặng Văn Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 13:00:26','2026-02-02 10:56:15',NULL),(7,'thanhtu@gmail.com','0966456888','$2a$10$CGmGsDedKT.fiirlU/erMuT85029EyCaa.2mQgtVCei5wBp7xrYaa','Thanh Tú',NULL,'1993-11-23','male','buyer',1,1,'2026-01-19 13:16:59','2026-01-26 18:23:27',NULL),(8,'thoai@gmail.com',NULL,'$2a$10$i0BAj217SjPgc/goKoH1Z.PBXjdXXCiCPUFP2GwsMyceREHB4st3O','Thoại',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 13:21:18','2026-01-19 13:21:18',NULL),(9,'dangvanthanhdiep1@gmail.com','0966273721','$2a$10$Bhth5//1NMPAfLdNKRGRjeBVYntjhlMUqLCo34cnIQhwb5bsdFESC','Thành Điệp',NULL,'2000-11-27','male','buyer',1,1,'2026-01-19 17:46:11','2026-01-23 18:27:14',NULL),(10,'dangvanthanhdiep2@gmail.com',NULL,'$2a$10$E3Zgv0BriHbmdCkkc8xmJOdi8resu6NoF9lMIZqt.Lp5Rqb.2NIBG','Đặng Văn Thành Điệp 2',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 17:49:33','2026-01-19 17:49:33',NULL),(11,'dangvanthanhdiep3@gmail.com',NULL,'$2a$10$25gG7KzR31UFmO6C5oLQcuXkItjfVDzhtpHsd0gL/XanVCARJ7OGG','Đặng Văn Thành Điệp 3',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 17:54:53','2026-01-19 17:54:53',NULL),(12,'diepdudon@gmail.com',NULL,'$2a$10$begOBcYg9IQ3QREmR9n85uWQCYNUg4OenEpU4WKk755ewgCkI2cMm','Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-21 18:17:28','2026-01-21 18:17:28',NULL),(13,'testuser@example.com',NULL,'$2a$10$AAH6PZqULTe5uLHIHUO6Sup5oXRX0L0Y.VRVSaXPnsjRGNGkCGHw.','Vu Nguyen',NULL,NULL,NULL,'buyer',1,1,'2026-02-13 16:48:52','2026-02-13 16:48:52',NULL),(14,'e2e_1774602773635@test.com','0909888999','$2a$10$FMDsHa8xkMSUOavUTfPNtuFD8B/CgRJjuquT0xGoyZh2oeK1etVy6','E2E Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:13:05','2026-03-27 16:13:05',NULL),(15,'demo_p0@test.com','0909888111','$2a$10$nGdepBsbN6XvGtSf1qyRRuX0kNtCi7ngUpXw50hrvHTg1p7Y4DABC','Nguyen Van Demo',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:33:33','2026-03-27 16:33:33',NULL),(17,'e2e_1774604073905@test.com','0904073905','$2a$10$YED.Mf790AVNxA9d1iPem.l.fpUR/g.s217O.vsLaecKYXcwR54pW','E2E Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:34:38','2026-03-27 16:34:38',NULL),(18,'final_test_${Date.now()}@test.com','09$(date +%s)','$2a$10$2fioMcit/0RzlkEm62ez7OQS1wKe9e1ewKeYkiuSeuxsvPm6tydBK','Final Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:35:01','2026-03-27 16:35:01',NULL),(19,'testseller123@example.com','0999999001','$2a$10$JRD9qgDUm.O9IdrLKus57.vObBdkUroth0AvZzJsSh.Y1kB55ZwlK','Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:22:01','2026-03-27 18:22:01',NULL),(20,'testseller456@example.com','0999999002','$2a$10$r8dZ72BAIXjaB9mduScTeeNx6Zj86ydNn5AlswpUrLUJGz2QCFv6W','Test Seller 2',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:31:32','2026-03-27 18:31:32',NULL),(21,'debugtest999@example.com','0999999999','$2a$10$UV3urwgMdK7KRYmE4jB.ou2mioVaEPgFgzqIDnQrO1q5s9gjenHlK','Debug Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:33:21','2026-03-27 18:33:21',NULL),(22,'recalc9999@example.com','0799999001','$2a$10$ST.YtGdIW1DNNXtIoalkNOPA69W5n3GcakYF6Ikv9tlEnPu9Mj0Gi','Recalc Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:49:30','2026-03-27 18:49:30',NULL),(23,'apitest9999@example.com','0699999001','$2a$10$SsoZmKBv3K4AfeLF5ENqSuk3th9NKFPCsCE8sKUORL5M5C9Bomj/i','API Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 19:08:42','2026-03-27 19:08:42',NULL),(24,'owner1@test.com',NULL,'$2a$10$MNMvFZvFi5I78R97bclQTOFsnechsafUq.nydTzli8JxXiw.PCMxm','Shop Owner One',NULL,NULL,NULL,'buyer',1,1,'2026-03-30 22:58:18','2026-03-30 22:58:18',NULL),(25,'vothoai1503@gmail.com',NULL,'$2a$10$yzDtsQCQ9P8Epmn55ut5aePhhx.ehHL9mx9cht9TgWIKV4uSkeSxC','Thoaij',NULL,NULL,NULL,'buyer',1,1,'2026-04-10 19:10:16','2026-04-10 19:10:16',NULL),(26,'user1@gmail.com',NULL,'$2a$10$rPoDpYBNcRds4b8gvMsiOOaNnxsgTmkJ5PhfjfKS77hStmkhjTyuW','User01',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 08:59:21','2026-04-11 08:59:21',NULL),(27,'user2@gmail.com',NULL,'$2a$10$wYR3QRyQmD1.I34b4O7.WOwjymNYZrlnm5OwEwnTDPlSe8SmyxJR6','user02',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:04:16','2026-04-11 09:04:16',NULL),(28,'user3@gmail.com',NULL,'$2a$10$X9SUpT7MURj9OT6pUegyOehe9Yb9nNMdDk8rsLSjE2oZTU6Ok1RW6','User 03',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:07:22','2026-04-11 09:07:22',NULL),(29,'user4@gmail.com',NULL,'$2a$10$8Vep4noe4lKG8PNBktOsYuBy4GZne.dd.iyMC68gP1ItGcGIg4wOW','User04',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:09:28','2026-04-11 09:09:28',NULL),(30,'user5@gmail.com',NULL,'$2a$10$qBw5a01V.S2PE1zV6Lup..VpqW6RY6Yg8lE1mS2efMUMeeyV7TaDK','User 05',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:54:39','2026-04-11 09:54:39',NULL),(31,'user6@gmail.com',NULL,'$2a$10$PbKiJes0QL1Kca1MVe9PWerw8OzCqwVfYxkZbPJQphkrs.peh5goe','User 06',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:56:23','2026-04-11 09:56:23',NULL),(32,'user7@gmail.com',NULL,'$2a$10$BP2XhlPfcYCiW4JPF3M5z.sgIakT5xdrUScfVPOT4ifPl./fDO5KG','User 07',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:00:02','2026-04-11 10:00:02',NULL),(33,'user8@gmail.com',NULL,'$2a$10$tPXw5ULUt1SmBsTQk9d5COJIX7dRGTtf8tR974F.HyQq3cSTTgpzG','User 08',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:03:57','2026-04-11 10:03:57',NULL),(34,'user9@gmail.com',NULL,'$2a$10$yRvsqt9ve3.NYqOULJq6muDldNxeo2udTTG58qZItHk1DbGea4.QO','User 9',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:30:39','2026-04-11 10:30:39',NULL),(35,'user10@gmail.com',NULL,'$2a$10$N5f/z9BFzaYz0.7SYnipQONfA0V/XYM7FO2bsIZATCBNq27fGHVzi','User 10',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:33:20','2026-04-11 10:33:20',NULL),(36,'user11@gmail.com',NULL,'$2a$10$e5dWYtJnUotQD4PROzg6z.pTeoUG3R/vZkQEi1UV3DzCy9mIpnniu','User 11',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:41:12','2026-04-11 10:41:12',NULL),(37,'user12@gmail.com',NULL,'$2a$10$FFJk9hCX9B4aoc.CAOVfKutEhL2WjfSEQcYWHoC6zH7I7qdtFWuwi','User 12',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:53:36','2026-04-11 10:53:36',NULL),(38,'user13@gmail.com',NULL,'$2a$10$miWgbcJRIkB51LhqhsgGjO8pfinZaXKq.eqOVKwwRfg8xTngUExoG','User 13',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 11:04:02','2026-04-11 11:04:02',NULL),(39,'user14@gmail.com',NULL,'$2a$10$KsCJ/IwYpjTwBW7/FzZ6kOEP8FoRBkBT0ZRswbAZhqzvcJ/9id.Uy','User 14',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 11:19:08','2026-04-11 11:19:08',NULL),(40,'user15@gmail.com',NULL,'$2a$10$JGrsY3FZOb5fBg9PAecKwuOy9RLhGpHibLkLFMlxpRcXKw3D5Pcpy','User 15',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 20:54:42','2026-04-11 20:54:42',NULL),(41,'brucelee@gmail.com',NULL,'$2a$10$KvCQA8K57eVnt41OeWg4eORRHtPW6NL3GGhf7glVFLlJ5e.IBwwbe','Lý Tiểu Long','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776526893/qpqsmeufybdhycjubvmq.jpg',NULL,NULL,'buyer',1,1,'2026-04-11 21:32:47','2026-04-18 22:41:34',NULL),(42,'lylienkiet@gmail.com',NULL,'$2a$10$jS0x2RGYX0QuGBO2JJQ01OvQ9H7dQGhbpciX3zmoYLSgK9JXrxaXS','Lý Liên Kiệt ',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 22:18:43','2026-04-11 22:18:43',NULL),(43,'user16@gmail.com',NULL,'$2a$10$5LLC3jpptRKwMKAvKJlsPuPzDhhiD4MHC1tHrrvOepURtniO7Yf02','User 16',NULL,NULL,NULL,'buyer',1,1,'2026-04-12 22:13:03','2026-04-12 22:13:03',NULL),(44,'zara123@gmail.com','0938201914','$2a$10$eAeWhg/4j.vqZGeIuzC7N.DnK9avI7i4BglCi.gRYzzDdCOj9T9rO','Nguyễn Văn D','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776479533/djc38jib12ydwq22vkh9.png',NULL,NULL,'seller',0,1,'2026-04-18 09:32:55','2026-04-18 09:32:55',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_voucher`
--

DROP TABLE IF EXISTS `user_voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_voucher` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  `claim_channel` varchar(20) NOT NULL DEFAULT 'APP',
  `claimed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) NOT NULL DEFAULT 'CLAIMED',
  `reserved_order_id` bigint DEFAULT NULL,
  `reserved_at` datetime DEFAULT NULL,
  `expired_at` datetime DEFAULT NULL,
  `redeemed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_voucher_user_status` (`user_id`,`status`),
  KEY `idx_user_voucher_voucher_status` (`voucher_id`,`status`),
  KEY `idx_user_voucher_lookup` (`user_id`,`voucher_id`,`status`),
  KEY `fk_user_voucher_order` (`reserved_order_id`),
  CONSTRAINT `fk_user_voucher_order` FOREIGN KEY (`reserved_order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_user_voucher_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_user_voucher_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`),
  CONSTRAINT `user_voucher_chk_1` CHECK ((`claim_channel` in (_utf8mb4'APP',_utf8mb4'WEB',_utf8mb4'AUTO_ISSUE',_utf8mb4'CS_SUPPORT'))),
  CONSTRAINT `user_voucher_chk_2` CHECK ((`status` in (_utf8mb4'CLAIMED',_utf8mb4'RESERVED',_utf8mb4'REDEEMED',_utf8mb4'CANCELLED',_utf8mb4'EXPIRED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_voucher`
--

LOCK TABLES `user_voucher` WRITE;
/*!40000 ALTER TABLE `user_voucher` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaign_id` bigint DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `issuer_type` varchar(20) NOT NULL,
  `issuer_id` bigint DEFAULT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_percent` decimal(5,2) DEFAULT NULL,
  `discount_amount` decimal(18,2) DEFAULT NULL,
  `max_discount_amount` decimal(18,2) DEFAULT NULL,
  `min_order_value` decimal(18,2) NOT NULL DEFAULT '0.00',
  `max_order_value` decimal(18,2) DEFAULT NULL,
  `total_quota` int NOT NULL,
  `claimed_count` int NOT NULL DEFAULT '0',
  `redeemed_count` int NOT NULL DEFAULT '0',
  `per_user_quota` int NOT NULL DEFAULT '1',
  `stackable` tinyint(1) NOT NULL DEFAULT '0',
  `claim_start_at` datetime NOT NULL,
  `claim_end_at` datetime NOT NULL,
  `valid_from` datetime NOT NULL,
  `valid_to` datetime NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `priority` int NOT NULL DEFAULT '100',
  `created_by` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_code` (`code`),
  KEY `idx_voucher_status_time` (`status`,`claim_start_at`,`claim_end_at`,`valid_from`,`valid_to`),
  KEY `idx_voucher_issuer` (`issuer_type`,`issuer_id`,`status`),
  KEY `fk_voucher_campaign` (`campaign_id`),
  CONSTRAINT `fk_voucher_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `voucher_campaign` (`id`),
  CONSTRAINT `voucher_chk_1` CHECK ((`issuer_type` in (_utf8mb4'PLATFORM',_utf8mb4'SHOP',_utf8mb4'BRAND'))),
  CONSTRAINT `voucher_chk_2` CHECK ((`discount_type` in (_utf8mb4'PERCENT',_utf8mb4'FIXED',_utf8mb4'FREE_SHIPPING',_utf8mb4'GIFT_ITEM'))),
  CONSTRAINT `voucher_chk_3` CHECK ((`status` in (_utf8mb4'DRAFT',_utf8mb4'ACTIVE',_utf8mb4'PAUSED',_utf8mb4'EXPIRED',_utf8mb4'DEPLETED',_utf8mb4'ARCHIVED'))),
  CONSTRAINT `voucher_chk_4` CHECK ((`claim_start_at` < `claim_end_at`)),
  CONSTRAINT `voucher_chk_5` CHECK ((`valid_from` <= `valid_to`)),
  CONSTRAINT `voucher_chk_6` CHECK ((`total_quota` >= 0)),
  CONSTRAINT `voucher_chk_7` CHECK ((`per_user_quota` >= 1)),
  CONSTRAINT `voucher_chk_8` CHECK ((((`discount_type` = _utf8mb4'PERCENT') and (`discount_percent` is not null) and (`discount_amount` is null)) or ((`discount_type` = _utf8mb4'FIXED') and (`discount_amount` is not null) and (`discount_percent` is null)) or (`discount_type` in (_utf8mb4'FREE_SHIPPING',_utf8mb4'GIFT_ITEM'))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_audit_log`
--

DROP TABLE IF EXISTS `voucher_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `event_type` varchar(40) NOT NULL,
  `actor_type` varchar(20) NOT NULL,
  `actor_id` bigint DEFAULT NULL,
  `entity_type` varchar(40) NOT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_voucher_time` (`voucher_id`,`created_at`),
  CONSTRAINT `fk_audit_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_audit_log`
--

LOCK TABLES `voucher_audit_log` WRITE;
/*!40000 ALTER TABLE `voucher_audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_campaign`
--

DROP TABLE IF EXISTS `voucher_campaign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_campaign` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `created_by` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_campaign_code` (`code`),
  CONSTRAINT `voucher_campaign_chk_1` CHECK ((`start_at` < `end_at`)),
  CONSTRAINT `voucher_campaign_chk_2` CHECK ((`status` in (_utf8mb4'DRAFT',_utf8mb4'ACTIVE',_utf8mb4'PAUSED',_utf8mb4'ENDED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_campaign`
--

LOCK TABLES `voucher_campaign` WRITE;
/*!40000 ALTER TABLE `voucher_campaign` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_campaign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_condition_legacy`
--

DROP TABLE IF EXISTS `voucher_condition_legacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_condition_legacy` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `condition_type_id` int NOT NULL,
  `operator` enum('equals','greater_than','greater_or_equal','less_than','less_or_equal','between','in','not_in') NOT NULL,
  `value_numeric` decimal(15,2) DEFAULT NULL,
  `value_numeric_max` decimal(15,2) DEFAULT NULL,
  `value_text` varchar(255) DEFAULT NULL,
  `value_json` json DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT '1',
  `priority` int DEFAULT '0',
  `error_message` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_voucher_id` (`voucher_id`),
  KEY `idx_condition_type` (`condition_type_id`),
  KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_condition_legacy`
--

LOCK TABLES `voucher_condition_legacy` WRITE;
/*!40000 ALTER TABLE `voucher_condition_legacy` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_condition_legacy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_condition_type_legacy`
--

DROP TABLE IF EXISTS `voucher_condition_type_legacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_condition_type_legacy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_code` varchar(50) NOT NULL,
  `type_name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_code` (`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_condition_type_legacy`
--

LOCK TABLES `voucher_condition_type_legacy` WRITE;
/*!40000 ALTER TABLE `voucher_condition_type_legacy` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_condition_type_legacy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_gift_item`
--

DROP TABLE IF EXISTS `voucher_gift_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_gift_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `variant_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_gift_item` (`voucher_id`,`product_id`,`variant_id`),
  KEY `fk_voucher_gift_item_product` (`product_id`),
  KEY `fk_voucher_gift_item_variant` (`variant_id`),
  CONSTRAINT `fk_voucher_gift_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_voucher_gift_item_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`),
  CONSTRAINT `fk_voucher_gift_item_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON DELETE CASCADE,
  CONSTRAINT `voucher_gift_item_chk_1` CHECK ((`quantity` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_gift_item`
--

LOCK TABLES `voucher_gift_item` WRITE;
/*!40000 ALTER TABLE `voucher_gift_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_gift_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_legacy`
--

DROP TABLE IF EXISTS `voucher_legacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_legacy` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `shop_id` bigint DEFAULT NULL,
  `voucher_code` varchar(50) NOT NULL,
  `voucher_name` varchar(255) NOT NULL,
  `description` text,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(15,2) NOT NULL,
  `min_order_value` decimal(15,2) DEFAULT '0.00',
  `max_discount` decimal(15,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `voucher_code` (`voucher_code`),
  KEY `idx_code` (`voucher_code`),
  KEY `idx_shop_id` (`shop_id`),
  CONSTRAINT `voucher_legacy_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_legacy`
--

LOCK TABLES `voucher_legacy` WRITE;
/*!40000 ALTER TABLE `voucher_legacy` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_legacy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_redemption`
--

DROP TABLE IF EXISTS `voucher_redemption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_redemption` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_voucher_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `order_code` varchar(50) DEFAULT NULL,
  `original_shipping_fee` decimal(18,2) DEFAULT NULL,
  `original_order_amount` decimal(18,2) NOT NULL,
  `discount_amount_applied` decimal(18,2) NOT NULL,
  `final_order_amount` decimal(18,2) NOT NULL,
  `redeemed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) NOT NULL DEFAULT 'SUCCESS',
  `failure_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_redemption_order_voucher` (`order_id`,`voucher_id`),
  KEY `idx_redemption_user` (`user_id`),
  KEY `idx_redemption_voucher_time` (`voucher_id`,`redeemed_at`),
  KEY `idx_redemption_order` (`order_id`,`status`),
  KEY `fk_redemption_user_voucher` (`user_voucher_id`),
  CONSTRAINT `fk_redemption_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_redemption_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_redemption_user_voucher` FOREIGN KEY (`user_voucher_id`) REFERENCES `user_voucher` (`id`),
  CONSTRAINT `fk_redemption_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`),
  CONSTRAINT `voucher_redemption_chk_1` CHECK ((`status` in (_utf8mb4'SUCCESS',_utf8mb4'FAILED',_utf8mb4'ROLLED_BACK')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_redemption`
--

LOCK TABLES `voucher_redemption` WRITE;
/*!40000 ALTER TABLE `voucher_redemption` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_redemption` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_scope_rule`
--

DROP TABLE IF EXISTS `voucher_scope_rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_scope_rule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `scope_type` varchar(30) NOT NULL,
  `scope_id` bigint NOT NULL,
  `include_exclude` varchar(10) NOT NULL DEFAULT 'INCLUDE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scope_rule` (`voucher_id`,`scope_type`,`scope_id`,`include_exclude`),
  KEY `idx_scope_rule_lookup` (`scope_type`,`scope_id`,`include_exclude`),
  CONSTRAINT `fk_scope_rule_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON DELETE CASCADE,
  CONSTRAINT `voucher_scope_rule_chk_1` CHECK ((`scope_type` in (_utf8mb4'SHOP',_utf8mb4'CATEGORY',_utf8mb4'PRODUCT',_utf8mb4'BRAND',_utf8mb4'PAYMENT_METHOD',_utf8mb4'SHIPPING_METHOD'))),
  CONSTRAINT `voucher_scope_rule_chk_2` CHECK ((`include_exclude` in (_utf8mb4'INCLUDE',_utf8mb4'EXCLUDE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_scope_rule`
--

LOCK TABLES `voucher_scope_rule` WRITE;
/*!40000 ALTER TABLE `voucher_scope_rule` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_scope_rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_usage_history_legacy`
--

DROP TABLE IF EXISTS `voucher_usage_history_legacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_usage_history_legacy` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `order_id` bigint DEFAULT NULL,
  `discount_amount` decimal(15,2) NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_voucher_id` (`voucher_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_used_at` (`used_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_usage_history_legacy`
--

LOCK TABLES `voucher_usage_history_legacy` WRITE;
/*!40000 ALTER TABLE `voucher_usage_history_legacy` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_usage_history_legacy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_user_segment_rule`
--

DROP TABLE IF EXISTS `voucher_user_segment_rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_user_segment_rule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `segment_type` varchar(30) NOT NULL,
  `segment_value` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_segment_rule` (`voucher_id`,`segment_type`,`segment_value`),
  CONSTRAINT `fk_user_segment_rule_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`) ON DELETE CASCADE,
  CONSTRAINT `voucher_user_segment_rule_chk_1` CHECK ((`segment_type` in (_utf8mb4'NEW_USER',_utf8mb4'VIP',_utf8mb4'APP_ONLY',_utf8mb4'MEMBERSHIP_TIER',_utf8mb4'FIRST_ORDER')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_user_segment_rule`
--

LOCK TABLES `voucher_user_segment_rule` WRITE;
/*!40000 ALTER TABLE `voucher_user_segment_rule` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_user_segment_rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
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

-- Dump completed on 2026-04-19  8:28:34
