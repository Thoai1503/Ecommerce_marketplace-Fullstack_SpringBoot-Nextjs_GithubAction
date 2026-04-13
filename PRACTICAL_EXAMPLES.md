# Practical Examples: Using Order Mapping Functions

## Example 1: Current List Page (Hiển thị Danh Sách)

### Scenario

Hiển thị danh sách đơn hàng trên trang admin/orders với thông tin cơ bản.

### Cách thực hiện

**File: `src/app/admin/orders/page.tsx`**

```typescript
'use client';

import { useOrders } from '@/hooks/admin/useOrders';

export default function OrdersPage() {
  const { orders, isLoading, isError } = useOrders();

  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage />;

  return (
    <div>
      <OrdersTable orders={orders} />
    </div>
  );
}
```

**File: `src/components/OrdersTable.tsx`**

```typescript
interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Order Code</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>
              <Link href={`/admin/orders/${order.id}`}>
                {order.orderCode}
              </Link>
            </td>
            <td>
              {/* Currently shows "Customer" placeholder */}
              {order.customerName}
            </td>
            <td>
              {formatCurrency(order.totalAmount)}
            </td>
            <td>
              <StatusBadge status={order.status} />
            </td>
            <td>
              <PaymentBadge status={order.paymentStatus} />
            </td>
            <td>
              {formatDate(order.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Output:**

```
Order Code    | Customer     | Amount      | Status    | Payment | Date
ORD001        | Customer     | 109,000 VND | Pending   | Unpaid  | 2026-03-30
ORD002        | Customer     | 109,000 VND | Pending   | Unpaid  | 2026-03-30
```

---

## Example 2: Detail Page with Enriched Data

### Scenario

Hiển thị chi tiết đơn hàng với tất cả thông tin (tên khách, địa chỉ, sản phẩm).

### Cách thực hiện (Option A: Frontend-side)

**File: `src/app/admin/orders/[id]/page.tsx`**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/service/orders';
import { mapOrderEnhanced } from '@/service/orders';

interface OrderDetailPageProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { data: apiOrder, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => getOrderById(params.id),
  });

  // Enhance order data (fetch user, address, items)
  const { data: enhancedOrder } = useQuery({
    queryKey: ['order', params.id, 'enhanced'],
    queryFn: async () => {
      if (!apiOrder) return null;
      return mapOrderEnhanced(apiOrder, true); // true = fetch related data
    },
    enabled: !!apiOrder,
  });

  const order = enhancedOrder || apiOrder;

  if (isLoading || !order) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <OrderHeader order={order} />

      {/* Customer Info */}
      <CustomerInfoCard
        name={order.customerName}
        email={order.customerEmail}
        phone={order.customerPhone}
      />

      {/* Shipping Address */}
      <ShippingAddressCard address={order.shippingAddress} />

      {/* Items List */}
      {order.items && order.items.length > 0 && (
        <ItemsListCard items={order.items} />
      )}

      {/* Financial Summary */}
      <FinancialSummary
        subtotal={order.subtotalAmount}
        discount={order.discountAmount}
        shipping={order.shippingAmount}
        tax={order.taxAmount}
        total={order.totalAmount}
      />

      {/* Status & Payment Info */}
      <StatusPaymentCard
        status={order.status}
        paymentStatus={order.paymentStatus}
        paymentMethod={order.paymentMethod}
      />
    </div>
  );
}
```

**Output:**

```
Order: ORD001
─────────────────────────────────────

Customer Information
Name: Nguyen Van A
Email: nguyenvana@email.com
Phone: 0901234567

Shipping Address
123 Duong ABC, Quan 1, TP.HCM

Items (2)
1. iPhone 15 Pro Max - 25,000,000 VND x 1
2. Sony Headphones - 8,500,000 VND x 1

Financial Summary
Subtotal: 33,500,000 VND
Discount: 50,000 VND
Shipping: 30,000 VND
Tax: 0 VND
───────────────────────
Total: 33,480,000 VND

Status: PENDING
Payment: UNPAID (e-wallet)
```

### Cách thực hiện (Option B: Backend Enhancement)

**Background: Modify Backend to return enriched data**

File: `Marketplace-platform/src/main/java/docker_test/com/models/Order.java`

```java
public class Order {
    // ... existing fields ...

    @Transient
    private User user; // Add user info

    @Transient
    private Address address; // Add address info

    @Transient
    private List<OrderItem> items; // Add items

    @Transient
    private Payment payment; // Add payment info

    // Getters & Setters
}
```

File: `Marketplace-platform/src/main/java/docker_test/com/repository/OrderRepository.java`

```java
public List<Order> findAllWithDetails() {
    StringBuilder sql = new StringBuilder("""
        SELECT o.*, u.name, u.email, u.phone,
               a.detail_address, a.ward, a.district, a.city
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON o.address_id = a.id
    """);

    // Execute query and populate nested objects
    // ...
}
```

Then the API response will include all data in one call:

```json
{
  "orders": [
    {
      "orderId": 315,
      "orderNumber": "ORD001",
      "totalAmount": 33500000,
      "finalAmount": 33480000,
      "user": {
        "id": 1,
        "name": "Nguyen Van A",
        "email": "nguyenvana@email.com",
        "phone": "0901234567"
      },
      "address": {
        "id": 1,
        "detailAddress": "123 Duong ABC",
        "ward": "Ward 1",
        "district": "Quan 1",
        "city": "TP.HCM"
      },
      "items": [
        {
          "id": 1,
          "productName": "iPhone 15 Pro Max",
          "quantity": 1,
          "price": 25000000
        }
      ]
    }
  ]
}
```

---

## Example 3: Bulk Update with Enhanced Validation

### Scenario

Cập nhật trạng thái hàng loạt + validation dựa vào dữ liệu enriched.

### Cách thực hiện

**File: `src/app/admin/orders/bulk-actions.ts`**

```typescript
import {
  getOrders,
  updateOrderStatus,
  mapOrderEnhanced,
} from "@/service/orders";
import { OrderStatus } from "@/types";

interface BulkUpdateRequest {
  orderIds: string[];
  status: OrderStatus;
  enrichedValidation?: boolean;
}

/**
 * Validate orders before bulk update
 * With enrichedValidation=true, fetches customer data for notification
 */
export async function validateBulkUpdate(req: BulkUpdateRequest) {
  const { orders } = await getOrders();

  const selectedOrders = orders.filter((o) => req.orderIds.includes(o.id));

  // Validation rules
  const validationIssues: {
    orderId: string;
    reason: string;
  }[] = [];

  for (const order of selectedOrders) {
    // Rule 1: Cannot cancel COMPLETED orders
    if (req.status === "CANCELED" && order.status === "COMPLETED") {
      validationIssues.push({
        orderId: order.id,
        reason: "Cannot cancel completed orders",
      });
    }

    // Rule 2: Cannot ship UNPAID orders (example business rule)
    if (req.status === "SHIPPED" && order.paymentStatus === "UNPAID") {
      validationIssues.push({
        orderId: order.id,
        reason: "Cannot ship unpaid orders",
      });
    }

    // Rule 3: Pending orders with high amount need special approval
    if (req.status === "CONFIRMED" && order.priority === "HIGH") {
      // Could fetch enhanced data for owner contact
      if (req.enrichedValidation) {
        const enriched = await mapOrderEnhanced(order, true);
        console.log(
          `Confirming high-value order from: ${enriched.customerName}`,
        );
      }
    }
  }

  return {
    canProceed: validationIssues.length === 0,
    issues: validationIssues,
    affectedCount: selectedOrders.length,
  };
}

/**
 * Perform bulk update with notification
 */
export async function performBulkUpdate(req: BulkUpdateRequest) {
  const validation = await validateBulkUpdate(req);

  if (!validation.canProceed) {
    throw new Error(`Validation failed: ${validation.issues[0].reason}`);
  }

  // Update all orders in parallel
  const updatePromises = req.orderIds.map((id) =>
    updateOrderStatus(id, req.status),
  );

  await Promise.all(updatePromises);

  return {
    success: true,
    updated: req.orderIds.length,
    status: req.status,
  };
}
```

**Usage in Component:**

```typescript
const handleBulkApprove = async () => {
  try {
    // Validate first
    const validation = await validateBulkUpdate({
      orderIds: selectedOrderIds,
      status: "CONFIRMED",
      enrichedValidation: true,
    });

    if (!validation.canProceed) {
      toast.error(`Cannot proceed: ${validation.issues[0].reason}`);
      return;
    }

    // Perform update
    const result = await performBulkUpdate({
      orderIds: selectedOrderIds,
      status: "CONFIRMED",
    });

    toast.success(`Updated ${result.updated} orders`);
    refetch();
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## Example 4: Search with Status Mapping

### Scenario

Tìm kiếm đơn hàng với filter theo status (API status vs Frontend status).

### Cách thực hiện

**File: `src/lib/order-search.ts`**

```typescript
import { normalizeOrderStatus, normalizePaymentStatus } from "@/service/orders";
import { Order, OrderStatus, PaymentStatus } from "@/types";

interface SearchFilters {
  query?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  priority?: "NORMAL" | "HIGH";
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Search orders with filter conversion
 * Converts Frontend filters to API format before searching
 */
export function searchOrders(orders: Order[], filters: SearchFilters) {
  return orders.filter((order) => {
    // Search by order code or customer name
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const matchCode = order.orderCode.toLowerCase().includes(query);
      const matchCustomer = order.customerName.toLowerCase().includes(query);

      if (!matchCode && !matchCustomer) return false;
    }

    // Filter by order status
    if (filters.status && order.status !== filters.status) {
      return false;
    }

    // Filter by payment status
    if (
      filters.paymentStatus &&
      order.paymentStatus !== filters.paymentStatus
    ) {
      return false;
    }

    // Filter by priority
    if (filters.priority && order.priority !== filters.priority) {
      return false;
    }

    // Filter by amount range
    if (filters.minAmount && order.totalAmount < filters.minAmount) {
      return false;
    }

    if (filters.maxAmount && order.totalAmount > filters.maxAmount) {
      return false;
    }

    return true;
  });
}

/**
 * Get filter options with stats
 */
export function getFilterStats(orders: Order[]) {
  const stats = {
    byStatus: {} as Record<OrderStatus, number>,
    byPaymentStatus: {} as Record<PaymentStatus, number>,
    byPriority: { NORMAL: 0, HIGH: 0 },
    amountRange: {
      min: Math.min(...orders.map((o) => o.totalAmount)),
      max: Math.max(...orders.map((o) => o.totalAmount)),
    },
  };

  orders.forEach((order) => {
    stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
    stats.byPaymentStatus[order.paymentStatus] =
      (stats.byPaymentStatus[order.paymentStatus] || 0) + 1;
    stats.byPriority[order.priority]++;
  });

  return stats;
}
```

**Usage in Component:**

```typescript
const [filters, setFilters] = useState<SearchFilters>({});
const { orders } = useOrders();

const filteredOrders = useMemo(
  () => searchOrders(orders, filters),
  [orders, filters]
);

const stats = useMemo(
  () => getFilterStats(orders),
  [orders]
);

return (
  <>
    {/* Filters UI */}
    <SearchInput
      placeholder="Search by order code or customer name"
      onChange={query => setFilters(prev => ({ ...prev, query }))}
    />

    <StatusFilter
      selected={filters.status}
      stats={stats.byStatus}
      onChange={status => setFilters(prev => ({ ...prev, status }))}
    />

    <PaymentStatusFilter
      selected={filters.paymentStatus}
      stats={stats.byPaymentStatus}
      onChange={paymentStatus =>
        setFilters(prev => ({ ...prev, paymentStatus }))
      }
    />

    <AmountRangeFilter
      range={{ min: filters.minAmount, max: filters.maxAmount }}
      limits={stats.amountRange}
      onChange={(min, max) =>
        setFilters(prev => ({ ...prev, minAmount: min, maxAmount: max }))
      }
    />

    {/* Results */}
    <OrdersTable orders={filteredOrders} />
  </>
);
```

---

## Example 5: Export with Formatted Data

### Scenario

Export danh sách đơn hàng ra CSV/Excel với dữ liệu đã format.

### Cách thực hiện

**File: `src/lib/order-export.ts`**

```typescript
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";

interface ExportOptions {
  includeItems?: boolean;
  enrichedData?: boolean;
}

/**
 * Format orders for CSV export
 */
export function formatOrdersForCSV(
  orders: Order[],
  options: ExportOptions = {},
) {
  const headers = [
    "Order Code",
    "Order Date",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Shipping Address",
    "Items Count",
    "Subtotal",
    "Discount",
    "Shipping",
    "Tax",
    "Total",
    "Status",
    "Payment Status",
    "Payment Method",
    "Tracking Number",
  ];

  const rows = orders.map((order) => [
    order.orderCode,
    formatDate(order.createdAt, "dd/MM/yyyy HH:mm"),
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    order.shippingAddress,
    order.itemsCount,
    formatCurrency(order.subtotalAmount),
    formatCurrency(order.discountAmount),
    formatCurrency(order.shippingAmount),
    formatCurrency(order.taxAmount),
    formatCurrency(order.totalAmount),
    order.status,
    order.paymentStatus,
    order.paymentMethod,
    order.deliveryNumber,
  ]);

  return { headers, rows };
}

/**
 * Generate CSV content
 */
export function generateCSV(orders: Order[], options: ExportOptions = {}) {
  const { headers, rows } = formatOrdersForCSV(orders, options);

  const csvContent = [
    // Headers
    headers.map((h) => `"${h}"`).join(","),
    // Rows
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadOrdersAsCSV(
  orders: Order[],
  filename: string = "orders.csv",
) {
  const csv = generateCSV(orders);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

**Usage in Component:**

```typescript
const handleExport = () => {
  const { orders } = useOrders();

  const filename = `orders-${formatDate(new Date(), 'ddMMyyyy')}.csv`;
  downloadOrdersAsCSV(orders, filename);

  toast.success('Orders exported successfully');
};

return (
  <button onClick={handleExport} className="btn btn-primary">
    Export to CSV
  </button>
);
```

---

## Summary

| Use Case      | Example   | Status Mapping | Data Enrichment |
| ------------- | --------- | -------------- | --------------- |
| List orders   | Example 1 | ✅             | Basic           |
| Show details  | Example 2 | ✅             | Enhanced        |
| Bulk update   | Example 3 | ✅             | Conditional     |
| Search/filter | Example 4 | ✅             | None            |
| Export        | Example 5 | ✅             | Formatted       |
