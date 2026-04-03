"use client";

// Route static cho tạo mới ngành hàng: /admin/categories/industries/new
// Tái sử dụng form `EditCategory.tsx` (không có id -> create mode).

import { Suspense } from "react";
import EditCategory from "../../EditCategory";

export default function NewIndustryPage() {
  return (
    <Suspense fallback={null}>
      <EditCategory />
    </Suspense>
  );
}
