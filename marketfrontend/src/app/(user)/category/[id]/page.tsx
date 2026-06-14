// 🔥 tránh cache
export const dynamic = "force-dynamic";

import { INTERNAL_API } from "@/helper/api";
import CategorySidebar from "@/components/client/category/CategorySidebar";
import Link from "next/link";
import SortBar from "@/components/client/category/SortBar";
import { cookies } from "next/headers";

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

const getCategoryName = (category: any) =>
  String(category?.category_name ?? category?.name ?? "Category").trim();

const getCategoryId = (category: any) =>
  Number(category?.id ?? category?.category_id ?? 0);

const getCategoryParentId = (category: any) =>
  Number(category?.parent_id ?? category?.parentId ?? 0);

const getProductImage = (product: any) =>
  product?.image_url || product?.image || "/no-image.png";

const getOwnShopId = async (): Promise<number | null> => {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("user")?.value ?? 0);

  if (!userId) return null;

  try {
    const res = await fetch(`${INTERNAL_API}/seller/shop/user/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const shop = await res.json();
    const shopId = Number(shop?.id ?? shop?.shop_id ?? 0);
    return shopId > 0 ? shopId : null;
  } catch {
    return null;
  }
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: categoryId } = await params;
  const sp = await searchParams;

  // ===== PARAMS =====
  const currentChild = typeof sp.child === "string" ? sp.child : undefined;

  const currentSort = typeof sp.sort === "string" ? sp.sort : "popular";

  const currentOrder = typeof sp.order === "string" ? sp.order : undefined;

  const currentPage = typeof sp.page === "string" ? sp.page : "1";

  const brandParams =
    typeof sp.brand === "string"
      ? [sp.brand]
      : Array.isArray(sp.brand)
        ? sp.brand
        : [];

  // ===== DATA =====
  let parent: any = null;
  let categories: any[] = [];
  let brands: any[] = [];
  let products: any[] = [];
  const ownShopId = await getOwnShopId();
  const ownProductIds = new Set<number>();

  try {
    // ===== CATEGORY =====
    const [parentRes, childRes] = await Promise.all([
      fetch(`${INTERNAL_API}/api/categories/${categoryId}`, {
        cache: "no-store",
      }),
      fetch(`${INTERNAL_API}/api/categories/children/${categoryId}`, {
        cache: "no-store",
      }),
    ]);

    parent = await parentRes.json();
    categories = await childRes.json();

    // ===== BRAND =====
    const brandUrl = currentChild
      ? `${INTERNAL_API}/api/categories/${categoryId}/brands?child=${currentChild}`
      : `${INTERNAL_API}/api/categories/${categoryId}/brands`;

    const brandRes = await fetch(brandUrl, { cache: "no-store" });
    brands = await brandRes.json();

    // ===== PRODUCT =====
    const query = new URLSearchParams();

    if (currentChild) query.append("child", currentChild);
    brandParams.forEach((b) => query.append("brand", b));

    query.append("sort", currentSort);

    if (currentOrder) query.append("order", currentOrder);

    query.append("page", currentPage);
    query.append("limit", "15");

    const requests: Promise<Response>[] = [
      fetch(
        `${INTERNAL_API}/api/categories/${categoryId}/products?${query.toString()}`,
        {
          cache: "no-store",
        },
      ),
    ];

    if (ownShopId) {
      requests.push(
        fetch(`${INTERNAL_API}/seller/product/shop/${ownShopId}`, {
          cache: "no-store",
        }),
      );
    }

    const [productRes, ownProductsRes] = await Promise.all(requests);
    const rawProducts = await productRes.json();

    if (ownProductsRes?.ok) {
      const ownProductsPayload = await ownProductsRes.json();
      unwrapCollection(ownProductsPayload).forEach((product) => {
        const id = Number(product?.id ?? 0);
        if (id > 0) ownProductIds.add(id);
      });
    }

    products = unwrapCollection(rawProducts).filter((product) => {
      const productId = Number(product?.id ?? 0);
      const productShopId = Number(product?.shop_id ?? 0);

      if (!ownShopId) return true;
      if (productShopId > 0) return productShopId !== ownShopId;
      return !ownProductIds.has(productId);
    });
  } catch (error) {
    console.error(error);
    return <div>Error loading data</div>;
  }

  const categoryName = getCategoryName(parent);
  const activeCategory = categories.find(
    (category) => String(getCategoryId(category)) === categoryId,
  );
  const activeCategoryName = activeCategory
    ? getCategoryName(activeCategory)
    : categoryName;

  return (
    <div className="searchPage">
      <div className="searchShell">
        <aside className="searchFilter">
          <CategorySidebar
            parent={parent}
            categories={categories}
            brands={brands}
            currentId={categoryId}
          />
        </aside>

        <main className="searchContent">
          <div className="saleBanner">
            <div className="saleBadge">CAT</div>
            <span>{categoryName || "Category"}</span>
            <strong>
              {activeCategoryName || categoryName || "Browse products"}
            </strong>
            <span className="bannerArrow">›</span>
          </div>

          <div className="resultNotice">
            <span className="noticeIcon">ⓘ</span>
            <span>
              Products in{" "}
              <strong>
                '{activeCategoryName || categoryName || "category"}'
              </strong>
            </span>
          </div>

          <SortBar categoryId={categoryId} />

          {products.length === 0 ? (
            <div className="emptySearch">
              <h2>Không có sản phẩm</h2>
              <p>
                Thử đổi danh mục, thương hiệu hoặc bộ lọc giá để xem thêm kết
                quả.
              </p>
            </div>
          ) : (
            <div className="productGrid">
              {products.map((product: any) => {
                const discount = getDiscount(product);
                const href = `/${product.product_slug || "product"}.p${product.id}?id=${product.id}`;
                const image = getProductImage(product);

                return (
                  <Link key={product.id} href={href} className="productLink">
                    <article className="searchProductCard">
                      {discount > 0 && (
                        <span className="productDiscount">-{discount}%</span>
                      )}

                      <div className="productImageBox">
                        <img
                          src={image}
                          alt={product.product_name || "Product"}
                        />
                      </div>

                      <div className="productInfo">
                        <h2>{product.product_name}</h2>

                        <div className="productPrice">
                          {formatCurrency(product.price)}
                        </div>

                        <div className="productMeta">
                          <span>
                            Sold{" "}
                            {Number(product.sold_count || 0).toLocaleString(
                              "vi-VN",
                            )}
                          </span>
                          <span>
                            {Number(product.rating || 0).toFixed(1)} ★
                          </span>
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
