"use client";

import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ShopSidebar from "@/components/client/shop/ShopSidebar";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ShopPage() {
  const params = useParams();
  const shopId = params?.id;
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // ===== FETCH =====
  useEffect(() => {
    if (!shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // ===== SHOP =====
        const shopRes = await fetch(`${API_URL}/shops/${shopId}`);
        setShop(await shopRes.json());

        // ===== PRODUCTS =====
        const prodRes = await fetch(`${API_URL}/product/shop/${shopId}`);
        const prodJson = await prodRes.json();

        let list: any[] = [];

        if (Array.isArray(prodJson)) list = prodJson;
        else if (Array.isArray(prodJson?.data)) list = prodJson.data;
        else if (Array.isArray(prodJson?.products)) list = prodJson.products;

        setProducts(list);

        // ===== CATEGORY (🔥 CHỈ HIỂN THỊ SIDEBAR) =====
        const catRes = await fetch(
          `${API_URL}/product/shop/${shopId}/categories`,
        );
        const catJson = await catRes.json();

        const names = catJson.map((c: any) => c.category_name);

        setCategories(["all", ...names]);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  // ===== RESET PAGE =====
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedCategory]);

  // ===== HELPERS =====
  const normalizeImage = (url?: string) => {
    if (!url) return "/avatar-shop.png";
    return url
      .replace("/raw/upload/", "/image/upload/")
      .replace("http://", "https://");
  };

  const onImgError = (e: any) => {
    const target = e.currentTarget as HTMLImageElement;
    if (!target.src.includes("avatar-shop.png")) {
      target.src = "/avatar-shop.png";
    }
  };

  const formatPrice = (n?: number) =>
    new Intl.NumberFormat("vi-VN").format(n || 0) + " đ";

  // ===== FILTER (GIỮ NGUYÊN) =====
  const filteredProducts = products.filter((p) => {
    const matchKeyword = p.product_name
      ?.toLowerCase()
      .includes(keyword.toLowerCase());

    const matchCategory =
      selectedCategory === "all" || p.category_name === selectedCategory;

    return matchKeyword && matchCategory;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="container my-4">
      {/* ===== HEADER ===== */}
      <div className="shop-header-wrapper mb-4">
        <div className="shop-banner position-relative text-white p-4 rounded">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <img
                src={normalizeImage(shop?.shop_logo)}
                width={80}
                height={80}
                className="rounded-circle border border-white"
                onError={onImgError}
              />

              <div>
                <h5 className="mb-1 fw-bold">
                  {shop?.shop_name || "Loading..."}
                </h5>
                <small className="text-light">Online recently</small>
              </div>
            </div>

            <div className="d-flex gap-5 text-end small">
              <div>
                <div className="text-light">Products</div>
                <div className="fw-bold text-warning">
                  {filteredProducts.length}
                </div>
              </div>

              <div>
                <div className="text-light">Ratings</div>
                <div className="fw-bold text-warning">{shop?.rating || 0}</div>
              </div>

              <div>
                <div className="text-light">Joined</div>
                <div className="fw-bold text-warning">
                  {shop?.created_at
                    ? new Date(shop.created_at).toLocaleDateString()
                    : "--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Find products in the shop..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="mb-2 small text-muted">
        Find {filteredProducts.length} Products
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="row">
        {/* SIDEBAR */}
        <div className="col-md-2">
          <ShopSidebar
            categories={categories} // 🔥 từ API
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* PRODUCTS */}
        <div className="col-md-10">
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : (
            <>
              <div className="row">
                {paginatedProducts.map((p) => (
                  <div className="col-md-2 mb-4" key={p.id}>
                    <Link
                      href={`/${p.product_slug}.p${p.id}?id=${p.id}`}
                      className="text-decoration-none text-dark"
                    >
                      <div className="card product-card h-100">
                        <img
                          src={normalizeImage(p.image_url)}
                          className="card-img-top"
                          style={{ height: 180, objectFit: "cover" }}
                          onError={onImgError}
                        />

                        <div className="card-body p-2">
                          <div className="small text-truncate">
                            {p.product_name}
                          </div>

                          <div className="text-danger fw-bold">
                            {formatPrice(p.price)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ←
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${
                        currentPage === i + 1
                          ? "btn-danger"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .shop-banner {
          background: linear-gradient(135deg, #1cd1f9, #0051ff);
          min-height: 140px;
        }

        .product-card:hover {
          width: 110%;
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
