# Trigger design: Điều chỉnh số lượng kiện hàng (Out-of-stock workflow)

Tài liệu này mô tả **các trigger cần có** để hỗ trợ workflow trong `ADJUST_QUANTITY_BUSSINESS_WORKFLOW.md` dựa trên schema đã thêm vào `ECOMMERCE.sql`:

- `order_shipment` (thêm: `business_status`, `latest_adjustment_request_id`, `adjusted_total_amount`, `adjustment_required`)
- `order_item` (thêm: `final_quantity`, `is_adjusted`)
- `shipment_adjustment_request`
- `shipment_adjustment_item`
- `shipment_adjustment_financial`

> Mục tiêu của trigger: **ràng buộc dữ liệu**, **đồng bộ trạng thái**, **tự tính tổng tiền chênh lệch**, và **tạo record financial** cho hoàn tiền/giảm COD.

---

## 1. Quy ước trạng thái

### 1.1 `shipment_adjustment_request.status`

- `PENDING_BUYER`
- `ACCEPTED_BY_BUYER`
- `REJECTED_BY_BUYER`
- `CANCELLED_BY_SHOP`
- `EXPIRED`

### 1.2 `order_shipment.business_status`

- `NORMAL`
- `ADJUSTMENT_PENDING_BUYER`
- `ADJUSTMENT_ACCEPTED`
- `ADJUSTMENT_REJECTED`
- `CANCELLED_BY_OOS`

---

## 2. Nguyên tắc thiết kế trigger (quan trọng)

- **Không tự động tạo logic “expire theo thời gian” bằng trigger**: trigger chỉ chạy khi có DML. Với use case hết hạn, nên dùng **MySQL EVENT** hoặc job scheduler trong app (xem mục 7).
- Tránh loop/recursive update: trigger có thể update bảng khác, nhưng tránh update ngược lại gây chuỗi trigger khó kiểm soát.
- Các trigger dưới đây ưu tiên:
  - validate dữ liệu đầu vào (`SIGNAL SQLSTATE '45000'`)
  - đồng bộ `order_shipment.business_status` và `latest_adjustment_request_id`
  - tính lại `total_adjusted_amount`, `total_diff_amount`
  - khi ACCEPT: chốt `order_item.final_quantity`, set `is_adjusted`, và tạo record `shipment_adjustment_financial`

---

## 3. Use case & trigger mapping

### UC-01: Shop tạo adjustment request (PENDING)

**Kỳ vọng**

- Mỗi `order_shipment` chỉ có **tối đa 1 request** ở trạng thái `PENDING_BUYER` tại một thời điểm.
- Khi tạo request:
  - `order_shipment.business_status` -> `ADJUSTMENT_PENDING_BUYER`
  - `order_shipment.adjustment_required` -> 1
  - `order_shipment.latest_adjustment_request_id` -> request mới

**Trigger đề xuất**

- `BEFORE INSERT` trên `shipment_adjustment_request`: validate (order_shipment/order/shop), enforce only one pending.
- `AFTER INSERT` trên `shipment_adjustment_request`: sync `order_shipment`.

### UC-02: Shop thêm/sửa item điều chỉnh

**Kỳ vọng**

- Chỉ được insert/update item khi request đang `PENDING_BUYER`
- `old_quantity`/`unit_price`/`old_total` phải khớp snapshot tại `order_item`
- `new_total` và `diff_total` được tính tự động
- Khi thay đổi items: tự tính lại tổng tiền ở `shipment_adjustment_request`

**Trigger đề xuất**

- `BEFORE INSERT`/`BEFORE UPDATE` trên `shipment_adjustment_item`: validate request status, populate snapshot & totals.
- `AFTER INSERT`/`AFTER UPDATE`/`AFTER DELETE` trên `shipment_adjustment_item`: recalc totals on request.

### UC-03: Buyer ACCEPT request

**Kỳ vọng**

- Khi `shipment_adjustment_request.status` chuyển `PENDING_BUYER -> ACCEPTED_BY_BUYER`:
  - set `responded_at`
  - `order_item.final_quantity = new_quantity`, `is_adjusted=1` cho các item liên quan
  - `order_shipment.adjusted_total_amount = total_adjusted_amount`
  - `order_shipment.business_status = ADJUSTMENT_ACCEPTED`
  - tạo `shipment_adjustment_financial`:
    - nếu `orders.payment_method != 'cod'`: `REFUND_NON_COD` amount = `total_diff_amount`
    - nếu `orders.payment_method = 'cod'`: `REDUCE_COD` amount = `total_diff_amount`

**Trigger đề xuất**

- `BEFORE UPDATE` trên `shipment_adjustment_request`: validate transition
- `AFTER UPDATE` trên `shipment_adjustment_request`: apply side effects (update order_item/order_shipment + insert financial)

### UC-04: Buyer REJECT request

**Kỳ vọng**

- Khi chuyển `PENDING_BUYER -> REJECTED_BY_BUYER`:
  - set `responded_at`
  - `order_shipment.business_status = ADJUSTMENT_REJECTED`
  - (tuỳ rule) app layer sẽ huỷ kiện/đơn, trigger chỉ sync trạng thái

**Trigger đề xuất**

- `BEFORE UPDATE` + `AFTER UPDATE` trên `shipment_adjustment_request`

### UC-05: Shop CANCEL request

**Kỳ vọng**

- Khi chuyển `PENDING_BUYER -> CANCELLED_BY_SHOP`:
  - set `responded_at`
  - `order_shipment.business_status` quay về `NORMAL` (hoặc giữ `ADJUSTMENT_*` tuỳ UX)
  - `adjustment_required` có thể về 0

**Trigger đề xuất**

- `BEFORE UPDATE` + `AFTER UPDATE` trên `shipment_adjustment_request`

### UC-06: Không cho chỉnh sau khi đã respond

**Kỳ vọng**

- Không được update/delete `shipment_adjustment_item` nếu request không còn `PENDING_BUYER`

**Trigger đề xuất**

- `BEFORE UPDATE`/`BEFORE DELETE` trên `shipment_adjustment_item`

---

## 4. SQL Trigger mẫu (MySQL 8.x)

> Gợi ý: đặt `DELIMITER ;;` khi tạo trigger trong MySQL client.

### 4.1 `shipment_adjustment_request` - BEFORE INSERT (validate + one pending)

```sql
  DELIMITER ;;
  CREATE TRIGGER trg_adj_req_before_insert
  BEFORE INSERT ON shipment_adjustment_request
  FOR EACH ROW
  BEGIN
    DECLARE v_pending_count INT DEFAULT 0;

    -- basic validation
    IF NEW.order_shipment_id IS NULL OR NEW.order_id IS NULL OR NEW.shop_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'order_shipment_id, order_id, shop_id are required';
    END IF;

    -- enforce request status
    IF NEW.status IS NULL OR TRIM(NEW.status) = '' THEN
      SET NEW.status = 'PENDING_BUYER';
    END IF;
    IF NEW.status <> 'PENDING_BUYER' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'New adjustment request must start with PENDING_BUYER';
    END IF;

    -- ensure shipment belongs to order and shop
    IF NOT EXISTS (
      SELECT 1 FROM order_shipment os
      WHERE os.id = NEW.order_shipment_id
        AND os.order_id = NEW.order_id
        AND os.shop_id = NEW.shop_id
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'order_shipment does not match order_id/shop_id';
    END IF;

    -- only one pending request per shipment
    SELECT COUNT(*)
      INTO v_pending_count
    FROM shipment_adjustment_request r
    WHERE r.order_shipment_id = NEW.order_shipment_id
      AND r.status = 'PENDING_BUYER';

    IF v_pending_count > 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only one PENDING_BUYER request is allowed per shipment';
    END IF;

    -- default totals
    IF NEW.total_original_amount IS NULL THEN SET NEW.total_original_amount = 0.00; END IF;
    IF NEW.total_adjusted_amount IS NULL THEN SET NEW.total_adjusted_amount = 0.00; END IF;
    IF NEW.total_diff_amount IS NULL THEN SET NEW.total_diff_amount = 0.00; END IF;
  END;;
  DELIMITER ;
```

### 4.2 `shipment_adjustment_request` - AFTER INSERT (sync `order_shipment`)

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_req_after_insert
AFTER INSERT ON shipment_adjustment_request
FOR EACH ROW
BEGIN
  UPDATE order_shipment os
  SET os.business_status = 'ADJUSTMENT_PENDING_BUYER',
      os.adjustment_required = 1,
      os.latest_adjustment_request_id = NEW.id
  WHERE os.id = NEW.order_shipment_id;
END;;
DELIMITER ;
```

### 4.3 `shipment_adjustment_item` - BEFORE INSERT (snapshot + validate)

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_item_before_insert
BEFORE INSERT ON shipment_adjustment_item
FOR EACH ROW
BEGIN
  DECLARE v_req_status VARCHAR(50);
  DECLARE v_order_id BIGINT;
  DECLARE v_unit_price DECIMAL(15,2);
  DECLARE v_old_qty INT;
  DECLARE v_product_name VARCHAR(255);
  DECLARE v_variant_name VARCHAR(255);
  DECLARE v_product_id BIGINT;
  DECLARE v_variant_id BIGINT;

  SELECT r.status, r.order_id
    INTO v_req_status, v_order_id
  FROM shipment_adjustment_request r
  WHERE r.id = NEW.adjustment_request_id;

  IF v_req_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid adjustment_request_id';
  END IF;
  IF v_req_status <> 'PENDING_BUYER' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot add items unless request is PENDING_BUYER';
  END IF;

  SELECT oi.price, oi.quantity, oi.product_name, oi.variant_name, oi.product_id, oi.variant_id
    INTO v_unit_price, v_old_qty, v_product_name, v_variant_name, v_product_id, v_variant_id
  FROM order_item oi
  WHERE oi.id = NEW.order_item_id
    AND oi.order_id = v_order_id;

  IF v_unit_price IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'order_item not found or does not belong to order';
  END IF;

  -- snapshot
  SET NEW.unit_price = v_unit_price;
  SET NEW.old_quantity = v_old_qty;
  SET NEW.product_name = v_product_name;
  SET NEW.variant_name = v_variant_name;
  SET NEW.product_id = v_product_id;
  SET NEW.variant_id = v_variant_id;

  -- validate new_quantity
  IF NEW.new_quantity IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'new_quantity is required';
  END IF;
  IF NEW.new_quantity < 0 OR NEW.new_quantity > v_old_qty THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'new_quantity must be between 0 and old_quantity';
  END IF;

  -- compute totals
  SET NEW.old_total = v_unit_price * v_old_qty;
  SET NEW.new_total = v_unit_price * NEW.new_quantity;
  SET NEW.diff_total = NEW.old_total - NEW.new_total;
END;;
DELIMITER ;
```

### 4.4 `shipment_adjustment_item` - BEFORE UPDATE (lock after responded + recompute)

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_item_before_update
BEFORE UPDATE ON shipment_adjustment_item
FOR EACH ROW
BEGIN
  DECLARE v_req_status VARCHAR(50);

  SELECT r.status INTO v_req_status
  FROM shipment_adjustment_request r
  WHERE r.id = NEW.adjustment_request_id;

  IF v_req_status <> 'PENDING_BUYER' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot edit items unless request is PENDING_BUYER';
  END IF;

  IF NEW.new_quantity < 0 OR NEW.new_quantity > NEW.old_quantity THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'new_quantity must be between 0 and old_quantity';
  END IF;

  -- keep snapshot immutable
  SET NEW.order_item_id = OLD.order_item_id;
  SET NEW.product_id = OLD.product_id;
  SET NEW.variant_id = OLD.variant_id;
  SET NEW.product_name = OLD.product_name;
  SET NEW.variant_name = OLD.variant_name;
  SET NEW.unit_price = OLD.unit_price;
  SET NEW.old_quantity = OLD.old_quantity;

  -- recompute totals
  SET NEW.old_total = NEW.unit_price * NEW.old_quantity;
  SET NEW.new_total = NEW.unit_price * NEW.new_quantity;
  SET NEW.diff_total = NEW.old_total - NEW.new_total;
END;;
DELIMITER ;
```

### 4.5 `shipment_adjustment_item` - BEFORE DELETE (lock after responded)

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_item_before_delete
BEFORE DELETE ON shipment_adjustment_item
FOR EACH ROW
BEGIN
  DECLARE v_req_status VARCHAR(50);

  SELECT r.status INTO v_req_status
  FROM shipment_adjustment_request r
  WHERE r.id = OLD.adjustment_request_id;

  IF v_req_status <> 'PENDING_BUYER' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete items unless request is PENDING_BUYER';
  END IF;
END;;
DELIMITER ;
```

### 4.6 Recalc totals after item changes

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_item_after_insert
AFTER INSERT ON shipment_adjustment_item
FOR EACH ROW
BEGIN
  UPDATE shipment_adjustment_request r
  SET r.total_original_amount = (
        SELECT IFNULL(SUM(i.old_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      ),
      r.total_adjusted_amount = (
        SELECT IFNULL(SUM(i.new_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      ),
      r.total_diff_amount = (
        SELECT IFNULL(SUM(i.diff_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      )
  WHERE r.id = NEW.adjustment_request_id;
END;;
DELIMITER ;
```

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_item_after_update
AFTER UPDATE ON shipment_adjustment_item
FOR EACH ROW
BEGIN
  UPDATE shipment_adjustment_request r
  SET r.total_original_amount = (
        SELECT IFNULL(SUM(i.old_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      ),
      r.total_adjusted_amount = (
        SELECT IFNULL(SUM(i.new_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      ),
      r.total_diff_amount = (
        SELECT IFNULL(SUM(i.diff_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      )
  WHERE r.id = NEW.adjustment_request_id;
END;;
DELIMITER ;
```

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_item_after_delete
AFTER DELETE ON shipment_adjustment_item
FOR EACH ROW
BEGIN
  UPDATE shipment_adjustment_request r
  SET r.total_original_amount = (
        SELECT IFNULL(SUM(i.old_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      ),
      r.total_adjusted_amount = (
        SELECT IFNULL(SUM(i.new_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      ),
      r.total_diff_amount = (
        SELECT IFNULL(SUM(i.diff_total),0) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = r.id
      )
  WHERE r.id = OLD.adjustment_request_id;
END;;
DELIMITER ;
```

### 4.7 `shipment_adjustment_request` - BEFORE UPDATE (validate transitions)

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_req_before_update
BEFORE UPDATE ON shipment_adjustment_request
FOR EACH ROW
BEGIN
  -- lock terminal states
  IF OLD.status IN ('ACCEPTED_BY_BUYER','REJECTED_BY_BUYER','CANCELLED_BY_SHOP','EXPIRED')
     AND NEW.status <> OLD.status THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot transition from a terminal adjustment status';
  END IF;

  -- only allow from PENDING_BUYER to specific states
  IF OLD.status = 'PENDING_BUYER' THEN
    IF NEW.status NOT IN ('PENDING_BUYER','ACCEPTED_BY_BUYER','REJECTED_BY_BUYER','CANCELLED_BY_SHOP','EXPIRED') THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid status transition from PENDING_BUYER';
    END IF;

    IF NEW.status IN ('ACCEPTED_BY_BUYER','REJECTED_BY_BUYER','CANCELLED_BY_SHOP','EXPIRED') THEN
      SET NEW.responded_at = IFNULL(NEW.responded_at, CURRENT_TIMESTAMP);
    END IF;
  END IF;
END;;
DELIMITER ;
```

### 4.8 `shipment_adjustment_request` - AFTER UPDATE (apply effects)

```sql
DELIMITER ;;
CREATE TRIGGER trg_adj_req_after_update
AFTER UPDATE ON shipment_adjustment_request
FOR EACH ROW
BEGIN
  DECLARE v_payment_method VARCHAR(255);

  -- always keep latest pointer
  UPDATE order_shipment os
  SET os.latest_adjustment_request_id = NEW.id
  WHERE os.id = NEW.order_shipment_id;

  IF OLD.status = 'PENDING_BUYER' AND NEW.status = 'ACCEPTED_BY_BUYER' THEN
    -- 1) apply final quantities
    UPDATE order_item oi
    JOIN shipment_adjustment_item ai ON ai.order_item_id = oi.id
    SET oi.final_quantity = ai.new_quantity,
        oi.is_adjusted = 1
    WHERE ai.adjustment_request_id = NEW.id;

    -- 2) update shipment business status + adjusted total
    UPDATE order_shipment os
    SET os.business_status = 'ADJUSTMENT_ACCEPTED',
        os.adjusted_total_amount = NEW.total_adjusted_amount,
        os.adjustment_required = 1
    WHERE os.id = NEW.order_shipment_id;

    -- 3) create financial record (idempotency: prevent duplicate per request)
    SELECT o.payment_method INTO v_payment_method
    FROM orders o
    WHERE o.id = NEW.order_id;

    IF NOT EXISTS (
      SELECT 1 FROM shipment_adjustment_financial f
      WHERE f.adjustment_request_id = NEW.id
    ) THEN
      INSERT INTO shipment_adjustment_financial(
        adjustment_request_id, order_id, payment_method_snapshot, action_type, amount, status
      ) VALUES (
        NEW.id,
        NEW.order_id,
        LEFT(IFNULL(v_payment_method,''), 20),
        IF(LOWER(IFNULL(v_payment_method,'')) = 'cod', 'REDUCE_COD', 'REFUND_NON_COD'),
        NEW.total_diff_amount,
        'PENDING'
      );
    END IF;

  ELSEIF OLD.status = 'PENDING_BUYER' AND NEW.status = 'REJECTED_BY_BUYER' THEN
    UPDATE order_shipment os
    SET os.business_status = 'ADJUSTMENT_REJECTED',
        os.adjustment_required = 1
    WHERE os.id = NEW.order_shipment_id;

  ELSEIF OLD.status = 'PENDING_BUYER' AND NEW.status = 'CANCELLED_BY_SHOP' THEN
    UPDATE order_shipment os
    SET os.business_status = 'NORMAL',
        os.adjustment_required = 0
    WHERE os.id = NEW.order_shipment_id;

  ELSEIF OLD.status = 'PENDING_BUYER' AND NEW.status = 'EXPIRED' THEN
    UPDATE order_shipment os
    SET os.business_status = 'ADJUSTMENT_REJECTED',
        os.adjustment_required = 1
    WHERE os.id = NEW.order_shipment_id;
  END IF;
END;;
DELIMITER ;
```

---

## 5. Use case “Shop huỷ kiện do thiếu hàng”

Workflow gốc có nhánh “Shop huỷ kiện và điền lý do”.

Trong schema hiện tại, `order_shipment` chưa có cột `cancelled_reason`. Có 2 hướng:

- **Hướng A (DB-only minimal)**: tận dụng `shipment_adjustment_request` với `status='CANCELLED_BY_SHOP'` + `shop_reason` để lưu lý do huỷ.
- **Hướng B (khuyến nghị)**: thêm `order_shipment.cancelled_reason` + `cancelled_at` để tách khỏi adjustment (tránh overload ý nghĩa).

Nếu chọn hướng A, trigger ở mục 4.8 đã sync `order_shipment.business_status='NORMAL'` khi shop cancel request; nếu muốn “huỷ kiện”, app layer nên set thêm `order_shipment.business_status='CANCELLED_BY_OOS'` (nên làm ở service), hoặc bổ sung trigger riêng khi `orders.order_status` đổi.

---

## 6. Các ràng buộc bổ sung (khuyến nghị)

### 6.1 Không cho ACCEPT nếu request chưa có item

Bạn có thể thêm check trong `trg_adj_req_before_update`:

```sql
IF OLD.status = 'PENDING_BUYER' AND NEW.status = 'ACCEPTED_BY_BUYER' THEN
  IF (SELECT COUNT(*) FROM shipment_adjustment_item i WHERE i.adjustment_request_id = OLD.id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot accept adjustment request without any items';
  END IF;
END IF;
```

### 6.2 Không cho diff_total âm

Trong `shipment_adjustment_item`, diff_total = old_total - new_total nên luôn >= 0. Trigger đã đảm bảo new_qty <= old_qty.

---

## 7. Use case “EXPIRED” (hết hạn) nên xử lý thế nào?

Trigger **không tự chạy theo thời gian**. Để tự động set `EXPIRED`, nên dùng:

- **MySQL EVENT** chạy mỗi X phút, hoặc
- **Scheduled job trong application**

Ví dụ MySQL EVENT (chỉ là gợi ý, dùng khi bạn bật event_scheduler):

```sql
-- SET GLOBAL event_scheduler = ON;
CREATE EVENT ev_expire_adjustment_requests
ON SCHEDULE EVERY 5 MINUTE
DO
  UPDATE shipment_adjustment_request
  SET status = 'EXPIRED',
      responded_at = IFNULL(responded_at, CURRENT_TIMESTAMP)
  WHERE status = 'PENDING_BUYER'
    AND expires_at IS NOT NULL
    AND expires_at < CURRENT_TIMESTAMP;
```

Sau đó trigger `trg_adj_req_after_update` sẽ tự sync `order_shipment` theo nhánh `EXPIRED`.

---

## 8. Checklist triển khai

- Tạo triggers theo thứ tự:
  - request: before_insert, after_insert, before_update, after_update
  - item: before_insert, before_update, before_delete, after_insert, after_update, after_delete
- Test các luồng:
  - tạo request + items
  - accept -> cập nhật `order_item.final_quantity` + insert financial
  - reject/cancel/expire -> sync `order_shipment`
  - chặn sửa item sau khi respond
