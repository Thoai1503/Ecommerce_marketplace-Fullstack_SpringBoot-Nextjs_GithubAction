-- ============================================================
-- TRIGGERS: Đồng bộ orders, order_item, order_shipment
--           khi có thay đổi trong bảng return_request
--
-- Bảng nguồn : return_request
-- Bảng đích  : orders | order_item | order_shipment
-- ============================================================

DELIMITER ;;

-- ============================================================
-- TRIGGER 1: AFTER INSERT
-- Kích hoạt khi customer tạo một return request mới
-- Cập nhật: +count, +requested_amount, last_id, return_status_summary
-- ============================================================

DROP TRIGGER IF EXISTS trg_after_insert_return_request;;

CREATE TRIGGER trg_after_insert_return_request
AFTER INSERT ON return_request
FOR EACH ROW
BEGIN

    -- ----------------------------------------------------------
    -- 1. Cập nhật order_item (nếu return request gắn với 1 item)
    -- ----------------------------------------------------------
    IF NEW.order_item_id IS NOT NULL THEN
        UPDATE order_item
        SET
            return_status_summary         = 'RETURN_REQUESTED',
            total_return_requested_amount = total_return_requested_amount
                                            + COALESCE(NEW.requested_amount, 0),
            last_return_request_id        = NEW.id
        WHERE id = NEW.order_item_id;
    END IF;

    -- ----------------------------------------------------------
    -- 2. Cập nhật order_shipment (nếu return request gắn với shipment)
    -- ----------------------------------------------------------
    IF NEW.order_shipment_id IS NOT NULL THEN
        UPDATE order_shipment
        SET
            return_status_summary    = 'RETURN_IN_PROGRESS',
            return_request_count     = return_request_count + 1,
            total_return_item_amount = total_return_item_amount
                                       + COALESCE(NEW.requested_amount, 0),
            last_return_request_id   = NEW.id
        WHERE id = NEW.order_shipment_id;
    END IF;

    -- ----------------------------------------------------------
    -- 3. Cập nhật orders
    -- ----------------------------------------------------------
    UPDATE orders
    SET
        return_request_count          = return_request_count + 1,
        total_return_requested_amount = total_return_requested_amount
                                        + COALESCE(NEW.requested_amount, 0),
        last_return_request_id        = NEW.id,
        return_status_summary         = CASE
            WHEN return_status_summary = 'NONE'
                THEN 'PARTIAL_RETURN_IN_PROGRESS'
            WHEN return_status_summary IN (
                    'PARTIAL_RETURNED', 'PARTIAL_RETURN_IN_PROGRESS')
                THEN 'PARTIAL_RETURN_IN_PROGRESS'
            WHEN return_status_summary IN (
                    'FULL_RETURNED', 'FULL_RETURN_IN_PROGRESS')
                THEN 'FULL_RETURN_IN_PROGRESS'
            ELSE 'PARTIAL_RETURN_IN_PROGRESS'
        END
    WHERE id = NEW.order_id;

END;;


-- ============================================================
-- TRIGGER 2: AFTER UPDATE
-- Kích hoạt khi status của return request thay đổi
--
-- Trường hợp xử lý:
--   APPROVED          → cập nhật approved_amount
--   RECEIVED          → cập nhật returned_quantity
--   INSPECTION_PASSED → chuyển item sang REFUND_IN_PROGRESS
--   REFUNDED          → cập nhật refunded_amount, tổng kết đơn
--   REJECTED/CANCELLED→ rollback các số liệu đã cộng lúc INSERT
-- ============================================================

DROP TRIGGER IF EXISTS trg_after_update_return_request;;

CREATE TRIGGER trg_after_update_return_request
AFTER UPDATE ON return_request
FOR EACH ROW
BEGIN
    DECLARE v_open_count     INT      DEFAULT 0;
    DECLARE v_order_status   VARCHAR(50);
    DECLARE v_total_requested DECIMAL(18,2) DEFAULT 0;
    DECLARE v_total_approved  DECIMAL(18,2) DEFAULT 0;
    DECLARE v_total_refunded  DECIMAL(18,2) DEFAULT 0;

    -- Chỉ xử lý khi status thực sự thay đổi
    IF NEW.status = OLD.status THEN
        LEAVE;
    END IF;

    -- ==========================================================
    -- CASE 1: APPROVED – shop chấp thuận yêu cầu trả hàng
    -- ==========================================================
    IF NEW.status = 'APPROVED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET
                return_status_summary        = 'RETURN_REQUESTED',
                total_return_approved_amount = total_return_approved_amount
                                               + COALESCE(NEW.approved_amount, 0)
            WHERE id = NEW.order_item_id;
        END IF;

        IF NEW.order_shipment_id IS NOT NULL THEN
            UPDATE order_shipment
            SET
                return_status_summary    = 'RETURN_IN_PROGRESS',
                total_return_item_amount = total_return_item_amount
                                           + COALESCE(NEW.approved_amount, 0)
                                           - COALESCE(OLD.approved_amount, 0)
            WHERE id = NEW.order_shipment_id;
        END IF;

        UPDATE orders
        SET
            total_return_approved_amount = total_return_approved_amount
                                           + COALESCE(NEW.approved_amount, 0)
        WHERE id = NEW.order_id;

    -- ==========================================================
    -- CASE 2: SHIPPING – hàng đang trên đường về kho seller
    -- ==========================================================
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

    -- ==========================================================
    -- CASE 3: RECEIVED – seller nhận được hàng trả về
    -- ==========================================================
    ELSEIF NEW.status = 'RECEIVED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET
                returned_quantity     = returned_quantity + NEW.quantity,
                return_status_summary = CASE
                    WHEN returned_quantity + NEW.quantity
                         >= COALESCE(final_quantity, quantity)
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

    -- ==========================================================
    -- CASE 4: INSPECTION_PASSED – hàng kiểm tra đạt, chờ hoàn tiền
    -- ==========================================================
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

    -- ==========================================================
    -- CASE 5: INSPECTION_FAILED – hàng không đạt, không hoàn tiền
    -- ==========================================================
    ELSEIF NEW.status = 'INSPECTION_FAILED' THEN

        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET return_status_summary = 'RETURN_REQUESTED'
            WHERE id = NEW.order_item_id;
        END IF;

    -- ==========================================================
    -- CASE 6: REFUNDED – đã hoàn tiền thành công
    -- ==========================================================
    ELSEIF NEW.status = 'REFUNDED' THEN

        -- Cập nhật order_item
        IF NEW.order_item_id IS NOT NULL THEN
            UPDATE order_item
            SET
                refunded_quantity     = refunded_quantity + NEW.quantity,
                total_refunded_amount = total_refunded_amount
                                        + COALESCE(NEW.refunded_amount, 0),
                return_status_summary = CASE
                    WHEN refunded_quantity + NEW.quantity
                         >= COALESCE(final_quantity, quantity)
                        THEN 'REFUNDED'
                    ELSE 'PARTIALLY_RETURNED'
                END
            WHERE id = NEW.order_item_id;
        END IF;

        -- Cập nhật order_shipment
        IF NEW.order_shipment_id IS NOT NULL THEN
            -- Đếm số return_request trong shipment này còn đang xử lý
            SELECT COUNT(*) INTO v_open_count
            FROM return_request
            WHERE order_shipment_id = NEW.order_shipment_id
              AND id               != NEW.id
              AND status NOT IN ('REFUNDED', 'REJECTED', 'CANCELLED');

            UPDATE order_shipment
            SET
                total_refunded_amount = total_refunded_amount
                                        + COALESCE(NEW.refunded_amount, 0),
                return_status_summary = IF(v_open_count = 0,
                                           'FULL_RETURNED',
                                           'PARTIAL_RETURNED'),
                return_completed_at   = IF(v_open_count = 0,
                                           NOW(),
                                           return_completed_at)
            WHERE id = NEW.order_shipment_id;
        END IF;

        -- Tổng hợp lại số liệu orders từ tất cả return_request của đơn hàng
        SELECT
            COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED','CANCELLED')
                              THEN requested_amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status NOT IN ('REJECTED','CANCELLED')
                              THEN approved_amount  ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status = 'REFUNDED'
                              THEN refunded_amount  ELSE 0 END), 0),
            COUNT(CASE WHEN status NOT IN ('REFUNDED','REJECTED','CANCELLED')
                       THEN 1 END)
        INTO
            v_total_requested, v_total_approved,
            v_total_refunded,  v_open_count
        FROM return_request
        WHERE order_id = NEW.order_id;

        UPDATE orders
        SET
            total_return_requested_amount = v_total_requested,
            total_return_approved_amount  = v_total_approved,
            total_refunded_amount         = v_total_refunded,
            last_refunded_at              = NOW(),
            return_status_summary         = CASE
                WHEN v_open_count = 0 AND v_total_refunded > 0
                    THEN 'FULL_RETURNED'
                WHEN v_open_count > 0 AND v_total_refunded > 0
                    THEN 'PARTIAL_RETURNED'
                ELSE return_status_summary
            END
        WHERE id = NEW.order_id;

    -- ==========================================================
    -- CASE 7: REJECTED hoặc CANCELLED – rollback số liệu
    -- ==========================================================
    ELSEIF NEW.status IN ('REJECTED', 'CANCELLED') THEN

        -- Rollback order_item
        IF NEW.order_item_id IS NOT NULL THEN
            -- Đếm xem còn request nào active không (trừ cái vừa bị reject/cancel)
            SELECT COUNT(*) INTO v_open_count
            FROM return_request
            WHERE order_item_id = NEW.order_item_id
              AND id            != NEW.id
              AND status NOT IN ('REJECTED', 'CANCELLED');

            UPDATE order_item
            SET
                total_return_requested_amount = GREATEST(0,
                    total_return_requested_amount
                    - COALESCE(OLD.requested_amount, 0)),
                return_status_summary         = IF(v_open_count = 0,
                                                   'NONE',
                                                   return_status_summary),
                last_return_request_id        = IF(v_open_count = 0,
                                                   NULL,
                                                   last_return_request_id)
            WHERE id = NEW.order_item_id;
        END IF;

        -- Rollback order_shipment
        IF NEW.order_shipment_id IS NOT NULL THEN
            SELECT COUNT(*) INTO v_open_count
            FROM return_request
            WHERE order_shipment_id = NEW.order_shipment_id
              AND id                != NEW.id
              AND status NOT IN ('REJECTED', 'CANCELLED');

            UPDATE order_shipment
            SET
                return_request_count    = GREATEST(0, return_request_count - 1),
                total_return_item_amount = GREATEST(0,
                    total_return_item_amount
                    - COALESCE(OLD.requested_amount, 0)),
                return_status_summary   = IF(v_open_count = 0,
                                             'NONE',
                                             return_status_summary),
                last_return_request_id  = IF(v_open_count = 0,
                                             NULL,
                                             last_return_request_id)
            WHERE id = NEW.order_shipment_id;
        END IF;

        -- Rollback orders
        -- Tính lại return_status_summary dựa trên các request còn lại
        SELECT
            COUNT(CASE WHEN status NOT IN ('REJECTED','CANCELLED') THEN 1 END),
            CASE
                WHEN COUNT(CASE WHEN status NOT IN ('REJECTED','CANCELLED') THEN 1 END) = 0
                    THEN 'NONE'
                WHEN COUNT(CASE WHEN status = 'REFUNDED' THEN 1 END) > 0
                    THEN 'PARTIAL_RETURNED'
                ELSE 'PARTIAL_RETURN_IN_PROGRESS'
            END
        INTO v_open_count, v_order_status
        FROM return_request
        WHERE order_id = NEW.order_id
          AND id       != NEW.id;

        UPDATE orders
        SET
            return_request_count          = GREATEST(0,
                                                return_request_count - 1),
            total_return_requested_amount = GREATEST(0,
                                                total_return_requested_amount
                                                - COALESCE(OLD.requested_amount, 0)),
            return_status_summary         = v_order_status,
            last_return_request_id        = IF(v_open_count = 0,
                                               NULL,
                                               last_return_request_id)
        WHERE id = NEW.order_id;

    END IF;

END;;

DELIMITER ;


-- ============================================================
-- PHẦN 2: TRIGGERS CHO BẢNG return_request_item
--
-- Bảng nguồn : return_request_item
-- Bảng đích  : order_item | order_shipment | orders
--
-- Chiến lược : Dùng stored procedure để tính lại từ đầu
--              (recalculate approach), tránh số liệu bị drift
--              khi có nhiều item lines trong cùng 1 request.
--
-- Trigger list:
--   BEFORE INSERT  → validate scope (order / shipment khớp)
--   BEFORE UPDATE  → validate scope
--   AFTER  INSERT  → refresh summary cho item, shipment, order
--   AFTER  UPDATE  → refresh cả old & new item nếu key thay đổi
--   AFTER  DELETE  → refresh summary sau khi xoá item line
-- ============================================================









DELIMITER ;;

-- ============================================================
-- STORED PROCEDURE: sp_rri_refresh_summary
-- Tính lại toàn bộ summary cho 1 order_item cụ thể,
-- sau đó lan truyền lên order_shipment và orders.
-- ============================================================

DROP PROCEDURE IF EXISTS sp_rri_refresh_summary;;

CREATE PROCEDURE sp_rri_refresh_summary(
    IN p_order_item_id BIGINT
)
BEGIN
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

    -- --------------------------------------------------------
    -- Lấy thông tin cơ bản của order_item
    -- --------------------------------------------------------
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
        LEAVE BEGIN;
    END IF;

    -- --------------------------------------------------------
    -- BƯỚC 1: Tính lại order_item từ return_request_item lines
    -- --------------------------------------------------------
    SELECT
        COUNT(DISTINCT rr.id),
        COALESCE(SUM(rri.quantity), 0),
        COALESCE(SUM(CASE WHEN rr.status IN (
            'RECEIVED', 'INSPECTION_PASSED', 'REFUNDED')
            THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED'
            THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN rr.status IN (
            'PENDING_APPROVAL', 'APPROVED', 'SHIPPING',
            'RECEIVED', 'INSPECTION_PASSED')
            THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(COALESCE(rri.requested_amount, 0)), 0),
        COALESCE(SUM(COALESCE(rri.approved_amount,  0)), 0),
        COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED'
            THEN COALESCE(rri.refunded_amount, 0) ELSE 0 END), 0)
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
    WHERE rri.order_item_id = p_order_item_id;;

    UPDATE order_item
    SET
        return_status_summary         = CASE
            WHEN v_request_count = 0
                THEN 'NONE'
            WHEN v_in_progress_qty > 0
                 AND (v_refunded_qty + v_in_progress_qty) >= v_effective_qty
                 AND v_effective_qty > 0
                THEN 'REFUND_IN_PROGRESS'
            WHEN v_in_progress_qty > 0
                THEN 'RETURN_REQUESTED'
            WHEN v_refunded_qty >= v_effective_qty AND v_effective_qty > 0
                THEN 'REFUNDED'
            WHEN v_refunded_qty > 0
                THEN 'PARTIALLY_RETURNED'
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
    WHERE id = p_order_item_id;;

    -- --------------------------------------------------------
    -- BƯỚC 2: Tính lại order_shipment từ tất cả item trong shipment
    -- --------------------------------------------------------
    IF v_shipment_id IS NOT NULL THEN

        SELECT
            COALESCE(SUM(CASE
                WHEN oi2.is_adjusted = 1 AND oi2.final_quantity IS NOT NULL
                    THEN GREATEST(oi2.final_quantity, 0)
                ELSE GREATEST(oi2.quantity, 0)
            END), 0)
        INTO v_ship_total_qty
        FROM order_item oi2
        WHERE oi2.shipment_id = v_shipment_id;;

        SELECT
            COALESCE(SUM(rri.quantity), 0),
            COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED'
                THEN rri.quantity ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN rr.status IN (
                'PENDING_APPROVAL', 'APPROVED', 'SHIPPING',
                'RECEIVED', 'INSPECTION_PASSED')
                THEN rri.quantity ELSE 0 END), 0)
        INTO v_ship_requested_qty, v_ship_refunded_qty, v_ship_in_progress_qty
        FROM return_request_item rri
        JOIN return_request rr ON rr.id = rri.return_request_id
        JOIN order_item oi2     ON oi2.id = rri.order_item_id
        WHERE oi2.shipment_id = v_shipment_id;;

        UPDATE order_shipment
        SET
            return_status_summary    = CASE
                WHEN v_ship_requested_qty = 0
                    THEN 'NONE'
                WHEN v_ship_in_progress_qty > 0
                    THEN 'RETURN_IN_PROGRESS'
                WHEN v_ship_refunded_qty >= v_ship_total_qty
                     AND v_ship_total_qty > 0
                    THEN 'FULL_RETURNED'
                WHEN v_ship_refunded_qty > 0
                    THEN 'PARTIAL_RETURNED'
                ELSE 'NONE'
            END,
            return_request_count     = (
                SELECT COUNT(DISTINCT rr2.id)
                FROM return_request rr2
                WHERE rr2.order_shipment_id = v_shipment_id
            ),
            total_return_item_amount = (
                SELECT COALESCE(SUM(COALESCE(rri2.approved_amount, 0)), 0)
                FROM return_request_item rri2
                JOIN return_request rr2 ON rr2.id = rri2.return_request_id
                JOIN order_item oi2      ON oi2.id = rri2.order_item_id
                WHERE oi2.shipment_id = v_shipment_id
            ),
            total_refunded_amount    = (
                SELECT COALESCE(SUM(COALESCE(rri2.refunded_amount, 0)), 0)
                FROM return_request_item rri2
                JOIN return_request rr2 ON rr2.id = rri2.return_request_id
                JOIN order_item oi2      ON oi2.id = rri2.order_item_id
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
        WHERE id = v_shipment_id;;

    END IF;;

    -- --------------------------------------------------------
    -- BƯỚC 3: Tính lại orders từ tất cả return_request_item của đơn
    -- --------------------------------------------------------
    SELECT
        COALESCE(SUM(CASE
            WHEN oi3.is_adjusted = 1 AND oi3.final_quantity IS NOT NULL
                THEN GREATEST(oi3.final_quantity, 0)
            ELSE GREATEST(oi3.quantity, 0)
        END), 0)
    INTO v_ord_total_qty
    FROM order_item oi3
    WHERE oi3.order_id = v_order_id;;

    SELECT
        COALESCE(SUM(rri.quantity), 0),
        COALESCE(SUM(CASE WHEN rr.status = 'REFUNDED'
            THEN rri.quantity ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN rr.status IN (
            'PENDING_APPROVAL', 'APPROVED', 'SHIPPING',
            'RECEIVED', 'INSPECTION_PASSED')
            THEN rri.quantity ELSE 0 END), 0)
    INTO v_ord_requested_qty, v_ord_refunded_qty, v_ord_in_progress_qty
    FROM return_request_item rri
    JOIN return_request rr ON rr.id = rri.return_request_id
    JOIN order_item oi3     ON oi3.id = rri.order_item_id
    WHERE oi3.order_id = v_order_id;;

    UPDATE orders
    SET
        return_status_summary         = CASE
            WHEN v_ord_requested_qty = 0
                THEN 'NONE'
            WHEN v_ord_in_progress_qty > 0
                 AND (v_ord_refunded_qty + v_ord_in_progress_qty) >= v_ord_total_qty
                 AND v_ord_total_qty > 0
                THEN 'FULL_RETURN_IN_PROGRESS'
            WHEN v_ord_in_progress_qty > 0
                THEN 'PARTIAL_RETURN_IN_PROGRESS'
            WHEN v_ord_refunded_qty >= v_ord_total_qty AND v_ord_total_qty > 0
                THEN 'FULL_RETURNED'
            WHEN v_ord_refunded_qty > 0
                THEN 'PARTIAL_RETURNED'
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
            JOIN order_item oi2      ON oi2.id = rri2.order_item_id
            WHERE oi2.order_id = v_order_id
        ),
        total_return_approved_amount  = (
            SELECT COALESCE(SUM(COALESCE(rri2.approved_amount, 0)), 0)
            FROM return_request_item rri2
            JOIN return_request rr2 ON rr2.id = rri2.return_request_id
            JOIN order_item oi2      ON oi2.id = rri2.order_item_id
            WHERE oi2.order_id = v_order_id
        ),
        total_refunded_amount         = (
            SELECT COALESCE(SUM(COALESCE(rri2.refunded_amount, 0)), 0)
            FROM return_request_item rri2
            JOIN return_request rr2 ON rr2.id = rri2.return_request_id
            JOIN order_item oi2      ON oi2.id = rri2.order_item_id
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
    WHERE id = v_order_id;;

END;;


-- ============================================================
-- TRIGGER 3: BEFORE INSERT trên return_request_item
-- Validate: order_item_id phải thuộc cùng order_id và
--           order_shipment_id với return_request cha
-- ============================================================

DROP TRIGGER IF EXISTS trg_rri_before_insert_validate;;

CREATE TRIGGER trg_rri_before_insert_validate
BEFORE INSERT ON return_request_item
FOR EACH ROW
BEGIN
    DECLARE v_rr_order_id    BIGINT DEFAULT NULL;
    DECLARE v_rr_shipment_id BIGINT DEFAULT NULL;
    DECLARE v_item_order_id  BIGINT DEFAULT NULL;
    DECLARE v_item_shipment  BIGINT DEFAULT NULL;

    SELECT rr.order_id, rr.order_shipment_id
    INTO v_rr_order_id, v_rr_shipment_id
    FROM return_request rr
    WHERE rr.id = NEW.return_request_id
    LIMIT 1;

    SELECT oi.order_id, oi.shipment_id
    INTO v_item_order_id, v_item_shipment
    FROM order_item oi
    WHERE oi.id = NEW.order_item_id
    LIMIT 1;

    IF v_rr_order_id IS NULL OR v_item_order_id IS NULL
       OR v_rr_order_id <> v_item_order_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT =
                'return_request_item: order_item_id must belong to the same order as return_request';
    END IF;

    IF v_rr_shipment_id IS NOT NULL
       AND (v_item_shipment IS NULL OR v_rr_shipment_id <> v_item_shipment) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT =
                'return_request_item: order_item_id must belong to return_request.order_shipment_id';
    END IF;
END;;


-- ============================================================
-- TRIGGER 4: BEFORE UPDATE trên return_request_item
-- Validate scope khi order_item_id hoặc return_request_id thay đổi
-- ============================================================

DROP TRIGGER IF EXISTS trg_rri_before_update_validate;;

CREATE TRIGGER trg_rri_before_update_validate
BEFORE UPDATE ON return_request_item
FOR EACH ROW
BEGIN
    DECLARE v_rr_order_id    BIGINT DEFAULT NULL;
    DECLARE v_rr_shipment_id BIGINT DEFAULT NULL;
    DECLARE v_item_order_id  BIGINT DEFAULT NULL;
    DECLARE v_item_shipment  BIGINT DEFAULT NULL;

    -- Chỉ validate nếu có thay đổi key fields
    IF NEW.return_request_id <> OLD.return_request_id
       OR NEW.order_item_id  <> OLD.order_item_id THEN

        SELECT rr.order_id, rr.order_shipment_id
        INTO v_rr_order_id, v_rr_shipment_id
        FROM return_request rr
        WHERE rr.id = NEW.return_request_id
        LIMIT 1;

        SELECT oi.order_id, oi.shipment_id
        INTO v_item_order_id, v_item_shipment
        FROM order_item oi
        WHERE oi.id = NEW.order_item_id
        LIMIT 1;

        IF v_rr_order_id IS NULL OR v_item_order_id IS NULL
           OR v_rr_order_id <> v_item_order_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT =
                    'return_request_item: order_item_id must belong to the same order as return_request';
        END IF;

        IF v_rr_shipment_id IS NOT NULL
           AND (v_item_shipment IS NULL OR v_rr_shipment_id <> v_item_shipment) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT =
                    'return_request_item: order_item_id must belong to return_request.order_shipment_id';
        END IF;

    END IF;
END;;


-- ============================================================
-- TRIGGER 5: AFTER INSERT trên return_request_item
-- Khi thêm 1 item line mới vào return request → refresh summary
-- ============================================================

DROP TRIGGER IF EXISTS trg_rri_after_insert_sync;;

CREATE TRIGGER trg_rri_after_insert_sync
AFTER INSERT ON return_request_item
FOR EACH ROW
BEGIN
    CALL sp_rri_refresh_summary(NEW.order_item_id);
END;;


-- ============================================================
-- TRIGGER 6: AFTER UPDATE trên return_request_item
-- Khi quantity/amounts thay đổi → refresh summary.
-- Nếu order_item_id hoặc return_request_id thay đổi →
--   cần refresh cả old item để rollback.
-- ============================================================

DROP TRIGGER IF EXISTS trg_rri_after_update_sync;;

CREATE TRIGGER trg_rri_after_update_sync
AFTER UPDATE ON return_request_item
FOR EACH ROW
BEGIN
    CALL sp_rri_refresh_summary(NEW.order_item_id);

    -- Nếu item bị chuyển sang order_item khác → rollback old item
    IF OLD.order_item_id <> NEW.order_item_id THEN
        CALL sp_rri_refresh_summary(OLD.order_item_id);
    END IF;
END;;


-- ============================================================
-- TRIGGER 7: AFTER DELETE trên return_request_item
-- Khi xoá 1 item line → rollback summary cho order_item
-- ============================================================

DROP TRIGGER IF EXISTS trg_rri_after_delete_sync;;

CREATE TRIGGER trg_rri_after_delete_sync
AFTER DELETE ON return_request_item
FOR EACH ROW
BEGIN
    CALL sp_rri_refresh_summary(OLD.order_item_id);
END;;


DELIMITER ;
