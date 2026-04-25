## Frontend Architecture (marketfrontend)

### Tech stack

- Next.js (App Router) + React + TypeScript
- Axios (wrapper trong `marketfrontend/src/lib/http.ts`)
- React Query (theo docs nội bộ `marketfrontend/AI_CODE_STRUCTURE_GUIDE.md`)

### Folder structure (tóm tắt)

Thư mục chính (tham khảo `marketfrontend/AI_CODE_STRUCTURE_GUIDE.md`):

```text
marketfrontend/src/
  app/               # routes (App Router)
  components/        # UI components
  context/           # auth/providers
  feature/           # feature-based modules
  hooks/             # custom hooks
  lib/               # http/config
  services/          # API services theo domain
  query/             # react-query hooks theo domain
  helper/            # utils
  validators/        # zod/models
  types/             # TS types
```

### Runtime configuration (env)

Next.js chỉ tự load env tại root project:

- `marketfrontend/.env.local` (local dev)

Các biến đang dùng:

- `NEXT_PUBLIC_API_URL`: base URL client-side
- `INTERNAL_API`: base URL server-side (Server Components/middleware)
- `NEXT_PUBLIC_PROVINCE_API`, `NEXT_PUBLIC_ADDRESS_KEY`, `NEXT_PUBLIC_LOGISTICS_FEE_API`: GHN APIs (checkout)

### Data fetching rules (khuyến nghị)

- **Server Components**: dùng `fetch(INTERNAL_API + ...)`
  - nếu backend down sẽ gây `fetch failed` → cần backend chạy ổn
- **Client components**: dùng axios instance `http` (`src/lib/http.ts`) với `baseURL = NEXT_PUBLIC_API_URL`

### Admin development checklist (ngắn)

- Tạo route: `src/app/admin/<module>/page.tsx`
- Tạo service: `src/services/<domain>.ts` (hoặc theo guide)
- Tạo query/hook nếu cần: `src/query/**` hoặc `src/feature/**`

### Seller - Product feature (dành cho bạn)

#### Routes (khuyến nghị)

Theo guide trong `marketfrontend/AI_CODE_STRUCTURE_GUIDE.md`, seller có khu vực riêng `src/app/seller/...`.

- **List sản phẩm**: `src/app/seller/products/page.tsx`
- **Tạo sản phẩm**: `src/app/seller/products/new/page.tsx`
- **Chi tiết sản phẩm**: `src/app/seller/products/[id]/page.tsx`
- **Sửa sản phẩm**: `src/app/seller/products/[id]/edit/page.tsx`
- **Biến thể & tồn kho** (tuỳ chọn):
  - `src/app/seller/products/[id]/variants/page.tsx`
  - `src/app/seller/inventory/page.tsx`

#### Layering (khuyến nghị cho code mới)

- **Service layer**: `src/services/sellerProduct.ts`
  - gọi axios `http` (baseURL = `NEXT_PUBLIC_API_URL`)
- **Query layer**: `src/query/seller/products.ts` (hoặc `src/feature/seller/query.ts`)
  - list/detail/create/update
- **Validators/types**:
  - `src/validators/product.ts` (đã có) + bổ sung `ProductVariant`, `ProductStatus` nếu thiếu
  - `src/types/seller.ts` (nếu cần)

#### UI/UX checklist cho seller-product

- **List**: search + filter status + pagination, hiển thị stock/status rõ ràng
- **Form create/edit**:
  - validate bắt buộc (name/category/price…)
  - upload images (nếu có)
  - draft/save/submit
- **Variants**:
  - tạo options → generate variants
  - bulk edit price/stock
- **Inventory**:
  - low-stock view + quick adjust
c
