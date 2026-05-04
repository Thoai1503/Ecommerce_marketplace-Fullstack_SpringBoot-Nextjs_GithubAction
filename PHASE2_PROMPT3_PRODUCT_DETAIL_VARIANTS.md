# Phase 2 — Prompt 3 (REDO) — Variants CRUD trong `ProductDetail.tsx`

> **Quyết định kiến trúc:** Admin KHÔNG sửa product (theo design hiện tại của project).
> Variants UI sẽ đặt trong **trang chi tiết sản phẩm admin** (`ProductDetail.tsx`),
> giúp admin **quản lý variants** (toggle / disable / delete spam) song song khi review sản phẩm.
>
> Backend admin endpoints + frontend service + hook đã sẵn sàng từ Prompt 1 + 2.

---

## 1. Bối cảnh nhanh

- **Branch:** `feature/vu` (KHÔNG worktree)
- **File target:** `marketfrontend/src/app/admin/products/ProductDetail.tsx`
- **Section cần sửa:** "SECTION 5: Variants" (hiện tại đọc only, dòng 679-714)
- **Hook đã có:** `marketfrontend/src/hooks/admin/useProductVariants.ts` — chưa được dùng ở đâu, Prompt 3 sẽ wire vào ProductDetail
- **Backend đã có:**
  - `GET    /admin/products/{productId}/variants`
  - `POST   /admin/products/{productId}/variants`
  - `PUT    /admin/products/{productId}/variants/{variantId}`
  - `PATCH  /admin/products/{productId}/variants/{variantId}/toggle`
  - `DELETE /admin/products/{productId}/variants/{variantId}`

## 2. Yêu cầu UI

### 2.1. Section "Biến thể sản phẩm" — luôn hiển thị (không phải chỉ khi có data)

```
┌─ Biến thể sản phẩm (3)                                    [+ Thêm biến thể]
│
├─ ┌────────────┬───────────┬────────────┬──────────┬──────────┬────────────┐
│  │ Tên         │  SKU      │ Giá        │ Kho      │ Trạng thái│ Hành động  │
│  ├────────────┼───────────┼────────────┼──────────┼──────────┼────────────┤
│  │ 64GB - Đen  │ IPH15-64BK│ 22.990.000₫│   12     │ ✅ Active │ ✏️ ⏻ 🗑️    │
│  │ 128GB - Bạc │ IPH15-128S│ 25.990.000₫│   5      │ ✅ Active │ ✏️ ⏻ 🗑️    │
│  │ 256GB - Đen │ IPH15-256B│ 28.990.000₫│   0      │ ⏸ Inactive│ ✏️ ⏻ 🗑️    │
│  └────────────┴───────────┴────────────┴──────────┴──────────┴────────────┘
│
│ (nếu chưa có variant nào)
│   [📦 Sản phẩm này chưa có biến thể nào. Thêm biến thể nếu sản phẩm có nhiều phiên bản (size/màu/dung lượng).]
```

### 2.2. Modal Create / Edit Variant

Khi click `+ Thêm biến thể` hoặc icon ✏️ → modal hiện:

```
┌─ Thêm biến thể mới  /  Sửa biến thể        ✕
│
│  Cột trái                  Cột phải
│  ───────────────           ───────────────
│  Tên biến thể *            URL ảnh
│  [_____________]           [_____________]
│
│  SKU *                     Cân nặng (g)
│  [_____________]           [_____________]
│
│  Giá (₫) *                 Dài × Rộng × Cao (mm)
│  [_____________]           [___] [___] [___]
│
│  Tồn kho *
│  [_____________]
│                            [Hủy]  [Lưu]
└─
```

- Validation real-time với **zod + react-hook-form**
- Submit disable khi `!isDirty || isSubmitting || hasError`
- Hiển thị error inline đỏ dưới mỗi field
- Khi submit thành công → close modal + invalidate query → table refresh

### 2.3. Confirm Delete

Click 🗑️ → dùng `ConfirmationModal` đã có ở project (`@/components/ui/ConfirmationModal`).

### 2.4. Toggle (⏻)

Click ⏻ → gọi `toggleVariant(id)` → toast success/error → table refresh.
KHÔNG cần confirm dialog cho toggle.

---

## 3. Convention BẮT BUỘC

### 3.1. Code style
- TypeScript strict
- Tailwind CSS theo style các section khác trong file (rounded-[24px], shadow-sm, font-black uppercase tracking-widest...)
- Icon từ `lucide-react`: `Layers`, `Plus`, `Edit3`, `Power`, `Trash2`, `X`
- **Tiếng Việt** cho mọi label, error, toast

### 3.2. State + hook
- Dùng `useProductVariants(product.id)` từ `@/hooks/admin/useProductVariants` (đã có)
- Modal state: `useState<{ open: boolean; mode: 'create' | 'edit'; variant?: ProductVariant }>` 
- Confirm delete state: `useState<{ open: boolean; variant?: ProductVariant }>`
- Toast: dùng `useToast()` từ `@/context/ToastContext`

### 3.3. Form
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const variantSchema = z.object({
  variantName: z.string().min(1, 'Tên biến thể là bắt buộc').max(255, 'Tối đa 255 ký tự'),
  sku: z.string().min(1, 'SKU là bắt buộc').max(100)
       .regex(/^[A-Za-z0-9_-]+$/, 'SKU chỉ chứa chữ, số, gạch ngang, gạch dưới')
       .transform(v => v.toUpperCase()),
  price: z.number({ invalid_type_error: 'Giá phải là số' })
         .min(0.01, 'Giá phải lớn hơn 0').max(999_999_999),
  stockQuantity: z.number({ invalid_type_error: 'Tồn kho phải là số' })
                 .int('Phải là số nguyên').min(0, 'Không được âm').max(1_000_000),
  imageUrl: z.string().optional().or(z.literal('')),
  weight: z.preprocess(v => v === '' || v === undefined ? undefined : Number(v),
                      z.number().min(0).optional()),
  length: z.preprocess(v => v === '' || v === undefined ? undefined : Number(v),
                      z.number().min(0).optional()),
  width: z.preprocess(v => v === '' || v === undefined ? undefined : Number(v),
                     z.number().min(0).optional()),
  height: z.preprocess(v => v === '' || v === undefined ? undefined : Number(v),
                      z.number().min(0).optional()),
});

type VariantFormValues = z.infer<typeof variantSchema>;
```

### 3.4. Backend error mapping
Sử dụng pattern giống `EditProduct.tsx` mapBackendError. Đặc biệt handle:
- `DUPLICATE_KEY` / `duplicate sku` → "SKU đã tồn tại. Vui lòng chọn SKU khác."
- `VALIDATION_FAILED` → đọc từng `fieldErrors` rồi `setError` của react-hook-form lên field tương ứng
- `INTERNAL_ERROR` → toast "Lỗi hệ thống, vui lòng thử lại"

---

## 4. CẤM (rút kinh nghiệm Phase 1.7 + Phase 2 P1)

- ❌ **TUYỆT ĐỐI KHÔNG** sửa file backend (Java)
- ❌ KHÔNG sửa `ProductRepository.java`, `ProductVariantRepository.java`
- ❌ KHÔNG sửa `service/productVariant.ts`, `useProductVariants.ts` (đã làm xong Prompt 2)
- ❌ KHÔNG sửa `EditProduct.tsx`, `[id]/edit/page.tsx` (admin không edit product)
- ❌ KHÔNG sửa các section khác trong `ProductDetail.tsx` (chỉ Section 5 Variants)
- ❌ KHÔNG sửa `types/index.ts`
- ❌ KHÔNG sửa CORS, eslint, package.json
- ❌ KHÔNG cài thư viện mới
- ❌ KHÔNG tách thành nhiều file mới — VariantModal đặt CÙNG `ProductDetail.tsx` (cuối file)
- ❌ KHÔNG đụng module khác (order, cart, payment, auth, seller, customer)

---

## 5. Files Codex sẽ sửa

```
marketfrontend/src/app/admin/products/ProductDetail.tsx          [M] DUY NHẤT
```

**1 file. Đặt cả VariantModal component cuối file (export default vẫn là ProductDetail).**

---

## 6. Acceptance criteria

Codex phải verify:
1. **Frontend build pass:**
   ```
   cd marketfrontend && npm run build
   ```
   Phải có "✓ Compiled successfully" và **0 lỗi TypeScript**.

2. **Section Variants luôn hiện** (kể cả khi `variants.length === 0` → hiện empty state)

3. **5 luồng UI đầy đủ:**
   - List variants
   - Click "+ Thêm biến thể" → modal mở với form rỗng
   - Click ✏️ → modal mở với form pre-fill từ variant đó
   - Click ⏻ → toggle ngay (không modal)
   - Click 🗑️ → ConfirmationModal → confirm → delete

4. **Validation hiển thị inline** khi submit form invalid (vd: SKU rỗng, giá ≤ 0)

5. **Toast tiếng Việt** sau mỗi action: "Đã thêm biến thể", "Đã cập nhật", "Đã ẩn/hiện biến thể", "Đã xóa"

6. **Backend error 409 DUPLICATE_KEY → setError trên field SKU** trong modal (không close modal)

---

## 7. PROMPT cho Codex (1 prompt duy nhất)

```
Bạn đang làm trên branch `feature/vu` trong monorepo:
C:\Users\razer user\Desktop\Nguyen Phan Hoang Vu\Ecommerce_marketplace-Microservice_GithubAction\

Đọc kỹ PHASE2_PROMPT3_PRODUCT_DETAIL_VARIANTS.md ở root, đặc biệt §2, §3, §4, §6.

Nhiệm vụ:
1. Sửa marketfrontend/src/app/admin/products/ProductDetail.tsx:
   a) Tại Section 5 "Variants" (dòng ~679-714):
      - Bỏ điều kiện `product.variants && product.variants.length > 0` → luôn render
      - Dùng hook `useProductVariants(product.id)` thay vì lấy từ `product.variants`
        (vẫn fallback `product.variants` cho lần render đầu tiên trước khi hook load xong)
      - Thêm header với title + nút "+ Thêm biến thể"
      - Thêm cột "Trạng thái" và "Hành động" vào table
      - Cột Hành động có 3 button: ✏️ (edit), ⏻ (toggle), 🗑️ (delete)
      - Empty state khi không có variants
   b) Thêm state cho variant modal + confirmation delete modal
   c) Tạo `VariantModal` component CÙNG file (cuối file, trước default export):
      - react-hook-form + zodResolver(variantSchema) (xem §3.3)
      - Layout 2 cột (xem §2.2)
      - Mode 'create' và 'edit' với pre-fill khi edit
      - Submit gọi createVariant hoặc updateVariant từ hook
      - Backend error: VALIDATION_FAILED map vào setError, DUPLICATE_KEY map vào field sku
      - Đóng modal + toast success khi xong
   d) Tích hợp ConfirmationModal cho delete (dùng @/components/ui/ConfirmationModal đã có)
   e) Thêm imports cần thiết (useState, useForm, zodResolver, z, useProductVariants,
      icons Plus/Edit3/Power/Trash2/X từ lucide-react)

2. Build pass:
   cd marketfrontend && npm run build
   Phải PASS không lỗi TypeScript.

CẤM tuyệt đối:
- Sửa BẤT KỲ file nào khác ngoài ProductDetail.tsx
- Sửa các Section khác trong ProductDetail (chỉ Section 5)
- Tạo file component mới (VariantModal đặt cùng ProductDetail.tsx)
- Cài thư viện mới
- Đụng backend Java, service, hook, types

Báo cáo cuối:
- Liệt kê DUY NHẤT 1 file đã sửa
- Số dòng thêm / xóa
- Confirm 6 acceptance criteria ở §6 đã pass
- Log "✓ Compiled successfully" cuối npm run build
```

---

## 8. Sau khi Codex xong

Vũ:
1. Đảm bảo backend đã restart trong IntelliJ (load fix length của Claude)
2. `cd marketfrontend && npm run dev`
3. Mở `http://localhost:3000/admin/products/4` (sản phẩm có sẵn variants)
4. Test 5 luồng UI ở §6
5. Ping Claude review

Claude:
1. Verify file diff đúng scope (chỉ 1 file ProductDetail.tsx)
2. Verify build pass
3. Smoke test với curl + open trình duyệt
4. Đóng Phase 2 → mở Phase 4 (báo cáo) hoặc Phase 3 (extra polish)
