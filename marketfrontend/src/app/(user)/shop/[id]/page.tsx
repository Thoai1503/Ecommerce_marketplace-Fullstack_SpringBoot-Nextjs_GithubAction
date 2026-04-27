"use client";

import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ShopSidebar from "@/components/client/shop/ShopSidebar";
import Link from "next/link";
import { API_URL } from "@/helper/api";
import VoucherClaimButton from "@/components/client/voucher/VoucherClaimButton";
import { useUserAuth } from "@/context/UserAuthContext";

export default function ShopPage() {
  const params = useParams();
  const shopId = params?.id;
  const { userId } = useUserAuth();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const ownerUserId = Number(shop?.user_id ?? shop?.userId ?? 0);
  const isOwnShop =
    Boolean(userId) && ownerUserId > 0 && Number(userId) === ownerUserId;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ===== FETCH =====
  useEffect(() => {
    if (!shopId) return;

    const fetchShopVouchers = async () => {
      const res = await fetch(`${API_URL}/api/vouchers`, {
        cache: "no-store",
      });
      const data = await res.json();
      const vouchers = Array.isArray(data) ? data : [];

      const filtered = vouchers
        .filter((voucher: any) => {
          const issuerType = String(
            voucher.issuerType ?? voucher.issuer_type ?? "",
          ).toUpperCase();
          const issuerId = Number(voucher.issuerId ?? voucher.issuer_id ?? 0);
          const status = String(voucher.status ?? "").toUpperCase();

          return (
            issuerType === "SHOP" &&
            issuerId === Number(shopId) &&
            ["ACTIVE", "DRAFT", "PAUSED"].includes(status)
          );
        })
        .sort(
          (a: any, b: any) =>
            Number(b.priority ?? 0) - Number(a.priority ?? 0),
        );

      setShopVouchers(filtered);
    };

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

        await fetchShopVouchers();
      } catch (e) {
        console.error(e);
        setProducts([]);
        setShopVouchers([]);
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

  const formatVoucherDiscount = (voucher: any) => {
    const type = String(
      voucher.discountType ?? voucher.discount_type ?? "",
    ).toUpperCase();
    if (type === "PERCENT") {
      return `Save ${Number(voucher.discountPercent ?? voucher.discount_percent ?? 0)}%`;
    }
    if (type === "FIXED") {
      return `Save ${Number(
        voucher.discountAmount ?? voucher.discount_amount ?? 0,
      ).toLocaleString("vi-VN")}đ`;
    }
    if (type === "FREE_SHIPPING") {
      return "Free shipping";
    }
    return "Gift item";
  };

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

  if (isOwnShop) {
    return (
      <div className="container my-5">
        <div className="alert alert-info rounded-4 border-0 shadow-sm">
          Sản phẩm của chính shop bạn sẽ không hiển thị ở khu vực mua hàng khi đang đăng nhập bằng tài khoản này.
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* ===== HEADER ===== */}
      <div className="shop-header-wrapper mb-4">
        <div className="shop-banner position-relative text-white p-4 rounded-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-4">
              <div className="shop-avatar-wrapper">
                <img
                  src={normalizeImage(shop?.shop_logo)}
                  width={100}
                  height={100}
                  className="rounded-circle border border-3 border-white shadow-lg"
                  onError={onImgError}
                />
                <div className="online-indicator"></div>
              </div>

              <div>
                <h4 className="mb-2 fw-bold text-white">
                  {shop?.shop_name || "Loading..."}
                </h4>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-white text-primary px-3 py-1 rounded-pill">
                    <i className="bi bi-clock me-1"></i>
                    Online recently
                  </span>
                  <span className="badge bg-warning text-dark px-3 py-1 rounded-pill">
                    <i className="bi bi-star-fill me-1"></i>
                    {shop?.rating || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex gap-4 text-end">
              <div className="shop-stat">
                <div className="text-white-50 small">Products</div>
                <div className="fw-bold text-white fs-5">
                  {filteredProducts.length}
                </div>
              </div>

              <div className="shop-stat">
                <div className="text-white-50 small">Followers</div>
                <div className="fw-bold text-white fs-5">
                  {shop?.followers || 0}
                </div>
              </div>

              <div className="shop-stat">
                <div className="text-white-50 small">Joined</div>
                <div className="fw-bold text-white fs-5">
                  {shop?.created_at
                    ? new Date(shop.created_at).getFullYear()
                    : "--"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {shopVouchers.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1 fw-bold">Shop vouchers</h5>
                <div className="text-muted small">
                  Collect vouchers from this shop before placing your order.
                </div>
              </div>
              <span className="badge bg-danger-subtle text-danger border">
                {shopVouchers.length} voucher(s)
              </span>
            </div>

            <div className="row g-3">
              {shopVouchers.map((voucher) => (
                <div className="col-lg-6" key={voucher.id}>
                  <div className="border rounded-4 p-3 h-100 voucher-card">
                    <div className="d-flex gap-3">
                      <div className="voucher-mark text-white fw-bold">S</div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between gap-3 align-items-start">
                          <div>
                            <div className="fw-bold">{voucher.title}</div>
                            <div className="small text-muted">
                              Code: {voucher.code}
                            </div>
                          </div>
                          <span className="badge bg-light text-dark border">
                            {String(voucher.status ?? "").toUpperCase()}
                          </span>
                        </div>

                        <div className="small mt-2 text-danger fw-semibold">
                          {formatVoucherDiscount(voucher)}
                        </div>
                        <div className="small text-muted mt-1">
                          Min. order:{" "}
                          {Number(
                            voucher.minOrderValue ?? voucher.min_order_value ?? 0,
                          ).toLocaleString("vi-VN")}
                          đ
                        </div>
                        <div className="small text-muted">
                          Claimed:{" "}
                          {Number(
                            voucher.claimedCount ?? voucher.claimed_count ?? 0,
                          )}
                          /
                          {Number(
                            voucher.totalQuota ?? voucher.total_quota ?? 0,
                          ) || "∞"}
                        </div>
                        <div className="small text-muted">
                          Claim until:{" "}
                          {voucher.claimEndAt || voucher.claim_end_at
                            ? new Date(
                                voucher.claimEndAt ?? voucher.claim_end_at,
                              ).toLocaleString("en-GB")
                            : "N/A"}
                        </div>

                        <div className="mt-3">
                          <VoucherClaimButton
                            voucherId={Number(voucher.id)}
                            voucherCode={voucher.code}
                            voucherStatus={voucher.status}
                            claimStartAt={voucher.claimStartAt ?? voucher.claim_start_at}
                            claimEndAt={voucher.claimEndAt ?? voucher.claim_end_at}
                            totalQuota={Number(
                              voucher.totalQuota ?? voucher.total_quota ?? 0,
                            )}
                            claimedCount={Number(
                              voucher.claimedCount ?? voucher.claimed_count ?? 0,
                            )}
                            className="btn btn-danger btn-sm px-3"
                            onClaimSuccess={async () => {
                              const res = await fetch(`${API_URL}/api/vouchers`, {
                                cache: "no-store",
                              });
                              const data = await res.json();
                              const vouchers = Array.isArray(data) ? data : [];
                              setShopVouchers(
                                vouchers.filter((item: any) => {
                                  const issuerType = String(
                                    item.issuerType ?? item.issuer_type ?? "",
                                  ).toUpperCase();
                                  const issuerId = Number(
                                    item.issuerId ?? item.issuer_id ?? 0,
                                  );
                                  return (
                                    issuerType === "SHOP" &&
                                    issuerId === Number(shopId)
                                  );
                                }),
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SEARCH ===== */}
      <div className="mb-4">
        <div className="search-wrapper position-relative">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Find products in the shop..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <i className="bi bi-search search-icon"></i>
        </div>
      </div>

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <span className="text-muted">
          <i className="bi bi-collection me-2"></i>
          Find {filteredProducts.length} Products
        </span>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm border-0 shadow-sm" style={{width: 'auto'}}>
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Best Selling</option>
          </select>
        </div>
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
                  <div className="product-col mb-4" key={p.id}>
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

        .voucher-card {
          background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
        }

        .voucher-mark {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          flex-shrink: 0;
        }

        .product-col {
          width: 20%;
        }

        @media (max-width: 992px) {
          .product-col {
            width: 25%; /* tablet: 4 sp */
          }
        }

        @media (max-width: 768px) {
          .product-col {
            width: 50%; /* mobile: 2 sp */
          }
        }

        @media (max-width: 480px) {
          .product-col {
            width: 100%; /* mobile nhỏ: 1 sp */
          }
        }
      `}</style>
    </div>
  );
}
