import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import HeaderAuth from "@/components/HeaderAuth";

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

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ================= HEADER ================= */}
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

              {/* 🔥 AUTH HEADER */}
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
              <span className="material-symbols-outlined">
                shopping_cart
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="main">{children}</main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-top pt-5 pb-3">
        <div className="text-center text-secondary">
          © 2024 Sàn TMĐT. All rights reserved.
        </div>
      </footer>

      <Script src="/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
}
