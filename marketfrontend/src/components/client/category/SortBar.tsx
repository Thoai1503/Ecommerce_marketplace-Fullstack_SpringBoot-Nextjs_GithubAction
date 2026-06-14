"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SortBar({ categoryId }: { categoryId: string }) {
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
    <div className="searchToolbar">
      <span className="text-muted small">Sort by</span>

      {[
        ["popular", "Relevant"],
        ["new", "Latest"],
        ["best", "Top Sales"],
      ].map(([value, label]) => (
        <Link
          key={value}
          href={buildUrl(value)}
          className={`sortButton ${currentSort === value ? "sortButtonActive" : ""}`}
        >
          {label}
        </Link>
      ))}

      <Link
        href={buildUrl(undefined, currentOrder === "asc" ? "desc" : "asc")}
        className={`sortPrice ${currentOrder ? "sortButtonActive" : ""}`}
      >
        Price <span>⌄</span>
      </Link>

      <div className="pageStatus">
        <span>1/17</span>
        <button type="button" disabled>
          ‹
        </button>
        <button type="button">›</button>
      </div>
    </div>
  );
}
