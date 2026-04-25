## API Contract (Draft)

Mục tiêu: thống nhất cách FE gọi BE (base URL, path, response shape, error shape) để làm tính năng admin nhanh và ít bug.

### Base URL (local dev)

- **Gateway** (khuyến nghị): `http://127.0.0.1:8000`
- FE env (Next.js `marketfrontend/.env.local`):
  - `NEXT_PUBLIC_API_URL=<gateway>`
  - `INTERNAL_API=<gateway>`

### Response envelope (khuyến nghị)

- **Success**
  - `data`: payload
  - `message`: optional
  - `meta`: optional (pagination)
- **Error**
  - `message`: string
  - `code`: string/int (optional)
  - `errors`: field-level errors (optional)

Ví dụ:

```json
{ "data": { "id": 1 }, "message": "ok" }
```

```json
{ "message": "Validation failed", "errors": { "name": "Required" } }
```

### Auth

- Token/cookie tuỳ dự án. FE hiện đọc cookie `role` (xem `marketfrontend/src/app/(user)/page.tsx` và middleware logs).
- Nếu dùng Bearer token:
  - `Authorization: Bearer <accessToken>`
  - refresh token endpoint: `/auth/refresh` (đang được gọi trong `marketfrontend/src/lib/http.ts`)

### Endpoints (gợi ý theo FE đang gọi)

> Những endpoint dưới đây là “kỳ vọng” từ FE. Nếu BE khác, cập nhật lại file này để FE/BE khớp nhau.

#### Categories

- `GET /api/categories`
  - **Response**: `data` là mảng categories hoặc `{ data: [...] }`

#### Products

- `GET /product`
  - **Response**: mảng product (FE đang parse trực tiếp JSON)

### Seller - Product APIs (chi tiết)

> Mục tiêu: bạn làm seller-product trên FE thì BE phải có nhóm endpoint rõ ràng.
> Prefix có thể là `/seller` hoặc `/api/seller`. Ở đây dùng `/seller` để dễ đọc.

#### Seller Shop

- `GET /seller/me`
  - Lấy info seller + shop.
- `PUT /seller/me`
  - Cập nhật info shop (name/description/logo/banner/pickup address...).

#### Seller Products (List/Create/Update)

- `GET /seller/products?page=&pageSize=&q=&status=&categoryId=&sort=`
  - **Response**: `{ data: Product[], meta: { page, pageSize, total } }`
- `POST /seller/products`
  - **Body (gợi ý)**:
    - `name`, `description`, `category_id`, `price`, `status` (`draft|pending_approval`), `images[]`
    - `weight`, `length`, `width`, `height` (phục vụ logistics fee)
- `GET /seller/products/{id}`
  - Chỉ trả về sản phẩm thuộc seller hiện tại.
- `PUT /seller/products/{id}`
  - Cập nhật thông tin cơ bản + status.
- `DELETE /seller/products/{id}`
  - Soft-delete/disable.

#### Product Media

- `POST /seller/products/{id}/images`
  - Upload ảnh (multipart) hoặc nhận URL (tuỳ implement).
- `DELETE /seller/products/{id}/images/{imageId}`

#### Variants (nếu có)

- `GET /seller/products/{id}/variants`
- `POST /seller/products/{id}/variants`
  - Tạo variant (sku/price/stock/attributes).
- `PUT /seller/products/{id}/variants/{variantId}`
  - Cập nhật giá/tồn kho/status.
- `DELETE /seller/products/{id}/variants/{variantId}`

#### Inventory

- `POST /seller/inventory/adjust`
  - **Body (gợi ý)**: `variant_id` (hoặc `product_id`), `type`, `quantity`, `reason`
- `GET /seller/inventory/low-stock?threshold=`

#### Approval flow (nếu có)

- `POST /seller/products/{id}/submit`
- `GET /seller/products/{id}/review-status`

### Admin modules (gợi ý)

- `GET /admin/categories`
- `POST /admin/categories`
- `PUT /admin/categories/{id}`
- `DELETE /admin/categories/{id}`

Áp dụng tương tự cho: attributes, units, orders, users, products, customers.


