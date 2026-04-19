"use client";

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
      // remove
      params.delete("brand");
      brands
        .filter((b) => b !== String(id))
        .forEach((b) => params.append("brand", b));
    } else {
      // add
      params.append("brand", String(id));
    }

    pushWithParams(params);
  };

  // ===== CHANGE CATEGORY =====
  const goCategory = (childId?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    // reset brand khi đổi category
    params.delete("brand");

    if (childId) {
      params.set("child", String(childId));
    } else {
      params.delete("child");
    }

    pushWithParams(params);
  };

  return (
    <div className="card p-3">
      {/* CATEGORY */}
      <h6 className="fw-bold mb-3">All Categories</h6>

      {/* CATEGORY CHA */}
      <div
        onClick={() => goCategory()}
        className={`fw-bold d-block mb-2 cursor-pointer ${
          !currentChild ? "text-danger" : "text-dark"
        }`}
      >
        ▶ {parent?.category_name}
      </div>

      {/* CATEGORY CON */}
      <div className="ps-3 mb-4">
        {categories.map((c) => {
          const isActive = currentChild === String(c.id);

          return (
            <div
              key={c.id}
              onClick={() => goCategory(c.id)}
              className={`mb-1 cursor-pointer ${
                isActive ? "text-danger fw-bold" : "text-dark"
              }`}
            >
              {c.category_name}
            </div>
          );
        })}
      </div>

      {/* BRAND */}
      <h6 className="fw-bold mb-2">Brands</h6>

      <div className="mb-4">
        {brands.map((b) => {
          const checked = selectedBrands.includes(String(b.id));

          return (
            <div key={b.id} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={checked}
                onChange={() => toggleBrand(b.id)}
              />

              <label
                className="form-check-label cursor-pointer"
                onClick={() => toggleBrand(b.id)}
              >
                {b.name}
              </label>
            </div>
          );
        })}
      </div>

      {/* PRICE (chưa active logic) */}
      <h6 className="fw-bold mb-2">Price Range</h6>

      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="₫ FROM" />
        <input className="form-control" placeholder="₫ TO" />
      </div>

      <button className="btn btn-danger w-100">APPLY</button>
    </div>
  );
}