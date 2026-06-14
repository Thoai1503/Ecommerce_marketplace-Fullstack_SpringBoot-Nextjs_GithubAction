"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/helper/api";
import { AdminVoucher } from "@/types";
import VoucherClaimButton from "@/components/client/voucher/VoucherClaimButton";
import styles from "./page.module.css";
import VouucherIssuerSection from "./VouucherIssuerSection";

const formatDate = (value?: string | null) => {
  if (!value) return "No limit";
  return new Date(value).toLocaleDateString("vi-VN");
};

const getIssuerMeta = (issuerType?: string | null) => {
  switch (issuerType) {
    case "BRAND":
      return { key: "BRAND", label: "Brand", title: "Brand vouchers" };
    case "PLATFORM":
    default:
      return { key: "PLATFORM", label: "Platform", title: "Platform vouchers" };
  }
};

const getDiscountTypeMeta = (discountType?: string | null) => {
  switch (discountType) {
    case "FIXED":
      return { key: "FIXED", title: "Fixed discount vouchers" };
    case "PERCENT":
      return { key: "PERCENT", title: "Percentage discount vouchers" };
    case "GIFT_ITEM":
      return { key: "GIFT_ITEM", title: "Gift item vouchers" };
    case "FREE_SHIPPING":
      return { key: "FREE_SHIPPING", title: "Free shipping vouchers" };
    default:
      return { key: "OTHER", title: "Other vouchers" };
  }
};

const getVoucherHeading = (voucher: AdminVoucher) => {
  if (voucher.discountType === "FIXED") {
    const amount = Number(voucher.discountAmount || 0);
    if (amount >= 1000 && amount < 1000000)
      return `Giảm ${Math.round(amount / 1000)}K`;
    else if (amount >= 1000000)
      return `Giảm ${Math.round(amount / 1000000)} triệu`;
    return `Giảm ${amount}`;
  }

  if (voucher.discountType === "PERCENT") {
    return `Giảm ${Number(voucher.discountPercent || 0)}%`;
  }

  if (voucher.discountType === "FREE_SHIPPING") {
    return "Miễn phí vận chuyển";
  }

  return voucher.title || voucher.code;
};

const getVoucherSubtext = (voucher: AdminVoucher) => {
  if (voucher.description?.trim()) return voucher.description;

  const minOrder = Number(voucher.minOrderValue || 0);
  if (minOrder > 0) {
    if (minOrder >= 1000 && minOrder < 1000000)
      return `Cho đơn hàng từ ${Math.round(minOrder / 1000)}K`;
    else if (minOrder > 1000000)
      return `Cho đơn hàng từ ${Math.round(minOrder / 1000000)}M`;
    return `Cho đơn hàng từ ${minOrder}`;
  }

  return "Số lượng có hạn";
};

const issuerOrder = ["PLATFORM", "BRAND"];
const discountOrder = [
  "FIXED",
  "PERCENT",
  "GIFT_ITEM",
  "FREE_SHIPPING",
  "OTHER",
];

const CATEGORY_BANNER_URL =
  "https://res.cloudinary.com/dizx3mbgw/image/upload/v1780583956/lazada-tcbc-66-320260603151807_jo1vi4.jpg";

const BRAND_BANNER_URL =
  "https://res.cloudinary.com/dizx3mbgw/image/upload/v1780584007/nike-voucher-banner-1920x600_kyh8lq.jpg";

const hasCategoryScope = (voucher: AdminVoucher) => {
  const voucherWithScopeList = voucher as AdminVoucher & {
    scopeRules?: Array<{
      voucherId?: number;
      scopeId?: number;
      scopeType?: string;
      includeExclude?: string;
    }>;
  };

  const rules = Array.isArray(voucherWithScopeList.scopeRules)
    ? voucherWithScopeList.scopeRules
    : voucher.scopeRule
      ? [voucher.scopeRule]
      : [];

  return rules.some(
    (rule) =>
      rule?.scopeType === "CATEGORY" &&
      (rule?.includeExclude || "INCLUDE") !== "EXCLUDE",
  );
};

const hasBrandScope = (voucher: AdminVoucher) => {
  const voucherWithScopeList = voucher as AdminVoucher & {
    scopeRules?: Array<{
      voucherId?: number;
      scopeId?: number;
      scopeType?: string;
      includeExclude?: string;
    }>;
  };

  const rules = Array.isArray(voucherWithScopeList.scopeRules)
    ? voucherWithScopeList.scopeRules
    : voucher.scopeRule
      ? [voucher.scopeRule]
      : [];

  return rules.some(
    (rule) =>
      rule?.scopeType === "BRAND" &&
      (rule?.includeExclude || "INCLUDE") !== "EXCLUDE",
  );
};

const HeaderBanner = () => (
  <section className="mb-5">
    <div
      className="overflow-hidden rounded-4"
      style={{
        border: "1px solid rgba(233, 236, 239, 0.95)",
        boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
      }}
    >
      <img
        src={`https://www.finviet.com.vn/wp-content/uploads/2025/04/LICH-SAN-T4-2025-1024x536-1.png`}
        alt="Voucher category banner"
        className="w-300 d-block"
        width={1400}
        style={{ maxHeight: "360px", objectFit: "cover" }}
      />
    </div>
  </section>
);

const VoucherSkeletonList = () => {
  return (
    <section
      className="mb-5"
      aria-label="Loading vouchers"
      style={{ color: "rgba(148, 163, 184, 0.38)" }}
    >
      <div
        className="d-flex align-items-center justify-content-between mb-3 px-1"
        style={{
          borderBottom: "1px solid  rgba(53, 162, 220, 0.12)",
          paddingBottom: "10px",
        }}
      >
        <div
          className="placeholder-glow"
          style={{ width: "200px", height: "18px" }}
        >
          <span className="placeholder col-12 rounded-pill" />
        </div>
        <div
          className="placeholder-glow"
          style={{ width: "110px", height: "28px" }}
        >
          <span className="placeholder col-12 rounded-pill" />
        </div>
      </div>

      <div
        className="mb-3 placeholder-glow"
        style={{ width: "240px", height: "14px" }}
      >
        <span className="placeholder col-12 rounded-pill" />
      </div>

      <div className="row g-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="col-12 col-lg-6">
            <div
              className={`${styles.voucherCard} position-relative rounded-4 bg-white overflow-hidden h-100`}
              style={{
                border: "1px solid rgba(233, 236, 239, 0.95)",
                boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
              }}
            >
              <div className="d-flex h-100">
                <div
                  className={`${styles.voucherSide} d-flex flex-column align-items-center justify-content-center`}
                  style={{
                    width: "135px",
                    minWidth: "135px",
                    background:
                      "linear-gradient(135deg, rgba(21, 112, 239, 0.16) 0%, rgba(21, 112, 239, 0.24) 100%)",
                    padding: "18px 10px",
                  }}
                >
                  <div className="placeholder-glow w-100">
                    <span className="placeholder col-8 rounded-pill" />
                  </div>
                  <div className="placeholder-glow w-100 mt-2">
                    <span className="placeholder col-9 rounded-pill" />
                  </div>
                  <div className="placeholder-glow w-100 mt-3">
                    <span className="placeholder col-6 rounded-pill" />
                  </div>
                </div>

                <div className="flex-grow-1 p-3 p-md-4">
                  <div
                    className="placeholder-glow"
                    style={{ maxWidth: "140px" }}
                  >
                    <span className="placeholder col-12 rounded-pill" />
                  </div>
                  <div
                    className="placeholder-glow mt-2"
                    style={{ maxWidth: "220px" }}
                  >
                    <span className="placeholder col-12 rounded-pill" />
                  </div>
                  <div
                    className="placeholder-glow mt-2"
                    style={{ maxWidth: "320px" }}
                  >
                    <span className="placeholder col-12 rounded-pill" />
                  </div>

                  <div
                    className="d-flex align-items-end justify-content-between mt-4 pt-3"
                    style={{
                      borderTop: "1px dashed rgba(53, 162, 220, 0.24)",
                    }}
                  >
                    <div
                      className="placeholder-glow"
                      style={{ width: "120px" }}
                    >
                      <span className="placeholder col-12 rounded-pill" />
                    </div>
                    <div
                      className="placeholder-glow"
                      style={{ width: "96px", height: "32px" }}
                    >
                      <span className="placeholder col-12 rounded-pill" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchVouchers = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const res = await fetch(`${API_URL}/api/vouchers`, {
          cache: "no-store",
          signal: controller.signal,
          //    credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch vouchers");
        }

        const data = await res.json();
        setVouchers((Array.isArray(data) ? data : []) as AdminVoucher[]);
      } catch {
        if (!controller.signal.aborted) {
          setVouchers([]);
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchVouchers();

    return () => {
      controller.abort();
    };
  }, []);
  const curentDate = new Date();

  const databaseVouchers = useMemo(
    () =>
      [...vouchers]
        // .filter((voucher) => voucher.issuerType !== "SHOP")
        .filter((voucher) => voucher.status === "ACTIVE")
        .filter((voucher) => {
          const startDate = voucher.claimStartAt
            ? new Date(voucher.claimStartAt)
            : null;
          const endDate = voucher.claimEndAt
            ? new Date(voucher.claimEndAt)
            : null;
          return (
            (!startDate || startDate <= curentDate) &&
            (!endDate || endDate >= curentDate)
          );
        })
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }),
    [vouchers],
  );

  const shopVouchers = useMemo(
    () => vouchers.filter((voucher) => voucher.issuerType === "SHOP"),
    [vouchers],
  );

  const sortedIssuerEntries = useMemo(() => {
    const issuerGroups = databaseVouchers.reduce(
      (acc, voucher) => {
        const issuerKey = getIssuerMeta(voucher.issuerType).key;
        if (!acc[issuerKey]) acc[issuerKey] = [];
        acc[issuerKey].push(voucher);
        return acc;
      },
      {} as Record<string, AdminVoucher[]>,
    );

    return Object.entries(issuerGroups).sort(([a], [b]) => {
      const aIndex = issuerOrder.indexOf(a);
      const bIndex = issuerOrder.indexOf(b);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [databaseVouchers]);

  const categoryVouchers = useMemo(
    () => databaseVouchers.filter(hasCategoryScope),
    [databaseVouchers],
  );
  const brandVouchers = useMemo(
    () => databaseVouchers.filter(hasBrandScope),
    [databaseVouchers],
  );
  return (
    <div
      className="py-4 py-md-5"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        paddingInline: "24px",
      }}
    >
      <div className="container" style={{ maxWidth: "1440px" }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <HeaderBanner />
          {/* <Link href="/" className="btn btn-outline-secondary btn-sm">
            Back
          </Link> */}
        </div>
        <div
          className={`${styles.voucherBanner} position-relative overflow-hidden rounded-5 shadow-sm flex-grow-1 me-3`}
          style={{
            minHeight: "206px",
            background:
              "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.42), transparent 18%), radial-gradient(circle at 88% 22%, rgba(255,255,255,0.18), transparent 16%), linear-gradient(180deg, #b9ecff 0%, #5dd3ff 22%, #1296ff 55%, #2d49ee 80%, #28138d 100%)",
            border: "1px solid rgba(117, 210, 255, 0.95)",
            boxShadow: "0 24px 54px rgba(37, 80, 200, 0.2)",
          }}
        >
          <div
            className="position-absolute"
            style={{
              inset: "16px 22px auto 22px",
              height: "48px",
              borderRadius: "999px",
              background:
                "linear-gradient(180deg, rgba(255,221,118,1) 0%, rgba(255,153,24,1) 100%)",
              border: "2px solid rgba(255, 212, 98, 0.96)",
              boxShadow: "inset 0 -6px 0 rgba(181, 88, 0, 0.26)",
            }}
          />
          <div
            className="position-absolute start-50 translate-middle-x text-center text-white fw-bold"
            style={{
              top: "23px",
              fontSize: "clamp(0.92rem, 1.35vw, 1.22rem)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textShadow: "0 3px 0 rgba(132, 49, 0, 0.38)",
            }}
          >
            Exclusive For
          </div>

          <div
            className="position-absolute start-50 translate-middle-x"
            style={{
              top: "70px",
              width: "88%",
              minHeight: "92px",
              borderRadius: "30px",
              background:
                "linear-gradient(180deg, rgba(91,230,255,0.98) 0%, rgba(24,136,255,0.98) 52%, rgba(23,74,228,1) 100%)",
              border: "3px solid rgba(144, 240, 255, 0.98)",
              boxShadow:
                "inset 0 -8px 0 rgba(10, 39, 162, 0.3), 0 12px 26px rgba(22, 71, 220, 0.22)",
            }}
          />
          <div
            className="position-absolute start-50 translate-middle-x"
            style={{
              top: "82px",
              width: "82%",
              height: "14px",
              borderRadius: "999px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0))",
            }}
          />
          <div
            className="position-absolute start-50 translate-middle-x text-center fw-bold"
            style={{
              top: "103px",
              width: "82%",
              color: "#fff37a",
              fontSize: "clamp(1.18rem, 2.7vw, 2.95rem)",
              lineHeight: 1,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              textShadow: "3px 3px 0 #2750d9, 0 0 18px rgba(255,255,255,0.16)",
            }}
          >
            Loyal Customers
          </div>
          <div
            className="position-absolute text-white fw-semibold"
            style={{
              top: "147px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.92,
            }}
          >
            Best Voucher Picks This Week
          </div>

          <div
            className="position-absolute"
            style={{
              left: "26px",
              bottom: "34px",
              width: "66px",
              height: "66px",
              borderRadius: "22px",
              transform: "rotate(-10deg)",
              background: "linear-gradient(180deg, #ff9cf4 0%, #b54cff 100%)",
              boxShadow: "0 14px 20px rgba(121, 38, 170, 0.3)",
            }}
          />
          <div
            className="position-absolute"
            style={{
              left: "62px",
              bottom: "48px",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              transform: "rotate(12deg)",
              background: "linear-gradient(180deg, #ffa5ff 0%, #c26bff 100%)",
              boxShadow: "0 12px 18px rgba(121, 38, 170, 0.26)",
            }}
          />
          <div
            className="position-absolute"
            style={{
              left: "94px",
              top: "34px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#ffe066",
              boxShadow:
                "22px 10px 0 #ffe066, 8px 24px 0 #fff0a8, -10px 18px 0 #ffd43b",
            }}
          />
          <div
            className="position-absolute"
            style={{
              right: "34px",
              top: "42px",
              width: "94px",
              height: "94px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 35%, #d9f7ff 0%, #90ddff 38%, #379fff 72%, #1862d6 100%)",
              boxShadow: "0 18px 26px rgba(43, 84, 198, 0.24)",
            }}
          />
          <div
            className="position-absolute"
            style={{
              right: "18px",
              top: "72px",
              width: "24px",
              height: "24px",
              borderRadius: "10px",
              transform: "rotate(16deg)",
              background: "linear-gradient(180deg, #ffe58f 0%, #ffd43b 100%)",
              boxShadow: "0 10px 14px rgba(170, 125, 0, 0.2)",
            }}
          />
          <div
            className="position-absolute"
            style={{
              right: "0",
              left: "0",
              bottom: "0",
              height: "36px",
              background: "linear-gradient(180deg, #4020ff 0%, #2612aa 100%)",
              borderTop: "4px solid #2fd1ff",
            }}
          />
        </div>

        {isLoading ? (
          <VoucherSkeletonList />
        ) : hasError ? (
          <div className="alert alert-danger mb-0">
            Unable to load voucher data.
          </div>
        ) : databaseVouchers.length === 0 ? (
          <div className="alert alert-secondary mb-0">No vouchers found.</div>
        ) : (
          sortedIssuerEntries.map(([issuerKey, issuerVouchers]) => {
            const issuerMeta = getIssuerMeta(issuerKey);
            const discountGroups = issuerVouchers.reduce(
              (acc, voucher) => {
                const discountKey = getDiscountTypeMeta(
                  voucher.discountType,
                ).key;
                if (!acc[discountKey]) acc[discountKey] = [];
                acc[discountKey].push(voucher);
                return acc;
              },
              {} as Record<string, AdminVoucher[]>,
            );

            const sortedDiscountEntries = Object.entries(discountGroups).sort(
              ([a], [b]) => {
                const aIndex = discountOrder.indexOf(a);
                const bIndex = discountOrder.indexOf(b);
                return (
                  (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
                );
              },
            );

            return (
              <section key={issuerKey} className="mb-5">
                <div
                  className="d-flex align-items-center justify-content-between mb-3 px-1"
                  style={{
                    borderBottom: "1px solid rgba(220, 53, 69, 0.12)",
                    paddingBottom: "10px",
                  }}
                >
                  <h3
                    className="fw-semibold mb-0"
                    style={{ fontSize: "1.05rem", color: "#b42318" }}
                  >
                    {issuerMeta.title}
                  </h3>
                  <span
                    className="fw-medium"
                    style={{
                      fontSize: "0.78rem",
                      color: "#b42318",
                      backgroundColor: "rgba(220, 53, 69, 0.08)",
                      borderRadius: "999px",
                      padding: "6px 12px",
                    }}
                  >
                    {issuerVouchers.length} vouchers
                  </span>
                </div>

                {sortedDiscountEntries.map(
                  ([discountKey, discountVouchers]) => {
                    const discountMeta = getDiscountTypeMeta(discountKey);

                    return (
                      <VouucherIssuerSection
                        key={`${issuerKey}-${discountKey}`}
                        discountKey={discountKey}
                        discountVouchers={discountVouchers}
                        getDiscountTypeMeta={getDiscountTypeMeta}
                        issuerKey={issuerKey}
                        issuerMeta={issuerMeta}
                        getVoucherHeading={getVoucherHeading}
                        getVoucherSubtext={getVoucherSubtext}
                      />
                    );
                  },
                )}
              </section>
            );
          })
        )}

        {!isLoading && !hasError && databaseVouchers.length > 0 && (
          <>
            <section className="mb-5">
              <div
                className="overflow-hidden rounded-4"
                style={{
                  border: "1px solid rgba(233, 236, 239, 0.95)",
                  boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
                }}
              >
                <img
                  src={CATEGORY_BANNER_URL}
                  alt="Voucher category banner"
                  className="w-100 d-block"
                  style={{ maxHeight: "360px", objectFit: "cover" }}
                />
              </div>
            </section>

            <section className="mb-5">
              <div
                className="d-flex align-items-center justify-content-between mb-3 px-1"
                style={{
                  borderBottom: "1px solid rgba(220, 53, 69, 0.12)",
                  paddingBottom: "10px",
                }}
              >
                <h3
                  className="fw-semibold mb-0"
                  style={{ fontSize: "1.05rem", color: "#b42318" }}
                >
                  Vouchers cho nganh hang
                </h3>
                <span
                  className="fw-medium"
                  style={{
                    fontSize: "0.78rem",
                    color: "#b42318",
                    backgroundColor: "rgba(220, 53, 69, 0.08)",
                    borderRadius: "999px",
                    padding: "6px 12px",
                  }}
                >
                  {categoryVouchers.length} vouchers
                </span>
              </div>

              {categoryVouchers.length === 0 ? (
                <div className="alert alert-secondary mb-0">
                  Chua co voucher nganh hang.
                </div>
              ) : (
                <div className="row g-3">
                  {categoryVouchers.map((voucher: any) => {
                    const categoryImageUrl = voucher.scopeRules?.filter(
                      (rule: any) =>
                        rule.scopeType === "CATEGORY" &&
                        (rule.includeExclude || "INCLUDE") !== "EXCLUDE",
                    )?.[0].category.category_icon;
                    return (
                      <div
                        key={`category-${voucher.id}`}
                        className="col-12 col-md-6 col-xl-4"
                      >
                        <div
                          className={`${styles.voucherCard} rounded-4 bg-white h-100 overflow-hidden`}
                          style={{
                            border: "1px solid rgba(233, 236, 239, 0.95)",
                            boxShadow: "0 8px 20px rgba(16, 24, 40, 0.06)",
                          }}
                        >
                          <div className="d-flex h-100">
                            <div
                              className={`${styles.voucherSide} d-flex flex-column align-items-center justify-content-center text-white text-center`}
                              style={{
                                width: "112px",
                                minWidth: "112px",

                                backgroundImage: `url(${categoryImageUrl})`,

                                backgroundSize: "cover",
                                backgroundPosition: "center",

                                padding: "16px 8px",
                              }}
                            >
                              {/* <div
                                className="fw-bold"
                                style={{
                                  fontSize: "0.95rem",
                                  lineHeight: 1.05,
                                }}
                              >
                                Nexamart
                              </div>
                              <div
                                className="fw-bold rounded-2 mt-1 mb-2 px-2 py-1"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.95)",
                                  color: "#ff6b6b",
                                  fontSize: "0.72rem",
                                  lineHeight: 1,
                                }}
                              >
                                Category
                              </div>
                              <div style={{ fontSize: "0.7rem" }}>Free</div>
                              <div style={{ fontSize: "0.7rem" }}>
                                {voucher.title}
                              </div> */}
                            </div>

                            <div className="flex-grow-1 p-3">
                              <div
                                className="d-inline-flex align-items-center mb-2"
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: "#b42318",
                                  backgroundColor: "#fff1f3",
                                  borderRadius: "999px",
                                  padding: "4px 10px",
                                }}
                              >
                                {voucher.code}
                              </div>

                              <div
                                className="fw-semibold"
                                style={{ fontSize: "1rem" }}
                              >
                                {getVoucherHeading(voucher)}
                              </div>

                              <div
                                className="text-muted mt-1"
                                style={{
                                  fontSize: "0.85rem",
                                  minHeight: "42px",
                                }}
                              >
                                {getVoucherSubtext(voucher)}
                              </div>

                              <div
                                className="d-flex align-items-center justify-content-between mt-3 pt-2"
                                style={{
                                  borderTop:
                                    "1px dashed rgba(255, 107, 107, 0.24)",
                                }}
                              >
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  Exp: {formatDate(voucher.validTo)}
                                </div>

                                <VoucherClaimButton
                                  voucherId={Number(voucher.id)}
                                  voucherCode={voucher.code}
                                  voucherStatus={voucher.status}
                                  claimStartAt={voucher.claimStartAt}
                                  claimEndAt={voucher.claimEndAt}
                                  totalQuota={voucher.totalQuota}
                                  claimedCount={voucher.claimedCount}
                                  className={`${styles.voucherSaveBtn} btn text-white fw-semibold px-3 py-1`}
                                  style={{
                                    // background:
                                    //   "linear-gradient(135deg, #ff6b6b 0%, #e03131 100%)",
                                    backgroundColor: "#1570ef",
                                    borderRadius: "999px",
                                    fontSize: "0.82rem",
                                    // boxShadow:
                                    //   "0 8px 18px rgba(224, 49, 49, 0.22)",
                                    boxShadow:
                                      "0 8px 18px rgba(21, 112, 239, 0.3)",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
        <section className="mb-5">
          <div
            className="overflow-hidden rounded-4"
            style={{
              border: "1px solid rgba(233, 236, 239, 0.95)",
              boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
            }}
          >
            <img
              src={CATEGORY_BANNER_URL}
              alt="Voucher category banner"
              className="w-100 d-block"
              style={{ maxHeight: "360px", objectFit: "cover" }}
            />
          </div>
        </section>

        <section className="mb-5">
          <div
            className="d-flex align-items-center justify-content-between mb-3 px-1"
            style={{
              borderBottom: "1px solid rgba(220, 53, 69, 0.12)",
              paddingBottom: "10px",
            }}
          >
            <h3
              className="fw-semibold mb-0"
              style={{ fontSize: "1.05rem", color: "#b42318" }}
            >
              Vouchers cho nhan hang
            </h3>
            <span
              className="fw-medium"
              style={{
                fontSize: "0.78rem",
                color: "#b42318",
                backgroundColor: "rgba(220, 53, 69, 0.08)",
                borderRadius: "999px",
                padding: "6px 12px",
              }}
            >
              {categoryVouchers.length} vouchers
            </span>
          </div>

          {categoryVouchers.length === 0 ? (
            <div className="alert alert-secondary mb-0">
              Chua co voucher nhan hang.
            </div>
          ) : (
            <div className="row g-3">
              {brandVouchers.map((voucher: any) => {
                const brandImageUrl = voucher.scopeRules?.filter(
                  (rule: any) =>
                    rule.scopeType === "BRAND" &&
                    (rule.includeExclude || "INCLUDE") !== "EXCLUDE",
                )?.[0].brand.logo;
                return (
                  <div
                    key={`brand-${voucher.id}`}
                    className="col-12 col-md-6 col-xl-4"
                  >
                    <div
                      className={`${styles.voucherCard} rounded-4 bg-white h-100 overflow-hidden`}
                      style={{
                        border: "1px solid rgba(233, 236, 239, 0.95)",
                        boxShadow: "0 8px 20px rgba(16, 24, 40, 0.06)",
                      }}
                    >
                      <div className="d-flex h-100">
                        <div
                          className={`${styles.voucherSide} d-flex flex-column align-items-center justify-content-center text-white text-center`}
                          style={{
                            width: "112px",
                            minWidth: "112px",

                            backgroundImage: `url(${brandImageUrl + "?w=50&h=50&cm=pad_resize"})`,

                            backgroundSize: "cover",
                            backgroundPosition: "center",

                            padding: "16px 8px",
                          }}
                        >
                          {/* <div
                                className="fw-bold"
                                style={{
                                  fontSize: "0.95rem",
                                  lineHeight: 1.05,
                                }}
                              >
                                Nexamart
                              </div>
                              <div
                                className="fw-bold rounded-2 mt-1 mb-2 px-2 py-1"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.95)",
                                  color: "#ff6b6b",
                                  fontSize: "0.72rem",
                                  lineHeight: 1,
                                }}
                              >
                                Category
                              </div>
                              <div style={{ fontSize: "0.7rem" }}>Free</div>
                              <div style={{ fontSize: "0.7rem" }}>
                                {voucher.title}
                              </div> */}
                        </div>

                        <div className="flex-grow-1 p-3">
                          <div
                            className="d-inline-flex align-items-center mb-2"
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: "#b42318",
                              backgroundColor: "#fff1f3",
                              borderRadius: "999px",
                              padding: "4px 10px",
                            }}
                          >
                            {voucher.code}
                          </div>

                          <div
                            className="fw-semibold"
                            style={{ fontSize: "1rem" }}
                          >
                            {getVoucherHeading(voucher)}
                          </div>

                          <div
                            className="text-muted mt-1"
                            style={{
                              fontSize: "0.85rem",
                              minHeight: "42px",
                            }}
                          >
                            {getVoucherSubtext(voucher)}
                          </div>

                          <div
                            className="d-flex align-items-center justify-content-between mt-3 pt-2"
                            style={{
                              borderTop: "1px dashed rgba(255, 107, 107, 0.24)",
                            }}
                          >
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.8rem" }}
                            >
                              Exp: {formatDate(voucher.validTo)}
                            </div>

                            <VoucherClaimButton
                              voucherId={Number(voucher.id)}
                              voucherCode={voucher.code}
                              voucherStatus={voucher.status}
                              claimStartAt={voucher.claimStartAt}
                              claimEndAt={voucher.claimEndAt}
                              totalQuota={voucher.totalQuota}
                              claimedCount={voucher.claimedCount}
                              className={`${styles.voucherSaveBtn} btn text-white fw-semibold px-3 py-1`}
                              style={{
                                // background:
                                //   "linear-gradient(135deg, #ff6b6b 0%, #e03131 100%)",
                                backgroundColor: "#1570ef",
                                borderRadius: "999px",
                                fontSize: "0.82rem",
                                // boxShadow:
                                //   "0 8px 18px rgba(224, 49, 49, 0.22)",
                                boxShadow: "0 8px 18px rgba(21, 112, 239, 0.3)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
