"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ShopPage() {
  const params = useParams();
  const shopId = params?.id;

  const [keyword, setKeyword] = useState("");
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // ===== TIME =====
  const timeAgo = (dateString?: string) => {
    if (!dateString) return "--";

    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "a few seconds ago";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;

    return `${Math.floor(diff / 31536000)} years ago`;
  };

  // ===== FETCH =====
  useEffect(() => {
    if (!shopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const shopRes = await fetch(`${API_URL}/shops/${shopId}`);
        const shopJson = await shopRes.json();
        setShop(shopJson);

        const prodRes = await fetch(`${API_URL}/product/shop/${shopId}`);
        const prodJson = await prodRes.json();

        let list: any[] = [];

        if (Array.isArray(prodJson)) list = prodJson;
        else if (Array.isArray(prodJson?.data)) list = prodJson.data;
        else if (Array.isArray(prodJson?.products)) list = prodJson.products;

        setProducts(list);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  // ===== RESET PAGE KHI SEARCH =====
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

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

  // ===== FILTER =====
  const filteredProducts = products.filter((p) =>
    p.product_name?.toLowerCase().includes(keyword.toLowerCase()),
  );

  // ===== PAGINATION LOGIC =====
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
                  {timeAgo(shop?.created_at)}
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

      {/* ===== PRODUCTS ===== */}
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

          {/* ===== PAGINATION UI ===== */}
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

      {/* ===== CSS ===== */}
      <style jsx>{`
        .shop-banner {
          background: linear-gradient(135deg, #00c7f4, #0051ff);
          min-height: 140px;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
