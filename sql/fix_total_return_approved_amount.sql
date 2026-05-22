-- Fix script: prevent orders.total_return_approved_amount from being reset to 0
-- Root cause: sp_rri_refresh_summary aggregated approved amounts from return_request_item
-- instead of return_request when triggers ran after createRefundRequestWithFiles.

-- 1) Replace procedure used by triggers
DROP PROCEDURE IF EXISTS sp_rri_refresh_summary;

DELIMITER $$
CREATE PROCEDURE sp_rri_refresh_summary(
    IN p_order_item_id BIGINT
)
main_block: BEGIN
    DECLARE v_order_id              BIGINT        DEFAULT NULL;
    DECLARE v_shipment_id           BIGINT        DEFAULT NULL;
    DECLARE v_effective_qty         INT           DEFAULT 0;

    -- item-level counters
    DECLARE v_request_count         INT           DEFAULT 0;
    DECLARE v_requested_qty         INT           DEFAULT 0;
    DECLARE v_returned_qty          INT           DEFAULT 0;
    DECLARE v_refunded_qty          INT           DEFAULT 0;
    DECLARE v_in_progress_qty       INT           DEFAULT 0;
    DECLARE v_requested_amt         DECIMAL(18,2) DEFAULT 0;
    DECLARE v_approved_amt          DECIMAL(18,2) DEFAULT 0;
    DECLARE v_refunded_amt          DECIMAL(18,2) DEFAULT 0;

    -- shipment-level counters
    DECLARE v_ship_total_qty        INT           DEFAULT 0;
    DECLARE v_ship_requested_qty    INT           DEFAULT 0;
    DECLARE v_ship_refunded_qty     INT           DEFAULT 0;
    DECLARE v_ship_in_progress_qty  INT           DEFAULT 0;

    -- order-level counters
    DECLARE v_ord_total_qty         INT           DEFAULT 0;
    DECLARE v_ord_requested_qty     INT           DEFAULT 0;
    DECLARE v_ord_refunded_qty      INT           DEFAULT 0;
    DECLARE v_ord_in_progress_qty   INT           DEFAULT 0;

    SELECT
        oi.order_id,
        oi.shipment_id,
        CASE
            WHEN oi.is_adjusted = 1 AND oi.final_quantity IS NOT NULL
                THEN GREATEST(oi.final_quantity, 0)
            ELSE GREATEST(oi.quantity, 0)
        END
    INTO v_order_id, v_shipment_id, v_effective_qty
    FROM order_item oi
    WHERE oi.id = p_order_item_id
    LIMIT 1;

    IF v_order_id IS NULL THEN
        LEAVE main_block;
    END IF;

    -- Step 1: recalc order_item from return_request_item lines
    SELECT
        COUNT(DISTINCT rr.id),
        COALESCE(SUM(rri.quantity), 0),
        COALESCE(SUM(CASE WHEN rr.status IN ('RECEIVED', 'INSPECTION_PASSED', 'REFUNDED') THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED' THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN rr.status IN ('PENDING_APPROVAL', 'APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED') THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(COALESCE(rri.requested_amount, 0)), 0),
        COALESCE(SUM(COALESCE(rri.approved_amount, 0)), 0),
        COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED' THEN COALESCE(rri.refunded_amount, 0) ELSE 0 END), 0)
    INTO
        v_request_count,
        v_requested_qty,
        v_returned_qty,
        v_refunded_qty,
        v_in_progress_qty,
        v_requested_amt,
        v_approved_amt,
        v_refunded_amt
    FROM return_request_item rri
    JOIN return_request rr ON rr.id = rri.return_request_id
    WHERE rri.order_item_id = p_order_item_id;

    UPDATE order_item
    SET
        return_status_summary         = CASE
            WHEN v_request_count = 0 THEN 'NONE'
            WHEN v_in_progress_qty > 0 AND (v_refunded_qty + v_in_progress_qty) >= v_effective_qty AND v_effective_qty > 0 THEN 'REFUND_IN_PROGRESS'
            WHEN v_in_progress_qty > 0 THEN 'RETURN_REQUESTED'
            WHEN v_refunded_qty >= v_effective_qty AND v_effective_qty > 0 THEN 'REFUNDED'
            WHEN v_refunded_qty > 0 THEN 'PARTIALLY_RETURNED'
            ELSE 'NONE'
        END,
        returnable_quantity           = GREATEST(v_effective_qty - v_refunded_qty, 0),
        returned_quantity             = v_returned_qty,
        refunded_quantity             = v_refunded_qty,
        total_return_requested_amount = v_requested_amt,
        total_return_approved_amount  = v_approved_amt,
        total_refunded_amount         = v_refunded_amt,
        last_return_request_id        = (
            SELECT MAX(rr2.id)
            FROM return_request_item rri2
            JOIN return_request rr2 ON rr2.id = rri2.return_request_id
            WHERE rri2.order_item_id = p_order_item_id
        )
    WHERE id = p_order_item_id;

    -- Step 2: recalc order_shipment
    IF v_shipment_id IS NOT NULL THEN

        SELECT
            COALESCE(SUM(CASE
                WHEN oi2.is_adjusted = 1 AND oi2.final_quantity IS NOT NULL THEN GREATEST(oi2.final_quantity, 0)
                ELSE GREATEST(oi2.quantity, 0)
            END), 0)
        INTO v_ship_total_qty
        FROM order_item oi2
        WHERE oi2.shipment_id = v_shipment_id;

        SELECT
            COALESCE(SUM(rri.quantity), 0),
            COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED' THEN rri.quantity ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN rr.status IN ('PENDING_APPROVAL', 'APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED') THEN rri.quantity ELSE 0 END), 0)
        INTO v_ship_requested_qty, v_ship_refunded_qty, v_ship_in_progress_qty
        FROM return_request_item rri
        JOIN return_request rr ON rr.id = rri.return_request_id
        JOIN order_item oi2 ON oi2.id = rri.order_item_id
        WHERE oi2.shipment_id = v_shipment_id;

        UPDATE order_shipment
        SET
            return_status_summary    = CASE
                WHEN v_ship_requested_qty = 0 THEN 'NONE'
                WHEN v_ship_in_progress_qty > 0 THEN 'RETURN_IN_PROGRESS'
                WHEN v_ship_refunded_qty >= v_ship_total_qty AND v_ship_total_qty > 0 THEN 'FULL_RETURNED'
                WHEN v_ship_refunded_qty > 0 THEN 'PARTIAL_RETURNED'
                ELSE 'NONE'
            END,
            return_request_count     = (
                SELECT COUNT(DISTINCT rr2.id)
                FROM return_request rr2
                WHERE rr2.order_shipment_id = v_shipment_id
            ),
            -- IMPORTANT FIX: aggregate approved from return_request, not return_request_item
            total_return_item_amount = (
                SELECT COALESCE(SUM(COALESCE(rr2.approved_amount, 0)), 0)
                FROM return_request rr2
                WHERE rr2.order_shipment_id = v_shipment_id
                  AND rr2.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
            ),
            total_refunded_amount    = (
                SELECT COALESCE(SUM(COALESCE(rri2.refunded_amount, 0)), 0)
                FROM return_request_item rri2
                JOIN return_request rr2 ON rr2.id = rri2.return_request_id
                JOIN order_item oi2 ON oi2.id = rri2.order_item_id
                WHERE oi2.shipment_id = v_shipment_id
                  AND rr2.status = 'REFUNDED'
            ),
            last_return_request_id   = (
                SELECT MAX(rr2.id)
                FROM return_request rr2
                WHERE rr2.order_shipment_id = v_shipment_id
            ),
            return_completed_at      = (
                SELECT MAX(rr2.updated_at)
                FROM return_request rr2
                WHERE rr2.order_shipment_id = v_shipment_id
                  AND rr2.status = 'REFUNDED'
            )
        WHERE id = v_shipment_id;

    END IF;

    -- Step 3: recalc orders
    SELECT
        COALESCE(SUM(CASE
            WHEN oi3.is_adjusted = 1 AND oi3.final_quantity IS NOT NULL THEN GREATEST(oi3.final_quantity, 0)
            ELSE GREATEST(oi3.quantity, 0)
        END), 0)
    INTO v_ord_total_qty
    FROM order_item oi3
    WHERE oi3.order_id = v_order_id;

    SELECT
        COALESCE(SUM(rri.quantity), 0),
        COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED' THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN rr.status IN ('PENDING_APPROVAL', 'APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED') THEN rri.quantity ELSE 0 END), 0)
    INTO v_ord_requested_qty, v_ord_refunded_qty, v_ord_in_progress_qty
    FROM return_request_item rri
    JOIN return_request rr ON rr.id = rri.return_request_id
    JOIN order_item oi3 ON oi3.id = rri.order_item_id
    WHERE oi3.order_id = v_order_id;

    UPDATE orders
    SET
        return_status_summary         = CASE
            WHEN v_ord_requested_qty = 0 THEN 'NONE'
            WHEN v_ord_in_progress_qty > 0 AND (v_ord_refunded_qty + v_ord_in_progress_qty) >= v_ord_total_qty AND v_ord_total_qty > 0 THEN 'FULL_RETURN_IN_PROGRESS'
            WHEN v_ord_in_progress_qty > 0 THEN 'PARTIAL_RETURN_IN_PROGRESS'
            WHEN v_ord_refunded_qty >= v_ord_total_qty AND v_ord_total_qty > 0 THEN 'FULL_RETURNED'
            WHEN v_ord_refunded_qty > 0 THEN 'PARTIAL_RETURNED'
            ELSE 'NONE'
        END,
        return_request_count          = (
            SELECT COUNT(DISTINCT rr2.id)
            FROM return_request rr2
            WHERE rr2.order_id = v_order_id
        ),
        total_return_requested_amount = (
            SELECT COALESCE(SUM(COALESCE(rri2.requested_amount, 0)), 0)
            FROM return_request_item rri2
            JOIN return_request rr2 ON rr2.id = rri2.return_request_id
            JOIN order_item oi2 ON oi2.id = rri2.order_item_id
            WHERE oi2.order_id = v_order_id
        ),
        -- IMPORTANT FIX: aggregate approved from return_request, not return_request_item
        total_return_approved_amount  = (
            SELECT COALESCE(SUM(COALESCE(rr2.approved_amount, 0)), 0)
            FROM return_request rr2
            WHERE rr2.order_id = v_order_id
              AND rr2.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
        ),
        total_refunded_amount         = (
            SELECT COALESCE(SUM(COALESCE(rri2.refunded_amount, 0)), 0)
            FROM return_request_item rri2
            JOIN return_request rr2 ON rr2.id = rri2.return_request_id
            JOIN order_item oi2 ON oi2.id = rri2.order_item_id
            WHERE oi2.order_id = v_order_id
              AND rr2.status = 'REFUNDED'
        ),
        last_return_request_id        = (
            SELECT MAX(rr2.id)
            FROM return_request rr2
            WHERE rr2.order_id = v_order_id
        ),
        last_refunded_at              = (
            SELECT MAX(rr2.updated_at)
            FROM return_request rr2
            WHERE rr2.order_id = v_order_id
              AND rr2.status = 'REFUNDED'
        )
    WHERE id = v_order_id;

END $$
DELIMITER ;

-- 2) Backfill existing wrong values in orders (safe-update compatible)
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

-- 3) Optional: backfill shipment approved amounts as well (safe-update compatible)
UPDATE order_shipment os
LEFT JOIN (
    SELECT
        rr.order_shipment_id,
        COALESCE(SUM(COALESCE(rr.approved_amount, 0)), 0) AS total_approved
    FROM return_request rr
    WHERE rr.status IN ('APPROVED', 'SHIPPING', 'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
      AND rr.order_shipment_id IS NOT NULL
    GROUP BY rr.order_shipment_id
) agg ON agg.order_shipment_id = os.id
SET os.total_return_item_amount = COALESCE(agg.total_approved, 0)
WHERE os.id > 0;
