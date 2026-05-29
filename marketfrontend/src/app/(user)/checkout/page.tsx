"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import CheckoutLeftSteps from "@/components/client/checkout_page/CheckoutLeftSteps";
import CheckoutOrderSummary from "@/components/client/checkout_page/CheckoutOrderSummary";
import {
  Address,
  ShippingOption,
  ShippingSelection,
} from "@/components/client/checkout_page/types";
import { CartItem, GroupedCartByShop } from "@/validators/cart";
import { createOrder } from "@/feature/client/service";
import { IOrderItem } from "@/validators/orderItem";
import { IOrderShipment } from "@/validators/orderShipment";
import { useUserAuth } from "@/context/UserAuthContext";
import { useAddresses } from "@/hooks/useAddresses";

// Dữ liệu mẫu cho city, district, ward (city vẫn dùng map tĩnh, district/ward lấy động)
const cityMap = { 202: "TP. Hồ Chí Minh", 1: "Hà Nội" };

import { useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { ADDRESS_KEY, API_URL, PROVINCE_API } from "@/helper/api";
import {
  CalculateFeePayload,
  VoucherScopeRule,
  VoucherSegmentRule,
} from "@/types";
import { AxiosError } from "axios";
import { getUserInfoById } from "@/service/userInfo";
import { Cart } from "@/types/data/Cart";
import { getVoucherRules } from "@/service/vouchers";
import { calculateFeeOfLOGS } from "@/service/calculateFeeAPI";
import { getAddressByShopId } from "@/service/addresses";

// Hàm fetch districts theo provinceId
async function fetchDistrictsByProvince(provinceId: number) {
  if (!PROVINCE_API) return [];
  const res = await fetch(`${PROVINCE_API}/district`, {
    method: "POST",
    headers: {
      token: ADDRESS_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ province_id: provinceId }),
  });
  const data = await res.json();
  return data?.data || [];
}

// Hàm fetch wards theo districtId
async function fetchWardsByDistrict(districtId: number) {
  if (!PROVINCE_API) return [];
  const res = await fetch(`${PROVINCE_API}/ward?district_id`, {
    method: "POST",
    headers: {
      token: ADDRESS_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ district_id: districtId }),
  });
  const data = await res.json();
  return data?.data || [];
}

// Custom hook lấy district name có caching
export function useDistrictName(provinceId: number, districtId: number) {
  return useQuery({
    queryKey: ["districts", provinceId],
    queryFn: () => fetchDistrictsByProvince(provinceId),
    select: (districts: any[]) => {
      const found = districts.find((d) => d.DistrictID === districtId);
      return found ? found.DistrictName : `Quận ${districtId}`;
    },
    enabled: !!provinceId && !!districtId,
    staleTime: 1000 * 60 * 60, // 1h
  });
}

// Custom hook lấy ward name có caching
export function useWardName(districtId: number, wardCode: number) {
  return useQuery({
    queryKey: ["wards", districtId],
    queryFn: () => fetchWardsByDistrict(districtId),
    select: (wards: any[]) => {
      const found = wards.find((w) => Number(w.WardCode) === Number(wardCode));
      return found ? found.WardName : `Phường ${wardCode}`;
    },
    enabled: !!districtId && !!wardCode,
    staleTime: 1000 * 60 * 60, // 1h
  });
}

type OwnedVoucher = {
  userVoucherId: number;
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
  issuerId?: number | null;
  stackable: boolean;
  status: string;
  claimedAt?: string | null;
  scopeRules: VoucherScopeRule[];
  segmentRules: VoucherSegmentRule[];
};

type VoucherAvailability = {
  voucher: OwnedVoucher;
  isEligible: boolean;
  reason: string | null;
};

type VoucherItemAmount = {
  item: CartItem;
  amount: number;
};

type VoucherUsageDraft = {
  voucherId: number;
  shopId: number;
  discountAmount: number;
};

type VoucherItemDiscountDraft = {
  itemKey: string;
  discountAmount: number;
};

type VoucherRedemptionDraft = {
  voucher: OwnedVoucher;
  discountAmount: number;
  itemDiscounts: VoucherItemDiscountDraft[];
};

type BackendVoucherItemBreakdown = {
  itemKey: string;
  shopId: number;
  productId: number;
  variantId: number;
  subtotal: number;
  shopVoucherDiscountAmount: number;
  platformVoucherDiscountAmount: number;
  totalVoucherDiscountAmount: number;
  totalAfterShopVoucher: number;
  totalAfterAllVouchers: number;
  platformCommissionRate: number;
  platformCommissionAmount: number;
  sellerReceivableAmount: number;
};

type BackendVoucherApplication = {
  voucherId: number;
  discountAmount: number;
  itemDiscounts: VoucherItemDiscountDraft[];
  discountByShop: Record<string, number>;
};

type BackendVoucherCalculation = {
  items: BackendVoucherItemBreakdown[];
  shopVoucherDiscountByShop: Record<string, number>;
  shopVoucherDiscount: number;
  platformVoucherDiscount: number;
  totalVoucherDiscount: number;
  voucherApplications: BackendVoucherApplication[];
};

type CheckoutVoucherCalculationPayload = {
  userId: number;
  hasPreviousOrder: boolean;
  items: {
    itemKey: string;
    shopId: number;
    productId: number;
    variantId: number;
    categoryId: number;
    brandId: number;
    quantity: number;
    price: number;
  }[];
  selectedShopVoucherIdsByShop: Record<string, number[]>;
  selectedPlatformVoucherIds: number[];
};

type OrderCheckoutRefs = {
  orderNumber: string;
  shipmentIdByShop: Map<number, number>;
  orderItemIdByKey: Map<string, number>;
};

const normalizeVoucherNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toMoneyAmount = (value: number) => Number(Math.max(0, value).toFixed(2));
const PLATFORM_COMMISSION_RATE = 0.1;

const normalizeVoucherBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
};

const getCartItemSubtotal = (item: CartItem) =>
  (item.productVariant?.price ?? 0) * item.quantity;

const getCartItemShopId = (item: CartItem) =>
  Number(item?.product?.shop?.id ?? 0);

const getCartItemCategoryId = (item: CartItem) =>
  Number(
    (item?.product as any)?.category_id ??
      (item?.product as any)?.categoryId ??
      0,
  );

const getCartItemBrandId = (item: CartItem) =>
  Number(
    (item?.product as any)?.brand_id ?? (item?.product as any)?.brand ?? 0,
  );

const getOrderItemKey = (
  shopId: number,
  productId: number,
  variantId: number,
) => `${shopId}:${productId}:${variantId}`;

const getCartItemOrderKey = (item: CartItem) =>
  getOrderItemKey(
    getCartItemShopId(item),
    Number(item?.product?.id ?? 0),
    Number(item?.productVariant?.id ?? 0),
  );

const normalizeNumberRecord = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object") return {};

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, rawValue]) => {
      const amount = toMoneyAmount(normalizeVoucherNumber(rawValue));
      if (amount > 0) {
        acc[String(key)] = amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
};

const createEmptyBackendVoucherCalculation = (
  cartItems: CartItem[] = [],
): BackendVoucherCalculation => ({
  items: cartItems.map((item) => {
    const subtotal = toMoneyAmount(getCartItemSubtotal(item));
    const platformCommissionAmount = toMoneyAmount(
      subtotal * PLATFORM_COMMISSION_RATE,
    );

    return {
      itemKey: getCartItemOrderKey(item),
      shopId: getCartItemShopId(item),
      productId: Number(item?.product?.id ?? 0),
      variantId: Number(item?.productVariant?.id ?? 0),
      subtotal,
      shopVoucherDiscountAmount: 0,
      platformVoucherDiscountAmount: 0,
      totalVoucherDiscountAmount: 0,
      totalAfterShopVoucher: subtotal,
      totalAfterAllVouchers: subtotal,
      platformCommissionRate: PLATFORM_COMMISSION_RATE,
      platformCommissionAmount,
      sellerReceivableAmount: toMoneyAmount(
        Math.max(0, subtotal - platformCommissionAmount),
      ),
    };
  }),
  shopVoucherDiscountByShop: {},
  shopVoucherDiscount: 0,
  platformVoucherDiscount: 0,
  totalVoucherDiscount: 0,
  voucherApplications: [],
});

const normalizeBackendVoucherCalculation = (
  value: any,
  cartItems: CartItem[] = [],
): BackendVoucherCalculation => {
  const fallback = createEmptyBackendVoucherCalculation(cartItems);
  if (!value || typeof value !== "object") return fallback;

  const items = Array.isArray(value.items)
    ? value.items.map((item: any): BackendVoucherItemBreakdown => {
        const subtotal = toMoneyAmount(normalizeVoucherNumber(item.subtotal));
        const shopVoucherDiscountAmount = toMoneyAmount(
          normalizeVoucherNumber(
            item.shopVoucherDiscountAmount ?? item.shop_voucher_discount_amount,
          ),
        );
        const platformVoucherDiscountAmount = toMoneyAmount(
          normalizeVoucherNumber(
            item.platformVoucherDiscountAmount ??
              item.platform_voucher_discount_amount,
          ),
        );
        const totalVoucherDiscountAmount = toMoneyAmount(
          normalizeVoucherNumber(
            item.totalVoucherDiscountAmount ??
              item.total_voucher_discount_amount,
          ),
        );
        const totalAfterShopVoucher = toMoneyAmount(
          normalizeVoucherNumber(
            item.totalAfterShopVoucher ??
              item.total_after_shop_voucher ??
              Math.max(0, subtotal - shopVoucherDiscountAmount),
          ),
        );
        const totalAfterAllVouchers = toMoneyAmount(
          normalizeVoucherNumber(
            item.totalAfterAllVouchers ??
              item.total_after_all_vouchers ??
              Math.max(0, subtotal - totalVoucherDiscountAmount),
          ),
        );
        const normalizedCommissionRate = normalizeVoucherNumber(
          item.platformCommissionRate ??
            item.platform_commission_rate ??
            PLATFORM_COMMISSION_RATE,
        );
        const platformCommissionRate =
          normalizedCommissionRate > 0
            ? normalizedCommissionRate
            : PLATFORM_COMMISSION_RATE;
        const platformCommissionAmount = toMoneyAmount(
          normalizeVoucherNumber(
            item.platformCommissionAmount ??
              item.platform_commission_amount ??
              totalAfterShopVoucher * platformCommissionRate,
          ),
        );
        const sellerReceivableAmount = toMoneyAmount(
          normalizeVoucherNumber(
            item.sellerReceivableAmount ??
              item.seller_receivable_amount ??
              Math.max(0, totalAfterShopVoucher - platformCommissionAmount),
          ),
        );

        return {
          itemKey: String(item.itemKey ?? item.item_key ?? ""),
          shopId: Number(item.shopId ?? item.shop_id ?? 0),
          productId: Number(item.productId ?? item.product_id ?? 0),
          variantId: Number(item.variantId ?? item.variant_id ?? 0),
          subtotal,
          shopVoucherDiscountAmount,
          platformVoucherDiscountAmount,
          totalVoucherDiscountAmount,
          totalAfterShopVoucher,
          totalAfterAllVouchers,
          platformCommissionRate,
          platformCommissionAmount,
          sellerReceivableAmount,
        };
      })
    : fallback.items;

  const voucherApplications = Array.isArray(
    value.voucherApplications ?? value.voucher_applications,
  )
    ? (value.voucherApplications ?? value.voucher_applications).map(
        (application: any): BackendVoucherApplication => ({
          voucherId: Number(
            application.voucherId ?? application.voucher_id ?? 0,
          ),
          discountAmount: toMoneyAmount(
            normalizeVoucherNumber(
              application.discountAmount ?? application.discount_amount,
            ),
          ),
          itemDiscounts: Array.isArray(
            application.itemDiscounts ?? application.item_discounts,
          )
            ? (application.itemDiscounts ?? application.item_discounts).map(
                (itemDiscount: any): VoucherItemDiscountDraft => ({
                  itemKey: String(
                    itemDiscount.itemKey ?? itemDiscount.item_key ?? "",
                  ),
                  discountAmount: toMoneyAmount(
                    normalizeVoucherNumber(
                      itemDiscount.discountAmount ??
                        itemDiscount.discount_amount,
                    ),
                  ),
                }),
              )
            : [],
          discountByShop: normalizeNumberRecord(
            application.discountByShop ?? application.discount_by_shop,
          ),
        }),
      )
    : [];

  return {
    items,
    shopVoucherDiscountByShop: normalizeNumberRecord(
      value.shopVoucherDiscountByShop ?? value.shop_voucher_discount_by_shop,
    ),
    shopVoucherDiscount: toMoneyAmount(
      normalizeVoucherNumber(
        value.shopVoucherDiscount ?? value.shop_voucher_discount,
      ),
    ),
    platformVoucherDiscount: toMoneyAmount(
      normalizeVoucherNumber(
        value.platformVoucherDiscount ?? value.platform_voucher_discount,
      ),
    ),
    totalVoucherDiscount: toMoneyAmount(
      normalizeVoucherNumber(
        value.totalVoucherDiscount ?? value.total_voucher_discount,
      ),
    ),
    voucherApplications,
  };
};

const buildCheckoutVoucherCalculationPayload = (
  userId: number,
  hasPreviousOrder: boolean,
  cartItems: CartItem[],
  selectedShopVoucherIds: Record<number, number[]>,
  selectedPlatformVoucherIds: number[],
): CheckoutVoucherCalculationPayload => ({
  userId,
  hasPreviousOrder,
  items: cartItems.map((item) => ({
    itemKey: getCartItemOrderKey(item),
    shopId: getCartItemShopId(item),
    productId: Number(item?.product?.id ?? 0),
    variantId: Number(item?.productVariant?.id ?? 0),
    categoryId: getCartItemCategoryId(item),
    brandId: getCartItemBrandId(item),
    quantity: Number(item?.quantity ?? 0),
    price: Number(item?.productVariant?.price ?? 0),
  })),
  selectedShopVoucherIdsByShop: Object.entries(selectedShopVoucherIds).reduce(
    (acc, [shopId, voucherIds]) => {
      const ids = voucherIds.map(Number).filter((voucherId) => voucherId > 0);
      if (ids.length > 0) {
        acc[String(shopId)] = ids;
      }
      return acc;
    },
    {} as Record<string, number[]>,
  ),
  selectedPlatformVoucherIds: selectedPlatformVoucherIds
    .map(Number)
    .filter((voucherId) => voucherId > 0),
});

const requestCheckoutVoucherCalculation = async (
  payload: CheckoutVoucherCalculationPayload,
  cartItems: CartItem[],
) => {
  const res = await fetch(`${API_URL}/api/voucher-checkout/calculate`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to calculate checkout vouchers");
  }

  return normalizeBackendVoucherCalculation(await res.json(), cartItems);
};

const itemMatchesScopeRule = (item: CartItem, rule: VoucherScopeRule) => {
  const scopeId = Number(rule.scopeId || 0);

  switch (rule.scopeType) {
    case "SHOP":
      return getCartItemShopId(item) === scopeId;
    case "PRODUCT":
      return Number(item?.product?.id ?? 0) === scopeId;
    case "CATEGORY":
      return (
        Number(
          (item?.product as any)?.category_id ??
            (item?.product as any)?.categoryId ??
            0,
        ) === scopeId
      );
    case "BRAND":
      return (
        Number(
          (item?.product as any)?.brand_id ??
            (item?.product as any)?.brand ??
            0,
        ) === scopeId
      );
    default:
      return false;
  }
};

const getVoucherApplicableCartItems = (
  voucher: OwnedVoucher,
  cartItems: CartItem[],
) => {
  const issuerType = String(voucher.issuerType ?? "").toUpperCase();
  const includedScopeRules = voucher.scopeRules.filter(
    (rule) => rule.includeExclude === "INCLUDE",
  );
  const excludedScopeRules = voucher.scopeRules.filter(
    (rule) => rule.includeExclude === "EXCLUDE",
  );

  let applicableItems = cartItems;

  if (issuerType === "SHOP") {
    const issuerShopId = normalizeVoucherNumber(voucher.issuerId);
    const includeShopIds = includedScopeRules
      .filter((rule) => rule.scopeType === "SHOP")
      .map((rule) => Number(rule.scopeId || 0))
      .filter((shopId) => shopId > 0);

    const shopIds = issuerShopId > 0 ? [issuerShopId] : includeShopIds;
    if (shopIds.length === 0) {
      return [];
    }

    const allowedShopIds = new Set(shopIds);
    applicableItems = applicableItems.filter((item) =>
      allowedShopIds.has(getCartItemShopId(item)),
    );
  }

  if (excludedScopeRules.length > 0) {
    applicableItems = applicableItems.filter(
      (item) =>
        !excludedScopeRules.some((rule) => itemMatchesScopeRule(item, rule)),
    );
  }

  const productScopeRules =
    issuerType === "SHOP"
      ? includedScopeRules.filter((rule) => rule.scopeType !== "SHOP")
      : includedScopeRules;

  if (productScopeRules.length > 0) {
    applicableItems = applicableItems.filter((item) =>
      productScopeRules.some((rule) => itemMatchesScopeRule(item, rule)),
    );
  }

  return applicableItems;
};

const getVoucherApplicableSubtotal = (
  voucher: OwnedVoucher,
  cartItems: CartItem[],
) =>
  getVoucherApplicableCartItems(voucher, cartItems).reduce(
    (sum, item) => sum + getCartItemSubtotal(item),
    0,
  );

const getInitialVoucherItemAmounts = (cartItems: CartItem[]) =>
  cartItems.map((item) => ({
    item,
    amount: getCartItemSubtotal(item),
  }));

const getVoucherApplicableAmount = (
  voucher: OwnedVoucher,
  itemAmounts: VoucherItemAmount[],
) => {
  const applicableItems = new Set(
    getVoucherApplicableCartItems(
      voucher,
      itemAmounts.map((entry) => entry.item),
    ),
  );

  return itemAmounts.reduce(
    (sum, entry) =>
      applicableItems.has(entry.item) ? sum + entry.amount : sum,
    0,
  );
};

const getVoucherDiscountAmountForSubtotal = (
  voucher: OwnedVoucher | undefined,
  applicableSubtotal: number,
) => {
  if (!voucher) return 0;

  const minOrderValue = normalizeVoucherNumber(voucher.minOrderValue);
  if (minOrderValue > 0 && applicableSubtotal < minOrderValue) {
    return 0;
  }

  const type = String(voucher.discountType ?? "").toUpperCase();

  if (type === "FIXED") {
    return Math.min(
      applicableSubtotal,
      normalizeVoucherNumber(voucher.discountAmount),
    );
  }

  if (type === "PERCENT") {
    const rawDiscount =
      (applicableSubtotal * normalizeVoucherNumber(voucher.discountPercent)) /
      100;
    const maxDiscount = normalizeVoucherNumber(voucher.maxDiscountAmount);

    return Math.min(
      applicableSubtotal,
      maxDiscount > 0 ? Math.min(rawDiscount, maxDiscount) : rawDiscount,
    );
  }

  return 0;
};

const getVoucherDiscountAmountFromItemAmounts = (
  voucher: OwnedVoucher | undefined,
  itemAmounts: VoucherItemAmount[],
) => {
  if (!voucher) return 0;

  return getVoucherDiscountAmountForSubtotal(
    voucher,
    getVoucherApplicableAmount(voucher, itemAmounts),
  );
};

const applyVoucherToItemAmounts = (
  voucher: OwnedVoucher,
  itemAmounts: VoucherItemAmount[],
) => {
  const applicableItems = new Set(
    getVoucherApplicableCartItems(
      voucher,
      itemAmounts.map((entry) => entry.item),
    ),
  );
  const applicableAmount = itemAmounts.reduce(
    (sum, entry) =>
      applicableItems.has(entry.item) ? sum + entry.amount : sum,
    0,
  );
  const discount = getVoucherDiscountAmountForSubtotal(
    voucher,
    applicableAmount,
  );

  if (discount <= 0 || applicableAmount <= 0) {
    return { discount: 0, itemAmounts };
  }

  let remainingDiscount = discount;
  let remainingApplicableAmount = applicableAmount;

  return {
    discount,
    itemAmounts: itemAmounts.map((entry) => {
      if (!applicableItems.has(entry.item) || entry.amount <= 0) {
        return entry;
      }

      const reduction =
        remainingApplicableAmount <= entry.amount
          ? remainingDiscount
          : (discount * entry.amount) / applicableAmount;
      const safeReduction = Math.min(entry.amount, reduction);
      remainingDiscount -= safeReduction;
      remainingApplicableAmount -= entry.amount;

      return {
        item: entry.item,
        amount: Math.max(0, entry.amount - safeReduction),
      };
    }),
  };
};

const isVoucherFreeShippingForShop = (
  voucher: OwnedVoucher | undefined,
  shopId: number,
  cartItems: CartItem[],
  itemAmounts?: VoucherItemAmount[],
) => {
  if (!voucher) return false;

  if (String(voucher.discountType ?? "").toUpperCase() !== "FREE_SHIPPING") {
    return false;
  }

  const applicableSubtotal = itemAmounts
    ? getVoucherApplicableAmount(voucher, itemAmounts)
    : getVoucherApplicableSubtotal(voucher, cartItems);
  const minOrderValue = normalizeVoucherNumber(voucher.minOrderValue);
  if (minOrderValue > 0 && applicableSubtotal < minOrderValue) {
    return false;
  }

  return getVoucherApplicableCartItems(voucher, cartItems).some(
    (item) => getCartItemShopId(item) === shopId,
  );
};

const getVoucherAvailability = (
  voucher: OwnedVoucher,
  cartItems: CartItem[],
  hasPreviousOrder: boolean,
  itemAmounts?: VoucherItemAmount[],
): VoucherAvailability => {
  const status = String(voucher.status ?? "").toUpperCase();
  if (status && status !== "CLAIMED") {
    return {
      voucher,
      isEligible: false,
      reason: "Already used or unavailable",
    };
  }

  const now = Date.now();
  if (voucher.validTo && new Date(voucher.validTo).getTime() < now) {
    return {
      voucher,
      isEligible: false,
      reason: "Expired",
    };
  }

  const applicableSubtotal = itemAmounts
    ? getVoucherApplicableAmount(voucher, itemAmounts)
    : getVoucherApplicableSubtotal(voucher, cartItems);
  if (applicableSubtotal <= 0) {
    return {
      voucher,
      isEligible: false,
      reason:
        String(voucher.issuerType ?? "").toUpperCase() === "SHOP"
          ? "Only applies to products from this shop"
          : "Does not match voucher scope",
    };
  }

  const minOrderValue = normalizeVoucherNumber(voucher.minOrderValue);
  if (minOrderValue > 0 && applicableSubtotal < minOrderValue) {
    return {
      voucher,
      isEligible: false,
      reason: `Min. eligible amount ${minOrderValue.toLocaleString("vi-VN")}d`,
    };
  }

  for (const rule of voucher.segmentRules) {
    const segmentType = String(rule.segmentType ?? "").toUpperCase();

    if (segmentType === "NEW_USER" || segmentType === "FIRST_ORDER") {
      if (hasPreviousOrder) {
        return {
          voucher,
          isEligible: false,
          reason: "Only for new users or first order",
        };
      }
    } else {
      return {
        voucher,
        isEligible: false,
        reason: `Unsupported segment rule: ${segmentType}`,
      };
    }
  }

  return {
    voucher,
    isEligible: true,
    reason: null,
  };
};

const getOrderCheckoutRefs = async (
  orderId: number,
): Promise<OrderCheckoutRefs> => {
  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load order shipments");
  }

  const data = await res.json();
  const shipments = Array.isArray(data?.shipments)
    ? data.shipments
    : Array.isArray(data?.order_shipment)
      ? data.order_shipment
      : [];

  const shipmentIdByShop = shipments.reduce(
    (map: Map<number, number>, shipment: any) => {
      const shopId = Number(shipment?.shopId ?? shipment?.shop_id ?? 0);
      const shipmentId = Number(
        shipment?.id ?? shipment?.shipmentId ?? shipment?.shipment_id ?? 0,
      );

      if (shopId > 0 && shipmentId > 0) {
        map.set(shopId, shipmentId);
      }

      return map;
    },
    new Map<number, number>(),
  );

  const items = Array.isArray(data?.items) ? data.items : [];
  const orderItemIdByKey = items.reduce(
    (map: Map<string, number>, item: any) => {
      const orderItemId = Number(item?.id ?? item?.orderItemId ?? 0);
      const shopId = Number(item?.shopId ?? item?.shop_id ?? 0);
      const productId = Number(item?.productId ?? item?.product_id ?? 0);
      const variantId = Number(item?.variantId ?? item?.variant_id ?? 0);

      if (orderItemId > 0 && shopId > 0 && productId > 0) {
        map.set(getOrderItemKey(shopId, productId, variantId), orderItemId);
      }

      return map;
    },
    new Map<string, number>(),
  );

  return {
    orderNumber: String(data?.orderNumber ?? data?.order_number ?? ""),
    shipmentIdByShop,
    orderItemIdByKey,
  };
};

const createVoucherUsageHistory = async (payload: {
  voucherId: number;
  userId: number;
  orderId: number;
  orderShipmentId: number;
  discountAmount: number;
}) => {
  const res = await fetch(`${API_URL}/api/voucher-usage-legacy`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create voucher usage history");
  }
};

const createVoucherRedemption = async (payload: {
  userVoucherId: number;
  voucherId: number;
  userId: number;
  orderId: number;
  orderCode: string;
  originalShippingFee: number;
  originalOrderAmount: number;
  discountAmountApplied: number;
  finalOrderAmount: number;
  status: string;
}) => {
  const res = await fetch(`${API_URL}/api/voucher-redemptions`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create voucher redemption");
  }

  return res.json();
};

const createVoucherRedemptionItem = async (payload: {
  voucherRedemptionId: number;
  orderItemId: number;
  discountAmount: number;
}) => {
  const res = await fetch(`${API_URL}/api/voucher-redemptions/items`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create voucher redemption item");
  }

  return res.json();
};

export default function CheckoutPage() {
  const { userId } = useUserAuth();
  const { data: addressesQuery } = useAddresses(userId || 0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingFees, setShippingFees] = useState<Record<number, number>>({});
  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(0);
  const [recipient, setRecipient] = useState<any>(null);
  const [ownedVouchers, setOwnedVouchers] = useState<OwnedVoucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [hasPreviousOrder, setHasPreviousOrder] = useState(false);
  const [selectedPlatformVoucherIds, setSelectedPlatformVoucherIds] = useState<
    number[]
  >([]);
  const [selectedShopVoucherIds, setSelectedShopVoucherIds] = useState<
    Record<number, number[]>
  >({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [backendVoucherCalculation, setBackendVoucherCalculation] =
    useState<BackendVoucherCalculation>(() =>
      createEmptyBackendVoucherCalculation(),
    );
  const [voucherCalculationLoading, setVoucherCalculationLoading] =
    useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const defaultAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses.find((a) => a.isDefault === 1) ||
    addresses[0];

  const hasAddress = Boolean(defaultAddress) && addresses.length > 0;

  useEffect(() => {
    async function mapAddresses() {
      if (addressesQuery && Array.isArray(addressesQuery)) {
        const mapped = await Promise.all(
          addressesQuery.map(async (addr: any) => {
            // Lấy tên district và ward qua hooks caching
            let districtName = "";
            let wardName = "";
            try {
              // Lấy danh sách district
              const districts = await fetchDistrictsByProvince(addr.city);
              const districtObj = districts.find(
                (d: any) => d.DistrictID === addr.district,
              );
              districtName = districtObj
                ? districtObj.DistrictName
                : `Quận ${addr.district}`;
            } catch {
              districtName = `Quận ${addr.district}`;
            }
            try {
              const wards = await fetchWardsByDistrict(addr.district);
              const wardObj = wards.find(
                (w: any) => Number(w.WardCode) === Number(addr.ward),
              );
              wardName = wardObj ? wardObj.WardName : `Phường ${addr.ward}`;
            } catch {
              wardName = `Phường ${addr.ward}`;
            }
            return {
              id: addr.addressId,
              name: addr.recipientName,
              phone: addr.recipientPhone,
              address:
                addr.addressLine +
                ", " +
                wardName +
                ", " +
                districtName +
                ", " +
                (cityMap[
                  String(addr.city) as unknown as keyof typeof cityMap
                ] || `TP ${addr.city}`),
              ward: addr.ward,
              district: addr.district,
              city: addr.city,
              isDefault: addr.isDefault, // giữ đúng giá trị từ API (1 là mặc định)
            };
          }),
        );
        setAddresses(mapped);
      }
    }
    mapAddresses();
  }, [addressesQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("selectedCartItems");
      setCartItems(raw ? (JSON.parse(raw) as CartItem[]) : []);
    } catch (error) {
      console.error("Failed to read selectedCartItems:", error);
      setCartItems([]);
    }
  }, []);

  // Group cart items by shop
  const groupedByShop = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        const shopId = item?.product?.shop?.id;
        if (!acc[shopId]) {
          acc[shopId] = {
            shop: item?.product?.shop,
            items: [],
          };
        }
        acc[shopId].items.push(item);
        return acc;
      },
      {} as Record<number, GroupedCartByShop & { items: CartItem[] }>,
    );
  }, [cartItems]);

  const hasOwnShopItems = useMemo(
    () =>
      cartItems.some((item) => {
        const sellerUserId = Number(
          item?.product?.shop?.userId ?? item?.product?.shop?.user_id ?? 0,
        );
        return (
          Boolean(userId) && sellerUserId > 0 && sellerUserId === Number(userId)
        );
      }),
    [cartItems, userId],
  );

  // Shipping options (có thể lấy từ API)
  const shippingOptions: ShippingOption[] = [
    {
      id: "standard",
      name: "Giao hàng Tiêu chuẩn",
      estimatedDays: "2-3 ngày làm việc",
      fee: 0,
    },
    {
      id: "fast",
      name: "Giao hàng Nhanh",
      estimatedDays: "1-2 ngày làm việc",
      fee: 25000,
    },
    {
      id: "express",
      name: "Giao hàng Express",
      estimatedDays: "Cùng ngày",
      fee: 50000,
    },
    {
      id: "normal",
      name: "Giao hàng LOGS",
      estimatedDays: "3-5 ngày làm việc",
      fee: 0,
      calculateFeeAPI: async (params: CalculateFeePayload) =>
        calculateFeeOfLOGS(params),
    },
  ];
  // State để lưu lựa chọn vận chuyển cho mỗi shop
  const [shippingSelections, setShippingSelections] =
    useState<ShippingSelection>({});

  const [shippingFeeLoading, setShippingFeeLoading] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const shopIds = Object.keys(groupedByShop).map(Number).filter(Boolean);

    if (shopIds.length === 0) {
      setShippingSelections({});
      return;
    }

    setShippingSelections((prev) => {
      let changed = false;
      const next: ShippingSelection = {};

      for (const shopId of shopIds) {
        next[shopId] = prev[shopId] || "standard";
        if (prev[shopId] !== next[shopId]) {
          changed = true;
        }
      }

      if (!changed && Object.keys(prev).length === shopIds.length) {
        return prev;
      }

      return next;
    });
  }, [groupedByShop]);

  // Hàm format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm lấy thông tin vận chuyển đã chọn
  const getSelectedShippingOption = (
    shopId: number,
    shippingOptionId: string,
  ) => {
    return shippingOptions.find((opt) => opt.id === shippingOptionId);
  };

  const getShippingFeeForShop = (shopId: number, shippingOptionId: string) => {
    const option = getSelectedShippingOption(shopId, shippingOptionId);
    if (!option) return 0;

    // Nếu option có calculateFeeAPI, dùng giá trị đã tính từ shippingFees
    if (option.calculateFeeAPI) {
      return shippingFees[shopId] ?? 0;
    }

    return option.fee || 0;
  };

  const isAnyShippingFeeLoading =
    Object.values(shippingFeeLoading).some(Boolean);

  // Tính tổng tiền sản phẩm
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.productVariant?.price ?? 0) * item.quantity,
      0,
    );
  };

  const voucherCalculationPayload = useMemo(
    () =>
      buildCheckoutVoucherCalculationPayload(
        Number(userId || 0),
        hasPreviousOrder,
        cartItems,
        selectedShopVoucherIds,
        selectedPlatformVoucherIds,
      ),
    [
      userId,
      hasPreviousOrder,
      cartItems,
      selectedShopVoucherIds,
      selectedPlatformVoucherIds,
    ],
  );

  const calculateCheckoutVouchersFromBackend = useCallback(async () => {
    if (!userId || cartItems.length === 0) {
      return createEmptyBackendVoucherCalculation(cartItems);
    }

    return requestCheckoutVoucherCalculation(
      voucherCalculationPayload,
      cartItems,
    );
  }, [cartItems, userId, voucherCalculationPayload]);

  useEffect(() => {
    let isActive = true;

    if (!userId || cartItems.length === 0) {
      setBackendVoucherCalculation(
        createEmptyBackendVoucherCalculation(cartItems),
      );
      setVoucherCalculationLoading(false);
      return () => {
        isActive = false;
      };
    }

    setVoucherCalculationLoading(true);
    calculateCheckoutVouchersFromBackend()
      .then((calculation) => {
        if (isActive) {
          setBackendVoucherCalculation(calculation);
        }
      })
      .catch((error) => {
        console.error("Checkout voucher calculation error:", error);
        if (isActive) {
          setBackendVoucherCalculation(
            createEmptyBackendVoucherCalculation(cartItems),
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setVoucherCalculationLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [calculateCheckoutVouchersFromBackend, cartItems, userId]);

  useEffect(() => {
    if (!userId) {
      setOwnedVouchers([]);
      setSelectedPlatformVoucherIds([]);
      setSelectedShopVoucherIds({});
      return;
    }

    const loadOwnedVouchers = async () => {
      setVoucherLoading(true);

      try {
        const [userVouchersRes, vouchersRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/api/user-vouchers/user/${userId}`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/vouchers`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/orders?userId=${userId}&page=1&size=1`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!userVouchersRes.ok || !vouchersRes.ok) {
          throw new Error("Failed to load vouchers");
        }

        const [userVouchersJson, vouchersJson, ordersJson] = await Promise.all([
          userVouchersRes.json(),
          vouchersRes.json(),
          ordersRes.ok ? ordersRes.json() : Promise.resolve(null),
        ]);

        const userVouchers = Array.isArray(userVouchersJson)
          ? userVouchersJson
          : [];
        const vouchers = Array.isArray(vouchersJson) ? vouchersJson : [];
        const voucherMap = new Map(
          vouchers.map((voucher: any) => [Number(voucher.id), voucher]),
        );

        const claimedVoucherPairs = userVouchers.map((item: any) => ({
          userVoucherId: Number(item.id ?? 0),
          voucherId: Number(item.voucherId ?? item.voucher_id ?? 0),
          claimedAt: item.claimedAt ?? item.claimed_at,
          status: item.status,
        }));

        const voucherRulesEntries = await Promise.all(
          claimedVoucherPairs.map(async ({ voucherId }) => {
            try {
              const rules = await getVoucherRules(String(voucherId));

              return [voucherId, rules] as [
                number,
                {
                  scopeRules: VoucherScopeRule[];
                  segmentRules: VoucherSegmentRule[];
                },
              ];
            } catch (error) {
              console.error("Load voucher rules error:", voucherId, error);

              return [
                voucherId,
                {
                  scopeRules: [],
                  segmentRules: [],
                },
              ] as [
                number,
                {
                  scopeRules: VoucherScopeRule[];
                  segmentRules: VoucherSegmentRule[];
                },
              ];
            }
          }),
        );

        const voucherRulesMap = new Map(voucherRulesEntries);

        const mappedVouchers: Array<OwnedVoucher | null> =
          claimedVoucherPairs.map(
            ({ userVoucherId, voucherId, claimedAt, status }) => {
              const voucher = voucherMap.get(voucherId);
              if (!voucher) return null;
              const rules = voucherRulesMap.get(voucherId) || {
                scopeRules: [],
                segmentRules: [],
              };

              return {
                userVoucherId,
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
                issuerId: voucher.issuerId ?? voucher.issuer_id,
                stackable: normalizeVoucherBoolean(
                  voucher.stackable ?? voucher.stackable_flag,
                ),
                status,
                claimedAt,
                scopeRules: rules.scopeRules,
                segmentRules: rules.segmentRules,
              } satisfies OwnedVoucher;
            },
          );

        const merged: OwnedVoucher[] = mappedVouchers
          .filter((item): item is OwnedVoucher => item !== null)
          .sort((a, b) => {
            const left = a.claimedAt ? new Date(a.claimedAt).getTime() : 0;
            const right = b.claimedAt ? new Date(b.claimedAt).getTime() : 0;
            return right - left;
          });

        setOwnedVouchers(merged);
        setHasPreviousOrder(Number(ordersJson?.totalRecords ?? 0) > 0);
      } catch (error) {
        console.error("Load checkout vouchers error:", error);
        setOwnedVouchers([]);
        setHasPreviousOrder(false);
      } finally {
        setVoucherLoading(false);
      }
    };

    loadOwnedVouchers();
  }, [userId]);

  const platformVouchers = useMemo(
    () =>
      ownedVouchers.filter(
        (voucher) =>
          String(voucher.issuerType ?? "").toUpperCase() === "PLATFORM",
      ),
    [ownedVouchers],
  );

  const shopVouchers = useMemo(
    () =>
      ownedVouchers.filter(
        (voucher) => String(voucher.issuerType ?? "").toUpperCase() === "SHOP",
      ),
    [ownedVouchers],
  );

  const shopVoucherAvailabilityByShop = useMemo(() => {
    return Object.keys(groupedByShop).reduce(
      (acc, shopIdStr) => {
        const shopId = Number(shopIdStr);
        acc[shopId] = shopVouchers
          .filter((voucher) =>
            getVoucherApplicableCartItems(voucher, cartItems).some(
              (item) => getCartItemShopId(item) === shopId,
            ),
          )
          .map((voucher) =>
            getVoucherAvailability(voucher, cartItems, hasPreviousOrder),
          );
        return acc;
      },
      {} as Record<number, VoucherAvailability[]>,
    );
  }, [groupedByShop, shopVouchers, cartItems, hasPreviousOrder]);

  const selectedPlatformVouchers = useMemo(() => {
    const voucherMap = new Map(
      platformVouchers.map((voucher) => [voucher.id, voucher]),
    );

    return selectedPlatformVoucherIds
      .map((voucherId) => voucherMap.get(voucherId))
      .filter((voucher): voucher is OwnedVoucher => Boolean(voucher));
  }, [selectedPlatformVoucherIds, platformVouchers]);

  const selectedShopVouchersByShop = useMemo(() => {
    const voucherMap = new Map(
      shopVouchers.map((voucher) => [voucher.id, voucher]),
    );

    return Object.entries(selectedShopVoucherIds).reduce(
      (acc, [shopIdStr, voucherIds]) => {
        const shopId = Number(shopIdStr);
        acc[shopId] = voucherIds
          .map((voucherId) => voucherMap.get(voucherId))
          .filter((voucher): voucher is OwnedVoucher => Boolean(voucher));
        return acc;
      },
      {} as Record<number, OwnedVoucher[]>,
    );
  }, [selectedShopVoucherIds, shopVouchers]);

  const shopVoucherCalculation = useMemo(() => {
    let itemAmounts = getInitialVoucherItemAmounts(cartItems);
    const discountByShop: Record<number, number> = {};

    Object.entries(selectedShopVouchersByShop).forEach(
      ([shopIdStr, vouchers]) => {
        const shopId = Number(shopIdStr);

        vouchers.forEach((voucher) => {
          const result = applyVoucherToItemAmounts(voucher, itemAmounts);
          itemAmounts = result.itemAmounts;
          discountByShop[shopId] =
            (discountByShop[shopId] || 0) + result.discount;
        });
      },
    );

    return {
      itemAmounts,
      discountByShop,
      totalDiscount: Object.values(discountByShop).reduce(
        (total, discount) => total + discount,
        0,
      ),
    };
  }, [cartItems, selectedShopVouchersByShop]);

  const platformVoucherAvailabilityList = useMemo(() => {
    return platformVouchers.map((voucher) =>
      getVoucherAvailability(
        voucher,
        cartItems,
        hasPreviousOrder,
        shopVoucherCalculation.itemAmounts,
      ),
    );
  }, [
    platformVouchers,
    cartItems,
    hasPreviousOrder,
    shopVoucherCalculation.itemAmounts,
  ]);

  const selectedRedeemableVouchers = useMemo(() => {
    const voucherMap = new Map<number, OwnedVoucher>();
    Object.values(selectedShopVouchersByShop).forEach((vouchers) => {
      vouchers.forEach((voucher) => voucherMap.set(voucher.id, voucher));
    });
    selectedPlatformVouchers.forEach((voucher) => {
      voucherMap.set(voucher.id, voucher);
    });
    return Array.from(voucherMap.values());
  }, [selectedPlatformVouchers, selectedShopVouchersByShop]);

  const backendVoucherItemByKey = useMemo(() => {
    return backendVoucherCalculation.items.reduce(
      (map, item) => map.set(item.itemKey, item),
      new Map<string, BackendVoucherItemBreakdown>(),
    );
  }, [backendVoucherCalculation.items]);

  const shopVoucherDiscountByShop =
    backendVoucherCalculation.shopVoucherDiscountByShop;
  const shopVoucherDiscount = backendVoucherCalculation.shopVoucherDiscount;
  const platformVoucherDiscount =
    backendVoucherCalculation.platformVoucherDiscount;
  const voucherDiscount = backendVoucherCalculation.totalVoucherDiscount;

  const getItemShopVoucherDiscount = useCallback(
    (item: CartItem) =>
      backendVoucherItemByKey.get(getCartItemOrderKey(item))
        ?.shopVoucherDiscountAmount || 0,
    [backendVoucherItemByKey],
  );

  const getItemTotalVoucherDiscount = useCallback(
    (item: CartItem) =>
      backendVoucherItemByKey.get(getCartItemOrderKey(item))
        ?.totalVoucherDiscountAmount || 0,
    [backendVoucherItemByKey],
  );

  const handleApplyPlatformVoucherIds = (voucherIds: number[]) => {
    const nextVouchers = voucherIds
      .map((voucherId) =>
        platformVouchers.find((voucher) => voucher.id === voucherId),
      )
      .filter((voucher): voucher is OwnedVoucher => Boolean(voucher));
    const nonStackableVoucher = [...nextVouchers]
      .reverse()
      .find((voucher) => !voucher.stackable);

    if (nonStackableVoucher) {
      setSelectedPlatformVoucherIds([nonStackableVoucher.id]);
      return;
    }

    setSelectedPlatformVoucherIds(nextVouchers.map((voucher) => voucher.id));
  };

  // Lưu voucher theo đúng thứ tự apply (voucher nào apply trước thì nằm trước)
  const handleApplyShopVoucherIds = (shopId: number, voucherIds: number[]) => {
    setSelectedShopVoucherIds((current) => {
      const prev = current[shopId] || [];
      // Giữ lại thứ tự voucherIds truyền vào, loại bỏ trùng lặp, voucher nào apply trước nằm trước
      const uniqueVoucherIds = voucherIds.filter(
        (id, idx) => voucherIds.indexOf(id) === idx,
      );
      // Nếu có voucher không stackable, chỉ giữ lại voucher đó (ưu tiên voucher apply sau cùng)
      const shopVoucherPool = (shopVoucherAvailabilityByShop[shopId] || []).map(
        (item) => item.voucher,
      );
      const nonStackableVoucher = [...uniqueVoucherIds]
        .reverse()
        .map((id) => shopVoucherPool.find((v) => v.id === id))
        .find((voucher) => voucher && !voucher.stackable);
      return {
        ...current,
        [shopId]: nonStackableVoucher
          ? [nonStackableVoucher.id]
          : uniqueVoucherIds,
      };
    });
  };
  // Snapshot giá trị đơn hàng sau mỗi lần áp dụng voucher theo thứ tự apply
  const voucherPriceSnapshotsByShop = useMemo(() => {
    const snapshots: Record<number, number[]> = {};
    Object.entries(selectedShopVouchersByShop).forEach(
      ([shopIdStr, vouchers]) => {
        const shopId = Number(shopIdStr);
        let itemAmounts = getInitialVoucherItemAmounts(
          cartItems.filter((item) => getCartItemShopId(item) === shopId),
        );
        const shopSnapshots: number[] = [];
        vouchers.forEach((voucher) => {
          const result = applyVoucherToItemAmounts(voucher, itemAmounts);
          // Tính tổng tiền còn lại sau khi áp dụng voucher này
          const totalAfterVoucher = result.itemAmounts.reduce(
            (sum, entry) => sum + entry.amount,
            0,
          );
          shopSnapshots.push(totalAfterVoucher);
          itemAmounts = result.itemAmounts;
        });
        snapshots[shopId] = shopSnapshots;
      },
    );
    return snapshots;
  }, [selectedShopVouchersByShop, cartItems]);

  const handleClearShopVouchers = (shopId: number) => {
    setSelectedShopVoucherIds((current) => ({
      ...current,
      [shopId]: [],
    }));
  };

  const getShopVoucherDiscount = (shopId: number) =>
    shopVoucherDiscountByShop[shopId] || 0;

  const isShippingFreeByVoucherForShop = (shopId: number) =>
    selectedPlatformVouchers.some((voucher) =>
      isVoucherFreeShippingForShop(
        voucher,
        shopId,
        cartItems,
        shopVoucherCalculation.itemAmounts,
      ),
    ) ||
    (selectedShopVouchersByShop[shopId] || []).some((voucher) =>
      isVoucherFreeShippingForShop(voucher, shopId, cartItems),
    );

  const getEffectiveShippingFeeForShop = (
    shopId: number,
    shippingOptionId: string,
  ) =>
    isShippingFreeByVoucherForShop(shopId)
      ? 0
      : getShippingFeeForShop(shopId, shippingOptionId);

  const effectiveShippingFee = useMemo(() => {
    return Object.entries(shippingSelections).reduce(
      (total, [shopId, optionId]) => {
        const numericShopId = Number(shopId);
        return total + getEffectiveShippingFeeForShop(numericShopId, optionId);
      },
      0,
    );
  }, [
    selectedPlatformVouchers,
    selectedShopVouchersByShop,
    shopVoucherCalculation.itemAmounts,
    shippingSelections,
    cartItems,
  ]);

  const voucherUsageDrafts = useMemo(() => {
    const drafts: VoucherUsageDraft[] = [];

    const pushUsage = (
      voucherId: number,
      shopId: number,
      discountAmount: number,
    ) => {
      if (shopId <= 0 || voucherId <= 0) return;

      drafts.push({
        voucherId,
        shopId,
        discountAmount: Math.max(0, Math.round(discountAmount)),
      });
    };

    backendVoucherCalculation.voucherApplications.forEach((application) => {
      Object.entries(application.discountByShop).forEach(
        ([shopIdStr, discountAmount]) => {
          pushUsage(application.voucherId, Number(shopIdStr), discountAmount);
        },
      );
    });

    Object.entries(selectedShopVouchersByShop).forEach(
      ([shopIdStr, vouchers]) => {
        const shopId = Number(shopIdStr);

        vouchers.forEach((voucher) => {
          if (
            isVoucherFreeShippingForShop(
              voucher,
              shopId,
              cartItems,
              shopVoucherCalculation.itemAmounts,
            )
          ) {
            pushUsage(
              voucher.id,
              shopId,
              getShippingFeeForShop(shopId, shippingSelections[shopId]),
            );
          }

          if (
            String(voucher.discountType ?? "").toUpperCase() === "GIFT_ITEM"
          ) {
            pushUsage(voucher.id, shopId, 0);
          }
        });
      },
    );

    selectedPlatformVouchers.forEach((voucher) => {
      const shopIds = Array.from(
        new Set(cartItems.map((item) => getCartItemShopId(item))),
      ).filter((shopId) => shopId > 0);

      shopIds.forEach((shopId) => {
        if (
          isVoucherFreeShippingForShop(
            voucher,
            shopId,
            cartItems,
            shopVoucherCalculation.itemAmounts,
          )
        ) {
          pushUsage(
            voucher.id,
            shopId,
            getShippingFeeForShop(shopId, shippingSelections[shopId]),
          );
        }
      });

      if (String(voucher.discountType ?? "").toUpperCase() === "GIFT_ITEM") {
        shopIds.forEach((shopId) => {
          const hasApplicableItem = getVoucherApplicableCartItems(
            voucher,
            cartItems,
          ).some((item) => getCartItemShopId(item) === shopId);

          if (hasApplicableItem) {
            pushUsage(voucher.id, shopId, 0);
          }
        });
      }
    });

    return drafts;
  }, [
    cartItems,
    backendVoucherCalculation.voucherApplications,
    shopVoucherCalculation.itemAmounts,
    selectedShopVouchersByShop,
    selectedPlatformVouchers,
    shippingSelections,
  ]);

  const voucherRedemptionDrafts = useMemo(() => {
    const draftMap = new Map<number, VoucherRedemptionDraft>();
    const voucherMap = new Map(
      selectedRedeemableVouchers.map((voucher) => [voucher.id, voucher]),
    );

    const getDraft = (voucher: OwnedVoucher) => {
      let draft = draftMap.get(voucher.id);
      if (!draft) {
        draft = {
          voucher,
          discountAmount: 0,
          itemDiscounts: [],
        };
        draftMap.set(voucher.id, draft);
      }
      return draft;
    };

    backendVoucherCalculation.voucherApplications.forEach((application) => {
      const voucher = voucherMap.get(application.voucherId);
      if (!voucher) return;

      const draft = getDraft(voucher);
      draft.discountAmount = toMoneyAmount(
        draft.discountAmount + application.discountAmount,
      );
      draft.itemDiscounts.push(
        ...application.itemDiscounts.filter(
          (itemDiscount) =>
            itemDiscount.itemKey && itemDiscount.discountAmount > 0,
        ),
      );
    });

    const addVoucherDiscount = (
      voucher: OwnedVoucher,
      discountAmount: number,
    ) => {
      if (voucher.id <= 0 || discountAmount <= 0) return;
      const draft = getDraft(voucher);
      draft.discountAmount = toMoneyAmount(
        draft.discountAmount + discountAmount,
      );
    };

    Object.entries(selectedShopVouchersByShop).forEach(
      ([shopIdStr, vouchers]) => {
        const shopId = Number(shopIdStr);

        vouchers.forEach((voucher) => {
          if (
            isVoucherFreeShippingForShop(
              voucher,
              shopId,
              cartItems,
              shopVoucherCalculation.itemAmounts,
            )
          ) {
            addVoucherDiscount(
              voucher,
              getShippingFeeForShop(shopId, shippingSelections[shopId]),
            );
          }

          if (
            String(voucher.discountType ?? "").toUpperCase() === "GIFT_ITEM"
          ) {
            getDraft(voucher);
          }
        });
      },
    );

    selectedPlatformVouchers.forEach((voucher) => {
      const shopIds = Array.from(
        new Set(cartItems.map((item) => getCartItemShopId(item))),
      ).filter((shopId) => shopId > 0);

      shopIds.forEach((shopId) => {
        if (
          isVoucherFreeShippingForShop(
            voucher,
            shopId,
            cartItems,
            shopVoucherCalculation.itemAmounts,
          )
        ) {
          addVoucherDiscount(
            voucher,
            getShippingFeeForShop(shopId, shippingSelections[shopId]),
          );
        }
      });

      if (String(voucher.discountType ?? "").toUpperCase() === "GIFT_ITEM") {
        const hasApplicableItem =
          getVoucherApplicableCartItems(voucher, cartItems).length > 0;

        if (hasApplicableItem) {
          getDraft(voucher);
        }
      }
    });

    return Array.from(draftMap.values()).filter(
      (draft) =>
        draft.voucher.userVoucherId > 0 &&
        (draft.discountAmount > 0 ||
          draft.itemDiscounts.length > 0 ||
          String(draft.voucher.discountType ?? "").toUpperCase() ===
            "GIFT_ITEM"),
    );
  }, [
    cartItems,
    backendVoucherCalculation.voucherApplications,
    selectedRedeemableVouchers,
    shopVoucherCalculation.itemAmounts,
    selectedShopVouchersByShop,
    selectedPlatformVouchers,
    shippingSelections,
  ]);

  const finalTotal = Math.max(
    0,
    calculateSubtotal() - voucherDiscount + effectiveShippingFee,
  );

  useEffect(() => {
    if (selectedPlatformVoucherIds.length === 0) return;

    const usableIds = selectedPlatformVoucherIds.filter((voucherId) =>
      platformVoucherAvailabilityList.some(
        (item) => item.isEligible && item.voucher.id === voucherId,
      ),
    );

    if (usableIds.length !== selectedPlatformVoucherIds.length) {
      setSelectedPlatformVoucherIds(usableIds);
    }
  }, [selectedPlatformVoucherIds, platformVoucherAvailabilityList]);

  useEffect(() => {
    setSelectedShopVoucherIds((current) => {
      let changed = false;
      const next = { ...current };

      Object.entries(current).forEach(([shopIdStr, voucherIds]) => {
        if (voucherIds.length === 0) return;
        const shopId = Number(shopIdStr);
        const usableIds = voucherIds.filter((voucherId) =>
          (shopVoucherAvailabilityByShop[shopId] || []).some(
            (item) => item.isEligible && item.voucher.id === voucherId,
          ),
        );

        if (usableIds.length !== voucherIds.length) {
          next[shopId] = usableIds;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [shopVoucherAvailabilityByShop]);
  const [paymentInfo, setPaymentInfo] = useState<any>({
    amount: finalTotal,
    orderId: Date.now(),
    user_id: Number(userId || 0),
    method: "COD",
    bankCode: "NCB",
    orderInfo: "Thanh toán đơn hàng #123456" + Date.now(),
  });

  // Đồng bộ paymentInfo.amount mỗi khi phí ship hoặc voucher thay đổi
  useEffect(() => {
    setPaymentInfo((prev: any) => ({
      ...prev,
      amount: finalTotal,
      user_id: Number(userId || 0),
    }));
  }, [finalTotal, userId]);

  const stepNumberBase: React.CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 800,
    flexShrink: 0,
  };

  const cardBase: React.CSSProperties = {
    background: "white",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    borderLeft: "4px solid",
    padding: 16,
    overflow: "hidden",
  };

  const styles: Record<string, React.CSSProperties> = {
    cardDefault: { ...cardBase, borderLeftColor: "#e2e8f0" },
    cardCompleted: {
      ...cardBase,
      borderLeftColor: "#22c55e",
      background: "rgba(34,197,94,0.04)",
    },
    cardActive: {
      ...cardBase,
      borderLeftColor: "#137fec",
      boxShadow:
        "0 4px 12px rgba(19,127,236,0.12), 0 0 0 1px rgba(19,127,236,0.15)",
    },
    stepDone: {
      ...stepNumberBase,
      borderColor: "#22c55e",
      background: "#22c55e",
      color: "white",
    },
    stepActive: { ...stepNumberBase, borderColor: "#137fec", color: "#137fec" },
    stepPending: {
      ...stepNumberBase,
      borderColor: "#cbd5e1",
      color: "#94a3b8",
    },
    stepTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8 },
    shippingBox: {
      background: "white",
      border: "1px solid #f1f5f9",
      borderRadius: 8,
      padding: "10px 14px",
    },
    paymentBox: {
      background: "#f8fafc",
      border: "1px solid #f1f5f9",
      borderRadius: 12,
      padding: 16,
    },
    paymentIconBox: {
      width: 48,
      height: 48,
      background: "white",
      borderRadius: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    linkPrimary: {
      color: "#137fec",
      fontSize: 10,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      textDecoration: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      whiteSpace: "nowrap",
    },
    btnPrimary: {
      background: "#137fec",
      color: "white",
      fontWeight: 800,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "12px 24px",
      borderRadius: 8,
      border: "none",
      boxShadow: "0 4px 14px rgba(19,127,236,0.25)",
      cursor: "pointer",
    },
    btnSecondary: {
      background: "white",
      color: "#475569",
      fontWeight: 800,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      padding: "12px 24px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      cursor: "pointer",
    },
    productImg: {
      width: 80,
      height: 80,
      borderRadius: 8,
      border: "1px solid #f1f5f9",
      objectFit: "cover",
      background: "#f8fafc",
      flexShrink: 0,
    },
    qtyBadge: {
      fontSize: 10,
      fontWeight: 700,
      background: "#f1f5f9",
      color: "#475569",
      padding: "2px 8px",
      borderRadius: 4,
    },
    reviewNote: {
      border: "1px dashed #e2e8f0",
      borderRadius: 8,
      background: "rgba(248,250,252,0.5)",
      padding: 12,
      textAlign: "center",
    },
    summaryCard: {
      background: "white",
      borderRadius: 12,
      boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
      border: "1px solid #f1f5f9",
      overflow: "hidden",
    },
    summaryHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid #f8fafc",
    },
    itemsBadge: {
      background: "#f1f5f9",
      color: "#64748b",
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      padding: "2px 8px",
      borderRadius: 4,
    },
    couponInput: {
      background: "#f8fafc",
      border: "none",
      borderRadius: 8,
      padding: "12px 70px 12px 16px",
      fontSize: 12,
      width: "100%",
      outline: "none",
      color: "#0f172a",
    },
    couponApply: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#137fec",
      fontWeight: 800,
      fontSize: 12,
      textTransform: "uppercase",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
    },
    btnOrder: {
      width: "100%",
      background: "#137fec",
      color: "white",
      fontWeight: 800,
      fontSize: 14,
      border: "none",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 4px 14px rgba(19,127,236,0.25)",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      lineHeight: 1.2,
    },
    infoNote: {
      background: "rgba(241,245,249,0.5)",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: 14,
    },
    // Modal styles
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.55)",
      backdropFilter: "blur(2px)",
      zIndex: 2000, // raised above typical navbar z-index
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    modal: {
      background: "white",
      borderRadius: 16,
      width: "100%",
      maxWidth: 480,
      boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "20px 24px 16px",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    inputLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: "#64748B",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    },
    input: {
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 13,
      outline: "none",
      color: "#0f172a",
      width: "100%",
      transition: "border-color 0.15s",
    },
    inputIcon: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
    },
    // Address list item
    addressItem: {
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      padding: "12px 14px",
      cursor: "pointer",
      transition: "all 0.15s",
      position: "relative",
    },
    addressItemSelected: {
      border: "1.5px solid #137fec",
      borderRadius: 10,
      padding: "12px 14px",
      cursor: "pointer",
      background: "rgba(19,127,236,0.04)",
      position: "relative",
    },
  };

  useEffect(() => {
    if (defaultAddress) {
      setRecipient({
        name: defaultAddress.name,
        phone: defaultAddress.phone,
        address: defaultAddress.address,
      });
    }
  }, [selectedAddressId, addresses]);

  const handleConfirmPayment = (method: string) => {
    setPaymentInfo((prev: any) => ({ ...prev, method }));
    alert(`Xac nhan thanh toan bang: ${method.toUpperCase()}`);
  };
  const handlePaymentMethodChange = (method: string) => {
    setPaymentInfo((prev: any) => ({ ...prev, method }));
  };

  const handleShippingOptionChange = async (
    shopId: number,
    optionId: string,
  ) => {
    if (!hasAddress || !defaultAddress) {
      message.warning(
        "Vui lòng thêm địa chỉ nhận hàng trước khi chọn vận chuyển.",
      );
      setShowAddressPanel(true);
      return;
    }

    // alert(
    //   `Địa chỉ măc định: ${defaultAddress?.address}\nĐang chọn phương thức vận chuyển...`,
    // );
    const shopAddress = await getAddressByShopId(shopId);
    // alert(
    //   `Địa chỉ shop: ${shopAddress.addressLine}, Địa chỉ nhận hàng: ${defaultAddress?.address}\nĐang chọn phương thức vận chuyển...`,
    // );
    setShippingSelections((prev) => ({
      ...prev,
      [shopId]: optionId,
    }));

    const selectedOption = shippingOptions.find((opt) => opt.id === optionId);

    if (selectedOption?.calculateFeeAPI) {
      setShippingFeeLoading((prev) => ({
        ...prev,
        [shopId]: true,
      }));

      const logisticsItems = cartItems
        .filter((item) => item?.product?.shop?.id === shopId)
        .map((item) => ({
          name: item.productVariant?.variantName || item.product?.name || "",
          quantity: item.quantity,
          height: item.height || 0,
          width: item.width || 0,
          weight: item.weight || 0,
          length: item.length || 0,
        }));

      console.log("Calculating fee with logistics items:", logisticsItems);

      selectedOption
        .calculateFeeAPI({
          from_district_id: shopAddress?.district || 0, // giả sử lấy từ địa chỉ đầu tiên (cần điều chỉnh nếu có nhiều địa chỉ)
          from_ward_code: shopAddress?.ward ? String(shopAddress.ward) : "", // giả sử lấy từ địa chỉ đầu tiên
          // service_id: 53320,
          //service_type_id: 5,
          service_type_id: 5,
          to_district_id: defaultAddress?.district || 0,
          to_ward_code: defaultAddress?.ward ? String(defaultAddress.ward) : "",
          height: logisticsItems[0]?.height || 0,
          length: logisticsItems[0]?.length || 0,
          weight: logisticsItems[0]?.weight || 0,
          width: logisticsItems[0]?.width || 0,
          insurance_value: 1000,
          cod_failed_amount: 0,
          coupon: null,
          items: logisticsItems,
        })
        .then((fee) => {
          console.log(
            "Calculated fee:",
            fee,
            "for shopId:",
            shopId,
            "with option:",
            selectedOption,
          );
          setShippingFees((prev) => ({
            ...prev,
            [shopId]: fee,
          }));
          message.info(
            `Đã chọn: ${selectedOption.name} (${selectedOption.estimatedDays}) - ${formatCurrency(fee || 0)}`,
          );
        })
        .catch(() => {
          message.error("Khong the tinh phi van chuyen. Vui long thu lai.");
        })
        .finally(() => {
          setShippingFeeLoading((prev) => ({
            ...prev,
            [shopId]: false,
          }));
        });
      return;
    }

    setShippingFeeLoading((prev) => ({
      ...prev,
      [shopId]: false,
    }));
    message.info(
      `Đã chọn: ${selectedOption?.name} (${selectedOption?.estimatedDays}) - ${
        selectedOption?.fee === 0
          ? "Miễn phí"
          : formatCurrency(selectedOption?.fee || 0)
      }`,
    );
  };

  const handleOrder = async () => {
    // alert(JSON.stringify(voucherPriceSnapshotsByShop));
    // return;
    setIsOrderLoading(true);
    if (hasOwnShopItems) {
      message.warning("Bạn không thể mua sản phẩm của chính shop mình.");
      setIsOrderLoading(false);
      return;
    }
    // alert("Address id: " + selectedAddressId);
    //alert("Đặt hàng thành công!")
    if (!hasAddress || !recipient) {
      message.warning("Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.");
      setShowAddressPanel(true);
      setIsOrderLoading(false);
      return;
    }

    const uniqueShopIds: number[] = [
      ...new Set(cartItems.map((item) => item?.product?.shop?.id || 0)),
    ].filter((shopId): shopId is number => Number(shopId) > 0);

    let orderVoucherCalculation: BackendVoucherCalculation;
    try {
      orderVoucherCalculation = await calculateCheckoutVouchersFromBackend();
      setBackendVoucherCalculation(orderVoucherCalculation);
    } catch (error) {
      console.error("Checkout voucher calculation before order failed:", error);
      message.error("Không thể tính voucher từ backend. Vui lòng thử lại.");
      setIsOrderLoading(false);
      return;
    }

    const orderVoucherItemByKey = new Map(
      orderVoucherCalculation.items.map((item) => [item.itemKey, item]),
    );
    const getOrderItemVoucherBreakdown = (item: CartItem) =>
      orderVoucherItemByKey.get(getCartItemOrderKey(item));
    const getOrderShopVoucherDiscount = (shopId: number) =>
      orderVoucherCalculation.shopVoucherDiscountByShop[String(shopId)] || 0;
    const orderVoucherDiscount = orderVoucherCalculation.totalVoucherDiscount;
    const orderFinalTotal = Math.max(
      0,
      calculateSubtotal() - orderVoucherDiscount + effectiveShippingFee,
    );
    // alert(
    //   `Thông tin thanh toán:\nSố tiền: ${orderFinalTotal}\nPhương thức: ${paymentInfo.method}\nMã đơn hàng: ${paymentInfo.orderId}`,
    // );

    const baseTrackingSeed = Date.now();
    const ordersShipment: IOrderShipment[] = uniqueShopIds.map(
      (shopId, index) => {
        const shopCartItems = cartItems.filter(
          (item) => item?.product?.shop?.id === shopId,
        );
        const shopShippingFee = getEffectiveShippingFeeForShop(
          shopId,
          shippingSelections[shopId],
        );
        const shopSubtotal = shopCartItems.reduce(
          (sum, item) =>
            sum + (item.productVariant?.price || 0) * item.quantity,
          0,
        );
        const shopVoucherDiscount = getOrderShopVoucherDiscount(shopId);

        return {
          id: 0,
          orderId: 0,
          shop_id: shopId,
          shipmentId: 0,
          shipmentCode: `SHIP-${baseTrackingSeed}-${index + 1}`,
          shipping_fee: shopShippingFee,
          subtotal: shopSubtotal,
          total_amount: Math.max(
            0,
            shopSubtotal - shopVoucherDiscount + shopShippingFee,
          ),
          carrier_name: "LOG",
          tracking_number: `TRK-${baseTrackingSeed}-${shopId}`,
          shipping_status: "PENDING",
          order: {} as any,
          recipient: recipient || null,
          items: shopCartItems.map((item) => ({
            id: 0,
            productId: item?.product?.id || 0,
            variantId: item?.productVariant?.id || 0,
            productName: item?.product?.name || "",
            variantName: item?.productVariant?.variantName || "",
            quantity: item?.quantity || 0,
            price: item?.productVariant?.price || 0,
            imageUrl: item?.productVariant?.imageUrl || "",
            image: item?.productVariant?.imageUrl || "",
            totalPrice:
              (item?.productVariant?.price || 0) * (item?.quantity || 0),
          })),
        };
      },
    );
    // alert("Orders Shipment:\n" + JSON.stringify(ordersShipment, null, 2));
    // alert(
    //   `Thông tin vận chuyển:\n${ordersShipment
    //     .map(
    //       (s) =>
    //         `Shop ${s.shop_id}: Phí ${formatCurrency(s.shipping_fee)}, Tổng ${formatCurrency(
    //           s.total_amount,
    //         )}, Mã vận đơn ${s.tracking_number}`,
    //     )
    //     .join("\n")}`,
    // );
    //return;

    const orderItems: IOrderItem[] = await Promise.all(
      cartItems.map(async (item) => {
        const user_id = Number(
          item?.product?.shop?.userId ?? item?.product?.shop?.user_id ?? 0,
        );
        let userInfo: any = null;
        if (user_id > 0) {
          userInfo = await getUserInfoById(user_id);
        }
        return {
          id: item?.id || 0,
          product_id: item?.product?.id || 0,
          shop_id: item?.product?.shop?.id || 0,
          order_id: 1,
          shop: {
            id: item?.product?.shop?.id || 0,
            shop_name: item?.product?.shop?.shopName || "",
            api_key: item?.product?.shop?.shopName.toUpperCase() + "_API_KEY",
            contact_email: userInfo?.email || "",
            phone: userInfo?.phone || "",
          },
          variant_id: item?.productVariant?.id || 0,
          product_name: item?.product?.name || "",
          variant_name: item?.productVariant?.variantName || "",
          quantity: item?.quantity || 0,

          price: item?.productVariant?.price || 0,
          image_url: item?.productVariant?.imageUrl || "",
        };
      }),
    );

    const orderItemsPayload = orderItems.map((item, index) => {
      const cartItem = cartItems[index];
      const itemSubtotal = Number(item.price || 0) * Number(item.quantity || 0);
      const voucherBreakdown = cartItem
        ? getOrderItemVoucherBreakdown(cartItem)
        : undefined;
      const shopVoucherItemDiscount = Math.min(
        itemSubtotal,
        Math.max(0, voucherBreakdown?.shopVoucherDiscountAmount || 0),
      );
      const totalVoucherItemDiscount = Math.min(
        itemSubtotal,
        Math.max(0, voucherBreakdown?.totalVoucherDiscountAmount || 0),
      );
      const platformVoucherItemDiscount = Math.max(
        0,
        totalVoucherItemDiscount - shopVoucherItemDiscount,
      );
      const totalAfterShopVoucher = toMoneyAmount(
        Math.min(
          itemSubtotal,
          Math.max(
            0,
            voucherBreakdown?.totalAfterShopVoucher ??
              itemSubtotal - shopVoucherItemDiscount,
          ),
        ),
      );
      const totalAfterAllVouchers = toMoneyAmount(
        Math.min(
          itemSubtotal,
          Math.max(
            0,
            voucherBreakdown?.totalAfterAllVouchers ??
              itemSubtotal - totalVoucherItemDiscount,
          ),
        ),
      );
      const platformCommissionRate =
        voucherBreakdown?.platformCommissionRate || PLATFORM_COMMISSION_RATE;
      const platformCommissionAmount = toMoneyAmount(
        voucherBreakdown?.platformCommissionAmount ??
          totalAfterShopVoucher * platformCommissionRate,
      );
      const sellerReceivableAmount = toMoneyAmount(
        voucherBreakdown?.sellerReceivableAmount ??
          Math.max(0, totalAfterShopVoucher - platformCommissionAmount),
      );

      return {
        id: Number(item.id || 0),
        order_id: Number((item as any).order_id || 0),
        shop_id: Number((item as any).shop_id || 0),
        product_id: Number(item.product_id || 0),
        variant_id: Number(item.variant_id || 0),
        product_name: item.product_name || "",
        variant_name: item.variant_name || "",
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        image_url: item.image_url || "",
        shop_voucher_discount_amount: shopVoucherItemDiscount,
        platform_voucher_discount_amount: platformVoucherItemDiscount,
        total_voucher_discount_amount: totalVoucherItemDiscount,
        total_after_shop_voucher: totalAfterShopVoucher,
        total_after_all_vouchers: totalAfterAllVouchers,
        platform_commission_rate: platformCommissionRate,
        platform_commission_amount: platformCommissionAmount,
        seller_receivable_amount: sellerReceivableAmount,
      };
    });

    // alert(selectedShopVoucherIds);

    const orderShipmentPayload = ordersShipment.map((shipment) => ({
      order_id: Number(shipment.orderId || (shipment as any).order_id || 0),
      shop_id: Number(shipment.shop_id || 0),
      carrier_name: shipment.carrier_name || "LOG",
      shipping_fee: Number(shipment.shipping_fee || 0),
      total_amount: Number(shipment.total_amount || 0),
      tracking_number: shipment.tracking_number || "",
      voucher_id: selectedShopVoucherIds[shipment.shop_id],
      shipping_status: shipment.shipping_status || "PENDING",
      // Thêm giá tổng cộng trước giảm và sau giảm cho từng shipment
      subtotal: (() => {
        // Tính tổng tiền sản phẩm của shop này
        return cartItems
          .filter((item) => item?.product?.shop?.id === shipment.shop_id)
          .reduce(
            (sum, item) =>
              sum + (item.productVariant?.price || 0) * (item.quantity || 0),
            0,
          );
      })(),
      total_after_voucher: (() => {
        // Tính tổng tiền sau giảm voucher cho shop này
        const breakdown = orderVoucherCalculation.items.filter(
          (item) => item.shopId === shipment.shop_id,
        );
        return breakdown.reduce(
          (sum, item) => sum + (item.totalAfterAllVouchers || 0),
          0,
        );
      })(),
    }));

    const primaryVoucher = selectedRedeemableVouchers[0];

    const orderPayload = {
      user_id: Number(userId || paymentInfo.user_id || 0),
      recipient: defaultAddress
        ? {
            name: defaultAddress.name,
            phone: defaultAddress.phone,
            address: defaultAddress.address,
            province: Number(defaultAddress.city || 0),
            district: Number(defaultAddress.district || 0),
            ward: Number(defaultAddress.ward || 0),
          }
        : {},
      order_number: "ORD20250318001",
      total_price: calculateSubtotal(),
      payment_method: String(paymentInfo.method || "COD").toUpperCase(),
      address_id: Number(defaultAddress?.id || selectedAddressId || 0),
      shipping_fee: effectiveShippingFee,
      discount_amount: orderVoucherDiscount,
      final_amount: orderFinalTotal,
      voucher_id: primaryVoucher?.id || 0,
      orders_items: orderItemsPayload,
      order_shipment: orderShipmentPayload,
      tracking_number: "",
      id: 0,
      // Additional fields for testing rollback
      // Uncomment the line below to simulate a rollback scenario
      //cancel_reason: "SIMULATE_ROLLBACK",
    };

    const selectedVoucherMap = new Map(
      selectedRedeemableVouchers.map((voucher) => [voucher.id, voucher]),
    );
    const backendVoucherUsageDrafts =
      orderVoucherCalculation.voucherApplications.flatMap((application) =>
        Object.entries(application.discountByShop)
          .map(([shopIdStr, discountAmount]) => ({
            voucherId: application.voucherId,
            shopId: Number(shopIdStr),
            discountAmount: Math.max(0, Math.round(discountAmount)),
          }))
          .filter(
            (usage) =>
              usage.voucherId > 0 &&
              usage.shopId > 0 &&
              usage.discountAmount > 0,
          ),
      );
    const backendUsageVoucherIds = new Set(
      backendVoucherUsageDrafts.map((usage) => usage.voucherId),
    );
    const orderVoucherUsageDrafts = [
      ...backendVoucherUsageDrafts,
      ...voucherUsageDrafts.filter(
        (usage) => !backendUsageVoucherIds.has(usage.voucherId),
      ),
    ];

    const backendVoucherRedemptionDrafts =
      orderVoucherCalculation.voucherApplications
        .map((application): VoucherRedemptionDraft | null => {
          const voucher = selectedVoucherMap.get(application.voucherId);
          if (!voucher) return null;

          return {
            voucher,
            discountAmount: application.discountAmount,
            itemDiscounts: application.itemDiscounts.filter(
              (itemDiscount) =>
                itemDiscount.itemKey && itemDiscount.discountAmount > 0,
            ),
          };
        })
        .filter((draft): draft is VoucherRedemptionDraft => Boolean(draft));
    const backendRedemptionVoucherIds = new Set(
      backendVoucherRedemptionDrafts.map((draft) => draft.voucher.id),
    );
    const orderVoucherRedemptionDrafts = [
      ...backendVoucherRedemptionDrafts,
      ...voucherRedemptionDrafts.filter(
        (draft) => !backendRedemptionVoucherIds.has(draft.voucher.id),
      ),
    ];

    createOrder(orderPayload as any)
      .then(async (dt) => {
        const isCODPayment =
          String(paymentInfo.method || "COD").toUpperCase() === "COD";
        const codProcessingNoticeKey = "checkout-cod-processing";
        const codProcessingNoticeTimer = isCODPayment
          ? window.setTimeout(() => {
              message.open({
                key: codProcessingNoticeKey,
                type: "info",
                content: "Vui lòng đợi, quá trình thanh toán đang xử lý",
                duration: 0,
              });
            }, 3000)
          : null;
        const clearCodProcessingNotice = () => {
          if (codProcessingNoticeTimer !== null) {
            window.clearTimeout(codProcessingNoticeTimer);
          }
          message.destroy(codProcessingNoticeKey);
        };

        try {
          const orderId = Number(dt.id || dt.orderId || 0);
          message.success(`Đặt hàng thành công! Mã đơn hàng: ${orderId}`);

          const cleanupTasks: Promise<unknown>[] = [];

          if (
            orderId > 0 &&
            (orderVoucherUsageDrafts.length > 0 ||
              orderVoucherRedemptionDrafts.length > 0)
          ) {
            cleanupTasks.push(
              getOrderCheckoutRefs(orderId).then((orderRefs) => {
                const usageTasks = orderVoucherUsageDrafts.map((usage) => {
                  const orderShipmentId = orderRefs.shipmentIdByShop.get(
                    usage.shopId,
                  );

                  if (!orderShipmentId) {
                    throw new Error(
                      `Missing shipment id for shop ${usage.shopId}`,
                    );
                  }

                  return createVoucherUsageHistory({
                    voucherId: usage.voucherId,
                    userId: Number(userId || paymentInfo.user_id || 0),
                    orderId,
                    orderShipmentId,
                    discountAmount: usage.discountAmount,
                  });
                });

                const redemptionTasks = orderVoucherRedemptionDrafts.map(
                  async (draft) => {
                    const redemption = await createVoucherRedemption({
                      userVoucherId: draft.voucher.userVoucherId,
                      voucherId: draft.voucher.id,
                      userId: Number(userId || paymentInfo.user_id || 0),
                      orderId,
                      orderCode: orderRefs.orderNumber,
                      originalShippingFee: effectiveShippingFee,
                      originalOrderAmount: calculateSubtotal(),
                      discountAmountApplied: draft.discountAmount,
                      finalOrderAmount: orderFinalTotal,
                      status: "SUCCESS",
                    });
                    const redemptionId = Number(redemption?.id || 0);

                    if (redemptionId <= 0) {
                      throw new Error("Missing voucher redemption id");
                    }

                    return Promise.all(
                      draft.itemDiscounts.map((itemDiscount) => {
                        const orderItemId = orderRefs.orderItemIdByKey.get(
                          itemDiscount.itemKey,
                        );

                        if (!orderItemId) {
                          throw new Error(
                            `Missing order item id for ${itemDiscount.itemKey}`,
                          );
                        }

                        return createVoucherRedemptionItem({
                          voucherRedemptionId: redemptionId,
                          orderItemId,
                          discountAmount: itemDiscount.discountAmount,
                        });
                      }),
                    );
                  },
                );

                return Promise.all([...usageTasks, ...redemptionTasks]);
              }),
            );
          }

          selectedRedeemableVouchers
            .filter((voucher) => voucher.userVoucherId)
            .forEach((voucher) => {
              cleanupTasks.push(
                fetch(`${API_URL}/api/user-vouchers/${voucher.userVoucherId}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    status: "REDEEMED",
                    reservedOrderId: orderId,
                    reservedAt: new Date().toISOString(),
                    redeemedAt: new Date().toISOString(),
                  }),
                }).then(async (res) => {
                  if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Failed to update voucher status");
                  }
                }),
              );
            });

          cleanupTasks.push(
            Promise.all(
              cartItems
                .map((item) => Number(item.id || 0))
                .filter((cartId) => cartId > 0)
                .map((cartId) => Cart.deleteCartItem(cartId)),
            ),
          );

          const cleanupResults = await Promise.allSettled(cleanupTasks);
          const hasCleanupFailure = cleanupResults.some(
            (result) => result.status === "rejected",
          );

          if (!hasCleanupFailure) {
            window.dispatchEvent(new Event("cart-updated"));
          } else {
            console.error("Checkout cleanup failed:", cleanupResults);
            message.warning(
              "Đơn hàng đã tạo nhưng cập nhật voucher hoặc giỏ hàng chưa hoàn tất.",
            );
          }

          setPaymentInfo((prev: any) => ({
            ...prev,
            orderId,
          }));
          if (paymentInfo.method !== "COD") {
            //checkOut({ ...paymentInfo, orderId: dt.id });
            clearCodProcessingNotice();
            window.location.href = `${dt.paymentUrl}`; // Chuyển hướng đến cổng thanh toán VNPAY
          } else {
            clearCodProcessingNotice();
            window.location.href = `/orders/${orderId}`; // Chuyển hướng đến trang thành công sau khi đặt hàng với phương thức khác
          }
        } finally {
          clearCodProcessingNotice();
        }
      })
      .catch((e: AxiosError) => {
        console.error("Create order payload:", orderPayload);
        const errorMessage =
          (e.response?.data as any)?.message ||
          (e.response?.data as any)?.error ||
          (e.response?.data as any)?.status ||
          "Lỗi không xác định";
        message.error(`Đặt hàng thất bại: ${errorMessage}`);
      })
      .finally(() => {
        setIsOrderLoading(false);
      });
  };

  return (
    <main className="flex-grow-1 py-4 py-md-5">
      <div className="container-xl px-3 px-md-4">
        <div className="mb-4">
          <h2 style={{ fontWeight: 800, fontSize: "1.4rem" }} className="mb-1">
            Xác nhận nhanh
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            Chào mừng trở lại, A. Kiểm tra nhanh và hoàn tất đơn hàng.
          </p>
        </div>

        {hasOwnShopItems && (
          <div className="alert alert-warning">
            Bạn đang có sản phẩm của chính shop mình trong giỏ hàng. Hãy xóa các
            sản phẩm đó trước khi đặt hàng.
          </div>
        )}

        <div className="row g-4 align-items-start">
          <CheckoutLeftSteps
            styles={styles}
            defaultAddress={defaultAddress}
            showAddressPanel={showAddressPanel}
            setShowAddressPanel={setShowAddressPanel}
            addresses={addresses}
            setAddresses={setAddresses}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            groupedByShop={groupedByShop}
            shippingSelections={shippingSelections}
            getSelectedShippingOption={getSelectedShippingOption}
            getShippingFeeForShop={getShippingFeeForShop}
            getEffectiveShippingFeeForShop={getEffectiveShippingFeeForShop}
            shippingFeeLoading={shippingFeeLoading}
            shippingOptions={shippingOptions}
            formatCurrency={formatCurrency}
            shopVoucherAvailabilityByShop={shopVoucherAvailabilityByShop}
            selectedShopVoucherIds={selectedShopVoucherIds}
            onApplyShopVoucherIds={handleApplyShopVoucherIds}
            onClearShopVouchers={handleClearShopVouchers}
            getShopVoucherDiscount={getShopVoucherDiscount}
            getItemShopVoucherDiscount={getItemShopVoucherDiscount}
            getItemTotalVoucherDiscount={getItemTotalVoucherDiscount}
            voucherLoading={voucherLoading || voucherCalculationLoading}
            onShippingOptionChange={handleShippingOptionChange}
            onConfirmPayment={handleConfirmPayment}
            onPaymentMethodChange={handlePaymentMethodChange}
          />

          <CheckoutOrderSummary
            styles={styles}
            cartItemsLength={cartItems.length}
            subtotal={calculateSubtotal()}
            shippingFee={effectiveShippingFee}
            isShippingFeeLoading={isAnyShippingFeeLoading}
            voucherDiscount={voucherDiscount}
            shopVoucherDiscount={shopVoucherDiscount}
            platformVoucherDiscount={platformVoucherDiscount}
            total={finalTotal}
            formatCurrency={formatCurrency}
            ownedVouchers={platformVouchers}
            voucherAvailabilityList={platformVoucherAvailabilityList}
            selectedVouchers={selectedPlatformVouchers}
            selectedVoucherIds={selectedPlatformVoucherIds}
            onApplyVoucherIds={handleApplyPlatformVoucherIds}
            voucherLoading={voucherLoading || voucherCalculationLoading}
            onOrder={handleOrder}
            isOrderLoading={isOrderLoading}
          />
        </div>
      </div>
    </main>
  );
}
