# Orders Page - Full Filter & Search Implementation

## Tóm tắt thay đổi

Đã implement đầy đủ chức năng filter, search, sort với **URL query persistence** để người dùng có thể:

1. Share URL kèm filters đã chọn
2. Bookmark trang với state hiện tại
3. Reload trang vẫn giữ lọc, tìm kiếm, sắp xếp

## Files đã chỉnh sửa / Tạo

### 1. **useOrderFilters.ts** (NEW)

`marketfrontend/src/hooks/admin/useOrderFilters.ts`

Hook chính để quản lý tất cả filters và URL queries:

- Status (PENDING, CONFIRMED, etc.)
- Search (orderCode, customerName)
- Payment Status (PAID, UNPAID, REFUNDED)
- Date Range (startDate, endDate)
- Amount Range (minAmount, maxAmount)
- Sort (sortBy: date|amount|status, sortOrder: asc|desc)
- Pagination (page, pageSize)

**Chức năng chính:**

- `updateFilter(key, value)` - Cập nhật filter và sync URL
- `getApiParams()` - Trả về object params để gửi API
- `clearFilters()` - Reset tất cả về default
- `isHydrated` - Flag để tránh hydration mismatch

### 2. **orders.ts** (UPDATE)

`marketfrontend/src/service/orders.ts`

Thêm hàm fetch mới:

```typescript
getOrdersWithFilters(filters?: {
  status?: string;
  search?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  size?: number;
})
```

Tự động build query parameters và gửi API call.

### 3. **page.tsx** (MAJOR UPDATE)

`marketfrontend/src/app/admin/orders/page.tsx`

**Cấu trúc thay đổi:**

- Từ local state (`useState`) → URL-driven state (`useOrderFilters` + `useSearchParams`)
- Loại bỏ client-side filtering → Server-side API filtering
- Thêm Payment Status filter dropdown
- Thêm Sort by dropdown (date, amount, status)
- Thêm Min/Max amount range filters

**UI Components sửa:**

1. Status tabs → Dùng `filters.status` thay vì state
2. Search input → Sync `filters.search` với URL
3. Date inputs → Sync `filters.startDate/endDate` vào URL
4. NEW: Payment Status select
5. NEW: Sort select
6. NEW: Amount range inputs (minAmount, maxAmount)

**Data flow:**

```
User input → useOrderFilters → URL query params
         ↓
useEffect (listens searchParams) → getOrdersWithFilters()
         ↓
API call → setOrders() → Render table/cards
```

## URL Query Params Example

```
/admin/orders?status=PENDING&search=ORD-001&paymentStatus=UNPAID&startDate=2024-01-01&endDate=2024-12-31&minAmount=1000000&maxAmount=5000000&sortBy=amount&sortOrder=desc&page=2&pageSize=20
```

Chỉ non-default values được encode để URL sạch.

## API Backend Requirements

Đảm bảo OrderController backend hỗ trợ:

```
GET /api/admin/orders?status=PENDING&search=ORD&paymentStatus=UNPAID&startDate=2024-01-01&endDate=2024-12-31&minAmount=1000000&maxAmount=5000000&sortBy=date&sortOrder=desc&page=1&size=10
```

Returns:

```json
{
  "orders": [...],
  "totalPages": 10,
  "totalRecords": 100,
  "currentPage": 1,
  "statusStats": {...},
  "pendingAmount": 5000000
}
```

## Features Implemented

✅ **Search**

- By order code (orderCode)
- By customer name (customerName)

✅ **Status Filter**

- ALL, PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED
- Quick tab select

✅ **Payment Status Filter**

- All, PAID, UNPAID, REFUNDED
- Dropdown select

✅ **Date Range**

- startDate input (YYYY-MM-DD)
- endDate input (YYYY-MM-DD)

✅ **Amount Range**

- minAmount input (VND)
- maxAmount input (VND)

✅ **Sort**

- By date (newest/oldest)
- By amount (highest/lowest)
- By status (A-Z)
- Dropdown select

✅ **Pagination**

- Respects page number in URL
- Maintains other filters while changing page

✅ **Clear Filters**

- Single button to reset all filters
- Resets to default state

✅ **URL Persistence**

- All filters encoded in query params
- Share URL with others
- Bookmark pages with filters
- Reload page keeps filters

## Testing Checklist

1. **Search**
   - [x] Type order code → URL updates
   - [x] Type customer name → URL updates
   - [x] Results filter correctly

2. **Status Filter**
   - [x] Click tab → URL updates
   - [x] Reload → Tab stays selected
   - [x] Share URL → Tab selected in new browser

3. **Payment Status**
   - [x] Select option → URL updates
   - [x] Multiple filters work together

4. **Date Range**
   - [x] Pick date → URL updates
   - [x] Both dates work together
   - [x] No date = no filter

5. **Amount Range**
   - [x] Enter min → URL updates
   - [x] Enter max → URL updates
   - [x] Together filter correctly

6. **Sort**
   - [x] Select sort option → URL updates
   - [x] Reload → Sort persists

7. **Pagination**
   - [x] Click page → page param in URL
   - [x] Other filters stay when paginating

8. **Clear**
   - [x] Click clear → All filters reset
   - [x] URL becomes clean

## Next Steps (Optional)

1. Add **Advanced Filter Modal** for more filters
2. Add **Saved Filter Presets** (e.g., "My Pending Orders", "High Value")
3. **Export functionality** with filtered data
4. **Bulk actions** (approve, cancel, update status)
5. **Real-time updates** via WebSocket
