import CategoryAttributeManager from "@/components/admin/category_attribute_page/CategoryAttributeManager";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<div>Loading category attributes...</div>}>
      <CategoryAttributeManager />
    </Suspense>
  );
};

export default page;
