"use client";
import { useState, useMemo } from "react";
import {
  Check,
  Wallet,
  CheckCircle,
  Lock,
  ShieldCheck,
  Truck,
  Info,
  Plus,
  MapPin,
  X,
  Star,
  Phone,
  User,
  Home,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AddressModal from "@/components/client/checkout_page/AddressModal";
import { useCheckoutPage } from "@/feature/client/hook";
import { Cart } from "@/types/data/Cart";
import { CartItem, GroupedCartByShop } from "@/validators/cart";
import { createOrder } from "@/feature/client/service";
import { id } from "zod/v4/locales";
import { IOrderItem } from "@/validators/orderItem";
import { Recipient } from "@/validators/order";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUserAuth } from "@/context/UserAuthContext";
import { useAddresses } from "@/hooks/useAddresses";

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: number; // 1 là mặc định, 0 là không
}

interface ShippingOption {
  id: string;
  name: string;
  estimatedDays: string;
  fee: number;
}

interface ShippingSelection {
  [shopId: number]: string; // shopId -> shippingOptionId
}

import { useEffect } from "react";
import {} from "@/hooks/useAddresses";
// ...existing code...

// Dữ liệu mẫu cho city, district, ward (city vẫn dùng map tĩnh, district/ward lấy động)
const cityMap = { 4: "TP. Hồ Chí Minh", 1: "Hà Nội" };

import { useQuery, QueryClient } from "@tanstack/react-query";
import { message } from "antd";

// Hàm fetch districts theo provinceId
async function fetchDistrictsByProvince(provinceId: number) {
  const res = await fetch(
    "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
    {
      method: "POST",
      headers: {
        token: "6cc6a2a1-1f8e-11f1-a973-aee5264794df",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ province_id: provinceId }),
    },
  );
  const data = await res.json();
  return data?.data || [];
}

// Hàm fetch wards theo districtId
async function fetchWardsByDistrict(districtId: number) {
  const res = await fetch(
    "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id",
    {
      method: "POST",
      headers: {
        token: "6cc6a2a1-1f8e-11f1-a973-aee5264794df",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ district_id: districtId }),
    },
  );
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

export default function CheckoutPage() {
  const { userId, roles } = useUserAuth();
  const { data: addressesQuery, isLoading: addressesLoading } = useAddresses(
    userId || 0,
  );
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    // Hàm async để mapping địa chỉ động sử dụng hooks caching
    async function mapAddresses() {
      if (addressesQuery && Array.isArray(addressesQuery)) {
        // Sử dụng fetchDistrictsByProvince và fetchWardsByDistrict để lấy mapping
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
                (cityMap[String(addr.city) as keyof typeof cityMap] ||
                  `TP ${addr.city}`),
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
  const cartItems = localStorage.getItem("selectedCartItems")
    ? (JSON.parse(localStorage.getItem("selectedCartItems")!) as CartItem[])
    : [];

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
  ];

  // State để lưu lựa chọn vận chuyển cho mỗi shop
  const [shippingSelections, setShippingSelections] =
    useState<ShippingSelection>(
      Object.keys(groupedByShop).reduce((acc, shopId) => {
        acc[Number(shopId)] = "standard"; // mặc định chọn tiêu chuẩn
        return acc;
      }, {} as ShippingSelection),
    );

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

  // Tính tổng phí vận chuyển
  const calculateTotalShippingFee = () => {
    return Object.entries(shippingSelections).reduce(
      (total, [shopId, optionId]) => {
        const option = getSelectedShippingOption(Number(shopId), optionId);
        return total + (option?.fee || 0);
      },
      0,
    );
  };

  // Tính tổng tiền sản phẩm
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.productVariant?.price ?? 0) * item.quantity,
      0,
    );
  };
  const [paymentInfo, setPaymentInfo] = useState<any>({
    amount: 100000,
    orderId: Date.now(),

    user_id: 1,
    method: "vnpay",
    bankCode: "NCB",
    orderInfo: "Thanh toán đơn hàng #123456" + Date.now(),
  });
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
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  // State recipient lưu thông tin người nhận dựa trên địa chỉ đã chọn
  const [recipient, setRecipient] = useState<any>(null);
  // addresses được cập nhật từ API
  // Lấy địa chỉ mặc định: ưu tiên selectedAddressId, nếu không thì lấy địa chỉ có isDefault === 1, nếu không có thì lấy địa chỉ đầu tiên
  const defaultAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses.find((a) => a.isDefault === 1) ||
    addresses[0];

  // Cập nhật recipient mỗi khi selectedAddressId hoặc addresses thay đổi
  useEffect(() => {
    if (defaultAddress) {
      // Parse lại address để lấy các trường cần thiết (giả sử address dạng: 'addressLine, wardName, districtName, cityName')
      // Nếu cần lấy ward/district/city id thì cần lưu thêm trong Address
      setRecipient({
        name: defaultAddress.name,
        phone: defaultAddress.phone,
        address: defaultAddress.address,
      });
    }
  }, [selectedAddressId, addresses]);

  const handleConfirmPayment = () =>
    alert("Đã xác nhận phương thức thanh toán!");
  const handleChangeMethod = () =>
    alert("Chuyển sang chọn phương thức khác...");
  const handleOrder = () => {
    //alert("Đặt hàng thành công!")
    alert(
      `Thông tin thanh toán:\nSố tiền: ${paymentInfo.amount}\nPhương thức: ${paymentInfo.method}\nMã đơn hàng: ${paymentInfo.orderId}`,
    );

    if (!recipient) {
      message.warning("Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.");
      return;
    }

    createOrder({
      user_id: paymentInfo.user_id || 0,
      shop_id: cartItems[0]?.product?.shop?.id || 0,
      recipient: recipient || {},
      order_number: "ORD20250318001",
      total_price: paymentInfo.amount || 0,
      payment_method: paymentInfo.method || "unknown",
      address_id: selectedAddressId || 0,
      shipping_fee: 9000,
      discount_amount: 0,
      final_amount: paymentInfo.amount - 9000 || 0,
      orders_items: cartItems.map((item) => ({
        id: 1,
        product_id: item?.product?.id || 0,
        shop_id: item?.product?.shop?.id || 0,
        order_id: 1,
        variant_id: item?.productVariant?.id || 0,
        product_name: item?.product?.name || "",
        variant_name: item?.productVariant?.variantName || "",
        quantity: item?.quantity || 0,
        price: item?.productVariant?.price || 0,
      })) as IOrderItem[],
      note: "",
      tracking_number: "",
      id: 0,
    });
    //   checkOut(paymentInfo);
  };

  return (
    <>
      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container-xl px-3 px-md-4">
          {/* Page title */}
          <div className="mb-4">
            <h2
              style={{ fontWeight: 800, fontSize: "1.4rem" }}
              className="mb-1"
            >
              Xác nhận nhanh
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
              Chào mừng trở lại, A. Kiểm tra nhanh và hoàn tất đơn hàng.
            </p>
          </div>

          <div className="row g-4 align-items-start">
            {/* ── LEFT: Steps ─────────────────────────────────────────── */}
            <div className="col-12 col-lg-7">
              <div className="d-flex flex-column gap-3">
                {/* Step 1 — Address */}
                <section style={styles.cardCompleted}>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex gap-3 flex-grow-1">
                      <div style={styles.stepDone}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div className="flex-grow-1">
                        <h3 style={styles.stepTitle}>Địa chỉ nhận hàng</h3>
                        <p
                          className="fw-bold mb-1"
                          style={{ fontSize: 12, color: "#1e293b" }}
                        >
                          {defaultAddress?.name} • {defaultAddress?.phone}
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                          {defaultAddress?.address}
                        </p>
                      </div>
                    </div>
                    <button
                      style={styles.linkPrimary}
                      onClick={() => setShowAddressPanel(true)}
                    >
                      Thay đổi
                    </button>
                    {showAddressPanel && (
                      <AddressModal
                        setShowAddressPanel={setShowAddressPanel}
                        addresses={addresses}
                        setAddresses={setAddresses}
                        selectedAddressId={selectedAddressId}
                        setSelectedAddressId={setSelectedAddressId}
                      />
                    )}
                  </div>
                </section>

                {/* Step 2 — Shipping Summary (read-only) */}
                <section style={styles.cardCompleted}>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex gap-3 flex-grow-1">
                      <div style={styles.stepDone}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div className="flex-grow-1">
                        <h3 style={styles.stepTitle}>Phương thức vận chuyển</h3>
                        <p
                          className="text-muted"
                          style={{ fontSize: 11, marginBottom: 12 }}
                        >
                          Chọn phương thức vận chuyển cho từng cửa hàng ở bước
                          kiểm tra sản phẩm
                        </p>
                        {/* Summary of shipping selections */}
                        <div className="d-flex flex-column gap-2">
                          {Object.entries(groupedByShop).map(
                            ([shopIdStr, group]) => {
                              const shopId = Number(shopIdStr);
                              const selectedOptionId =
                                shippingSelections[shopId] || "standard";
                              const selectedOption = getSelectedShippingOption(
                                shopId,
                                selectedOptionId,
                              );

                              return (
                                <div
                                  key={shopId}
                                  style={{
                                    background: "#f8fafc",
                                    borderRadius: 6,
                                    padding: "8px 12px",
                                    fontSize: 11,
                                  }}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <span className="fw-bold">
                                        {group.shop?.shopName}
                                      </span>
                                      <span
                                        className="text-muted ms-2"
                                        style={{ fontSize: 10 }}
                                      >
                                        {selectedOption?.name}
                                      </span>
                                    </div>
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 800,
                                        color:
                                          selectedOption?.fee === 0
                                            ? "#22c55e"
                                            : "#137fec",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      {selectedOption?.fee === 0
                                        ? "Miễn phí"
                                        : formatCurrency(
                                            selectedOption?.fee || 0,
                                          )}
                                    </span>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 3 — Payment (active) */}
                <section style={styles.cardActive}>
                  <div className="d-flex gap-3">
                    <div style={styles.stepActive}>3</div>
                    <div className="flex-grow-1">
                      <h3
                        style={{
                          ...styles.stepTitle,
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Phương thức thanh toán
                      </h3>
                      <p className="text-muted mb-4" style={{ fontSize: 12 }}>
                        Xác nhận phương thức thanh toán ưu tiên của bạn.
                      </p>
                      <div style={styles.paymentBox} className="mb-4">
                        <div className="d-flex align-items-center gap-3">
                          <div style={styles.paymentIconBox}>
                            <Wallet
                              size={28}
                              color="#137fec"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                color: "#64748b",
                              }}
                              className="mb-0"
                            >
                              Thanh toán qua
                            </p>
                            <p
                              style={{ fontSize: 18, fontWeight: 800 }}
                              className="mb-0"
                            >
                              Ví Momo (•••• 567)
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p
                          className="fw-semibold mb-3"
                          style={{ fontSize: 13 }}
                        >
                          Đây có phải là phương thức thanh toán bạn muốn sử
                          dụng?
                        </p>
                        <div className="d-flex flex-column flex-sm-row gap-2">
                          <button
                            style={styles.btnPrimary}
                            className="flex-fill d-flex align-items-center justify-content-center gap-2"
                            onClick={handleConfirmPayment}
                          >
                            XÁC NHẬN &amp; TIẾP TỤC
                            <CheckCircle size={16} strokeWidth={2} />
                          </button>
                          <button
                            style={styles.btnSecondary}
                            className="flex-fill"
                            onClick={handleChangeMethod}
                          >
                            CHỌN PHƯƠNG THỨC KHÁC
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 4 — Products (from CartItem) */}
                <section style={styles.cardDefault}>
                  <div className="d-flex gap-3">
                    <div style={styles.stepPending}>4</div>
                    <div className="flex-grow-1">
                      <h3 style={styles.stepTitle} className="mb-3">
                        Kiểm tra sản phẩm ({cartItems.length})
                      </h3>

                      {/* Group products by shop */}
                      {Object.entries(groupedByShop).map(
                        ([shopIdStr, group], groupIndex) => {
                          const shopId = Number(shopIdStr);
                          const selectedOptionId =
                            shippingSelections[shopId] || "standard";
                          const selectedOption = getSelectedShippingOption(
                            shopId,
                            selectedOptionId,
                          );

                          return (
                            <div
                              key={shopId}
                              className="mb-4"
                              style={{
                                borderRadius: 8,
                                border: "1px solid #f1f5f9",
                                overflow: "hidden",
                              }}
                            >
                              {/* Shop header */}
                              <div
                                style={{
                                  background: "#f8fafc",
                                  padding: "12px 16px",
                                  borderBottom: "1px solid #f1f5f9",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    marginBottom: 0,
                                  }}
                                >
                                  <i className="bi bi-shop text-primary me-2"></i>
                                  {group.shop?.shopName}
                                </p>
                              </div>

                              {/* Products */}
                              <div style={{ padding: "16px" }}>
                                {/* Products from this shop */}
                                {group.items.map((item, index) => (
                                  <div key={item.id}>
                                    <div className="d-flex gap-3 py-2">
                                      <img
                                        src={
                                          item.productVariant?.imageUrl ||
                                          "/placeholder.png"
                                        }
                                        alt={item.product?.name}
                                        style={styles.productImg}
                                      />
                                      <div className="flex-grow-1 d-flex flex-column justify-content-center">
                                        <h4
                                          style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            lineHeight: 1.4,
                                            color: "#1e293b",
                                          }}
                                          className="mb-1"
                                        >
                                          {item.product?.name}
                                        </h4>
                                        <p
                                          className="text-muted mb-2"
                                          style={{ fontSize: 11 }}
                                        >
                                          {item.productVariant?.variantName &&
                                            `Phân loại: ${item.productVariant.variantName}`}
                                          {item.productVariant?.sku &&
                                            ` | SKU: ${item.productVariant.sku}`}
                                        </p>
                                        <div className="d-flex align-items-center justify-content-between">
                                          <span
                                            style={{
                                              fontSize: 12,
                                              fontWeight: 800,
                                              color: "#137fec",
                                            }}
                                          >
                                            {formatCurrency(
                                              item.productVariant?.price || 0,
                                            )}
                                          </span>
                                          <span style={styles.qtyBadge}>
                                            Số lượng:{" "}
                                            {String(item.quantity).padStart(
                                              2,
                                              "0",
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {index < group.items.length - 1 && (
                                      <hr
                                        className="my-3"
                                        style={{ borderColor: "#f1f5f9" }}
                                      />
                                    )}
                                  </div>
                                ))}

                                {/* Shipping option selector */}
                                <div
                                  style={{
                                    borderTop: "1px solid #f1f5f9",
                                    marginTop: 16,
                                    paddingTop: 16,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "#475569",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <Truck
                                      size={14}
                                      className="me-2"
                                      style={{ display: "inline" }}
                                    />
                                    Chọn phương thức vận chuyển
                                  </p>
                                  <div
                                    style={{
                                      background: "#f8fafc",
                                      borderRadius: 8,
                                      padding: 12,
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                      <div className="flex-grow-1">
                                        <select
                                          style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            padding: "8px 12px",
                                            borderRadius: 6,
                                            border: "1.5px solid #e2e8f0",
                                            background: "white",
                                            cursor: "pointer",
                                            width: "100%",
                                          }}
                                          value={selectedOptionId}
                                          onChange={(e) => {
                                            setShippingSelections((prev) => ({
                                              ...prev,
                                              [shopId]: e.target.value,
                                            }));
                                          }}
                                        >
                                          {shippingOptions.map((option) => (
                                            <option
                                              key={option.id}
                                              value={option.id}
                                            >
                                              {option.name} -{" "}
                                              {option.estimatedDays}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="text-end">
                                        <div
                                          style={{
                                            fontSize: 12,
                                            fontWeight: 800,
                                            color:
                                              selectedOption?.fee === 0
                                                ? "#22c55e"
                                                : "#137fec",
                                            textTransform: "uppercase",
                                          }}
                                        >
                                          {selectedOption?.fee === 0
                                            ? "Miễn phí"
                                            : formatCurrency(
                                                selectedOption?.fee || 0,
                                              )}
                                        </div>
                                        <div
                                          className="text-muted"
                                          style={{ fontSize: 10 }}
                                        >
                                          {selectedOption?.estimatedDays}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        },
                      )}

                      <div style={styles.reviewNote} className="mt-2">
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Vui lòng rà soát kỹ các mặt hàng trước khi thanh toán
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* ── RIGHT: Order Summary ─────────────────────────────────── */}
            <div className="col-12 col-lg-5">
              <div style={{ position: "sticky", top: 72 }}>
                <div style={styles.summaryCard}>
                  <div
                    style={styles.summaryHeader}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <h3
                      style={{ fontWeight: 700, fontSize: 15 }}
                      className="mb-0"
                    >
                      Tổng kết đơn hàng
                    </h3>
                    <span style={styles.itemsBadge}>
                      {cartItems.length} sản phẩm
                    </span>
                  </div>
                  <div className="p-4 d-flex flex-column gap-4">
                    <div className="d-flex flex-column gap-2">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ fontSize: 12 }}
                      >
                        <span className="text-muted">Tạm tính</span>
                        <span className="fw-semibold">
                          {formatCurrency(calculateSubtotal())}
                        </span>
                      </div>
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ fontSize: 12 }}
                      >
                        <span className="text-muted">Phí vận chuyển</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color:
                              calculateTotalShippingFee() === 0
                                ? "#22c55e"
                                : "#137fec",
                            textTransform: "uppercase",
                          }}
                        >
                          {calculateTotalShippingFee() === 0
                            ? "Miễn phí"
                            : formatCurrency(calculateTotalShippingFee())}
                        </span>
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        style={styles.couponInput}
                        placeholder="Nhập mã giảm giá (nếu có)"
                      />
                      <button
                        style={styles.couponApply}
                        onClick={() =>
                          alert("Chức năng áp dụng mã đang phát triển")
                        }
                      >
                        Áp dụng
                      </button>
                    </div>
                    <div
                      style={{
                        borderTop: "1px dashed #e2e8f0",
                        paddingTop: 20,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-end mb-3">
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                          }}
                        >
                          Tổng thanh toán
                        </span>
                        <div className="text-end">
                          <p
                            style={{
                              fontSize: 24,
                              fontWeight: 800,
                              color: "#137fec",
                              lineHeight: 1,
                            }}
                            className="mb-0"
                          >
                            {formatCurrency(
                              calculateSubtotal() + calculateTotalShippingFee(),
                            )}
                          </p>
                          <p
                            className="text-muted fst-italic mb-0"
                            style={{ fontSize: 10 }}
                          >
                            Đã bao gồm VAT
                          </p>
                        </div>
                      </div>
                      <button
                        style={styles.btnOrder}
                        className="mb-3"
                        onClick={handleOrder}
                      >
                        <span className="d-flex align-items-center gap-2">
                          <Lock size={16} strokeWidth={2} />
                          ĐẶT HÀNG NGAY
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 500,
                            opacity: 0.8,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          Xác nhận &amp; Thanh toán
                        </span>
                      </button>
                      <div
                        className="d-flex align-items-center justify-content-center gap-4"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <ShieldCheck
                            size={12}
                            color="#22c55e"
                            strokeWidth={2.5}
                          />
                          Bảo mật
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <Truck size={12} color="#22c55e" strokeWidth={2.5} />
                          Giao nhanh
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={styles.infoNote} className="mt-3 d-flex gap-3">
                  <Info
                    size={18}
                    className="text-muted flex-shrink-0"
                    strokeWidth={1.8}
                  />
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: 11, lineHeight: 1.7 }}
                  >
                    Bạn đang ở chế độ <strong>Express Checkout</strong>. Các
                    thông tin của bạn đã được tải sẵn dựa trên lần mua hàng
                    trước đó. Nhấn xác nhận để hoàn tất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── ADDRESS MODAL ─────────────────────────────────────────────── */}
      {/* Đảm bảo AddressModal luôn nhận đủ props từ component cha */}
      {showAddressPanel && (
        <AddressModal
          setShowAddressPanel={setShowAddressPanel}
          addresses={addresses}
          setAddresses={setAddresses}
          selectedAddressId={selectedAddressId}
          setSelectedAddressId={setSelectedAddressId}
        />
      )}
    </>
  );
}
