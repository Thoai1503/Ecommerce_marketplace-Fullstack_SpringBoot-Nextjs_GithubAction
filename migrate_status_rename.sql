-- Migration: rename old enum values SHIPPING -> IN_TRANSIT, DELIVERING -> OUT_FOR_DELIVERY
-- Run this ONCE in MySQL to fix existing rows that were saved by the old Java enum.

USE logistic_service;

-- Temporarily disable trigger so the migration bypasses workflow enforcement
SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- 1. Migrate shipment table
UPDATE shipment SET status = 'IN_TRANSIT'       WHERE status = 'SHIPPING';
UPDATE shipment SET status = 'OUT_FOR_DELIVERY'  WHERE status = 'DELIVERING';

-- 2. Migrate history table (so history records are also consistent)
UPDATE shipment_status_history SET status = 'IN_TRANSIT'       WHERE status = 'SHIPPING';
UPDATE shipment_status_history SET status = 'OUT_FOR_DELIVERY'  WHERE status = 'DELIVERING';

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- Verify: should return 0 rows each
SELECT COUNT(*) AS remaining_SHIPPING   FROM shipment WHERE status = 'SHIPPING';
SELECT COUNT(*) AS remaining_DELIVERING FROM shipment WHERE status = 'DELIVERING';
