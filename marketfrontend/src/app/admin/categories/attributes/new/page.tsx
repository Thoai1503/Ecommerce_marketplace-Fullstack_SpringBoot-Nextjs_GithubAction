"use client";

// Route static cho tạo thuộc tính mới (/admin/categories/attributes/new)
// Tái sử dụng form `EditAttribute.tsx` (không có id -> create mode).

import EditAttribute from "../../EditAttribute";

export default function NewAttributePage() {
  return <EditAttribute />;
}

