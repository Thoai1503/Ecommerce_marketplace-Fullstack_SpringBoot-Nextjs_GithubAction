"use client";

import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ShopSidebar from "@/components/client/shop/ShopSidebar";
import Link from "next/link";
import { API_URL } from "@/helper/api";
import VoucherClaimButton from "@/components/client/voucher/VoucherClaimButton";
import { useUserAuth } from "@/context/UserAuthContext";
import { Check, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";

const getVoucherClaimEndTime = (voucher: any) => {
  const claimEnd = voucher.claimEndAt ?? voucher.claim_end_at;
  if (!claimEnd) return null;

  const time = new Date(claimEnd).getTime();
  return Number.isFinite(time) ? time : null;
};

const isVoucherClaimExpired = (voucher: any) => {
  const claimEndTime = getVoucherClaimEndTime(voucher);
  return claimEndTime !== null && claimEndTime < Date.now();
};

const getVisibleShopVouchers = (vouchers: any[], shopId: unknown) =>
  vouchers
    .filter((voucher: any) => {
      const issuerType = String(
        voucher.issuerType ?? voucher.issuer_type ?? "",
      ).toUpperCase();
      const issuerId = Number(voucher.issuerId ?? voucher.issuer_id ?? 0);
      const status = String(voucher.status ?? "").toUpperCase();

      return (
        issuerType === "SHOP" &&
        issuerId === Number(shopId) &&
        ["ACTIVE", "DRAFT", "PAUSED"].includes(status) &&
        !isVoucherClaimExpired(voucher)
      );
    })
    .sort(
      (a: any, b: any) =>
        Number(b.priority ?? 0) - Number(a.priority ?? 0),
    );

const getVoucherRemainingCount = (voucher: any) => {
  const total = Number(voucher.totalQuota ?? voucher.total_quota ?? 0);
  if (!total) return "∞";

  const claimed = Number(voucher.claimedCount ?? voucher.claimed_count ?? 0);
  return Math.max(total - claimed, 0).toLocaleString("en-US");
};

const getStoredLoggedInUserId = () => {
  if (typeof window === "undefined") return 0;

  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedUserId = Number(
      storedUser?.id ?? storedUser?.userId ?? storedUser?.user_id ?? 0,
    );

    if (Number.isFinite(storedUserId) && storedUserId > 0) {
      return storedUserId;
    }
  } catch {
    // Ignore malformed localStorage user data and fall back to the cookie.
  }

  const cookieUser = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user="))
    ?.split("=")[1];
  const cookieUserId = Number(cookieUser ? decodeURIComponent(cookieUser) : 0);

  return Number.isFinite(cookieUserId) && cookieUserId > 0 ? cookieUserId : 0;
};

export default function ShopPage() {
  const params = useParams();
  const shopId = params?.id;
  const { userId } = useUserAuth();
  const searchParams = useSearchParams();
  const voucherStripRef = useRef<HTMLDivElement | null>(null);
  const [keyword, setKeyword] = useState("");
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followSaving, setFollowSaving] = useState(false);
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

      setShopVouchers(getVisibleShopVouchers(vouchers, shopId));
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

  useEffect(() => {
    const followers = Number(
      shop?.followers ?? shop?.follower_count ?? shop?.followersCount ?? 0,
    );

    setFollowerCount(Number.isFinite(followers) ? followers : 0);
    setIsFollowing(Boolean(shop?.isFollowing ?? shop?.is_following ?? false));
  }, [shop]);

  useEffect(() => {
    if (!shopId || !shop) return;

    const fetchFollowStatus = async () => {
      try {
        const currentUserId = Number(userId || 0) || getStoredLoggedInUserId();
        const query = currentUserId ? `?user_id=${currentUserId}` : "";
        const res = await fetch(
          `${API_URL}/shops/${shopId}/follow-status${query}`,
          { cache: "no-store" },
        );

        if (!res.ok) return;

        const data = await res.json();
        const followers = Number(
          data?.followers ?? data?.follower_count ?? 0,
        );

        setFollowerCount(Number.isFinite(followers) ? followers : 0);
        setIsFollowing(Boolean(data?.isFollowing ?? data?.is_following));
      } catch (e) {
        console.error(e);
      }
    };

    fetchFollowStatus();
  }, [shopId, shop, userId]);

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

  const formatVoucherMoney = (value: unknown) =>
    `${Number(value || 0).toLocaleString("en-US")} VND`;

  const formatVoucherDiscount = (voucher: any) => {
    const type = String(
      voucher.discountType ?? voucher.discount_type ?? "",
    ).toUpperCase();
    if (type === "PERCENT") {
      return `Save ${Number(voucher.discountPercent ?? voucher.discount_percent ?? 0)}%`;
    }
    if (type === "FIXED") {
      return `Save ${formatVoucherMoney(
        voucher.discountAmount ?? voucher.discount_amount ?? 0,
      )}`;
    }
    if (type === "FREE_SHIPPING") {
      return "Free shipping";
    }
    return "Gift item";
  };

  const scrollVouchers = (direction: "left" | "right") => {
    const strip = voucherStripRef.current;
    if (!strip) return;

    const scrollAmount = Math.max(320, Math.floor(strip.clientWidth * 0.8));
    strip.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleFollowToggle = async () => {
    const currentUserId = Number(userId || 0) || getStoredLoggedInUserId();

    if (!currentUserId) {
      window.alert("Please login to follow this shop.");
      return;
    }

    if (!shopId || followSaving) return;

    const nextIsFollowing = !isFollowing;
    setFollowSaving(true);

    try {
      const url = nextIsFollowing
        ? `${API_URL}/shops/${shopId}/follow`
        : `${API_URL}/shops/${shopId}/follow?user_id=${currentUserId}`;
      const res = await fetch(url, {
        method: nextIsFollowing ? "POST" : "DELETE",
        headers: nextIsFollowing
          ? {
              "Content-Type": "application/json",
            }
          : undefined,
        body: nextIsFollowing
          ? JSON.stringify({ user_id: currentUserId })
          : undefined,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const followers = Number(data?.followers ?? data?.follower_count ?? 0);

      setIsFollowing(Boolean(data?.isFollowing ?? data?.is_following));
      setFollowerCount(Number.isFinite(followers) ? followers : 0);
    } catch (e) {
      console.error(e);
      window.alert("Unable to update follow status. Please try again.");
    } finally {
      setFollowSaving(false);
    }
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
          <div className="shop-banner-content d-flex justify-content-between align-items-center gap-3">
            <div className="shop-identity d-flex align-items-center gap-4">
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
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-white text-primary px-3 py-1 rounded-pill">
                    <i className="bi bi-clock me-1"></i>
                    Online recently
                  </span>
                  <span className="badge bg-warning text-dark px-3 py-1 rounded-pill">
                    <i className="bi bi-star-fill me-1"></i>
                    {shop?.rating || 0}
                  </span>
                  <button
                    type="button"
                    className={`shop-follow-button ${
                      isFollowing ? "is-following" : ""
                    }`}
                    aria-pressed={isFollowing}
                    disabled={followSaving}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? (
                      <Check size={15} strokeWidth={2.4} />
                    ) : (
                      <UserPlus size={15} strokeWidth={2.4} />
                    )}
                    <span>
                      {followSaving
                        ? "Saving..."
                        : isFollowing
                          ? "Following"
                          : "Follow"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="shop-stats d-flex gap-4 text-end">
              <div className="shop-stat">
                <div className="text-white-50 small">Products</div>
                <div className="fw-bold text-white fs-5">
                  {filteredProducts.length}
                </div>
              </div>

              <div className="shop-stat">
                <div className="text-white-50 small">Followers</div>
                <div className="fw-bold text-white fs-5">
                  {followerCount}
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
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
              <div>
                <h5 className="mb-1 fw-bold">Shop vouchers</h5>
                <div className="text-muted small">
                  Collect vouchers from this shop before placing your order.
                </div>
              </div>
              <div className="voucher-head-actions">
                <span className="badge bg-danger-subtle text-danger border">
                  {shopVouchers.length} voucher(s)
                </span>
                <button
                  type="button"
                  className="voucher-nav-button"
                  aria-label="Previous vouchers"
                  onClick={() => scrollVouchers("left")}
                >
                  <ChevronLeft size={18} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  className="voucher-nav-button"
                  aria-label="Next vouchers"
                  onClick={() => scrollVouchers("right")}
                >
                  <ChevronRight size={18} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="voucher-strip" ref={voucherStripRef}>
              {shopVouchers.map((voucher) => (
                <div className="voucher-coupon" key={voucher.id}>
                  <div className="voucher-coupon-content">
                    <div className="voucher-main-text">
                      <div className="voucher-discount">
                        {formatVoucherDiscount(voucher)}
                      </div>
                      <div className="voucher-min-order">
                        Min spend{" "}
                        {formatVoucherMoney(
                          voucher.minOrderValue ?? voucher.min_order_value ?? 0,
                        )}
                      </div>
                      <div className="voucher-scope">Selected products</div>
                      <div className="voucher-expiry">
                        Valid until:{" "}
                        {voucher.claimEndAt || voucher.claim_end_at
                          ? new Date(
                              voucher.claimEndAt ?? voucher.claim_end_at,
                            ).toLocaleDateString("en-GB")
                          : "No limit"}
                      </div>
                    </div>

                    <div className="voucher-side">
                      <div className="voucher-quantity">
                        x{getVoucherRemainingCount(voucher)}
                      </div>
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
                        claimLabel="Save"
                        claimedLabel="Saved"
                        claimingLabel="Saving..."
                        successMessage={`Voucher ${voucher.code} saved successfully!`}
                        className="voucher-save-button"
                        onClaimSuccess={async () => {
                          const res = await fetch(`${API_URL}/api/vouchers`, {
                            cache: "no-store",
                          });
                          const data = await res.json();
                          const vouchers = Array.isArray(data) ? data : [];
                          setShopVouchers(getVisibleShopVouchers(vouchers, shopId));
                        }}
                      />
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

        .shop-avatar-wrapper {
          flex: 0 0 auto;
        }

        .shop-follow-button {
          align-items: center;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          color: #fff;
          display: inline-flex;
          font-size: 13px;
          font-weight: 700;
          gap: 6px;
          min-height: 26px;
          padding: 0 12px;
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
          white-space: nowrap;
        }

        .shop-follow-button:hover,
        .shop-follow-button.is-following {
          background: #fff;
          border-color: #fff;
          color: #0d6efd;
        }

        .shop-follow-button:disabled {
          cursor: not-allowed;
          opacity: 0.75;
        }

        .product-card:hover {
          width: 110%;
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .voucher-head-actions {
          align-items: center;
          display: flex;
          flex-shrink: 0;
          gap: 8px;
        }

        .voucher-nav-button {
          align-items: center;
          background: #fff;
          border: 1px solid #ffd0d0;
          border-radius: 999px;
          color: #d70018;
          display: inline-flex;
          height: 30px;
          justify-content: center;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
          width: 30px;
        }

        .voucher-nav-button:hover {
          background: #d70018;
          border-color: #d70018;
          color: #fff;
        }

        .voucher-strip {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          padding: 2px 4px 8px;
          scrollbar-width: none;
          scroll-snap-type: x proximity;
        }

        .voucher-strip::-webkit-scrollbar {
          display: none;
        }

        .voucher-coupon {
          background: #fff1f1;
          border: 1px solid #ffcaca;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.08);
          flex: 0 0 360px;
          min-height: 138px;
          position: relative;
          scroll-snap-align: start;
        }

        .voucher-coupon::before {
          background: radial-gradient(
              circle at left 7px,
              #fff 0 4px,
              transparent 4.5px
            )
            left top / 9px 14px repeat-y;
          bottom: 0;
          content: "";
          left: -1px;
          position: absolute;
          top: 0;
          width: 9px;
        }

        .voucher-coupon-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 94px;
          min-height: 138px;
        }

        .voucher-main-text {
          color: #e60012;
          min-width: 0;
          padding: 20px 18px 16px 14px;
        }

        .voucher-discount {
          font-size: 18px;
          line-height: 1.2;
          margin-bottom: 6px;
        }

        .voucher-min-order {
          font-size: 15px;
          line-height: 1.25;
          margin-bottom: 7px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .voucher-scope {
          border: 1px solid #e60012;
          display: inline-block;
          font-size: 13px;
          line-height: 1.15;
          margin-bottom: 9px;
          max-width: 100%;
          overflow: hidden;
          padding: 2px 7px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .voucher-expiry {
          color: #6b7280;
          font-size: 12px;
          line-height: 1.2;
        }

        .voucher-side {
          align-items: center;
          border-left: 1px dashed #f3caca;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .voucher-quantity {
          background: #ffe4e4;
          border-radius: 999px;
          color: #e60012;
          font-size: 13px;
          line-height: 1;
          min-width: 52px;
          padding: 8px 12px;
          position: absolute;
          right: 10px;
          text-align: center;
          top: 4px;
        }

        :global(.voucher-save-button) {
          background: #d70018;
          border: 0;
          border-radius: 2px;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          height: 32px;
          max-width: 74px;
          min-width: 64px;
          overflow: hidden;
          padding: 0 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :global(.voucher-save-button:disabled) {
          cursor: not-allowed;
          opacity: 0.65;
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
          .shop-banner-content,
          .shop-identity {
            align-items: flex-start !important;
            flex-direction: column;
          }

          .shop-stats {
            justify-content: space-between;
            text-align: left !important;
            width: 100%;
          }

          .voucher-coupon {
            flex-basis: 320px;
          }

          .voucher-coupon-content {
            grid-template-columns: minmax(0, 1fr) 84px;
          }

          .voucher-main-text {
            padding: 18px 14px 14px 12px;
          }

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
