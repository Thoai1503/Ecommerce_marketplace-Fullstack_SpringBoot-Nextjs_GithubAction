# Implementation Guide: Frontend Order Mapping

## Tổng Quan

Tài liệu này hướng dẫn cách sử dụng các function mapping mới và cách lên kế hoạch thêm các trường dữ liệu còn thiếu.

---

## 1. Current State (Giai Đoạn Hiện Tại)

### Trang `/admin/orders`

- ✅ **Đã hoạt động:** Hiển thị danh sách đơn hàng với phân trang
- ✅ **Đã hoạt động:** Filter, search, sort
- ✅ **Đã hoạt động:** Status conversion (API → Frontend)
- ❌ **Chưa hoàn thành:** Tên khách hàng, Email, SĐT
- ❌ **Chưa hoàn thành:** Địa chỉ giao hàng
- ❌ **Chưa hoàn thành:** Số lượng sản phẩm
- ❌ **Chưa hoàn thành:** Mã giao dịch

### Current Mapping (Basic)

```typescript
const mapOrder = (o: any): Order => {
  // Returns basic order with placeholders for missing fields
  return {
    id: o.orderId?.toString(),
    orderCode: o.orderNumber,
    customerName: "Customer", // ❌ PLACEHOLDER
    customerEmail: "", // ❌ PLACEHOLDER
    customerPhone: "", // ❌ PLACEHOLDER
    shippingAddress: "", // ❌ PLACEHOLDER
    totalAmount: o.finalAmount,
    subtotalAmount: o.totalAmount,
    discountAmount: o.discountAmount,
    shippingAmount: o.shippingFee,
    taxAmount: 0, // ❌ PLACEHOLDER
    itemsCount: 0, // ❌ PLACEHOLDER
    paymentStatus: normalizePaymentStatus(o.paymentStatus),
    paymentMethod: o.paymentMethod,
    transactionId: "", // ❌ PLACEHOLDER
    deliveryNumber: o.trackingNumber,
    status: normalizeOrderStatus(o.orderStatus),
    priority: determinePriority(o.finalAmount, o.orderStatus),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: [], // ❌ PLACEHOLDER
    internalNote: o.note,
  };
};
```

---

## 2. Available Functions

### Basic Mapping (Sử dụng hiện tại)

```typescript
// File: /src/service/orders.ts

// 1. Get orders at home page
export const getOrders = async () => {
  const res = await http2("/admin/orders");
  return {
    ...res,
    orders: (res.orders || []).map(mapOrder),
  };
};
```

### Enhanced Mapping (Mới)

```typescript
// 2. Get orders with enriched data
export const getOrdersEnhanced = async (enrichData: boolean = false) => {
  const res = await http2("/admin/orders");

  if (enrichData) {
    // Fetches user, address, items for each order (slower but complete)
    const enhancedOrders = await Promise.all(
      (res.orders || []).map((order: any) => mapOrderEnhanced(order, true)),
    );
    return { ...res, orders: enhancedOrders };
  }

  // Fast path: basic mapping (current behavior)
  return { ...res, orders: (res.orders || []).map(mapOrder) };
};

// 3. Enhance a single order
export const mapOrderEnhanced = async (
  o: any,
  fetchRelated: boolean = false,
): Promise<Order> => {
  const baseOrder = mapOrder(o);

  if (fetchRelated) {
    const [userInfo, address, items] = await Promise.all([
      o.userId ? fetchUserInfo(o.userId) : Promise.resolve({}),
      o.addressId ? fetchAddressInfo(o.addressId) : Promise.resolve(""),
      o.orderId ? fetchOrderItems(o.orderId) : Promise.resolve([]),
    ]);

    return { ...baseOrder, userInfo, address, items };
  }

  return baseOrder;
};
```

### Helper Functions

```typescript
// Fetch user info (name, email, phone)
export const fetchUserInfo = async (userId: number) => {
  const res = await http2(`/admin/users/${userId}`);
  return {
    customerName: res.name || "Unknown",
    customerEmail: res.email || "",
    customerPhone: res.phone || "",
  };
};

// Fetch address from address service
export const fetchAddressInfo = async (addressId: number) => {
  const res = await http2(`/admin/addresses/${addressId}`);
  return constructFullAddress(res);
};

// Fetch order items
export const fetchOrderItems = async (
  orderId: number,
): Promise<OrderItem[]> => {
  const res = await http2(`/admin/orders/${orderId}/items`);
  return res.items || [];
};
```

### Status Conversion Functions

```typescript
// Convert payment status: PENDING → UNPAID
export const normalizePaymentStatus = (apiStatus: string): PaymentStatus => {
  const map = {
    PENDING: "UNPAID",
    PAID: "PAID",
    REFUNDED: "REFUNDED",
  };
  return map[apiStatus] || "UNPAID";
};

// Normalize order status to uppercase
export const normalizeOrderStatus = (apiStatus: string): OrderStatus => {
  // Returns: PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED
};

// Determine priority based on amount and status
export const determinePriority = (amount: number, status: string) => {
  return amount > 5000000 && status === "PENDING" ? "HIGH" : "NORMAL";
};
```

---

## 3. Implementation Roadmap

### Phase 1: Cơ sở (Current)

- ✅ Basic mapping từ API response
- ✅ Status conversion (API → Frontend format)
- ✅ Priority determination
- ✅ Placeholder values cho missing fields

**Sử dụng:**

```typescript
const orders = await getOrders(); // Returns basic order list
```

### Phase 2A: Add User Information

**Mục đích:** Hiển thị tên, email, SĐT khách hàng

**Khi nào:** Khi cần hiển thị danh sách đầy đủ thông tin khách hàng

**Cách thực hiện:**

Option 1: Backend Enhancement (Recommended)

```java
// OrderRepository.java - Modify query to JOIN with users
SELECT o.*, u.name, u.email, u.phone
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
```

Option 2: Frontend Enhancement (Current)

```typescript
// Use getOrdersEnhanced(true) - fetches user data for each order
const { orders } = await getOrdersEnhanced(true);
```

### Phase 2B: Add Address Information

**Mục đích:** Hiển thị địa chỉ giao hàng đầy đủ

**Khi nào:** Khi cần xem chi tiết địa chỉ giao hàng

**Cách thực hiện:**

Option 1: Backend Enhancement (Recommended)

```java
// OrderRepository.java - Modify query to JOIN with addresses
SELECT o.*, a.detail_address, a.ward, a.district, a.city
FROM orders o
LEFT JOIN addresses a ON o.address_id = a.id
```

Option 2: Frontend Enhancement

```typescript
const orders = await getOrdersEnhanced(true); // Fetches address for each order
```

### Phase 2C: Add Order Items

**Mục đích:** Hiển thị số lượng sản phẩm và danh sách items

**Khi nào:** Khi cần xem items trong đơn hàng

**Cách thực hiện:**

Option 1: Backend Enhancement (Recommended)

```java
// Create endpoint: GET /admin/orders/{orderId}/with-items
// Returns order + items + itemCount
```

Option 2: Frontend Enhancement

```typescript
const orders = await getOrdersEnhanced(true); // Lazy loads items
```

### Phase 3: Thông tin Thanh toán (Payment)

**Mục đích:** Hiển thị transaction ID, payment details

**Khi nào:** Khi tích hợp payment service

**Cách thực hiện:**

```java
// Modify OrderRepository to JOIN with payments table
SELECT o.*, p.transaction_id, p.details
FROM orders o
LEFT JOIN payments p ON o.id = p.order_id
```

---

## 4. Quick Start: Sử dụng Hôm Nay

### For Current Orders Page

**File:** `src/app/admin/orders/page.tsx`

**Current Code:**

```typescript
import { useOrders } from "@/hooks/admin/useOrders";

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();
  // orders = basic mapped orders (with placeholders)
}
```

**No changes needed** - Current setup works fine with placeholder values.

---

## 5. Next Steps: Khi Phát triển

### To Add User Information

**Step 1: Update Hook** (`src/hooks/admin/useOrders.ts`)

```typescript
import { getOrdersEnhanced } from "@/service/orders";

export const useOrders = (enrichData = false) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "orders", enrichData],
    queryFn: () =>
      enrichData ? getOrdersEnhanced(true) : getOrdersEnhanced(false),
  });

  return { orders: data?.orders || [], isLoading, isError, refetch };
};
```

**Step 2: Use in Component**

```typescript
// To enable enriched data
const { orders } = useOrders(true); // Will fetch user info
```

### To Add Address Information

**Step 1:** Similar to above, just enable `enrichData` flag

**Step 2:** Backend should return address in order response

### To Add Order Items

**Step 1:** Ensure order items endpoint exists

```
GET /admin/orders/{orderId}/items
```

**Step 2:** Use `mapOrderEnhanced(order, true)` to auto-fetch items

---

## 6. Best Practices

### Performance Optimization

```typescript
// ❌ DON'T: Fetch all data for every order
const orders = await getOrdersEnhanced(true); // Slow! N+3 API calls

// ✅ DO: Use backend to return enriched data in one request
// OR
// ✅ DO: Lazy load data when needed (e.g., on detail page)
const order = await getOrderById(id); // Then fetch details separately
```

### Caching Strategy

```typescript
// React Query automatically caches by queryKey
useQuery({
  queryKey: ["admin", "orders", enrichData],
  queryFn: () => getOrdersEnhanced(enrichData),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Error Handling

```typescript
// Helper functions have built-in fallbacks
export const fetchUserInfo = async (userId: number) => {
  try {
    const res = await http2(`/admin/users/${userId}`);
    return {
      customerName: res.name || "Unknown Customer",
      customerEmail: res.email || "",
      customerPhone: res.phone || "",
    };
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    return {
      customerName: "Unknown Customer", // Fallback
      customerEmail: "",
      customerPhone: "",
    };
  }
};
```

---

## 7. Testing

### Unit Tests for Mappers

```typescript
// File: tests/service/orders.test.ts

describe("Order Mapping", () => {
  describe("normalizePaymentStatus", () => {
    it("should convert PENDING to UNPAID", () => {
      expect(normalizePaymentStatus("PENDING")).toBe("UNPAID");
    });

    it("should preserve PAID", () => {
      expect(normalizePaymentStatus("PAID")).toBe("PAID");
    });
  });

  describe("normalizeOrderStatus", () => {
    it("should ignore case", () => {
      expect(normalizeOrderStatus("pending")).toBe("PENDING");
      expect(normalizeOrderStatus("PENDING")).toBe("PENDING");
    });
  });

  describe("mapOrder", () => {
    it("should map basic order fields", () => {
      const apiOrder = {
        orderId: 123,
        orderNumber: "ORD-001",
        totalAmount: 100000,
        finalAmount: 109000,
        shippingFee: 9000,
        discountAmount: 0,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        createdAt: "2024-01-01T10:00:00",
        updatedAt: "2024-01-01T10:00:00",
      };

      const result = mapOrder(apiOrder);

      expect(result.id).toBe("123");
      expect(result.orderCode).toBe("ORD-001");
      expect(result.subtotalAmount).toBe(100000);
      expect(result.totalAmount).toBe(109000);
      expect(result.paymentStatus).toBe("UNPAID");
      expect(result.status).toBe("PENDING");
    });
  });
});
```

---

## 8. Summary

| Purpose                | Current        | Enhanced                 | Recommended         |
| ---------------------- | -------------- | ------------------------ | ------------------- |
| **List orders**        | ✅ Yes (basic) | ✅ Yes (with enrichment) | Current (basic)     |
| **Show customer name** | ❌ Placeholder | ✅ Fetched               | Backend JOIN        |
| **Show address**       | ❌ Empty       | ✅ Fetched               | Backend JOIN        |
| **Show items count**   | ❌ 0           | ✅ Fetched               | Backend JOIN        |
| **Show payment ID**    | ❌ Empty       | ⚠️ Needs implementation  | Backend integration |

---

## 9. API Endpoints Required

### Existing (Used)

- ✅ `GET /admin/orders` - Get order list
- ✅ `PUT /admin/orders/{id}/status` - Update status
- ✅ `PUT /admin/orders/{id}/tracking` - Update tracking

### To Be Implemented (Phase 2+)

- ⏳ `GET /admin/users/{userId}` - Get user details
- ⏳ `GET /admin/addresses/{addressId}` - Get address
- ⏳ `GET /admin/orders/{orderId}/items` - Get order items
- ⏳ `GET /admin/payments/{orderId}` or similar - Get payment details

### To Be Enhanced

- 🔄 `GET /admin/orders` - Consider returning with user/address info using query param
  - Example: `GET /admin/orders?include=user,address,items`
