"use client";

import { API_URL } from "@/helper/api";
import { useUserAuth } from "@/context/UserAuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type GuestCartItem = {
  quantity?: number;
};

type ApiCartItem = {
  quantity?: number;
};

const countItems = (items: Array<unknown>) => items.length;

export default function CartIconWithCount() {
  const { userId } = useUserAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadCartCount = async () => {
      if (typeof window === "undefined") return;

      if (userId) {
        try {
          const res = await fetch(`${API_URL}/api/cart/user/${userId}`, {
            credentials: "include",
            cache: "no-store",
          });

          if (!res.ok) {
            throw new Error("Failed to load cart count");
          }

          const items = (await res.json()) as ApiCartItem[];
          if (!cancelled) {
            setCartCount(countItems(Array.isArray(items) ? items : []));
          }
          return;
        } catch (error) {
          console.error("Failed to fetch cart count:", error);
        }
      }

      try {
        const rawGuestCart =
          localStorage.getItem("preLoginCart") ?? localStorage.getItem("cart");
        const items = rawGuestCart
          ? (JSON.parse(rawGuestCart) as GuestCartItem[])
          : [];

        if (!cancelled) {
          setCartCount(countItems(Array.isArray(items) ? items : []));
        }
      } catch (error) {
        console.error("Failed to read guest cart count:", error);
        if (!cancelled) {
          setCartCount(0);
        }
      }
    };

    loadCartCount();

    const handleCartUpdated = () => {
      loadCartCount();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadCartCount();
      }
    };

    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("storage", handleCartUpdated);
    window.addEventListener("focus", handleCartUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("storage", handleCartUpdated);
      window.removeEventListener("focus", handleCartUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, userId]);

  return (
    <Link
      href="/cart"
      className="col-auto position-relative text-decoration-none text-primary"
      aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} vật phẩm` : ""}`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "28px", cursor: "pointer" }}
      >
        shopping_cart
      </span>

      {cartCount > 0 && (
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
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );
}
