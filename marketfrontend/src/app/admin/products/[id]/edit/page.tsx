"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function ProductEditPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="p-8">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <ShieldAlert size={40} className="mx-auto text-amber-500 mb-4" />
        <h1 className="text-xl font-black text-slate-800 mb-2">Admin khong sua product</h1>
        <p className="text-sm text-slate-500 mb-6">
          Admin chi duoc duyet hoac tu choi san pham seller gui len.
        </p>
        <Link
          href={`/admin/products/${params.id}`}
          className="inline-flex px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold"
        >
          Quay lai chi tiet
        </Link>
      </div>
    </div>
  );
}
