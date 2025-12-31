import CategoryAttributeManager from "@/components/admin/category_attribute_page/CategoryAttributeManager";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense
      fallback={
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <CategoryAttributeManager />
    </Suspense>
  );
};

export default page;
