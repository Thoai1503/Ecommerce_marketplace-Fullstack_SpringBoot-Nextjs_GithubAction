# Tài liệu thuộc tính các bảng voucher (Data Dictionary)

Tài liệu này giải thích ý nghĩa từng thuộc tính trong các bảng của mô hình voucher mới.
Phạm vi áp dụng: voucher campaign, rule áp dụng, claim/redeem, audit.

## 1) Bảng voucher_campaign

Mục đích: Nhóm nhiều voucher vào cùng một chiến dịch để quản trị và báo cáo.

| Thuộc tính  | Ý nghĩa                       | Lưu ý nghiệp vụ                                              |
| ----------- | ----------------------------- | ------------------------------------------------------------ |
| id          | Khóa chính chiến dịch         | Auto increment                                               |
| code        | Mã chiến dịch duy nhất        | Dùng cho tra cứu nhanh, nên theo convention marketing        |
| name        | Tên chiến dịch                | Hiển thị cho admin                                           |
| description | Mô tả chiến dịch              | Tùy chọn                                                     |
| start_at    | Thời gian bắt đầu chiến dịch  | Phải nhỏ hơn end_at                                          |
| end_at      | Thời gian kết thúc chiến dịch | Hết thời gian thì không phát hành voucher mới trong campaign |
| status      | Trạng thái chiến dịch         | DRAFT, ACTIVE, PAUSED, ENDED, CANCELLED                      |
| created_by  | ID user admin tạo campaign    | Nullable nếu migrate dữ liệu cũ                              |
| created_at  | Thời điểm tạo bản ghi         | Tự động sinh                                                 |
| updated_at  | Thời điểm cập nhật gần nhất   | Tự động cập nhật                                             |

## 2) Bảng voucher

Mục đích: Bảng cấu hình trung tâm cho từng voucher.

| Thuộc tính          | Ý nghĩa                              | Lưu ý nghiệp vụ                                                  |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| id                  | Khóa chính voucher                   | Auto increment                                                   |
| campaign_id         | Liên kết campaign                    | Nullable, FK sang voucher_campaign.id                            |
| code                | Mã voucher duy nhất                  | Mã user nhập hoặc hệ thống sinh                                  |
| title               | Tên hiển thị voucher                 | Dùng ở app/web/admin                                             |
| description         | Mô tả chi tiết                       | Điều khoản ngắn gọn                                              |
| issuer_type         | Loại bên phát hành                   | PLATFORM, SHOP, BRAND                                            |
| issuer_id           | ID của bên phát hành                 | SHOP thì là shop_id, BRAND thì là brand_id, PLATFORM có thể null |
| discount_type       | Loại giảm giá                        | PERCENT, FIXED, FREE_SHIPPING, GIFT_ITEM                         |
| discount_percent    | Phần trăm giảm                       | Dùng khi discount_type=PERCENT                                   |
| discount_amount     | Số tiền giảm cố định                 | Dùng khi discount_type=FIXED                                     |
| max_discount_amount | Số tiền giảm tối đa                  | Thường dùng với PERCENT                                          |
| min_order_value     | Giá trị đơn tối thiểu                | Điều kiện áp dụng bắt buộc phổ biến                              |
| max_order_value     | Giá trị đơn tối đa                   | Tùy chọn theo chiến lược                                         |
| total_quota         | Tổng số lượt phát hành/cho phép dùng | Quota toàn hệ thống                                              |
| claimed_count       | Số lượt đã claim                     | Tăng khi user claim thành công                                   |
| redeemed_count      | Số lượt đã redeem                    | Tăng khi áp voucher vào đơn thành công                           |
| per_user_quota      | Giới hạn mỗi user                    | Ví dụ 1 user chỉ dùng tối đa 1 lần                               |
| stackable           | Có cho phép cộng dồn voucher không   | true/false                                                       |
| claim_start_at      | Bắt đầu thời gian claim              | User chỉ claim trong khoảng này                                  |
| claim_end_at        | Kết thúc thời gian claim             | Sau mốc này không claim mới                                      |
| valid_from          | Bắt đầu hiệu lực sử dụng             | Dùng khi checkout/redeem                                         |
| valid_to            | Kết thúc hiệu lực sử dụng            | Quá hạn thì không redeem được                                    |
| status              | Trạng thái voucher                   | DRAFT, ACTIVE, PAUSED, EXPIRED, DEPLETED, ARCHIVED               |
| priority            | Độ ưu tiên áp dụng                   | Số nhỏ hơn có thể ưu tiên trước (tùy rule engine)                |
| created_by          | ID admin tạo voucher                 | Nullable khi migrate                                             |
| created_at          | Thời điểm tạo                        | Tự động sinh                                                     |
| updated_at          | Thời điểm cập nhật gần nhất          | Tự động cập nhật                                                 |

### Quy tắc quan trọng bảng voucher

- Nếu discount_type=PERCENT thì bắt buộc có discount_percent và không dùng discount_amount.
- Nếu discount_type=FIXED thì bắt buộc có discount_amount và không dùng discount_percent.
- claim_start_at phải nhỏ hơn claim_end_at.
- valid_from phải nhỏ hơn hoặc bằng valid_to.
- per_user_quota phải >= 1.

## 3) Bảng voucher_gift_item

Mục đích: Cấu hình quà tặng khi voucher loại GIFT_ITEM.

| Thuộc tính | Ý nghĩa                | Lưu ý nghiệp vụ                    |
| ---------- | ---------------------- | ---------------------------------- |
| id         | Khóa chính             | Auto increment                     |
| voucher_id | Voucher tặng quà       | FK sang voucher.id                 |
| product_id | Sản phẩm được tặng     | FK product.id                      |
| variant_id | Biến thể tặng (nếu có) | FK product_variant.id, có thể null |
| quantity   | Số lượng tặng          | >= 1                               |

## 4) Bảng voucher_scope_rule

Mục đích: Xác định phạm vi áp dụng voucher theo shop/category/product/brand/phương thức.

| Thuộc tính      | Ý nghĩa                  | Lưu ý nghiệp vụ                                                 |
| --------------- | ------------------------ | --------------------------------------------------------------- |
| id              | Khóa chính rule          | Auto increment                                                  |
| voucher_id      | Voucher áp dụng rule     | FK sang voucher.id                                              |
| scope_type      | Loại phạm vi             | SHOP, CATEGORY, PRODUCT, BRAND, PAYMENT_METHOD, SHIPPING_METHOD |
| scope_id        | ID của đối tượng phạm vi | Ví dụ category_id, product_id, shop_id                          |
| include_exclude | Kiểu áp dụng             | INCLUDE hoặc EXCLUDE                                            |
| created_at      | Thời điểm tạo rule       | Tự động sinh                                                    |

### Ví dụ

- scope_type=CATEGORY, scope_id=183, include_exclude=INCLUDE: chỉ áp cho ngành hàng 183.
- scope_type=PRODUCT, scope_id=125, include_exclude=EXCLUDE: loại trừ sản phẩm 125.

## 5) Bảng voucher_user_segment_rule

Mục đích: Giới hạn đối tượng người dùng được sử dụng voucher.

| Thuộc tính    | Ý nghĩa                  | Lưu ý nghiệp vụ                                       |
| ------------- | ------------------------ | ----------------------------------------------------- |
| id            | Khóa chính               | Auto increment                                        |
| voucher_id    | Voucher áp dụng segment  | FK sang voucher.id                                    |
| segment_type  | Loại phân khúc user      | NEW_USER, VIP, APP_ONLY, MEMBERSHIP_TIER, FIRST_ORDER |
| segment_value | Giá trị chi tiết segment | Ví dụ MEMBERSHIP_TIER=GOLD                            |

## 6) Bảng user_voucher

Mục đích: Bản ghi sở hữu voucher theo user sau khi claim.

| Thuộc tính        | Ý nghĩa                        | Lưu ý nghiệp vụ                                 |
| ----------------- | ------------------------------ | ----------------------------------------------- |
| id                | Khóa chính bản ghi claim       | Auto increment                                  |
| user_id           | User claim voucher             | FK sang user.id                                 |
| voucher_id        | Voucher đã claim               | FK sang voucher.id                              |
| claim_channel     | Kênh claim                     | APP, WEB, AUTO_ISSUE, CS_SUPPORT                |
| claimed_at        | Thời điểm claim                | Tự động sinh                                    |
| status            | Trạng thái vòng đời claim      | CLAIMED, RESERVED, REDEEMED, CANCELLED, EXPIRED |
| reserved_order_id | Đơn hàng đang giữ voucher      | FK sang orders.id, nullable                     |
| reserved_at       | Thời điểm reserve              | Dùng khi checkout giữ chỗ                       |
| expired_at        | Thời điểm hết hạn claim record | Có thể set bằng job                             |
| redeemed_at       | Thời điểm redeem thành công    | Set khi tạo redemption success                  |

### Ý nghĩa trạng thái

- CLAIMED: đã nhận voucher, chưa dùng.
- RESERVED: đang giữ tạm cho 1 order trong quá trình checkout.
- REDEEMED: dùng thành công.
- CANCELLED: bị hủy theo policy hoặc admin.
- EXPIRED: hết hạn trước khi dùng.

## 7) Bảng voucher_redemption

Mục đích: Lưu lịch sử áp dụng voucher vào đơn hàng.

| Thuộc tính              | Ý nghĩa                    | Lưu ý nghiệp vụ                  |
| ----------------------- | -------------------------- | -------------------------------- |
| id                      | Khóa chính redemption      | Auto increment                   |
| user_voucher_id         | Bản ghi claim đã dùng      | FK sang user_voucher.id          |
| voucher_id              | Voucher được áp dụng       | FK sang voucher.id               |
| user_id                 | User thực hiện redeem      | FK sang user.id                  |
| order_id                | Đơn hàng áp voucher        | FK sang orders.id                |
| order_code              | Mã đơn hàng                | Lưu snapshot để truy vấn báo cáo |
| original_shipping_fee   | Phí ship trước giảm        | Nullable                         |
| original_order_amount   | Giá trị đơn trước giảm     | Bắt buộc                         |
| discount_amount_applied | Số tiền thực tế được giảm  | Bắt buộc                         |
| final_order_amount      | Giá trị cuối cùng sau giảm | Bắt buộc                         |
| redeemed_at             | Thời điểm redeem           | Tự động sinh                     |
| status                  | Kết quả redeem             | SUCCESS, FAILED, ROLLED_BACK     |
| failure_reason          | Lý do lỗi                  | Ghi khi FAILED/ROLLBACK          |

### Ràng buộc quan trọng

- UNIQUE(order_id, voucher_id): ngăn cùng 1 voucher áp trùng trên cùng đơn.

## 8) Bảng voucher_audit_log

Mục đích: Nhật ký thay đổi cấu hình và sự kiện nghiệp vụ voucher.

| Thuộc tính  | Ý nghĩa                | Lưu ý nghiệp vụ                                           |
| ----------- | ---------------------- | --------------------------------------------------------- |
| id          | Khóa chính log         | Auto increment                                            |
| voucher_id  | Voucher liên quan      | FK sang voucher.id                                        |
| event_type  | Loại sự kiện           | Ví dụ CREATED, UPDATED, STATUS_CHANGED, CLAIMED, REDEEMED |
| actor_type  | Loại tác nhân          | ADMIN, SYSTEM, USER                                       |
| actor_id    | ID tác nhân            | Nullable với SYSTEM job                                   |
| entity_type | Loại entity tác động   | VOUCHER, RULE, USER_VOUCHER, REDEMPTION                   |
| entity_id   | ID bản ghi entity      | Nullable tùy event                                        |
| old_data    | Dữ liệu trước thay đổi | JSON                                                      |
| new_data    | Dữ liệu sau thay đổi   | JSON                                                      |
| note        | Ghi chú ngắn           | Tùy chọn                                                  |
| created_at  | Thời điểm ghi log      | Tự động sinh                                              |

## 9) Mapping nhanh với schema cũ

| Schema cũ                                 | Schema mới                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| voucher.voucher_code                      | voucher.code                                                                   |
| voucher.voucher_name                      | voucher.title                                                                  |
| voucher.discount_value                    | voucher.discount_percent hoặc voucher.discount_amount                          |
| voucher.max_discount                      | voucher.max_discount_amount                                                    |
| voucher.usage_limit                       | voucher.total_quota                                                            |
| voucher.used_count                        | voucher.claimed_count + voucher.redeemed_count                                 |
| voucher.start_date/end_date               | voucher.claim_start_at/claim_end_at + valid_from/valid_to                      |
| voucher_condition, voucher_condition_type | voucher_scope_rule, voucher_user_segment_rule (và mở rộng rule engine nếu cần) |
| voucher_usage_history                     | user_voucher + voucher_redemption                                              |

## 10) Khuyến nghị chuẩn dữ liệu

- Dùng timezone UTC trong database, convert sang local time ở tầng API/UI.
- Chuẩn hóa enum value bằng uppercase để đồng nhất query.
- Không xóa cứng dữ liệu voucher đã phát sinh redeem; ưu tiên status + audit log.
- Khi cần BI/reporting lớn, thêm bảng aggregate theo ngày thay vì query trực tiếp bảng giao dịch.
