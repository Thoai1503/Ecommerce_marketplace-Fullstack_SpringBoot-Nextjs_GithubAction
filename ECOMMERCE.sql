-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 103.90.225.130    Database: ecommerce
-- ------------------------------------------------------
-- Server version	8.4.8

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (1,1,NULL,'test 1','0909000000','123 test','2','2','2','70000',0,'2026-03-06 12:17:53','2026-03-26 15:17:53'),(2,7,NULL,'thoai','0867677888','456 vnnvn','90768','3695','202','70000',1,'2026-03-20 14:09:02','2026-04-08 05:34:15'),(3,NULL,1,'','','564 3 tháng 2','13010','3440','201',NULL,1,'2026-04-08 06:10:22','2026-04-08 06:20:56'),(4,NULL,2,'','','Ap cai bang','55079','3317','220',NULL,0,'2026-04-08 06:20:56','2026-04-08 06:20:56'),(5,NULL,3,'','','Ap Tieu Ho','550809','1576','220',NULL,0,'2026-04-08 06:22:28','2026-04-08 06:22:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (2,1,4,1,2,'2026-02-22 21:07:26','2026-02-22 21:07:26'),(3,1,4,2,2,'2026-02-24 06:10:43','2026-02-24 06:10:43'),(30,7,4,2,20,'2026-03-08 17:47:24','2026-03-09 20:24:34'),(31,7,4,1,7,'2026-03-08 17:47:35','2026-03-20 18:28:02'),(32,2,4,2,13,'2026-03-10 20:15:22','2026-03-14 21:45:26'),(33,2,111,8,23,'2026-03-10 21:50:47','2026-03-17 18:24:48'),(34,2,112,9,2,'2026-03-10 22:09:04','2026-04-08 15:28:38'),(35,2,4,1,3,'2026-03-11 22:05:29','2026-03-14 22:32:54'),(36,2,113,10,1,'2026-03-13 19:18:28','2026-03-13 19:18:28'),(37,7,111,8,19,'2026-03-16 22:29:39','2026-04-08 14:30:22'),(38,7,112,9,1,'2026-03-22 20:10:47','2026-03-22 20:10:47'),(39,7,114,11,2,'2026-03-22 20:42:49','2026-03-22 21:40:44'),(40,7,115,12,3,'2026-03-22 21:39:53','2026-03-23 18:55:12'),(41,2,115,12,1,'2026-03-23 18:54:44','2026-03-23 18:54:44'),(42,7,113,10,1,'2026-04-08 14:30:40','2026-04-08 14:30:40');
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
) ENGINE=InnoDB AUTO_INCREMENT=214 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (101,0,'Men\'s Fashion','mens-fashion','/image/category/1773484013285-Thoitrangnam.png',0,1,'2026-03-14 10:26:42','2026-03-26 04:10:48'),(103,101,'Áo Khoác','ao-khoac','',1,1,'2026-03-14 10:28:11','2026-03-14 10:28:11'),(104,101,'Áo Vest và Blazer','ao-vest-va-blazer','',1,1,'2026-03-14 10:31:13','2026-03-14 10:31:13'),(105,101,'Áo Hoodie, Áo Len & Áo Nỉ','ao-hoodie-ao-len-ao-ni','',1,1,'2026-03-14 10:31:26','2026-03-14 10:31:26'),(106,101,'Quần Jeans','quan-jeans','',1,1,'2026-03-14 10:32:25','2026-03-14 10:32:25'),(107,101,'Quần Dài/Quần Âu','quan-daiquan-au','',1,1,'2026-03-14 10:32:38','2026-03-14 10:32:38'),(108,101,'Quần Short','quan-short','',1,1,'2026-03-14 10:33:17','2026-03-14 10:33:17'),(109,101,'Áo','ao','',1,1,'2026-03-14 10:33:26','2026-03-14 10:33:26'),(110,101,'Áo Ba Lỗ','ao-ba-lo','',1,1,'2026-03-14 10:38:16','2026-03-14 10:38:16'),(111,101,'Đồ Lót','do-lot','',1,1,'2026-03-14 10:38:36','2026-03-14 10:38:36'),(112,101,'Đồ Ngủ','do-ngu','',1,1,'2026-03-14 10:41:33','2026-03-14 10:41:33'),(113,101,'Đồ Bộ','do-bo','',1,1,'2026-03-14 10:41:44','2026-03-14 10:41:44'),(114,101,'Vớ/Tất','votat','',1,1,'2026-03-14 10:41:59','2026-03-14 10:41:59'),(115,101,'Trang Phục Truyền Thống','trang-phuc-truyen-thong','',1,1,'2026-03-14 10:42:11','2026-03-14 10:42:11'),(116,101,'Costumes','costumes','/image/no-image.png',1,1,'2026-03-14 10:42:25','2026-03-26 10:20:21'),(117,101,'Professional Clothing','professional-clothing','/image/no-image.png',1,1,'2026-03-14 10:42:40','2026-03-26 10:20:01'),(118,101,'Other','other','/image/no-image.png',1,1,'2026-03-14 10:42:49','2026-03-26 10:19:43'),(119,101,'Men\'s Jewelry','mens-jewelry','/image/no-image.png',1,1,'2026-03-14 10:43:02','2026-03-26 10:18:13'),(120,101,'Men\'s Eyeglasses','mens-eyeglasses','/image/no-image.png',1,1,'2026-03-14 10:43:12','2026-03-26 10:15:47'),(121,101,'Men\'s Belts','mens-belts','/image/no-image.png',1,1,'2026-03-14 10:43:24','2026-03-26 10:06:33'),(122,101,'Ties and bow ties','ties-and-bow-ties','/image/no-image.png',1,1,'2026-03-14 10:43:36','2026-03-26 10:00:56'),(124,101,'Men\'s Accessories','mens-accessories','/image/no-image.png',1,1,'2026-03-14 10:52:01','2026-03-26 09:59:31'),(125,0,'Women\'s Fashion','womens-fashion','/image/category/1773485985156-thoitrangnu.png',0,1,'2026-03-14 10:59:34','2026-03-26 04:10:34'),(126,125,'Quần','quan','',1,1,'2026-03-14 11:01:20','2026-03-14 11:01:20'),(127,125,'Quần đùi','quan-dui','',1,1,'2026-03-14 11:01:31','2026-03-14 11:01:31'),(128,125,'Chân váy','chan-vay','',1,1,'2026-03-14 11:02:17','2026-03-14 11:02:17'),(129,125,'Quần jeans','quan-jeans','',1,1,'2026-03-14 11:02:37','2026-03-14 11:02:37'),(130,125,'Đầm/Váy','damvay','',1,1,'2026-03-14 11:03:06','2026-03-14 11:03:06'),(131,125,'Váy cưới','vay-cuoi','',1,1,'2026-03-14 11:03:36','2026-03-14 11:03:36'),(132,125,'Đồ liền thân','do-lien-than','',1,1,'2026-03-14 11:03:49','2026-03-14 11:03:49'),(133,125,'Áo khoác, Áo choàng & Vest','ao-khoac-ao-choang-vest','',1,1,'2026-03-14 11:04:00','2026-03-14 11:04:00'),(134,125,'Áo len & Cardigan','ao-len-cardigan','',1,1,'2026-03-14 11:04:09','2026-03-14 11:04:09'),(135,125,'Hoodie và Áo nỉ','hoodie-va-ao-ni','',1,1,'2026-03-14 11:04:25','2026-03-14 11:04:25'),(136,125,'Bộ','bo','',1,1,'2026-03-14 11:04:39','2026-03-14 11:04:39'),(137,125,'Đồ lót','do-lot','',1,1,'2026-03-14 11:04:47','2026-03-14 11:04:47'),(138,125,'Đồ ngủ','do-ngu','',1,1,'2026-03-14 11:05:02','2026-03-14 11:05:02'),(139,125,'Áo','ao','',1,1,'2026-03-14 11:05:16','2026-03-14 11:05:16'),(140,125,'Đồ tập','do-tap','',1,1,'2026-03-14 11:05:32','2026-03-14 11:05:32'),(141,125,'Đồ Bầu','do-bau','',1,1,'2026-03-14 11:05:42','2026-03-14 11:05:42'),(142,125,'Đồ truyền thống','do-truyen-thong','',1,1,'2026-03-14 11:05:53','2026-03-14 11:05:53'),(143,125,'Đồ hóa trang','do-hoa-trang','',1,1,'2026-03-14 11:06:03','2026-03-14 11:06:03'),(144,125,'Vải','vai','',1,1,'2026-03-14 11:06:23','2026-03-14 11:06:23'),(145,125,'Vớ/ Tất','vo-tat','',1,1,'2026-03-14 11:06:35','2026-03-14 11:06:35'),(146,125,'Khác','khac','',1,1,'2026-03-14 11:06:45','2026-03-14 11:06:45'),(147,0,'Phones & Accessories','phones-accessories','/image/category/1773486491750-dienthoaivaphukien.png',0,1,'2026-03-14 11:08:03','2026-03-26 04:10:18'),(148,147,'Điện thoại','dien-thoai','',1,1,'2026-03-14 11:08:30','2026-03-14 11:08:30'),(149,147,'Máy tính bảng','may-tinh-bang','',1,1,'2026-03-14 11:08:41','2026-03-14 11:08:41'),(150,147,'Pin Dự Phòng','pin-du-phong','',1,1,'2026-03-14 11:08:53','2026-03-14 11:08:53'),(151,147,'Pin Gắn Trong, Cáp và Bộ Sạc','pin-gan-trong-cap-va-bo-sac','',1,1,'2026-03-14 11:09:07','2026-03-14 11:09:07'),(152,147,'Ốp lưng, bao da, Miếng dán điện thoại','op-lung-bao-da-mieng-dan-dien-thoai','',1,1,'2026-03-14 11:09:17','2026-03-14 11:09:17'),(153,147,'Bảo vệ màn hình','bao-ve-man-hinh','',1,1,'2026-03-14 11:09:33','2026-03-14 11:09:33'),(154,147,'Đế giữ điện thoại','de-giu-dien-thoai','',1,1,'2026-03-14 11:09:44','2026-03-14 11:09:44'),(155,147,'Thẻ nhớ','the-nho','',1,1,'2026-03-14 11:09:59','2026-03-14 11:09:59'),(156,147,'Sim','sim','',1,1,'2026-03-14 11:10:07','2026-03-14 11:10:07'),(157,147,'Phụ kiện khác','phu-kien-khac','',1,1,'2026-03-14 11:10:26','2026-03-14 11:10:26'),(158,147,'Thiết bị khác','thiet-bi-khac','',1,1,'2026-03-14 11:10:40','2026-03-14 11:10:40'),(159,0,'Mother & Baby','mother-baby','/image/category/1773486740125-MevaBe.png',0,1,'2026-03-14 11:12:09','2026-03-26 04:09:58'),(160,159,'Đồ dùng du lịch cho bé','do-dung-du-lich-cho-be','',1,1,'2026-03-14 11:12:45','2026-03-14 11:12:45'),(161,159,'Đồ dùng ăn dặm cho bé','do-dung-an-dam-cho-be','',1,1,'2026-03-14 11:12:54','2026-03-14 11:12:54'),(162,159,'Phụ kiện cho mẹ','phu-kien-cho-me','',1,1,'2026-03-14 11:13:08','2026-03-14 11:13:08'),(163,159,'Chăm sóc sức khỏe mẹ','cham-soc-suc-khoe-me','',1,1,'2026-03-14 11:13:17','2026-03-14 11:13:17'),(164,159,'Đồ dùng phòng tắm & Chăm sóc cơ thể bé','do-dung-phong-tam-cham-soc-co-the-be','',1,1,'2026-03-14 11:13:33','2026-03-14 11:13:33'),(165,159,'Đồ dùng phòng ngủ cho bé','do-dung-phong-ngu-cho-be','',1,1,'2026-03-14 11:13:52','2026-03-14 11:13:52'),(166,159,'An toàn cho bé','an-toan-cho-be','',1,1,'2026-03-14 11:14:04','2026-03-14 11:14:04'),(167,159,'Thực phẩm cho bé','thuc-pham-cho-be','',1,1,'2026-03-14 11:14:15','2026-03-14 11:14:15'),(168,159,'Chăm sóc sức khỏe bé','cham-soc-suc-khoe-be','',1,1,'2026-03-14 11:14:23','2026-03-14 11:14:23'),(169,159,'Tã & bô em bé','ta-bo-em-be','',1,1,'2026-03-14 11:14:39','2026-03-14 11:14:39'),(170,159,'Đồ chơi','do-choi','',1,1,'2026-03-14 11:14:47','2026-03-14 11:14:47'),(171,159,'Bộ & Gói quà tặng','bo-goi-qua-tang','',1,1,'2026-03-14 11:14:57','2026-03-14 11:14:57'),(172,159,'Khác','khac','',1,1,'2026-03-14 11:15:07','2026-03-14 11:15:07'),(173,159,'Sữa công thức trên 24 tháng','sua-cong-thuc-tren-24-thang','',1,1,'2026-03-14 11:15:15','2026-03-14 11:15:15'),(174,159,'Sữa công thức 0-24 tháng tuổi','sua-cong-thuc-0-24-thang-tuoi','',1,1,'2026-03-14 11:15:28','2026-03-14 11:15:28'),(175,0,'Electronic Devices','electronic-devices','/image/category/1773658851522-thietbidientu.png',0,1,'2026-03-16 11:00:40','2026-03-26 04:09:41'),(176,175,'TV accessories','tv-accessories','/image/no-image.png',1,1,'2026-03-16 11:01:28','2026-03-26 09:52:30'),(177,175,'Game Console','game-console','/image/no-image.png',1,1,'2026-03-16 11:01:40','2026-03-26 09:52:14'),(178,175,'Console Accessories','console-accessories','/image/no-image.png',1,1,'2026-03-16 11:01:53','2026-03-26 09:49:05'),(179,175,'Game disc','game-disc','/image/no-image.png',1,1,'2026-03-16 11:02:04','2026-03-26 09:48:45'),(180,175,'Accessories','accessories','/image/no-image.png',1,1,'2026-03-16 11:02:16','2026-03-26 09:48:24'),(181,175,'Earphones','earphones','/image/no-image.png',1,1,'2026-03-16 11:02:45','2026-03-26 09:46:37'),(182,175,'Loudspeaker','loudspeaker','/image/no-image.png',1,1,'2026-03-16 11:02:56','2026-03-26 09:46:09'),(183,175,'Tivi','tivi','/image/no-image.png',1,1,'2026-03-16 11:03:09','2026-04-03 09:45:39'),(184,175,'Tivi Box','tivi-box','',1,1,'2026-03-16 11:03:18','2026-03-16 11:03:18'),(185,175,'Headphones','headphones','',1,1,'2026-03-16 11:03:26','2026-03-16 11:03:26'),(186,0,'Home & Living','home-living','/image/category/1773659052669-NhaCuaVaDoiSong.png',0,1,'2026-03-16 11:04:01','2026-03-26 04:09:26'),(187,186,'Chăn, Ga, Gối & Nệm','chan-ga-goi-nem','',1,1,'2026-03-16 11:04:21','2026-03-16 11:04:21'),(188,186,'Đồ nội thất','do-noi-that','',1,1,'2026-03-16 11:04:30','2026-03-16 11:04:30'),(189,186,'Trang trí nhà cửa','trang-tri-nha-cua','',1,1,'2026-03-16 11:04:39','2026-03-16 11:04:39'),(190,186,'Dụng cụ & Thiết bị tiện ích','dung-cu-thiet-bi-tien-ich','',1,1,'2026-03-16 11:04:47','2026-03-16 11:04:47'),(191,186,'Đồ dùng nhà bếp và hộp đựng thực phẩm','do-dung-nha-bep-va-hop-dung-thuc-pham','',1,1,'2026-03-16 11:04:56','2026-03-16 11:04:56'),(192,186,'Đèn','den','',1,1,'2026-03-16 11:05:11','2026-03-16 11:05:11'),(193,186,'Ngoài trời & Sân vườn','ngoai-troi-san-vuon','',1,1,'2026-03-16 11:05:19','2026-03-16 11:05:19'),(194,186,'Đồ dùng phòng tắm','do-dung-phong-tam','',1,1,'2026-03-16 11:05:28','2026-03-16 11:05:28'),(195,186,'Vật phẩm thờ cúng','vat-pham-tho-cung','',1,1,'2026-03-16 11:05:37','2026-03-16 11:05:37'),(196,186,'Đồ trang trí tiệc','do-trang-tri-tiec','',1,1,'2026-03-16 11:05:48','2026-03-16 11:05:48'),(197,186,'Chăm sóc nhà cửa và giặt ủi','cham-soc-nha-cua-va-giat-ui','',1,1,'2026-03-16 11:05:59','2026-03-16 11:05:59'),(198,186,'Sắp xếp nhà cửa','sap-xep-nha-cua','',1,1,'2026-03-16 11:06:08','2026-03-16 11:06:08'),(199,186,'Dụng cụ pha chế','dung-cu-pha-che','',1,1,'2026-03-16 11:06:18','2026-03-16 11:06:18'),(200,186,'Tinh dầu thơm phòng','tinh-dau-thom-phong','',1,1,'2026-03-16 11:06:26','2026-03-16 11:06:26'),(202,0,'Computers & Laptops','computers-laptops','/image/category/1773659281290-maytinhvalaptop.png',0,1,'2026-03-16 11:07:49','2026-04-04 12:55:01'),(204,203,'Sách tiếng Việt','sach-tieng-viet',NULL,1,1,'2026-03-22 14:27:20','2026-03-22 14:27:20'),(205,186,'Đồ dùng phòng ăn','do-dung-phong-an','/image/no-image.png',1,1,'2026-03-25 12:03:15','2026-03-25 12:18:17'),(206,202,'Máy Tính Bàn','may-tinh-ban','',1,1,'2026-03-25 12:19:14','2026-03-25 12:19:14'),(207,202,'Màn Hình','man-hinh','',1,1,'2026-03-25 12:19:55','2026-03-25 12:19:55'),(208,202,'Linh Kiện Máy Tính','linh-kien-may-tinh','',1,1,'2026-03-25 12:20:07','2026-03-25 12:20:07'),(209,202,'Thiết Bị Lưu Trữ','thiet-bi-luu-tru','',1,1,'2026-03-25 12:20:18','2026-03-25 12:20:18'),(210,202,'Thiết Bị Mạng','thiet-bi-mang','',1,1,'2026-03-25 12:20:27','2026-03-25 12:20:27'),(211,202,'Máy In, Máy Scan & Máy Chiếu','may-in-may-scan-may-chieu','',1,1,'2026-03-25 12:24:05','2026-03-25 12:24:05'),(212,202,'Phụ Kiện Máy Tính','phu-kien-may-tinh','',1,1,'2026-03-25 12:24:16','2026-03-25 12:24:16'),(213,0,' Beauty','beauty','/image/category/1774926816954-SacDep.png',0,1,'2026-03-31 02:55:25','2026-03-31 03:13:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_brand`
--

LOCK TABLES `category_brand` WRITE;
/*!40000 ALTER TABLE `category_brand` DISABLE KEYS */;
INSERT INTO `category_brand` VALUES (3,183,5,1),(4,183,7,1),(5,183,6,1),(6,183,11,1),(7,183,9,1),(9,183,10,1),(10,183,8,1);
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
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `total_price` double NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shop_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `fk_item_shipment` (`shipment_id`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `order_item_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=828 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (689,315,242,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-03-30 00:19:32',1),(690,315,243,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-03-30 00:19:32',2),(691,315,243,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-03-30 00:19:32',2),(692,316,244,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-03-30 00:22:51',1),(693,316,245,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-03-30 00:22:51',2),(694,316,245,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-03-30 00:22:51',2),(695,317,246,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-03-30 00:23:16',1),(696,317,247,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-03-30 00:23:17',2),(697,317,247,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-03-30 00:23:17',2),(698,318,248,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-01 12:03:59',1),(699,318,248,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-01 12:04:00',1),(700,319,249,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-01 12:05:52',1),(701,319,249,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-01 12:05:52',1),(702,320,250,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-01 12:13:00',1),(703,320,250,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-01 12:13:00',1),(704,321,251,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-01 12:14:20',1),(705,321,251,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-01 12:14:20',1),(706,322,252,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-01 12:15:00',1),(707,322,252,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-01 12:15:01',1),(708,323,253,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-01 15:42:26',1),(709,323,254,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',7000,2,14000,'2026-04-01 15:42:26',2),(710,323,254,115,12,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',289000,3,867000,'2026-04-01 15:42:26',2),(711,324,255,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-02 15:28:00',1),(712,324,256,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-02 15:28:00',2),(713,324,256,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-02 15:28:00',2),(714,325,257,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-03 11:52:45',1),(715,325,258,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-03 11:52:45',2),(716,325,258,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-03 11:52:45',2),(717,326,259,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-03 11:53:23',1),(718,326,260,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-03 11:53:23',2),(719,326,260,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-03 11:53:23',2),(720,327,261,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-03 11:56:50',1),(721,327,262,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-03 11:56:50',2),(722,327,262,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-03 11:56:50',2),(723,328,263,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 08:58:00',1),(724,328,264,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 08:58:00',2),(725,328,264,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 08:58:00',2),(726,329,265,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:10:59',1),(727,329,266,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:10:59',2),(728,329,266,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:10:59',2),(729,330,267,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:12:16',1),(730,330,268,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:12:16',2),(731,330,268,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:12:16',2),(732,331,269,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:12:54',1),(733,331,270,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:12:54',2),(734,331,270,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:12:54',2),(735,332,271,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:14:12',1),(736,332,272,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:14:12',2),(737,332,272,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:14:12',2),(738,333,273,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:15:05',1),(739,333,274,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:15:05',2),(740,333,274,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:15:05',2),(741,334,275,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:26:43',1),(742,334,276,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:26:43',2),(743,334,276,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:26:43',2),(744,335,277,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:46:37',1),(745,335,278,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:46:37',2),(746,335,278,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:46:37',2),(747,336,279,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:46:53',1),(748,336,280,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:46:53',2),(749,336,280,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:46:53',2),(750,337,281,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:55:15',1),(751,337,282,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:55:15',2),(752,337,282,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:55:15',2),(753,338,283,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:58:08',1),(754,338,284,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:58:08',2),(755,338,284,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:58:08',2),(756,339,285,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 09:59:08',1),(757,339,286,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 09:59:08',2),(758,339,286,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 09:59:08',2),(759,340,287,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:03:53',1),(760,340,288,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:03:53',2),(761,340,288,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:03:53',2),(762,341,289,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:04:00',1),(763,341,290,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:04:00',2),(764,341,290,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:04:00',2),(765,342,291,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:04:32',1),(766,342,292,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:04:32',2),(767,342,292,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:04:32',2),(768,343,293,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:06:32',1),(769,343,294,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:06:32',2),(770,343,294,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:06:32',2),(771,344,295,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:06:35',1),(772,344,296,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:06:35',2),(773,344,296,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:06:35',2),(774,345,297,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:06:38',1),(775,345,298,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:06:38',2),(776,345,298,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:06:38',2),(777,346,299,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:07:51',1),(778,346,300,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:07:51',2),(779,346,300,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:07:51',2),(780,347,301,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:08:00',1),(781,347,302,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:08:00',2),(782,347,302,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:08:00',2),(783,348,303,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:08:24',1),(784,348,304,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:08:24',2),(785,348,304,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:08:24',2),(786,349,305,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:09:03',1),(787,349,306,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:09:03',2),(788,349,306,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:09:03',2),(789,350,307,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:13:42',1),(790,350,308,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:13:42',2),(791,350,308,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:13:42',2),(792,351,309,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:39:48',1),(793,351,310,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:39:48',2),(794,351,310,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:39:48',2),(795,352,311,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 10:41:56',1),(796,352,312,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 10:41:56',2),(797,352,312,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 10:41:56',2),(798,353,313,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 11:04:11',1),(799,353,314,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 11:04:11',2),(800,353,314,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 11:04:11',2),(801,354,315,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 11:25:25',1),(802,354,316,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 11:25:25',2),(803,354,316,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 11:25:25',2),(804,355,317,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 11:34:52',1),(805,355,318,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 11:34:52',2),(806,355,318,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 11:34:52',2),(807,356,319,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 15:57:10',1),(808,356,320,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 15:57:10',2),(809,356,320,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 15:57:10',2),(810,357,321,109,9,'Động cơ 555 Kieu 2','Khoan Total 20V',1999000,6,11994000,'2026-04-05 15:57:24',1),(811,357,322,4,2,'Động cơ 775','Khoan DCD985 SupaPro',10000000,2,20000000,'2026-04-05 15:57:24',2),(812,357,322,4,2,'Động cơ 775','Khoan DCD985999999999999999',90000,13,1170000,'2026-04-05 15:57:24',2),(813,358,323,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-08 03:45:05',1),(814,358,323,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-08 03:45:05',1),(815,358,324,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',7000,2,14000,'2026-04-08 03:45:05',2),(816,359,325,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-08 04:06:08',1),(817,359,325,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-08 04:06:08',1),(818,359,326,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',7000,2,14000,'2026-04-08 04:06:08',2),(819,360,327,4,1,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',219000,7,1533000,'2026-04-08 04:07:22',1),(820,360,327,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-08 04:07:22',1),(821,360,328,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',7000,2,14000,'2026-04-08 04:07:22',2),(822,361,329,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-08 09:15:04',1),(823,361,329,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',4190000,21,87990000,'2026-04-08 09:15:04',1),(824,361,330,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',7000,2,14000,'2026-04-08 09:15:04',2),(825,362,331,4,2,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','Động Cơ Motor Giảm Tốc 36GP - 555 BCD',189000,20,3780000,'2026-04-08 09:15:23',1),(826,362,331,111,8,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',4190000,21,87990000,'2026-04-08 09:15:23',1),(827,362,332,114,11,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',7000,2,14000,'2026-04-08 09:15:23',2);
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
  `shipping_status` varchar(255) NOT NULL,
  `estimated_delivery_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tracking_number` (`tracking_number`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_shipment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=333 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_shipment`
--

LOCK TABLES `order_shipment` WRITE;
/*!40000 ALTER TABLE `order_shipment` DISABLE KEYS */;
INSERT INTO `order_shipment` VALUES (242,315,1,'LOG',0,NULL,'PENDING',NULL,'2026-03-30 00:19:31','2026-03-30 00:19:31'),(243,315,2,'LOG',0,NULL,'PENDING',NULL,'2026-03-30 00:19:32','2026-03-30 00:19:32'),(244,316,1,'LOG',0,NULL,'PENDING',NULL,'2026-03-30 00:22:51','2026-03-30 00:22:51'),(245,316,2,'LOG',0,NULL,'PENDING',NULL,'2026-03-30 00:22:51','2026-03-30 00:22:51'),(246,317,1,'LOG',0,NULL,'PENDING',NULL,'2026-03-30 00:23:16','2026-03-30 00:23:16'),(247,317,2,'LOG',0,NULL,'PENDING',NULL,'2026-03-30 00:23:17','2026-03-30 00:23:17'),(248,318,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-01 12:03:59','2026-04-01 12:03:59'),(249,319,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-01 12:05:52','2026-04-01 12:05:52'),(250,320,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-01 12:13:00','2026-04-01 12:13:00'),(251,321,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-01 12:14:20','2026-04-01 12:14:20'),(252,322,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-01 12:15:00','2026-04-01 12:15:00'),(253,323,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-01 15:42:26','2026-04-01 15:42:26'),(254,323,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-01 15:42:26','2026-04-01 15:42:26'),(255,324,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-02 15:28:00','2026-04-02 15:28:00'),(256,324,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-02 15:28:00','2026-04-02 15:28:00'),(257,325,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-03 11:52:45','2026-04-03 11:52:45'),(258,325,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-03 11:52:45','2026-04-03 11:52:45'),(259,326,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-03 11:53:23','2026-04-03 11:53:23'),(260,326,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-03 11:53:23','2026-04-03 11:53:23'),(261,327,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-03 11:56:50','2026-04-03 11:56:50'),(262,327,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-03 11:56:50','2026-04-03 11:56:50'),(263,328,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 08:58:00','2026-04-05 08:58:00'),(264,328,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 08:58:00','2026-04-05 08:58:00'),(265,329,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:10:59','2026-04-05 09:10:59'),(266,329,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:10:59','2026-04-05 09:10:59'),(267,330,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:12:16','2026-04-05 09:12:16'),(268,330,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:12:16','2026-04-05 09:12:16'),(269,331,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:12:54','2026-04-05 09:12:54'),(270,331,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:12:54','2026-04-05 09:12:54'),(271,332,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:14:12','2026-04-05 09:14:12'),(272,332,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:14:12','2026-04-05 09:14:12'),(273,333,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:15:05','2026-04-05 09:15:05'),(274,333,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:15:05','2026-04-05 09:15:05'),(275,334,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:26:43','2026-04-05 09:26:43'),(276,334,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:26:43','2026-04-05 09:26:43'),(277,335,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:46:37','2026-04-05 09:46:37'),(278,335,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:46:37','2026-04-05 09:46:37'),(279,336,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:46:53','2026-04-05 09:46:53'),(280,336,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:46:53','2026-04-05 09:46:53'),(281,337,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:55:15','2026-04-05 09:55:15'),(282,337,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:55:15','2026-04-05 09:55:15'),(283,338,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:58:08','2026-04-05 09:58:08'),(284,338,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:58:08','2026-04-05 09:58:08'),(285,339,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:59:08','2026-04-05 09:59:08'),(286,339,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 09:59:08','2026-04-05 09:59:08'),(287,340,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:03:53','2026-04-05 10:03:53'),(288,340,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:03:53','2026-04-05 10:03:53'),(289,341,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:04:00','2026-04-05 10:04:00'),(290,341,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:04:00','2026-04-05 10:04:00'),(291,342,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:04:32','2026-04-05 10:04:32'),(292,342,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:04:32','2026-04-05 10:04:32'),(293,343,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:06:32','2026-04-05 10:06:32'),(294,343,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:06:32','2026-04-05 10:06:32'),(295,344,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:06:35','2026-04-05 10:06:35'),(296,344,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:06:35','2026-04-05 10:06:35'),(297,345,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:06:38','2026-04-05 10:06:38'),(298,345,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:06:38','2026-04-05 10:06:38'),(299,346,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:07:51','2026-04-05 10:07:51'),(300,346,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:07:51','2026-04-05 10:07:51'),(301,347,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:08:00','2026-04-05 10:08:00'),(302,347,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:08:00','2026-04-05 10:08:00'),(303,348,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:08:24','2026-04-05 10:08:24'),(304,348,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:08:24','2026-04-05 10:08:24'),(305,349,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:09:03','2026-04-05 10:09:03'),(306,349,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:09:03','2026-04-05 10:09:03'),(307,350,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:13:42','2026-04-05 10:13:42'),(308,350,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:13:42','2026-04-05 10:13:42'),(309,351,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:39:48','2026-04-05 10:39:48'),(310,351,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:39:48','2026-04-05 10:39:48'),(311,352,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:41:56','2026-04-05 10:41:56'),(312,352,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 10:41:56','2026-04-05 10:41:56'),(313,353,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 11:04:11','2026-04-05 11:04:11'),(314,353,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 11:04:11','2026-04-05 11:04:11'),(315,354,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 11:25:25','2026-04-05 11:25:25'),(316,354,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 11:25:25','2026-04-05 11:25:25'),(317,355,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 11:34:52','2026-04-05 11:34:52'),(318,355,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 11:34:52','2026-04-05 11:34:52'),(319,356,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 15:57:10','2026-04-05 15:57:10'),(320,356,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 15:57:10','2026-04-05 15:57:10'),(321,357,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 15:57:24','2026-04-05 15:57:24'),(322,357,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-05 15:57:24','2026-04-05 15:57:24'),(323,358,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 03:45:05','2026-04-08 03:45:05'),(324,358,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 03:45:05','2026-04-08 03:45:05'),(325,359,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 04:06:08','2026-04-08 04:06:08'),(326,359,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 04:06:08','2026-04-08 04:06:08'),(327,360,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 04:07:22','2026-04-08 04:07:22'),(328,360,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 04:07:22','2026-04-08 04:07:22'),(329,361,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 09:15:04','2026-04-08 09:15:04'),(330,361,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 09:15:04','2026-04-08 09:15:04'),(331,362,1,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 09:15:23','2026-04-08 09:15:23'),(332,362,2,'LOG',0,NULL,'PENDING',NULL,'2026-04-08 09:15:23','2026-04-08 09:15:23');
/*!40000 ALTER TABLE `order_shipment` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=363 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (315,'ORDB4927654',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-30 00:19:31','2026-03-30 00:19:31'),(316,'ORDD3EF5C0D',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-30 00:22:51','2026-03-30 00:22:51'),(317,'ORD0558B1CA',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-30 00:23:16','2026-03-30 00:23:16'),(318,'ORD2025031800184120B22',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:03:59','2026-04-01 12:03:59'),(319,'ORD20250318001B20E5DFA',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:05:52','2026-04-01 12:05:52'),(320,'ORD20250318001F46BCD5B',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:13:00','2026-04-01 12:13:00'),(321,'ORD202503180011551ACAB',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:14:20','2026-04-01 12:14:20'),(322,'ORD202503180015E91E542',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-01 12:15:00','2026-04-01 12:15:00'),(323,'ORD20250318001754F8328',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-01 15:42:26','2026-04-01 15:42:26'),(324,'ORD22FE1C94',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-02 15:28:00','2026-04-02 15:28:00'),(325,'ORD6854EDC8',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-03 11:52:45','2026-04-03 11:52:45'),(326,'ORD774BD31A',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-03 11:53:23','2026-04-03 11:53:23'),(327,'ORDF8FC6FE6',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-03 11:56:50','2026-04-03 11:56:50'),(328,'ORDD7845AA1',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 08:58:00','2026-04-05 08:58:00'),(329,'ORD6A4D9626',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:10:59','2026-04-05 09:10:59'),(330,'ORDFEB7822D',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:12:16','2026-04-05 09:12:16'),(331,'ORD83F3F28E',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:12:54','2026-04-05 09:12:54'),(332,'ORD18CB5660',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:14:12','2026-04-05 09:14:12'),(333,'ORD013CCA5E',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:15:05','2026-04-05 09:15:05'),(334,'ORD6E874570',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:26:43','2026-04-05 09:26:43'),(335,'ORD77EC7D61',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:46:37','2026-04-05 09:46:37'),(336,'ORD81F79BF8',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:46:53','2026-04-05 09:46:53'),(337,'ORDEA99FED8',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:55:15','2026-04-05 09:55:15'),(338,'ORDD8F6D87D',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:58:07','2026-04-05 09:58:07'),(339,'ORD1C277197',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 09:59:08','2026-04-05 09:59:08'),(340,'ORD09C24E63',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:03:53','2026-04-05 10:03:53'),(341,'ORDDD49A025',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:04:00','2026-04-05 10:04:00'),(342,'ORD53E76E56',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:04:32','2026-04-05 10:04:32'),(343,'ORDE2ECB36E',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:06:32','2026-04-05 10:06:32'),(344,'ORD84B15855',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:06:35','2026-04-05 10:06:35'),(345,'ORD7DBEEEF2',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:06:38','2026-04-05 10:06:38'),(346,'ORDBCEAB1AE',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:07:51','2026-04-05 10:07:51'),(347,'ORD037EABD7',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:08:00','2026-04-05 10:08:00'),(348,'ORD60DFDF67',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:08:24','2026-04-05 10:08:24'),(349,'ORD5E7AD992',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:09:03','2026-04-05 10:09:03'),(350,'ORDED31CF76',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:13:42','2026-04-05 10:13:42'),(351,'ORDBE813665',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:39:48','2026-04-05 10:39:48'),(352,'ORD17D6CA55',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 10:41:56','2026-04-05 10:41:56'),(353,'ORDD3B66CA7',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 11:04:11','2026-04-05 11:04:11'),(354,'ORDECA1F22A',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 11:25:25','2026-04-05 11:25:25'),(355,'ORD3D7C86B3',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 11:34:52','2026-04-05 11:34:52'),(356,'ORD10F4BADF',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 15:57:10','2026-04-05 15:57:10'),(357,'ORDC52CBA56',1,1,20000,9000,0,29000,'e-wallet','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-05 15:57:24','2026-04-05 15:57:24'),(358,'ORD2025031800126FAFD34',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-08 03:45:05','2026-04-08 03:45:05'),(359,'ORD202503180018240D512',1,1,100000,9000,0,91000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-08 04:06:08','2026-04-08 04:06:08'),(360,'ORD2025031800110EC9C78',1,1,5327000,9000,0,5318000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-08 04:07:22','2026-04-08 04:07:22'),(361,'ORD202503180013FADA7DB',1,1,91784000,9000,0,91775000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-08 09:15:04','2026-04-08 09:15:04'),(362,'ORD20250318001FB64F8C1',1,1,91784000,9000,0,91775000,'vnpay','PENDING','PENDING',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-08 09:15:23','2026-04-08 09:15:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (4,1,12,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','csfdxgc-gfjcrh','Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',980000.00,NULL,2,0,0.00,0,700,2000,5000,2500,NULL,1,'ACTIVE','2026-03-10 12:55:58','2026-04-06 10:40:41'),(109,1,50,'Hosting chất lượng cao','hosting-chat-luong-cao','',999000.00,9.00,0,0,0.00,0,2000,2000,2000,2000,NULL,1,'PENDING','2026-03-10 13:11:56','2026-04-06 10:42:17'),(110,1,50,'Ốp lưng MagSafe iPhone 15','op-lung-magsafe-iphone-15','',125000.00,12500.00,0,0,0.00,0,900,2000,1500,3000,NULL,1,'PENDING','2026-03-10 13:15:05','2026-04-06 10:42:17'),(111,1,175,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','may-khoan-dong-luc-dung-pin-20v-dewalt-dcd1007n-b1','',4190000.00,0.00,0,0,0.00,0,800,500,1000,2000,NULL,1,'PENDING','2026-03-10 14:46:01','2026-04-08 08:42:05'),(112,1,50,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','tai-nghe-bluetooth-55-pin-20h-b02-ket-noi-2-dien-thoai','',65000.00,6500.00,0,0,0.00,0,1000,1000,3000,3000,NULL,1,'PENDING','2026-03-10 15:04:36','2026-04-06 10:42:17'),(113,1,50,'60W 5A 3-12V Nguồn Adapter điều chỉnh điện áp / tốc độ / nhiệt độ EU 100-240V chất lượng tốt','60w-5a-3-12v-nguon-adapter-dieu-chinh-dien-ap-toc-do-nhiet-do-eu-100-240v-chat-luong-tot','',118800.00,11880.00,0,0,0.00,0,5000,5000,5000,5000,NULL,1,'PENDING','2026-03-13 11:57:39','2026-04-06 10:42:17'),(114,2,198,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','dau-chuyen-doi-may-siet-bulong-sang-khoan-13mm-chuyen-doi-tu-bulong-12-sang-khoan-hang-cao-capben-bi','',70000.00,7000.00,0,0,0.00,0,10000,2500,2500,3000,NULL,1,'PENDING','2026-03-22 13:36:32','2026-04-08 03:42:49'),(115,2,204,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','sach-lap-trinh-huong-doi-tuong-java-core-danh-cho-nguoi-moi-bat-dau-hoc-lap-trinh','',289000.00,289000.00,0,0,0.00,0,8000,600,5000,5000,NULL,1,'PENDING','2026-03-22 14:30:10','2026-04-08 03:43:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_image`
--

LOCK TABLES `product_image` WRITE;
/*!40000 ALTER TABLE `product_image` DISABLE KEYS */;
INSERT INTO `product_image` VALUES (9,4,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1768728032/ntpuzzwfqrdtpqkodfii.jpg',0,0,'2026-01-18 09:20:34'),(11,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1768736560/pbgf6h5xpedlrloz8ivi.jpg',0,0,'2026-01-18 11:42:41'),(12,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1768736716/luiljyqal1ulflbtvhv6.jpg',0,0,'2026-01-18 11:45:17'),(13,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1768740515/te17hgwd5lwmtojods8k.jpg',0,0,'2026-01-18 12:48:36'),(15,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769262639/pfelstatu2oxzyrbjtu6.png',0,0,'2026-01-24 13:50:40'),(16,4,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769262710/nb400ehdevejjsx3pdt6.png',0,0,'2026-01-24 13:51:51'),(17,24,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769264250/cotk5hxlpcxxxfo3jxij.png',0,0,'2026-01-24 14:17:31'),(18,25,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769264783/qjyzjdxyvqtlxhvcxqts.png',0,0,'2026-01-24 14:26:24'),(19,25,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769264785/bcawkqnzqc0r5blx4qmi.png',0,0,'2026-01-24 14:26:26'),(20,32,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',0,0,'2026-01-25 12:54:50'),(21,33,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769346480/vlsmnlglrp3o2c5fhudu.jpg',0,0,'2026-01-25 13:08:00'),(22,34,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769348663/gvj0kwzqqa74oliytirb.jpg',0,0,'2026-01-25 13:44:24'),(23,35,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769348744/xfd3bzcvjzxult1bfwf5.jpg',0,0,'2026-01-25 13:45:45'),(24,36,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769348940/cb5fotim05m7qtm1p0cq.jpg',0,0,'2026-01-25 13:49:01'),(25,37,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769948126/ipo6c2iwsls7tgulx0vi.png',0,0,'2026-02-01 12:15:27'),(26,38,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1769950883/g2oev0rptvfh2hsygghv.webp',0,0,'2026-02-01 13:01:24'),(29,109,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773148318/hjmrika0uexxviqjo8u8.png',0,0,'2026-03-10 13:11:59'),(30,110,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773148507/yv8pqkhstzzx4sxnuae9.webp',0,0,'2026-03-10 13:15:07'),(31,111,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',0,0,'2026-03-10 14:46:03'),(32,112,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',0,0,'2026-03-10 15:04:39'),(33,113,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773403061/pislb09dvnecogzzl272.webp',0,0,'2026-03-13 11:57:42'),(41,114,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',0,0,'2026-03-22 13:36:35'),(42,115,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',0,0,'2026-03-22 14:30:12');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variant`
--

LOCK TABLES `product_variant` WRITE;
/*!40000 ALTER TABLE `product_variant` DISABLE KEYS */;
INSERT INTO `product_variant` VALUES (1,4,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa','dfkaww',219000.00,10,5000,700,2500,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',1,'2026-02-06 14:01:29','2026-04-08 02:19:15'),(2,4,'Động Cơ Motor Giảm Tốc 36GP - 555 BCD','sdxsd',189000.00,10,5000,700,2500,'https://res.cloudinary.com/dizx3mbgw/image/upload/v1769345689/tuidgun3b26tnyuc2cix.jpg',1,'2026-02-07 13:48:39','2026-04-08 02:19:15'),(8,111,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1','SKU-111',4190000.00,1,1000,800,2000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773153962/m4fv3s4jsp8urdlynbvn.jpg',1,'2026-03-10 14:46:01','2026-04-08 02:19:15'),(9,112,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại','SKU-112',6500.00,0,3000,1000,3000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1773155077/foicjmzo7ohdmkey2anm.webp',1,'2026-03-10 15:04:36','2026-04-08 02:19:15'),(10,113,'60W 5A 3-12V Nguồn Adapter điều chỉnh điện áp / tốc độ / nhiệt độ EU 100-240V chất lượng tốt','SKU-113',11880.00,0,5000,5000,5000,'',1,'2026-03-13 11:57:39','2026-04-08 02:19:15'),(11,114,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ','SKU-114',7000.00,0,10000,10000,10000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774186594/b77xkw4ionmf7kidlofn.webp',1,'2026-03-22 13:36:32','2026-04-08 03:44:38'),(12,115,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình','SKU-115',289000.00,0,5000,8000,5000,'http://res.cloudinary.com/dizx3mbgw/image/upload/v1774189812/tppvpxmqoszvsnbtsisn.webp',1,'2026-03-22 14:30:10','2026-04-08 02:19:15');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop`
--

LOCK TABLES `shop` WRITE;
/*!40000 ALTER TABLE `shop` DISABLE KEYS */;
INSERT INTO `shop` VALUES (1,2,'FSAFAFc','cdfdsv','cvcs','vds','fsb','vcbsd',0.00,0,0,0.00,0,1,1,'2026-01-14 15:42:37','2026-01-14 15:42:37','PENDING',NULL,NULL,NULL,0),(2,4,'Điện tử 247','Chuyên đồ điện tử DIY','http://res.cloudinary.com/dizx3mbgw/raw/upload/v1774889994/sellers/logos/jsxotfhpn5uy6p42a3uq',NULL,NULL,'abc',0.00,0,0,0.00,0,0,1,'2026-02-01 10:38:52','2026-03-30 23:59:56','PENDING',NULL,NULL,NULL,0),(3,24,'Cua Hang Vu','Shop ban hang dien tu',NULL,NULL,NULL,'1234567890',0.00,0,0,0.00,0,0,0,'2026-03-30 22:58:36','2026-03-30 23:35:10','REJECTED','Giay phep khong hop le',NULL,NULL,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin@ecommerce.com','0900000001','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Admin System',NULL,'1995-01-01','male','both',1,1,'2025-12-29 11:54:43','2026-01-09 12:14:11','2025-12-29 11:54:43'),(2,'seller01@shop.com','0968443564','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Seller One',NULL,'1998-05-10','female','seller',1,1,'2025-12-29 11:54:43','2026-02-01 13:58:37',NULL),(3,'buyer01@gmail.com','0900000003','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Buyer One',NULL,NULL,'other','buyer',1,1,'2025-12-29 11:54:43','2026-01-14 11:43:50',NULL),(4,'buyer02@gmail.com','0932334354','$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Buyer 2',NULL,NULL,'other','both',1,1,'2026-01-17 03:08:13','2026-01-17 03:08:13',NULL),(5,'dangvanthanhdiep2711@gmail.com',NULL,'$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Đặng Văn Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 11:56:16','2026-02-02 10:56:15',NULL),(6,'dangvanthanhdiep2000@gmail.com',NULL,'$2a$12$iQKpaik9MWtdRy8/9p6WFOifW7JSQMJD72WezrO3b4jhXXrMuVhyO','Đặng Văn Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 13:00:26','2026-02-02 10:56:15',NULL),(7,'thanhtu@gmail.com','0966456888','$2a$10$CGmGsDedKT.fiirlU/erMuT85029EyCaa.2mQgtVCei5wBp7xrYaa','Thanh Tú',NULL,'1993-11-23','male','buyer',1,1,'2026-01-19 13:16:59','2026-01-26 18:23:27',NULL),(8,'thoai@gmail.com',NULL,'$2a$10$i0BAj217SjPgc/goKoH1Z.PBXjdXXCiCPUFP2GwsMyceREHB4st3O','Thoại',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 13:21:18','2026-01-19 13:21:18',NULL),(9,'dangvanthanhdiep1@gmail.com','0966273721','$2a$10$Bhth5//1NMPAfLdNKRGRjeBVYntjhlMUqLCo34cnIQhwb5bsdFESC','Thành Điệp',NULL,'2000-11-27','male','buyer',1,1,'2026-01-19 17:46:11','2026-01-23 18:27:14',NULL),(10,'dangvanthanhdiep2@gmail.com',NULL,'$2a$10$E3Zgv0BriHbmdCkkc8xmJOdi8resu6NoF9lMIZqt.Lp5Rqb.2NIBG','Đặng Văn Thành Điệp 2',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 17:49:33','2026-01-19 17:49:33',NULL),(11,'dangvanthanhdiep3@gmail.com',NULL,'$2a$10$25gG7KzR31UFmO6C5oLQcuXkItjfVDzhtpHsd0gL/XanVCARJ7OGG','Đặng Văn Thành Điệp 3',NULL,NULL,NULL,'buyer',1,1,'2026-01-19 17:54:53','2026-01-19 17:54:53',NULL),(12,'diepdudon@gmail.com',NULL,'$2a$10$begOBcYg9IQ3QREmR9n85uWQCYNUg4OenEpU4WKk755ewgCkI2cMm','Thành Điệp',NULL,NULL,NULL,'buyer',1,1,'2026-01-21 18:17:28','2026-01-21 18:17:28',NULL),(13,'testuser@example.com',NULL,'$2a$10$AAH6PZqULTe5uLHIHUO6Sup5oXRX0L0Y.VRVSaXPnsjRGNGkCGHw.','Vu Nguyen',NULL,NULL,NULL,'buyer',1,1,'2026-02-13 16:48:52','2026-02-13 16:48:52',NULL),(14,'e2e_1774602773635@test.com','0909888999','$2a$10$FMDsHa8xkMSUOavUTfPNtuFD8B/CgRJjuquT0xGoyZh2oeK1etVy6','E2E Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:13:05','2026-03-27 16:13:05',NULL),(15,'demo_p0@test.com','0909888111','$2a$10$nGdepBsbN6XvGtSf1qyRRuX0kNtCi7ngUpXw50hrvHTg1p7Y4DABC','Nguyen Van Demo',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:33:33','2026-03-27 16:33:33',NULL),(17,'e2e_1774604073905@test.com','0904073905','$2a$10$YED.Mf790AVNxA9d1iPem.l.fpUR/g.s217O.vsLaecKYXcwR54pW','E2E Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:34:38','2026-03-27 16:34:38',NULL),(18,'final_test_${Date.now()}@test.com','09$(date +%s)','$2a$10$2fioMcit/0RzlkEm62ez7OQS1wKe9e1ewKeYkiuSeuxsvPm6tydBK','Final Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 16:35:01','2026-03-27 16:35:01',NULL),(19,'testseller123@example.com','0999999001','$2a$10$JRD9qgDUm.O9IdrLKus57.vObBdkUroth0AvZzJsSh.Y1kB55ZwlK','Test Seller',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:22:01','2026-03-27 18:22:01',NULL),(20,'testseller456@example.com','0999999002','$2a$10$r8dZ72BAIXjaB9mduScTeeNx6Zj86ydNn5AlswpUrLUJGz2QCFv6W','Test Seller 2',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:31:32','2026-03-27 18:31:32',NULL),(21,'debugtest999@example.com','0999999999','$2a$10$UV3urwgMdK7KRYmE4jB.ou2mioVaEPgFgzqIDnQrO1q5s9gjenHlK','Debug Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:33:21','2026-03-27 18:33:21',NULL),(22,'recalc9999@example.com','0799999001','$2a$10$ST.YtGdIW1DNNXtIoalkNOPA69W5n3GcakYF6Ikv9tlEnPu9Mj0Gi','Recalc Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 18:49:30','2026-03-27 18:49:30',NULL),(23,'apitest9999@example.com','0699999001','$2a$10$SsoZmKBv3K4AfeLF5ENqSuk3th9NKFPCsCE8sKUORL5M5C9Bomj/i','API Test',NULL,NULL,NULL,'seller',1,1,'2026-03-27 19:08:42','2026-03-27 19:08:42',NULL),(24,'owner1@test.com',NULL,'$2a$10$MNMvFZvFi5I78R97bclQTOFsnechsafUq.nydTzli8JxXiw.PCMxm','Shop Owner One',NULL,NULL,NULL,'buyer',1,1,'2026-03-30 22:58:18','2026-03-30 22:58:18',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
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
  CONSTRAINT `voucher_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shop` (`id`) ON DELETE CASCADE
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
-- Table structure for table `voucher_condition`
--

DROP TABLE IF EXISTS `voucher_condition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_condition` (
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
-- Dumping data for table `voucher_condition`
--

LOCK TABLES `voucher_condition` WRITE;
/*!40000 ALTER TABLE `voucher_condition` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_condition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_condition_type`
--

DROP TABLE IF EXISTS `voucher_condition_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_condition_type` (
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
-- Dumping data for table `voucher_condition_type`
--

LOCK TABLES `voucher_condition_type` WRITE;
/*!40000 ALTER TABLE `voucher_condition_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_condition_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_usage_history`
--

DROP TABLE IF EXISTS `voucher_usage_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_usage_history` (
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
-- Dumping data for table `voucher_usage_history`
--

LOCK TABLES `voucher_usage_history` WRITE;
/*!40000 ALTER TABLE `voucher_usage_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_usage_history` ENABLE KEYS */;
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

--
-- Dumping events for database 'ecommerce'
--

--
-- Dumping routines for database 'ecommerce'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 22:51:50
