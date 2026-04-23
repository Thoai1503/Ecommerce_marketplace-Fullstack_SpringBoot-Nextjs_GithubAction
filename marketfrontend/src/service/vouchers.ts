import axios from "axios";
import {
  AdminVoucher,
  VoucherCampaign,
  VoucherAdminStats,
  VoucherAuditEvent,
  VoucherRedemptionEvent,
  VoucherRulesPayload,
  VoucherStatus,
} from "@/types";

const API = "http://localhost:8000/api/vouchers";

// ================= GET ALL =================
export const getVouchers = async (): Promise<AdminVoucher[]> => {
  const res = await axios.get(API);
  return res.data;
};

// ================= GET BY ID =================
export const getVoucherById = async (id: string): Promise<AdminVoucher> => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

// ================= CREATE =================
export const createVoucher = async (
  data: Partial<AdminVoucher>,
): Promise<AdminVoucher> => {
  const res = await axios.post("http://localhost:8000/api/vouchers", data);
  return res.data;
};

// ================= UPDATE =================
export const updateVoucher = async (
  id: string,
  data: Partial<AdminVoucher>,
): Promise<AdminVoucher> => {
  const res = await axios.put(`${API}/${id}`, data);
  return res.data;
};

// ================= DELETE =================
export const deleteVoucher = async (id: string): Promise<boolean> => {
  await axios.delete(`${API}/${id}`);
  return true;
};

// ================= UPDATE STATUS =================
export const updateVoucherStatus = async (
  id: string,
  status: VoucherStatus,
): Promise<AdminVoucher> => {
  const res = await axios.put(`${API}/${id}`, { status });
  return res.data;
};

// ================= CAMPAIGNS (TẠM MOCK hoặc API sau) =================
export const getVoucherCampaigns = async (): Promise<VoucherCampaign[]> => {
  const res = await axios.get("http://localhost:8000/api/vouchercampaigns");
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

// ================= RULES (chưa có backend) =================
export const getVoucherRules = async (): Promise<VoucherRulesPayload> => {
  return { scopeRules: [], segmentRules: [] };
};

export const saveVoucherRules = async (
  voucherId: string,
  payload: VoucherRulesPayload,
): Promise<VoucherRulesPayload> => {
  return payload;
};

// ================= REDEMPTION (tạm mock) =================
export const getVoucherRedemptions = async (
  voucherId: string,
): Promise<VoucherRedemptionEvent[]> => {
  return [];
};

// ================= AUDIT =================
export const getVoucherAuditLogs = async (
  voucherId: string,
): Promise<VoucherAuditEvent[]> => {
  return [];
};
export const getBrands = async (): Promise<any[]> => {
  const res = await axios.get("http://localhost:8000/api/brands");
  return res.data;
};
