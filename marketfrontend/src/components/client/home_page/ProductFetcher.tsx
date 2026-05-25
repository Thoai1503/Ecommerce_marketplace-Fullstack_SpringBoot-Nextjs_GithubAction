"use client";
import React, { useCallback, useEffect, useState } from "react";
import AllProduct from "./AllProduct";
import { IProduct } from "@/validators/product";
import { INTERNAL_API } from "@/helper/api";
import styles from "./ProductFetcher.module.css";

const PAGE_SIZE = 20;

function unwrapCollection(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

interface ProductFetcherProps {
  ownShopId: number | null;
}

const ProductFetcher: React.FC<ProductFetcherProps> = ({ ownShopId }) => {
  const [products, setProducts] = useState<Partial<IProduct>[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProductsPage = useCallback(async (pageToLoad: number) => {
    const params = new URLSearchParams({
      verifiedShopOnly: "true",
      page: String(pageToLoad),
      limit: String(PAGE_SIZE),
    });

    if (ownShopId) {
      params.set("excludeShopId", String(ownShopId));
    }

    const res = await fetch(`${INTERNAL_API}/product?${params.toString()}`);
    const productsPayload = await res.json();
    return unwrapCollection(productsPayload) as Partial<IProduct>[];
  }, [ownShopId]);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const firstPageProducts = await fetchProductsPage(1);
        if (ignore) return;

        setProducts(firstPageProducts);
        setPage(1);
        setHasMore(firstPageProducts.length === PAGE_SIZE);
      } catch (e) {
        if (ignore) return;
        setProducts([]);
        setPage(1);
        setHasMore(false);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [fetchProductsPage]);

  const handleSeeMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const nextProducts = await fetchProductsPage(nextPage);
      setProducts((current) => [...current, ...nextProducts]);
      setPage(nextPage);
      setHasMore(nextProducts.length === PAGE_SIZE);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    // Skeleton loading effect for e-commerce
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 24,
        }}
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-info">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-price" />
              <div className="skeleton-line skeleton-button" />
            </div>
          </div>
        ))}
        <style jsx>{`
          .skeleton-card {
            background: #fff;
            border-radius: 16px;
            box-shadow:
              0 1px 3px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.03);
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 260px;
            animation: skeleton-fade 1.2s infinite ease-in-out alternate;
          }
          .skeleton-image {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            background: linear-gradient(
              90deg,
              #f3f3f3 25%,
              #ececec 50%,
              #f3f3f3 75%
            );
            margin-bottom: 16px;
            animation: skeleton-loading 1.2s infinite linear alternate;
          }
          .skeleton-info {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .skeleton-line {
            height: 16px;
            border-radius: 8px;
            background: linear-gradient(
              90deg,
              #f3f3f3 25%,
              #ececec 50%,
              #f3f3f3 75%
            );
            animation: skeleton-loading 1.2s infinite linear alternate;
          }
          .skeleton-title {
            width: 70%;
            height: 18px;
          }
          .skeleton-price {
            width: 40%;
          }
          .skeleton-button {
            width: 60%;
            height: 20px;
            margin-top: 8px;
          }
          @keyframes skeleton-loading {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }
          @keyframes skeleton-fade {
            0% {
              opacity: 0.8;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={styles.productListBlock}>
      <AllProduct products={products} />
      {hasMore && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.seeMoreButton}
            disabled={loadingMore}
            onClick={handleSeeMore}
          >
            {loadingMore ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductFetcher;
