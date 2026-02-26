## 📌 Kế Hoạch Phát Triển Tính Năng Admin (Business Logic Roadmap)

### Phase 1 – Nền tảng & Core Flow Bán Hàng

#### 1. Settings (Cơ Bản)

- [ ] Thiết lập cấu trúc config FE (base URL, env, http client).
- [ ] Config auth (lưu token, refresh, interceptor).
- [ ] Tạo trang Settings đơn giản (hiển thị vài trường read-only hoặc mock).

#### 2. User Management (MVP – Role & Status)

- [ ] API: `GET /admin/users` (list + search + filter).
- [ ] API: `PUT /admin/users/{id}/role`.
- [ ] API: `PUT /admin/users/{id}/status`.
- [ ] FE: Trang `/admin/user` với table, search, filter, pagination.
- [ ] FE: Modal đổi role.
- [ ] FE: Block/Unblock user với confirm + toast.

#### 3. Sellers Management (MVP)

- [ ] API: List seller, duyệt / khóa seller.
- [ ] FE: Trang `/admin/sellers` (list + search + filter status).
- [ ] Action: Approve/Reject seller.

#### 4. Category Management

- [ ] API: CRUD category.
- [ ] FE: `/admin/category` (list + search + filter).
- [ ] FE: Form create/edit category (name, slug, thumbnail, status).

#### 5. Attributes Management

- [ ] API: CRUD attributes + values.
- [ ] FE: `/admin/attribute` (list).
- [ ] FE: Form create/edit attribute.
- [ ] FE: Trang manage attribute values.

#### 6. Units Management

- [ ] API: CRUD units.
- [ ] FE: `/admin/unit` (list + form create/edit).
- [ ] Tích hợp chọn unit trong form sản phẩm/seller product.

#### 7. Products Management

- [ ] API: List/Detail/Update/Approve/Reject sản phẩm (từ seller).
- [ ] FE: `/admin/products` (list + filter theo status).
- [ ] FE: View chi tiết sản phẩm.
- [ ] FE: Approve/Reject sản phẩm.

#### 8. Orders Management

- [ ] API: List/Detail/Update status đơn hàng.
- [ ] FE: `/admin/orders` (list + filter theo trạng thái).
- [ ] FE: View chi tiết đơn hàng.
- [ ] FE: Cập nhật trạng thái (PENDING → CONFIRMED → ...).

---

### Phase 2 – Giá Trị Cộng Thêm & Vận Hành

#### 9. Customers Management

- [ ] API: List khách hàng, lịch sử đặt hàng.
- [ ] FE: `/admin/customers` (list + search).
- [ ] View chi tiết khách hàng (basic).

#### 10. Coupons Management

- [ ] API: CRUD coupons.
- [ ] FE: `/admin/coupons` (list + create/edit).
- [ ] Ràng buộc: thời gian hiệu lực, loại giảm giá, điều kiện áp dụng.

#### 11. Finance Management

- [ ] API: báo cáo doanh thu, payout cho seller.
- [ ] FE: `/admin/finance` (overview + filter theo thời gian).
- [ ] View chi tiết payout / transaction.

---

### Phase 3 – Dashboard & Settings Nâng Cao

#### 12. Dashboard

- [ ] API: tổng hợp số liệu (doanh thu, đơn hàng, sản phẩm, seller,...).
- [ ] FE: `/admin` với stats cards, chart đơn giản, recent orders.

#### 13. Settings Nâng Cao

- [ ] Payment settings (payment provider keys, mode test/live).
- [ ] Shipping settings (phí ship, khu vực).
- [ ] Notification settings (email template, triggers).

---

### Ghi Chú Chung Cho Dev

- Ưu tiên: **xong Phase 1** → hệ thống chạy được từ seller → product → order.
- Mỗi module nên có: **API backend ổn định** → **FE list page** → **form create/edit (nếu cần)**.
- Luôn triển khai: loading state, error handling, toast thông báo, kiểm tra phân quyền (role ADMIN).

---

### Phân Chia Tasks Cho 5 Dev (Ưu tiên Phase 1)

#### Dev 1 – Nền tảng & Settings

- [ ] Settings cơ bản (mục 1):
  - [ ] Cấu trúc config FE, http client, env.
  - [ ] Auth flow (login, lưu token, refresh, interceptor).
  - [ ] Trang Settings đơn giản (đọc mock / static).
- [ ] Tham gia Settings nâng cao (mục 13) ở Phase 3.

#### Dev 2 – User & Customers

- [ ] User Management (mục 2):
  - [ ] API `GET /admin/users`, `PUT /admin/users/{id}/role`, `PUT /admin/users/{id}/status`.
  - [ ] FE `/admin/user`: list, search, filter, pagination.
  - [ ] Modal đổi role, Block/Unblock user.
- [ ] Customers Management (mục 9 – Phase 2):
  - [ ] API list khách + lịch sử đơn hàng.
  - [ ] FE `/admin/customers` + view chi tiết đơn giản.

#### Dev 3 – Sellers & Orders

- [ ] Sellers Management (mục 3):
  - [ ] API list/approve/reject/lock seller.
  - [ ] FE `/admin/sellers`: list, search, filter status.
- [ ] Orders Management (mục 8):
  - [ ] API list/detail/update status order.
  - [ ] FE `/admin/orders`: list, filter trạng thái, detail.
  - [ ] Flow cập nhật trạng thái đơn (PENDING → ...).

#### Dev 4 – Catalog: Category, Attributes, Units

- [ ] Category Management (mục 4):
  - [ ] API CRUD category.
  - [ ] FE `/admin/category`: list + form create/edit.
- [ ] Attributes Management (mục 5):
  - [ ] API CRUD attribute + values.
  - [ ] FE `/admin/attribute`: list, form create/edit, manage values.
- [ ] Units Management (mục 6):
  - [ ] API CRUD units.
  - [ ] FE `/admin/unit`: list + form.

# PROMPT – Dev 4: Catalog Module (Category / Attributes / Units)

## Mục tiêu

Bạn là một senior backend + frontend developer. Hãy generate code đầy đủ cho **Catalog Module** của hệ thống Admin e-commerce, bao gồm 4 phần:

1. Category Management (có hỗ trợ cây cha–con)
2. Attribute Management (có values + type)
3. Category–Attribute Mapping (`category_attribute`)
4. Units Management

---

## Tech Stack (điều chỉnh nếu cần)

- **Backend**: Spring Boot (Java) / hoặc NestJS (TypeScript)
- **Frontend**: React + TypeScript + TailwindCSS + React Query
- **Database**: MySQL/PostgreSQL (JPA/TypeORM)
- **Auth**: JWT, role = ADMIN

---

## 1. Category Management

### Business Rules

- Category hỗ trợ cây cha–con (parent_id), tối đa 2–3 cấp.
- `slug` phải unique toàn hệ thống, auto-generate từ `name` nhưng có thể override.
- `displayOrder` để sắp xếp thứ tự hiển thị trên storefront.
- Không được xóa category khi còn sản phẩm ACTIVE → chỉ cho phép chuyển INACTIVE.
- Không được xóa khi còn sub-category → phải xử lý sub trước.

### API Endpoints

```
GET    /admin/categories                        Query: search, status, page, size
GET    /admin/categories/tree                   Trả về nested tree (dùng cho select parent)
GET    /admin/categories/{id}
POST   /admin/categories
PUT    /admin/categories/{id}
DELETE /admin/categories/{id}                   Soft delete, check ràng buộc
GET    /admin/categories/{id}/products          Danh sách sản phẩm thuộc category
PUT    /admin/categories/{id}/reorder           Cập nhật displayOrder hàng loạt
```

### Request Body (POST/PUT)

```json
{
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "description": "Mô tả danh mục",
  "thumbnailUrl": "https://...",
  "parentId": null,
  "displayOrder": 1,
  "status": "ACTIVE"
}
```

### Response – GET /admin/categories/tree

```json
[
  {
    "id": 1,
    "name": "Thời trang",
    "slug": "thoi-trang",
    "status": "ACTIVE",
    "children": [{ "id": 3, "name": "Áo", "slug": "ao", "children": [] }]
  }
]
```

### FE Requirements

- Table list: name, parent, slug, số sản phẩm, status, actions.
- Hiển thị indent theo cấp cha–con.
- Form create/edit: dropdown chọn parent (dùng `/tree`).
- Khi delete: kiểm tra và hiển thị warning nếu có sản phẩm / sub-category.

---

## 2. Attribute Management

### Business Rules

- Attribute là thuộc tính của sản phẩm: Màu sắc, Kích thước, Chất liệu...
- Mỗi attribute có nhiều **values** (ví dụ: Màu sắc → Đỏ, Xanh, Vàng).
- `type`: `SELECT` | `MULTI_SELECT` | `TEXT`
- `isFilterable`: dùng để lọc sản phẩm trên storefront.
- `isRequired`: bắt buộc điền khi tạo sản phẩm.
- Không cho xóa nếu đang dùng trong sản phẩm → chỉ INACTIVE.
- `displayOrder` trên attribute value để sắp xếp thứ tự hiển thị.

### API Endpoints

```
GET    /admin/attributes                        Query: search, status, type, page, size
GET    /admin/attributes/{id}
POST   /admin/attributes
PUT    /admin/attributes/{id}
DELETE /admin/attributes/{id}                   Check đang dùng

# Attribute Values
GET    /admin/attributes/{id}/values
POST   /admin/attributes/{id}/values
PUT    /admin/attributes/{id}/values/{valueId}
DELETE /admin/attributes/{id}/values/{valueId}
PUT    /admin/attributes/{id}/values/reorder    Body: [{ valueId, displayOrder }]

# Category ↔ Attribute mapping
GET    /admin/attributes/{id}/categories
POST   /admin/attributes/{id}/categories        Body: { categoryId }
DELETE /admin/attributes/{id}/categories/{catId}
```

### Request Body – POST/PUT attribute

```json
{
  "name": "Màu sắc",
  "code": "color",
  "type": "SELECT",
  "isRequired": false,
  "isFilterable": true,
  "displayOrder": 1,
  "status": "ACTIVE"
}
```

### Request Body – POST/PUT attribute value

```json
{
  "value": "Đỏ",
  "colorCode": "#FF0000",
  "displayOrder": 1
}
```

### FE Requirements

- Table list: name, code, type, isFilterable, số values, status, actions.
- Form attribute: chọn type, toggle isFilterable, isRequired.
- Tab **Values**: inline editable list (add/edit/delete/reorder drag-and-drop).
- Tab **Categories**: multi-select gán attribute vào categories.

---

## 3. Category–Attribute Mapping (`category_attribute`) — Module Quan Trọng

### Business Rules

- Mỗi category có một **bộ attributes riêng** (ví dụ: "Laptop" → RAM, CPU, Màn hình).
- Khi seller tạo sản phẩm → hệ thống load đúng attributes theo category đã chọn.
- `isRequired` và `displayOrder` có thể override riêng ở cấp mapping (khác với mặc định của attribute).
- Hỗ trợ bulk replace toàn bộ bộ attributes của 1 category.

### API Endpoints

```
GET    /admin/categories/{id}/attributes
POST   /admin/categories/{id}/attributes
       Body: { "attributeId": 5, "isRequired": true, "displayOrder": 1 }

PUT    /admin/categories/{id}/attributes/{attrId}
       Body: { "isRequired": false, "displayOrder": 2 }

DELETE /admin/categories/{id}/attributes/{attrId}

POST   /admin/categories/{id}/attributes/bulk    # Replace toàn bộ
       Body: {
         "attributes": [
           { "attributeId": 5, "isRequired": true, "displayOrder": 1 },
           { "attributeId": 6, "isRequired": false, "displayOrder": 2 }
         ]
       }
```

### Database Schema

```sql
CREATE TABLE category_attribute (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id   BIGINT NOT NULL REFERENCES categories(id),
  attribute_id  BIGINT NOT NULL REFERENCES attributes(id),
  is_required   BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP,
  UNIQUE (category_id, attribute_id)
);
```

### FE Requirements

- UI dạng checkbox list hoặc drag-and-drop để gán attributes cho 1 category.
- Hiển thị được `isRequired` per mapping.
- Nút "Copy từ category khác" để clone bộ attribute.

---

## 4. Units Management

### Business Rules

- Unit gắn vào sản phẩm: kg, lít, cái, hộp...
- Không cho xóa nếu đang dùng trong sản phẩm → chỉ INACTIVE.
- `symbol` là ký hiệu ngắn (kg, L), `label` là tên đầy đủ (Kilogram, Lít).

### API Endpoints

```
GET    /admin/units                             Query: search, status, page, size
GET    /admin/units/{id}
POST   /admin/units
PUT    /admin/units/{id}
DELETE /admin/units/{id}                        Check đang dùng
GET    /admin/units/{id}/products               (Optional) Xem sản phẩm đang dùng unit
```

### Request Body (POST/PUT)

```json
{
  "label": "Kilogram",
  "symbol": "kg",
  "description": "Đơn vị khối lượng",
  "status": "ACTIVE"
}
```

### FE Requirements

- Table: label, symbol, số sản phẩm đang dùng, status, actions.
- Form create/edit đơn giản.
- Khi delete: hiển thị số sản phẩm đang dùng + warning confirm.

---

## Quan Hệ Dữ Liệu Tổng Quan

```
Category (tree: parent_id)
    └── category_attribute (categoryId, attributeId, isRequired, displayOrder)
              └── Attribute (name, code, type, isFilterable)
                        └── AttributeValue (value, colorCode, displayOrder)

Product → categoryId (FK)
Product → unitId (FK)
ProductVariant → attributeValueId[] (FK)
```

---

## Yêu Cầu Chung Cho Tất Cả Module

- Tất cả API đều yêu cầu JWT token, role = ADMIN.
- Response chuẩn: `{ success, data, message, errors }`.
- Pagination: `{ content, totalElements, totalPages, page, size }`.
- Loading state, error handling, toast notification trên FE.
- Soft delete (không xóa vật lý khỏi DB).
- Log audit khi thay đổi dữ liệu quan trọng.

---

## Thứ Tự Implement Đề Xuất

1. **Category CRUD** (bao gồm tree API)
2. **Attribute CRUD** + Values management
3. **Category–Attribute Mapping** (bulk assign)
4. **Units CRUD**
5. Tích hợp: khi seller tạo sản phẩm → load attributes theo category

---

_Hãy generate lần lượt từng phần, bắt đầu từ phần 1 – Category Management (Entity, Repository, Service, Controller, DTO, FE component)._

#### Dev 5 – Products, Coupons, Finance, Dashboard

- [ ] Products Management (mục 7):
  - [ ] API list/detail/approve/reject product.
  - [ ] FE `/admin/products`: list, filter status, detail, approve/reject.
- [ ] Coupons Management (mục 10 – Phase 2):
  - [ ] API CRUD coupons + rule.
  - [ ] FE `/admin/coupons`: list + form.
- [ ] Finance Management (mục 11 – Phase 2):
  - [ ] API báo cáo doanh thu, payout.
  - [ ] FE `/admin/finance`: overview + filter.
- [ ] Dashboard (mục 12 – Phase 3):
  - [ ] API tổng hợp số liệu.
  - [ ] FE `/admin`: stats cards, chart, recent orders.

---

### API Endpoints Chi Tiết Theo Dev

#### Dev 1 – Nền tảng & Settings

- **Auth / Session** (backend có thể là prefix `/api` hoặc `/auth`):
  - `POST /auth/login` – login admin, trả về accessToken/refreshToken.
  - `POST /auth/refresh` – refresh token.
  - `POST /auth/logout` – revoke session.
- **Settings cơ bản**:
  - `GET /admin/settings` – lấy config hệ thống (Phase 1 có thể mock).
  - `PUT /admin/settings` – cập nhật settings (Phase 2+).

#### Dev 2 – User & Customers

- **User Management**:
  - `GET /admin/users`
    - Query: `search?`, `role?`, `status?`, `page?`, `size?`
  - `GET /admin/users/{id}`
  - `PUT /admin/users/{id}/role`
    - Body: `{ "role": "USER" | "SELLER" | "ADMIN" }`
  - `PUT /admin/users/{id}/status`
    - Body: `{ "status": "ACTIVE" | "BLOCKED" }`
- **Customers Management**:
  - `GET /admin/customers`
    - Query: `search?`, `page?`, `size?`
  - `GET /admin/customers/{id}` – thông tin customer + thống kê cơ bản.
  - `GET /admin/customers/{id}/orders` – danh sách đơn hàng của customer.

#### Dev 3 – Sellers & Orders

- **Sellers Management**:
  - `GET /admin/sellers`
    - Query: `search?`, `status? (PENDING|ACTIVE|BLOCKED)`, `page?`, `size?`
  - `GET /admin/sellers/{id}`
  - `PUT /admin/sellers/{id}/status`
    - Body: `{ "status": "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED" }`
  - (Optional) `GET /admin/sellers/{id}/products`
- **Orders Management**:
  - `GET /admin/orders`
    - Query: `status?`, `sellerId?`, `customerId?`, `dateFrom?`, `dateTo?`, `page?`, `size?`
  - `GET /admin/orders/{orderId}`
  - `PUT /admin/orders/{orderId}/status`
    - Body: `{ "status": "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELED" | "REFUNDED" }`
  - (Optional) `GET /admin/orders/{orderId}/timeline` – lịch sử trạng thái.

#### Dev 4 – Catalog: Category, Attributes, Units

- **Category**:
  - `GET /admin/categories`
    - Query: `search?`, `status?`, `page?`, `size?`
  - `GET /admin/categories/{id}`
  - `POST /admin/categories`
    - Body: `{ name, slug, description?, thumbnailUrl?, status }`
  - `PUT /admin/categories/{id}` – update fields trên.
  - `DELETE /admin/categories/{id}` – delete/soft delete (có check sản phẩm).
- **Attributes**:
  - `GET /admin/attributes`
    - Query: `search?`, `status?`, `page?`, `size?`
  - `GET /admin/attributes/{id}`
  - `POST /admin/attributes`
    - Body: `{ name, code?, option, published }`
  - `PUT /admin/attributes/{id}`
  - `DELETE /admin/attributes/{id}` – có bảo vệ nếu đang dùng.
  - **Attribute Values**:
    - `GET /admin/attributes/{id}/values`
    - `POST /admin/attributes/{id}/values`
      - Body: `{ value, displayOrder? }`
    - `PUT /admin/attributes/{id}/values/{valueId}`
    - `DELETE /admin/attributes/{id}/values/{valueId}`
- **Units**:
  - `GET /admin/units`
    - Query: `search?`, `status?`, `page?`, `size?`
  - `GET /admin/units/{id}`
  - `POST /admin/units`
    - Body: `{ label, symbol, status }`
  - `PUT /admin/units/{id}`
  - `DELETE /admin/units/{id}` – hoặc chuyển sang INACTIVE.

#### Dev 5 – Products, Coupons, Finance, Dashboard

- **Products (admin-side)**:
  - `GET /admin/products`
    - Query: `search?`, `status? (PENDING|ACTIVE|REJECTED|HIDDEN)`, `sellerId?`, `categoryId?`, `page?`, `size?`
  - `GET /admin/products/{id}`
  - `PUT /admin/products/{id}` – chỉnh sửa thông tin cơ bản (title, desc, price, etc.).
  - `PUT /admin/products/{id}/status`
    - Body: `{ "status": "APPROVED" | "REJECTED" | "HIDDEN" | "ACTIVE" }`
  - (Optional) `GET /admin/products/{id}/variants`
- **Coupons**:
  - `GET /admin/coupons`
    - Query: `code?`, `status?`, `page?`, `size?`
  - `GET /admin/coupons/{id}`
  - `POST /admin/coupons`
    - Body: `{ code, type, value, startDate, endDate, usageLimit?, minOrderValue?, status }`
  - `PUT /admin/coupons/{id}`
  - `DELETE /admin/coupons/{id}`
- **Finance**:
  - `GET /admin/finance/overview`
    - Query: `dateFrom?`, `dateTo?`
  - `GET /admin/finance/payouts`
    - Query: `sellerId?`, `status?`, `page?`, `size?`
  - `GET /admin/finance/payouts/{id}`
  - `PUT /admin/finance/payouts/{id}/status` – xác nhận payout.
- **Dashboard**:
  - `GET /admin/dashboard/summary`
    - Query: `period = today|7days|month`, `dateFrom?`, `dateTo?`
    - Trả về: doanh thu, số đơn, khách mới, seller mới,...
  - `GET /admin/dashboard/revenue-chart` – data cho chart theo ngày/tuần/tháng.
  - `GET /admin/dashboard/top-products`
  - `GET /admin/dashboard/recent-orders`
