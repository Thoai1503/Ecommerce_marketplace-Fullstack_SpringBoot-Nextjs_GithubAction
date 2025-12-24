import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
//import "./styles.css"; // Import custom CSS

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sàn TMĐT - Trang chủ",
  description: "Sàn thương mại điện tử hàng đầu Việt Nam",
};

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="sticky-top bg-white shadow-sm">
        {/* Utility Bar */}
        <div className="utility-bar d-none d-md-block">
          <div className="container-fluid px-lg-5">
            <div className="row">
              <div className="col-6">
                <div className="d-flex gap-3">
                  <a href="#">Kênh Người Bán</a>
                  <a href="#">Tải ứng dụng</a>
                  <span>
                    Kết nối{" "}
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      share
                    </span>
                  </span>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex gap-3 justify-content-end align-items-center">
                  <a href="#">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      notifications
                    </span>{" "}
                    Thông báo
                  </a>
                  <a href="#">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      help
                    </span>{" "}
                    Hỗ trợ
                  </a>
                  <a href="#" className="fw-medium">
                    Đăng ký
                  </a>
                  <span
                    style={{
                      width: "1px",
                      height: "12px",
                      background: "rgba(255,255,255,0.5)",
                    }}
                  ></span>
                  <a href="#" className="fw-medium">
                    Đăng nhập
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container-fluid px-lg-5 py-3">
          <div className="row align-items-center g-3">
            {/* Logo */}
            <div className="col-auto">
              <a
                href="#"
                className="d-flex align-items-center gap-2 text-decoration-none"
                style={{ color: "var(--primary)" }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--primary)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: "28px" }}
                  >
                    shopping_bag
                  </span>
                </div>
                <h1 className="fs-4 fw-bold mb-0 d-none d-md-block">
                  Sàn TMĐT
                </h1>
              </a>
            </div>

            {/* Search */}
            <div className="col">
              <div className="search-box d-flex align-items-center">
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Tìm sản phẩm, thương hiệu và shop yêu thích..."
                />
                <button className="btn btn-search m-1 px-3">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    search
                  </span>
                </button>
              </div>
              <div
                className="d-none d-lg-flex gap-3 mt-1"
                style={{ fontSize: "0.75rem", color: "#6b7280" }}
              >
                <a href="#" className="text-decoration-none text-secondary">
                  Dép nam
                </a>
                <a href="#" className="text-decoration-none text-secondary">
                  Áo khoác gió
                </a>
                <a href="#" className="text-decoration-none text-secondary">
                  Iphone 15
                </a>
                <a href="#" className="text-decoration-none text-secondary">
                  Túi xách nữ
                </a>
                <a href="#" className="text-decoration-none text-secondary">
                  Váy dự tiệc
                </a>
              </div>
            </div>

            {/* Cart */}
            <div className="col-auto">
              <div className="position-relative" style={{ cursor: "pointer" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--primary)", fontSize: "28px" }}
                >
                  shopping_cart
                </span>
                <span className="cart-badge">3</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-top pt-5 pb-3">
        <div className="container-fluid px-lg-5">
          <div className="row g-4 mb-4">
            <div className="col-6 col-md-3 col-lg-2">
              <h6
                className="fw-bold text-uppercase mb-3"
                style={{ fontSize: "0.75rem" }}
              >
                Chăm sóc khách hàng
              </h6>
              <div
                className="d-flex flex-column gap-2"
                style={{ fontSize: "0.875rem" }}
              >
                <a href="#" className="text-secondary text-decoration-none">
                  Trung tâm trợ giúp
                </a>
                <a href="#" className="text-secondary text-decoration-none">
                  Hướng dẫn mua hàng
                </a>
                <a href="#" className="text-secondary text-decoration-none">
                  Thanh toán
                </a>
                <a href="#" className="text-secondary text-decoration-none">
                  Vận chuyển
                </a>
                <a href="#" className="text-secondary text-decoration-none">
                  Trả hàng & Hoàn tiền
                </a>
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6
                className="fw-bold text-uppercase mb-3"
                style={{ fontSize: "0.75rem" }}
              >
                Về chúng tôi
              </h6>
              <div
                className="d-flex flex-column gap-2"
                style={{ fontSize: "0.875rem" }}
              >
                <a href="#" className="text-secondary text-decoration-none">
                  Giới thiệu về Sàn TMĐT
                </a>
                <a href="#" className="text-secondary text-decoration-none">
                  Tuyển dụng
                </a>
                <a href="#" className="text-secondary text-decoration-none">
                  Điều khoản
                </a>
                <a href="#" className="text-secondary text-decoration-none">
                  Chính sách bảo mật
                </a>
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6
                className="fw-bold text-uppercase mb-3"
                style={{ fontSize: "0.75rem" }}
              >
                Thanh toán
              </h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "24px",
                    fontSize: "0.625rem",
                  }}
                >
                  VISA
                </div>
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "24px",
                    fontSize: "0.625rem",
                  }}
                >
                  MC
                </div>
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "24px",
                    fontSize: "0.625rem",
                  }}
                >
                  JCB
                </div>
              </div>
              <h6
                className="fw-bold text-uppercase mb-3"
                style={{ fontSize: "0.75rem" }}
              >
                Đơn vị vận chuyển
              </h6>
              <div className="d-flex flex-wrap gap-2">
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center"
                  style={{ width: "40px", height: "24px", fontSize: "0.5rem" }}
                >
                  Express
                </div>
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center"
                  style={{ width: "40px", height: "24px", fontSize: "0.5rem" }}
                >
                  Fast
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h6
                className="fw-bold text-uppercase mb-3"
                style={{ fontSize: "0.75rem" }}
              >
                Theo dõi chúng tôi
              </h6>
              <div
                className="d-flex flex-column gap-2"
                style={{ fontSize: "0.875rem" }}
              >
                <a
                  href="#"
                  className="text-secondary text-decoration-none d-flex align-items-center gap-2"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    social_leaderboard
                  </span>
                  Facebook
                </a>
                <a
                  href="#"
                  className="text-secondary text-decoration-none d-flex align-items-center gap-2"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    photo_camera
                  </span>
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-secondary text-decoration-none d-flex align-items-center gap-2"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    play_circle
                  </span>
                  TikTok
                </a>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <h6
                className="fw-bold text-uppercase mb-3"
                style={{ fontSize: "0.75rem" }}
              >
                Tải ứng dụng
              </h6>
              <div className="d-flex gap-2">
                <div
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    fontSize: "0.625rem",
                  }}
                >
                  QR Code
                </div>
                <div className="d-flex flex-column gap-2 justify-content-center">
                  <div
                    className="bg-dark text-white rounded d-flex align-items-center justify-content-center"
                    style={{
                      width: "96px",
                      height: "32px",
                      fontSize: "0.625rem",
                    }}
                  >
                    App Store
                  </div>
                  <div
                    className="bg-dark text-white rounded d-flex align-items-center justify-content-center"
                    style={{
                      width: "96px",
                      height: "32px",
                      fontSize: "0.625rem",
                    }}
                  >
                    Google Play
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="border-top pt-4 text-center text-secondary"
            style={{ fontSize: "0.75rem" }}
          >
            <p className="mb-2">
              © 2024 Sàn TMĐT. Tất cả các quyền được bảo lưu.
            </p>
            <p className="mb-0">
              Quốc gia & Khu vực: Singapore | Indonesia | Thái Lan | Malaysia |
              Việt Nam
            </p>
          </div>
        </div>
      </footer>

      <Script src="/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
}
