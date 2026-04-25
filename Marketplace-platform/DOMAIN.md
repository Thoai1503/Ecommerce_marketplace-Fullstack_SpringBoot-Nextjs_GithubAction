# Domain Knowledge — Nhà bán hàng & Sản phẩm (Admin)

> Tài liệu này mô tả business logic, luồng dữ liệu, và các quy tắc nghiệp vụ
> cho 2 tính năng admin: **Quản lý Nhà bán hàng** và **Quản lý Sản phẩm**.

---

## PHẦN 1 — QUẢN LÝ NHÀ BÁN HÀNG (Sellers)

### 1.1 Tính năng & Chức năng

#### Trang danh sách sellers (`/admin/sellers`)
| Chức năng | Mô tả |
|-----------|-------|
| **Xem danh sách** | Hiển thị tất cả sellers, hỗ trợ 2 chế độ: Grid (8/trang) và Table (10/trang) |
| **Tìm kiếm** | Tìm theo tên shop, email, địa chỉ (debounce 500ms) |
| **Lọc theo trạng thái** | Tab: Tất cả / Hoạt động / Chờ duyệt / Đã khóa |
| **Thống kê tổng quan** | Tổng sellers, đang chờ duyệt, đang hoạt động, đã khóa, tổng doanh thu |
| **Duyệt seller PENDING** | Nút "Duyệt" xuất hiện khi seller đang ở trạng thái PENDING |
| **Khóa / Mở khóa** | Admin khóa seller vi phạm hoặc mở khóa seller bị khóa nhầm |
| **Xóa seller** | Soft delete (chuyển BLOCKED), có xác nhận trước khi xóa |
| **Xóa hàng loạt** | Chọn nhiều sellers qua checkbox rồi xóa cùng lúc |
| **Thêm seller mới** | Mở form tạo mới |

#### Trang chi tiết seller (`/admin/sellers/{id}`)
| Chức năng | Mô tả |
|-----------|-------|
| **Xem thông tin đầy đủ** | Tên shop, logo, category, website, địa chỉ, email, phone, ngày tham gia |
| **Xem chỉ số kinh doanh** | Tổng sản phẩm, tổng đơn hàng, tổng doanh thu (thực từ DB) |
| **Xem đánh giá** | Rating trung bình, số lượng review |
| **Xem sản phẩm gần đây** | 5 sản phẩm mới nhất của shop, click vào chuyển trang detail |
| **Duyệt / Từ chối** | Nút approve/reject hiện ra nếu status = PENDING |
| **Khóa / Mở khóa** | Nút block/unblock tùy trạng thái hiện tại |
| **Chỉnh sửa** | Nút Edit chuyển sang trang chỉnh sửa |

#### Trang tạo / chỉnh sửa seller (`/admin/sellers/create`, `/admin/sellers/{id}/edit`)
| Chức năng | Mô tả |
|-----------|-------|
| **Thông tin cửa hàng** | Tên shop, category, website, logo upload |
| **Thông tin liên hệ** | Tên chủ, email, phone (format VN), địa chỉ kho |
| **Thiết lập mật khẩu** | Chỉ khi tạo mới: gửi email invite hoặc nhập thủ công |
| **Chọn trạng thái** | PENDING / ACTIVE / BLOCKED với mô tả từng trạng thái |
| **Validation** | Zod schema: email format, phone VN (0[3578]xxxxxxxx), URL |
| **Kiểm tra email trùng** | Gọi API kiểm tra trước khi submit |
| **Dirty check** | Cảnh báo khi rời form chưa lưu (isDirty + beforeunload) |

---

### 1.2 Khái niệm

Nhà bán hàng (seller) là tổ chức/cá nhân đăng ký bán hàng trên sàn.
Mỗi seller gồm 2 thực thể liên kết:

```
user (table)          shop (table)
──────────────        ──────────────────────────────
id                    id
email          ←──    user_id  (FK → user.id)
phone                 shop_name        (= brandTitle)
full_name             shop_description (= location, tạm thời)
is_active             shop_logo        (= logoUrl)
                      category
                      website
                      status           (PENDING|ACTIVE|REJECTED|BLOCKED)
                      rejection_reason
                      rating
                      total_products
                      total_orders
                      is_verified
                      is_active
```

> **Lý do dùng table `shop` thay vì `seller`:**
> Table `shop` có FK ràng buộc với `user`, có `enum status` chặt chẽ,
> có `is_deleted` cho soft delete. Table `seller` là bản cũ không có FK.
> Phần đăng nhập seller cũng sẽ dùng chung table `shop`.

---

### 1.3 Vòng đời trạng thái (Status Lifecycle)

```
              Seller đăng ký
                    │
                    ▼
               [PENDING]  ← Chờ admin duyệt
              /          \
    Admin duyệt          Admin từ chối (kèm lý do)
           │                      │
           ▼                      ▼
       [ACTIVE]              [REJECTED]
      Đang hoạt động         Bị từ chối
           │
    Admin khóa (vi phạm)
           │
           ▼
       [BLOCKED]  ──→ Admin mở khóa ──→ [ACTIVE]
      Bị tạm khóa
```

**Quy tắc:**
- `PENDING` → `ACTIVE`: Admin duyệt, xóa `rejection_reason`
- `PENDING` → `REJECTED`: Admin từ chối, **bắt buộc nhập lý do** (`rejection_reason`)
- `ACTIVE` → `BLOCKED`: Admin khóa (vi phạm chính sách)
- `BLOCKED` → `ACTIVE`: Admin mở khóa
- Khi shop bị `BLOCKED` hoặc `REJECTED`: `user.is_active = 0` (seller không đăng nhập được)
- Khi shop `ACTIVE` hoặc `PENDING`: `user.is_active = 1`

---

### 1.4 Các chỉ số thống kê (Stats)

| Field | Nguồn dữ liệu | Ghi chú |
|-------|--------------|---------|
| `totalProducts` | `shop.total_products` | Đếm số sản phẩm của shop |
| `totalOrders` | `shop.total_orders` | Tổng đơn hàng |
| `totalRevenue` | `SUM(order_item.total_price)` WHERE `shop_id` AND `order_status = 'DELIVERED'` | Chỉ tính đơn đã giao thành công |
| `rating` | `shop.rating` | Trung bình rating từ các review |
| `reviewCount` | `COUNT(product_review)` JOIN qua `product.shop_id` | Tổng review của tất cả sản phẩm |

---

### 1.5 API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| `GET` | `/admin/sellers` | Danh sách tất cả sellers (kèm stats) |
| `GET` | `/admin/sellers/{id}` | Chi tiết 1 seller |
| `POST` | `/admin/sellers` | Tạo seller mới (tạo cả user + shop) |
| `PUT` | `/admin/sellers/{id}` | Cập nhật thông tin seller |
| `PATCH` | `/admin/sellers/{id}/approve` | Duyệt PENDING → ACTIVE |
| `PATCH` | `/admin/sellers/{id}/reject` | Từ chối PENDING → REJECTED (body: `reason`) |
| `PATCH` | `/admin/sellers/{id}/status` | Đổi status tùy ý (body: `status`) |
| `DELETE` | `/admin/sellers/{id}` | Soft delete → BLOCKED |

---

### 1.6 Frontend ↔ Backend mapping

| Frontend `Seller` field | DB column | Ghi chú |
|------------------------|-----------|---------|
| `id` | `shop.id` | |
| `accountCode` | generate: `"SE-" + String.format("%04d", id)` | VD: SE-0001 |
| `brandTitle` | `shop.shop_name` | |
| `category` | `shop.category` | |
| `website` | `shop.website` | nullable |
| `location` | `shop.shop_description` | Tạm dùng, chưa có cột riêng |
| `email` | `user.email` | Join user |
| `phone` | `user.phone` | Join user |
| `ownerName` | `user.full_name` | Join user |
| `logoUrl` | `shop.shop_logo` | Fallback: ui-avatars.com |
| `status` | `shop.status` | PENDING/ACTIVE/REJECTED/BLOCKED |
| `createdAt` | `shop.created_at` | ISO format |
| `totalProducts` | `shop.total_products` | |
| `totalOrders` | `shop.total_orders` | |
| `totalRevenue` | Query từ `order_item` | Chỉ đơn DELIVERED |
| `rating` | `shop.rating` | |
| `reviewCount` | Query từ `product_review` | |

---

## PHẦN 2 — QUẢN LÝ SẢN PHẨM (Products)

### 2.1 Tính năng & Chức năng

#### Trang danh sách sản phẩm (`/admin/products`)
| Chức năng | Mô tả |
|-----------|-------|
| **Xem danh sách** | Bảng dữ liệu (TanStack Table): tên, SKU, ảnh, giá, tồn kho, trạng thái |
| **Tìm kiếm** | Tìm theo tên sản phẩm hoặc SKU |
| **Lọc theo trạng thái** | Dropdown: Tất cả / Chờ duyệt / Đang bán / Từ chối / Nháp / Đang ẩn |
| **Duyệt sản phẩm PENDING** | Nút ✓ xanh — chuyển PENDING → APPROVED |
| **Từ chối sản phẩm PENDING** | Nút ✗ đỏ — mở modal nhập lý do, chuyển PENDING → REJECTED |
| **Ẩn / Hiện sản phẩm** | Nút toggle power — ẩn sản phẩm đang bán hoặc hiện lại |
| **Nhân bản sản phẩm** | Tạo bản sao với status DRAFT |
| **Xóa sản phẩm** | Soft delete (HIDDEN), có xác nhận |
| **Xóa hàng loạt** | Checkbox nhiều sản phẩm → xóa cùng lúc |
| **Chỉnh sửa** | Mở trang edit sản phẩm |

#### Trang chi tiết sản phẩm (`/admin/products/{id}`)
| Chức năng | Mô tả |
|-----------|-------|
| **Xem thông tin đầy đủ** | Tên, mô tả, SKU, giá, giá gốc, tồn kho, danh mục, thuộc tính |
| **Xem ảnh sản phẩm** | Gallery ảnh: ảnh chính lớn + thumbnail, có lightbox fullscreen |
| **Card duyệt** | Hiện nếu status = PENDING: 2 nút Duyệt và Từ chối |
| **Xem lý do từ chối** | Hiện nếu status = REJECTED: hiện `rejection_reason` |
| **Xem thông tin seller** | Tên shop, avatar, link "Xem trang shop" |
| **Xem lượt xem** | view_count, created_at |
| **Chỉnh sửa / Xóa** | Nút ở header |

#### Trang tạo / chỉnh sửa sản phẩm (`/admin/products/create`, `/admin/products/{id}/edit`)
| Chức năng | Mô tả |
|-----------|-------|
| **Thông tin chung** | Tên sản phẩm, SKU (auto uppercase), danh mục, mô tả |
| **AI Magic Writer** | Tự động tạo mô tả dựa trên tên + danh mục + thuộc tính |
| **Quản lý ảnh** | Upload nhiều ảnh, xóa từng ảnh, bắt buộc ít nhất 1 ảnh |
| **Thuộc tính động** | Thêm/xóa cặp key-value tùy ý (màu sắc, chất liệu, ...) |
| **Giá & Tồn kho** | Giá gốc (optional), giá bán (bắt buộc ≥ 1.000đ), tồn kho, tự tính % giảm giá |
| **Chọn trạng thái** | PENDING / APPROVED / DRAFT / HIDDEN |
| **Validation** | React Hook Form + Zod: tên ≥ 3 ký tự, giá > 0, tồn kho ≥ 0 |

---

### 2.2 Khái niệm

Sản phẩm do seller tạo, admin có quyền duyệt trước khi hiển thị ra sàn.
Sản phẩm thuộc về shop qua `product.shop_id`.

**Table liên quan:**
```
product            product_image       product_variant
──────────         ─────────────       ───────────────
id                 id                  id
shop_id            product_id (FK)     product_id (FK)
category_id        image_url           variant_name
product_name       display_order       sku
product_slug       is_thumbnail        price
description                            stock_quantity
price                                  image_url
original_price                         is_active
stock_quantity
is_active   ← dùng để lưu status
rating
review_count
created_at
```

---

### 2.3 Vòng đời trạng thái sản phẩm

Trạng thái lưu trong cột `is_active` (kiểu int):

```
Seller tạo sản phẩm
        │
        ▼
   [PENDING] (is_active = 2)  ← Chờ admin duyệt
   /            \
Admin duyệt    Admin từ chối (kèm lý do)
      │                │
      ▼                ▼
 [APPROVED]       [REJECTED]
(is_active = 1)  (is_active = 3)
 Đang bán         Bị từ chối (seller có thể sửa rồi submit lại)

Admin/Seller có thể ẩn tạm:
 [APPROVED] ←──→ [HIDDEN] (is_active = 0)
```

**Bảng mã:**
| Giá trị `is_active` | Tên status | Ý nghĩa |
|---------------------|-----------|---------|
| `2` | `PENDING` | Chờ admin duyệt |
| `1` | `APPROVED` | Đang bán, hiển thị trên sàn |
| `3` | `REJECTED` | Admin từ chối |
| `0` | `HIDDEN` | Tạm ẩn (không hiển thị) |

---

### 2.4 Quy tắc nghiệp vụ sản phẩm

- Admin chỉ được **duyệt hoặc từ chối** sản phẩm có status `PENDING`
- Sản phẩm `APPROVED` mới được hiển thị ra trang mua hàng
- Sản phẩm của shop `BLOCKED` tự động không hiển thị (vì user bị inactive)
- Khi từ chối phải nhập lý do để seller biết cần sửa gì
- `totalRevenue` của seller chỉ tính từ đơn hàng có `order_status = 'DELIVERED'`
- `reviewCount` chỉ tính review của các sản phẩm thuộc shop đó

---

### 2.5 API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| `GET` | `/admin/products` | Danh sách tất cả sản phẩm |
| `GET` | `/admin/products/{id}` | Chi tiết 1 sản phẩm |
| `PATCH` | `/admin/products/{id}/approve` | Duyệt → APPROVED |
| `PATCH` | `/admin/products/{id}/reject` | Từ chối → REJECTED (body: `reason`) |
| `PATCH` | `/admin/products/{id}/status` | Đổi status tùy ý (body: `status`) |
| `PUT` | `/admin/products/{id}` | Cập nhật thông tin |
| `DELETE` | `/admin/products/{id}` | Soft delete → HIDDEN |

---

### 2.6 Frontend ↔ Backend mapping

| Frontend `Product` field | DB column | Ghi chú |
|--------------------------|-----------|---------|
| `id` | `product.id` | |
| `name` | `product.product_name` | |
| `sku` | `product.product_slug` | |
| `description` | `product.description` | |
| `price` | `product.price` | |
| `originalPrice` | `product.original_price` | |
| `stock` | `product.stock_quantity` | |
| `status` | `product.is_active` | Xem bảng mã trên |
| `sellerId` | `product.shop_id` | |
| `sellerName` | `shop.shop_name` | Join shop |
| `imageUrl` | `product_image.image_url` | is_thumbnail = 1 hoặc ảnh đầu tiên |
| `rating` | `product.rating` | |
| `reviewCount` | `product.review_count` | |
| `soldCount` | `product.sold_count` | |
| `createdAt` | `product.created_at` | |

---

## PHẦN 3 — CÁC LƯU Ý QUAN TRỌNG

### Vấn đề chưa có cột `location`
`shop` table chưa có cột `location` riêng. Hiện tại dùng `shop_description` tạm thời.
Nếu muốn tách biệt: cần thêm cột `location VARCHAR(500)` vào table `shop`.

### `totalRevenue` phụ thuộc vào `order_status = 'DELIVERED'`
Trong DB hiện tại tất cả orders đều ở `PENDING` nên `totalRevenue = 0`.
Khi flow order hoàn chỉnh (có đơn DELIVERED) thì số liệu mới có giá trị.

### Không dùng table `seller`
Table `seller` trong DB là bản cũ/mock data, **không được dùng** trong code mới.
Tất cả logic seller đều qua table `shop` + `user`.

### `ProductRepository.Update()` chưa implement
Các endpoint approve/reject/delete của product hiện trả về null vì `Update()` chưa có SQL.
Cần implement trước khi test các tính năng này.
