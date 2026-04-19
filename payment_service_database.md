# Payment Service — Tài liệu thiết kế database

**Database:** `payment_db`
**Engine:** MySQL 8.0+
**Chuẩn:** Microservice — độc lập hoàn toàn với `ecommerce` DB, không dùng FK cross-DB.
**Tổng số bảng:** 12

---

## Tổng quan kiến trúc

Mọi tham chiếu sang `ecommerce` DB đều là **logical reference** (lưu ID thôi, không có FOREIGN KEY thật).
Consistency được đảm bảo ở tầng **application / saga choreography**, không phải DB constraint.

---

## Luồng tiền được hỗ trợ

| txn_type | Mô tả | Payer → Payee |
|---|---|---|
| ORDER_PAYMENT | User thanh toán đơn hàng | USER → PLATFORM |
| WALLET_TOPUP | User nạp tiền vào ví | USER → PLATFORM |
| WALLET_WITHDRAW | User rút tiền từ ví ra ngân hàng | PLATFORM → USER |
| SETTLEMENT_PAYOUT | Sàn chuyển doanh thu bán hàng cho shop | PLATFORM → SHOP |
| REFUND_PAYOUT | Hoàn tiền về ví/tài khoản user | PLATFORM → USER |
| PLATFORM_FEE | Thu phí nền tảng / hoa hồng từ shop | SHOP → PLATFORM |
| ADJUSTMENT | Điều chỉnh thủ công bởi admin | tuỳ |

---

## Chi tiết từng bảng

---

### 1. payment_gateway_config — Cấu hình cổng thanh toán

**Mục đích:** Registry các phương thức thanh toán được hỗ trợ. Dữ liệu tĩnh, thay đổi ít.
**Ghi dữ liệu:** Seed 1 lần khi deploy, admin sửa qua CMS.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | INT AUTO_INCREMENT | PK |
| code | VARCHAR(30) UNIQUE | COD, MOMO, VNPAY, ZALOPAY, BANK_TRANSFER, CREDIT_CARD, INSTALLMENT |
| name | VARCHAR(100) | Tên hiển thị cho user |
| provider | VARCHAR(50) | INTERNAL, MOMO, VNPAY, ZALOPAY, STRIPE, KREDIVO |
| is_active | TINYINT(1) | 1 = đang hoạt động |
| is_online | TINYINT(1) | 0 = offline (COD), 1 = online payment |
| min_amount | BIGINT | Số tiền tối thiểu (VND) |
| max_amount | BIGINT NULL | Số tiền tối đa, NULL = không giới hạn |
| timeout_minute | INT | Phút timeout chờ user thanh toán |
| config_json | JSON NULL | API key, merchant_id (phải encrypt ở app level) |
| sort_order | INT | Thứ tự hiển thị trên UI |

---

### 2. payment_transaction — Bảng giao dịch tổng quát (CORE)

**Mục đích:** Bảng trung tâm. Mỗi hàng = 1 giao dịch tiền tệ bất kể loại nào.
**Pattern:** Polymorphic transaction — txn_type + ref_type/ref_id xác định ngữ nghĩa.

#### Nhóm: Định danh

| Cột | Mô tả |
|-----|-------|
| txn_code | Mã giao dịch nội bộ unique. VD: TXN-ORD-20260419A1B2C3 |
| txn_type | Loại giao dịch (xem bảng luồng tiền) |

#### Nhóm: Tham chiếu đối tượng gốc (ref_*)

| txn_type | ref_type | ref_id | ref_code |
|---|---|---|---|
| ORDER_PAYMENT | ORDER | orders.id | order_number |
| WALLET_TOPUP | TOPUP | topup_request.id | NULL |
| SETTLEMENT_PAYOUT | SETTLEMENT | seller_settlement.id | settlement_code |
| REFUND_PAYOUT | REFUND | refund_request.id | refund_code |
| PLATFORM_FEE | SETTLEMENT | seller_settlement.id | settlement_code |

#### Nhóm: Bên gửi/nhận tiền

| Cột | Mô tả |
|-----|-------|
| payer_type / payer_id | Bên gửi: USER (user_id), SHOP (shop_id), PLATFORM (NULL) |
| payee_type / payee_id | Bên nhận: USER (user_id), SHOP (shop_id), PLATFORM (NULL) |

#### Nhóm: Số tiền

| Cột | Mô tả |
|-----|-------|
| gross_amount | Tổng giá trị trước khi trừ phí/giảm giá |
| fee_amount | Phí giao dịch / hoa hồng nền tảng |
| discount_amount | Giảm giá / voucher |
| net_amount | Thực tế = gross - fee - discount |

#### Nhóm: Gateway (chỉ dùng cho online payment)

gateway_code, payment_method, gateway_txn_id, gateway_order_id, gateway_response_code, payment_url

#### Nhóm: Trạng thái

status: PENDING -> PROCESSING -> SUCCESS / FAILED / CANCELLED / EXPIRED / REFUNDED

#### Nhóm: Audit / Fraud

initiated_by, initiator_id, ip_address, user_agent, device_type

---

### 3. payment_status_history — Lịch sử trạng thái giao dịch

**Mục đích:** Audit trail đầy đủ mọi thay đổi status của payment_transaction. Không bao giờ xóa/sửa.
**Quy tắc:** Mỗi khi payment_transaction.status thay đổi → INSERT 1 bản ghi vào đây.

| Cột | Mô tả |
|-----|-------|
| transaction_id | FK → payment_transaction.id (CASCADE DELETE) |
| from_status | Trạng thái cũ, NULL = lần đầu tạo |
| to_status | Trạng thái mới |
| changed_by | USER, SYSTEM, GATEWAY, ADMIN, WEBHOOK |
| actor_id | ID cụ thể của actor |
| reason | Lý do thay đổi |
| gateway_data | Snapshot JSON dữ liệu gateway tại thời điểm đó |

---

### 4. payment_gateway_log — Log giao tiếp với cổng thanh toán

**Mục đích:** Debug, audit, replay khi giao dịch lỗi. Lưu raw HTTP request/response.
**Lưu ý:** Bảng tăng trưởng rất nhanh — cần partition theo created_at hoặc archive định kỳ.

| Cột | Mô tả |
|-----|-------|
| transaction_id | FK nullable (NULL khi webhook chưa match được transaction) |
| log_type | REQUEST, RESPONSE, WEBHOOK, CALLBACK, IPN |
| direction | OUTBOUND = ta gọi gateway, INBOUND = gateway gọi ta |
| endpoint | URL endpoint được gọi |
| http_method / http_status | HTTP method và status code |
| request_headers / request_body | Raw request đầy đủ |
| response_headers / response_body | Raw response đầy đủ |
| duration_ms | Latency milliseconds |

---

### 5. payment_webhook_event — Webhook nhận từ gateway

**Mục đích:** Đảm bảo idempotency — mỗi webhook chỉ xử lý đúng 1 lần dù gateway retry.
**Index quan trọng:** uk_gateway_event(gateway_code, event_id) — ngăn xử lý trùng lặp.

| Cột | Mô tả |
|-----|-------|
| gateway_code | Gateway gửi webhook |
| event_id | ID do gateway cấp — idempotency key |
| raw_payload | Payload thô chưa parse |
| signature | Chữ ký để verify (HMAC/RSA tùy gateway) |
| is_verified | 1 = đã verify chữ ký |
| is_processed | 1 = đã xử lý business logic |
| process_result | SUCCESS, FAILED, IGNORED, DUPLICATE |
| transaction_id | Transaction được map sau khi xử lý |
| retry_count | Số lần gateway retry |

Flow: Gateway gọi webhook → INSERT (trùng event_id thì IGNORE) → verify chữ ký → xử lý business → update is_processed

---

### 6. refund_request — Yêu cầu hoàn tiền

**Mục đích:** Quản lý toàn bộ lifecycle của một yêu cầu hoàn tiền.

| Cột | Mô tả |
|-----|-------|
| refund_code | Mã nội bộ unique. VD: REF-20260419-XXXXX |
| transaction_id | FK → giao dịch gốc cần hoàn |
| refund_amount | Số tiền hoàn (VND) |
| shipping_refund | Phần phí ship được hoàn |
| refund_type | CANCELLED_BY_USER, CANCELLED_BY_SHOP, ITEM_NOT_RECEIVED, ITEM_DEFECTIVE, OVERPAID, SYSTEM_ERROR, DUPLICATE_PAYMENT |
| evidence_urls | JSON array URL ảnh/video bằng chứng |
| refund_method | ORIGINAL_METHOD (về cổng gốc), WALLET (vào ví), BANK_TRANSFER |
| gateway_refund_id | ID hoàn tiền do gateway cấp |
| status | REQUESTED → APPROVED/REJECTED → PROCESSING → COMPLETED/FAILED |
| reviewed_by | Admin ID duyệt yêu cầu |

State machine: REQUESTED → APPROVED → PROCESSING → COMPLETED
                          ↘ REJECTED              ↘ FAILED

---

### 7. refund_status_history — Lịch sử trạng thái hoàn tiền

**Mục đích:** Audit trail cho refund_request. Mỗi đổi status → INSERT 1 bản ghi.

| Cột | Mô tả |
|-----|-------|
| refund_id | FK → refund_request.id (CASCADE DELETE) |
| from_status / to_status | Chuyển trạng thái |
| changed_by | USER, ADMIN, SYSTEM, GATEWAY |
| note | Ghi chú kèm theo |

---

### 8. seller_settlement — Lô thanh toán cho shop

**Mục đích:** Quản lý việc sàn chuyển doanh thu về cho shop theo định kỳ (tuần/tháng).

| Cột | Mô tả |
|-----|-------|
| settlement_code | Mã lô. VD: SET-20260419-SHOP001 |
| shop_id | ID shop nhận tiền |
| period_from / period_to | Kỳ thanh toán |
| gross_amount | Tổng doanh thu chưa trừ phí |
| platform_fee | Phí nền tảng / hoa hồng |
| shipping_subsidy | Phí ship nền tảng hỗ trợ cho shop |
| voucher_cost | Chi phí voucher shop chịu |
| adjustment_amount | Điều chỉnh thủ công (có thể âm) |
| net_amount | Tiền thực chuyển = gross - fee - voucher + subsidy + adjustment |
| bank_account_* | Thông tin tài khoản nhận tiền của shop |
| status | PENDING → PROCESSING → PAID / ON_HOLD / CANCELLED |
| on_hold_reason | Lý do giữ tiền (vi phạm, tranh chấp...) |
| bank_transfer_ref | Mã tham chiếu chuyển khoản ngân hàng |

---

### 9. seller_settlement_item — Chi tiết đơn trong lô thanh toán

**Mục đích:** Breakdown từng giao dịch đơn hàng trong một lô settlement.

| Cột | Mô tả |
|-----|-------|
| settlement_id | FK → seller_settlement.id (CASCADE DELETE) |
| transaction_id | FK → payment_transaction.id |
| order_id / order_number | Đơn hàng tương ứng |
| item_type | SALE (doanh thu), REFUND (trừ lại khi hoàn — net_amount âm), ADJUSTMENT |
| gross_amount | Tiền hàng |
| platform_fee | Phí nền tảng của đơn này |
| voucher_cost | Chi phí voucher đơn này |
| net_amount | Đóng góp vào settlement |

---

### 10. payment_wallet — Ví điện tử nội bộ

**Mục đích:** Mỗi user có 1 ví. Dùng để nhận cashback, hoàn tiền, store credit.

| Cột | Mô tả |
|-----|-------|
| user_id | UNIQUE — 1 user chỉ có 1 ví |
| balance | Số dư khả dụng (VND) |
| locked_balance | Số dư đang bị tạm giữ (pending transaction) |
| is_active | 1 = hoạt động bình thường |

**Quy tắc:** Chỉ update balance/locked_balance kèm INSERT wallet_transaction trong cùng 1 DB transaction — tránh race condition.

---

### 11. wallet_transaction — Ledger biến động ví

**Mục đích:** Ledger bất biến. Không bao giờ xóa/sửa bản ghi.

| Cột | Mô tả |
|-----|-------|
| wallet_id | FK → payment_wallet.id |
| user_id | Denormalize để query nhanh |
| txn_type | CREDIT (nạp), DEBIT (rút), LOCK (tạm giữ), UNLOCK (giải phóng), REFUND_CREDIT, CASHBACK, EXPIRE, ADJUSTMENT |
| amount | Số tiền biến động — luôn dương |
| balance_before | Snapshot số dư trước |
| balance_after | Snapshot số dư sau |
| ref_type / ref_id | Tham chiếu giao dịch gốc |
| expired_at | Cashback có thời hạn sử dụng |

---

### 12. payment_dispute — Tranh chấp giao dịch

**Mục đích:** Quản lý chargeback và khiếu nại giao dịch không hợp lệ.

| Cột | Mô tả |
|-----|-------|
| dispute_code | Mã tranh chấp nội bộ. VD: DIS-20260419-XXXXX |
| transaction_id | FK → giao dịch bị tranh chấp |
| dispute_type | CHARGEBACK, NOT_RECEIVED, ITEM_DEFECTIVE, FRAUD, DUPLICATE_CHARGE |
| dispute_amount | Số tiền tranh chấp |
| evidence_urls | JSON array URL bằng chứng |
| status | OPEN → UNDER_REVIEW → RESOLVED_BUYER / RESOLVED_SELLER / CLOSED |
| resolution_note | Ghi chú kết luận của admin |
| resolved_by | Admin ID ra quyết định |

State machine: OPEN → UNDER_REVIEW → RESOLVED_BUYER (hoàn tiền cho buyer)
                                   → RESOLVED_SELLER (giữ tiền cho seller)
                                   → CLOSED

---

## Tóm tắt nhanh

| # | Bảng | Vai trò | Tăng trưởng |
|---|------|---------|-------------|
| 1 | payment_gateway_config | Config tĩnh | Rất thấp |
| 2 | payment_transaction | CORE — mọi giao dịch | Cao |
| 3 | payment_status_history | Audit trail status | Cao (3-5x transaction) |
| 4 | payment_gateway_log | Debug/replay HTTP | Rất cao — cần archive |
| 5 | payment_webhook_event | Idempotency webhook | Cao |
| 6 | refund_request | Quản lý hoàn tiền | Trung bình |
| 7 | refund_status_history | Audit trail refund | Trung bình |
| 8 | seller_settlement | Lô thanh toán shop | Thấp (theo kỳ) |
| 9 | seller_settlement_item | Chi tiết lô | Trung bình |
| 10 | payment_wallet | Ví user | Thấp (1 row/user) |
| 11 | wallet_transaction | Ledger ví | Trung bình |
| 12 | payment_dispute | Tranh chấp | Thấp |

---

## Lưu ý triển khai

1. **payment_gateway_log** — partition theo created_at (RANGE MONTH) và archive data > 6 tháng.
2. **payment_transaction** — partition theo created_at khi data lớn (> 10M rows).
3. **config_json** trong payment_gateway_config — encrypt ở tầng application, không lưu API key plaintext.
4. **Wallet balance** — luôn update kèm INSERT wallet_transaction trong cùng 1 DB transaction để tránh race condition.
5. **Cross-service consistency** — dùng Saga pattern (choreography qua event bus) với order-service. Không dùng distributed transaction (2PC).