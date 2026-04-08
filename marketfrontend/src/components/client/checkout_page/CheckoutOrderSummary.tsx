"use client";

import { Info, Lock, ShieldCheck, Truck } from "lucide-react";

interface CheckoutOrderSummaryProps {
  styles: Record<string, React.CSSProperties>;
  cartItemsLength: number;
  subtotal: number;
  shippingFee: number;
  isShippingFeeLoading: boolean;
  total: number;
  formatCurrency: (amount: number) => string;
  onOrder: () => void;
}

export default function CheckoutOrderSummary({
  styles,
  cartItemsLength,
  subtotal,
  shippingFee,
  isShippingFeeLoading,
  total,
  formatCurrency,
  onOrder,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="col-12 col-lg-5">
      <div style={{ position: "sticky", top: 72 }}>
        <div style={styles.summaryCard}>
          <div
            style={styles.summaryHeader}
            className="d-flex justify-content-between align-items-center"
          >
            <h3 style={{ fontWeight: 700, fontSize: 15 }} className="mb-0">
              Tổng kết đơn hàng
            </h3>
            <span style={styles.itemsBadge}>{cartItemsLength} sản phẩm</span>
          </div>
          <div className="p-4 d-flex flex-column gap-4">
            <div className="d-flex flex-column gap-2">
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ fontSize: 12 }}
              >
                <span className="text-muted">Tạm tính</span>
                <span className="fw-semibold">{formatCurrency(subtotal)}</span>
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
                      Đang tính...
                    </span>
                  ) : shippingFee === 0 ? (
                    "Miễn phí"
                  ) : (
                    formatCurrency(shippingFee)
                  )}
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
                onClick={() => alert("Chức năng áp dụng mã đang phát triển")}
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
                    {formatCurrency(total)}
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
                onClick={onOrder}
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
                  <ShieldCheck size={12} color="#22c55e" strokeWidth={2.5} />
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
            Bạn đang ở chế độ <strong>Express Checkout</strong>. Các thông tin
            của bạn đã được tải sẵn dựa trên lần mua hàng trước đó. Nhấn xác
            nhận để hoàn tất.
          </p>
        </div>
      </div>
    </div>
  );
}
