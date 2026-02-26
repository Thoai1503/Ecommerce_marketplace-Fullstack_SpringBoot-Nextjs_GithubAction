## Phase 1 – Admin Panel: Code Logic & Developer Experience

Checklist dành riêng cho **Admin** (Dashboard, Orders, Products, Customers, Sellers, Coupons, Finance, Categories, Settings).
Khi hoàn thành, bạn có thể clone lại cấu trúc này cho **Seller** và **User**.

---

### 1. TypeScript & Kiến trúc code

- [ ] **TS Strict (ưu tiên)**  
  - [ ] `tsconfig.json` bật `strict` (hoặc ít nhất `noImplicitAny`, `strictNullChecks`) và sửa các lỗi quan trọng trong `src/app/admin/**`, `src/hooks/admin/**`, `src/service/**`, `src/types/**`.

- [ ] **Kiến trúc layer rõ ràng**  
  - [ ] Mỗi màn Admin dùng đúng cấu trúc:
    - `app/admin/.../page.tsx` → chỉ wrap layout + gọi component chính.
    - `components/admin/**` → UI thuần, không gọi API trực tiếp.
    - `hooks/admin/**` → xử lý logic, React Query, state liên quan.
    - `service/**` → gọi API (axios/fetch) thuần.
    - `types/index.ts` → định nghĩa `Order`, `Product`, `Customer`, `Seller`, `Coupon`, `Category`, `Attribute`, `Unit`, `Settings`, v.v.

- [ ] **Không trộn React Router cũ**  
  - [ ] Đảm bảo **không còn** `react-router-dom` trong `src/app/admin/**`.
  - [ ] Tất cả điều hướng dùng `next/navigation` (`useRouter`, `useParams`) và `<Link>` từ `next/link`.

---

### 2. Hooks & Logic (React Query)

- [ ] **Custom hooks theo domain**  
  - [ ] `hooks/admin/useAdminDashboard.ts` – chỉ xử lý logic dashboard, không chứa JSX.
  - [ ] `hooks/admin/useOrders.ts`, `useProducts.ts`, `useCustomers.ts`, `useSellers.ts`, `useCoupons.ts`, `useFinance.ts`, `useCategories.ts`, `useAttributes.ts`, `useUnits.ts`, `useUsers.ts`, `useSettings.ts` – mỗi hook:
    - [ ] Trả về `{ data, isLoading, isError, refetch, ...mutationFns }`.
    - [ ] Không render UI (JSX), chỉ trả dữ liệu + hàm.

- [ ] **React Query key & invalidation chuẩn**  
  - [ ] Mỗi domain dùng key dạng `['admin', '<resource>', ...]`, ví dụ:
    - Orders: `['admin', 'orders']`, `['admin', 'orders', id]`.
    - Products: `['admin', 'products']`, `['admin', 'products', id]`.
    - Categories: `['admin', 'categories']`, `['admin', 'attributes']`, `['admin', 'units']`.
  - [ ] `service/**` không gọi `queryClient`, chỉ `hooks/admin/**` làm invalidate.

---

### 3. Error Handling & Toast

- [ ] **Pattern thống nhất cho lỗi**  
  - [ ] Tất cả lỗi từ API được bắt trong hooks (hoặc trong handler) và:
    - Dùng `useToast` từ `ToastContext` (`success`, `error`, `info`, `warning`).
    - Không tạo thêm `Toast` component riêng từng file.

- [ ] **Loading/Error UI cho từng màn**  
  - [ ] Mỗi page admin có:
    - [ ] Loading: dùng `Skeleton` hoặc spinner full-width.
    - [ ] Error: hiển thị rõ ràng (có thể dùng `ErrorState`/`EmptyState`) thay vì crash.

---

### 4. Lint & Format

- [ ] **ESLint + Prettier**  
  - [ ] Có script trong `package.json`:
    - `"lint": "next lint"` (hoặc tương đương).
    - `"format": "prettier --write ."` (nếu dùng Prettier).
  - [ ] Chạy `npm run lint` / `pnpm lint`:
    - [ ] Không còn **error** trong `src/app/admin/**`, `src/hooks/admin/**`, `src/components/admin/**`.
    - [ ] Warning Tailwind dạng gợi ý (`rounded-[24px]` → `rounded-3xl`) có thể để lại cho Phase 2 (UI/UX).

---

### 5. Developer Experience (DX)

- [ ] **README cho Admin**  
  - [ ] Trong README chính (hoặc file riêng `README_ADMIN.md`) mô tả:
    - [ ] Cách chạy frontend admin: `npm install`, `npm run dev`, URL `/admin`.
    - [ ] Cấu trúc thư mục: `app/admin`, `hooks/admin`, `service`, `types`.
    - [ ] Cách cấu hình biến môi trường (API base URL, token… nếu có).

- [ ] **Script tiện lợi**  
  - [ ] Có ít nhất:
    - `"dev": "next dev"`
    - `"build": "next build"`
    - `"start": "next start"`
    - `"lint": "next lint"`

---

### 6. Kiểm tra tổng thể cho Admin (Phase 1 DONE)

- [ ] Mọi route admin chính hoạt động không lỗi:
  - [ ] `/admin` (Dashboard)
  - [ ] `/admin/orders`, `/admin/orders/[id]`
  - [ ] `/admin/products`, `/admin/products/[id]`, `/admin/products/[id]/edit`, `/admin/products/new`
  - [ ] `/admin/customers`, `/admin/customers/[id]`, `/admin/customers/[id]/edit`
  - [ ] `/admin/sellers`, `/admin/sellers/[id]`, `/admin/sellers/[id]/edit`, `/admin/sellers/new`
  - [ ] `/admin/coupons`, `/admin/coupons/[id]`, `/admin/coupons/[id]/edit`, `/admin/coupons/new`
  - [ ] `/admin/finance`, `/admin/finance/transactions`, `/admin/finance/payments`
  - [ ] `/admin/categories/industries`, `/[id]`, `/[id]/edit`, `/new`
  - [ ] `/admin/categories/attributes`, `/[id]`, `/[id]/edit`, `/new`
  - [ ] `/admin/categories/units`
  - [ ] `/admin/users`
  - [ ] `/admin/settings`

Khi toàn bộ checklist trên được tick xong cho **Admin**, bạn có thể:
- Copy file này thành `SELLER_PHASE1_CHECKLIST.md`, `USER_PHASE1_CHECKLIST.md`.
- Điều chỉnh lại phần route + hooks cho đúng context Seller/User nhưng giữ nguyên tiêu chí Phase 1.

