"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function CategorySidebar({
  parent,
  categories,
  brands,
  currentId,
}: {
  parent: any;
  categories: any[];
  brands: any[];
  currentId: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentChild = searchParams.get("child");
  const selectedBrands = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const buildCategoryHref = (childId?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("brand");

    if (childId) params.set("child", String(childId));
    else params.delete("child");

    const query = params.toString();
    return `/category/${currentId}${query ? `?${query}` : ""}`;
  };

  // ===== BUILD URL =====
  const pushWithParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(`/category/${currentId}${query ? `?${query}` : ""}`);
  };

  // ===== TOGGLE BRAND =====
  const toggleBrand = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());

    const brands = params.getAll("brand");

    if (brands.includes(String(id))) {
      params.delete("brand");
      brands
        .filter((b) => b !== String(id))
        .forEach((b) => params.append("brand", b));
    } else {
      params.append("brand", String(id));
    }

    pushWithParams(params);
  };

  const goCategory = (childId?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("brand");

    if (childId) {
      params.set("child", String(childId));
    } else {
      params.delete("child");
    }

    pushWithParams(params);
  };

  const applyPriceRange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    const min = String(formData.get("minPrice") || "").trim();
    const max = String(formData.get("maxPrice") || "").trim();

    if (min) params.set("minPrice", min);
    else params.delete("minPrice");

    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");

    pushWithParams(params);
  };

  return (
    <div>
      <div className="filterTitle">
        <span className="filterIcon">◇</span>
        <strong>CATEGORY FILTERS</strong>
      </div>

      <div className="filterBlock">
        <div className="filterHeading">By Category</div>

        <Link
          href={buildCategoryHref()}
          className={`filterCategoryLink ${!currentChild ? "filterCategoryLinkActive" : ""}`}
        >
          {parent?.category_name || parent?.name || "All Categories"}
        </Link>

        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildCategoryHref(c.id)}
            className={`filterCategoryLink ${currentChild === String(c.id) ? "filterCategoryLinkActive" : ""}`}
          >
            {c.category_name || c.name}
          </Link>
        ))}
      </div>

      <div className="filterBlock">
        <div className="filterHeading">Brands</div>

        {brands.length === 0 && (
          <div className="filterEmpty">No related brands</div>
        )}

        {brands.map((b) => {
          const checked = selectedBrands.includes(String(b.id));

          return (
            <label key={b.id} className="filterCheck">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleBrand(b.id)}
              />
              <span>{b.name}</span>
            </label>
          );
        })}
      </div>

      <div className="filterBlock">
        <div className="filterHeading">Price Range</div>
        <form className="filterPriceForm" onSubmit={applyPriceRange}>
          <input
            name="minPrice"
            type="number"
            min="0"
            placeholder="₫ MIN"
            defaultValue={minPrice}
          />
          <input
            name="maxPrice"
            type="number"
            min="0"
            placeholder="₫ MAX"
            defaultValue={maxPrice}
          />
          <button type="submit">Apply</button>
        </form>

        {(searchParams.has("child") ||
          searchParams.has("brand") ||
          minPrice ||
          maxPrice) && (
          <Link className="clearFilterLink" href={buildCategoryHref()}>
            Clear filters
          </Link>
        )}
      </div>
    </div>
  );
}
