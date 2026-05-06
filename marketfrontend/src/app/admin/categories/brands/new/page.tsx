"use client";

import { Suspense } from "react";
import EditBrand from "../../EditBrand";

export default function NewBrandPage() {
  return (
    <Suspense fallback={null}>
      <EditBrand />
    </Suspense>
  );
}
