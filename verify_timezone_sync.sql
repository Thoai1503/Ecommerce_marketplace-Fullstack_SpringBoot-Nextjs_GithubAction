-- Verification and Testing Script for Timezone Synchronization
-- Run this script to verify timezone configuration is working correctly
-- =====================================================================

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+07:00' */;

-- =====================================================================
-- 1. VERIFY CURRENT TIMEZONE SETTINGS
-- =====================================================================

SELECT 
    'Global Timezone' AS config_type,
    @@global.time_zone AS value
UNION ALL
SELECT 
    'Session Timezone',
    @@session.time_zone

UNION ALL
SELECT 
    'System Timezone Offset',
    CONCAT(TIMEDIFF(NOW(), UTC_TIMESTAMP()), ' hours')

ORDER BY config_type;

-- =====================================================================
-- 2. CHECK FOR TIMEZONE MISMATCHES (DETAILED REPORT)
-- =====================================================================

-- This query shows all shipments with their latest status history
-- and reveals any timezone mismatches

SELECT 
    s.id AS shipment_id,
    s.tracking_code,
    s.status AS current_status,
    s.created_at AS shipment_created_at,
    s.updated_at AS shipment_updated_at,
    MAX(h.updated_at) AS latest_history_updated_at,
    COUNT(h.id) AS total_status_changes,
    -- Calculate time difference
    TIMEDIFF(s.updated_at, MAX(h.updated_at)) AS time_difference,
    -- Flag problematic records
    CASE 
        WHEN ABS(TIME_TO_SEC(TIMEDIFF(s.updated_at, MAX(h.updated_at)))) > 300 
        THEN 'MISMATCH DETECTED'
        ELSE 'OK'
    END AS sync_status
FROM shipment s
LEFT JOIN shipment_status_history h ON s.id = h.shipment_id
GROUP BY s.id, s.tracking_code, s.status, s.created_at, s.updated_at
ORDER BY 
    CASE 
        WHEN ABS(TIME_TO_SEC(TIMEDIFF(s.updated_at, MAX(h.updated_at)))) > 300 
        THEN 0
        ELSE 1
    END,
    s.id DESC;

-- =====================================================================
-- 3. IDENTIFY SHIPMENTS WITH TIMEZONE ISSUES
-- =====================================================================

SELECT 
    COUNT(*) AS total_shipments,
    SUM(CASE WHEN ABS(TIME_TO_SEC(TIMEDIFF(s.updated_at, h.latest_history))) > 300 
             THEN 1 ELSE 0 END) AS mismatched_count,
    ROUND(
        SUM(CASE WHEN ABS(TIME_TO_SEC(TIMEDIFF(s.updated_at, h.latest_history))) > 300 
                 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
        2
    ) AS mismatch_percentage
FROM shipment s
LEFT JOIN (
    SELECT shipment_id, MAX(updated_at) AS latest_history
    FROM shipment_status_history
    GROUP BY shipment_id
) h ON s.id = h.shipment_id;

-- =====================================================================
-- 4. VERIFY STORED PROCEDURE (replaces trigger approach)
-- =====================================================================

-- Check if stored procedure exists
SHOW PROCEDURE STATUS WHERE Db = DATABASE() AND Name = 'sync_shipment_updated_at_timestamps';

-- Test the stored procedure
-- CALL sync_shipment_updated_at_timestamps();

-- =====================================================================
-- 5. CHECK CONSISTENCY OF RECORDS
-- =====================================================================

-- Show shipments where history is missing or conflicting
SELECT 
    s.id AS shipment_id,
    s.tracking_code,
    s.status,
    COUNT(h.id) AS history_record_count,
    MAX(h.status) AS latest_history_status,
    CASE 
        WHEN s.status != MAX(h.status) THEN 'STATUS MISMATCH'
        WHEN COUNT(h.id) = 0 THEN 'NO HISTORY'
        ELSE 'OK'
    END AS issue
FROM shipment s
LEFT JOIN shipment_status_history h ON s.id = h.shipment_id
GROUP BY s.id, s.tracking_code, s.status
HAVING issue != 'OK'
ORDER BY s.id;

-- =====================================================================
-- 6. TIMELINE CONSISTENCY CHECK
-- =====================================================================

-- Verify that status history timeline is chronologically correct
WITH status_timeline AS (
    SELECT 
        shipment_id,
        id,
        status,
        updated_at,
        LAG(updated_at) OVER (
            PARTITION BY shipment_id 
            ORDER BY id
        ) AS prev_updated_at,
        CASE 
            WHEN LAG(updated_at) OVER (
                PARTITION BY shipment_id 
                ORDER BY id
            ) > updated_at 
            THEN 'TIMELINE ERROR'
            ELSE 'OK'
        END AS timeline_check
    FROM shipment_status_history
)
SELECT 
    shipment_id,
    COUNT(*) AS total_records,
    SUM(CASE WHEN timeline_check = 'TIMELINE ERROR' THEN 1 ELSE 0 END) AS timeline_errors
FROM status_timeline
GROUP BY shipment_id
HAVING timeline_errors > 0
ORDER BY timeline_errors DESC;

-- =====================================================================
-- 7. SAMPLE DATA VERIFICATION
-- =====================================================================

-- Show last 10 shipments with their complete history timeline
SELECT 
    s.id,
    s.tracking_code,
    s.created_at,
    h.updated_at AS history_time,
    h.status,
    h.description,
    ROW_NUMBER() OVER (
        PARTITION BY s.id 
        ORDER BY h.updated_at
    ) AS history_sequence
FROM (
    SELECT * FROM shipment ORDER BY id DESC LIMIT 10
) s
LEFT JOIN shipment_status_history h ON s.id = h.shipment_id
ORDER BY s.id DESC, h.updated_at ASC;

-- =====================================================================
-- 8. TIMESTAMP PRECISION TEST
-- =====================================================================

-- Verify timestamp precision (should be at least to seconds)
SELECT 
    'Shipment timestamps' AS table_name,
    COUNT(DISTINCT created_at) AS unique_created_at,
    COUNT(DISTINCT updated_at) AS unique_updated_at,
    COUNT(*) AS total_records
FROM shipment

UNION ALL

SELECT 
    'Status history timestamps',
    COUNT(DISTINCT DATE(updated_at)) AS unique_dates,
    COUNT(DISTINCT updated_at) AS unique_updated_at,
    COUNT(*) AS total_records
FROM shipment_status_history;

-- =====================================================================
-- 9. TEST INSERT (Create test records to verify trigger)
-- =====================================================================

-- OPTIONAL: Uncomment to test trigger functionality
-- 
-- START TRANSACTION;
-- 
-- -- Create test shipment
-- INSERT INTO shipment (
--     tracking_code, order_shipment_ref_id, shop_ref_id, partner_id, 
--     recipient_id, status, shipping_fee, cod_amount
-- ) VALUES (
--     CONCAT('TEST_', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')),
--     999,
--     1,
--     1,
--     128,
--     'PENDING',
--     9000,
--     0
-- );
-- 
-- SET @test_shipment_id = LAST_INSERT_ID();
-- 
-- -- Create status history entry for test shipment
-- INSERT INTO shipment_status_history (
--     shipment_id, status, description, updated_by
-- ) VALUES (
--     @test_shipment_id,
--     'PENDING',
--     'Test creation for timezone verification',
--     'timezone_test'
-- );
-- 
-- -- Verify the timestamps match
-- SELECT 
--     s.id,
--     s.tracking_code,
--     s.created_at,
--     h.updated_at,
--     TIMEDIFF(s.created_at, h.updated_at) AS time_diff
-- FROM shipment s
-- JOIN shipment_status_history h ON s.id = h.shipment_id
-- WHERE s.id = @test_shipment_id;
-- 
-- ROLLBACK; -- Revert test data

-- =====================================================================
-- 10. PERFORMANCE CHECK
-- =====================================================================

-- Verify indexes are in place for timezone-dependent queries
SHOW INDEX FROM shipment WHERE Column_name IN ('created_at', 'updated_at', 'status');

SHOW INDEX FROM shipment_status_history 
WHERE Column_name IN ('shipment_id', 'updated_at', 'status');

-- =====================================================================
-- SUMMARY REPORT
-- =====================================================================

PRINT 'TIMEZONE SYNCHRONIZATION VERIFICATION COMPLETE';
PRINT 'Review the results above for any issues';
PRINT 'Expected results:';
PRINT '  - Global and Session Timezone: +07:00';
PRINT '  - Mismatch percentage: 0%';
PRINT '  - Timeline errors: 0';
PRINT '  - Status mismatches: 0';

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
