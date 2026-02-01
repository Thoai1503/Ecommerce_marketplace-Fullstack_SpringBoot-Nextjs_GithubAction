import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import HeaderAuth from "@/components/HeaderAuth";
import { cookies } from "next/headers";
import { UserAuthProvider } from "@/context/UserAuthContext";

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
}: {
  children: React.ReactNode;
}) {
  const role = (await cookies()).get("role")?.value;
  console.log("User role: " + role);
  return (
    <>
      <UserAuthProvider role={role}>
        {/* ================= HEADER ================= */}
        <header className="sticky-top bg-white shadow-sm">
          {/* Utility Bar */}
          <div className="utility-bar d-none d-md-block">
            <div className="container-fluid px-lg-5">
              <div className="row">
                <div className="col-6">
                  <div className="d-flex gap-3">
                    <a href="/seller/createshop">Kênh Người Bán</a>
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

                {/* AUTH */}
                <div className="col-6">
                  <HeaderAuth />
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
                  href="/"
                  className="d-flex align-items-center gap-2 text-decoration-none"
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
                    <span className="material-symbols-outlined text-white">
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
                    <span className="material-symbols-outlined">search</span>
                  </button>
                </div>
              </div>

              {/* Cart */}
              <div className="col-auto">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "28px" }}
                >
                  shopping_cart
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="main">{children}</main>

        {/* ================= FOOTER ================= */}
        <footer className="bg-white border-top pt-5 pb-3 mt-5">
          <div className="container-fluid px-lg-5">
            <div className="row g-4 mb-4">
              {/* CSKH */}
              <div className="col-6 col-md-3 col-lg-2">
                <h6 className="fw-bold text-uppercase mb-3 small">
                  Chăm sóc khách hàng
                </h6>
                <ul className="list-unstyled small text-secondary">
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Trung tâm trợ giúp
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Hướng dẫn mua hàng
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Thanh toán
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Vận chuyển
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Trả hàng & hoàn tiền
                    </a>
                  </li>
                </ul>
              </div>

              {/* VỀ CHÚNG TÔI */}
              <div className="col-6 col-md-3 col-lg-2">
                <h6 className="fw-bold text-uppercase mb-3 small">
                  Về chúng tôi
                </h6>
                <ul className="list-unstyled small text-secondary">
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Giới thiệu
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Tuyển dụng
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Điều khoản
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Chính sách bảo mật
                    </a>
                  </li>
                </ul>
              </div>

              {/* THANH TOÁN */}
              <div className="col-6 col-md-3 col-lg-2">
                <h6 className="fw-bold text-uppercase mb-3 small">
                  Thanh toán
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {["VISA", "MC", "JCB"].map((x) => (
                    <div
                      key={x}
                      className="border rounded px-2 py-1 small bg-light"
                    >
                      {x}
                    </div>
                  ))}
                </div>
              </div>

              {/* THEO DÕI */}
              <div className="col-6 col-md-3 col-lg-2">
                <h6 className="fw-bold text-uppercase mb-3 small">
                  Theo dõi chúng tôi
                </h6>
                <ul className="list-unstyled small text-secondary">
                  <li className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">
                      social_leaderboard
                    </span>
                    Facebook
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">
                      photo_camera
                    </span>
                    Instagram
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">
                      play_circle
                    </span>
                    TikTok
                  </li>
                </ul>
              </div>

              {/* APP */}
              <div className="col-12 col-md-6 col-lg-3">
                <h6 className="fw-bold text-uppercase mb-3 small">
                  Tải ứng dụng
                </h6>
                <div className="d-flex gap-3">
                  <div
                    className="border bg-light d-flex align-items-center justify-content-center"
                    style={{ width: 80, height: 80 }}
                  >
                    QR
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div className="bg-dark text-white px-3 py-2 rounded small text-center">
                      App Store
                    </div>
                    <div className="bg-dark text-white px-3 py-2 rounded small text-center">
                      Google Play
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-top pt-4 text-center text-secondary small">
              © 2024 Sàn TMĐT. All rights reserved. <br />
              Quốc gia & Khu vực: Việt Nam | Singapore | Thailand | Malaysia
            </div>
          </div>
        </footer>

        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </UserAuthProvider>
    </>
  );
}
