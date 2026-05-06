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

