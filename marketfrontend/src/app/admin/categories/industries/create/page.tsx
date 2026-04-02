"use client";

/*
Route:
 /admin/categories/industries/create?parentId=70

Dùng để tạo SUBCATEGORY.
Form EditCategory sẽ đọc parentId từ query.
*/

import { Suspense } from "react";
import EditCategory from "../../EditCategory";

export default function CreateSubCategoryPage() {
  return (
    <Suspense fallback={null}>
      <EditCategory />
    </Suspense>
  );
}
