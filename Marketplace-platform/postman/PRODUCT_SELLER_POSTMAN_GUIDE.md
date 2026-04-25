# Product & Seller API - Postman Test Guide

## 1. Kết luận nhanh

Hiện tại API cho 2 tính năng **Seller** và **Product** trong dự án **chưa đủ đầy** để xem là một bộ API production-ready hoặc test-ready hoàn chỉnh trong Postman.

### Mức độ hiện tại
- Có các API cơ bản để đọc và tạo dữ liệu.
- Chưa có đủ API update/delete cho các thực thể chính.
- Chưa thấy lớp auth/authorization hoàn chỉnh cho seller thao tác dữ liệu riêng.
- Chưa có bộ quy ước response/error thống nhất để người test dễ xác nhận.
- Chưa có workflow đầy đủ cho nghiệp vụ seller/product lifecycle.

### Đánh giá độ đầy đủ
- Seller feature: khoảng **45%**
- Product feature: khoảng **50%**
- Mức độ sẵn sàng để QA/manual test với Postman: **trung bình thấp**

---

## 2. API hiện đang có thể test

### 2.1 Product public APIs
1. `GET /product`
2. `GET /product/{id}`

### 2.2 Seller product APIs
1. `GET /seller/product`
2. `POST /seller/product`
3. `GET /seller/product/{id}`
4. `GET /seller/product/shop/{id}`

### 2.3 Product image APIs
1. `POST /seller/product-image/product/{id}`
2. `GET /seller/product-image/product/{id}`

### 2.4 Product variant APIs
1. `GET /seller/product-variant/product/{id}`
2. `POST /seller/product-variant`

### 2.5 Seller shop APIs
1. `GET /seller/shop/user/{id}`

---

## 3. Những phần còn thiếu để test đầy đủ

## 3.1 Product
Thiếu hoặc chưa rõ:
- `PUT /seller/product/{id}` để cập nhật sản phẩm
- `DELETE /seller/product/{id}` hoặc soft delete
- filter theo category, status, keyword
- sort theo giá, ngày tạo
- pagination chuẩn
- validate đầu vào rõ ràng
- response schema ổn định

## 3.2 Product Variant
Thiếu hoặc chưa rõ:
- `PUT /seller/product-variant/{id}`
- `DELETE /seller/product-variant/{id}`
- ràng buộc SKU unique
- kiểm tra variant thuộc product nào
- kiểm tra stock âm, price âm

## 3.3 Product Image
Thiếu hoặc chưa rõ:
- xóa ảnh
- cập nhật ảnh chính / thứ tự hiển thị
- validate số lượng ảnh tối đa

## 3.4 Seller domain
Thiếu hoặc chưa rõ:
- auth seller
- kiểm tra seller chỉ xem/sửa product của shop mình
- approval / reject flow đầy đủ
- status lifecycle cho seller hoặc product

---

## 4. Bộ Postman local đã tạo

Đã tạo local collection tại:
- `Marketplace-platform/postman/collections/commerce/seller-product-test-suite/`

Các request đã tạo:
1. `Get public products`
2. `Get product by id`
3. `Get seller shop by user id`
4. `Get seller products`
5. `Create seller product`
6. `Get seller product by id`
7. `Get seller products by shop id`
8. `Add product images`
9. `Get product images by product id`
10. `Get product variants by product id`
11. `Create product variant`

Environment local đã tạo:
- `Marketplace-platform/postman/environments/marketplace-local.yaml`

---

## 5. Cách dùng cho người mới đọc là test được ngay

## Bước 1: mở workspace local trong Postman
Mở repo local này trong Postman để Postman load các file trong thư mục `postman/`.

## Bước 2: dùng environment local
Chọn environment:
- `marketplace-local`

Các biến mặc định:
- `baseUrl = http://localhost:8080`
- `userId = 1`
- `shopId = 1`
- `productId = 1`
- `categoryId = 1`
- `variantId = 1`
- `timestamp = 1744716759`

Nếu backend chạy cổng khác thì sửa `baseUrl`.

## Bước 3: chạy theo thứ tự gợi ý
### Luồng đọc dữ liệu cơ bản
1. Get public products
2. Get product by id
3. Get seller shop by user id
4. Get seller products
5. Get seller products by shop id
6. Get product images by product id
7. Get product variants by product id

### Luồng tạo dữ liệu
1. Create seller product
2. Add product images
3. Create product variant

---

## 6. Payload gợi ý để test thủ công trong Postman

Do format local yaml hiện tại của repo đang ở mức tối giản, các request POST mới được tạo dưới dạng khung request. Khi test, người dùng nên thêm raw JSON body trong Postman theo mẫu dưới đây.

## 6.1 Create seller product
**POST** `{{baseUrl}}/seller/product`

```json
{
  "category_id": 1,
  "shop_id": 1,
  "name": "Test product 001",
  "description": "Product tạo bằng Postman",
  "price": 199000,
  "quantity": 10,
  "sku": "SKU-TEST-001",
  "status": 1
}
```

## 6.2 Add product images
**POST** `{{baseUrl}}/seller/product-image/product/{{productId}}`

```json
[
  {
    "image_url": "https://example.com/product-1.jpg",
    "is_thumbnail": 1
  },
  {
    "image_url": "https://example.com/product-2.jpg",
    "is_thumbnail": 0
  }
]
```

## 6.3 Create product variant
**POST** `{{baseUrl}}/seller/product-variant`

```json
{
  "product_id": 1,
  "variant_name": "Size M / Red",
  "sku": "SKU-RED-M-001",
  "price": 209000,
  "stock_quantity": 5,
  "image_url": "https://example.com/variant-red-m.jpg",
  "is_active": 1
}
```

---

## 7. Checklist để AI hoặc tester đọc hiểu nhanh

Người đọc có thể dùng checklist này để test:

### Public product
- [ ] GET /product trả về danh sách
- [ ] GET /product/{id} trả về chi tiết đúng id
- [ ] id không tồn tại trả lỗi hợp lý

### Seller product
- [ ] GET /seller/product trả về danh sách
- [ ] POST /seller/product tạo mới thành công
- [ ] GET /seller/product/{id} đọc được chi tiết
- [ ] GET /seller/product/shop/{id} lọc theo shop

### Product images
- [ ] POST /seller/product-image/product/{id} thêm ảnh thành công
- [ ] GET /seller/product-image/product/{id} đọc lại được danh sách ảnh

### Product variants
- [ ] GET /seller/product-variant/product/{id} đọc variant theo product
- [ ] POST /seller/product-variant tạo variant thành công
- [ ] kiểm tra duplicate SKU
- [ ] kiểm tra stock âm / price âm

### Seller/shop relation
- [ ] GET /seller/shop/user/{id} trả đúng shop theo user
- [ ] user không có shop trả lỗi hợp lý

---

## 8. Những gì nên bổ sung tiếp theo

Để bộ API thật sự đủ cho test Postman chuyên nghiệp, nên bổ sung:

1. API update/delete cho product
2. API update/delete cho variant
3. API delete image
4. auth bằng token cho seller endpoints
5. pre-request/test scripts trong collection
6. example response mẫu
7. collection runner data file
8. error contract thống nhất
9. pagination/filter/sort
10. ownership validation

---

## 9. Khuyến nghị cho người nhận tài liệu

Nếu bạn giao tài liệu này cho AI hoặc tester khác, hãy yêu cầu họ làm theo thứ tự:
1. đọc mục **API hiện đang có thể test**
2. import/mở local workspace Postman
3. chọn environment `marketplace-local`
4. test các API GET trước
5. test các API POST với payload mẫu ở trên
6. ghi lại response thực tế để chuẩn hóa tài liệu version sau

---

## 10. Kết luận

**Chưa thể xem là đầy đủ** cho seller + product nếu mục tiêu là test nghiệp vụ hoàn chỉnh.

Tuy nhiên, dự án hiện đã có đủ nền để tạo một **bộ Postman local starter collection** cho việc:
- smoke test
- manual test
- onboarding người mới
- nhờ AI khác đọc hiểu API và tiếp tục mở rộng test

File này có thể dùng làm tài liệu bàn giao ban đầu.
