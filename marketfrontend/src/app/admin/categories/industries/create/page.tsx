"use client";

/*
Route:
 /admin/categories/industries/create?parentId=70

Dùng để tạo SUBCATEGORY.
Form EditCategory sẽ đọc parentId từ query.
*/

import EditCategory from "../../EditCategory";

export default function CreateSubCategoryPage() {
  return <EditCategory />;
}
