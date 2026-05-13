<<<<<<< HEAD
"use client";

// Route static cho tạo thuộc tính mới (/admin/categories/attributes/new)
// Tái sử dụng form `EditAttribute.tsx` (không có id -> create mode).

import EditAttribute from "../../EditAttribute";

export default function NewAttributePage() {
  return <EditAttribute />;
}

=======
"use client";

"use client";

import React, { Suspense } from "react";
import EditAttribute from "../../EditAttribute";

export default function NewAttributePage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditAttribute />
    </Suspense>
  );
}

>>>>>>> c9d4b1976cb5b3a10edc460d55b593d2cd8808dc
