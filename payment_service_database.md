# Payment Service — Tài liệu thiết kế database

**Database:** `payment_db`  
**Engine:** MySQL 8.0+  
**Chuẩn:** Microservice — độc lập hoàn toàn với `ecommerce` DB, không dùng FK cross-DB.  
**Tổng số bảng:** 12

---

## Tổng quan kiến trúc

```
ecommerce DB                        payment_db
─────────────                       ──────────────────────────────────────────
orders.id        ─── logical ref ─► payment_transaction.order_id
user.id          ─── logical ref ─► payment_transaction.user_id / payer_id / payee_id
shop.id          ─── logical ref ─► seller_settlement.shop_id / payee_id
```

Mọi tham chiếu sang `ecommerce` DB đều là **logical reference** (lưu ID thôi, không có FOREIGN KEY thật).  
Consistency được đảm bảo ở tầng **application / saga choreography**, không phải DB constraint.

---

## Luồng tiền được hỗ trợ

| `txn_type` | Mô tả | Payer → Payee |
|---|---|---|
| `ORDER_PAYMENT` | User thanh toán đơn hàng | USER → PLATFORM |
| `WALLET_TOPUP` | User nạp tiền vào ví | USER → PLATFORM |
| `WALLET_WITHDRAW` | User rút tiền từ ví ra ngân hàng | PLATFORM → USER |
| `SETTLEMENT_PAYOUT` | Sàn chuyển doanh thu bán hàng cho shop | PLATFORM → SHOP |
| `REFUND_PAYOUT` | Hoàn tiền về ví/tài khoản user | PLATFORM → USER |
| `PLATFORM_FEE` | Thu phí nền tảng / hoa hồng từ shop | SHOP → PLATFORM |
| `ADJUSTMENT` | Điều chỉnh thủ công bởi admin | tuỳ |

---

## Sơ đồ quan hệ bảng

```
payment_gateway_config
        │
        │ (gateway_code)
        ▼
payment_transaction ◄──────────────────────────────┐
        │                                           │
        ├──► payment_status_history (CASCADE DEL)   │
        │                                           │
        ├──► payment_gateway_log (SET NULL on DEL)  │
        │                                           │
        ├──► payment_webhook_event (logical)        │
        │                                           │
        ├──► refund_request                         │
        │         └──► refund_status_history        │
        │                                           │
        └──► seller_settlement_item ◄── seller_settlement
                                                    │
payment_wallet                                      │
        └──► wallet_transaction                     │
                                                    │
payment_dispute ────────────────────────────────────┘
```

---

## Chi tiết từng bảng

---

### 1. `payment_gateway_config` — Cấu hình cổng thanh toán

**Mục đích:** Registry các phương thức thanh toán được hỗ trợ. Dữ liệu tĩnh, thay đổi ít.  
**Ghi dữ liệu:** Seed 1 lần khi deploy, admin sửa qua CMS.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | INT AUTO_INCREMENT | PK |
| `code` | VARCHAR(30) UNIQUE | Định danh kỹ thuật: `COD`, `MOMO`, `VNPAY`, `ZALOPAY`, `BANK_TRANSFER`, `CREDIT_CARD`, `INSTALLMENT` |
| `name` | VARCHAR(100) | Tên hiển thị cho user |
| `provider` | VARCHAR(50) | Nhà cung cấp tích hợp: `INTERNAL`, `MOMO`, `VNPAY`, `ZALOPAY`, `STRIPE`, `KREDIVO` |
| `logo_url` | VARCHAR(500) | URL logo hiển thị trên checkout |
| `is_active` | TINYINT(1) | 1 = đang hoạt động, 0 = tắt tạm |
| `is_online` | TINYINT(1) | 0 = offline (COD), 1 = online payment |
| `min_amount` | BIGINT | Số tiền tối thiểu áp dụng (VND) |
| `max_amount` | BIGINT NULL | Số tiền tối đa, NULL = không giới hạn |
| `timeout_minute` | INT | Phút timeout chờ user hoàn thành thanh toán |
| `config_json` | JSON NULL | API key, merchant_id, endpoint (**phải encrypt ở app level**) |
| `sort_order` | INT | Thứ tự hiển thị trên UI |

**Index:** `uk_gateway_code (code)`, `idx_gateway_active (is_active, sort_order)`

---

### 2. `payment_transaction` — Bảng giao dịch tổng quát ⭐

**Mục đích:** Bảng trung tâm của toàn bộ payment service. Mỗi hàng đại diện cho **1 giao dịch tiền tệ** bất kể loại nào.  
**Thiết kế:** Dùng pattern **polymorphic transaction** — `txn_type` + `ref_type/ref_id` xác định ngữ nghĩa của từng bản ghi.

#### Nhóm cột định danh

| Cột | Mô tả |
|-----|-------|
| `txn_code` | Mã giao dịch nội bộ duy nhất, format: `TXN-{TYPE}-{YYYYMMDD}{RANDOM}`. VD: `TXN-ORD-20260419A1B2C3` |
| `txn_type` | Loại giao dịch — xác định toàn bộ ngữ nghĩa (xem bảng luồng tiền ở trên) |

#### Nhóm cột tham chiếu đối tượng gốc (`ref_*`)

Linh hoạt theo `txn_type`:

| `txn_type` | `ref_type` | `ref_id` | `ref_code` |
|---|---|---|---|
| `ORDER_PAYMENT` | `ORDER` | `orders.id` | `order_number` |
| `WALLET_TOPUP` | `TOPUP` | `topup_request.id` | NULL |
| `SETTLEMENT_PAYOUT` | `SETTLEMENT` | `seller_settlement.id` | `settlement_code` |
| `REFUND_PAYOUT` | `REFUND` | `refund_request.id` | `refund_code` |
| `PLATFORM_FEE` | `SETTLEMENT` | `seller_settlement.id` | `settlement_code` |
| `ADJUSTMENT` | `ADJUSTMENT` | NULL | ghi chú thủ công |

#### Nhóm cột bên gửi/nhận tiền

| Cột | Mô tả |
|-----|-------|
| `payer_type` / `payer_id` | Bên gửi tiền: `USER` (user_id), `SHOP` (shop_id), `PLATFORM` (NULL) |
| `payee_type` / `payee_id` | Bên nhận tiền: `USER` (user_id), `SHOP` (shop_id), `PLATFORM` (NULL) |

#### Nhóm cột tiện query đơn hàng

`order_id`, `order_number`, `user_id` — chỉ có giá trị khi `txn_type = ORDER_PAYMENT`, nullable với các loại khác.

#### Nhóm cột số tiền

| Cột | Mô tả |
|-----|-------|
| `gross_amount` | Tổng giá trị giao dịch trước khi trừ phí/giảm giá |
| `fee_amount` | Phí giao dịch / hoa hồng nền tảng |
| `discount_amount` | Giảm giá / voucher |
| `net_amount` | Số tiền thực tế = `gross - fee - discount` |

#### Nhóm cột gateway (chỉ dùng cho online payment)

`payment_method`, `gateway_code`, `gateway_txn_id`, `gateway_order_id`, `gateway_ref_code`, `gateway_response_code`, `gateway_response_msg`, `payment_url`

#### Nhóm cột trạng thái

`status`: `PENDING → PROCESSING → SUCCESS / FAILED / CANCELLED / EXPIRED`  
`REFUNDED` là trạng thái cuối khi giao dịch ORDER_PAYMENT đã bị hoàn tiền toàn bộ.

#### Nhóm cột audit / fraud

`initiated_by`, `initiator_id`, `ip_address`, `user_agent`, `device_type`

**Index nổi bật:**
- `uk_order_id` — mỗi đơn hàng chỉ có 1 transaction ORDER_PAYMENT
- `idx_txn_type_status` — query theo loại + trạng thái + thời gian (dùng nhiều nhất)
- `idx_ref` — tra cứu transaction theo đối tượng gốc
- `idx_payer`, `idx_payee` — tra cứu theo bên gửi/nhận

---

### 3. `payment_status_history` — Lịch sử trạng thái giao dịch

**Mục đích:** Audit trail đầy đủ mọi thay đổi `status` của `payment_transaction`. Không bao giờ xóa/sửa.

| Cột | Mô tả |
|-----|-------|
| `transaction_id` | FK → `payment_transaction.id` (CASCADE DELETE) |
| `from_status` | Trạng thái cũ, NULL = lần đầu tạo |
| `to_status` | Trạng thái mới |
| `changed_by` | Actor gây ra thay đổi: `USER`, `SYSTEM`, `GATEWAY`, `ADMIN`, `WEBHOOK` |
| `actor_id` | ID cụ thể của actor nếu có |
| `reason` | Lý do thay đổi (free text) |
| `gateway_data` | Snapshot JSON dữ liệu gateway tại thời điểm đó |

**Quy tắc:** Mỗi khi `payment_transaction.status` thay đổi → INSERT 1 bản ghi vào bảng này.

---

### 4. `payment_gateway_log` — Log giao tiếp với cổng thanh toán

**Mục đích:** Debug, audit, replay khi giao dịch lỗi. Lưu raw HTTP request/response.

| Cột | Mô tả |
|-----|-------|
| `transaction_id` | FK nullable (NULL khi webhook chưa match được transaction) |
| `log_type` | `REQUEST`, `RESPONSE`, `WEBHOOK`, `CALLBACK`, `IPN` |
| `direction` | `OUTBOUND` = ta gọi gateway, `INBOUND` = gateway gọi ta |
| `endpoint` | URL endpoint được gọi |
| `http_method` / `http_status` | Method và status code HTTP |
| `request_headers/body` | Raw request đầy đủ |
| `response_headers/body` | Raw response đầy đủ |
| `duration_ms` | Latency milliseconds |

**Lưu ý:** Bảng này tăng trưởng nhanh. Cần partition theo `created_at` hoặc archive định kỳ.

---

### 5. `payment_webhook_event` — Webhook nhận từ gateway

**Mục đích:** Đảm bảo **idempotency** — mỗi webhook từ gateway chỉ được xử lý đúng 1 lần dù gateway có retry.

| Cột | Mô tả |
|-----|-------|
| `gateway_code` | Gateway gửi webhook |
| `event_id` | ID do gateway cấp — dùng làm idempotency key |
| `raw_payload` | Payload thô chưa parse |
| `signature` | Chữ ký để verify (HMAC/RSA tùy gateway) |
| `is_verified` | 1 = đã verify chữ ký thành công |
| `is_processed` | 1 = đã xử lý business logic |
| `process_result` | `SUCCESS`, `FAILED`, `IGNORED`, `DUPLICATE` |
| `transaction_id` | Transaction được map sau khi xử lý |
| `retry_count` | Số lần gateway retry gửi lại |

**Index quan trọng:** `uk_gateway_event (gateway_code, event_id)` — ngăn xử lý trùng lặp.

**Flow xử lý webhook:**
```
Gateway gọi webhook
  → INSERT vào bảng này (nếu trùng event_id → IGNORE, trả 200 OK luôn)
  → verify chữ ký (is_verified = 1)
  → xử lý business logic
  → cập nhật is_processed = 1, process_result
```

---

### 6. `refund_request` — Yêu cầu hoàn tiền

**Mục đích:** Quản lý toàn bộ lifecycle của một yêu cầu hoàn tiền từ lúc tạo đến hoàn tất.

| Cột | Mô tả |
|-----|-------|
| `refund_code` | Mã hoàn tiền nội bộ. VD: `REF-20260419-XXXXX` |
| `transaction_id` | FK → giao dịch gốc cần hoàn |
| `order_id` / `order_number` | Tham chiếu đơn hàng gốc |
| `refund_amount` | Số tiền cần hoàn (VND) |
| `shipping_refund` | Phần phí ship được hoàn (nếu có) |
| `refund_type` | Lý do: `CANCELLED_BY_USER`, `CANCELLED_BY_SHOP`, `ITEM_NOT_RECEIVED`, `ITEM_DEFECTIVE`, `OVERPAID`, `SYSTEM_ERROR`, `DUPLICATE_PAYMENT` |
| `evidence_urls` | JSON array URL ảnh/video bằng chứng |
| `refund_method` | Cách hoàn: `ORIGINAL_METHOD` (về cổng gốc), `WALLET` (vào ví), `BANK_TRANSFER` |
| `gateway_refund_id` | ID hoàn tiền do gateway cấp |
| `status` | `REQUESTED → APPROVED/REJECTED → PROCESSING → COMPLETED/FAILED` |
| `reviewed_by` | Admin ID duyệt yêu cầu |

**State machine:**
```
REQUESTED → APPROVED   → PROCESSING → COMPLETED
          ↘ REJECTED                ↘ FAILED (có thể retry)
```

---

### 7. `refund_status_history` — Lịch sử trạng thái hoàn tiền

**Mục đích:** Tương tự `payment_status_history` nhưng dành cho `refund_request`.  
Mỗi thay đổi `status` của refund → INSERT 1 bản ghi vào đây.

| Cột | Mô tả |
|-----|-------|
| `refund_id` | FK → `refund_request.id` (CASCADE DELETE) |
| `from_status` / `to_status` | Chuyển trạng thái |
| `changed_by` | `USER`, `ADMIN`, `SYSTEM`, `GATEWAY` |
| `note` | Ghi chú kèm theo |

---

### 8. `seller_settlement` — Lô thanh toán cho shop

**Mục đích:** Quản lý việc sàn chuyển doanh thu bán hàng về cho shop theo định kỳ (tuần/tháng).

| Cột | Mô tả |
|-----|-------|
| `settlement_code` | Mã lô thanh toán. VD: `SET-20260419-SHOP001` |
| `shop_id` | ID shop nhận tiền |
| `period_from` / `period_to` | Kỳ thanh toán (từ ngày → đến ngày) |
| `gross_amount` | Tổng doanh thu chưa trừ phí |
| `platform_fee` | Phí nền tảng / hoa hồng |
| `shipping_subsidy` | Phần phí ship nền tảng hỗ trợ cho shop |
| `voucher_cost` | Chi phí voucher shop phải chịu |
| `adjustment_amount` | Điều chỉnh thủ công (có thể âm) |
| `net_amount` | Tiền thực chuyển = `gross - fee - voucher + subsidy + adjustment` |
| `bank_account_*` | Thông tin tài khoản nhận tiền của shop |
| `status` | `PENDING → PROCESSING → PAID / ON_HOLD / CANCELLED` |
| `on_hold_reason` | Lý do giữ tiền (vi phạm, tranh chấp...) |
| `bank_transfer_ref` | Mã tham chiếu chuyển khoản ngân hàng thực tế |

---

### 9. `seller_settlement_item` — Chi tiết đơn trong lô thanh toán

**Mục đích:** Breakdown từng giao dịch đơn hàng trong một lô settlement.

| Cột | Mô tả |
|-----|-------|
| `settlement_id` | FK → `seller_settlement.id` (CASCADE DELETE) |
| `transaction_id` | FK → `payment_transaction.id` |
| `order_id` / `order_number` | Đơn hàng tương ứng |
| `item_type` | `SALE` (doanh thu), `REFUND` (trừ lại khi hoàn), `ADJUSTMENT` (điều chỉnh) |
| `gross_amount` | Tiền hàng |
| `platform_fee` | Phí nền tảng của đơn này |
| `voucher_cost` | Chi phí voucher đơn này |
| `net_amount` | Số tiền thực tế đóng góp vào settlement (REFUND sẽ âm) |

---

### 10. `payment_wallet` — Ví điện tử nội bộ

**Mục đích:** Mỗi user có 1 ví nội bộ. Dùng để nhận cashback, hoàn tiền, store credit.

| Cột | Mô tả |
|-----|-------|
| `user_id` | UNIQUE — 1 user chỉ có 1 ví |
| `balance` | Số dư khả dụng hiện tại (VND) |
| `locked_balance` | Số dư đang bị tạm giữ (đang trong giao dịch pending) |
| `is_active` | 1 = ví đang hoạt động bình thường |

**Quy tắc:**
- `balance` và `locked_balance` **chỉ được update kèm INSERT vào `wallet_transaction`** trong cùng 1 DB transaction.
- Khi thanh toán bằng ví: `LOCK → DEBIT` khi thành công, `UNLOCK` khi thất bại.

---

### 11. `wallet_transaction` — Ledger biến động ví

**Mục đích:** Ledger bất biến của mọi biến động số dư ví. **Không bao giờ xóa/sửa** bản ghi.

| Cột | Mô tả |
|-----|-------|
| `wallet_id` | FK → `payment_wallet.id` |
| `user_id` | Denormalize để query nhanh |
| `txn_type` | `CREDIT` (nạp vào), `DEBIT` (rút ra), `LOCK` (tạm giữ), `UNLOCK` (giải phóng), `REFUND_CREDIT` (hoàn vào ví), `CASHBACK`, `EXPIRE`, `ADJUSTMENT` |
| `amount` | Số tiền biến động — **luôn dương** |
| `balance_before` | Snapshot số dư trước biến động |
| `balance_after` | Snapshot số dư sau biến động |
| `ref_type` / `ref_id` | Tham chiếu giao dịch gốc |
| `expired_at` | Cashback có thời hạn sử dụng |

---

### 12. `payment_dispute` — Tranh chấp giao dịch

**Mục đích:** Quản lý chargeback và khiếu nại giao dịch.

| Cột | Mô tả |
|-----|-------|
| `dispute_code` | Mã tranh chấp nội bộ. VD: `DIS-20260419-XXXXX` |
| `transaction_id` | FK → giao dịch bị tranh chấp |
| `dispute_type` | `CHARGEBACK`, `NOT_RECEIVED`, `ITEM_DEFECTIVE`, `FRAUD`, `DUPLICATE_CHARGE` |
| `dispute_amount` | Số tiền tranh chấp |
| `evidence_urls` | JSON array URL bằng chứng |
| `status` | `OPEN → UNDER_REVIEW → RESOLVED_BUYER / RESOLVED_SELLER / CLOSED` |
| `resolution_note` | Ghi chú kết luận của admin |
| `resolved_by` | Admin ID ra quyết định |

**State machine:**
```
OPEN → UNDER_REVIEW → RESOLVED_BUYER  (hoàn tiền cho buyer)
                    → RESOLVED_SELLER  (giữ tiền cho seller)
                    → CLOSED           (đóng không xử lý)
```

---

## Tóm tắt nhanh

| # | Bảng | Vai trò | Tăng trưởng |
|---|------|---------|-------------|
| 1 | `payment_gateway_config` | Config tĩnh | Rất thấp |
| 2 | `payment_transaction` | **Core** — mọi giao dịch | Cao |
| 3 | `payment_status_history` | Audit trail status | Cao (3–5x transaction) |
| 4 | `payment_gateway_log` | Debug/replay HTTP | **Rất cao** — cần archive |
| 5 | `payment_webhook_event` | Idempotency webhook | Cao |
| 6 | `refund_request` | Quản lý hoàn tiền | Trung bình |
| 7 | `refund_status_history` | Audit trail refund | Trung bình |
| 8 | `seller_settlement` | Lô thanh toán shop | Thấp (theo kỳ) |
| 9 | `seller_settlement_item` | Chi tiết lô | Trung bình |
| 10 | `payment_wallet` | Ví user | Thấp (1 row/user) |
| 11 | `wallet_transaction` | Ledger ví | Trung bình |
| 12 | `payment_dispute` | Tranh chấp | Thấp |

---

## Lưu ý triển khai

1. **`payment_gateway_log`** — nên partition theo `created_at` (RANGE MONTH) và archive data > 6 tháng.
2. **`payment_transaction`** — nên partition theo `created_at` khi data lớn (> 10M rows).
3. **`config_json`** trong `payment_gateway_config` — phải encrypt ở tầng application trước khi lưu, không lưu API key plaintext.
4. **Wallet balance** — không bao giờ UPDATE trực tiếp, phải thông qua INSERT `wallet_transaction` + UPDATE trong cùng 1 DB transaction để tránh race condition.
5. **Cross-service consistency** — dùng Saga pattern (choreography qua event bus) để đồng bộ trạng thái với `order-service`. Không dùng distributed transaction (2PC).
