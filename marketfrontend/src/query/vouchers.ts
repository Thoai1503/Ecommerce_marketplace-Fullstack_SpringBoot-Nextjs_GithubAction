import { queryOptions } from "@tanstack/react-query";
import {
  getVoucherAuditLogs,
  getVoucherById,
  getVoucherCampaigns,
  getVoucherAdminStats,
  getVoucherRedemptions,
  getVoucherRules,
  getVouchers,
} from "@/service/vouchers";

export const vouchersQuery = {
  all: () =>
    queryOptions({
      queryKey: ["admin", "vouchers"],
      queryFn: getVouchers,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ["admin", "vouchers", id],
      queryFn: () => getVoucherById(id),
      enabled: !!id,
    }),
  campaigns: () =>
    queryOptions({
      queryKey: ["admin", "voucher-campaigns"],
      queryFn: getVoucherCampaigns,
    }),
  stats: () =>
    queryOptions({
      queryKey: ["admin", "voucher-stats"],
      queryFn: getVoucherAdminStats,
    }),
  rules: (id: string) =>
    queryOptions({
      queryKey: ["admin", "voucher-rules", id],
      queryFn: () => getVoucherRules(id),
      enabled: !!id,
    }),
  redemptions: (id: string) =>
    queryOptions({
      queryKey: ["admin", "voucher-redemptions", id],
      queryFn: () => getVoucherRedemptions(id),
      enabled: !!id,
    }),
  audits: (id: string) =>
    queryOptions({
      queryKey: ["admin", "voucher-audits", id],
      queryFn: () => getVoucherAuditLogs(id),
      enabled: !!id,
    }),
};
