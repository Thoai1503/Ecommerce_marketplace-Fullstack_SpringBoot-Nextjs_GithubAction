"use client";

// Route động cho chỉnh sửa ngành hàng: /admin/categories/industries/[id]/edit
// Tái sử dụng form `EditCategory.tsx`.

import { Suspense } from "react";
import EditCategory from "../../../EditCategory";

export default function IndustryEditPage() {
  return (
    <Suspense fallback={null}>
      <EditCategory />
    </Suspense>
  );
}
