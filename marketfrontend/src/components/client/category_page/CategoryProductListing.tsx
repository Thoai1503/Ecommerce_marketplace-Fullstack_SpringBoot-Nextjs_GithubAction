"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/validators/product";
import { Attribute } from "@/validators/attribute";

type ProductLike = Partial<IProduct> & {
  attributes?: Record<string, string | number | Array<string | number>>;
  is_free_shipping?: boolean;
  created_at?: string;
  shop_name?: string;
};

interface CategoryInfo {
  id: number;
  category_name: string;
  category_slug: string;
}

interface CategoryProductListingProps {
  category: CategoryInfo;
  products: ProductLike[];
  categoryAttributes: Attribute[];
}

type SortKey =
  | "popular"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating_desc";

const PAGE_SIZE = 20;

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalize = (value: unknown): string =>
  String(value ?? "")
    .toLowerCase()
    .trim();

const resolveProductPrice = (product: ProductLike): number => {
  const currentPrice = toNumber(product.price, 0);
  const originalPrice = toNumber(product.original_price, currentPrice);
  return currentPrice > 0 ? currentPrice : originalPrice;
};

const resolveOriginalPrice = (product: ProductLike): number => {
  const currentPrice = resolveProductPrice(product);
  return Math.max(toNumber(product.original_price, currentPrice), currentPrice);
};

const resolveDiscountPercent = (product: ProductLike): number => {
  const price = resolveProductPrice(product);
  const original = resolveOriginalPrice(product);
  if (original <= 0 || price <= 0 || price >= original) return 0;
  return Math.round(((original - price) / original) * 100);
};

const resolveBrandLabel = (product: ProductLike): string => {
  if (product.brand === null || product.brand === undefined) return "Khac";
  return String(product.brand);
};

const resolveAttributeValue = (
  product: ProductLike,
  attribute: Attribute,
): string[] => {
  const attributesMap = product.attributes || {};
  const candidates: unknown[] = [
    attributesMap[attribute.name],
    attributesMap[attribute.slug],
    attributesMap[normalize(attribute.name)],
    attributesMap[normalize(attribute.slug)],
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    if (Array.isArray(candidate)) {
      return candidate.map((item) => String(item));
    }
    return [String(candidate)];
  }

  return [];
};

const productSorters: Record<
  SortKey,
  (a: ProductLike, b: ProductLike) => number
> = {
  popular: (a, b) => toNumber(b.sold_count, 0) - toNumber(a.sold_count, 0),
  newest: (a, b) => {
    const left = new Date(a.created_at || "1970-01-01").getTime();
    const right = new Date(b.created_at || "1970-01-01").getTime();
    return right - left;
  },
  price_asc: (a, b) => resolveProductPrice(a) - resolveProductPrice(b),
  price_desc: (a, b) => resolveProductPrice(b) - resolveProductPrice(a),
  rating_desc: (a, b) => toNumber(b.rating, 0) - toNumber(a.rating, 0),
};

export default function CategoryProductListing({
  category,
  products,
  categoryAttributes,
}: CategoryProductListingProps) {
  const prices = React.useMemo(
    () => products.map(resolveProductPrice).filter((x) => x > 0),
    [products],
  );

  const [keyword, setKeyword] = React.useState("");
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [minRating, setMinRating] = React.useState(0);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [discountOnly, setDiscountOnly] = React.useState(false);
  const [freeShippingOnly, setFreeShippingOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortKey>("popular");
  const [page, setPage] = React.useState(1);

  const [priceMin, setPriceMin] = React.useState<number>(
    prices.length ? Math.min(...prices) : 0,
  );
  const [priceMax, setPriceMax] = React.useState<number>(
    prices.length ? Math.max(...prices) : 0,
  );

  const [selectedAttributeValues, setSelectedAttributeValues] = React.useState<
    Record<string, string[]>
  >({});

  React.useEffect(() => {
    setPriceMin(prices.length ? Math.min(...prices) : 0);
    setPriceMax(prices.length ? Math.max(...prices) : 0);
  }, [prices]);

  const brandOptions = React.useMemo(() => {
    const set = new Set(products.map(resolveBrandLabel));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    const q = normalize(keyword);

    const result = products
      .filter((product) => {
        const price = resolveProductPrice(product);
        const originalPrice = resolveOriginalPrice(product);
        const discountPercent = resolveDiscountPercent(product);
        const stock = toNumber(product.stock_quantity, 0);
        const rating = toNumber(product.rating, 0);
        const brand = resolveBrandLabel(product);

        const byKeyword =
          !q ||
          normalize(product.product_name).includes(q) ||
          normalize(product.description).includes(q) ||
          normalize(product.shop_name).includes(q);

        const byPrice = price >= priceMin && price <= priceMax;
        const byBrand =
          selectedBrands.length === 0 || selectedBrands.includes(brand);
        const byRating = rating >= minRating;
        const byStock = !inStockOnly || stock > 0;
        const byDiscount =
          !discountOnly || (originalPrice > price && discountPercent > 0);
        const byShipping =
          !freeShippingOnly || product.is_free_shipping === true;

        const byAttributes = categoryAttributes.every((attribute) => {
          const selectedValues = selectedAttributeValues[attribute.slug] || [];
          if (!selectedValues.length) return true;

          const productValues = resolveAttributeValue(product, attribute).map(
            normalize,
          );
          return selectedValues.some((value) =>
            productValues.includes(normalize(value)),
          );
        });

        return (
          byKeyword &&
          byPrice &&
          byBrand &&
          byRating &&
          byStock &&
          byDiscount &&
          byShipping &&
          byAttributes
        );
      })
      .sort(productSorters[sortBy]);

    return result;
  }, [
    products,
    keyword,
    selectedBrands,
    minRating,
    inStockOnly,
    discountOnly,
    freeShippingOnly,
    categoryAttributes,
    selectedAttributeValues,
    priceMin,
    priceMax,
    sortBy,
  ]);

  const pagedProducts = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  React.useEffect(() => {
    setPage(1);
  }, [
    keyword,
    selectedBrands,
    minRating,
    inStockOnly,
    discountOnly,
    freeShippingOnly,
    selectedAttributeValues,
    priceMin,
    priceMax,
    sortBy,
  ]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand],
    );
  };

  const toggleAttributeValue = (attributeSlug: string, value: string) => {
    setSelectedAttributeValues((prev) => {
      const current = prev[attributeSlug] || [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [attributeSlug]: next,
      };
    });
  };

  const clearAllFilters = () => {
    setKeyword("");
    setSelectedBrands([]);
    setMinRating(0);
    setInStockOnly(false);
    setDiscountOnly(false);
    setFreeShippingOnly(false);
    setSortBy("popular");
    setSelectedAttributeValues({});
    setPriceMin(prices.length ? Math.min(...prices) : 0);
    setPriceMax(prices.length ? Math.max(...prices) : 0);
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">{category.category_name}</h2>
          <div className="text-muted">
            Tim thay <strong>{filteredProducts.length}</strong> san pham phu hop
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={clearAllFilters}
          >
            Xoa bo loc
          </button>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            style={{ minWidth: "220px" }}
          >
            <option value="popular">Sap xep: Pho bien</option>
            <option value="newest">Sap xep: Moi nhat</option>
            <option value="price_asc">Gia: Thap den cao</option>
            <option value="price_desc">Gia: Cao den thap</option>
            <option value="rating_desc">Danh gia cao nhat</option>
          </select>
        </div>
      </div>

      <div className="row g-3">
        <aside className="col-12 col-lg-3">
          <div
            className="card shadow-sm border-0 sticky-top"
            style={{ top: "92px" }}
          >
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Tim kiem trong nganh hang
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={keyword}
                  placeholder="Ten san pham, mo ta, shop..."
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Khoang gia (VND)
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={priceMin}
                    onChange={(e) => setPriceMin(toNumber(e.target.value, 0))}
                  />
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={priceMax}
                    onChange={(e) => setPriceMax(toNumber(e.target.value, 0))}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold d-block">
                  Danh gia toi thieu
                </label>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="rating filter"
                >
                  {[0, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`btn btn-sm ${minRating === value ? "btn-dark" : "btn-outline-dark"}`}
                      onClick={() => setMinRating(value)}
                    >
                      {value === 0 ? "Tat ca" : `${value}+ sao`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    id="inStockOnly"
                    className="form-check-input"
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="inStockOnly">
                    Con hang
                  </label>
                </div>
                <div className="form-check">
                  <input
                    id="discountOnly"
                    className="form-check-input"
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(e) => setDiscountOnly(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="discountOnly">
                    Dang giam gia
                  </label>
                </div>
                <div className="form-check">
                  <input
                    id="freeShipOnly"
                    className="form-check-input"
                    type="checkbox"
                    checked={freeShippingOnly}
                    onChange={(e) => setFreeShippingOnly(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="freeShipOnly">
                    Ho tro freeship
                  </label>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <label className="form-label fw-semibold d-block">
                  Thuong hieu
                </label>
                <div
                  className="d-flex flex-column gap-1"
                  style={{ maxHeight: "180px", overflow: "auto" }}
                >
                  {brandOptions.map((brand) => (
                    <label
                      key={brand}
                      className="form-check-label d-flex align-items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {categoryAttributes.length > 0 && (
                <>
                  <hr />
                  <h6 className="fw-bold mb-3">Thuoc tinh nganh hang</h6>
                  <div className="d-flex flex-column gap-3">
                    {categoryAttributes.map((attribute) => (
                      <div key={attribute.slug}>
                        <div className="fw-semibold mb-1">{attribute.name}</div>
                        <div
                          className="d-flex flex-wrap gap-2"
                          style={{ maxHeight: "130px", overflow: "auto" }}
                        >
                          {attribute.values.map((value) => {
                            const selected = (
                              selectedAttributeValues[attribute.slug] || []
                            ).includes(value);
                            return (
                              <button
                                key={`${attribute.slug}-${value}`}
                                type="button"
                                className={`btn btn-sm ${selected ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() =>
                                  toggleAttributeValue(attribute.slug, value)
                                }
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>

        <section className="col-12 col-lg-9">
          {pagedProducts.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5 text-center text-muted">
                Khong tim thay san pham phu hop voi bo loc hien tai.
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {pagedProducts.map((item) => {
                const productId = item.id;
                const href = `/${item.product_slug || "product"}-.p${productId}?id=${productId}`;
                const price = resolveProductPrice(item);
                const originalPrice = resolveOriginalPrice(item);
                const discount = resolveDiscountPercent(item);

                return (
                  <div key={productId} className="col-6 col-md-4 col-xl-3">
                    <Link
                      href={href}
                      className="text-decoration-none text-dark"
                    >
                      <div className="card h-100 border-0 shadow-sm position-relative">
                        {discount > 0 && (
                          <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                            -{discount}%
                          </span>
                        )}
                        <div className="ratio ratio-1x1 bg-light">
                          <Image
                            src={
                              item.image_url ||
                              "https://via.placeholder.com/400?text=No+Image"
                            }
                            alt={item.product_name || "Product"}
                            fill
                            className="object-fit-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        </div>
                        <div className="card-body d-flex flex-column">
                          <div
                            className="small text-muted mb-1"
                            style={{ minHeight: "38px" }}
                          >
                            {item.product_name || "San pham"}
                          </div>
                          <div className="fw-bold text-danger fs-5">
                            {price.toLocaleString("vi-VN")}d
                          </div>
                          <div className="small text-muted text-decoration-line-through">
                            {originalPrice.toLocaleString("vi-VN")}d
                          </div>
                          <div className="small mt-2 text-secondary">
                            Da ban{" "}
                            {toNumber(item.sold_count, 0).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            | {toNumber(item.rating, 0).toFixed(1)} sao
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="pagination">
              <ul className="pagination mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Truoc
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                  .map((p) => (
                    <li
                      key={p}
                      className={`page-item ${page === p ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  ))}
                <li
                  className={`page-item ${page >= totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}
