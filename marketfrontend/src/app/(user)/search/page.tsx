export const dynamic = "force-dynamic";

import { INTERNAL_API } from "@/helper/api";
import Link from "next/link";

type SearchParams = Record<string, string | string[] | undefined>;

const getParam = (params: SearchParams, key: string, fallback = ""): string => {
  const value = params[key];
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
};

const unwrapCollection = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const formatCurrency = (value: unknown) =>
  `₫${Number(value || 0).toLocaleString("vi-VN")}`;

const getDiscount = (product: any) => {
  const price = Number(product?.price || 0);
  const original = Number(product?.original_price || 0);
  if (!price || !original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};

const getCategoryId = (category: any) => Number(category?.id ?? category?.category_id ?? 0);

const getCategoryParentId = (category: any) =>
  Number(category?.parent_id ?? category?.parentId ?? 0);

const getCategoryName = (category: any) =>
  String(category?.category_name ?? category?.name ?? "").trim();

const buildSearchHref = (
  keyword: string,
  params: Record<string, string | number | undefined>,
) => {
  const query = new URLSearchParams();
  if (keyword) query.set("keyword", keyword);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  return `/search?${query.toString()}`;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const keyword = getParam(params, "keyword", getParam(params, "q"));
  const sort = getParam(params, "sort", "popular");
  const minPrice = getParam(params, "minPrice");
  const maxPrice = getParam(params, "maxPrice");
  const categoryId = getParam(params, "categoryId");

  const query = new URLSearchParams();
  if (keyword) query.set("keyword", keyword);
  if (categoryId) query.set("categoryId", categoryId);
  if (sort) query.set("sort", sort);
  if (minPrice) query.set("minPrice", minPrice);
  if (maxPrice) query.set("maxPrice", maxPrice);
  query.set("limit", "48");

  let products: any[] = [];
  let allCategories: any[] = [];

  try {
    const [productRes, categoryRes] = await Promise.all([
      fetch(`${INTERNAL_API}/product/search?${query.toString()}`, {
        cache: "no-store",
      }),
      fetch(`${INTERNAL_API}/api/categories`, {
        cache: "no-store",
      }),
    ]);

    if (productRes.ok) {
      products = unwrapCollection(await productRes.json());
    }

    if (categoryRes.ok) {
      allCategories = unwrapCollection(await categoryRes.json());
    }
  } catch (error) {
    console.error("Search failed", error);
  }

  const categoryById = new Map(
    allCategories
      .map((category) => [getCategoryId(category), category] as const)
      .filter(([id]) => id > 0),
  );
  const activeCategory = categoryId ? categoryById.get(Number(categoryId)) : null;
  const activeCategoryName = activeCategory ? getCategoryName(activeCategory) : "";

  const parentCategoryMap = products.reduce<Map<number, any>>((acc, product) => {
      const category = categoryById.get(Number(product?.category_id ?? 0));
      if (!category) return acc;

      const parentId = getCategoryParentId(category);
      const parentCategory = parentId > 0 ? categoryById.get(parentId) : category;

      if (parentCategory && getCategoryName(parentCategory)) {
        acc.set(getCategoryId(parentCategory), parentCategory);
      }
      return acc;
    }, new Map<number, any>());

  if (activeCategory) {
    const parentId = getCategoryParentId(activeCategory);
    const parentCategory = parentId > 0 ? categoryById.get(parentId) : activeCategory;

    if (parentCategory && getCategoryName(parentCategory)) {
      parentCategoryMap.set(getCategoryId(parentCategory), parentCategory);
    }
  }

  const childCategoriesByParent = Array.from(parentCategoryMap.values())
    .map((parent) => {
      const parentId = getCategoryId(parent);
      const children = allCategories
        .filter((category) => getCategoryParentId(category) === parentId)
        .map((category) => ({
          id: getCategoryId(category),
          name: getCategoryName(category),
        }))
        .filter((category) => category.id > 0 && category.name);

      return {
        parentName: getCategoryName(parent),
        children: children.length
          ? children
          : [{ id: getCategoryId(parent), name: getCategoryName(parent) }],
      };
    })
    .filter((group) => group.parentName && group.children.length)
    .slice(0, 5);

  const relatedShop = products.find((product) => Number(product?.shop_id ?? 0) > 0);
  const relatedShopId = Number(relatedShop?.shop_id ?? 0);
  const relatedShopName =
    relatedShop?.shop_name ||
    products.find((product) => product?.shop_name)?.shop_name ||
    (keyword ? `Shop ${keyword}` : "Nexamart Selection");
  const relatedShopHref =
    relatedShopId > 0
      ? `/shop/${relatedShopId}`
      : buildSearchHref(keyword, { categoryId, sort: "popular", minPrice, maxPrice });

  const shopProducts = products.slice(0, 4);
  const currentPage = Number(getParam(params, "page", "1")) || 1;
  const resultLabel = activeCategoryName || keyword || "all products";

  return (
    <div className="searchPage">
      <div className="searchShell">
        <aside className="searchFilter">
          <div className="filterTitle">
            <span className="filterIcon">◇</span>
            <strong>SEARCH FILTERS</strong>
          </div>

          <div className="filterBlock">
            <div className="filterHeading">By Category</div>
            {childCategoriesByParent.length === 0 && (
              <div className="filterEmpty">No related categories</div>
            )}

            {childCategoriesByParent.map((group) => (
                <div className="filterCategoryGroup" key={group.parentName}>
                  <div className="filterParentCategory">{group.parentName}</div>
                  {group.children.slice(0, 9).map((category) => (
                    <Link
                      className={`filterCategoryLink ${String(category.id) === categoryId ? "filterCategoryLinkActive" : ""}`}
                      href={buildSearchHref("", {
                        categoryId: category.id,
                        sort,
                        minPrice,
                        maxPrice,
                      })}
                      key={`${group.parentName}-${category.id}`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              ))}
          </div>

          <div className="filterBlock">
            <div className="filterHeading">Price Range</div>
            <form className="filterPriceForm" action="/search">
              <input type="hidden" name="keyword" value={keyword} />
              <input type="hidden" name="categoryId" value={categoryId} />
              <input type="hidden" name="sort" value={sort} />
              <input name="minPrice" type="number" min="0" placeholder="₫ MIN" defaultValue={minPrice} />
              <input name="maxPrice" type="number" min="0" placeholder="₫ MAX" defaultValue={maxPrice} />
              <button type="submit">Apply</button>
            </form>
            {(categoryId || minPrice || maxPrice) && (
              <Link className="clearFilterLink" href={buildSearchHref(keyword, { sort })}>
                Clear filters
              </Link>
            )}
          </div>
        </aside>

        <main className="searchContent">
          <Link href={buildSearchHref(keyword, { categoryId, sort: "sold", minPrice, maxPrice })} className="saleBanner">
            <div className="saleBadge">5.5</div>
            <span>5.5 Super Sale Deals</span>
            <strong>SUPER SALE 5.5 DEALS</strong>
            <span className="bannerArrow">›</span>
          </Link>


          {products.length > 0 && (
            <section className="relatedShop">
              <div className="sectionHead">
                <h2>
                  SHOPS RELATED TO <span>"{resultLabel}"</span>
                </h2>
                <Link href={buildSearchHref(keyword, { categoryId, sort: "popular", minPrice, maxPrice })}>
                  More Results ›
                </Link>
              </div>

              <div className="shopPanel">
                <div className="shopSummary">
                  <div className="shopAvatar">
                    {String(relatedShopName).slice(0, 1).toUpperCase()}
                  </div>
                  <h3>{relatedShopName}</h3>
                  <p>⭐ 4.8 <span>|</span> 22,4k Followers</p>
                  <Link href={relatedShopHref} className="viewShopButton">
                    View Shop
                  </Link>
                </div>

                <div className="shopProductStrip">
                  {shopProducts.map((product) => {
                    const discount = getDiscount(product);
                    const href = `/${product.product_slug || "product"}.p${product.id}?id=${product.id}`;

                    return (
                      <Link href={href} className="miniProduct" key={`shop-${product.id}`}>
                        <img
                          src={product.image_url || product.image || "/image/no-image.png"}
                          alt={product.product_name || "Product"}
                        />
                        <strong>{product.product_name}</strong>
                        <span>{formatCurrency(product.price)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          <div className="resultNotice">
            <span className="noticeIcon">ⓘ</span>
            <span>
              Search results for <strong>'{resultLabel}'</strong>
            </span>
          </div>

          <div className="searchToolbar">
            <span>Sort by</span>
            {[
              ["popular", "Relevant"],
              ["newest", "Latest"],
              ["sold", "Top Sales"],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={buildSearchHref(keyword, { categoryId, sort: value, minPrice, maxPrice })}
                className={`sortButton ${sort === value ? "sortButtonActive" : ""}`}
              >
                {label}
              </Link>
            ))}

            <Link
              href={buildSearchHref(keyword, {
                sort: sort === "price_asc" ? "price_desc" : "price_asc",
                categoryId,
                minPrice,
                maxPrice,
              })}
              className={`sortPrice ${sort.startsWith("price") ? "sortButtonActive" : ""}`}
            >
              Price <span>⌄</span>
            </Link>

            <div className="pageStatus">
              <span>{currentPage}/17</span>
              <button type="button" disabled>‹</button>
              <button type="button">›</button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="emptySearch">
              <h2>No products found</h2>
              <p>Try another keyword or remove the price filter to see more results.</p>
            </div>
          ) : (
            <div className="productGrid">
              {products.map((product) => {
                const href = `/${product.product_slug || "product"}.p${product.id}?id=${product.id}`;
                const discount = getDiscount(product);

                return (
                  <Link key={product.id} href={href} className="productLink">
                    <article className="searchProductCard">
                      {discount > 0 && <span className="productDiscount">-{discount}%</span>}
                      <div className="productImageBox">
                        <img
                          src={product.image_url || product.image || "/image/no-image.png"}
                          alt={product.product_name || "Product"}
                        />
                      </div>
                      <div className="productInfo">
                        <h2>{product.product_name}</h2>
                        <div className="productPrice">{formatCurrency(product.price)}</div>
                        <div className="productMeta">
                          <span>Sold {Number(product.sold_count || 0).toLocaleString("vi-VN")}</span>
                          <span>{Number(product.rating || 0).toFixed(1)} ★</span>
                        </div>
                        {(product.shop_name || product.category_name) && (
                          <div className="productSource">
                            {product.shop_name || product.category_name}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
