import Link from "next/link";
import { INTERNAL_API } from "@/helper/api";
import { AdminVoucher } from "@/types";

const formatDate = (value?: string | null) => {
  if (!value) return "Khong gioi han";
  return new Date(value).toLocaleDateString("vi-VN");
};

const getIssuerMeta = (issuerType?: string | null) => {
  switch (issuerType) {
    case "BRAND":
      return { key: "BRAND", label: "Brand", title: "Voucher tu Brand" };
    case "PLATFORM":
    default:
      return { key: "PLATFORM", label: "San", title: "Voucher tu San" };
  }
};

const getDiscountTypeMeta = (discountType?: string | null) => {
  switch (discountType) {
    case "FIXED":
      return { key: "FIXED", title: "Voucher giam tien co dinh" };
    case "PERCENT":
      return { key: "PERCENT", title: "Voucher giam theo phan tram" };
    case "GIFT_ITEM":
      return { key: "GIFT_ITEM", title: "Voucher qua tang" };
    case "FREE_SHIPPING":
      return { key: "FREE_SHIPPING", title: "Voucher mien phi van chuyen" };
    default:
      return { key: "OTHER", title: "Voucher khac" };
  }
};

const getVoucherHeading = (voucher: AdminVoucher) => {
  if (voucher.discountType === "FIXED") {
    const amount = Number(voucher.discountAmount || 0);
    if (amount >= 1000) return `Giam ${Math.round(amount / 1000)}K`;
    return `Giam ${amount}`;
  }

  if (voucher.discountType === "PERCENT") {
    return `Giam ${Number(voucher.discountPercent || 0)}%`;
  }

  if (voucher.discountType === "FREE_SHIPPING") {
    return "Mien phi van chuyen";
  }

  return voucher.title || voucher.code;
};

const getVoucherSubtext = (voucher: AdminVoucher) => {
  if (voucher.description?.trim()) return voucher.description;

  const minOrder = Number(voucher.minOrderValue || 0);
  if (minOrder > 0) {
    if (minOrder >= 1000) return `Cho don hang tu ${Math.round(minOrder / 1000)}K`;
    return `Cho don hang tu ${minOrder}`;
  }

  return "So luong co han";
};

const issuerOrder = ["PLATFORM", "BRAND"];
const discountOrder = ["FIXED", "PERCENT", "GIFT_ITEM", "FREE_SHIPPING", "OTHER"];

export default async function VoucherPage() {
  const res = await fetch(`${INTERNAL_API}/api/vouchers`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div
        className="py-4 py-md-5"
        style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", paddingInline: "24px" }}
      >
        <div className="container" style={{ maxWidth: "1440px" }}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div
              className="position-relative overflow-hidden rounded-4 shadow-sm flex-grow-1 me-3"
              style={{
                minHeight: "150px",
                background:
                  "linear-gradient(180deg, #5fd6ff 0%, #1694ff 45%, #2351ff 75%, #2411b8 100%)",
                border: "4px solid #66d9ff",
              }}
            >
              <div
                className="position-absolute start-50 translate-middle-x text-center text-white fw-bold rounded-pill"
                style={{
                  top: "10px",
                  minWidth: "260px",
                  padding: "10px 28px",
                  fontSize: "1.2rem",
                  background: "linear-gradient(180deg, #ffcf4d 0%, #ff8b00 100%)",
                  border: "3px solid #ffb300",
                  textShadow: "0 2px 0 rgba(0,0,0,0.25)",
                }}
              >
                DANH CHO
              </div>
              <div
                className="position-absolute start-50 translate-middle-x text-center fw-bold"
                style={{
                  top: "58px",
                  width: "86%",
                  padding: "18px 20px",
                  borderRadius: "28px",
                  color: "#fff36b",
                  fontSize: "clamp(1.4rem, 3vw, 3.2rem)",
                  lineHeight: 1.05,
                  background:
                    "linear-gradient(180deg, rgba(34,195,255,0.98) 0%, rgba(13,99,255,0.98) 100%)",
                  border: "4px solid rgba(118,232,255,0.95)",
                  boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.18)",
                  textShadow: "3px 3px 0 #2547d8",
                }}
              >
                KHACH HANG THAN THIET
              </div>
              <div
                className="position-absolute"
                style={{
                  left: "0",
                  right: "0",
                  bottom: "0",
                  height: "28px",
                  background: "linear-gradient(180deg, #3921ff 0%, #2710b4 100%)",
                  borderTop: "4px solid #1ec9ff",
                }}
              />
            </div>
            <Link href="/" className="btn btn-outline-secondary btn-sm">
              Quay lai
            </Link>
          </div>

          <div className="alert alert-danger mb-0">Khong tai duoc du lieu voucher.</div>
        </div>
      </div>
    );
  }

  const data = await res.json();
  const vouchers = (Array.isArray(data) ? data : []) as AdminVoucher[];
  const databaseVouchers = vouchers
    .filter((voucher) => voucher.issuerType !== "SHOP")
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  const issuerGroups = databaseVouchers.reduce(
    (acc, voucher) => {
      const issuerKey = getIssuerMeta(voucher.issuerType).key;
      if (!acc[issuerKey]) acc[issuerKey] = [];
      acc[issuerKey].push(voucher);
      return acc;
    },
    {} as Record<string, AdminVoucher[]>,
  );

  const sortedIssuerEntries = Object.entries(issuerGroups).sort(([a], [b]) => {
    const aIndex = issuerOrder.indexOf(a);
    const bIndex = issuerOrder.indexOf(b);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  return (
    <div
      className="py-4 py-md-5"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", paddingInline: "24px" }}
    >
      <div className="container" style={{ maxWidth: "1440px" }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div
            className="position-relative overflow-hidden rounded-4 shadow-sm flex-grow-1 me-3"
            style={{
              minHeight: "150px",
              background:
                "linear-gradient(180deg, #5fd6ff 0%, #1694ff 45%, #2351ff 75%, #2411b8 100%)",
              border: "4px solid #66d9ff",
            }}
          >
            <div
              className="position-absolute start-50 translate-middle-x text-center text-white fw-bold rounded-pill"
              style={{
                top: "10px",
                minWidth: "260px",
                padding: "10px 28px",
                fontSize: "1.2rem",
                background: "linear-gradient(180deg, #ffcf4d 0%, #ff8b00 100%)",
                border: "3px solid #ffb300",
                textShadow: "0 2px 0 rgba(0,0,0,0.25)",
              }}
            >
              DANH CHO
            </div>
            <div
              className="position-absolute start-50 translate-middle-x text-center fw-bold"
              style={{
                top: "58px",
                width: "86%",
                padding: "18px 20px",
                borderRadius: "28px",
                color: "#fff36b",
                fontSize: "clamp(1.4rem, 3vw, 3.2rem)",
                lineHeight: 1.05,
                background:
                  "linear-gradient(180deg, rgba(34,195,255,0.98) 0%, rgba(13,99,255,0.98) 100%)",
                border: "4px solid rgba(118,232,255,0.95)",
                boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.18)",
                textShadow: "3px 3px 0 #2547d8",
              }}
            >
              KHACH HANG THAN THIET
            </div>
            <div
              className="position-absolute"
              style={{
                left: "0",
                right: "0",
                bottom: "0",
                height: "28px",
                background: "linear-gradient(180deg, #3921ff 0%, #2710b4 100%)",
                borderTop: "4px solid #1ec9ff",
              }}
            />
          </div>
          <Link href="/" className="btn btn-outline-secondary btn-sm">
            Quay lai
          </Link>
        </div>

        {databaseVouchers.length === 0 ? (
          <div className="alert alert-secondary mb-0">Bang voucher hien chua co du lieu.</div>
        ) : (
          sortedIssuerEntries.map(([issuerKey, issuerVouchers]) => {
            const issuerMeta = getIssuerMeta(issuerKey);
            const discountGroups = issuerVouchers.reduce(
              (acc, voucher) => {
                const discountKey = getDiscountTypeMeta(voucher.discountType).key;
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
                return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
              },
            );

            return (
              <section key={issuerKey} className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h3 className="fw-semibold mb-0" style={{ fontSize: "1.05rem" }}>
                    {issuerMeta.title}
                  </h3>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                    {issuerVouchers.length} voucher
                  </span>
                </div>

                {sortedDiscountEntries.map(([discountKey, discountVouchers]) => {
                  const discountMeta = getDiscountTypeMeta(discountKey);

                  return (
                    <div key={`${issuerKey}-${discountKey}`} className="mb-4">
                      <div className="mb-3 text-muted fw-medium" style={{ fontSize: "0.9rem" }}>
                        {discountMeta.title}
                      </div>

                      <div className="row g-4">
                        {discountVouchers.map((voucher) => (
                          <div key={voucher.id} className="col-12 col-lg-6">
                            <div
                              className="position-relative rounded-4 bg-white shadow-sm overflow-hidden h-100"
                              style={{ border: "1px solid #e9ecef" }}
                            >
                              <div
                                className="position-absolute rounded-circle bg-white"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  left: "140px",
                                  top: "-10px",
                                }}
                              />
                              <div
                                className="position-absolute rounded-circle bg-white"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  left: "140px",
                                  bottom: "-10px",
                                }}
                              />

                              <div className="d-flex h-100">
                                <div
                                  className="d-flex flex-column align-items-center justify-content-center text-white text-center"
                                  style={{
                                    width: "135px",
                                    minWidth: "135px",
                                    background:
                                      "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
                                    padding: "18px 10px",
                                  }}
                                >
                                  <div
                                    className="fw-bold"
                                    style={{ fontSize: "1rem", lineHeight: 1.05 }}
                                  >
                                    Nexamart
                                  </div>
                                  <div
                                    className="fw-bold rounded-2 mt-1 mb-3 px-2 py-1"
                                    style={{
                                      backgroundColor: "rgba(255,255,255,0.95)",
                                      color: "#ff6b6b",
                                      fontSize: "0.78rem",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {issuerMeta.label}
                                  </div>
                                  <div style={{ fontSize: "0.72rem" }}>Mien phi</div>
                                  <div style={{ fontSize: "0.72rem" }}>van chuyen</div>
                                </div>

                                <div className="flex-grow-1 p-3 p-md-4">
                                  <div className="d-flex align-items-start justify-content-between gap-3">
                                    <div className="flex-grow-1">
                                      <div
                                        className="fw-semibold text-dark"
                                        style={{ fontSize: "0.98rem", lineHeight: 1.2 }}
                                      >
                                        {getVoucherHeading(voucher)}
                                      </div>

                                      <div
                                        className="text-muted mt-1"
                                        style={{ fontSize: "0.8rem" }}
                                      >
                                        {getVoucherSubtext(voucher)}
                                      </div>
                                    </div>

                                    <div
                                      className="rounded-circle border border-primary text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        fontSize: "0.75rem",
                                      }}
                                      title={`ID ${voucher.id} - ${voucher.status}`}
                                    >
                                      i
                                    </div>
                                  </div>

                                  <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                      HSD: {formatDate(voucher.validTo)}
                                    </div>

                                    <button
                                      className="btn text-white fw-semibold px-3 py-1"
                                      type="button"
                                      style={{
                                        backgroundColor: "#dc3545",
                                        borderRadius: "6px",
                                        fontSize: "0.82rem",
                                      }}
                                    >
                                      Luu
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
