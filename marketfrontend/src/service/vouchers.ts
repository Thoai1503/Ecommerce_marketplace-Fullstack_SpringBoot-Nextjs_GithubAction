import axios from "axios";
import {
  AdminVoucher,
  VoucherCampaign,
  VoucherAdminStats,
  VoucherAuditEvent,
  VoucherRedemptionEvent,
  VoucherRulesPayload,
  VoucherScopeRule,
  VoucherSegmentRule,
  VoucherStatus,
} from "@/types";
import { API_URL } from "@/helper/api";

const API = `${API_URL}/api/vouchers`;

// ================= GET ALL =================
export const getVouchers = async (): Promise<AdminVoucher[]> => {
  const res = await axios.get(API);
  return res.data;
};

// ================= GET BY ID =================
export const getVoucherById = async (id: string): Promise<AdminVoucher> => {
  const res = await axios.get(`${API_URL}/api/vouchers/${id}`);
  return res.data;
};

// ================= CREATE =================
export const createVoucher = async (
  data: Partial<AdminVoucher>,
): Promise<AdminVoucher> => {
  const res = await axios.post(`${API_URL}/api/vouchers`, data);
  return res.data;
};

// ================= UPDATE =================
export const updateVoucher = async (
  id: string,
  data: Partial<AdminVoucher>,
): Promise<AdminVoucher> => {
  const res = await axios.put(`${API_URL}/api/vouchers/${id}`, data);
  return res.data;
};

// ================= DELETE =================
export const deleteVoucher = async (id: string): Promise<boolean> => {
  await axios.delete(`${API_URL}/api/vouchers/${id}`);
  return true;
};

// ================= UPDATE STATUS =================
export const updateVoucherStatus = async (
  id: string,
  status: VoucherStatus,
): Promise<AdminVoucher> => {
  const res = await axios.put(`${API_URL}/api/vouchers/${id}`, { status });
  return res.data;
};

// ================= CAMPAIGNS (TẠM MOCK hoặc API sau) =================
export const getVoucherCampaigns = async (): Promise<VoucherCampaign[]> => {
  const res = await axios.get(`${API_URL}/api/vouchercampaigns`);
  return res.data;
};

// ================= STATS =================
export const getVoucherAdminStats = async (): Promise<VoucherAdminStats> => {
  const vouchers = await getVouchers();

  const total = vouchers.length;
  const active = vouchers.filter((v) => v.status === "ACTIVE").length;
  const claimed = vouchers.reduce((s, v) => s + (v.claimedCount || 0), 0);
  const redeemed = vouchers.reduce((s, v) => s + (v.redeemedCount || 0), 0);

  return {
    totalVouchers: total,
    activeVouchers: active,
    redemptionRate: claimed > 0 ? (redeemed / claimed) * 100 : 0,
    totalDiscountAmount: 0,
  };
};

const normalizeScopeRule = (rule: any): VoucherScopeRule => ({
  id: String(rule?.id ?? ""),
  voucherId: String(rule?.voucherId ?? rule?.voucher_id ?? ""),
  scopeType: rule?.scopeType ?? rule?.scope_type ?? "CATEGORY",
  scopeId: Number(rule?.scopeId ?? rule?.scope_id ?? 0),
  includeExclude:
    rule?.includeExclude ?? rule?.include_exclude ?? "INCLUDE",
  createdAt:
    rule?.createdAt ?? rule?.created_at ?? new Date().toISOString(),
});

const normalizeSegmentRule = (rule: any): VoucherSegmentRule => ({
  id: String(rule?.id ?? ""),
  voucherId: String(rule?.voucherId ?? rule?.voucher_id ?? ""),
  segmentType: rule?.segmentType ?? rule?.segment_type ?? "NEW_USER",
  segmentValue: rule?.segmentValue ?? rule?.segment_value ?? null,
});

const normalizeRedemptionEvent = (item: any): VoucherRedemptionEvent => ({
  id: String(item?.id ?? ""),
  voucherId: String(item?.voucherId ?? item?.voucher_id ?? ""),
  userName:
    item?.userName ??
    item?.user_name ??
    (item?.userId ?? item?.user_id ? `User #${item?.userId ?? item?.user_id}` : "Unknown user"),
  orderCode:
    item?.orderCode ??
    item?.order_code ??
    (item?.orderId ?? item?.order_id ? `Order #${item?.orderId ?? item?.order_id}` : "Unknown order"),
  discountAmountApplied: Number(
    item?.discountAmountApplied ?? item?.discount_amount_applied ?? 0,
  ),
  finalOrderAmount: Number(
    item?.finalOrderAmount ?? item?.final_order_amount ?? 0,
  ),
  status: item?.status ?? "SUCCESS",
  redeemedAt:
    item?.redeemedAt ??
    item?.redeemed_at ??
    new Date().toISOString(),
});

const toScopeApiPayload = (voucherId: string, rule: VoucherScopeRule) => ({
  voucherId: Number(voucherId),
  scopeType: rule.scopeType,
  scopeId: Number(rule.scopeId || 0),
  includeExclude: rule.includeExclude,
});

const toSegmentApiPayload = (voucherId: string, rule: VoucherSegmentRule) => ({
  voucherId: Number(voucherId),
  segmentType: rule.segmentType,
  segmentValue: rule.segmentValue || null,
});

// ================= RULES =================
export const getVoucherRules = async (
  voucherId: string,
): Promise<VoucherRulesPayload> => {
  const [scopeRes, segmentRes] = await Promise.all([
    axios.get(`${API_URL}/api/voucher-scope-rules/voucher/${voucherId}`),
    axios.get(`${API_URL}/api/voucher-segment-rules/voucher/${voucherId}`),
  ]);

  return {
    scopeRules: Array.isArray(scopeRes.data)
      ? scopeRes.data.map(normalizeScopeRule)
      : [],
    segmentRules: Array.isArray(segmentRes.data)
      ? segmentRes.data.map(normalizeSegmentRule)
      : [],
  };
};

export const saveVoucherRules = async (
  voucherId: string,
  payload: VoucherRulesPayload,
): Promise<VoucherRulesPayload> => {
  await axios.delete(`${API_URL}/api/voucher-scope-rules/voucher/${voucherId}`);

  const currentSegments = await axios.get(
    `${API_URL}/api/voucher-segment-rules/voucher/${voucherId}`,
  );

  if (Array.isArray(currentSegments.data)) {
    await Promise.all(
      currentSegments.data.map((rule: any) =>
        axios.delete(`${API_URL}/api/voucher-segment-rules/${rule.id}`),
      ),
    );
  }

  const [scopeRules, segmentRules] = await Promise.all([
    Promise.all(
      payload.scopeRules.map((rule) =>
        axios
          .post(
            `${API_URL}/api/voucher-scope-rules`,
            toScopeApiPayload(voucherId, rule),
          )
          .then((res) => normalizeScopeRule(res.data)),
      ),
    ),
    Promise.all(
      payload.segmentRules.map((rule) =>
        axios
          .post(
            `${API_URL}/api/voucher-segment-rules`,
            toSegmentApiPayload(voucherId, rule),
          )
          .then((res) => normalizeSegmentRule(res.data)),
      ),
    ),
  ]);

  return {
    scopeRules,
    segmentRules,
  };
};

// ================= REDEMPTION (tạm mock) =================
export const getVoucherRedemptions = async (
  voucherId: string,
): Promise<VoucherRedemptionEvent[]> => {
  const res = await axios.get(`${API_URL}/api/voucher-redemptions`);
  const rows = Array.isArray(res.data) ? res.data : [];

  return rows
    .filter(
      (item) =>
        String(item?.voucherId ?? item?.voucher_id ?? "") === String(voucherId),
    )
    .map(normalizeRedemptionEvent)
    .sort(
      (a, b) =>
        new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime(),
    );
};

// ================= AUDIT =================
export const getVoucherAuditLogs = async (
  voucherId: string,
): Promise<VoucherAuditEvent[]> => {
  return [];
};
export const getBrands = async (): Promise<any[]> => {
  const res = await axios.get(`${API_URL}/api/brands`);
  return res.data;
};
