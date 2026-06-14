import { AdminVoucher } from "@/types";
import React from "react";
import styles from "../../(user)/voucher/page.module.css";
import VoucherClaimButton from "../../../components/client/voucher/VoucherClaimButton";
import VoucherSection from "./VoucherSection";
//import { formatDate } from "@/lib/utils/dateUtils";

const VouucherIssuerSection = ({
  discountKey,
  discountVouchers,
  getDiscountTypeMeta,
  issuerKey,
  issuerMeta,
  getVoucherHeading,
  getVoucherSubtext,
}: {
  discountKey: string;
  discountVouchers: AdminVoucher[];
  getDiscountTypeMeta: (discountType?: string | null) => {
    key: string;
    title: string;
  };
  getVoucherHeading: (voucher: AdminVoucher) => string;
  getVoucherSubtext: (voucher: AdminVoucher) => string;
  issuerKey: string;
  issuerMeta: {
    key: string;
    label: string;
    title: string;
  };
}) => {
  const formatDate = (value?: string | null) => {
    if (!value) return "No limit";
    return new Date(value).toLocaleDateString("vi-VN");
  };
  const discountMeta = getDiscountTypeMeta(discountKey);
  return (
    <div key={`${issuerKey}-${discountKey}`} className="mb-4">
      <div
        className="mb-3 fw-medium"
        style={{
          fontSize: "0.84rem",
          color: "#667085",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        {discountMeta.title} 2
      </div>

      <VoucherSection
        vouchers={discountVouchers}
        issuerMeta={issuerMeta}
        getVoucherHeading={getVoucherHeading}
        getVoucherSubtext={getVoucherSubtext}
      />
    </div>
  );
};

export default VouucherIssuerSection;
