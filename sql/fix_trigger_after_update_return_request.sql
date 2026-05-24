-- Fix trigger double-count on total_return_approved_amount
-- Run on target DB (ecommerce)

DROP TRIGGER IF EXISTS trg_after_update_return_request;

DELIMITER $$
CREATE TRIGGER trg_after_update_return_request
AFTER UPDATE ON return_request
FOR EACH ROW
main_block: BEGIN
    DECLARE v_open_count      INT           DEFAULT 0;
    DECLARE v_order_status    VARCHAR(50);
    DECLARE v_total_requested DECIMAL(18,2) DEFAULT 0;
    DECLARE v_total_approved  DECIMAL(18,2) DEFAULT 0;
    DECLARE v_total_refunded  DECIMAL(18,2) DEFAULT 0;

    IF NEW.status = OLD.status THEN
        LEAVE main_block;
    END IF;

    IF NEW.status = 'APPROVED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET
                return_status_summary = 'RETURN_REQUESTED',
                total_return_approved_amount = (
                    SELECT COALESCE(SUM(COALESCE(rr2.approved_amount, 0)), 0)
                    FROM return_request rr2
                    WHERE rr2.order_item_id = NEW.order_item_id
                      AND rr2.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
                )
            WHERE id = NEW.order_item_id;
        END IF;

        IF NEW.order_shipment_id IS NOT NULL THEN
            UPDATE order_shipment
            SET
                return_status_summary = 'RETURN_IN_PROGRESS',
                total_return_item_amount = (
                    SELECT COALESCE(SUM(COALESCE(rr2.approved_amount, 0)), 0)
                    FROM return_request rr2
                    WHERE rr2.order_shipment_id = NEW.order_shipment_id
                      AND rr2.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
                )
            WHERE id = NEW.order_shipment_id;
        END IF;

        UPDATE orders
        SET
            total_return_approved_amount = (
                SELECT COALESCE(SUM(COALESCE(rr2.approved_amount, 0)), 0)
                FROM return_request rr2
                WHERE rr2.order_id = NEW.order_id
                  AND rr2.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
            )
        WHERE id = NEW.order_id;

    ELSEIF NEW.status = 'SHIPPING' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET return_status_summary = 'RETURN_REQUESTED'
            WHERE id = NEW.order_item_id;
        END IF;

        IF NEW.order_shipment_id IS NOT NULL THEN
            UPDATE order_shipment
            SET return_status_summary = 'RETURN_IN_PROGRESS'
            WHERE id = NEW.order_shipment_id;
        END IF;

    ELSEIF NEW.status = 'RECEIVED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET
                returned_quantity = returned_quantity + NEW.quantity,
                return_status_summary = CASE
                    WHEN returned_quantity + NEW.quantity >= COALESCE(final_quantity, quantity)
                        THEN 'FULLY_RETURNED'
                    ELSE 'PARTIALLY_RETURNED'
                END
            WHERE id = NEW.order_item_id;
        END IF;

        IF NEW.order_shipment_id IS NOT NULL THEN
            UPDATE order_shipment
            SET return_status_summary = 'RETURN_IN_PROGRESS'
            WHERE id = NEW.order_shipment_id;
        END IF;

    ELSEIF NEW.status = 'INSPECTION_PASSED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET return_status_summary = 'REFUND_IN_PROGRESS'
            WHERE id = NEW.order_item_id;
        END IF;

        IF NEW.order_shipment_id IS NOT NULL THEN
            UPDATE order_shipment
            SET return_status_summary = 'RETURN_IN_PROGRESS'
            WHERE id = NEW.order_shipment_id;
        END IF;

    ELSEIF NEW.status = 'INSPECTION_FAILED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET return_status_summary = 'RETURN_REQUESTED'
            WHERE id = NEW.order_item_id;
        END IF;

    ELSEIF NEW.status = 'REFUNDED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET
                refunded_quantity = refunded_quantity + NEW.quantity,
                total_refunded_amount = total_refunded_amount + COALESCE(NEW.refunded_amount, 0),
                return_status_summary = CASE
                    WHEN refunded_quantity + NEW.quantity >= COALESCE(final_quantity, quantity)
                        THEN 'REFUNDED'
                    ELSE 'PARTIALLY_RETURNED'
                END
            WHERE id = NEW.order_item_id;
        END IF;

        IF NEW.order_shipment_id IS NOT NULL THEN
            SELECT COUNT(*) INTO v_open_count
            FROM return_request
            WHERE order_shipment_id = NEW.order_shipment_id
              AND id != NEW.id
              AND status NOT IN ('REFUNDED', 'REJECTED', 'CANCELLED');

            UPDATE order_shipment
            SET
                total_refunded_amount = total_refunded_amount + COALESCE(NEW.refunded_amount, 0),
                return_status_summary = IF(v_open_count = 0, 'FULL_RETURNED', 'PARTIAL_RETURNED'),
                return_completed_at = IF(v_open_count = 0, NOW(), return_completed_at)
            WHERE id = NEW.order_shipment_id;
        END IF;

        SELECT
            COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED','CANCELLED') THEN requested_amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED','CANCELLED') THEN approved_amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status = 'REFUNDED' THEN refunded_amount ELSE 0 END), 0),
            COUNT(CASE WHEN status NOT IN ('REFUNDED','REJECTED','CANCELLED') THEN 1 END)
        INTO v_total_requested, v_total_approved, v_total_refunded, v_open_count
        FROM return_request
        WHERE order_id = NEW.order_id;

        UPDATE orders
        SET
            total_return_requested_amount = v_total_requested,
            total_return_approved_amount = v_total_approved,
            total_refunded_amount = v_total_refunded,
            last_refunded_at = NOW(),
            return_status_summary = CASE
                WHEN v_open_count = 0 AND v_total_refunded > 0 THEN 'FULL_RETURNED'
                WHEN v_open_count > 0 AND v_total_refunded > 0 THEN 'PARTIAL_RETURNED'
                ELSE return_status_summary
            END
        WHERE id = NEW.order_id;

    ELSEIF NEW.status IN ('REJECTED', 'CANCELLED') THEN

        IF NEW.order_item_id IS NOT NULL THEN
            SELECT COUNT(*) INTO v_open_count
            FROM return_request
            WHERE order_item_id = NEW.order_item_id
              AND id != NEW.id
              AND status NOT IN ('REJECTED', 'CANCELLED');

            UPDATE order_item
            SET
                total_return_requested_amount = GREATEST(0, total_return_requested_amount - COALESCE(OLD.requested_amount, 0)),
                return_status_summary = IF(v_open_count = 0, 'NONE', return_status_summary),
                last_return_request_id = IF(v_open_count = 0, NULL, last_return_request_id)
            WHERE id = NEW.order_item_id;
        END IF;

        IF NEW.order_shipment_id IS NOT NULL THEN
            SELECT COUNT(*) INTO v_open_count
            FROM return_request
            WHERE order_shipment_id = NEW.order_shipment_id
              AND id != NEW.id
              AND status NOT IN ('REJECTED', 'CANCELLED');

            UPDATE order_shipment
            SET
                return_request_count = GREATEST(0, return_request_count - 1),
                total_return_item_amount = GREATEST(0, total_return_item_amount - COALESCE(OLD.requested_amount, 0)),
                return_status_summary = IF(v_open_count = 0, 'NONE', return_status_summary),
                last_return_request_id = IF(v_open_count = 0, NULL, last_return_request_id)
            WHERE id = NEW.order_shipment_id;
        END IF;

        SELECT
            COUNT(CASE WHEN status NOT IN ('REJECTED','CANCELLED') THEN 1 END),
            CASE
                WHEN COUNT(CASE WHEN status NOT IN ('REJECTED','CANCELLED') THEN 1 END) = 0 THEN 'NONE'
                WHEN COUNT(CASE WHEN status = 'REFUNDED' THEN 1 END) > 0 THEN 'PARTIAL_RETURNED'
                ELSE 'PARTIAL_RETURN_IN_PROGRESS'
            END
        INTO v_open_count, v_order_status
        FROM return_request
        WHERE order_id = NEW.order_id
          AND id != NEW.id;

        UPDATE orders
        SET
            return_request_count = GREATEST(0, return_request_count - 1),
            total_return_requested_amount = GREATEST(0, total_return_requested_amount - COALESCE(OLD.requested_amount, 0)),
            total_return_approved_amount = (
                SELECT COALESCE(SUM(COALESCE(rr2.approved_amount, 0)), 0)
                FROM return_request rr2
                WHERE rr2.order_id = NEW.order_id
                  AND rr2.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
            ),
            return_status_summary = v_order_status,
            last_return_request_id = IF(v_open_count = 0, NULL, last_return_request_id)
        WHERE id = NEW.order_id;

    END IF;

END$$
DELIMITER ;

-- Optional backfill after replacing trigger
UPDATE orders o
LEFT JOIN (
    SELECT
        rr.order_id,
        COALESCE(SUM(COALESCE(rr.approved_amount, 0)), 0) AS total_approved
    FROM return_request rr
    WHERE rr.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
    GROUP BY rr.order_id
) agg ON agg.order_id = o.id
SET o.total_return_approved_amount = COALESCE(agg.total_approved, 0)
WHERE o.id > 0;
