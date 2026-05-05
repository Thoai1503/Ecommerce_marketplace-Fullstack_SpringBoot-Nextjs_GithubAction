import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import HeaderAuth from "@/components/HeaderAuth";
import { cookies } from "next/headers";
import { UserAuthProvider } from "@/context/UserAuthContext";
import GoSellerButton from "@/components/GoSellerButton";

import CustomProgressBar from "@/components/common/CustomProgressBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootPrivider } from "@/components/context/RootProvider";
import Link from "next/link";
import CartIconWithCount from "@/components/CartIconWithCount";
import HeaderSearch from "@/components/client/search/HeaderSearch";

export const metadata: Metadata = {
  title: "Sàn TMĐT - Trang chủ",
  description: "Sàn thương mại điện tử hàng đầu Việt Nam",
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const rawUserId = cookieStore.get("user")?.value;
  const id = rawUserId ? Number(rawUserId) : 0;
  console.log("User role: " + role);
  console.log("User id: " + id);
  const queryCLient = new QueryClient();
  return (
    <>
      <RootPrivider>
        <UserAuthProvider role={role} user_id={id}>
          {/* <CustomProgressBar /> */}
          {/* ================= HEADER ================= */}
          <header className="sticky-top bg-white shadow-sm">
            {/* Utility Bar */}
            <div className="utility-bar d-none d-md-block">
              <div className="container-fluid px-lg-5">
                <div className="row">
                  <div className="col-6">
                    <div className="d-flex gap-3">
                      <GoSellerButton />
                      <a href="#">Download the application</a>
                      <span>
                        Connect{" "}
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
                  <Link
                    href="/"
                    className="d-flex align-items-center text-decoration-none"
                  >
                    <Image
                      src="/logo/nexamart-logo.svg"
                      alt="Nexamart"
                      width={220}
                      height={56}
                      priority
                      style={{ width: "auto", height: "44px" }}
                    />
                  </Link>
                </div>

                {/* Search */}
                <div className="col">
                  <HeaderSearch />
                </div>

                {/* Cart */}
                <CartIconWithCount />
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
                    Customer care
                  </h6>
                  <ul className="list-unstyled small text-secondary">
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Buying guide
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Pay
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Transport
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Returns & Refunds
                      </a>
                    </li>
                  </ul>
                </div>

                {/* VỀ CHÚNG TÔI */}
                <div className="col-6 col-md-3 col-lg-2">
                  <h6 className="fw-bold text-uppercase mb-3 small">
                    About us
                  </h6>
                  <ul className="list-unstyled small text-secondary">
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Introduce
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Recruitment
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Clause
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-decoration-none text-secondary"
                      >
                        Privacy policy
                      </a>
                    </li>
                  </ul>
                </div>

                {/* THANH TOÁN */}
                <div className="col-6 col-md-3 col-lg-2">
                  <h6 className="fw-bold text-uppercase mb-3 small">Pay</h6>
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
                    Follow us
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
                    Download the application
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
        </UserAuthProvider>
      </RootPrivider>
    </>
  );
}
