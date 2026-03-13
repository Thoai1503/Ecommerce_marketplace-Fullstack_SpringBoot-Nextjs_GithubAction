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

#### 6. Category-Attribute Management

- [ ] FE: `/admin/categories/category-attributes` (list categories with linked attributes).
- [ ] FE: Modal to assign/unassign attributes to categories.
- [ ] FE: Search and filter for easy management.

#### 7. Units Management

- [ ] API: CRUD units.
- [ ] FE: `/admin/unit` (list + form create/edit).
- [ ] Tích hợp chọn unit trong form sản phẩm/seller product.

#### 8. Products Management

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

- Category hỗ trợ cây cha–con (parent_id), tối đa 4-5 cấp.
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

# CATALOG MODULE – Dev 4 Prompt Specification

**Admin E-commerce Platform | Phase 1**

> **Mục đích:** Prompt đầy đủ nạp cho AI generate toàn bộ backend + frontend Catalog Module.
> **Tech Stack:** Spring Boot (Java) + React TypeScript + TailwindCSS + React Query + MySQL
> **Auth:** JWT Bearer Token – role = ADMIN (tất cả endpoint đều require)

---

## Tổng Quan

| Thuộc tính         | Chi tiết                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Modules            | 1. Category · 2. Attribute + Values · 3. Category–Attribute Mapping · 4. Units                                 |
| Thứ tự impl        | Category → Attribute → Mapping → Units → Tích hợp seller product form                                          |
| Response format    | `{ success, data, message, errors }` cho single; `{ content, totalElements, totalPages, page, size }` cho list |
| Pagination default | page=0, size=20, max size=100                                                                                  |

### Quan Hệ Dữ Liệu – Entity Relationship

```
Category (tree: parent_id, depth 1–3)
    └── category_attribute  ←── JOIN TABLE
              ├── category_id   (FK → categories.id)
              ├── attribute_id  (FK → attributes.id)
              ├── is_required   (override per mapping)
              └── display_order (override per mapping)

Attribute
    ├── name, code, type (SELECT | MULTI_SELECT | TEXT)
    ├── is_filterable, is_required (default)
    └── AttributeValue[]
              ├── value ("Đỏ", "Xanh", ...)
              ├── color_code (#HEX, optional)
              └── display_order

Unit
    ├── label ("Kilogram")
    └── symbol ("kg")

Product → category_id (FK)  +  unit_id (FK)
ProductVariant → attribute_value_id[] (FK)
```

### Response Format Chuẩn

```json
// Single object
{
  "success": true,
  "data": { ... },
  "message": "OK",
  "errors": null
}

// Paginated list
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 100,
    "totalPages": 10,
    "page": 0,
    "size": 20
  }
}
```

---

## MODULE 1 – CATEGORY MANAGEMENT

### 1.1 Business Rules

- Hỗ trợ cây cha–con (`parent_id`), tối đa **3 cấp** (Level 0 → Level 2).
- `slug` phải **UNIQUE** toàn hệ thống, auto-generate từ `name` nhưng có thể override.
- `display_order` để sắp xếp hiển thị trên storefront.
- **Không cho xóa** (hard delete) khi còn sản phẩm `ACTIVE` → chỉ chuyển `INACTIVE`.
- **Không cho xóa** khi còn sub-category → phải xử lý (xóa/deactivate) sub trước.
- Soft delete: set `status = DELETED`, không xóa vật lý khỏi DB.
- Khi category `INACTIVE` → toàn bộ sub-category cũng bị ẩn trên storefront (logic hiển thị, không cascade DB).
- `thumbnail_url` là URL ảnh đã upload riêng, không upload qua API này.

### 1.2 Database Schema

```sql
CREATE TABLE categories (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  name           VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL UNIQUE,
  description    TEXT,
  thumbnail_url  VARCHAR(500),
  parent_id      BIGINT REFERENCES categories(id),
  display_order  INT DEFAULT 0,
  status         ENUM('ACTIVE','INACTIVE','DELETED') DEFAULT 'ACTIVE',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_parent (parent_id),
  INDEX idx_slug (slug),
  INDEX idx_status (status)
);
```

### 1.3 API Endpoints

| Method | Endpoint                          | Mô tả                                                                                     |
| ------ | --------------------------------- | ----------------------------------------------------------------------------------------- |
| GET    | `/admin/categories`               | Danh sách flat list, có pagination. Query: `search`, `status`, `parentId`, `page`, `size` |
| GET    | `/admin/categories/tree`          | Trả về nested tree toàn bộ – dùng cho dropdown chọn parent                                |
| GET    | `/admin/categories/{id}`          | Chi tiết 1 category (kèm parent info + danh sách attributes đã gán)                       |
| POST   | `/admin/categories`               | Tạo mới category                                                                          |
| PUT    | `/admin/categories/{id}`          | Cập nhật tất cả fields                                                                    |
| DELETE | `/admin/categories/{id}`          | Soft delete – check ràng buộc trước                                                       |
| GET    | `/admin/categories/{id}/products` | Danh sách sản phẩm thuộc category. Query: `status`, `page`, `size`                        |
| PUT    | `/admin/categories/reorder`       | Cập nhật display_order hàng loạt. Body: `[{id, displayOrder}]`                            |

### 1.4 Request DTO – POST/PUT `/admin/categories`

```json
{
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "description": "Mô tả danh mục",
  "thumbnailUrl": "https://cdn.example.com/img.jpg",
  "parentId": null,
  "displayOrder": 1,
  "status": "ACTIVE"
}
```

| Field          | Type    | Bắt buộc | Validation                                             |
| -------------- | ------- | -------- | ------------------------------------------------------ |
| `name`         | String  | ✅       | Max 255 ký tự                                          |
| `slug`         | String  | ❌       | Auto-gen nếu trống; lowercase, chỉ `a-z 0-9 -`, unique |
| `description`  | String  | ❌       | Max 1000 ký tự                                         |
| `thumbnailUrl` | String  | ❌       | URL hợp lệ                                             |
| `parentId`     | Long    | ❌       | null = root; phải tồn tại trong DB nếu có giá trị      |
| `displayOrder` | Integer | ❌       | Default 0                                              |
| `status`       | Enum    | ❌       | `ACTIVE` \| `INACTIVE`, default `ACTIVE`               |

### 1.5 Response – GET `/admin/categories/tree`

```json
[
  {
    "id": 1,
    "name": "Thời trang",
    "slug": "thoi-trang",
    "thumbnailUrl": "https://cdn.example.com/img.jpg",
    "displayOrder": 1,
    "status": "ACTIVE",
    "productCount": 42,
    "children": [
      {
        "id": 3,
        "name": "Áo",
        "slug": "ao",
        "displayOrder": 1,
        "status": "ACTIVE",
        "productCount": 18,
        "children": []
      }
    ]
  }
]
```

### 1.6 Backend Implementation Notes

- `SlugUtils`: xử lý tiếng Việt (dùng `Slugify` lib hoặc tự implement), `"Điện thoại"` → `"dien-thoai"`.
- Khi `PUT` mà `slug` đã tồn tại ở entity khác → throw `SlugDuplicateException`.
- `DELETE`: trước khi soft delete, check:
  1. `SELECT COUNT(*) FROM products WHERE category_id = ? AND status = 'ACTIVE'` → nếu > 0 throw `HasActiveProductsException`
  2. `SELECT COUNT(*) FROM categories WHERE parent_id = ? AND status != 'DELETED'` → nếu > 0 throw `HasSubCategoriesException`
- Tree API: build recursive từ flat list (tránh N+1 query – load toàn bộ rồi build in-memory).
- `reorder` API: nhận array `[{id, displayOrder}]`, batch update trong 1 transaction.

### 1.7 Frontend Requirements

**Trang `/admin/category` – List Page:**

- Table columns: **Tên** (indent theo cấp), **Parent**, **Slug**, **Số sản phẩm**, **Status badge**, **Actions**.
- Search theo name hoặc slug.
- Filter: `status` (ACTIVE / INACTIVE / ALL), `parentId` (dropdown tree).
- Indent theo cấp: level 0 = 0px, level 1 = 24px, level 2 = 48px.
- Breadcrumb path: `"Thời trang > Áo > Áo khoác"`.
- Row actions: **Edit**, **Delete** (confirm dialog), **Toggle status**.

**Form Create/Edit:**

- Dropdown chọn parent: render cây từ `GET /tree`, hiển thị indent.
- Slug auto-generate từ name khi gõ (debounce 300ms); có thể chỉnh tay.
- Preview thumbnail URL ngay khi nhập.
- Validation: `name` bắt buộc, slug format check, unique check khi submit.

**Delete – Xử lý ràng buộc:**

- Gọi `GET /admin/categories/{id}` lấy `productCount` trước khi hiện confirm.
- Nếu `productCount > 0`: warning đỏ _"Category này có X sản phẩm đang hoạt động. Không thể xóa."_
- Nếu có sub-category: warning _"Vui lòng xóa hoặc di chuyển X sub-category trước."_
- Nếu không có ràng buộc: confirm dialog với nút **Xóa** màu đỏ.

---

## MODULE 2 – ATTRIBUTE MANAGEMENT

### 2.1 Business Rules

- Attribute là thuộc tính sản phẩm: Màu sắc, Kích thước, Chất liệu, RAM, CPU,...
- Mỗi attribute có nhiều **values** (1–N): Màu sắc → Đỏ, Xanh, Vàng.
- `type`: `SELECT` (chọn 1) | `MULTI_SELECT` (chọn nhiều) | `TEXT` (nhập tự do).
- `is_filterable: true` → attribute xuất hiện trong bộ lọc sản phẩm trên storefront.
- `is_required`: giá trị default khi gán vào category (có thể override ở cấp mapping).
- `code` phải **UNIQUE** (`"color"`, `"size"`, `"material"`,...) – dùng để identify khi render seller form.
- **Không cho xóa** attribute nếu đang dùng trong sản phẩm → chỉ `INACTIVE`.
- **Không cho xóa** attribute value nếu có `ProductVariant` đang dùng → throw `ValueInUseException`.
- `color_code` (#HEX): chỉ có nghĩa khi attribute là màu sắc (optional).
- `display_order` trên attribute value: sắp xếp thứ tự hiển thị trên storefront.

### 2.2 Database Schema

```sql
CREATE TABLE attributes (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  name           VARCHAR(255) NOT NULL,
  code           VARCHAR(100) NOT NULL UNIQUE,        -- "color", "size"
  type           ENUM('SELECT','MULTI_SELECT','TEXT') NOT NULL,
  is_filterable  BOOLEAN DEFAULT FALSE,
  is_required    BOOLEAN DEFAULT FALSE,               -- default, overridable per mapping
  display_order  INT DEFAULT 0,
  status         ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE attribute_values (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  attribute_id   BIGINT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  value          VARCHAR(255) NOT NULL,
  color_code     VARCHAR(10),                         -- #FF0000 (nullable)
  display_order  INT DEFAULT 0,
  status         ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (attribute_id, value)                        -- tránh duplicate value trong 1 attribute
);
```

### 2.3 API Endpoints – Attributes

| Method | Endpoint                 | Mô tả                                                                               |
| ------ | ------------------------ | ----------------------------------------------------------------------------------- |
| GET    | `/admin/attributes`      | List. Query: `search` (name/code), `status`, `type`, `isFilterable`, `page`, `size` |
| GET    | `/admin/attributes/{id}` | Chi tiết kèm danh sách values và categories đã gán                                  |
| POST   | `/admin/attributes`      | Tạo attribute mới                                                                   |
| PUT    | `/admin/attributes/{id}` | Cập nhật name, code, type, isFilterable, isRequired, status                         |
| DELETE | `/admin/attributes/{id}` | Soft delete – kiểm tra đang dùng trong product                                      |

### 2.4 API Endpoints – Attribute Values

| Method | Endpoint                                  | Mô tả                                                |
| ------ | ----------------------------------------- | ---------------------------------------------------- |
| GET    | `/admin/attributes/{id}/values`           | Danh sách values, sort theo `display_order`          |
| POST   | `/admin/attributes/{id}/values`           | Thêm value mới                                       |
| PUT    | `/admin/attributes/{id}/values/{valueId}` | Cập nhật value, colorCode, displayOrder, status      |
| DELETE | `/admin/attributes/{id}/values/{valueId}` | Xóa – kiểm tra không có ProductVariant dùng          |
| PUT    | `/admin/attributes/{id}/values/reorder`   | Reorder hàng loạt. Body: `[{valueId, displayOrder}]` |

### 2.5 Request DTO

**POST/PUT `/admin/attributes`:**

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

| Field          | Type    | Bắt buộc | Validation                                |
| -------------- | ------- | -------- | ----------------------------------------- |
| `name`         | String  | ✅       | Max 255 ký tự                             |
| `code`         | String  | ✅       | Unique; lowercase, `a-z 0-9 _-`, no space |
| `type`         | Enum    | ✅       | `SELECT` \| `MULTI_SELECT` \| `TEXT`      |
| `isRequired`   | Boolean | ❌       | Default `false`                           |
| `isFilterable` | Boolean | ❌       | Default `false`                           |
| `displayOrder` | Integer | ❌       | Default `0`                               |
| `status`       | Enum    | ❌       | `ACTIVE` \| `INACTIVE`, default `ACTIVE`  |

**POST/PUT `/admin/attributes/{id}/values`:**

```json
{
  "value": "Đỏ",
  "colorCode": "#FF0000",
  "displayOrder": 1
}
```

| Field          | Type    | Bắt buộc | Validation                      |
| -------------- | ------- | -------- | ------------------------------- |
| `value`        | String  | ✅       | Max 255; unique trong attribute |
| `colorCode`    | String  | ❌       | Format `#RRGGBB` hoặc `#RGB`    |
| `displayOrder` | Integer | ❌       | Default `0`                     |

### 2.6 Frontend Requirements

**Trang `/admin/attribute` – List Page:**

- Table: **Name**, **Code**, **Type** (badge), **isFilterable** (icon ✓/✗), **Số values**, **Status**, **Actions**.
- Filter: `type`, `isFilterable`, `status`.
- Row click → mở detail page hoặc drawer với 3 tab: **Info**, **Values**, **Categories**.

**Tab Values – Inline Editable List:**

- Hiển thị list values, double-click để edit inline.
- **Drag-and-drop reorder** (dùng `@dnd-kit/core` hoặc `react-beautiful-dnd`).
- Nếu attribute có `colorCode`: render ô màu nhỏ (16×16px) bên cạnh tên value.
- Add value: form inline ở cuối list, `Enter` để save.
- Delete: icon thùng rác → confirm nếu value đang dùng trong product variant.

**Tab Categories – Mapping View:**

- Danh sách categories đã gán attribute này.
- Nút **+ Add**: mở modal chọn category (có search, hiển thị cây).
- Nút **Remove**: xóa mapping với confirm dialog.

---

## MODULE 3 – CATEGORY–ATTRIBUTE MAPPING

> ⚡ **Module Quan Trọng:** Quyết định bộ attributes nào hiển thị khi seller tạo sản phẩm. Implement chính xác để tránh bug phức tạp ở seller form.

### 3.1 Business Rules

- Mỗi category có một **bộ attributes riêng**: `"Laptop"` → RAM, CPU, Màn hình; `"Áo"` → Màu, Size.
- Khi seller tạo sản phẩm → system load **đúng** attributes theo category đã chọn.
- `is_required` & `display_order` ở mapping table **OVERRIDE** giá trị default của attribute gốc.
- **Bulk replace**: thay thế toàn bộ bộ attributes của 1 category bằng 1 atomic request (trong 1 transaction).
- **Copy from category**: clone toàn bộ mapping (is_required, display_order) từ category nguồn sang category đích.
- Sub-category **KHÔNG** tự động kế thừa attributes của parent → explicit mapping per category.
- Một attribute có thể gán vào nhiều categories khác nhau.
- Khi xóa attribute → tất cả mappings liên quan bị xóa (ON DELETE CASCADE).

### 3.2 Database Schema

```sql
CREATE TABLE category_attribute (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id    BIGINT NOT NULL REFERENCES categories(id)  ON DELETE CASCADE,
  attribute_id   BIGINT NOT NULL REFERENCES attributes(id)  ON DELETE CASCADE,
  is_required    BOOLEAN DEFAULT FALSE,    -- OVERRIDE attribute.is_required
  display_order  INT DEFAULT 0,            -- OVERRIDE attribute.display_order
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE (category_id, attribute_id)       -- mỗi cặp chỉ tồn tại 1 lần
);
```

### 3.3 API Endpoints

| Method | Endpoint                                                    | Mô tả                                                                |
| ------ | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| GET    | `/admin/categories/{id}/attributes`                         | Danh sách attributes đã gán, sort theo `display_order`               |
| POST   | `/admin/categories/{id}/attributes`                         | Gán 1 attribute vào category                                         |
| PUT    | `/admin/categories/{id}/attributes/{attrId}`                | Cập nhật `is_required` hoặc `display_order` của mapping              |
| DELETE | `/admin/categories/{id}/attributes/{attrId}`                | Xóa 1 attribute khỏi category                                        |
| POST   | `/admin/categories/{id}/attributes/bulk`                    | Thay thế **TOÀN BỘ** bộ attributes (idempotent, trong 1 transaction) |
| POST   | `/admin/categories/{id}/attributes/copy-from/{sourceCatId}` | Copy toàn bộ mapping từ category nguồn                               |

### 3.4 Request / Response DTO

**POST `/admin/categories/{id}/attributes` – Gán 1 attribute:**

```json
{
  "attributeId": 5,
  "isRequired": true,
  "displayOrder": 1
}
```

| Field          | Type    | Bắt buộc | Ghi chú                                   |
| -------------- | ------- | -------- | ----------------------------------------- |
| `attributeId`  | Long    | ✅       | Phải tồn tại và `status = ACTIVE`         |
| `isRequired`   | Boolean | ❌       | Override `attribute.is_required` nếu có   |
| `displayOrder` | Integer | ❌       | Override `attribute.display_order` nếu có |

**POST `/admin/categories/{id}/attributes/bulk` – Bulk Replace:**

```json
// Request
{
  "attributes": [
    { "attributeId": 5, "isRequired": true,  "displayOrder": 1 },
    { "attributeId": 3, "isRequired": false, "displayOrder": 2 },
    { "attributeId": 8, "isRequired": false, "displayOrder": 3 }
  ]
}

// Response
{
  "success": true,
  "data": [
    { "attributeId": 5, "attributeName": "RAM",       "isRequired": true,  "displayOrder": 1 },
    { "attributeId": 3, "attributeName": "CPU",       "isRequired": false, "displayOrder": 2 },
    { "attributeId": 8, "attributeName": "Màn hình",  "isRequired": false, "displayOrder": 3 }
  ],
  "message": "Replaced 3 attribute mappings"
}
```

**GET `/admin/categories/{id}/attributes` – Response:**

```json
{
  "success": true,
  "data": [
    {
      "attributeId": 5,
      "attributeName": "RAM",
      "attributeCode": "ram",
      "attributeType": "SELECT",
      "isFilterable": true,
      "isRequired": true,
      "displayOrder": 1,
      "values": [
        { "id": 10, "value": "8GB", "displayOrder": 1 },
        { "id": 11, "value": "16GB", "displayOrder": 2 },
        { "id": 12, "value": "32GB", "displayOrder": 3 }
      ]
    }
  ]
}
```

### 3.5 Backend Implementation Notes

- **Bulk replace**: trong 1 `@Transactional`:
  1. `DELETE FROM category_attribute WHERE category_id = ?`
  2. Batch `INSERT` các mapping mới
  3. Rollback nếu bất kỳ `attributeId` nào không tồn tại hoặc `INACTIVE`
- **Copy from**: clone toàn bộ rows từ source category sang target category (giữ `is_required` và `display_order`); nếu target đã có mapping → conflict → throw `409 CONFLICT` hoặc merge tùy business decision.
- Query load attributes kèm values: dùng `JOIN FETCH` hoặc `@EntityGraph` để tránh N+1.

### 3.6 Frontend Requirements

**Tab Attributes trong Category Detail Page:**

- Bảng: **Attribute Name**, **Code**, **Type**, **isRequired** (inline toggle switch), **displayOrder**, **Actions** (remove).
- **Drag-and-drop rows** để reorder – auto-save hoặc nút Save Order riêng.
- Toggle `isRequired` inline → gọi `PUT` ngay, không cần save button.
- Nút **+ Thêm Attribute**: modal multi-select attributes chưa gán (search, filter by type).
- Nút **Copy từ Category Khác**: modal chọn source category → preview mapping → confirm → gọi `/copy-from`.
- Nút **Xóa tất cả**: confirm dialog → gọi `bulk` với `attributes: []`.
- Badge warning nếu attribute `status = INACTIVE`.

**Tích Hợp Seller Product Form:**

```
Seller chọn category
    → gọi GET /admin/categories/{id}/attributes
    → render form dynamic theo type:
        SELECT       → <Select /> (dropdown)
        MULTI_SELECT → <CheckboxGroup />
        TEXT         → <Input />
    → attribute.isRequired = true → thêm required validation
    → sort theo displayOrder
```

---

## MODULE 4 – UNITS MANAGEMENT

### 4.1 Business Rules

- Unit gắn vào sản phẩm: kg, lít, cái, hộp, mét, chai,...
- `symbol`: ký hiệu ngắn hiển thị trên storefront (`kg`, `L`, `m`).
- `label`: tên đầy đủ hiển thị trong admin form (`Kilogram`, `Lít`, `Mét`).
- `symbol` phải **UNIQUE** toàn hệ thống.
- **Không cho xóa** nếu đang dùng trong sản phẩm → chỉ chuyển `INACTIVE`.
- Khi unit `INACTIVE`: sản phẩm đang dùng vẫn giữ nguyên, nhưng không cho tạo sản phẩm mới với unit này.

### 4.2 Database Schema

```sql
CREATE TABLE units (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  label        VARCHAR(100) NOT NULL,          -- "Kilogram"
  symbol       VARCHAR(20)  NOT NULL UNIQUE,   -- "kg"
  description  VARCHAR(500),
  status       ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status)
);
```

### 4.3 API Endpoints

| Method | Endpoint                     | Mô tả                                                          |
| ------ | ---------------------------- | -------------------------------------------------------------- |
| GET    | `/admin/units`               | List. Query: `search` (label/symbol), `status`, `page`, `size` |
| GET    | `/admin/units/{id}`          | Chi tiết kèm `productCount` đang dùng                          |
| POST   | `/admin/units`               | Tạo unit mới                                                   |
| PUT    | `/admin/units/{id}`          | Cập nhật label, symbol, description, status                    |
| DELETE | `/admin/units/{id}`          | Soft delete / INACTIVE – kiểm tra productCount trước           |
| GET    | `/admin/units/{id}/products` | _(Optional)_ Danh sách sản phẩm đang dùng unit này             |

### 4.4 Request DTO – POST/PUT `/admin/units`

```json
{
  "label": "Kilogram",
  "symbol": "kg",
  "description": "Đơn vị khối lượng",
  "status": "ACTIVE"
}
```

| Field         | Type   | Bắt buộc | Validation                               |
| ------------- | ------ | -------- | ---------------------------------------- |
| `label`       | String | ✅       | Max 100 ký tự                            |
| `symbol`      | String | ✅       | Max 20 ký tự; unique                     |
| `description` | String | ❌       | Max 500 ký tự                            |
| `status`      | Enum   | ❌       | `ACTIVE` \| `INACTIVE`, default `ACTIVE` |

### 4.5 Frontend Requirements

- Table: **Label**, **Symbol**, **Số sản phẩm đang dùng**, **Status**, **Actions**.
- Search theo label hoặc symbol.
- Form create/edit đơn giản (label, symbol, description, status toggle).
- Khi delete: gọi `GET /admin/units/{id}` lấy `productCount`:
  - `productCount > 0` → warning _"Unit này đang dùng bởi X sản phẩm. Chỉ có thể chuyển INACTIVE."_
  - `productCount = 0` → confirm dialog xóa bình thường.
- Dropdown chọn unit trong form tạo sản phẩm: chỉ load `status = ACTIVE`.

---

## PHẦN 5 – YÊU CẦU CHUNG & ERROR CODES

### 5.1 Error Codes

| HTTP Status | Error Code            | Mô tả                                                           |
| ----------- | --------------------- | --------------------------------------------------------------- |
| 400         | `VALIDATION_ERROR`    | Request body thiếu trường bắt buộc hoặc format sai              |
| 400         | `SLUG_DUPLICATE`      | Slug đã tồn tại                                                 |
| 400         | `CODE_DUPLICATE`      | Attribute code đã tồn tại                                       |
| 400         | `HAS_ACTIVE_PRODUCTS` | Không thể xóa – category/unit/attribute đang được sản phẩm dùng |
| 400         | `HAS_SUB_CATEGORIES`  | Không thể xóa category – còn sub-categories                     |
| 400         | `VALUE_IN_USE`        | Không thể xóa attribute value – đang dùng trong ProductVariant  |
| 401         | `UNAUTHORIZED`        | Token không hợp lệ hoặc hết hạn                                 |
| 403         | `FORBIDDEN`           | Role không đủ quyền (require ADMIN)                             |
| 404         | `NOT_FOUND`           | Entity không tồn tại với ID đã cho                              |
| 409         | `CONFLICT`            | Duplicate mapping (category–attribute cặp này đã tồn tại)       |
| 500         | `INTERNAL_ERROR`      | Lỗi server không xác định                                       |

**Error response format:**

```json
{
  "success": false,
  "data": null,
  "message": "Không thể xóa category vì còn sản phẩm đang hoạt động",
  "errors": {
    "code": "HAS_ACTIVE_PRODUCTS",
    "productCount": 5
  }
}
```

### 5.2 Backend Requirements

- Tất cả API require `Authorization: Bearer <JWT>` header.
- Role check: `ADMIN` – trả về `403 FORBIDDEN` nếu role khác.
- Pagination: `page=0`, `size=20` default; max `size=100`.
- **Soft delete**: set `status = INACTIVE` hoặc `DELETED`, không xóa row khỏi DB.
- **Audit log**: mọi CRUD ghi log `(userId, action, entityType, entityId, oldValue, newValue, timestamp)`.
- **Slug validation**: lowercase, chỉ `a-z`, `0-9`, `-`; không bắt đầu/kết thúc bằng `-`.
- **Auto-generate slug**: xử lý tiếng Việt (dùng Slugify lib); thêm suffix `-2`, `-3`,... nếu trùng.
- **Transaction**: bulk operations (bulk replace mapping, reorder) phải trong 1 DB transaction.
- **N+1 prevention**: dùng `JOIN FETCH` hoặc `@EntityGraph` khi load entity kèm children.

### 5.3 Frontend Requirements

- **Loading state**: skeleton loader hoặc spinner khi fetch data.
- **Error handling**: toast notification khi API error (lấy `message` từ `response.data.message`).
- **React Query**: dùng `useQuery` / `useMutation` + `invalidateQueries` sau mutation.
- **Confirm dialog**: mọi action delete/destructive đều có confirm dialog rõ ràng.
- **Toast**: success (xanh), error (đỏ), warning (vàng) – dùng `react-hot-toast` hoặc `sonner`.
- **Form reset**: reset form sau khi submit thành công trong modal.
- **Role check FE**: ẩn menu/buttons với người dùng không có role ADMIN (đọc từ JWT payload).
- **Optimistic update**: không cần – dùng React Query invalidation sau mutation.

### 5.4 Thứ Tự Implement

| Bước | Module    | Deliverable                                                       |
| ---- | --------- | ----------------------------------------------------------------- |
| 1    | Category  | Entity + Repository + Service + Controller + DTO + List FE        |
| 2    | Category  | Tree API + Form Create/Edit FE + Delete constraint check          |
| 3    | Attribute | Entity + CRUD API + List FE                                       |
| 4    | Attribute | Values management API + Inline edit FE + Drag reorder             |
| 5    | Mapping   | `category_attribute` table + CRUD API + Bulk replace              |
| 6    | Mapping   | FE tab trong Category Detail + Copy-from feature                  |
| 7    | Units     | Full CRUD API + FE                                                |
| 8    | Tích hợp  | Seller form load dynamic attributes theo category + Unit dropdown |

---

## PHẦN 6 – HƯỚNG DẪN NẠP PROMPT CHO AI

### 6.1 System Prompt (nạp 1 lần đầu)

```
Bạn là senior Java/Spring Boot developer với kinh nghiệm xây dựng hệ thống e-commerce.
Hãy generate code production-ready cho Admin E-commerce Catalog Module theo đặc tả được cung cấp.

Yêu cầu kỹ thuật:
- Spring Boot 3.x + Spring Data JPA + Spring Security (JWT)
- Java 17+, clean code, SOLID principles
- Proper exception handling với custom exceptions
- Bean Validation (@Valid + ConstraintValidator)
- ApiResponse<T> wrapper cho tất cả response
- Swagger/OpenAPI annotations
- Unit test cho Service layer (JUnit 5 + Mockito)
```

### 6.2 Task Prompts Theo Từng Phần

**Bước 1 – Category Backend:**

```
Dựa vào đặc tả Catalog Module, generate Category Management backend:

1. Category.java        – JPA Entity, đầy đủ annotations, self-referencing parent
2. CategoryRepository   – Spring Data JPA + custom query (findTree, countProducts)
3. CategoryService      – interface + impl, toàn bộ business logic (slug gen, constraint check)
4. CategoryController   – REST endpoints với @Valid, Swagger annotations
5. DTOs: CategoryRequest, CategoryResponse, CategoryTreeResponse
6. SlugUtils            – xử lý tiếng Việt, unique check

Business rules phải handle:
- Slug auto-gen từ name, unique constraint
- Delete: check HAS_ACTIVE_PRODUCTS + HAS_SUB_CATEGORIES
- Tree builder: load flat list rồi build in-memory (tránh N+1)
- Soft delete (status = DELETED)
```

**Bước 2 – Category Frontend:**

```
Generate Category Management frontend (React + TypeScript + TailwindCSS + React Query):

1. CategoryListPage.tsx     – table với indent theo cấp, search, filter, pagination
2. CategoryFormModal.tsx    – create/edit form, slug auto-gen, parent dropdown (tree)
3. DeleteCategoryDialog.tsx – confirm dialog với warning nếu có products/sub-cats
4. categoryApi.ts           – API calls dùng axios, đầy đủ types
5. useCategory.ts           – React Query hooks (useCategories, useCreateCategory, ...)

Routing: /admin/category
State: React Query (không dùng Redux)
UI: TailwindCSS + shadcn/ui components
```

**Bước 3 – Attribute Backend:**

```
Generate Attribute Management backend theo đặc tả:

1. Attribute.java + AttributeValue.java – JPA Entities
2. AttributeRepository + AttributeValueRepository
3. AttributeService – CRUD + check VALUE_IN_USE khi delete value
4. AttributeController – endpoints cho cả attribute và values
5. DTOs: AttributeRequest, AttributeResponse, AttributeValueRequest, AttributeValueResponse
```

**Bước 4 – Category–Attribute Mapping:**

```
Generate Category-Attribute Mapping module:

1. CategoryAttribute.java – JPA Entity (composite key hoặc surrogate key)
2. CategoryAttributeRepository
3. CategoryAttributeService:
   - assignAttribute(categoryId, attributeId, isRequired, displayOrder)
   - bulkReplace(categoryId, List<MappingRequest>) – trong @Transactional
   - copyFrom(targetCategoryId, sourceCategoryId)
4. Thêm endpoints vào CategoryController
5. Response: kèm đầy đủ attribute info + values khi GET

Lưu ý: bulkReplace phải atomic – xóa toàn bộ rồi insert lại trong 1 transaction.
```

**Bước 5 – Units + Frontend tổng:**

```
Generate Units Management (backend + frontend đơn giản):
1. Unit.java + UnitRepository + UnitService + UnitController + DTOs
2. UnitListPage.tsx + UnitFormModal.tsx
3. Tích hợp: seller product form load attributes theo category + unit dropdown
```

### 6.3 Checklist Trước Khi Deploy

**Backend:**

- [ ] Category CRUD API + Tree API hoạt động đúng
- [ ] Slug unique constraint enforce ở DB + Service layer
- [ ] Delete category: check sub-category + products trước
- [ ] Attribute CRUD + Values management đầy đủ
- [ ] Attribute code unique, validate format
- [ ] `category_attribute` mapping với `isRequired` + `displayOrder` override
- [ ] Bulk replace mapping trong 1 transaction
- [ ] Copy attributes from category feature
- [ ] Units CRUD + check product in use khi delete
- [ ] Tất cả API có JWT + ADMIN role check
- [ ] Error codes chuẩn và error response format nhất quán
- [ ] Audit log khi CRUD dữ liệu quan trọng
- [ ] N+1 query đã được xử lý

**Frontend:**

- [ ] Loading state (skeleton/spinner) cho tất cả fetch
- [ ] Toast notifications (success/error/warning)
- [ ] Confirm dialogs cho mọi action destructive
- [ ] Drag-and-drop reorder attribute values và mapping
- [ ] Inline toggle `isRequired` trong mapping table
- [ ] Copy-from category feature
- [ ] Seller product form load dynamic attributes theo category
- [ ] Unit dropdown chỉ show ACTIVE units
- [ ] Form validation đầy đủ (client-side + hiển thị server error)
- [ ] Role check FE (ẩn UI với non-ADMIN)

---

_Catalog Module Specification v1.0 – Dev 4 – Admin E-commerce Platform_

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
