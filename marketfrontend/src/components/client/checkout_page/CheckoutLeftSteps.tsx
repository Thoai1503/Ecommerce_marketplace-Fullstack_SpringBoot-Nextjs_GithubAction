"use client";

import React from "react";
import {
  Check,
  CheckCircle,
  Truck,
  Wallet,
  CreditCard,
  Banknote,
} from "lucide-react";
import { CartItem, GroupedCartByShop } from "@/validators/cart";
import AddressModal from "@/components/client/checkout_page/AddressModal";
import {
  ShippingOption,
  ShippingSelection,
} from "@/components/client/checkout_page/types";
import type { Address } from "@/components/client/checkout_page/types";

type PaymentMethod = "COD" | "VNPAY" | "BANK";

type CheckoutShopVoucher = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  discountType?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  minOrderValue?: number | null;
  stackable?: boolean | null;
};

type ShopVoucherAvailability = {
  voucher: CheckoutShopVoucher;
  isEligible: boolean;
  reason: string | null;
};

const getShopVoucherLabel = (voucher: CheckoutShopVoucher) => {
  const type = String(voucher.discountType ?? "").toUpperCase();

  if (type === "FREE_SHIPPING") return "Free shipping";
  if (type === "PERCENT")
    return `Save ${Number(voucher.discountPercent || 0)}%`;
  if (type === "FIXED")
    return `Save ${Number(voucher.discountAmount || 0).toLocaleString("vi-VN")}d`;

  return voucher.title;
};

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "COD",
    label: "Cash on delivery (COD)",
    description: "Pay in cash when your order arrives.",
    icon: <Banknote size={24} color="#22c55e" strokeWidth={1.5} />,
  },
  {
    id: "VNPAY",
    label: "VNPay",
    description: "Pay via VNPay gateway (ATM, QR, international cards).",
    icon: <CreditCard size={24} color="#137fec" strokeWidth={1.5} />,
  },
  {
    id: "BANK",
    label: "Bank transfer",
    description: "Transfer directly to the bank account.",
    icon: <Wallet size={24} color="#94a3b8" strokeWidth={1.5} />,
  },
];

interface CheckoutLeftStepsProps {
  styles: Record<string, React.CSSProperties>;
  defaultAddress?: Address;
  showAddressPanel: boolean;
  setShowAddressPanel: React.Dispatch<React.SetStateAction<boolean>>;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  selectedAddressId: number;
  setSelectedAddressId: React.Dispatch<React.SetStateAction<number>>;
  groupedByShop: Record<number, GroupedCartByShop & { items: CartItem[] }>;
  shippingSelections: ShippingSelection;
  getSelectedShippingOption: (
    shopId: number,
    shippingOptionId: string,
  ) => ShippingOption | undefined;
  getShippingFeeForShop: (shopId: number, shippingOptionId: string) => number;
  getEffectiveShippingFeeForShop: (
    shopId: number,
    shippingOptionId: string,
  ) => number;
  shippingFeeLoading: Record<number, boolean>;
  shippingOptions: ShippingOption[];
  formatCurrency: (amount: number) => string;
  shopVoucherAvailabilityByShop: Record<number, ShopVoucherAvailability[]>;
  selectedShopVoucherIds: Record<number, number[]>;
  onApplyShopVoucherIds: (shopId: number, voucherIds: number[]) => void;
  onClearShopVouchers: (shopId: number) => void;
  getShopVoucherDiscount: (shopId: number) => number;
  getItemShopVoucherDiscount: (item: CartItem) => number;
  getItemTotalVoucherDiscount: (item: CartItem) => number;
  voucherLoading: boolean;
  onShippingOptionChange: (shopId: number, optionId: string) => void;
  onConfirmPayment: (method: PaymentMethod) => void;
  onPaymentMethodChange?: (method: PaymentMethod) => void;
}

export default function CheckoutLeftSteps({
  styles,
  defaultAddress,
  showAddressPanel,
  setShowAddressPanel,
  addresses,
  setAddresses,
  selectedAddressId,
  setSelectedAddressId,
  groupedByShop,
  shippingSelections,
  getSelectedShippingOption,
  getShippingFeeForShop,
  getEffectiveShippingFeeForShop,
  shippingFeeLoading,
  shippingOptions,
  formatCurrency,
  shopVoucherAvailabilityByShop,
  selectedShopVoucherIds,
  onApplyShopVoucherIds,
  onClearShopVouchers,
  getShopVoucherDiscount,
  getItemShopVoucherDiscount,
  getItemTotalVoucherDiscount,
  voucherLoading,
  onShippingOptionChange,
  onConfirmPayment,
  onPaymentMethodChange,
}: CheckoutLeftStepsProps) {
  const [selectedPayment, setSelectedPayment] =
    React.useState<PaymentMethod>("COD");
  const [shopVoucherModalShopId, setShopVoucherModalShopId] =
    React.useState<number | null>(null);
  const [shopVoucherDraftIds, setShopVoucherDraftIds] = React.useState<
    number[]
  >([]);
  const hasAddress = Boolean(defaultAddress) && addresses.length > 0;

  React.useEffect(() => {
    if (shopVoucherModalShopId === null) return;

    setShopVoucherDraftIds(selectedShopVoucherIds[shopVoucherModalShopId] || []);
  }, [shopVoucherModalShopId, selectedShopVoucherIds]);

  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPayment(method);
    onPaymentMethodChange?.(method);
  };

  const activeShopId = shopVoucherModalShopId;
  const activeShopGroup =
    activeShopId === null ? undefined : groupedByShop[activeShopId];
  const activeShopVoucherOptions =
    activeShopId === null ? [] : shopVoucherAvailabilityByShop[activeShopId] || [];
  const activeUsableShopVouchers = activeShopVoucherOptions.filter(
    (item) => item.isEligible,
  );
  const activeShopSubtotal =
    activeShopGroup?.items.reduce(
      (total, item) =>
        total + (item.productVariant?.price ?? 0) * item.quantity,
      0,
    ) ?? 0;

  const handleOpenShopVoucherModal = (shopId: number) => {
    setShopVoucherDraftIds(selectedShopVoucherIds[shopId] || []);
    setShopVoucherModalShopId(shopId);
  };

  const handleToggleDraftShopVoucher = (voucher: CheckoutShopVoucher) => {
    setShopVoucherDraftIds((current) => {
      if (current.includes(voucher.id)) {
        return current.filter((id) => id !== voucher.id);
      }

      if (!voucher.stackable) {
        return [voucher.id];
      }

      const stackableCurrent = current.filter(
        (id) =>
          activeUsableShopVouchers.find((item) => item.voucher.id === id)
            ?.voucher.stackable,
      );
      return [...stackableCurrent, voucher.id];
    });
  };

  const handleApplyShopVoucherDraft = () => {
    if (activeShopId === null) return;

    onApplyShopVoucherIds(activeShopId, shopVoucherDraftIds);
    setShopVoucherModalShopId(null);
  };

  return (
    <>
    <div className="col-12 col-lg-7">
      <div className="d-flex flex-column gap-3">
        {/* STEP 1: Shipping address */}
        <section style={styles.cardCompleted}>
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex gap-3 flex-grow-1">
              <div style={styles.stepDone}>
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="flex-grow-1">
                <h3 style={styles.stepTitle}>Shipping address</h3>
                {hasAddress ? (
                  <>
                    <p
                      className="fw-bold mb-1"
                      style={{ fontSize: 12, color: "#1e293b" }}
                    >
                      {defaultAddress?.name} • {defaultAddress?.phone}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                      {defaultAddress?.address}
                    </p>
                  </>
                ) : (
                  <div
                    style={{
                      border: "1px dashed rgb(226, 232, 240)",
                      background: "#fffbeb",
                      borderRadius: 8,
                      padding: "10px 12px",
                      maxWidth: 420,
                    }}
                  >
                    <p
                      className="mb-1"
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#92400e",
                      }}
                    >
                      You do not have a shipping address yet
                    </p>
                    <p
                      className="mb-0"
                      style={{ fontSize: 12, color: "#a16207" }}
                    >
                      Please add an address to calculate shipping and place your
                      order.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              style={styles.linkPrimary}
              onClick={() => setShowAddressPanel(true)}
            >
              {hasAddress ? "Change" : "Add address"}
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

        {/* STEP 2: Review packages & choose shipping */}
        <section style={styles.cardActive}>
          <div className="d-flex gap-3">
            <div style={styles.stepActive}>2</div>
            <div className="flex-grow-1">
              <h3
                style={{
                  ...styles.stepTitle,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                Review packages &amp; choose shipping (
                {Object.values(groupedByShop).reduce(
                  (n, g) => n + g.items.length,
                  0,
                )}
                )
              </h3>

              {Object.entries(groupedByShop).map(([shopIdStr, group]) => {
                const shopId = Number(shopIdStr);
                const selectedOptionId =
                  shippingSelections[shopId] || "standard";
                const selectedOption = getSelectedShippingOption(
                  shopId,
                  selectedOptionId,
                );
                const displayedShippingFee = getShippingFeeForShop(
                  shopId,
                  selectedOptionId,
                );
                const effectiveShippingFee = getEffectiveShippingFeeForShop(
                  shopId,
                  selectedOptionId,
                );
                const hasShippingVoucherDiscount =
                  effectiveShippingFee < displayedShippingFee;
                const isShippingFeeLoading =
                  shippingFeeLoading[shopId] ?? false;
                const shopVoucherOptions =
                  shopVoucherAvailabilityByShop[shopId] || [];
                const eligibleShopVouchers = shopVoucherOptions.filter(
                  (item) => item.isEligible,
                );
                const selectedShopVoucherIdsForShop =
                  selectedShopVoucherIds[shopId] || [];
                const selectedShopVouchers = eligibleShopVouchers
                  .filter((item) =>
                    selectedShopVoucherIdsForShop.includes(item.voucher.id),
                  )
                  .map((item) => item.voucher);
                const shopVoucherDiscount = getShopVoucherDiscount(shopId);
                const canChooseShopVoucher =
                  !voucherLoading && eligibleShopVouchers.length > 0;

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

                    <div style={{ padding: "16px" }}>
                      {group.items.map((item, index) => {
                        const itemSubtotal =
                          (item.productVariant?.price || 0) * item.quantity;
                        const itemVoucherDiscount = Math.min(
                          itemSubtotal,
                          Math.max(0, getItemShopVoucherDiscount(item)),
                        );
                        const itemTotalVoucherDiscount = Math.min(
                          itemSubtotal,
                          Math.max(0, getItemTotalVoucherDiscount(item)),
                        );
                        const itemPlatformVoucherDiscount = Math.max(
                          0,
                          itemTotalVoucherDiscount - itemVoucherDiscount,
                        );
                        const itemAfterShopVoucher = Math.max(
                          0,
                          itemSubtotal - itemVoucherDiscount,
                        );
                        const itemAfterAllVouchers = Math.max(
                          0,
                          itemSubtotal - itemTotalVoucherDiscount,
                        );
                        const hasItemVoucherDiscount =
                          itemVoucherDiscount > 0;
                        const hasPlatformVoucherDiscount =
                          itemPlatformVoucherDiscount > 0;

                        return (
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
                                    `Variant: ${item.productVariant.variantName}`}
                                  {item.productVariant?.sku &&
                                    ` | SKU: ${item.productVariant.sku}`}
                                </p>
                                <div className="d-flex align-items-end justify-content-between gap-3">
                                  <div
                                    className="d-flex flex-column"
                                    style={{ fontSize: 11, color: "#64748b" }}
                                  >
                                    <span>
                                      Unit:{" "}
                                      {formatCurrency(
                                        item.productVariant?.price || 0,
                                      )}
                                    </span>
                                    <span style={styles.qtyBadge}>
                                      Qty:{" "}
                                      {String(item.quantity).padStart(2, "0")}
                                    </span>
                                  </div>
                                  <div className="text-end">
                                    {hasItemVoucherDiscount && (
                                      <div
                                        className="text-muted text-decoration-line-through"
                                        style={{ fontSize: 11 }}
                                      >
                                        {formatCurrency(itemSubtotal)}
                                      </div>
                                    )}
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 800,
                                        color: "#137fec",
                                      }}
                                    >
                                      {formatCurrency(itemAfterShopVoucher)}
                                    </div>
                                    {hasItemVoucherDiscount && (
                                      <div
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 700,
                                          color: "#16a34a",
                                        }}
                                      >
                                        Shop voucher -{" "}
                                        {formatCurrency(itemVoucherDiscount)}
                                      </div>
                                    )}
                                    {hasPlatformVoucherDiscount && (
                                      <div
                                        className="mt-1"
                                        style={{
                                          fontSize: 11,
                                          color: "#64748b",
                                        }}
                                      >
                                        Shop + platform:{" "}
                                        <span
                                          style={{
                                            color: "#0f766e",
                                            fontWeight: 800,
                                          }}
                                        >
                                          {formatCurrency(
                                            itemAfterAllVouchers,
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
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
                        );
                      })}

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
                          <i className="bi bi-ticket-perforated me-2"></i>
                          Shop voucher
                        </p>
                        <div
                          style={{
                            background: "#F8FAFF",
                            borderRadius: 8,
                            padding: 12,
                            border: "1px solid rgb(226, 232, 240)",
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-light border rounded-4 text-start p-3 w-100"
                            disabled={!canChooseShopVoucher}
                            onClick={() => handleOpenShopVoucherModal(shopId)}
                          >
                            <div className="d-flex justify-content-between align-items-center gap-3">
                              <div>
                                <div className="small text-muted">
                                  {selectedShopVouchers.length > 0
                                    ? "Applied shop voucher"
                                    : "Choose shop voucher"}
                                </div>
                                <div className="fw-semibold text-dark mt-1">
                                  {voucherLoading
                                    ? "Loading vouchers..."
                                    : selectedShopVouchers.length > 0
                                      ? selectedShopVouchers
                                          .map((voucher) => voucher.code)
                                          .join(", ")
                                      : eligibleShopVouchers.length > 0
                                        ? `${eligibleShopVouchers.length} eligible voucher${
                                            eligibleShopVouchers.length === 1
                                              ? ""
                                              : "s"
                                          }`
                                        : "No matching shop vouchers"}
                                </div>
                                <div className="small text-muted mt-1">
                                  {selectedShopVouchers.length > 0
                                    ? `${selectedShopVouchers.length} shop voucher${
                                        selectedShopVouchers.length === 1
                                          ? ""
                                          : "s"
                                      } selected`
                                    : "Only applies to this package"}
                                </div>
                              </div>
                              <div className="text-end flex-shrink-0">
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: selectedShopVouchers.length > 0
                                      ? "#16a34a"
                                      : "rgb(19, 127, 236)",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {selectedShopVouchers.length > 0
                                    ? `- ${formatCurrency(shopVoucherDiscount)}`
                                    : canChooseShopVoucher
                                      ? "Choose"
                                      : ""}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: 10 }}
                                >
                                  {canChooseShopVoucher
                                    ? `${eligibleShopVouchers.length} voucher${
                                        eligibleShopVouchers.length === 1
                                          ? ""
                                          : "s"
                                      }`
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </button>
                          {selectedShopVouchers.length > 0 && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-danger p-0 mt-2"
                              onClick={() => onClearShopVouchers(shopId)}
                            >
                              Remove shop voucher
                            </button>
                          )}
                        </div>
                      </div>

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
                          Choose shipping carrier
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
                                onChange={(e) =>
                                  onShippingOptionChange(shopId, e.target.value)
                                }
                              >
                                {shippingOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.name} - {option.estimatedDays}
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
                                    effectiveShippingFee === 0
                                      ? "#22c55e"
                                      : "#137fec",
                                  textTransform: "uppercase",
                                }}
                              >
                                {isShippingFeeLoading ? (
                                  <span className="d-inline-flex align-items-center gap-1">
                                    <span
                                      className="spinner-border spinner-border-sm"
                                      role="status"
                                      aria-hidden="true"
                                    />
                                    Calculating...
                                  </span>
                                ) : effectiveShippingFee === 0 ? (
                                  "Free"
                                ) : (
                                  formatCurrency(effectiveShippingFee)
                                )}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: 10 }}
                              >
                                {hasShippingVoucherDiscount
                                  ? "Free shipping voucher"
                                  : selectedOption?.estimatedDays}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

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
                  Please review all items carefully before checkout
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 3: Payment method */}
        <section style={styles.cardDefault}>
          <div className="d-flex gap-3">
            <div style={styles.stepPending}>3</div>
            <div className="flex-grow-1">
              <h3
                style={{
                  ...styles.stepTitle,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                Payment method
              </h3>
              <p className="text-muted mb-3" style={{ fontSize: 12 }}>
                Choose the payment method that works best for you.
              </p>

              <div className="d-flex flex-column gap-2 mb-4">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedPayment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectPayment(opt.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        background: isSelected
                          ? "rgba(19,127,236,0.05)"
                          : "#f8fafc",
                        border: isSelected
                          ? "2px solid #137fec"
                          : "2px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "12px 16px",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: "white",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isSelected ? "#137fec" : "#1e293b",
                          }}
                        >
                          {opt.label}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          {opt.description}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: isSelected
                            ? "5px solid #137fec"
                            : "2px solid #cbd5e1",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <button
                style={styles.btnPrimary}
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => onConfirmPayment(selectedPayment)}
              >
                CONFIRM PAYMENT
                <CheckCircle size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
      {activeShopId !== null && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(15, 23, 42, 0.42)",
            zIndex: 1055,
            padding: "20px",
          }}
          onClick={() => setShopVoucherModalShopId(null)}
        >
          <div
            className="bg-white rounded-4 shadow-lg w-100"
            style={{ maxWidth: "640px", maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <div>
                <h5 className="mb-1">Choose shop voucher</h5>
                <div className="small text-muted">
                  {activeShopGroup?.shop?.shopName || "Shop"}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => setShopVoucherModalShopId(null)}
              >
                Close
              </button>
            </div>

            <div className="px-4 py-3 border-bottom bg-light-subtle">
              <div className="small text-muted">
                Package subtotal: {formatCurrency(activeShopSubtotal)}
              </div>
              <div className="small text-muted">
                {activeUsableShopVouchers.length} eligible voucher
                {activeUsableShopVouchers.length === 1 ? "" : "s"}
              </div>
            </div>

            <div
              className="px-4 py-3 d-flex flex-column gap-3"
              style={{ maxHeight: "52vh", overflowY: "auto" }}
            >
              {voucherLoading && (
                <div className="text-muted small">Loading vouchers...</div>
              )}

              {!voucherLoading && activeShopVoucherOptions.length === 0 && (
                <div className="alert alert-light small mb-0">
                  This shop has no matching vouchers.
                </div>
              )}

              {!voucherLoading &&
                activeShopVoucherOptions.length > 0 &&
                activeUsableShopVouchers.length === 0 && (
                  <div className="alert alert-light small mb-0">
                    No shop vouchers are eligible for this package.
                  </div>
                )}

              {!voucherLoading &&
                activeUsableShopVouchers.map(({ voucher, reason }) => {
                  const isSelected = shopVoucherDraftIds.includes(voucher.id);

                  return (
                    <button
                      key={`shop-voucher-${voucher.id}`}
                      type="button"
                      className={`btn text-start border rounded-4 p-0 overflow-hidden ${
                        isSelected
                          ? "border-warning shadow-sm"
                          : "border-warning-subtle"
                      }`}
                      onClick={() => handleToggleDraftShopVoucher(voucher)}
                    >
                      <div className="row g-0 align-items-stretch">
                        <div
                          className="col-4 col-sm-3 d-flex flex-column justify-content-center text-white p-3"
                          style={{ background: "#f97316" }}
                        >
                          <div className="fw-bold">{voucher.code}</div>
                          <div className="small mt-2">
                            {getShopVoucherLabel(voucher)}
                          </div>
                        </div>
                        <div className="col-8 col-sm-9 p-3 bg-white">
                          <div className="d-flex justify-content-between align-items-start gap-3">
                            <div>
                              <div className="fw-semibold text-dark">
                                {voucher.title}
                              </div>
                              <div className="small text-muted mt-1">
                                {voucher.description || voucher.title}
                              </div>
                              <div className="small text-muted mt-2">
                                Min. order:{" "}
                                {formatCurrency(
                                  Number(voucher.minOrderValue || 0),
                                )}
                              </div>
                              <div className="small text-muted">
                                {voucher.stackable
                                  ? "Stackable"
                                  : "Not stackable"}
                              </div>
                              {reason && (
                                <div className="small text-warning mt-2">
                                  {reason}
                                </div>
                              )}
                            </div>
                            <span
                              className={`badge ${
                                isSelected
                                  ? "bg-warning text-dark"
                                  : "bg-success-subtle text-success"
                              }`}
                            >
                              {isSelected ? "Selected" : "Available"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="d-flex justify-content-end gap-2 px-4 py-3 border-top">
              <button
                type="button"
                className="btn btn-light border px-4"
                onClick={() => setShopVoucherModalShopId(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleApplyShopVoucherDraft}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
