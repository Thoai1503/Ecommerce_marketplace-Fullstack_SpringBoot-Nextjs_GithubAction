"use client";
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useUserAuth } from "@/context/UserAuthContext";
import { Cart } from "@/types/data/Cart";
import { API_URL } from "@/helper/api";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CartItem, GroupedCartByShop } from "@/validators/cart";
import { productVariantQuery } from "@/query/productVariant";
import { productQuery } from "@/feature/client/query";
import { clearAuth, getValidAccessToken } from "@/lib/authSession";

type CartStateItem = CartItem & {
  selected: boolean;
  isGuest?: boolean;
  guestProductId?: number;
  guestVariantId?: number;
};

type EnrichedCartItem = CartStateItem & {
  width?: number;
  height?: number;
  weight?: number;
  stockQuantity?: number;
  isVariantActive?: boolean;
  isLocked?: boolean;
  lockedReason?: string;
};

type PreLoginCartItem = {
  user_id: null;
  product_id: number;
  variant_id: number;
  quantity: number;
};

const toOptionalNumber = (value: any): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const isInactiveValue = (value: any) =>
  value === 0 || value === "0" || value === false || value === "false";

const resolveProductId = (item: any): number | null => {
  return (
    item?.guestProductId ??
    item?.product?.id ??
    item?.product?.product_id ??
    item?.productId ??
    item?.product_id ??
    null
  );
};

const resolveVariantId = (item: any): number | null => {
  return (
    item?.guestVariantId ??
    item?.productVariant?.id ??
    item?.productVariant?.variant_id ??
    item?.variantId ??
    item?.variant_id ??
    null
  );
};

const isAuthQueryError = (error: unknown) => {
  const err = error as any;
  const status = Number(
    err?.status ?? err?.response?.status ?? err?.code ?? 0,
  );
  const message = String(err?.message ?? err?.error ?? "").toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  );
};

const ShoppingCart: React.FC = () => {
  Cart.setup({ path: "/api/cart", baseUrl: API_URL });
  const { userId } = useUserAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const isLoggedIn = Boolean(userId) && !sessionExpired;
  const { data, error, isError, status } = useQuery({
    ...Cart.getByUserId(userId || 0),
    enabled: isLoggedIn,
  });

  const [preLoginCart, setPreLoginCart] = useState<PreLoginCartItem[]>([]);
  // State lưu danh sách cartItems từ API + selected flag
  const [cartItems, setCartItems] = useState<CartStateItem[]>([]);
  // Track items đang được update/delete để disable tương tác
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [stockWarning, setStockWarning] = useState<Record<number, string>>({});

  useEffect(() => {
    setSessionExpired(false);
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("preLoginCart");
      setPreLoginCart(raw ? JSON.parse(raw) : []);
    } catch {
      setPreLoginCart([]);
    }
  }, []);

  // Sync dữ liệu từ API vào state khi data thay đổi
  useEffect(() => {
    if (!isLoggedIn) return;
    if (data) {
      setCartItems((prev) =>
        data.map((item) => ({
          ...item,
          guestProductId: resolveProductId(item) ?? undefined,
          guestVariantId: resolveVariantId(item) ?? undefined,
          selected:
            prev.find((prevItem) => prevItem.id === item.id)?.selected ?? false,
        })),
      );
    }
  }, [data, isLoggedIn]);

  const productQueries = useQueries({
    queries: preLoginCart.map((item) => {
      const productId = item.product_id;
      return {
        ...productQuery.detail_with_shop(productId),
        enabled: !isLoggedIn && Boolean(productId),
      };
    }),
  });
  const guestVariantQueries = useQueries({
    queries: preLoginCart.map((item) => {
      const variantId = item.variant_id;
      return {
        ...productVariantQuery.detail(variantId ?? 0),
        enabled: !isLoggedIn && Boolean(variantId),
      };
    }),
  });

  useEffect(() => {
    if (isLoggedIn) return;

    if (preLoginCart.length === 0) {
      setCartItems([]);
      return;
    }

    const hasPendingQueries =
      productQueries.some((q) => q.isLoading) ||
      guestVariantQueries.some((q) => q.isLoading);

    if (hasPendingQueries) return;

    setCartItems((prev) => {
      const nextItems = preLoginCart.map((item, index) => {
        const productData = productQueries[index]?.data;
        const variantData = guestVariantQueries[index]?.data;
        const syntheticId = Number(
          `9${item.product_id}${item.variant_id}${index}`,
        );
        const existingItem = prev.find(
          (prevItem) => prevItem.id === syntheticId,
        );

        return {
          id: syntheticId,
          userId: 0,
          quantity: item.quantity,
          addedAt: existingItem?.addedAt ?? new Date().toISOString(),
          updatedAt: existingItem?.updatedAt ?? new Date().toISOString(),
          selected:
            prev.find((prevItem) => prevItem.id === syntheticId)?.selected ??
            false,
          isGuest: true,
          guestProductId: item.product_id,
          guestVariantId: item.variant_id,
          product: {
            id: productData?.id ?? item.product_id,
            name: productData?.name ?? "",
            shop: {
              id: productData?.shop?.id ?? 0,
              userId: productData?.shop?.userId ?? 0,
              shopName: productData?.shop?.shopName ?? "",
            },
          },
          productVariant: variantData
            ? {
                id: variantData.id,
                variantName: variantData.variantName ?? "",
                sku: variantData.sku,
                price: variantData.price,
                stockQuantity: variantData.stockQuantity,
                imageUrl: variantData.imageUrl,
              }
            : null,
        } as CartStateItem;
      });

      const unchanged =
        prev.length === nextItems.length &&
        prev.every((prevItem, index) => {
          const nextItem = nextItems[index];
          if (!nextItem) return false;

          return (
            prevItem.id === nextItem.id &&
            prevItem.quantity === nextItem.quantity &&
            prevItem.selected === nextItem.selected &&
            prevItem.guestProductId === nextItem.guestProductId &&
            prevItem.guestVariantId === nextItem.guestVariantId &&
            prevItem.product?.name === nextItem.product?.name &&
            prevItem.productVariant?.price === nextItem.productVariant?.price &&
            prevItem.productVariant?.stockQuantity ===
              nextItem.productVariant?.stockQuantity
          );
        });

      return unchanged ? prev : nextItems;
    });
  }, [guestVariantQueries, isLoggedIn, preLoginCart, productQueries]);

  const variantQueries = useQueries({
    queries: cartItems.map((item) => {
      const variantId = resolveVariantId(item);

      return {
        ...productVariantQuery.detail(variantId ?? 0),
        enabled: Boolean(variantId),
      };
    }),
  });

  const cartProductQueries = useQueries({
    queries: cartItems.map((item) => {
      const productId = resolveProductId(item);

      return {
        ...productQuery.detail_with_shop(productId ?? 0),
        enabled: Boolean(productId),
      };
    }),
  });

  const enrichedCartItems = useMemo<EnrichedCartItem[]>(() => {
    return cartItems.map((item, index) => {
      const productData = cartProductQueries[index]?.data;
      const variantData = variantQueries[index]?.data;
      const currentVariant = item.productVariant;
      const variantStockQuantity = toOptionalNumber(
        variantData?.stockQuantity ??
          variantData?.stock_quantity ??
          currentVariant?.stockQuantity ??
          (currentVariant as any)?.stock_quantity,
      );
      const variantActiveRaw =
        variantData?.isActive ??
        variantData?.is_active ??
        variantData?.active ??
        (currentVariant as any)?.isActive ??
        (currentVariant as any)?.is_active ??
        (currentVariant as any)?.active;
      const isVariantActive =
        variantActiveRaw === undefined || variantActiveRaw === null
          ? true
          : !isInactiveValue(variantActiveRaw);
      const lockedReason = !isVariantActive
        ? "This product category has been discontinued."
        : variantStockQuantity !== undefined && variantStockQuantity <= 0
          ? "The item is out of stock."
          : "";

      return {
        ...item,
        product: {
          id: productData?.id ?? item.product?.id ?? item.guestProductId ?? 0,
          name:
            productData?.name ??
            (item.product as any)?.name ??
            (item.product as any)?.product_name ??
            "",
          shop: {
            id: productData?.shop?.id ?? item.product?.shop?.id ?? 0,
            userId:
              productData?.shop?.userId ?? item.product?.shop?.userId ?? 0,
            shopName:
              productData?.shop?.shopName ??
              (item.product as any)?.shop?.shopName ??
              (item.product as any)?.shop?.shop_name ??
              "",
          },
        },
        productVariant:
          variantData || currentVariant
            ? {
                id: variantData?.id ?? currentVariant?.id ?? 0,
                variantName:
                  variantData?.variantName ??
                  (currentVariant as any)?.variantName ??
                  (currentVariant as any)?.variant_name ??
                  "",
                sku: variantData?.sku ?? currentVariant?.sku ?? "",
                price: variantData?.price ?? currentVariant?.price ?? 0,
                stockQuantity: variantStockQuantity ?? 0,
                imageUrl:
                  variantData?.imageUrl ?? currentVariant?.imageUrl ?? "",
              }
            : null,
        width: variantData?.width ?? 0,
        height: variantData?.height ?? 0,
        weight: variantData?.weight ?? 0,
        // Ưu tiên data fresh từ variantQuery, fallback về data gốc trong cartItem
        stockQuantity: variantStockQuantity,
        isVariantActive,
        isLocked: Boolean(lockedReason),
        lockedReason,
      };
    });
  }, [cartItems, cartProductQueries, variantQueries]);

  // Lưu các item được chọn vào localStorage
  useEffect(() => {
    const selectedItems = enrichedCartItems.filter(
      (item) => item.selected && !item.isLocked,
    );
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
  }, [enrichedCartItems]);

  useEffect(() => {
    const lockedSelectedIds = new Set(
      enrichedCartItems
        .filter((item) => item.isLocked && item.selected)
        .map((item) => item.id),
    );

    if (lockedSelectedIds.size === 0) return;

    setCartItems((prev) =>
      prev.map((item) =>
        lockedSelectedIds.has(item.id) ? { ...item, selected: false } : item,
      ),
    );
  }, [enrichedCartItems]);

  useEffect(() => {
    if (isError) {
      if (isAuthQueryError(error)) {
        clearAuth();
        setSessionExpired(true);
        setCartItems([]);
        return;
      }

      alert(
        "An error occurred while loading shopping cart data. Please try again later. " +
          status,
      ); //
      console.error("Error fetching cart data");
    }
  }, [error, isError, status]);

  const syncGuestCartLocalStorage = (nextItems: CartStateItem[]) => {
    if (typeof window === "undefined") return;

    const rawPayload = nextItems
      .filter((item) => item.isGuest)
      .map((item) => ({
        user_id: null,
        product_id: item.guestProductId ?? item.product?.id,
        variant_id: item.guestVariantId ?? item.productVariant?.id,
        quantity: item.quantity,
      }));

    const payload = rawPayload.filter(
      (item): item is PreLoginCartItem =>
        typeof item.product_id === "number" &&
        typeof item.variant_id === "number",
    );

    localStorage.setItem("preLoginCart", JSON.stringify(payload));
    setPreLoginCart(payload);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Group items theo shop
  const groupedByShop: Record<number, GroupedCartByShop> = useMemo(() => {
    return enrichedCartItems.reduce(
      (acc, item) => {
        const shopId = item?.product?.shop?.id ?? 0;
        if (!acc[shopId]) {
          acc[shopId] = {
            shop: item?.product?.shop,
            items: [],
          };
        }
        acc[shopId].items.push(item);
        return acc;
      },
      {} as Record<
        number,
        GroupedCartByShop & { items: EnrichedCartItem[] }
      >,
    );
  }, [enrichedCartItems]);

  // ===== Tính toán =====
  const calculateSubtotal = () => {
    return enrichedCartItems
      .filter((item) => item.selected && !item.isLocked)
      .reduce(
        (sum, item) => sum + (item.productVariant?.price ?? 0) * item.quantity,
        0,
      );
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal());
  };

  const selectableItems = enrichedCartItems.filter((item) => !item.isLocked);

  const selectedCount = enrichedCartItems.filter(
    (item) => item.selected && !item.isLocked,
  ).length;

  const redirectToCheckoutLogin = () => {
    clearAuth();
    setSessionExpired(true);
    window.location.href = `/login?redirect=${encodeURIComponent("/checkout")}`;
  };

  const handleCheckout = async () => {
    if (selectedCount === 0) return;

    if (!isLoggedIn) {
      redirectToCheckoutLogin();
      return;
    }

    const token = await getValidAccessToken(0);
    if (!token) {
      redirectToCheckoutLogin();
      return;
    }

    window.location.href = "/checkout";
  };

  // ===== Checkbox logic =====
  const isAllSelected =
    selectableItems.length > 0 && selectableItems.every((item) => item.selected);
  const isIndeterminate =
    selectableItems.some((item) => item.selected) && !isAllSelected;

  const toggleSelectAll = () => {
    if (selectableItems.length === 0) return;

    setCartItems((prev) =>
      prev.map((item) => {
        const isSelectable = selectableItems.some(
          (selectableItem) => selectableItem.id === item.id,
        );
        return isSelectable ? { ...item, selected: !isAllSelected } : item;
      }),
    );
  };

  const toggleItemSelection = (itemId: number) => {
    const currentItem = enrichedCartItems.find((item) => item.id === itemId);
    if (!currentItem) return;
    if (currentItem.isLocked) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const isShopAllSelected = (shopId: number) => {
    const shopItems = (groupedByShop[shopId]?.items ??
      []) as EnrichedCartItem[];
    const selectableShopItems = shopItems.filter((item) => !item.isLocked);

    return (
      selectableShopItems.length > 0 &&
      selectableShopItems.every((item) => item.selected)
    );
  };

  const isShopIndeterminate = (shopId: number) => {
    const shopItems = (groupedByShop[shopId]?.items ??
      []) as EnrichedCartItem[];
    const selectableShopItems = shopItems.filter((item) => !item.isLocked);
    const selectedCount =
      selectableShopItems.filter((item) => item.selected).length ?? 0;

    return selectedCount > 0 && selectedCount < selectableShopItems.length;
  };

  const toggleShopSelection = (shopId: number) => {
    const allSelected = isShopAllSelected(shopId);
    const shopItems = (groupedByShop[shopId]?.items ??
      []) as EnrichedCartItem[];
    const selectableShopItems = shopItems.filter((item) => !item.isLocked);

    if (selectableShopItems.length === 0) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.product?.shop?.id === shopId &&
        selectableShopItems.some((selectableItem) => selectableItem.id === item.id)
          ? { ...item, selected: !allSelected }
          : item,
      ),
    );
  };

  // ===== CRUD =====
  const updateQuantity = async (itemId: number, delta: number) => {
    const currentItem = enrichedCartItems.find((i) => i.id === itemId);
    if (!currentItem) return;
    if (updatingItems.has(itemId)) return;
    if (currentItem.isLocked) {
      setStockWarning((prev) => ({
        ...prev,
        [itemId]: currentItem.lockedReason || "Sản phẩm không thể mua",
      }));
      return;
    }

    const newQty = Math.max(1, currentItem.quantity + delta);

    if (newQty === currentItem.quantity) return;

    if (currentItem.isGuest) {
      setCartItems((prev) => {
        const nextItems = prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQty } : item,
        );
        syncGuestCartLocalStorage(nextItems);
        return nextItems;
      });
      return;
    }

    // Optimistic update
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item,
      ),
    );
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await Cart.updateCartItem(itemId, newQty);
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      // Rollback on error
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: currentItem.quantity }
            : item,
        ),
      );
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: number) => {
    const currentItem = cartItems.find((i) => i.id === itemId);
    if (!currentItem) return;

    if (currentItem.isGuest) {
      setCartItems((prev) => {
        const nextItems = prev.filter((item) => item.id !== itemId);
        syncGuestCartLocalStorage(nextItems);
        return nextItems;
      });
      setStockWarning((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      return;
    }

    if (updatingItems.has(itemId)) return;
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    // Optimistic remove
    const snapshot = cartItems.find((i) => i.id === itemId);
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    setStockWarning((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    try {
      await Cart.deleteCartItem(itemId);
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      // Restore item on error
      if (snapshot) {
        setCartItems((prev) => [...prev, snapshot]);
      }
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // ===== Suggestions (giữ mock data) =====
  const suggestions = [
    {
      id: 101,
      name: "Áo Polo Nam Co Giãn 4 Chiều Cao Cấp",
      price: 245000,
      rating: 4.8,
      reviews: 2100,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBpMaGu9gHiFHmr9-NOfCd9FnMrt0pYAzai3yu65hCmzluBbjQyBMfQrAVjuj6uq92htzu79j-mhFncmCyAm96Txi4aqzpDnlibFxHiIiVkoujOe0Aaoa0Otmky3u1lcMn8IhHmixJnUQ83BGzdLnJlq9AoN2jTJqJTZNYzKFdyuWzuvF6FL0gg3ZO3Pk5gPKhjaIc4VDBZ0DcoWqZqMFauCBXYiIsNoPSOhvjHoXVEnVIxueP4p-JoqGPYUq7i8JJgO0gJirEf9A",
      badge: "-15%",
    },
    {
      id: 102,
      name: "Thắt Lưng Da Bò Thật 100% Khóa Kim",
      price: 180000,
      rating: 5.0,
      reviews: 854,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC2X60uGq7bsaRW74jmyatTEpVDBPPC8a4TAogRQskZBugRu-Zi1-jaskPsHfkvgCj7tn5MqLAFJMU_9pQ1qAx1uzvaqcGTpwfJ64civHc0trx-wjHE3VGVGnpWdf1OISqsMBlpDO2D_EsyTNBYRQayifrHMS761Ze0nE61gQaj6YMvULSfCDh50lbE-f4r-6pM8woISYwDwnXU9vY8pFLie99tsweH-ZtUReKaAOyfVXWJgFb3-QpGlCpRjvAzsCZ9N3PDC3o18A",
      badge: null,
    },
    {
      id: 103,
      name: "Combo 5 Đôi Tất Cotton Kháng Khuẩn",
      price: 95000,
      rating: 4.9,
      reviews: 1200,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDMVuA2flTpTePO86znx6IA3yTutXLktCt19K4Q1z4tW59cNVx1455tDVkrwyZ6heZtrvLdCnCWPX1GNllsfyMoG1EQxJ6yE6H7LhhQOrdG-YVlIQdkEdoY3v1ab06C2xoK3ZUzk9y3mt8rx__9sHsPpDaMb0ANUSBVTSXLvEm3ummY0DCJzIThHHwn5HGTG7-PlrWyhM1HSHXIuuKBc3XhrmW5H3_Vx1j-nyUudz2xRKhOOrCIhMlD5lcnz8ocLLS7c5GSAgWpyQ",
      badge: null,
    },
    {
      id: 104,
      name: "Giày Sneaker Trắng Phối Đồ Basic",
      price: 550000,
      rating: 4.7,
      reviews: 542,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDI5ZRjInT8fyGgk9srpjJeYpDCMgCKxzTa1LgRWdmuEu5CuXW6sR_M4Ct1lqkJvyYNgH6fWIH6zp_1dEyg40QY4vnFUaZy6XUztS27FAwHACzKX9vtvwVTgZXI1bNGiOFJuQGxY-r-s0ombAAPV40VI70XepkV1fsmu67OiohAZS-HQlY33Z_7C3XRenLFF3vAyiGwOiDn_pObouDNDe44X3mIpyb3c_tc5wZurceCCtR0W-01SI7b8T_uF8HenRMHejhLYms_EQ",
      badge: "HOT",
    },
    {
      id: 105,
      name: "Kính Mát Chống Tia UV Thời Trang",
      price: 320000,
      rating: 4.5,
      reviews: 211,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAFocVa1Pl0QCnNtkFOIrTyLY05FEqM6atPDE7uoP-ue2VCcE5orGVpv3lQYq2s1vqRrPdedEiq3JYOoPwWAXShJrudVNZ6pysFjCIk9df8WEdrFpdt2qSstd7vsbO8CL55Sl6RJTgFyQ-XsDBuYnykG6E5JRQpGblvf_W9_q8rvNvO3ygK4DWIgxTIcVC8J1u7uP9DtfLm-ZqONTHpfYSo4yJIMwvF688h2fxJkXSflH-7-I2Zudz4XNSR_ANQWjCa6xKg4mvDIA",
      badge: null,
    },
    {
      id: 106,
      name: "Balo Laptop Chống Nước Oxford",
      price: 450000,
      rating: 4.9,
      reviews: 78,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBWvK4ciy91oPscNpspJGkgI4p6InH_P3UBTcejW5f3dPa9OociE55T0LCYbAHl5ORPbjjX_5PmGt2___Mg-T9Xf-2fW2rEmhAnqeD2jLGGcYKjajttRj9_hz6xzl9wz4TuZcDI9AJ1BsGBsPj-u6l5f8I64Q0FPXTtEs_zbdMJykgYunqHbji5bhW6ZTgoBYiR93tr4RVH4_MTR5CLXQZubnb9Z4DwuVRnn5qcw245yP3J0cSb3mTFXm4wH1qUiKWu-1mrptMQYQ",
      badge: null,
    },
  ];

  const isGuestLoading =
    !isLoggedIn &&
    preLoginCart.length > 0 &&
    (productQueries.some((q) => q.isLoading) ||
      guestVariantQueries.some((q) => q.isLoading)) &&
    cartItems.length === 0;

  if ((isLoggedIn && status === "pending") || isGuestLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading shopping cart...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Left Column: Cart Items */}
        <div className="col-lg-8">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h3 fw-bold d-flex align-items-center gap-3 mb-0">
              Shopping Cart
              <span className="badge bg-light text-dark fs-6 fw-normal">
                ({selectableItems.length} items)
              </span>
            </h2>
          </div>

          {/* Select All Header */}
          <div
            className="card shadow-sm mb-3 sticky-top"
            style={{ top: "72px", zIndex: 40 }}
          >
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col-auto">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    style={{ width: "20px", height: "20px" }}
                    checked={isAllSelected}
                    disabled={selectableItems.length === 0}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleSelectAll}
                  />
                </div>
                <div className="col">
                  <span className="fw-semibold">
                    Select all ({selectableItems.length})
                  </span>
                </div>
                <div className="col-md-7 d-none d-md-block">
                  <div className="row text-center text-muted small fw-medium">
                    <div className="col-3">Unit price</div>
                    <div className="col-3">Quantity</div>
                    <div className="col-3">Total</div>
                    <div className="col-3">Actions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty cart */}
          {cartItems.length === 0 && (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-cart-x fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Your shopping cart is empty.</p>
              </div>
            </div>
          )}

          {/* Shop Groups */}
          {Object.entries(groupedByShop)?.map(([shopIdStr, group]) => {
            const shopId = Number(shopIdStr);
            const typedItems = group.items as EnrichedCartItem[];
            const displayItems = typedItems
              .map((item, originalIndex) => ({ item, originalIndex }))
              .sort(
                (a, b) =>
                  Number(a.item.isLocked) - Number(b.item.isLocked) ||
                  a.originalIndex - b.originalIndex,
              )
              .map(({ item }) => item);

            return (
              <div key={shopId} className="card shadow-sm mb-3">
                {/* Shop Header */}
                <div className="card-header bg-light d-flex align-items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    style={{ width: "20px", height: "20px" }}
                    checked={isShopAllSelected(shopId)}
                    disabled={typedItems.every((item) => item.isLocked)}
                    ref={(el) => {
                      if (el) el.indeterminate = isShopIndeterminate(shopId);
                    }}
                    onChange={() => toggleShopSelection(shopId)}
                  />
                  <i className="bi bi-shop text-primary"></i>
                  <span className="fw-bold text-uppercase small">
                    {group?.shop?.shopName || "Loading shop name..."}
                  </span>
                  <i className="bi bi-chevron-right text-muted"></i>
                </div>

                {/* Products */}
                {displayItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`card-body ${
                      index < displayItems.length - 1 ? "border-bottom" : ""
                    } ${item.isLocked ? "bg-light" : ""}`}
                  >
                    <div className="row align-items-center g-3">
                      {/* Product Info */}
                      <div className="col-md-5">
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={item.selected && !item.isLocked}
                            disabled={item.isLocked}
                            onChange={() => toggleItemSelection(item.id)}
                            style={{ width: "20px", height: "20px" }}
                          />
                          <div
                            className="bg-light rounded overflow-hidden border flex-shrink-0"
                            style={{ width: "96px", height: "96px" }}
                          >
                            <img
                              src={
                                item.productVariant?.imageUrl ??
                                "/placeholder.png"
                              }
                              alt={item?.product?.name}
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="fw-bold mb-1 text-truncate">
                              {item?.product?.name ||
                                "Uploading product..."}
                            </h6>
                            <div className="small text-muted mb-1">
                              Shop:{" "}
                              {item?.product?.shop?.shopName ||
                                "Uploading shop name..."}
                            </div>
                            {(item?.productVariant ||
                              item.productVariant?.id) && (
                              <div className="small text-muted d-flex align-items-center gap-1">
                                Classify:{" "}
                                <span className="text-dark fw-medium">
                                  {item?.productVariant?.variantName ||
                                    "Uploading variant name..."}
                                </span>
                                <i className="bi bi-chevron-down"></i>
                              </div>
                            )}
                            {item.isLocked && (
                              <div className="mt-2">
                                <span className="badge bg-secondary">
                                  {item.lockedReason || "Uploading locked reason..."}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="col-md-7">
                        <div className="row align-items-center g-3 text-center">
                          {/* Price */}
                          <div className="col-6 col-md-3">
                            <div className="d-md-none small text-muted mb-1">
                              Unit price
                            </div>
                            <div className="fw-bold">
                              {formatCurrency(item.productVariant?.price ?? 0)}
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="col-6 col-md-3">
                            <div className="d-md-none small text-muted mb-1">
                             Quantity
                            </div>
                            <div
                              className="btn-group"
                              role="group"
                              style={{
                                opacity:
                                  updatingItems.has(item.id) || item.isLocked
                                    ? 0.6
                                    : 1,
                                pointerEvents: item.isLocked ? "none" : "auto",
                              }}
                            >
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={
                                  item.isLocked ||
                                  updatingItems.has(item.id) ||
                                  item.quantity <= 1
                                }
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <input
                                type="text"
                                className="form-control form-control-sm text-center"
                                value={
                                  updatingItems.has(item.id)
                                    ? "..."
                                    : item.quantity
                                }
                                readOnly
                                style={{ width: "50px" }}
                              />
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={
                                  item.isLocked ||
                                  updatingItems.has(item.id)
                                }
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                            {stockWarning[item.id] && (
                              <div
                                className="text-danger mt-1"
                                style={{ fontSize: "11px" }}
                              >
                                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                {stockWarning[item.id]}
                              </div>
                            )}
                            {(item.stockQuantity ?? 0) > 0 &&
                              !item.isLocked &&
                              (item.stockQuantity ?? 0) <= 5 && (
                                <div
                                  className="text-warning mt-1"
                                  style={{ fontSize: "11px" }}
                                >
                                  <i className="bi bi-clock-history me-1"></i>
                                  Còn {item.stockQuantity} sản phẩm
                                </div>
                              )}
                          </div>

                          {/* Subtotal */}
                          <div className="col-6 col-md-3">
                            <div className="d-md-none small text-muted mb-1">
                              Thành tiền
                            </div>
                            <div
                              className={`fw-bold ${
                                item.isLocked ? "text-muted" : "text-primary"
                              }`}
                            >
                              {formatCurrency(
                                (item.productVariant?.price ?? 0) *
                                  item.quantity,
                              )}
                            </div>
                          </div>

                          {/* Delete */}
                          <div className="col-6 col-md-3">
                            <button
                              className="btn btn-link text-danger p-2"
                              onClick={() => removeItem(item.id)}
                              disabled={updatingItems.has(item.id)}
                              title="Xoa san pham"
                            >
                              {updatingItems.has(item.id) ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                />
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right Column: Summary */}
        <div className="col-lg-4">
          <div style={{ top: "88px" }}>


            {/* Payment Summary */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">
                    Temporarily calculated ({selectedCount} items selected)
                  </span>
                  <span className="fw-semibold">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <hr className="border-dashed" />
                <div className="d-flex justify-content-between align-items-end mb-4">
                  <span className="fw-bold">Total</span>
                  <div className="text-end">
                    <div className="h4 fw-bold text-primary mb-0">
                      {formatCurrency(calculateTotal())}
                    </div>
                    <small className="text-muted" style={{ fontSize: "10px" }}>
                      (Already includes VAT if applicable)
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={selectedCount === 0}
                  onClick={() => void handleCheckout()}
                >
                  CHECKOUT ({selectedCount})
                  <i className="bi bi-arrow-right"></i>
                </button>
                <div className="d-flex justify-content-center gap-4 mt-3 opacity-50">
                  <i className="bi bi-credit-card fs-4"></i>
                  <i className="bi bi-wallet2 fs-4"></i>
                  <i className="bi bi-cash-coin fs-4"></i>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="alert alert-light text-center small">
              By clicking "Checkout", you agree to our{" "}
              <a href="#" className="text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary">
                Privacy Policy
              </a>{" "}
              of Naxe.
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <section className="mt-5">
        <h3 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-stars text-primary"></i>
          Có thể bạn cũng thích
        </h3>
        <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
          {suggestions.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100 border shadow-sm">
                <div className="position-relative">
                  <div className="ratio ratio-1x1 bg-light">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="card-img-top object-fit-cover"
                    />
                  </div>
                  {product.badge && (
                    <span
                      className={`position-absolute top-0 start-0 m-2 badge ${
                        product.badge === "HOT" ? "bg-warning" : "bg-danger"
                      }`}
                      style={{ fontSize: "10px" }}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="card-body p-3">
                  <h6
                    className="card-title small fw-medium"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {product.name}
                  </h6>
                  <p className="text-primary fw-bold mb-1">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="d-flex align-items-center gap-1">
                    <i
                      className="bi bi-star-fill text-warning"
                      style={{ fontSize: "12px" }}
                    ></i>
                    <span className="text-muted" style={{ fontSize: "10px" }}>
                      {product.rating} (
                      {product.reviews > 999
                        ? `${(product.reviews / 1000).toFixed(1)}k`
                        : product.reviews}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShoppingCart;
