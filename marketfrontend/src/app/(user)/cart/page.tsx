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
};

type PreLoginCartItem = {
  user_id: null;
  product_id: number;
  variant_id: number;
  quantity: number;
};

type OwnedVoucher = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  discountType?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscountAmount?: number | null;
  minOrderValue?: number | null;
  validTo?: string | null;
  claimEndAt?: string | null;
  issuerType?: string | null;
  status: string;
  claimedAt?: string | null;
};

type VoucherAvailability = {
  voucher: OwnedVoucher;
  isEligible: boolean;
  reason: string | null;
};

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

const formatDate = (value?: string | null) => {
  if (!value) return "No expiry";
  return new Date(value).toLocaleDateString("vi-VN");
};

const normalizeVoucherNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getVoucherLabel = (voucher: OwnedVoucher) => {
  const type = String(voucher.discountType ?? "").toUpperCase();

  if (type === "PERCENT") {
    return `Save ${normalizeVoucherNumber(voucher.discountPercent)}%`;
  }

  if (type === "FIXED") {
    return `Save ${normalizeVoucherNumber(voucher.discountAmount).toLocaleString("vi-VN")}d`;
  }

  if (type === "FREE_SHIPPING") {
    return "Free shipping";
  }

  if (type === "GIFT_ITEM") {
    return "Gift item";
  }

  return voucher.title;
};

const getVoucherAvailability = (
  voucher: OwnedVoucher,
  subtotal: number,
): VoucherAvailability => {
  const status = String(voucher.status ?? "").toUpperCase();
  if (status && status !== "CLAIMED") {
    return {
      voucher,
      isEligible: false,
      reason: "Da su dung hoac khong kha dung",
      
    };
  }

  const now = Date.now();
  if (voucher.validTo && new Date(voucher.validTo).getTime() < now) {
    return {
      voucher,
      isEligible: false,
      reason: "Da het han",
    };
  }

  if (subtotal <= 0) {
    return {
      voucher,
      isEligible: false,
      reason: "Chon san pham de dung voucher",
    };
  }

  const minOrderValue = normalizeVoucherNumber(voucher.minOrderValue);
  if (minOrderValue > 0 && subtotal < minOrderValue) {
    return {
      voucher,
      isEligible: false,
      reason: `Min. order ${minOrderValue.toLocaleString("vi-VN")}d`,
    };
  }

  return {
    voucher,
    isEligible: true,
    reason: null,
  };
};

const ShoppingCart: React.FC = () => {
  Cart.setup({ path: "/api/cart", baseUrl: API_URL });
  const { userId } = useUserAuth();
  const isLoggedIn = Boolean(userId);
  const { data, isError, status } = useQuery({
    ...Cart.getByUserId(userId || 0),
    enabled: isLoggedIn,
  });

  const [preLoginCart, setPreLoginCart] = useState<PreLoginCartItem[]>([]);
  // State lưu danh sách cartItems từ API + selected flag
  const [cartItems, setCartItems] = useState<CartStateItem[]>([]);
  // Track items đang được update/delete để disable tương tác
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [stockWarning, setStockWarning] = useState<Record<number, string>>({});
  const [ownedVouchers, setOwnedVouchers] = useState<OwnedVoucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null,
  );
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [draftVoucherId, setDraftVoucherId] = useState<number | null>(null);

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
                stockQuantity:
                  variantData?.stockQuantity ??
                  currentVariant?.stockQuantity ??
                  0,
                imageUrl:
                  variantData?.imageUrl ?? currentVariant?.imageUrl ?? "",
              }
            : null,
        width: variantData?.width ?? 0,
        height: variantData?.height ?? 0,
        weight: variantData?.weight ?? 0,
        // Ưu tiên data fresh từ variantQuery, fallback về data gốc trong cartItem
        stockQuantity:
          variantData?.stockQuantity ?? item.productVariant?.stockQuantity ?? 0,
      };
    });
  }, [cartItems, cartProductQueries, variantQueries]);

  // Lưu các item được chọn vào localStorage
  useEffect(() => {
    const selectedItems = enrichedCartItems.filter((item) => item.selected);
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
  }, [enrichedCartItems]);

  useEffect(() => {
    if (isError) {
      alert(
        "Đã xảy ra lỗi khi tải dữ liệu giỏ hàng. Vui lòng thử lại sau. " +
          status,
      ); //
      console.error("Error fetching cart data");
    }
  }, [isError, status]);

  const shippingFee = 35000;

  useEffect(() => {
    if (!userId) {
      setOwnedVouchers([]);
      setSelectedVoucherId(null);
      return;
    }

    const loadOwnedVouchers = async () => {
      setVoucherLoading(true);

      try {
        const [userVouchersRes, vouchersRes] = await Promise.all([
          fetch(`${API_URL}/api/user-vouchers/user/${userId}`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/vouchers`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!userVouchersRes.ok || !vouchersRes.ok) {
          throw new Error("Failed to load vouchers");
        }

        const [userVouchersJson, vouchersJson] = await Promise.all([
          userVouchersRes.json(),
          vouchersRes.json(),
        ]);

        const userVouchers = Array.isArray(userVouchersJson)
          ? userVouchersJson
          : [];
        const vouchers = Array.isArray(vouchersJson) ? vouchersJson : [];
        const voucherMap = new Map(
          vouchers.map((voucher: any) => [Number(voucher.id), voucher]),
        );

        const merged = userVouchers
          .map((item: any) => {
            const voucher = voucherMap.get(
              Number(item.voucherId ?? item.voucher_id),
            );
            if (!voucher) return null;

            return {
              id: Number(voucher.id),
              code: voucher.code,
              title: voucher.title,
              description: voucher.description,
              discountType: voucher.discountType ?? voucher.discount_type,
              discountPercent:
                voucher.discountPercent ?? voucher.discount_percent,
              discountAmount:
                voucher.discountAmount ?? voucher.discount_amount,
              maxDiscountAmount:
                voucher.maxDiscountAmount ?? voucher.max_discount_amount,
              minOrderValue: voucher.minOrderValue ?? voucher.min_order_value,
              validTo: voucher.validTo ?? voucher.valid_to,
              claimEndAt: voucher.claimEndAt ?? voucher.claim_end_at,
              issuerType: voucher.issuerType ?? voucher.issuer_type,
              status: item.status,
              claimedAt: item.claimedAt ?? item.claimed_at,
            } satisfies OwnedVoucher;
          })
          .filter((item: OwnedVoucher | null): item is OwnedVoucher =>
            Boolean(item),
          )
          .sort((a, b) => {
            const left = a.claimedAt ? new Date(a.claimedAt).getTime() : 0;
            const right = b.claimedAt ? new Date(b.claimedAt).getTime() : 0;
            return right - left;
          });

        setOwnedVouchers(merged);
      } catch (error) {
        console.error("Load cart vouchers error:", error);
        setOwnedVouchers([]);
      } finally {
        setVoucherLoading(false);
      }
    };

    loadOwnedVouchers();
  }, [userId]);

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
        GroupedCartByShop & { items: (CartItem & { selected: boolean })[] }
      >,
    );
  }, [enrichedCartItems]);

  // ===== Tính toán =====
  const calculateSubtotal = () => {
    return enrichedCartItems
      .filter((item) => item.selected)
      .reduce(
        (sum, item) => sum + (item.productVariant?.price ?? 0) * item.quantity,
        0,
      );
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() + shippingFee);
  };

  const selectedCount = enrichedCartItems.filter(
    (item) => item.selected,
  ).length;

  const voucherAvailabilityList = useMemo(() => {
    const subtotal = calculateSubtotal();
    return ownedVouchers.map((voucher) =>
      getVoucherAvailability(voucher, subtotal),
    );
  }, [ownedVouchers, enrichedCartItems]);

  const usableVouchers = useMemo(
    () =>
      voucherAvailabilityList
        .filter((item) => item.isEligible)
        .map((item) => item.voucher),
    [voucherAvailabilityList],
  );

  useEffect(() => {
    if (!selectedVoucherId) return;

    const stillUsable = usableVouchers.some(
      (voucher) => voucher.id === selectedVoucherId,
    );

    if (!stillUsable) {
      setSelectedVoucherId(null);
    }
  }, [selectedVoucherId, usableVouchers]);

  useEffect(() => {
    if (isVoucherModalOpen) {
      setDraftVoucherId(selectedVoucherId);
    }
  }, [isVoucherModalOpen, selectedVoucherId]);

  const openVoucherModal = () => {
    setDraftVoucherId(selectedVoucherId);
    setIsVoucherModalOpen(true);
  };

  const closeVoucherModal = () => {
    setIsVoucherModalOpen(false);
  };

  const applySelectedVoucher = () => {
    setSelectedVoucherId(draftVoucherId);
    setIsVoucherModalOpen(false);
  };

  // ===== Checkbox logic =====
  const isAllSelected =
    enrichedCartItems.length > 0 &&
    enrichedCartItems.every((item) => item.selected);
  const isIndeterminate =
    enrichedCartItems.some((item) => item.selected) && !isAllSelected;

  const toggleSelectAll = () => {
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: !isAllSelected })),
    );
  };

  const toggleItemSelection = (itemId: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const isShopAllSelected = (shopId: number) => {
    const shopItems = groupedByShop[shopId]?.items as (CartItem & {
      selected: boolean;
    })[];
    return shopItems?.length > 0 && shopItems.every((item) => item.selected);
  };

  const isShopIndeterminate = (shopId: number) => {
    const shopItems = groupedByShop[shopId]?.items as (CartItem & {
      selected: boolean;
    })[];
    const selectedCount = shopItems?.filter((i) => i.selected).length ?? 0;
    return selectedCount > 0 && selectedCount < (shopItems?.length ?? 0);
  };

  const toggleShopSelection = (shopId: number) => {
    const allSelected = isShopAllSelected(shopId);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product?.shop?.id === shopId
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

    const stock = currentItem.stockQuantity ?? Infinity;
    const rawQty = Math.max(1, currentItem.quantity + delta);
    const newQty = delta > 0 ? Math.min(rawQty, stock) : rawQty;

    if (delta > 0 && rawQty > stock) {
      setStockWarning((prev) => ({
        ...prev,
        [itemId]: `Chi con ${stock} san pham trong kho`,
      }));
    } else {
      setStockWarning((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }

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
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải giỏ hàng...</p>
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
              Giỏ Hàng
              <span className="badge bg-light text-dark fs-6 fw-normal">
                ({cartItems.length} sản phẩm)
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
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleSelectAll}
                  />
                </div>
                <div className="col">
                  <span className="fw-semibold">
                    Chọn tất cả ({cartItems.length})
                  </span>
                </div>
                <div className="col-md-7 d-none d-md-block">
                  <div className="row text-center text-muted small fw-medium">
                    <div className="col-3">Đơn giá</div>
                    <div className="col-3">Số lượng</div>
                    <div className="col-3">Thành tiền</div>
                    <div className="col-3">Thao tác</div>
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
                <p className="mt-3 text-muted">Giỏ hàng của bạn đang trống.</p>
              </div>
            </div>
          )}

          {/* Shop Groups */}
          {Object.entries(groupedByShop)?.map(([shopIdStr, group]) => {
            const shopId = Number(shopIdStr);
            const typedItems = group.items as EnrichedCartItem[];

            return (
              <div key={shopId} className="card shadow-sm mb-3">
                {/* Shop Header */}
                <div className="card-header bg-light d-flex align-items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    style={{ width: "20px", height: "20px" }}
                    checked={isShopAllSelected(shopId)}
                    ref={(el) => {
                      if (el) el.indeterminate = isShopIndeterminate(shopId);
                    }}
                    onChange={() => toggleShopSelection(shopId)}
                  />
                  <i className="bi bi-shop text-primary"></i>
                  <span className="fw-bold text-uppercase small">
                    {group?.shop?.shopName || "Dang tai ten shop..."}
                  </span>
                  <i className="bi bi-chevron-right text-muted"></i>
                </div>

                {/* Products */}
                {typedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`card-body ${index < typedItems.length - 1 ? "border-bottom" : ""}`}
                  >
                    <div className="row align-items-center g-3">
                      {/* Product Info */}
                      <div className="col-md-5">
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={item.selected}
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
                                "Dang tai ten san pham..."}
                            </h6>
                            <div className="small text-muted mb-1">
                              Shop:{" "}
                              {item?.product?.shop?.shopName ||
                                "Dang tai ten shop..."}
                            </div>
                            {(item?.productVariant ||
                              item.productVariant?.id) && (
                              <div className="small text-muted d-flex align-items-center gap-1">
                                Phân loại:{" "}
                                <span className="text-dark fw-medium">
                                  {item?.productVariant?.variantName ||
                                    "Dang tai ten phan loai..."}
                                </span>
                                <i className="bi bi-chevron-down"></i>
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
                              Đơn giá
                            </div>
                            <div className="fw-bold">
                              {formatCurrency(item.productVariant?.price ?? 0)}
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="col-6 col-md-3">
                            <div className="d-md-none small text-muted mb-1">
                              Số lượng
                            </div>
                            <div
                              className="btn-group"
                              role="group"
                              style={{
                                opacity: updatingItems.has(item.id) ? 0.6 : 1,
                              }}
                            >
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={
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
                                  updatingItems.has(item.id) ||
                                  item.quantity >=
                                    (item.stockQuantity ?? Infinity)
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
                              (item.stockQuantity ?? 0) <= 5 && (
                                <div
                                  className="text-warning mt-1"
                                  style={{ fontSize: "11px" }}
                                >
                                  <i className="bi bi-clock-history me-1"></i>
                                  Con {item.stockQuantity} san pham
                                </div>
                              )}
                          </div>

                          {/* Subtotal */}
                          <div className="col-6 col-md-3">
                            <div className="d-md-none small text-muted mb-1">
                              Thành tiền
                            </div>
                            <div className="fw-bold text-primary">
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
            {/* Address Card */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-uppercase text-muted small fw-bold mb-0">
                    Địa chỉ nhận hàng
                  </h6>
                  <button className="btn btn-link btn-sm text-primary p-0">
                    Thay đổi
                  </button>
                </div>
                <div className="d-flex gap-2">
                  <i className="bi bi-geo-alt-fill text-primary"></i>
                  <div className="small">
                    <p className="fw-bold mb-1">Nguyễn Văn A | 090 123 4567</p>
                    <p className="text-muted mb-0">
                      123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí
                      Minh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Card */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="text-uppercase text-muted small fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-tag"></i>
                  Promotion vouchers
                </h6>
                {!isLoggedIn && (
                  <div className="alert alert-light small mb-0">
                    Sign in to view your available vouchers.
                  </div>
                )}

                {isLoggedIn && (
                  <>
                    {voucherLoading && (
                      <div className="text-muted small">
                        Loading vouchers...
                      </div>
                    )}

                    {!voucherLoading && ownedVouchers.length === 0 && (
                      <div className="alert alert-light small mb-0">
                        You do not have any vouchers yet.
                      </div>
                    )}

                    {!voucherLoading && ownedVouchers.length > 0 && (
                      <div className="alert alert-light small mb-0">
                        Voucher selection is available at checkout.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">
                    Tạm tính ({selectedCount} sản phẩm đã chọn)
                  </span>
                  <span className="fw-semibold">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">Giảm giá voucher</span>
                  <span className="fw-semibold text-success">
                    - {formatCurrency(0)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">Phí vận chuyển</span>
                  <div className="text-end">
                    <div className="fw-semibold">
                      {formatCurrency(shippingFee)}
                    </div>
                    {shippingFee === 0 && (
                      <span
                        className="badge bg-success"
                        style={{ fontSize: "9px" }}
                      >
                        MIỄN PHÍ VẬN CHUYỂN
                      </span>
                    )}
                  </div>
                </div>
                <hr className="border-dashed" />
                <div className="d-flex justify-content-between align-items-end mb-4">
                  <span className="fw-bold">Tổng cộng</span>
                  <div className="text-end">
                    <div className="h4 fw-bold text-primary mb-0">
                      {formatCurrency(calculateTotal())}
                    </div>
                    <small className="text-muted" style={{ fontSize: "10px" }}>
                      (Đã bao gồm VAT nếu có)
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={selectedCount === 0}
                  onClick={() => {
                    if (isLoggedIn) {
                      window.location.href = "/checkout";
                    } else {
                      window.location.href = "/login?redirect=cart";
                    }
                  }}
                >
                  MUA HÀNG ({selectedCount})
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
              Bằng việc nhấn "Mua Hàng", bạn đồng ý với{" "}
              <a href="#" className="text-primary">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-primary">
                Chính sách bảo mật
              </a>{" "}
              của E-Shop.
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
