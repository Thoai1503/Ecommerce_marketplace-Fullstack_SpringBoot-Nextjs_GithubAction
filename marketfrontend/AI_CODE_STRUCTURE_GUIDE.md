## 📌 Hướng Dẫn Cho AI – Cấu Trúc & Quy Ước Code Dự Án Marketplace (Next.js)

File này dùng để hướng dẫn AI (LLM / codegen) **tạo mới file, thư mục, component, hook, service...** sao cho **đúng cấu trúc hiện tại** của dự án.

---

## 1. Tổng Quan Công Nghệ & Layout

- **Frontend**: Next.js App Router (thư mục `src/app`), React, TypeScript.
- **HTTP client**: `axios` được wrap trong `src/lib/http.ts`.
- **State server**: TanStack React Query (query layer ở `src/query` và `src/feature/**/query.ts`).
- **Validation**: file trong `src/validators`.

**3 khu vực chính trong App Router:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- `src/app/(user)/...` – trang phía user / khách.
- `src/app/admin/...` – trang admin (có sidebar admin).
- `src/app/seller/...` – trang seller (có sidebar seller).

**Quy ước:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Mỗi route là **một thư mục** có `page.tsx`.
- Mỗi khu vực (admin, seller, (user)) có `layout.tsx` riêng, dùng để wrap sidebar / header.

---

## 2. Cấu Trúc Thư Mục Chính (FE)

```text
src/
  app/               # Next.js routes (App Router)
  components/        # UI components (chia theo domain: admin, seller, common)
  feature/           # Feature-based modules (admin, client, seller)
  service/           # Service API chia theo domain (category, unit, ...)
  query/             # React Query hooks chia theo domain
  hooks/             # Custom hooks (admin, auth, ...)
  lib/               # Core libs (http client, config)
  helper/            # Helper functions (format, utils)
  types/             # TS types (vd: admin sidebar, domain models)
  validators/        # Zod / TS interface validation models
```

Khi tạo **tính năng admin mới**, AI phải:
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
1. Thêm route trong `src/app/admin/<module>/page.tsx`.
2. Nếu cần sub-route (new/edit/detail), tạo thêm thư mục con (`new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`).
3. Viết hooks / service / query **trong các layer sẵn có** (xem tiếp bên dưới), **không tự tạo layer mới** trừ khi thật cần thiết.

---

## 3. Cấu Trúc `src/app/admin` – Các Module Admin

Hiện tại (có thể đã thay đổi một chút theo tiến độ), `src/app/admin` chứa:

- `layout.tsx` – layout admin (dùng `Sidebar` admin).
- `page.tsx` – Dashboard admin (`/admin`).
- `category/` – `/admin/category`
- `attribute/` – `/admin/attribute`
- `category-attribute/` – `/admin/category-attribute` + dynamic `[id]`
- `unit/` – `/admin/unit`
- `orders/` – `/admin/orders`
- `user/` – `/admin/user` (+ `user/create/page.tsx` nếu có)
- `products/` – `/admin/products`
- `customers/` – `/admin/customers` (thư mục đã tồn tại, AI có thể bổ sung `page.tsx`)

**Khi AI tạo module admin mới** (ví dụ: coupons, finance, settings), hãy:
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Tạo thư mục: `src/app/admin/coupons`, `src/app/admin/finance`, `src/app/admin/settings`.
- Trong đó tạo:
  - `page.tsx` – list page.
  - Nếu cần:
    - `new/page.tsx` – trang tạo mới.
    - `[id]/page.tsx` – trang detail.
    - `[id]/edit/page.tsx` – trang edit.

---

## 4. Components – `src/components`

```text
src/components/
  admin/
    Sidebar.tsx
    category_attribute_page/...
  seller/
    SideBar.tsx
  common/
    Toast.tsx
  context/
    RootProvider.tsx
  HeaderAuth.tsx
```

**Quy ước cho AI:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Các component **dùng lại giữa nhiều admin pages** → để trong `src/components/admin/`.
  - Ví dụ: table generic, filter bar, modal chung cho admin.
- Components **chung toàn app** (toast, button, modal generic) → `src/components/common/`.
- Components **chỉ dùng trong seller** → `src/components/seller/`.

Khi tạo component mới:
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Nếu gắn chặt với **1 page cụ thể** → có thể đặt thẳng trong `src/app/admin/...` cùng `page.tsx`.
- Nếu có khả năng dùng lại **nhiều page admin** → đặt trong `src/components/admin/`.

---

## 5. Feature Layer – `src/feature`

```text
src/feature/
  admin/
    hook.ts          # Hook chung cho admin (vd: useAdminSomething)
    service.ts       # Admin API service (tổng hợp hoặc gateway)
    typs.ts          # Kiểu dữ liệu riêng cho admin
  client/
    hook.ts
    query.ts
    service.ts
  seller/
    components/
      CategorySelectorModal.tsx
    hooks.ts
    query.ts
    service.ts
    types.ts
```

**Quy ước cho AI:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Các logic **tập trung cho admin** (không gắn với 1 domain nhỏ như category/unit) nhưng mang tính “toàn admin” → để trong `src/feature/admin/*`.
- Các logic **client (user)** → `src/feature/client/*`.
- Logic **seller-side** → `src/feature/seller/*`.

**Ưu tiên:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Domain đơn lẻ (category, unit, coupons, finance) → dùng `src/service/<domain>.ts` + `src/query/<domain>.ts`.
- Nếu về sau domain quá lớn, có thể chuyển sang `src/feature/<domain>/...` nhưng **chỉ làm khi thật sự cần**.

---

## 6. Service & Query & Validators

### 6.1 `src/service`

Hiện có:
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
```text
src/service/
  category.ts
  categoryAttribute.ts
  unit.ts
```

**Quy ước cho AI khi thêm domain mới (vd: coupons, finance, users,...):**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Tạo file: `src/service/<domain>.ts`.
- Mỗi file export các hàm gọi API **thuần túy**, dùng `http` từ `src/lib/http.ts`, ví dụ:

```ts
// src/service/coupons.ts
import http from "@/lib/http";
import type { Coupon } from "@/validators/coupon";

export async function getCoupons(params: GetCouponsParams): Promise<Coupon[]> {
  const res = await http.get("/admin/coupons", { params });
  return res.data;
}
```

### 6.2 `src/query`

Hiện có:
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
```text
src/query/
  category.ts
  categoryAttribute.ts
  unit.ts
```

**Quy ước:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Mỗi domain có file query riêng, ví dụ: `src/query/coupons.ts`, `src/query/orders.ts`.
- File query **chỉ** chứa:
  - `queryKey` constants.
  - Hooks React Query (`useQuery`, `useMutation`) bọc quanh hàm trong `src/service`.

### 6.3 `src/validators`

Hiện có:
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
```text
src/validators/
  attribute.ts
  categoryAttribute.ts
  product.ts
  units.ts
```

**Quy ước:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Khi có model mới (Coupon, FinanceReport, UserAdminView, ...) → tạo file tương ứng:
  - `src/validators/coupon.ts`
  - `src/validators/finance.ts`
- Trong đó export **interface / type / schema** được dùng lại trong service/query/UI.

---

## 7. Hooks & Lib

### 7.1 `src/hooks`

```text
src/hooks/
  admin/
    category_page/useCategoryPage.ts
  auth/
    useAuth.ts
```

**Quy ước:**
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======

>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
- Hooks **gắn với 1 page cụ thể** (vd: Category List) → có thể vào `src/hooks/admin/category_page/useCategoryPage.ts`.
- Hooks **dùng toàn app** (auth, theme, layout) → vào `src/hooks/auth`, `src/hooks/ui`, ...

### 7.2 `src/lib/http.ts`

- Tất cả service phải dùng `http` từ đây → **AI không tự import axios trực tiếp** trong từng service.

---

## 8. Nguyên Tắc Khi AI Thêm Tính Năng Admin Mới

Ví dụ: thêm module **Coupons** cho admin:

1. **Route & UI:**
   - Tạo `src/app/admin/coupons/page.tsx` (list page).
   - Nếu có create/edit:
     - `src/app/admin/coupons/new/page.tsx`
     - `src/app/admin/coupons/[id]/edit/page.tsx`
2. **Service & Query:**
   - Tạo `src/service/coupons.ts` với các hàm: `getCoupons`, `createCoupon`, `updateCoupon`, `deleteCoupon`.
   - Tạo `src/query/coupons.ts` với hooks: `useCouponsQuery`, `useCreateCouponMutation`, ...
3. **Types & Validators:**
   - Tạo `src/validators/coupon.ts` (interface/schema cho Coupon).
4. **Components dùng lại (nếu cần):**
   - Nếu form/list có thể dùng lại nhiều nơi → tạo component ở `src/components/admin/`.

Tương tự cho các module khác (finance, settings, v.v.) – **luôn đi theo pattern**:

> `app` (route) → `service` (API) → `query` (React Query) → `components` (UI dùng lại) → `validators` (kiểu dữ liệu).

---

## 9. Những Điều AI Không Nên Làm

- Không tạo thêm root folders mới ở `src/` nếu không có trong spec này.
- Không dùng axios trực tiếp – luôn dùng `src/lib/http.ts`.
- Không tạo route ngoài `src/app/...`.
- Không thay đổi cấu trúc hiện tại (vd: không chuyển App Router sang Pages Router).
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> e4dd6569ac30ad63e61404155328fc3d319dbff5
=======
>>>>>>> 93c8346aa5bbe8c27002b7a82db1b68b810dc7d9
