# 1. 📊 Dashboard Management - Layout Chi Tiết

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Dashboard với 4 widgets chính (Stats Cards)
- Biểu đồ doanh thu đơn giản (SVG hoặc Chart.js)
- Top sản phẩm bán chạy (top 4)
- Đơn hàng gần đây (10 đơn hàng)
- Lọc theo thời gian (Hôm nay, 7 ngày, Tháng này)
- Dữ liệu hardcode hoặc mock data

### Phase 2 (Nâng Cấp - Làm Sau)
- Tích hợp API backend đầy đủ
- So sánh với kỳ trước
- Báo cáo chi tiết theo từng chỉ số
- Xuất báo cáo Excel/PDF
- Real-time updates với WebSocket
- Widgets bổ sung (danh mục, seller, conversion rate)
- Customizable dashboard layout

---

## 🎨 LAYOUT CHI TIẾT - DASHBOARD

### 📊 1. Dashboard Page (`/admin`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 Dashboard                                                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Cập nhật lúc: 10:30, 24/05/2024    [Hôm nay] [7 ngày] [Tháng này] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  💳         │  │  🛒         │  │  👤         │  │  ✓          │   │
│  │  Tổng doanh │  │  Tổng đơn   │  │  Khách hàng │  │  Sản phẩm    │   │
│  │  thu        │  │  hàng        │  │  mới        │  │  hoạt động   │   │
│  │              │  │              │  │              │  │              │   │
│  │  150.000.000 │  │  1,240       │  │  350         │  │  420         │   │
│  │  ₫           │  │              │  │              │  │              │   │
│  │  [+12%]      │  │  [+5%]       │  │  [+8%]       │  │  [-2%]       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────┐ │
│  │  📈 Biểu đồ Doanh thu        [Xem...] │  │  🏆 Top Sản phẩm bán chạy │ │
│  │  So sánh với tuần trước                │  │                          │ │
│  │                                        │  │  ┌──────────────────────┐ │ │
│  │  ┌──────────────────────────────────┐ │  │  │ [IMG] Tai nghe      │ │ │
│  │  │                                  │ │  │  │        Wireless Pro  │ │ │
│  │  │     [SVG Chart - Line Chart]    │ │  │  │        Đã bán: 1204  │ │ │
│  │  │                                  │ │  │  │        ₫850k         │ │ │
│  │  └──────────────────────────────────┘ │  │  └──────────────────────┘ │ │
│  │                                        │  │  ┌──────────────────────┐ │ │
│  │  Thứ 2  Thứ 3  Thứ 4  Thứ 5  Thứ 6... │  │  │ [IMG] Đồng hồ S4    │ │ │
│  │                                        │  │  │        Đã bán: 890   │ │ │
│  └──────────────────────────────────────┘  │  │  │        ₫1.2tr        │ │ │
│                                             │  │  └──────────────────────┘ │ │
│                                             │  │  ...                     │ │
│                                             │  │  [Xem tất cả]           │ │
│                                             │  └──────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📦 Đơn hàng gần đây              [🔽 Lọc] [⬇️ Xuất báo cáo]      │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐ │
│  │  │ Mã đơn   │ Khách    │ Ngày đặt │ Tổng tiền │ Trạng    │ Hành động│ │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤ │
│  │  │ORD-00123 │ Trần Văn │24/05/2024│2.500.000₫│[✅Hoàn]  │ [Chi tiết]│ │
│  │  │          │ B        │          │          │ thành    │          │ │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤ │
│  │  │ORD-00122 │ Lê Thị C │24/05/2024│850.000₫  │[⚠️Đang]  │ [Chi tiết]│ │
│  │  │          │          │          │          │ giao     │          │ │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤ │
│  │  │ORD-00121 │ Phạm Văn │23/05/2024│1.200.000₫│[🔵Mới]   │ [Chi tiết]│ │
│  │  │          │ D        │          │          │          │          │ │
│  │  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘ │
│  │                                                                       │   │
│  │  [Xem tất cả đơn hàng]                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Cập nhật lúc: 10:30, 24/05/2024                      │ │
│  │  [Hôm nay] [7 ngày qua] [Tháng này]                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Stats Cards (4 cards):**
1. **Tổng doanh thu** (Revenue)
   - Icon: 💳 (trong container màu primary)
   - Value: "150.000.000 ₫" (format VND)
   - Change: "+12%" (badge màu success)
   - Color: Primary (xanh dương)

2. **Tổng đơn hàng** (Total Orders)
   - Icon: 🛒 (trong container màu warning)
   - Value: "1,240" (format số với comma)
   - Change: "+5%" (badge màu success)
   - Color: Warning (vàng)

3. **Khách hàng mới** (New Customers)
   - Icon: 👤 (trong container màu info)
   - Value: "350" (số lượng)
   - Change: "+8%" (badge màu success)
   - Color: Info (xanh nhạt)

4. **Sản phẩm hoạt động** (Active Products)
   - Icon: ✓ (trong container màu success/danger)
   - Value: "420" (số lượng)
   - Change: "-2%" (badge màu danger)
   - Color: Success (xanh lá) hoặc Danger (đỏ nếu giảm)

**Biểu đồ Doanh thu:**
- Vị trí: Cột trái (col-lg-8)
- Tiêu đề: "Biểu đồ Doanh thu"
- Subtitle: "So sánh với tuần trước"
- Chart: SVG Line chart với gradient fill
- Labels: Thứ 2 - CN
- Nút: "Xem chi tiết" (chưa có chức năng)

**Top Sản phẩm bán chạy:**
- Vị trí: Cột phải (col-lg-4)
- Hiển thị: Top 4 sản phẩm
- Thông tin: Image (48x48), Tên, Đã bán, Giá
- Nút: "Xem tất cả" (chưa có chức năng)

**Đơn hàng gần đây:**
- Full width table
- Cột: Mã đơn, Khách hàng, Ngày đặt, Tổng tiền, Trạng thái, Hành động
- Actions: Nút "Lọc", "Xuất báo cáo", Link "Xem tất cả"

---

## 📝 Chi Tiết Components

### 1.1. Stats Cards Component
**Vị trí**: Phần đầu trang, hiển thị 4 thẻ thống kê chính

**Các chỉ số hiển thị:**
- ✅ **Tổng doanh thu** (Revenue)
  - Hiển thị: Giá trị tổng doanh thu với định dạng tiền tệ VND (VD: "150.000.000 ₫")
  - Thay đổi: Phần trăm thay đổi so với kỳ trước (VD: "+12%")
  - Icon: 💳
  - Màu: Primary (xanh dương)
  - Badge màu: Xanh lá (success) nếu tăng, đỏ (danger) nếu giảm
  
- ✅ **Tổng đơn hàng** (Total Orders)
  - Hiển thị: Số lượng đơn hàng tổng cộng (VD: "1,240")
  - Thay đổi: Phần trăm thay đổi so với kỳ trước (VD: "+5%")
  - Icon: 🛒
  - Màu: Warning (vàng)
  
- ✅ **Khách hàng mới** (New Customers)
  - Hiển thị: Số lượng khách hàng mới trong kỳ (VD: "350")
  - Thay đổi: Phần trăm thay đổi so với kỳ trước (VD: "+8%")
  - Icon: 👤
  - Màu: Info (xanh nhạt)
  
- ✅ **Sản phẩm hoạt động** (Active Products)
  - Hiển thị: Số lượng sản phẩm đang hoạt động (VD: "420")
  - Thay đổi: Phần trăm thay đổi so với kỳ trước (VD: "-2%")
  - Icon: ✓
  - Màu: Success (xanh lá) / Danger (đỏ nếu giảm)

**UI/UX:**
- Layout: Grid 4 cột responsive (1 cột mobile, 2 cột tablet, 4 cột desktop)
- Card design: Border-0, shadow-sm, rounded corners, h-100
- Icon container: Background màu nhạt với opacity-10, padding p-2, rounded
- Badge: Hiển thị phần trăm thay đổi với màu tương ứng (xanh = tăng, đỏ = giảm)
- Typography: Title nhỏ màu muted, Value lớn font-bold

#### 1.2. Bộ lọc thời gian (Date Filter)
**Vị trí**: Phía trên stats cards, căn phải

**Tính năng:**
- ✅ Hiển thị thời gian cập nhật cuối cùng (VD: "Cập nhật lúc: 10:30, 24/05/2024")
- ✅ 3 nút lọc: "Hôm nay", "7 ngày qua", "Tháng này"
- ✅ Nút được chọn có style khác (btn-primary)
- ✅ Các nút chưa chọn có style outline (btn-outline-secondary)

**UI/UX:**
- Button group với kích thước nhỏ (btn-group-sm)
- Responsive và dễ sử dụng
- Layout: d-flex justify-content-between align-items-center

#### 1.3. Biểu đồ doanh thu (Revenue Chart)
**Vị trí**: Cột trái, chiếm 8/12 cột (col-lg-8)

**Tính năng:**
- ✅ Biểu đồ đường (Line chart) hiển thị doanh thu theo thời gian
- ✅ Gradient fill dưới đường biểu đồ (linearGradient từ opacity 0.3 → 0)
- ✅ Hiển thị các điểm dữ liệu trên đường biểu đồ (circle với border trắng)
- ✅ Label trục X: Các ngày trong tuần (Thứ 2 - CN)
- ✅ Tiêu đề: "Biểu đồ Doanh thu"
- ✅ Subtitle: "So sánh với tuần trước"
- ✅ Nút "Xem chi tiết" (chưa có chức năng)

**UI/UX:**
- Sử dụng SVG để vẽ biểu đồ
- Chiều cao cố định: 250px
- Responsive với viewBox="0 0 500 200"
- Card design với shadow và border-0
- Path với stroke màu primary (#2b8cee), strokeWidth="3"

**Dữ liệu hiện tại:**
- ⚠️ Dữ liệu hardcode (chưa tích hợp API)
- ⚠️ Biểu đồ tĩnh (chưa có animation/interaction)
- ⚠️ Dữ liệu mẫu: Đường cong với 3 điểm chính

#### 1.4. Top sản phẩm bán chạy (Top Products Widget)
**Vị trí**: Cột phải, chiếm 4/12 cột (col-lg-4)

**Tính năng:**
- ✅ Hiển thị danh sách top 4 sản phẩm bán chạy nhất
- ✅ Thông tin hiển thị:
  - Tên sản phẩm (text-truncate)
  - Số lượng đã bán (VD: "Đã bán: 1204")
  - Giá sản phẩm (VD: "₫850k")
- ✅ Placeholder cho hình ảnh sản phẩm (48x48px, bg-light rounded)
- ✅ Nút "Xem tất cả" (chưa có chức năng)

**UI/UX:**
- Card design với shadow, h-100
- Layout flex với gap-3
- Text truncate cho tên sản phẩm dài
- Responsive design
- Footer với button "Xem tất cả" full width

**Dữ liệu hiện tại:**
- ⚠️ Dữ liệu hardcode (chưa tích hợp API)
- ⚠️ Chỉ hiển thị 4 sản phẩm mẫu

#### 1.5. Đơn hàng gần đây (Recent Orders Table)
**Vị trí**: Phần dưới cùng, full width

**Tính năng:**
- ✅ Bảng hiển thị đơn hàng gần đây
- ✅ Các cột hiển thị:
  - Mã đơn hàng (VD: "#ORD-00123")
  - Khách hàng (với avatar placeholder 32x32px, rounded-circle)
  - Ngày đặt hàng (VD: "24/05/2024")
  - Tổng tiền (VD: "2.500.000 ₫")
  - Trạng thái (với badge màu tương ứng)
  - Hành động (nút "Chi tiết")
- ✅ Badge trạng thái với màu:
  - Success (xanh lá): Hoàn thành
  - Warning (vàng): Đang giao
  - Primary (xanh dương): Mới
  - Danger (đỏ): Đã hủy
- ✅ Nút "Lọc" (chưa có chức năng)
- ✅ Nút "Xuất báo cáo" (chưa có chức năng)
- ✅ Link "Xem tất cả đơn hàng" (chưa có chức năng)

**UI/UX:**
- Table responsive với table-hover effect
- Header với background table-light
- Badge với opacity và border (bg-{color}-subtle text-{color})
- Footer với link "Xem tất cả" căn giữa
- Action buttons: btn-link btn-sm text-primary

**Dữ liệu hiện tại:**
- ⚠️ Dữ liệu hardcode (chưa tích hợp API)
- ⚠️ Chỉ hiển thị 4 đơn hàng mẫu

### Thiếu sót và cần bổ sung

#### 2.1. Tích hợp API Backend
- ❌ **API lấy thống kê tổng quan**
  - Endpoint: `GET /api/admin/dashboard/stats?period={today|week|month}`
  - Response: 
    ```json
    {
      "revenue": 150000000,
      "orders": 1240,
      "customers": 350,
      "products": 420,
      "changes": {
        "revenue": 12,
        "orders": 5,
        "customers": 8,
        "products": -2
      }
    }
    ```
  
- ❌ **API lấy dữ liệu biểu đồ doanh thu**
  - Endpoint: `GET /api/admin/dashboard/revenue-chart?period={today|week|month}`
  - Response: 
    ```json
    [
      { "date": "2024-05-20", "revenue": 5000000 },
      { "date": "2024-05-21", "revenue": 7500000 },
      ...
    ]
    ```
  
- ❌ **API lấy top sản phẩm bán chạy**
  - Endpoint: `GET /api/admin/dashboard/top-products?limit=4&period={today|week|month}`
  - Response: 
    ```json
    [
      {
        "id": 1,
        "name": "Tai nghe Wireless Pro",
        "image": "/images/product1.jpg",
        "sold": 1204,
        "price": 850000
      },
      ...
    ]
    ```
  
- ❌ **API lấy đơn hàng gần đây**
  - Endpoint: `GET /api/admin/dashboard/recent-orders?limit=10`
  - Response: 
    ```json
    [
      {
        "id": 123,
        "orderCode": "ORD-00123",
        "customer": "Trần Văn B",
        "customerAvatar": "/images/avatar.jpg",
        "date": "2024-05-24",
        "total": 2500000,
        "status": "completed"
      },
      ...
    ]
    ```

#### 2.2. Tính năng bổ sung
- ❌ **Xuất báo cáo Excel/PDF**
  - Nút "Xuất báo cáo" trong phần đơn hàng gần đây
  - Cho phép xuất dữ liệu dashboard ra file Excel hoặc PDF
  - Tùy chọn xuất theo kỳ (Hôm nay, 7 ngày, Tháng này)
  - Endpoint: `GET /api/admin/dashboard/export-report?format={excel|pdf}&period={today|week|month}`
  
- ❌ **Báo cáo chi tiết theo từng chỉ số**
  - Click vào từng stat card để xem chi tiết
  - Modal hoặc trang mới hiển thị phân tích chi tiết
  - Ví dụ: Click "Tổng doanh thu" → Xem breakdown theo danh mục, seller, thời gian, v.v.
  - Route: `/admin/dashboard/revenue-detail`, `/admin/dashboard/orders-detail`, etc.
  
- ❌ **So sánh với kỳ trước**
  - Hiển thị số liệu kỳ trước bên cạnh số liệu hiện tại
  - Tooltip hiển thị chi tiết so sánh khi hover
  - Biểu đồ so sánh 2 kỳ (đường kỳ hiện tại và kỳ trước)
  - API response cần có thêm field `previousPeriod` data
  
- ❌ **Lọc nâng cao**
  - Nút "Lọc" trong phần đơn hàng gần đây
  - Modal lọc theo: Trạng thái, Khoảng thời gian, Khách hàng, Seller
  - Apply filter và reload dữ liệu
  
- ❌ **Real-time updates**
  - Auto-refresh dữ liệu mỗi 5 phút (có thể cấu hình)
  - WebSocket để cập nhật real-time khi có đơn hàng mới
  - Notification badge khi có thay đổi
  - Toggle để bật/tắt auto-refresh
  
- ❌ **Export/Share dashboard**
  - Xuất dashboard dưới dạng hình ảnh (PNG/JPG)
  - Chia sẻ link dashboard với quyền xem (read-only)
  - Lưu cấu hình dashboard tùy chỉnh (ẩn/hiện widgets)

---

## 📱 Responsive Design (Mobile)

**Dashboard (Mobile):**
```
┌─────────────────────────────┐
│  Dashboard                  │
│  Cập nhật: 10:30, 24/05    │
│  [Hôm nay] [7 ngày] [Tháng]│
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  💳                   │ │
│  │  Tổng doanh thu       │ │
│  │  150.000.000 ₫        │ │
│  │  [+12%]               │ │
│  └───────────────────────┘ │
│  ┌───────────────────────┐ │
│  │  🛒                   │ │
│  │  Tổng đơn hàng        │ │
│  │  1,240                │ │
│  │  [+5%]                │ │
│  └───────────────────────┘ │
│  ... (2 cards còn lại)     │
│  ┌───────────────────────┐ │
│  │  📈 Biểu đồ Doanh thu │ │
│  │  [Chart - full width] │ │
│  └───────────────────────┘ │
│  ┌───────────────────────┐ │
│  │  🏆 Top Sản phẩm      │ │
│  │  [List - full width]  │ │
│  └───────────────────────┘ │
│  ┌───────────────────────┐ │
│  │  📦 Đơn hàng gần đây  │ │
│  │  [Table - scroll]      │ │
│  └───────────────────────┘ │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee) - Revenue card
- **Warning**: Yellow (#ffc107) - Orders card
- **Info**: Light Blue (#17a2b8) - Customers card
- **Success**: Green (#28a745) - Products card, Positive change
- **Danger**: Red (#dc3545) - Negative change, Cancelled orders
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Page Title**: Bold, 24px
- **Card Title**: Bold, 18px
- **Stat Value**: Bold, 28px
- **Stat Label**: Regular, 14px, muted
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Button**: Medium, 14px

### Spacing:
- **Padding**: 16px (card), 12px (table cell)
- **Margin**: 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Revenue: 💳
- Orders: 🛒
- Customers: 👤
- Products: ✓
- Chart: 📈
- Top Products: 🏆
- Recent Orders: 📦
- Filter: 🔽
- Export: ⬇️

---

## 📝 Implementation Notes

### State Management:
```typescript
// Dashboard State
{
  // Period filter
  period: 'today' | 'week' | 'month',
  
  // Stats Cards
  stats: {
    revenue: number,
    orders: number,
    customers: number,
    products: number,
    changes: {
      revenue: number,    // percentage
      orders: number,
      customers: number,
      products: number
    }
  },
  
  // Revenue Chart
  revenueChart: Array<{
    date: string,        // ISO date string
    revenue: number
  }>,
  
  // Top Products
  topProducts: Array<{
    id: number,
    name: string,
    image: string,
    sold: number,
    price: number
  }>,
  
  // Recent Orders
  recentOrders: Array<{
    id: number,
    orderCode: string,
    customer: string,
    customerAvatar: string,
    date: string,        // ISO date string
    total: number,
    status: 'completed' | 'shipping' | 'new' | 'cancelled'
  }>,
  
  // UI States
  loading: {
    stats: boolean,
    chart: boolean,
    products: boolean,
    orders: boolean
  },
  error: {
    stats: string | null,
    chart: string | null,
    products: string | null,
    orders: string | null
  },
  lastUpdated: string   // ISO datetime string
}
```

### API Calls:
```typescript
// Get Dashboard Stats
GET /api/admin/dashboard/stats?period={today|week|month}
Response: {
  revenue: number,
  orders: number,
  customers: number,
  products: number,
  changes: {
    revenue: number,
    orders: number,
    customers: number,
    products: number
  },
  lastUpdated: string
}

// Get Revenue Chart Data
GET /api/admin/dashboard/revenue-chart?period={today|week|month}
Response: [
  { date: "2024-05-20", revenue: 5000000 },
  { date: "2024-05-21", revenue: 7500000 },
  ...
]

// Get Top Products
GET /api/admin/dashboard/top-products?limit=4&period={today|week|month}
Response: [
  {
    id: 1,
    name: "Tai nghe Wireless Pro",
    image: "/images/product1.jpg",
    sold: 1204,
    price: 850000
  },
  ...
]

// Get Recent Orders
GET /api/admin/dashboard/recent-orders?limit=10&period={today|week|month}
Response: [
  {
    id: 123,
    orderCode: "ORD-00123",
    customer: "Trần Văn B",
    customerAvatar: "/images/avatar.jpg",
    date: "2024-05-24",
    total: 2500000,
    status: "completed"
  },
  ...
]

// Export Report
GET /api/admin/dashboard/export-report?format={excel|pdf}&period={today|week|month}
Response: File download (blob)
```

### Database Queries:
```sql
-- Get Revenue Stats
SELECT 
  SUM(total_amount) as revenue,
  COUNT(*) as orders,
  COUNT(DISTINCT customer_id) as customers
FROM orders
WHERE created_at >= ? AND created_at <= ?
AND status != 'cancelled';

-- Get Products Count
SELECT COUNT(*) as products
FROM products
WHERE status = 'active'
AND created_at >= ? AND created_at <= ?;

-- Get Revenue Chart Data (Daily)
SELECT 
  DATE(created_at) as date,
  SUM(total_amount) as revenue
FROM orders
WHERE created_at >= ? AND created_at <= ?
AND status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY date ASC;

-- Get Top Products
SELECT 
  p.id,
  p.name,
  p.image_url as image,
  SUM(oi.quantity) as sold,
  p.price
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= ? AND o.created_at <= ?
AND o.status != 'cancelled'
GROUP BY p.id, p.name, p.image_url, p.price
ORDER BY sold DESC
LIMIT ?;

-- Get Recent Orders
SELECT 
  o.id,
  o.order_code,
  u.name as customer,
  u.avatar_url as customer_avatar,
  o.created_at as date,
  o.total_amount as total,
  o.status
FROM orders o
JOIN users u ON o.customer_id = u.id
WHERE o.created_at >= ?
ORDER BY o.created_at DESC
LIMIT ?;
```

### Validation Rules:
- **Period**: Required, enum: 'today' | 'week' | 'month'
- **Limit**: Optional, integer, min: 1, max: 100 (default: 10)
- **Format**: Optional, enum: 'excel' | 'pdf' (for export)

### Date Range Calculation:
```typescript
function getDateRange(period: 'today' | 'week' | 'month'): { start: Date, end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  
  return { start, end };
}

// Calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
```

### Format Helpers:
```typescript
// Format VND currency
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Format number with comma
function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

// Format date
function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}
```

---

## 🔄 Workflow

### Load Dashboard:
1. Component mount → Set default period: 'today'
2. Fetch stats từ API: `GET /api/admin/dashboard/stats?period=today`
3. Fetch chart data: `GET /api/admin/dashboard/revenue-chart?period=today`
4. Fetch top products: `GET /api/admin/dashboard/top-products?limit=4&period=today`
5. Fetch recent orders: `GET /api/admin/dashboard/recent-orders?limit=10&period=today`
6. Display data trong các widgets
7. Show loading states → Hide khi data loaded
8. Update "Cập nhật lúc" timestamp

### Change Period Filter:
1. User click "7 ngày qua" hoặc "Tháng này"
2. Update state: `period = 'week'` hoặc `'month'`
3. Reload tất cả data với period mới
4. Update UI: Highlight button được chọn
5. Refresh all widgets

### View Order Details:
1. User click "Chi tiết" trong Recent Orders table
2. Navigate to: `/admin/orders/[orderId]`
3. Show order detail page

### Export Report:
1. User click "Xuất báo cáo"
2. Show modal: Chọn format (Excel/PDF) và period
3. Call API: `GET /api/admin/dashboard/export-report?format=excel&period=today`
4. Download file
5. Show success message

### View Stats Detail:
1. User click vào Stat Card (ví dụ: "Tổng doanh thu")
2. Navigate to: `/admin/dashboard/revenue-detail?period=today`
3. Show detail page với breakdown data

---

## 📊 Database Schema (Related Tables)

```sql
-- Orders table (for stats)
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'new',  -- new, shipping, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id)
);

-- Products table (for stats)
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    price DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',  -- active, inactive, pending
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Users table (for customer stats)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL,  -- buyer, seller, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- Order Items table (for top products)
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);
```

---

## ✅ Checklist Implementation

### Dashboard Page (1 fresher - 2 tuần):
- [ ] Tạo layout với 4 sections (Stats, Chart, Top Products, Orders)
- [ ] Stats Cards component (4 cards)
- [ ] Date Filter component (3 buttons)
- [ ] Revenue Chart component (SVG hoặc Chart.js)
- [ ] Top Products widget component
- [ ] Recent Orders table component
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states (skeleton/spinner)
- [ ] Error handling
- [ ] Empty states

### Stats Cards (1 fresher - 1 tuần):
- [ ] Card component với icon, value, change badge
- [ ] Format VND currency
- [ ] Format number với comma
- [ ] Calculate percentage change
- [ ] Color coding (success/danger cho change)
- [ ] Click handler (navigate to detail - Phase 2)

### Revenue Chart (1 fresher - 1.5 tuần):
- [ ] Chart component (SVG hoặc Chart.js/Recharts)
- [ ] Line chart với gradient fill
- [ ] X-axis labels (ngày trong tuần)
- [ ] Data points với circles
- [ ] Responsive chart
- [ ] "Xem chi tiết" button (Phase 2)

### Top Products Widget (1 fresher - 0.5 tuần):
- [ ] List component với image, name, sold, price
- [ ] Image placeholder (48x48)
- [ ] Text truncate cho tên dài
- [ ] "Xem tất cả" button (navigate to products - Phase 2)

### Recent Orders Table (1 fresher - 1 tuần):
- [ ] Table component với 6 cột
- [ ] Avatar placeholder (32x32)
- [ ] Status badges với màu
- [ ] Format date
- [ ] Format currency
- [ ] "Chi tiết" button (navigate to order detail)
- [ ] "Lọc" button (Phase 2 - modal)
- [ ] "Xuất báo cáo" button (Phase 2)
- [ ] "Xem tất cả" link (navigate to orders page)

### Backend API (2 fresher - 2 tuần):
- [ ] GET /api/admin/dashboard/stats (aggregate queries)
- [ ] GET /api/admin/dashboard/revenue-chart (group by date)
- [ ] GET /api/admin/dashboard/top-products (join orders, products)
- [ ] GET /api/admin/dashboard/recent-orders (join users)
- [ ] GET /api/admin/dashboard/export-report (Excel/PDF - Phase 2)
- [ ] Calculate percentage changes (so với kỳ trước)
- [ ] Date range calculation
- [ ] Error handling
- [ ] Response formatting

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test period filter changes
- [ ] Test responsive design
- [ ] Test loading/error states
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1: Stats Cards & Date Filter
- Stats Cards component
- Date Filter component
- Format helpers (VND, number, date)
- Mock data integration

### Tuần 2: Revenue Chart
- Chart component (SVG hoặc Chart.js)
- Chart data processing
- Responsive chart

### Tuần 3: Top Products & Recent Orders
- Top Products widget
- Recent Orders table
- Navigation links

### Tuần 4-5: Backend API
- Stats API endpoint
- Chart API endpoint
- Top Products API endpoint
- Recent Orders API endpoint
- Aggregate queries optimization

### Tuần 6: Integration & Polish
- Connect frontend với backend
- Loading/error states
- Responsive improvements
- Bug fixes

---

## 📌 Notes

1. **Dữ liệu hardcode Phase 1**: Có thể dùng mock data để phát triển UI trước
2. **Chart Library**: Nên dùng Chart.js hoặc Recharts thay SVG thủ công (dễ maintain)
3. **Period Filter**: Mặc định "Hôm nay" khi load trang
4. **Auto-refresh**: Phase 2 - có thể thêm auto-refresh mỗi 5 phút
5. **Caching**: Phase 2 - cache data để giảm API calls
6. **Real-time**: Phase 2 - WebSocket cho updates real-time

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Tích hợp API backend đầy đủ
- [ ] So sánh với kỳ trước (previous period data)
- [ ] Báo cáo chi tiết theo từng chỉ số (detail pages)
- [ ] Xuất báo cáo Excel/PDF
- [ ] Lọc nâng cao cho đơn hàng gần đây
- [ ] Real-time updates với WebSocket
- [ ] Widgets bổ sung:
  - [ ] Thống kê theo danh mục (Pie chart)
  - [ ] Thống kê theo seller (Bar chart)
  - [ ] Tỷ lệ chuyển đổi (Conversion rate)
  - [ ] Thống kê khách hàng (Customer segments)
  - [ ] Thống kê sản phẩm (Product alerts)
- [ ] Customizable dashboard layout (drag & drop widgets)
- [ ] Export/Share dashboard (image, link)
- [ ] Performance optimization (caching, lazy loading)

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 4 widgets chính, dễ hiểu
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Layout rõ ràng, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features
- ✅ **Responsive**: Mobile-friendly

**Tổng thời gian ước tính**: 6 tuần (1.5 tháng) với team 5 fresher

---
---

# 2. 📁 Quản lý danh mục (Category Management) - Layout Chi Tiết (MVP Rất Gọn)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Category phẳng (không phân cấp)
- Chỉ Admin tạo Category
- Form đơn giản (5 fields chính)
- Bỏ SEO/Meta Options (Phase 2)
- Bỏ Icon upload (Phase 2)

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm Parent Category (phân cấp)
- Thêm Icon upload
- Thêm Meta Options (SEO)
- Thêm Preview card
- Thêm Sort Order

---

## 🎨 LAYOUT CHI TIẾT - CATEGORY

### 📋 1. Category List Page (`/admin/category`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📁 Category                                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search categories...  [Status: ▼ All]  [+ Add Category]      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📁 All Category List                            [X categories]     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────────────────┬──────────┬────────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │  Image   │  Category Name        │    ID    │Product Stock│Created At│ Status   │Action│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼────────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Electronics          │ EC23818  │    12      │10 Sep 2023│ [✅]     │ [👁️]│ │
│  │  │   │  64x64   │                       │          │            │          │ Active   │ [✏️]│ │
│  │  │   │          │                       │          │            │          │          │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼────────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Fashion               │ FS16276  │     8      │15 Sep 2023│ [✅]     │ [👁️]│ │
│  │  │   │  64x64   │                       │          │            │          │ Active   │ [✏️]│ │
│  │  │   │          │                       │          │            │          │          │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼────────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Home & Living         │ HL49291  │     5      │20 Sep 2023│ [❌]     │ [👁️]│ │
│  │  │   │  64x64   │                       │          │            │          │ Hidden   │ [✏️]│ │
│  │  │   │          │                       │          │            │          │          │ [🗑️]│ │
│  │  └───┴──────────┴──────────────────────┴──────────┴────────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  │  Showing 1-10 of 25 categories  [< Prev] [1] [2] [3] [Next >]  │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Category                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search categories...                            │ │
│  │  [Status: ▼ All] [Active] [Hidden]                    │ │
│  │  [+ Add Category]                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (8 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Image** - 64x64px thumbnail, rounded - Hiển thị thumbnail category
3. **Category Name** - Text, có thể truncate nếu dài
4. **ID** - Category code (ví dụ: EC23818, FS16276) - Auto-generate từ tên
5. **Product Stock** - Số lượng sản phẩm trong category (auto tính)
6. **Created At** - Ngày tạo category (format: DD MMM YYYY, ví dụ: 10 Sep 2023)
7. **Status** - Badge màu:
   - `[✅ Active]` - Green badge
   - `[❌ Hidden]` - Grey badge
8. **Actions** - Icons: `[👁️ View] [✏️ Edit] [🗑️ Delete]`

**Pagination:**
```
Showing 1-10 of 25 categories    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo tên category
- Filter: Theo Status (All/Active/Hidden)
- Badge count: "X categories"
- Pagination: 10 items/page

---

### ➕ 2. Category Create Form (`/admin/category/new`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📁 Category > Category Add                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Add Category                                                       │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Category Name *                                              │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Electronics                                             │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ID (Auto-generated)                                         │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  EC23818 (read-only)                                    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Auto-generated from name, cannot be edited                │ │   │
│  │  │                                                               │ │   │
│  │  │  Slug (URL-friendly)                                         │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  electronics (auto from name, editable)                 │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Auto-generated from name, you can edit                   │ │   │
│  │  │                                                               │ │   │
│  │  │  Description                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Enter category description...                          │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  (Textarea - 4 rows)                                   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Thumbnail Image *                                           │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📷 Choose File]  No file chosen                       │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  [Preview Image sẽ hiện ở đây khi chọn file]             │ │ │   │
│  │  │  │  ┌──────────┐                                           │ │ │   │
│  │  │  │  │          │                                           │ │ │   │
│  │  │  │  │  200x200 │  (Preview)                                │ │ │   │
│  │  │  │  │          │                                           │ │ │   │
│  │  │  │  └──────────┘                                           │ │ │   │
│  │  │  │  Max size: 5MB, Formats: JPG, PNG, GIF                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                              [Save Change]   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Category Name**
- Type: Text input
- Required: Yes
- Placeholder: "Enter category name"
- Max length: 100 characters
- Validation: Required, unique name
- **Note**: Khi nhập tên, ID sẽ tự động generate

**2. ID (Category Code)**
- Type: Text input (read-only)
- Required: Yes (auto-generated)
- Display: Hiển thị ID sau khi nhập Category Name
- Auto-generate: Từ Category Name (ví dụ: "Electronics" → "EC23818")
- Editable: No (read-only, không thể sửa)
- Validation: Unique, format: 2 letters + 5 digits
- Helper text: "Auto-generated from name, cannot be edited"

**3. Slug (URL-friendly)**
- Type: Text input
- Required: Yes (auto-generated)
- Placeholder: "electronics"
- Auto-generate: Từ Category Name (lowercase, replace spaces with hyphens)
- Editable: Yes (user có thể edit)
- Validation: Required, unique, URL-safe (lowercase, hyphens only)

**4. Description**
- Type: Textarea
- Required: No
- Rows: 4
- Placeholder: "Enter category description"
- Max length: 500 characters

**5. Thumbnail Image**
- Type: File input
- Required: Yes
- Accept: image/* (jpg, png, gif)
- Max size: 5MB
- Preview: Show 200x200px preview after selection
- Recommended size: 800x600px

**6. Status**
- Type: Toggle switch
- Required: Yes
- Default: Active (ON)
- Options: Active / Hidden
- Display: Toggle với label

**7. Buttons**
- Cancel: Link back to `/admin/category`
- Save Change: Submit form, show loading, redirect on success

---

### ✏️ 3. Category Edit Form (`/admin/category/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📁 Category > Category Edit > Electronics                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Edit Category                                                      │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Category Information (Read-only)                            │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  ID: EC23818                                             │ │ │   │
│  │  │  │  Product Stock: 12 products                              │ │ │   │
│  │  │  │  Created At: 10 Sep 2023                                 │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Category Name *                                              │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Electronics                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Slug (URL-friendly)                                         │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  electronics                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Auto-generated from name, you can edit                   │ │   │
│  │  │                                                               │ │   │
│  │  │  Description                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  All electronic products including phones, laptops...  │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  (Textarea - 4 rows, pre-filled)                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Thumbnail Image *                                           │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📷 Choose File]  Current: electronics.jpg             │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  [Current Image Preview: 200x200]                      │ │ │   │
│  │  │  │  ┌──────────┐                                           │ │ │   │
│  │  │  │  │  [IMG]   │  (Current)                                │ │ │   │
│  │  │  │  │  200x200 │                                           │ │ │   │
│  │  │  │  └──────────┘                                           │ │ │   │
│  │  │  │  [New Image Preview sẽ hiện khi chọn file mới]          │ │ │   │
│  │  │  │  Max size: 5MB, Formats: JPG, PNG, GIF                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                            [Edit Change]    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields (Giống Create, nhưng pre-filled):

**Khác biệt với Create:**
- **Category Information (Read-only section)** - Hiển thị ở đầu form:
  - **ID**: Category code hiện tại (read-only, không thể sửa)
  - **Product Stock**: Số lượng sản phẩm trong category (auto tính, read-only)
  - **Created At**: Ngày tạo category (read-only)
- Tất cả fields đều pre-filled với data hiện tại
- Thumbnail Image: Hiển thị ảnh hiện tại + cho phép upload ảnh mới
- Button: "Edit Change" thay vì "Save Change"
- Breadcrumb: "Category > Category Edit > [Category Name]"

**Form Fields:**
1. Category Information (Read-only) - ID, Product Stock, Created At
2. Category Name * (editable)
3. Slug (editable)
4. Description (editable)
5. Thumbnail Image (editable)
6. Status (editable)

---

### 👁️ 4. Category View/Details (Optional - Phase 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Category > Electronics                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Image: 400x300]                                                   │   │
│  │  Electronics                                                         │   │
│  │  Status: [✅ Active]                                                │   │
│  │  Products: 12 products                                              │   │
│  │  Created: 10 Sep 2023                                               │   │
│  │                                                                     │   │
│  │  Description:                                                       │   │
│  │  All electronic products including phones, laptops...              │   │
│  │                                                                     │   │
│  │  [Edit] [Delete]                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Products in this category:                                                │
│  [Table hiển thị 12 sản phẩm]                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Design (Mobile)

**Category List (Mobile):**
```
┌─────────────────────────────┐
│  Category        [+ Add]    │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Status: ▼ All]            │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  [IMG]                │ │
│  │  Electronics          │ │
│  │  ID: EC23818          │ │
│  │  12 products          │ │
│  │  10 Sep 2023          │ │
│  │  [✅ Active]          │ │
│  │  [View] [Edit] [Delete]│ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Active status
- **Grey**: #6c757d - Hidden status
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Heading**: Bold, 18px
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (table cell)
- **Margin**: 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Search: 🔍
- Add: ➕
- Checkbox: ☐ / ☑
- Status: ✅ (Active), ❌ (Hidden)
- Actions: 👁️ (View), ✏️ (Edit), 🗑️ (Delete)
- Image: 📷

---

## 📝 Implementation Notes

### State Management:
```typescript
// Category List State
{
  categories: Category[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'active' | 'hidden',
  page: number,
  totalPages: number
}

// Category Form State (Create)
{
  categoryCode: string,  // Auto-generate từ name, read-only
  name: string,
  slug: string,
  description: string,
  thumbnail: File | null,
  status: 'active' | 'hidden',
  loading: boolean,
  errors: Record<string, string>
}

// Category Form State (Edit)
{
  categoryCode: string,  // Read-only, không thể sửa
  name: string,
  slug: string,
  description: string,
  thumbnail: File | null,
  thumbnailUrl: string,  // Current image URL
  status: 'active' | 'hidden',
  productStock: number,  // Read-only, auto tính
  createdAt: string,     // Read-only
  loading: boolean,
  errors: Record<string, string>
}
```

### API Calls:
- `GET /api/admin/categories?page=1&status=all&search=...`
- `GET /api/admin/categories/:id` (hoặc `:categoryCode`)
- `POST /api/admin/categories` (body: { categoryCode, name, slug, description, thumbnail, status })
- `PUT /api/admin/categories/:id` (body: same as POST, categoryCode không đổi)
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/categories/:id/products` (Phase 2)

**Note**: 
- `categoryCode` được auto-generate ở backend khi tạo mới
- `categoryCode` không được thay đổi khi edit

### Validation Rules:
- **Category Code (ID)**: 
  - Auto-generate từ Category Name
  - Format: 2 letters + 5 digits (ví dụ: EC23818)
  - Unique (validate ở backend)
  - Read-only (không cho user sửa)
- **Category Name**: Required, 3-100 characters, unique
- **Slug**: Required, 3-100 characters, unique, URL-safe (lowercase, hyphens only)
- **Description**: Optional, max 500 characters
- **Thumbnail**: Required, max 5MB, jpg/png/gif
- **Status**: Required, 'active' | 'hidden'

**Note**: 
- ID được generate ở frontend khi user nhập tên
- Backend validate ID unique trước khi tạo
- Nếu ID trùng, backend tự động generate ID mới hoặc thêm số vào cuối

### Slug Auto-generation:
```typescript
// Example: "Electronics" → "electronics"
// Example: "Home & Living" → "home-living"
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-');       // Replace multiple hyphens with single
}
```

### Category Code Auto-generation:
```typescript
// Generate ID code từ tên category
// Example: "Electronics Headphone" → "EC23818"
// Example: "Fashion Men, Women & Kid's" → "FS16276"
// Example: "Cap and Hat" → "CH492-9"

function generateCategoryCode(name: string): string {
  // Lấy 2 chữ cái đầu của từ đầu tiên
  const words = name.trim().split(/\s+/);
  const firstWord = words[0].replace(/[^a-zA-Z]/g, ''); // Remove special chars
  const secondWord = words[1] ? words[1].replace(/[^a-zA-Z]/g, '') : '';
  
  // Tạo prefix từ 2 chữ cái đầu
  let prefix = '';
  if (firstWord.length >= 2) {
    prefix = firstWord.substring(0, 2).toUpperCase();
  } else if (firstWord.length === 1 && secondWord.length >= 1) {
    prefix = (firstWord + secondWord.substring(0, 1)).toUpperCase();
  } else {
    prefix = firstWord.toUpperCase().padEnd(2, 'X');
  }
  
  // Generate random 5-digit number
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  
  return `${prefix}${randomNum}`;
}

// Frontend: Generate khi user nhập tên
const handleNameChange = (name: string) => {
  const categoryCode = generateCategoryCode(name);
  setFormData({ ...formData, name, categoryCode });
};

// Backend: Validate unique, nếu trùng thì generate lại
async function createCategory(data) {
  let categoryCode = data.categoryCode;
  
  // Check unique
  while (await isCategoryCodeExists(categoryCode)) {
    // Nếu trùng, generate lại với số random khác
    categoryCode = generateCategoryCode(data.name);
  }
  
  return await db.categories.create({ ...data, categoryCode });
}

// Hoặc đơn giản hơn (sequential):
// CAT-001, CAT-002, CAT-003...
function generateCategoryCodeSequential(index: number): string {
  return `CAT-${String(index).padStart(3, '0')}`;
}
```

### Delete Protection:
- Không cho xóa category nếu còn sản phẩm
- Hiển thị message: "Cannot delete category with products. Please remove products first."

---

## 🔄 Workflow

### Create Category:
1. Click "+ Add Category"
2. Nhập Category Name
3. ID tự động generate và hiển thị (read-only) - ví dụ: "Electronics" → "EC23818"
4. Slug auto-generate (có thể edit)
5. Fill các fields còn lại (Description, Image, Status)
6. Click "Save Change"
7. Validate → Upload image → Create (với categoryCode) → Redirect to List

**Note**: ID được generate ở frontend khi user nhập tên, sau đó validate unique ở backend

### Edit Category:
1. Click "Edit" icon từ List
2. Form hiển thị:
   - **Category Information (Read-only)**: ID, Product Stock, Created At
   - **Editable fields**: Name, Slug, Description, Image, Status (pre-filled)
3. Edit fields cần thiết (ID không thể sửa)
4. Click "Edit Change"
5. Validate → Update → Redirect to List

### Delete Category:
1. Click "Delete" icon từ List
2. Confirm dialog: "Are you sure? This will delete the category."
3. Check: Nếu có products → Show error, không cho xóa
4. Nếu không có products → Delete → Refresh List

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_code VARCHAR(50) UNIQUE NOT NULL,  -- ID hiển thị (ví dụ: EC23818, FS16276)
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, HIDDEN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_slug (slug),
    INDEX idx_category_code (category_code)
);
```

**Note**: 
- `category_code`: ID hiển thị cho user (auto-generate từ tên)
- `parent_id` bỏ (category phẳng - Phase 1)
- `icon_url` bỏ (Phase 2)
- `meta_*` bỏ (SEO - Phase 2)
- `sort_order` bỏ (Phase 2)
- `created_by` bỏ (chỉ Admin tạo, không cần lưu)

---

## ✅ Checklist Implementation

### Category List (1 fresher - 2 tuần):
- [ ] Tạo table component với 8 cột
- [ ] Fetch data từ API
- [ ] Hiển thị data trong table
- [ ] Search by name
- [ ] Filter by status
- [ ] Pagination (10 items/page)
- [ ] Badge count
- [ ] View button (navigate to details - Phase 2)
- [ ] Edit button (navigate to edit)
- [ ] Delete button (with confirmation)
- [ ] Loading state
- [ ] Error handling

### Category Create Form (1 fresher - 2 tuần):
- [ ] Tạo form với 6 fields (Name, ID, Slug, Description, Image, Status)
- [ ] Category Name input với onChange handler
- [ ] ID auto-generation khi nhập tên (frontend)
- [ ] ID field (read-only, disabled)
- [ ] Slug auto-generation (có thể edit)
- [ ] Validation (required fields, unique name/slug/code)
- [ ] Upload thumbnail image
- [ ] Preview image
- [ ] Status toggle
- [ ] Submit form (API call với categoryCode)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Category Edit Form (1 fresher - 1 tuần):
- [ ] Tạo form giống Create
- [ ] Category Information section (read-only):
  - [ ] ID (read-only, disabled)
  - [ ] Product Stock (read-only, auto tính)
  - [ ] Created At (read-only)
- [ ] Pre-fill data từ API
- [ ] Update existing image display
- [ ] Submit update (API call, không gửi categoryCode vì không đổi)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Backend API (2 fresher - 2 tuần):
- [ ] GET /api/admin/categories (list)
- [ ] GET /api/admin/categories/:id (detail)
- [ ] POST /api/admin/categories (create)
- [ ] PUT /api/admin/categories/:id (update)
- [ ] DELETE /api/admin/categories/:id (delete with protection)
- [ ] File upload handling (thumbnail)
- [ ] Slug generation
- [ ] Category Code generation (auto từ tên)
- [ ] Validation (unique categoryCode, name, slug)
- [ ] Error responses

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test validation
- [ ] Test delete protection
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1-2: Category List
- Table component
- Search, Filter, Pagination
- Actions (View, Edit, Delete)

### Tuần 3-4: Category Create Form
- Form component
- Slug auto-generation
- Image upload
- Validation

### Tuần 5: Category Edit Form
- Edit form (reuse Create form)
- Pre-fill data
- Update logic

### Tuần 6-7: Backend API
- CRUD endpoints
- File upload
- Validation
- Delete protection

### Tuần 8: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **Category phẳng**: Không có phân cấp (parent_id) - đơn giản cho Phase 1
2. **Chỉ Admin tạo**: Seller không có quyền tạo category
3. **Delete Protection**: Không cho xóa nếu còn sản phẩm
4. **Slug**: Auto-generate nhưng có thể edit
5. **Image**: Chỉ thumbnail, không có icon (Phase 2)
6. **SEO**: Bỏ Meta Options (Phase 2)

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Parent Category (phân cấp)
- [ ] Icon upload
- [ ] Meta Options (SEO)
- [ ] Preview card trong form
- [ ] Sort Order
- [ ] Category Details page
- [ ] Products in category list

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 5 fields chính, không phức tạp
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features

**Tổng thời gian ước tính**: 8 tuần (2 tháng) với team 5 fresher

---

# 3. ✨ Quản lý thuộc tính (Attributes Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Tách riêng Attributes và Attribute Values (2 bảng)
- Chỉ Admin tạo Attribute
- Form đơn giản (3 fields chính: Name, Option, Published)
- Quản lý giá trị riêng (không dùng comma-separated)
- Bỏ Category link (NULL = áp dụng cho tất cả)
- Bỏ Data Type (mặc định Select/Multi-select)

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm Category link (attribute áp dụng cho category nào)
- Thêm Data Type (Text, Number, Boolean)
- Thêm Sort Order cho giá trị
- Drag & drop sắp xếp giá trị

---

## 🎨 LAYOUT CHI TIẾT - ATTRIBUTES

### 📋 1. Attribute List Page (`/admin/attribute`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✨ Attributes                                                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search attributes...  [Status: ▼ All]  [+ Add Attribute]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✨ All Attribute List                            [X attributes]   │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────────────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │    ID    │  Attribute Name       │Values Count│ Option   │Published│Created On│Action│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │ AT-0001  │  Brand                │    5      │ Dropdown │  [✅]    │10 Sep 2023│ [👁️]│ │
│  │  │   │          │                       │           │          │ Active   │          │ [✏️]│ │
│  │  │   │          │                       │           │          │          │          │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │ AT-0002  │  Color                │    8      │ Radio    │  [✅]    │15 Sep 2023│ [👁️]│ │
│  │  │   │          │                       │           │          │ Active   │          │ [✏️]│ │
│  │  │   │          │                       │           │          │          │          │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │ AT-0003  │  Size                 │    6      │ Dropdown │  [❌]    │20 Sep 2023│ [👁️]│ │
│  │  │   │          │                       │           │          │ Hidden   │          │ [✏️]│ │
│  │  │   │          │                       │           │          │          │          │ [🗑️]│ │
│  │  └───┴──────────┴──────────────────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-10 of 25 attributes  [< Prev] [1] [2] [3] [Next >] │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Attributes                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search attributes...                            │ │
│  │  [Status: ▼ All] [Active] [Hidden]                    │ │
│  │  [+ Add Attribute]                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (8 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **ID** - Attribute code (ví dụ: AT-0001, AT-0002) - Auto-generate
3. **Attribute Name** - Tên attribute (ví dụ: Brand, Color, Size)
4. **Values Count** - Số lượng giá trị (ví dụ: 5, 8, 6)
5. **Option** - Cách hiển thị:
   - `Dropdown` - Dropdown select
   - `Radio` - Radio buttons
6. **Published** - Badge màu:
   - `[✅ Active]` - Green badge
   - `[❌ Hidden]` - Grey badge
7. **Created On** - Ngày tạo (format: DD MMM YYYY, ví dụ: 10 Sep 2023)
8. **Actions** - Icons: `[👁️ View] [✏️ Edit] [🗑️ Delete]`

**Pagination:**
```
Showing 1-10 of 25 attributes    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo tên attribute
- Filter: Theo Status (All/Active/Hidden)
- Badge count: "X attributes"
- Pagination: 10 items/page
- View: Navigate to Attribute Details (quản lý giá trị)

---

### ➕ 2. Attribute Create Form (`/admin/attribute/new`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✨ Attributes > Attribute Add                                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Add Attribute                                                      │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Attribute Name *                                              │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Brand                                                    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ID (Auto-generated)                                         │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  AT-0001 (read-only)                                    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Auto-generated from name, cannot be edited                │ │   │
│  │  │                                                               │ │   │
│  │  │  Option (Display Type) *                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Dropdown                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Dropdown, Radio                                    │ │   │
│  │  │                                                               │ │   │
│  │  │  Published                                                   │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                              [Save Change]   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Attribute Name**
- Type: Text input
- Required: Yes
- Placeholder: "Enter attribute name"
- Max length: 100 characters
- Validation: Required, unique name
- **Note**: Khi nhập tên, ID sẽ tự động generate

**2. ID (Attribute Code)**
- Type: Text input (read-only)
- Required: Yes (auto-generated)
- Display: Hiển thị ID sau khi nhập Attribute Name
- Auto-generate: Format: `AT-0001`, `AT-0002`, `AT-0003`... (sequential)
- Editable: No (read-only, không thể sửa)
- Validation: Unique
- Helper text: "Auto-generated from name, cannot be edited"

**3. Option (Display Type)**
- Type: Dropdown/Select
- Required: Yes
- Options:
  - `Dropdown` - Dropdown select (mặc định)
  - `Radio` - Radio buttons
- Default: Dropdown
- **Note**: Quyết định cách hiển thị khi Seller chọn giá trị

**4. Published**
- Type: Toggle switch
- Required: Yes
- Default: Active (ON)
- Options: Active / Hidden
- Display: Toggle với label

**5. Buttons**
- Cancel: Link back to `/admin/attribute`
- Save Change: Submit form, show loading, redirect to Attribute Details (quản lý giá trị)`                                                                                                                                                                                                                                                                                  

---

### ✏️ 3. Attribute Edit Form (`/admin/attribute/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✨ Attributes > Attribute Edit > Brand                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Edit Attribute                                                     │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Attribute Information (Read-only)                            │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  ID: AT-0001                                             │ │ │   │
│  │  │  │  Values Count: 5 values                                  │ │ │   │
│  │  │  │  Created At: 10 Sep 2023                                 │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Attribute Name *                                            │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Brand                                                   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Option (Display Type) *                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Dropdown                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Dropdown, Radio                                    │ │   │
│  │  │                                                               │ │   │
│  │  │  Published                                                   │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                            [Edit Change]    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields (Giống Create, nhưng pre-filled):

**Khác biệt với Create:**
- **Attribute Information (Read-only section)** - Hiển thị ở đầu form:
  - **ID**: Attribute code hiện tại (read-only, không thể sửa)
  - **Values Count**: Số lượng giá trị hiện tại (read-only, auto tính)
  - **Created At**: Ngày tạo attribute (read-only)
- Tất cả fields đều pre-filled với data hiện tại
- Button: "Edit Change" thay vì "Save Change"
- Breadcrumb: "Attributes > Attribute Edit > [Attribute Name]"

**Form Fields:**
1. Attribute Information (Read-only) - ID, Values Count, Created At
2. Attribute Name * (editable)
3. Option (Display Type) * (editable)
4. Published (editable)

---

### 📝 4. Attribute Values Manager (`/admin/attribute/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✨ Attributes > Brand                                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Attribute: Brand                                                  │   │
│  │  ID: AT-0001 | Option: Dropdown | Status: [✅ Active]               │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Attribute Values                              [+ Add Value] │ │   │
│  │  │  ─────────────────────────────────────────────────────────────  │   │
│  │  │                                                                 │   │
│  │  │  ┌───┬──────────┬──────────┬──────────┬──────┐                │   │
│  │  │  │ ☐ │  Order   │  Value   │Created On│Action│                │   │
│  │  │  ├───┼──────────┼──────────┼──────────┼──────┤                │   │
│  │  │  │ ☐ │    1     │  Nike    │10 Sep 2023│ [✏️]│                │   │
│  │  │  │   │          │          │          │ [🗑️]│                │   │
│  │  │  ├───┼──────────┼──────────┼──────────┼──────┤                │   │
│  │  │  │ ☐ │    2     │  Adidas  │10 Sep 2023│ [✏️]│                │   │
│  │  │  │   │          │          │          │ [🗑️]│                │   │
│  │  │  ├───┼──────────┼──────────┼──────────┼──────┤                │   │
│  │  │  │ ☐ │    3     │  Puma    │10 Sep 2023│ [✏️]│                │   │
│  │  │  │   │          │          │          │ [🗑️]│                │   │
│  │  │  ├───┼──────────┼──────────┼──────────┼──────┤                │   │
│  │  │  │ ☐ │    4     │  Dyson   │11 Sep 2023│ [✏️]│                │   │
│  │  │  │   │          │          │          │ [🗑️]│                │   │
│  │  │  ├───┼──────────┼──────────┼──────────┼──────┤                │   │
│  │  │  │ ☐ │    5     │  GoPro   │11 Sep 2023│ [✏️]│                │   │
│  │  │  │   │          │          │          │ [🗑️]│                │   │
│  │  │  └───┴──────────┴──────────┴──────────┴──────┘                │   │
│  │  │                                                                 │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  │  [← Back to List]                    [Edit Attribute]  │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │   │
│  │  │                                                                 │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Attribute: Brand                                            │
│  ID: AT-0001 | Option: Dropdown | Status: [✅ Active]        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Attribute Values                        [+ Add Value] │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (5 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Order** - Thứ tự hiển thị (1, 2, 3, 4, 5...)
3. **Value** - Giá trị attribute (ví dụ: Nike, Adidas, Puma)
4. **Created On** - Ngày tạo giá trị (format: DD MMM YYYY)
5. **Actions** - Icons: `[✏️ Edit] [🗑️ Delete]`

**Features:**
- Add Value: Mở modal/form để thêm giá trị mới
- Edit Value: Mở modal/form để sửa giá trị
- Delete Value: Xóa giá trị (với confirmation)
- Back to List: Quay lại Attribute List
- Edit Attribute: Navigate to Edit Attribute form

---

### ➕ 5. Add/Edit Value Modal (`/admin/attribute/[id]` - Modal)

```
┌──────────────────────────────────────────────────────────────┐
│  Add Value                                          [X]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Attribute: Brand                                            │
│                                                              │
│  Value *                                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Nike                                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Order (Display Order)                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ℹ️ Thứ tự hiển thị (1 = đầu tiên)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Cancel]                    [Save Value]              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Value**
- Type: Text input
- Required: Yes
- Placeholder: "Enter value"
- Max length: 255 characters
- Validation: Required, unique trong cùng attribute

**2. Order (Display Order)**
- Type: Number input
- Required: Yes
- Min: 1
- Default: Tự động tăng (số lớn nhất + 1)
- Validation: Required, >= 1
- Helper text: "Thứ tự hiển thị (1 = đầu tiên)"

**3. Buttons**
- Cancel: Đóng modal
- Save Value: Submit form, show loading, refresh table

---

## 📱 Responsive Design (Mobile)

**Attribute List (Mobile):**
```
┌─────────────────────────────┐
│  Attributes      [+ Add]    │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Status: ▼ All]            │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  Brand                │ │
│  │  ID: AT-0001          │ │
│  │  5 values | Dropdown  │ │
│  │  10 Sep 2023          │ │
│  │  [✅ Active]          │ │
│  │  [View] [Edit] [Delete]│ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Active status
- **Grey**: #6c757d - Hidden status
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Heading**: Bold, 18px
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (table cell)
- **Margin**: 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Search: 🔍
- Add: ➕
- Checkbox: ☐ / ☑
- Status: ✅ (Active), ❌ (Hidden)
- Actions: 👁️ (View), ✏️ (Edit), 🗑️ (Delete)

---

## 📝 Implementation Notes

### State Management:
```typescript
// Attribute List State
{
  attributes: Attribute[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'active' | 'hidden',
  page: number,
  totalPages: number
}

// Attribute Form State (Create)
{
  attributeCode: string,  // Auto-generate từ name, read-only
  name: string,
  option: 'dropdown' | 'radio',
  published: boolean,
  loading: boolean,
  errors: Record<string, string>
}

// Attribute Form State (Edit)
{
  attributeCode: string,  // Read-only, không thể sửa
  name: string,
  option: 'dropdown' | 'radio',
  published: boolean,
  valuesCount: number,     // Read-only, auto tính
  createdAt: string,       // Read-only
  loading: boolean,
  errors: Record<string, string>
}

// Attribute Values State
{
  values: AttributeValue[],
  loading: boolean,
  error: string | null,
  showAddModal: boolean,
  editingValue: AttributeValue | null
}
```

### API Calls:
- `GET /api/admin/attributes?page=1&status=all&search=...`
- `GET /api/admin/attributes/:id` (chi tiết attribute)
- `POST /api/admin/attributes` (body: { attributeCode, name, option, published })
- `PUT /api/admin/attributes/:id` (body: same as POST, attributeCode không đổi)
- `DELETE /api/admin/attributes/:id` (delete with protection)

- `GET /api/admin/attributes/:id/values` (danh sách giá trị)
- `POST /api/admin/attributes/:id/values` (body: { value, displayOrder })
- `PUT /api/admin/attributes/:id/values/:valueId` (body: { value, displayOrder })
- `DELETE /api/admin/attributes/:id/values/:valueId` (delete value)

**Note**: 
- `attributeCode` được auto-generate ở backend khi tạo mới (format: AT-0001, AT-0002...)
- `attributeCode` không được thay đổi khi edit

### Validation Rules:
- **Attribute Code (ID)**: 
  - Auto-generate sequential: AT-0001, AT-0002, AT-0003...
  - Unique (validate ở backend)
  - Read-only (không cho user sửa)
- **Attribute Name**: Required, 3-100 characters, unique
- **Option**: Required, 'dropdown' | 'radio'
- **Published**: Required, boolean

- **Value**: Required, 1-255 characters, unique trong cùng attribute
- **Display Order**: Required, >= 1, integer

### Attribute Code Auto-generation:
```typescript
// Sequential: AT-0001, AT-0002, AT-0003...
function generateAttributeCode(index: number): string {
  return `AT-${String(index).padStart(4, '0')}`;
}

// Backend: Lấy số lớn nhất + 1
async function createAttribute(data) {
  const maxCode = await db.attributes.max('attribute_code');
  const nextIndex = maxCode ? parseInt(maxCode.split('-')[1]) + 1 : 1;
  const attributeCode = generateAttributeCode(nextIndex);
  
  return await db.attributes.create({ ...data, attributeCode });
}
```

### Delete Protection:
- Không cho xóa attribute nếu còn sản phẩm dùng
- Không cho xóa value nếu còn sản phẩm dùng value đó
- Hiển thị message: "Cannot delete attribute/value with products. Please remove products first."

---

## 🔄 Workflow

### Create Attribute:
1. Click "+ Add Attribute"
2. Nhập Attribute Name
3. ID tự động generate và hiển thị (read-only) - ví dụ: "Brand" → "AT-0001"
4. Chọn Option (Dropdown/Radio)
5. Set Published (mặc định Active)
6. Click "Save Change"
7. Validate → Create → Redirect to Attribute Details (quản lý giá trị)

**Note**: Sau khi tạo Attribute, tự động chuyển sang trang quản lý giá trị

### Add Value:
1. Vào Attribute Details (từ List → View)
2. Click "+ Add Value"
3. Nhập Value (ví dụ: "Nike")
4. Nhập Order (hoặc để auto)
5. Click "Save Value"
6. Validate → Create → Refresh table

### Edit Attribute:
1. Click "Edit" icon từ List
2. Form hiển thị:
   - **Attribute Information (Read-only)**: ID, Values Count, Created At
   - **Editable fields**: Name, Option, Published (pre-filled)
3. Edit fields cần thiết (ID không thể sửa)
4. Click "Edit Change"
5. Validate → Update → Redirect to List

### Edit Value:
1. Click "Edit" icon từ Value table
2. Modal hiển thị form (pre-filled)
3. Edit Value hoặc Order
4. Click "Save Value"
5. Validate → Update → Refresh table

### Delete Attribute:
1. Click "Delete" icon từ List
2. Confirm dialog: "Are you sure? This will delete the attribute and all its values."
3. Check: Nếu có products dùng → Show error, không cho xóa
4. Nếu không có products → Delete → Refresh List

### Delete Value:
1. Click "Delete" icon từ Value table
2. Confirm dialog: "Are you sure? This will delete this value."
3. Check: Nếu có products dùng value này → Show error, không cho xóa
4. Nếu không có products → Delete → Refresh table

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE attributes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attribute_code VARCHAR(50) UNIQUE NOT NULL,  -- ID hiển thị (ví dụ: AT-0001, AT-0002)
    name VARCHAR(255) NOT NULL,
    option VARCHAR(50) NOT NULL,                  -- DROPDOWN, RADIO
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_published (published),
    INDEX idx_attribute_code (attribute_code),
    UNIQUE KEY uk_name (name)
);

CREATE TABLE attribute_values (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attribute_id BIGINT NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
    INDEX idx_attribute_id (attribute_id),
    UNIQUE KEY uk_attribute_value (attribute_id, value)  -- Không trùng giá trị trong cùng attribute
);
```

**Note**: 
- `attribute_code`: ID hiển thị cho user (auto-generate sequential)
- `category_id` bỏ (Phase 1 - NULL = áp dụng cho tất cả)
- `data_type` bỏ (Phase 1 - mặc định Select/Multi-select)

---

## ✅ Checklist Implementation

### Attribute List (1 fresher - 1.5 tuần):
- [ ] Tạo table component với 8 cột
- [ ] Fetch data từ API
- [ ] Hiển thị data trong table
- [ ] Search by name
- [ ] Filter by status
- [ ] Pagination (10 items/page)
- [ ] Badge count
- [ ] View button (navigate to Attribute Details)
- [ ] Edit button (navigate to edit)
- [ ] Delete button (with confirmation)
- [ ] Loading state
- [ ] Error handling

### Attribute Create Form (1 fresher - 1 tuần):
- [ ] Tạo form với 4 fields (Name, ID, Option, Published)
- [ ] Attribute Name input với onChange handler
- [ ] ID auto-generation khi nhập tên (frontend)
- [ ] ID field (read-only, disabled)
- [ ] Option dropdown (Dropdown/Radio)
- [ ] Validation (required fields, unique name/code)
- [ ] Published toggle
- [ ] Submit form (API call với attributeCode)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect to Attribute Details

### Attribute Edit Form (1 fresher - 0.5 tuần):
- [ ] Tạo form giống Create
- [ ] Attribute Information section (read-only):
  - [ ] ID (read-only, disabled)
  - [ ] Values Count (read-only, auto tính)
  - [ ] Created At (read-only)
- [ ] Pre-fill data từ API
- [ ] Submit update (API call, không gửi attributeCode vì không đổi)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Attribute Values Manager (1 fresher - 1.5 tuần):
- [ ] Tạo table component với 5 cột
- [ ] Fetch values từ API
- [ ] Hiển thị values trong table
- [ ] Add Value button (mở modal)
- [ ] Add Value modal/form
- [ ] Edit Value button (mở modal)
- [ ] Edit Value modal/form
- [ ] Delete Value button (with confirmation)
- [ ] Loading state
- [ ] Error handling
- [ ] Back to List button
- [ ] Edit Attribute button

### Backend API (2 fresher - 1.5 tuần):
- [ ] GET /api/admin/attributes (list)
- [ ] GET /api/admin/attributes/:id (detail)
- [ ] POST /api/admin/attributes (create)
- [ ] PUT /api/admin/attributes/:id (update)
- [ ] DELETE /api/admin/attributes/:id (delete with protection)
- [ ] Attribute Code generation (sequential)
- [ ] Validation (unique attributeCode, name)
- [ ] Error responses

- [ ] GET /api/admin/attributes/:id/values (list values)
- [ ] POST /api/admin/attributes/:id/values (create value)
- [ ] PUT /api/admin/attributes/:id/values/:valueId (update value)
- [ ] DELETE /api/admin/attributes/:id/values/:valueId (delete value)
- [ ] Validation (unique value trong cùng attribute)
- [ ] Delete protection (check products)

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test validation
- [ ] Test delete protection
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1-1.5: Attribute List
- Table component
- Search, Filter, Pagination
- Actions (View, Edit, Delete)

### Tuần 2: Attribute Create Form
- Form component
- ID auto-generation
- Validation

### Tuần 2.5: Attribute Edit Form
- Edit form (reuse Create form)
- Pre-fill data
- Update logic

### Tuần 3-4: Attribute Values Manager
- Values table
- Add/Edit/Delete Value modals
- Integration

### Tuần 4.5-5: Backend API
- CRUD endpoints (Attributes)
- CRUD endpoints (Values)
- Validation
- Delete protection

### Tuần 6: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **Tách riêng Attributes và Values**: 2 bảng riêng, dễ quản lý
2. **Chỉ Admin tạo**: Seller không có quyền tạo attribute
3. **Delete Protection**: Không cho xóa nếu còn sản phẩm dùng
4. **Form quản lý giá trị riêng**: Không dùng comma-separated
5. **Category link**: Bỏ Phase 1 (NULL = tất cả categories)
6. **Data Type**: Bỏ Phase 1 (mặc định Select/Multi-select)

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Category link (attribute áp dụng cho category nào)
- [ ] Data Type (Text, Number, Boolean)
- [ ] Sort Order drag & drop
- [ ] Bulk actions (delete nhiều values)
- [ ] Export/Import attributes

---

## 📚 Ví Dụ Thực Tế: Laptop với RAM và SSD

### Mô Tả Scenario:
Admin muốn tạo Attributes cho Laptop:
- **RAM**: 8GB, 16GB, 32GB
- **SSD**: 256GB, 512GB, 1TB

Sau đó Seller sẽ sử dụng các Attributes này khi tạo sản phẩm Laptop.

---

### Bước 1: Admin Tạo Attribute "RAM"

**Admin vào:** `/admin/attribute/new`

**Form tạo Attribute:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✨ Attributes > Attribute Add                                              │
│                                                                             │
│  Add Attribute                                                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────┐         │
│  │  Attribute Name *                                            │         │
│  │  ┌─────────────────────────────────────────────────────────┐ │         │
│  │  │  RAM                                                      │ │         │
│  │  └─────────────────────────────────────────────────────────┘ │         │
│  │                                                               │         │
│  │  ID (Auto-generated)                                         │         │
│  │  ┌─────────────────────────────────────────────────────────┐ │         │
│  │  │  AT-0001 (read-only)                                    │ │         │
│  │  └─────────────────────────────────────────────────────────┘ │         │
│  │  ℹ️ Auto-generated from name, cannot be edited                │         │
│  │                                                               │         │
│  │  Option (Display Type) *                                     │         │
│  │  ┌─────────────────────────────────────────────────────────┐ │         │
│  │  │  [▼] Dropdown                                            │ │         │
│  │  └─────────────────────────────────────────────────────────┘ │         │
│  │  Options: Dropdown, Radio                                    │         │
│  │                                                               │         │
│  │  Published                                                   │         │
│  │  [Toggle: ON]  Active                                       │         │
│  │                                                               │         │
│  │  [Cancel]                              [Save Change]        │         │
│  └───────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Kết quả:**
- Attribute "RAM" được tạo (ID: AT-0001)
- Tự động chuyển sang: `/admin/attribute/AT-0001` (trang quản lý giá trị)

---

### Bước 2: Admin Thêm Giá Trị Cho RAM

**Admin ở trang:** `/admin/attribute/AT-0001` (Attribute Values Manager)

**Trang quản lý giá trị:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✨ Attributes > RAM                                                        │
│                                                                             │
│  Attribute: RAM                                                             │
│  ID: AT-0001 | Option: Dropdown | Status: [✅ Active]                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────┐         │
│  │  Attribute Values                              [+ Add Value] │         │
│  │  ─────────────────────────────────────────────────────────────  │         │
│  │                                                                 │         │
│  │  ┌───┬──────────┬──────────┬──────────┬──────┐                │         │
│  │  │ ☐ │  Order   │  Value   │Created On│Action│                │         │
│  │  ├───┼──────────┼──────────┼──────────┼──────┤                │         │
│  │  │ ☐ │    1     │  8GB     │10 Sep 2023│ [✏️]│                │         │
│  │  │   │          │          │          │ [🗑️]│                │         │
│  │  │ ☐ │    2     │  16GB    │10 Sep 2023│ [✏️]│                │         │
│  │  │   │          │          │          │ [🗑️]│                │         │
│  │  │ ☐ │    3     │  32GB    │10 Sep 2023│ [✏️]│                │         │
│  │  │   │          │          │          │ [🗑️]│                │         │
│  │  └───┴──────────┴──────────┴──────────┴──────┘                │         │
│  │                                                                 │         │
│  │  [← Back to List]                    [Edit Attribute]          │         │
│  └───────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Cách thêm giá trị:**

**Lần 1: Thêm "8GB"**
```
Click "+ Add Value" → Modal hiện ra:

┌──────────────────────────────────────────────┐
│  Add Value                          [X]      │
├──────────────────────────────────────────────┤
│                                              │
│  Attribute: RAM                              │
│                                              │
│  Value *                                     │
│  ┌────────────────────────────────────────┐ │
│  │  8GB                                    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Order (Display Order)                       │
│  ┌────────────────────────────────────────┐ │
│  │  1                                    │ │
│  └────────────────────────────────────────┘ │
│  ℹ️ Thứ tự hiển thị (1 = đầu tiên)          │
│                                              │
│  [Cancel]                    [Save Value]    │
│                                              │
└──────────────────────────────────────────────┘

→ Click "Save Value"
→ Giá trị "8GB" được thêm (Order: 1)
```

**Lần 2: Thêm "16GB"**
```
Click "+ Add Value" → Modal:
- Value: 16GB
- Order: 2
→ Click "Save Value"
→ Giá trị "16GB" được thêm (Order: 2)
```

**Lần 3: Thêm "32GB"**
```
Click "+ Add Value" → Modal:
- Value: 32GB
- Order: 3
→ Click "Save Value"
→ Giá trị "32GB" được thêm (Order: 3)
```

**Kết quả:** RAM có 3 giá trị: 8GB, 16GB, 32GB

---

### Bước 3: Admin Tạo Attribute "SSD"

**Admin vào:** `/admin/attribute/new`

**Form tạo Attribute:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✨ Attributes > Attribute Add                                              │
│                                                                             │
│  Add Attribute                                                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────┐         │
│  │  Attribute Name *                                            │         │
│  │  ┌─────────────────────────────────────────────────────────┐ │         │
│  │  │  SSD                                                     │ │         │
│  │  └─────────────────────────────────────────────────────────┘ │         │
│  │                                                               │         │
│  │  ID (Auto-generated)                                         │         │
│  │  ┌─────────────────────────────────────────────────────────┐ │         │
│  │  │  AT-0002 (read-only)                                    │ │         │
│  │  └─────────────────────────────────────────────────────────┘ │         │
│  │  ℹ️ Auto-generated from name, cannot be edited                │         │
│  │                                                               │         │
│  │  Option (Display Type) *                                     │         │
│  │  ┌─────────────────────────────────────────────────────────┐ │         │
│  │  │  [▼] Dropdown                                            │ │         │
│  │  └─────────────────────────────────────────────────────────┘ │         │
│  │  Options: Dropdown, Radio                                    │         │
│  │                                                               │         │
│  │  Published                                                   │         │
│  │  [Toggle: ON]  Active                                       │         │
│  │                                                               │         │
│  │  [Cancel]                              [Save Change]        │         │
│  └───────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Kết quả:**
- Attribute "SSD" được tạo (ID: AT-0002)
- Tự động chuyển sang: `/admin/attribute/AT-0002` (trang quản lý giá trị)

---

### Bước 4: Admin Thêm Giá Trị Cho SSD

**Admin ở trang:** `/admin/attribute/AT-0002`

**Trang quản lý giá trị:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✨ Attributes > SSD                                                         │
│                                                                             │
│  Attribute: SSD                                                             │
│  ID: AT-0002 | Option: Dropdown | Status: [✅ Active]                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────┐         │
│  │  Attribute Values                              [+ Add Value] │         │
│  │  ─────────────────────────────────────────────────────────────  │         │
│  │                                                                 │         │
│  │  ┌───┬──────────┬──────────┬──────────┬──────┐                │         │
│  │  │ ☐ │  Order   │  Value   │Created On│Action│                │         │
│  │  ├───┼──────────┼──────────┼──────────┼──────┤                │         │
│  │  │ ☐ │    1     │  256GB   │10 Sep 2023│ [✏️]│                │         │
│  │  │   │          │          │          │ [🗑️]│                │         │
│  │  │ ☐ │    2     │  512GB   │10 Sep 2023│ [✏️]│                │         │
│  │  │   │          │          │          │ [🗑️]│                │         │
│  │  │ ☐ │    3     │  1TB     │10 Sep 2023│ [✏️]│                │         │
│  │  │   │          │          │          │ [🗑️]│                │         │
│  │  └───┴──────────┴──────────┴──────────┴──────┘                │         │
│  │                                                                 │         │
│  │  [← Back to List]                    [Edit Attribute]          │         │
│  └───────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Cách thêm giá trị:**
- Thêm "256GB" (Order: 1)
- Thêm "512GB" (Order: 2)
- Thêm "1TB" (Order: 3)

**Kết quả:** SSD có 3 giá trị: 256GB, 512GB, 1TB

---

### Bước 5: Database Structure (Sau Khi Tạo Xong)

#### Bảng `attributes`:
```sql
┌────┬──────────────┬──────────┬──────────┬───────────┬────────────┐
│ id │ attribute_code│  name   │  option  │ published │ created_at │
├────┼──────────────┼──────────┼──────────┼───────────┼────────────┤
│  1 │ AT-0001      │ RAM      │ Dropdown │    1      │ 2023-09-10 │
│  2 │ AT-0002      │ SSD      │ Dropdown │    1      │ 2023-09-10 │
└────┴──────────────┴──────────┴──────────┴───────────┴────────────┘
```

#### Bảng `attribute_values`:
```sql
┌────┬──────────────┬──────────┬──────────────┬────────────┐
│ id │ attribute_id │  value   │ display_order│ created_at │
├────┼──────────────┼──────────┼──────────────┼────────────┤
│  1 │      1       │ 8GB      │      1       │ 2023-09-10 │
│  2 │      1       │ 16GB     │      2       │ 2023-09-10 │
│  3 │      1       │ 32GB     │      3       │ 2023-09-10 │
│  4 │      2       │ 256GB    │      1       │ 2023-09-10 │
│  5 │      2       │ 512GB    │      2       │ 2023-09-10 │
│  6 │      2       │ 1TB      │      3       │ 2023-09-10 │
└────┴──────────────┴──────────┴──────────────┴────────────┘
```

**Giải thích:**
- `attribute_id = 1` → Thuộc Attribute "RAM" (AT-0001)
- `attribute_id = 2` → Thuộc Attribute "SSD" (AT-0002)
- `display_order` → Thứ tự hiển thị (1 = đầu tiên)

---

### Bước 6: Seller Tạo Sản Phẩm Laptop

**Seller vào:** `/seller/products/create`

**Form tạo sản phẩm:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📦 Products > Create New Product                                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Product Name *                                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Dell XPS 15 Laptop                                          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  Category *                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [▼] Laptop                                                  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  Attributes:                                                       │   │
│  │                                                                     │   │
│  │  RAM *                                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [▼] Select RAM                                              │   │   │
│  │  │  ├─────────────────────────────────────────────────────────┤ │   │   │
│  │  │  │  8GB                                                     │ │   │   │
│  │  │  │  16GB                                                    │ │   │   │
│  │  │  │  32GB                                                    │ │   │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  → Seller chọn: 16GB                                               │   │
│  │                                                                     │   │
│  │  SSD *                                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [▼] Select SSD                                              │   │   │
│  │  │  ├─────────────────────────────────────────────────────────┤ │   │   │
│  │  │  │  256GB                                                   │ │   │   │
│  │  │  │  512GB                                                   │ │   │   │
│  │  │  │  1TB                                                     │ │   │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  → Seller chọn: 512GB                                              │   │
│  │                                                                     │   │
│  │  Price *                                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  25,000,000                                                 │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  ₫ (VND)                                                           │   │
│  │                                                                     │   │
│  │  Stock *                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  10                                                          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  items                                                              │   │
│  │                                                                     │   │
│  │  [Cancel]                                    [Save Product]         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Kết quả:**
- Seller chọn: RAM = 16GB, SSD = 512GB
- Click "Save Product"
- Sản phẩm được tạo với 2 attributes đã chọn

---

### Bước 7: Database Sau Khi Seller Tạo Sản Phẩm

#### Bảng `products`:
```sql
┌────┬──────────────────┬──────────────┬────────────┐
│ id │      name        │ category_id  │ created_at │
├────┼──────────────────┼──────────────┼────────────┤
│ 10 │ Dell XPS 15      │      5       │ 2023-09-15 │
└────┴──────────────────┴──────────────┴────────────┘
```

#### Bảng `product_attributes` (Liên kết Product với Attribute + Value):
```sql
┌────┬────────────┬──────────────┬──────────────────┬────────────┐
│ id │ product_id │ attribute_id │ attribute_value_id│ created_at │
├────┼────────────┼──────────────┼──────────────────┼────────────┤
│  1 │     10     │      1       │        2         │ 2023-09-15 │
│  2 │     10     │      2       │        5         │ 2023-09-15 │
└────┴────────────┴──────────────┴──────────────────┴────────────┘
```

**Giải thích:**
- `product_id = 10` → Sản phẩm "Dell XPS 15"
- `attribute_id = 1, attribute_value_id = 2` → RAM = 16GB
  - `attribute_id = 1` → Attribute "RAM" (AT-0001)
  - `attribute_value_id = 2` → Value "16GB" (từ bảng attribute_values)
- `attribute_id = 2, attribute_value_id = 5` → SSD = 512GB
  - `attribute_id = 2` → Attribute "SSD" (AT-0002)
  - `attribute_value_id = 5` → Value "512GB" (từ bảng attribute_values)

---

### Tóm Tắt Workflow:

```
1. Admin tạo Attribute "RAM" (AT-0001)
   ↓
2. Admin thêm Values cho RAM: 8GB, 16GB, 32GB
   ↓
3. Admin tạo Attribute "SSD" (AT-0002)
   ↓
4. Admin thêm Values cho SSD: 256GB, 512GB, 1TB
   ↓
5. Seller tạo sản phẩm Laptop
   ↓
6. Seller chọn RAM = 16GB (từ danh sách Admin tạo)
   ↓
7. Seller chọn SSD = 512GB (từ danh sách Admin tạo)
   ↓
8. Sản phẩm được lưu với 2 attributes đã chọn
```

---

### Lợi Ích Của Cách Làm Này:

1. **Thống nhất**: Tất cả Laptop dùng cùng danh sách RAM/SSD
2. **Dễ quản lý**: Admin thêm/xóa/sửa giá trị một lần, áp dụng cho tất cả sản phẩm
3. **Dễ tìm kiếm**: Khách hàng có thể filter theo RAM = 16GB, SSD = 512GB
4. **Linh hoạt**: Dễ thêm giá trị mới (ví dụ: 64GB RAM, 2TB SSD)
5. **Chuẩn hóa**: Database structure tuân thủ best practices

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 3-4 fields chính, không phức tạp
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features
- ✅ **Tách riêng**: Attributes và Values dễ quản lý
- ✅ **Giống dự án thực tế**: Database structure chuẩn, dễ maintain

**Tổng thời gian ước tính**: 6 tuần (1.5 tháng) với team 5 fresher

---

# 4. 📦 Quản lý sản phẩm (Products Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Status: DRAFT, PENDING, APPROVED, REJECTED
- Chỉ Seller tạo sản phẩm (Admin có thể nhưng ít dùng)
- Admin duyệt sản phẩm (Approve/Reject)
- Admin có quyền sửa/xóa tất cả sản phẩm
- Bỏ Bulk Actions (Phase 2)
- Bỏ Performance metrics (Phase 2)
- Bỏ Content quality check (Phase 2)
- Bỏ Notification (Phase 2)

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm Bulk Actions (Approve/Reject/Delete nhiều sản phẩm)
- Thêm Performance metrics (Impression, Order, Sales)
- Thêm Content quality check
- Thêm Notification cho Seller
- Thêm Lý do reject
- Thêm Status: OUT_OF_STOCK, NEEDS_IMPROVEMENT
- Thêm Lịch sử thay đổi sản phẩm

---

## 🎯 Vai Trò và Quyền của Admin

### Vai Trò Chính:
1. **Quản lý toàn bộ sản phẩm** - Xem tất cả sản phẩm (của tất cả Sellers)
2. **Kiểm duyệt sản phẩm** - Duyệt/Reject sản phẩm do Seller tạo
3. **Đảm bảo chất lượng** - Sửa/xóa sản phẩm vi phạm

### Quyền Cụ Thể:

#### ✅ Quyền 1: Xem (View) - Full Access
- Xem tất cả sản phẩm (của tất cả Sellers)
- Xem chi tiết sản phẩm
- Xem thống kê sản phẩm (theo category, seller, status)
- Filter theo status (DRAFT, PENDING, APPROVED, REJECTED)

#### ⚠️ Quyền 2: Tạo (Create) - Optional
- Admin CÓ THỂ tạo sản phẩm (nhưng thường không cần)
- Thường chỉ Seller tạo sản phẩm
- Nếu Admin tạo → Status: APPROVED (tự động)

#### ✅ Quyền 3: Sửa (Edit) - Full Access
- Sửa BẤT KỲ sản phẩm nào (của bất kỳ Seller nào)
- Sửa tất cả fields: Name, Price, Description, Images, Attributes, etc.
- Không cần permission từ Seller

#### ✅ Quyền 4: Xóa (Delete) - Full Access
- Xóa BẤT KỲ sản phẩm nào (của bất kỳ Seller nào)
- Có confirmation dialog
- Soft delete (ẩn thay vì xóa vĩnh viễn) - Phase 2

#### ✅ Quyền 5: Duyệt/Reject (Approve/Reject) - Quyền quan trọng nhất
- Approve sản phẩm chờ duyệt (PENDING → APPROVED)
- Reject sản phẩm (PENDING → REJECTED)
- Lý do reject (Phase 2)
- Bulk Approve/Reject (Phase 2)

#### ✅ Quyền 6: Thay đổi Status - Full Control
- Thay đổi status bất kỳ sản phẩm nào:
  - APPROVED → HIDDEN (ẩn sản phẩm)
  - HIDDEN → APPROVED (hiển thị lại)
  - APPROVED → REJECTED (nếu vi phạm sau khi approve)

---

## 🔄 Workflow Products trong Marketplace

### Scenario 1: Seller Tạo Sản Phẩm Mới

```
1. Seller vào: /seller/products/create
2. Seller nhập thông tin sản phẩm
3. Seller click "Save as Draft"
   → Status: DRAFT
   → Seller có thể sửa/xóa
   → Sản phẩm CHƯA hiển thị trên website

4. Seller click "Submit for Approval"
   → Status: PENDING (chờ duyệt)
   → Seller không thể sửa (chờ Admin)
   → Sản phẩm CHƯA hiển thị trên website

5. Admin vào: /admin/products?status=pending
6. Admin xem danh sách sản phẩm chờ duyệt
7. Admin click "View" để xem chi tiết
8. Admin quyết định:
   - Approve → Status: APPROVED → Hiển thị trên website
   - Reject → Status: REJECTED → Không hiển thị
```

### Scenario 2: Admin Sửa Sản Phẩm Vi Phạm

```
1. Admin vào: /admin/products
2. Admin thấy sản phẩm có vấn đề (ví dụ: giá sai, mô tả sai)
3. Admin click "Edit"
4. Admin sửa thông tin
5. Admin click "Save"
   → Sản phẩm được cập nhật
   → Status không đổi (giữ nguyên)
```

### Scenario 3: Admin Xóa Sản Phẩm Vi Phạm

```
1. Admin vào: /admin/products
2. Admin thấy sản phẩm vi phạm nghiêm trọng
3. Admin click "Delete"
4. Confirm dialog: "Are you sure? This will delete the product."
5. Admin click "Delete"
   → Sản phẩm bị xóa
```

### Scenario 4: Admin Ẩn/Hiện Sản Phẩm

```
1. Admin vào: /admin/products
2. Admin thấy sản phẩm APPROVED cần ẩn tạm thời
3. Admin click "Change Status" → "Hide"
   → Status: HIDDEN (hoặc thêm field is_active = false)
   → Sản phẩm không hiển thị trên website
4. Admin có thể "Show" lại bất cứ lúc nào
```

---

## 🎨 LAYOUT CHI TIẾT - PRODUCTS

### 📋 1. Product List Page (`/admin/products`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📦 Products                                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search products...  [Status: ▼ All]  [Category: ▼ All]     │   │
│  │  [Seller: ▼ All]  [+ Add Product]                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Status Filters:                                                    │   │
│  │  [All] [Pending (5)] [Approved (17)] [Rejected (3)] [Draft (2)]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📦 All Product List                            [X products]       │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │  Image   │  Product Name        │  Seller  │  Price   │  Stock   │  Status  │Created On│Action│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Tai nghe Wireless   │ Shop ABC │ 850,000₫│   50     │ [⏳]     │10 Sep 2023│ [👁️]│ │
│  │  │   │  64x64   │  Pro                 │          │          │          │ Pending  │          │ [✏️]│ │
│  │  │   │          │                      │          │          │          │          │          │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Đồng hồ thông minh  │ Shop XYZ │1,200,000₫│   30     │ [✅]     │15 Sep 2023│ [👁️]│ │
│  │  │   │  64x64   │  S4                  │          │          │          │ Approved │          │ [✏️]│ │
│  │  │   │          │                      │          │          │          │          │          │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Giày thể thao       │ Shop ABC │ 650,000₫ │   25     │ [❌]     │20 Sep 2023│ [👁️]│ │
│  │  │   │  64x64   │  Hunter              │          │          │          │ Rejected │          │ [✏️]│ │
│  │  │   │          │                      │          │          │          │          │          │ [🗑️]│ │
│  │  └───┴──────────┴──────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-10 of 27 products  [< Prev] [1] [2] [3] [Next >]  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Products                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search products...                              │ │
│  │  [Status: ▼ All] [Category: ▼ All] [Seller: ▼ All]   │ │
│  │  [+ Add Product]                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Status Filters:**
```
[All] [Pending (5)] [Approved (17)] [Rejected (3)] [Draft (2)]
```

**Table Columns (9 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Image** - 64x64px thumbnail, rounded - Hiển thị ảnh sản phẩm
3. **Product Name** - Tên sản phẩm, có thể truncate nếu dài
4. **Seller** - Tên shop/seller (link đến seller profile)
5. **Price** - Giá sản phẩm (format: 850,000₫)
6. **Stock** - Số lượng tồn kho
7. **Status** - Badge màu:
   - `[⏳ Pending]` - Yellow badge (chờ duyệt)
   - `[✅ Approved]` - Green badge (đã duyệt, hiển thị)
   - `[❌ Rejected]` - Red badge (bị reject)
   - `[📝 Draft]` - Grey badge (chưa submit)
8. **Created On** - Ngày tạo (format: DD MMM YYYY)
9. **Actions** - Icons: `[👁️ View] [✏️ Edit] [🗑️ Delete]`

**Pagination:**
```
Showing 1-10 of 27 products    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo tên sản phẩm, SKU
- Filter: Theo Status, Category, Seller
- Status Filters: Quick filter bằng tabs
- Pagination: 10 items/page
- View: Navigate to Product Details
- Edit: Navigate to Edit Product
- Delete: Xóa sản phẩm (với confirmation)

---

### 📋 2. Pending Products Page (`/admin/products?status=pending`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📦 Products > Pending                                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search products...  [Category: ▼ All]  [Seller: ▼ All]       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⏳ Products Pending Approval                    [5 products]        │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────────────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │  Image   │  Product Name        │  Seller  │  Price   │  Stock   │Created On│Action│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Tai nghe Wireless   │ Shop ABC │ 850,000₫│   50     │10 Sep 2023│ [👁️]│ │
│  │  │   │  64x64   │  Pro                 │          │          │          │          │ [✅]│ │
│  │  │   │          │                      │          │          │          │          │ [❌]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [IMG]   │  Đồng hồ thông minh  │ Shop XYZ │1,200,000₫│   30     │15 Sep 2023│ [👁️]│ │
│  │  │   │  64x64   │  S4                  │          │          │          │          │ [✅]│ │
│  │  │   │          │                      │          │          │          │          │ [❌]│ │
│  │  └───┴──────────┴──────────────────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-5 of 5 products    [< Prev] [1] [Next >]          │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Khác biệt với All Products:**
- Chỉ hiển thị sản phẩm có Status = PENDING
- Actions: `[👁️ View] [✅ Approve] [❌ Reject]` (thay vì Edit/Delete)
- Title: "Products Pending Approval"
- Badge count: "X products" (số sản phẩm chờ duyệt)

**Actions:**
- **View**: Xem chi tiết sản phẩm trước khi duyệt
- **Approve**: Duyệt sản phẩm → Status: APPROVED
- **Reject**: Reject sản phẩm → Status: REJECTED

---

### 👁️ 3. Product View/Details (`/admin/products/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📦 Products > Tai nghe Wireless Pro                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Product Information                                                │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  [Product Image: 400x400]                                    │ │   │
│  │  │  Tai nghe Wireless Pro                                        │ │   │
│  │  │  Status: [⏳ Pending]                                         │ │   │
│  │  │  Seller: Shop ABC                                             │ │   │
│  │  │  Price: 850,000₫                                              │ │   │
│  │  │  Stock: 50 items                                              │ │   │
│  │  │  Category: Electronics                                        │ │   │
│  │  │  Created: 10 Sep 2023                                         │ │   │
│  │  │                                                               │ │   │
│  │  │  Description:                                                 │ │   │
│  │  │  Tai nghe không dây chất lượng cao, pin 30 giờ...            │ │   │
│  │  │                                                               │ │   │
│  │  │  Attributes:                                                  │ │   │
│  │  │  - Brand: Nike                                                │ │   │
│  │  │  - Color: Black                                               │ │   │
│  │  │  - Size: M                                                    │ │   │
│  │  │                                                               │ │   │
│  │  │  [Edit] [Delete] [Approve] [Reject]                          │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Product Information:**
- Product Image (large preview)
  - Product Name
- Status badge
- Seller name (link to seller profile)
- Price, Stock, Category
- Created date
  - Description
- Attributes (Brand, Color, Size, etc.)

**Actions:**
- **Edit**: Navigate to Edit Product
- **Delete**: Xóa sản phẩm (với confirmation)
- **Approve**: Duyệt sản phẩm (nếu Status = PENDING)
- **Reject**: Reject sản phẩm (nếu Status = PENDING)

---

### ✏️ 4. Product Edit Form (`/admin/products/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📦 Products > Edit Product > Tai nghe Wireless Pro                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Edit Product                                                       │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Product Information (Read-only)                             │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Product ID: PRD-0001                                   │ │ │   │
│  │  │  │  Seller: Shop ABC                                        │ │ │   │
│  │  │  │  Status: Pending                                         │ │ │   │
│  │  │  │  Created At: 10 Sep 2023                                 │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Product Name *                                              │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Tai nghe Wireless Pro                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Description *                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Tai nghe không dây chất lượng cao...                  │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  (Textarea - 5 rows, pre-filled)                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Price *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  850000                                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ₫ (VND)                                                     │ │   │
│  │  │                                                               │ │   │
│  │  │  Stock *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  50                                                     │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  items                                                       │ │   │
│  │  │                                                               │ │   │
│  │  │  Category *                                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Electronics                                         │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Attributes:                                                 │ │   │
│  │  │  Brand *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Nike                                                │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Color *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Black                                               │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Product Images *                                            │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Current Images]                                       │ │ │   │
│  │  │  │  [IMG1] [IMG2] [IMG3] [IMG4]                            │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  [📷 Add More Images]                                   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Pending                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Pending, Approved, Rejected, Draft                │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                            [Save Changes]    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Product Information (Read-only)**
- Product ID: Mã sản phẩm (read-only)
- Seller: Tên shop/seller (read-only)
- Status: Status hiện tại (read-only, nhưng có thể thay đổi ở field Status)
- Created At: Ngày tạo (read-only)

**2. Product Name** - Required, editable
**3. Description** - Required, editable
**4. Price** - Required, editable
**5. Stock** - Required, editable
**6. Category** - Required, editable (dropdown)
**7. Attributes** - Required, editable (dropdowns)
**8. Product Images** - Required, editable (upload multiple)
**9. Status** - Editable (dropdown: Pending, Approved, Rejected, Draft)

**10. Buttons**
- Cancel: Link back to `/admin/products`
- Save Changes: Submit form, update product

---

### ✅ 5. Approve Product (Từ List hoặc Details)

**Từ List:**
```
Click "Approve" button
→ Confirm Dialog:
┌──────────────────────────────────────────────┐
│  Approve Product                    [X]      │
├──────────────────────────────────────────────┤
│                                              │
│  Are you sure you want to approve this       │
│  product?                                    │
│                                              │
│  Product: Tai nghe Wireless Pro             │
│  Seller: Shop ABC                           │
│  Price: 850,000₫                            │
│                                              │
│  [Cancel]                    [Approve]       │
│                                              │
└──────────────────────────────────────────────┘

→ Click "Approve"
→ API: PUT /api/admin/products/:id/approve
→ Status: APPROVED
→ Refresh table
```

**Từ Details:**
```
Click "Approve" button
→ Same confirm dialog
→ Approve → Redirect to List
```

---

### ❌ 6. Reject Product (Từ List hoặc Details)

**Từ List:**
```
Click "Reject" button
→ Modal hiện ra:
┌──────────────────────────────────────────────┐
│  Reject Product                     [X]      │
├──────────────────────────────────────────────┤
│                                              │
│  Product: Tai nghe Wireless Pro             │
│  Seller: Shop ABC                           │
│  Price: 850,000₫                            │
│                                              │
│  Reason for rejection (Optional)             │
│  ┌────────────────────────────────────────┐ │
│  │  Product image quality is too low...   │ │
│  │                                         │ │
│  │  (Textarea - 3 rows)                   │ │
│  └────────────────────────────────────────┘ │
│  ℹ️ This will be sent to the seller (Phase 2)│
│                                              │
│  [Cancel]                    [Reject]        │
│                                              │
└──────────────────────────────────────────────┘

→ Click "Reject"
→ API: PUT /api/admin/products/:id/reject
→ Status: REJECTED
→ Refresh table
```

**Note:** Phase 1 có thể bỏ "Reason for rejection" (để đơn giản)

---

## 📱 Responsive Design (Mobile)

**Product List (Mobile):**
```
┌─────────────────────────────┐
│  Products        [+ Add]    │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Status: ▼ All]            │
│  [Category: ▼ All]          │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  [IMG]                │ │
│  │  Tai nghe Wireless    │ │
│  │  Shop ABC             │ │
│  │  850,000₫ | Stock: 50 │ │
│  │  [⏳ Pending]         │ │
│  │  10 Sep 2023          │ │
│  │  [View] [Edit] [Delete]│ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Approved status
- **Warning**: Yellow (#ffc107) - Pending status
- **Danger**: Red (#dc3545) - Rejected status
- **Grey**: #6c757d - Draft status
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Heading**: Bold, 18px
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (table cell)
- **Margin**: 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Search: 🔍
- Add: ➕
- Checkbox: ☐ / ☑
- Status: ⏳ (Pending), ✅ (Approved), ❌ (Rejected), 📝 (Draft)
- Actions: 👁️ (View), ✏️ (Edit), 🗑️ (Delete), ✅ (Approve), ❌ (Reject)

---

## 📝 Implementation Notes

### State Management:
```typescript
// Product List State
{
  products: Product[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected' | 'draft',
  categoryFilter: string | null,
  sellerFilter: string | null,
  page: number,
  totalPages: number
}

// Product Form State (Edit)
{
  id: string,
  sellerId: string,      // Read-only
  name: string,
  description: string,
  price: number,
  stock: number,
  categoryId: string,
  attributes: Record<string, string>,  // { brand: 'Nike', color: 'Black' }
  images: File[] | string[],  // Files (new) or URLs (existing)
  status: 'draft' | 'pending' | 'approved' | 'rejected',
  createdAt: string,     // Read-only
  loading: boolean,
  errors: Record<string, string>
}
```

### API Calls:
- `GET /api/admin/products?page=1&status=all&category=...&seller=...&search=...`
- `GET /api/admin/products/:id` (chi tiết sản phẩm)
- `PUT /api/admin/products/:id` (update sản phẩm)
- `DELETE /api/admin/products/:id` (delete sản phẩm)
- `PUT /api/admin/products/:id/approve` (approve sản phẩm)
- `PUT /api/admin/products/:id/reject` (reject sản phẩm, body: { reason?: string })

**Note**: 
- Approve/Reject chỉ áp dụng cho sản phẩm có Status = PENDING
- Admin có thể thay đổi Status trực tiếp trong Edit form

### Validation Rules:
- **Product Name**: Required, 3-200 characters
- **Description**: Required, 10-2000 characters
- **Price**: Required, > 0, number
- **Stock**: Required, >= 0, integer
- **Category**: Required
- **Attributes**: Required (tùy category)
- **Images**: Required, min 1 image, max 10 images, max 5MB/image
- **Status**: Required, 'draft' | 'pending' | 'approved' | 'rejected'

### Status Workflow:
```
DRAFT → PENDING (Seller submit)
PENDING → APPROVED (Admin approve)
PENDING → REJECTED (Admin reject)
REJECTED → PENDING (Seller sửa và submit lại)
APPROVED → HIDDEN (Admin ẩn, Phase 2)
HIDDEN → APPROVED (Admin hiện lại, Phase 2)
```

---

## 🔄 Workflow Chi Tiết

### Create Product (Seller):
1. Seller vào `/seller/products/create`
2. Seller nhập thông tin sản phẩm
3. Seller click "Save as Draft"
   → Status: DRAFT
   → Seller có thể sửa/xóa
4. Seller click "Submit for Approval"
   → Status: PENDING
   → Seller không thể sửa (chờ Admin)

### Approve Product (Admin):
1. Admin vào `/admin/products?status=pending`
2. Admin xem danh sách sản phẩm chờ duyệt
3. Admin click "View" để xem chi tiết (optional)
4. Admin click "Approve"
5. Confirm dialog → Click "Approve"
6. API: `PUT /api/admin/products/:id/approve`
7. Status: APPROVED
8. Sản phẩm hiển thị trên website
9. Refresh table

### Reject Product (Admin):
1. Admin vào `/admin/products?status=pending`
2. Admin xem danh sách sản phẩm chờ duyệt
3. Admin click "Reject"
4. Modal hiện ra (có thể nhập lý do - Phase 2)
5. Click "Reject"
6. API: `PUT /api/admin/products/:id/reject`
7. Status: REJECTED
8. Sản phẩm không hiển thị trên website
9. Refresh table

### Edit Product (Admin):
1. Admin vào `/admin/products`
2. Admin click "Edit" (bất kỳ sản phẩm nào)
3. Form hiển thị (pre-filled)
4. Admin sửa thông tin cần thiết
5. Admin có thể thay đổi Status (nếu cần)
6. Click "Save Changes"
7. API: `PUT /api/admin/products/:id`
8. Product được cập nhật
9. Redirect to List

### Delete Product (Admin):
1. Admin vào `/admin/products`
2. Admin click "Delete"
3. Confirm dialog: "Are you sure? This will delete the product."
4. Click "Delete"
5. API: `DELETE /api/admin/products/:id`
6. Product bị xóa
7. Refresh table

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(50) UNIQUE NOT NULL,  -- ID hiển thị (ví dụ: PRD-0001)
    seller_id BIGINT NOT NULL,                  -- Seller tạo sản phẩm
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',         -- DRAFT, PENDING, APPROVED, REJECTED
    reject_reason TEXT,                         -- Lý do reject (Phase 2)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_seller_id (seller_id),
    INDEX idx_category_id (category_id),
    INDEX idx_product_code (product_code)
);

CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

CREATE TABLE product_attributes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    attribute_value_id BIGINT,              -- NULL nếu data_type = TEXT/NUMBER
    text_value VARCHAR(500),                -- Giá trị text (cho TEXT/NUMBER)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_attribute (product_id, attribute_id)
);
```

**Note**: 
- `status`: DRAFT, PENDING, APPROVED, REJECTED (Phase 1)
- `reject_reason`: Optional, có thể bỏ Phase 1
- `product_code`: Auto-generate sequential (PRD-0001, PRD-0002...)

---

## ✅ Checklist Implementation

### Product List (1 fresher - 2 tuần):
- [ ] Tạo table component với 9 cột
- [ ] Fetch data từ API
- [ ] Hiển thị data trong table
- [ ] Search by name, SKU
- [ ] Filter by status (tabs)
- [ ] Filter by category, seller
- [ ] Pagination (10 items/page)
- [ ] Badge count cho mỗi status
- [ ] View button (navigate to details)
- [ ] Edit button (navigate to edit)
- [ ] Delete button (with confirmation)
- [ ] Loading state
- [ ] Error handling

### Pending Products Page (1 fresher - 1 tuần):
- [ ] Filter chỉ hiển thị PENDING
- [ ] Approve button (với confirm dialog)
- [ ] Reject button (với modal - có thể bỏ lý do Phase 1)
- [ ] API calls: approve/reject
- [ ] Refresh table sau khi approve/reject
- [ ] Loading state
- [ ] Error handling

### Product View/Details (1 fresher - 1 tuần):
- [ ] Hiển thị thông tin sản phẩm
- [ ] Hiển thị images (gallery)
- [ ] Hiển thị attributes
- [ ] Actions: Edit, Delete, Approve, Reject
- [ ] Loading state
- [ ] Error handling

### Product Edit Form (1 fresher - 2 tuần):
- [ ] Tạo form với tất cả fields
- [ ] Product Information section (read-only)
- [ ] Pre-fill data từ API
- [ ] Upload images (multiple)
- [ ] Select category (dropdown)
- [ ] Select attributes (dynamic dropdowns)
- [ ] Status dropdown (editable)
- [ ] Validation
- [ ] Submit update (API call)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Backend API (2 fresher - 2 tuần):
- [ ] GET /api/admin/products (list với filters)
- [ ] GET /api/admin/products/:id (detail)
- [ ] PUT /api/admin/products/:id (update)
- [ ] DELETE /api/admin/products/:id (delete)
- [ ] PUT /api/admin/products/:id/approve (approve)
- [ ] PUT /api/admin/products/:id/reject (reject)
- [ ] File upload handling (images)
- [ ] Validation (price, stock, etc.)
- [ ] Status workflow validation
- [ ] Error responses

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test validation
- [ ] Test approve/reject workflow
- [ ] Test status changes
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1-2: Product List
- Table component
- Search, Filter, Pagination
- Status filters (tabs)
- Actions (View, Edit, Delete)

### Tuần 3: Pending Products Page
- Filter PENDING
- Approve/Reject buttons
- Confirm dialogs

### Tuần 4: Product View/Details
- Detail page
- Image gallery
- Actions

### Tuần 5-6: Product Edit Form
- Form component
- Image upload (multiple)
- Attributes selection
- Status dropdown
- Validation

### Tuần 7-8: Backend API
- CRUD endpoints
- Approve/Reject endpoints
- File upload
- Validation
- Status workflow

### Tuần 9: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **Status Workflow**: DRAFT → PENDING → APPROVED/REJECTED
2. **Chỉ Seller tạo**: Admin có thể nhưng ít dùng
3. **Admin full access**: Có thể sửa/xóa bất kỳ sản phẩm nào
4. **Approve/Reject**: Chỉ áp dụng cho PENDING
5. **Bulk Actions**: Bỏ Phase 1 (Phase 2)
6. **Notification**: Bỏ Phase 1 (Phase 2)

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Bulk Approve/Reject
- [ ] Bulk Delete
- [ ] Export sản phẩm
- [ ] Performance metrics (Impression, Order, Sales)
- [ ] Content quality check
- [ ] Notification cho Seller
- [ ] Lý do reject (bắt buộc)
- [ ] Status: OUT_OF_STOCK, NEEDS_IMPROVEMENT
- [ ] Lịch sử thay đổi sản phẩm
- [ ] Soft delete (ẩn thay vì xóa vĩnh viễn)

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 4 status chính, workflow rõ ràng
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features
- ✅ **Tuân thủ workflow**: DRAFT → PENDING → APPROVED/REJECTED

**Tổng thời gian ước tính**: 9 tuần (2.25 tháng) với team 5 fresher

---

# 5. 👥 Quản lý khách hàng (Customer Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Customer List với thông tin cơ bản
- Customer Details (Profile, Information, Order History)
- Chỉ Admin xem/sửa customer
- Bỏ Summary Cards (Phase 2)
- Bỏ Analytics (Phase 2)
- Bỏ Send Message (Phase 2)
- Bỏ Invoice-related (không phù hợp marketplace)

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm Summary Cards (All Customers, Orders, Revenue)
- Thêm Analytics button
- Thêm Send Message button
- Thêm Customer Activity Log
- Thêm Export customers
- Thêm Bulk Actions (Block/Unblock nhiều customers)
- Thêm Customer Segmentation

---

## 🎯 Vai Trò và Quyền của Admin

### Vai Trò Chính:
1. **Quản lý khách hàng** - Xem tất cả customers
2. **Xem thông tin chi tiết** - Profile, Orders, Addresses
3. **Quản lý trạng thái** - Block/Unblock customers

### Quyền Cụ Thể:

#### ✅ Quyền 1: Xem (View) - Full Access
- Xem tất cả customers
- Xem chi tiết customer (Profile, Orders, Addresses)
- Xem Order History của customer
- Filter theo Status, Search

#### ✅ Quyền 2: Sửa (Edit) - Full Access
- Sửa thông tin customer (Email, Phone, Address)
- Thay đổi Status (Active/Blocked)

#### ✅ Quyền 3: Block/Unblock - Full Access
- Block customer (không cho đăng nhập, mua hàng)
- Unblock customer (khôi phục quyền)

#### ⚠️ Quyền 4: Xóa (Delete) - Optional
- Xóa customer (soft delete - Phase 2)
- Thường không cần xóa, chỉ block

---

## 🎨 LAYOUT CHI TIẾT - CUSTOMERS

### 📋 1. Customer List Page (`/admin/customers`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  👥 Customers                                                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search customers...  [Status: ▼ All]  [Export]              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  👥 All Customer List                            [X customers]     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │  Avatar │  Customer Name        │  Email   │  Phone   │Total Orders│Total Spent│ Status  │Action│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [👤]   │  Nguyễn Văn A         │abc@email │0901234567│    15     │ 2,500,000₫│ [✅]     │ [👁️]│ │
│  │  │   │  64x64   │                       │          │          │          │          │ Active   │ [✏️]│ │
│  │  │   │          │                       │          │          │          │          │          │ [🚫]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [👤]   │  Trần Thị B           │xyz@email │0987654321│     8     │ 1,200,000₫│ [✅]     │ [👁️]│ │
│  │  │   │  64x64   │                       │          │          │          │          │ Active   │ [✏️]│ │
│  │  │   │          │                       │          │          │          │          │          │ [🚫]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │  [👤]   │  Lê Văn C             │def@email │0912345678│     0     │     0₫   │ [❌]     │ [👁️]│ │
│  │  │   │  64x64   │                       │          │          │          │          │ Blocked  │ [✏️]│ │
│  │  │   │          │                       │          │          │          │          │          │ [🔓]│ │
│  │  └───┴──────────┴──────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-10 of 125 customers  [< Prev] [1] [2] [3] [Next >] │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Customers                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search customers...                            │ │
│  │  [Status: ▼ All] [Active] [Blocked]                  │ │
│  │  [Export]                                             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (9 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Avatar** - 64x64px circular avatar, default icon nếu không có ảnh
3. **Customer Name** - Tên customer, có thể truncate nếu dài
4. **Email** - Email đăng ký
5. **Phone** - Số điện thoại
6. **Total Orders** - Số đơn hàng đã mua (auto tính)
7. **Total Spent** - Tổng tiền đã chi (format: 2,500,000₫)
8. **Status** - Badge màu:
   - `[✅ Active]` - Green badge (đang hoạt động)
   - `[❌ Blocked]` - Red badge (bị chặn)
9. **Actions** - Icons:
   - `[👁️ View]` - Xem chi tiết
   - `[✏️ Edit]` - Sửa thông tin
   - `[🚫 Block]` - Chặn customer (nếu Active)
   - `[🔓 Unblock]` - Bỏ chặn (nếu Blocked)

**Pagination:**
```
Showing 1-10 of 125 customers    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo tên, email, phone
- Filter: Theo Status (All/Active/Blocked)
- Badge count: "X customers"
- Pagination: 10 items/page
- View: Navigate to Customer Details
- Edit: Navigate to Edit Customer
- Block/Unblock: Thay đổi status ngay từ list

---

### 👁️ 2. Customer Details Page (`/admin/customers/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  👥 Customers > Nguyễn Văn A                                                 │
│                                                                             │
│  ┌──────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │                          │  │                                          │ │
│  │  Customer Profile        │  │  Order History                           │ │
│  │  ┌────────────────────┐  │  │  ─────────────────────────────────────  │ │
│  │  │  [Avatar: 120x120] │  │  │                                          │ │
│  │  │  Nguyễn Văn A      │  │  │  ┌───┬──────────┬──────────┬──────────┬──────────┐ │ │
│  │  │  [✅] Active       │  │  │  │ ☐ │Order ID  │  Amount  │  Status  │Created On│ │ │
│  │  │                    │  │  │  ├───┼──────────┼──────────┼──────────┼──────────┤ │ │
│  │  │  Email:            │  │  │  │ ☐ │#ORD-0001 │850,000₫ │ [✅]     │10 Sep 2023│ │ │
│  │  │  abc@email.com     │  │  │  │   │          │          │ Completed│          │ │ │
│  │  │                    │  │  │  │ ☐ │#ORD-0002 │1,200,000₫│ [✅]     │15 Sep 2023│ │ │
│  │  │  Phone:            │  │  │  │   │          │          │ Completed│          │ │ │
│  │  │  0901234567        │  │  │  │ ☐ │#ORD-0003 │650,000₫ │ [⏳]     │20 Sep 2023│ │ │
│  │  │                    │  │  │  │   │          │          │ Pending │          │ │ │
│  │  │  [Edit] [Block]    │  │  │  └───┴──────────┴──────────┴──────────┴──────────┘ │ │
│  │  └────────────────────┘  │  │                                          │ │
│  │                          │  │  ┌──────────────────────────────────────┐ │ │
│  │  Customer Information    │  │  │  Showing 1-3 of 15 orders          │ │ │
│  │  ──────────────────────  │  │  │  [< Prev] [1] [2] [Next >]        │ │ │
│  │                          │  │  └──────────────────────────────────────┘ │ │
│  │  Account ID:             │  │                                          │ │
│  │  #AC-0001                │  │  [View All Orders]                      │ │
│  │                          │  │                                          │ │
│  │  Registered At:          │  │  Statistics                                │ │
│  │  15 Jan 2023             │  │  ─────────────────────────────────────  │ │
│  │                          │  │                                          │ │
│  │  Status:                 │  │  Total Orders: 15                         │ │
│  │  [✅] Active             │  │  Total Spent: 2,500,000₫                │ │
│  │                          │  │  Average Order: 166,667₫                │ │
│  │                          │  │  Last Order: 20 Sep 2023                  │ │
│  │  Delivery Addresses      │  │                                          │ │
│  │  ──────────────────────  │  │                                          │ │
│  │                          │  │                                          │ │
│  │  1. 123 Đường ABC        │  │                                          │ │
│  │     Quận 1, TP.HCM       │  │                                          │ │
│  │     [Default] [Edit]     │  │                                          │ │
│  │                          │  │                                          │ │
│  │  2. 456 Đường XYZ        │  │                                          │ │
│  │     Quận 2, TP.HCM       │  │                                          │ │
│  │     [Edit] [Delete]      │  │                                          │ │
│  │                          │  │                                          │ │
│  │  [+ Add Address]         │  │                                          │ │
│  │                          │  │                                          │ │
│  └──────────────────────────┘  └────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Left Panel - Customer Profile:**
- **Avatar**: 120x120px circular, default icon nếu không có
- **Name**: Tên customer
- **Status Badge**: Active/Blocked
- **Email**: Email đăng ký
- **Phone**: Số điện thoại
- **Actions**: `[Edit] [Block]` hoặc `[Edit] [Unblock]`

**Left Panel - Customer Information:**
- **Account ID**: Mã customer (ví dụ: #AC-0001)
- **Registered At**: Ngày đăng ký (format: DD MMM YYYY)
- **Status**: Active/Blocked (badge)

**Left Panel - Delivery Addresses:**
- Danh sách địa chỉ giao hàng
- Mỗi địa chỉ có:
  - Địa chỉ đầy đủ
  - `[Default]` badge nếu là địa chỉ mặc định
  - `[Edit] [Delete]` buttons
- `[+ Add Address]` button để thêm địa chỉ mới

**Right Panel - Order History:**
- **Table Columns**:
  1. Checkbox (☐)
  2. Order ID (ví dụ: #ORD-0001)
  3. Amount (format: 850,000₫)
  4. Status (Completed, Pending, Cancelled)
  5. Created On (format: DD MMM YYYY)
- **Pagination**: 10 orders/page
- **View All Orders**: Link đến trang danh sách đơn hàng của customer

**Right Panel - Statistics:**
- **Total Orders**: Tổng số đơn hàng
- **Total Spent**: Tổng tiền đã chi
- **Average Order**: Giá trị đơn hàng trung bình
- **Last Order**: Ngày đơn hàng gần nhất

---

### ✏️ 3. Customer Edit Form (`/admin/customers/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  👥 Customers > Edit Customer > Nguyễn Văn A                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Edit Customer                                                      │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Customer Information (Read-only)                            │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Account ID: #AC-0001                                  │ │ │   │
│  │  │  │  Registered At: 15 Jan 2023                             │ │ │   │
│  │  │  │  Total Orders: 15 orders                                │ │ │   │
│  │  │  │  Total Spent: 2,500,000₫                                │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Full Name *                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Nguyễn Văn A                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Email *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  abc@email.com                                           │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Phone *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  0901234567                                              │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Active                                             │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Active, Blocked                                   │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                            [Save Changes]    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Customer Information (Read-only)**
- Account ID: Mã customer (read-only)
- Registered At: Ngày đăng ký (read-only)
- Total Orders: Số đơn hàng (read-only, auto tính)
- Total Spent: Tổng tiền đã chi (read-only, auto tính)

**2. Full Name** - Required, editable
**3. Email** - Required, editable, unique
**4. Phone** - Required, editable
**5. Status** - Editable (dropdown: Active, Blocked)

**6. Buttons**
- Cancel: Link back to `/admin/customers/[id]`
- Save Changes: Submit form, update customer

---

## 📱 Responsive Design (Mobile)

**Customer List (Mobile):**
```
┌─────────────────────────────┐
│  Customers                  │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Status: ▼ All]            │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  [👤]                 │ │
│  │  Nguyễn Văn A         │ │
│  │  abc@email.com        │ │
│  │  0901234567           │ │
│  │  15 orders | 2.5M₫    │ │
│  │  [✅ Active]          │ │
│  │  [View] [Edit] [Block]│ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Active status
- **Danger**: Red (#dc3545) - Blocked status
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Heading**: Bold, 18px
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (table cell)
- **Margin**: 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Search: 🔍
- Customer: 👥
- Avatar: 👤
- Status: ✅ (Active), ❌ (Blocked)
- Actions: 👁️ (View), ✏️ (Edit), 🚫 (Block), 🔓 (Unblock)

---

## 📝 Implementation Notes

### State Management:
```typescript
// Customer List State
{
  customers: Customer[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'active' | 'blocked',
  page: number,
  totalPages: number
}

// Customer Details State
{
  customer: Customer | null,
  orders: Order[],
  addresses: Address[],
  statistics: {
    totalOrders: number,
    totalSpent: number,
    averageOrder: number,
    lastOrder: string
  },
  loading: boolean,
  error: string | null
}

// Customer Form State (Edit)
{
  id: string,
  accountId: string,      // Read-only
  fullName: string,
  email: string,
  phone: string,
  status: 'active' | 'blocked',
  registeredAt: string,   // Read-only
  totalOrders: number,   // Read-only
  totalSpent: number,    // Read-only
  loading: boolean,
  errors: Record<string, string>
}
```

### API Calls:
- `GET /api/admin/customers?page=1&status=all&search=...`
- `GET /api/admin/customers/:id` (chi tiết customer)
- `PUT /api/admin/customers/:id` (update customer)
- `PUT /api/admin/customers/:id/block` (block customer)
- `PUT /api/admin/customers/:id/unblock` (unblock customer)
- `GET /api/admin/customers/:id/orders` (danh sách đơn hàng)
- `GET /api/admin/customers/:id/addresses` (danh sách địa chỉ)

**Note**: 
- Block/Unblock có thể làm qua API riêng hoặc update status trong Edit form
- Total Orders, Total Spent được tính từ database (aggregate)

### Validation Rules:
- **Full Name**: Required, 2-100 characters
- **Email**: Required, valid email format, unique
- **Phone**: Required, valid phone format (10-11 digits)
- **Status**: Required, 'active' | 'blocked'

### Block/Unblock Logic:
```typescript
// Block Customer
async function blockCustomer(customerId: string) {
  // Update status to 'blocked'
  await db.customers.update(customerId, { status: 'blocked' });
  
  // Optional: Invalidate customer's session/token
  // Optional: Send notification to customer
}

// Unblock Customer
async function unblockCustomer(customerId: string) {
  // Update status to 'active'
  await db.customers.update(customerId, { status: 'active' });
  
  // Optional: Send notification to customer
}
```

---

## 🔄 Workflow Chi Tiết

### View Customer:
1. Admin vào `/admin/customers`
2. Admin click "View" icon
3. Navigate to `/admin/customers/[id]`
4. Hiển thị Customer Details (Profile, Information, Order History)

### Edit Customer:
1. Admin vào `/admin/customers/[id]`
2. Admin click "Edit" button
3. Navigate to `/admin/customers/[id]/edit`
4. Form hiển thị (pre-filled)
5. Admin sửa thông tin (Name, Email, Phone, Status)
6. Click "Save Changes"
7. API: `PUT /api/admin/customers/:id`
8. Customer được cập nhật
9. Redirect to Customer Details

### Block Customer:
1. Admin vào `/admin/customers`
2. Admin click "Block" icon (hoặc từ Details page)
3. Confirm dialog: "Are you sure you want to block this customer?"
4. Click "Block"
5. API: `PUT /api/admin/customers/:id/block`
6. Status: BLOCKED
7. Customer không thể đăng nhập, mua hàng
8. Refresh table/page

### Unblock Customer:
1. Admin vào `/admin/customers`
2. Admin thấy customer có Status = Blocked
3. Admin click "Unblock" icon
4. Confirm dialog: "Are you sure you want to unblock this customer?"
5. Click "Unblock"
6. API: `PUT /api/admin/customers/:id/unblock`
7. Status: ACTIVE
8. Customer có thể đăng nhập, mua hàng lại
9. Refresh table/page

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_code VARCHAR(50) UNIQUE NOT NULL,  -- ID hiển thị (ví dụ: AC-0001)
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',       -- ACTIVE, BLOCKED
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_account_code (account_code)
);

CREATE TABLE customer_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,    -- ID hiển thị (ví dụ: ORD-0001)
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',        -- PENDING, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_order_code (order_code)
);
```

**Note**: 
- `account_code`: ID hiển thị cho user (auto-generate sequential: AC-0001, AC-0002...)
- `status`: ACTIVE, BLOCKED
- `orders` table được reference để tính Total Orders, Total Spent

---

## ✅ Checklist Implementation

### Customer List (1 fresher - 1.5 tuần):
- [ ] Tạo table component với 9 cột
- [ ] Fetch data từ API
- [ ] Hiển thị data trong table
- [ ] Search by name, email, phone
- [ ] Filter by status
- [ ] Pagination (10 items/page)
- [ ] Badge count
- [ ] View button (navigate to details)
- [ ] Edit button (navigate to edit)
- [ ] Block/Unblock button (với confirmation)
- [ ] Loading state
- [ ] Error handling

### Customer Details Page (1 fresher - 1.5 tuần):
- [ ] Layout 2 columns (Left: Profile, Right: Orders)
- [ ] Customer Profile card (Avatar, Name, Email, Phone)
- [ ] Customer Information section (Account ID, Registered At, Status)
- [ ] Delivery Addresses section (list addresses)
- [ ] Order History table
- [ ] Statistics section (Total Orders, Total Spent, etc.)
- [ ] Actions: Edit, Block/Unblock
- [ ] Fetch customer data từ API
- [ ] Fetch orders data từ API
- [ ] Fetch addresses data từ API
- [ ] Loading state
- [ ] Error handling

### Customer Edit Form (1 fresher - 1 tuần):
- [ ] Tạo form với 5 fields (Name, Email, Phone, Status)
- [ ] Customer Information section (read-only)
- [ ] Pre-fill data từ API
- [ ] Validation (required fields, unique email)
- [ ] Submit update (API call)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Backend API (2 fresher - 1.5 tuần):
- [ ] GET /api/admin/customers (list với filters)
- [ ] GET /api/admin/customers/:id (detail)
- [ ] PUT /api/admin/customers/:id (update)
- [ ] PUT /api/admin/customers/:id/block (block)
- [ ] PUT /api/admin/customers/:id/unblock (unblock)
- [ ] GET /api/admin/customers/:id/orders (list orders)
- [ ] GET /api/admin/customers/:id/addresses (list addresses)
- [ ] Account Code generation (sequential)
- [ ] Validation (unique email, phone)
- [ ] Calculate Total Orders, Total Spent (aggregate)
- [ ] Error responses

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test validation
- [ ] Test block/unblock workflow
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1-1.5: Customer List
- Table component
- Search, Filter, Pagination
- Actions (View, Edit, Block/Unblock)

### Tuần 2-2.5: Customer Details Page
- Layout 2 columns
- Profile card
- Customer Information
- Delivery Addresses
- Order History table
- Statistics

### Tuần 3: Customer Edit Form
- Form component
- Pre-fill data
- Validation
- Update logic

### Tuần 3.5-4: Backend API
- CRUD endpoints
- Block/Unblock endpoints
- Calculate statistics
- Validation

### Tuần 5: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **Chỉ Admin quản lý**: Customer không tự sửa được thông tin từ admin panel
2. **Block/Unblock**: Quan trọng để quản lý customers vi phạm
3. **Total Orders, Total Spent**: Tính từ database (aggregate), không lưu trong customer table
4. **Order History**: Link đến orders của customer, không phải invoice
5. **Delivery Addresses**: Quản lý địa chỉ giao hàng của customer

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Summary Cards (All Customers, Orders, Revenue)
- [ ] Analytics button (xem thống kê chi tiết)
- [ ] Send Message button (gửi thông báo cho customer)
- [ ] Customer Activity Log (lịch sử hoạt động)
- [ ] Export customers (CSV, Excel)
- [ ] Bulk Actions (Block/Unblock nhiều customers)
- [ ] Customer Segmentation (VIP, Regular, New)
- [ ] Customer Notes (ghi chú về customer)
- [ ] Soft delete (ẩn thay vì xóa vĩnh viễn)

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 2 trang chính (List, Details), form đơn giản
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features
- ✅ **Phù hợp marketplace**: Order History thay vì Invoice

**Tổng thời gian ước tính**: 5 tuần (1.25 tháng) với team 5 fresher

---

# 6. 🛒 Quản lý đơn hàng (Orders Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- 7 Order Status: PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED
- All Orders List với Summary Cards và Filter Tabs (gộp PENDING vào đây)
- Alert Card cảnh báo đơn chờ xử lý
- Order Details với Timeline
- Update Status
- Auto-confirm: Đa số đơn hàng tự động xác nhận (nếu thanh toán thành công và stock đủ)
- Manual confirm: Chỉ đơn hàng có vấn đề mới vào PENDING để admin xử lý
- Bỏ Priority (Phase 2)
- Bỏ Refund/Return workflow (Phase 2)

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm DRAFT status
- Thêm DELIVERED status
- Thêm Priority (High, Normal, Low)
- Thêm Refund/Return workflow
- Thêm Bulk Actions (Update status nhiều đơn)
- Thêm Export orders
- Thêm Order Notes/Comments

---

## 🎯 Vai Trò và Quyền của Admin

### Vai Trò Chính:
1. **Quản lý đơn hàng** - Xem tất cả đơn hàng (của tất cả Customers)
2. **Xử lý đơn hàng** - Xác nhận, cập nhật trạng thái đơn hàng
3. **Giám sát** - Theo dõi tiến độ đơn hàng

### Quyền Cụ Thể:

#### ✅ Quyền 1: Xem (View) - Full Access
- Xem tất cả đơn hàng (của tất cả Customers)
- Xem chi tiết đơn hàng
- Xem Timeline đơn hàng
- Filter theo Status, Customer, Date
- Search đơn hàng

#### ✅ Quyền 2: Xác nhận (Confirm) - Full Access
- Xác nhận đơn hàng chờ xử lý (PENDING → CONFIRMED)
- Approve/Reject đơn hàng

#### ✅ Quyền 3: Cập nhật Status - Full Access
- Thay đổi trạng thái đơn hàng:
  - CONFIRMED → PROCESSING
  - PROCESSING → SHIPPED
  - SHIPPED → COMPLETED
  - Bất kỳ → CANCELED
  - Bất kỳ → REFUNDED

#### ⚠️ Quyền 4: Refund/Return - Phase 2
- Xử lý hoàn tiền (Phase 2)
- Xử lý đổi trả (Phase 2)

---

## 🔄 Workflow Orders trong Marketplace

### Quy Trình Đơn Hàng:

```
1. Customer đặt hàng
   → Status: PENDING (chờ xác nhận)

2. Admin xác nhận đơn hàng
   → Status: CONFIRMED (đã xác nhận)

3. Seller chuẩn bị hàng
   → Status: PROCESSING (đang xử lý, đóng gói)

4. Giao cho đơn vị vận chuyển
   → Status: SHIPPED (đã giao hàng)

5. Customer nhận hàng
   → Status: COMPLETED (hoàn thành)
```

### Các Trường Hợp Khác:

```
PENDING → CANCELED (Admin/Seller hủy đơn)
CONFIRMED → CANCELED (Hủy trước khi xử lý)
PROCESSING → CANCELED (Hủy khi đang xử lý)
SHIPPED → CANCELED (Hủy khi đang vận chuyển)
COMPLETED → REFUNDED (Hoàn tiền sau khi hoàn thành)
```

---

## 📊 Order Status (7 Status - Phase 1)

### 1. PENDING (Chờ xử lý)
- **Màu**: 🟡 Yellow (#ffc107)
- **Mô tả**: Đơn hàng cần admin xử lý (thường do: stock không đủ, thanh toán chưa xác nhận, đơn hàng bất thường)
- **Auto-confirm**: Đa số đơn hàng sẽ tự động xác nhận (auto-confirm) nếu thanh toán thành công và stock đủ
- **Manual confirm**: Chỉ đơn hàng có vấn đề mới vào PENDING để admin xử lý
- **Hành động**: Confirm hoặc Cancel

### 2. CONFIRMED (Đã xác nhận)
- **Màu**: 🔵 Blue (#2b8cee)
- **Mô tả**: Admin/Seller đã xác nhận đơn, bắt đầu chuẩn bị hàng
- **Hành động**: Update to PROCESSING

### 3. PROCESSING (Đang xử lý)
- **Màu**: 🟠 Orange (#fd7e14)
- **Mô tả**: Đang đóng gói, chuẩn bị giao hàng
- **Hành động**: Update to SHIPPED

### 4. SHIPPED (Đã giao hàng)
- **Màu**: 🟣 Purple (#6f42c1)
- **Mô tả**: Đã giao cho đơn vị vận chuyển, đang trên đường
- **Hành động**: Update to COMPLETED

### 5. COMPLETED (Hoàn thành)
- **Màu**: 🟢 Green (#28a745)
- **Mô tả**: Customer đã nhận hàng, đơn hàng hoàn tất
- **Hành động**: Có thể Refund (Phase 2)

### 6. CANCELED (Đã hủy)
- **Màu**: 🔴 Red (#dc3545)
- **Mô tả**: Đơn hàng bị hủy (bởi Admin, Seller hoặc Customer)
- **Hành động**: Không thể thay đổi

### 7. REFUNDED (Đã hoàn tiền)
- **Màu**: ⚫ Grey (#6c757d)
- **Mô tả**: Đã hoàn tiền cho Customer
- **Hành động**: Không thể thay đổi

---

## 🎨 LAYOUT CHI TIẾT - ORDERS

### 📋 1. All Orders List Page (`/admin/orders`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🛒 Orders                                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Summary Cards:                                                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ Pending  │  │Confirmed │  │Processing│  │ Shipped  │          │   │
│  │  │    25    │  │    18    │  │    12    │  │    8     │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │   │
│  │  │Completed │  │ Canceled │  │ Refunded │                        │   │
│  │  │   45     │  │    5     │  │    3     │                        │   │
│  │  └──────────┘  └──────────┘  └──────────┘                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚠️ 25 đơn hàng chờ xử lý Khẩn cấp                                  │   │
│  │  Một số đơn hàng sắp đến hạn giao hàng                              │   │
│  │  [Xử lý ngay] → Click → Filter: PENDING                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Filter Tabs:                                                        │   │
│  │  [All (116)] [Pending (25)] [Confirmed (18)] [Processing (12)]     │   │
│  │  [Shipped (8)] [Completed (45)] [Canceled (5)] [Refunded (3)]      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search orders...  [Customer: ▼ All]  [Date: ▼ This Month]   │   │
│  │  [Export]                                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🛒 All Order List                            [X orders]           │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │Order ID  │Created At│ Customer │  Total   │  Items   │Payment   │Delivery  │  Status  │Priority  │Action│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │#ORD-0001 │10 Sep 2023│Nguyễn Văn A│2,500,000₫│    3     │ [✅] Paid│#D-123456│ [⏳]     │ Normal  │ [👁️]│ │
│  │  │   │          │          │          │          │          │          │          │ Pending │          │ [✏️]│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │#ORD-0002 │15 Sep 2023│Trần Thị B  │1,200,000₫│    1     │ [✅] Paid│#D-123457│ [✅]     │ High    │ [👁️]│ │
│  │  │   │          │          │          │          │          │          │          │ Completed│          │ [✏️]│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │#ORD-0003 │20 Sep 2023│Lê Văn C    │  850,000₫│    2     │ [⏳]     │         │ [🟠]     │ Normal  │ [👁️]│ │
│  │  │   │          │          │          │          │          │ Unpaid  │          │ Processing│          │ [✏️]│ │
│  │  └───┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-10 of 116 orders  [< Prev] [1] [2] [3] [Next >]  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Summary Cards (7 cards):**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Pending  │  │Confirmed │  │Processing│  │ Shipped  │
│    25    │  │    18    │  │    12    │  │    8     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐
│Completed │  │ Canceled │  │ Refunded │
│   45     │  │    5     │  │    3     │
└──────────┘  └──────────┘  └──────────┘
```
- Click vào card → Filter theo status đó (chuyển sang tab tương ứng)
- Màu sắc theo status

**Alert Card (chỉ hiện khi có PENDING > 0):**
```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️ 25 đơn hàng chờ xử lý Khẩn cấp                          │
│  Một số đơn hàng sắp đến hạn giao hàng                      │
│  [Xử lý ngay] → Click → Filter: PENDING (chuyển sang tab)  │
└──────────────────────────────────────────────────────────────┘
```
- Chỉ hiển thị khi có đơn PENDING
- Click "Xử lý ngay" → Chuyển sang tab "Pending"

**Filter Tabs:**
```
[All (116)] [Pending (25)] [Confirmed (18)] [Processing (12)]
[Shipped (8)] [Completed (45)] [Canceled (5)] [Refunded (3)]
```
- Click tab → Filter table theo status
- Badge count hiển thị số đơn
- Tab active được highlight

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Orders                                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search orders...                                │ │
│  │  [Customer: ▼ All] [Date: ▼ This Month] [Export]     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```
- Bỏ dropdown "Status" (đã có Filter Tabs)

**Table Columns (11 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Order ID** - Mã đơn hàng (ví dụ: #ORD-0001)
3. **Created At** - Ngày tạo đơn (format: DD MMM YYYY)
4. **Customer** - Tên khách hàng (link đến Customer Details)
5. **Total** - Tổng tiền (format: 2,500,000₫)
6. **Items** - Số lượng sản phẩm (ví dụ: 3)
7. **Payment Status** - Badge màu:
   - `[✅ Paid]` - Green badge (đã thanh toán)
   - `[⏳ Unpaid]` - Yellow badge (chưa thanh toán)
8. **Delivery Number** - Mã vận chuyển (ví dụ: #D-123456)
9. **Order Status** - Badge màu:
   - `[⏳ Pending]` - Yellow badge
   - `[🔵 Confirmed]` - Blue badge
   - `[🟠 Processing]` - Orange badge
   - `[🟣 Shipped]` - Purple badge
   - `[✅ Completed]` - Green badge
   - `[❌ Canceled]` - Red badge
   - `[⚫ Refunded]` - Grey badge
10. **Priority** - Normal/High (Phase 2, có thể bỏ Phase 1)
11. **Actions** - Icons (thay đổi theo tab):
   - Tab "All": `[👁️ View] [✏️ Edit]`
   - Tab "Pending": `[👁️ View] [✅ Confirm] [❌ Cancel]`
   - Tab khác: `[👁️ View] [✏️ Edit]`

**Pagination:**
```
Showing 1-10 of 116 orders    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo Order ID, Customer name
- Filter Tabs: Click tab để filter theo status (thay vì dropdown)
- Filter: Theo Customer, Date
- Summary Cards: Click để filter theo status (chuyển sang tab)
- Alert Card: Cảnh báo đơn chờ xử lý (chỉ hiện khi có PENDING)
- Pagination: 10 items/page
- View: Navigate to Order Details
- Actions: Thay đổi theo tab (Pending có Confirm/Cancel)

---

### 👁️ 2. Order Details Page (`/admin/orders/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🛒 Orders > Order Details > #ORD-0001                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Order Information                                                 │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Order ID: #ORD-0001                                          │ │   │
│  │  │  Status: [⏳ Pending]  Payment: [✅ Paid]                     │ │   │
│  │  │  Created: 10 Sep 2023, 14:30                                 │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Progress Timeline:                                                 │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  [✅] Order Confirmed       10 Sep 2023, 14:30                │ │   │
│  │  │  [✅] Payment Received     10 Sep 2023, 14:35                │ │   │
│  │  │  [⏳] Processing           10 Sep 2023, 15:00 (In Progress)  │ │   │
│  │  │  [ ] Shipping              (Pending)                         │ │   │
│  │  │  [ ] Completed             (Pending)                         │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Products:                                                          │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  ┌───┬──────────────────────┬──────────┬──────────┬──────────┐ │ │   │
│  │  │  │ ☐ │  Product Name       │  Status  │ Quantity │  Price   │ │ │   │
│  │  │  ├───┼──────────────────────┼──────────┼──────────┼──────────┤ │ │   │
│  │  │  │ ☐ │  Tai nghe Wireless  │ Ready    │    1     │ 850,000₫│ │ │   │
│  │  │  │   │  Pro                │          │          │          │ │ │   │
│  │  │  ├───┼──────────────────────┼──────────┼──────────┼──────────┤ │ │   │
│  │  │  │ ☐ │  Đồng hồ thông minh  │ Packaging│    2     │1,200,000₫│ │ │   │
│  │  │  │   │  S4                  │          │          │          │ │ │   │
│  │  │  └───┴──────────────────────┴──────────┴──────────┴──────────┘ │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Order Summary:                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Sub Total: 2,050,000₫                                        │ │   │
│  │  │  Discount: -50,000₫                                           │ │   │
│  │  │  Shipping: 0₫                                                 │ │   │
│  │  │  Tax (10%): 200,000₫                                          │ │   │
│  │  │  ────────────────────────────────────────────────────────────│ │   │
│  │  │  Total: 2,200,000₫                                           │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Payment Information:                                              │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Payment Method: Mastercard (xxxx xxxx xxxx 7812) [✅]        │ │   │
│  │  │  Transaction ID: #TXN-123456                                  │ │   │
│  │  │  Paid At: 10 Sep 2023, 14:35                                  │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Customer Information:                                              │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Name: Nguyễn Văn A                                          │ │   │
│  │  │  Email: abc@email.com                                        │ │   │
│  │  │  Phone: 0901234567                                           │ │   │
│  │  │  Shipping Address: 123 Đường ABC, Quận 1, TP.HCM            │ │   │
│  │  │  Billing Address: Same as shipping address                   │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Actions:                                                           │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  [Update Status] [Cancel Order] [Refund] (Phase 2)           │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Order Information:**
- Order ID: Mã đơn hàng
- Status: Badge màu theo status
- Payment Status: Paid/Unpaid
- Created: Ngày giờ tạo đơn

**Progress Timeline:**
- Hiển thị các bước: Order Confirmed → Payment → Processing → Shipping → Completed
- Mỗi bước có:
  - Icon: ✅ (completed), ⏳ (in progress), [ ] (pending)
  - Timestamp: Ngày giờ
  - Status: Completed/In Progress/Pending

**Products Table:**
- Product Name
- Status: Ready/Packaging
- Quantity: Số lượng
- Price: Giá sản phẩm

**Order Summary:**
- Sub Total: Tổng tiền sản phẩm
- Discount: Giảm giá
- Shipping: Phí vận chuyển
- Tax: Thuế
- Total: Tổng cộng

**Payment Information:**
- Payment Method: Phương thức thanh toán
- Transaction ID: Mã giao dịch
- Paid At: Ngày giờ thanh toán

**Customer Information:**
- Name, Email, Phone
- Shipping Address: Địa chỉ giao hàng
- Billing Address: Địa chỉ thanh toán

**Actions:**
- **Update Status**: Thay đổi trạng thái đơn hàng
- **Cancel Order**: Hủy đơn hàng
- **Refund**: Hoàn tiền (Phase 2)

---

### ✏️ 3. Update Status Modal (`/admin/orders/[id]` - Modal)

```
┌──────────────────────────────────────────────────────────────┐
│  Update Order Status                              [X]        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Order: #ORD-0001                                            │
│  Current Status: [⏳ Pending]                                 │
│                                                              │
│  New Status *                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [▼] Select status                                    │  │
│  │  ├──────────────────────────────────────────────────┤  │
│  │  │  CONFIRMED                                       │  │
│  │  │  PROCESSING                                      │  │
│  │  │  SHIPPED                                         │  │
│  │  │  COMPLETED                                       │  │
│  │  │  CANCELED                                        │  │
│  │  │  REFUNDED                                        │  │
│  │  └──────────────────────────────────────────────────┘  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Note (Optional)                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Enter note...                                        │  │
│  │                                                       │  │
│  │  (Textarea - 3 rows)                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Cancel]                    [Update Status]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Design (Mobile)

**Orders List (Mobile):**
```
┌─────────────────────────────┐
│  Orders                     │
├─────────────────────────────┤
│  [Summary Cards - Scroll]   │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Status: ▼ All]            │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  #ORD-0001           │ │
│  │  Nguyễn Văn A        │ │
│  │  2,500,000₫ | 3 items│ │
│  │  [⏳ Pending]        │ │
│  │  10 Sep 2023         │ │
│  │  [View] [Edit]       │ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Completed, Paid
- **Warning**: Yellow (#ffc107) - Pending
- **Info**: Blue (#2b8cee) - Confirmed
- **Orange**: (#fd7e14) - Processing
- **Purple**: (#6f42c1) - Shipped
- **Danger**: Red (#dc3545) - Canceled
- **Grey**: (#6c757d) - Refunded
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Heading**: Bold, 18px
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (table cell)
- **Margin**: 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Search: 🔍
- Order: 🛒
- Status: ⏳ (Pending), 🔵 (Confirmed), 🟠 (Processing), 🟣 (Shipped), ✅ (Completed), ❌ (Canceled), ⚫ (Refunded)
- Actions: 👁️ (View), ✏️ (Edit), ✅ (Confirm), ❌ (Cancel)

---

## 📝 Implementation Notes

### State Management:
```typescript
// Order List State
{
  orders: Order[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'canceled' | 'refunded',
  customerFilter: string | null,
  dateFilter: string | null,
  page: number,
  totalPages: number,
  summary: {
    pending: number,
    confirmed: number,
    processing: number,
    shipped: number,
    completed: number,
    canceled: number,
    refunded: number
  }
}

// Order Details State
{
  order: Order | null,
  timeline: TimelineEvent[],
  products: OrderProduct[],
  customer: Customer | null,
  loading: boolean,
  error: string | null
}

// Update Status State
{
  orderId: string,
  currentStatus: string,
  newStatus: string,
  note: string,
  loading: boolean,
  errors: Record<string, string>
}
```

### API Calls:
- `GET /api/admin/orders?page=1&status=all&customer=...&date=...&search=...`
- `GET /api/admin/orders/:id` (chi tiết đơn hàng)
- `PUT /api/admin/orders/:id/status` (update status, body: { status, note? })
- `PUT /api/admin/orders/:id/confirm` (confirm order)
- `PUT /api/admin/orders/:id/cancel` (cancel order)
- `PUT /api/admin/orders/:id/refund` (refund order - Phase 2)

**Note**: 
- Summary cards được tính từ database (aggregate)
- Timeline được lưu trong bảng `order_timeline` hoặc `order_history`

### Validation Rules:
- **Status**: Required, phải là một trong: PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED
- **Status Transition**: Validate workflow (ví dụ: PENDING → CONFIRMED, không thể PENDING → COMPLETED)
- **Note**: Optional, max 500 characters

### Status Workflow Validation:
```typescript
const ALLOWED_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['COMPLETED', 'CANCELED'],
  COMPLETED: ['REFUNDED'],
  CANCELED: [], // Không thể thay đổi
  REFUNDED: []  // Không thể thay đổi
};

function canTransition(currentStatus: string, newStatus: string): boolean {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}
```

---

## 🔄 Workflow Chi Tiết

### Confirm Order:
1. Admin vào `/admin/orders`
2. Click tab "Pending" (hoặc click "Xử lý ngay" từ Alert Card)
3. Admin xem danh sách đơn hàng chờ xử lý
4. Admin click "View" để xem chi tiết (optional)
5. Admin click "Confirm"
6. Confirm dialog: "Are you sure you want to confirm this order?"
7. Click "Confirm"
8. API: `PUT /api/admin/orders/:id/confirm`
9. Status: CONFIRMED
10. Refresh table (vẫn ở tab Pending, đơn đã confirm sẽ biến mất)

### Update Status:
1. Admin vào `/admin/orders/[id]`
2. Admin click "Update Status"
3. Modal hiện ra với dropdown status
4. Admin chọn status mới (ví dụ: PROCESSING)
5. Admin nhập note (optional)
6. Click "Update Status"
7. Validate: Check status transition hợp lệ
8. API: `PUT /api/admin/orders/:id/status`
9. Status được cập nhật
10. Timeline được cập nhật
11. Refresh page

### Cancel Order:
1. Admin vào `/admin/orders/[id]`
2. Admin click "Cancel Order"
3. Confirm dialog: "Are you sure you want to cancel this order?"
4. Click "Cancel"
5. API: `PUT /api/admin/orders/:id/cancel`
6. Status: CANCELED
7. Refresh page

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,  -- ID hiển thị (ví dụ: ORD-0001)
    customer_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',   -- PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED
    payment_status VARCHAR(20) DEFAULT 'UNPAID',  -- PAID, UNPAID, REFUNDED
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    delivery_number VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'NORMAL',   -- NORMAL, HIGH (Phase 2)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_code (order_code),
    INDEX idx_created_at (created_at)
);

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id)
);

CREATE TABLE order_timeline (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    note TEXT,
    created_by BIGINT,  -- Admin/Seller ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
);

CREATE TABLE order_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,  -- SHIPPING, BILLING
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);
```

**Note**: 
- `order_code`: ID hiển thị cho user (auto-generate sequential: ORD-0001, ORD-0002...)
- `status`: 7 status (PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED)
- `order_timeline`: Lưu lịch sử thay đổi status
- `order_addresses`: Lưu địa chỉ giao hàng và thanh toán

---

## ✅ Checklist Implementation

### Orders List (1 fresher - 2.5 tuần):
- [ ] Tạo table component với 11 cột
- [ ] Fetch data từ API
- [ ] Hiển thị data trong table
- [ ] Summary Cards (7 cards)
- [ ] Alert Card (cảnh báo đơn chờ xử lý)
- [ ] Filter Tabs (8 tabs: All, Pending, Confirmed, Processing, Shipped, Completed, Canceled, Refunded)
- [ ] Search by Order ID, Customer name
- [ ] Filter by customer, date
- [ ] Pagination (10 items/page)
- [ ] Badge count cho mỗi tab
- [ ] Actions thay đổi theo tab (Pending có Confirm/Cancel)
- [ ] View button (navigate to details)
- [ ] Loading state
- [ ] Error handling

### Order Details Page (1 fresher - 2 tuần):
- [ ] Layout với Order Information
- [ ] Progress Timeline component
- [ ] Products table
- [ ] Order Summary section
- [ ] Payment Information section
- [ ] Customer Information section
- [ ] Actions: Update Status, Cancel Order
- [ ] Fetch order data từ API
- [ ] Fetch timeline từ API
- [ ] Loading state
- [ ] Error handling

### Update Status Modal (1 fresher - 1 tuần):
- [ ] Modal component
- [ ] Status dropdown
- [ ] Note textarea
- [ ] Validation (status transition)
- [ ] Submit update (API call)
- [ ] Loading state
- [ ] Error handling
- [ ] Refresh page sau khi update

### Backend API (2 fresher - 2.5 tuần):
- [ ] GET /api/admin/orders (list với filters)
- [ ] GET /api/admin/orders/:id (detail)
- [ ] PUT /api/admin/orders/:id/status (update status)
- [ ] PUT /api/admin/orders/:id/confirm (confirm order)
- [ ] PUT /api/admin/orders/:id/cancel (cancel order)
- [ ] PUT /api/admin/orders/:id/refund (refund - Phase 2)
- [ ] Calculate summary (aggregate)
- [ ] Status workflow validation
- [ ] Order Timeline logging
- [ ] Error responses

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test validation
- [ ] Test status workflow
- [ ] Test confirm/cancel workflow
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1-2.5: Orders List
- Table component
- Summary Cards
- Alert Card
- Filter Tabs
- Search, Filter, Pagination
- Actions (View, Confirm, Cancel - thay đổi theo tab)

### Tuần 3-4: Order Details Page
- Detail page layout
- Progress Timeline
- Products table
- Order Summary
- Payment & Customer Information

### Tuần 5: Update Status Modal
- Modal component
- Status dropdown
- Validation
- Update logic

### Tuần 6-7: Backend API
- CRUD endpoints
- Status workflow
- Timeline logging
- Summary calculation

### Tuần 8: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **7 Order Status**: PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELED, REFUNDED
2. **Auto-confirm**: Đa số đơn hàng tự động xác nhận nếu thanh toán thành công và stock đủ
3. **Manual confirm**: Chỉ đơn hàng có vấn đề (stock không đủ, thanh toán chưa xác nhận) mới vào PENDING
4. **Filter Tabs**: Gộp PENDING vào All Orders với Filter Tabs (không có trang riêng)
5. **Alert Card**: Cảnh báo đơn chờ xử lý, click "Xử lý ngay" → Filter PENDING
6. **Status Workflow**: Validate transition hợp lệ (không thể nhảy bước)
7. **Summary Cards**: Tính từ database (aggregate), click để filter (chuyển tab)
8. **Timeline**: Lưu lịch sử thay đổi status
9. **Priority**: Bỏ Phase 1 (Phase 2)
10. **Refund/Return**: Phase 2

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] DRAFT status (Customer tạo nhưng chưa thanh toán)
- [ ] DELIVERED status (Customer đã nhận, chờ xác nhận)
- [ ] Priority (High, Normal, Low)
- [ ] Refund/Return workflow
- [ ] Bulk Actions (Update status nhiều đơn)
- [ ] Export orders (CSV, Excel)
- [ ] Order Notes/Comments
- [ ] Email notifications
- [ ] Delivery tracking integration

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 7 status, workflow rõ ràng
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features
- ✅ **Tuân thủ workflow**: Status transition hợp lệ
- ✅ **UX tốt**: Gộp PENDING vào All Orders với Filter Tabs, đơn giản navigation

**Tổng thời gian ước tính**: 8 tuần (2 tháng) với team 5 fresher

**Lưu ý**: 
- Gộp PENDING vào All Orders với Filter Tabs (không có trang riêng)
- Đơn giản hóa navigation, UX tốt hơn
- Phù hợp với pattern Booking Management
- Auto-confirm: Đa số đơn hàng tự động xác nhận (90-95%)
- Manual confirm: Chỉ đơn hàng có vấn đề mới vào PENDING (5-10%)

---

# 7. 🏪 Quản lý nhà bán hàng (Sellers Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- **Dashboard Layout Pattern**: Header + Summary Cards + Filter Tabs + View Toggle
- Sellers List với Grid Cards view VÀ Table view (toggle)
- Summary Cards (5 cards): Total, Pending, Active, Blocked, Revenue
- Filter Tabs: All, Pending, Active, Blocked
- View Toggle: Grid/List (segmented control)
- Seller Details đơn giản (Information, Metrics, Status)
- Seller Edit Form với fields cơ bản
- Chỉ Admin quản lý sellers
- Metrics tự động tính (Total Products, Orders, Revenue)
- Bỏ Charts (Phase 2)
- Bỏ Our Story & Our Mission (Phase 2)
- Bỏ Social Media (Phase 2)
- Bỏ Company Reviews (xem trong Reviews item)

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm Our Story & Our Mission
- Thêm Profit by Product Category chart
- Thêm Financial Overview chart
- Thêm Social Media links
- Thêm Company Reviews trong Details
- Thêm Happy Client, Followers metrics
- Thêm Export sellers
- Thêm Bulk Actions (Block/Unblock nhiều sellers)

---

## 🎯 Vai Trò và Quyền của Admin

### Vai Trò Chính:
1. **Quản lý sellers** - Xem tất cả sellers
2. **Xem thông tin chi tiết** - Profile, Metrics, Products
3. **Quản lý trạng thái** - Block/Unblock sellers

### Quyền Cụ Thể:

#### ✅ Quyền 1: Xem (View) - Full Access
- Xem tất cả sellers
- Xem chi tiết seller (Profile, Metrics, Products)
- Xem Products của seller
- Xem Orders của seller
- Filter theo Status, Category, Search

#### ✅ Quyền 2: Tạo (Create) - Full Access
- Tạo seller mới
- Approve seller registration (nếu có)

#### ✅ Quyền 3: Sửa (Edit) - Full Access
- Sửa thông tin seller (Brand Title, Contact, Location, etc.)
- Thay đổi Status (Active/Blocked)
- Upload Brand Logo

#### ✅ Quyền 4: Block/Unblock - Full Access
- Block seller (không cho đăng nhập, bán hàng)
- Unblock seller (khôi phục quyền)

#### ⚠️ Quyền 5: Xóa (Delete) - Optional
- Xóa seller (soft delete - Phase 2)
- Thường không cần xóa, chỉ block

---

## 🎨 LAYOUT CHI TIẾT - SELLERS

### 📋 1. Sellers List Page (`/admin/sellers`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🏪 Sellers                                                                  │
│  Quản lý tất cả sellers đối tác trong hệ thống                              │
│  [Grid Icon] [List Icon]  [+ Add Seller]                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Summary Cards:                                                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  │  Total   │  │ Pending  │  │  Active  │  │ Blocked  │  │ Revenue  │ │
│  │  │   25     │  │    5     │  │    18    │  │    2     │  │  2.3B₫   │ │
│  │  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Filter Tabs:                                                        │   │
│  │  [All (25)] [Pending (5)] [Active (18)] [Blocked (2)]              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Tìm kiếm theo tên, email, location...                        │   │
│  │  [Category: ▼ All]  [Location: ▼ All]                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🏪 All Sellers List                            [X sellers]         │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  [GRID VIEW - khi chọn Grid Icon]                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  │  [Logo]      │  │  [Logo]      │  │  [Logo]      │  │  [Logo]      │ │
│  │  │  [Status]    │  │  [Status]    │  │  [Status]    │  │  [Status]    │ │
│  │  │  [Location]  │  │  [Location]  │  │  [Location]  │  │  [Location]  │ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ ZARA Intl    │  │ Rolex Watch  │  │ Dyson        │  │ GoPro        │ │
│  │  │ (Fashion)    │  │ (Watch)      │  │ (Electronics)│  │ (Electronics)│ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ ★ 4.5 (3.5k) │  │ ★ 4.5 (1.2k)│  │ ★ 4.1 (3.7k)│  │ ★ 4.3 (7.2k)│ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ Products: 865│  │ Products: 261│ │ Products: 781│ │ Products: 890│ │
│  │  │ Orders: 4.5k │  │ Orders: 2.9k │  │ Orders: 5.3k │  │ Orders: 10.6k│ │
│  │  │ Revenue: 200k│  │ Revenue: 349k│ │ Revenue: 545k│ │ Revenue: 465k│ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ Owner:       │  │ Owner:       │  │ Owner:       │  │ Owner:       │ │
│  │  │ Name + Email │  │ Name + Email │  │ Name + Email │  │ Name + Email │ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ [View] [Edit]│  │ [View] [Edit]│  │ [View] [Edit]│  │ [View] [Edit]│ │
│  │  │ [Block]      │  │ [Block]      │  │ [Block]      │  │ [Block]      │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│  │                                                                       │   │
│  │  HOẶC                                                               │   │
│  │                                                                       │   │
│  │  [TABLE VIEW - khi chọn List Icon]                                  │   │
│  │  ┌───┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │  Seller  │  Owner   │ Location │ Category │ Products │  Orders  │ Revenue  │Action│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │[IMG]     │Nguyễn Văn│Nha Trang │ Fashion  │   865    │   4.5k   │  200k₫   │ [👁️]│ │
│  │  │   │ZARA Intl │An        │          │          │          │          │          │ [✏️]│ │
│  │  │   │(Fashion) │an@zara.co│          │          │          │          │          │ [🚫]│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │[IMG]     │Trần Thị B│Đà Nẵng   │ Watch    │   261    │   2.9k   │  349k₫   │ [👁️]│ │
│  │  │   │Rolex     │binh@rolex│          │          │          │          │          │ [✏️]│ │
│  │  │   │(Watch)   │.co       │          │          │          │          │          │ [🚫]│ │
│  │  └───┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  │ [H&M Logo]  │  │[Huawei Logo]│  │ [Nike Logo]  │  │[North Face]  │ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ H&M          │  │ Huawei Phone │  │ Nike Cloth   │  │North Face    │ │
│  │  │ (Fashion)    │  │ (Electronics)│  │ (Fashion)    │  │(Fashion)     │ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ ★ 4.3 (15.3k)│  │ ★ 4.1 (8.2k)│  │ ★ 4.5 (18.9k)│  │ ★ 4.4 (12.7k)│ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ www.hm.co    │  │www.huawei.co │  │ www.nike.co  │  │www.north.co  │ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ 📧 Email     │  │ 📧 Email     │  │ 📧 Email     │  │ 📧 Email     │ │
│  │  │ 📞 Phone     │  │ 📞 Phone     │  │ 📞 Phone     │  │ 📞 Phone     │ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ Products: 520│  │ Products: 380│ │ Products: 650│ │ Products: 420│ │
│  │  │ Orders: 8.2k │  │ Orders: 6.5k │  │ Orders: 12.3k│ │ Orders: 7.8k │ │
│  │  │ Revenue: 320k│  │ Revenue: 280k│ │ Revenue: 580k│ │ Revenue: 350k│ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ [✅ Active]  │  │ [❌ Blocked] │  │ [✅ Active]  │  │ [✅ Active]  │ │
│  │  │              │  │              │  │              │  │              │ │
│  │  │ [View] [Edit]│  │ [View] [Edit]│  │ [View] [Edit]│  │ [View] [Edit]│ │
│  │  │ [Block]      │  │ [Unblock]    │  │ [Block]      │  │ [Block]      │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-8 of 25 sellers  [< Prev] [1] [2] [3] [Next >]    │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout (Dashboard Layout Pattern):

**1. Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  🏪 Sellers                                                  │
│  Quản lý tất cả sellers đối tác trong hệ thống              │
│  [Grid Icon] [List Icon]  [+ Add Seller]                    │
└──────────────────────────────────────────────────────────────┘
```
- **Title**: "Sellers"
- **Subtitle**: "Quản lý tất cả sellers đối tác trong hệ thống"
- **View Toggle**: Segmented control với 2 options:
  - Grid Icon (selected) → Hiển thị Grid View
  - List Icon (unselected) → Hiển thị Table View
- **Add Button**: "+ Add Seller" (blue, primary button)

**2. Summary Cards (5 cards):**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Total   │  │ Pending  │  │  Active  │  │ Blocked  │  │ Revenue  │
│   25     │  │    5     │  │    18    │  │    2     │  │  2.3B₫   │
│  [Icon]  │  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │  │  [Icon]  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```
- **Total Sellers**: Tổng số sellers (25)
- **Pending**: Sellers chờ duyệt (5) - Nếu có workflow approval
- **Active**: Sellers đang hoạt động (18)
- **Blocked**: Sellers bị chặn (2)
- **Revenue**: Tổng doanh thu từ tất cả sellers (2.3B₫)
- Click vào card → Filter theo status tương ứng (chuyển sang tab)

**3. Filter Tabs:**
```
[All (25)] [Pending (5)] [Active (18)] [Blocked (2)]
```
- **Tabs**: Click tab → Filter table/cards theo status
- **Badge count**: Hiển thị số sellers trong mỗi tab
- **Active tab**: Có underline (blue), highlighted
- **Tab colors**: 
  - All: Blue
  - Pending: Orange
  - Active: Green
  - Blocked: Red

**4. Search & Filters:**
```
┌──────────────────────────────────────────────────────────────┐
│  [🔍] Tìm kiếm theo tên, email, location...                │
│  [Category: ▼ All]  [Location: ▼ All]                     │
└──────────────────────────────────────────────────────────────┘
```
- **Search bar**: Tìm theo tên company, email, location
- **Category dropdown**: Filter theo category
- **Location dropdown**: Filter theo location (optional)

**5. Main Content - Grid View (khi chọn Grid Icon):**
- **View**: Grid (4 cards/row trên desktop, 2 cards/row trên tablet, 1 card/row trên mobile)
- **Card Size**: ~300px width, auto height

**Mỗi Card hiển thị:**
1. **Logo** - Brand logo (120x120px, rounded) - Top center
2. **Status Badge** - Top right của logo (Active/Blocked/Pending)
3. **Location Tag** - Bottom left của logo (ví dụ: "Nha Trang")
4. **Company Name** - Tên công ty (ví dụ: "ZARA International")
5. **Category** - Danh mục (ví dụ: "(Fashion)")
6. **Rating** - Đánh giá (ví dụ: "★ 4.5 (3.5k reviews)") - Optional
7. **Metrics** (3 metrics):
   - **Total Products**: Số sản phẩm (ví dụ: "Products: 865")
   - **Total Orders**: Số đơn hàng (ví dụ: "Orders: 4.5k")
   - **Total Revenue**: Tổng doanh thu (ví dụ: "Revenue: 200k₫")
8. **Owner Information**:
   - Owner name + Email
9. **Actions** - Buttons:
   - `[View]` - Xem chi tiết
   - `[Edit]` - Sửa thông tin
   - `[Block]` - Chặn seller (nếu Active)
   - `[Unblock]` - Bỏ chặn (nếu Blocked)

**6. Main Content - Table View (khi chọn List Icon):**
- **View**: Table với 9 columns

**Table Columns:**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Seller** - Image (64x64px) + Name + Category
3. **Owner** - Owner name + Email
4. **Location** - Địa chỉ (ví dụ: "Nha Trang")
5. **Category** - Danh mục (ví dụ: "Fashion")
6. **Products** - Số sản phẩm (ví dụ: 865)
7. **Orders** - Số đơn hàng (ví dụ: 4.5k)
8. **Revenue** - Tổng doanh thu (ví dụ: 200k₫)
9. **Actions** - Icons: `[👁️ View] [✏️ Edit] [🚫 Block]`

**Pagination:**
```
Showing 1-8 of 25 sellers    [< Prev] [1] [2] [3] [Next >]
```
- Grid View: 8 cards/page
- Table View: 10 rows/page

**Features:**
- **View Toggle**: Chuyển đổi giữa Grid và Table view
- **Summary Cards**: Click để filter (chuyển sang tab tương ứng)
- **Filter Tabs**: Click tab để filter theo status
- **Search**: Tìm theo tên company, email, location
- **Filter**: Theo Category, Location
- **Badge count**: "X sellers"
- **Pagination**: 8 cards/page (Grid) hoặc 10 rows/page (Table)
- **View**: Navigate to Seller Details
- **Edit**: Navigate to Edit Seller
- **Block/Unblock**: Thay đổi status ngay từ list

---

### 👁️ 2. Seller Details Page (`/admin/sellers/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🏪 Sellers > ZARA International                                            │
│                                                                             │
│  ┌──────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │                          │  │                                          │ │
│  │  Seller Profile          │  │  Key Metrics                            │ │
│  │  ┌────────────────────┐  │  │  ─────────────────────────────────────  │ │
│  │  │  [Logo: 200x200]   │  │  │                                          │ │
│  │  │  ZARA International │  │  │  ┌──────────┐  ┌──────────┐          │ │
│  │  │  (Fashion)          │  │  │  │ Products  │  │  Orders   │          │ │
│  │  │                     │  │  │  │   865     │  │   4.5k   │          │ │
│  │  │  ★ 4.5 (3.5k)       │  │  │  └──────────┘  └──────────┘          │ │
│  │  │                     │  │  │  ┌──────────┐                        │ │
│  │  │  www.zara.co         │  │  │  │ Revenue  │                        │ │
│  │  │                     │  │  │  │  200k₫   │                        │ │
│  │  │  📧 Email:           │  │  │  └──────────┘                        │ │
│  │  │  zara@email.com      │  │  │                                          │ │
│  │  │                     │  │  │  Status                                │ │
│  │  │  📞 Phone:           │  │  │  ─────────────────────────────────────  │ │
│  │  │  0901234567         │  │  │                                          │ │
│  │  │                     │  │  │  [✅] Active                           │ │
│  │  │  📍 Location:       │  │  │                                          │ │
│  │  │  123 Đường ABC     │  │  │  Actions                                │ │
│  │  │  Quận 1, TP.HCM     │  │  │  ─────────────────────────────────────  │ │
│  │  │                     │  │  │                                          │ │
│  │  │  [Edit] [Block]     │  │  │  [Edit] [Block]                           │ │
│  │  └────────────────────┘  │  │                                          │ │
│  │                          │  │                                          │ │
│  │  Seller Information      │  │  Recent Products                         │ │
│  │  ──────────────────────  │  │  ─────────────────────────────────────  │ │
│  │                          │  │                                          │ │
│  │  Account ID:             │  │  ┌───┬──────────┬──────────┬──────────┐ │ │
│  │  #SE-0001                │  │  │ ☐ │Product  │  Price   │  Status  │ │ │
│  │                          │  │  ├───┼──────────┼──────────┼──────────┤ │ │
│  │  Registered At:          │  │  │ ☐ │Tai nghe  │ 850,000₫│ [✅]     │ │ │
│  │  15 Jan 2023             │  │  │ ☐ │Đồng hồ   │1,200,000₫│ [✅]     │ │ │
│  │                          │  │  │ ☐ │Giày thể │ 650,000₫│ [✅]     │ │ │
│  │  Status:                 │  │  └───┴──────────┴──────────┴──────────┘ │ │
│  │  [✅] Active             │  │                                          │ │
│  │                          │  │  [View All Products]                    │ │
│  │                          │  │                                          │ │
│  └──────────────────────────┘  └────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Left Panel - Seller Profile:**
- **Logo**: 200x200px, rounded
- **Company Name**: Tên công ty
- **Category**: Danh mục (ví dụ: "(Fashion)")
- **Rating**: Đánh giá (ví dụ: "★ 4.5 (3.5k reviews)") - Optional
- **Website**: Link website (blue, clickable)
- **Contact**:
  - Email icon + Email address
  - Phone icon + Phone number
  - Location icon + Address
- **Actions**: `[Edit] [Block]` hoặc `[Edit] [Unblock]`

**Left Panel - Seller Information:**
- **Account ID**: Mã seller (ví dụ: #SE-0001)
- **Registered At**: Ngày đăng ký (format: DD MMM YYYY)
- **Status**: Active/Blocked (badge)

**Right Panel - Key Metrics:**
- **Total Products**: Số sản phẩm (ví dụ: 865)
- **Total Orders**: Số đơn hàng (ví dụ: 4.5k)
- **Total Revenue**: Tổng doanh thu (ví dụ: 200k₫)

**Right Panel - Status:**
- Active/Blocked badge

**Right Panel - Recent Products:**
- **Table Columns**:
  1. Checkbox (☐)
  2. Product Name
  3. Price
  4. Status (Approved, Pending, etc.)
- **View All Products**: Link đến Products của seller

---

### ➕ 3. Seller Create Form (`/admin/sellers/new`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🏪 Sellers > Seller Add                                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Add Seller                                                         │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Brand Logo *                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📷 Choose File]  No file chosen                       │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  [Preview Image sẽ hiện ở đây khi chọn file]             │ │ │   │
│  │  │  │  ┌──────────┐                                           │ │ │   │
│  │  │  │  │          │                                           │ │ │   │
│  │  │  │  │  200x200 │  (Preview)                                │ │ │   │
│  │  │  │  │          │                                           │ │ │   │
│  │  │  │  └──────────┘                                           │ │ │   │
│  │  │  │  Max size: 5MB, Formats: JPG, PNG, GIF                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Brand Title *                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  ZARA International                                      │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Product Categories *                                        │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Fashion                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Fashion, Electronics, Home & Living, etc.          │ │   │
│  │  │                                                               │ │   │
│  │  │  Brand Link (Website)                                        │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  www.zara.co                                             │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Optional, website của seller                              │ │   │
│  │  │                                                               │ │   │
│  │  │  Location *                                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  123 Đường ABC, Quận 1, TP.HCM                         │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Email *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  zara@email.com                                          │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Phone *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  0901234567                                              │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                              [Save Change]   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Brand Logo**
- Type: File input
- Required: Yes
- Accept: image/* (jpg, png, gif)
- Max size: 5MB
- Preview: Show 200x200px preview after selection
- Recommended size: 800x800px

**2. Brand Title**
- Type: Text input
- Required: Yes
- Placeholder: "Enter brand title"
- Max length: 255 characters
- Validation: Required, unique

**3. Product Categories**
- Type: Dropdown/Select (multi-select - Phase 2)
- Required: Yes
- Options: Fashion, Electronics, Home & Living, etc.
- Default: None

**4. Brand Link (Website)**
- Type: Text input
- Required: No
- Placeholder: "www.example.com"
- Validation: Valid URL format (optional)

**5. Location**
- Type: Text input hoặc Address picker
- Required: Yes
- Placeholder: "Enter address"
- Max length: 500 characters

**6. Email**
- Type: Email input
- Required: Yes
- Placeholder: "seller@email.com"
- Validation: Required, valid email format, unique

**7. Phone**
- Type: Text input
- Required: Yes
- Placeholder: "0901234567"
- Validation: Required, valid phone format

**8. Status**
- Type: Toggle switch
- Required: Yes
- Default: Active (ON)
- Options: Active / Blocked
- Display: Toggle với label

**9. Buttons**
- Cancel: Link back to `/admin/sellers`
- Save Change: Submit form, show loading, redirect to Seller Details

---

### ✏️ 4. Seller Edit Form (`/admin/sellers/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🏪 Sellers > Edit Seller > ZARA International                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Edit Seller                                                        │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Seller Information (Read-only)                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Account ID: #SE-0001                                  │ │ │   │
│  │  │  │  Registered At: 15 Jan 2023                             │ │ │   │
│  │  │  │  Total Products: 865 products                           │ │ │   │
│  │  │  │  Total Orders: 4.5k orders                             │ │ │   │
│  │  │  │  Total Revenue: 200k₫                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Brand Logo *                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📷 Choose File]  Current: zara-logo.jpg                │ │ │   │
│  │  │  │                                                         │ │ │   │
│  │  │  │  [Current Image Preview: 200x200]                      │ │ │   │
│  │  │  │  ┌──────────┐                                           │ │ │   │
│  │  │  │  │  [IMG]   │  (Current)                                │ │ │   │
│  │  │  │  │  200x200 │                                           │ │ │   │
│  │  │  │  └──────────┘                                           │ │ │   │
│  │  │  │  [New Image Preview sẽ hiện khi chọn file mới]          │ │ │   │
│  │  │  │  Max size: 5MB, Formats: JPG, PNG, GIF                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Brand Title *                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  ZARA International                                      │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Product Categories *                                        │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Fashion                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Brand Link (Website)                                        │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  www.zara.co                                            │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Location *                                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  123 Đường ABC, Quận 1, TP.HCM                         │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Email *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  zara@email.com                                          │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Phone *                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  0901234567                                             │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Active                                             │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Active, Blocked                                   │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                            [Save Changes]    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields (Giống Create, nhưng pre-filled):

**Khác biệt với Create:**
- **Seller Information (Read-only section)** - Hiển thị ở đầu form:
  - **Account ID**: Seller code hiện tại (read-only)
  - **Registered At**: Ngày đăng ký (read-only)
  - **Total Products**: Số sản phẩm (read-only, auto tính)
  - **Total Orders**: Số đơn hàng (read-only, auto tính)
  - **Total Revenue**: Tổng doanh thu (read-only, auto tính)
- Tất cả fields đều pre-filled với data hiện tại
- Brand Logo: Hiển thị ảnh hiện tại + cho phép upload ảnh mới
- Button: "Save Changes" thay vì "Save Change"
- Breadcrumb: "Sellers > Edit Seller > [Seller Name]"

**Form Fields:**
1. Seller Information (Read-only) - Account ID, Registered At, Total Products, Total Orders, Total Revenue
2. Brand Logo * (editable)
3. Brand Title * (editable)
4. Product Categories * (editable)
5. Brand Link (editable)
6. Location * (editable)
7. Email * (editable)
8. Phone * (editable)
9. Status (editable)

---

## 📱 Responsive Design (Mobile)

**Sellers List (Mobile):**
```
┌─────────────────────────────┐
│  Sellers        [+ Add]    │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Category: ▼ All]           │
│  [Status: ▼ All]            │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  [Logo]                │ │
│  │  ZARA International    │ │
│  │  (Fashion)             │ │
│  │  ★ 4.5 (3.5k)          │ │
│  │  www.zara.co           │ │
│  │  📧 zara@email.com     │ │
│  │  📞 0901234567         │ │
│  │  865 products          │ │
│  │  4.5k orders           │ │
│  │  200k₫ revenue         │ │
│  │  [✅ Active]            │ │
│  │  [View] [Edit] [Block] │ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Active status
- **Danger**: Red (#dc3545) - Blocked status
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)
- **Card Shadow**: Light shadow for cards

### Typography:
- **Heading**: Bold, 18px
- **Card Title**: Bold, 16px
- **Card Body**: Regular, 14px
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (form field)
- **Margin**: 16px between cards, 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Search: 🔍
- Seller: 🏪
- Logo: Brand logo image
- Contact: 📧 (Email), 📞 (Phone), 📍 (Location)
- Status: ✅ (Active), ❌ (Blocked)
- Actions: 👁️ (View), ✏️ (Edit), 🚫 (Block), 🔓 (Unblock)

---

## 📝 Implementation Notes

### State Management:
```typescript
// Seller List State
{
  sellers: Seller[],
  loading: boolean,
  error: string | null,
  search: string,
  categoryFilter: string | null,
  locationFilter: string | null,
  statusFilter: 'all' | 'pending' | 'active' | 'blocked',  // Từ Filter Tabs
  page: number,
  totalPages: number,
  viewMode: 'grid' | 'table',  // Toggle giữa Grid và Table view
  summary: {
    total: number,
    pending: number,
    active: number,
    blocked: number,
    revenue: number
  }
}

// Seller Details State
{
  seller: Seller | null,
  products: Product[],
  metrics: {
    totalProducts: number,
    totalOrders: number,
    totalRevenue: number
  },
  loading: boolean,
  error: string | null
}

// Seller Form State (Create/Edit)
{
  id: string | null,  // null = create, có id = edit
  accountId: string,   // Read-only (edit only)
  brandTitle: string,
  categoryId: string,
  brandLink: string,
  location: string,
  email: string,
  phone: string,
  logo: File | null,
  logoUrl: string,     // Current logo URL (edit only)
  status: 'active' | 'blocked',
  registeredAt: string,  // Read-only (edit only)
  totalProducts: number,  // Read-only (edit only)
  totalOrders: number,   // Read-only (edit only)
  totalRevenue: number,  // Read-only (edit only)
  loading: boolean,
  errors: Record<string, string>
}
```

### API Calls:
- `GET /api/admin/sellers?page=1&category=...&status=...&search=...`
- `GET /api/admin/sellers/:id` (chi tiết seller)
- `POST /api/admin/sellers` (create seller, body: { brandTitle, categoryId, brandLink, location, email, phone, logo, status })
- `PUT /api/admin/sellers/:id` (update seller, body: same as POST)
- `PUT /api/admin/sellers/:id/block` (block seller)
- `PUT /api/admin/sellers/:id/unblock` (unblock seller)
- `GET /api/admin/sellers/:id/products` (danh sách sản phẩm của seller)
- `GET /api/admin/sellers/:id/orders` (danh sách đơn hàng của seller)

**Note**: 
- Block/Unblock có thể làm qua API riêng hoặc update status trong Edit form
- Total Products, Total Orders, Total Revenue được tính từ database (aggregate)

### Validation Rules:
- **Brand Title**: Required, 2-255 characters, unique
- **Category**: Required
- **Brand Link**: Optional, valid URL format
- **Location**: Required, 5-500 characters
- **Email**: Required, valid email format, unique
- **Phone**: Required, valid phone format (10-11 digits)
- **Logo**: Required, max 5MB, jpg/png/gif
- **Status**: Required, 'active' | 'blocked'

### Metrics Auto-calculation:
```typescript
// Total Products: Đếm số products của seller
SELECT COUNT(*) FROM products WHERE seller_id = ?

// Total Orders: Đếm số orders của seller (từ order_items)
SELECT COUNT(DISTINCT order_id) 
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE p.seller_id = ?

// Total Revenue: Tổng tiền từ orders của seller
SELECT SUM(oi.total_price)
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE p.seller_id = ? AND oi.order_id IN (
  SELECT id FROM orders WHERE status = 'COMPLETED'
)
```

### Block/Unblock Logic:
```typescript
// Block Seller
async function blockSeller(sellerId: string) {
  // Update status to 'blocked'
  await db.sellers.update(sellerId, { status: 'blocked' });
  
  // Optional: Hide all products of seller
  await db.products.updateMany(
    { seller_id: sellerId },
    { status: 'HIDDEN' }
  );
  
  // Optional: Invalidate seller's session/token
  // Optional: Send notification to seller
}

// Unblock Seller
async function unblockSeller(sellerId: string) {
  // Update status to 'active'
  await db.sellers.update(sellerId, { status: 'active' });
  
  // Optional: Show products again (if needed)
  // Optional: Send notification to seller
}
```

---

## 🔄 Workflow Chi Tiết

### View Seller:
1. Admin vào `/admin/sellers`
2. Admin click "View" button từ card
3. Navigate to `/admin/sellers/[id]`
4. Hiển thị Seller Details (Profile, Information, Metrics, Recent Products)

### Create Seller:
1. Admin vào `/admin/sellers`
2. Admin click "+ Add Seller"
3. Navigate to `/admin/sellers/new`
4. Form hiển thị (empty)
5. Admin nhập thông tin (Brand Title, Category, Contact, Logo, etc.)
6. Click "Save Change"
7. API: `POST /api/admin/sellers`
8. Seller được tạo
9. Redirect to Seller Details

### Edit Seller:
1. Admin vào `/admin/sellers/[id]`
2. Admin click "Edit" button
3. Navigate to `/admin/sellers/[id]/edit`
4. Form hiển thị (pre-filled)
5. Admin sửa thông tin (Brand Title, Contact, Logo, Status, etc.)
6. Click "Save Changes"
7. API: `PUT /api/admin/sellers/:id`
8. Seller được cập nhật
9. Redirect to Seller Details

### Block Seller:
1. Admin vào `/admin/sellers`
2. Admin click "Block" button từ card (hoặc từ Details page)
3. Confirm dialog: "Are you sure you want to block this seller?"
4. Click "Block"
5. API: `PUT /api/admin/sellers/:id/block`
6. Status: BLOCKED
7. Seller không thể đăng nhập, bán hàng
8. Products của seller có thể bị ẩn (optional)
9. Refresh cards/page

### Unblock Seller:
1. Admin vào `/admin/sellers`
2. Admin thấy seller có Status = Blocked
3. Admin click "Unblock" button
4. Confirm dialog: "Are you sure you want to unblock this seller?"
5. Click "Unblock"
6. API: `PUT /api/admin/sellers/:id/unblock`
7. Status: ACTIVE
8. Seller có thể đăng nhập, bán hàng lại
9. Refresh cards/page

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE sellers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_code VARCHAR(50) UNIQUE NOT NULL,  -- ID hiển thị (ví dụ: SE-0001)
    brand_title VARCHAR(255) NOT NULL,
    category_id BIGINT NOT NULL,
    brand_link VARCHAR(500),  -- Website URL
    location VARCHAR(500) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    logo_url VARCHAR(500),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',       -- ACTIVE, BLOCKED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_category_id (category_id),
    INDEX idx_email (email),
    INDEX idx_account_code (account_code)
);
```

**Note**: 
- `account_code`: ID hiển thị cho user (auto-generate sequential: SE-0001, SE-0002...)
- `status`: ACTIVE, BLOCKED
- `category_id`: Link đến categories table
- Metrics (Total Products, Orders, Revenue) được tính từ database (aggregate), không lưu trong sellers table

---

## ✅ Checklist Implementation

### Sellers List (1 fresher - 2.5 tuần):
- [ ] Header Section (Title + Subtitle + View Toggle + Add Button)
- [ ] Summary Cards (5 cards: Total, Pending, Active, Blocked, Revenue)
- [ ] Filter Tabs (All, Pending, Active, Blocked)
- [ ] Search & Filters (Search bar + Category/Location dropdowns)
- [ ] View Toggle (Grid/List segmented control)
- [ ] Grid Cards component (4 cards/row desktop, 2 tablet, 1 mobile)
- [ ] Table component (9 columns)
- [ ] Fetch data từ API
- [ ] Hiển thị data trong grid HOẶC table (tùy view toggle)
- [ ] Search by brand title, email, location
- [ ] Filter by category, location, status (từ tabs)
- [ ] Pagination (8 cards/page Grid, 10 rows/page Table)
- [ ] Badge count
- [ ] View button (navigate to details)
- [ ] Edit button (navigate to edit)
- [ ] Block/Unblock button (với confirmation)
- [ ] Loading state
- [ ] Error handling

### Seller Details Page (1 fresher - 1.5 tuần):
- [ ] Layout 2 columns (Left: Profile, Right: Metrics)
- [ ] Seller Profile card (Logo, Name, Category, Contact)
- [ ] Seller Information section (Account ID, Registered At, Status)
- [ ] Key Metrics section (Total Products, Orders, Revenue)
- [ ] Recent Products table
- [ ] Actions: Edit, Block/Unblock
- [ ] Fetch seller data từ API
- [ ] Fetch products data từ API
- [ ] Calculate metrics (aggregate)
- [ ] Loading state
- [ ] Error handling

### Seller Create Form (1 fresher - 1.5 tuần):
- [ ] Tạo form với 8 fields (Logo, Title, Category, Link, Location, Email, Phone, Status)
- [ ] Upload brand logo
- [ ] Preview logo
- [ ] Category dropdown
- [ ] Validation (required fields, unique email)
- [ ] Submit form (API call)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Seller Edit Form (1 fresher - 1 tuần):
- [ ] Tạo form giống Create
- [ ] Seller Information section (read-only)
- [ ] Pre-fill data từ API
- [ ] Update existing logo display
- [ ] Submit update (API call)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Backend API (2 fresher - 2 tuần):
- [ ] GET /api/admin/sellers (list với filters)
- [ ] GET /api/admin/sellers/:id (detail)
- [ ] POST /api/admin/sellers (create)
- [ ] PUT /api/admin/sellers/:id (update)
- [ ] PUT /api/admin/sellers/:id/block (block)
- [ ] PUT /api/admin/sellers/:id/unblock (unblock)
- [ ] GET /api/admin/sellers/:id/products (list products)
- [ ] GET /api/admin/sellers/:id/orders (list orders)
- [ ] Account Code generation (sequential)
- [ ] File upload handling (logo)
- [ ] Validation (unique email, phone)
- [ ] Calculate metrics (Total Products, Orders, Revenue - aggregate)
- [ ] Error responses

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test validation
- [ ] Test block/unblock workflow
- [ ] Test metrics calculation
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1-2.5: Sellers List
- Header Section (Title + Subtitle + View Toggle + Add Button)
- Summary Cards (5 cards)
- Filter Tabs
- Search & Filters
- View Toggle (Grid/List)
- Grid Cards component
- Table component
- Search, Filter, Pagination
- Actions (View, Edit, Block/Unblock)

### Tuần 3-3.5: Seller Details Page
- Layout 2 columns
- Profile card
- Seller Information
- Key Metrics
- Recent Products table

### Tuần 4-4.5: Seller Create Form
- Form component
- Logo upload
- Category dropdown
- Validation
- Create logic

### Tuần 5: Seller Edit Form
- Edit form (reuse Create form)
- Pre-fill data
- Update logic

### Tuần 6-7: Backend API
- CRUD endpoints
- Block/Unblock endpoints
- Calculate metrics
- File upload
- Validation

### Tuần 8: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **Dashboard Layout Pattern**: Header + Summary Cards + Filter Tabs + View Toggle + Main Content
2. **View Toggle**: Cho phép chuyển đổi giữa Grid và Table view (segmented control)
3. **Summary Cards**: 5 cards (Total, Pending, Active, Blocked, Revenue) - Click để filter
4. **Filter Tabs**: Tabs với badge count - Click để filter theo status
5. **Grid Cards View**: Khác với Customers dùng table, phù hợp với sellers (nhiều thông tin)
6. **Table View**: Hiển thị nhiều thông tin chi tiết hơn, phù hợp khi cần xem nhiều sellers
7. **Metrics Auto-calculate**: Total Products, Orders, Revenue tự động tính từ database
8. **Block/Unblock**: Quan trọng để quản lý sellers vi phạm
9. **Brand Logo**: Bắt buộc, giúp nhận diện seller
10. **Category**: Seller có thể thuộc 1 category (Phase 1), nhiều categories (Phase 2)

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Our Story & Our Mission (textarea)
- [ ] Profit by Product Category chart
- [ ] Financial Overview chart
- [ ] Social Media links (Facebook, Instagram, Twitter, etc.)
- [ ] Company Reviews trong Details
- [ ] Happy Client, Followers metrics
- [ ] Export sellers (CSV, Excel)
- [ ] Bulk Actions (Block/Unblock nhiều sellers)
- [ ] Multi-category selection (seller có thể thuộc nhiều categories)
- [ ] Seller Performance Analytics
- [ ] Soft delete (ẩn thay vì xóa vĩnh viễn)

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: Grid cards view, form đơn giản
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features
- ✅ **Khác biệt**: Grid cards thay vì table (phù hợp sellers)

**Tổng thời gian ước tính**: 8 tuần (2 tháng) với team 5 fresher

---

# 8. 🎫 Quản lý mã giảm giá (Coupons Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Coupons List với Table view
- Coupon Create/Edit Form với fields cơ bản
- 2 Discount Types: Percentage, Fixed Amount
- Coupon áp dụng cho tất cả sản phẩm (không gắn với sản phẩm cụ thể)
- Chỉ Admin quản lý coupons
- Bỏ Discount Products (Phase 2)
- Bỏ Discount Country (Phase 2)
- Bỏ Free Shipping type (Phase 2)
- Bỏ Future Plan status (Phase 2)

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm Discount Products (áp dụng cho sản phẩm/category cụ thể)
- Thêm Discount Country (áp dụng cho quốc gia cụ thể)
- Thêm Free Shipping type
- Thêm Future Plan status
- Thêm Usage History (lịch sử sử dụng coupon)
- Thêm Export coupon codes
- Thêm Bulk Actions (Active/Inactive nhiều coupons)

---

## 🎯 Vai Trò và Quyền của Admin

### Vai Trò Chính:
1. **Quản lý coupons** - Tạo, xem, sửa, xóa coupons
2. **Theo dõi sử dụng** - Xem số lần sử dụng coupon
3. **Quản lý trạng thái** - Active/Inactive coupons

### Quyền Cụ Thể:

#### ✅ Quyền 1: Xem (View) - Full Access
- Xem tất cả coupons
- Xem chi tiết coupon
- Xem lịch sử sử dụng coupon (Phase 2)
- Filter theo Status, Date, Search

#### ✅ Quyền 2: Tạo (Create) - Full Access
- Tạo coupon mới
- Generate coupon code (tự động hoặc manual)

#### ✅ Quyền 3: Sửa (Edit) - Full Access
- Sửa thông tin coupon (Code, Value, Dates, Limits, Status)
- Không thể sửa sau khi coupon đã được sử dụng (Phase 2)

#### ✅ Quyền 4: Xóa (Delete) - Full Access
- Xóa coupon (chỉ khi chưa được sử dụng)
- Soft delete (Phase 2)

---

## 🎨 LAYOUT CHI TIẾT - COUPONS

### 📋 1. Coupons List Page (`/admin/coupons`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎫 Coupons                                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search coupons...  [Status: ▼ All]  [Date: ▼ This Month]     │   │
│  │  [+ Add Coupon]                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎫 All Coupons List                            [X coupons]        │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │  Code    │  Coupon Name         │Discount │Discount │Start Date│ End Date │Usage Limit│Used Count│Status│Action│ │
│  │  │   │          │                      │  Type    │  Value   │          │          │           │          │      │      │ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │SUMMER24  │  Summer Sale 2024    │Percentage│   10%    │01 Jun 2024│30 Jun 2024│   100     │    45    │[✅]  │ [👁️]│ │
│  │  │   │          │                      │          │          │          │          │           │          │Active│ [✏️]│ │
│  │  │   │          │                      │          │          │          │          │           │          │      │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │FASHION50 │  Fashion Discount    │Fixed     │ 50,000₫ │15 Jul 2024│15 Aug 2024│   50      │    12    │[✅]  │ [👁️]│ │
│  │  │   │          │                      │Amount    │          │          │          │           │          │Active│ [✏️]│ │
│  │  │   │          │                      │          │          │          │          │           │          │      │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │WELCOME10 │  Welcome New User    │Percentage│   15%    │01 Jan 2024│31 Dec 2024│  Unlimited│    234   │[✅]  │ [👁️]│ │
│  │  │   │          │                      │          │          │          │          │           │          │Active│ [✏️]│ │
│  │  │   │          │                      │          │          │          │          │           │          │      │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │OLD2023   │  Old Coupon 2023     │Percentage│   20%    │01 Jan 2023│31 Dec 2023│   200     │   200    │[❌]  │ [👁️]│ │
│  │  │   │          │                      │          │          │          │          │           │          │Expired│ [✏️]│ │
│  │  │   │          │                      │          │          │          │          │           │          │      │ [🗑️]│ │
│  │  └───┴──────────┴──────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-10 of 45 coupons  [< Prev] [1] [2] [3] [Next >]  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Coupons                                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search coupons...                                │ │
│  │  [Status: ▼ All] [Active] [Expired] [Inactive]        │ │
│  │  [Date: ▼ This Month]  [+ Add Coupon]                 │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (11 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Code** - Mã coupon (ví dụ: SUMMER24) - Bold, monospace font
3. **Coupon Name** - Tên coupon (ví dụ: "Summer Sale 2024")
4. **Discount Type** - Loại giảm giá:
   - `Percentage` - Phần trăm (ví dụ: 10%)
   - `Fixed Amount` - Số tiền cố định (ví dụ: 50,000₫)
5. **Discount Value** - Giá trị giảm giá:
   - Percentage: "10%" (hiển thị với %)
   - Fixed Amount: "50,000₫" (hiển thị với ₫)
6. **Start Date** - Ngày bắt đầu (format: DD MMM YYYY)
7. **End Date** - Ngày kết thúc (format: DD MMM YYYY)
8. **Usage Limit** - Số lần sử dụng tối đa:
   - Số cụ thể (ví dụ: 100)
   - "Unlimited" (nếu không giới hạn)
9. **Used Count** - Số lần đã sử dụng (auto tính từ orders)
10. **Status** - Badge màu:
    - `[✅ Active]` - Green badge (đang hoạt động, trong thời gian hiệu lực)
    - `[❌ Expired]` - Red badge (đã hết hạn)
    - `[⚫ Inactive]` - Grey badge (bị tắt)
11. **Actions** - Icons: `[👁️ View] [✏️ Edit] [🗑️ Delete]`

**Pagination:**
```
Showing 1-10 of 45 coupons    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo Code, Name
- Filter: Theo Status (All/Active/Expired/Inactive), Date
- Badge count: "X coupons"
- Pagination: 10 items/page
- View: Navigate to Coupon Details
- Edit: Navigate to Edit Coupon
- Delete: Xóa coupon (với confirmation, chỉ khi chưa sử dụng)

---

### ➕ 2. Coupon Create Form (`/admin/coupons/new`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎫 Coupons > Coupon Add                                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Add Coupon                                                         │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Coupon Name *                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Summer Sale 2024                                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Tên mô tả cho coupon (ví dụ: "Summer Sale 2024")        │ │   │
│  │  │                                                               │ │   │
│  │  │  Coupon Code *                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  SUMMER24                                               │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Mã coupon (unique, uppercase, không có khoảng trắng)     │ │   │
│  │  │  [Generate Code] (tự động generate)                          │ │   │
│  │  │                                                               │ │   │
│  │  │  Discount Type *                                             │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [○] Percentage  [●] Fixed Amount                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Percentage, Fixed Amount                          │ │   │
│  │  │                                                               │ │   │
│  │  │  Discount Value *                                            │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  10                                                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Nếu Percentage: nhập số (ví dụ: 10 = 10%)              │ │   │
│  │  │  Nếu Fixed Amount: nhập số tiền (ví dụ: 50000 = 50,000₫) │ │   │
│  │  │                                                               │ │   │
│  │  │  Start Date *                                                │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📅] 01/06/2024                                        │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  End Date *                                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📅] 30/06/2024                                        │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ End Date phải sau Start Date                            │ │   │
│  │  │                                                               │ │   │
│  │  │  Usage Limit                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  100                                                     │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Số lần sử dụng tối đa (để trống = Unlimited)           │ │   │
│  │  │                                                               │ │   │
│  │  │  Minimum Order Amount                                        │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  100000                                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Giá trị đơn hàng tối thiểu để sử dụng coupon (optional)│ │   │
│  │  │  (để trống = không giới hạn)                                │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                   │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                              [Create Coupon] │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Coupon Name**
- Type: Text input
- Required: Yes
- Placeholder: "Enter coupon name"
- Max length: 255 characters
- Validation: Required
- Example: "Summer Sale 2024"

**2. Coupon Code**
- Type: Text input
- Required: Yes
- Placeholder: "Enter coupon code"
- Max length: 50 characters
- Validation: Required, unique, uppercase, alphanumeric + underscore/dash
- Auto-generate: Button "Generate Code" để tự động tạo code
- Example: "SUMMER24"

**3. Discount Type**
- Type: Radio buttons
- Required: Yes
- Options:
  - `Percentage` - Giảm theo phần trăm (ví dụ: 10%)
  - `Fixed Amount` - Giảm số tiền cố định (ví dụ: 50,000₫)
- Default: Percentage

**4. Discount Value**
- Type: Number input
- Required: Yes
- Validation:
  - Nếu Percentage: 1-100 (phần trăm)
  - Nếu Fixed Amount: > 0 (số tiền)
- Example: 10 (nếu Percentage) hoặc 50000 (nếu Fixed Amount)

**5. Start Date**
- Type: Date picker
- Required: Yes
- Format: DD/MM/YYYY
- Validation: Required, không được là quá khứ (hoặc cho phép - Phase 2)

**6. End Date**
- Type: Date picker
- Required: Yes
- Format: DD/MM/YYYY
- Validation: Required, phải sau Start Date

**7. Usage Limit**
- Type: Number input
- Required: No
- Placeholder: "Leave empty for unlimited"
- Validation: > 0 (nếu có nhập)
- Default: Unlimited (nếu để trống)

**8. Minimum Order Amount**
- Type: Number input
- Required: No
- Placeholder: "Leave empty for no minimum"
- Validation: > 0 (nếu có nhập)
- Default: Không giới hạn (nếu để trống)

**9. Status**
- Type: Toggle switch
- Required: Yes
- Default: Active (ON)
- Options: Active / Inactive
- Display: Toggle với label

**10. Buttons**
- Cancel: Link back to `/admin/coupons`
- Create Coupon: Submit form, show loading, redirect to Coupons List

---

### ✏️ 3. Coupon Edit Form (`/admin/coupons/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎫 Coupons > Edit Coupon > SUMMER24                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Edit Coupon                                                        │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Coupon Information (Read-only)                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Code: SUMMER24 (read-only)                            │ │ │   │
│  │  │  │  Used Count: 45 times                                  │ │ │   │
│  │  │  │  Created At: 01 Jun 2024                               │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Code không thể sửa sau khi đã tạo                        │ │   │
│  │  │  Used Count: Số lần đã sử dụng (read-only)                  │ │   │
│  │  │                                                               │ │   │
│  │  │  Coupon Name *                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Summer Sale 2024                                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Discount Type *                                             │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [○] Percentage  [●] Fixed Amount                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Discount Value *                                            │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  10                                                       │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Start Date *                                                │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📅] 01/06/2024                                        │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  End Date *                                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [📅] 30/06/2024                                        │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Usage Limit                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  100                                                     │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Minimum Order Amount                                        │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  100000                                                  │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status                                                      │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [▼] Active                                             │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  Options: Active, Inactive                                   │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                            [Save Changes]    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields (Giống Create, nhưng pre-filled):

**Khác biệt với Create:**
- **Coupon Information (Read-only section)** - Hiển thị ở đầu form:
  - **Code**: Coupon code hiện tại (read-only, không thể sửa)
  - **Used Count**: Số lần đã sử dụng (read-only, auto tính từ orders)
  - **Created At**: Ngày tạo (read-only)
- Tất cả fields đều pre-filled với data hiện tại
- Button: "Save Changes" thay vì "Create Coupon"
- Breadcrumb: "Coupons > Edit Coupon > [Coupon Code]"

---

### 👁️ 4. Coupon Details Page (`/admin/coupons/[id]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎫 Coupons > SUMMER24                                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Coupon Information                                                 │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Code: SUMMER24                                              │ │   │
│  │  │  Name: Summer Sale 2024                                      │ │   │
│  │  │  Status: [✅ Active]                                         │ │   │
│  │  │  Created: 01 Jun 2024                                         │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Discount Details:                                                 │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Type: Percentage                                             │ │   │
│  │  │  Value: 10%                                                   │ │   │
│  │  │  Minimum Order: 100,000₫ (optional)                          │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Date & Usage:                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Start Date: 01 Jun 2024                                      │ │   │
│  │  │  End Date: 30 Jun 2024                                        │ │   │
│  │  │  Usage Limit: 100 times                                       │ │   │
│  │  │  Used Count: 45 times                                         │ │   │
│  │  │  Remaining: 55 times                                          │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  │  Actions:                                                           │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  [Edit] [Delete]                                            │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Design (Mobile)

**Coupons List (Mobile):**
```
┌─────────────────────────────┐
│  Coupons      [+ Add]      │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Status: ▼ All]            │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  SUMMER24            │ │
│  │  Summer Sale 2024    │ │
│  │  10% | 01-30 Jun 2024│ │
│  │  45/100 used         │ │
│  │  [✅ Active]          │ │
│  │  [View] [Edit] [Delete]│ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Active status
- **Danger**: Red (#dc3545) - Expired status
- **Grey**: (#6c757d) - Inactive status
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Heading**: Bold, 18px
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Coupon Code**: Bold, 14px, monospace font
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (table cell), 12px (form field)
- **Margin**: 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Search: 🔍
- Coupon: 🎫
- Status: ✅ (Active), ❌ (Expired), ⚫ (Inactive)
- Actions: 👁️ (View), ✏️ (Edit), 🗑️ (Delete)
- Date: 📅

---

## 📝 Implementation Notes

### State Management:
```typescript
// Coupon List State
{
  coupons: Coupon[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'active' | 'expired' | 'inactive',
  dateFilter: string | null,
  page: number,
  totalPages: number
}

// Coupon Form State (Create/Edit)
{
  id: string | null,  // null = create, có id = edit
  code: string,       // Read-only (edit only)
  name: string,
  discountType: 'percentage' | 'fixed_amount',
  discountValue: number,
  startDate: string,
  endDate: string,
  usageLimit: number | null,  // null = unlimited
  minimumOrderAmount: number | null,  // null = no minimum
  status: 'active' | 'inactive',
  usedCount: number,  // Read-only (edit only)
  createdAt: string,  // Read-only (edit only)
  loading: boolean,
  errors: Record<string, string>
}
```

### API Calls:
- `GET /api/admin/coupons?page=1&status=all&date=...&search=...`
- `GET /api/admin/coupons/:id` (chi tiết coupon)
- `POST /api/admin/coupons` (create coupon, body: { name, code, discountType, discountValue, startDate, endDate, usageLimit?, minimumOrderAmount?, status })
- `PUT /api/admin/coupons/:id` (update coupon, body: same as POST)
- `DELETE /api/admin/coupons/:id` (delete coupon)
- `GET /api/admin/coupons/:id/usage` (lịch sử sử dụng - Phase 2)

**Note**: 
- Used Count được tính từ database (aggregate từ orders)
- Code không thể sửa sau khi đã tạo (để tránh confusion)
- Status "Expired" được tự động set khi End Date < today

### Validation Rules:
- **Coupon Name**: Required, 2-255 characters
- **Coupon Code**: Required, 3-50 characters, unique, uppercase, alphanumeric + underscore/dash
- **Discount Type**: Required, 'percentage' | 'fixed_amount'
- **Discount Value**: Required, > 0
  - Nếu Percentage: 1-100
  - Nếu Fixed Amount: > 0
- **Start Date**: Required, valid date
- **End Date**: Required, valid date, must be after Start Date
- **Usage Limit**: Optional, > 0 (nếu có nhập)
- **Minimum Order Amount**: Optional, > 0 (nếu có nhập)
- **Status**: Required, 'active' | 'inactive'

### Code Generation:
```typescript
// Auto-generate coupon code
function generateCouponCode(name: string): string {
  // Option 1: Từ name
  const code = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);
  
  // Option 2: Random
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Option 3: Sequential
  const sequential = `COUPON-${Date.now().toString().slice(-6)}`;
  
  return code;
}
```

### Status Auto-update:
```typescript
// Auto-update status based on dates
function updateCouponStatus(coupon: Coupon): string {
  const today = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);
  
  if (coupon.status === 'inactive') {
    return 'inactive';  // Manual inactive
  }
  
  if (today < startDate) {
    return 'inactive';  // Chưa đến ngày bắt đầu
  }
  
  if (today > endDate) {
    return 'expired';  // Đã hết hạn
  }
  
  return 'active';  // Đang hoạt động
}
```

---

## 🔄 Workflow Chi Tiết

### Create Coupon:
1. Admin vào `/admin/coupons`
2. Admin click "+ Add Coupon"
3. Navigate to `/admin/coupons/new`
4. Form hiển thị (empty)
5. Admin nhập thông tin:
   - Coupon Name: "Summer Sale 2024"
   - Coupon Code: "SUMMER24" (hoặc click "Generate Code")
   - Discount Type: Percentage
   - Discount Value: 10
   - Start Date: 01/06/2024
   - End Date: 30/06/2024
   - Usage Limit: 100 (optional)
   - Minimum Order Amount: 100000 (optional)
   - Status: Active
6. Click "Create Coupon"
7. API: `POST /api/admin/coupons`
8. Coupon được tạo
9. Redirect to Coupons List

### Edit Coupon:
1. Admin vào `/admin/coupons`
2. Admin click "Edit" icon
3. Navigate to `/admin/coupons/[id]/edit`
4. Form hiển thị (pre-filled)
5. Admin sửa thông tin (không thể sửa Code)
6. Click "Save Changes"
7. API: `PUT /api/admin/coupons/:id`
8. Coupon được cập nhật
9. Redirect to Coupons List

### Delete Coupon:
1. Admin vào `/admin/coupons`
2. Admin click "Delete" icon
3. Confirm dialog: "Are you sure you want to delete this coupon?"
4. Check: Nếu Used Count > 0 → Warning: "This coupon has been used X times. Are you sure?"
5. Click "Delete"
6. API: `DELETE /api/admin/coupons/:id`
7. Coupon được xóa
8. Refresh table

---

## 📊 Database Schema (Simplified)

```sql
CREATE TABLE coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,  -- Mã coupon (ví dụ: SUMMER24)
    name VARCHAR(255) NOT NULL,       -- Tên coupon
    discount_type VARCHAR(20) NOT NULL,  -- PERCENTAGE, FIXED_AMOUNT
    discount_value DECIMAL(10,2) NOT NULL,  -- Giá trị giảm giá
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INT,  -- NULL = unlimited
    minimum_order_amount DECIMAL(10,2),  -- NULL = no minimum
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, EXPIRED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

CREATE TABLE coupon_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    coupon_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_order_id (order_id),
    INDEX idx_customer_id (customer_id)
);
```

**Note**: 
- `code`: Mã coupon (unique, uppercase)
- `discount_type`: PERCENTAGE hoặc FIXED_AMOUNT
- `status`: ACTIVE, INACTIVE, EXPIRED (auto-update dựa trên dates)
- `coupon_usage`: Lưu lịch sử sử dụng coupon (để tính Used Count)

---

## ✅ Checklist Implementation

### Coupons List (1 fresher - 1.5 tuần):
- [ ] Tạo table component với 11 cột
- [ ] Fetch data từ API
- [ ] Hiển thị data trong table
- [ ] Search by Code, Name
- [ ] Filter by status (All/Active/Expired/Inactive)
- [ ] Filter by date
- [ ] Pagination (10 items/page)
- [ ] Badge count
- [ ] View button (navigate to details)
- [ ] Edit button (navigate to edit)
- [ ] Delete button (với confirmation)
- [ ] Status auto-update (Expired khi hết hạn)
- [ ] Loading state
- [ ] Error handling

### Coupon Create Form (1 fresher - 1.5 tuần):
- [ ] Tạo form với 9 fields (Name, Code, Type, Value, Dates, Limits, Status)
- [ ] Code generation button
- [ ] Discount Type radio buttons
- [ ] Date pickers
- [ ] Validation (required fields, unique code, date validation)
- [ ] Submit form (API call)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Coupon Edit Form (1 fresher - 1 tuần):
- [ ] Tạo form giống Create
- [ ] Coupon Information section (read-only)
- [ ] Pre-fill data từ API
- [ ] Code read-only (không thể sửa)
- [ ] Submit update (API call)
- [ ] Loading state
- [ ] Error handling
- [ ] Success redirect

### Coupon Details Page (1 fresher - 0.5 tuần):
- [ ] Layout với Coupon Information
- [ ] Discount Details section
- [ ] Date & Usage section
- [ ] Actions: Edit, Delete
- [ ] Fetch coupon data từ API
- [ ] Loading state
- [ ] Error handling

### Backend API (2 fresher - 2 tuần):
- [ ] GET /api/admin/coupons (list với filters)
- [ ] GET /api/admin/coupons/:id (detail)
- [ ] POST /api/admin/coupons (create)
- [ ] PUT /api/admin/coupons/:id (update)
- [ ] DELETE /api/admin/coupons/:id (delete)
- [ ] Code generation logic
- [ ] Validation (unique code, date validation)
- [ ] Status auto-update (Expired khi hết hạn)
- [ ] Calculate Used Count (aggregate từ coupon_usage)
- [ ] Error responses

### Testing & Integration (1 fresher - 1 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test validation
- [ ] Test code generation
- [ ] Test status auto-update
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1-1.5: Coupons List
- Table component
- Search, Filter, Pagination
- Actions (View, Edit, Delete)
- Status auto-update

### Tuần 2-2.5: Coupon Create Form
- Form component
- Code generation
- Discount Type radio buttons
- Date pickers
- Validation
- Create logic

### Tuần 3: Coupon Edit Form
- Edit form (reuse Create form)
- Pre-fill data
- Code read-only
- Update logic

### Tuần 3.5: Coupon Details Page
- Detail page layout
- Information sections
- Actions

### Tuần 4-5: Backend API
- CRUD endpoints
- Code generation
- Validation
- Status auto-update
- Used Count calculation

### Tuần 6: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **Table View**: Phù hợp để quản lý coupons (không cần Grid view)
2. **Code Unique**: Coupon code phải unique, không thể trùng
3. **Code Read-only**: Sau khi tạo, code không thể sửa (để tránh confusion)
4. **Status Auto-update**: Expired tự động khi End Date < today
5. **Used Count**: Tự động tính từ database (aggregate từ coupon_usage)
6. **Discount Types**: Chỉ 2 types Phase 1 (Percentage, Fixed Amount)
7. **Áp dụng cho tất cả**: Phase 1 coupon áp dụng cho tất cả sản phẩm (không gắn với sản phẩm cụ thể)

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Discount Products (áp dụng cho sản phẩm/category cụ thể)
- [ ] Discount Country (áp dụng cho quốc gia cụ thể)
- [ ] Free Shipping type
- [ ] Future Plan status
- [ ] Usage History (lịch sử sử dụng coupon - table)
- [ ] Export coupon codes (CSV, Excel)
- [ ] Bulk Actions (Active/Inactive nhiều coupons)
- [ ] Coupon Analytics (thống kê sử dụng)
- [ ] Auto-expire notification
- [ ] Soft delete (ẩn thay vì xóa vĩnh viễn)

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: Table view, form đơn giản
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm features
- ✅ **Phù hợp marketplace**: Coupon áp dụng cho tất cả sản phẩm

**Tổng thời gian ước tính**: 6 tuần (1.5 tháng) với team 5 fresher

---

# 9. 💰 Quản lý tài chính (Finance Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Finance Overview: Summary Cards, Revenue Chart, Recent Transactions
- Transactions List: Danh sách giao dịch từ Orders
- Seller Payments: Quản lý thanh toán cho sellers (Phase 2 - có thể bỏ tạm)
- Bỏ Invoices (PDF generation - Phase 2)
- Bỏ Detailed Reports (Excel export - Phase 2)
- Bỏ Commission calculation tự động (Phase 2)
- Bỏ Financial analytics nâng cao (Phase 2)

### Phase 2 (Nâng Cấp - Làm Sau)
- Invoices: Tạo, xuất PDF
- Reports: Báo cáo chi tiết, Export Excel
- Commission: Tính toán tự động, cấu hình %
- Analytics: Phân tích doanh thu theo category, seller, thời gian
- Payment History: Lịch sử thanh toán chi tiết
- Financial Statements: Báo cáo tài chính định kỳ

---

## 🎯 Vai Trò và Quyền của Admin

### Vai Trò Chính:
1. **Xem tài chính** - Xem tổng quan doanh thu, giao dịch
2. **Quản lý thanh toán** - Duyệt thanh toán cho sellers
3. **Báo cáo** - Xem báo cáo tài chính (Phase 2)

### Quyền Cụ Thể:

#### ✅ Quyền 1: Xem (View) - Full Access
- Xem Finance Overview (Summary Cards, Charts)
- Xem Transactions List
- Xem Seller Payments
- Xem chi tiết giao dịch

#### ✅ Quyền 2: Quản lý thanh toán (Payment Management)
- Approve payment cho sellers (Pending → Paid)
- View payment details
- Filter payments theo thời gian, status

#### ✅ Quyền 3: Export (Phase 2)
- Export Transactions (Excel, CSV)
- Export Reports (PDF, Excel)
- Export Invoices (PDF)

---

## 🎨 LAYOUT CHI TIẾT - FINANCE

### 📊 1. Finance Overview Page (`/admin/finance`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💰 Finance                                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Summary Cards (4 cards):                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │Total Rev │  │This Month│  │  Orders  │  │  Sellers │          │   │
│  │  │ 2.5B₫    │  │  234.8M₫ │  │ 15,432   │  │   456    │          │   │
│  │  │  ↑ 15.3% │  │  ↑ 12.5% │  │  ↑ 8.2%  │  │  +5 new  │          │   │
│  │  │  [Chart] │  │  [Chart] │  │  [Chart] │  │  [Chart] │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │                          │  │                                          │ │
│  │  Revenue Chart           │  │  Recent Transactions                   │ │
│  │  ──────────────────────  │  │  ─────────────────────────────────────  │ │
│  │                          │  │                                          │ │
│  │  [Filter: ALL] [1M] [6M] [1Y]│ │                                          │ │
│  │                          │  │                                          │ │
│  │  ┌──────────────────────┐ │  │  ┌───┬──────────┬──────────┬──────────┐ │ │
│  │  │                      │ │  │  │ ☐ │Order Code│  Amount  │  Status  │ │ │
│  │  │  [Line Chart]        │ │  │  ├───┼──────────┼──────────┼──────────┤ │ │
│  │  │  Revenue over time   │ │  │  │ ☐ │#TZ5625   │ 850,000₫ │[✅] Paid│ │ │
│  │  │                      │ │  │  ├───┼──────────┼──────────┼──────────┤ │ │
│  │  │                      │ │  │  │ ☐ │#TZ5624   │1,200,000₫│[⏳] Pending│ │ │
│  │  │                      │ │  │  ├───┼──────────┼──────────┼──────────┤ │ │
│  │  │                      │ │  │  │ ☐ │#TZ5623   │ 650,000₫ │[✅] Paid│ │ │
│  │  └──────────────────────┘ │  │  └───┴──────────┴──────────┴──────────┘ │ │
│  │                          │  │                                          │ │
│  │                          │  │  Showing 1-10 of 90,521 transactions    │ │
│  │                          │  │  [View All Transactions]                │ │
│  └──────────────────────────┘  └────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**1. Summary Cards (4 cards):**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Total Rev │  │This Month│  │  Orders  │  │  Sellers │
│ 2.5B₫    │  │  234.8M₫ │  │ 15,432   │  │   456    │
│  ↑ 15.3% │  │  ↑ 12.5% │  │  ↑ 8.2%  │  │  +5 new  │
│  [Chart] │  │  [Chart] │  │  [Chart] │  │  [Chart] │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Card 1: Total Revenue**
- Icon: Dollar sign
- Giá trị: 2.5B₫ (tổng doanh thu từ tất cả orders COMPLETED)
- Trend: +15.3% so với tháng trước (mũi tên xanh lên)
- Chart nhỏ: Line graph mini (optional)

**Card 2: This Month Revenue**
- Icon: Calendar
- Giá trị: 234.8M₫ (doanh thu tháng này)
- Trend: +12.5% so với tháng trước
- Chart nhỏ: Line graph mini (optional)

**Card 3: Total Orders**
- Icon: Shopping bag
- Giá trị: 15,432 (tổng số đơn hàng COMPLETED)
- Trend: +8.2% so với tháng trước
- Chart nhỏ: Line graph mini (optional)

**Card 4: Total Sellers**
- Icon: Store
- Giá trị: 456 (tổng số sellers ACTIVE)
- Trend: +5 sellers mới
- Chart nhỏ: Line graph mini (optional)

**2. Revenue Chart (Left Column):**
- **Title**: "Revenue Chart"
- **Chart**: Line Chart
  - **Line**: Doanh thu theo ngày/tuần/tháng
  - **Color**: Blue (#2b8cee)
- **Filter**: [ALL] [1M] [6M] [1Y]
- **Library**: recharts hoặc chart.js (không tự code)

**3. Recent Transactions (Right Column):**
- **Title**: "Recent Transactions"
- **Button**: "View All Transactions" (link đến `/admin/finance/transactions`)

**Table Columns:**
1. **Checkbox** (☐) - 40px width
2. **Order Code** - Mã đơn hàng (ví dụ: #TZ5625)
3. **Amount** - Số tiền (ví dụ: 850,000₫)
4. **Status** - Badge màu:
   - `[✅ Paid]` - Green badge (COMPLETED)
   - `[⏳ Pending]` - Yellow badge (PENDING, PROCESSING)
   - `[❌ Cancelled]` - Red badge (CANCELLED)

**Features:**
- Hiển thị top 10 transactions gần đây
- Click vào row → Navigate to Order Details
- "View All Transactions" button → Navigate to Transactions List

---

### 📋 2. Transactions List Page (`/admin/finance/transactions`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💰 Finance > Transactions                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search transactions...  [Period: ▼ All]  [Seller: ▼ All]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  💰 All Transactions List                        [X transactions]   │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │Order Code│ Customer │  Seller  │  Amount  │   Date  │Status│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │#TZ5625   │Nguyễn Văn│Shop ABC   │ 850,000₫ │10 Sep 2023│[✅] │ │
│  │  │   │          │A         │          │          │          │Paid  │ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │#TZ5624   │Trần Thị B│Shop XYZ   │1,200,000₫│09 Sep 2023│[⏳] │ │
│  │  │   │          │          │          │          │          │Pending│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │#TZ5623   │Lê Văn C  │Shop DEF   │ 650,000₫ │08 Sep 2023│[✅] │ │
│  │  │   │          │          │          │          │          │Paid  │ │
│  │  └───┴──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  Actions:                                                             │   │
│  │  [👁️ View] (cho mỗi row)                                             │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  │  Showing 1-10 of 90,521 transactions  [< Prev] [1] [2] [3] [Next >]│ │
│  │  └─────────────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Finance > Transactions                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search transactions...                           │ │
│  │  [Period: ▼ All] [Today] [This Week] [This Month]     │ │
│  │  [Seller: ▼ All] [Shop ABC] [Shop XYZ] ...            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (7 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Order Code** - Mã đơn hàng (ví dụ: #TZ5625) - Link đến Order Details
3. **Customer** - Tên khách hàng (ví dụ: Nguyễn Văn A)
4. **Seller** - Tên seller/shop (ví dụ: Shop ABC)
5. **Amount** - Số tiền (ví dụ: 850,000₫) - Format VND
6. **Date** - Ngày giao dịch (format: DD MMM YYYY, ví dụ: 10 Sep 2023)
7. **Status** - Badge màu:
   - `[✅ Paid]` - Green badge (COMPLETED)
   - `[⏳ Pending]` - Yellow badge (PENDING, PROCESSING)
   - `[❌ Cancelled]` - Red badge (CANCELLED)

**Pagination:**
```
Showing 1-10 of 90,521 transactions    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo order code, customer name
- Filter: Theo Period (All/Today/This Week/This Month), Seller
- Sort: Theo Date (mới nhất trước)
- Click vào Order Code → Navigate to Order Details
- Badge count: "X transactions"

---

### 💳 3. Seller Payments Page (`/admin/finance/payments`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💰 Finance > Seller Payments                                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search payments...  [Status: ▼ All]  [Period: ▼ All]        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  💳 All Seller Payments List                    [X payments]       │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │  │ ☐ │  Seller  │  Period │  Revenue │Commission│  Amount │Status│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │Shop ABC  │Sep 2023  │ 50.5M₫   │  5.05M₫  │ 45.45M₫ │[⏳] │ │
│  │  │   │          │          │          │(10%)     │          │Pending│ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │Shop XYZ  │Sep 2023  │ 38.2M₫   │  3.82M₫  │ 34.38M₫ │[✅] │ │
│  │  │   │          │          │          │(10%)     │          │Paid  │ │
│  │  ├───┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┤ │
│  │  │ ☐ │Shop DEF  │Sep 2023  │ 25.8M₫   │  2.58M₫  │ 23.22M₫ │[✅] │ │
│  │  │   │          │          │          │(10%)     │          │Paid  │ │
│  │  └───┴──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
│  │                                                                       │   │
│  │  Actions:                                                             │   │
│  │  [👁️ View] [✅ Approve] (cho mỗi row - nếu status = Pending)        │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  │  Showing 1-10 of 50 payments  [< Prev] [1] [2] [3] [Next >]   │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  Finance > Seller Payments                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search payments...                                │ │
│  │  [Status: ▼ All] [Pending] [Paid] [Cancelled]          │ │
│  │  [Period: ▼ All] [Sep 2023] [Aug 2023] ...              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (7 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2)
2. **Seller** - Tên seller/shop (ví dụ: Shop ABC)
3. **Period** - Kỳ thanh toán (ví dụ: Sep 2023) - Format: MMM YYYY
4. **Revenue** - Tổng doanh thu (ví dụ: 50.5M₫) - Tính từ orders COMPLETED trong period
5. **Commission** - Hoa hồng (ví dụ: 5.05M₫ - 10%) - Tính từ Revenue × Commission Rate
6. **Amount** - Số tiền thanh toán (ví dụ: 45.45M₫) - Revenue - Commission
7. **Status** - Badge màu:
   - `[⏳ Pending]` - Yellow badge (chờ duyệt)
   - `[✅ Paid]` - Green badge (đã thanh toán)
   - `[❌ Cancelled]` - Red badge (đã hủy)

**Pagination:**
```
Showing 1-10 of 50 payments    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- Search: Tìm theo seller name
- Filter: Theo Status (All/Pending/Paid/Cancelled), Period
- Sort: Theo Period (mới nhất trước)
- Actions: View, Approve (nếu status = Pending)
- Badge count: "X payments"

**Note**: 
- Phase 1: Commission Rate cố định 10% (hardcode)
- Phase 2: Commission Rate có thể cấu hình per seller
- Phase 1: Tính toán thủ công (Admin tạo payment record)
- Phase 2: Tính toán tự động (cron job)

---

### ✅ 4. Approve Payment Modal (Từ Seller Payments)

```
┌──────────────────────────────────────────────────────────────┐
│  Approve Payment                                    [X]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Are you sure you want to approve this payment?            │
│                                                              │
│  Seller: Shop ABC                                           │
│  Period: Sep 2023                                           │
│  Revenue: 50.5M₫                                            │
│  Commission: 5.05M₫ (10%)                                    │
│  Amount: 45.45M₫                                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Cancel]                    [Approve Payment]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Design (Mobile)

**Finance Overview (Mobile):**
```
┌─────────────────────────────┐
│  Finance                    │
├─────────────────────────────┤
│  [Metric Cards - Scroll]    │
├─────────────────────────────┤
│  Revenue Chart              │
│  [Chart - Full width]       │
├─────────────────────────────┤
│  Recent Transactions        │
│  [Table - Scroll]           │
└─────────────────────────────┘
```

**Transactions List (Mobile):**
```
┌─────────────────────────────┐
│  Transactions      [Filter] │
├─────────────────────────────┤
│  [🔍 Search...]             │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │ #TZ5625               │ │
│  │ Nguyễn Văn A          │ │
│  │ Shop ABC              │ │
│  │ 850,000₫              │ │
│  │ 10 Sep 2023           │ │
│  │ [✅ Paid]             │ │
│  │ [View]                │ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Paid status, Positive trend
- **Warning**: Yellow (#ffc107) - Pending status
- **Danger**: Red (#dc3545) - Cancelled status, Negative trend
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)

### Typography:
- **Heading**: Bold, 18px
- **Card Title**: Bold, 16px
- **Card Value**: Bold, 24px
- **Table Header**: Bold, 14px
- **Table Body**: Regular, 14px
- **Button**: Medium, 14px
- **Label**: Medium, 14px
- **Helper Text**: Regular, 12px, grey

### Spacing:
- **Padding**: 16px (card), 12px (table cell)
- **Margin**: 16px between cards, 16px between sections
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Finance: 💰
- Revenue: 💵
- Orders: 🛒
- Sellers: 🏪
- Status: ✅ (Paid), ⏳ (Pending), ❌ (Cancelled)
- Actions: 👁️ (View), ✅ (Approve)

---

## 📝 Implementation Notes

### State Management:
```typescript
// Finance Overview State
{
  summary: {
    totalRevenue: number,
    thisMonthRevenue: number,
    totalOrders: number,
    totalSellers: number
  },
  revenueChart: {
    period: 'all' | '1M' | '6M' | '1Y',
    data: Array<{ date: string, revenue: number }>
  },
  recentTransactions: Transaction[],
  loading: boolean,
  error: string | null
}

// Transactions List State
{
  transactions: Transaction[],
  loading: boolean,
  error: string | null,
  search: string,
  periodFilter: 'all' | 'today' | 'thisWeek' | 'thisMonth',
  sellerFilter: string | null,
  page: number,
  totalPages: number
}

// Seller Payments State
{
  payments: Payment[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'pending' | 'paid' | 'cancelled',
  periodFilter: string | null,
  page: number,
  totalPages: number
}
```

### API Calls:
- `GET /api/admin/finance/overview`
  - Response: `{ totalRevenue, thisMonthRevenue, totalOrders, totalSellers }`
- `GET /api/admin/finance/revenue-chart?period=all|1M|6M|1Y`
  - Response: `{ data: [{ date, revenue }] }`
- `GET /api/admin/finance/recent-transactions?limit=10`
  - Response: `{ transactions: [...] }`
- `GET /api/admin/finance/transactions?page=1&limit=10&period=all&seller=...`
  - Response: `{ transactions: [...], total: 90521 }`
- `GET /api/admin/finance/payments?page=1&limit=10&status=...&period=...`
  - Response: `{ payments: [...], total: 50 }`
- `POST /api/admin/finance/payments/:id/approve`
  - Response: `{ success: true, payment: {...} }`

**Note**: 
- Overview metrics được tính từ database (aggregate từ orders)
- Revenue Chart: Tính theo period (ALL/1M/6M/1Y)
- Recent Transactions: Lấy 10 transactions mới nhất từ orders COMPLETED
- Transactions List: Lấy từ orders với filter
- Seller Payments: Tính từ orders COMPLETED của seller trong period

### Chart Libraries:
- **recharts** (React) hoặc **chart.js** (React wrapper)
- Không tự code chart (quá phức tạp cho fresher)
- Sử dụng thư viện có sẵn

---

## 🔄 Workflow Chi Tiết

### View Finance Overview:
1. Admin vào `/admin/finance`
2. Finance Overview hiển thị:
   - 4 Summary Cards (fetch từ API)
   - Revenue Chart (fetch từ API)
   - Recent Transactions (fetch từ API)
3. Admin có thể:
   - Click vào Revenue Chart filter (ALL/1M/6M/1Y)
   - Click vào Recent Transactions row → Navigate to Order Details
   - Click "View All Transactions" → Navigate to Transactions List

### View Transactions:
1. Admin vào `/admin/finance/transactions`
2. Transactions List hiển thị:
   - Tất cả transactions từ orders
   - Filter theo Period, Seller
   - Search theo order code, customer
3. Admin có thể:
   - Click vào Order Code → Navigate to Order Details
   - Filter, Search, Sort
   - Pagination

### Approve Seller Payment:
1. Admin vào `/admin/finance/payments`
2. Admin thấy payment với status = Pending
3. Admin click "Approve"
4. Modal hiển thị: Confirm approve payment
5. Admin click "Approve Payment"
6. Status chuyển: Pending → Paid
7. Payment được ghi nhận (có thể gửi thông báo cho seller - Phase 2)

---

## 📊 Database Schema (Simplified)

**Note**: Finance không cần table riêng cho transactions (tính từ Orders). Chỉ cần table cho Seller Payments:

```sql
-- Finance Overview: Tính từ Orders
-- Total Revenue: SELECT SUM(total_amount) FROM orders WHERE status = 'COMPLETED'
-- This Month Revenue: SELECT SUM(total_amount) FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND status = 'COMPLETED'
-- Total Orders: SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED'
-- Total Sellers: SELECT COUNT(*) FROM sellers WHERE status = 'ACTIVE'

-- Revenue Chart:
SELECT 
  DATE(created_at) as date,
  SUM(total_amount) as revenue
FROM orders
WHERE status = 'COMPLETED'
  AND created_at >= ? -- period filter
GROUP BY DATE(created_at)
ORDER BY date ASC

-- Recent Transactions:
SELECT 
  o.id,
  o.order_code,
  o.total_amount,
  o.status,
  o.created_at,
  c.name as customer_name,
  s.brand_title as seller_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN sellers s ON o.seller_id = s.id
WHERE o.status = 'COMPLETED'
ORDER BY o.created_at DESC
LIMIT 10

-- Transactions List:
SELECT 
  o.id,
  o.order_code,
  o.total_amount,
  o.status,
  o.created_at,
  c.name as customer_name,
  s.brand_title as seller_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN sellers s ON o.seller_id = s.id
WHERE o.status = 'COMPLETED'
  AND (? IS NULL OR o.created_at >= ?) -- period filter
  AND (? IS NULL OR s.id = ?) -- seller filter
  AND (? IS NULL OR o.order_code LIKE ? OR c.name LIKE ?) -- search
ORDER BY o.created_at DESC
LIMIT ? OFFSET ?

-- Seller Payments (Phase 2 - có thể bỏ tạm Phase 1):
CREATE TABLE seller_payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  seller_id BIGINT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(15,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,  -- e.g., 10.00 = 10%
  commission_amount DECIMAL(15,2) NOT NULL,
  payment_amount DECIMAL(15,2) NOT NULL,  -- total_revenue - commission_amount
  status ENUM('PENDING', 'PAID', 'CANCELLED') DEFAULT 'PENDING',
  paid_at DATETIME NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id),
  INDEX idx_seller_period (seller_id, period_start, period_end),
  INDEX idx_status (status)
);

-- Calculate Seller Payment (Phase 2):
SELECT 
  s.id as seller_id,
  DATE_FORMAT(o.created_at, '%Y-%m-01') as period_start,
  LAST_DAY(o.created_at) as period_end,
  SUM(o.total_amount) as total_revenue,
  10.00 as commission_rate,  -- Phase 1: hardcode 10%
  SUM(o.total_amount) * 0.10 as commission_amount,
  SUM(o.total_amount) * 0.90 as payment_amount
FROM orders o
JOIN sellers s ON o.seller_id = s.id
WHERE o.status = 'COMPLETED'
  AND o.created_at >= ? -- period_start
  AND o.created_at <= ? -- period_end
GROUP BY s.id, DATE_FORMAT(o.created_at, '%Y-%m-01')
```

---

## ✅ Checklist Implementation

### Finance Overview (1 fresher - 1 tuần):
- [ ] 4 Summary Cards (Total Revenue, This Month, Orders, Sellers)
- [ ] Fetch summary từ API
- [ ] Hiển thị giá trị và trend
- [ ] Revenue Chart (Line chart)
- [ ] Filter by period (ALL/1M/6M/1Y)
- [ ] Recent Transactions table (10 items)
- [ ] "View All Transactions" button
- [ ] Loading state
- [ ] Error handling

### Transactions List (1 fresher - 1 tuần):
- [ ] Table component với 7 cột
- [ ] Fetch transactions từ API
- [ ] Search (order code, customer name)
- [ ] Filter (Period, Seller)
- [ ] Sort (theo Date - mới nhất trước)
- [ ] Pagination (10 items/page)
- [ ] Click Order Code → Navigate to Order Details
- [ ] Loading state
- [ ] Error handling

### Seller Payments (1 fresher - 1.5 tuần - Phase 2):
- [ ] Table component với 7 cột
- [ ] Fetch payments từ API
- [ ] Search (seller name)
- [ ] Filter (Status, Period)
- [ ] Sort (theo Period - mới nhất trước)
- [ ] Pagination (10 items/page)
- [ ] Approve Payment modal
- [ ] Approve action (Pending → Paid)
- [ ] Loading state
- [ ] Error handling

### Backend API (1 fresher - 1 tuần):
- [ ] GET /api/admin/finance/overview (calculate metrics)
- [ ] GET /api/admin/finance/revenue-chart (calculate revenue by period)
- [ ] GET /api/admin/finance/recent-transactions (list recent transactions)
- [ ] GET /api/admin/finance/transactions (list với filters)
- [ ] GET /api/admin/finance/payments (list với filters - Phase 2)
- [ ] POST /api/admin/finance/payments/:id/approve (approve payment - Phase 2)
- [ ] Aggregate queries (tính từ orders)
- [ ] Error responses

### Testing & Integration (1 fresher - 0.5 tuần):
- [ ] Test API endpoints
- [ ] Test frontend components
- [ ] Test charts (Phase 2)
- [ ] Test payment approval (Phase 2)
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1: Finance Overview
- 4 Summary Cards
- Revenue Chart
- Recent Transactions

### Tuần 2: Transactions List
- Table component
- Filter, Search, Pagination
- Navigate to Order Details

### Tuần 2.5-3.5: Seller Payments (Phase 2)
- Table component
- Approve Payment modal
- Approve action

### Tuần 3.5-4: Backend API
- 5-6 API endpoints
- Aggregate queries
- Calculate metrics

### Tuần 4.5: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **Finance Overview**: Phần quan trọng nhất, làm trước
2. **Transactions List**: Đơn giản, tính từ Orders
3. **Seller Payments**: Phase 2, có thể bỏ tạm Phase 1 nếu thiếu thời gian
4. **Charts**: Phase 2, dùng thư viện (không tự code)
5. **Commission Rate**: Phase 1 hardcode 10%, Phase 2 có thể cấu hình
6. **Payment Calculation**: Phase 1 thủ công, Phase 2 tự động (cron job)
7. **Responsive**: Finance phải responsive (mobile, tablet, desktop)
8. **Loading State**: Hiển thị skeleton/loading khi fetch data
9. **Error Handling**: Hiển thị error message nếu API fail

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Invoices: Tạo, xuất PDF
- [ ] Reports: Báo cáo chi tiết, Export Excel
- [ ] Commission: Tính toán tự động, cấu hình % per seller
- [ ] Analytics: Phân tích doanh thu theo category, seller, thời gian
- [ ] Payment History: Lịch sử thanh toán chi tiết
- [ ] Financial Statements: Báo cáo tài chính định kỳ
- [ ] Auto Payment: Tự động tính và tạo payment records (cron job)
- [ ] Payment Notifications: Gửi thông báo cho seller khi payment approved
- [ ] Export Transactions: Export Excel, CSV
- [ ] Bulk Actions: Approve nhiều payments cùng lúc

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 3 phần chính, dễ implement
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm Invoices, Reports, Analytics
- ✅ **Tính từ Orders**: Không cần table riêng cho transactions (đơn giản hóa)

**Tổng thời gian ước tính**: 4 tuần (1 tháng) với team 3 fresher

**Lưu ý**: 
- Phase 1: Finance Overview + Transactions List (2 tuần)
- Phase 2: Seller Payments (2 tuần - có thể bỏ tạm Phase 1)

---

# 10. ⚙️ Settings Management - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- General Settings: Thông tin cửa hàng, Contact, System Settings
- Admin Profile: Thông tin cá nhân, Đổi mật khẩu
- Bỏ Payment Settings (Phase 2 - tích hợp payment gateway)
- Bỏ Shipping Settings (Phase 2 - tính phí ship phức tạp)
- Bỏ Notification Settings (Phase 2 - email/SMS service)
- Currency: VND (hardcode Phase 1)
- Timezone: Asia/Ho_Chi_Minh (hardcode Phase 1)

### Phase 2 (Nâng Cấp - Làm Sau)
- Payment Settings: Cấu hình payment methods, API keys
- Shipping Settings: Cấu hình shipping methods, phí ship
- Notification Settings: Email/SMS templates, triggers
- Currency & Timezone: Cho phép thay đổi
- System Settings: Maintenance mode, cache settings

---

## 🎯 Vai Trò và Quyền của Admin

### Vai Trò Chính:
1. **Cấu hình hệ thống** - Thay đổi settings chung
2. **Quản lý profile** - Cập nhật thông tin cá nhân, đổi mật khẩu

### Quyền Cụ Thể:

#### ✅ Quyền 1: Xem (View) - Full Access
- Xem General Settings
- Xem Admin Profile

#### ✅ Quyền 2: Sửa (Edit) - Full Access
- Sửa General Settings (Store Name, Logo, Description, Contact)
- Sửa Admin Profile (Name, Email, Phone)
- Đổi mật khẩu

---

## 🎨 LAYOUT CHI TIẾT - SETTINGS

### ⚙️ 1. Settings Page với Tabs (`/admin/settings`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⚙️ Settings                                                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Tabs: [General] [Profile] [Payment] [Shipping] [Notifications]  │   │
│  │  (Phase 1: Chỉ [General] [Profile] active)                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  General Settings                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  Store Information                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  Store Name *                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Venton Marketplace                                         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Store Logo                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [📷 Choose File]  No file chosen                            │   │   │
│  │  │                                                               │   │   │
│  │  │  [Preview Logo sẽ hiện ở đây khi chọn file]                 │   │   │
│  │  │  ┌──────────┐                                                │   │   │
│  │  │  │          │                                                │   │   │
│  │  │  │  200x200 │  (Preview)                                     │   │   │
│  │  │  │          │                                                │   │   │
│  │  │  └──────────┘                                                │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Store Description                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Marketplace hàng đầu Việt Nam...                            │   │   │
│  │  │                                                               │   │   │
│  │  │  (Textarea - 5 rows)                                        │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Contact Information                                                │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  Email *                                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  contact@venton.com                                         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Phone *                                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  1900123456                                                  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Address *                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  123 Đường ABC, Quận XYZ, TP.HCM                            │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  System Settings                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  Currency                                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [▼] VND (₫) - Vietnamese Dong                              │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  (Read-only - Phase 1)                                             │   │
│  │                                                                       │   │
│  │  Timezone                                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [▼] Asia/Ho_Chi_Minh (UTC+7)                                │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  (Read-only - Phase 1)                                             │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [Cancel]                                    [Save Changes] │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**1. Tabs Navigation:**
- **General** (Active) - `/admin/settings/general`
- **Profile** - `/admin/settings/profile`
- **Payment** (Disabled - Phase 2)
- **Shipping** (Disabled - Phase 2)
- **Notifications** (Disabled - Phase 2)

**2. General Settings Form:**

**Store Information Section:**
- **Store Name** * (Required)
  - Type: Text input
  - Placeholder: "Enter store name"
  - Max length: 200 characters
- **Store Logo** (Optional)
  - Type: File input
  - Accept: image/* (jpg, png, jpeg)
  - Max size: 5MB
  - Preview: Show 200x200px preview after selection
- **Store Description** (Optional)
  - Type: Textarea
  - Rows: 5
  - Placeholder: "Enter store description"
  - Max length: 1000 characters

**Contact Information Section:**
- **Email** * (Required)
  - Type: Email input
  - Placeholder: "contact@venton.com"
  - Validation: Email format
- **Phone** * (Required)
  - Type: Tel input
  - Placeholder: "1900123456"
  - Validation: Phone format (Vietnam)
- **Address** * (Required)
  - Type: Text input
  - Placeholder: "Enter address"
  - Max length: 500 characters

**System Settings Section:**
- **Currency** (Read-only - Phase 1)
  - Type: Dropdown (disabled)
  - Value: VND (₫) - Vietnamese Dong
  - Note: "Read-only - Phase 1"
- **Timezone** (Read-only - Phase 1)
  - Type: Dropdown (disabled)
  - Value: Asia/Ho_Chi_Minh (UTC+7)
  - Note: "Read-only - Phase 1"

**Buttons:**
- **Cancel**: Reset form, không lưu thay đổi
- **Save Changes**: Submit form, show loading, redirect on success

---

### 👤 2. Admin Profile Tab (`/admin/settings/profile`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⚙️ Settings                                                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Tabs: [General] [Profile] [Payment] [Shipping] [Notifications]  │   │
│  │  (Active: [Profile])                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Admin Profile                                                       │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  Personal Information                                                │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  Full Name *                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Nguyễn Văn Admin                                            │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Email *                                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  admin@venton.com                                           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  (Read-only - Email không thể thay đổi)                            │   │
│  │                                                                       │   │
│  │  Phone                                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  0901234567                                                   │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [Cancel]                                    [Save Changes] │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Change Password                                                     │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  Current Password *                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ••••••••                                                    │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  New Password *                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ••••••••                                                    │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  (Minimum 8 characters)                                            │   │
│  │                                                                       │   │
│  │  Confirm New Password *                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ••••••••                                                    │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  [Cancel]                                    [Change Password] │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**1. Personal Information Section:**

**Fields:**
- **Full Name** * (Required)
  - Type: Text input
  - Placeholder: "Enter full name"
  - Max length: 100 characters
- **Email** * (Required, Read-only)
  - Type: Email input (disabled)
  - Value: Current admin email
  - Note: "Email không thể thay đổi"
- **Phone** (Optional)
  - Type: Tel input
  - Placeholder: "0901234567"
  - Validation: Phone format (Vietnam)

**Buttons:**
- **Cancel**: Reset form
- **Save Changes**: Update personal information

**2. Change Password Section:**

**Fields:**
- **Current Password** * (Required)
  - Type: Password input
  - Placeholder: "Enter current password"
  - Show/Hide password toggle
- **New Password** * (Required)
  - Type: Password input
  - Placeholder: "Enter new password"
  - Min length: 8 characters
  - Show/Hide password toggle
  - Helper text: "Minimum 8 characters"
- **Confirm New Password** * (Required)
  - Type: Password input
  - Placeholder: "Confirm new password"
  - Validation: Must match New Password
  - Show/Hide password toggle

**Buttons:**
- **Cancel**: Clear password fields
- **Change Password**: Submit password change

**Validation Rules:**
- Current Password: Required, must match database
- New Password: Required, min 8 characters
- Confirm New Password: Required, must match New Password

---

## 📱 Responsive Design (Mobile)

**Settings Page (Mobile):**
```
┌─────────────────────────────┐
│  Settings                   │
├─────────────────────────────┤
│  [General] [Profile]        │
│  (Tabs - Scroll)            │
├─────────────────────────────┤
│  General Settings           │
│  ┌───────────────────────┐ │
│  │ Store Name            │ │
│  │ [Input]               │ │
│  │                       │ │
│  │ Store Logo            │ │
│  │ [Choose File]          │ │
│  │                       │ │
│  │ Description           │ │
│  │ [Textarea]            │ │
│  │                       │ │
│  │ Email                 │ │
│  │ [Input]               │ │
│  │                       │ │
│  │ Phone                 │ │
│  │ [Input]               │ │
│  │                       │ │
│  │ Address               │ │
│  │ [Input]               │ │
│  │                       │ │
│  │ [Save Changes]        │ │
│  └───────────────────────┘ │
└─────────────────────────────┘
```

---

## 🎨 UI Components Specs

### Colors:
- **Primary**: Blue (#2b8cee)
- **Success**: Green (#28a745) - Save success
- **Danger**: Red (#dc3545) - Validation error
- **Background**: White (#ffffff)
- **Border**: Light gray (#dee2e6)
- **Disabled**: Light gray (#e9ecef) - Read-only fields

### Typography:
- **Heading**: Bold, 18px
- **Section Title**: Bold, 16px
- **Label**: Medium, 14px
- **Input**: Regular, 14px
- **Helper Text**: Regular, 12px, grey
- **Button**: Medium, 14px

### Spacing:
- **Padding**: 16px (form section), 12px (form field)
- **Margin**: 16px between sections, 16px between form fields
- **Gap**: 8px between buttons, 12px between form fields

### Icons:
- Settings: ⚙️
- Profile: 👤
- Logo: 📷
- Password: 🔒

---

## 📝 Implementation Notes

### State Management:
```typescript
// General Settings State
{
  settings: {
    storeName: string,
    storeLogo: string | null,
    storeDescription: string,
    email: string,
    phone: string,
    address: string,
    currency: string,  // 'VND' - read-only
    timezone: string   // 'Asia/Ho_Chi_Minh' - read-only
  },
  logoFile: File | null,
  loading: boolean,
  error: string | null
}

// Admin Profile State
{
  profile: {
    name: string,
    email: string,  // read-only
    phone: string | null
  },
  password: {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  },
  loading: boolean,
  error: string | null
}
```

### API Calls:
- `GET /api/admin/settings/general`
  - Response: `{ storeName, storeLogo, storeDescription, email, phone, address, currency, timezone }`
- `PUT /api/admin/settings/general`
  - Body: `{ storeName, storeLogo, storeDescription, email, phone, address }`
  - Response: `{ success: true, settings: {...} }`
- `GET /api/admin/settings/profile`
  - Response: `{ name, email, phone }`
- `PUT /api/admin/settings/profile`
  - Body: `{ name, phone }`
  - Response: `{ success: true, profile: {...} }`
- `PUT /api/admin/settings/profile/password`
  - Body: `{ oldPassword, newPassword, confirmPassword }`
  - Response: `{ success: true }`

**Note**: 
- Logo upload: Sử dụng FormData để upload file
- Password change: Cần hash password trước khi gửi (hoặc backend hash)
- Email read-only: Không cho phép thay đổi email (security)

---

## 🔄 Workflow Chi Tiết

### Update General Settings:
1. Admin vào `/admin/settings/general`
2. Form hiển thị current settings (fetch từ API)
3. Admin thay đổi thông tin (Store Name, Logo, Description, Contact)
4. Admin click "Save Changes"
5. Form validate
6. API call: PUT /api/admin/settings/general
7. Success: Show success message, form updated
8. Error: Show error message

### Update Admin Profile:
1. Admin vào `/admin/settings/profile`
2. Form hiển thị current profile (fetch từ API)
3. Admin thay đổi thông tin (Name, Phone)
4. Admin click "Save Changes"
5. Form validate
6. API call: PUT /api/admin/settings/profile
7. Success: Show success message, form updated
8. Error: Show error message

### Change Password:
1. Admin vào `/admin/settings/profile`
2. Scroll xuống "Change Password" section
3. Admin nhập:
   - Current Password
   - New Password (min 8 characters)
   - Confirm New Password (must match)
4. Admin click "Change Password"
5. Form validate:
   - Current Password: Required
   - New Password: Required, min 8 characters
   - Confirm Password: Required, must match New Password
6. API call: PUT /api/admin/settings/profile/password
7. Success: Show success message, clear password fields
8. Error: Show error message (e.g., "Current password is incorrect")

---

## 📊 Database Schema (Simplified)

```sql
-- Settings Table
CREATE TABLE settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (key)
);

-- Insert default settings
INSERT INTO settings (key, value, type, description) VALUES
('store_name', 'Venton Marketplace', 'STRING', 'Tên cửa hàng'),
('store_logo', NULL, 'STRING', 'Logo cửa hàng URL'),
('store_description', 'Marketplace hàng đầu Việt Nam', 'STRING', 'Mô tả cửa hàng'),
('contact_email', 'contact@venton.com', 'STRING', 'Email liên hệ'),
('contact_phone', '1900123456', 'STRING', 'Số điện thoại liên hệ'),
('contact_address', '123 Đường ABC, Quận XYZ, TP.HCM', 'STRING', 'Địa chỉ'),
('currency', 'VND', 'STRING', 'Đơn vị tiền tệ'),
('timezone', 'Asia/Ho_Chi_Minh', 'STRING', 'Múi giờ');

-- Admin Profile: Sử dụng users table (đã có)
-- UPDATE users SET name = ?, phone = ? WHERE id = ?
-- UPDATE users SET password = ? WHERE id = ? AND password = ? (hash comparison)
```

---

## ✅ Checklist Implementation

### General Settings (1 fresher - 1 tuần):
- [ ] Form với 8 fields (Store Name, Logo, Description, Email, Phone, Address, Currency, Timezone)
- [ ] Logo upload với preview (200x200px)
- [ ] Fetch settings từ API
- [ ] Save settings (PUT request)
- [ ] Validation (required fields, email format, phone format)
- [ ] Currency & Timezone read-only (disabled)
- [ ] Loading state
- [ ] Error handling
- [ ] Success message

### Admin Profile (1 fresher - 0.5 tuần):
- [ ] Personal Information form (Name, Email, Phone)
- [ ] Email read-only (disabled)
- [ ] Change Password form (Current, New, Confirm)
- [ ] Fetch profile từ API
- [ ] Update profile (PUT request)
- [ ] Change password (PUT request với validation)
- [ ] Password validation (min 8 characters, match confirm)
- [ ] Show/Hide password toggle
- [ ] Loading state
- [ ] Error handling
- [ ] Success message

### Backend API (1 fresher - 0.5 tuần):
- [ ] GET /api/admin/settings/general (get settings)
- [ ] PUT /api/admin/settings/general (update settings)
- [ ] GET /api/admin/settings/profile (get profile)
- [ ] PUT /api/admin/settings/profile (update profile)
- [ ] PUT /api/admin/settings/profile/password (change password)
- [ ] Settings table & default values
- [ ] Logo upload handling (save file, return URL)
- [ ] Password hashing & validation (bcrypt)
- [ ] Error responses

### Testing & Integration (1 fresher - 0.5 tuần):
- [ ] Test API endpoints
- [ ] Test frontend forms
- [ ] Test validation
- [ ] Test logo upload
- [ ] Test password change
- [ ] Integration testing
- [ ] Bug fixes

---

## 🚀 Timeline Đề Xuất

### Tuần 1: General Settings
- Form với 8 fields
- Logo upload với preview
- Save settings
- Validation

### Tuần 1.5: Admin Profile
- Personal Information form
- Change Password form
- Update profile
- Change password

### Tuần 2: Backend API
- 5 API endpoints
- Settings table & default values
- Logo upload handling
- Password hashing

### Tuần 2.5: Testing & Polish
- Integration testing
- Bug fixes
- UI/UX improvements

---

## 📌 Notes

1. **General Settings**: Phần quan trọng nhất, làm trước
2. **Logo Upload**: Tương tự Category/Product image upload
3. **Currency & Timezone**: Phase 1 hardcode, Phase 2 cho phép thay đổi
4. **Email Read-only**: Không cho phép thay đổi email (security)
5. **Password Change**: Cần validation chặt chẽ (old password, new password match)
6. **Settings Storage**: Dùng table `settings` với key-value pairs
7. **Responsive**: Settings phải responsive (mobile, tablet, desktop)
8. **Loading State**: Hiển thị skeleton/loading khi fetch/save
9. **Error Handling**: Hiển thị error message nếu API fail

---

## 🔮 Phase 2 (Nâng Cấp - Làm Sau)

### Thêm vào:
- [ ] Payment Settings: Cấu hình payment methods (VNPay, Momo, etc.), API keys
- [ ] Shipping Settings: Cấu hình shipping methods, phí ship theo khu vực
- [ ] Notification Settings: Email/SMS templates, triggers (order created, payment success, etc.)
- [ ] Currency & Timezone: Cho phép thay đổi (dropdown với danh sách)
- [ ] System Settings: Maintenance mode, cache settings, backup settings
- [ ] SEO Settings: Meta title, description, keywords
- [ ] Social Media: Facebook, Instagram, Twitter links
- [ ] Terms & Conditions: Editor cho terms, privacy policy
- [ ] Backup & Restore: Export/import settings

---

## ✅ Kết Luận

Layout này:
- ✅ **Đơn giản**: 2 tabs chính, form đơn giản
- ✅ **Đầy đủ**: Đủ cho Phase 1 MVP
- ✅ **Rõ ràng**: Dễ hiểu, dễ implement
- ✅ **Phù hợp fresher**: Không quá phức tạp
- ✅ **Có thể mở rộng**: Phase 2 thêm Payment, Shipping, Notification Settings
- ✅ **Bảo mật**: Email read-only, password validation chặt chẽ

**Tổng thời gian ước tính**: 2 tuần (0.5 tháng) với team 2 fresher

**Lưu ý**: 
- Phase 1: General Settings + Admin Profile (1.5 tuần)
- Phase 2: Payment, Shipping, Notification Settings (2 tuần - làm sau)


# 11. ✨ Quản lý đơn vị tính (Units Management)  - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 1. 📋 Tổng Quan

### 1.1 Phase 1 (MVP - Đơn Giản)
- Chỉ Admin quản lý đơn vị tính (Seller chỉ chọn, không được tạo/sửa/xoá).
- Đơn vị tính được dùng chung cho tất cả sản phẩm (không gắn với category).
- Mỗi đơn vị có: Tên hiển thị (label), Ký hiệu (symbol), Trạng thái (status).
- Form đơn giản, không cần code phức tạp (không cần auto-generate code như Attribute).

### 1.2 Phase 2 (Nâng Cấp - Làm Sau)
- Thêm cột "Số sản phẩm đang dùng đơn vị này".
- Thêm phân nhóm đơn vị (Weight, Length, Quantity...).
- Thêm multi-language label (VD: tiếng Anh, tiếng Việt).
- Thêm soft-delete & lịch sử thay đổi (audit log).

---

## 2. 🎨 LAYOUT CHI TIẾT - UNITS

### 2.1 📋 Units List Page (`/admin/unit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⚖️ Units                                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search units...  [Status: ▼ All]  [+ Add Unit]             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚖️ All Units List                                [X units]        │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │   │
│  │  ┌───┬──────────┬──────────────────────┬──────────┬──────────┬──────┬──────┐ │
│  │  │ ☐ │   ID     │  Unit Label          │ Symbol   │ Status   │Created│Action│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────┼──────┤ │
│  │  │ ☐ │ U-0001   │  Kilogram            │  kg      │  [✅]    │10 Sep│ [✏️]│ │
│  │  │   │          │                      │          │ Active   │ 2023 │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────┼──────┤ │
│  │  │ ☐ │ U-0002   │  Gram                │  g       │  [✅]    │15 Sep│ [✏️]│ │
│  │  │   │          │                      │          │ Active   │ 2023 │ [🗑️]│ │
│  │  ├───┼──────────┼──────────────────────┼──────────┼──────────┼──────┼──────┤ │
│  │  │ ☐ │ U-0003   │  Box                 │  box     │  [❌]    │20 Sep│ [✏️]│ │
│  │  │   │          │                      │          │ Inactive │ 2023 │ [🗑️]│ │
│  │  └───┴──────────┴──────────────────────┴──────────┴──────────┴──────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-10 of 25 units      [< Prev] [1] [2] [3] [Next >]   │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  ⚖️ Units                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔍] Search units...                                 │ │
│  │  [Status: ▼ All] [Active] [Inactive]                  │ │
│  │  [+ Add Unit]                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (7 cột):**
1. **Checkbox** (☐) - 40px width - Select để bulk actions (Phase 2).
2. **ID** - Mã hiển thị cho đơn vị (VD: U-0001, U-0002) – có thể sinh ở backend hoặc reuse trường `id`.
3. **Unit Label** - Tên đơn vị (VD: Kilogram, Gram, Box).
4. **Symbol** - Ký hiệu (VD: kg, g, box, pcs).
5. **Status** - Badge màu:
   - `[✅ Active]` - Green badge.
   - `[❌ Inactive]` - Grey badge.
6. **Created On** - Ngày tạo (format: DD MMM YYYY, VD: 10 Sep 2023).
7. **Actions** - Icons: `[✏️ Edit] [🗑️ Delete]`.

**Pagination:**
```
Showing 1-10 of 25 units    [< Prev] [1] [2] [3] [Next >]
```

**Features:**
- **Search**: Tìm theo `label` hoặc `symbol`.
- **Filter**: Theo Status (All/Active/Inactive).
- **Badge count**: "X units".
- **Pagination**: 10 items/page.
- **Edit**: Navigate tới trang edit đơn vị.
- **Delete**: Xoá đơn vị (có confirm + check sản phẩm đang dùng).

---

### 2.2 ➕ Unit Create Form (`/admin/unit/new`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⚖️ Units > Unit Add                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Add Unit                                                           │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Unit Label *                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Kilogram                                              │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Symbol *                                                    │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  kg                                                     │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │  ℹ️ Ký hiệu ngắn gọn: kg, g, box, pcs...                     │ │   │
│  │  │                                                               │ │   │
│  │  │  Status *                                                    │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                 │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                              [Save Unit]    │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**1. Unit Label**
- Type: Text input.
- Required: Yes.
- Placeholder: "Enter unit name".
- Max length: 100 characters.
- Validation: Required, unique (không trùng tên đơn vị khác).

**2. Symbol**
- Type: Text input.
- Required: Yes.
- Placeholder: "Enter symbol (kg, g, box...)".
- Max length: 20 characters.
- Validation: Required, unique (không trùng symbol khác).

**3. Status**
- Type: Toggle switch.
- Required: Yes.
- Default: Active (ON).
- Options: Active / Inactive.

**4. Buttons**
- **Cancel**: Link back to `/admin/unit`.
- **Save Unit**: Submit form, show loading, redirect về `/admin/unit`.

---

### 2.3 ✏️ Unit Edit Form (`/admin/unit/[id]/edit`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⚖️ Units > Unit Edit > Kilogram                                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Edit Unit                                                          │   │
│  │                                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │  Unit Information (Read-only)                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  ID: U-0001                                            │ │ │   │
│  │  │  │  Created At: 10 Sep 2023                               │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Unit Label *                                                 │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  Kilogram                                              │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Symbol *                                                    │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  kg                                                     │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  Status *                                                    │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Toggle: ON]  Active                                 │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐ │ │   │
│  │  │  │  [Cancel]                            [Edit Unit]      │ │ │   │
│  │  │  └─────────────────────────────────────────────────────────┘ │ │   │
│  │  │                                                               │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Form Fields:

**Khác biệt với Create:**
- Có section **Unit Information (Read-only)**:
  - **ID**: U-0001 (hoặc `id` từ DB, chỉ hiển thị, không sửa).
  - **Created At**: Ngày tạo (read-only).
- Tất cả fields còn lại được pre-fill từ API.
- Button: "Edit Unit" thay vì "Save Unit".

---

## 3. 📱 Responsive Design (Mobile)

**Units List (Mobile):**
```
┌─────────────────────────────┐
│  ⚖️ Units         [+ Add]   │
├─────────────────────────────┤
│  [🔍 Search...]             │
│  [Status: ▼ All]            │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  Kilogram             │ │
│  │  Symbol: kg           │ │
│  │  Created: 10 Sep 2023 │ │
│  │  [✅ Active]          │ │
│  │  [Edit] [Delete]      │ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 4. 🎨 UI Components Specs (Reuse từ Attributes)

### Colors:
- **Primary**: Blue (#2b8cee).
- **Success**: Green (#28a745) - Active status.
- **Grey**: #6c757d - Inactive status.
- **Background**: White (#ffffff).
- **Border**: Light gray (#dee2e6).

### Typography:
- **Heading**: Bold, 18px.
- **Table Header**: Bold, 14px.
- **Table Body**: Regular, 14px.
- **Button**: Medium, 14px.
- **Label**: Medium, 14px.
- **Helper Text**: Regular, 12px, grey.

### Spacing:
- **Padding**: 16px (card), 12px (table cell).
- **Margin**: 16px giữa các section.
- **Gap**: 8px giữa buttons, 12px giữa form fields.

### Icons:
- Search: 🔍
- Add: ➕
- Checkbox: ☐ / ☑
- Status: ✅ (Active), ❌ (Inactive).
- Actions: ✏️ (Edit), 🗑️ (Delete).

---

## 5. 📝 Implementation Notes

### 5.1 State Management:

```typescript
// Unit List State
{
  units: Unit[],
  loading: boolean,
  error: string | null,
  search: string,
  statusFilter: 'all' | 'active' | 'inactive',
  page: number,
  totalPages: number
}

// Unit Form State (Create/Edit)
{
  id: number | null,       // null khi create, có giá trị khi edit
  label: string,           // Unit Label
  symbol: string,          // Unit Symbol
  status: 'ACTIVE' | 'INACTIVE',
  createdAt?: string,      // chỉ dùng cho edit (read-only)
  loading: boolean,
  errors: Record<string, string>
}
```

### 5.2 API Calls (Đề xuất):
- `GET /api/admin/units?page=1&status=all&search=...`
- `GET /api/admin/units/:id`
- `POST /api/admin/units` (body: `{ label, symbol, status }`)
- `PUT /api/admin/units/:id` (body: `{ label, symbol, status }`)
- `DELETE /api/admin/units/:id`

**Note**:
- FE hiện đang dùng interface:

```typescript
export interface Units {
  id: number;
  label: string;
  symbol: string;
  status: string; // 'ACTIVE' | 'INACTIVE'
}
```

- Service hiện tại:

```typescript
export const getAllUnit = async (): Promise<Units[]> => {
  return await http.get("/unit").then((res) => res.data);
};
```

- Khi chuẩn hoá theo tài liệu này, nên:
  - Mapping `/api/admin/units` ↔ `/unit` (BE hiện tại).
  - Bổ sung thêm POST/PUT/DELETE trên backend nếu chưa có.

### 5.3 Validation Rules:
- **Unit Label**:
  - Required, 2-100 characters.
  - Unique (case-insensitive).
- **Symbol**:
  - Required, 1-20 characters.
  - Chỉ cho phép chữ cái, số, dấu `/` hoặc `-` (VD: kg, g, ml, pcs, box-10).
  - Unique.
- **Status**:
  - Required, `'ACTIVE' | 'INACTIVE'`.

---

## 6. 📊 Database Schema (Simplified)

```sql
CREATE TABLE units (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    label VARCHAR(255) NOT NULL,        -- Kilogram, Gram, Box...
    symbol VARCHAR(50) NOT NULL,        -- kg, g, box, pcs...
    status VARCHAR(20) NOT NULL,        -- ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_label (label),
    UNIQUE KEY uk_symbol (symbol),
    INDEX idx_status (status)
);
```

**Liên kết với sản phẩm (gợi ý):**

```sql
-- Ví dụ nếu muốn lưu đơn vị cho từng biến thể sản phẩm
ALTER TABLE product_variants
ADD COLUMN unit_id BIGINT NULL,
ADD CONSTRAINT fk_product_variant_unit
  FOREIGN KEY (unit_id) REFERENCES units(id);
```

---

## 7. 🔄 Workflow

### 7.1 Create Unit:
1. Admin vào menu `Units` → chọn **"+ Add Unit"**.
2. Nhập **Unit Label** (VD: Kilogram), **Symbol** (VD: kg), chọn **Status** (Active).
3. Bấm **"Save Unit"**.
4. FE validate form (required, max length, format) → gọi API `POST /unit` (hoặc `/api/admin/units`).
5. Nếu backend trả lỗi (trùng `label`/`symbol`, data không hợp lệ) → hiển thị error dưới field + toast lỗi.
6. Nếu thành công → hiển thị toast thành công → redirect về `/admin/unit` → reload list.

### 7.2 Edit Unit:
1. Tại trang danh sách `/admin/unit`, Admin chọn icon **Edit (✏️)** ở dòng cần sửa.
2. Điều hướng đến `/admin/unit/[id]/edit` và gọi API `GET /unit/:id` để lấy dữ liệu hiện tại.
3. FE pre-fill form với: **Unit Label, Symbol, Status**, và hiển thị block **Unit Information** (ID, Created At - read-only).
4. Admin chỉnh sửa Label/Symbol/Status → bấm **"Edit Unit"**.
5. FE validate → gọi API `PUT /unit/:id`.
6. Nếu lỗi (trùng label/symbol, không tìm thấy unit, v.v.) → hiển thị error + toast.
7. Nếu thành công → toast thành công → redirect về `/admin/unit` hoặc stay on page và update state.

### 7.3 Delete Unit:
1. Tại trang `/admin/unit`, Admin bấm icon **Delete (🗑️)** ở dòng đơn vị cần xoá.
2. FE hiển thị **confirm dialog**: `"Are you sure you want to delete this unit?"`.
3. Khi confirm → FE gọi API `DELETE /unit/:id`.
4. Backend kiểm tra:
   - Nếu đơn vị đang được sử dụng bởi sản phẩm/biến thể → trả lỗi (VD: 409 Conflict) với message `"Cannot delete unit in use by products."`.
   - Nếu không dùng → xoá (hoặc set status = INACTIVE tuỳ business).
5. FE xử lý response:
   - Nếu lỗi → hiển thị toast lỗi + giữ nguyên dòng.
   - Nếu thành công → xoá dòng khỏi list hoặc cập nhật status thành Inactive.

### 7.4 Seller sử dụng Unit khi tạo sản phẩm (gợi ý luồng):
1. Seller vào `/seller/products/create` (hoặc form tạo biến thể).
2. Ở phần **Inventory / Pricing**, FE hiển thị dropdown **Unit** (data lấy từ `GET /unit?status=ACTIVE`).
3. Seller chọn đơn vị (VD: kg, box, pcs) cho sản phẩm/biến thể.
4. Khi submit sản phẩm, FE gửi `unitId` (hoặc `unit.symbol`) lên backend.
5. Backend lưu `unit_id` vào bảng `products` hoặc `product_variants` theo thiết kế.
6. Khi hiển thị sản phẩm cho khách, FE render số lượng + ký hiệu đơn vị (VD: `500 g`, `1 box`, `3 pcs`).

---

## 8. ✅ Checklist Implementation

### 8.1 Units List (1 fresher - 1 tuần):
- [ ] Tạo table component với 7 cột.
- [ ] Fetch data từ API `/unit` (hoặc `/api/admin/units`).
- [ ] Hiển thị data trong table.
- [ ] Search theo `label`/`symbol`.
- [ ] Filter theo status.
- [ ] Pagination (10 items/page).
- [ ] Badge count tổng số units.
- [ ] Edit button (navigate tới edit form).
- [ ] Delete button (with confirmation).
- [ ] Loading state.
- [ ] Error handling.

### 8.2 Unit Create Form (1 fresher - 0.5–1 tuần):
- [ ] Tạo form với 3 fields (Label, Symbol, Status).
- [ ] Validation trên FE (required, max length).
- [ ] Submit form (API call POST).
- [ ] Loading state.
- [ ] Error handling (trùng label/symbol).
- [ ] Success redirect về `/admin/unit`.

### 8.3 Unit Edit Form (1 fresher - 0.5 tuần):
- [ ] Tạo form reuse từ Create.
- [ ] Unit Information section (read-only): ID, Created At.
- [ ] Pre-fill data từ API `GET /units/:id`.
- [ ] Submit update (API call PUT).
- [ ] Loading state.
- [ ] Error handling.
- [ ] Success redirect.

### 8.4 Backend API (1–2 fresher - 1 tuần):
- [ ] `GET /unit` (list với search, filter, pagination).
- [ ] `GET /unit/:id` (detail).
- [ ] `POST /unit` (create).
- [ ] `PUT /unit/:id` (update).
- [ ] `DELETE /unit/:id` (delete/soft-delete tuỳ business).
- [ ] Validation (unique label, symbol).
- [ ] Error responses chuẩn (409 conflict, 400, 404...).

### 8.5 Testing & Integration (1 fresher - 0.5 tuần):
- [ ] Test API endpoints (Postman/Integration tests).
- [ ] Test frontend components (list + form).
- [ ] Test validation (FE + BE).
- [ ] Test delete flow (đang được dùng / không dùng).
- [ ] Bug fixes.

---

## 9. 🚀 Timeline Đề Xuất

### 9.1 Tuần 1: Units List
- Table component.
- Search, Filter, Pagination.
- Actions (Edit, Delete).

### 9.2 Tuần 2: Unit Create & Edit Form
- Form component (reuse).
- Validation.
- Tích hợp API.

### 9.3 Tuần 3: Backend API + Testing
- CRUD endpoints cho units.
- Validation + error handling.
- Integration + bug fixing.

---

## 10. 📌 Notes

1. **Đơn vị tính là global**: Áp dụng chung cho toàn hệ thống, không phân theo category.
2. **Chỉ Admin được quản lý**: Seller chỉ chọn trong danh sách có sẵn.
3. **Không cho xoá cứng nếu đang được sử dụng** (Phase 2 có thể thêm hard rule).
4. **Status = Inactive**: Có thể ẩn khỏi dropdown cho seller nhưng vẫn giữ lịch sử dữ liệu.
5. **Có thể mở rộng**: Thêm trường `precision`, `type` (weight/length/quantity) ở Phase 2 nếu cần.

---

# 12. 👤 Quản lý người dùng (User Management) - Layout Chi Tiết (Phiên Bản Đơn Giản Hóa)

## 📋 Tổng Quan

### Phase 1 (MVP - Đơn Giản)
- Chỉ Admin được truy cập màn `/admin/user`.
- Chỉ tập trung vào:
  - Xem danh sách user.
  - Đổi **role**: `USER`, `SELLER`, `ADMIN`.
  - **Block / Unblock** tài khoản (status).
- Không cho tạo user bằng tay, không sửa profile chi tiết.

### Phase 2 (Nâng Cấp - Làm Sau)
- Thêm filter nâng cao, lịch sử hoạt động (audit log).
- Thêm chi tiết profile (địa chỉ, SĐT, KYC...).
- Thêm phân quyền chi tiết theo permission.

---

## 🎨 LAYOUT CHI TIẾT - USER MANAGEMENT

### 📋 1. User List Page (`/admin/user`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Venton                    [≡]  [👤 Admin] [Logout]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  👤 Users                                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [🔍] Search by email...                                            │   │
│  │  [Role: ▼ All]  [Status: ▼ All]                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  👤 All Users List                               [X users]          │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                       │ │
│  │  ┌───┬──────────┬──────────────────────────┬──────────┬──────────┬─────────┬──────┐ │
│  │  │ ☐ │   ID     │  Email                   │  Role    │ Status   │Created  │Action│ │
│  │  ├───┼──────────┼──────────────────────────┼──────────┼──────────┼─────────┼──────┤ │
│  │  │ ☐ │ U-0001   │ user1@mail.com           │  USER    │ [✅]     │10 Sep   │[⋮]  │ │
│  │  │   │          │                          │          │ Active   │ 2023    │      │ │
│  │  ├───┼──────────┼──────────────────────────┼──────────┼──────────┼─────────┼──────┤ │
│  │  │ ☐ │ U-0002   │ seller@mail.com          │ SELLER   │ [✅]     │11 Sep   │[⋮]  │ │
│  │  │   │          │                          │          │ Active   │ 2023    │      │ │
│  │  ├───┼──────────┼──────────────────────────┼──────────┼──────────┼─────────┼──────┤ │
│  │  │ ☐ │ U-0003   │ spam@mail.com            │  USER    │ [❌]     │12 Sep   │[⋮]  │ │
│  │  │   │          │                          │          │ Blocked  │ 2023    │      │ │
│  │  └───┴──────────┴──────────────────────────┴──────────┴──────────┴─────────┴──────┘ │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Showing 1-10 of 120 users   [< Prev] [1] [2] [3] [Next >]     │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Chi Tiết Layout:

**Header Section:**
```
┌──────────────────────────────────────────────────────────────┐
│  👤 Users                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [🔍] Search by email...                               │ │
│  │ [Role: ▼ All]  [USER] [SELLER] [ADMIN]                │ │
│  │ [Status: ▼ All] [Active] [Blocked]                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Table Columns (7 cột):**
1. **Checkbox** (☐) – dùng cho bulk action Phase 2.
2. **ID** – mã hiển thị (có thể dùng `id` DB, format: U-0001...).
3. **Email** – email đăng ký của user.
4. **Role** – `USER` / `SELLER` / `ADMIN`.
5. **Status** – badge:
   - `[✅ Active]` – user hoạt động bình thường.
   - `[❌ Blocked]` – user bị khoá.
6. **Created** – ngày tạo (DD MMM YYYY).
7. **Actions** – menu `[⋮]` (3 chấm) mở popup:

```
[⋮] Menu:
- Change Role...
- Block User / Unblock User
```

---

## 📱 Responsive Design (Mobile)

**User List (Mobile):**
```
┌─────────────────────────────┐
│  👤 Users          [Filter] │
├─────────────────────────────┤
│  [🔍 Search by email...]    │
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │  user1@mail.com       │ │
│  │  ID: U-0001           │ │
│  │  Role: USER           │ │
│  │  Status: [✅ Active]  │ │
│  │  10 Sep 2023          │ │
│  │  [Change Role]        │ │
│  │  [Block User]         │ │
│  └───────────────────────┘ │
│  [< Prev] [1] [2] [Next >] │
└─────────────────────────────┘
```

---

## 📝 Implementation Notes

### State Management:

```typescript
// User List State
{
  users: User[],
  loading: boolean,
  error: string | null,
  search: string,
  roleFilter: 'all' | 'USER' | 'SELLER' | 'ADMIN',
  statusFilter: 'all' | 'ACTIVE' | 'BLOCKED',
  page: number,
  totalPages: number
}

// Change Role Modal State
{
  open: boolean,
  userId: number | null,
  currentRole: 'USER' | 'SELLER' | 'ADMIN' | null,
  newRole: 'USER' | 'SELLER' | 'ADMIN' | null,
  loading: boolean,
  error: string | null
}
```

### API Calls (Đề xuất):

- `GET /admin/users?search=&role=&status=&page=&pageSize=`
- `PUT /admin/users/{id}/role` – body: `{ role: 'USER' | 'SELLER' | 'ADMIN' }`
- `PUT /admin/users/{id}/status` – body: `{ status: 'ACTIVE' | 'BLOCKED' }`

**Model FE:**

```typescript
type User = {
  id: number;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
};
```

---

## 🔄 Workflow

### 1. Load User List:

1. Admin mở `/admin/user`.
2. FE đọc `search`, `roleFilter`, `statusFilter`, `page` từ state.
3. Gọi `GET /admin/users?...` với các query tương ứng.
4. Backend trả về `users`, `totalPages`.
5. FE:
   - Hiển thị bảng.
   - Hiển thị pagination và badge `[X users]`.

### 2. Change Role:

1. Admin click **[⋮] → "Change Role..."** ở 1 dòng user.
2. FE mở modal:
   - Hiển thị email + role hiện tại.
   - Dropdown chọn role mới: `USER`, `SELLER`, `ADMIN`.
3. Admin chọn role mới → click **Save**.
4. FE validate (role khác hiện tại) → gọi `PUT /admin/users/{id}/role`.
5. Backend:
   - Kiểm tra: chỉ `ADMIN` mới được gọi.
   - Cập nhật role trong DB.
6. FE:
   - Nếu success → toast “Updated role successfully” + cập nhật dòng trong list.
   - Nếu error → hiển thị error message trong modal.

### 3. Block / Unblock User:

1. Admin click **[⋮] → "Block User"** (nếu đang Active) hoặc **"Unblock User"** (nếu đang Blocked).
2. FE show confirm dialog:
   - Block: `"Block this user? They will not be able to sign in."`
   - Unblock: `"Unblock this user?"`
3. Sau khi confirm:
   - Block: gọi `PUT /admin/users/{id}/status` body `{ status: 'BLOCKED' }`.
   - Unblock: gọi `PUT /admin/users/{id}/status` body `{ status: 'ACTIVE' }`.
4. Backend:
   - Update status trong DB.
   - Optionally: revoke tokens của user nếu đang login.
5. FE:
   - Nếu success → cập nhật badge Status trong list + toast.
   - Nếu error → toast lỗi, không đổi status trên UI.

---

## ✅ Checklist Implementation

### User List (1 fresher - 1 tuần):
- [ ] Tạo table component với các cột: ID, Email, Role, Status, Created, Actions.
- [ ] Tích hợp API `GET /admin/users` với search + filter + pagination.
- [ ] Hiển thị trạng thái loading & error.
- [ ] Search theo email.
- [ ] Filter theo role.
- [ ] Filter theo status.
- [ ] Pagination (10 users/page).

### Change Role (1 fresher - 0.5 tuần):
- [ ] Tạo menu `[⋮]` + modal "Change Role".
- [ ] Dropdown chọn role mới.
- [ ] Gọi API `PUT /admin/users/{id}/role`.
- [ ] Xử lý loading, error, toast success.
- [ ] Cập nhật lại dòng trong bảng sau khi đổi role.

### Block / Unblock (1 fresher - 0.5 tuần):
- [ ] Thêm action "Block User" / "Unblock User" trong menu `[⋮]`.
- [ ] Confirm dialog trước khi gọi API.
- [ ] Gọi API `PUT /admin/users/{id}/status`.
- [ ] Xử lý loading, error, toast success.
- [ ] Cập nhật Status trong list.

---

## 🚀 Timeline Đề Xuất

- **Tuần 1**:
  - Hoàn thành User List (table + search + filters + pagination).
- **Tuần 2**:
  - Implement Change Role + Block/Unblock (FE + BE).
  - Test & fix bug.

---

## 📌 Notes

1. **Chỉ Admin** được truy cập `/admin/user` và gọi các API `/admin/users/**`.
2. **Không cho phép** Admin tự block chính mình (nếu là last admin).
3. Khi block user, nên **revoke session/token** để user bị logout khỏi hệ thống.
4. Role `ADMIN` nên được bảo vệ đặc biệt (không dễ bị hạ role nếu đang là last admin).