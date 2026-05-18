# Variant V2 — Mô hình trực quan

---

## 1. So sánh mô hình cũ vs mới

### ❌ Mô hình cũ (Flat)

```
product
  └── product_variant
        ├── id
        ├── variant_name   ← "Đen / XL"  (string thủ công, không có cấu trúc)
        ├── sku
        ├── price
        ├── stock_quantity
        └── image_url
```

**Vấn đề:**

- "Đen / XL" chỉ là 1 chuỗi — không biết "Đen" thuộc nhóm _Màu_ hay nhóm _Kích cỡ_
- Frontend không thể vẽ nút chọn màu riêng + nút chọn size riêng
- Dữ liệu không nhất quán (seller gõ "đen/XL", "Đen - xl", "BLACK / XL" đều khác nhau)

---

### ✅ Mô hình mới (V2 — Structured)

```
product
  │
  ├── variant_group [Màu sắc]          variant_group [Kích cỡ]
  │     ├── variant_option [Đen]             ├── variant_option [S]
  │     ├── variant_option [Trắng]           ├── variant_option [M]
  │     └── variant_option [Đỏ]             └── variant_option [XL]
  │
  └── product_variant  ← tổ hợp mua được
        ├── id
        ├── option_signature = "1:2|2:5"   ← mã hoá tổ hợp (groupId:optionId)
        ├── sku
        ├── price
        ├── stock_quantity
        └── image_url
              │
              └── product_variant_option (join table)
                    ├── variant_id = product_variant.id
                    └── option_id  = variant_option.id
```

---

## 2. Sơ đồ quan hệ bảng (ERD)

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────────────┐
│   product   │ 1 ─── * │  variant_group   │ 1 ─── * │   variant_option     │
├─────────────┤         ├──────────────────┤         ├──────────────────────┤
│ id (PK)     │         │ id (PK)          │         │ id (PK)              │
│ name        │         │ product_id (FK)  │         │ variant_group_id(FK) │
│ ...         │         │ group_name       │         │ option_value         │
└─────────────┘         │ sort_order       │         │ sort_order           │
                        │ is_active        │         │ image_url            │
                        └──────────────────┘         │ is_active            │
                                                      └──────────┬───────────┘
                                                                 │ *
                                                                 │
                                                    ┌────────────┴─────────────┐
                                                    │  product_variant_option  │
                                                    ├──────────────────────────┤
                                                    │ variant_id (FK) ─────────┼──────────────────────┐
                                                    │ option_id  (FK)          │                      │
                                                    └──────────────────────────┘                      │
                                                                                                       │ *
                                                                                          ┌────────────┴──────────┐
                                                                                          │   product_variant     │
                                                                                          ├───────────────────────┤
                                                                                          │ id (PK)               │
                                                                                          │ product_id (FK)       │
                                                                                          │ option_signature      │
                                                                                          │ sku                   │
                                                                                          │ price                 │
                                                                                          │ stock_quantity        │
                                                                                          │ image_url             │
                                                                                          │ is_active             │
                                                                                          └───────────────────────┘
```

---

## 3. Ví dụ thực tế — Áo thun 2 nhóm biến thể

### Dữ liệu bảng

**variant_group**

```
┌────┬────────────┬───────────┬──────────────┐
│ id │ product_id │ group_name│  sort_order  │
├────┼────────────┼───────────┼──────────────┤
│  1 │    101     │ Màu sắc   │      1       │
│  2 │    101     │ Kích cỡ   │      2       │
└────┴────────────┴───────────┴──────────────┘
```

**variant_option**

```
┌────┬──────────────────┬──────────────┬────────────┐
│ id │ variant_group_id │ option_value │ sort_order │
├────┼──────────────────┼──────────────┼────────────┤
│  1 │        1         │    Đen       │     1      │
│  2 │        1         │    Trắng     │     2      │
│  3 │        2         │    S         │     1      │
│  4 │        2         │    M         │     2      │
│  5 │        2         │    XL        │     3      │
└────┴──────────────────┴──────────────┴────────────┘
```

**product_variant** (6 tổ hợp = 2 màu × 3 size)

```
┌────┬────────────┬──────────────────┬───────────────┬────────┬───────────────┐
│ id │ product_id │ option_signature │      sku      │ price  │ stock_quantity│
├────┼────────────┼──────────────────┼───────────────┼────────┼───────────────┤
│  1 │    101     │    1:1|2:3       │ SHIRT-BLK-S   │ 150000 │      10       │
│  2 │    101     │    1:1|2:4       │ SHIRT-BLK-M   │ 150000 │       8       │
│  3 │    101     │    1:1|2:5       │ SHIRT-BLK-XL  │ 160000 │       5       │
│  4 │    101     │    1:2|2:3       │ SHIRT-WHT-S   │ 150000 │      12       │
│  5 │    101     │    1:2|2:4       │ SHIRT-WHT-M   │ 150000 │       0       │ ← hết hàng
│  6 │    101     │    1:2|2:5       │ SHIRT-WHT-XL  │ 160000 │       3       │
└────┴────────────┴──────────────────┴───────────────┴────────┴───────────────┘
```

> **option_signature** = sorted list of `{groupId}:{optionId}` pairs, joined by `|`
> Ví dụ: Đen (id=1, group=1) + XL (id=5, group=2) → `"1:1|2:5"`

---

## 4. Luồng Seller tạo biến thể

```
Seller
  │
  ├─[1]─► POST /seller/product-variant-v2/product/{id}/groups
  │         body: { group_name: "Màu sắc", sort_order: 1 }
  │         → tạo variant_group
  │
  ├─[2]─► POST /seller/product-variant-v2/groups/{groupId}/options
  │         body: { option_value: "Đen", sort_order: 1 }
  │         → tạo variant_option
  │         (lặp lại cho Trắng, Đỏ...)
  │
  ├─[3]─► POST /seller/product-variant-v2/product/{id}/groups   (tạo nhóm thứ 2)
  │         body: { group_name: "Kích cỡ", sort_order: 2 }
  │
  ├─[4]─► POST /seller/product-variant-v2/groups/{groupId}/options
  │         body: { option_value: "S" / "M" / "XL" }
  │         (lặp lại)
  │
  └─[5]─► POST /seller/product-variant-v2/product/{id}/variants/generate
            → server tự tính tích Descartes: 2 màu × 3 size = 6 tổ hợp
            → tạo 6 bản ghi product_variant + product_variant_option
            → sinh option_signature cho mỗi tổ hợp
```

---

## 5. Luồng Buyer chọn biến thể (Frontend)

```
Trang sản phẩm load
  │
  └─► GET /product/{id}/variant-schema
        ↓
  Response:
  {
    variantGroups: [
      { groupName: "Màu sắc", options: ["Đen", "Trắng"] },
      { groupName: "Kích cỡ", options: ["S", "M", "XL"] }
    ],
    variants: [
      { id:1, optionSignature:"1:1|2:3", price:150000, stock:10 },
      { id:5, optionSignature:"1:2|2:4", price:150000, stock:0 },
      ...
    ]
  }

Buyer UI:
  ┌──────────────────────────────────────┐
  │  Màu sắc:  [■ Đen]  [□ Trắng]       │
  │  Kích cỡ:  [S]  [M]  [XL]           │
  │                                      │
  │  → Chọn: Đen + M                    │
  │  → Giá: 150,000₫                    │
  │  → Còn lại: 8 sản phẩm             │
  │  → [Thêm vào giỏ hàng]              │
  └──────────────────────────────────────┘

Logic tra cứu variant:
  selectedOptions = { group1: optionId_Den, group2: optionId_M }
  signature = build_signature(selectedOptions)  → "1:1|2:4"
  matchedVariant = variants.find(v => v.optionSignature === signature)
  → render price, stock, image từ matchedVariant
```

---

## 6. Kiến trúc layer Backend (Java)

```
HTTP Request
    │
    ▼
┌──────────────────────────────────────┐
│  Controller (seller / public)        │
│  ProductVariantV2Controller.java     │
│  ProductVariantController.java       │
└──────────────┬───────────────────────┘
               │ (sẽ thêm service layer)
               ▼
┌──────────────────────────────────────┐
│  Service (nghiệp vụ phức tạp)        │
│  VariantV2Service.java               │  ← sinh tổ hợp, tính signature
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Repository (JDBC thủ công)          │
│  VariantGroupRepository.java         │
│  VariantOptionRepository.java        │
│  ProductVariantRepository.java       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  DBConnection (HikariCP singleton)   │
│  MySQL 8.0 @ 103.90.225.130          │
│  database: ecommerce                 │
└──────────────────────────────────────┘
```

---

## 7. Timeline triển khai

```
Tuần 1                  Tuần 2                  Tuần 3                  Tuần 4
│                       │                       │                       │
├── M1 Schema ──────────┤                       │                       │
│   variant_group       │                       │                       │
│   variant_option      │                       │                       │
│   product_variant_    │                       │                       │
│   option              │                       │                       │
│   option_signature    │                       │                       │
│                       ├── M2 Seller APIs ─────┤                       │
│                       │   CRUD groups/options │                       │
│                       │   Generate combos     │                       │
│                       │   Bulk update         │                       │
│                       │                       ├── M3 Buyer API ───────┤
│                       │                       │   variant-schema      │
│                       │                       │   Compatibility layer │
│                       │                       │                       ├── M4 Frontend
│                       │                       │                       │   ProductDetail.tsx
│                       │                       │                       │   TypeScript types
│                       │                       │                       │   UI groups/options
│
▼ Non-breaking (additive only)
                        ▼ Old API vẫn hoạt động
                                                ▼ Old API build từ data mới
                                                                        ▼ Old API deprecated
```

---

## 8. Tóm tắt lợi ích

| Tiêu chí                  | Mô hình cũ                  | Mô hình mới V2                   |
| ------------------------- | --------------------------- | -------------------------------- |
| Cấu trúc dữ liệu          | Chuỗi phẳng "Đen/XL"        | Cây có cấu trúc: Group → Option  |
| Frontend render           | Chỉ 1 list variant          | Nhiều hàng nút (mỗi nhóm 1 hàng) |
| Tìm variant theo lựa chọn | Không thể                   | Tra bằng `option_signature`      |
| Out-of-stock feedback     | Không có                    | Disable nút option               |
| Thêm nhóm mới             | Phải sửa tất cả tên variant | Thêm 1 group + option mới        |
| Consistency               | Dễ lỗi chính tả             | Được enforce bởi UNIQUE index    |
