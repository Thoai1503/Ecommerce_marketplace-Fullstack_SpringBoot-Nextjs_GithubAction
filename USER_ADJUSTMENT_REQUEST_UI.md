# UI/UX Yêu Cầu Chỉnh Sửa Số Lượng - Order Detail Buyer

## Tổng Quan

Đã thêm UI component chuẩn UIUX để hiển thị **yêu cầu chỉnh sửa số lượng** (adjustment request) từ shop trong màn hình order detail của buyer. Khi có kiện hàng nào có yêu cầu chỉnh sửa, nó sẽ được hiển thị nổi bật giữa các thông tin shipment.

---

## Các Thay Đổi Đã Thực Hiện

### 1. **Types (marketfrontend/src/types/index.ts)**

Thêm types mới:

```typescript
export type AdjustmentStatus =
  | "PENDING_BUYER"
  | "ACCEPTED_BY_BUYER"
  | "REJECTED_BY_BUYER"
  | "CANCELLED_BY_SHOP"
  | "EXPIRED";

export interface AdjustmentItem {
  id: string;
  order_item_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name?: string;
  old_quantity: number;
  new_quantity: number;
  unit_price: number;
  old_total: number;
  new_total: number;
  diff_total: number;
}

export interface AdjustmentRequest {
  id: string;
  request_code: string;
  order_shipment_id: string;
  order_id: string;
  shop_id: string;
  status: AdjustmentStatus;
  shop_reason?: string;
  buyer_note?: string;
  total_original_amount: number;
  total_adjusted_amount: number;
  total_diff_amount: number;
  expires_at?: string;
  responded_at?: string;
  items: AdjustmentItem[];
  created_at: string;
  updated_at: string;
}
```

Cập nhật `Shipment` interface:
- `adjustment_request?: AdjustmentRequest` - Chứa dữ liệu yêu cầu chỉnh sửa
- `adjustment_required?: boolean` - Flag cho biết có yêu cầu
- `business_status?: string` - Status kinh doanh của kiện

### 2. **Page Component (marketfrontend/src/app/(user)/orders/[id]/page.tsx)**

#### Cập nhật Logic Fetch Data
- Thêm logic fetch adjustment request API: `/api/orders/shipments/{shipmentId}/adjustment-request`
- Mapping dữ liệu từ API response vào `AdjustmentRequest` type
- Xử lý khi không có adjustment request (graceful fallback)

#### Thêm UI Component Adjustment Request

**Vị Trí:** Hiển thị **trước danh sách sản phẩm** của mỗi kiện hàng trong phần "Vận chuyển"

**Design Details:**

**1. PENDING_BUYER Status (Chờ xử lý):**
- 🎨 **Màu sắc:** Vàng (Amber #fbbf24)
- **Background:** Màu vàng nhạt (rgba(245, 158, 11, 0.08))
- **Icon:** Info icon trong vòng tròn vàng
- **Tiêu đề:** "Yêu cầu chỉnh sửa số lượng"
- **Nội dung:** Hiển thị lý do từ shop
- **Thẻ thông tin:**
  - Mã yêu cầu
  - Chênh lệch giá
  - Thời gian hết hạn (nếu có)

**Chi tiết chỉnh sửa:**
- Liệt kê các item bị chỉnh sửa
- Hiển thị: Sản phẩm, Số lượng cũ → Số lượng mới, Đơn giá, Chênh lệch tiền

**Action Buttons:**
- **✓ Chấp nhận** (Nền xanh #22c55e)
- **✕ Từ chối** (Nền trắng, border đỏ #fca5a5)

**2. ACCEPTED_BY_BUYER Status (Đã chấp nhận):**
- 🎨 **Màu sắc:** Xanh (Green #22c55e)
- **Icon:** Check mark
- **Tiêu đề:** "Yêu cầu đã được chấp nhận"
- **Không có action buttons** (read-only)

**3. REJECTED_BY_BUYER Status (Đã từ chối):**
- 🎨 **Màu sắc:** Đỏ (Red #ef4444)
- **Icon:** X mark
- **Tiêu đề:** "Yêu cầu đã bị từ chối"
- **Không có action buttons** (read-only)

**4. CANCELLED_BY_SHOP / EXPIRED Status:**
- 🎨 **Màu sắc:** Xám (Gray #9ca3af)
- **Tiêu đề:** "Yêu cầu chỉnh sửa hủy"
- **Không có action buttons** (read-only)

---

## Responsive Design

- **Desktop:** Hiển thị đầy đủ với layout grid
- **Tablet/Mobile:** Responsive, các buttons stack dọc khi cần

---

## API Integration

### Required Endpoint

**GET** `/api/orders/shipments/{shipmentId}/adjustment-request`

**Response Body:**
```json
{
  "id": "bigint",
  "request_code": "string",
  "order_shipment_id": "bigint",
  "order_id": "bigint",
  "shop_id": "bigint",
  "status": "PENDING_BUYER|ACCEPTED_BY_BUYER|REJECTED_BY_BUYER|CANCELLED_BY_SHOP|EXPIRED",
  "shop_reason": "string?",
  "buyer_note": "string?",
  "total_original_amount": "decimal",
  "total_adjusted_amount": "decimal",
  "total_diff_amount": "decimal",
  "expires_at": "timestamp?",
  "responded_at": "timestamp?",
  "items": [
    {
      "id": "bigint",
      "order_item_id": "bigint",
      "product_id": "bigint",
      "variant_id": "bigint",
      "product_name": "string",
      "variant_name": "string?",
      "old_quantity": "int",
      "new_quantity": "int",
      "unit_price": "decimal",
      "old_total": "decimal",
      "new_total": "decimal",
      "diff_total": "decimal"
    }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## Hành Động Buyer Cần Triển Khai

### 1. Accept Button Handler
- Gửi **POST** `/api/orders/{orderId}/shipments/{shipmentId}/adjustment-request/{requestId}/accept`
- Cập nhật status: `PENDING_BUYER` → `ACCEPTED_BY_BUYER`
- Sau khi accept, backend sẽ:
  - Cập nhật `order_item.final_quantity` 
  - Tạo `shipment_adjustment_financial` record
  - Đánh dấu `order_item.is_adjusted = 1`

### 2. Reject Button Handler
- Gửi **POST** `/api/orders/{orderId}/shipments/{shipmentId}/adjustment-request/{requestId}/reject`
- Cập nhật status: `PENDING_BUYER` → `REJECTED_BY_BUYER`
- Optional: Buyer có thể gửi note phản hồi

---

## UX Flow

```
1. Buyer mở Order Detail
   ↓
2. Page fetch adjustment request data (nếu shipment.adjustment_required = true)
   ↓
3. Nếu có adjustment request PENDING_BUYER:
   - Hiển thị alert box vàng nổi bật
   - Buyer có thể xem chi tiết
   - Chọn: Chấp nhận hoặc Từ chối
   ↓
4. Nếu buyer chọn Chấp nhận:
   - Gửi API
   - Reload dữ liệu
   - Hiển thị thành công (alert xanh)
   ↓
5. Nếu buyer chọn Từ chối:
   - Dialog xác nhận
   - Có thể thêm note lý do
   - Hiển thị status đỏ (rejected)
```

---

## Testing Checklist

- [ ] Load order detail có adjustment request PENDING_BUYER
- [ ] Hiển thị UI alert với đúng màu sắc và icon
- [ ] Hiển thị chi tiết adjustment items
- [ ] Accept button: gửi API + reload thành công
- [ ] Reject button: gửi API + reload thành công
- [ ] ACCEPTED status: hiển thị xanh, không có action buttons
- [ ] REJECTED status: hiển thị đỏ, không có action buttons
- [ ] EXPIRED status: hiển thị xám, không có action buttons
- [ ] Mobile responsive: buttons stack dọc
- [ ] Error handling: nếu API fail, hiển thị error message

---

## Notes

- Hiện tại buttons (Accept/Reject) chỉ có UI, cần implement handlers
- Cần thêm loading state khi gửi API
- Cần thêm error toast/snackbar khi fail
- Có thể thêm animation khi acceptance/rejection
