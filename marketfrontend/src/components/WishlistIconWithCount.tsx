"use client";

import { useUserAuth } from "@/context/UserAuthContext";
import { API_URL } from "@/helper/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const countItems = (items: Array<unknown>) => items.length;

export default function WishlistIconWithCount() {
  const { userId } = useUserAuth();
  const pathname = usePathname();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadWishlistCount = async () => {
      if (!userId) {
        setWishlistCount(0);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/wishlist/user/${userId}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load wishlist count");
        }

        const items = await res.json();
        if (!cancelled) {
          setWishlistCount(countItems(Array.isArray(items) ? items : []));
        }
      } catch (error) {
        console.error("Failed to fetch wishlist count:", error);
        if (!cancelled) {
          setWishlistCount(0);
        }
      }
    };

    loadWishlistCount();

    const handleWishlistUpdated = () => {
      loadWishlistCount();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadWishlistCount();
      }
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdated);
    window.addEventListener("focus", handleWishlistUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("wishlist-updated", handleWishlistUpdated);
      window.removeEventListener("focus", handleWishlistUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, userId]);

  return (
    <Link
      href="/wishlist"
      className="col-auto position-relative text-decoration-none text-primary"
      aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} sản phẩm` : ""}`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "28px", cursor: "pointer" }}
      >
        favorite
      </span>

      {wishlistCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-8px",
            right: "-10px",
            minWidth: "20px",
            height: "20px",
            padding: "0 6px",
            borderRadius: "999px",
            background:
              "linear-gradient(135deg, rgb(255, 99, 99), rgb(235, 36, 36))",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 14px rgba(235, 36, 36, 0.28)",
            border: "2px solid #fff",
          }}
        >
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      )}
    </Link>
  );
}
