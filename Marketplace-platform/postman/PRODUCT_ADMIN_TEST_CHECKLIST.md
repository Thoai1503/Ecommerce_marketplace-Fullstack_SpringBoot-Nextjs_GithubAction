# Product Admin API Test Checklist

Tài liệu này tổng hợp test case cho tính năng **sản phẩm trong phần admin** để team dùng làm checklist QA/API test sau này.

## Phạm vi hiện tại
Trong collection product-admin hiện có request:
- `GET /products` hoặc endpoint tương đương: **Lấy tất cả sản phẩm**

> Ghi chú: Hiện trong thư mục `product-admin` mới thấy 1 request lấy danh sách sản phẩm. File checklist này sẽ viết đầy đủ cho tính năng product admin theo hướng mở rộng, để sau này team bổ sung thêm các endpoint như detail/create/update/delete/status/approve nếu có.

---

# A. Checklist cho endpoint hiện có: Lấy tất cả sản phẩm

## 1) Functional cơ bản
- [ ] **PROD-LIST-01**: Trả về `200 OK` khi request hợp lệ
- [ ] **PROD-LIST-02**: Response body đúng kiểu dữ liệu mong đợi (array hoặc object chứa danh sách)
- [ ] **PROD-LIST-03**: Nếu response là object, phải có field danh sách như `items` / `data`
- [ ] **PROD-LIST-04**: Nếu response có metadata, kiểm tra các field như `page`, `limit`, `total`, `totalPages`
- [ ] **PROD-LIST-05**: Danh sách trả về không null
- [ ] **PROD-LIST-06**: Mỗi item phải là object hợp lệ
- [ ] **PROD-LIST-07**: API vẫn trả đúng format khi danh sách rỗng

## 2) Schema validation cho từng sản phẩm
- [ ] **PROD-LIST-SCHEMA-01**: Mỗi item có `id`
- [ ] **PROD-LIST-SCHEMA-02**: `id` đúng kiểu dữ liệu và không rỗng
- [ ] **PROD-LIST-SCHEMA-03**: Có `name`
- [ ] **PROD-LIST-SCHEMA-04**: `name` là string và không rỗng
- [ ] **PROD-LIST-SCHEMA-05**: Có `price`
- [ ] **PROD-LIST-SCHEMA-06**: `price` là number và không âm
- [ ] **PROD-LIST-SCHEMA-07**: Nếu có `discountPrice`, giá trị không âm và không lớn hơn `price`
- [ ] **PROD-LIST-SCHEMA-08**: Nếu có `stock`, phải là số nguyên >= 0
- [ ] **PROD-LIST-SCHEMA-09**: Nếu có `status`, giá trị phải thuộc enum cho phép
- [ ] **PROD-LIST-SCHEMA-10**: Nếu có `categoryId`, field không rỗng
- [ ] **PROD-LIST-SCHEMA-11**: Nếu có `sellerId`, field không rỗng
- [ ] **PROD-LIST-SCHEMA-12**: Nếu có `thumbnail`, phải là string hoặc URL hợp lệ theo thiết kế
- [ ] **PROD-LIST-SCHEMA-13**: Nếu có `images`, phải là array
- [ ] **PROD-LIST-SCHEMA-14**: Nếu có `createdAt`, phải parse được thành datetime hợp lệ
- [ ] **PROD-LIST-SCHEMA-15**: Nếu có `updatedAt`, phải parse được thành datetime hợp lệ

## 3) Dữ liệu nghiệp vụ
- [ ] **PROD-LIST-DATA-01**: Không có item bị trùng `id`
- [ ] **PROD-LIST-DATA-02**: Không có item có `name` rỗng hoặc chỉ chứa khoảng trắng
- [ ] **PROD-LIST-DATA-03**: Không có giá âm
- [ ] **PROD-LIST-DATA-04**: Không có stock âm
- [ ] **PROD-LIST-DATA-05**: Nếu có trạng thái hiển thị, giá trị phải đúng rule hệ thống
- [ ] **PROD-LIST-DATA-06**: Nếu có cờ soft-delete, admin list phải thống nhất rõ có/không trả item đã xóa mềm
- [ ] **PROD-LIST-DATA-07**: Nếu có field seller, dữ liệu seller gắn với product phải hợp lệ
- [ ] **PROD-LIST-DATA-08**: Nếu có category, category gắn với product phải hợp lệ

## 4) Pagination / filter / sort (nếu API hỗ trợ)
- [ ] **PROD-LIST-PAGE-01**: `page=1`, `limit` hợp lệ -> trả đúng số lượng item
- [ ] **PROD-LIST-PAGE-02**: `limit=1` -> chỉ trả 1 item
- [ ] **PROD-LIST-PAGE-03**: `page` vượt quá tổng số trang -> trả danh sách rỗng hoặc theo contract
- [ ] **PROD-LIST-PAGE-04**: `page=0` hoặc âm -> trả `400 Bad Request`
- [ ] **PROD-LIST-PAGE-05**: `limit=0` hoặc âm -> trả `400`
- [ ] **PROD-LIST-PAGE-06**: `limit` vượt mức tối đa hệ thống -> trả `400` hoặc bị clamp theo rule
- [ ] **PROD-LIST-FILTER-01**: Filter theo `status` hợp lệ -> chỉ trả item đúng status
- [ ] **PROD-LIST-FILTER-02**: Filter theo `sellerId` hợp lệ -> chỉ trả item của seller đó
- [ ] **PROD-LIST-FILTER-03**: Filter theo `categoryId` hợp lệ -> chỉ trả item thuộc category đó
- [ ] **PROD-LIST-FILTER-04**: Filter keyword theo tên sản phẩm -> kết quả khớp keyword
- [ ] **PROD-LIST-FILTER-05**: Filter giá min/max hợp lệ -> item nằm trong khoảng giá
- [ ] **PROD-LIST-FILTER-06**: `minPrice > maxPrice` -> trả `400`
- [ ] **PROD-LIST-FILTER-07**: Filter status không hợp lệ -> trả `400`
- [ ] **PROD-LIST-FILTER-08**: Filter theo sellerId không đúng format -> trả `400`
- [ ] **PROD-LIST-SORT-01**: Sort theo giá tăng dần -> danh sách được sắp xếp đúng
- [ ] **PROD-LIST-SORT-02**: Sort theo giá giảm dần -> danh sách được sắp xếp đúng
- [ ] **PROD-LIST-SORT-03**: Sort theo createdAt -> đúng thứ tự mong đợi
- [ ] **PROD-LIST-SORT-04**: Sort field không hợp lệ -> trả `400`

## 5) Auth / permission cho admin product list
- [ ] **PROD-LIST-AUTH-01**: Không token -> `401`
- [ ] **PROD-LIST-AUTH-02**: Token invalid / expired -> `401`
- [ ] **PROD-LIST-AUTH-03**: User không có quyền admin product -> `403`
- [ ] **PROD-LIST-AUTH-04**: Admin hợp lệ truy cập được -> `200`
- [ ] **PROD-LIST-AUTH-05**: Nếu có phân tenant, admin tenant A không được xem product tenant B -> `403` hoặc `404`

## 6) Performance / reliability
- [ ] **PROD-LIST-PERF-01**: Response time trong ngưỡng chấp nhận được
- [ ] **PROD-LIST-PERF-02**: API không lỗi khi số lượng sản phẩm lớn
- [ ] **PROD-LIST-PERF-03**: API không trả duplicate item khi dataset lớn
- [ ] **PROD-LIST-PERF-04**: Metadata pagination vẫn chính xác khi dataset lớn

---

# B. Checklist mở rộng cho toàn bộ tính năng Product Admin

> Phần dưới đây để team dùng sau khi bổ sung các endpoint product admin khác.

## 1) GET /products/:id - Lấy chi tiết sản phẩm
- [ ] **PROD-DETAIL-01**: ID hợp lệ -> `200 OK`
- [ ] **PROD-DETAIL-02**: Response có đầy đủ field chính của sản phẩm
- [ ] **PROD-DETAIL-03**: `id` trong response khớp ID đã request
- [ ] **PROD-DETAIL-04**: ID không tồn tại -> `404 Not Found`
- [ ] **PROD-DETAIL-05**: ID sai format -> `400 Bad Request`
- [ ] **PROD-DETAIL-06**: Product bị xóa mềm xử lý đúng theo policy admin
- [ ] **PROD-DETAIL-07**: Không token -> `401`
- [ ] **PROD-DETAIL-08**: Không có quyền xem detail -> `403`
- [ ] **PROD-DETAIL-09**: Kiểm tra dữ liệu biến thể, ảnh, category, seller nếu có
- [ ] **PROD-DETAIL-10**: Các field datetime parse hợp lệ

## 2) POST /products - Tạo sản phẩm
- [ ] **PROD-CREATE-01**: Tạo sản phẩm với payload hợp lệ -> `201 Created`
- [ ] **PROD-CREATE-02**: Response trả về `id` của sản phẩm mới tạo
- [ ] **PROD-CREATE-03**: Sau khi tạo, gọi detail phải thấy dữ liệu đã persist
- [ ] **PROD-CREATE-04**: Thiếu `name` -> `400`
- [ ] **PROD-CREATE-05**: `name` rỗng -> `400`
- [ ] **PROD-CREATE-06**: `price` thiếu -> `400`
- [ ] **PROD-CREATE-07**: `price` âm -> `400`
- [ ] **PROD-CREATE-08**: `stock` âm -> `400`
- [ ] **PROD-CREATE-09**: `categoryId` không tồn tại -> `400` hoặc `404`
- [ ] **PROD-CREATE-10**: `sellerId` không tồn tại -> `400` hoặc `404`
- [ ] **PROD-CREATE-11**: `discountPrice > price` -> `400`
- [ ] **PROD-CREATE-12**: payload thừa field nhạy cảm bị reject hoặc ignore theo contract
- [ ] **PROD-CREATE-13**: Không token -> `401`
- [ ] **PROD-CREATE-14**: Không có quyền tạo product -> `403`
- [ ] **PROD-CREATE-15**: Upload / images sai format -> `400`
- [ ] **PROD-CREATE-16**: Tạo trùng slug / SKU nếu hệ thống yêu cầu unique -> `409` hoặc `400`

## 3) PATCH /products/:id - Cập nhật sản phẩm
- [ ] **PROD-UPDATE-01**: Update field hợp lệ -> `200 OK`
- [ ] **PROD-UPDATE-02**: Sau update, gọi detail trả về dữ liệu mới
- [ ] **PROD-UPDATE-03**: Update product không tồn tại -> `404`
- [ ] **PROD-UPDATE-04**: ID sai format -> `400`
- [ ] **PROD-UPDATE-05**: Update `price` âm -> `400`
- [ ] **PROD-UPDATE-06**: Update `stock` âm -> `400`
- [ ] **PROD-UPDATE-07**: Update `discountPrice > price` -> `400`
- [ ] **PROD-UPDATE-08**: Update category không tồn tại -> `400` hoặc `404`
- [ ] **PROD-UPDATE-09**: Update seller không tồn tại -> `400` hoặc `404`
- [ ] **PROD-UPDATE-10**: Không token -> `401`
- [ ] **PROD-UPDATE-11**: Không có quyền update -> `403`
- [ ] **PROD-UPDATE-12**: Không được update field read-only / system-managed nếu policy cấm

## 4) PATCH /products/:id/status - Đổi trạng thái sản phẩm
- [ ] **PROD-STATUS-01**: Đổi từ draft sang active hợp lệ -> `200`
- [ ] **PROD-STATUS-02**: Đổi sang status không hợp lệ -> `400`
- [ ] **PROD-STATUS-03**: Product không tồn tại -> `404`
- [ ] **PROD-STATUS-04**: Không token -> `401`
- [ ] **PROD-STATUS-05**: Không đủ quyền -> `403`
- [ ] **PROD-STATUS-06**: Kiểm tra state transition đúng rule hệ thống

## 5) DELETE /products/:id - Xóa mềm sản phẩm
- [ ] **PROD-DELETE-01**: Soft delete product hợp lệ -> `200` hoặc `204`
- [ ] **PROD-DELETE-02**: Gọi lại detail sau xóa trả đúng theo policy
- [ ] **PROD-DELETE-03**: Product không tồn tại -> `404`
- [ ] **PROD-DELETE-04**: Không token -> `401`
- [ ] **PROD-DELETE-05**: Không có quyền xóa -> `403`
- [ ] **PROD-DELETE-06**: Xóa lặp lại lần 2 xử lý đúng theo contract

## 6) Bulk actions nếu admin product hỗ trợ
- [ ] **PROD-BULK-01**: Bulk approve / bulk status với danh sách ID hợp lệ -> thành công
- [ ] **PROD-BULK-02**: Một phần ID không tồn tại -> xử lý partial failure đúng contract
- [ ] **PROD-BULK-03**: Danh sách ID trùng nhau -> xử lý đúng
- [ ] **PROD-BULK-04**: Danh sách rỗng -> `400`
- [ ] **PROD-BULK-05**: Không có quyền -> `403`

## 7) Workflow end-to-end cho product admin
- [ ] **PROD-FLOW-01**: Tạo product -> get detail -> update -> verify dữ liệu
- [ ] **PROD-FLOW-02**: Tạo product -> đổi status -> list lại -> verify xuất hiện đúng trạng thái
- [ ] **PROD-FLOW-03**: Tạo product -> soft delete -> detail/list phản ánh đúng trạng thái xóa
- [ ] **PROD-FLOW-04**: Product thuộc seller bị block thì khả năng hiển thị / status xử lý đúng theo business rule
- [ ] **PROD-FLOW-05**: Category bị vô hiệu hóa thì product liên quan xử lý đúng theo business rule

---

# C. Biến nên chuẩn bị trong Postman sau này
- [ ] `productId`
- [ ] `invalidProductId`
- [ ] `sellerId`
- [ ] `categoryId`
- [ ] `adminToken`
- [ ] `unauthorizedToken`
- [ ] `draftProductId`
- [ ] `deletedProductId`

---

# D. Ưu tiên implement

## Ưu tiên cao
- [ ] List trả đúng schema và dữ liệu hợp lệ
- [ ] Detail invalid ID / not found
- [ ] Create invalid body
- [ ] Update invalid body
- [ ] Auth / permission cho toàn bộ admin product API
- [ ] Verify dữ liệu sau create / update / delete

## Ưu tiên trung bình
- [ ] Pagination / filter / sort
- [ ] Business rule giữa product - seller - category
- [ ] Bulk actions
- [ ] Performance dataset lớn
