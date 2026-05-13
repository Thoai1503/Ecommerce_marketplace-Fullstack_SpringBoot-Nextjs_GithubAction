"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortBar({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "popular";
  const currentOrder = searchParams.get("order") || "";
  const currentChild = searchParams.get("child");
  const brandParams = searchParams.getAll("brand");

  // ===== BUILD URL =====
  const buildUrl = (newSort?: string, newOrder?: string) => {
    const params = new URLSearchParams();

    if (currentChild) params.set("child", currentChild);

    brandParams.forEach((b) => params.append("brand", b));

    if (newSort) params.set("sort", newSort);
    else if (currentSort) params.set("sort", currentSort);

    if (newOrder !== undefined) {
      if (newOrder) params.set("order", newOrder);
      else params.delete("order");
    } else if (currentOrder) {
      params.set("order", currentOrder);
    }

    return `/category/${categoryId}?${params.toString()}`;
  };

  return (
    <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">

      <span className="text-muted small">Sort by</span>

      {/* PHỔ BIẾN */}
      <button
        className={`btn btn-sm ${
          currentSort === "popular"
            ? "btn-danger"
            : "btn-outline-secondary"
        }`}
        onClick={() => router.push(buildUrl("popular"))}
      >
        Popular
      </button>

      {/* MỚI NHẤT */}
      <button
        className={`btn btn-sm ${
          currentSort === "new"
            ? "btn-danger"
            : "btn-outline-secondary"
        }`}
        onClick={() => router.push(buildUrl("new"))}
      >
        Latest
      </button>

      {/* BÁN CHẠY */}
      <button
        className={`btn btn-sm ${
          currentSort === "best"
            ? "btn-danger"
            : "btn-outline-secondary"
        }`}
        onClick={() => router.push(buildUrl("best"))}
      >
        Best Seller
      </button>

      {/* GIÁ (RIÊNG) */}
      <select
        className="form-select form-select-sm"
        style={{ width: 180 }}
        value={currentOrder}
        onChange={(e) =>
          router.push(buildUrl(undefined, e.target.value))
        }
      >
        <option value="">Price</option>
        <option value="asc">Price: Low → High</option>
        <option value="desc">Price: High → Low</option>
      </select>

    </div>
  );
}