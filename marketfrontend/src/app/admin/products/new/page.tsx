
"use client";

// Route static cho tạo sản phẩm mới.
// Tái sử dụng cùng form `EditProduct.tsx` nhưng không có `id` trong params,
// nên hook `useProductDetail` sẽ không gọi API (enabled: !!id).

import EditProductPage from "../EditProduct";

export default function NewProductPage() {
  return <EditProductPage />;
}

