"use client";

import { useUserAuth } from "@/context/UserAuthContext";
import { API_URL } from "@/helper/api";
import { message } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type WishlistItem = {
  wishlist_id?: number;
  user_id?: number;
  product_id?: number;
  id?: number;
  shop_id?: number;
  product_name?: string;
  product_slug?: string;
  image_url?: string;
  price?: number | string;
  original_price?: number | string;
  stock_quantity?: number;
  sold_count?: number;
  rating?: number | string;
  shop_name?: string;
  added_at?: string;
  is_active?: number;
};

const unwrapCollection = (payload: any): WishlistItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatCurrency = (value: unknown) =>
  `${toNumber(value).toLocaleString("vi-VN")}đ`;

const getProductId = (item: WishlistItem) =>
  toNumber(item.product_id ?? item.id);

const getProductHref = (item: WishlistItem) => {
  const productId = getProductId(item);
  const slug = item.product_slug || "product";
  return `/${slug}.p${productId}?id=${productId}`;
};

const getDiscountPercent = (item: WishlistItem) => {
  const price = toNumber(item.price);
  const original = toNumber(item.original_price);
  if (!price || !original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};

export default function WishlistPage() {
  const { userId } = useUserAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const sortedItems = useMemo(
    () =>
      items.filter((item) => getProductId(item) > 0),
    [items],
  );

  const loadWishlist = async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/wishlist/user/${userId}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setItems(unwrapCollection(await res.json()));
    } catch (error: any) {
      console.error("Failed to load wishlist:", error);
      message.error(error?.message || "Không thể tải wishlist");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [userId]);

  const removeItem = async (item: WishlistItem) => {
    if (!userId) return;

    const productId = getProductId(item);
    if (!productId || removingIds.has(productId)) return;

    setRemovingIds((prev) => new Set(prev).add(productId));

    try {
      const res = await fetch(
        `${API_URL}/api/wishlist?user_id=${userId}&product_id=${productId}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setItems((prev) =>
        prev.filter((wishlistItem) => getProductId(wishlistItem) !== productId),
      );
      window.dispatchEvent(new Event("wishlist-updated"));
      message.success("Đã xóa sản phẩm khỏi wishlist");
    } catch (error: any) {
      console.error("Failed to remove wishlist item:", error);
      message.error(error?.message || "Không thể xóa sản phẩm");
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  if (!userId) {
    return (
      <div className="wishlistPage">
        <div className="wishlistEmpty">
          <i className="bi bi-heart"></i>
          <h1>Wishlist</h1>
          <p>Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích.</p>
          <Link href="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
        <style jsx>{pageStyles}</style>
      </div>
    );
  }

  return (
    <div className="wishlistPage">
      <div className="wishlistHeader">
        <div>
          <h1>Wishlist</h1>
          <p>{sortedItems.length} saved product(s)</p>
        </div>
        <Link href="/" className="btn btn-outline-primary">
          Continue shopping
        </Link>
      </div>

      {loading ? (
        <div className="wishlistGrid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="wishlistSkeleton" key={index}>
              <div className="skeletonImage" />
              <div className="skeletonLine skeletonTitle" />
              <div className="skeletonLine skeletonPrice" />
            </div>
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="wishlistEmpty">
          <i className="bi bi-heart"></i>
          <h2>Wishlist đang trống</h2>
          <p>Lưu sản phẩm bạn quan tâm để quay lại nhanh hơn.</p>
          <Link href="/" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="wishlistGrid">
          {sortedItems.map((item) => {
            const productId = getProductId(item);
            const discount = getDiscountPercent(item);
            const isRemoving = removingIds.has(productId);

            return (
              <article className="wishlistCard" key={item.wishlist_id ?? productId}>
                <Link href={getProductHref(item)} className="imageWrap">
                  {discount > 0 && (
                    <span className="discountBadge">-{discount}%</span>
                  )}
                  <img
                    src={item.image_url || "/image/no-image.png"}
                    alt={item.product_name || "Product"}
                  />
                </Link>

                <div className="cardBody">
                  <Link href={getProductHref(item)} className="productName">
                    {item.product_name || "Unnamed product"}
                  </Link>

                  <div className="shopName">
                    <i className="bi bi-shop"></i>
                    <span>{item.shop_name || "Nexamart shop"}</span>
                  </div>

                  <div className="priceRow">
                    <span className="currentPrice">
                      {formatCurrency(item.price)}
                    </span>
                    {toNumber(item.original_price) > toNumber(item.price) && (
                      <span className="oldPrice">
                        {formatCurrency(item.original_price)}
                      </span>
                    )}
                  </div>

                  <div className="metaRow">
                    <span>Stock {toNumber(item.stock_quantity)}</span>
                    <span>{toNumber(item.rating).toFixed(1)} ★</span>
                  </div>

                  <div className="actions">
                    <Link href={getProductHref(item)} className="btn btn-danger">
                      View product
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={isRemoving}
                      onClick={() => removeItem(item)}
                    >
                      <i className="bi bi-trash"></i>
                      {isRemoving ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style jsx>{pageStyles}</style>
    </div>
  );
}

const pageStyles = `
  .wishlistPage {
    background: #f5f7fb;
    min-height: 60vh;
    padding: 32px clamp(16px, 4vw, 56px);
  }

  .wishlistHeader {
    align-items: center;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin: 0 auto 24px;
    max-width: 1180px;
  }

  .wishlistHeader h1 {
    color: #111827;
    font-size: 28px;
    font-weight: 800;
    margin: 0;
  }

  .wishlistHeader p {
    color: #64748b;
    margin: 4px 0 0;
  }

  .wishlistGrid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    margin: 0 auto;
    max-width: 1180px;
  }

  .wishlistCard,
  .wishlistSkeleton {
    background: #fff;
    border: 1px solid #e5eaf2;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    overflow: hidden;
  }

  .imageWrap {
    aspect-ratio: 1;
    background: #f8fafc;
    display: block;
    position: relative;
  }

  .imageWrap img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .discountBadge {
    background: #ef4444;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    left: 10px;
    padding: 4px 8px;
    position: absolute;
    top: 10px;
    z-index: 1;
  }

  .cardBody {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  .productName {
    color: #111827;
    display: -webkit-box;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.35;
    min-height: 38px;
    overflow: hidden;
    text-decoration: none;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .productName:hover {
    color: #0d6efd;
  }

  .shopName,
  .metaRow {
    align-items: center;
    color: #64748b;
    display: flex;
    font-size: 12px;
    gap: 6px;
    justify-content: space-between;
  }

  .shopName {
    justify-content: flex-start;
    min-width: 0;
  }

  .shopName span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .priceRow {
    align-items: baseline;
    display: flex;
    gap: 8px;
  }

  .currentPrice {
    color: #dc2626;
    font-size: 18px;
    font-weight: 800;
  }

  .oldPrice {
    color: #94a3b8;
    font-size: 13px;
    text-decoration: line-through;
  }

  .actions {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr;
    margin-top: 4px;
  }

  .actions .btn {
    align-items: center;
    display: flex;
    gap: 6px;
    justify-content: center;
    min-height: 38px;
    white-space: nowrap;
  }

  .wishlistEmpty {
    align-items: center;
    background: #fff;
    border: 1px solid #e5eaf2;
    border-radius: 8px;
    color: #64748b;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: 560px;
    padding: 48px 20px;
    text-align: center;
  }

  .wishlistEmpty i {
    color: #ef4444;
    font-size: 42px;
    margin-bottom: 12px;
  }

  .wishlistEmpty h1,
  .wishlistEmpty h2 {
    color: #111827;
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 8px;
  }

  .wishlistEmpty p {
    margin-bottom: 18px;
  }

  .wishlistSkeleton {
    padding: 14px;
  }

  .skeletonImage,
  .skeletonLine {
    animation: pulse 1.2s ease-in-out infinite alternate;
    background: #e8edf5;
    border-radius: 8px;
  }

  .skeletonImage {
    aspect-ratio: 1;
    margin-bottom: 14px;
  }

  .skeletonLine {
    height: 14px;
    margin-bottom: 10px;
  }

  .skeletonTitle {
    width: 78%;
  }

  .skeletonPrice {
    width: 42%;
  }

  @keyframes pulse {
    from {
      opacity: 0.65;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    .wishlistHeader {
      align-items: flex-start;
      flex-direction: column;
    }

    .wishlistPage {
      padding: 20px 12px;
    }
  }
`;
