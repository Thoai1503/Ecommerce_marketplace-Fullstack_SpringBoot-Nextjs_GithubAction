"use client";
import { useState } from "react";
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

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
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

  const [coupon, setCoupon] = useState("");
  const [showAddressPanel, setShowAddressPanel] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState(1);

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0901 234 567",
      address: "123 Đường Lê Lợi, P. Bến Thành, Quận 1, TP. HCM",
      isDefault: true,
    },
    {
      id: 2,
      name: "Nguyễn Văn A",
      phone: "0912 345 678",
      address: "456 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM",
      isDefault: false,
    },
    {
      id: 3,
      name: "Nguyễn Văn A",
      phone: "0912 345 678",
      address: "456 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM",
      isDefault: false,
    },
    {
      id: 4,
      name: "Nguyễn Văn A",
      phone: "0912 345 678",
      address: "456 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. HCM",
      isDefault: false,
    },
  ]);

  const defaultAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleConfirmPayment = () =>
    alert("Đã xác nhận phương thức thanh toán!");
  const handleChangeMethod = () =>
    alert("Chuyển sang chọn phương thức khác...");
  const handleOrder = () => alert("Đặt hàng thành công!");

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
                          {defaultAddress.name} • {defaultAddress.phone}
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                          {defaultAddress.address}
                        </p>
                      </div>
                    </div>
                    <button
                      style={styles.linkPrimary}
                      onClick={() => setShowAddressPanel(true)}
                    >
                      Thay đổi
                    </button>
                  </div>
                </section>

                {/* Step 2 — Shipping (completed) */}
                <section style={styles.cardCompleted}>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex gap-3 flex-grow-1">
                      <div style={styles.stepDone}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div className="flex-grow-1">
                        <h3 style={styles.stepTitle}>Phương thức vận chuyển</h3>
                        <div
                          style={styles.shippingBox}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <p
                              className="fw-bold mb-0"
                              style={{ fontSize: 12 }}
                            >
                              Giao hàng Tiêu chuẩn
                            </p>
                            <p
                              className="text-muted fst-italic mb-0"
                              style={{ fontSize: 10 }}
                            >
                              Dự kiến nhận: 2-3 ngày làm việc
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: "#22c55e",
                              textTransform: "uppercase",
                            }}
                          >
                            Miễn phí
                          </span>
                        </div>
                      </div>
                    </div>
                    <a href="#" style={styles.linkPrimary}>
                      Thay đổi
                    </a>
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

                {/* Step 4 — Products */}
                <section style={styles.cardDefault}>
                  <div className="d-flex gap-3">
                    <div style={styles.stepPending}>4</div>
                    <div className="flex-grow-1">
                      <h3 style={styles.stepTitle} className="mb-3">
                        Kiểm tra sản phẩm (2)
                      </h3>
                      <div className="d-flex gap-3 py-3">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDdTfP81RNzA2xOfXNZRhTI3hN6m-cfiwYGJupyiW4wFDyTxRr7Wxupjy5hO_dGf_4FF8SR_pZkfO7YiMaxAyfR5M2JTQLkQ4mgWUQU0UgKuR2It8zmQx4kGekwzSSpVquZ5v_tNKq-b0-qjurpbCdROuuB9gz39eDsZeoZNnpyC1wZGsg4MM2pUlKVBNhFvLaPwNK-CyFrF15r0K8rhdhOHTjLTwhtAzEtOeKhhlQmdnvLerxcQK7fF0YZqBlOndhH2bcUkKy6Q"
                          alt="Product 1"
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
                            Tai nghe Wireless Noise Cancelling Pro 2024
                          </h4>
                          <p
                            className="text-muted mb-2"
                            style={{ fontSize: 11 }}
                          >
                            Màu sắc: Space Grey | Bảo hành 12 tháng
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "#137fec",
                              }}
                            >
                              12.490.000₫
                            </span>
                            <span style={styles.qtyBadge}>Số lượng: 01</span>
                          </div>
                        </div>
                      </div>
                      <hr className="my-0" style={{ borderColor: "#f1f5f9" }} />
                      <div className="d-flex gap-3 py-3">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQnmwV1eY0epLt7bbwCtHbY1cdY8srSYbx2ZpGYHRVFcFeZz49CYG06FNCmqgiDrmYUG7KWHuxV4W_hM9X9Y3rtXRh2ieERvsf21Lzyac1IsVO61Tk-A61nqZ14nYynDSaQ0kYV2eubKY1HSph44GnqxJ6c-OskgZarjJWY-kA0vB-HdUtq-HoJ3x6ccF1iRHokpe5-8Rv82ph0NumRTP0arqD61cJH2lDA1p7AzOtwAHSb2AveiyYN0wa94uH1w7CDPsrIl18Hg"
                          alt="Product 2"
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
                            Smartphone flagship Ultra HD Display v2
                          </h4>
                          <p
                            className="text-muted mb-2"
                            style={{ fontSize: 11 }}
                          >
                            Dung lượng: 256GB | RAM: 12GB
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "#137fec",
                              }}
                            >
                              23.990.000₫
                            </span>
                            <span style={styles.qtyBadge}>Số lượng: 01</span>
                          </div>
                        </div>
                      </div>
                      <div style={styles.reviewNote} className="mt-4">
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
                    <span style={styles.itemsBadge}>2 sản phẩm</span>
                  </div>
                  <div className="p-4 d-flex flex-column gap-4">
                    <div className="d-flex flex-column gap-2">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ fontSize: 12 }}
                      >
                        <span className="text-muted">Tạm tính</span>
                        <span className="fw-semibold">36.480.000₫</span>
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
                            color: "#22c55e",
                            textTransform: "uppercase",
                          }}
                        >
                          Miễn phí
                        </span>
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        style={styles.couponInput}
                        placeholder="Nhập mã giảm giá (nếu có)"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                      />
                      <button
                        style={styles.couponApply}
                        onClick={() => alert(`Áp dụng mã: ${coupon}`)}
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
                            36.480.000₫
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
                          2-3 ngày
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
      {showAddressPanel && (
        <AddressModal setShowAddressPanel={setShowAddressPanel} />
      )}
    </>
  );
}
