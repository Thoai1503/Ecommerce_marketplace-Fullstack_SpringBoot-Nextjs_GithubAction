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

type PaymentMethod = "cod" | "vnpay" | "bank";

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt khi nhận hàng tại nhà.",
    icon: <Banknote size={24} color="#22c55e" strokeWidth={1.5} />,
  },
  {
    id: "vnpay",
    label: "VNPay",
    description: "Thanh toán qua cổng VNPay (ATM, QR, thẻ quốc tế).",
    icon: <CreditCard size={24} color="#137fec" strokeWidth={1.5} />,
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản trực tiếp qua tài khoản ngân hàng.",
    icon: <Wallet size={24} color="#f59e0b" strokeWidth={1.5} />,
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
  shippingFeeLoading: Record<number, boolean>;
  shippingOptions: ShippingOption[];
  formatCurrency: (amount: number) => string;
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
  shippingFeeLoading,
  shippingOptions,
  formatCurrency,
  onShippingOptionChange,
  onConfirmPayment,
  onPaymentMethodChange,
}: CheckoutLeftStepsProps) {
  const [selectedPayment, setSelectedPayment] =
    React.useState<PaymentMethod>("cod");
  const hasAddress = Boolean(defaultAddress) && addresses.length > 0;

  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPayment(method);
    onPaymentMethodChange?.(method);
  };

  return (
    <div className="col-12 col-lg-7">
      <div className="d-flex flex-column gap-3">
        {/* ── BƯỚC 1: Địa chỉ nhận hàng ── */}
        <section style={styles.cardCompleted}>
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex gap-3 flex-grow-1">
              <div style={styles.stepDone}>
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="flex-grow-1">
                <h3 style={styles.stepTitle}>Địa chỉ nhận hàng</h3>
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
                      border: "1px dashed #f59e0b",
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
                      Bạn chưa có địa chỉ nhận hàng
                    </p>
                    <p
                      className="mb-0"
                      style={{ fontSize: 12, color: "#a16207" }}
                    >
                      Vui lòng thêm địa chỉ để tiếp tục tính phí vận chuyển và
                      đặt hàng.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              style={styles.linkPrimary}
              onClick={() => setShowAddressPanel(true)}
            >
              {hasAddress ? "Thay đổi" : "Thêm địa chỉ"}
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

        {/* ── BƯỚC 2: Kiểm tra kiện hàng & chọn hãng vận chuyển ── */}
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
                Kiểm tra kiện hàng &amp; chọn hãng vận chuyển (
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
                const isShippingFeeLoading =
                  shippingFeeLoading[shopId] ?? false;

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
                                  {String(item.quantity).padStart(2, "0")}
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
                          Chọn hãng vận chuyển
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
                                    displayedShippingFee === 0
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
                                    Đang tính...
                                  </span>
                                ) : displayedShippingFee === 0 ? (
                                  "Miễn phí"
                                ) : (
                                  formatCurrency(displayedShippingFee)
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
                  Vui lòng rà soát kỹ các mặt hàng trước khi thanh toán
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── BƯỚC 3: Phương thức thanh toán (bước cuối) ── */}
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
                Phương thức thanh toán
              </h3>
              <p className="text-muted mb-3" style={{ fontSize: 12 }}>
                Chọn phương thức thanh toán phù hợp với bạn.
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
                XÁC NHẬN THANH TOÁN
                <CheckCircle size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
