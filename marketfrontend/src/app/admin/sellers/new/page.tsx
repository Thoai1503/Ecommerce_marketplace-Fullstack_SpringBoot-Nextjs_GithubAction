"use client";

// Route static cho tạo mới nhà bán hàng.
// Tái sử dụng cùng form `EditSeller.tsx` nhưng không có `id`,
// nên hook `useSellerDetail` sẽ xử lý ở chế độ create.

import EditSeller from "../EditSeller";

export default function NewSellerPage() {
  return <EditSeller />;
}

