"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <ShieldAlert size={40} className="mx-auto text-amber-500 mb-4" />
        <h1 className="text-xl font-black text-slate-800 mb-2">Admin khong tao product</h1>
        <p className="text-sm text-slate-500 mb-6">
          Theo nghiep vu hien tai, product phai do seller tao va gui cho admin duyet.
        </p>
        <Link href="/admin/products" className="inline-flex px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold">
          Quay lai kiem duyet
        </Link>
      </div>
    </div>
  );
}
