TÀI LIỆU PHÂN TÍCH ĐIỀU CHỈNH SỐ LƯỢNG KIỆN HÀNG

1. Mục tiêu nghiệp vụ
   Theo ADJUST_QUANTITY_BUSSINESS_WORKFLOW.md, khi shop không đủ hàng trong kiện:

Shop có 2 lựa chọn:
Hủy kiện (kèm lý do hiển thị cho buyer)
Điều chỉnh số lượng item trong kiện (giảm số lượng hoặc bỏ item)
Buyer có 2 lựa chọn:
Chấp nhận điều chỉnh -> shop tiếp tục giao kiện với số lượng mới
Không chấp nhận -> hủy kiện/đơn theo rule
Nếu payment khác COD: khi logistic đã nhận hàng thì hoàn phần thiếu
Nếu COD: trừ phần thiếu vào COD phải thu 2) Hiện trạng schema trong ECOMMERCE.sql
Các bảng liên quan hiện tại:

orders: có payment_method, payment_status, order_status, cancelled_reason, ...
order_shipment: có shipping_status, tracking_number, total_amount, shop_id, ...
order_item: đã có shipment_id, shop_id, quantity, price, total_price
Gap chính:

Chưa có mô hình “đề xuất điều chỉnh số lượng” và vòng đời phê duyệt buyer
Chưa có lưu vết chi tiết item nào giảm bao nhiêu
Chưa có trạng thái nghiệp vụ riêng cho shipment khi đang chờ buyer duyệt
Chưa có trường phản ánh xử lý tài chính do thiếu hàng (refund/cod adjustment) 3) Thiết kế dữ liệu đề xuất
3.1 Bảng header yêu cầu điều chỉnh
shipment_adjustment_request (mỗi lần shop gửi đề xuất chỉnh cho 1 kiện)

Trường đề xuất:

id PK
order_shipment_id FK -> order_shipment.id
order_id FK -> orders.id (truy vấn nhanh)
shop_id FK -> shop.id
request_code unique
status ENUM:
PENDING_BUYER
ACCEPTED_BY_BUYER
REJECTED_BY_BUYER
CANCELLED_BY_SHOP
EXPIRED
shop_reason TEXT
buyer_note TEXT NULL
total_original_amount DECIMAL(15,2)
total_adjusted_amount DECIMAL(15,2)
total_diff_amount DECIMAL(15,2) (original - adjusted)
expires_at DATETIME NULL
responded_at DATETIME NULL
created_at, updated_at
3.2 Bảng chi tiết item bị chỉnh
shipment_adjustment_item

id PK
adjustment_request_id FK -> shipment_adjustment_request.id
order_item_id FK -> order_item.id
product_id, variant_id (snapshot)
product_name, variant_name (snapshot)
old_quantity INT
new_quantity INT
unit_price DECIMAL(15,2)
old_total DECIMAL(15,2)
new_total DECIMAL(15,2)
diff_total DECIMAL(15,2)
Ràng buộc:

new_quantity >= 0
new_quantity <= old_quantity
3.3 Bảng ghi nhận bù trừ tài chính thiếu hàng (khuyến nghị)
shipment_adjustment_financial

id PK
adjustment_request_id FK
order_id FK
payment_method_snapshot VARCHAR(20)
action_type ENUM(REFUND_NON_COD,REDUCE_COD,NONE)
amount DECIMAL(15,2)
status ENUM(PENDING,PROCESSED,FAILED)
processed_at, created_at, updated_at
external_txn_ref VARCHAR(100) NULL 4) Cập nhật bảng hiện có
4.1 order_shipment
Thêm:

business_status VARCHAR(50) DEFAULT NORMAL
NORMAL, ADJUSTMENT_PENDING_BUYER, ADJUSTMENT_ACCEPTED, ADJUSTMENT_REJECTED, CANCELLED_BY_OOS
latest_adjustment_request_id BIGINT NULL
adjusted_total_amount DECIMAL(15,2) NULL
adjustment_required TINYINT(1) DEFAULT 0
4.2 order_item
Thêm:

final_quantity INT NULL (số lượng chốt sau khi buyer chấp nhận)
is_adjusted TINYINT(1) DEFAULT 0
Lưu ý: giữ nguyên quantity là số lượng đặt ban đầu để audit; dùng final_quantity cho số lượng đã chốt giao.

5. Mapping trạng thái nghiệp vụ
   5.1 Adjustment Request (shipment_adjustment_request.status)
   PENDING_BUYER: shop đã gửi đề xuất
   ACCEPTED_BY_BUYER: buyer chấp nhận
   REJECTED_BY_BUYER: buyer từ chối
   CANCELLED_BY_SHOP: shop hủy đề xuất
   EXPIRED: quá hạn không phản hồi
   5.2 Shipment (order_shipment.business_status)
   ADJUSTMENT_PENDING_BUYER khi request ở PENDING_BUYER
   ADJUSTMENT_ACCEPTED khi buyer accept
   ADJUSTMENT_REJECTED khi buyer reject
   CANCELLED_BY_OOS khi thiếu hàng và hủy kiện
6. Luồng xử lý dữ liệu chuẩn
   Shop phát hiện thiếu hàng ở kiện order_shipment
   Tạo shipment_adjustment_request + các shipment_adjustment_item
   Cập nhật order_shipment.business_status = ADJUSTMENT_PENDING_BUYER
   Buyer phản hồi:
   Accept:
   cập nhật request -> ACCEPTED_BY_BUYER
   cập nhật order_item.final_quantity, is_adjusted=1
   cập nhật order_shipment.adjusted_total_amount
   ghi shipment_adjustment_financial (refund/cod reduction)
   Reject:
   cập nhật request -> REJECTED_BY_BUYER
   hủy kiện hoặc hủy phần đơn theo business rule
   Đồng bộ qua logistic service sau khi đã chốt số lượng cuối
7. SQL migration khung (gợi ý)
   Tạo 3 bảng mới: shipment_adjustment_request, shipment_adjustment_item, shipment_adjustment_financial
   Alter order_shipment, order_item
   Tạo index:
   shipment_adjustment_request(order_shipment_id, status, created_at)
   shipment_adjustment_item(adjustment_request_id, order_item_id)
   shipment_adjustment_financial(adjustment_request_id, status)
8. Tương thích với logistic.sql / logistic-service.md
   Trong logistic.sql, shipment.order_shipment_ref_id đang tham chiếu mềm tới ecommerce shipment.
   => Chỉ gửi sang logistics khi:

buyer đã accept chỉnh, hoặc
không có chỉnh số lượng.
Nếu đã tạo shipment logistics rồi mà mới phát sinh thiếu hàng:

nên chặn chỉnh (quy trình chặt), hoặc
bắt buộc tạo luồng “cancel shipment + recreate shipment” (phức tạp hơn, cần tài liệu riêng). 9) Rủi ro và lưu ý triển khai
Consistency: cập nhật nhiều bảng phải trong transaction
Idempotency: API buyer accept/reject phải chống bấm lặp
Concurrency: khóa kiện để không có 2 request pending cùng lúc
Audit: không overwrite dữ liệu gốc, lưu snapshot đầy đủ
Financial: xử lý refund/cod adjustment theo event async để tránh timeout 10) Kiểm thử bắt buộc
Shop giảm 1 phần item, buyer accept -> cập nhật đúng quantity + amount
Shop remove item (new_quantity=0), buyer accept
Buyer reject -> kiện chuyển trạng thái hủy phù hợp
COD và non-COD cho cùng một kịch bản thiếu hàng
Không cho tạo request mới khi đã có request PENDING_BUYER
Nếu bạn muốn, mình có thể soạn luôn phiên bản SQL migration chi tiết (CREATE/ALTER đầy đủ) bám đúng naming hiện tại trong ECOMMERCE.sql để bạn chạy trực tiếp.
