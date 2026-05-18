"use client";

import { useEffect, useState } from "react";
import { Info, Lock, ShieldCheck, Truck } from "lucide-react";

type CheckoutVoucher = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  discountType?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  minOrderValue?: number | null;
  validTo?: string | null;
  stackable?: boolean | null;
};

type VoucherAvailability = {
  voucher: CheckoutVoucher;
  isEligible: boolean;
  reason: string | null;
};

interface CheckoutOrderSummaryProps {
  styles: Record<string, React.CSSProperties>;
  cartItemsLength: number;
  subtotal: number;
  shippingFee: number;
  isShippingFeeLoading: boolean;
  voucherDiscount: number;
  shopVoucherDiscount: number;
  platformVoucherDiscount: number;
  total: number;
  formatCurrency: (amount: number) => string;
  ownedVouchers: CheckoutVoucher[];
  voucherAvailabilityList: VoucherAvailability[];
  selectedVouchers: CheckoutVoucher[];
  selectedVoucherIds: number[];
  onApplyVoucherIds: (voucherIds: number[]) => void;
  voucherLoading: boolean;
  onOrder: () => void;
  isOrderLoading?: boolean;
}

const getVoucherLabel = (voucher: CheckoutVoucher) => {
  const type = String(voucher.discountType ?? "").toUpperCase();

  if (type === "FREE_SHIPPING") return "Free shipping";
  if (type === "PERCENT")
    return `Save ${Number(voucher.discountPercent || 0)}%`;
  if (type === "FIXED")
    return `Save ${Number(voucher.discountAmount || 0).toLocaleString("vi-VN")}d`;

  return voucher.title;
};

export default function CheckoutOrderSummary({
  styles,
  cartItemsLength,
  subtotal,
  shippingFee,
  isShippingFeeLoading,
  voucherDiscount,
  shopVoucherDiscount,
  platformVoucherDiscount,
  total,
  formatCurrency,
  ownedVouchers,
  voucherAvailabilityList,
  selectedVouchers,
  selectedVoucherIds,
  onApplyVoucherIds,
  voucherLoading,
  onOrder,
  isOrderLoading = false,
}: CheckoutOrderSummaryProps) {
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [draftVoucherIds, setDraftVoucherIds] = useState<number[]>([]);

  useEffect(() => {
    if (isVoucherModalOpen) {
      setDraftVoucherIds(selectedVoucherIds);
    }
  }, [isVoucherModalOpen, selectedVoucherIds]);

  const usableVouchers = voucherAvailabilityList.filter((x) => x.isEligible);
  const hasSelectedVouchers = selectedVouchers.length > 0;
  const subtotalAfterShopVouchers = Math.max(0, subtotal - shopVoucherDiscount);
  const hasAnyVoucherDiscount = voucherDiscount > 0;

  const toggleDraftVoucher = (voucher: CheckoutVoucher) => {
    setDraftVoucherIds((current) => {
      if (current.includes(voucher.id)) {
        return current.filter((id) => id !== voucher.id);
      }

      if (!voucher.stackable) {
        return [voucher.id];
      }

      const stackableCurrent = current.filter(
        (id) =>
          usableVouchers.find((item) => item.voucher.id === id)?.voucher
            .stackable,
      );
      return [...stackableCurrent, voucher.id];
    });
  };

  return (
    <div className="col-12 col-lg-5">
      <div style={{ position: "sticky", top: 72 }}>
        <div style={styles.summaryCard}>
          <div
            style={styles.summaryHeader}
            className="d-flex justify-content-between align-items-center"
          >
            <h3 style={{ fontWeight: 700, fontSize: 15 }} className="mb-0">
              Order summary
            </h3>
            <span style={styles.itemsBadge}>{cartItemsLength} products</span>
          </div>

          <div className="p-4 d-flex flex-column gap-4">
            <div className="d-flex flex-column gap-2">
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ fontSize: 12 }}
              >
                <span className="text-muted">Subtotal</span>
                <span className="fw-semibold">{formatCurrency(subtotal)}</span>
              </div>

              <div
                className="d-flex justify-content-between align-items-center"
                style={{ fontSize: 12 }}
              >
                <span className="text-muted">Shop vouchers</span>
                <span className="fw-semibold text-success">
                  - {formatCurrency(shopVoucherDiscount)}
                </span>
              </div>

              {hasAnyVoucherDiscount && (
                <div
                  className="d-flex justify-content-between align-items-center px-2 py-1 rounded-2"
                  style={{
                    fontSize: 11,
                    background: "#f8fafc",
                    color: "#64748b",
                  }}
                >
                  <span>After shop vouchers</span>
                  <span>{formatCurrency(subtotalAfterShopVouchers)}</span>
                </div>
              )}

              <div
                className="d-flex justify-content-between align-items-center"
                style={{ fontSize: 12 }}
              >
                <span className="text-muted">Platform vouchers</span>
                <span className="fw-semibold text-success">
                  - {formatCurrency(platformVoucherDiscount)}
                </span>
              </div>

              <div
                className="d-flex justify-content-between align-items-center pt-2"
                style={{
                  fontSize: 12,
                  borderTop: "1px dashed #e2e8f0",
                }}
              >
                <span className="text-muted">Total voucher discount</span>
                <span className="fw-semibold text-success">
                  - {formatCurrency(voucherDiscount)}
                </span>
              </div>

              <div
                className="d-flex justify-content-between align-items-center"
                style={{ fontSize: 12 }}
              >
                <span className="text-muted">Shipping fee</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: shippingFee === 0 ? "#22c55e" : "#137fec",
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
                  ) : shippingFee === 0 ? (
                    "Free"
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-light border rounded-4 text-start p-3"
                onClick={() => setIsVoucherModalOpen(true)}
              >
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <div>
                    <div className="small text-muted">
                      {hasSelectedVouchers
                        ? "Applied voucher"
                        : "Choose a platform voucher"}
                    </div>
                    <div className="fw-semibold text-dark mt-1">
                      {hasSelectedVouchers
                        ? selectedVouchers
                            .map((voucher) => voucher.code)
                            .join(", ")
                        : `${usableVouchers.length} eligible vouchers`}
                    </div>
                    <div className="small text-muted mt-1">
                      {hasSelectedVouchers
                        ? `${selectedVouchers.length} platform voucher${
                            selectedVouchers.length === 1 ? "" : "s"
                          } selected`
                        : "Shop vouchers are selected inside each package"}
                    </div>
                  </div>
                  <span className="text-primary fw-semibold">Choose</span>
                </div>
              </button>

              {hasSelectedVouchers && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger p-0 align-self-start"
                  onClick={() => onApplyVoucherIds([])}
                >
                  Remove voucher
                </button>
              )}
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
                  Total payment
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
                    {formatCurrency(total)}
                  </p>
                  <p
                    className="text-muted fst-italic mb-0"
                    style={{ fontSize: 10 }}
                  >
                    VAT included
                  </p>
                </div>
              </div>

              <button
                style={{
                  ...styles.btnOrder,
                  opacity: isOrderLoading ? 0.75 : 1,
                  cursor: isOrderLoading ? "not-allowed" : "pointer",
                }}
                className="mb-3"
                onClick={onOrder}
                disabled={isOrderLoading}
              >
                {isOrderLoading ? (
                  <span className="d-flex align-items-center gap-2">
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    Processing...
                  </span>
                ) : (
                  <span className="d-flex align-items-center gap-2">
                    <Lock size={16} strokeWidth={2} />
                    PLACE ORDER NOW
                  </span>
                )}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    opacity: 0.8,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {isOrderLoading ? "Please wait..." : "Confirm & Pay"}
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
                  <ShieldCheck size={12} color="#22c55e" strokeWidth={2.5} />
                  Secure
                </div>
                <div className="d-flex align-items-center gap-1">
                  <Truck size={12} color="#22c55e" strokeWidth={2.5} />
                  Fast delivery
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
            You are in <strong>Express Checkout</strong> mode. Your details have
            been preloaded from a previous purchase so you can finish faster.
          </p>
        </div>
      </div>

      {isVoucherModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(15, 23, 42, 0.42)",
            zIndex: 1055,
            padding: "20px",
          }}
          onClick={() => setIsVoucherModalOpen(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg w-100"
            style={{ maxWidth: "640px", maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <div>
                <h5 className="mb-1">Choose voucher</h5>
                <div className="small text-muted">
                  Only eligible platform vouchers are shown for this order
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-light border"
                onClick={() => setIsVoucherModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="px-4 py-3 border-bottom bg-light-subtle">
              <div className="small text-muted">
                After shop vouchers: {formatCurrency(subtotalAfterShopVouchers)}
              </div>
              <div className="small text-muted">
                {usableVouchers.length} eligible voucher
                {usableVouchers.length === 1 ? "" : "s"}
              </div>
            </div>

            <div
              className="px-4 py-3 d-flex flex-column gap-3"
              style={{ maxHeight: "52vh", overflowY: "auto" }}
            >
              {voucherLoading && (
                <div className="text-muted small">Loading vouchers...</div>
              )}

              {!voucherLoading && ownedVouchers.length === 0 && (
                <div className="alert alert-light small mb-0">
                  You do not have any vouchers yet.
                </div>
              )}

              {!voucherLoading &&
                ownedVouchers.length > 0 &&
                usableVouchers.length === 0 && (
                  <div className="alert alert-light small mb-0">
                    There are no platform vouchers matching this cart yet.
                  </div>
                )}

              {!voucherLoading &&
                usableVouchers.map(({ voucher, isEligible, reason }) => {
                  const isSelected = draftVoucherIds.includes(voucher.id);

                  return (
                    <button
                      key={`checkout-voucher-${voucher.id}`}
                      type="button"
                      className={`btn text-start border rounded-4 p-0 overflow-hidden ${
                        isSelected
                          ? "border-primary shadow-sm"
                          : "border-info-subtle"
                      }`}
                      onClick={() => toggleDraftVoucher(voucher)}
                    >
                      <div className="row g-0 align-items-stretch">
                        <div className="col-4 col-sm-3 d-flex flex-column justify-content-center text-white p-3 bg-primary">
                          <div className="fw-bold">{voucher.code}</div>
                          <div className="small mt-2">
                            {getVoucherLabel(voucher)}
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
                              <div className="small text-muted">
                                Expiry:{" "}
                                {voucher.validTo
                                  ? new Date(
                                      voucher.validTo,
                                    ).toLocaleDateString("vi-VN")
                                  : "No expiry"}
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
                                  ? "bg-primary"
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
                onClick={() => setIsVoucherModalOpen(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={() => {
                  onApplyVoucherIds(draftVoucherIds);
                  setIsVoucherModalOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
