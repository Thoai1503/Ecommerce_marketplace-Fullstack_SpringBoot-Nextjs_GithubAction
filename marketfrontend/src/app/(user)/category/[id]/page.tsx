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
      fetch(`${INTERNAL_API}/api/categories/${categoryId}/products?${query.toString()}`, {
        cache: "no-store",
      }),
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

  return (
    <div className="container py-4">
      <div className="row">
        {/* SIDEBAR */}
        <div className="col-12 col-md-3">
          <CategorySidebar
            parent={parent}
            categories={categories}
            brands={brands}
            currentId={categoryId}
          />
        </div>

        {/* CONTENT */}
        <div className="col-12 col-md-9">
          {/* SORT */}
          <SortBar categoryId={categoryId} />

          {/* PRODUCT LIST */}
          <div className="d-flex flex-wrap">
            {products.length === 0 && (
              <div className="text-muted">Không có sản phẩm</div>
            )}

            {products.map((p: any) => (
              <div key={p.id} className="product-col">
                <Link
                  href={`/${p.product_slug}.p${p.id}?id=${p.id}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="card hover-card h-100 border-0 shadow-sm">
                    {/* IMAGE */}
                    <div className="image-box">
                      <img
                        src={p.image || "/no-image.png"}
                        alt={p.product_name}
                      />
                    </div>

                    {/* INFO */}
                    <div className="p-2">
                      <div className="title line-clamp-2">{p.product_name}</div>

                      <div className="price">
                        ₫{Number(p.price || 0).toLocaleString()}
                      </div>

                      {p.original_price && (
                        <div className="old-price">
                          ₫{Number(p.original_price).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
