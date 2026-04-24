  -- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
  --
  -- Host: 103.90.225.130    Database: logistic_service
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
  ) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông tin người nhận hàng (snapshot tại thời điểm tạo shipment)';
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `recipient`
  --

  LOCK TABLES `recipient` WRITE;
  /*!40000 ALTER TABLE `recipient` DISABLE KEYS */;
  INSERT INTO `recipient` VALUES (128,'Vo Giang Thoai','0862830787','vpthpo@gmail.com','341 Cao Thang',2,4,5,'2026-03-27 06:17:02'),(129,'Vo Quang Teo','0869990787',NULL,'341 Cao Thang',2,4,5,'2026-03-28 12:31:36'),(131,'Vo Quang Teo Em','0860000787',NULL,'341 Cao Thang',2,4,5,'2026-03-28 12:45:43'),(132,'dvzsx','0987654243',NULL,'dvsvsv',1,1,1,'2026-03-29 22:25:44'),(133,'thoai','0867677888',NULL,'456 vnnvn, Phường 1, Quận 1, Hà Nội',NULL,NULL,NULL,'2026-04-01 19:14:20'),(134,'Thoại Chó điên','0976499267',NULL,'51 Hiệp Bình, Phường Hiệp Bình Chánh, Thành Phố Thủ Đức, TP. Hồ Chí Minh',NULL,NULL,NULL,'2026-04-09 22:18:58'),(135,'Cu Tí','0968561302',NULL,'Ấp Cá Tra, Xã Tam Ngãi, Huyện Cầu Kè, TP 214',NULL,NULL,NULL,'2026-04-11 13:06:40'),(136,'Lý Liên Kiệt','0989644354',NULL,'Ấp 3T Dương Công Khi, Xã Xuân Thới Thượng, Huyện Hóc Môn, TP. Hồ Chí Minh',NULL,NULL,NULL,'2026-04-16 09:55:03'),(137,'Điệp mất Lan rồi','0957060799',NULL,'81 Tân Chánh Hiệp 36, Phường Tân Chánh Hiệp, Quận 12, TP. Hồ Chí Minh',NULL,NULL,NULL,'2026-04-21 21:33:33'),(138,'Lý Tiểu Long','0912341232',NULL,'180 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh',NULL,NULL,NULL,'2026-04-22 11:14:05'),(139,'Tu dien','0987967543',NULL,'31 Tân Hoà Đông, Phường 14, Quận 6, TP. Hồ Chí Minh',NULL,NULL,NULL,'2026-04-22 13:44:25');
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
  ) ENGINE=InnoDB AUTO_INCREMENT=380 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vận đơn - đơn vị trung tâm của logistics service';
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `shipment`
  --

  LOCK TABLES `shipment` WRITE;
  /*!40000 ALTER TABLE `shipment` DISABLE KEYS */;
  INSERT INTO `shipment` VALUES (332,'LOGB3521542',412,1,1,134,'PENDING',0,18773000,NULL,NULL,NULL,NULL,'2026-04-16 09:46:02','2026-04-16 09:46:02'),(333,'LOG4FC455EC',413,2,1,134,'PENDING',0,18773000,NULL,NULL,NULL,NULL,'2026-04-16 09:46:02','2026-04-16 09:46:02'),(334,'LOG6643E846',414,1,1,136,'PICKED_UP',75000,26885500,NULL,NULL,NULL,NULL,'2026-04-16 09:55:03','2026-04-21 22:23:00'),(335,'LOG1A98AC03',415,2,1,136,'PENDING',75000,26885500,NULL,NULL,NULL,NULL,'2026-04-16 09:55:03','2026-04-16 09:55:03'),(336,'LOG69E853B3',548,2,1,137,'PENDING',0,8190,NULL,NULL,NULL,NULL,'2026-04-21 21:33:33','2026-04-21 21:33:33'),(337,'LOG9A6EB153',549,1,1,137,'IN_TRANSIT',0,8190,NULL,NULL,NULL,NULL,'2026-04-21 21:33:34','2026-04-21 22:22:46'),(338,'LOG6E980412',552,1,1,134,'PENDING',0,17212000,NULL,NULL,NULL,NULL,'2026-04-22 10:17:05','2026-04-22 10:17:05'),(339,'LOGDCB485E8',553,2,1,134,'PENDING',0,17212000,NULL,NULL,NULL,NULL,'2026-04-22 10:17:05','2026-04-22 10:17:05'),(340,'LOG0A23094F',554,1,1,134,'PICKED_UP',0,642190,NULL,NULL,NULL,NULL,'2026-04-22 10:52:02','2026-04-22 11:01:54'),(341,'LOG0F1C8C24',555,2,1,134,'PENDING',0,642190,NULL,NULL,NULL,NULL,'2026-04-22 10:52:02','2026-04-22 10:52:02'),(342,'LOG3922351D',556,1,1,138,'PICKED_UP',0,9604000,NULL,NULL,NULL,NULL,'2026-04-22 11:14:06','2026-04-22 11:16:31'),(343,'LOG16553CAB',557,2,1,138,'PENDING',0,9604000,NULL,NULL,NULL,NULL,'2026-04-22 11:14:06','2026-04-22 11:14:06'),(344,'LOG4CF012DA',562,1,1,139,'PENDING',0,2428000,NULL,NULL,NULL,NULL,'2026-04-22 13:44:25','2026-04-22 13:44:25'),(345,'LOGCAF01739',563,2,1,139,'PENDING',0,2428000,NULL,NULL,NULL,NULL,'2026-04-22 13:44:26','2026-04-22 13:44:26'),(346,'LOGCD0B44F1',564,1,1,134,'PENDING',0,2791190,NULL,NULL,NULL,NULL,'2026-04-22 15:24:06','2026-04-22 15:24:06'),(347,'LOG6A3B360C',565,2,1,134,'PENDING',0,2791190,NULL,NULL,NULL,NULL,'2026-04-22 15:24:07','2026-04-22 15:24:07'),(348,'LOGBD1CA4B3',566,1,1,134,'PENDING',0,3039000,NULL,NULL,NULL,NULL,'2026-04-22 15:30:19','2026-04-22 15:30:19'),(349,'LOGCB32FF83',567,2,1,134,'PENDING',0,3039000,NULL,NULL,NULL,NULL,'2026-04-22 15:30:19','2026-04-22 15:30:19'),(350,'LOGD52F3303',572,1,1,134,'PENDING',0,452000,NULL,NULL,NULL,NULL,'2026-04-22 17:21:12','2026-04-22 17:21:12'),(351,'LOGF4CEE4A2',573,2,1,134,'PENDING',0,452000,NULL,NULL,NULL,NULL,'2026-04-22 17:21:13','2026-04-22 17:21:13'),(352,'LOGCEEF154C',574,1,1,134,'PENDING',0,5628000,NULL,NULL,NULL,NULL,'2026-04-22 17:25:13','2026-04-22 17:25:13'),(353,'LOGAAB5F9B2',576,2,1,136,'PENDING',0,4204000,NULL,NULL,NULL,NULL,'2026-04-22 17:28:34','2026-04-22 17:28:34'),(354,'LOG592556CC',575,1,1,136,'PENDING',0,4204000,NULL,NULL,NULL,NULL,'2026-04-22 17:28:34','2026-04-22 17:28:34'),(355,'LOG4A5105A0',577,1,1,139,'PENDING',0,796500,NULL,NULL,NULL,NULL,'2026-04-22 18:16:56','2026-04-22 18:16:56'),(356,'LOG6A8B466B',578,2,1,139,'PENDING',0,796500,NULL,NULL,NULL,NULL,'2026-04-22 18:16:56','2026-04-22 18:16:56'),(357,'LOG70DAE34B',579,1,1,139,'PENDING',0,189000,NULL,NULL,NULL,NULL,'2026-04-22 18:28:49','2026-04-22 18:28:49'),(358,'LOG0B759A31',580,1,1,139,'PENDING',0,1533000,NULL,NULL,NULL,NULL,'2026-04-22 19:45:14','2026-04-22 19:45:14'),(359,'LOGE5A28FEA',581,1,1,139,'PENDING',0,1533000,NULL,NULL,NULL,NULL,'2026-04-22 19:47:23','2026-04-22 19:47:23'),(360,'LOG641F6F2B',582,1,1,139,'PENDING',0,378000,NULL,NULL,NULL,NULL,'2026-04-22 20:26:40','2026-04-22 20:26:40'),(361,'LOG67961971',583,1,1,134,'PENDING',0,438000,NULL,NULL,NULL,NULL,'2026-04-22 20:29:04','2026-04-22 20:29:04'),(362,'LOGB6E0E02C',584,1,1,139,'PENDING',0,189000,NULL,NULL,NULL,NULL,'2026-04-22 20:45:01','2026-04-22 20:45:01'),(363,'LOG26C4F118',585,1,1,134,'PENDING',0,438000,NULL,NULL,NULL,NULL,'2026-04-22 20:48:07','2026-04-22 20:48:07'),(364,'LOG503C0BEC',586,1,1,134,'PENDING',0,16760000,NULL,NULL,NULL,NULL,'2026-04-22 20:49:05','2026-04-22 20:49:05'),(365,'LOGE93D2CB4',587,1,1,134,'PENDING',0,1190,NULL,NULL,NULL,NULL,'2026-04-22 20:51:39','2026-04-22 20:51:39'),(366,'LOG95BC3BEC',588,1,1,136,'CONFIRMED',0,12570000,NULL,NULL,NULL,NULL,'2026-04-22 21:49:39','2026-04-22 22:21:33'),(367,'LOG96F4C55A',589,1,1,136,'OUT_FOR_DELIVERY',0,12570000,NULL,NULL,NULL,NULL,'2026-04-22 21:52:19','2026-04-23 11:41:28'),(368,'LOG90696D61',590,2,1,134,'PENDING',0,3039000,NULL,NULL,NULL,NULL,'2026-04-23 11:43:28','2026-04-23 11:43:28'),(369,'LOGCA36F4B7',591,1,1,134,'CONFIRMED',0,3039000,NULL,NULL,NULL,NULL,'2026-04-23 11:43:28','2026-04-23 17:59:20'),(370,'LOGC4CC98A9',592,1,1,139,'DELIVERED',0,252500,NULL,NULL,NULL,'2026-04-23 06:29:59','2026-04-23 12:43:09','2026-04-23 13:30:00'),(371,'LOGD60B265C',593,2,1,139,'PENDING',0,252500,NULL,NULL,NULL,NULL,'2026-04-23 12:43:09','2026-04-23 12:43:09'),(372,'LOG8E999F3A',594,2,1,138,'PENDING',0,584500,NULL,NULL,NULL,NULL,'2026-04-23 18:02:26','2026-04-23 18:02:26'),(373,'LOGC0978839',595,1,1,138,'DELIVERED',0,584500,NULL,NULL,NULL,'2026-04-23 11:04:55','2026-04-23 18:02:26','2026-04-23 18:04:55'),(374,'LOG417E7394',596,1,1,134,'PENDING',0,452000,NULL,NULL,NULL,NULL,'2026-04-23 20:31:47','2026-04-23 20:31:47'),(375,'LOG4B607ED1',597,2,1,134,'PENDING',0,452000,NULL,NULL,NULL,NULL,'2026-04-23 20:31:48','2026-04-23 20:31:48'),(376,'LOGEF01680D',598,2,1,138,'OUT_FOR_DELIVERY',0,803500,NULL,NULL,NULL,NULL,'2026-04-23 22:13:42','2026-04-23 22:23:28'),(377,'LOG73A17D33',599,1,1,138,'OUT_FOR_DELIVERY',0,803500,NULL,NULL,NULL,NULL,'2026-04-23 22:13:42','2026-04-23 22:18:29'),(378,'LOG172EB613',600,1,1,136,'PICKED_UP',0,598500,NULL,NULL,NULL,NULL,'2026-04-23 22:25:05','2026-04-23 22:26:34'),(379,'LOG9AB76CF3',601,2,1,136,'PENDING',0,598500,NULL,NULL,NULL,NULL,'2026-04-23 22:25:05','2026-04-23 22:25:05');
  /*!40000 ALTER TABLE `shipment` ENABLE KEYS */;
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
  /*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_shipment_before_update_status` BEFORE UPDATE ON `shipment` FOR EACH ROW BEGIN
    DECLARE v_old_step INT DEFAULT 0;
    DECLARE v_new_step INT DEFAULT 0;
    DECLARE v_toggle_count INT DEFAULT 0;

    IF NOT (OLD.status <=> NEW.status) THEN
      IF NEW.status IS NULL OR TRIM(NEW.status) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Shipment status is required.';
      END IF;

      SET v_old_step = fn_shipment_status_step(OLD.status);
      SET v_new_step = fn_shipment_status_step(NEW.status);

      IF v_old_step = 0 OR v_new_step = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Shipment status is not supported by workflow rule.';
      END IF;

      IF OLD.status IN ('PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY') THEN
        IF v_new_step <> v_old_step + 1 THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Shipment must move forward one step at a time from PENDING to DELIVERED.';
        END IF;
      ELSEIF OLD.status = 'DELIVERED' THEN
        SET v_toggle_count = fn_shipment_delivery_failed_toggle_count(OLD.id);

        IF NEW.status <> 'FAILED' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'From DELIVERED the shipment can only move to FAILED.';
        END IF;

        IF v_toggle_count >= 3 THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'DELIVERED and FAILED can only toggle 3 times. Move shipment to RETURNED.';
        END IF;
      ELSEIF OLD.status = 'FAILED' THEN
        SET v_toggle_count = fn_shipment_delivery_failed_toggle_count(OLD.id);

        IF v_toggle_count >= 3 THEN
          IF NEW.status <> 'RETURNED' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'After the third DELIVERED to FAILED toggle, shipment must move to RETURNED.';
          END IF;
        ELSEIF NEW.status <> 'DELIVERED' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'From FAILED the shipment can only move back to DELIVERED before the toggle limit is reached.';
        END IF;
      ELSEIF OLD.status = 'RETURNED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'RETURNED is terminal and cannot move to another status.';
      END IF;

      IF NEW.status = 'DELIVERED' THEN
        SET NEW.delivered_at = CURRENT_TIMESTAMP;
      END IF;
    END IF;
  END */;;
  DELIMITER ;
  /*!50003 SET sql_mode              = @saved_sql_mode */ ;
  /*!50003 SET character_set_client  = @saved_cs_client */ ;
  /*!50003 SET character_set_results = @saved_cs_results */ ;
  /*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  ) ENGINE=InnoDB AUTO_INCREMENT=336 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Sản phẩm trong vận đơn (snapshot, không join về ecommerce DB)';
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `shipment_item`
  --

  LOCK TABLES `shipment_item` WRITE;
  /*!40000 ALTER TABLE `shipment_item` DISABLE KEYS */;
  INSERT INTO `shipment_item` VALUES (274,332,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,189000.00),(275,332,'Google TV Philips 43 inch FullHD LED 43PFT6509 - Hàng Chính Hãng ',NULL,3,6190000.00),(276,333,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(277,334,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại',NULL,1,6500.00),(278,334,'Tivi Philips MediaSuite 65HFL5214U - Hàng chính hãng',NULL,1,26790000.00),(279,335,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(280,336,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,1,7000.00),(281,337,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn',NULL,1,1190.00),(282,338,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(283,338,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',NULL,4,4190000.00),(284,339,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(285,340,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(286,340,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,189000.00),(287,340,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn',NULL,1,1190.00),(288,341,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(289,342,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,189000.00),(290,342,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',NULL,1,4190000.00),(291,342,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng',NULL,1,5190000.00),(292,343,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,5,7000.00),(293,344,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,7,219000.00),(294,345,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,4,7000.00),(295,345,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,3,289000.00),(296,346,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,189000.00),(297,346,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn',NULL,1,1190.00),(298,347,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,9,289000.00),(299,348,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(300,349,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,9,289000.00),(301,350,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(302,351,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(303,352,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(304,352,'Điện thoại Samsung Galaxy A26 5G (8/128GB), Mặt lưng kính, AI-Circle to Search, Camera HDR chụp đêm sáng rõ - Hàng chính hãng',NULL,1,5190000.00),(305,353,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(306,354,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',NULL,1,4190000.00),(307,355,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,4,189000.00),(308,355,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại',NULL,3,6500.00),(309,356,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,3,7000.00),(310,357,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,189000.00),(311,358,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,7,219000.00),(312,359,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,7,219000.00),(313,360,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,189000.00),(314,361,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(315,362,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,189000.00),(316,363,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(317,364,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',NULL,4,4190000.00),(318,365,'Mạch Sạc Pin 1S 3.7V Lithium 18650 USB Type C 1A TP4056 Có IC Bảo Vệ Dòng Cao Cấp - Sạc & Xả An Toàn',NULL,1,1190.00),(319,366,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',NULL,3,4190000.00),(320,367,'Máy Khoan Động Lực Dùng Pin 20V Dewalt DCD1007N-B1',NULL,3,4190000.00),(321,368,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,9,289000.00),(322,369,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(323,370,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,219000.00),(324,370,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại',NULL,3,6500.00),(325,371,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(326,372,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,2,289000.00),(327,373,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại',NULL,1,6500.00),(328,374,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,2,219000.00),(329,375,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(330,376,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,2,289000.00),(331,377,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại',NULL,1,6500.00),(332,377,'Động Cơ Motor Giảm Tốc 36GP - 555 Răng kim loại 12V/24 , Trục 8mm Device siêu khỏe Tốc Độ Nhiều chọn Lựa',NULL,1,219000.00),(333,378,'Tai Nghe Bluetooth 5.5 Pin 20H B02 Kết Nối 2 Điện Thoại',NULL,1,6500.00),(334,379,'Đầu Chuyển Đổi Máy Siết Bulong Sang Khoan 13mm - Chuyển đổi từ Bulong 1/2 sang khoan hàng cao cấp,bền bỉ',NULL,2,7000.00),(335,379,'Sách lập trình hướng đối tượng JAVA core dành cho người mới bắt đầu học lập trình',NULL,2,289000.00);
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
  ) ENGINE=InnoDB AUTO_INCREMENT=359 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử trạng thái vận đơn - nguồn dữ liệu tracking page';
  /*!40101 SET character_set_client = @saved_cs_client */;

  --
  -- Dumping data for table `shipment_status_history`
  --

  LOCK TABLES `shipment_status_history` WRITE;
  /*!40000 ALTER TABLE `shipment_status_history` DISABLE KEYS */;
  /*!40000 ALTER TABLE `shipment_status_history` ENABLE KEYS */;
  UNLOCK TABLES;
  /*!50003 SET @saved_cs_client      = @@character_set_client */ ;
  /*!50003 SET @saved_cs_results     = @@character_set_results */ ;
  /*!50003 SET @saved_col_connection = @@collation_connection */ ;
  /*!50003 SET character_set_client  = utf8mb3 */ ;
  /*!50003 SET character_set_results = utf8mb3 */ ;
  /*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
  /*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
  /*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
  DELIMITER ;;
  /*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_shipment_status_history_insert` BEFORE INSERT ON `shipment_status_history` FOR EACH ROW BEGIN
      
      IF NEW.updated_at IS NULL THEN
          SET NEW.updated_at = CURRENT_TIMESTAMP;
      END IF;
      
      
      IF NEW.shipment_id NOT IN (SELECT id FROM shipment) THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Invalid shipment_id - shipment does not exist';
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
  /*!50003 SET character_set_client  = utf8mb3 */ ;
  /*!50003 SET character_set_results = utf8mb3 */ ;
  /*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
  /*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
  /*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
  DELIMITER ;;
  /*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_shipment_auto_sync_updated_at` AFTER INSERT ON `shipment_status_history` FOR EACH ROW BEGIN
      
      UPDATE shipment s
      SET s.updated_at = NEW.updated_at
      WHERE s.id = NEW.shipment_id;
  END */;;
  DELIMITER ;
  /*!50003 SET sql_mode              = @saved_sql_mode */ ;
  /*!50003 SET character_set_client  = @saved_cs_client */ ;
  /*!50003 SET character_set_results = @saved_cs_results */ ;
  /*!50003 SET collation_connection  = @saved_col_connection */ ;
  /*!50003 SET @saved_cs_client      = @@character_set_client */ ;
  /*!50003 SET @saved_cs_results     = @@character_set_results */ ;
  /*!50003 SET @saved_col_connection = @@collation_connection */ ;
  /*!50003 SET character_set_client  = utf8mb3 */ ;
  /*!50003 SET character_set_results = utf8mb3 */ ;
  /*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
  /*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
  /*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
  DELIMITER ;;
  /*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_shipment_status_history_update` BEFORE UPDATE ON `shipment_status_history` FOR EACH ROW BEGIN
      SET NEW.updated_at = OLD.updated_at;
  END */;;
  DELIMITER ;
  /*!50003 SET sql_mode              = @saved_sql_mode */ ;
  /*!50003 SET character_set_client  = @saved_cs_client */ ;
  /*!50003 SET character_set_results = @saved_cs_results */ ;
  /*!50003 SET collation_connection  = @saved_col_connection */ ;
  /*!50003 DROP TRIGGER IF EXISTS `trg_shipment_after_update_status_history` */;
  /*!50003 SET @saved_cs_client      = @@character_set_client */ ;
  /*!50003 SET @saved_cs_results     = @@character_set_results */ ;
  /*!50003 SET @saved_col_connection = @@collation_connection */ ;
  /*!50003 SET character_set_client  = utf8mb3 */ ;
  /*!50003 SET character_set_results = utf8mb3 */ ;
  /*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
  /*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
  /*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
  DELIMITER ;;
  /*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `trg_shipment_after_update_status_history` AFTER UPDATE ON `shipment` FOR EACH ROW BEGIN
    IF NOT (OLD.status <=> NEW.status) THEN
      INSERT INTO shipment_status_history (
        shipment_id,
        status,
        description,
        location,
        updated_by,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.status,
        CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
        NULL,
        'system',
        CURRENT_TIMESTAMP
      );
    END IF;
  END */;;
  DELIMITER ;
  /*!50003 SET sql_mode              = @saved_sql_mode */ ;
  /*!50003 SET character_set_client  = @saved_cs_client */ ;
  /*!50003 SET character_set_results = @saved_cs_results */ ;
  /*!50003 SET collation_connection  = @saved_col_connection */ ;

  --
  -- Dumping events for database 'logistic_service'
  --

  --
  -- Dumping routines for database 'logistic_service'
  --
  /*!50003 DROP FUNCTION IF EXISTS `fn_shipment_delivery_failed_toggle_count` */;
  /*!50003 SET @saved_cs_client      = @@character_set_client */ ;
  /*!50003 SET @saved_cs_results     = @@character_set_results */ ;
  /*!50003 SET @saved_col_connection = @@collation_connection */ ;
  /*!50003 SET character_set_client  = utf8mb4 */ ;
  /*!50003 SET character_set_results = utf8mb4 */ ;
  /*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
  /*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
  /*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
  DELIMITER ;;
  CREATE DEFINER=`root`@`%` FUNCTION `fn_shipment_delivery_failed_toggle_count`(p_shipment_id BIGINT) RETURNS int
      READS SQL DATA
  BEGIN
    DECLARE v_toggle_count INT DEFAULT 0;

    SELECT GREATEST(COUNT(*) - 1, 0)
    INTO v_toggle_count
    FROM shipment_status_history
    WHERE shipment_id = p_shipment_id
      AND status IN ('DELIVERED', 'FAILED');

    RETURN v_toggle_count;
  END ;;
  DELIMITER ;
  /*!50003 SET sql_mode              = @saved_sql_mode */ ;
  /*!50003 SET character_set_client  = @saved_cs_client */ ;
  /*!50003 SET character_set_results = @saved_cs_results */ ;
  /*!50003 SET collation_connection  = @saved_col_connection */ ;
  /*!50003 DROP FUNCTION IF EXISTS `fn_shipment_status_step` */;
  /*!50003 SET @saved_cs_client      = @@character_set_client */ ;
  /*!50003 SET @saved_cs_results     = @@character_set_results */ ;
  /*!50003 SET @saved_col_connection = @@collation_connection */ ;
  /*!50003 SET character_set_client  = utf8mb4 */ ;
  /*!50003 SET character_set_results = utf8mb4 */ ;
  /*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
  /*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
  /*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
  DELIMITER ;;
  CREATE DEFINER=`root`@`%` FUNCTION `fn_shipment_status_step`(p_status VARCHAR(50)) RETURNS int
      DETERMINISTIC
  BEGIN
    RETURN CASE p_status
      WHEN 'PENDING' THEN 1
      WHEN 'CONFIRMED' THEN 2
      WHEN 'PICKED_UP' THEN 3
      WHEN 'IN_TRANSIT' THEN 4
      WHEN 'OUT_FOR_DELIVERY' THEN 5
      WHEN 'DELIVERED' THEN 6
      WHEN 'FAILED' THEN 7
      WHEN 'RETURNED' THEN 8
      ELSE 0
    END;
  END ;;
  DELIMITER ;
  /*!50003 SET sql_mode              = @saved_sql_mode */ ;
  /*!50003 SET character_set_client  = @saved_cs_client */ ;
  /*!50003 SET character_set_results = @saved_cs_results */ ;
  /*!50003 SET collation_connection  = @saved_col_connection */ ;
  /*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

  /*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
  /*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
  /*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
  /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
  /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
  /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
  /*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

  -- Dump completed on 2026-04-23 22:28:25
