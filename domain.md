## Domain (Marketplace)

Tài liệu này mô tả domain-level concepts cho dự án Marketplace để thống nhất giữa FE/BE khi làm tính năng (đặc biệt là admin).

### Bounded contexts / Services hiện có

- **Marketplace Platform**: domain lõi (catalog/category/product, user, admin/seller, ...). Thư mục: `Marketplace-platform/`
- **API Gateway**: cổng vào (routing/auth/aggregation tùy implement). Thư mục: `api-gateway/`
- **Order Service**: đơn hàng. Thư mục: `order-service/`
- **Cart Service**: giỏ hàng. Thư mục: `cart-service/`
- **Logistic Service**: vận chuyển. Thư mục: `logistic-service/`
- **Market Frontend**: Next.js app (user/admin/seller). Thư mục: `marketfrontend/`

### Core entities (gợi ý)

> Lưu ý: entity thực tế có thể khác. Dùng danh sách này để “nói cùng một ngôn ngữ” khi thiết kế màn admin/API.

- **User**
  - `id`, `email/phone`, `passwordHash`, `role` (admin/seller/customer), `status`
- **Category**
  - `id`, `category_name`, `parent_id`, `level`, `is_active`, `category_icon`, `color`, `created_at`
- **Product**
  - `id`, `name`, `slug`, `price`, `stock`, `images`, `category_id`, `seller_id`, `status`, `created_at`
- **Seller / Shop**
  - `seller_id` (tham chiếu `User`)
  - `shop_id`, `shop_name`, `description`, `logo_url`, `banner_url`
  - `pickup_address` (địa chỉ lấy hàng)
  - `status`: `pending | approved | rejected | blocked`
- **ProductVariant** (nếu có biến thể)
  - `id`, `product_id`, `sku`, `price`, `stock`, `attributes` (vd: color/size), `status`
- **InventoryAdjustment** (nếu theo dõi nhập/xuất)
  - `id`, `variant_id` (hoặc `product_id`), `type` (`in|out|adjust`), `quantity`, `reason`, `created_at`
- **MediaAsset**
  - `id`, `owner_type` (`product|variant|shop`), `owner_id`, `url`, `type` (`image|video`), `sort_order`
- **Order**
  - `id`, `customer_id`, `items[]`, `total`, `status`, `shipping_address`, `created_at`
- **Cart**
  - `id`, `customer_id`, `items[]`
- **Shipment / Logistics**
  - `id`, `order_id`, `provider`, `fee`, `tracking_code`, `status`

### Common value objects / enums

- **Role**: `admin | seller | customer`
- **Status** (gợi ý): `active | inactive | draft | deleted`
- **ProductStatus** (gợi ý): `draft | pending_approval | active | inactive | rejected`
- **StockStatus** (gợi ý): `in_stock | low_stock | out_of_stock`
- **Pagination**: `page`, `pageSize`, `total`

### Seller - Product workflows (khuyến nghị)

#### Tạo/Sửa sản phẩm

- **Draft**: seller tạo sản phẩm nháp, có thể thiếu thông tin.
- **Submit**: gửi duyệt (nếu có flow approve).
- **Approved → Active**: sản phẩm hiển thị.
- **Rejected**: có reason; seller sửa và submit lại.

#### Quản lý biến thể

- Tạo attribute options (vd: Color/Size)
- Sinh ra variants (SKU) từ tổ hợp options
- Mỗi variant có tồn kho/giá riêng

#### Tồn kho

- Điều chỉnh tồn kho (nhập/xuất/điều chỉnh)
- Cảnh báo low stock theo ngưỡng

### Domain events (gợi ý)

- `ProductCreated`, `ProductUpdated`
- `ProductSubmittedForApproval`, `ProductApproved`, `ProductRejected`
- `VariantCreated`, `VariantUpdated`
- `InventoryAdjusted`
- `OrderPlaced`, `OrderCancelled`, `OrderPaid`
- `ShipmentCreated`, `ShipmentFeeCalculated`

