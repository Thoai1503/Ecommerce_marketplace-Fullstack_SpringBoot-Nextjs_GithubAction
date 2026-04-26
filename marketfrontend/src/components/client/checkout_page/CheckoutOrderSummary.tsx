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
  total: number;
  formatCurrency: (amount: number) => string;
  ownedVouchers: CheckoutVoucher[];
  voucherAvailabilityList: VoucherAvailability[];
  selectedVoucher: CheckoutVoucher | undefined;
  selectedVoucherId: number | null;
  setSelectedVoucherId: React.Dispatch<React.SetStateAction<number | null>>;
  voucherLoading: boolean;
  onOrder: () => void;
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
  total,
  formatCurrency,
  ownedVouchers,
  voucherAvailabilityList,
  selectedVoucher,
  selectedVoucherId,
  setSelectedVoucherId,
  voucherLoading,
  onOrder,
}: CheckoutOrderSummaryProps) {
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [draftVoucherId, setDraftVoucherId] = useState<number | null>(null);

  useEffect(() => {
    if (isVoucherModalOpen) {
      setDraftVoucherId(selectedVoucherId);
    }
  }, [isVoucherModalOpen, selectedVoucherId]);

  const usableVouchers = voucherAvailabilityList.filter((x) => x.isEligible);

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
                <span className="text-muted">Voucher discount</span>
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
                      {selectedVoucher
                        ? "Applied voucher"
                        : "Choose a voucher for this order"}
                    </div>
                    <div className="fw-semibold text-dark mt-1">
                      {selectedVoucher
                        ? `${selectedVoucher.code} - ${getVoucherLabel(selectedVoucher)}`
                        : `${usableVouchers.length} eligible vouchers`}
                    </div>
                    <div className="small text-muted mt-1">
                      {selectedVoucher
                        ? selectedVoucher.description || selectedVoucher.title
                        : "Tap here to choose a voucher"}
                    </div>
                  </div>
                  <span className="text-primary fw-semibold">Choose</span>
                </div>
              </button>

              {selectedVoucher && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger p-0 align-self-start"
                  onClick={() => setSelectedVoucherId(null)}
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
                style={styles.btnOrder}
                className="mb-3"
                onClick={onOrder}
              >
                <span className="d-flex align-items-center gap-2">
                  <Lock size={16} strokeWidth={2} />
                  PLACE ORDER NOW
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
                  Confirm &amp; Pay
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
            You are in <strong>Express Checkout</strong> mode. Your details
            have been preloaded from a previous purchase so you can finish
            faster.
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
                  Eligible vouchers will be highlighted for quick selection
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
                Cart subtotal: {formatCurrency(subtotal)}
              </div>
              <div className="small text-muted">
                {usableVouchers.length}/{ownedVouchers.length} vouchers available
              </div>
            </div>

            <div
              className="px-4 py-3 d-flex flex-column gap-3"
              style={{ maxHeight: "52vh", overflowY: "auto" }}
            >
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

              {!voucherLoading &&
                voucherAvailabilityList.map(({ voucher, isEligible, reason }) => {
                  const isSelected = draftVoucherId === voucher.id;

                  return (
                    <button
                      key={`checkout-voucher-${voucher.id}`}
                      type="button"
                      className={`btn text-start border rounded-4 p-0 overflow-hidden ${
                        isSelected
                          ? "border-primary shadow-sm"
                          : isEligible
                            ? "border-info-subtle"
                            : "border-light-subtle opacity-75"
                      }`}
                      onClick={() =>
                        isEligible &&
                        setDraftVoucherId((current) =>
                          current === voucher.id ? null : voucher.id,
                        )
                      }
                    >
                      <div className="row g-0 align-items-stretch">
                        <div
                          className={`col-4 col-sm-3 d-flex flex-column justify-content-center text-white p-3 ${
                            isEligible ? "bg-primary" : "bg-secondary"
                          }`}
                        >
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
                                {formatCurrency(Number(voucher.minOrderValue || 0))}
                              </div>
                              <div className="small text-muted">
                                Expiry:{" "}
                                {voucher.validTo
                                  ? new Date(voucher.validTo).toLocaleDateString(
                                      "vi-VN",
                                    )
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
                                  : isEligible
                                    ? "bg-success-subtle text-success"
                                    : "bg-secondary-subtle text-secondary"
                              }`}
                            >
                              {isSelected
                                ? "Selected"
                                : isEligible
                                  ? "Available"
                                  : "Not eligible"}
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
                  setSelectedVoucherId(draftVoucherId);
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
