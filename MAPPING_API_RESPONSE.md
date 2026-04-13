# Mapping: API Response → Frontend Admin/Orders

## Overview
Tài liệu này mô tả cách mapping dữ liệu từ API response `/api/admin/orders` sang Frontend Order Interface.

---

## API Response Structure (from Backend)

```typescript
interface OrderPageResponse {
  orders: Order[];           // Mảng các đơn hàng
  totalRecords: number;      // Tổng số đơn hàng
  totalPages: number;        // Tổng số trang
  currentPage: number;       // Trang hiện tại
  statusStats: {             // Thống kê theo trạng thái
    [status: string]: number;
  };
  pendingAmount: number;     // Tổng giá trị đơn đang chờ
}

// Each Order object from API contains:
interface ApiOrder {
  orderId: number;
  orderNumber: string;       // Mã đơn hàng (e.g., "ORDB4927654")
  userId: number;
  addressId: number;
  totalAmount: number;       // Tổng tiền sản phẩm
  shippingFee: number;       // Phí vận chuyển
  discountAmount: number;    // Tiền giảm giá
  finalAmount: number;       // Tổng tiền thanh toán (totalAmount - discount + shipping)
  
  paymentMethod: string;     // e-wallet, vnpay, etc.
  paymentStatus: string;     // PENDING, PAID, REFUNDED
  orderStatus: string;       // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELED, etc.
  
  note: string | null;       // Ghi chú
  voucherId: number | null;  // ID voucher
  trackingNumber: string | null;  // Mã vận đơn
  shopId: number | null;     // ID cửa hàng
  
  createdAt: string;         // ISO datetime
  updatedAt: string;         // ISO datetime
  deliveredAt: string | null;    // Ngày giao hàng
  cancelledAt: string | null;    // Ngày hủy
  cancelledReason: string | null; // Lý do hủy
}
```

---

## Frontend Order Interface (Target)

```typescript
interface Order {
  id: string;                    // Order ID
  orderCode: string;             // Order number/code
  
  customerName: string;          // Tên khách hàng
  customerEmail: string;         // Email khách hàng
  customerPhone: string;         // SĐT khách hàng
  
  shippingAddress: string;       // Địa chỉ giao hàng
  
  totalAmount: number;           // Tổng tiền thanh toán
  subtotalAmount: number;        // Tiền sản phẩm
  discountAmount: number;        // Tiền giảm giá
  shippingAmount: number;        // Phí vận chuyển
  taxAmount: number;             // Thuế (nếu có)
  itemsCount: number;            // Số lượng sản phẩm
  
  paymentStatus: PaymentStatus;  // PAID | UNPAID | REFUNDED
  paymentMethod: string;         // Phương thức thanh toán
  transactionId: string;         // Mã giao dịch
  
  deliveryNumber: string;        // Mã vận đơn
  status: OrderStatus;           // PENDING | CONFIRMED | PROCESSING | SHIPPED | COMPLETED | CANCELED | REFUNDED
  priority: "NORMAL" | "HIGH";   // Mức độ ưu tiên
  
  createdAt: string;
  updatedAt: string;
  
  items?: OrderItem[];           // Danh sách sản phẩm trong đơn
  internalNote?: string;         // Ghi chú nội bộ
  trackingNumber?: string;       // Mã vận đơn
}
```

---

## Mapping Rules

### Trường cơ bản
| API Field | Frontend Field | Transformation |
|-----------|----------------|-----------------|
| `orderId` | `id` | `String(orderId)` |
| `orderNumber` | `orderCode` | Direct mapping |
| `totalAmount` | `subtotalAmount` | Direct mapping |
| `discountAmount` | `discountAmount` | Direct mapping |
| `shippingFee` | `shippingAmount` | Direct mapping |
| `finalAmount` | `totalAmount` | Direct mapping |
| `paymentMethod` | `paymentMethod` | Direct mapping |
| `paymentStatus` | `paymentStatus` | Uppercase: `PENDING` → `UNPAID` ⚠️ |
| `orderStatus` | `status` | Uppercase conversion |
| `trackingNumber` | `deliveryNumber` & `trackingNumber` | Direct mapping |
| `note` | `internalNote` | Direct mapping (null-safe) |
| `createdAt` | `createdAt` | Direct mapping |
| `updatedAt` | `updatedAt` | Direct mapping |

### Trường cần xử lý đặc biệt

#### 1. **customerName, customerEmail, customerPhone** ⚠️
- **Nguồn:** User service (fetch từ `userId`)
- **Hiện tại:** Hardcoded "Customer"
- **Giải pháp:** Cần gọi API user service để lấy thông tin khách hàng

#### 2. **shippingAddress** ⚠️
- **Nguồn:** Address service (fetch từ `addressId`)
- **Hiện tại:** Empty string
- **Giải pháp:** Cần gọi API address service để lấy địa chỉ giao hàng

#### 3. **itemsCount** ⚠️
- **Nguồn:** Order items service (fetch từ `orderId`)
- **Hiện tại:** Hardcoded 0
- **Giải pháp:** Fetch từ order items endpoint và đếm số lượng

#### 4. **taxAmount**
- **Nguồn:** Calculate or fetch từ order service
- **Hiện tại:** Hardcoded 0
- **Giải pháp:** Calculate hoặc fetch từ backend

#### 5. **transactionId**
- **Nguồn:** Payment service
- **Hiện tại:** Empty string
- **Giải pháp:** Fetch từ payment info khi có

#### 6. **priority**
- **Nguồn:** Order service hoặc business logic
- **Hiện tại:** Hardcoded "NORMAL"
- **Giải pháp:** Determine từ order metadata hoặc payment status

### Status Mapping

**Payment Status Mapping:**
```
API paymentStatus → Frontend paymentStatus
PENDING            → UNPAID
PAID               → PAID
REFUNDED           → REFUNDED
```

**Order Status Mapping:**
```
API orderStatus → Frontend status (normalize to uppercase)
PENDING         → PENDING
CONFIRMED       → CONFIRMED
PROCESSING      → PROCESSING
SHIPPED         → SHIPPED
DELIVERED       → COMPLETED
CANCELED        → CANCELED (hoặc CANCELED → CANCELED)
```

---

## Current Implementation Issues

### 1. **Incomplete Mapping in mapOrder()**
```typescript
const mapOrder = (o: any): Order => {
  return {
    id: (o.orderId || o.id)?.toString(),
    orderCode: o.orderNumber || "",
    customerName: "Customer",           // ❌ Should fetch from user service
    customerEmail: "",                  // ❌ Should fetch from user service
    customerPhone: "",                  // ❌ Should fetch from user service
    shippingAddress: "",                // ❌ Should fetch from address service
    totalAmount: o.finalAmount || 0,
    subtotalAmount: o.totalAmount || 0,
    discountAmount: o.discountAmount || 0,
    shippingAmount: o.shippingFee || 0,
    taxAmount: 0,                       // ❌ Should calculate or fetch
    itemsCount: 0,                      // ❌ Should fetch from items service
    paymentStatus: (o.paymentStatus || "pending").toUpperCase(),  // ❌ May need conversion
    paymentMethod: o.paymentMethod || "",
    transactionId: "",                  // ❌ Should fetch from payment service
    deliveryNumber: o.trackingNumber || "",
    status: (o.orderStatus || "pending").toUpperCase(),
    priority: "NORMAL",                 // ❌ Should determine based on order
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: [],
  };
};
```

### 2. **Missing Related Data Fetching**
- User information chưa được fetch
- Address information chưa được fetch
- Order items chưa được fetch
- Payment transaction info chưa được fetch

### 3. **Status Conversion**
- `PENDING` (payment) → `UNPAID` (frontend) chưa được xử lý
- Order status mapping có thể cần normalization

---

## Recommended Solutions

### Option 1: Enhanced Mapping (Frontend-side)
- Enhance `mapOrder()` để handle thêm transformations
- Gọi multiple API calls để fetch related data
- Cache dữ liệu để tối ưu performance

### Option 2: Rich API Response (Backend-side)
- Modify backend API để trả về full order details
- Include user info, address, items, payment trong response
- Trả về kết quả đã được format sẵn cho frontend

### Option 3: Hybrid Approach
- Backend trả về cơ bản order fields
- Frontend fetch related data nếu cần (lazy loading)
- Use React Query để manage caching

---

## Example API Response (Current)

```json
{
  "orders": [
    {
      "note": null,
      "addressId": 1,
      "cancelledAt": null,
      "cancelledReason": null,
      "createdAt": "2026-03-30T00:19:31",
      "deliveredAt": null,
      "discountAmount": 0.0,
      "finalAmount": 29000.0,
      "orderId": 315,
      "orderNumber": "ORDB4927654",
      "orderStatus": "PENDING",
      "paymentMethod": "e-wallet",
      "paymentStatus": "PENDING",
      "shippingFee": 9000.0,
      "shopId": null,
      "totalAmount": 20000.0,
      "trackingNumber": null,
      "updatedAt": "2026-03-30T00:19:31",
      "userId": 1,
      "voucherId": null
    }
  ],
  "totalRecords": 51,
  "totalPages": 6,
  "currentPage": 1,
  "statusStats": {
    "PENDING": 51
  },
  "pendingAmount": 2.847315E8
}
```

---

## Implementation Checklist

- [ ] Enhance `mapOrder()` function
- [ ] Add user data fetching
- [ ] Add address data fetching
- [ ] Add order items fetching
- [ ] Handle status conversions
- [ ] Add tax calculation logic
- [ ] Handle payment transaction mapping
- [ ] Optimize API calls (batch requests or caching)
- [ ] Add error handling for related data fetching
- [ ] Add unit tests for mapping functions
- [ ] Update TypeScript types if needed

---

## Files to Modify

1. **Frontend:**
   - `/src/service/orders.ts` - Enhanced mapping & data fetching
   - `/src/types/index.ts` - Add/ensure types are complete
   - `/src/hooks/admin/useOrders.ts` - Hook enhancements if needed

2. **Backend (Optional):**
   - `OrderController.java` - Enhance response with related data
   - `OrderService.java` - Join with User & Address data
   - `OrderRepository.java` - Add queries for related data

---

## Status Conversion Reference

### Payment Status
```
API          Frontend
PENDING  →   UNPAID
PAID     →   PAID
REFUNDED →   REFUNDED
```

### Order Status (Normalize uppercase)
```
API          Frontend
PENDING      → PENDING
CONFIRMED    → CONFIRMED
PROCESSING   → PROCESSING
SHIPPED      → SHIPPED
DELIVERED    → COMPLETED
CANCELED     → CANCELED
REFUNDED     → REFUNDED
```
