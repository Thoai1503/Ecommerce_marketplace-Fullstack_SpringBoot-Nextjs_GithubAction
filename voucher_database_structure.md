# Thiết kế lại database cho nghiệp vụ quản lý và sử dụng voucher

Tài liệu này đề xuất schema mới cho nghiệp vụ voucher theo mô hình marketplace (platform, shop, brand), đảm bảo:

- Quản lý rõ vòng đời voucher: draft -> active -> claimed -> redeemed -> expired/depleted.
- Tách dữ liệu cấu hình voucher và dữ liệu phát sinh giao dịch (claim/redeem/audit).
- Hỗ trợ điều kiện áp dụng linh hoạt theo shop, category, product, user segment, kênh.
- Tránh race condition khi claim/redeem bằng khóa và unique key phù hợp.

## 1) Mapping nghiệp vụ sang mô hình dữ liệu

Nguồn phát hành:

- PLATFORM: voucher toàn sàn.
- SHOP: voucher của shop.
- BRAND: voucher theo thương hiệu.

Loại giảm giá:

- PERCENT: giảm theo phần trăm, có thể giới hạn `max_discount_amount`.
- FIXED: giảm số tiền cố định.
- FREE_SHIPPING: miễn phí vận chuyển.
- GIFT_ITEM: tặng sản phẩm/quà.

Điều kiện áp dụng:

- `min_order_value`, `max_order_value`.
- Giới hạn theo shop/category/product/brand.
- Giới hạn theo user segment: NEW_USER, VIP, APP_ONLY.
- Giới hạn số lượt toàn hệ thống (`total_quota`) và trên mỗi user (`per_user_quota`).

## 2) Thiết kế bảng đề xuất

### 2.1 Bảng cấu hình voucher

#### `voucher_campaign`

Nhóm chiến dịch, phục vụ báo cáo và quản trị.

```sql
CREATE TABLE voucher_campaign (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   code VARCHAR(50) NOT NULL UNIQUE,
   name VARCHAR(255) NOT NULL,
   description TEXT NULL,
   start_at DATETIME NOT NULL,
   end_at DATETIME NOT NULL,
   status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
   created_by BIGINT NULL,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   CHECK (start_at < end_at),
   CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'CANCELLED'))
);
```

#### `voucher`

Bảng chính định nghĩa một voucher cụ thể.

```sql
CREATE TABLE voucher (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   campaign_id BIGINT NULL,
   code VARCHAR(50) NOT NULL UNIQUE,
   title VARCHAR(255) NOT NULL,
   description TEXT NULL,
   issuer_type VARCHAR(20) NOT NULL,
   issuer_id BIGINT NULL,
   discount_type VARCHAR(20) NOT NULL,
   discount_percent DECIMAL(5,2) NULL,
   discount_amount DECIMAL(18,2) NULL,
   max_discount_amount DECIMAL(18,2) NULL,
   min_order_value DECIMAL(18,2) NOT NULL DEFAULT 0,
   max_order_value DECIMAL(18,2) NULL,
   total_quota INT NOT NULL,
   claimed_count INT NOT NULL DEFAULT 0,
   redeemed_count INT NOT NULL DEFAULT 0,
   per_user_quota INT NOT NULL DEFAULT 1,
   stackable BOOLEAN NOT NULL DEFAULT FALSE,
   claim_start_at DATETIME NOT NULL,
   claim_end_at DATETIME NOT NULL,
   valid_from DATETIME NOT NULL,
   valid_to DATETIME NOT NULL,
   status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
   priority INT NOT NULL DEFAULT 100,
   created_by BIGINT NULL,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   CONSTRAINT fk_voucher_campaign FOREIGN KEY (campaign_id) REFERENCES voucher_campaign(id),
   CHECK (issuer_type IN ('PLATFORM', 'SHOP', 'BRAND')),
   CHECK (discount_type IN ('PERCENT', 'FIXED', 'FREE_SHIPPING', 'GIFT_ITEM')),
   CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED', 'ARCHIVED')),
   CHECK (claim_start_at < claim_end_at),
   CHECK (valid_from <= valid_to),
   CHECK (total_quota >= 0),
   CHECK (per_user_quota >= 1),
   CHECK (
      (discount_type = 'PERCENT' AND discount_percent IS NOT NULL AND discount_amount IS NULL)
      OR
      (discount_type = 'FIXED' AND discount_amount IS NOT NULL AND discount_percent IS NULL)
      OR
      (discount_type IN ('FREE_SHIPPING', 'GIFT_ITEM'))
   )
);
```

#### `voucher_gift_item`

Chỉ dùng khi voucher là loại `GIFT_ITEM`.

```sql
CREATE TABLE voucher_gift_item (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   voucher_id BIGINT NOT NULL,
   product_id BIGINT NOT NULL,
   variant_id BIGINT NULL,
   quantity INT NOT NULL DEFAULT 1,
   CONSTRAINT fk_voucher_gift_item_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id) ON DELETE CASCADE,
   UNIQUE KEY uk_voucher_gift_item (voucher_id, product_id, variant_id),
   CHECK (quantity >= 1)
);
```

### 2.2 Bảng rule phạm vi áp dụng voucher

Thiết kế theo kiểu rule table để dễ mở rộng.

#### `voucher_scope_rule`

```sql
CREATE TABLE voucher_scope_rule (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   voucher_id BIGINT NOT NULL,
   scope_type VARCHAR(30) NOT NULL,
   scope_id BIGINT NOT NULL,
   include_exclude VARCHAR(10) NOT NULL DEFAULT 'INCLUDE',
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT fk_scope_rule_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id) ON DELETE CASCADE,
   CHECK (scope_type IN ('SHOP', 'CATEGORY', 'PRODUCT', 'BRAND', 'PAYMENT_METHOD', 'SHIPPING_METHOD')),
   CHECK (include_exclude IN ('INCLUDE', 'EXCLUDE')),
   UNIQUE KEY uk_scope_rule (voucher_id, scope_type, scope_id, include_exclude)
);
```

#### `voucher_user_segment_rule`

```sql
CREATE TABLE voucher_user_segment_rule (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   voucher_id BIGINT NOT NULL,
   segment_type VARCHAR(30) NOT NULL,
   segment_value VARCHAR(100) NULL,
   CONSTRAINT fk_user_segment_rule_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id) ON DELETE CASCADE,
   CHECK (segment_type IN ('NEW_USER', 'VIP', 'APP_ONLY', 'MEMBERSHIP_TIER', 'FIRST_ORDER')),
   UNIQUE KEY uk_user_segment_rule (voucher_id, segment_type, segment_value)
);
```

### 2.3 Bảng phát sinh khi user claim/redeem

#### `user_voucher`

Mỗi lần user claim một voucher tạo 1 bản ghi.

```sql
CREATE TABLE user_voucher (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   user_id BIGINT NOT NULL,
   voucher_id BIGINT NOT NULL,
   claim_channel VARCHAR(20) NOT NULL DEFAULT 'APP',
   claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   status VARCHAR(20) NOT NULL DEFAULT 'CLAIMED',
   reserved_order_id BIGINT NULL,
   reserved_at DATETIME NULL,
   expired_at DATETIME NULL,
   redeemed_at DATETIME NULL,
   CONSTRAINT fk_user_voucher_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id),
   CHECK (claim_channel IN ('APP', 'WEB', 'AUTO_ISSUE', 'CS_SUPPORT')),
   CHECK (status IN ('CLAIMED', 'RESERVED', 'REDEEMED', 'CANCELLED', 'EXPIRED')),
   UNIQUE KEY uk_user_voucher_claim (user_id, voucher_id, id),
   KEY idx_user_voucher_user_status (user_id, status),
   KEY idx_user_voucher_voucher_status (voucher_id, status)
);
```

#### `voucher_redemption`

Log sử dụng voucher theo order.

```sql
CREATE TABLE voucher_redemption (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   user_voucher_id BIGINT NOT NULL,
   voucher_id BIGINT NOT NULL,
   user_id BIGINT NOT NULL,
   order_id BIGINT NOT NULL,
   order_code VARCHAR(50) NULL,
   original_shipping_fee DECIMAL(18,2) NULL,
   original_order_amount DECIMAL(18,2) NOT NULL,
   discount_amount_applied DECIMAL(18,2) NOT NULL,
   final_order_amount DECIMAL(18,2) NOT NULL,
   redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
   failure_reason VARCHAR(255) NULL,
   CONSTRAINT fk_redemption_user_voucher FOREIGN KEY (user_voucher_id) REFERENCES user_voucher(id),
   CONSTRAINT fk_redemption_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id),
   CHECK (status IN ('SUCCESS', 'FAILED', 'ROLLED_BACK')),
   UNIQUE KEY uk_redemption_order_voucher (order_id, voucher_id),
   KEY idx_redemption_user (user_id),
   KEY idx_redemption_voucher_time (voucher_id, redeemed_at)
);
```

#### `voucher_audit_log`

Lưu dấu vết thay đổi và các sự kiện quan trọng.

```sql
CREATE TABLE voucher_audit_log (
   id BIGINT PRIMARY KEY AUTO_INCREMENT,
   voucher_id BIGINT NOT NULL,
   event_type VARCHAR(40) NOT NULL,
   actor_type VARCHAR(20) NOT NULL,
   actor_id BIGINT NULL,
   entity_type VARCHAR(40) NOT NULL,
   entity_id BIGINT NULL,
   old_data JSON NULL,
   new_data JSON NULL,
   note VARCHAR(255) NULL,
   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT fk_audit_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id),
   KEY idx_audit_voucher_time (voucher_id, created_at)
);
```

## 3) Index quan trọng (bổ sung)

```sql
CREATE INDEX idx_voucher_status_time ON voucher(status, claim_start_at, claim_end_at, valid_from, valid_to);
CREATE INDEX idx_voucher_issuer ON voucher(issuer_type, issuer_id, status);
CREATE INDEX idx_scope_rule_lookup ON voucher_scope_rule(scope_type, scope_id, include_exclude);
CREATE INDEX idx_user_voucher_lookup ON user_voucher(user_id, voucher_id, status);
CREATE INDEX idx_redemption_order ON voucher_redemption(order_id, status);
```

## 4) Luồng nghiệp vụ chuẩn

1. Tạo voucher ở trạng thái `DRAFT`.
2. Duyệt và chuyển `ACTIVE`.
3. Trong cửa sổ claim (`claim_start_at` - `claim_end_at`), user claim vào `user_voucher`.
4. Checkout: validate điều kiện + lock bản ghi `user_voucher` để reserve.
5. Khi order thành công: ghi `voucher_redemption`, cập nhật `user_voucher.status = REDEEMED`, tăng `voucher.redeemed_count`.
6. Nếu order fail/cancel: rollback reserve, chuyển lại `CLAIMED` hoặc `CANCELLED` tùy policy.
7. Job định kỳ cập nhật voucher hết hạn sang `EXPIRED`, hết quota sang `DEPLETED`.

## 5) Quy tắc transaction và chống over-claim/over-redeem

- Claim voucher:
  - Lock hàng voucher bằng `SELECT ... FOR UPDATE`.
  - Kiểm tra `claimed_count < total_quota`.
  - Kiểm tra số lần user đã claim/redeem không vượt `per_user_quota`.
  - Insert `user_voucher`, sau đó tăng `claimed_count`.

- Redeem voucher:
  - Lock `user_voucher` theo `id` và `status = CLAIMED`.
  - Re-validate toàn bộ điều kiện theo giỏ hàng hiện tại.
  - Insert `voucher_redemption` (unique `order_id + voucher_id` để chống trùng).
  - Update `user_voucher.status = REDEEMED` và tăng `redeemed_count`.

## 6) Mở rộng tương lai

- Hỗ trợ stack nhiều voucher theo nhóm (shipping + product + payment).
- Hỗ trợ ngân sách đồng tài trợ: platform/shop/brand chia tỷ lệ giảm giá.
- Thêm bảng `voucher_usage_daily_stats` để tối ưu dashboard BI.
- Thêm rule engine JSON cho điều kiện phức tạp nếu cần.

## 7) Khuyến nghị tích hợp với microservice hiện tại

- `voucher-service`: quản lý cấu hình voucher, publish events.
- `order-service`: gọi validate/redeem voucher theo transaction hoặc saga.
- `cart-service`: chỉ gợi ý voucher phù hợp, không ghi nhận redeem chính thức.
- Dùng event `VoucherRedeemed`, `VoucherReleased`, `VoucherExpired` cho đồng bộ liên service.
