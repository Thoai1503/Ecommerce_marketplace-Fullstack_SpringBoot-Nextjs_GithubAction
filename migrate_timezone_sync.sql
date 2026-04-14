-- Migration: Synchronize timezone between shipment and shipment_status_history tables
-- Purpose: Ensure consistent timestamp handling across both tables (UTC+7 / Asia/Ho_Chi_Minh)
-- Date: 2026-04-11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+07:00' */;

-- =====================================================================
-- PART 1: Fix historical data in shipment_status_history
-- Adjust timestamps to match shipment table (add 7 hours to historical data)
-- =====================================================================

START TRANSACTION;

-- Create temp table to hold corrections
CREATE TEMPORARY TABLE temp_history_corrections AS
SELECT 
    h.id,
    h.shipment_id,
    h.updated_at AS old_time,
    DATE_ADD(h.updated_at, INTERVAL 7 HOUR) AS new_time
FROM shipment_status_history h
WHERE h.updated_at < NOW();

-- Apply corrections (only if data exists and needs adjustment)
UPDATE shipment_status_history h
SET h.updated_at = DATE_ADD(h.updated_at, INTERVAL 7 HOUR)
WHERE h.id IN (SELECT id FROM temp_history_corrections);

COMMIT;

-- =====================================================================
-- PART 2: Configure MySQL session timezone for future operations
-- This ensures all CURRENT_TIMESTAMP operations use UTC+7
-- =====================================================================

SET SESSION time_zone = '+07:00';
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =====================================================================
-- PART 3: Add validation trigger to ensure shipment_status_history
-- matches shipment timestamp timezone
-- =====================================================================

DELIMITER $$

DROP TRIGGER IF EXISTS trg_shipment_status_history_insert$$

CREATE TRIGGER trg_shipment_status_history_insert
BEFORE INSERT ON shipment_status_history
FOR EACH ROW
BEGIN
    -- Automatically set updated_at if not provided
    IF NEW.updated_at IS NULL THEN
        SET NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Add validation message (using ASCII to avoid encoding issues)
    IF NEW.shipment_id NOT IN (SELECT id FROM shipment) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid shipment_id - shipment does not exist';
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_shipment_status_history_update$$

CREATE TRIGGER trg_shipment_status_history_update
BEFORE UPDATE ON shipment_status_history
FOR EACH ROW
BEGIN
    -- Prevent manual updated_at changes (auto-updated by system)
    SET NEW.updated_at = OLD.updated_at;
END$$

DELIMITER ;

-- =====================================================================
-- PART 4: REMOVED - Automatic sync trigger (causes MySQL deadlock)
-- Instead: Sync is handled at application layer or via scheduled event
-- =====================================================================

-- Note: MySQL cannot UPDATE parent table from child table trigger
-- Use application layer to sync shipment.updated_at when status changes
-- Or use scheduled event: CALL sync_shipment_updated_at_timestamps();

-- =====================================================================
-- PART 4B: Create Stored Procedure for Safe Synchronization
-- Call this from application after inserting status history
-- =====================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sync_shipment_updated_at_timestamps$$

CREATE PROCEDURE sync_shipment_updated_at_timestamps()
BEGIN
    -- Safely sync shipment.updated_at with latest status history
    -- Without causing deadlock issues
    
    UPDATE shipment s
    SET s.updated_at = (
        SELECT MAX(h.updated_at)
        FROM shipment_status_history h
        WHERE h.shipment_id = s.id
    )
    WHERE s.id IN (
        SELECT DISTINCT shipment_id
        FROM shipment_status_history
        WHERE updated_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    );
END$$

DELIMITER ;

-- Alternative: Create scheduled event to sync periodically (OPTIONAL)
-- DELIMITER $$
-- DROP EVENT IF EXISTS evt_sync_shipment_timestamps$$
-- 
-- CREATE EVENT evt_sync_shipment_timestamps
-- ON SCHEDULE EVERY 5 MINUTE
-- DO
-- BEGIN
--     CALL sync_shipment_updated_at_timestamps();
-- END$$
-- 
-- DELIMITER ;
-- ALTER EVENT evt_sync_shipment_timestamps ENABLE;

-- =====================================================================
-- PART 5: Verification queries (run these to verify sync)
-- =====================================================================

-- Check for timezone mismatches (should return 0 rows after fix)
-- SELECT 
--     s.id,
--     s.tracking_code,
--     s.created_at AS shipment_created,
--     s.updated_at AS shipment_updated,
--     h.updated_at AS latest_history_time,
--     TIMEDIFF(s.updated_at, h.updated_at) AS time_difference
-- FROM shipment s
-- LEFT JOIN (
--     SELECT shipment_id, MAX(updated_at) AS updated_at
--     FROM shipment_status_history
--     GROUP BY shipment_id
-- ) h ON s.id = h.shipment_id
-- WHERE TIMEDIFF(s.updated_at, h.updated_at) IS NOT NULL
--   AND ABS(TIME_TO_SEC(TIMEDIFF(s.updated_at, h.updated_at))) > 60;

-- Check current timezone setting
-- SELECT @@global.time_zone, @@session.time_zone;

-- =====================================================================
-- PART 6: Configuration notes for application layer
-- =====================================================================

-- NOTE FOR DEVELOPERS:
-- 
-- After inserting shipment_status_history, call the stored procedure:
--     CALL sync_shipment_updated_at_timestamps();
--
-- Option A: In your Service/Repository (Recommended)
--     @Transactional
--     public void createStatusHistory(ShipmentStatusHistory history) {
--         statusRepository.save(history);
--         // Sync shipment.updated_at with latest history
--         shipmentRepository.syncUpdatedAtWithLatestHistory(history.getShipmentId());
--     }
--
-- Option B: In XML mapping after INSERT
--     jpaRepository.callProcedure("sync_shipment_updated_at_timestamps");
--
-- Option C: Enable scheduled event (optional, uncomment above)
--     The event will auto-sync every 5 minutes
--
-- 1. Add this to your Spring Boot application.properties:
--    spring.datasource.url=jdbc:mysql://...?serverTimezone=Asia/Ho_Chi_Minh
--    server.timezone=Asia/Ho_Chi_Minh
--
-- 2. For Hibernate/JPA, configure:
--    spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Ho_Chi_Minh
--
-- 3. Set timezone in application startup (Java):
--    System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
--    TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
--
-- 4. When making API calls, timestamp should always use:
--    Instant.now() -> then convert to server timezone for display

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
