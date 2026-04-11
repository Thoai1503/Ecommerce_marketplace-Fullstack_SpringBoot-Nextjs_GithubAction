"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock3,
  CreditCard,
  Headset,
  Info,
  Lock,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Order, ShipmentStatus } from "@/types";
import { getMockUserOrderById } from "@/mock/userOrderDetail";

const orderStatusLabel: Record<Order["status"], string> = {
  PENDING: "Cho xac nhan",
  CONFIRMED: "Da xac nhan",
  PROCESSING: "Dang xu ly",
  SHIPPED: "Dang giao",
  COMPLETED: "Hoan thanh",
  CANCELED: "Da huy",
  REFUNDED: "Da hoan tien",
};

const shipmentStepOrder: ShipmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PICKED_UP",
  "SHIPPING",
  "DELIVERING",
  "DELIVERED",
];

const shipmentStepLabel: Record<ShipmentStatus, string> = {
  PENDING: "Cho xu ly",
  CONFIRMED: "Da xac nhan",
  PICKED_UP: "Da lay hang",
  SHIPPING: "Dang trung chuyen",
  DELIVERING: "Dang giao",
  DELIVERED: "Giao thanh cong",
  FAILED: "Giao that bai",
  RETURNED: "Hoan ve",
};

const formatMoney = (amount: number) => `${amount.toLocaleString("vi-VN")}d`;

const formatDate = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    hour12: false,
  });

const stepNumberBase: CSSProperties = {
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

const cardBase: CSSProperties = {
  background: "white",
  borderRadius: 8,
  boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
  borderLeft: "4px solid",
  padding: 16,
  overflow: "hidden",
};

const styles: Record<string, CSSProperties> = {
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
  cardDefault: {
    ...cardBase,
    borderLeftColor: "#e2e8f0",
  },
  stepDone: {
    ...stepNumberBase,
    borderColor: "#22c55e",
    background: "#22c55e",
    color: "white",
  },
  stepActive: {
    ...stepNumberBase,
    borderColor: "#137fec",
    color: "#137fec",
  },
  productImg: {
    width: 72,
    height: 72,
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
  shipmentItem: {
    borderRadius: 8,
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    background: "white",
  },
  shipmentHead: {
    background: "#f8fafc",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  timelineChipDone: {
    background: "rgba(34,197,94,0.1)",
    color: "#16a34a",
    fontWeight: 700,
    fontSize: 11,
  },
  timelineChipPending: {
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: 700,
    fontSize: 11,
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
  btnOrder: {
    width: "100%",
    background: "#137fec",
    color: "white",
    fontWeight: 800,
    fontSize: 13,
    border: "none",
    borderRadius: 10,
    padding: 14,
    boxShadow: "0 4px 14px rgba(19,127,236,0.25)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    lineHeight: 1.2,
  },
  btnSecondary: {
    width: "100%",
    background: "white",
    color: "#137fec",
    fontWeight: 800,
    fontSize: 12,
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
  },
  infoNote: {
    background: "rgba(241,245,249,0.6)",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 14,
  },
};

export default function UserOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      setLoading(true);
      const detail = await getMockUserOrderById(id);
      if (!mounted) return;
      setOrder(detail);
      setLoading(false);
    }

    loadOrder();
    return () => {
      mounted = false;
    };
  }, [id]);

  const statusChipClass = useMemo(() => {
    if (!order) return "bg-slate-100 text-slate-600";

    if (order.status === "COMPLETED") return "bg-emerald-100 text-emerald-700";
    if (order.status === "SHIPPED") return "bg-blue-100 text-blue-700";
    if (order.status === "PENDING") return "bg-amber-100 text-amber-700";
    if (order.status === "CANCELED" || order.status === "REFUNDED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-indigo-100 text-indigo-700";
  }, [order]);

  if (loading) {
    return (
      <div className="container-xl py-5 d-flex flex-column align-items-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-secondary fw-semibold mb-0">
          Dang tai chi tiet don hang...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-xl py-5 text-center">
        <h2 className="fw-bold mb-2">Khong tim thay don hang</h2>
        <p className="text-secondary mb-4">
          Vui long kiem tra lai ma don hoac quay ve trang chu.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn btn-primary px-4"
        >
          Ve trang chu
        </button>
      </div>
    );
  }

  return (
    <main className="flex-grow-1 py-4 py-md-5">
      <div className="container-xl px-3 px-md-4">
        <section style={styles.cardActive} className="mb-4">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <h2
                style={{ fontWeight: 800, fontSize: "1.35rem" }}
                className="mb-1"
              >
                Chi tiet don hang {order.orderCode}
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                Theo doi tien trinh don hang va thong tin giao nhan cua ban.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-light border d-inline-flex align-items-center gap-2"
            >
              <ArrowLeft size={16} /> Quay lai
            </button>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
            <span className="badge text-bg-light border text-dark px-3 py-2">
              Ma don: {order.orderCode}
            </span>
            <span className="badge text-bg-light border text-dark px-3 py-2">
              Trang thai don hang
            </span>
            <span className={`badge px-3 py-2 ${statusChipClass}`}>
              {orderStatusLabel[order.status]}
            </span>
            <span
              className={`badge px-3 py-2 ${order.paymentStatus === "PAID" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
            >
              {order.paymentStatus === "PAID"
                ? "Da thanh toan"
                : "Chua thanh toan"}
            </span>
          </div>
        </section>

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-7">
            <div className="d-flex flex-column gap-3">
              <section style={styles.cardCompleted}>
                <div className="d-flex gap-3">
                  <div style={styles.stepDone}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="flex-grow-1">
                    <h3
                      style={{ fontSize: 13, fontWeight: 700 }}
                      className="mb-2"
                    >
                      San pham trong don
                    </h3>

                    {order.items?.map((item, index) => (
                      <div key={item.id}>
                        <div className="d-flex gap-3 py-2">
                          <img
                            src={item.productImage}
                            alt={item.productName}
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
                              {item.productName}
                            </h4>
                            <p
                              className="text-muted mb-2"
                              style={{ fontSize: 11 }}
                            >
                              SKU: {item.sku}
                              {item.variant ? ` | ${item.variant}` : ""}
                            </p>
                            <div className="d-flex align-items-center justify-content-between">
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: "#137fec",
                                }}
                              >
                                {formatMoney(item.price)}
                              </span>
                              <span style={styles.qtyBadge}>
                                So luong:{" "}
                                {String(item.quantity).padStart(2, "0")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {index < (order.items?.length || 0) - 1 && (
                          <hr
                            className="my-3"
                            style={{ borderColor: "#f1f5f9" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section style={styles.cardActive}>
                <div className="d-flex gap-3">
                  <div style={styles.stepActive}>2</div>
                  <div className="flex-grow-1">
                    <h3
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                      className="mb-3"
                    >
                      Van chuyen ({order.shipments?.length || 0} kien)
                    </h3>

                    <div className="d-flex flex-column gap-3">
                      {order.shipments?.map((shipment) => {
                        const currentStep = shipmentStepOrder.indexOf(
                          shipment.shipping_status,
                        );

                        return (
                          <div key={shipment.id} style={styles.shipmentItem}>
                            <div style={styles.shipmentHead}>
                              <p
                                className="mb-1 fw-bold"
                                style={{ fontSize: 13 }}
                              >
                                {shipment.shopName}
                              </p>
                              <p
                                className="mb-0 text-muted"
                                style={{ fontSize: 11 }}
                              >
                                Ma van don:{" "}
                                {shipment.tracking_number || "Dang cap nhat"}
                              </p>
                            </div>

                            <div style={{ padding: "14px 16px" }}>
                              <div className="d-flex flex-wrap gap-2 mb-3">
                                {shipmentStepOrder.map((step, idx) => {
                                  const done = currentStep >= idx;
                                  return (
                                    <span
                                      key={`${shipment.id}-${step}`}
                                      className="badge rounded-pill px-3 py-2"
                                      style={
                                        done
                                          ? styles.timelineChipDone
                                          : styles.timelineChipPending
                                      }
                                    >
                                      {shipmentStepLabel[step]}
                                    </span>
                                  );
                                })}
                              </div>

                              {shipment.statusHistory &&
                                shipment.statusHistory.length > 0 && (
                                  <ul className="mb-0 ps-3">
                                    {shipment.statusHistory.map(
                                      (history, index) => (
                                        <li
                                          key={`${shipment.id}-history-${index}`}
                                          className="small mb-1"
                                        >
                                          <span className="fw-semibold">
                                            {shipmentStepLabel[history.status]}:
                                          </span>{" "}
                                          {history.description ||
                                            "Cap nhat trang thai"}{" "}
                                          -{" "}
                                          <span className="text-secondary">
                                            {formatDate(history.updatedAt)}
                                          </span>
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section style={styles.cardDefault}>
                <h3
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#475569",
                  }}
                  className="mb-3 d-flex align-items-center gap-2"
                >
                  <Clock3 size={16} /> Lich su don hang
                </h3>
                <div className="d-flex flex-column gap-2">
                  {order.logs?.map((log) => (
                    <div
                      key={log.id}
                      className="d-flex flex-wrap align-items-center justify-content-between rounded-3 border px-3 py-2"
                    >
                      <div>
                        <p
                          className="mb-0 fw-semibold"
                          style={{ fontSize: 13 }}
                        >
                          {log.note}
                        </p>
                        <p className="mb-0 text-secondary small">
                          {log.action}
                        </p>
                      </div>
                      <p className="mb-0 text-secondary small">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div style={{ position: "sticky", top: 72 }}>
              <section style={styles.summaryCard}>
                <div
                  style={styles.summaryHeader}
                  className="d-flex justify-content-between align-items-center"
                >
                  <h3
                    style={{ fontWeight: 700, fontSize: 15 }}
                    className="mb-0"
                  >
                    Tong ket don hang
                  </h3>
                  <span style={styles.itemsBadge}>
                    {order.itemsCount} san pham
                  </span>
                </div>

                <div className="p-4 d-flex flex-column gap-4">
                  <div>
                    <h5
                      className="fw-bold mb-3 d-flex align-items-center gap-2"
                      style={{ fontSize: 14 }}
                    >
                      <ReceiptText size={16} /> Thanh toan
                    </h5>

                    <div
                      className="d-flex justify-content-between mb-2"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Tam tinh</span>
                      <span className="fw-semibold">
                        {formatMoney(order.subtotalAmount)}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between mb-2"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Giam gia</span>
                      <span className="fw-semibold text-danger">
                        -{formatMoney(order.discountAmount)}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between mb-2"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Phi van chuyen</span>
                      <span className="fw-semibold">
                        {formatMoney(order.shippingAmount)}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between mb-3"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted">Thue</span>
                      <span className="fw-semibold">
                        {formatMoney(order.taxAmount)}
                      </span>
                    </div>

                    <div
                      style={{
                        borderTop: "1px dashed #e2e8f0",
                        paddingTop: 14,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-end">
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                          }}
                        >
                          Tong thanh toan
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
                            {formatMoney(order.totalAmount)}
                          </p>
                          <p
                            className="text-muted fst-italic mb-0"
                            style={{ fontSize: 10 }}
                          >
                            Da bao gom VAT
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5
                      className="fw-bold mb-2 d-flex align-items-center gap-2"
                      style={{ fontSize: 13 }}
                    >
                      <MapPin size={16} /> Thong tin nhan hang
                    </h5>
                    <p className="mb-1 fw-semibold" style={{ fontSize: 13 }}>
                      {order.customerName}
                    </p>
                    <p className="mb-1 text-secondary" style={{ fontSize: 12 }}>
                      {order.customerPhone}
                    </p>
                    <p className="mb-0 text-secondary" style={{ fontSize: 12 }}>
                      {order.shippingAddress}
                    </p>
                  </div>

                  <div>
                    <h5
                      className="fw-bold mb-2 d-flex align-items-center gap-2"
                      style={{ fontSize: 13 }}
                    >
                      <CreditCard size={16} /> Giao dich
                    </h5>
                    <p className="mb-1 text-secondary" style={{ fontSize: 12 }}>
                      Phuong thuc: <strong>{order.paymentMethod}</strong>
                    </p>
                    <p className="mb-0 text-secondary" style={{ fontSize: 12 }}>
                      Ma giao dich:{" "}
                      <strong>{order.transactionId || "Chua co"}</strong>
                    </p>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="button" style={styles.btnOrder}>
                      <span className="d-flex align-items-center gap-2">
                        <Lock size={16} strokeWidth={2} /> THEO DOI VAN DON
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 500,
                          opacity: 0.85,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Xem cap nhat moi nhat
                      </span>
                    </button>

                    <button type="button" style={styles.btnSecondary}>
                      <span className="d-inline-flex align-items-center gap-2">
                        <Headset size={14} /> Lien he ho tro
                      </span>
                    </button>
                  </div>

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
                      An toan
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <BadgeCheck size={12} color="#22c55e" strokeWidth={2.5} />
                      Xac thuc
                    </div>
                  </div>
                </div>
              </section>

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
                  Giao dien nay dang su dung du lieu gia lap de kiem thu UI. Khi
                  ket noi API that, thong tin trang thai va lich su van chuyen
                  se cap nhat theo du lieu thoi gian thuc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
