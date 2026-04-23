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
  const res = await axios.get(`${API_URL}/api/brands`);
  return res.data;
};
