"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, X } from "lucide-react";

type Shop = {
  id?: number;
  shopName?: string;
  status?: string;
  category?: string;
  location?: string;
  logoUrl?: string;
  website?: string;
};

export default function ProfileCompletionBanner() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shop");
      if (raw) setShop(JSON.parse(raw));
    } catch {}
    setDismissed(sessionStorage.getItem("profileBannerDismissed") === "1");
  }, []);

  if (!shop || dismissed) return null;
  if (shop.status !== "ACTIVE") return null;

  const missing: string[] = [];
  if (!shop.logoUrl) missing.push("logo");
  if (!shop.category) missing.push("danh mục");
  if (!shop.location) missing.push("địa chỉ / mô tả");

  if (missing.length === 0) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("profileBannerDismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-3 flex items-center gap-4">
      <AlertCircle size={20} className="text-amber-600 shrink-0" />
      <div className="flex-1 text-sm">
        <span className="font-bold text-amber-900">Hoàn thiện hồ sơ cửa hàng:</span>{" "}
        <span className="text-amber-800">
          Bạn cần bổ sung {missing.join(", ")} để khách hàng tin tưởng hơn.
        </span>
      </div>
      <Link
        href="/seller/profile"
        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition"
      >
        Hoàn thiện ngay
      </Link>
      <button
        onClick={handleDismiss}
        className="text-amber-600 hover:text-amber-800"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
}
