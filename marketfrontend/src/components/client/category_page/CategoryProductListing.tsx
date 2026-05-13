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

const formatCurrency = (value: number): string =>
  `${value.toLocaleString("vi-VN")}d`;

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

  const activeFilterCount =
    (keyword ? 1 : 0) +
    (selectedBrands.length ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (discountOnly ? 1 : 0) +
    (freeShippingOnly ? 1 : 0) +
    (Object.values(selectedAttributeValues).some((items) => items.length > 0)
      ? 1
      : 0);

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

  const priceFloor = prices.length ? Math.min(...prices) : 0;
  const priceCeil = prices.length ? Math.max(...prices) : 0;

  return (
    <div className="categoryListing">
      <div className="container-fluid px-3 px-md-4 py-4 py-lg-5">
        <div className="heroPanel mb-4">
          <div className="heroCopy">
            <span className="eyebrow">Nganh hang</span>
            <h1 className="heroTitle">{category.category_name}</h1>
            <p className="heroSubtitle">
              Chon nhanh san pham phu hop voi nhu cau cua ban voi bo loc gon, de
              doc va de dung hon.
            </p>
          </div>
          <div className="heroStats">
            <div className="statCard">
              <span className="statLabel">San pham phu hop</span>
              <strong>{filteredProducts.length}</strong>
            </div>
            <div className="statCard">
              <span className="statLabel">Bo loc dang bat</span>
              <strong>{activeFilterCount}</strong>
            </div>
            <div className="statCard">
              <span className="statLabel">Khoang gia</span>
              <strong>
                {formatCurrency(priceFloor)} - {formatCurrency(priceCeil)}
              </strong>
            </div>
          </div>
        </div>

        <div className="row g-4 align-items-start">
          <aside className="col-12 col-xl-3">
            <div className="filterPanel sticky-top" style={{ top: "88px" }}>
              <div className="filterPanelHead">
                <div>
                  <div className="panelEyebrow">Filter</div>
                  <h2 className="panelTitle">Tinh chinh ket qua</h2>
                </div>
                <button
                  type="button"
                  className="resetButton"
                  onClick={clearAllFilters}
                >
                  Xoa tat ca
                </button>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Tim kiem trong nganh hang</label>
                <input
                  type="text"
                  className="form-control modernInput"
                  value={keyword}
                  placeholder="Ten san pham, mo ta, shop..."
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Khoang gia</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control modernInput"
                      min={0}
                      value={priceMin}
                      onChange={(e) => setPriceMin(toNumber(e.target.value, 0))}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control modernInput"
                      min={0}
                      value={priceMax}
                      onChange={(e) => setPriceMax(toNumber(e.target.value, 0))}
                    />
                  </div>
                </div>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Danh gia toi thieu</label>
                <div className="ratingChips">
                  {[0, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`chipButton ${minRating === value ? "chipButtonActive" : ""}`}
                      onClick={() => setMinRating(value)}
                    >
                      {value === 0 ? "Tat ca" : `${value}+ sao`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Lua chon nhanh</label>
                <div className="toggleList">
                  <label className="toggleItem">
                    <input
                      id="inStockOnly"
                      className="form-check-input"
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <span>Con hang</span>
                  </label>
                  <label className="toggleItem">
                    <input
                      id="discountOnly"
                      className="form-check-input"
                      type="checkbox"
                      checked={discountOnly}
                      onChange={(e) => setDiscountOnly(e.target.checked)}
                    />
                    <span>Dang giam gia</span>
                  </label>
                  <label className="toggleItem">
                    <input
                      id="freeShipOnly"
                      className="form-check-input"
                      type="checkbox"
                      checked={freeShippingOnly}
                      onChange={(e) => setFreeShippingOnly(e.target.checked)}
                    />
                    <span>Ho tro freeship</span>
                  </label>
                </div>
              </div>

              <div className="filterGroup">
                <label className="filterLabel">Thuong hieu</label>
                <div className="brandList">
                  {brandOptions.map((brand) => (
                    <label key={brand} className="brandItem">
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
                <div className="filterGroup">
                  <label className="filterLabel">Thuoc tinh nganh hang</label>
                  <div className="attributeStack">
                    {categoryAttributes.map((attribute) => (
                      <div key={attribute.slug} className="attributeCard">
                        <div className="attributeTitle">{attribute.name}</div>
                        <div className="attributeValues">
                          {attribute.values.map((value) => {
                            const selected = (
                              selectedAttributeValues[attribute.slug] || []
                            ).includes(value);
                            return (
                              <button
                                key={`${attribute.slug}-${value}`}
                                type="button"
                                className={`chipButton chipButtonSmall ${selected ? "chipButtonActive" : ""}`}
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
                </div>
              )}
            </div>
          </aside>

          <section className="col-12 col-xl-9">
            <div className="toolbarPanel mb-4">
              <div className="toolbarCopy">
                <h2 className="toolbarTitle">Danh sach san pham</h2>
                <p className="toolbarText">
                  Dang hien thi <strong>{pagedProducts.length}</strong> /{" "}
                  <strong>{filteredProducts.length}</strong> san pham
                </p>
              </div>
              <div className="toolbarControls">
                <div className="sortPills">
                  {[
                    ["popular", "Pho bien"],
                    ["newest", "Moi nhat"],
                    ["price_asc", "Gia thap"],
                    ["price_desc", "Gia cao"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`sortPill ${sortBy === value ? "sortPillActive" : ""}`}
                      onClick={() => setSortBy(value as SortKey)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  className="form-select toolbarSelect"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                >
                  <option value="popular">Sap xep: Pho bien</option>
                  <option value="newest">Sap xep: Moi nhat</option>
                  <option value="price_asc">Gia: Thap den cao</option>
                  <option value="price_desc">Gia: Cao den thap</option>
                  <option value="rating_desc">Danh gia cao nhat</option>
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="activeFilters mb-4">
                <span className="activeFiltersLabel">Bo loc dang ap dung</span>
                {keyword && (
                  <span className="filterBadge">Tu khoa: {keyword}</span>
                )}
                {selectedBrands.length > 0 && (
                  <span className="filterBadge">
                    {selectedBrands.length} thuong hieu
                  </span>
                )}
                {minRating > 0 && (
                  <span className="filterBadge">{minRating}+ sao</span>
                )}
                {discountOnly && <span className="filterBadge">Giam gia</span>}
                {inStockOnly && <span className="filterBadge">Con hang</span>}
                {freeShippingOnly && (
                  <span className="filterBadge">Freeship</span>
                )}
              </div>
            )}

            {pagedProducts.length === 0 ? (
              <div className="emptyPanel">
                <div className="emptyIcon">?</div>
                <h3>No suitable product found.</h3>
                <p>
                  Gently scan the filter, change the keyword, or reset the price
                  range to see more results.
                </p>
                <button
                  type="button"
                  className="resetButton resetButtonPrimary"
                  onClick={clearAllFilters}
                >
                  Reset the filter
                </button>
              </div>
            ) : (
              <div className="row g-3 g-xl-4">
                {pagedProducts.map((item) => {
                  const productId = item.id;
                  const href = `/${item.product_slug || "product"}-.p${productId}?id=${productId}`;
                  const price = resolveProductPrice(item);
                  const originalPrice = resolveOriginalPrice(item);
                  const discount = resolveDiscountPercent(item);

                  return (
                    <div key={productId} className="col-6 col-md-4 col-xxl-3">
                      <Link href={href} className="productLink">
                        <article className="productCard">
                          {discount > 0 && (
                            <span className="productBadge">-{discount}%</span>
                          )}
                          <div className="productImageShell">
                            <div className="ratio ratio-1x1 productImageWrap">
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
                          </div>
                          <div className="productBody">
                            <div className="productMeta">
                              {item.shop_name || "Nexamart"}
                            </div>
                            <h3 className="productName">
                              {item.product_name || "San pham"}
                            </h3>
                            <div className="productPriceRow">
                              <span className="productPrice">
                                {formatCurrency(price)}
                              </span>
                              {discount > 0 && (
                                <span className="productOldPrice">
                                  {formatCurrency(originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="productFooter">
                              <span>
                                Da ban{" "}
                                {toNumber(item.sold_count, 0).toLocaleString(
                                  "vi-VN",
                                )}
                              </span>
                              <span>
                                {toNumber(item.rating, 0).toFixed(1)} sao
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="paginationWrap">
              <button
                className="pageNav"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div className="pageNumbers">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                  .map((p) => (
                    <button
                      key={p}
                      className={`pageNumber ${page === p ? "pageNumberActive" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
              </div>
              <button
                className="pageNav"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </button>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .categoryListing {
          background:
            radial-gradient(
              circle at top left,
              rgba(14, 165, 233, 0.12),
              transparent 32%
            ),
            linear-gradient(180deg, #f6fbff 0%, #f8fafc 34%, #f3f6fb 100%);
          min-height: 100vh;
        }

        .heroPanel {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 20px;
          padding: 28px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 36px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.98),
              rgba(240, 249, 255, 0.92)
            ),
            #fff;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }

        .heroCopy {
          max-width: 620px;
        }

        .eyebrow,
        .panelEyebrow {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0284c7;
        }

        .heroTitle {
          margin: 10px 0 8px;
          font-size: clamp(1.9rem, 2vw + 1rem, 3rem);
          font-weight: 800;
          color: #0f172a;
        }

        .heroSubtitle,
        .toolbarText,
        .emptyPanel p {
          margin: 0;
          color: #475569;
          line-height: 1.6;
        }

        .heroStats {
          display: grid;
          grid-template-columns: repeat(3, minmax(120px, 1fr));
          gap: 12px;
          flex: 1 1 320px;
        }

        .statCard,
        .filterPanel,
        .toolbarPanel,
        .emptyPanel {
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(14px);
        }

        .statCard {
          border-radius: 26px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }

        .statCard strong {
          color: #0f172a;
          font-size: 1.05rem;
        }

        .statLabel {
          color: #64748b;
          font-size: 0.83rem;
        }

        .filterPanel {
          border-radius: 32px;
          padding: 22px;
        }

        .filterPanelHead,
        .toolbarPanel,
        .paginationWrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .panelTitle,
        .toolbarTitle {
          margin: 4px 0 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .resetButton,
        .pageNav,
        .pageNumber,
        .sortPill,
        .chipButton {
          border: 1px solid #d7e2ee;
          background: #fff;
          color: #334155;
          transition: all 0.2s ease;
        }

        .resetButton {
          border-radius: 999px;
          padding: 10px 16px;
          font-weight: 700;
        }

        .resetButton:hover,
        .pageNav:hover:not(:disabled),
        .pageNumber:hover,
        .sortPill:hover,
        .chipButton:hover {
          border-color: #38bdf8;
          color: #0369a1;
          box-shadow: 0 12px 24px rgba(56, 189, 248, 0.12);
        }

        .resetButtonPrimary {
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          border-color: transparent;
          color: #fff;
        }

        .filterGroup {
          padding-top: 18px;
          margin-top: 18px;
          border-top: 1px solid #e7edf5;
        }

        .filterGroup:first-of-type {
          border-top: 0;
          margin-top: 0;
          padding-top: 0;
        }

        .filterLabel {
          display: block;
          margin-bottom: 10px;
          font-weight: 700;
          color: #0f172a;
        }

        .modernInput,
        .toolbarSelect {
          border-radius: 20px;
          border-color: #dce6f0;
          min-height: 48px;
          box-shadow: none;
        }

        .modernInput:focus,
        .toolbarSelect:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 0.2rem rgba(56, 189, 248, 0.15);
        }

        .ratingChips,
        .sortPills,
        .attributeValues,
        .activeFilters,
        .pageNumbers {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chipButton,
        .sortPill {
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .chipButtonSmall {
          padding: 7px 12px;
          font-size: 0.82rem;
        }

        .chipButtonActive,
        .sortPillActive,
        .pageNumberActive {
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 14px 28px rgba(37, 99, 235, 0.22);
        }

        .toggleList,
        .brandList,
        .attributeStack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .brandList {
          max-height: 220px;
          overflow: auto;
          padding-right: 4px;
        }

        .toggleItem,
        .brandItem {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #334155;
          font-weight: 500;
        }

        .attributeCard {
          padding: 12px;
          border-radius: 24px;
          background: #f8fbff;
          border: 1px solid #e4edf5;
        }

        .attributeTitle {
          margin-bottom: 10px;
          font-weight: 700;
          color: #0f172a;
        }

        .toolbarPanel {
          border-radius: 30px;
          padding: 18px 20px;
          flex-wrap: wrap;
        }

        .toolbarControls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbarSelect {
          min-width: 220px;
        }

        .activeFiltersLabel {
          font-size: 0.9rem;
          font-weight: 700;
          color: #334155;
          margin-right: 4px;
        }

        .filterBadge {
          padding: 8px 12px;
          border-radius: 999px;
          background: #e0f2fe;
          color: #075985;
          font-weight: 700;
          font-size: 0.82rem;
        }

        .emptyPanel {
          border-radius: 34px;
          padding: 48px 24px;
          text-align: center;
        }

        .emptyPanel h3 {
          margin: 0 0 8px;
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
        }

        .emptyIcon {
          width: 72px;
          height: 72px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          background: linear-gradient(135deg, #e0f2fe, #dbeafe);
          color: #0369a1;
          font-size: 2rem;
          font-weight: 800;
        }

        .productLink {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }

        .productCard {
          position: relative;
          height: 100%;
          padding: 12px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
          transition:
            transform 0.24s ease,
            box-shadow 0.24s ease,
            border-color 0.24s ease;
        }

        .productCard:hover {
          transform: translateY(-6px);
          border-color: rgba(14, 165, 233, 0.28);
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.14);
        }

        .productBadge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          border-radius: 999px;
          padding: 6px 10px;
          background: linear-gradient(135deg, #ef4444, #f97316);
          color: #fff;
          font-size: 0.78rem;
          font-weight: 800;
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
        }

        .productImageShell {
          padding: 8px;
          border-radius: 24px;
          background: linear-gradient(180deg, #f8fbff, #eef6ff);
        }

        .productImageWrap {
          overflow: hidden;
          border-radius: 20px;
          background: #fff;
        }

        .productBody {
          padding: 14px 6px 6px;
        }

        .productMeta {
          margin-bottom: 8px;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .productName {
          margin: 0 0 12px;
          min-height: 48px;
          color: #0f172a;
          font-size: 0.98rem;
          font-weight: 700;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .productPriceRow {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .productPrice {
          color: #dc2626;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .productOldPrice {
          color: #94a3b8;
          font-size: 0.86rem;
          text-decoration: line-through;
        }

        .productFooter {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
          color: #475569;
          font-size: 0.84rem;
        }

        .paginationWrap {
          margin-top: 28px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .pageNav,
        .pageNumber {
          min-width: 44px;
          min-height: 44px;
          border-radius: 18px;
          padding: 10px 14px;
          font-weight: 700;
        }

        .pageNav:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 1199px) {
          .filterPanel {
            position: static !important;
          }
        }

        @media (max-width: 767px) {
          .heroPanel,
          .filterPanel,
          .toolbarPanel,
          .emptyPanel {
            border-radius: 26px;
          }

          .heroPanel {
            padding: 22px;
          }

          .heroStats {
            grid-template-columns: 1fr;
          }

          .toolbarSelect {
            min-width: 100%;
          }

          .productCard {
            padding: 10px;
            border-radius: 24px;
          }

          .productName {
            min-height: 44px;
            font-size: 0.92rem;
          }

          .productFooter {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
