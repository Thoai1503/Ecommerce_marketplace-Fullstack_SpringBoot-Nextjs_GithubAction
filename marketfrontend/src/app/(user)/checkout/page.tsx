"use client";
import { useEffect, useMemo, useState } from "react";
import CheckoutLeftSteps from "@/components/client/checkout_page/CheckoutLeftSteps";
import CheckoutOrderSummary from "@/components/client/checkout_page/CheckoutOrderSummary";
import {
  Address,
  ShippingOption,
  ShippingSelection,
} from "@/components/client/checkout_page/types";
import { useCheckoutPage } from "@/feature/client/hook";
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
import { calculateFeeOfLOGS } from "@/service/calculateFeeAPI";
import { CalculateFeePayload } from "@/types";
import { set } from "zod";
import { getAddressByShopId } from "@/service/addresses";
import { AxiosError } from "axios";
import { getUserInfoById, getUsersInfoByIds } from "@/service/userInfo";

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

const normalizeVoucherNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
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

  if (subtotal <= 0) {
    return {
      voucher,
      isEligible: false,
      reason: "Select products to use vouchers",
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

export default function CheckoutPage() {
  const { userId } = useUserAuth();
  const { data: addressesQuery } = useAddresses(userId || 0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [ownedVouchers, setOwnedVouchers] = useState<OwnedVoucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null,
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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
  const { checkOut } = useCheckoutPage();

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
          item?.product?.shop?.userId ??
            item?.product?.shop?.user_id ??
            0,
        );
        return Boolean(userId) && sellerUserId > 0 && sellerUserId === Number(userId);
      }),
    [cartItems, userId],
  );

  console.log("Grouped cart items by shop:", groupedByShop);

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
    useState<ShippingSelection>(
      Object.keys(groupedByShop).reduce((acc, shopId) => {
        acc[Number(shopId)] = "standard"; // mặc định chọn tiêu chuẩn
        return acc;
      }, {} as ShippingSelection),
    );

  const [shippingFees, setShippingFees] = useState<Record<number, number>>({});
  const [shippingFeeLoading, setShippingFeeLoading] = useState<
    Record<number, boolean>
  >({});

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
    if (option.calculateFeeAPI) {
      return shippingFees[shopId] ?? 0;
    }
    return option.fee || 0;
  };

  // Tính tổng phí vận chuyển
  const calculateTotalShippingFee = () => {
    return Object.entries(shippingSelections).reduce(
      (total, [shopId, optionId]) => {
        return total + getShippingFeeForShop(Number(shopId), optionId);
      },
      0,
    );
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

        const mappedVouchers: Array<OwnedVoucher | null> = userVouchers.map(
          (item: any) => {
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
      } catch (error) {
        console.error("Load checkout vouchers error:", error);
        setOwnedVouchers([]);
      } finally {
        setVoucherLoading(false);
      }
    };

    loadOwnedVouchers();
  }, [userId]);

  const voucherAvailabilityList = useMemo(() => {
    const subtotal = calculateSubtotal();
    return ownedVouchers.map((voucher) =>
      getVoucherAvailability(voucher, subtotal),
    );
  }, [ownedVouchers, cartItems]);

  const selectedVoucher = ownedVouchers.find(
    (voucher) => voucher.id === selectedVoucherId,
  );

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0;

    const subtotal = calculateSubtotal();
    const minOrderValue = normalizeVoucherNumber(selectedVoucher.minOrderValue);
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      return 0;
    }

    const type = String(selectedVoucher.discountType ?? "").toUpperCase();

    if (type === "FIXED") {
      return Math.min(
        subtotal,
        normalizeVoucherNumber(selectedVoucher.discountAmount),
      );
    }

    if (type === "PERCENT") {
      const rawDiscount =
        (subtotal * normalizeVoucherNumber(selectedVoucher.discountPercent)) /
        100;
      const maxDiscount = normalizeVoucherNumber(
        selectedVoucher.maxDiscountAmount,
      );

      return Math.min(
        subtotal,
        maxDiscount > 0 ? Math.min(rawDiscount, maxDiscount) : rawDiscount,
      );
    }

    return 0;
  }, [selectedVoucher, cartItems]);

  const effectiveShippingFee = useMemo(() => {
    if (!selectedVoucher) return calculateTotalShippingFee();

    const subtotal = calculateSubtotal();
    const minOrderValue = normalizeVoucherNumber(selectedVoucher.minOrderValue);
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      return calculateTotalShippingFee();
    }

    return String(selectedVoucher.discountType ?? "").toUpperCase() ===
      "FREE_SHIPPING"
      ? 0
      : calculateTotalShippingFee();
  }, [selectedVoucher, shippingFees, shippingSelections, cartItems]);

  const finalTotal = Math.max(
    0,
    calculateSubtotal() - voucherDiscount + effectiveShippingFee,
  );

  useEffect(() => {
    if (!selectedVoucherId) return;

    const stillUsable = voucherAvailabilityList.some(
      (item) => item.isEligible && item.voucher.id === selectedVoucherId,
    );

    if (!stillUsable) {
      setSelectedVoucherId(null);
    }
  }, [selectedVoucherId, voucherAvailabilityList]);
  const [paymentInfo, setPaymentInfo] = useState<any>({
    amount: finalTotal,
    orderId: Date.now(),

    user_id: 1,
    method: "vnpay",
    bankCode: "NCB",
    orderInfo: "Thanh toán đơn hàng #123456" + Date.now(),
  });

  // Đồng bộ paymentInfo.amount mỗi khi phí ship hoặc voucher thay đổi
  useEffect(() => {
    setPaymentInfo((prev: any) => ({
      ...prev,
      amount: finalTotal,
    }));
  }, [finalTotal]);

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
      color: "#64748b",
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

  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(0);

  const [recipient, setRecipient] = useState<any>(null);

  const defaultAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses.find((a) => a.isDefault === 1) ||
    addresses[0];

  const hasAddress = Boolean(defaultAddress) && addresses.length > 0;

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
    if (hasOwnShopItems) {
      message.warning("Bạn không thể mua sản phẩm của chính shop mình.");
      return;
    }
    // alert("Address id: " + selectedAddressId);
    //alert("Đặt hàng thành công!")
    alert(
      `Thông tin thanh toán:\nSố tiền: ${paymentInfo.amount}\nPhương thức: ${paymentInfo.method}\nMã đơn hàng: ${paymentInfo.orderId}`,
    );

    if (!hasAddress || !recipient) {
      message.warning("Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.");
      setShowAddressPanel(true);
      return;
    }

    const uniqueShopIds: number[] = [
      ...new Set(cartItems.map((item) => item?.product?.shop?.id || 0)),
    ].filter((shopId): shopId is number => Number(shopId) > 0);

    const baseTrackingSeed = Date.now();
    const ordersShipment: IOrderShipment[] = uniqueShopIds.map(
      (shopId, index) => {
        const shopCartItems = cartItems.filter(
          (item) => item?.product?.shop?.id === shopId,
        );
        return {
          id: 0,
          orderId: 0,
          shop_id: shopId,
          shipmentId: 0,
          shipmentCode: `SHIP-${baseTrackingSeed}-${index + 1}`,
      shipping_fee:
            String(selectedVoucher?.discountType ?? "").toUpperCase() ===
              "FREE_SHIPPING"
              ? 0
              : getShippingFeeForShop(shopId, shippingSelections[shopId]) || 0,
          total_amount:
            shopCartItems.reduce(
              (sum, item) =>
                sum + (item.productVariant?.price || 0) * item.quantity,
              0,
            ) +
            (String(selectedVoucher?.discountType ?? "").toUpperCase() ===
            "FREE_SHIPPING"
              ? 0
              : getShippingFeeForShop(shopId, shippingSelections[shopId])),
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
    alert("Orders Shipment:\n" + JSON.stringify(ordersShipment, null, 2));
    alert(
      `Thông tin vận chuyển:\n${ordersShipment
        .map(
          (s) =>
            `Shop ${s.shop_id}: Phí ${formatCurrency(s.shipping_fee)}, Tổng ${formatCurrency(
              s.total_amount,
            )}, Mã vận đơn ${s.tracking_number}`,
        )
        .join("\n")}`,
    );
    //return;

    const orderItems: IOrderItem[] = await Promise.all(
      cartItems.map(async (item) => {
        const user_id = item?.product?.shop?.userId || 0;
        let userInfo: any = null;
        try {
          userInfo = await getUserInfoById(user_id);
        } catch {
          // ignore, fallback to empty strings
        }
        return {
          id: 1,
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

    createOrder({
      user_id: paymentInfo.user_id || 0,
      shop_id: cartItems[0]?.product?.shop?.id || 0,
      recipient: recipient || {},
      order_number: "ORD20250318001",
      total_price: calculateSubtotal(),
      payment_method: paymentInfo.method || "unknown",
      address_id: selectedAddressId || 0,
      shipping_fee: effectiveShippingFee,
      discount_amount: voucherDiscount,
      final_amount: finalTotal,
      orders_items: orderItems,
      order_shipment: ordersShipment,
      note: "",
      tracking_number: "",
      id: 0,
      // Additional fields for testing rollback
      // Uncomment the line below to simulate a rollback scenario
      //cancel_reason: "SIMULATE_ROLLBACK",
    })
      .then((dt) => {
        alert(`Đặt hàng thành công! Mã đơn hàng: ${dt.id}`);
        setPaymentInfo((prev: any) => ({
          ...prev,
          orderId: dt.id,
        }));
        if (paymentInfo.method !== "COD") {
          //checkOut({ ...paymentInfo, orderId: dt.id });
          window.location.href = `${dt.paymentUrl}`; // Chuyển hướng đến cổng thanh toán VNPAY
        } else {
          window.location.href = `/orders/${dt.id}`; // Chuyển hướng đến trang thành công sau khi đặt hàng với phương thức khác
        }
      })
      .catch((e: AxiosError) => {
        const errorMessage =
          (e.response?.data as any)?.status || "Lỗi không xác định";
        message.error(`Đặt hàng thất bại: ${errorMessage}`);
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
            shippingFeeLoading={shippingFeeLoading}
            shippingOptions={shippingOptions}
            formatCurrency={formatCurrency}
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
            total={finalTotal}
            formatCurrency={formatCurrency}
            ownedVouchers={ownedVouchers}
            voucherAvailabilityList={voucherAvailabilityList}
            selectedVoucher={selectedVoucher}
            selectedVoucherId={selectedVoucherId}
            setSelectedVoucherId={setSelectedVoucherId}
            voucherLoading={voucherLoading}
            onOrder={handleOrder}
          />
        </div>
      </div>
    </main>
  );
}
