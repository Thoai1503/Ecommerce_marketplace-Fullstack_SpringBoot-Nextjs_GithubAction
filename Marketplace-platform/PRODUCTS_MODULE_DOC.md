# Products Module - Implementation Guide (Codex)

## Overview
Hoàn thiện module Quản lý Sản phẩm admin và seller, đảm bảo full CRUD + validation + image upload + pagination. Dùng doc này để generate code via Codex, sau đó tôi review + chạy.

---

## 1. CONTEXT (Current State)

### Domain (from domain.md)
- **Product entity**: id, name, slug, price, stock, images, category_id, seller_id, status (is_active), created_at
- **Status enum** (from AdminProductController code):
  - `1` = `APPROVED` (active, visible - seller can't edit)
  - `0` = `HIDDEN` (hidden by admin/seller - inactive)
  - `2` = `PENDING` (awaiting admin approval - seller can edit)
  - `3` = `REJECTED` (rejected by admin - seller can edit + resubmit)
- **ProductVariant**: id, product_id, sku, price, stock, attributes
- **MediaAsset**: id, owner_type (product), owner_id, url, type (image), sort_order

### API Contract (from api-contract.md)
- **Base**: `http://127.0.0.1:8000` (API Gateway)
- **Response envelope**: `{ data, message, meta }`
- **Error envelope**: `{ message, code, errors: {...} }`

### Frontend Architecture (from frontend-architecture.md)
- **Stack**: Next.js App Router, React Query, Axios
- **Layering**: 
  - Service layer: `src/services/*.ts` (axios calls)
  - Query layer: `src/query/*.ts` (React Query hooks)
  - Routes: `src/app/admin/<module>/`
  - Validators: `src/validators/` (Zod)
- **Admin checklist**: create service → create query/hook → create route component

### Backend Architecture (from backend-architecture.md)
- **Owner**: `Marketplace-platform/` (Spring Boot, port 8001)
- **Endpoints**: `/admin/products/**` (admin), `/seller/products/**` (seller)
- **Auth**: seller endpoint phải kiểm tra `seller_id == currentUser.id`
- **Validation**: price/stock ≥0, name required, status transitions valid, unique SKU

---

## 2. AUDIT FINDINGS (Gaps to fix)

### ✅ Already done (Phase 1-3 commit)
- `AdminProductController` với GET list (filter+pagination), GET detail (JOIN), PUT status, approve, reject, delete
- `service/products.ts` bỏ mock, dùng axios thật, mapping layer snake↔camel
- `useProducts` hooks với React Query mutations
- **FE listing** bỏ mock, dùng server-side data
- **OrderDetail** wire done, Edit items modal wire done
- Cột `reject_reason` trong DB + admin list hiển thị
- Cột `images` (persist via product_image table)

### ❌ Still pending (Phase 2.5 — Polish & finalization)
1. **Seller Products CRUD** — `/seller/products/**` endpoint not wired yet
   - FE seller/products page: listing/detail/create/edit
   - BE SellerProductController (filter by seller_id, auth check)
   - Service + hooks cho seller
2. **Product variants** — not implemented
   - Bảng `product_variant` tồn tại ở DB, BE controller chưa có
   - FE variant page chưa có
3. **Inventory adjust** — `/seller/inventory/adjust` not implemented
4. **Bulk edit** (seller) — bulk update price/stock not implemented
5. **Draft auto-save** (seller) — like admin sellers, save draft locally + restore
6. **Missing fields**:
   - Product: `weight, length, width, height` (logistics), `description` (text editor?), `attributes` (đặc điểm sản phẩm)
   - Missing validation cross-field: `originalPrice >= price`, stock ≥0, name length check
7. **Image upload finalization** — current images upload via hook, but **order of images not persisted**, no drag-reorder UI

---

## 3. REQUIREMENTS (What to implement)

### ⭐ Business Logic: Seller tạo (PENDING) → Admin duyệt (APPROVED) hoặc từ chối (REJECTED)

**Status flow** (dùng code's status mapping: is_active value):
```
SELLER ACTION                ADMIN ACTION              STATUS (is_active)
────────────────────────────────────────────────────────────────────
Tạo sản phẩm        →      (tự động)          →    PENDING (2) 🔵
Sửa (PENDING)       →      (chờ admin duyệt)  →    PENDING (2)
                           Duyệt (approve)    →    APPROVED (1) ✅ (live)
                           Từ chối + reason   →    REJECTED (3) ❌
Sửa (REJECTED)      →      (nhìn lý do từ chối)
                           Gửi duyệt lại     →    PENDING (2) 🔄
```

**Key rules**:
- **Admin KHÔNG tạo product** — chỉ duyệt seller's products
- Seller **không được chọn status**, luôn = `PENDING` (is_active=2) khi POST
- Seller chỉ sửa được khi status = `PENDING` hoặc `REJECTED`
- Seller xóa được khi status ≠ `APPROVED`
- Admin duyệt (`/approve`) → `APPROVED` (is_active=1, live), từ chối (`/reject`) → `REJECTED` (is_active=3) + reason
- Seller sửa rejected rồi gọi `/resubmit` → status = `PENDING` lại (vào queue duyệt lại)

---

### 3.1 Seller Products CRUD (Priority 1)

#### Backend — SellerProductController.java
- **Route prefix**: `/seller/products`
- **Endpoints**:
  - `GET /` (list) — filter by status, search name, category, pagination. Trả `{data[], meta}`. Kiểm tra `seller_id`. Show all statuses (PENDING/APPROVED/REJECTED/HIDDEN).
  - `GET /{id}` — chi tiết + images + rejectReason nếu REJECTED. Kiểm tra seller ownership.
  - `POST /` — body: name, description, category_id, price, originalPrice, stock, weight, length, width, height, images[] (URLs). **Status ALWAYS = 2 (PENDING)** (server-side, không cho seller chọn). Validate required fields, price/stock ≥0, originalPrice ≥ price. Kiểm tra currentUser.seller_id.
  - `PUT /{id}` — cập nhật fields. **Chỉ cho edit khi status = PENDING (2) hoặc REJECTED (3)**. Reject 400 "Không thể sửa sản phẩm đã được duyệt" nếu status = APPROVED (1). Kiểm tra ownership.
  - `DELETE /{id}` — soft delete (set status=HIDDEN, is_active=0). **Chỉ khi status ≠ APPROVED** (reject nếu APPROVED).
  - `POST /{id}/resubmit` — nếu status = REJECTED (3) → đổi thành PENDING (2) (seller gửi duyệt lại). Reject 400 nếu status ≠ REJECTED.

**Validation rules**:
  - name: 3-100 chars, required
  - price, originalPrice: ≥1000, originalPrice ≥ price
  - stock: ≥0
  - category_id: kiểm tra hợp lệ
  - images: có thể rỗng (fallback placeholder)
  - Reject reason: hiển thị từ cột `reject_reason` khi status = REJECTED

**Response DTO**:
```json
{
  "id": 1,
  "name": "Product Name",
  "slug": "product-name-1234567",
  "description": "...",
  "categoryId": 1,
  "price": 100000,
  "originalPrice": 150000,
  "stock": 10,
  "weight": 0.5,
  "length": 10,
  "width": 5,
  "height": 3,
  "status": "active",
  "rejectReason": null,
  "images": ["url1", "url2"],
  "variants": [{id, sku, price, stock}],
  "shopId": 1,
  "shopName": "My Shop",
  "createdAt": "2026-04-26T...",
  "updatedAt": "2026-04-26T..."
}
```

#### Frontend — Seller Products Service & Hooks

**File**: `marketfrontend/src/service/sellerProducts.ts`
```typescript
// getSellerProducts(filters: {status, search, categoryId, page, size})
// getSellerProductById(id)
// createSellerProduct(payload) — POST /seller/products, status = PENDING (2) auto (server-side)
// updateSellerProduct(id, payload) — PUT /seller/products/{id}, chỉ khi status ≠ APPROVED (1)
// deleteSellerProduct(id) — DELETE /seller/products/{id}, chỉ khi status ≠ APPROVED (1)
// resubmitProductForApproval(id) — POST /seller/products/{id}/resubmit, REJECTED (3) → PENDING (2)
// Mapping: snake_case → camelCase, toast VN errors, handle is_active to/from status
```

**File**: `marketfrontend/src/hooks/seller/useSellerProducts.ts`
```typescript
// useSellerProducts(filters) — React Query, returns {data, isLoading, error}
// useSellerProductDetail(id) — GET detail
// useCreateSellerProduct() — mutation POST /seller/products
// useUpdateSellerProduct() — mutation PUT /seller/products/{id}, disable UI if status=APPROVED
// useDeleteSellerProduct() — mutation DELETE /seller/products/{id}, disable UI if status=APPROVED
// useResubmitProduct() — mutation POST /seller/products/{id}/resubmit, REJECTED→PENDING
// All invalidate cache (["seller", "products", "list"] + ["seller", "products", id]) correctly
```

#### Frontend — Seller Products Pages

**File**: `marketfrontend/src/app/seller/products/page.tsx`
- List: TanStack Table with search, filter status (draft/pending/active/rejected), category, pagination
- Actions: View, Edit, Delete, Submit (if draft/rejected), Upload images
- Bulk: select multiple → bulk delete, bulk status change (nếu tương tự admin)
- Status badge: draft (yellow), pending (blue), active (green), rejected (red)

**File**: `marketfrontend/src/app/seller/products/new/page.tsx`
- Create form: có thể reuse EditProduct component (admin) nhưng adapt cho seller context
- Fields: name, description, category, price, originalPrice, stock, weight/length/width/height, images
- **NO status field** (status = PENDING auto, seller không thấy, không chọn)
- Validation Zod: required, price/stock ≥0, originalPrice ≥ price, name 3-100 chars
- Draft auto-save (localStorage, restore trên refresh)
- Submit button: "Lưu nháp" hoặc "Gửi duyệt" (POST → status = PENDING (2) tự động ở server)

**File**: `marketfrontend/src/app/seller/products/[id]/page.tsx`
- Detail page: show all fields (name, price, stock, images, etc.)
- Status badge: PENDING (amber "Chờ duyệt") / APPROVED (green "Đang bán") / REJECTED (red "Từ chối")
- If status = REJECTED (3): 
  - Show reject reason in red banner
  - "Sửa & Gửi duyệt lại" button → `/[id]/edit` → after save → call `/resubmit` API → status PENDING lại
  - Toast "Đã gửi duyệt lại, chờ admin xem xét"
- If status = PENDING (2):
  - "Sửa" button → `/[id]/edit`
  - "Xóa" button (with confirm)
  - Note "Đang chờ duyệt..."
- If status = APPROVED (1):
  - Show "Sản phẩm đã được duyệt ✅"
  - "Sửa" button disabled + tooltip "Không thể sửa sản phẩm đã duyệt. Liên hệ admin để thay đổi."
  - "Xóa" button disabled
- Variants section: list variants, create variant button (nếu implement)

**File**: `marketfrontend/src/app/seller/products/[id]/edit/page.tsx`
- Same form as create, but pre-fill data from `getSellerProductById`
- Can't edit if status=active (seller cần submit lại qua detail page để unlock?)
- Or allow edit but mark status → pending_approval after save

---

### 3.2 Product Variants (Priority 2)

#### Backend — SellerProductVariantController.java
- **Route**: `/seller/products/{productId}/variants`
- **Endpoints**:
  - `GET /` — list variants for product
  - `POST /` — body: sku, price, stock, attributes (JSON: {color: "red", size: "M"}). Validate unique SKU per product.
  - `PUT /{variantId}` — update price, stock, attributes
  - `DELETE /{variantId}`

#### Frontend — Variant management
- `marketfrontend/src/app/seller/products/[id]/variants/page.tsx`
- TanStack Table: SKU, attributes, price, stock, actions
- Create modal: SKU (must unique), attributes (from product category), price, stock
- Bulk edit: select multiple, set price, set stock
- Delete with confirm

---

### 3.3 Inventory Adjust (Priority 3)

#### Backend — SellerInventoryController.java
- **Route**: `/seller/inventory`
- **Endpoints**:
  - `POST /adjust` — body: variantId (or productId), type (in/out/adjust), quantity, reason. Log vào InventoryAdjustment table.
  - `GET /low-stock?threshold=5` — list variants với stock < threshold

#### Frontend
- `marketfrontend/src/app/seller/inventory/page.tsx`
- View low-stock items, quick adjust button
- Adjust modal: type (nhập/xuất/điều chỉnh), quantity, reason

---

### 3.4 Admin Products (Review Seller's PENDING only) — NO CREATE

#### ⚠️ IMPORTANT: Admin CANNOT create products
- AdminProductController POST endpoint sẽ bị **disable** hoặc remove (nếu tồn tại)
- Admin chỉ được:
  - List seller's PENDING products (filter by status=PENDING)
  - View detail (JOIN seller/shop/images)
  - `PATCH /{id}/approve` — status: APPROVED (1)
  - `PATCH /{id}/reject` — status: REJECTED (3), yêu cầu reason
  - Không được sửa/xóa (seller sở hữu)

#### Still need in AdminProductController
- Seller column JOIN shop → show `shopName` (đã có ở code, verify)
- Filter by seller/shop
- Search by name/SKU
- Bulk approve/reject → `Promise.all` mutations
- Export CSV (optional)

#### FE Admin Products Listing
- Verify server-side pagination wired (truyền params qua useProducts)
- Default filter: status = PENDING (chỉ hiển thị items chờ duyệt)
- Seller column visible + sortable
- Bulk actions (select multiple → duyệt/từ chối) + toast feedback
- NO "Thêm sản phẩm" button (admin không tạo)

---

## 4. MIGRATION SQL

Các cột/bảng cần check DB có:

```sql
-- Check cột tồn tại
SHOW COLUMNS FROM product;
-- Cần có: reject_reason, images_json (fallback), description, weight, length, width, height

-- Check bảng
SHOW TABLES LIKE '%variant%';
SHOW TABLES LIKE '%inventory%';

-- Nếu thiếu, tạo:
CREATE TABLE product_variant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price INT NOT NULL,
  stock INT DEFAULT 0,
  attributes JSON,
  status VARCHAR(50) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

CREATE TABLE inventory_adjustment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  variant_id INT,
  type VARCHAR(20) NOT NULL, -- in/out/adjust
  quantity INT NOT NULL,
  reason VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES product(id),
  FOREIGN KEY (variant_id) REFERENCES product_variant(id)
);

-- Thêm cột product nếu thiếu
ALTER TABLE product ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE product ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2);
ALTER TABLE product ADD COLUMN IF NOT EXISTS length DECIMAL(8,2);
ALTER TABLE product ADD COLUMN IF NOT EXISTS width DECIMAL(8,2);
ALTER TABLE product ADD COLUMN IF NOT EXISTS height DECIMAL(8,2);
```

---

## 5. IMPLEMENTATION STEPS (Order for Codex)

### Step 1: Backend BE SellerProductController + endpoints (30 min)
**Codex prompt**: 
- Create `SellerProductController.java` với GET list/detail, POST create, PUT update, DELETE, POST submit
- Validate theo requirements ở mục 3.1
- Use existing pattern từ `AdminProductController` (nested classes, raw JDBC hoặc repository tuỳ có)
- Return camelCase DTO matching response shape

### Step 2: Backend migrations (5 min)
**Codex prompt**:
- Create `migrate_seller_products.sql` thêm cột description, weight, length, width, height vào product
- Create migration cho product_variant table + inventory_adjustment table nếu chưa có

### Step 3: Frontend Service + Hooks (15 min)
**Codex prompt**:
- Create `service/sellerProducts.ts` với API calls, mapping layer
- Create `hooks/seller/useSellerProducts.ts` với React Query hooks, mutations

### Step 4: Frontend Pages — Seller Products (30 min)
**Codex prompt**:
- Create `app/seller/products/page.tsx` — listing TanStack Table
- Create `app/seller/products/new/page.tsx` — create form
- Create `app/seller/products/[id]/page.tsx` — detail
- Create `app/seller/products/[id]/edit/page.tsx` — edit form
- Use EditProduct component + form validation + draft auto-save

### Step 5: Verify + Test (user manual)
- Run migrations on DB
- Start Spring Boot
- Hard refresh, test seller products flow

---

## 6. CODE STANDARDS (để Codex biết)

### Backend
- Package: `docker_test.com.controllers` (admin) / `docker_test.com.controllers.seller` (seller)
- Exception handling: `try-catch` with 400/500 response + message VN
- Validation: field error messages VN, return `{ message, code, errors: {...} }`
- DTO: use `public class XyzDto { ... }` with getters (hoặc Lombok `@Data`)

### Frontend
- Service: export functions như `getSellerProducts(params)`, dùng `extractErrorMessage` để dịch error
- Hooks: export `useSellerProducts(filters)` return `{data, isLoading, error}` + mutations
- Components: Zod validation, toast VN, `disabled` khi submitting
- Pattern: match `AdminProductController` pages

---

## 7. Testing Checklist (Seller → Admin Approve Flow)

**Seller side**:
- [ ] Seller login + navigate `/seller/products`
- [ ] Create product: fill form (name/price/stock/images), **NO status field visible**
- [ ] Click "Gửi duyệt" → POST → status = PENDING (2) auto (server-side), see "Chờ duyệt..." (blue badge)
- [ ] List: shows PENDING status (amber badge "Chờ duyệt"), edit/delete buttons work
- [ ] Detail: edit button → can modify fields, save → PUT, confirm "Cập nhật thành công"
- [ ] Admin rejects with reason → seller sees red banner "Lý do từ chối: {reason}" + "Sửa & Gửi duyệt lại" button
- [ ] Click "Sửa & Gửi duyệt lại" → edit form → save → click "Gửi duyệt" → POST /resubmit → status = PENDING (2) again
- [ ] After admin approves → status = APPROVED (green "Đang bán"), edit/delete buttons disabled, tooltip "Không thể sửa sản phẩm đã duyệt"

**Admin side**:
- [ ] Admin login `/admin/products`, default view shows **PENDING products only**
- [ ] NO "Thêm sản phẩm" button (admin cannot create)
- [ ] Seller column visible with shop name, sortable
- [ ] Click "Duyệt" on product → status = APPROVED (1), green badge "Đang bán", toast "Đã duyệt sản phẩm"
- [ ] Click "Từ chối" → modal nhập reason → POST /reject → status = REJECTED (3), red badge, seller sees notification
- [ ] Bulk select multiple PENDING products → "Duyệt tất cả" / "Từ chối tất cả" buttons → Promise.all mutations
- [ ] REJECTED product not in PENDING list (filter out), seller thấy ở `/seller/products` với status REJECTED
- [ ] Images uploaded + order persisted (or note as Phase 3.5 TODO)

---

## 8. NOT INCLUDED (Phase 3 onwards)

- Variants UI (complex, can do after main product CRUD works)
- Inventory UI (low priority)
- Draft server-side save (optional, localStorage ok)
- Bulk edit (can add if time)
- Category/attribute management (separate module)
- Search/filter optimization (later if slow)

---

## Next: Send this to Codex
Codex sẽ generate code theo 5 steps. Sau đó bạn báo tôi, tôi review + integrate + chạy test.

---

# 9. PHASE 4 — Status-Specific Enhancements (Detail Page)

> **Mục tiêu:** Nâng cấp UI/UX trang chi tiết sản phẩm cho mỗi trạng thái (PENDING/APPROVED/REJECTED/HIDDEN) với features chuyên biệt giúp admin ra quyết định nhanh hơn, đồng thời tăng độ tin cậy của hệ thống.

> **File chính:** `marketfrontend/src/app/admin/products/ProductDetail.tsx`

> **Pre-requisite:** Hoàn thành Phase 1-3 (admin products CRUD + status flow)

---

## 9.1. ⚠️ REJECTED — Quality Warning Highlights

### 🎯 Mục đích
Khi admin xem sản phẩm REJECTED, **tự động phân tích các trường có vấn đề** và highlight để admin biết tại sao bị từ chối, đồng thời giúp seller biết phải sửa gì khi resubmit.

### 📋 Quality Rules (Heuristics — không cần ML)

| Rule | Điều kiện | Severity | Suggestion |
|------|-----------|----------|------------|
| **Missing images** | `images.length === 0` | 🔴 critical | "Thêm ít nhất 1 hình ảnh sản phẩm" |
| **Few images** | `images.length < 3` | 🟡 warning | "Nên có ít nhất 3 hình từ nhiều góc độ" |
| **Short description** | `description.length < 50` | 🟡 warning | "Mô tả nên có ít nhất 50 ký tự" |
| **No description** | `!description \|\| description.trim() === ""` | 🔴 critical | "Bắt buộc có mô tả sản phẩm" |
| **Suspicious price** | `price < 1000` | 🟡 warning | "Giá quá thấp, nên kiểm tra lại" |
| **Price > original_price** | `originalPrice && price > originalPrice` | 🔴 critical | "Giá bán cao hơn giá gốc — không hợp lệ" |
| **Out of stock** | `stock === 0` | 🟡 warning | "Sản phẩm đang hết hàng" |
| **No category** | `!category || category === '0'` | 🔴 critical | "Phải chọn danh mục" |
| **No SKU** | `!sku` | 🟡 warning | "Nên có SKU để quản lý" |
| **No brand** | `!brand` | 🟢 info | "Có thương hiệu sẽ tăng độ tin cậy" |
| **No dimensions** | `!weight && !length` | 🟢 info | "Thêm kích thước/cân nặng để tính phí ship" |
| **Single variant only** | `variants?.length === 1` | 🟢 info | "Có thể thêm nhiều biến thể (size, color)" |

### 🎨 UI Spec

**Component:** `<QualityWarnings product={product} />`
- Vị trí: Trong **Action Card REJECTED** (right sidebar), TRÊN nút "Phục hồi"
- Hiển thị: Card với header "🔍 Phân tích chất lượng"
- Mỗi rule fail → 1 row:
  ```
  [🔴 icon] Không có hình ảnh sản phẩm
           → Suggestion: Thêm ít nhất 1 hình
  ```
- Sort theo severity: critical → warning → info
- Color coding:
  - 🔴 critical: bg-red-50, border-red-200, text-red-700
  - 🟡 warning: bg-amber-50, border-amber-200, text-amber-700
  - 🟢 info: bg-blue-50, border-blue-200, text-blue-700

**Inline Field Highlights** (LEFT column):
- Field nào có problem → wrap với `<FieldWarning severity={...}>`
- Hiển thị red/amber border + warning icon ở góc
- Tooltip on hover: lý do + suggestion

### 🛠 Implementation Steps

**Step 1:** Tạo `marketfrontend/src/lib/productQualityCheck.ts`
```typescript
import { Product } from '@/types';

export type QualityIssue = {
  field: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
};

export function checkProductQuality(product: Product): QualityIssue[] {
  const issues: QualityIssue[] = [];
  // Implement all rules from table above
  // Return sorted by severity
}
```

**Step 2:** Tạo `marketfrontend/src/components/admin/products/QualityWarnings.tsx`
- Props: `{ product: Product }`
- Calls `checkProductQuality(product)`
- Render list of issues với UI spec ở trên
- Empty state nếu không có issues: "✅ Không phát hiện vấn đề rõ ràng"

**Step 3:** Tạo `marketfrontend/src/components/admin/products/FieldWarning.tsx`
- Wrapper component
- Props: `{ children, severity, message }`
- Render children + warning indicator (icon góc top-right)

**Step 4:** Update `ProductDetail.tsx`
- Import `QualityWarnings` + `FieldWarning`
- Trong Action Card REJECTED (right), thêm `<QualityWarnings />` trước buttons
- Wrap fields có problem (image, description, price, stock) với `<FieldWarning>`

### ✅ Acceptance Criteria
- [ ] Sản phẩm REJECTED không có ảnh → hiển thị 🔴 "Không có hình ảnh"
- [ ] Sản phẩm REJECTED có description < 50 chars → 🟡 "Mô tả ngắn"
- [ ] Click rule → highlight section tương ứng (smooth scroll)
- [ ] Sản phẩm hoàn hảo → Empty state ✅
- [ ] Component cũng hiển thị cho admin khi xem PENDING (giúp predict reject)

---

## 9.2. 📊 APPROVED — Performance Dashboard Mini

### 🎯 Mục đích
Sản phẩm APPROVED cần hiển thị performance metrics để admin/seller biết sản phẩm có bán tốt không, có cần promote không.

### 📋 Metrics Cần Hiển Thị

| Metric | Source | Visualization |
|--------|--------|---------------|
| **Doanh thu (30 ngày)** | SUM(order_item.subtotal) | Line chart 30 days |
| **Số đơn hàng** | COUNT(orders) | Number + sparkline |
| **Lượt xem** | product_view table (cần tạo) | Number + sparkline |
| **Tỷ lệ conversion** | orders / views | Percentage gauge |
| **Top buyers** | GROUP BY customer | List top 5 |
| **Stock velocity** | stock_change / time | Days remaining chart |

### 🛠 Database Changes

**Tạo bảng `product_view`:**
```sql
CREATE TABLE IF NOT EXISTS product_view (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  user_id BIGINT NULL, -- null nếu guest
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product_viewed (product_id, viewed_at),
  INDEX idx_user (user_id),
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);
```

**Tạo view `product_daily_stats`:**
```sql
CREATE OR REPLACE VIEW product_daily_stats AS
SELECT
  p.id AS product_id,
  DATE(pv.viewed_at) AS date,
  COUNT(DISTINCT pv.id) AS view_count,
  COUNT(DISTINCT pv.user_id) AS unique_visitors,
  COUNT(DISTINCT oi.id) AS order_count,
  COALESCE(SUM(oi.subtotal), 0) AS revenue
FROM product p
LEFT JOIN product_view pv ON pv.product_id = p.id
LEFT JOIN order_item oi ON oi.product_id = p.id AND DATE(oi.created_at) = DATE(pv.viewed_at)
GROUP BY p.id, DATE(pv.viewed_at);
```

### 🎨 UI Spec

**Component:** `<ProductPerformanceDashboard product={product} />`
- Vị trí: Trong **Left column** của ProductDetail, sau "Thông tin chi tiết", trước "Pricing"
- Visible: Chỉ khi `product.status === 'APPROVED'`
- Layout: Grid 2x2 trên desktop, 1 column mobile

**Cards:**
1. **Revenue Card** (Top-left)
   - Label: "Doanh thu 30 ngày"
   - Big number: `12.5M ₫`
   - Sparkline mini (xanh lá nếu trending up)
   - Compare: "↑ 15% vs 30 ngày trước"

2. **Orders Card** (Top-right)
   - Label: "Đơn hàng"
   - Big number: `234`
   - Bar chart (Mon/Tue/Wed.../Sun)
   - Conversion: "Tỷ lệ: 3.2%"

3. **Views Card** (Bottom-left)
   - Label: "Lượt xem"
   - Big number: `1.2k`
   - Line chart 30 days
   - Trend indicator

4. **Stock Velocity** (Bottom-right)
   - Label: "Tốc độ bán"
   - Number: "2.3 SP/ngày"
   - Predict: "Hết hàng trong ~15 ngày"
   - Progress bar (current stock %)

### 🛠 Backend Changes

**Endpoint mới:** `GET /admin/products/{id}/stats?days=30`

**Response:**
```json
{
  "data": {
    "revenue": {
      "total": 12500000,
      "trend": [{ "date": "2026-04-01", "value": 100000 }, ...],
      "comparePrev": 0.15
    },
    "orders": {
      "total": 234,
      "byDayOfWeek": [10, 15, 12, ...]
    },
    "views": {
      "total": 1200,
      "uniqueVisitors": 980,
      "trend": [...]
    },
    "stockVelocity": {
      "avgPerDay": 2.3,
      "daysRemaining": 15
    },
    "topBuyers": [
      { "userId": 1, "name": "Nguyen A", "orderCount": 5, "totalSpent": 500000 }
    ]
  }
}
```

**File:** `Marketplace-platform/src/main/java/docker_test/com/controllers/admin/ProductStatsController.java`

### 🛠 Implementation Steps

**Step 1:** Run SQL migrations (product_view + product_daily_stats view)

**Step 2:** Backend
- Create `ProductStatsController`
- Create `ProductStatsRepository` với raw queries
- Tạo DTOs: `RevenueStats`, `OrderStats`, `ViewStats`, `StockStats`

**Step 3:** Frontend
- Install lib: `npm install recharts` (nếu chưa có)
- Create `marketfrontend/src/services/productStats.ts`
- Create `marketfrontend/src/hooks/admin/useProductStats.ts`
- Create components:
  - `<RevenueCard />` với LineChart
  - `<OrdersCard />` với BarChart
  - `<ViewsCard />` với SparkLine
  - `<StockVelocityCard />` với ProgressBar

**Step 4:** Track product views
- Frontend: Trong `useProductDetail` hook, gọi POST `/api/products/{id}/view` khi user vào trang detail (debounce 5s)
- Backend: Endpoint POST `/products/{id}/view` insert vào `product_view`

### ✅ Acceptance Criteria
- [ ] Sản phẩm APPROVED hiển thị 4 stat cards
- [ ] Charts render đúng với data từ API
- [ ] Loading skeleton khi đang load stats
- [ ] Empty state nếu chưa có data: "Chưa có dữ liệu trong 30 ngày qua"
- [ ] Filter dropdown: 7d / 30d / 90d / 1y
- [ ] Mobile responsive

---

## 9.3. 🔒 HIDDEN — Audit Trail (Who Hid + Why)

### 🎯 Mục đích
Khi sản phẩm bị ẩn, cần biết **AI ẩn** (admin nào, seller nào) và **TẠI SAO** ẩn (lý do). Đây là requirement bắt buộc cho compliance/audit.

### 🛠 Database Changes

**Migration:** `migrate_product_hide_audit.sql`
```sql
-- Add audit columns to product
ALTER TABLE product
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMP NULL AFTER reject_reason,
  ADD COLUMN IF NOT EXISTS hidden_by BIGINT NULL AFTER hidden_at,
  ADD COLUMN IF NOT EXISTS hidden_reason VARCHAR(500) NULL AFTER hidden_by,
  ADD COLUMN IF NOT EXISTS hidden_by_role VARCHAR(20) NULL AFTER hidden_reason;
  -- hidden_by_role: 'ADMIN' | 'SELLER' | 'SYSTEM'

-- Optional: Audit log table for full history
CREATE TABLE IF NOT EXISTS product_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  from_status VARCHAR(20) NOT NULL,
  to_status VARCHAR(20) NOT NULL,
  reason VARCHAR(500),
  changed_by BIGINT,
  changed_by_role VARCHAR(20),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id, changed_at),
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);
```

### 🛠 Backend Changes

**Update `Product.java` model:**
- Add fields: `hiddenAt`, `hiddenBy`, `hiddenReason`, `hiddenByRole`
- Add getters/setters

**Update `AdminProductController`:**
- Modify `PATCH /admin/products/{id}/status` (hoặc tạo `PATCH /admin/products/{id}/hide`)
- Body required khi hide: `{ "status": "HIDDEN", "reason": "Vi phạm quy định" }`
- Set `hidden_at = NOW()`, `hidden_by = currentUser.id`, `hidden_reason = body.reason`, `hidden_by_role = currentUser.role`
- Log vào `product_status_history`

**New endpoint:** `GET /admin/products/{id}/history`
- Returns full status history list
- Used for Activity Timeline

### 🎨 UI Spec

**Update Hide Action:**
- Hiện tại: Click "Tạm ẩn" → confirm modal → hide
- **Mới:** Click "Tạm ẩn" → modal yêu cầu **nhập lý do** (giống reject)

**Component:** `<HideProductModal />`
- Props: `{ isOpen, onClose, onConfirm: (reason) => void, productName }`
- Layout giống `RejectProductModal`
- Header: "Tạm ẩn sản phẩm"
- Textarea required: "Lý do ẩn (sẽ hiển thị cho seller)"
- Quick reasons (chips): "Vi phạm quy định" / "Hết hàng dài hạn" / "Yêu cầu seller" / "Vấn đề chất lượng"
- Submit btn: "Tạm ẩn sản phẩm"

**Update HIDDEN Action Card** (right sidebar trong ProductDetail):
```
┌─────────────────────────────────┐
│ 🔒 Đang ẩn                       │
├─────────────────────────────────┤
│ 📅 Đã ẩn lúc: 26/04/2026 14:32   │
│ 👤 Bởi: Admin User (ADMIN)       │
│ 📝 Lý do:                        │
│   "Vi phạm quy định về hình     │
│    ảnh sản phẩm"                │
├─────────────────────────────────┤
│ [👁 Hiện lại → Đang bán]         │
│ [🗑 Xóa vĩnh viễn]               │
└─────────────────────────────────┘
```

**Activity Timeline (right sidebar):**
- Khi product status = HIDDEN, thêm entry:
  ```
  ⚫ Đã ẩn sản phẩm
     26/04/2026 14:32 — Bởi Admin User
     "Vi phạm quy định..."
  ```

### 🛠 Implementation Steps

**Step 1:** Run SQL migration

**Step 2:** Backend
- Update `Product.java` add fields
- Update `ProductRepository.java` GetById SQL include hidden_* columns
- Update `AdminProductController`:
  - Hide endpoint: require reason in body
  - Save audit fields
  - Insert into status_history
- Tạo `GET /admin/products/{id}/history` endpoint

**Step 3:** Frontend
- Update `Product` type: add `hiddenAt`, `hiddenBy`, `hiddenReason`, `hiddenByRole`
- Update `service/products.ts` mapping
- Tạo `HideProductModal.tsx` (clone từ RejectProductModal)
- Update `ProductDetail.tsx`:
  - Replace `confirm()` → `<HideProductModal />`
  - Update HIDDEN action card → show audit info
  - Update Activity Timeline → show hide reason

**Step 4:** Update bulk hide (nếu có)
- Bulk hide cũng phải nhập reason

### ✅ Acceptance Criteria
- [ ] Click "Tạm ẩn" → modal yêu cầu lý do
- [ ] DB có `hidden_at`, `hidden_by`, `hidden_reason`, `hidden_by_role` được lưu đúng
- [ ] HIDDEN product detail page hiển thị: ai ẩn, khi nào, tại sao
- [ ] Timeline log entry chính xác
- [ ] Quick reason chips work (autofill textarea)
- [ ] Required validation: không thể ẩn không lý do

---

## 9.4. 🤖 PENDING — AI Fraud Detection (Phase 5)

### 🎯 Mục đích
Tự động phân tích các sản phẩm PENDING và **gắn cờ** những sản phẩm có dấu hiệu bất thường: fake, copy paste, suspicious price, etc. Giúp admin focus vào những sản phẩm cần review kỹ.

> **Lưu ý:** Phase 5 — Implement sau khi 9.1-9.3 stable. Cần MCP integration hoặc API LLM.

### 📋 Detection Rules

#### **Tier 1: Heuristic Rules (No AI needed)**

| Rule | Logic | Severity |
|------|-------|----------|
| **Duplicate name** | EXISTS another product with same name (different shop) | 🟡 medium |
| **Suspicious low price** | price < AVG(category_price) * 0.3 | 🟡 medium |
| **Brand mismatch** | brand mentioned in description but not matching `brand` field | 🟡 medium |
| **Stock too high** | stock > 10000 | 🟢 low |
| **Description copy from web** | Detected via search engine API | 🔴 high |
| **New seller, expensive product** | seller.totalProducts < 5 AND price > 5M | 🔴 high |
| **Unusual SKU pattern** | SKU không match shop pattern | 🟢 low |
| **Image reuse** | Image URL exists in another product | 🔴 high |

#### **Tier 2: LLM-Powered (Need OpenAI/Claude API)**

Send to LLM:
```
Analyze this product listing for suspicious activity:
- Name: {name}
- Description: {description}
- Brand: {brand}
- Price: {price}
- Category: {category}
- Seller: {seller_name} ({total_products} products, {rating}⭐)

Return JSON:
{
  "fraudScore": 0-100,
  "concerns": ["concern1", "concern2"],
  "recommendation": "approve" | "review" | "reject",
  "reasoning": "..."
}
```

### 🛠 Database Changes

```sql
-- Cache AI analysis results to avoid re-running
CREATE TABLE IF NOT EXISTS product_fraud_check (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL UNIQUE,
  fraud_score INT NOT NULL DEFAULT 0, -- 0-100
  concerns JSON, -- array of strings
  recommendation VARCHAR(20), -- approve | review | reject
  reasoning TEXT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checked_by VARCHAR(50), -- 'heuristic' | 'gpt-4' | 'claude' | 'manual'
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
  INDEX idx_score (fraud_score DESC)
);
```

### 🛠 Backend Changes

**New service:** `FraudDetectionService.java`
- Method `analyzeProduct(Product p): FraudCheckResult`
- Run heuristic rules first
- If `fraudScore >= 50` → trigger LLM analysis (async via CompletableFuture)
- Save result to `product_fraud_check`

**New endpoint:** `POST /admin/products/{id}/fraud-check`
- Force re-run analysis
- Returns latest result

**Auto-trigger:** Khi seller submit product (status = PENDING) → background job analyze

**Config:** `application.properties`
```properties
ai.fraud-detection.enabled=true
ai.fraud-detection.provider=anthropic # or openai
ai.fraud-detection.threshold=50
anthropic.api-key=${ANTHROPIC_API_KEY}
anthropic.model=claude-haiku-4-5
```

### 🎨 UI Spec

**Component:** `<AIFraudWarning product={product} fraudCheck={...} />`
- Vị trí: TRÊN Review Checklist trong PENDING Action Card
- Visible: chỉ khi `fraudScore >= 30`

**Visual:**
```
┌──────────────────────────────────────┐
│ 🤖 AI Fraud Detection                  │
│ ┌────────────────────────────────┐  │
│ │ Risk Score: ████████░░ 75/100  │  │
│ │ Recommendation: ⚠️ Review kỹ    │  │
│ └────────────────────────────────┘  │
│                                      │
│ Concerns:                            │
│ • Tên sản phẩm trùng với 3 sp khác  │
│ • Mô tả copy từ trang Tiki          │
│ • Giá thấp bất thường                │
│                                      │
│ [Xem phân tích chi tiết →]           │
└──────────────────────────────────────┘
```

**Color coding by score:**
- 0-30: 🟢 Safe (không hiển thị warning)
- 31-60: 🟡 Suspicious (hiển thị card amber)
- 61-100: 🔴 High Risk (hiển thị card red + animation pulse)

**Modal "Xem phân tích chi tiết":**
- Show full reasoning từ LLM
- Show từng rule đã trigger
- Button "Re-run analysis"
- Button "Mark as false positive" (admin override)

### 🛠 Implementation Steps (Phase 5)

**Step 1:** Run DB migration `product_fraud_check`

**Step 2:** Backend Heuristic Rules
- Tạo `FraudDetectionService` với 8 heuristic rules
- Tạo controller endpoint
- Tạo background job (Spring `@Async`) chạy khi product status changes to PENDING

**Step 3:** Backend LLM Integration
- Add Anthropic Java SDK dependency
- Implement LLM call với caching
- Rate limiting (max 100 requests/hour)
- Fallback to heuristic-only nếu LLM fails

**Step 4:** Frontend
- Update `Product` type: add `fraudCheck` field
- Update `service/products.ts` mapping
- Tạo `<AIFraudWarning />` component
- Tạo `<FraudCheckDetailModal />`
- Add hook `useFraudCheck(productId)` với React Query

**Step 5:** Admin UI Enhancement
- Trong product list: show fraud score badge cho PENDING products
- Filter: "Sort by fraud risk"
- Bulk action: "Auto-reject high risk products"

### ✅ Acceptance Criteria
- [ ] PENDING product với suspicious data → fraudScore > 50
- [ ] LLM analysis triggered async, không block UI
- [ ] Cached results: same product không re-run trong 24h
- [ ] Admin có thể "Mark as false positive" để override
- [ ] Rate limiting: không gọi LLM quá nhiều
- [ ] Fallback graceful nếu LLM API fail
- [ ] Configurable threshold qua env vars

### 🚨 Privacy & Cost Notes
- **DO NOT** send PII (seller phone/email) to LLM
- **DO** mask sensitive fields trước khi gửi
- **Estimated cost:** ~$0.001/product với Claude Haiku
- **Budget:** Set monthly cap (e.g. $50/month)

---

## 10. IMPLEMENTATION ORDER (Phase 4)

**Recommended sequence:**

### Sprint 1 (Easy wins — 1-2 ngày)
1. **9.1 — Quality Warnings (REJECTED)** — pure frontend, no DB changes
2. **9.3.1 — Hide audit DB schema** — chỉ migration, không UI

### Sprint 2 (Backend infrastructure — 2-3 ngày)
3. **9.3 — Full HIDDEN audit trail** — BE + FE integration
4. **9.2.1 — Product views tracking** — DB + tracking endpoint

### Sprint 3 (Charts & dashboards — 3-4 ngày)
5. **9.2 — APPROVED Performance Dashboard** — full implementation với recharts

### Sprint 4 (Phase 5 — AI features)
6. **9.4 — AI Fraud Detection** — heuristic rules first
7. **9.4 — LLM integration** — only after heuristics stable

---

## 11. CODEX PROMPT (Phase 4)

```
📋 TASK: Implement Phase 4 Status-Specific Enhancements

📄 Reference: PRODUCTS_MODULE_DOC.md sections 9.1, 9.2, 9.3, 9.4

IMPLEMENT in order:

### Step 1 (9.1): REJECTED Quality Warnings
- Create lib/productQualityCheck.ts (pure function returns QualityIssue[])
- Create components/admin/products/QualityWarnings.tsx
- Create components/admin/products/FieldWarning.tsx
- Update ProductDetail.tsx to use these in REJECTED Action Card
- All 12 rules from section 9.1 table

### Step 2 (9.3): HIDDEN Audit Trail
- Run migrate_product_hide_audit.sql
- Update Product.java model: add hiddenAt/hiddenBy/hiddenReason/hiddenByRole fields
- Update AdminProductController hide endpoint: require reason in body
- Save audit info to DB + status_history table
- Create HideProductModal.tsx (clone RejectProductModal pattern)
- Update ProductDetail.tsx HIDDEN action card to show audit info
- Update Activity Timeline to show hide reason

### Step 3 (9.2): APPROVED Performance Dashboard
- Run product_view migration
- Backend: ProductStatsController + StatsRepository with raw queries
- Endpoint: GET /admin/products/{id}/stats?days=30
- Frontend: install recharts, create stats hook + components
- Update ProductDetail.tsx: add dashboard section for APPROVED only

### Step 4 (9.4 — Optional Phase 5): AI Fraud Detection
- Run product_fraud_check migration
- Backend: FraudDetectionService with 8 heuristic rules
- LLM integration with caching + rate limiting
- Frontend: AIFraudWarning component
- Update ProductDetail.tsx PENDING Action Card

CODE STANDARDS:
- Match existing patterns from ProductDetail.tsx
- Use React Query for data fetching
- Use Zod for validation
- Vietnamese UI text (with diacritics)
- Toast notifications for all actions
- Loading skeletons
- Error states
- ESC closes modals
- Keyboard shortcuts where applicable

TESTING:
- Unit tests for productQualityCheck.ts (all 12 rules)
- Integration tests for hide audit
- E2E test for performance dashboard

OUTPUT:
1. List of all files created/modified
2. SQL migrations
3. Sample API responses
4. Screenshots of each new section (mock/wireframe)
```

---

## 12. NOTES

- Phase 4 enhancements **không phá vỡ** existing functionality
- Mỗi feature có thể release independently (feature flag recommended)
- Backward compatible: products tạo trước Phase 4 vẫn hoạt động bình thường
- Performance: dùng React Query cache để giảm API calls
- A/B test: có thể release Phase 4 cho 50% admin trước
