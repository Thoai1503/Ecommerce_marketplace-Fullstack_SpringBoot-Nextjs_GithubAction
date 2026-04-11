USE logistic_service;

-- Remove only the triggers that create recursive shipment update path.
DROP TRIGGER IF EXISTS trg_shipment_after_insert_status_history;
DROP TRIGGER IF EXISTS trg_shipment_after_update_status_history;

-- Keep workflow validation + functions.
-- Ensure these still exist (recreate safely).
DROP TRIGGER IF EXISTS trg_shipment_before_update_status;
DROP FUNCTION IF EXISTS fn_shipment_delivery_failed_toggle_count;
DROP FUNCTION IF EXISTS fn_shipment_status_step;

DELIMITER $$

CREATE FUNCTION fn_shipment_status_step(p_status VARCHAR(50))
RETURNS INT
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
END$$

CREATE FUNCTION fn_shipment_delivery_failed_toggle_count(p_shipment_id BIGINT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_toggle_count INT DEFAULT 0;

    SELECT GREATEST(COUNT(*) - 1, 0)
    INTO v_toggle_count
    FROM shipment_status_history
    WHERE shipment_id = p_shipment_id
      AND status IN ('DELIVERED', 'FAILED');

    RETURN v_toggle_count;
END$$

CREATE TRIGGER trg_shipment_before_update_status
BEFORE UPDATE ON shipment
FOR EACH ROW
BEGIN
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
END$$

DELIMITER ;

-- Verify final trigger state.
SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE, TRIGGER_EVENT, TRIGGER_TIME
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = 'logistic_service'
  AND TRIGGER_NAME IN (
    'trg_shipment_after_insert_status_history',
    'trg_shipment_after_update_status_history',
    'trg_shipment_before_update_status',
    'trg_shipment_auto_sync_updated_at'
  )
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;
