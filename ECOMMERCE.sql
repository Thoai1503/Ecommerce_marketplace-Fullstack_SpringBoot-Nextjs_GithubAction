-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 103.90.225.130    Database: ecommerce
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (1,1,NULL,'test 1','0909000000','123 test','2','2','2','70000',0,'2026-03-06 12:17:53','2026-03-26 15:17:53'),(2,7,NULL,'thoai','0867677888','456 vnnvn','90768','3695','202','70000',1,'2026-03-20 14:09:02','2026-04-08 05:34:15'),(3,NULL,1,'','','564 3 tháng 2','13010','3440','201',NULL,1,'2026-04-08 06:10:22','2026-04-08 06:20:56'),(4,NULL,2,'','','Ap cai bang','55079','3317','220',NULL,0,'2026-04-08 06:20:56','2026-04-08 06:20:56'),(5,NULL,3,'','','Ap Tieu Ho','550809','1576','220',NULL,0,'2026-04-08 06:22:28','2026-04-08 06:22:28'),(6,7,NULL,'Tu dien','0987967543','31 Tân Hoà Đông','20614','1448','202','',0,'2026-04-08 23:19:35','2026-04-08 23:19:35'),(7,8,NULL,'Thoại Chợ Lớn','0976499267','51 Hiệp Bình','90741','3695','202','',0,'2026-04-09 15:18:28','2026-04-12 14:13:20'),(8,25,NULL,'Vo Thoai','0980747476','23sf sfsf','130324','2047','263','',0,'2026-04-10 19:20:33','2026-04-10 19:20:33'),(9,33,NULL,'User 8','0888989898','561 An Dương Vương','21901','1458','202','',0,'2026-04-11 10:06:35','2026-04-11 10:06:35'),(10,37,NULL,'Cu Tèo','0983156792','Ấp 51 Cần Giuộc','491301','1907','211','',0,'2026-04-11 11:02:07','2026-04-11 11:02:07'),(11,38,NULL,'Cu Tí','0968561302','Ấp Cá Tra','580309','2091','214','',1,'2026-04-11 11:06:22','2026-04-11 06:02:16'),(12,39,NULL,'Mãnh Long Quá Giang','0903453921','1011 Lạc Long Quân','21101','1453','202','',0,'2026-04-11 11:20:16','2026-04-11 11:20:16'),(13,40,NULL,'Buyer 15','0988756435','51 Tây Thạnh','21511','1456','202','',1,'2026-04-11 20:57:16','2026-04-11 20:57:16'),(14,41,NULL,'Lý Tiểu Long','0912341232','180 Nguyễn Hữu Cảnh','21615','1462','202','',1,'2026-04-11 21:34:23','2026-04-11 21:34:23'),(15,42,NULL,'Lý Liên Kiệt','0989644354','Ấp 3T Dương Công Khi','22212','1459','202','',1,'2026-04-11 22:20:59','2026-04-11 22:20:59'),(16,43,NULL,'Long Ân','0986547454','T3T Đông Hoà 3','440504','1540','205','',1,'2026-04-12 22:14:51','2026-04-12 22:14:51'),(17,5,NULL,'Điệp mất Lan rồi','0957060799','81 Tân Chánh Hiệp 36','21204','1454','202','',1,'2026-04-21 19:39:56','2026-04-21 19:39:56'),(18,2,NULL,'Seller 01','0927754654','369/36 Hương Lộ 2','21906','1458','202','',1,'2026-04-26 16:44:43','2026-04-26 16:44:43');
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
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (2,1,4,1,2,'2026-02-22 21:07:26','2026-02-22 21:07:26'),(3,1,4,2,2,'2026-02-24 06:10:43','2026-02-24 06:10:43'),(30,7,4,2,2,'2026-03-08 17:47:24','2026-04-22 20:26:13'),(31,7,4,1,8,'2026-03-08 17:47:35','2026-04-22 14:43:10'),(37,7,111,8,3,'2026-03-16 22:29:39','2026-04-22 14:58:01'),(38,7,112,9,3,'2026-03-22 20:10:47','2026-04-09 21:20:07'),(39,7,114,11,5,'2026-03-22 20:42:49','2026-04-22 14:42:30'),(40,7,115,12,3,'2026-03-22 21:39:53','2026-03-23 18:55:12'),(42,7,113,10,2,'2026-04-08 14:30:40','2026-04-09 05:46:03'),(44,2,111,8,1,'2026-04-09 19:49:51','2026-04-26 17:28:34'),(48,8,115,12,9,'2026-04-09 22:16:24','2026-04-10 10:28:15'),(49,8,116,13,3,'2026-04-10 02:15:33','2026-04-10 19:23:37'),(50,8,117,14,1,'2026-04-10 09:56:51','2026-04-12 17:52:10'),(51,2,117,14,1,'2026-04-10 13:54:25','2026-04-26 17:28:37'),(52,8,111,8,4,'2026-04-10 14:24:47','2026-04-11 06:44:36'),(53,8,4,1,2,'2026-04-10 14:28:13','2026-04-23 11:43:12'),(54,25,117,14,2,'2026-04-10 19:17:29','2026-04-10 19:17:53'),(55,32,111,8,1,'2026-04-11 10:02:18','2026-04-11 10:02:18'),(56,33,111,8,2,'2026-04-11 10:04:01','2026-04-12 07:24:43'),(57,33,117,14,3,'2026-04-11 10:17:43','2026-04-11 10:27:16'),(58,34,111,8,3,'2026-04-11 10:30:42','2026-04-11 10:30:42'),(59,35,111,8,3,'2026-04-11 10:33:22','2026-04-11 10:33:22'),(60,36,111,8,3,'2026-04-11 10:41:22','2026-04-11 10:41:22'),(61,37,111,8,1,'2026-04-11 10:53:39','2026-04-11 10:58:09'),(62,38,111,8,1,'2026-04-11 11:04:04','2026-04-11 11:04:04'),(63,38,112,9,1,'2026-04-11 11:04:49','2026-04-11 11:04:49'),(64,38,4,2,1,'2026-04-11 11:05:15','2026-04-11 11:05:15'),(65,38,115,12,1,'2026-04-11 11:05:29','2026-04-11 11:05:29'),(66,39,111,8,1,'2026-04-11 11:19:10','2026-04-11 11:19:10'),(67,38,4,1,1,'2026-04-11 12:22:55','2026-04-11 12:22:55'),(68,8,114,11,2,'2026-04-11 17:44:54','2026-04-11 22:27:43'),(69,5,117,14,1,'2026-04-11 19:59:25','2026-04-26 18:13:56'),(70,4,117,14,1,'2026-04-11 20:51:52','2026-04-11 20:52:33'),(71,4,115,12,1,'2026-04-11 20:52:26','2026-04-11 20:52:26'),(72,40,115,12,1,'2026-04-11 20:54:42','2026-04-11 20:54:42'),(73,40,114,11,1,'2026-04-11 20:54:42','2026-04-11 20:54:42'),(74,40,116,13,2,'2026-04-11 20:54:42','2026-04-11 20:54:50'),(75,41,115,12,2,'2026-04-11 21:32:47','2026-04-11 21:32:47'),(76,41,114,11,5,'2026-04-11 21:32:47','2026-04-20 10:41:09'),(77,41,112,9,1,'2026-04-11 21:32:47','2026-04-11 21:32:47'),(78,41,117,14,1,'2026-04-11 22:08:42','2026-04-11 22:08:42'),(79,42,115,12,2,'2026-04-11 22:18:43','2026-04-11 22:18:43'),(80,42,114,11,2,'2026-04-11 22:18:43','2026-04-13 07:07:11'),(81,42,112,9,1,'2026-04-11 22:18:43','2026-04-11 22:18:43'),(82,8,113,10,2,'2026-04-11 22:27:29','2026-04-11 22:27:32'),(83,33,115,12,1,'2026-04-12 07:25:06','2026-04-12 07:25:06'),(84,42,111,8,3,'2026-04-12 09:16:55','2026-04-22 21:48:57'),(85,42,117,14,1,'2026-04-12 09:17:02','2026-04-12 09:17:02'),(86,5,116,13,1,'2026-04-12 17:33:20','2026-04-12 17:33:20'),(87,41,125,22,1,'2026-04-12 21:10:05','2026-04-20 12:22:30'),(88,43,111,8,2,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(89,43,125,22,1,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(90,43,4,2,1,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(91,43,114,11,1,'2026-04-12 22:13:04','2026-04-12 22:13:04'),(92,8,4,2,1,'2026-04-13 08:15:01','2026-04-13 08:15:01'),(93,8,125,22,1,'2026-04-13 08:15:09','2026-04-13 08:15:09'),(94,2,125,22,1,'2026-04-16 09:53:28','2026-04-26 17:28:39'),(95,2,114,11,1,'2026-04-16 09:53:35','2026-04-16 09:53:35'),(96,2,112,9,1,'2026-04-16 21:03:53','2026-04-26 17:28:36'),(97,41,129,26,9,'2026-04-18 13:12:01','2026-04-20 10:41:02'),(98,2,4,2,1,'2026-04-19 12:45:43','2026-04-26 17:28:34'),(99,2,4,1,1,'2026-04-19 12:45:57','2026-04-19 12:45:57'),(100,8,129,26,1,'2026-04-19 18:52:26','2026-04-19 18:52:26'),(101,41,111,8,1,'2026-04-19 20:08:17','2026-04-19 20:08:17'),(102,41,4,2,1,'2026-04-20 14:30:02','2026-04-20 14:30:02'),(103,41,4,1,1,'2026-04-20 14:30:04','2026-04-20 14:30:04'),(104,5,125,22,1,'2026-04-21 19:37:37','2026-04-21 19:37:37'),(105,5,114,11,1,'2026-04-21 19:38:06','2026-04-21 19:38:06'),(106,2,127,24,1,'2026-04-21 21:31:47','2026-04-21 21:31:47'),(107,7,129,26,1,'2026-04-22 14:19:10','2026-04-22 14:19:10'),(108,2,128,25,1,'2026-04-22 22:29:21','2026-04-22 22:29:21'),(109,4,125,22,1,'2026-04-24 17:02:50','2026-04-24 17:02:50'),(110,42,4,1,1,'2026-04-25 18:55:15','2026-04-25 18:55:15'),(111,9,4,1,1,'2026-04-26 15:56:17','2026-04-26 15:56:17'),(112,9,4,2,1,'2026-04-26 16:04:41','2026-04-26 16:04:41'),(113,4,126,23,1,'2026-04-26 18:18:07','2026-04-26 18:18:07'),(114,4,129,26,1,'2026-04-26 22:35:45','2026-04-26 22:35:45');
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
) ENGINE=InnoDB AUTO_INCREMENT=234 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (101,0,'Men\'s Fashion','mens-fashion','/image/category/1773484013285-Thoitrangnam.png',0,1,'2026-03-14 10:26:42','2026-03-26 04:10:48'),(103,101,'Áo Khoác','ao-khoac','',1,1,'2026-03-14 10:28:11','2026-03-14 10:28:11'),(104,101,'Áo Vest và Blazer','ao-vest-va-blazer','',1,1,'2026-03-14 10:31:13','2026-03-14 10:31:13'),(105,101,'Áo Hoodie, Áo Len & Áo Nỉ','ao-hoodie-ao-len-ao-ni','',1,1,'2026-03-14 10:31:26','2026-03-14 10:31:26'),(106,101,'Quần Jeans','quan-jeans','',1,1,'2026-03-14 10:32:25','2026-03-14 10:32:25'),(107,101,'Quần Dài/Quần Âu','quan-daiquan-au','',1,1,'2026-03-14 10:32:38','2026-03-14 10:32:38'),(108,101,'Quần Short','quan-short','',1,1,'2026-03-14 10:33:17','2026-03-14 10:33:17'),(109,101,'Áo','ao','',1,1,'2026-03-14 10:33:26','2026-03-14 10:33:26'),(110,101,'Áo Ba Lỗ','ao-ba-lo','',1,1,'2026-03-14 10:38:16','2026-03-14 10:38:16'),(111,101,'Đồ Lót','do-lot','',1,1,'2026-03-14 10:38:36','2026-03-14 10:38:36'),(112,101,'Đồ Ngủ','do-ngu','',1,1,'2026-03-14 10:41:33','2026-03-14 10:41:33'),(113,101,'Đồ Bộ','do-bo','',1,1,'2026-03-14 10:41:44','2026-03-14 10:41:44'),(114,101,'Vớ/Tất','votat','',1,1,'2026-03-14 10:41:59','2026-03-14 10:41:59'),(115,101,'Trang Phục Truyền Thống','trang-phuc-truyen-thong','',1,1,'2026-03-14 10:42:11','2026-03-14 10:42:11'),(116,101,'Costumes','costumes','/image/no-image.png',1,1,'2026-03-14 10:42:25','2026-03-26 10:20:21'),(117,101,'Professional Clothing','professional-clothing','/image/no-image.png',1,1,'2026-03-14 10:42:40','2026-03-26 10:20:01'),(118,101,'Other','other','/image/no-image.png',1,1,'2026-03-14 10:42:49','2026-03-26 10:19:43'),(119,101,'Men\'s Jewelry','mens-jewelry','/image/no-image.png',1,1,'2026-03-14 10:43:02','2026-03-26 10:18:13'),(120,101,'Men\'s Eyeglasses','mens-eyeglasses','/image/no-image.png',1,1,'2026-03-14 10:43:12','2026-03-26 10:15:47'),(121,101,'Men\'s Belts','mens-belts','/image/no-image.png',1,1,'2026-03-14 10:43:24','2026-03-26 10:06:33'),(122,101,'Ties and bow ties','ties-and-bow-ties','/image/no-image.png',1,1,'2026-03-14 10:43:36','2026-03-26 10:00:56'),(124,101,'Men\'s Accessories','mens-accessories','/image/no-image.png',1,1,'2026-03-14 10:52:01','2026-03-26 09:59:31'),(125,0,'Women\'s Fashion','womens-fashion','/image/category/1773485985156-thoitrangnu.png',0,1,'2026-03-14 10:59:34','2026-03-26 04:10:34'),(126,125,'Quần','quan','',1,1,'2026-03-14 11:01:20','2026-03-14 11:01:20'),(127,125,'Quần đùi','quan-dui','',1,1,'2026-03-14 11:01:31','2026-03-14 11:01:31'),(128,125,'Chân váy','chan-vay','',1,1,'2026-03-14 11:02:17','2026-03-14 11:02:17'),(129,125,'Quần jeans','quan-jeans','',1,1,'2026-03-14 11:02:37','2026-03-14 11:02:37'),(130,125,'Đầm/Váy','damvay','',1,1,'2026-03-14 11:03:06','2026-03-14 11:03:06'),(131,125,'Váy cưới','vay-cuoi','',1,1,'2026-03-14 11:03:36','2026-03-14 11:03:36'),(132,125,'Đồ liền thân','do-lien-than','',1,1,'2026-03-14 11:03:49','2026-03-14 11:03:49'),(133,125,'Áo khoác, Áo choàng & Vest','ao-khoac-ao-choang-vest','',1,1,'2026-03-14 11:04:00','2026-03-14 11:04:00'),(134,125,'Áo len & Cardigan','ao-len-cardigan','',1,1,'2026-03-14 11:04:09','2026-03-14 11:04:09'),(135,125,'Hoodie và Áo nỉ','hoodie-va-ao-ni','',1,1,'2026-03-14 11:04:25','2026-03-14 11:04:25'),(136,125,'Bộ','bo','',1,1,'2026-03-14 11:04:39','2026-03-14 11:04:39'),(137,125,'Đồ lót','do-lot','',1,1,'2026-03-14 11:04:47','2026-03-14 11:04:47'),(138,125,'Đồ ngủ','do-ngu','',1,1,'2026-03-14 11:05:02','2026-03-14 11:05:02'),(139,125,'Áo','ao','',1,1,'2026-03-14 11:05:16','2026-03-14 11:05:16'),(140,125,'Đồ tập','do-tap','',1,1,'2026-03-14 11:05:32','2026-03-14 11:05:32'),(141,125,'Đồ Bầu','do-bau','',1,1,'2026-03-14 11:05:42','2026-03-14 11:05:42'),(142,125,'Đồ truyền thống','do-truyen-thong','',1,1,'2026-03-14 11:05:53','2026-03-14 11:05:53'),(143,125,'Đồ hóa trang','do-hoa-trang','',1,1,'2026-03-14 11:06:03','2026-03-14 11:06:03'),(144,125,'Vải','vai','',1,1,'2026-03-14 11:06:23','2026-03-14 11:06:23'),(145,125,'Vớ/ Tất','vo-tat','',1,1,'2026-03-14 11:06:35','2026-03-14 11:06:35'),(146,125,'Khác','khac','',1,1,'2026-03-14 11:06:45','2026-03-14 11:06:45'),(147,0,'Phones & Accessories','phones-accessories','/image/category/1773486491750-dienthoaivaphukien.png',0,1,'2026-03-14 11:08:03','2026-03-26 04:10:18'),(148,147,'Điện thoại','dien-thoai','',1,1,'2026-03-14 11:08:30','2026-03-14 11:08:30'),(149,147,'Máy tính bảng','may-tinh-bang','',1,1,'2026-03-14 11:08:41','2026-03-14 11:08:41'),(150,147,'Pin Dự Phòng','pin-du-phong','',1,1,'2026-03-14 11:08:53','2026-03-14 11:08:53'),(151,147,'Pin Gắn Trong, Cáp và Bộ Sạc','pin-gan-trong-cap-va-bo-sac','',1,1,'2026-03-14 11:09:07','2026-03-14 11:09:07'),(152,147,'Ốp lưng, bao da, Miếng dán điện thoại','op-lung-bao-da-mieng-dan-dien-thoai','',1,1,'2026-03-14 11:09:17','2026-03-14 11:09:17'),(153,147,'Bảo vệ màn hình','bao-ve-man-hinh','',1,1,'2026-03-14 11:09:33','2026-03-14 11:09:33'),(154,147,'Đế giữ điện thoại','de-giu-dien-thoai','',1,1,'2026-03-14 11:09:44','2026-03-14 11:09:44'),(155,147,'Thẻ nhớ','the-nho','',1,1,'2026-03-14 11:09:59','2026-03-14 11:09:59'),(156,147,'Sim','sim','',1,1,'2026-03-14 11:10:07','2026-03-14 11:10:07'),(157,147,'Phụ kiện khác','phu-kien-khac','',1,1,'2026-03-14 11:10:26','2026-03-14 11:10:26'),(158,147,'Thiết bị khác','thiet-bi-khac','',1,1,'2026-03-14 11:10:40','2026-03-14 11:10:40'),(159,0,'Mother & Baby','mother-baby','/image/category/1773486740125-MevaBe.png',0,1,'2026-03-14 11:12:09','2026-03-26 04:09:58'),(160,159,'Đồ dùng du lịch cho bé','do-dung-du-lich-cho-be','',1,1,'2026-03-14 11:12:45','2026-03-14 11:12:45'),(161,159,'Đồ dùng ăn dặm cho bé','do-dung-an-dam-cho-be','',1,1,'2026-03-14 11:12:54','2026-03-14 11:12:54'),(162,159,'Phụ kiện cho mẹ','phu-kien-cho-me','',1,1,'2026-03-14 11:13:08','2026-03-14 11:13:08'),(163,159,'Chăm sóc sức khỏe mẹ','cham-soc-suc-khoe-me','',1,1,'2026-03-14 11:13:17','2026-03-14 11:13:17'),(164,159,'Đồ dùng phòng tắm & Chăm sóc cơ thể bé','do-dung-phong-tam-cham-soc-co-the-be','',1,1,'2026-03-14 11:13:33','2026-03-14 11:13:33'),(165,159,'Đồ dùng phòng ngủ cho bé','do-dung-phong-ngu-cho-be','',1,1,'2026-03-14 11:13:52','2026-03-14 11:13:52'),(166,159,'An toàn cho bé','an-toan-cho-be','',1,1,'2026-03-14 11:14:04','2026-03-14 11:14:04'),(167,159,'Thực phẩm cho bé','thuc-pham-cho-be','',1,1,'2026-03-14 11:14:15','2026-03-14 11:14:15'),(168,159,'Chăm sóc sức khỏe bé','cham-soc-suc-khoe-be','',1,1,'2026-03-14 11:14:23','2026-03-14 11:14:23'),(169,159,'Tã & bô em bé','ta-bo-em-be','',1,1,'2026-03-14 11:14:39','2026-03-14 11:14:39'),(170,159,'Đồ chơi','do-choi','',1,1,'2026-03-14 11:14:47','2026-03-14 11:14:47'),(171,159,'Bộ & Gói quà tặng','bo-goi-qua-tang','',1,1,'2026-03-14 11:14:57','2026-03-14 11:14:57'),(172,159,'Khác','khac','',1,1,'2026-03-14 11:15:07','2026-03-14 11:15:07'),(173,159,'Sữa công thức trên 24 tháng','sua-cong-thuc-tren-24-thang','',1,1,'2026-03-14 11:15:15','2026-03-14 11:15:15'),(174,159,'Sữa công thức 0-24 tháng tuổi','sua-cong-thuc-0-24-thang-tuoi','',1,1,'2026-03-14 11:15:28','2026-03-14 11:15:28'),(175,0,'Electronic Devices','electronic-devices','/image/category/1773658851522-thietbidientu.png',0,1,'2026-03-16 11:00:40','2026-03-26 04:09:41'),(176,175,'TV accessories','tv-accessories','/image/no-image.png',1,1,'2026-03-16 11:01:28','2026-03-26 09:52:30'),(177,175,'Game Console','game-console','/image/no-image.png',1,1,'2026-03-16 11:01:40','2026-03-26 09:52:14'),(178,175,'Console Accessories','console-accessories','/image/no-image.png',1,1,'2026-03-16 11:01:53','2026-03-26 09:49:05'),(179,175,'Game disc','game-disc','/image/no-image.png',1,1,'2026-03-16 11:02:04','2026-03-26 09:48:45'),(180,175,'Accessories','accessories','/image/no-image.png',1,1,'2026-03-16 11:02:16','2026-03-26 09:48:24'),(181,175,'Earphones','earphones','/image/no-image.png',1,1,'2026-03-16 11:02:45','2026-03-26 09:46:37'),(182,175,'Loudspeaker','loudspeaker','/image/no-image.png',1,1,'2026-03-16 11:02:56','2026-03-26 09:46:09'),(183,175,'Tivi','tivi','/image/no-image.png',1,1,'2026-03-16 11:03:09','2026-04-03 09:45:39'),(184,175,'Tivi Box','tivi-box','',1,1,'2026-03-16 11:03:18','2026-03-16 11:03:18'),(185,175,'Headphones','headphones','',1,1,'2026-03-16 11:03:26','2026-03-16 11:03:26'),(186,0,'Home & Living','home-living','/image/category/1773659052669-NhaCuaVaDoiSong.png',0,1,'2026-03-16 11:04:01','2026-03-26 04:09:26'),(187,186,'Chăn, Ga, Gối & Nệm','chan-ga-goi-nem','',1,1,'2026-03-16 11:04:21','2026-03-16 11:04:21'),(188,186,'Đồ nội thất','do-noi-that','',1,1,'2026-03-16 11:04:30','2026-03-16 11:04:30'),(189,186,'Trang trí nhà cửa','trang-tri-nha-cua','',1,1,'2026-03-16 11:04:39','2026-03-16 11:04:39'),(190,186,'Dụng cụ & Thiết bị tiện ích','dung-cu-thiet-bi-tien-ich','',1,1,'2026-03-16 11:04:47','2026-03-16 11:04:47'),(191,186,'Đồ dùng nhà bếp và hộp đựng thực phẩm','do-dung-nha-bep-va-hop-dung-thuc-pham','',1,1,'2026-03-16 11:04:56','2026-03-16 11:04:56'),(192,186,'Đèn','den','',1,1,'2026-03-16 11:05:11','2026-03-16 11:05:11'),(193,186,'Ngoài trời & Sân vườn','ngoai-troi-san-vuon','',1,1,'2026-03-16 11:05:19','2026-03-16 11:05:19'),(194,186,'Đồ dùng phòng tắm','do-dung-phong-tam','',1,1,'2026-03-16 11:05:28','2026-03-16 11:05:28'),(195,186,'Vật phẩm thờ cúng','vat-pham-tho-cung','',1,1,'2026-03-16 11:05:37','2026-03-16 11:05:37'),(196,186,'Đồ trang trí tiệc','do-trang-tri-tiec','',1,1,'2026-03-16 11:05:48','2026-03-16 11:05:48'),(197,186,'Chăm sóc nhà cửa và giặt ủi','cham-soc-nha-cua-va-giat-ui','',1,1,'2026-03-16 11:05:59','2026-03-16 11:05:59'),(198,186,'Sắp xếp nhà cửa','sap-xep-nha-cua','',1,1,'2026-03-16 11:06:08','2026-03-16 11:06:08'),(199,186,'Dụng cụ pha chế','dung-cu-pha-che','',1,1,'2026-03-16 11:06:18','2026-03-16 11:06:18'),(200,186,'Tinh dầu thơm phòng','tinh-dau-thom-phong','',1,1,'2026-03-16 11:06:26','2026-03-16 11:06:26'),(202,0,'Computers & Laptops','computers-laptops','/image/category/1773659281290-maytinhvalaptop.png',0,1,'2026-03-16 11:07:49','2026-04-04 12:55:01'),(204,203,'Sách tiếng Việt','sach-tieng-viet',NULL,1,1,'2026-03-22 14:27:20','2026-03-22 14:27:20'),(205,186,'Đồ dùng phòng ăn','do-dung-phong-an','/image/no-image.png',1,1,'2026-03-25 12:03:15','2026-03-25 12:18:17'),(206,202,'Máy Tính Bàn','may-tinh-ban','',1,1,'2026-03-25 12:19:14','2026-03-25 12:19:14'),(207,202,'Màn Hình','man-hinh','',1,1,'2026-03-25 12:19:55','2026-03-25 12:19:55'),(208,202,'Linh Kiện Máy Tính','linh-kien-may-tinh','',1,1,'2026-03-25 12:20:07','2026-03-25 12:20:07'),(209,202,'Thiết Bị Lưu Trữ','thiet-bi-luu-tru','',1,1,'2026-03-25 12:20:18','2026-03-25 12:20:18'),(210,202,'Thiết Bị Mạng','thiet-bi-mang','',1,1,'2026-03-25 12:20:27','2026-03-25 12:20:27'),(211,202,'Máy In, Máy Scan & Máy Chiếu','may-in-may-scan-may-chieu','',1,1,'2026-03-25 12:24:05','2026-03-25 12:24:05'),(212,202,'Phụ Kiện Máy Tính','phu-kien-may-tinh','',1,1,'2026-03-25 12:24:16','2026-03-25 12:24:16'),(213,0,' Beauty','beauty','/image/category/1774926816954-SacDep.png',0,1,'2026-03-31 02:55:25','2026-03-31 03:13:23'),(214,0,'Bookstore','bookstore','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777022171/category/czej43ybukmmib6en9cs.png',0,1,'2026-04-12 12:10:20','2026-04-26 05:54:58'),(215,0,'Cameras & Camcorders','cameras-camcorders','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175277/category/dsnelhfbeiqsbj14gxcg.png',0,1,'2026-04-26 03:48:00','2026-04-26 03:48:00'),(216,0,'Health','health','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175333/category/blr8gxyqzon8yj23ecke.png',0,1,'2026-04-26 03:48:55','2026-04-26 03:48:55'),(217,0,'Clock','clock','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175394/category/twehhuu8twkc4rvcfpzm.png',0,1,'2026-04-26 03:49:56','2026-04-26 03:49:56'),(218,0,'Women\'s Shoes','womens-shoes','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175447/category/wbhuczsoax5wlpzevp4u.png',0,1,'2026-04-26 03:50:55','2026-04-26 03:50:55'),(219,0,'Men\'s Shoes','mens-shoes','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175547/category/xkcc0f69bhuy1tgus9kd.png',0,1,'2026-04-26 03:52:29','2026-04-26 03:52:29'),(220,0,'women\'s purse','womens-purse','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175632/category/lxak64aemspuntjrwlqm.png',0,1,'2026-04-26 03:53:54','2026-04-26 03:53:54'),(221,0,'Household Electrical Appliances','household-electrical-appliances','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175715/category/iuvvkxfkumtunfp86vum.png',0,1,'2026-04-26 03:55:17','2026-04-26 03:55:17'),(223,0,'Women\'s Accessories & Jewelry','womens-accessories-jewelry','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175861/category/l0y5kapvbm48vsfxzlqd.png',0,1,'2026-04-26 03:56:52','2026-04-26 03:57:43'),(224,0,'Sports & Tourism','sports-tourism','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175924/category/utiaxsjb2j7vsrucmfet.png',0,1,'2026-04-26 03:58:46','2026-04-26 03:58:46'),(225,0,'Department Store Online','department-store-online','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777175988/category/qnqgnztadn4drb3oec9o.png',0,1,'2026-04-26 03:59:49','2026-04-26 03:59:49'),(226,0,'Cars, Motorcycles, and Bicycles','cars-motorcycles-and-bicycles','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176079/category/hblj8mywfznhogmnhnyq.png',0,1,'2026-04-26 04:01:21','2026-04-26 04:01:21'),(227,0,'Men\'s Backpacks & Wallets','mens-backpacks-wallets','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176152/category/nbgu8a50juyuljxmgnfc.png',0,1,'2026-04-26 04:02:35','2026-04-26 04:02:35'),(228,0,'Children\'s Fashion','childrens-fashion','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176194/category/xm1erbpsc2rcreeph7bh.png',0,1,'2026-04-26 04:03:15','2026-04-26 04:03:15'),(229,0,'Toy','toy','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176263/category/p7k4cfyhjripj5v3deoc.png',0,1,'2026-04-26 04:04:15','2026-04-26 04:04:25'),(230,0,'Laundry & Home Care','laundry-home-care','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176307/category/zscrxivbvoz2cdoi43po.png',0,1,'2026-04-26 04:05:09','2026-04-26 04:05:09'),(231,0,'Pet Care','pet-care','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176363/category/yqjunzg4zxn3uynnjnrl.png',0,1,'2026-04-26 04:06:05','2026-04-26 04:06:05'),(232,0,'Vouchers & Services','vouchers-services','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176415/category/rbibebqruitb5vxwwber.png',0,1,'2026-04-26 04:06:57','2026-04-26 04:06:57'),(233,0,'Tools and utility equipment','tools-and-utility-equipment','http://res.cloudinary.com/dizx3mbgw/image/upload/v1777176480/category/shkrooehbyakcwxvy0ru.png',0,1,'2026-04-26 04:08:02','2026-04-26 04:08:02');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_brand`
--

LOCK TABLES `category_brand` WRITE;
/*!40000 ALTER TABLE `category_brand` DISABLE KEYS */;
INSERT INTO `category_brand` VALUES (3,183,5,1),(4,183,7,1),(5,183,6,1),(6,183,11,1),(7,183,9,1),(9,183,10,1),(10,183,8,1),(11,185,7,1),(12,185,4,1),(13,114,3,1),(14,114,2,1),(15,175,10,1),(16,212,11,1);
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
-- Table structure for table `logistics_webhook_log`
--

DROP TABLE IF EXISTS `logistics_webhook_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logistics_webhook_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_shipment_id` bigint DEFAULT NULL,
  `tracking_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `webhook_payload` json NOT NULL,
  `webhook_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed` tinyint(1) DEFAULT '0',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `received_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `return_shipment_id` (`return_shipment_id`),
  KEY `idx_tracking_code` (`tracking_code`),
  KEY `idx_received_at` (`received_at`),
  KEY `idx_processed` (`processed`),
  CONSTRAINT `logistics_webhook_log_ibfk_1` FOREIGN KEY (`return_shipment_id`) REFERENCES `return_shipment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ghi nhật ký webhook từ logistics service';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logistics_webhook_log`
--

LOCK TABLES `logistics_webhook_log` WRITE;
/*!40000 ALTER TABLE `logistics_webhook_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `logistics_webhook_log` ENABLE KEYS */;
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
  `image` varchar(255) DEFAULT NULL,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `total_price` double NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shop_id` bigint NOT NULL,
  `final_quantity` int DEFAULT NULL COMMENT 'So luong chot sau khi buyer chap nhan dieu chinh',
  `is_adjusted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 neu item da duoc dieu chinh so luong',
  `return_status_summary` varchar(50) NOT NULL DEFAULT 'NONE' COMMENT 'NONE, RETURN_REQUESTED, PARTIALLY_RETURNED, FULLY_RETURNED, REFUND_IN_PROGRESS, REFUNDED',
  `returnable_quantity` int DEFAULT NULL COMMENT 'Current maximum quantity still eligible for return',
  `returned_quantity` int NOT NULL DEFAULT '0' COMMENT 'Quantity already physically accepted back by warehouse',
  `refunded_quantity` int NOT NULL DEFAULT '0' COMMENT 'Quantity already financially refunded',
  `total_return_requested_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total requested refund amount for this order item',
  `total_return_approved_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total approved refund amount for this order item',
  `total_refunded_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total successfully refunded amount for this order item',
  `last_return_request_id` bigint DEFAULT NULL COMMENT 'Latest related return_request id for this item',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `fk_item_shipment` (`shipment_id`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `order_item_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1276 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (913,447,402,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-12 13:36:16',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(914,447,402,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-12 13:36:16',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(915,447,403,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-12 13:36:16',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(916,448,404,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-12 14:11:41',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(917,448,404,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-12 14:11:41',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(918,448,405,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-12 14:11:41',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(919,449,406,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-12 15:09:14',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(920,449,407,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-12 15:09:14',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(921,449,407,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-12 15:09:14',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(922,451,408,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-12 15:15:37',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(923,451,408,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-12 15:15:37',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(924,451,409,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-12 15:15:37',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(925,452,410,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-13 01:16:15',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(926,452,410,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-13 01:16:15',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(927,452,411,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-13 01:16:15',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(928,452,411,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-13 01:16:15',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(929,453,412,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-16 02:46:01',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(930,453,412,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',6190000,3,18570000,'2026-04-16 02:46:01',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(931,453,413,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-16 02:46:01',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(932,454,414,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-16 02:55:01',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(933,454,414,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-16 02:55:01',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(934,454,415,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-16 02:55:01',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(935,461,418,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-18 03:28:50',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(936,461,418,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-18 03:28:50',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(937,461,418,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-18 03:28:50',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(938,461,419,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-18 03:28:50',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(939,461,419,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-18 03:28:50',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(940,462,420,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-18 03:56:21',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(941,462,420,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-18 03:56:21',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(942,462,420,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-18 03:56:21',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(943,462,421,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-18 03:56:21',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(944,462,421,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-18 03:56:21',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(945,463,422,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-19 11:52:56',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(946,463,423,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-19 11:52:57',1,NULL,0,'REFUND_IN_PROGRESS',1,0,0,0.00,0.00,0.00,6),(947,463,423,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-19 11:52:57',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(948,464,424,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-19 11:58:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(949,464,424,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-19 11:58:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(950,464,425,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-19 11:58:05',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(951,465,426,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-19 12:01:17',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(952,465,427,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-19 12:01:17',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(953,465,427,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-19 12:01:17',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(954,465,427,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-19 12:01:17',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(955,466,428,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-19 12:22:30',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(956,466,429,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-19 12:22:30',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(957,466,429,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-19 12:22:30',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(958,467,430,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-19 12:24:30',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(959,467,430,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-19 12:24:30',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(960,467,431,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-19 12:24:31',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(983,479,454,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-19 12:52:02',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(984,479,455,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-19 12:52:02',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(994,483,462,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 01:27:23',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(995,483,463,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-20 01:27:23',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(996,483,463,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-20 01:27:23',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(997,484,464,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 01:31:45',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(998,484,465,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-20 01:31:45',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(999,484,465,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-20 01:31:45',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1000,485,466,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 01:33:24',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1001,485,467,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-20 01:33:24',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1002,485,467,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-20 01:33:24',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1003,487,468,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 01:35:04',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1004,487,469,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-20 01:35:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1005,487,469,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-20 01:35:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1006,488,470,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 01:35:57',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1007,488,471,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-20 01:35:57',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1008,489,472,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-20 01:52:15',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1009,489,472,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-20 01:52:15',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1010,489,473,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 01:52:15',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1023,494,482,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-20 03:28:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1024,494,483,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 03:28:05',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1025,494,483,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-20 03:28:05',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1026,495,484,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-20 03:30:53',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1027,495,485,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 03:30:53',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1028,495,485,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-20 03:30:53',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1029,496,486,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-20 03:31:58',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1030,496,487,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-20 03:31:58',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1031,496,487,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-20 03:31:58',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1032,497,488,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-20 03:37:19',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1033,497,489,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-20 03:37:19',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1034,497,489,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-20 03:37:19',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1035,498,490,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-20 03:41:36',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1036,498,491,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-20 03:41:36',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1037,499,492,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-20 05:23:17',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1038,499,493,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-20 05:23:17',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1039,499,493,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-20 05:23:17',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1044,501,496,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-20 07:41:22',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1045,501,496,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-20 07:41:22',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1046,501,496,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-20 07:41:22',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1047,501,497,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-20 07:41:22',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1048,502,498,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-20 07:46:40',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1049,502,498,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-20 07:46:40',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1050,502,498,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-20 07:46:41',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1051,502,499,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-20 07:46:41',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1052,503,500,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-20 07:50:19',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1053,503,501,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-20 07:50:19',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1078,514,518,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-20 12:08:06',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1079,514,518,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-20 12:08:06',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1080,514,519,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-20 12:08:06',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1109,520,528,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-20 12:33:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1110,520,528,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-20 12:33:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1111,520,528,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-20 12:33:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1112,520,528,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-20 12:33:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1113,520,528,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-20 12:33:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1114,520,529,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-20 12:33:31',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1115,520,529,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-20 12:33:32',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1116,521,530,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,1,4190000,'2026-04-21 06:20:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1117,521,530,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-21 06:20:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1118,521,531,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-21 06:20:04',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1119,521,531,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-21 06:20:04',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1120,525,532,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-21 08:12:41',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1121,525,532,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',6190000,3,18570000,'2026-04-21 08:12:41',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1122,525,533,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-21 08:12:41',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1123,527,534,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-21 08:28:44',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1124,527,535,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-21 08:28:44',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1125,528,536,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-21 10:26:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1126,528,536,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-21 10:26:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1127,528,537,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-21 10:26:31',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1128,529,538,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-21 11:47:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1129,529,539,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-21 11:47:04',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1130,529,539,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-21 11:47:04',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1131,530,540,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,1,4190000,'2026-04-21 11:58:11',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1132,530,541,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-21 11:58:11',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1133,531,542,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-21 11:59:46',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1134,531,542,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-21 11:59:46',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1135,531,543,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-21 11:59:46',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1140,533,546,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-21 12:53:14',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1141,533,547,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',6190000,1,6190000,'2026-04-21 12:53:14',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1142,533,547,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-21 12:53:14',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1143,534,548,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-21 14:33:31',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1144,534,549,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-21 14:33:31',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1148,536,552,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-22 03:17:03',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1149,536,552,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,4,16760000,'2026-04-22 03:17:03',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1150,536,553,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-22 03:17:03',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1151,537,554,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-22 03:52:00',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1152,537,554,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-22 03:52:00',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1153,537,554,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-22 03:52:00',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1154,537,555,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-22 03:52:01',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1155,538,556,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-22 04:14:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1156,538,556,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,1,4190000,'2026-04-22 04:14:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1157,538,556,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-22 04:14:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1158,538,557,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-22 04:14:05',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1162,540,560,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-22 06:15:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1163,540,560,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,4,16760000,'2026-04-22 06:15:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1164,540,561,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-22 06:15:04',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1165,541,562,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,7,1533000,'2026-04-22 06:44:17',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1166,541,563,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,4,28000,'2026-04-22 06:44:17',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1167,541,563,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,3,867000,'2026-04-22 06:44:17',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1168,542,564,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-22 08:24:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1169,542,564,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-22 08:24:05',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1170,542,565,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-22 08:24:05',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1171,543,566,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-22 08:30:19',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1172,543,567,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-22 08:30:19',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1173,544,568,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-22 08:35:11',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1174,544,569,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',6190000,3,18570000,'2026-04-22 08:35:11',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1175,545,570,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-22 10:06:49',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1176,545,571,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-22 10:06:49',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1177,546,572,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-22 10:21:11',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1178,546,573,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-22 10:21:11',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1179,547,574,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-22 10:25:12',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1180,547,574,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-22 10:25:12',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1181,548,575,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,1,4190000,'2026-04-22 10:28:34',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1182,548,576,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-22 10:28:34',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1183,550,577,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,4,756000,'2026-04-22 11:16:55',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1184,550,577,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,3,19500,'2026-04-22 11:16:55',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1185,550,578,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,3,21000,'2026-04-22 11:16:55',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1186,551,579,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-22 11:28:48',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1187,552,580,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,7,1533000,'2026-04-22 12:45:13',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1188,553,581,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,7,1533000,'2026-04-22 12:47:23',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1189,554,582,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,2,378000,'2026-04-22 13:26:39',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1190,556,583,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-22 13:29:03',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1191,557,584,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-22 13:45:00',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1192,558,585,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-22 13:48:06',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1193,559,586,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,4,16760000,'2026-04-22 13:49:04',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1194,560,587,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-22 13:51:38',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1195,561,588,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,3,12570000,'2026-04-22 14:49:35',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1196,562,589,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,3,12570000,'2026-04-22 14:52:19',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1197,563,590,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-23 04:43:27',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1198,563,591,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-23 04:43:27',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1199,564,592,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-23 05:43:07',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1200,564,592,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,3,19500,'2026-04-23 05:43:07',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1201,564,593,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-23 05:43:07',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1202,565,594,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-23 11:02:20',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1203,565,595,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-23 11:02:21',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1204,566,596,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-23 13:31:39',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1205,566,597,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-23 13:31:39',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1206,567,598,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-23 15:13:41',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1207,567,599,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-23 15:13:41',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1208,567,599,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-23 15:13:41',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1209,568,600,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-23 15:25:03',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1210,568,601,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-23 15:25:03',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1211,568,601,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-23 15:25:03',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1212,569,602,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,1,7000,'2026-04-23 15:42:20',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1213,569,603,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-23 15:42:20',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1214,570,604,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-23 15:44:47',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1215,570,605,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-23 15:44:47',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1216,571,606,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-24 04:35:09',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1217,571,606,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-24 04:35:10',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1218,571,607,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-24 04:35:10',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1221,573,610,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-24 12:55:15',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1222,573,611,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-24 12:55:15',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1243,584,632,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-24 13:34:50',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1244,584,633,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-24 13:34:50',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1245,585,634,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-24 13:46:03',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1246,585,635,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-24 13:46:03',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1247,586,636,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-24 13:48:57',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1248,586,637,125,22,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',5190000,1,5190000,'2026-04-24 13:48:58',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1249,586,637,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,1,1190,'2026-04-24 13:48:58',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1250,588,638,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-24 14:44:19',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1251,588,639,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,9,2601000,'2026-04-24 14:44:19',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1252,589,640,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-24 15:03:36',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1253,589,640,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',4190000,1,4190000,'2026-04-24 15:03:36',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1254,590,641,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,2,438000,'2026-04-24 15:08:01',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1255,590,641,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-24 15:08:01',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1256,590,642,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-24 15:08:01',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1258,592,644,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',6190000,3,18570000,'2026-04-24 15:23:28',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1259,593,645,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-24 15:50:32',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1260,593,645,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-24 15:50:32',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1261,593,646,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,2,14000,'2026-04-24 15:50:32',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1262,593,646,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',289000,2,578000,'2026-04-24 15:50:32',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1263,594,647,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-26 01:00:10',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1264,594,647,112,9,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',6500,1,6500,'2026-04-26 01:00:10',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1265,594,647,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-26 01:00:10',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1266,595,648,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',7000,5,35000,'2026-04-26 01:16:57',2,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1267,595,649,129,26,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1190,9,10710,'2026-04-26 01:16:57',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1268,595,649,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-26 01:16:57',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1269,595,649,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-26 01:16:57',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1270,602,650,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-26 10:19:22',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1271,602,650,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,2,378000,'2026-04-26 10:19:22',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1272,604,651,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',219000,1,219000,'2026-04-26 11:03:28',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1273,604,651,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD','https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',189000,1,189000,'2026-04-26 11:03:28',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1274,605,652,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',6190000,1,6190000,'2026-04-26 11:15:26',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL),(1275,605,652,117,14,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',26790000,1,26790000,'2026-04-26 11:15:26',1,NULL,0,'NONE',NULL,0,0,0.00,0.00,0.00,NULL);
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
  `return_status_summary` varchar(50) NOT NULL DEFAULT 'NONE' COMMENT 'NONE, RETURN_IN_PROGRESS, PARTIAL_RETURNED, FULL_RETURNED',
  `return_request_count` int NOT NULL DEFAULT '0' COMMENT 'Total number of return requests linked to items in this shipment',
  `total_return_item_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total merchandise amount approved for return within this shipment',
  `total_refunded_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total refunded amount for items in this shipment',
  `return_shipping_fee_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Reverse-logistics fee allocated to this shipment',
  `last_return_request_id` bigint DEFAULT NULL COMMENT 'Latest related return_request id for this shipment',
  `return_completed_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when latest return for this shipment was fully completed',
  `estimated_delivery_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `business_status` varchar(255) DEFAULT NULL,
  `latest_adjustment_request_id` bigint DEFAULT NULL,
  `adjusted_total_amount` double DEFAULT NULL,
  `adjustment_required` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tracking_number` (`tracking_number`),
  KEY `idx_order_id` (`order_id`),
  KEY `fk_order_shipment_latest_adjustment` (`latest_adjustment_request_id`),
  KEY `idx_order_shipment_return_status_summary` (`return_status_summary`),
  KEY `idx_order_shipment_last_return_request_id` (`last_return_request_id`),
  KEY `idx_order_shipment_return_completed_at` (`return_completed_at`),
  CONSTRAINT `fk_order_shipment_latest_adjustment` FOREIGN KEY (`latest_adjustment_request_id`) REFERENCES `shipment_adjustment_request` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_shipment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=653 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_shipment`
--

LOCK TABLES `order_shipment` WRITE;
/*!40000 ALTER TABLE `order_shipment` DISABLE KEYS */;
INSERT INTO `order_shipment` VALUES (402,447,2,'LOG',50000,'LOG66796BE8',2665000,'IN_TRANSIT','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 13:36:16','2026-04-12 14:14:44','NORMAL',NULL,NULL,0),(403,447,1,'LOG',25000,'LOG034EEC52',26815000,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 13:36:16','2026-04-12 13:40:39','NORMAL',NULL,NULL,0),(404,448,1,'LOG',50000,'LOGAD1962D8',5246500,'CONFIRMED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 14:11:41','2026-04-12 14:13:51','NORMAL',NULL,NULL,0),(405,448,2,'LOG',25000,NULL,32000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 14:11:41','2026-04-12 14:11:41','NORMAL',NULL,NULL,0),(406,449,1,'LOG',50000,'LOG8AD35EEA',56500,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 15:09:14','2026-04-13 00:33:02','NORMAL',NULL,NULL,0),(407,449,2,'LOG',50000,NULL,635000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 15:09:14','2026-04-12 15:09:14','NORMAL',NULL,NULL,0),(408,451,1,'LOG',50000,'LOGD3AFCA14',5429000,'CONFIRMED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 15:15:37','2026-04-12 15:17:36','NORMAL',NULL,NULL,0),(409,451,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-12 15:15:37','2026-04-12 15:15:37','NORMAL',NULL,NULL,0),(410,452,1,'LOG',50000,NULL,5429000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-13 01:16:15','2026-04-13 01:16:15','NORMAL',NULL,NULL,0),(411,452,2,'LOG',50000,'LOG1D8C5C87',2665000,'CONFIRMED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-13 01:16:15','2026-04-13 01:17:43','NORMAL',NULL,NULL,0),(412,453,1,'LOG',0,NULL,18759000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-16 02:46:01','2026-04-16 03:17:30','ADJUSTMENT_PENDING_BUYER',1,NULL,1),(413,453,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-16 02:46:01','2026-04-16 02:46:01','NORMAL',NULL,NULL,0),(414,454,1,'LOG',50000,'LOG6643E846',26846500,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-16 02:55:01','2026-04-21 15:23:00','NORMAL',NULL,NULL,0),(415,454,2,'LOG',25000,NULL,39000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-16 02:55:01','2026-04-16 02:55:01','NORMAL',NULL,NULL,0),(418,461,1,'LOG',0,'LOG986D5A2E',31986500,'CONFIRMED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-18 03:28:50','2026-04-19 01:16:03','NORMAL',NULL,NULL,0),(419,461,2,'LOG',0,NULL,585000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-18 03:28:50','2026-04-18 03:28:50','NORMAL',NULL,NULL,0),(420,462,1,'LOG',50000,'LOG3C8366E4',32036500,'CONFIRMED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-18 03:56:21','2026-04-19 01:19:03','NORMAL',NULL,NULL,0),(421,462,2,'LOG',50000,NULL,635000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-18 03:56:21','2026-04-18 03:56:21','NORMAL',NULL,NULL,0),(422,463,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 11:52:56','2026-04-19 11:52:56','NORMAL',NULL,NULL,0),(423,463,1,'LOG',0,NULL,5191190,'PENDING','RETURN_IN_PROGRESS',1,0.00,0.00,0.00,6,NULL,NULL,'2026-04-19 11:52:56','2026-04-26 04:53:11','NORMAL',NULL,NULL,0),(424,464,1,'LOG',0,NULL,26796500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 11:58:05','2026-04-19 11:58:05','NORMAL',NULL,NULL,0),(425,464,2,'LOG',0,NULL,578000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 11:58:05','2026-04-19 11:58:05','NORMAL',NULL,NULL,0),(426,465,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:01:17','2026-04-19 12:01:17','NORMAL',NULL,NULL,0),(427,465,1,'LOG',0,NULL,31981190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:01:17','2026-04-19 12:01:17','NORMAL',NULL,NULL,0),(428,466,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:22:30','2026-04-19 12:22:30','NORMAL',NULL,NULL,0),(429,466,1,'LOG',0,NULL,26791190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:22:30','2026-04-19 12:22:30','NORMAL',NULL,NULL,0),(430,467,1,'LOG',0,NULL,26796500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:24:30','2026-04-19 12:24:30','NORMAL',NULL,NULL,0),(431,467,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:24:31','2026-04-19 12:24:31','NORMAL',NULL,NULL,0),(454,479,1,'LOG',0,NULL,6500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:52:02','2026-04-19 12:52:02','NORMAL',NULL,NULL,0),(455,479,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-19 12:52:02','2026-04-19 12:52:02','NORMAL',NULL,NULL,0),(462,483,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:27:23','2026-04-20 01:27:23','NORMAL',NULL,NULL,0),(463,483,1,'LOG',0,NULL,31980000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:27:23','2026-04-20 01:27:23','NORMAL',NULL,NULL,0),(464,484,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:31:45','2026-04-20 01:31:45','NORMAL',NULL,NULL,0),(465,484,1,'LOG',0,NULL,31980000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:31:45','2026-04-20 01:31:45','NORMAL',NULL,NULL,0),(466,485,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:33:24','2026-04-20 01:33:24','NORMAL',NULL,NULL,0),(467,485,1,'LOG',0,NULL,31980000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:33:24','2026-04-20 01:33:24','NORMAL',NULL,NULL,0),(468,487,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:35:04','2026-04-20 01:35:04','NORMAL',NULL,NULL,0),(469,487,1,'LOG',0,NULL,31980000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:35:04','2026-04-20 01:35:04','NORMAL',NULL,NULL,0),(470,488,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:35:57','2026-04-20 01:35:57','NORMAL',NULL,NULL,0),(471,488,1,'LOG',0,NULL,5190000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:35:57','2026-04-20 01:35:57','NORMAL',NULL,NULL,0),(472,489,1,'LOG',0,NULL,7690,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:52:15','2026-04-20 01:52:15','NORMAL',NULL,NULL,0),(473,489,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 01:52:15','2026-04-20 01:52:15','NORMAL',NULL,NULL,0),(482,494,1,'LOG',50000,NULL,56500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:28:05','2026-04-20 03:28:05','NORMAL',NULL,NULL,0),(483,494,2,'LOG',25000,NULL,610000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:28:05','2026-04-20 03:28:05','NORMAL',NULL,NULL,0),(484,495,1,'LOG',0,NULL,6500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:30:53','2026-04-20 03:30:53','NORMAL',NULL,NULL,0),(485,495,2,'LOG',0,NULL,585000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:30:53','2026-04-20 03:30:53','NORMAL',NULL,NULL,0),(486,496,1,'LOG',0,NULL,6500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:31:58','2026-04-20 03:31:58','NORMAL',NULL,NULL,0),(487,496,2,'LOG',0,NULL,585000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:31:58','2026-04-20 03:31:58','NORMAL',NULL,NULL,0),(488,497,1,'LOG',0,NULL,6500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:37:19','2026-04-20 03:37:19','NORMAL',NULL,NULL,0),(489,497,2,'LOG',0,NULL,592000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:37:19','2026-04-23 06:43:29','NORMAL',NULL,NULL,0),(490,498,2,'LOG',25000,NULL,60000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:41:36','2026-04-20 03:41:36','NORMAL',NULL,NULL,0),(491,498,1,'LOG',0,'LOGA68D6471',10710,'IN_TRANSIT','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 03:41:36','2026-04-20 06:47:54','NORMAL',NULL,NULL,0),(492,499,2,'LOG',0,NULL,35000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 05:23:17','2026-04-20 05:23:17','NORMAL',NULL,NULL,0),(493,499,1,'LOG',0,NULL,5200710,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 05:23:17','2026-04-20 05:23:17','NORMAL',NULL,NULL,0),(496,501,1,'LOG',0,NULL,418710,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 07:41:22','2026-04-20 07:41:22','NORMAL',NULL,NULL,0),(497,501,2,'LOG',0,NULL,35000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 07:41:22','2026-04-20 07:41:22','NORMAL',NULL,NULL,0),(498,502,1,'LOG',0,NULL,418710,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 07:46:40','2026-04-20 07:46:40','NORMAL',NULL,NULL,0),(499,502,2,'LOG',25000,NULL,60000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 07:46:41','2026-04-20 07:46:41','NORMAL',NULL,NULL,0),(500,503,1,'LOG',0,NULL,189000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 07:50:19','2026-04-20 07:50:19','NORMAL',NULL,NULL,0),(501,503,2,'LOG',25000,NULL,60000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 07:50:19','2026-04-20 07:50:19','NORMAL',NULL,NULL,0),(518,514,1,'LOG',0,NULL,17210,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 12:08:06','2026-04-20 12:08:06','NORMAL',NULL,NULL,0),(519,514,2,'LOG',0,NULL,35000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 12:08:06','2026-04-20 12:08:06','NORMAL',NULL,NULL,0),(528,520,1,'LOG',0,NULL,27215210,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 12:33:31','2026-04-20 12:33:31','NORMAL',NULL,NULL,0),(529,520,2,'LOG',0,NULL,613000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-20 12:33:31','2026-04-20 12:33:31','NORMAL',NULL,NULL,0),(530,521,1,'LOG',0,NULL,30980000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 06:20:04','2026-04-21 06:20:04','NORMAL',NULL,NULL,0),(531,521,2,'LOG',0,NULL,592000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 06:20:04','2026-04-21 06:20:04','NORMAL',NULL,NULL,0),(532,525,1,'LOG',0,NULL,18759000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 08:12:41','2026-04-21 08:12:41','NORMAL',NULL,NULL,0),(533,525,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 08:12:41','2026-04-21 08:12:41','NORMAL',NULL,NULL,0),(534,527,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 08:28:44','2026-04-21 08:28:44','NORMAL',NULL,NULL,0),(535,527,1,'LOG',50000,NULL,51190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 08:28:44','2026-04-21 08:28:44','NORMAL',NULL,NULL,0),(536,528,1,'LOG',0,NULL,190190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 10:26:31','2026-04-21 10:26:31','NORMAL',NULL,NULL,0),(537,528,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 10:26:31','2026-04-21 10:26:31','NORMAL',NULL,NULL,0),(538,529,1,'LOG',0,NULL,189000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 11:47:04','2026-04-21 11:47:04','NORMAL',NULL,NULL,0),(539,529,2,'LOG',0,NULL,2615000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 11:47:04','2026-04-21 11:47:04','NORMAL',NULL,NULL,0),(540,530,1,'LOG',0,NULL,4190000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 11:58:11','2026-04-21 11:58:11','NORMAL',NULL,NULL,0),(541,530,2,'LOG',0,NULL,578000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 11:58:11','2026-04-21 11:58:11','NORMAL',NULL,NULL,0),(542,531,1,'LOG',0,NULL,26796500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 11:59:46','2026-04-21 11:59:46','NORMAL',NULL,NULL,0),(543,531,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 11:59:46','2026-04-21 11:59:46','NORMAL',NULL,NULL,0),(546,533,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 12:53:14','2026-04-21 12:53:14','NORMAL',NULL,NULL,0),(547,533,1,'LOG',0,NULL,11380000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 12:53:14','2026-04-21 12:53:14','NORMAL',NULL,NULL,0),(548,534,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 14:33:31','2026-04-21 14:33:31','NORMAL',NULL,NULL,0),(549,534,1,'LOG',0,'LOG9A6EB153',1190,'IN_TRANSIT','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-21 14:33:31','2026-04-21 15:22:46','NORMAL',NULL,NULL,0),(552,536,1,'LOG',0,NULL,17198000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 03:17:03','2026-04-22 03:17:03','NORMAL',NULL,NULL,0),(553,536,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 03:17:03','2026-04-22 03:17:03','NORMAL',NULL,NULL,0),(554,537,1,'LOG',0,'LOG0A23094F',628190,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 03:52:00','2026-04-22 04:01:54','NORMAL',NULL,NULL,0),(555,537,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 03:52:00','2026-04-22 03:52:00','NORMAL',NULL,NULL,0),(556,538,1,'LOG',0,'LOG3922351D',9569000,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 04:14:05','2026-04-22 04:16:30','NORMAL',NULL,NULL,0),(557,538,2,'LOG',0,NULL,35000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 04:14:05','2026-04-22 04:14:05','NORMAL',NULL,NULL,0),(560,540,1,'LOG',0,NULL,16949000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 06:15:04','2026-04-22 06:15:04','NORMAL',NULL,NULL,0),(561,540,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 06:15:04','2026-04-22 06:15:04','NORMAL',NULL,NULL,0),(562,541,1,'LOG',0,NULL,1533000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 06:44:17','2026-04-22 06:44:17','NORMAL',NULL,NULL,0),(563,541,2,'LOG',0,NULL,895000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 06:44:17','2026-04-22 06:44:17','NORMAL',NULL,NULL,0),(564,542,1,'LOG',0,NULL,190190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 08:24:05','2026-04-22 08:24:05','NORMAL',NULL,NULL,0),(565,542,2,'LOG',0,NULL,2601000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 08:24:05','2026-04-22 08:24:05','NORMAL',NULL,NULL,0),(566,543,1,'LOG',0,NULL,438000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 08:30:19','2026-04-22 08:30:19','NORMAL',NULL,NULL,0),(567,543,2,'LOG',0,NULL,2601000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 08:30:19','2026-04-22 08:30:19','NORMAL',NULL,NULL,0),(568,544,2,'LOG',0,NULL,2601000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 08:35:11','2026-04-22 08:35:11','NORMAL',NULL,NULL,0),(569,544,1,'LOG',0,NULL,18570000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 08:35:11','2026-04-22 08:35:11','NORMAL',NULL,NULL,0),(570,545,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 10:06:49','2026-04-22 10:06:49','NORMAL',NULL,NULL,0),(571,545,1,'LOG',0,NULL,1190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 10:06:49','2026-04-22 10:06:49','NORMAL',NULL,NULL,0),(572,546,1,'LOG',0,NULL,438000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 10:21:11','2026-04-22 10:21:11','NORMAL',NULL,NULL,0),(573,546,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 10:21:11','2026-04-22 10:21:11','NORMAL',NULL,NULL,0),(574,547,1,'LOG',0,NULL,5628000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 10:25:12','2026-04-22 10:25:12','NORMAL',NULL,NULL,0),(575,548,1,'LOG',0,NULL,4190000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 10:28:34','2026-04-22 10:28:34','NORMAL',NULL,NULL,0),(576,548,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 10:28:34','2026-04-22 10:28:34','NORMAL',NULL,NULL,0),(577,550,1,'LOG',0,NULL,775500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 11:16:55','2026-04-22 11:16:55','NORMAL',NULL,NULL,0),(578,550,2,'LOG',0,NULL,21000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 11:16:55','2026-04-22 11:16:55','NORMAL',NULL,NULL,0),(579,551,1,'LOG',0,NULL,189000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 11:28:48','2026-04-22 11:28:48','NORMAL',NULL,NULL,0),(580,552,1,'LOG',0,NULL,1533000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 12:45:13','2026-04-22 12:45:13','NORMAL',NULL,NULL,0),(581,553,1,'LOG',0,NULL,1533000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 12:47:23','2026-04-22 12:47:23','NORMAL',NULL,NULL,0),(582,554,1,'LOG',0,NULL,378000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 13:26:39','2026-04-22 13:26:39','NORMAL',NULL,NULL,0),(583,556,1,'LOG',0,NULL,438000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 13:29:03','2026-04-22 13:29:03','NORMAL',NULL,NULL,0),(584,557,1,'LOG',0,NULL,189000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 13:45:00','2026-04-22 13:45:00','NORMAL',NULL,NULL,0),(585,558,1,'LOG',0,NULL,438000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 13:48:06','2026-04-22 13:48:06','NORMAL',NULL,NULL,0),(586,559,1,'LOG',0,NULL,16760000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 13:49:04','2026-04-22 13:49:04','NORMAL',NULL,NULL,0),(587,560,1,'LOG',0,NULL,1190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 13:51:38','2026-04-22 13:51:38','NORMAL',NULL,NULL,0),(588,561,1,'LOG',0,'LOG95BC3BEC',12570000,'CONFIRMED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 14:49:35','2026-04-22 15:21:33','NORMAL',NULL,NULL,0),(589,562,1,'LOG',0,'LOG96F4C55A',12570000,'OUT_FOR_DELIVERY','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-22 14:52:19','2026-04-23 04:41:27','NORMAL',NULL,NULL,0),(590,563,2,'LOG',0,NULL,2601000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 04:43:27','2026-04-23 04:43:27','NORMAL',NULL,NULL,0),(591,563,1,'LOG',0,'LOGCA36F4B7',438000,'CONFIRMED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 04:43:27','2026-04-23 10:59:23','NORMAL',NULL,NULL,0),(592,564,1,'LOG',0,'LOGC4CC98A9',238500,'COMPLETED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 05:43:07','2026-04-23 07:04:29','NORMAL',NULL,NULL,0),(593,564,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 05:43:07','2026-04-23 05:43:07','NORMAL',NULL,NULL,0),(594,565,2,'LOG',0,NULL,578000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 11:02:20','2026-04-23 11:02:20','NORMAL',NULL,NULL,0),(595,565,1,'LOG',0,'LOGC0978839',6500,'COMPLETED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 11:02:20','2026-04-23 11:08:12','NORMAL',NULL,NULL,0),(596,566,1,'LOG',0,NULL,438000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 13:31:39','2026-04-23 13:31:39','NORMAL',NULL,NULL,0),(597,566,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 13:31:39','2026-04-23 13:31:39','NORMAL',NULL,NULL,0),(598,567,2,'LOG',0,'LOGEF01680D',578000,'OUT_FOR_DELIVERY','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:13:41','2026-04-23 15:23:28','NORMAL',NULL,NULL,0),(599,567,1,'LOG',0,'LOG73A17D33',225500,'OUT_FOR_DELIVERY','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:13:41','2026-04-23 15:18:28','NORMAL',NULL,NULL,0),(600,568,1,'LOG',0,'LOG172EB613',6500,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:25:03','2026-04-23 15:26:34','NORMAL',NULL,NULL,0),(601,568,2,'LOG',0,NULL,592000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:25:03','2026-04-23 15:25:03','NORMAL',NULL,NULL,0),(602,569,2,'LOG',0,NULL,7000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:42:20','2026-04-23 15:42:20','NORMAL',NULL,NULL,0),(603,569,1,'LOG',0,NULL,1190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:42:20','2026-04-23 15:42:20','NORMAL',NULL,NULL,0),(604,570,2,'LOG',0,NULL,35000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:44:47','2026-04-23 15:44:47','NORMAL',NULL,NULL,0),(605,570,1,'LOG',0,'LOGC2DBFAC9',10710,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-23 15:44:47','2026-04-24 12:53:05','NORMAL',NULL,NULL,0),(606,571,1,'LOG',0,'LOGA6C64B7C',439190,'COMPLETED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 04:35:09','2026-04-24 05:15:06','NORMAL',NULL,NULL,0),(607,571,2,'LOG',0,'LOG915E4ADF',14000,'COMPLETED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 04:35:10','2026-04-24 05:45:39','NORMAL',NULL,NULL,0),(610,573,1,'LOG',0,'LOG7DF68E34',6500,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 12:55:15','2026-04-24 12:58:39','NORMAL',NULL,NULL,0),(611,573,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 12:55:15','2026-04-24 12:55:15','NORMAL',NULL,NULL,0),(632,584,1,'LOG',0,NULL,219000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 13:34:50','2026-04-24 13:34:50','NORMAL',NULL,NULL,0),(633,584,2,'LOG',0,NULL,35000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 13:34:50','2026-04-24 13:34:50','NORMAL',NULL,NULL,0),(634,585,1,'LOG',0,NULL,189000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 13:46:03','2026-04-24 13:46:03','NORMAL',NULL,NULL,0),(635,585,2,'LOG',0,NULL,35000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 13:46:03','2026-04-24 13:46:03','NORMAL',NULL,NULL,0),(636,586,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 13:48:57','2026-04-24 13:48:57','NORMAL',NULL,NULL,0),(637,586,1,'LOG',0,NULL,5191190,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 13:48:57','2026-04-24 13:48:57','NORMAL',NULL,NULL,0),(638,588,1,'LOG',0,NULL,438000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 14:44:19','2026-04-24 14:44:19','NORMAL',NULL,NULL,0),(639,588,2,'LOG',0,NULL,2601000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 14:44:19','2026-04-24 14:44:19','NORMAL',NULL,NULL,0),(640,589,1,'LOG',0,NULL,4196500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 15:03:36','2026-04-24 15:03:36','NORMAL',NULL,NULL,0),(641,590,1,'LOG',0,NULL,627000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 15:08:01','2026-04-24 15:08:01','NORMAL',NULL,NULL,0),(642,590,2,'LOG',0,NULL,14000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 15:08:01','2026-04-24 15:08:01','NORMAL',NULL,NULL,0),(644,592,1,'LOG',0,NULL,18570000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 15:23:28','2026-04-24 15:23:28','NORMAL',NULL,NULL,0),(645,593,1,'LOG',0,NULL,26796500,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 15:50:32','2026-04-24 15:50:32','NORMAL',NULL,NULL,0),(646,593,2,'LOG',0,NULL,592000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-24 15:50:32','2026-04-24 15:50:32','NORMAL',NULL,NULL,0),(647,594,1,'LOG',0,'LOG8A5A9147',27015500,'PICKED_UP','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-26 01:00:10','2026-04-26 01:15:25','NORMAL',NULL,NULL,0),(648,595,2,'LOG',0,'LOGCEA394A0',35000,'COMPLETED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-26 01:16:57','2026-04-27 00:55:07','NORMAL',NULL,NULL,0),(649,595,1,'LOG',0,'LOG4C0D913A',418710,'COMPLETED','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-26 01:16:57','2026-04-26 01:38:41','NORMAL',NULL,NULL,0),(650,602,1,'LOG',0,NULL,597000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-26 10:19:22','2026-04-26 10:19:22','NORMAL',NULL,NULL,0),(651,604,1,'LOG',0,NULL,408000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-26 11:03:28','2026-04-26 11:03:28','NORMAL',NULL,NULL,0),(652,605,1,'LOG',0,NULL,32980000,'PENDING','NONE',0,0.00,0.00,0.00,NULL,NULL,NULL,'2026-04-26 11:15:26','2026-04-26 11:15:26','NORMAL',NULL,NULL,0);
/*!40000 ALTER TABLE `order_shipment` ENABLE KEYS */;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_order_shipment_after_insert_status_history` AFTER INSERT ON `order_shipment` FOR EACH ROW BEGIN
    INSERT INTO `order_shipment_status_history` (
      `order_shipment_id`,
      `old_status`,
      `new_status`,
      `changed_at`,
      `changed_by`,
      `note`
    )
    VALUES (
      NEW.`id`,
      NULL,
      'PENDING',
      CURRENT_TIMESTAMP,
      SUBSTRING_INDEX(USER(), '@', 1),
      'pending - waiting shop confirmation'
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_order_shipment_after_update_status_history` AFTER UPDATE ON `order_shipment` FOR EACH ROW BEGIN

IF NOT (OLD.shipping_status <=> NEW.shipping_status) THEN
INSERT INTO order_shipment_status_history (
order_shipment_id,
old_status,
new_status,
changed_at,
changed_by,
note
)
VALUES (
NEW.id,
OLD.shipping_status,
NEW.shipping_status,
CURRENT_TIMESTAMP,
SUBSTRING_INDEX(USER(), '@', 1),
'status changed from order_shipment update'
);
END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  `changed_by` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_shipment_status_history_shipment_id` (`order_shipment_id`),
  KEY `idx_order_shipment_status_history_changed_at` (`changed_at`),
  CONSTRAINT `fk_order_shipment_status_history_shipment` FOREIGN KEY (`order_shipment_id`) REFERENCES `order_shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=208 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_shipment_status_history`
--

LOCK TABLES `order_shipment_status_history` WRITE;
/*!40000 ALTER TABLE `order_shipment_status_history` DISABLE KEYS */;
INSERT INTO `order_shipment_status_history` VALUES (2,403,'PENDING','CONFIRMED','2026-04-12 13:38:45','root','status changed from order_shipment update'),(3,403,'CONFIRMED','PICKED_UP','2026-04-12 13:40:39','root','status changed from order_shipment update'),(4,402,'PENDING','CONFIRMED','2026-04-12 13:56:15','root','status changed from order_shipment update'),(5,402,'CONFIRMED','PICKED_UP','2026-04-12 14:08:58','root','status changed from order_shipment update'),(6,404,'PENDING','CONFIRMED','2026-04-12 14:13:51','root','status changed from order_shipment update'),(7,402,'PICKED_UP','IN_TRANSIT','2026-04-12 14:14:44','root','status changed from order_shipment update'),(8,408,'PENDING','CONFIRMED','2026-04-12 15:17:36','root','status changed from order_shipment update'),(9,406,'PENDING','CONFIRMED','2026-04-13 07:32:31','SYSTEM','status changed by confirm-packaged'),(10,406,'PENDING','CONFIRMED','2026-04-13 00:32:30','root','status changed from order_shipment update'),(11,406,'CONFIRMED','PICKED_UP','2026-04-13 07:33:02','SYSTEM','status changed from logistics event'),(12,406,'CONFIRMED','PICKED_UP','2026-04-13 00:33:02','root','status changed from order_shipment update'),(13,410,NULL,'PENDING','2026-04-13 01:16:15','root','pending - waiting shop confirmation'),(14,411,NULL,'PENDING','2026-04-13 01:16:15','root','pending - waiting shop confirmation'),(16,411,'PENDING','CONFIRMED','2026-04-13 01:17:43','root','status changed from order_shipment update'),(17,412,NULL,'PENDING','2026-04-16 02:46:01','root','pending - waiting shop confirmation'),(18,413,NULL,'PENDING','2026-04-16 02:46:01','root','pending - waiting shop confirmation'),(19,414,NULL,'PENDING','2026-04-16 02:55:01','root','pending - waiting shop confirmation'),(20,415,NULL,'PENDING','2026-04-16 02:55:01','root','pending - waiting shop confirmation'),(21,414,'PENDING','CONFIRMED','2026-04-16 02:57:05','root','status changed from order_shipment update'),(24,418,NULL,'PENDING','2026-04-18 03:28:50','avnadmin','pending - waiting shop confirmation'),(25,419,NULL,'PENDING','2026-04-18 03:28:50','avnadmin','pending - waiting shop confirmation'),(26,420,NULL,'PENDING','2026-04-18 03:56:21','avnadmin','pending - waiting shop confirmation'),(27,421,NULL,'PENDING','2026-04-18 03:56:21','avnadmin','pending - waiting shop confirmation'),(28,418,'PENDING','CONFIRMED','2026-04-19 01:16:03','avnadmin','status changed from order_shipment update'),(29,420,'PENDING','CONFIRMED','2026-04-19 01:19:03','avnadmin','status changed from order_shipment update'),(30,422,NULL,'PENDING','2026-04-19 11:52:56','avnadmin','pending - waiting shop confirmation'),(31,423,NULL,'PENDING','2026-04-19 11:52:56','avnadmin','pending - waiting shop confirmation'),(32,424,NULL,'PENDING','2026-04-19 11:58:05','avnadmin','pending - waiting shop confirmation'),(33,425,NULL,'PENDING','2026-04-19 11:58:05','avnadmin','pending - waiting shop confirmation'),(34,426,NULL,'PENDING','2026-04-19 12:01:17','avnadmin','pending - waiting shop confirmation'),(35,427,NULL,'PENDING','2026-04-19 12:01:17','avnadmin','pending - waiting shop confirmation'),(36,428,NULL,'PENDING','2026-04-19 12:22:30','avnadmin','pending - waiting shop confirmation'),(37,429,NULL,'PENDING','2026-04-19 12:22:30','avnadmin','pending - waiting shop confirmation'),(38,430,NULL,'PENDING','2026-04-19 12:24:30','avnadmin','pending - waiting shop confirmation'),(39,431,NULL,'PENDING','2026-04-19 12:24:31','avnadmin','pending - waiting shop confirmation'),(62,454,NULL,'PENDING','2026-04-19 12:52:02','avnadmin','pending - waiting shop confirmation'),(63,455,NULL,'PENDING','2026-04-19 12:52:02','avnadmin','pending - waiting shop confirmation'),(70,462,NULL,'PENDING','2026-04-20 01:27:23','avnadmin','pending - waiting shop confirmation'),(71,463,NULL,'PENDING','2026-04-20 01:27:23','avnadmin','pending - waiting shop confirmation'),(72,464,NULL,'PENDING','2026-04-20 01:31:45','avnadmin','pending - waiting shop confirmation'),(73,465,NULL,'PENDING','2026-04-20 01:31:45','avnadmin','pending - waiting shop confirmation'),(74,466,NULL,'PENDING','2026-04-20 01:33:24','avnadmin','pending - waiting shop confirmation'),(75,467,NULL,'PENDING','2026-04-20 01:33:24','avnadmin','pending - waiting shop confirmation'),(76,468,NULL,'PENDING','2026-04-20 01:35:04','avnadmin','pending - waiting shop confirmation'),(77,469,NULL,'PENDING','2026-04-20 01:35:04','avnadmin','pending - waiting shop confirmation'),(78,470,NULL,'PENDING','2026-04-20 01:35:57','avnadmin','pending - waiting shop confirmation'),(79,471,NULL,'PENDING','2026-04-20 01:35:57','avnadmin','pending - waiting shop confirmation'),(80,472,NULL,'PENDING','2026-04-20 01:52:15','avnadmin','pending - waiting shop confirmation'),(81,473,NULL,'PENDING','2026-04-20 01:52:15','avnadmin','pending - waiting shop confirmation'),(90,482,NULL,'PENDING','2026-04-20 03:28:05','avnadmin','pending - waiting shop confirmation'),(91,483,NULL,'PENDING','2026-04-20 03:28:05','avnadmin','pending - waiting shop confirmation'),(92,484,NULL,'PENDING','2026-04-20 03:30:53','avnadmin','pending - waiting shop confirmation'),(93,485,NULL,'PENDING','2026-04-20 03:30:53','avnadmin','pending - waiting shop confirmation'),(94,486,NULL,'PENDING','2026-04-20 03:31:58','avnadmin','pending - waiting shop confirmation'),(95,487,NULL,'PENDING','2026-04-20 03:31:58','avnadmin','pending - waiting shop confirmation'),(96,488,NULL,'PENDING','2026-04-20 03:37:19','avnadmin','pending - waiting shop confirmation'),(97,489,NULL,'PENDING','2026-04-20 03:37:19','avnadmin','pending - waiting shop confirmation'),(98,490,NULL,'PENDING','2026-04-20 03:41:36','avnadmin','pending - waiting shop confirmation'),(99,491,NULL,'PENDING','2026-04-20 03:41:36','avnadmin','pending - waiting shop confirmation'),(100,491,'PENDING','CONFIRMED','2026-04-20 03:45:14','avnadmin','status changed from order_shipment update'),(101,491,'CONFIRMED','PICKED_UP','2026-04-20 03:46:14','avnadmin','status changed from order_shipment update'),(102,492,NULL,'PENDING','2026-04-20 05:23:17','avnadmin','pending - waiting shop confirmation'),(103,493,NULL,'PENDING','2026-04-20 05:23:17','avnadmin','pending - waiting shop confirmation'),(104,491,'PICKED_UP','IN_TRANSIT','2026-04-20 06:47:54','avnadmin','status changed from order_shipment update'),(107,496,NULL,'PENDING','2026-04-20 07:41:22','avnadmin','pending - waiting shop confirmation'),(108,497,NULL,'PENDING','2026-04-20 07:41:22','avnadmin','pending - waiting shop confirmation'),(109,498,NULL,'PENDING','2026-04-20 07:46:40','avnadmin','pending - waiting shop confirmation'),(110,499,NULL,'PENDING','2026-04-20 07:46:41','avnadmin','pending - waiting shop confirmation'),(111,500,NULL,'PENDING','2026-04-20 07:50:19','avnadmin','pending - waiting shop confirmation'),(112,501,NULL,'PENDING','2026-04-20 07:50:19','avnadmin','pending - waiting shop confirmation'),(129,518,NULL,'PENDING','2026-04-20 12:08:06','avnadmin','pending - waiting shop confirmation'),(130,519,NULL,'PENDING','2026-04-20 12:08:06','avnadmin','pending - waiting shop confirmation'),(139,528,NULL,'PENDING','2026-04-20 12:33:31','avnadmin','pending - waiting shop confirmation'),(140,529,NULL,'PENDING','2026-04-20 12:33:31','avnadmin','pending - waiting shop confirmation'),(141,592,'PENDING','CONFIRMED','2026-04-23 05:51:54','root','status changed from order_shipment update'),(142,592,'CONFIRMED','PICKED_UP','2026-04-23 06:03:08','root','status changed from order_shipment update'),(143,592,'PICKED_UP','IN_TRANSIT','2026-04-23 06:03:20','root','status changed from order_shipment update'),(144,592,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-23 06:20:16','root','status changed from order_shipment update'),(145,592,'OUT_FOR_DELIVERY','DELIVERED','2026-04-23 06:29:59','root','status changed from order_shipment update'),(148,592,'DELIVERED','COMPLETED','2026-04-23 14:04:30','buyer','buyer confirmed received'),(149,592,'DELIVERED','COMPLETED','2026-04-23 07:04:29','root','status changed from order_shipment update'),(150,591,'PENDING','CONFIRMED','2026-04-23 10:59:23','root','status changed from order_shipment update'),(151,595,'PENDING','CONFIRMED','2026-04-23 11:03:38','root','status changed from order_shipment update'),(152,595,'CONFIRMED','PICKED_UP','2026-04-23 11:04:01','root','status changed from order_shipment update'),(153,595,'PICKED_UP','IN_TRANSIT','2026-04-23 11:04:23','root','status changed from order_shipment update'),(154,595,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-23 11:04:32','root','status changed from order_shipment update'),(155,595,'OUT_FOR_DELIVERY','DELIVERED','2026-04-23 11:04:55','root','status changed from order_shipment update'),(156,595,'DELIVERED','COMPLETED','2026-04-23 18:08:13','buyer','buyer confirmed received'),(157,595,'DELIVERED','COMPLETED','2026-04-23 11:08:12','root','status changed from order_shipment update'),(158,599,'PENDING','CONFIRMED','2026-04-23 15:15:09','root','status changed from order_shipment update'),(159,599,'CONFIRMED','PICKED_UP','2026-04-23 15:15:49','root','status changed from order_shipment update'),(160,599,'PICKED_UP','IN_TRANSIT','2026-04-23 15:16:32','root','status changed from order_shipment update'),(161,599,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-23 15:18:28','root','status changed from order_shipment update'),(162,598,'PENDING','CONFIRMED','2026-04-23 15:19:37','root','status changed from order_shipment update'),(163,598,'CONFIRMED','PICKED_UP','2026-04-23 15:22:02','root','status changed from order_shipment update'),(164,598,'PICKED_UP','IN_TRANSIT','2026-04-23 15:23:09','root','status changed from order_shipment update'),(165,598,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-23 15:23:28','root','status changed from order_shipment update'),(166,600,'PENDING','CONFIRMED','2026-04-23 15:26:18','root','status changed from order_shipment update'),(167,600,'CONFIRMED','PICKED_UP','2026-04-23 15:26:34','root','status changed from order_shipment update'),(168,605,'PENDING','CONFIRMED','2026-04-23 15:46:23','root','status changed from order_shipment update'),(169,606,'PENDING','CONFIRMED','2026-04-24 04:50:51','root','status changed from order_shipment update'),(170,606,'CONFIRMED','PICKED_UP','2026-04-24 04:51:26','root','status changed from order_shipment update'),(171,606,'PICKED_UP','IN_TRANSIT','2026-04-24 04:53:58','root','status changed from order_shipment update'),(172,606,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-24 04:55:17','root','status changed from order_shipment update'),(173,606,'OUT_FOR_DELIVERY','DELIVERED','2026-04-24 04:56:12','root','status changed from order_shipment update'),(174,607,'PENDING','CONFIRMED','2026-04-24 04:58:34','root','status changed from order_shipment update'),(175,607,'CONFIRMED','PICKED_UP','2026-04-24 04:59:46','root','status changed from order_shipment update'),(176,607,'PICKED_UP','IN_TRANSIT','2026-04-24 05:13:14','root','status changed from order_shipment update'),(177,607,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-24 05:14:09','root','status changed from order_shipment update'),(178,607,'OUT_FOR_DELIVERY','DELIVERED','2026-04-24 05:14:55','root','status changed from order_shipment update'),(179,606,'DELIVERED','COMPLETED','2026-04-24 12:15:06','buyer','buyer confirmed received'),(180,606,'DELIVERED','COMPLETED','2026-04-24 05:15:06','root','status changed from order_shipment update'),(181,607,'DELIVERED','COMPLETED','2026-04-24 12:45:40','buyer','buyer confirmed received'),(182,607,'DELIVERED','COMPLETED','2026-04-24 05:45:39','root','status changed from order_shipment update'),(183,605,'CONFIRMED','PICKED_UP','2026-04-24 12:53:05','root','status changed from order_shipment update'),(184,610,'PENDING','CONFIRMED','2026-04-24 12:58:13','root','status changed from order_shipment update'),(185,610,'CONFIRMED','PICKED_UP','2026-04-24 12:58:39','root','status changed from order_shipment update'),(186,647,NULL,'PENDING','2026-04-26 01:00:10','developer','pending - waiting shop confirmation'),(187,647,'PENDING','CONFIRMED','2026-04-26 01:14:33','developer','status changed from order_shipment update'),(188,647,'CONFIRMED','PICKED_UP','2026-04-26 01:15:25','developer','status changed from order_shipment update'),(189,648,NULL,'PENDING','2026-04-26 01:16:57','developer','pending - waiting shop confirmation'),(190,649,NULL,'PENDING','2026-04-26 01:16:57','developer','pending - waiting shop confirmation'),(191,649,'PENDING','CONFIRMED','2026-04-26 01:18:26','developer','status changed from order_shipment update'),(192,649,'CONFIRMED','PICKED_UP','2026-04-26 01:18:38','developer','status changed from order_shipment update'),(193,648,'PENDING','CONFIRMED','2026-04-26 01:19:34','developer','status changed from order_shipment update'),(194,649,'PICKED_UP','IN_TRANSIT','2026-04-26 01:19:45','developer','status changed from order_shipment update'),(195,648,'CONFIRMED','PICKED_UP','2026-04-26 01:19:59','developer','status changed from order_shipment update'),(196,649,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-26 01:29:01','developer','status changed from order_shipment update'),(197,648,'PICKED_UP','IN_TRANSIT','2026-04-26 01:29:17','developer','status changed from order_shipment update'),(198,649,'OUT_FOR_DELIVERY','DELIVERED','2026-04-26 01:29:44','developer','status changed from order_shipment update'),(199,649,'DELIVERED','COMPLETED','2026-04-26 08:38:41','buyer','buyer confirmed received'),(200,649,'DELIVERED','COMPLETED','2026-04-26 01:38:41','developer','status changed from order_shipment update'),(201,648,'IN_TRANSIT','OUT_FOR_DELIVERY','2026-04-26 02:15:01','developer','status changed from order_shipment update'),(202,648,'OUT_FOR_DELIVERY','DELIVERED','2026-04-26 02:15:37','developer','status changed from order_shipment update'),(203,650,NULL,'PENDING','2026-04-26 10:19:22','developer','pending - waiting shop confirmation'),(204,651,NULL,'PENDING','2026-04-26 11:03:28','developer','pending - waiting shop confirmation'),(205,652,NULL,'PENDING','2026-04-26 11:15:26','developer','pending - waiting shop confirmation'),(206,648,'DELIVERED','COMPLETED','2026-04-27 07:55:07','buyer','buyer confirmed received'),(207,648,'DELIVERED','COMPLETED','2026-04-27 00:55:07','developer','status changed from order_shipment update');
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
  `return_status_summary` varchar(50) NOT NULL DEFAULT 'NONE' COMMENT 'NONE, PARTIAL_RETURN_IN_PROGRESS, PARTIAL_RETURNED, FULL_RETURN_IN_PROGRESS, FULL_RETURNED',
  `return_request_count` int NOT NULL DEFAULT '0' COMMENT 'Total number of return requests created for this order',
  `total_return_requested_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total amount requested by buyer across all return requests of this order',
  `total_return_approved_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total approved amount across all return requests of this order',
  `total_refunded_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total successfully refunded amount for this order',
  `total_return_shipping_fee_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total reverse-logistics fee caused by return requests of this order',
  `last_return_request_id` bigint DEFAULT NULL COMMENT 'Latest related return_request id for quick navigation',
  `last_refunded_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp of latest successful refund for this order',
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
  KEY `idx_orders_return_status_summary` (`return_status_summary`),
  KEY `idx_orders_last_return_request_id` (`last_return_request_id`),
  KEY `idx_orders_last_refunded_at` (`last_refunded_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=606 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (447,'ORD202503180011D05D3BE',1,7,29405000,75000,0,29480000,'cod','PENDING','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG66796BE8',NULL,NULL,NULL,'2026-04-12 13:36:16','2026-04-12 14:08:58'),(448,'ORD20250318001FFE91440',1,14,5203500,75000,0,5278500,'cod','PENDING','CONFIRMED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGAD1962D8',NULL,NULL,NULL,'2026-04-12 14:11:41','2026-04-12 14:13:51'),(449,'ORD202503180012F8494E5',1,15,591500,100000,0,691500,'cod','PENDING','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG8AD35EEA',NULL,NULL,NULL,'2026-04-12 15:09:14','2026-04-13 00:33:02'),(451,'ORD202503180011D075260',1,16,5386000,50000,0,5436000,'cod','PENDING','CONFIRMED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGD3AFCA14',NULL,NULL,NULL,'2026-04-12 15:15:37','2026-04-12 15:17:36'),(452,'ORD20250318001ECFC6787',1,7,7994000,100000,0,8094000,'cod','PENDING','CONFIRMED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG1D8C5C87',NULL,NULL,NULL,'2026-04-13 01:16:15','2026-04-13 01:17:43'),(453,'ORD20250318001655AA577',1,7,18773000,0,0,18773000,'cod','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-16 02:46:01','2026-04-16 02:46:01'),(454,'ORD20250318001F8CB0FDA',1,15,26810500,75000,0,26885500,'cod','PENDING','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG6643E846',NULL,NULL,NULL,'2026-04-16 02:55:00','2026-04-21 15:23:00'),(461,'ORD2025031800118AAB870',1,14,32571500,0,0,32571500,'cod','PENDING','CONFIRMED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG986D5A2E',NULL,NULL,NULL,'2026-04-18 03:28:50','2026-04-19 01:16:03'),(462,'ORD20250318001BFE3C461',1,14,32571500,100000,0,32671500,'cod','PENDING','CONFIRMED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG3C8366E4',NULL,NULL,NULL,'2026-04-18 03:56:21','2026-04-19 01:19:03'),(463,'ORD202503180010CE20121',1,7,5205190,0,0,5205190,'cod','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-19 11:52:56','2026-04-19 11:52:56'),(464,'ORD202503180013D4F0DBD',1,15,27374500,0,0,27374500,'cod','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-19 11:58:04','2026-04-19 11:58:04'),(465,'ORD202503180019FE09F71',1,14,31988190,0,0,31988190,'cod','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-19 12:01:17','2026-04-19 12:01:17'),(466,'ORD2025031800128EB7952',1,7,26805190,0,0,26805190,'cod','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-19 12:22:30','2026-04-19 12:22:30'),(467,'ORD20250318001B29FB93B',1,15,26810500,0,0,26810500,'cod','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-19 12:24:30','2026-04-19 12:24:30'),(479,'ORD2025031800144571A3B',1,14,13500,0,0,13500,'cod','FAILED','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-19 12:52:02','2026-04-19 12:52:02'),(483,'ORD2025031800180094809',1,14,31987000,0,0,31987000,'vnpay','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 01:27:23','2026-04-20 01:27:23'),(484,'ORD20250318001F15E967A',1,14,31987000,0,0,31987000,'vnpay','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 01:31:45','2026-04-20 01:31:45'),(485,'ORD20250318001357E4613',1,14,31987000,0,0,31987000,'vnpay','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 01:33:24','2026-04-20 01:33:24'),(487,'ORD202503180018210B53D',1,14,31987000,0,0,31987000,'vnpay','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 01:35:04','2026-04-20 01:35:04'),(488,'ORD20250318001749B2411',1,14,5197000,0,0,5197000,'vnpay','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 01:35:57','2026-04-20 01:35:57'),(489,'ORD2025031800127A3D2F2',1,14,14690,0,0,14690,'vnpay','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 01:52:15','2026-04-20 01:52:15'),(494,'ORD20250318001E9A83B2A',1,14,591500,75000,0,666500,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 03:28:05','2026-04-20 03:28:05'),(495,'ORD2025031800112F33B11',1,14,591500,0,0,591500,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 03:30:53','2026-04-20 03:30:53'),(496,'ORD20250318001A97CAF2F',1,14,591500,0,0,591500,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 03:31:58','2026-04-20 03:31:58'),(497,'ORD20250318001B1F9FCB3',1,15,598500,0,0,598500,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 03:37:19','2026-04-20 03:37:19'),(498,'ORD2025031800192D57643',1,14,45710,25000,0,70710,'VNPAY','PENDING','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGA68D6471',NULL,NULL,NULL,'2026-04-20 03:41:36','2026-04-20 03:46:14'),(499,'ORD2025031800143A3EA73',1,14,5235710,0,0,5235710,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 05:23:17','2026-04-20 05:23:17'),(501,'ORD202503180014D52F495',1,14,453710,0,0,453710,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 07:41:22','2026-04-20 07:41:22'),(502,'ORD202503180015494F57A',1,14,453710,25000,0,478710,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 07:46:40','2026-04-20 07:46:40'),(503,'ORD20250318001E93EF8E7',1,14,224000,25000,0,249000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 07:50:19','2026-04-21 10:31:40'),(514,'ORD20250318001766CEA7E',1,14,52210,0,0,52210,'VNPAY','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 12:08:06','2026-04-20 12:08:06'),(520,'ORD20250318001C42BE7CA',1,14,27828210,0,0,27828210,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-20 12:33:31','2026-04-21 10:31:40'),(521,'ORD202503180016E71808A',1,15,31572000,0,0,31572000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 06:20:04','2026-04-21 10:31:40'),(525,'ORD20250318001A7F1F879',1,7,18773000,0,0,18773000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 08:12:40','2026-04-21 10:31:50'),(527,'ORD20250318001366B79EA',1,7,15190,50000,0,65190,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 08:28:44','2026-04-21 10:31:59'),(528,'ORD202503180016E99F5ED',1,7,204190,0,0,204190,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 10:26:31','2026-04-21 10:31:59'),(529,'ORD2025031800124A07C04',1,7,2804000,0,0,2804000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 11:47:04','2026-04-21 11:47:56'),(530,'ORD20250318001D57E460F',1,15,4768000,0,0,4768000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 11:58:11','2026-04-21 11:58:50'),(531,'ORD202503180011D5E13C8',1,15,26810500,0,0,26810500,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 11:59:46','2026-04-21 11:59:52'),(533,'ORD202503180019E38AD0E',1,17,11387000,0,0,11387000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-21 12:53:13','2026-04-21 12:54:34'),(534,'ORD20250318001880441FE',1,17,8190,0,0,0,'VNPAY','FAILED','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG9A6EB153',NULL,NULL,NULL,'2026-04-21 14:33:31','2026-04-21 15:08:11'),(536,'ORD202503180011D82FFA0',1,7,17212000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 03:17:03','2026-04-22 03:17:28'),(537,'ORD2025031800103B4AB04',1,7,642190,0,0,642190,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG0A23094F',NULL,NULL,NULL,'2026-04-22 03:52:00','2026-04-22 04:01:54'),(538,'ORD20250318001504B2E15',1,14,9604000,0,0,9604000,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG3922351D',NULL,NULL,NULL,'2026-04-22 04:14:05','2026-04-22 04:16:30'),(540,'ORD2025031800189945F31',1,7,16963000,0,0,16963000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 06:15:04','2026-04-22 06:16:57'),(541,'ORD20250318001F5559073',1,6,2428000,0,0,2428000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 06:44:17','2026-04-22 06:45:38'),(542,'ORD202503180014F9FF2C0',1,7,2791190,0,0,2791190,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 08:24:05','2026-04-22 08:24:49'),(543,'ORD2025031800161461784',1,7,3039000,0,0,3039000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 08:30:19','2026-04-22 08:30:48'),(544,'ORD2025031800140846CA4',1,7,21171000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 08:35:11','2026-04-22 08:36:22'),(545,'ORD20250318001D89757E2',1,7,15190,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 10:06:48','2026-04-22 10:11:41'),(546,'ORD202503180014ABEDCD5',1,7,452000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 10:21:11','2026-04-22 10:21:20'),(547,'ORD20250318001C765EEFC',1,7,5628000,0,0,5628000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 10:25:12','2026-04-22 10:26:34'),(548,'ORD202503180016F1639CC',1,15,4204000,0,0,4204000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 10:28:34','2026-04-22 10:29:46'),(550,'ORD202503180013B7E9468',1,6,796500,0,0,796500,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 11:16:55','2026-04-22 11:26:21'),(551,'ORD202503180010DE0FE05',1,6,189000,0,0,189000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 11:28:48','2026-04-22 11:29:37'),(552,'ORD2025031800142339408',1,6,1533000,0,0,1533000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 12:45:13','2026-04-22 12:46:13'),(553,'ORD20250318001B8FB41BD',1,6,1533000,0,0,1533000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 12:47:23','2026-04-22 12:52:22'),(554,'ORD20250318001591470AA',1,6,378000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 13:26:39','2026-04-22 13:27:38'),(556,'ORD202503180012877445B',1,7,438000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 13:29:03','2026-04-22 13:29:22'),(557,'ORD202503180010034D465',1,6,189000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 13:45:00','2026-04-22 13:46:54'),(558,'ORD20250318001F2548BF1',1,7,438000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 13:48:06','2026-04-22 13:48:29'),(559,'ORD202503180019415DE85',1,7,16760000,0,0,16760000,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 13:49:04','2026-04-22 13:50:11'),(560,'ORD20250318001D7741228',1,7,1190,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-22 13:51:38','2026-04-22 13:51:56'),(561,'ORD2025031800149818BF6',1,15,12570000,0,0,12570000,'VNPAY','PAID','CONFIRMED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG95BC3BEC',NULL,NULL,NULL,'2026-04-22 14:49:35','2026-04-22 15:21:33'),(562,'ORD20250318001D959650C',1,15,12570000,0,0,12570000,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG96F4C55A',NULL,NULL,NULL,'2026-04-22 14:52:19','2026-04-22 15:22:26'),(563,'ORD202503180014593FF89',1,7,3039000,0,0,3039000,'VNPAY','PAID','CONFIRMED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGCA36F4B7',NULL,NULL,NULL,'2026-04-23 04:43:26','2026-04-23 10:59:23'),(564,'ORD20250318001E9988282',1,6,252500,0,0,252500,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGC4CC98A9',NULL,NULL,NULL,'2026-04-23 05:43:07','2026-04-23 07:04:29'),(565,'ORD202503180019354337D',1,14,584500,0,0,584500,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGC0978839',NULL,NULL,NULL,'2026-04-23 11:02:20','2026-04-23 11:08:12'),(566,'ORD202503180012D196D70',1,7,452000,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-23 13:31:39','2026-04-23 13:32:13'),(567,'ORD2025031800170FA7CFC',1,14,803500,0,0,803500,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGEF01680D',NULL,NULL,NULL,'2026-04-23 15:13:41','2026-04-23 15:22:02'),(568,'ORD2025031800143F37A6D',1,15,598500,0,0,598500,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG172EB613',NULL,NULL,NULL,'2026-04-23 15:25:03','2026-04-23 15:26:34'),(569,'ORD202503180011C5321D2',1,17,8190,0,0,0,'VNPAY','FAILED','CANCELED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-23 15:42:20','2026-04-23 15:42:59'),(570,'ORD2025031800103939ACC',1,17,45710,0,0,45710,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGC2DBFAC9',NULL,NULL,NULL,'2026-04-23 15:44:47','2026-04-24 12:53:05'),(571,'ORD20250318001C822D2DE',1,7,453190,0,0,453190,'VNPAY','PAID','COMPLETED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG915E4ADF',NULL,NULL,NULL,'2026-04-24 04:35:09','2026-04-24 05:45:39'),(573,'ORD202503180015B967836',1,15,20500,0,0,20500,'VNPAY','PAID','SHIPPED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOG7DF68E34',NULL,NULL,NULL,'2026-04-24 12:55:15','2026-04-24 12:58:39'),(584,'ORD202503180018B8D4322',1,14,254000,0,0,254000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 13:34:50','2026-04-24 13:34:50'),(585,'ORD20250318001A92EF621',1,14,224000,0,0,224000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 13:46:03','2026-04-24 13:46:03'),(586,'ORD20250318001D5F3A72C',1,7,5205190,0,0,5205190,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 13:48:57','2026-04-24 13:48:57'),(588,'ORD20250318001FF4CD7C4',1,7,3039000,0,0,3039000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 14:44:19','2026-04-24 14:44:19'),(589,'ORD20250318001E8C9D1FC',1,14,4196500,0,0,4196500,'VNPAY','PAID','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 15:03:36','2026-04-24 15:04:37'),(590,'ORD202503180015919723A',1,7,641000,0,0,641000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 15:08:01','2026-04-24 15:08:01'),(592,'ORD202503180017B1A2596',1,7,18570000,0,0,18570000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 15:23:28','2026-04-24 15:23:28'),(593,'ORD202503180018FB185CF',1,15,27388500,0,0,27388500,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 15:50:32','2026-04-24 15:50:32'),(594,'ORD202503180012E6DB262',1,15,27015500,0,0,27015500,'VNPAY','PAID','SHIPPED','FULL_RETURN_IN_PROGRESS',2,0.00,0.00,0.00,0.00,6,NULL,NULL,NULL,'LOG8A5A9147',NULL,NULL,NULL,'2026-04-26 01:00:10','2026-04-26 04:53:11'),(595,'ORD20250318001FA6A1B72',1,14,453710,0,0,453710,'VNPAY','PAID','COMPLETED','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,'LOGCEA394A0',NULL,NULL,NULL,'2026-04-26 01:16:57','2026-04-26 02:15:37'),(602,'ORD202503180010C4B19DA',1,18,597000,0,50000,547000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-26 10:19:22','2026-04-26 10:19:22'),(604,'ORD202503180019210315E',1,18,408000,0,50000,358000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-26 11:03:28','2026-04-26 11:03:28'),(605,'ORD20250318001673F611B',4,17,32980000,0,50000,32930000,'COD','PENDING','PENDING','NONE',0,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-26 11:15:26','2026-04-26 15:02:00');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_orders_before_insert_zero_final_amount` BEFORE INSERT ON `orders` FOR EACH ROW BEGIN
    IF UPPER(TRIM(IFNULL(NEW.`order_status`, ''))) IN ('FAILED', 'CANCELED') THEN
        SET NEW.`final_amount` = 0;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_orders_before_update_zero_final_amount` BEFORE UPDATE ON `orders` FOR EACH ROW BEGIN
    IF UPPER(TRIM(IFNULL(NEW.`order_status`, ''))) IN ('FAILED', 'CANCELED') THEN
        SET NEW.`final_amount` = 0;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `password_reset_token`
--

DROP TABLE IF EXISTS `password_reset_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(128) NOT NULL,
  `purpose` varchar(32) NOT NULL DEFAULT 'SET_PASSWORD',
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_token`
--

LOCK TABLES `password_reset_token` WRITE;
/*!40000 ALTER TABLE `password_reset_token` DISABLE KEYS */;
INSERT INTO `password_reset_token` VALUES (1,45,'aFbpjNrk7OkTwm6a0kYUVd-bSUgZ2emJG1-YZbScBEY','SET_PASSWORD','2026-04-21 13:23:26','2026-04-20 13:24:50','2026-04-20 13:23:26'),(2,4,'A5t-FHky6iSnmcwBGep4HQVLhW3IDTOZKx-J5kQ1amo','SET_PASSWORD','2026-04-22 22:55:22','2026-04-21 22:55:25','2026-04-21 22:55:22'),(3,4,'rEr6iPV1hGYmYApDtCdnxZYttqiqSRb-9i2VnNAxf7Y','SET_PASSWORD','2026-04-22 22:55:25',NULL,'2026-04-21 22:55:25'),(4,2,'N09uFN8-uyXTTxDzGjbUoT3TEjcyNK12L5AEhpvA9ME','SET_PASSWORD','2026-04-22 22:58:13',NULL,'2026-04-21 22:58:13');
/*!40000 ALTER TABLE `password_reset_token` ENABLE KEYS */;
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
  `brand_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `reject_reason` varchar(500) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `hidden_at` timestamp NULL DEFAULT NULL,
  `hidden_by` bigint DEFAULT NULL,
  `hidden_reason` varchar(500) DEFAULT NULL,
  `hidden_by_role` varchar(20) DEFAULT NULL,
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
INSERT INTO `product` VALUES (4,1,12,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','csfdxgc-gfjcrh','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',980000.00,0.00,2,0,0.00,0,700,2000,5000,2500,NULL,0,NULL,'ACTIVE','2026-03-10 12:55:58','2026-04-27 01:51:36','2026-04-27 08:51:36',1,'Test ?n','ADMIN'),(109,1,50,'Hosting chất lượng cao','hosting-chat-luong-cao','',999000.00,9.00,0,0,0.00,0,2000,2000,2000,2000,NULL,1,NULL,'PENDING','2026-03-10 13:11:56','2026-04-26 07:43:17',NULL,NULL,NULL,NULL),(110,1,50,'Ốp lưng MagSafe iPhone 15','op-lung-magsafe-iphone-15','',125000.00,12500.00,0,0,0.00,0,900,2000,1500,3000,NULL,1,NULL,'PENDING','2026-03-10 13:15:05','2026-04-26 07:43:17',NULL,NULL,NULL,NULL),(111,1,175,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','may-khoan-dong-luc-dung-pin-20v-dewalt-dcd1007n-b1','',4190000.00,0.00,0,0,0.00,0,800,500,1000,2000,NULL,3,'Hình ảnh không rõ','PENDING','2026-03-10 14:46:01','2026-04-26 07:52:18',NULL,NULL,NULL,NULL),(112,1,50,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','tai-nghe-bluetooth-55-pin-20h-b02-ket-noi-2-dien-thoai','',65000.00,6500.00,0,0,0.00,0,1000,1000,3000,3000,NULL,3,'Hình ảnh không rõ','PENDING','2026-03-10 15:04:36','2026-04-26 07:52:18',NULL,NULL,NULL,NULL),(113,1,50,'60W 5A 3-12V Nguồn Adapter điều chỉnh điện áp / tốc độ / nhiệt độ EU 100-240V chất lượng tốt','60w-5a-3-12v-nguon-adapter-dieu-chinh-dien-ap-toc-do-nhiet-do-eu-100-240v-chat-luong-tot','',118800.00,11880.00,0,0,0.00,0,5000,5000,5000,5000,NULL,0,NULL,'PENDING','2026-03-13 11:57:39','2026-04-26 02:51:14',NULL,NULL,NULL,NULL),(114,2,198,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','dau-chuyen-doi-may-siet-bulong-sang-khoan-13mm-chuyen-doi-tu-bulong-12-sang-khoan-hang-cao-capben-bi','',70000.00,7000.00,0,0,0.00,0,10000,2500,2500,3000,NULL,1,NULL,'PENDING','2026-03-22 13:36:32','2026-04-08 03:42:49',NULL,NULL,NULL,NULL),(115,2,204,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','sach-lap-trinh-huong-doi-tuong-java-core-danh-cho-nguoi-moi-bat-dau-hoc-lap-trinh','',289000.00,289000.00,0,0,0.00,0,8000,600,5000,5000,NULL,1,NULL,'PENDING','2026-03-22 14:30:10','2026-04-08 03:43:33',NULL,NULL,NULL,NULL),(116,1,183,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','google-tv-philips-43-inch-fullhd-led-43pft6509-hang-chinh-hang','',6190000.00,6809000.00,0,0,0.00,0,NULL,NULL,NULL,NULL,NULL,1,NULL,'PENDING','2026-04-09 12:36:51','2026-04-12 05:03:55',NULL,NULL,NULL,NULL),(117,1,183,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','tivi-philips-mediasuite-65hfl5214u-hang-chinh-hang','',26790000.00,29469000.00,0,0,0.00,0,NULL,NULL,NULL,NULL,NULL,1,NULL,'PENDING','2026-04-09 12:40:30','2026-04-12 05:03:00',NULL,NULL,NULL,NULL),(125,1,148,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','dien-thoai-samsung-galaxy-a26-5g-8128gb-mat-lung-kinh-ai-circle-to-search-camera-hdr-chup-dem-sang-ro-hang-chinh-hang','',5190000.00,519000.00,0,0,0.00,0,NULL,NULL,NULL,NULL,NULL,1,NULL,'PENDING','2026-04-12 12:21:06','2026-04-12 12:21:06',NULL,NULL,NULL,NULL),(126,1,148,'Điện Thoại Samsung Galaxy A16 5G (4GB/128GB) -  Đã Kích Hoạt Bảo Hành Điện Tử -  Hàng Chính Hãng','dien-thoai-samsung-galaxy-a16-5g-4gb128gb-da-kich-hoat-bao-hanh-dien-tu-hang-chinh-hang','',4990000.00,499000.00,0,0,0.00,0,800,12,9,10,NULL,1,NULL,'PENDING','2026-04-18 04:37:31','2026-04-18 04:37:31',NULL,NULL,NULL,NULL),(127,1,191,'Nồi Chiên Không Dầu Philips HD9280 /90 Essential size XL Digital Connected - Hàng Chính Hãng','noi-chien-khong-dau-philips-hd9280-90-essential-size-xl-digital-connected-hang-chinh-hang','',2475000.00,247500.00,15,0,0.00,0,7,30,30,50,NULL,1,NULL,'PENDING','2026-04-18 04:52:16','2026-04-18 04:52:16',NULL,NULL,NULL,NULL),(128,1,186,'Bình giữ nhiệt METRO CAFE TUMBLER LocknLock LHC4359 - Dung tích 650ml','binh-giu-nhiet-metro-cafe-tumbler-locknlock-lhc4359-dung-tich-650ml','',424000.00,42400.00,19,0,0.00,0,450,17,7,7,NULL,1,NULL,'PENDING','2026-04-18 05:00:09','2026-04-18 05:00:09',NULL,NULL,NULL,NULL),(129,1,180,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','mach-sac-pin-1s-37v-lithium-18650-usb-type-c-1a-tp4056-co-ic-bao-ve-dong-cao-cap-sac-xa-an-toan','',11900.00,1190.00,1000,0,0.00,0,20,5,5,5,NULL,1,NULL,'PENDING','2026-04-18 05:04:58','2026-04-26 08:38:10',NULL,NULL,NULL,NULL);
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
-- Table structure for table `product_status_history`
--

DROP TABLE IF EXISTS `product_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `from_status` varchar(20) NOT NULL,
  `to_status` varchar(20) NOT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `changed_by` bigint DEFAULT NULL,
  `changed_by_role` varchar(20) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`,`changed_at`),
  CONSTRAINT `product_status_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_status_history`
--

LOCK TABLES `product_status_history` WRITE;
/*!40000 ALTER TABLE `product_status_history` DISABLE KEYS */;
INSERT INTO `product_status_history` VALUES (1,4,'APPROVED','APPROVED',NULL,1,'ADMIN','2026-04-27 01:47:12'),(2,4,'APPROVED','APPROVED',NULL,1,'ADMIN','2026-04-27 01:50:56'),(3,4,'APPROVED','REJECTED','Test reject t? smoke main',1,'ADMIN','2026-04-27 01:50:56'),(4,4,'REJECTED','APPROVED',NULL,1,'ADMIN','2026-04-27 01:50:56'),(5,4,'APPROVED','HIDDEN','Test ?n',1,'ADMIN','2026-04-27 01:50:56'),(6,4,'HIDDEN','APPROVED',NULL,1,'ADMIN','2026-04-27 01:51:36'),(7,4,'APPROVED','REJECTED','Test reject t? smoke main',1,'ADMIN','2026-04-27 01:51:36'),(8,4,'REJECTED','APPROVED',NULL,1,'ADMIN','2026-04-27 01:51:36'),(9,4,'APPROVED','HIDDEN','Test ?n',1,'ADMIN','2026-04-27 01:51:36');
/*!40000 ALTER TABLE `product_status_history` ENABLE KEYS */;
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
INSERT INTO `product_variant` VALUES (1,4,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','dfkaww',219000.00,993,5,700,20,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',1,'2026-02-06 14:01:29','2026-04-26 11:03:31'),(2,4,'Động Cơ Motor Giảm Tốc 36GP - 555 BCD','sdxsd',189000.00,9994,5,700,20,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',1,'2026-02-07 13:48:39','2026-04-26 11:03:31'),(8,111,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','SKU-111',4190000.00,998,1000,800,2000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',1,'2026-03-10 14:46:01','2026-04-24 15:03:44'),(9,112,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','SKU-112',6500.00,9993,3000,1000,3000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',1,'2026-03-10 15:04:36','2026-04-26 01:00:19'),(10,113,'60W 5A 3-12V Nguồn Adapter điều chỉnh điện áp / tốc độ / nhiệt độ EU 100-240V chất lượng tốt','SKU-113',11880.00,9787,5000,5000,5000,'',1,'2026-03-13 11:57:39','2026-04-26 02:57:53'),(11,114,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','SKU-114',7000.00,89867,10000,10000,10000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',1,'2026-03-22 13:36:32','2026-04-26 02:57:53'),(12,115,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','SKU-115',289000.00,1957,5,500,20,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',1,'2026-03-22 14:30:10','2026-04-26 02:57:53'),(13,116,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','SKU-116',6190000.00,55,2000,9000,5000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738212/t4ipymdzkcgww67w0yqd.webp',1,'2026-04-09 12:36:51','2026-04-26 11:15:29'),(14,117,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng','SKU-117',26790000.00,463,20000,13000,12000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775738432/oolahnegrhrxzolekfnp.webp',1,'2026-04-09 12:40:30','2026-04-26 11:15:29'),(22,125,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng','SKU-125',5190000.00,9998,NULL,NULL,NULL,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1775996467/cskcgecuz5akc7bt8qhb.webp',1,'2026-04-12 12:21:06','2026-04-24 13:48:58'),(23,126,'Điện Thoại Samsung Galaxy A16 5G (4GB/128GB) -  Đã Kích Hoạt Bảo Hành Điện Tử -  Hàng Chính Hãng','SKU-126',499000.00,999,NULL,NULL,NULL,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776487052/kuepur2wblnr8fpvtwbg.webp',1,'2026-04-18 04:37:31','2026-04-23 13:30:39'),(24,127,'Nồi Chiên Không Dầu Philips HD9280 /90 Essential size XL Digital Connected - Hàng Chính Hãng','SKU-127',247500.00,353,NULL,NULL,NULL,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776487937/qjxvuhl8tnlatefelzhg.webp',1,'2026-04-18 04:52:16','2026-04-26 02:57:53'),(25,128,'Bình giữ nhiệt METRO CAFE TUMBLER LocknLock LHC4359 - Dung tích 650ml','SKU-128',42400.00,355,7,450,17,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488410/lehkxlojm9l8wjtkvaha.webp',1,'2026-04-18 05:00:09','2026-04-26 02:57:53'),(26,129,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn','SKU-129',1190.00,979,5,20,5,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1776488699/b7iytlsnlbcu9okqesys.webp',1,'2026-04-18 05:04:58','2026-04-26 01:16:59');
/*!40000 ALTER TABLE `product_variant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_inspection`
--

DROP TABLE IF EXISTS `return_inspection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_inspection` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_request_id` bigint NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','PASSED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `inspection_date` timestamp NULL DEFAULT NULL,
  `inspected_by` bigint DEFAULT NULL,
  `condition_assessment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `found_issues` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `passed_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `failed_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `photos` json DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_return_inspection` (`return_request_id`),
  KEY `inspected_by` (`inspected_by`),
  KEY `idx_status` (`status`),
  KEY `idx_return_request_id` (`return_request_id`),
  CONSTRAINT `return_inspection_ibfk_1` FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `return_inspection_ibfk_2` FOREIGN KEY (`inspected_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kiểm duyệt hàng trả nhập kho';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_inspection`
--

LOCK TABLES `return_inspection` WRITE;
/*!40000 ALTER TABLE `return_inspection` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_inspection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_policy`
--

DROP TABLE IF EXISTS `return_policy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_policy` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `shop_id` bigint NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `return_days` int NOT NULL DEFAULT '30',
  `is_free_return_shipping` tinyint(1) DEFAULT '1',
  `accepted_conditions` json DEFAULT NULL,
  `rejected_reasons` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_shop_category` (`shop_id`,`category_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `return_policy_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE,
  CONSTRAINT `return_policy_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý chính sách trả hàng của mỗi shop';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_policy`
--

LOCK TABLES `return_policy` WRITE;
/*!40000 ALTER TABLE `return_policy` DISABLE KEYS */;
INSERT INTO `return_policy` VALUES (1,1,NULL,30,1,'[\"no_use\", \"minor_defects\", \"unopened\"]','[\"major_damage\", \"used_intensively\", \"no_box\"]',1,'2026-04-24 02:51:23','2026-04-24 02:51:23'),(2,2,NULL,30,1,'[\"no_use\", \"minor_defects\", \"unopened\"]','[\"major_damage\", \"used_intensively\", \"no_box\"]',1,'2026-04-24 02:51:23','2026-04-24 02:51:23'),(3,4,NULL,30,1,'[\"no_use\", \"minor_defects\", \"unopened\"]','[\"major_damage\", \"used_intensively\", \"no_box\"]',1,'2026-04-24 02:51:23','2026-04-24 02:51:23'),(4,5,NULL,30,1,'[\"no_use\", \"minor_defects\", \"unopened\"]','[\"major_damage\", \"used_intensively\", \"no_box\"]',1,'2026-04-24 02:51:23','2026-04-24 02:51:23'),(5,6,NULL,30,1,'[\"no_use\", \"minor_defects\", \"unopened\"]','[\"major_damage\", \"used_intensively\", \"no_box\"]',1,'2026-04-24 02:51:23','2026-04-24 02:51:23'),(6,3,NULL,30,1,'[\"no_use\", \"minor_defects\", \"unopened\"]','[\"major_damage\", \"used_intensively\", \"no_box\"]',1,'2026-04-24 02:51:23','2026-04-24 02:51:23');
/*!40000 ALTER TABLE `return_policy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_request`
--

DROP TABLE IF EXISTS `return_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `order_shipment_id` bigint DEFAULT NULL COMMENT 'Package(shipment) being returned; one return request belongs to one shipment',
  `order_item_id` bigint DEFAULT NULL,
  `shop_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `status` enum('PENDING_APPROVAL','APPROVED','REJECTED','SHIPPING','RECEIVED','INSPECTION_PASSED','INSPECTION_FAILED','REFUNDED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING_APPROVAL',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '理由: product_defective, not_as_described, wrong_item, changed_mind',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `quantity` int NOT NULL,
  `requested_amount` decimal(15,2) DEFAULT NULL,
  `approved_amount` decimal(15,2) DEFAULT NULL,
  `refunded_amount` decimal(15,2) DEFAULT NULL,
  `is_auto_rejected` tinyint(1) DEFAULT '0',
  `rejection_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `return_shipment_id` bigint DEFAULT NULL,
  `inspection_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_shop_id` (`shop_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_order_item_id` (`order_item_id`),
  KEY `idx_return_shipment_id` (`return_shipment_id`),
  KEY `idx_status_created` (`status`,`created_at`),
  KEY `idx_return_request_order_shipment_id` (`order_shipment_id`),
  FULLTEXT KEY `ft_reason_description` (`reason`,`description`),
  CONSTRAINT `fk_return_request_order_shipment` FOREIGN KEY (`order_shipment_id`) REFERENCES `order_shipment` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `return_request_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `return_request_ibfk_2` FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `return_request_ibfk_3` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `return_request_ibfk_4` FOREIGN KEY (`customer_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `return_request_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Yêu cầu trả hàng từ khách hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_request`
--

LOCK TABLES `return_request` WRITE;
/*!40000 ALTER TABLE `return_request` DISABLE KEYS */;
INSERT INTO `return_request` VALUES (4,594,NULL,945,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 10:24:15','2026-04-26 10:24:15'),(6,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 11:53:12','2026-04-26 11:53:12'),(7,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:32:52','2026-04-26 13:32:52'),(8,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:48:23','2026-04-26 13:48:23'),(9,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:48:27','2026-04-26 13:48:27'),(10,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:48:29','2026-04-26 13:48:29'),(11,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:48:30','2026-04-26 13:48:30'),(12,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:48:31','2026-04-26 13:48:31'),(13,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:48:33','2026-04-26 13:48:33'),(14,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:50:48','2026-04-26 13:50:48'),(15,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 13:51:29','2026-04-26 13:51:29'),(16,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:23:50','2026-04-26 14:23:50'),(17,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:24:07','2026-04-26 14:24:07'),(18,594,NULL,946,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:24:41','2026-04-26 14:24:41'),(19,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:32:29','2026-04-26 14:32:29'),(20,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:32:58','2026-04-26 14:32:58'),(21,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:33:25','2026-04-26 14:33:25'),(22,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:34:09','2026-04-26 14:34:09'),(23,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:34:10','2026-04-26 14:34:10'),(24,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:34:30','2026-04-26 14:34:30'),(25,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:34:31','2026-04-26 14:34:31'),(26,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:34:32','2026-04-26 14:34:32'),(27,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:34:54','2026-04-26 14:34:54'),(28,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:36:36','2026-04-26 14:36:36'),(29,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:36:50','2026-04-26 14:36:50'),(30,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:38:00','2026-04-26 14:38:00'),(31,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:38:02','2026-04-26 14:38:02'),(32,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:38:04','2026-04-26 14:38:04'),(33,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:38:06','2026-04-26 14:38:06'),(34,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:38:32','2026-04-26 14:38:32'),(35,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:38:53','2026-04-26 14:38:53'),(36,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:39:02','2026-04-26 14:39:02'),(37,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:40:21','2026-04-26 14:40:21'),(38,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:40:58','2026-04-26 14:40:58'),(39,594,NULL,NULL,1,5,'PENDING_APPROVAL','Giao sai san pham',NULL,5,0.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 14:41:12','2026-04-26 14:41:12'),(40,595,NULL,NULL,1,8,'PENDING_APPROVAL','ghsrhg',NULL,9,10710.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 19:48:46','2026-04-26 19:48:46'),(41,595,NULL,NULL,1,8,'PENDING_APPROVAL','ghsrhg',NULL,9,10710.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 19:50:49','2026-04-26 19:50:49'),(42,595,NULL,NULL,1,8,'PENDING_APPROVAL','ghsrhg',NULL,9,10710.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 19:51:28','2026-04-26 19:51:28'),(43,595,NULL,NULL,1,8,'PENDING_APPROVAL','trhgfsf',NULL,9,10710.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 19:56:24','2026-04-26 19:56:24'),(44,595,NULL,NULL,1,8,'PENDING_APPROVAL','trhgfsf',NULL,9,10710.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-26 20:00:00','2026-04-26 20:00:00'),(45,595,NULL,NULL,2,8,'PENDING_APPROVAL','trong nay hang cu',NULL,5,35000.00,NULL,0.00,0,NULL,NULL,NULL,NULL,NULL,'2026-04-27 07:57:03','2026-04-27 07:57:03');
/*!40000 ALTER TABLE `return_request` ENABLE KEYS */;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_log_return_status_change` AFTER UPDATE ON `return_request` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `return_request_attachment`
--

DROP TABLE IF EXISTS `return_request_attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_request_attachment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_request_id` bigint NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_return_request_id` (`return_request_id`),
  CONSTRAINT `return_request_attachment_ibfk_1` FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ảnh/Tài liệu đính kèm yêu cầu trả hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_request_attachment`
--

LOCK TABLES `return_request_attachment` WRITE;
/*!40000 ALTER TABLE `return_request_attachment` DISABLE KEYS */;
INSERT INTO `return_request_attachment` VALUES (1,40,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1777207727/return-request-attachments/file_sxkhpf.webp','image/webp','Evidence for order item issue - afa9b3b474bf7ad70f10dd6443211d5f.png.webp','2026-04-26 19:48:49'),(2,41,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1777207849/return-request-attachments/file_ujcb4a.jpg','image/jpg','Evidence for order item issue - images.jpg','2026-04-26 19:50:50'),(3,42,'https://res.cloudinary.com/dizx3mbgw/video/upload/v1777207889/return-request-attachments/file_jd0q7d.mp4','video/mp4','Evidence for order item issue - 7728419678504.mp4','2026-04-26 19:51:31'),(4,43,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1777208185/return-request-attachments/file_oq4gky.webp','image/webp','Evidence for order item issue - afa9b3b474bf7ad70f10dd6443211d5f.png.webp','2026-04-26 19:56:29'),(5,43,'https://res.cloudinary.com/dizx3mbgw/video/upload/v1777208188/return-request-attachments/file_ktih0c.mp4','video/mp4','Evidence for order item issue - 7728419678504.mp4','2026-04-26 19:56:29'),(6,44,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1777208401/return-request-attachments/file_acfthn.webp','image/webp','Evidence for order item issue - afa9b3b474bf7ad70f10dd6443211d5f.png.webp','2026-04-26 20:00:04'),(7,44,'https://res.cloudinary.com/dizx3mbgw/video/upload/v1777208403/return-request-attachments/file_oqlifl.mp4','video/mp4','Evidence for order item issue - 7728419678504.mp4','2026-04-26 20:00:04'),(8,45,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1777251429/return-request-attachments/file_e3hhv4.webp','image/webp','Evidence for order item issue - afa9b3b474bf7ad70f10dd6443211d5f.png.webp','2026-04-27 07:57:17'),(9,45,'https://res.cloudinary.com/dizx3mbgw/video/upload/v1777251436/return-request-attachments/file_tty0qw.mp4','video/mp4','Evidence for order item issue - 7728419913752.mp4','2026-04-27 07:57:17');
/*!40000 ALTER TABLE `return_request_attachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_request_item`
--

DROP TABLE IF EXISTS `return_request_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_request_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_request_id` bigint NOT NULL,
  `order_item_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `requested_amount` decimal(18,2) DEFAULT NULL,
  `approved_amount` decimal(18,2) DEFAULT NULL,
  `refunded_amount` decimal(18,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_return_request_item` (`return_request_id`,`order_item_id`),
  KEY `idx_rri_order_item_id` (`order_item_id`),
  CONSTRAINT `fk_rri_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_item` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rri_return_request` FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rri_quantity_positive` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Item lines of a package-based return request';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_request_item`
--

LOCK TABLES `return_request_item` WRITE;
/*!40000 ALTER TABLE `return_request_item` DISABLE KEYS */;
INSERT INTO `return_request_item` VALUES (1,4,945,5,0.00,NULL,0.00,'2026-04-26 05:32:06','2026-04-26 05:32:06'),(2,6,946,5,0.00,NULL,0.00,'2026-04-26 05:32:06','2026-04-26 05:32:06'),(4,16,946,2,0.00,NULL,0.00,'2026-04-26 14:23:50',NULL),(6,17,946,2,0.00,NULL,0.00,'2026-04-26 14:24:07',NULL),(8,18,946,2,0.00,NULL,0.00,'2026-04-26 14:24:41',NULL),(10,38,998,2,0.00,NULL,0.00,'2026-04-26 14:40:58',NULL),(11,38,999,1,0.00,NULL,0.00,'2026-04-26 14:40:58',NULL),(12,39,998,2,0.00,NULL,0.00,'2026-04-26 14:41:12',NULL),(13,39,999,1,0.00,NULL,0.00,'2026-04-26 14:41:12',NULL),(14,40,1267,9,10710.00,NULL,0.00,'2026-04-26 19:48:46',NULL),(15,41,1267,9,10710.00,NULL,0.00,'2026-04-26 19:50:49',NULL),(16,42,1267,9,10710.00,NULL,0.00,'2026-04-26 19:51:28',NULL),(17,43,1267,9,10710.00,NULL,0.00,'2026-04-26 19:56:24',NULL),(18,44,1267,9,10710.00,NULL,0.00,'2026-04-26 20:00:00',NULL),(19,45,1266,5,35000.00,NULL,0.00,'2026-04-27 07:57:05',NULL);
/*!40000 ALTER TABLE `return_request_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_request_timeline`
--

DROP TABLE IF EXISTS `return_request_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_request_timeline` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_request_id` bigint NOT NULL,
  `event_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_details` json DEFAULT NULL,
  `actor_id` bigint DEFAULT NULL,
  `actor_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `actor_id` (`actor_id`),
  KEY `idx_return_request_id` (`return_request_id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_event_type` (`event_type`),
  CONSTRAINT `return_request_timeline_ibfk_1` FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `return_request_timeline_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Timeline các sự kiện của yêu cầu trả hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_request_timeline`
--

LOCK TABLES `return_request_timeline` WRITE;
/*!40000 ALTER TABLE `return_request_timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_request_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_shipment`
--

DROP TABLE IF EXISTS `return_shipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_shipment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_request_id` bigint NOT NULL,
  `tracking_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','PICKED_UP','SHIPPING','DELIVERED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `pickup_address_id` bigint DEFAULT NULL,
  `return_address_id` bigint DEFAULT NULL,
  `scheduled_pickup_date` date DEFAULT NULL,
  `actual_pickup_date` date DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `courier_id` bigint DEFAULT NULL,
  `courier_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logistics_webhook_count` int DEFAULT '0',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `failed_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `retry_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_code` (`tracking_code`),
  KEY `pickup_address_id` (`pickup_address_id`),
  KEY `return_address_id` (`return_address_id`),
  KEY `idx_tracking_code` (`tracking_code`),
  KEY `idx_status` (`status`),
  KEY `idx_return_request_id` (`return_request_id`),
  KEY `idx_status_updated` (`status`,`updated_at`),
  CONSTRAINT `return_shipment_ibfk_1` FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `return_shipment_ibfk_2` FOREIGN KEY (`pickup_address_id`) REFERENCES `address` (`id`) ON DELETE SET NULL,
  CONSTRAINT `return_shipment_ibfk_3` FOREIGN KEY (`return_address_id`) REFERENCES `address` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đơn vận chuyển trả hàng - tích hợp với logistics service';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_shipment`
--

LOCK TABLES `return_shipment` WRITE;
/*!40000 ALTER TABLE `return_shipment` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_shipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_shipment_history`
--

DROP TABLE IF EXISTS `return_shipment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_shipment_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_shipment_id` bigint NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_event_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_external_event` (`return_shipment_id`,`external_event_id`),
  KEY `idx_return_shipment_id` (`return_shipment_id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_status` (`status`),
  CONSTRAINT `return_shipment_history_ibfk_1` FOREIGN KEY (`return_shipment_id`) REFERENCES `return_shipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử cập nhật vận chuyển từ logistics service';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_shipment_history`
--

LOCK TABLES `return_shipment_history` WRITE;
/*!40000 ALTER TABLE `return_shipment_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_shipment_history` ENABLE KEYS */;
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
  `unit_price` double NOT NULL,
  `old_total` double NOT NULL,
  `new_total` double NOT NULL,
  `diff_total` double NOT NULL,
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
INSERT INTO `shipment_adjustment_item` VALUES (1,1,930,116,13,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ','Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ',3,2,6190000,18570000,12380000,6190000,NULL);
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
  `request_code` varchar(255) NOT NULL,
  `order_shipment_id` bigint NOT NULL COMMENT 'Kien hang bi thieu',
  `order_id` bigint NOT NULL COMMENT 'Order cha',
  `shop_id` bigint NOT NULL COMMENT 'Shop gui de xuat',
  `status` varchar(255) NOT NULL,
  `shop_reason` varchar(255) DEFAULT NULL,
  `buyer_note` varchar(255) DEFAULT NULL,
  `total_original_amount` double NOT NULL,
  `total_adjusted_amount` double NOT NULL,
  `total_diff_amount` double NOT NULL,
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
INSERT INTO `shipment_adjustment_request` VALUES (1,'ADJ-708A0A9C',412,453,1,'PENDING_BUYER','Hết 1 tivi',NULL,0,0,0,NULL,NULL,NULL,NULL);
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
  `block_reason` text,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop`
--

LOCK TABLES `shop` WRITE;
/*!40000 ALTER TABLE `shop` DISABLE KEYS */;
INSERT INTO `shop` VALUES (1,2,'FSAFAFc','cdfdsv','cvcs','vds','fsb','vcbsd',0.00,0,0,0.00,0,1,1,'2026-01-14 15:42:37','2026-04-27 08:51:37','ACTIVE',NULL,NULL,NULL,NULL,0),(2,4,'Điện tử 247','Chuyên đồ điện tử DIY','http://res.cloudinary.com/dizx3mbgw/raw/upload/v1774889994/sellers/logos/jsxotfhpn5uy6p42a3uq',NULL,NULL,'abc',0.00,0,0,0.00,0,0,0,'2026-02-01 10:38:52','2026-04-21 14:37:52','ACTIVE',NULL,NULL,NULL,NULL,0),(3,24,'Cua Hang Vu','Shop ban hang dien tu',NULL,NULL,NULL,'1234567890',0.00,0,0,0.00,0,0,1,'2026-03-30 22:58:36','2026-04-27 08:51:38','PENDING',NULL,NULL,NULL,NULL,1),(4,44,'zara internation','123 đường xyz','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776479533/djc38jib12ydwq22vkh9.png',NULL,'','',0.00,0,0,0.00,0,1,1,'2026-04-18 09:32:55','2026-04-21 23:42:09','ACTIVE',NULL,NULL,'General',NULL,0),(5,45,'Vu Test Shop','Ho Chi Minh','',NULL,'','',0.00,0,0,0.00,0,1,0,'2026-04-20 13:23:16','2026-04-21 23:36:38','BLOCKED',NULL,'Nhiều khiếu nại từ khách hàng chưa xử lý','General',NULL,0),(6,48,'May mặt Gia Huy',NULL,NULL,NULL,'','',0.00,0,0,0.00,0,1,0,'2026-04-22 01:10:50','2026-04-22 01:25:55','BLOCKED',NULL,'Không phản hồi hỗ trợ quá lâu','General',NULL,0);
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
-- Table structure for table `stock_adjustment_from_return`
--

DROP TABLE IF EXISTS `stock_adjustment_from_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_adjustment_from_return` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `return_request_id` bigint NOT NULL,
  `product_variant_id` bigint NOT NULL,
  `adjustment_type` enum('ADD','REMOVE','HOLD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ADD',
  `quantity` int NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `applied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_variant_id` (`product_variant_id`),
  KEY `idx_return_request_id` (`return_request_id`),
  KEY `idx_applied_at` (`applied_at`),
  CONSTRAINT `stock_adjustment_from_return_ibfk_1` FOREIGN KEY (`return_request_id`) REFERENCES `return_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_adjustment_from_return_ibfk_2` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ghi nhận điều chỉnh tồn kho từ quá trình trả hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_adjustment_from_return`
--

LOCK TABLES `stock_adjustment_from_return` WRITE;
/*!40000 ALTER TABLE `stock_adjustment_from_return` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_adjustment_from_return` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin@ecommerce.com','0900000001','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Admin System',NULL,'1995-01-01','male','both',1,1,'2025-12-29 11:54:43','2026-01-09 12:14:11','2025-12-29 11:54:43'),(2,'seller01@shop.com','0968443564','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Seller One',NULL,'1998-05-10','female','seller',1,1,'2025-12-29 11:54:43','2026-04-27 08:51:37',NULL),(3,'buyer01@gmail.com','0900000003','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Buyer One',NULL,NULL,'other','buyer',1,1,'2025-12-29 11:54:43','2026-01-14 11:43:50',NULL),(4,'buyer02@gmail.com','0932334354','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Buyer 2',NULL,NULL,'other','both',1,1,'2026-01-17 03:08:13','2026-04-23 15:11:59',NULL),(5,'dangvanthanhdiep2711@gmail.com',NULL,'$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Đặng Văn Thành Điệp','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776774676/jv21tyjyudpaoavvootu.png','2000-11-27','male','buyer',1,1,'2026-01-19 11:56:16','2026-04-26 10:36:05',NULL),(6,'dangvanthanhdiep2000@gmail.com',NULL,'$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Đặng Văn Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 13:00:26','2026-02-02 10:56:15',NULL),(7,'thanhtu@gmail.com','0966456888','$2a$10$CGmGsDedKT.fiirlU/erMuT85029EyCaa.2mQgtVCei5wBp7xrYaa','Thanh Tú',NULL,'1993-11-23','male','buyer',1,1,'2026-01-19 13:16:59','2026-01-26 18:23:27',NULL),(8,'thoai@gmail.com',NULL,'$2a$10$i0BAj217SjPgc/goKoH1Z.PBXjdXXCiCPUFP2GwsMyceREHB4st3O','Thoại',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 13:21:18','2026-01-19 13:21:18',NULL),(9,'dangvanthanhdiep1@gmail.com','0966273721','$2a$10$Bhth5//1NMPAfLdNKRGRjeBVYntjhlMUqLCo34cnIQhwb5bsdFESC','Thành Điệp',NULL,'2000-11-27','male','buyer',1,1,'2026-01-19 17:46:11','2026-01-23 18:27:14',NULL),(10,'dangvanthanhdiep2@gmail.com',NULL,'$2a$10$E3Zgv0BriHbmdCkkc8xmJOdi8resu6NoF9lMIZqt.Lp5Rqb.2NIBG','Đặng Văn Thành Điệp 2',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 17:49:33','2026-01-19 17:49:33',NULL),(11,'dangvanthanhdiep3@gmail.com',NULL,'$2a$10$25gG7KzR31UFmO6C5oLQcuXkItjfVDzhtpHsd0gL/XanVCARJ7OGG','Đặng Văn Thành Điệp 3',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 17:54:53','2026-01-19 17:54:53',NULL),(12,'diepdudon@gmail.com',NULL,'$2a$10$begOBcYg9IQ3QREmR9n85uWQCYNUg4OenEpU4WKk755ewgCkI2cMm','Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-21 18:17:28','2026-01-21 18:17:28',NULL),(13,'testuser@example.com',NULL,'$2a$10$AAH6PZqULTe5uLHIHUO6Sup5oXRX0L0Y.VRVSaXPnsjRGNGkCGHw.','Vu Nguyen',NULL,NULL,NULL,'buyer',1,1,'2026-02-13 16:48:52','2026-02-13 16:48:52',NULL),(14,'e2e_1774602773635@test.com','0909888999','$2a$10$FMDsHa8xkMSUOavUTfPNtuFD8B/CgRJjuquT0xGoyZh2oeK1etVy6','E2E Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:13:05','2026-03-27 16:13:05',NULL),(15,'demo_p0@test.com','0909888111','$2a$10$nGdepBsbN6XvGtSf1qyRRuX0kNtCi7ngUpXw50hrvHTg1p7Y4DABC','Nguyen Van Demo',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:33:33','2026-03-27 16:33:33',NULL),(17,'e2e_1774604073905@test.com','0904073905','$2a$10$YED.Mf790AVNxA9d1iPem.l.fpUR/g.s217O.vsLaecKYXcwR54pW','E2E Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:34:38','2026-03-27 16:34:38',NULL),(18,'final_test_${Date.now()}@test.com','09$(date +%s)','$2a$10$2fioMcit/0RzlkEm62ez7OQS1wKe9e1ewKeYkiuSeuxsvPm6tydBK','Final Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:35:01','2026-03-27 16:35:01',NULL),(19,'testseller123@example.com','0999999001','$2a$10$JRD9qgDUm.O9IdrLKus57.vObBdkUroth0AvZzJsSh.Y1kB55ZwlK','Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:22:01','2026-03-27 18:22:01',NULL),(20,'testseller456@example.com','0999999002','$2a$10$r8dZ72BAIXjaB9mduScTeeNx6Zj86ydNn5AlswpUrLUJGz2QCFv6W','Test Seller 2',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:31:32','2026-03-27 18:31:32',NULL),(21,'debugtest999@example.com','0999999999','$2a$10$UV3urwgMdK7KRYmE4jB.ou2mioVaEPgFgzqIDnQrO1q5s9gjenHlK','Debug Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:33:21','2026-03-27 18:33:21',NULL),(22,'recalc9999@example.com','0799999001','$2a$10$ST.YtGdIW1DNNXtIoalkNOPA69W5n3GcakYF6Ikv9tlEnPu9Mj0Gi','Recalc Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:49:30','2026-03-27 18:49:30',NULL),(23,'apitest9999@example.com','0699999001','$2a$10$SsoZmKBv3K4AfeLF5ENqSuk3th9NKFPCsCE8sKUORL5M5C9Bomj/i','API Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 19:08:42','2026-03-27 19:08:42',NULL),(24,'owner1@test.com',NULL,'$2a$10$MNMvFZvFi5I78R97bclQTOFsnechsafUq.nydTzli8JxXiw.PCMxm','Shop Owner One',NULL,NULL,NULL,'buyer',1,1,'2026-03-30 22:58:18','2026-04-27 08:51:38',NULL),(25,'vothoai1503@gmail.com',NULL,'$2a$10$yzDtsQCQ9P8Epmn55ut5aePhhx.ehHL9mx9cht9TgWIKV4uSkeSxC','Thoaij',NULL,NULL,NULL,'buyer',1,1,'2026-04-10 19:10:16','2026-04-10 19:10:16',NULL),(26,'user1@gmail.com',NULL,'$2a$10$rPoDpYBNcRds4b8gvMsiOOaNnxsgTmkJ5PhfjfKS77hStmkhjTyuW','User01',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 08:59:21','2026-04-11 08:59:21',NULL),(27,'user2@gmail.com',NULL,'$2a$10$wYR3QRyQmD1.I34b4O7.WOwjymNYZrlnm5OwEwnTDPlSe8SmyxJR6','user02',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:04:16','2026-04-11 09:04:16',NULL),(28,'user3@gmail.com',NULL,'$2a$10$X9SUpT7MURj9OT6pUegyOehe9Yb9nNMdDk8rsLSjE2oZTU6Ok1RW6','User 03',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:07:22','2026-04-11 09:07:22',NULL),(29,'user4@gmail.com',NULL,'$2a$10$8Vep4noe4lKG8PNBktOsYuBy4GZne.dd.iyMC68gP1ItGcGIg4wOW','User04',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:09:28','2026-04-11 09:09:28',NULL),(30,'user5@gmail.com',NULL,'$2a$10$qBw5a01V.S2PE1zV6Lup..VpqW6RY6Yg8lE1mS2efMUMeeyV7TaDK','User 05',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:54:39','2026-04-11 09:54:39',NULL),(31,'user6@gmail.com',NULL,'$2a$10$PbKiJes0QL1Kca1MVe9PWerw8OzCqwVfYxkZbPJQphkrs.peh5goe','User 06',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 09:56:23','2026-04-11 09:56:23',NULL),(32,'user7@gmail.com',NULL,'$2a$10$BP2XhlPfcYCiW4JPF3M5z.sgIakT5xdrUScfVPOT4ifPl./fDO5KG','User 07',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:00:02','2026-04-11 10:00:02',NULL),(33,'user8@gmail.com',NULL,'$2a$10$tPXw5ULUt1SmBsTQk9d5COJIX7dRGTtf8tR974F.HyQq3cSTTgpzG','User 08',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:03:57','2026-04-11 10:03:57',NULL),(34,'user9@gmail.com',NULL,'$2a$10$yRvsqt9ve3.NYqOULJq6muDldNxeo2udTTG58qZItHk1DbGea4.QO','User 9',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:30:39','2026-04-11 10:30:39',NULL),(35,'user10@gmail.com',NULL,'$2a$10$N5f/z9BFzaYz0.7SYnipQONfA0V/XYM7FO2bsIZATCBNq27fGHVzi','User 10',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:33:20','2026-04-11 10:33:20',NULL),(36,'user11@gmail.com',NULL,'$2a$10$e5dWYtJnUotQD4PROzg6z.pTeoUG3R/vZkQEi1UV3DzCy9mIpnniu','User 11',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:41:12','2026-04-11 10:41:12',NULL),(37,'user12@gmail.com',NULL,'$2a$10$FFJk9hCX9B4aoc.CAOVfKutEhL2WjfSEQcYWHoC6zH7I7qdtFWuwi','User 12',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 10:53:36','2026-04-11 10:53:36',NULL),(38,'user13@gmail.com',NULL,'$2a$10$miWgbcJRIkB51LhqhsgGjO8pfinZaXKq.eqOVKwwRfg8xTngUExoG','User 13',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 11:04:02','2026-04-11 11:04:02',NULL),(39,'user14@gmail.com',NULL,'$2a$10$KsCJ/IwYpjTwBW7/FzZ6kOEP8FoRBkBT0ZRswbAZhqzvcJ/9id.Uy','User 14',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 11:19:08','2026-04-11 11:19:08',NULL),(40,'user15@gmail.com',NULL,'$2a$10$JGrsY3FZOb5fBg9PAecKwuOy9RLhGpHibLkLFMlxpRcXKw3D5Pcpy','User 15',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 20:54:42','2026-04-11 20:54:42',NULL),(41,'brucelee@gmail.com',NULL,'$2a$10$KvCQA8K57eVnt41OeWg4eORRHtPW6NL3GGhf7glVFLlJ5e.IBwwbe','Lý Tiểu Long','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776526893/qpqsmeufybdhycjubvmq.jpg',NULL,NULL,'buyer',1,1,'2026-04-11 21:32:47','2026-04-18 22:41:34',NULL),(42,'lylienkiet@gmail.com',NULL,'$2a$10$jS0x2RGYX0QuGBO2JJQ01OvQ9H7dQGhbpciX3zmoYLSgK9JXrxaXS','Lý Liên Kiệt ',NULL,NULL,NULL,'buyer',1,1,'2026-04-11 22:18:43','2026-04-11 22:18:43',NULL),(43,'user16@gmail.com',NULL,'$2a$10$5LLC3jpptRKwMKAvKJlsPuPzDhhiD4MHC1tHrrvOepURtniO7Yf02','User 16',NULL,NULL,NULL,'buyer',1,1,'2026-04-12 22:13:03','2026-04-12 22:13:03',NULL),(44,'zara123@gmail.com','0938201914','$2a$10$eAeWhg/4j.vqZGeIuzC7N.DnK9avI7i4BglCi.gRYzzDdCOj9T9rO','Nguyễn Văn D','http://res.cloudinary.com/dizx3mbgw/image/upload/v1776479533/djc38jib12ydwq22vkh9.png',NULL,NULL,'seller',0,1,'2026-04-18 09:32:55','2026-04-21 23:42:09',NULL),(45,'hoangvu1805971@gmail.com','0901234567','$2a$10$dwh3wi5tBTRo3gIVvCa.I.PrlwoWUIewX6NGnNB9ck/OMD4.i.Zg.','Hoang Vu','',NULL,NULL,'seller',0,0,'2026-04-20 13:23:16','2026-04-21 23:36:38',NULL),(48,'vu.nph1255@aptechlearning.edu.vn','0767179211','$2a$10$DIpTjAoFMINbigFKvKT5Eef3mSn5EHUJEIOswm6HvvgY9lnomLkA.','Nguyễn Gia Huy',NULL,NULL,NULL,'seller',0,0,'2026-04-22 01:10:50','2026-04-22 01:25:55',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_voucher`
--

LOCK TABLES `user_voucher` WRITE;
/*!40000 ALTER TABLE `user_voucher` DISABLE KEYS */;
INSERT INTO `user_voucher` VALUES (1,7,1,'APP','2026-04-17 02:03:16','REDEEMED',NULL,NULL,NULL,'2026-04-18 22:03:16'),(2,41,2,'WEB','2026-04-18 02:03:16','CLAIMED',NULL,NULL,NULL,NULL),(3,1,3,'APP','2026-04-18 20:03:16','RESERVED',447,'2026-04-18 21:03:16',NULL,NULL),(8,9,2,'WEB','2026-04-26 08:49:24','CLAIMED',NULL,NULL,NULL,NULL),(9,2,2,'WEB','2026-04-26 09:38:44','CLAIMED',NULL,NULL,NULL,NULL),(10,5,2,'WEB','2026-04-26 11:14:37','CLAIMED',NULL,NULL,NULL,NULL),(11,4,2,'WEB','2026-04-26 14:55:08','CLAIMED',NULL,NULL,NULL,NULL),(12,42,2,'WEB','2026-04-27 01:16:00','CLAIMED',NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
INSERT INTO `voucher` VALUES (1,1,'PLAT_MID_20','Giam 20% toi da 120k','Voucher toan san cho dot giua nam','PLATFORM',NULL,'PERCENT',20.00,NULL,120000.00,300000.00,NULL,5000,1,1,1,0,'2026-06-01 00:00:00','2026-07-10 23:59:59','2026-06-01 00:00:00','2026-07-15 23:59:59','ACTIVE',10,1,'2026-04-19 02:03:16','2026-04-19 02:03:16'),(2,2,'NEWUSER_50K','Khach moi giam 50k','Chi ap dung cho user moi, don dau tien','PLATFORM',NULL,'FIXED',NULL,50000.00,NULL,299000.00,NULL,20000,6,0,1,0,'2026-04-01 00:00:00','2026-12-31 23:59:59','2026-04-01 00:00:00','2026-12-31 23:59:59','ACTIVE',20,1,'2026-04-19 02:03:16','2026-04-27 01:16:00'),(3,1,'SHOP2_80K','Shop Dien Tu 247 giam 80k','Voucher cua shop id=2','SHOP',2,'FIXED',NULL,80000.00,NULL,600000.00,NULL,1500,1,0,1,0,'2026-06-01 00:00:00','2026-08-31 23:59:00','2026-06-01 00:00:00','2026-08-31 23:59:00','ACTIVE',30,1,'2026-04-19 02:03:16','2026-04-23 10:38:09'),(4,1,'SONY_FREESHIP','Mien phi van chuyen Sony','Voucher brand Sony, mien phi ship','BRAND',7,'FREE_SHIPPING',NULL,NULL,NULL,0.00,NULL,2500,0,0,2,1,'2026-06-01 00:00:00','2026-09-30 23:59:59','2026-06-01 00:00:00','2026-09-30 23:59:59','ACTIVE',35,1,'2026-04-19 02:03:16','2026-04-19 02:03:16'),(5,1,'GIFT_TOOL_114','Tang san pham khi dat muc don','Voucher tang qua test nghiep vu GIFT_ITEM','PLATFORM',NULL,'GIFT_ITEM',NULL,NULL,NULL,800000.00,NULL,300,0,0,1,0,'2026-06-01 00:00:00','2026-08-15 23:59:59','2026-06-01 00:00:00','2026-08-15 23:59:59','ACTIVE',40,1,'2026-04-19 02:03:16','2026-04-19 02:03:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_audit_log`
--

LOCK TABLES `voucher_audit_log` WRITE;
/*!40000 ALTER TABLE `voucher_audit_log` DISABLE KEYS */;
INSERT INTO `voucher_audit_log` VALUES (1,1,'CREATED','ADMIN',1,'VOUCHER',1,NULL,'{\"code\": \"PLAT_MID_20\", \"status\": \"ACTIVE\"}','Seed: tao voucher toan san','2026-04-19 02:03:16'),(2,1,'RULE_UPDATED','ADMIN',1,'SCOPE_RULE',NULL,NULL,'{\"added_scope\": \"CATEGORY:183 INCLUDE\"}','Seed: them rule category','2026-04-19 02:03:17'),(3,1,'REDEEMED','USER',7,'REDEMPTION',1,NULL,'{\"status\": \"SUCCESS\", \"order_id\": 447}','Seed: redeem thanh cong order 447','2026-04-19 02:03:17');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_campaign`
--

LOCK TABLES `voucher_campaign` WRITE;
/*!40000 ALTER TABLE `voucher_campaign` DISABLE KEYS */;
INSERT INTO `voucher_campaign` VALUES (1,'CAMP_MIDYEAR_2026','Mid Year Campaign 2026','Chien dich giua nam cho voucher toan san va doi tac','2026-06-01 00:00:00','2026-07-15 23:59:59','ACTIVE',1,'2026-04-19 02:03:15','2026-04-19 02:03:15'),(2,'CAMP_NEWUSER_2026','New User Booster 2026','Chien dich thu hut user moi','2026-04-01 00:00:00','2026-12-31 23:59:59','ACTIVE',1,'2026-04-19 02:03:15','2026-04-19 02:03:15');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_gift_item`
--

LOCK TABLES `voucher_gift_item` WRITE;
/*!40000 ALTER TABLE `voucher_gift_item` DISABLE KEYS */;
INSERT INTO `voucher_gift_item` VALUES (1,5,114,11,1);
/*!40000 ALTER TABLE `voucher_gift_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_legacy`
--

DROP TABLE IF EXISTS `voucher_legacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_legacy` (
  `id` bigint NOT NULL,
  `shop_id` bigint DEFAULT NULL,
  `voucher_code` varchar(50) NOT NULL,
  `voucher_name` varchar(255) NOT NULL,
  `description` text,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(15,2) NOT NULL,
  `min_order_value` decimal(15,2) DEFAULT NULL,
  `max_discount` decimal(15,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_legacy_code` (`voucher_code`)
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_redemption`
--

LOCK TABLES `voucher_redemption` WRITE;
/*!40000 ALTER TABLE `voucher_redemption` DISABLE KEYS */;
INSERT INTO `voucher_redemption` VALUES (1,1,1,7,447,'ORD202503180011D05D3BE',75000.00,29405000.00,120000.00,29285000.00,'2026-04-18 22:03:16','SUCCESS',NULL),(2,1,1,7,448,'ORD20250318001FFE91440',75000.00,5203500.00,0.00,5278500.00,'2026-04-19 00:03:16','FAILED','Khong dat dieu kien min_order_value');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_scope_rule`
--

LOCK TABLES `voucher_scope_rule` WRITE;
/*!40000 ALTER TABLE `voucher_scope_rule` DISABLE KEYS */;
INSERT INTO `voucher_scope_rule` VALUES (1,4,'BRAND',7,'INCLUDE','2026-04-26 07:53:45'),(2,4,'SHIPPING_METHOD',1,'INCLUDE','2026-04-26 07:53:45');
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
  `order_shipment_id` bigint DEFAULT NULL,
  `discount_amount` decimal(15,2) NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_voucher_id` (`voucher_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_voucher_usage_order_shipment` (`order_shipment_id`),
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_user_segment_rule`
--

LOCK TABLES `voucher_user_segment_rule` WRITE;
/*!40000 ALTER TABLE `voucher_user_segment_rule` DISABLE KEYS */;
INSERT INTO `voucher_user_segment_rule` VALUES (4,1,'MEMBERSHIP_TIER','GOLD'),(2,2,'FIRST_ORDER',NULL),(1,2,'NEW_USER',NULL),(5,4,'APP_ONLY',NULL);
/*!40000 ALTER TABLE `voucher_user_segment_rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_pending_inspections`
--

DROP TABLE IF EXISTS `vw_pending_inspections`;
/*!50001 DROP VIEW IF EXISTS `vw_pending_inspections`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_pending_inspections` AS SELECT 
 1 AS `id`,
 1 AS `return_request_id`,
 1 AS `tracking_code`,
 1 AS `product_name`,
 1 AS `quantity`,
 1 AS `customer_name`,
 1 AS `delivery_date`,
 1 AS `days_in_warehouse`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_pending_return_approvals`
--

DROP TABLE IF EXISTS `vw_pending_return_approvals`;
/*!50001 DROP VIEW IF EXISTS `vw_pending_return_approvals`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_pending_return_approvals` AS SELECT 
 1 AS `id`,
 1 AS `order_id`,
 1 AS `reason`,
 1 AS `requested_amount`,
 1 AS `customer_name`,
 1 AS `customer_email`,
 1 AS `shop_name`,
 1 AS `product_name`,
 1 AS `days_left_to_approve`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_return_request_summary`
--

DROP TABLE IF EXISTS `vw_return_request_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_return_request_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_return_request_summary` AS SELECT 
 1 AS `id`,
 1 AS `order_id`,
 1 AS `status`,
 1 AS `reason`,
 1 AS `requested_amount`,
 1 AS `approved_amount`,
 1 AS `refunded_amount`,
 1 AS `customer_name`,
 1 AS `customer_email`,
 1 AS `shop_name`,
 1 AS `product_name`,
 1 AS `product_sku`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `days_pending`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_return_shipment_tracking`
--

DROP TABLE IF EXISTS `vw_return_shipment_tracking`;
/*!50001 DROP VIEW IF EXISTS `vw_return_shipment_tracking`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_return_shipment_tracking` AS SELECT 
 1 AS `id`,
 1 AS `return_request_id`,
 1 AS `tracking_code`,
 1 AS `status`,
 1 AS `customer_id`,
 1 AS `customer_name`,
 1 AS `customer_email`,
 1 AS `scheduled_pickup_date`,
 1 AS `actual_pickup_date`,
 1 AS `delivery_date`,
 1 AS `courier_name`,
 1 AS `created_at`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

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

--
-- Dumping events for database 'ecommerce'
--

--
-- Dumping routines for database 'ecommerce'
--

--
-- Final view structure for view `vw_pending_inspections`
--

/*!50001 DROP VIEW IF EXISTS `vw_pending_inspections`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_pending_inspections` AS select `ri`.`id` AS `id`,`ri`.`return_request_id` AS `return_request_id`,`rs`.`tracking_code` AS `tracking_code`,`p`.`product_name` AS `product_name`,`rr`.`quantity` AS `quantity`,`u`.`full_name` AS `customer_name`,`rs`.`delivery_date` AS `delivery_date`,(to_days(curdate()) - to_days(cast(`rs`.`delivery_date` as date))) AS `days_in_warehouse`,`rr`.`created_at` AS `created_at` from (((((`return_inspection` `ri` left join `return_request` `rr` on((`ri`.`return_request_id` = `rr`.`id`))) left join `return_shipment` `rs` on((`rr`.`return_shipment_id` = `rs`.`id`))) left join `order_item` `oi` on((`rr`.`order_item_id` = `oi`.`id`))) left join `product` `p` on((`oi`.`product_id` = `p`.`id`))) left join `user` `u` on((`rr`.`customer_id` = `u`.`id`))) where (`ri`.`status` in ('PENDING','IN_PROGRESS')) order by `rs`.`delivery_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_pending_return_approvals`
--

/*!50001 DROP VIEW IF EXISTS `vw_pending_return_approvals`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_pending_return_approvals` AS select `rr`.`id` AS `id`,`rr`.`order_id` AS `order_id`,`rr`.`reason` AS `reason`,`rr`.`requested_amount` AS `requested_amount`,`u`.`full_name` AS `customer_name`,`u`.`email` AS `customer_email`,`s`.`shop_name` AS `shop_name`,`p`.`product_name` AS `product_name`,(to_days((`rr`.`created_at` + interval 3 day)) - to_days(curdate())) AS `days_left_to_approve`,`rr`.`created_at` AS `created_at` from ((((`return_request` `rr` left join `user` `u` on((`rr`.`customer_id` = `u`.`id`))) left join `shop` `s` on((`rr`.`shop_id` = `s`.`id`))) left join `order_item` `oi` on((`rr`.`order_item_id` = `oi`.`id`))) left join `product` `p` on((`oi`.`product_id` = `p`.`id`))) where (`rr`.`status` = 'PENDING_APPROVAL') order by `rr`.`created_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_return_request_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_return_request_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_return_request_summary` AS select `rr`.`id` AS `id`,`rr`.`order_id` AS `order_id`,`rr`.`status` AS `status`,`rr`.`reason` AS `reason`,`rr`.`requested_amount` AS `requested_amount`,`rr`.`approved_amount` AS `approved_amount`,`rr`.`refunded_amount` AS `refunded_amount`,`u`.`full_name` AS `customer_name`,`u`.`email` AS `customer_email`,`s`.`shop_name` AS `shop_name`,`p`.`product_name` AS `product_name`,`pv`.`sku` AS `product_sku`,`rr`.`created_at` AS `created_at`,`rr`.`updated_at` AS `updated_at`,(to_days(now()) - to_days(`rr`.`created_at`)) AS `days_pending` from (((((`return_request` `rr` left join `user` `u` on((`rr`.`customer_id` = `u`.`id`))) left join `shop` `s` on((`rr`.`shop_id` = `s`.`id`))) left join `order_item` `oi` on((`rr`.`order_item_id` = `oi`.`id`))) left join `product` `p` on((`oi`.`product_id` = `p`.`id`))) left join `product_variant` `pv` on((`oi`.`variant_id` = `pv`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_return_shipment_tracking`
--

/*!50001 DROP VIEW IF EXISTS `vw_return_shipment_tracking`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_return_shipment_tracking` AS select `rs`.`id` AS `id`,`rs`.`return_request_id` AS `return_request_id`,`rs`.`tracking_code` AS `tracking_code`,`rs`.`status` AS `status`,`rr`.`customer_id` AS `customer_id`,`u`.`full_name` AS `customer_name`,`u`.`email` AS `customer_email`,`rs`.`scheduled_pickup_date` AS `scheduled_pickup_date`,`rs`.`actual_pickup_date` AS `actual_pickup_date`,`rs`.`delivery_date` AS `delivery_date`,`rs`.`courier_name` AS `courier_name`,`rs`.`created_at` AS `created_at`,`rs`.`updated_at` AS `updated_at` from ((`return_shipment` `rs` left join `return_request` `rr` on((`rs`.`return_request_id` = `rr`.`id`))) left join `user` `u` on((`rr`.`customer_id` = `u`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-27 10:09:01
