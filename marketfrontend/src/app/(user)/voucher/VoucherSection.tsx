import VoucherClaimButton from "@/components/client/voucher/VoucherClaimButton";
import { AdminVoucher } from "@/types";
import React from "react";
import styles from "../../(user)/voucher/page.module.css";

const VoucherSection = ({
  vouchers,
  issuerMeta,
  getVoucherHeading,
  getVoucherSubtext,
}: {
  vouchers: AdminVoucher[];
  issuerMeta: {
    key: string;
    label: string;
    title: string;
  };
  getVoucherHeading: (voucher: AdminVoucher) => string;
  getVoucherSubtext: (voucher: AdminVoucher) => string;
}) => {
  const [voucherList, setVoucherList] =
    React.useState<AdminVoucher[]>(vouchers);
  const [visibleCount, setVisibleCount] = React.useState(4);

  React.useEffect(() => {
    setVoucherList(vouchers);
    setVisibleCount(4);
  }, [vouchers]);

  const formatDate = (value?: string | null) => {
    if (!value) return "No limit";
    return new Date(value).toLocaleDateString("vi-VN");
  };

  const visibleVouchers = voucherList.slice(0, visibleCount);
  const canLoadMore = visibleCount < voucherList.length;

  return (
    <>
      <div className="row g-4">
        {visibleVouchers.map((voucher) => (
          <div key={voucher.id} className="col-12 col-lg-6">
            <div
              className={`${styles.voucherCard} position-relative rounded-4 bg-white overflow-hidden h-100`}
              style={{
                border: "1px solid rgba(233, 236, 239, 0.95)",
                boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
              }}
            >
              <div className="d-flex h-100">
                <div
                  className={`${styles.voucherSide} d-flex flex-column align-items-center justify-content-center text-white text-center`}
                  style={{
                    width: "135px",
                    minWidth: "135px",
                    // background:
                    //   "linear-gradient(135deg, #1B5ED1 0%, #53B7FF 100%)",
                    backgroundColor: "#1570ef",
                    padding: "18px 10px",
                  }}
                >
                  <div
                    className="fw-bold"
                    style={{
                      fontSize: "1rem",
                      lineHeight: 1.05,
                    }}
                  >
                    NEXAMART
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
                  <div style={{ fontSize: "0.72rem" }}>Free</div>
                  <div style={{ fontSize: "0.72rem" }}>{voucher.title}</div>
                </div>

                <div className="flex-grow-1 p-3 p-md-4">
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <div className="flex-grow-1">
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
                        className="fw-semibold text-dark"
                        style={{
                          fontSize: "1.05rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {getVoucherHeading(voucher)}
                      </div>

                      <div
                        className="text-muted mt-1"
                        style={{
                          fontSize: "0.84rem",
                          maxWidth: "85%",
                        }}
                      >
                        {getVoucherSubtext(voucher)}
                      </div>
                    </div>

                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "20px",
                        height: "20px",
                        fontSize: "0.75rem",
                        color: "#1570ef",
                        border: "1px solid rgba(21, 112, 239, 0.32)",
                        backgroundColor: "#f5faff",
                      }}
                      title={`ID ${voucher.id} - ${voucher.status}`}
                    >
                      i
                    </div>
                  </div>

                  <div
                    className="d-flex align-items-end justify-content-between mt-4 pt-3"
                    style={{
                      borderTop: "1px dashed rgba(255, 107, 107, 0.24)",
                    }}
                  >
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
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
                        boxShadow: "0 8px 18px rgba(21, 112, 239, 0.3)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canLoadMore && (
        <div className={`${styles.actions} mt-4`}>
          <button
            type="button"
            className={styles.seeMoreButton}
            onClick={() => setVisibleCount((current) => current + 4)}
          >
            Xem thêm
          </button>
        </div>
      )}
    </>
  );
};

export default VoucherSection;
