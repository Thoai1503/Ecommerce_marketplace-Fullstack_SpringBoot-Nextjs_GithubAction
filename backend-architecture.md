## Backend Architecture (Microservices)

### Services (repo structure)

- `api-gateway/` (Spring Boot, Maven) — port cấu hình trong `api-gateway/src/main/resources/application.properties` (`8000`)
- `order-service/` — port `8002`
- `cart-service/` — port `8003`
- `logistic-service/` — port `8007`
- `Marketplace-platform/` — Spring Boot, chạy profile `local` (port tuỳ config; log bạn gửi có lúc init `8001`)

### Ownership (gợi ý để làm Seller-Product)

> Để triển khai nhanh: thống nhất service nào “là source of truth” cho product.

- **Product/Catalog/Seller/Shop**: thường thuộc `Marketplace-platform/`
- **Gateway** (`api-gateway/`): routing/auth, có thể forward `/seller/**` vào `Marketplace-platform`

### Local runtime dependencies

- DB (MySQL) cho các service có JPA.
  - Lỗi thường gặp: `Access denied for user 'root'@'localhost'` ⇒ sai password MySQL hoặc user không có quyền.

### Configuration patterns

- Một số service dùng env:
  - `DATABASE_URL`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`

Khi chạy IntelliJ: set các biến này trong **Run/Debug Configuration → Environment variables**.

### Ports (hiện thấy trong repo)

- `api-gateway`: `8000`
- `order-service`: `8002`
- `cart-service`: `8003`
- `logistic-service`: `8007`

### Recommended local boot order

- Start DB (MySQL)
- Start `api-gateway` (để FE gọi)
- Start dependent services (cart/order/logistic/marketplace-platform) theo nhu cầu

### Seller-Product backend checklist (khuyến nghị)

- **AuthN/AuthZ**
  - Mọi endpoint `/seller/**` phải xác thực.
  - Quy tắc: seller chỉ được thao tác trên `product.seller_id == currentUser.id`.
- **Validation**
  - price/stock không âm, name required, category hợp lệ, status transitions hợp lệ.
- **Variants**
  - unique `sku` theo seller hoặc toàn hệ thống.
  - stock theo variant.
- **Media**
  - upload/storage (local/s3/cloudinary…) + quyền xoá/sửa theo owner.
- **DB**
  - index theo `seller_id`, `category_id`, `status`, `created_at`.
  - soft delete thay vì delete cứng cho product.

### API alignment note

Frontend `marketfrontend/src/app/(user)/page.tsx` đang gọi:

- `GET {INTERNAL_API}/api/categories`
- `GET {INTERNAL_API}/product`

Vì vậy, service đứng sau `INTERNAL_API` cần expose các endpoint này (trực tiếp hoặc qua gateway routing).

