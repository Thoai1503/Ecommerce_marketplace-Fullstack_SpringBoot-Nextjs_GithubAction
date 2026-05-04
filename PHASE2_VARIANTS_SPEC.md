# Phase 2 — Product Variants (Spec for Codex)

> **Đây là tính năng "wow" quan trọng nhất** cho thesis defense.
> E-commerce thực tế bắt buộc có variants (size/màu/dung lượng) — hội đồng 90% sẽ hỏi.
>
> **Chia 3 prompts** chạy tuần tự. Codex = code, Claude = review + test, Vũ = restart IntelliJ.

---

## 1. Bối cảnh

**Working directory cho Codex:**
```
C:\Users\razer user\Desktop\Nguyen Phan Hoang Vu\Ecommerce_marketplace-Microservice_GithubAction\
├── Marketplace-platform/        ← Backend (branch feature/vu)
├── marketfrontend/              ← Frontend Next.js
└── *.md ở root (file spec này)
```

**Branch:** `feature/vu` (tuyệt đối KHÔNG tạo worktree mới — bài học từ Phase 1.6 cũ)

**Backend chạy:** IntelliJ IDEA Run config → port 8001. Sau khi Codex thay đổi code, Vũ tự bấm Stop ⏹ → Run ▶.

---

## 2. Hiện trạng Variants

### ✅ Đã có:

| Thứ | Vị trí |
|---|---|
| Schema `product_variant` | DB (id, product_id, variant_name, sku UNIQUE, price, stock_quantity, weight/length/width/height, image_url, is_active, created_at, updated_at) |
| Model `ProductVariant.java` | `Marketplace-platform/src/main/java/docker_test/com/models/product/ProductVariant.java` |
| Repository `ProductVariantRepository.java` | `Marketplace-platform/src/main/java/docker_test/com/repository/ProductVariantRepository.java` |
| Mapper `ProductVariantMapper.java` | `Marketplace-platform/src/main/java/docker_test/com/mappers/product/ProductVariantMapper.java` |
| Seller endpoints | `seller/ProductVariantController.java` → `/seller/product-variant` (GET list, GET id, POST, PUT, DELETE) |
| Frontend service skeleton | `marketfrontend/src/service/productVariant.ts` |
| Variants display read-only | `ProductDetail.tsx` (admin xem được trong trang chi tiết) |
| TypeScript types | `marketfrontend/src/types/index.ts` (interface `ProductVariant` đã có) |

### ❌ Còn thiếu (Phase 2 phải làm):

1. **Admin endpoints** cho variants — admin chưa quản lý được (chỉ seller làm)
2. **Bean Validation DTO** cho variant request
3. **CRUD UI variants** trong form thêm/sửa sản phẩm admin (đây là phần GIÁ TRỊ NHẤT cho defense)
4. **Hook `useProductVariants`** + service wire-up
5. **Validation rules**: SKU unique, price > 0, stock ≥ 0, ít nhất tên hoặc SKU

---

## 3. Convention BẮT BUỘC (rút kinh nghiệm Phase 1.7)

### 3.1. Backend
- ✅ Dùng pattern **giống `seller/ProductVariantController.java`** đã có (đọc tham khảo)
- ✅ Bean Validation: `jakarta.validation.constraints.*` + `@Valid @RequestBody`
- ✅ Để `GlobalExceptionHandler` (Phase 1.7 đã có) handle exception
- ❌ **TUYỆT ĐỐI KHÔNG sửa `ProductRepository.java`** (đã fix bug ở Phase 1.7)
- ❌ KHÔNG sửa `seller/ProductVariantController.java` (giữ nguyên cho seller dùng)
- ❌ KHÔNG sửa `ProductVariantMapper.java` (sẽ break read-only display ở ProductDetail)
- ❌ KHÔNG sửa CORS, không thêm dependency
- ❌ KHÔNG đụng order/cart/payment/auth

### 3.2. Frontend
- ✅ Dùng `http` client từ `marketfrontend/src/lib/http.ts`
- ✅ Giữ flag `USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'`
- ✅ Dùng TanStack Query (`@tanstack/react-query`) cho hooks (giống `useProducts.ts`)
- ✅ Dùng `react-hook-form` + `zod` cho form validation (giống `EditProduct.tsx`)
- ✅ Tailwind CSS cho styling
- ❌ KHÔNG cài thư viện mới
- ❌ KHÔNG đụng UI ngoài thư mục `marketfrontend/src/app/admin/products/`

### 3.3. Field naming
- Backend: `snake_case` (variant_name, stock_quantity, image_url, is_active)
- Frontend types: **camelCase** (variantName, stockQuantity, imageUrl, isActive) — đã có sẵn trong `types/index.ts`, mapper backend → frontend đã làm

---

## 4. Files Codex sẽ tạo / sửa

```
Marketplace-platform/src/main/java/docker_test/com/
├── controllers/admin/
│   └── AdminProductVariantController.java                       [NEW] Prompt 1
└── dto/admin/
    └── ProductVariantRequestDTO.java                            [NEW] Prompt 1

marketfrontend/src/
├── service/
│   └── productVariant.ts                                        [M] Prompt 2 — wire admin endpoints
├── hooks/admin/
│   └── useProductVariants.ts                                    [NEW] Prompt 2
└── app/admin/products/
    └── EditProduct.tsx                                          [M] Prompt 3 — add Variants section
```

**Tổng:** 2 file mới backend + 2 file mới frontend + 2 file sửa frontend.

---

## 5. Spec từng phần

### 5.1. Backend — `AdminProductVariantController.java` (Prompt 1)

**Endpoint base:** `/admin/products/{productId}/variants`

| Method | Path | Body | Response | Mô tả |
|---|---|---|---|---|
| GET | `""` | — | `List<ProductVariant>` | List variants của 1 product |
| GET | `/{variantId}` | — | `ProductVariant` | Detail 1 variant |
| POST | `""` | `ProductVariantRequestDTO` | `ProductVariant` (status 201) | Tạo variant mới |
| PUT | `/{variantId}` | `ProductVariantRequestDTO` | `ProductVariant` | Cập nhật |
| PATCH | `/{variantId}/toggle` | — | `ProductVariant` | Toggle is_active (soft enable/disable) |
| DELETE | `/{variantId}` | — | `{success: true}` | Soft delete (set is_active = 0) |

**Annotation:**
```java
@RestController
@RequestMapping("/admin/products/{productId}/variants")
public class AdminProductVariantController {
    private final ProductVariantRepository variantRepository;

    public AdminProductVariantController(ProductVariantRepository variantRepository) {
        this.variantRepository = variantRepository;
    }
    // ...
}
```

**Quan trọng:**
- Dùng `ProductVariantRepository` đã có (KHÔNG sửa nó) — gọi method `GetByProductId(productId)`, `GetById(id)`, `Create(variant)`, `Update(variant)`. Nếu method nào chưa có, **bổ sung tối thiểu** vào repository nhưng theo style raw JDBC hiện có.
- Validate `productId` tồn tại trước khi operate (trả 404 nếu không có).
- Validate variant thuộc về `productId` ở GET/PUT/DELETE single (nếu `variantId` thuộc product khác → 404).
- Soft delete: `UPDATE product_variant SET is_active=0 WHERE id=?` — KHÔNG xóa cứng.

### 5.2. Backend — `ProductVariantRequestDTO.java` (Prompt 1)

```java
package docker_test.com.dto.admin;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public class ProductVariantRequestDTO {

    @NotBlank(message = "Tên biến thể là bắt buộc")
    @Size(min = 1, max = 255, message = "Tên biến thể tối đa 255 ký tự")
    private String variant_name;

    @NotBlank(message = "SKU là bắt buộc")
    @Size(min = 1, max = 100, message = "SKU tối đa 100 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "SKU chỉ chứa chữ, số, gạch ngang, gạch dưới")
    private String sku;

    @NotNull(message = "Giá là bắt buộc")
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
    @DecimalMax(value = "999999999.0", message = "Giá tối đa 999.999.999₫")
    private BigDecimal price;

    @NotNull(message = "Tồn kho là bắt buộc")
    @Min(value = 0, message = "Tồn kho không được âm")
    @Max(value = 1_000_000, message = "Tồn kho tối đa 1.000.000")
    private Integer stock_quantity;

    @Size(max = 500, message = "URL ảnh tối đa 500 ký tự")
    private String image_url;

    @Min(0) private Long weight;
    @Min(0) private Long length;
    @Min(0) private Long width;
    @Min(0) private Long height;

    // getters/setters tự sinh
}
```

> **Lưu ý SKU unique check**: DB đã có UNIQUE constraint trên `product_variant.sku`. Khi insert duplicate → throw `DataIntegrityViolationException` → `GlobalExceptionHandler` (Phase 1.7) trả `DUPLICATE_KEY` 409. KHÔNG cần manual check.

### 5.3. Frontend service — `productVariant.ts` (Prompt 2)

**Đọc trước file hiện có** — Codex tự xem và refactor giữ signature cũ. Thêm/sửa các function:

```typescript
import http from '../lib/http';
import { ProductVariant } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const getVariantsByProduct = async (productId: string | number): Promise<ProductVariant[]> => {
  if (USE_MOCK) return [];
  const res = await http.get<any[]>(`/admin/products/${productId}/variants`);
  return res.data; // backend trả snake_case, mapper đã có sẵn convert nếu cần
};

export const createVariant = async (productId: string | number, body: Partial<ProductVariant>): Promise<ProductVariant> => {
  const res = await http.post(`/admin/products/${productId}/variants`, body);
  return res.data;
};

export const updateVariant = async (productId: string | number, variantId: number, body: Partial<ProductVariant>): Promise<ProductVariant> => {
  const res = await http.put(`/admin/products/${productId}/variants/${variantId}`, body);
  return res.data;
};

export const toggleVariant = async (productId: string | number, variantId: number): Promise<ProductVariant> => {
  const res = await http.patch(`/admin/products/${productId}/variants/${variantId}/toggle`, {});
  return res.data;
};

export const deleteVariant = async (productId: string | number, variantId: number): Promise<void> => {
  await http.delete(`/admin/products/${productId}/variants/${variantId}`);
};
```

### 5.4. Frontend hook — `useProductVariants.ts` (Prompt 2)

```typescript
'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as svc from '@/service/productVariant';
import { ProductVariant } from '@/types';

export function useProductVariants(productId: string | number | undefined) {
  const qc = useQueryClient();
  const queryKey = ['admin', 'products', productId, 'variants'];

  const { data: variants = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => svc.getVariantsByProduct(productId!),
    enabled: !!productId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: (body: Partial<ProductVariant>) => svc.createVariant(productId!, body),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<ProductVariant> }) =>
      svc.updateVariant(productId!, id, body),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => svc.toggleVariant(productId!, id),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => svc.deleteVariant(productId!, id),
    onSuccess: invalidate,
  });

  return {
    variants, isLoading, isError, refetch,
    createVariant: createMutation.mutateAsync,
    updateVariant: updateMutation.mutateAsync,
    toggleVariant: toggleMutation.mutateAsync,
    deleteVariant: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending ||
                toggleMutation.isPending || deleteMutation.isPending,
  };
}
```

### 5.5. Frontend UI — Variants section trong `EditProduct.tsx` (Prompt 3)

**Vị trí thêm:** ngay SAU section "Hình ảnh", TRƯỚC section "Thuộc tính" trong `EditProduct.tsx`.

**Yêu cầu UI:**

```
┌─ Biến thể sản phẩm (Variants)                                    [+ Thêm biến thể]
├─ Hint: "Thêm biến thể nếu sản phẩm có nhiều phiên bản (size, màu, dung lượng...)"
└─ Bảng:
   ┌────────────┬───────────┬────────────┬──────────┬──────────┬────────────┐
   │ Tên biến thể│  SKU      │ Giá        │ Tồn kho  │ Trạng thái│ Hành động  │
   ├────────────┼───────────┼────────────┼──────────┼──────────┼────────────┤
   │ 64GB - Đen  │ IPH15-64BK│ 22.990.000₫│   12     │ ✅ Active │ ✏️ 🗑️ ⏻   │
   │ 128GB - Trắng│ IPH15-128W│25.990.000₫│    5     │ ❌ Inactive│✏️ 🗑️ ⏻   │
   └────────────┴───────────┴────────────┴──────────┴──────────┴────────────┘

[Khi click + Thêm biến thể hoặc ✏️] → Modal với form:
  - Tên biến thể *  (input text)
  - SKU *           (input text, uppercase auto)
  - Giá *           (input number, ₫)
  - Tồn kho *       (input number, integer)
  - URL ảnh         (input text, optional)
  - Cân nặng        (input number, optional, gram)
  - Kích thước W×L×H (3 input number, optional, mm)
  - [Hủy] [Lưu]
```

**Code skeleton (Codex hoàn thiện):**

```tsx
// EditProduct.tsx — thêm import
import { useProductVariants } from '@/hooks/admin/useProductVariants';
import { Layers, Edit3, Trash2, Power, Plus } from 'lucide-react';

// Trong component, sau watchedImages:
const productIdNum = isEditMode ? Number(id) : undefined;
const { variants, isLoading: variantsLoading, createVariant, updateVariant,
        toggleVariant, deleteVariant } = useProductVariants(productIdNum);

// Modal state
const [variantModal, setVariantModal] = useState<{ open: boolean; variant?: any }>({ open: false });
```

**Variant zod schema:**

```typescript
const variantSchema = z.object({
  variantName: z.string().min(1, "Tên biến thể là bắt buộc").max(255),
  sku: z.string().min(1).max(100).regex(/^[A-Za-z0-9_-]+$/, "SKU chỉ chứa chữ, số, gạch ngang, gạch dưới")
       .transform(v => v.toUpperCase()),
  price: z.number().min(1, "Giá phải lớn hơn 0").max(999_999_999),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
});
```

**JSX section (đặt sau images):**

```tsx
{/* Variants Section */}
{isEditMode && (
  <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Layers size={16} /> Biến thể sản phẩm
        </h3>
        <p className="text-[11px] text-slate-400 font-medium mt-1">
          Thêm biến thể nếu sản phẩm có nhiều phiên bản (size, màu, dung lượng...)
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVariantModal({ open: true })}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
      >
        <Plus size={14} /> Thêm biến thể
      </button>
    </div>

    {variantsLoading ? <p>Đang tải...</p> :
     variants.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-8 text-center">
          Chưa có biến thể nào. Sản phẩm sẽ bán với giá & tồn kho mặc định ở trên.
        </p>
     ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-slate-600">Tên</th>
              <th className="px-4 py-2 text-left font-bold text-slate-600">SKU</th>
              <th className="px-4 py-2 text-right font-bold text-slate-600">Giá</th>
              <th className="px-4 py-2 text-center font-bold text-slate-600">Tồn kho</th>
              <th className="px-4 py-2 text-center font-bold text-slate-600">Trạng thái</th>
              <th className="px-4 py-2 text-right font-bold text-slate-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v: any) => (
              <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{v.variantName || '-'}</td>
                <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                <td className="px-4 py-3 text-right font-bold">{Number(v.price).toLocaleString()}₫</td>
                <td className="px-4 py-3 text-center">{v.stockQuantity ?? v.stock_quantity}</td>
                <td className="px-4 py-3 text-center">
                  {v.isActive || v.is_active === 1
                    ? <span className="text-emerald-600 text-xs font-bold">✅ Active</span>
                    : <span className="text-slate-400 text-xs font-bold">⏸ Inactive</span>}
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button type="button" onClick={() => setVariantModal({ open: true, variant: v })} title="Sửa">
                    <Edit3 size={14} className="text-blue-600" />
                  </button>
                  <button type="button" onClick={() => toggleVariant(v.id)} title="Toggle">
                    <Power size={14} className="text-amber-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { if(confirm('Xóa biến thể này?')) deleteVariant(v.id); }}
                    title="Xóa"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
     )}

    {variantModal.open && (
      <VariantModal
        variant={variantModal.variant}
        onClose={() => setVariantModal({ open: false })}
        onSave={async (body) => {
          if (variantModal.variant) {
            await updateVariant({ id: variantModal.variant.id, body });
            success('Đã cập nhật biến thể');
          } else {
            await createVariant(body);
            success('Đã tạo biến thể');
          }
          setVariantModal({ open: false });
        }}
      />
    )}
  </div>
)}
```

**`VariantModal` component:** đặt CÙNG file `EditProduct.tsx` (cuối file, không tạo file mới — đơn giản hóa scope). Modal dùng `react-hook-form` + `zodResolver(variantSchema)`, layout 2 cột, có nút Hủy/Lưu, hiển thị validation error inline.

---

## 6. PROMPTS cho Codex (chạy theo thứ tự)

### 🟦 PROMPT 1 — Backend AdminProductVariantController + DTO

```
Bạn đang làm trên branch `feature/vu` trong monorepo:
C:\Users\razer user\Desktop\Nguyen Phan Hoang Vu\Ecommerce_marketplace-Microservice_GithubAction\

Đọc kỹ PHASE2_VARIANTS_SPEC.md ở root, đặc biệt §3.1, §4, §5.1, §5.2, §6.

Nhiệm vụ Prompt 1:
1. Tạo Marketplace-platform/src/main/java/docker_test/com/dto/admin/ProductVariantRequestDTO.java
   theo spec §5.2 (snake_case fields, jakarta.validation, getters/setters đầy đủ).

2. Tạo Marketplace-platform/src/main/java/docker_test/com/controllers/admin/AdminProductVariantController.java
   theo spec §5.1 với 6 endpoints (GET list, GET id, POST, PUT, PATCH toggle, DELETE soft).
   - Constructor injection ProductVariantRepository
   - @Valid @RequestBody ProductVariantRequestDTO cho POST/PUT
   - KHÔNG try-catch — để GlobalExceptionHandler handle
   - 404 nếu productId hoặc variantId không tồn tại / không thuộc product
   - Soft delete: UPDATE is_active=0

3. Nếu ProductVariantRepository thiếu method (GetByProductId, GetById, Create, Update, etc.):
   bổ sung TỐI THIỂU theo style raw JDBC hiện có. KHÔNG refactor method đã tồn tại.

4. Build:
   cmd.exe /c "cd /d \"C:\\Users\\razer user\\Desktop\\Nguyen Phan Hoang Vu\\Ecommerce_marketplace-Microservice_GithubAction\\Marketplace-platform\" && mvnw.cmd compile -DskipTests"
   Phải PASS. Nếu fail → fix, không kết thúc nếu build fail.

CẤM:
- ❌ Sửa ProductRepository.java (đã fix bug Phase 1.7)
- ❌ Sửa ProductVariantMapper.java
- ❌ Sửa seller/ProductVariantController.java
- ❌ Sửa CORS, thêm dependency, đụng order/cart/payment/auth
- ❌ Tạo branch hoặc worktree mới
- ❌ Tạo "tiện thể" thêm controller khác (variant attributes, variant images...)

Báo cáo: liệt kê 2 file Java tạo mới + repository methods bổ sung (nếu có) + log "BUILD SUCCESS".
```

### 🟧 PROMPT 2 — Frontend service + hook

```
Tiếp tục từ Prompt 1 (BE đã PASS).

Đọc PHASE2_VARIANTS_SPEC.md §3.2, §5.3, §5.4, §6.

Nhiệm vụ Prompt 2:
1. Sửa marketfrontend/src/service/productVariant.ts theo §5.3:
   - Thay/thêm 5 function: getVariantsByProduct, createVariant, updateVariant,
     toggleVariant, deleteVariant
   - Dùng `import http from '../lib/http';`
   - Giữ flag USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
   - Trả ProductVariant từ types/index.ts (đã có sẵn)
   - Nếu file đã có function với tên này → ghi đè giữ signature

2. Tạo marketfrontend/src/hooks/admin/useProductVariants.ts theo §5.4:
   - Dùng @tanstack/react-query (giống useProducts.ts)
   - Export 1 hook duy nhất useProductVariants(productId)
   - Trả về { variants, isLoading, isError, refetch, createVariant, updateVariant,
     toggleVariant, deleteVariant, isMutating }
   - invalidateQueries sau mỗi mutation

3. Build frontend:
   cd marketfrontend && npm run build
   Phải PASS không lỗi TypeScript.

CẤM:
- ❌ Cài thư viện mới
- ❌ Đụng UI component nào (chỉ service + hook)
- ❌ Sửa types/index.ts (nếu thiếu field thì thêm cẩn thận)
- ❌ Sửa file service khác (products.ts, sellers.ts, ...)

Báo cáo: liệt kê 2 file (1 sửa, 1 mới) + log "✓ Compiled successfully".
```

### 🟩 PROMPT 3 — Frontend UI Variants section trong EditProduct

```
Tiếp tục từ Prompt 2 (FE service + hook đã build PASS).

Đọc PHASE2_VARIANTS_SPEC.md §3.2, §5.5, §6.

Nhiệm vụ Prompt 3:
1. Sửa marketfrontend/src/app/admin/products/EditProduct.tsx:
   a) Thêm import: useProductVariants, Layers/Edit3/Trash2/Power/Plus icons
   b) Thêm hook call: const { variants, ... } = useProductVariants(isEditMode ? Number(id) : undefined);
   c) Thêm zod schema variantSchema (§5.5)
   d) Thêm state: const [variantModal, setVariantModal] = useState<{open: boolean; variant?: any}>({open:false});
   e) Thêm JSX section "Biến thể sản phẩm" NGAY SAU section Hình ảnh, TRƯỚC section Thuộc tính
      (xem skeleton ở §5.5 — Codex hoàn thiện UI Tailwind đẹp giống các section khác)
   f) Tạo VariantModal component CÙNG file (cuối file EditProduct.tsx, KHÔNG tạo file mới):
      - react-hook-form + zodResolver(variantSchema)
      - 2 cột: cột trái (variantName, sku, price, stock), cột phải (imageUrl, weight, dimensions WxLxH)
      - Hiển thị error inline cho mỗi field
      - Nút Hủy + Lưu (Lưu disable khi !isDirty || isSubmitting)
      - Khi sửa: pre-fill từ variant prop
      - Khi tạo: empty defaults
   g) Hiển thị table variants với columns: Tên, SKU, Giá, Tồn kho, Trạng thái, Hành động
   h) Nút Toggle gọi toggleVariant; nút Xóa hỏi confirm rồi gọi deleteVariant; nút Sửa mở modal
   i) Modal save → gọi createVariant hoặc updateVariant tương ứng

2. Section variants CHỈ hiện khi isEditMode === true (sản phẩm chưa lưu thì không thêm variant được)

3. Build frontend:
   cd marketfrontend && npm run build
   Phải PASS.

CẤM:
- ❌ Tạo file component mới (VariantModal đặt cùng file EditProduct.tsx)
- ❌ Đụng các form section khác (General Info, Images, Attributes, Price/Stock, Status)
- ❌ Sửa products/page.tsx hay ProductDetail.tsx
- ❌ Cài thư viện mới
- ❌ Đụng routing hay layout

Báo cáo: liệt kê duy nhất 1 file đã sửa (EditProduct.tsx) + log "✓ Compiled successfully" + screenshot mô tả Variants section trông như thế nào.
```

---

## 7. Acceptance criteria (Vũ + Claude verify)

Sau khi 3 prompts xong, Vũ làm:

- [ ] **Restart IntelliJ** Run config (Stop ⏹ → Run ▶) — load class mới
- [ ] **Restart frontend dev**: `cd marketfrontend && npm run dev`
- [ ] Mở trình duyệt: `/admin/products` → click một sản phẩm → vào trang Edit
- [ ] Thấy section "Biến thể sản phẩm" với button "+ Thêm biến thể"
- [ ] Click "+ Thêm" → modal hiện → submit empty → thấy error "Tên biến thể là bắt buộc"
- [ ] Submit valid (vd: "64GB Đen" / "IPH-64BK" / 22990000 / 10) → variant xuất hiện trong table
- [ ] Click ✏️ → modal pre-fill, sửa giá → table cập nhật
- [ ] Click ⏻ → variant chuyển Inactive (table reload)
- [ ] Click 🗑️ → confirm → variant biến mất khỏi list (DB still has row, is_active=0)
- [ ] Postman test backend trực tiếp:
  ```
  POST /admin/products/4/variants
  { "variant_name":"abc", "sku":"BAD#SKU", "price":-1, "stock_quantity":-1 }
  → 400 ApiError với fieldErrors {sku, price, stock_quantity}
  ```
- [ ] Tạo 2 variants với cùng SKU → variant thứ 2 → 409 với message tiếng Việt (DUPLICATE_KEY)
- [ ] Verify DB: `SELECT id, variant_name, sku, price, stock_quantity, is_active FROM product_variant WHERE product_id=4;` thấy data đúng

## 8. Rủi ro Vũ cần để ý

1. **Codex có lịch sử scope creep** (Phase 1.7) → đọc kỹ "CẤM" trong mỗi prompt, nếu thấy git status có file lạ → báo Claude
2. **ProductVariant model** dùng `Double price` hay `BigDecimal`? Codex check trước khi cast
3. **DB migration**: bảng `product_variant` đã có sẵn, KHÔNG cần migrate. Cột `is_active` đã có default = 1
4. **SKU không bắt buộc trong DB** (cột `sku DEFAULT NULL`) nhưng spec frontend yêu cầu → OK do validation tầng app
5. Modal có 9-10 fields, UI cần responsive — nếu chật, chia 2 hàng

## 9. Sau khi PASS

Vũ ping Claude → Claude review code + chạy smoke test variants → đóng Phase 2 (cốt lõi đã đủ wow cho defense) → mở **Phase 3 hoặc Phase 4 báo cáo** tùy bạn chọn.

**Nâng cao (optional, sau Phase 2 cốt lõi):**
- Bulk import variants từ file CSV
- Variant images upload trực tiếp (thay vì paste URL)
- Variant attribute matrix (size × color → tự động tạo variants)

→ Để dành Phase 3 nếu còn thời gian.
