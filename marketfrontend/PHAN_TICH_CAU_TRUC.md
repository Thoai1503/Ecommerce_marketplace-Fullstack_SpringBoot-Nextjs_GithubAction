# Phân Tích Cấu Trúc Tổ Chức File - Dự Án E-commerce Marketplace

## 📋 Tổng Quan Dự Án

Đây là một dự án **Next.js 16** (App Router) với **TypeScript**, xây dựng một sàn thương mại điện tử (E-commerce Marketplace) fullstack với:
- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Libraries**: Ant Design, Material UI, Bootstrap, Tailwind CSS
- **State Management**: TanStack React Query
- **HTTP Client**: Axios
- **Backend**: Spring Boot (được đề cập trong tên thư mục gốc)

---

## 🏗️ Cấu Trúc Thư Mục Chính

```
marketfrontend/
├── src/                          # Source code chính
│   ├── app/                      # Next.js App Router (Pages & Layouts)
│   ├── components/               # React Components
│   ├── feature/                  # Feature-based modules
│   ├── service/                  # API Service layer
│   ├── query/                    # React Query configurations
│   ├── hooks/                    # Custom React Hooks
│   ├── lib/                      # Core libraries/config
│   ├── helper/                   # Utility functions
│   ├── types/                    # TypeScript type definitions
│   └── validators/               # Data validation schemas
├── public/                       # Static assets
├── package.json                  # Dependencies
└── next.config.ts                # Next.js configuration
```

---

## 📁 Chi Tiết Từng Thư Mục

### 1. **`src/app/`** - Next.js App Router

Đây là thư mục chính của Next.js App Router, chứa các routes và layouts.

#### **Cấu trúc:**
```
app/
├── layout.tsx                    # Root layout (global)
├── globals.css                   # Global styles
├── (user)/                       # Route group cho user pages
│   ├── layout.tsx                # Layout cho user (có header/footer)
│   ├── page.tsx                  # Trang chủ user
│   └── profile/
│       └── page.tsx              # Trang profile user
├── admin/                        # Admin routes
│   ├── layout.tsx                # Layout admin (có Sidebar)
│   ├── page.tsx                  # Dashboard admin
│   ├── category/
│   ├── attribute/
│   ├── category-attribute/
│   ├── unit/
│   ├── orders/
│   ├── user/
│   └── products/
├── seller/                       # Seller routes
│   ├── layout.tsx                # Layout seller (có Sidebar)
│   ├── page.tsx                  # Dashboard seller
│   └── product/
│       ├── page.tsx              # Danh sách sản phẩm
│       └── new/
│           └── page.tsx          # Tạo sản phẩm mới
├── login/
│   └── page.tsx                  # Trang đăng nhập
└── register/
    └── page.tsx                  # Trang đăng ký
```

**Đặc điểm:**
- Sử dụng **Route Groups** `(user)` để nhóm routes mà không ảnh hưởng URL
- Mỗi section (admin, seller, user) có layout riêng
- File-based routing: mỗi `page.tsx` là một route

---

### 🔗 Cách Next.js App Router Quản Lý Routes (Chi Tiết)

#### **Nguyên Tắc Cơ Bản:**

Next.js App Router sử dụng **File-based Routing** - nghĩa là:
- **Tên thư mục** = **URL path**
- **File `page.tsx`** = **Route endpoint**
- **File `layout.tsx`** = **Layout wrapper**

#### **Ví Dụ Cụ Thể: URL `/admin/category`**

**Cấu trúc file:**
```
src/app/
└── admin/
    ├── layout.tsx          # Layout cho tất cả routes bắt đầu với /admin
    ├── page.tsx            # Route: /admin (Dashboard)
    └── category/
        └── page.tsx        # Route: /admin/category ✅
```

**Giải thích:**
1. Khi bạn truy cập URL: `http://localhost:3000/admin/category`
2. Next.js sẽ tìm file: `src/app/admin/category/page.tsx`
3. Next.js sẽ áp dụng layout: `src/app/admin/layout.tsx` (layout cha)
4. Kết quả: Render `category/page.tsx` bên trong `admin/layout.tsx`

**Code trong `admin/layout.tsx`:**
```typescript
export default function AdminLayout({ children }) {
  return (
    <>
      <Sidebar />              {/* Sidebar luôn hiển thị */}
      <div className="main-content">
        {children}              {/* Đây là nơi render category/page.tsx */}
      </div>
    </>
  );
}
```

**Code trong `admin/category/page.tsx`:**
```typescript
export default function CategoryPage() {
  return <div>Category Management Content</div>;
}
```

**Kết quả render:**
```
┌─────────────────────────────────────┐
│  [Sidebar]  │  Category Management │
│             │  Content              │
└─────────────────────────────────────┘
```

---

#### **Bảng Mapping URL → File:**

| URL | File Path | Giải Thích |
|-----|-----------|------------|
| `/` | `app/page.tsx` | Trang chủ (root) |
| `/login` | `app/login/page.tsx` | Trang đăng nhập |
| `/register` | `app/register/page.tsx` | Trang đăng ký |
| `/admin` | `app/admin/page.tsx` | Dashboard admin |
| `/admin/category` | `app/admin/category/page.tsx` | ✅ Quản lý danh mục |
| `/admin/products` | `app/admin/products/page.tsx` | Quản lý sản phẩm |
| `/admin/orders` | `app/admin/orders/page.tsx` | Quản lý đơn hàng |
| `/admin/user` | `app/admin/user/page.tsx` | Quản lý người dùng |
| `/seller` | `app/seller/page.tsx` | Dashboard seller |
| `/seller/product` | `app/seller/product/page.tsx` | Danh sách sản phẩm seller |
| `/seller/product/new` | `app/seller/product/new/page.tsx` | Tạo sản phẩm mới |

---

#### **Route Groups `(user)` - Không Ảnh Hưởng URL:**

**Cấu trúc:**
```
app/
├── (user)/              # Route Group - KHÔNG xuất hiện trong URL
│   ├── layout.tsx       # Layout riêng cho user pages
│   ├── page.tsx         # Route: / (KHÔNG phải /user)
│   └── profile/
│       └── page.tsx     # Route: /profile (KHÔNG phải /user/profile)
```

**Giải thích:**
- `(user)` là **Route Group** - chỉ để tổ chức code, **KHÔNG** xuất hiện trong URL
- URL vẫn là `/` và `/profile`, không phải `/user` hay `/user/profile`
- Mục đích: Nhóm các routes có cùng layout mà không thay đổi URL structure

**Ví dụ:**
```
URL: /profile
File: app/(user)/profile/page.tsx
Layout: app/(user)/layout.tsx
```

---

#### **Dynamic Routes `[id]` - Routes Động:**

**Cấu trúc:**
```
app/
└── admin/
    └── category-attribute/
        ├── page.tsx              # Route: /admin/category-attribute
        └── [id]/
            └── page.tsx          # Route: /admin/category-attribute/123
```

**Giải thích:**
- `[id]` là **Dynamic Segment** - nhận giá trị động từ URL
- URL: `/admin/category-attribute/123` → `id = "123"`
- URL: `/admin/category-attribute/456` → `id = "456"`

**Code trong `[id]/page.tsx`:**
```typescript
export default function CategoryAttributePage({ params }) {
  const { id } = params;  // id = "123" từ URL
  
  return <div>Category Attribute ID: {id}</div>;
}
```

**Ví dụ khác:**
```
app/admin/products/
├── page.tsx              # /admin/products (List)
├── new/
│   └── page.tsx         # /admin/products/new (Create)
└── [id]/
    ├── page.tsx         # /admin/products/123 (Detail)
    └── edit/
        └── page.tsx     # /admin/products/123/edit (Edit)
```

---

#### **Nested Routes - Routes Lồng Nhau:**

**Cấu trúc:**
```
app/
└── admin/
    ├── layout.tsx                    # Layout cho /admin/*
    ├── page.tsx                      # /admin
    ├── category/
    │   ├── page.tsx                  # /admin/category
    │   └── new/
    │       └── page.tsx              # /admin/category/new
    └── products/
        ├── page.tsx                  # /admin/products
        ├── new/
        │   └── page.tsx              # /admin/products/new
        └── [id]/
            ├── page.tsx              # /admin/products/123
            └── edit/
                └── page.tsx          # /admin/products/123/edit
```

**Layout Hierarchy (Thứ tự áp dụng):**
```
1. app/layout.tsx                    # Root layout (tất cả pages)
   ↓
2. app/admin/layout.tsx              # Admin layout (tất cả /admin/*)
   ↓
3. app/admin/category/page.tsx       # Category page
```

**Kết quả:**
- `/admin/category` sẽ có cả 2 layouts: root layout + admin layout
- `/admin/products/123` sẽ có cả 2 layouts: root layout + admin layout

---

#### **Layout.tsx - Wrapper Component:**

**File: `app/admin/layout.tsx`**
```typescript
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />                    {/* Sidebar luôn hiển thị */}
      <div className="main-content">
        {children}                    {/* Nội dung của page */}
      </div>
    </div>
  );
}
```

**Giải thích:**
- `{children}` là nơi render nội dung của page con
- Layout được áp dụng cho **TẤT CẢ** routes bên trong thư mục đó
- Ví dụ: `/admin/category`, `/admin/products`, `/admin/orders` đều có Sidebar

---

#### **Ví Dụ Hoàn Chỉnh: Flow `/admin/category`**

**1. User truy cập:** `http://localhost:3000/admin/category`

**2. Next.js tìm file:**
```
✅ Tìm thấy: src/app/admin/category/page.tsx
```

**3. Next.js áp dụng layouts (từ ngoài vào trong):**
```
app/layout.tsx                    # Root layout (HTML, body, etc.)
  ↓
app/admin/layout.tsx              # Admin layout (Sidebar + main-content)
  ↓
app/admin/category/page.tsx       # Category page content
```

**4. Render kết quả:**
```html
<html>
  <body>
    <!-- Root Layout -->
    <div className="root-layout">
      <!-- Admin Layout -->
      <div className="admin-layout">
        <Sidebar />                {/* Từ admin/layout.tsx */}
        <div className="main-content">
          <!-- Category Page Content -->
          <div>Category Management</div>  {/* Từ category/page.tsx */}
        </div>
      </div>
    </div>
  </body>
</html>
```

---

#### **Quy Tắc Quan Trọng:**

1. **File `page.tsx` là bắt buộc** để tạo route
   - ❌ `app/admin/category/` (không có page.tsx) → Route không tồn tại
   - ✅ `app/admin/category/page.tsx` → Route `/admin/category` hoạt động

2. **File `layout.tsx` là optional** nhưng rất hữu ích
   - Nếu có: Áp dụng cho tất cả routes con
   - Nếu không: Chỉ dùng layout cha

3. **Route Groups `(folder)` không xuất hiện trong URL**
   - `app/(user)/page.tsx` → URL: `/` (KHÔNG phải `/user`)
   - `app/(user)/profile/page.tsx` → URL: `/profile` (KHÔNG phải `/user/profile`)

4. **Dynamic Routes `[param]` nhận giá trị từ URL**
   - `app/products/[id]/page.tsx` → `/products/123` → `params.id = "123"`

5. **Nested Routes tự động kế thừa layout cha**
   - `/admin/category` tự động có `admin/layout.tsx`

---

#### **Ví Dụ Thực Tế: Tạo Route Mới**

**Yêu cầu:** Tạo route `/admin/customers` (Quản lý khách hàng)

**Bước 1: Tạo thư mục và file**
```bash
mkdir -p src/app/admin/customers
touch src/app/admin/customers/page.tsx
```

**Bước 2: Code page.tsx**
```typescript
// src/app/admin/customers/page.tsx
"use client";

export default function CustomersPage() {
  return (
    <div className="container-fluid py-4">
      <h2>👥 Customer Management</h2>
      {/* Your content here */}
    </div>
  );
}
```

**Bước 3: Test**
- Truy cập: `http://localhost:3000/admin/customers`
- ✅ Route hoạt động!
- ✅ Tự động có Sidebar (từ `admin/layout.tsx`)

---

#### **Tóm Tắt:**

| Khái Niệm | Ví Dụ | Kết Quả |
|-----------|-------|---------|
| **File-based Routing** | `app/admin/category/page.tsx` | URL: `/admin/category` |
| **Layout Wrapper** | `app/admin/layout.tsx` | Áp dụng cho tất cả `/admin/*` |
| **Route Group** | `app/(user)/page.tsx` | URL: `/` (không có `/user`) |
| **Dynamic Route** | `app/products/[id]/page.tsx` | URL: `/products/123` → `id = "123"` |
| **Nested Route** | `app/admin/products/new/page.tsx` | URL: `/admin/products/new` |

**Kết luận:** 
- ✅ URL `/admin/category` → File `app/admin/category/page.tsx`
- ✅ Tự động có layout từ `app/admin/layout.tsx`
- ✅ Không cần config routes thủ công như React Router!

---

### 2. **`src/components/`** - React Components

Chứa các React components được tái sử dụng.

```
components/
├── admin/
│   ├── Sidebar.tsx               # Sidebar navigation cho admin
│   └── category_attribute_page/
│       └── CategoryAttributeManager.tsx
├── seller/
│   └── SideBar.tsx               # Sidebar navigation cho seller
├── common/
│   └── Toast.tsx                 # Toast notification component
├── context/
│   └── RootProvider.tsx          # Context provider (React Query)
└── HeaderAuth.tsx                # Header authentication component
```

**Đặc điểm:**
- Tổ chức theo domain (admin, seller, common)
- Components được tách riêng theo chức năng

---

### 3. **`src/feature/`** - Feature-Based Modules

Tổ chức code theo **Feature-based architecture** - mỗi feature có đầy đủ logic riêng.

```
feature/
├── admin/
│   ├── service.ts                # API services cho admin
│   ├── hook.ts                   # Custom hooks cho admin
│   └── typs.ts                   # TypeScript types cho admin
├── seller/
│   ├── service.ts                # API services cho seller
│   ├── hooks.ts                  # Custom hooks cho seller
│   ├── query.ts                  # React Query configs
│   ├── types.ts                  # TypeScript types
│   └── components/
│       └── CategorySelectorModal.tsx
└── client/
    ├── service.ts                # API services cho client/user
    ├── hook.ts                   # Custom hooks
    └── query.ts                  # React Query configs
```

**Đặc điểm:**
- Mỗi feature (admin, seller, client) tự chứa:
  - Service layer (API calls)
  - Hooks (business logic)
  - Types (TypeScript definitions)
  - Components (nếu cần)
- Giúp code dễ maintain và scale

---

### 4. **`src/service/`** - API Service Layer

Chứa các functions gọi API, tách biệt khỏi React components.

```
service/
├── category.ts                   # Category API calls
├── categoryAttribute.ts          # Category-Attribute API calls
└── unit.ts                       # Unit API calls
```

**Ví dụ:**
```typescript
// service/category.ts
export const getAllCategory = async (): Promise<DbCategory[]> => {
  return await http.get("/category").then((res) => res.data);
};
```

**Đặc điểm:**
- Tách biệt API logic khỏi components
- Dễ test và reuse

---

### 5. **`src/query/`** - React Query Configurations

Chứa các React Query query options.

```
query/
├── category.ts                   # Category queries
├── categoryAttribute.ts          # Category-Attribute queries
└── unit.ts                       # Unit queries
```

**Ví dụ:**
```typescript
// query/category.ts
export const categoryQuery = {
  list: queryOptions({
    queryKey: ["category"],
    queryFn: () => getAllCategory(),
    refetchOnWindowFocus: false,
  }),
};
```

**Đặc điểm:**
- Centralized query configurations
- Dễ quản lý cache và refetch logic

---

### 6. **`src/hooks/`** - Custom React Hooks

Chứa các custom hooks cho business logic.

```
hooks/
└── admin/
    └── category_page/
        └── useCategoryPage.ts    # Hook cho category page
```

**Đặc điểm:**
- Tách business logic ra khỏi components
- Có thể reuse ở nhiều nơi

---

### 7. **`src/lib/`** - Core Libraries

Chứa các core libraries và configurations.

```
lib/
└── http.ts                       # Axios instance với interceptors
```

**Đặc điểm:**
- `http.ts`: Axios instance được config sẵn với:
  - Base URL
  - Authentication token (từ localStorage)
  - Request/Response interceptors
  - FormData handling

---

### 8. **`src/helper/`** - Utility Functions

Chứa các helper functions và utilities.

```
helper/
├── api.ts                        # API URL constants
└── utils.ts                      # Utility functions
```

**Ví dụ:**
```typescript
// helper/api.ts
export const API_URL = "http://localhost:8000";
```

---

### 9. **`src/types/`** - TypeScript Types

Chứa các TypeScript type definitions.

```
types/
└── admin-sidebar-minimal.ts      # Types cho admin sidebar
```

**Đặc điểm:**
- Centralized type definitions
- Có thể share types giữa các modules

---

### 10. **`src/validators/`** - Data Validation

Chứa các validation schemas (có thể dùng Zod, Yup, etc.).

```
validators/
├── attribute.ts                  # Attribute validation
├── categoryAttribute.ts          # Category-Attribute validation
├── product.ts                    # Product validation
└── units.ts                      # Unit validation
```

**Đặc điểm:**
- Validate data trước khi gửi API
- Type-safe validation

---

## 🎯 Kiến Trúc Tổng Thể

### **Pattern được sử dụng:**

1. **Feature-Based Architecture**
   - Code được tổ chức theo features (admin, seller, client)
   - Mỗi feature tự chứa đầy đủ logic cần thiết

2. **Layered Architecture**
   - **Presentation Layer**: `app/`, `components/`
   - **Business Logic Layer**: `feature/`, `hooks/`
   - **Data Layer**: `service/`, `query/`
   - **Infrastructure Layer**: `lib/`, `helper/`

3. **Separation of Concerns**
   - Services tách biệt khỏi components
   - Hooks tách business logic
   - Validators tách validation logic

---

## 🔄 Luồng Dữ Liệu

```
Component → Hook → Service → HTTP Client → API
                ↓
            React Query (Cache)
```

**Ví dụ flow:**
1. Component gọi custom hook
2. Hook sử dụng React Query để fetch data
3. React Query gọi service function
4. Service function sử dụng `http` (Axios) để gọi API
5. Data được cache bởi React Query
6. Component nhận data từ hook

---

## 📦 Dependencies Chính

### **UI Libraries:**
- `antd` - Ant Design components
- `@mui/material` - Material UI
- `bootstrap` - Bootstrap CSS
- `tailwindcss` - Tailwind CSS

### **State Management:**
- `@tanstack/react-query` - Server state management

### **HTTP:**
- `axios` - HTTP client

### **Framework:**
- `next` - Next.js framework
- `react`, `react-dom` - React library

---

## 🎨 Styling Approach

Dự án sử dụng **multi-styling approach**:
- **Bootstrap** - Cho layout và grid system
- **Tailwind CSS** - Utility-first CSS
- **Ant Design** - Component library
- **Material UI** - Component library
- **Custom CSS** - Trong `globals.css` và module CSS

---

## 🔐 Authentication Flow

1. Token được lưu trong `localStorage`
2. `http.ts` interceptor tự động thêm token vào headers
3. Layouts có thể check authentication status

---

## 📝 Điểm Mạnh

✅ **Tổ chức rõ ràng**: Feature-based + Layered architecture  
✅ **Type-safe**: TypeScript được sử dụng xuyên suốt  
✅ **Reusable**: Components và hooks có thể tái sử dụng  
✅ **Maintainable**: Code được tách biệt theo concerns  
✅ **Scalable**: Dễ thêm features mới  

---

## ⚠️ Điểm Cần Cải Thiện

1. **Duplicate Code**: 
   - Có cả `service/` và `feature/*/service.ts` - nên thống nhất
   - Có cả `query/` và `feature/*/query.ts` - nên thống nhất

2. **Styling**: 
   - Quá nhiều CSS frameworks (Bootstrap, Tailwind, Ant Design, MUI) - nên chọn 1-2

3. **Type Definitions**:
   - Types rải rác ở nhiều nơi (`types/`, `feature/*/types.ts`, `validators/`) - nên centralize

4. **Empty Files**:
   - `src/feature/admin/service.ts` trống - nên xóa hoặc implement

---

## 🚀 Khuyến Nghị

1. **Thống nhất Service Layer**: Chọn một trong hai:
   - Option 1: Chỉ dùng `feature/*/service.ts` (recommended)
   - Option 2: Chỉ dùng `service/` và xóa feature services

2. **Thống nhất Query Layer**: Tương tự service layer

3. **Centralize Types**: Tạo `src/types/index.ts` để export tất cả types

4. **Chọn CSS Framework**: Nên chọn 1-2 frameworks chính để tránh conflict

5. **Environment Variables**: Nên dùng `.env` thay vì hardcode API URL trong `helper/api.ts`

---

## 📚 Kết Luận

Dự án có cấu trúc tổ chức **khá tốt** với:
- Feature-based architecture rõ ràng
- Separation of concerns tốt
- TypeScript được sử dụng đầy đủ

Tuy nhiên cần **refactor** một số phần để:
- Giảm duplicate code
- Thống nhất patterns
- Tối ưu dependencies

---

## 🛠️ HƯỚNG DẪN CODE VÀ DỰNG LAYOUT

### 📋 Tổng Quan Workflow

Khi bạn muốn dựng một layout/page mới, workflow như sau:

```
1. Design/Layout (admin-render.md) 
   ↓
2. Tạo Page Component (src/app/admin/[feature]/page.tsx)
   ↓
3. Tạo Service Functions (src/service/[feature].ts)
   ↓
4. Tạo Query Configs (src/query/[feature].ts)
   ↓
5. Tạo Custom Hook (src/hooks/admin/[feature]_page/use[Feature]Page.ts)
   ↓
6. Tạo Types (src/types/[feature].ts hoặc trong hook)
   ↓
7. Tạo Validators (src/validators/[feature].ts) - nếu cần
   ↓
8. Implement UI Components (sử dụng Bootstrap/Tailwind/Ant Design)
```

---

### 🎯 Ví Dụ Cụ Thể: Dựng "Products List Page"

Giả sử bạn muốn dựng trang **Products List** (`/admin/products`) theo layout trong `admin-render.md`.

#### **Bước 1: Tạo Page Component**

**File:** `src/app/admin/products/page.tsx`

```typescript
"use client";

import React from "react";
import { useProductsPage } from "@/hooks/admin/products_page/useProductsPage";
import { Search, Plus, Filter } from "lucide-react";

const ProductsPage = () => {
  const {
    products,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    handleCreateProduct,
    handleViewProduct,
    handleEditProduct,
    handleDeleteProduct,
  } = useProductsPage();

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="mb-4">
        <h2 className="h3 fw-bold mb-0">📦 Products</h2>
        <div className="d-flex gap-2 mt-3">
          <button 
            className="btn btn-primary"
            onClick={handleCreateProduct}
          >
            <Plus size={18} className="me-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        width="64"
                        height="64"
                        className="rounded"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.price}₫</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`badge ${
                        product.status === 'approved' ? 'bg-success' :
                        product.status === 'pending' ? 'bg-warning' :
                        'bg-danger'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        View
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
```

**Giải thích:**
- `"use client"`: Bắt buộc vì sử dụng hooks và state
- Import custom hook: `useProductsPage()` - chứa toàn bộ logic
- UI: Sử dụng Bootstrap classes (`container-fluid`, `card`, `table`, etc.)
- Icons: Sử dụng `lucide-react` (giống như Category page)

---

#### **Bước 2: Tạo Service Functions**

**File:** `src/service/products.ts`

```typescript
import http from "@/lib/http";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: 'pending' | 'approved' | 'rejected';
  image: string;
  // ... other fields
}

export interface CreateProductDto {
  name: string;
  price: number;
  stock: number;
  category_id: number;
  // ... other fields
}

// GET /api/admin/products
export const getAllProducts = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; total: number }> => {
  return await http
    .get("/admin/products", { params })
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching products:", error);
      throw error;
    });
};

// GET /api/admin/products/:id
export const getProductById = async (id: number): Promise<Product> => {
  return await http
    .get(`/admin/products/${id}`)
    .then((res) => res.data);
};

// POST /api/admin/products
export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  return await http
    .post("/admin/products", data)
    .then((res) => res.data);
};

// PUT /api/admin/products/:id
export const updateProduct = async (
  id: number,
  data: Partial<CreateProductDto>
): Promise<Product> => {
  return await http
    .put(`/admin/products/${id}`, data)
    .then((res) => res.data);
};

// DELETE /api/admin/products/:id
export const deleteProduct = async (id: number): Promise<void> => {
  return await http
    .delete(`/admin/products/${id}`)
    .then((res) => res.data);
};

// POST /api/admin/products/:id/approve
export const approveProduct = async (id: number): Promise<Product> => {
  return await http
    .post(`/admin/products/${id}/approve`)
    .then((res) => res.data);
};

// POST /api/admin/products/:id/reject
export const rejectProduct = async (
  id: number,
  reason: string
): Promise<Product> => {
  return await http
    .post(`/admin/products/${id}/reject`, { reason })
    .then((res) => res.data);
};
```

**Giải thích:**
- Sử dụng `http` từ `@/lib/http` (đã config sẵn base URL, auth token)
- Mỗi function tương ứng với 1 API endpoint
- Type-safe: Sử dụng TypeScript interfaces
- Error handling: Catch và log errors

---

#### **Bước 3: Tạo Query Configs**

**File:** `src/query/products.ts`

```typescript
import { queryOptions } from "@tanstack/react-query";
import { getAllProducts, getProductById } from "@/service/products";

export const productsQuery = {
  // List products với filters
  list: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) =>
    queryOptions({
      queryKey: ["products", "list", params],
      queryFn: () => getAllProducts(params),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  // Get product by ID
  detail: (id: number) =>
    queryOptions({
      queryKey: ["products", "detail", id],
      queryFn: () => getProductById(id),
      enabled: !!id, // Chỉ fetch khi có ID
    }),
};
```

**Giải thích:**
- `queryKey`: Unique key cho cache (quan trọng!)
- `queryFn`: Function gọi API (từ service)
- `staleTime`: Thời gian data được coi là "fresh"
- `refetchOnWindowFocus`: Có refetch khi focus window không

---

#### **Bước 4: Tạo Custom Hook**

**File:** `src/hooks/admin/products_page/useProductsPage.ts`

```typescript
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsQuery } from "@/query/products";
import {
  getAllProducts,
  deleteProduct,
  approveProduct,
  rejectProduct,
  type Product,
} from "@/service/products";
import { useRouter } from "next/navigation";

export const useProductsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query: Fetch products
  const {
    data,
    isLoading,
    error,
  } = useQuery(
    productsQuery.list({
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page,
      limit,
    })
  );

  // Mutation: Delete product
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // Invalidate và refetch products list
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });

  // Mutation: Approve product
  const approveMutation = useMutation({
    mutationFn: approveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });

  // Mutation: Reject product
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      rejectProduct(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });

  // Handlers
  const handleCreateProduct = () => {
    router.push("/admin/products/new");
  };

  const handleViewProduct = (id: number) => {
    router.push(`/admin/products/${id}`);
  };

  const handleEditProduct = (id: number) => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleApproveProduct = async (id: number) => {
    await approveMutation.mutateAsync(id);
  };

  const handleRejectProduct = async (id: number, reason: string) => {
    await rejectMutation.mutateAsync({ id, reason });
  };

  return {
    // Data
    products: data?.products || [],
    total: data?.total || 0,
    isLoading,
    error,

    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,

    // Handlers
    handleCreateProduct,
    handleViewProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleApproveProduct,
    handleRejectProduct,
  };
};
```

**Giải thích:**
- **State Management**: Quản lý search, filter, pagination
- **React Query**: Sử dụng `useQuery` để fetch data, `useMutation` để mutate
- **Cache Invalidation**: Sau khi mutate, invalidate cache để refetch
- **Navigation**: Sử dụng `useRouter` để navigate
- **Return**: Trả về tất cả data và handlers cho component sử dụng

---

#### **Bước 5: Tạo Types (nếu cần)**

**File:** `src/types/products.ts` (hoặc trong service file)

```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: 'pending' | 'approved' | 'rejected';
  image: string;
  category_id: number;
  seller_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stock: number;
  category_id: number;
  description?: string;
  // ... other fields
}
```

---

#### **Bước 6: Tạo Validators (nếu cần)**

**File:** `src/validators/products.ts`

```typescript
import { z } from "zod"; // hoặc Yup, Joi, etc.

export const createProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  category_id: z.number().positive("Category is required"),
  description: z.string().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
```

---

### 📐 Cấu Trúc File Hoàn Chỉnh

Sau khi hoàn thành, cấu trúc file sẽ như sau:

```
src/
├── app/
│   └── admin/
│       └── products/
│           ├── page.tsx              # ✅ Products List Page
│           ├── new/
│           │   └── page.tsx          # Create Product Page
│           └── [id]/
│               ├── page.tsx          # Product Detail Page
│               └── edit/
│                   └── page.tsx      # Edit Product Page
│
├── service/
│   └── products.ts                   # ✅ API Service Functions
│
├── query/
│   └── products.ts                   # ✅ React Query Configs
│
├── hooks/
│   └── admin/
│       └── products_page/
│           └── useProductsPage.ts    # ✅ Custom Hook
│
├── types/
│   └── products.ts                   # ✅ TypeScript Types
│
└── validators/
    └── products.ts                   # ✅ Validation Schemas
```

---

### 🎨 Styling Guidelines

#### **1. Bootstrap (Recommended cho Admin)**

```typescript
// Sử dụng Bootstrap classes
<div className="container-fluid py-4">
  <div className="card">
    <div className="card-header">
      <h5 className="mb-0">Title</h5>
    </div>
    <div className="card-body">
      <table className="table table-hover">
        {/* Table content */}
      </table>
    </div>
  </div>
</div>
```

#### **2. Tailwind CSS (Alternative)**

```typescript
<div className="container mx-auto py-4">
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold mb-4">Title</h2>
    {/* Content */}
  </div>
</div>
```

#### **3. Ant Design Components**

```typescript
import { Table, Button, Input } from "antd";

<Table
  dataSource={products}
  columns={columns}
  loading={isLoading}
/>
```

---

### 🔄 Data Flow Chi Tiết

```
┌─────────────────────────────────────────────────────────┐
│  Component (page.tsx)                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │  const { products, isLoading } = useProductsPage()│ │
│  │  return <div>{products.map(...)}</div>            │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Custom Hook (useProductsPage.ts)                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │  const { data } = useQuery(productsQuery.list()) │ │
│  │  return { products: data?.products || [] }       │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Query Config (query/products.ts)                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │  queryOptions({                                   │ │
│  │    queryKey: ["products", "list"],               │ │
│  │    queryFn: () => getAllProducts()              │ │
│  │  })                                               │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Service (service/products.ts)                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  export const getAllProducts = async () => {     │ │
│  │    return await http.get("/admin/products")       │ │
│  │  }                                                │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  HTTP Client (lib/http.ts)                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Axios instance với:                              │ │
│  │  - Base URL                                        │ │
│  │  - Auth token (từ localStorage)                   │ │
│  │  - Interceptors                                    │ │
│  └───────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Backend API (Spring Boot)                              │
│  GET /api/admin/products                                │
└─────────────────────────────────────────────────────────┘
```

---

### ✅ Checklist Khi Dựng Layout Mới

- [ ] **1. Tạo Page Component** (`src/app/admin/[feature]/page.tsx`)
  - [ ] Import custom hook
  - [ ] Implement UI theo layout trong `admin-render.md`
  - [ ] Sử dụng Bootstrap/Tailwind classes
  - [ ] Handle loading, error states

- [ ] **2. Tạo Service Functions** (`src/service/[feature].ts`)
  - [ ] GET (list, detail)
  - [ ] POST (create)
  - [ ] PUT (update)
  - [ ] DELETE (delete)
  - [ ] Type-safe với TypeScript

- [ ] **3. Tạo Query Configs** (`src/query/[feature].ts`)
  - [ ] List query với filters
  - [ ] Detail query
  - [ ] Proper query keys

- [ ] **4. Tạo Custom Hook** (`src/hooks/admin/[feature]_page/use[Feature]Page.ts`)
  - [ ] State management (search, filter, pagination)
  - [ ] useQuery để fetch data
  - [ ] useMutation để mutate data
  - [ ] Cache invalidation
  - [ ] Navigation handlers

- [ ] **5. Tạo Types** (`src/types/[feature].ts`)
  - [ ] Interface cho entities
  - [ ] DTOs cho create/update

- [ ] **6. Tạo Validators** (`src/validators/[feature].ts`) - Optional
  - [ ] Validation schemas (Zod, Yup, etc.)

- [ ] **7. Testing**
  - [ ] Test API calls
  - [ ] Test UI rendering
  - [ ] Test error handling

---

### 🎯 Best Practices

1. **Luôn sử dụng TypeScript**: Type-safe code, ít bugs hơn
2. **Tách biệt concerns**: Component chỉ render UI, logic ở hook
3. **Reuse code**: Tạo reusable components và hooks
4. **Error handling**: Luôn handle errors (try-catch, error states)
5. **Loading states**: Hiển thị loading khi fetch data
6. **Cache management**: Invalidate cache sau khi mutate
7. **Code organization**: Follow cấu trúc thư mục đã định sẵn

---

### 📚 Tài Liệu Tham Khảo

- **Next.js App Router**: https://nextjs.org/docs/app
- **React Query**: https://tanstack.com/query/latest
- **Bootstrap**: https://getbootstrap.com/docs/5.3
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

Với hướng dẫn này, bạn có thể dựng bất kỳ layout nào trong `admin-render.md` một cách có hệ thống và nhất quán! 🚀

---

## 🔐 PROTECTED ROUTES - Bảo Vệ Routes

### 📋 Tổng Quan

Protected Routes là các routes yêu cầu **authentication** (đăng nhập) hoặc **authorization** (quyền truy cập) trước khi cho phép truy cập.

**Ví dụ:**
- `/admin/*` → Chỉ Admin mới được truy cập
- `/seller/*` → Chỉ Seller mới được truy cập
- `/profile` → Phải đăng nhập mới được truy cập

---

### 🎯 Các Phương Pháp Bảo Vệ Routes

#### **1. Middleware (Recommended - Next.js App Router)**

**Cách hoạt động:**
- Chạy **trước** khi request đến page
- Có thể redirect, block request
- Hoạt động ở **server-side**

**File:** `src/middleware.ts` (tạo ở root của `src/`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ cookie hoặc header
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Routes công khai (không cần auth)
  const publicRoutes = ['/login', '/register', '/'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes: /admin/*
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // Chưa đăng nhập → redirect về login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname); // Lưu URL để redirect lại sau khi login
      return NextResponse.redirect(url);
    }

    // TODO: Verify token và check role (Admin)
    // Nếu không phải Admin → redirect về login hoặc 403
  }

  // Protected routes: /seller/*
  if (pathname.startsWith('/seller')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // TODO: Verify token và check role (Seller)
  }

  return NextResponse.next();
}

// Config: Áp dụng middleware cho routes nào
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Ưu điểm:**
- ✅ Chạy ở server-side (bảo mật hơn)
- ✅ Block request trước khi đến page (tiết kiệm resources)
- ✅ Có thể redirect, set cookies, headers

**Nhược điểm:**
- ⚠️ Không thể access localStorage (chỉ có cookies hoặc headers)
- ⚠️ Cần verify token ở server-side

---

#### **2. Server Component Protection (Next.js App Router)**

**Cách hoạt động:**
- Check auth trong Server Component (layout.tsx hoặc page.tsx)
- Redirect nếu chưa đăng nhập

**File:** `src/app/admin/layout.tsx`

```typescript
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Sidebar from '@/components/admin/Sidebar';
import { RootPrivider } from '@/components/context/RootProvider';

// Helper function để check auth
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return false;
  }

  // TODO: Verify token với backend API
  // const response = await fetch(`${API_URL}/auth/verify`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return response.ok;

  return true; // Tạm thời return true
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect('/login?redirect=/admin');
  }

  // TODO: Check role (phải là Admin)
  // const userRole = await getUserRole();
  // if (userRole !== 'admin') {
  //   redirect('/unauthorized');
  // }

  return (
    <>
      <RootPrivider>
        <Sidebar />
        <div className="main-content">{children}</div>
      </RootPrivider>
    </>
  );
}
```

**Ưu điểm:**
- ✅ Server-side check (bảo mật)
- ✅ Có thể access cookies, database
- ✅ Redirect trước khi render

**Nhược điểm:**
- ⚠️ Chỉ hoạt động với Server Components
- ⚠️ Cần async/await

---

#### **3. Client-Side Protection (useEffect + redirect)**

**Cách hoạt động:**
- Check auth trong Client Component
- Redirect nếu chưa đăng nhập

**File:** `src/components/auth/ProtectedRoute.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'seller' | 'user';
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login?redirect=' + window.location.pathname);
        return;
      }

      // Verify token với backend
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('token');
          router.push('/login?redirect=' + window.location.pathname);
          return;
        }

        const user = await response.json();

        // Check role nếu có yêu cầu
        if (requiredRole && user.role !== requiredRole) {
          router.push('/unauthorized');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.push('/login?redirect=' + window.location.pathname);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Đang redirect
  }

  return <>{children}</>;
}
```

**Sử dụng trong layout:**

```typescript
// src/app/admin/layout.tsx
"use client";

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <Sidebar />
      <div className="main-content">{children}</div>
    </ProtectedRoute>
  );
}
```

**Ưu điểm:**
- ✅ Có thể access localStorage
- ✅ Có thể show loading state
- ✅ Flexible, dễ customize

**Nhược điểm:**
- ⚠️ Client-side (có thể bị bypass nếu không có server-side check)
- ⚠️ Flash of content trước khi redirect

---

#### **4. Custom Hook Protection**

**Cách hoạt động:**
- Tạo custom hook để check auth
- Sử dụng trong components

**File:** `src/hooks/auth/useAuth.ts`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'seller' | 'user';
  name: string;
}

export const useAuth = (requiredRole?: 'admin' | 'seller' | 'user') => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Check role
          if (requiredRole && userData.role !== requiredRole) {
            router.push('/unauthorized');
            return;
          }

          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
};
```

**Sử dụng trong page:**

```typescript
// src/app/admin/page.tsx
"use client";

import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth('admin');
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
    </div>
  );
}
```

---

### 🔄 Flow Hoàn Chỉnh: Protected Routes

```
User truy cập /admin/category
         ↓
┌────────────────────────┐
│  Middleware (server)   │ ← Check token từ cookie/header
│  - Có token?          │
│  - Token valid?       │
│  - Role = admin?      │
└────────┬───────────────┘
         │
    ┌────┴────┐
    │         │
   ✅        ❌
    │         │
    │    Redirect /login
    │
┌────────────────────────┐
│  Layout (server)       │ ← Double check (optional)
│  - Verify token        │
│  - Check role          │
└────────┬───────────────┘
         │
    ┌────┴────┐
    │         │
   ✅        ❌
    │         │
    │    Redirect /login
    │
┌────────────────────────┐
│  Page Component        │ ← Render content
│  - useAuth hook        │
│  - Fetch data          │
└────────────────────────┘
```

---

### 🛡️ Role-Based Access Control (RBAC)

**Yêu cầu:**
- Admin: Chỉ truy cập `/admin/*`
- Seller: Chỉ truy cập `/seller/*`
- User: Chỉ truy cập `/profile`, `/orders`, etc.

**File:** `src/middleware.ts` (Enhanced)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper: Verify token và get user role
async function verifyTokenAndGetRole(token: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      return user.role; // 'admin', 'seller', 'user'
    }
  } catch (error) {
    console.error('Token verification failed:', error);
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/login', '/register', '/'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Verify token và get role
  const userRole = await verifyTokenAndGetRole(token);

  if (!userRole) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (pathname.startsWith('/seller')) {
    if (userRole !== 'seller' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Add user role to headers (để sử dụng trong Server Components)
  const response = NextResponse.next();
  response.headers.set('x-user-role', userRole);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

### 📝 Implementation Checklist

#### **Bước 1: Setup Token Storage**

**Option A: localStorage (Client-side)**
```typescript
// Sau khi login thành công
localStorage.setItem('token', token);
```

**Option B: Cookies (Server-side + Client-side)**
```typescript
// Server-side (trong API route hoặc Server Action)
import { cookies } from 'next/headers';

cookies().set('token', token, {
  httpOnly: true,  // Bảo mật hơn (không thể access từ JS)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

#### **Bước 2: Tạo Middleware**

- [ ] Tạo file `src/middleware.ts`
- [ ] Check token cho protected routes
- [ ] Redirect nếu chưa đăng nhập
- [ ] Check role nếu cần

#### **Bước 3: Update Layouts**

- [ ] `app/admin/layout.tsx` - Check auth + role admin
- [ ] `app/seller/layout.tsx` - Check auth + role seller
- [ ] `app/(user)/layout.tsx` - Check auth (optional)

#### **Bước 4: Update Login Flow**

- [ ] Sau khi login thành công, lưu token
- [ ] Redirect về URL ban đầu (từ query param `redirect`)
- [ ] Clear token khi logout

#### **Bước 5: Create Unauthorized Page**

- [ ] Tạo `app/unauthorized/page.tsx`
- [ ] Hiển thị message "Bạn không có quyền truy cập"

---

### 🎯 Recommended Approach (Cho Dự Án Của Bạn)

**Kết hợp 2 phương pháp:**

1. **Middleware** (Primary protection)
   - Check token và role ở server-side
   - Block request trước khi đến page
   - Redirect nếu không có quyền

2. **Client-side Hook** (Secondary check + UX)
   - Check auth trong components
   - Show loading state
   - Handle logout, refresh token

**File structure:**
```
src/
├── middleware.ts                    # ✅ Primary protection
├── hooks/
│   └── auth/
│       └── useAuth.ts              # ✅ Client-side check
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx      # ✅ Optional wrapper
└── app/
    ├── admin/
    │   └── layout.tsx              # ✅ Double check (optional)
    └── seller/
        └── layout.tsx              # ✅ Double check (optional)
```

---

### ⚠️ Lưu Ý Quan Trọng

1. **Không chỉ dựa vào client-side check**
   - Luôn có server-side check (middleware hoặc layout)
   - Client-side chỉ để UX tốt hơn

2. **Token Storage**
   - **localStorage**: Dễ bị XSS attack
   - **httpOnly cookies**: Bảo mật hơn (không thể access từ JS)
   - **Recommended**: Dùng cookies cho production

3. **Token Expiration**
   - Check token expiration
   - Refresh token nếu cần
   - Logout nếu token expired

4. **API Protection**
   - Backend cũng phải verify token
   - Không chỉ dựa vào frontend check

---

### 📚 Tài Liệu Tham Khảo

- **Next.js Middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Next.js Authentication**: https://nextjs.org/docs/app/building-your-application/authentication
- **Cookies vs localStorage**: https://web.dev/articles/secure-cookies

---

Với hướng dẫn này, bạn có thể implement protected routes một cách bảo mật và hiệu quả! 🔐