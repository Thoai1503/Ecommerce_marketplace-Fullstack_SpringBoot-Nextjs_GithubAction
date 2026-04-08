"use client";

import { Check, CheckCircle, Truck, Wallet } from "lucide-react";
import { CartItem, GroupedCartByShop } from "@/validators/cart";
import AddressModal from "@/components/client/checkout_page/AddressModal";
import {
  Address,
  ShippingOption,
  ShippingSelection,
} from "@/components/client/checkout_page/types";

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
  onConfirmPayment: () => void;
  onChangePaymentMethod: () => void;
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
  onChangePaymentMethod,
}: CheckoutLeftStepsProps) {
  return (
    <div className="col-12 col-lg-7">
      <div className="d-flex flex-column gap-3">
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
                  Chọn phương thức vận chuyển cho từng cửa hàng ở bước kiểm tra
                  sản phẩm
                </p>
                <div className="d-flex flex-column gap-2">
                  {Object.entries(groupedByShop).map(([shopIdStr, group]) => {
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
                              : formatCurrency(selectedOption?.fee || 0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

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
                    <Wallet size={28} color="#137fec" strokeWidth={1.5} />
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
                      Vi Momo (•••• 567)
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="fw-semibold mb-3" style={{ fontSize: 13 }}>
                  Đây có phải là phương thức thanh toán bạn muốn sử dụng?
                </p>
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    style={styles.btnPrimary}
                    className="flex-fill d-flex align-items-center justify-content-center gap-2"
                    onClick={onConfirmPayment}
                  >
                    XÁC NHẬN &amp; TIẾP TỤC
                    <CheckCircle size={16} strokeWidth={2} />
                  </button>
                  <button
                    style={styles.btnSecondary}
                    className="flex-fill"
                    onClick={onChangePaymentMethod}
                  >
                    CHỌN PHƯƠNG THỨC KHÁC
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.cardDefault}>
          <div className="d-flex gap-3">
            <div style={styles.stepPending}>4</div>
            <div className="flex-grow-1">
              <h3 style={styles.stepTitle} className="mb-3">
                Kiểm tra sản phẩm (
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
      </div>
    </div>
  );
}
