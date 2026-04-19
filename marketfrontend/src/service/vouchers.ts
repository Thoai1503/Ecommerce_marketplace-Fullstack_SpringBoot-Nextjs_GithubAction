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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const CAMPAIGNS: VoucherCampaign[] = [
  {
    id: "c1",
    code: "MEGA_11_11",
    name: "Mega Day 11.11",
    description: "Chien dich toan san thang 11",
    startAt: "2026-11-01T00:00:00Z",
    endAt: "2026-11-12T23:59:59Z",
    status: "ACTIVE",
    createdAt: "2026-10-15T08:00:00Z",
  },
  {
    id: "c2",
    code: "WELCOME_NEW_USER",
    name: "Welcome New User",
    description: "Voucher cho khach hang moi",
    startAt: "2026-01-01T00:00:00Z",
    endAt: "2026-12-31T23:59:59Z",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "c3",
    code: "BRAND_PARTNER_Q2",
    name: "Brand Partner Q2",
    description: "Chien dich hop tac thuong hieu",
    startAt: "2026-04-01T00:00:00Z",
    endAt: "2026-06-30T23:59:59Z",
    status: "PAUSED",
    createdAt: "2026-03-21T09:30:00Z",
  },
];

const BASE_VOUCHERS: AdminVoucher[] = [
  {
    id: "v1",
    campaignId: "c1",
    campaignCode: "MEGA_11_11",
    code: "MEGA11P20",
    title: "Giam 20% toi da 150k",
    description: "Ap dung toan san",
    issuerType: "PLATFORM",
    issuerId: null,
    issuerName: "Platform",
    discountType: "PERCENT",
    discountPercent: 20,
    discountAmount: null,
    maxDiscountAmount: 150000,
    minOrderValue: 500000,
    maxOrderValue: null,
    totalQuota: 10000,
    claimedCount: 5200,
    redeemedCount: 3200,
    perUserQuota: 1,
    stackable: false,
    claimStartAt: "2026-11-01T00:00:00Z",
    claimEndAt: "2026-11-11T23:59:59Z",
    validFrom: "2026-11-01T00:00:00Z",
    validTo: "2026-11-12T23:59:59Z",
    status: "ACTIVE",
    priority: 10,
    createdAt: "2026-10-20T02:00:00Z",
  },
  {
    id: "v2",
    campaignId: "c2",
    campaignCode: "WELCOME_NEW_USER",
    code: "NEWBIE50K",
    title: "Khach moi giam 50k",
    description: "Chi ap dung user FIRST_ORDER",
    issuerType: "PLATFORM",
    issuerId: null,
    issuerName: "Platform",
    discountType: "FIXED",
    discountPercent: null,
    discountAmount: 50000,
    maxDiscountAmount: null,
    minOrderValue: 299000,
    maxOrderValue: null,
    totalQuota: 50000,
    claimedCount: 15200,
    redeemedCount: 9800,
    perUserQuota: 1,
    stackable: false,
    claimStartAt: "2026-01-01T00:00:00Z",
    claimEndAt: "2026-12-31T23:59:59Z",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
    status: "ACTIVE",
    priority: 20,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "v3",
    campaignId: "c3",
    campaignCode: "BRAND_PARTNER_Q2",
    code: "SONYFREESHIP",
    title: "Mien phi van chuyen Sony",
    description: "Danh cho nganh hang electronics",
    issuerType: "BRAND",
    issuerId: 7,
    issuerName: "Sony",
    discountType: "FREE_SHIPPING",
    discountPercent: null,
    discountAmount: null,
    maxDiscountAmount: null,
    minOrderValue: 0,
    maxOrderValue: null,
    totalQuota: 2000,
    claimedCount: 1300,
    redeemedCount: 800,
    perUserQuota: 2,
    stackable: true,
    claimStartAt: "2026-04-01T00:00:00Z",
    claimEndAt: "2026-06-30T23:59:59Z",
    validFrom: "2026-04-01T00:00:00Z",
    validTo: "2026-06-30T23:59:59Z",
    status: "PAUSED",
    priority: 40,
    createdAt: "2026-03-25T07:20:00Z",
  },
  {
    id: "v4",
    campaignId: null,
    campaignCode: null,
    code: "SHOP2P15",
    title: "Shop Dien Tu 247 giam 15%",
    description: "Voucher shop",
    issuerType: "SHOP",
    issuerId: 2,
    issuerName: "Dien tu 247",
    discountType: "PERCENT",
    discountPercent: 15,
    discountAmount: null,
    maxDiscountAmount: 80000,
    minOrderValue: 350000,
    maxOrderValue: null,
    totalQuota: 1500,
    claimedCount: 1490,
    redeemedCount: 1302,
    perUserQuota: 1,
    stackable: false,
    claimStartAt: "2026-02-01T00:00:00Z",
    claimEndAt: "2026-12-31T23:59:59Z",
    validFrom: "2026-02-01T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
    status: "DEPLETED",
    priority: 50,
    createdAt: "2026-02-01T00:00:00Z",
  },
];

const MOCK_VOUCHERS: AdminVoucher[] = Array.from({ length: 48 }, (_, i) => {
  const base = BASE_VOUCHERS[i % BASE_VOUCHERS.length];
  return {
    ...base,
    id: `${base.id}_${i + 1}`,
    code: `${base.code}_${i + 1}`,
    claimedCount: Math.min(base.totalQuota, base.claimedCount + i * 7),
    redeemedCount: Math.min(base.totalQuota, base.redeemedCount + i * 5),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

const RULES_DB: Record<string, VoucherRulesPayload> = {
  v1_1: {
    scopeRules: [
      {
        id: "sr-1",
        voucherId: "v1_1",
        scopeType: "CATEGORY",
        scopeId: 183,
        includeExclude: "INCLUDE",
        createdAt: new Date().toISOString(),
      },
    ],
    segmentRules: [
      {
        id: "seg-1",
        voucherId: "v1_1",
        segmentType: "APP_ONLY",
        segmentValue: null,
      },
    ],
  },
};

const REDemptionTimeline = (voucherId: string): VoucherRedemptionEvent[] =>
  Array.from({ length: 8 }, (_, idx) => ({
    id: `${voucherId}-rd-${idx + 1}`,
    voucherId,
    userName: `User ${idx + 1}`,
    orderCode: `ORD2026${1000 + idx}`,
    discountAmountApplied: 15000 + idx * 5000,
    finalOrderAmount: 350000 + idx * 120000,
    status:
      idx % 6 === 0 ? "FAILED" : idx % 5 === 0 ? "ROLLED_BACK" : "SUCCESS",
    redeemedAt: new Date(Date.now() - idx * 3600 * 1000).toISOString(),
  }));

const AUDIT_TIMELINE = (voucherId: string): VoucherAuditEvent[] => [
  {
    id: `${voucherId}-au-1`,
    voucherId,
    eventType: "CREATED",
    actorType: "ADMIN",
    actorName: "Admin User",
    note: "Voucher duoc tao",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: `${voucherId}-au-2`,
    voucherId,
    eventType: "STATUS_CHANGED",
    actorType: "ADMIN",
    actorName: "Admin User",
    note: "DRAFT -> ACTIVE",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: `${voucherId}-au-3`,
    voucherId,
    eventType: "RULE_UPDATED",
    actorType: "ADMIN",
    actorName: "Marketing Ops",
    note: "Cap nhat pham vi ap dung",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: `${voucherId}-au-4`,
    voucherId,
    eventType: "AUTO_EXPIRE_CHECK",
    actorType: "SYSTEM",
    actorName: "Voucher Cron",
    note: "Job kiem tra han su dung",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const autoStatus = (voucher: AdminVoucher): AdminVoucher => {
  const now = Date.now();
  const validTo = new Date(voucher.validTo).getTime();
  if (
    voucher.status === "ARCHIVED" ||
    voucher.status === "PAUSED" ||
    voucher.status === "DRAFT"
  ) {
    return voucher;
  }
  if (voucher.redeemedCount >= voucher.totalQuota) {
    return { ...voucher, status: "DEPLETED" };
  }
  if (validTo < now) {
    return { ...voucher, status: "EXPIRED" };
  }
  return voucher;
};

export const getVouchers = async (): Promise<AdminVoucher[]> => {
  await delay(500);
  return MOCK_VOUCHERS.map(autoStatus);
};

export const getVoucherById = async (
  id: string,
): Promise<AdminVoucher | undefined> => {
  await delay(450);
  const voucher = MOCK_VOUCHERS.find((item) => item.id === id);
  return voucher ? autoStatus(voucher) : undefined;
};

export const getVoucherCampaigns = async (): Promise<VoucherCampaign[]> => {
  await delay(350);
  return CAMPAIGNS;
};

export const createVoucher = async (
  data: Partial<AdminVoucher>,
): Promise<AdminVoucher> => {
  await delay(800);
  const item: AdminVoucher = {
    campaignId: data.campaignId || null,
    campaignCode: data.campaignCode || null,
    code: String(data.code || "NEW_VOUCHER"),
    title: String(data.title || "New Voucher"),
    description: data.description || "",
    issuerType: data.issuerType || "PLATFORM",
    issuerId: data.issuerId || null,
    issuerName: data.issuerName || null,
    discountType: data.discountType || "PERCENT",
    discountPercent: data.discountPercent ?? 10,
    discountAmount: data.discountAmount ?? null,
    maxDiscountAmount: data.maxDiscountAmount ?? null,
    minOrderValue: Number(data.minOrderValue || 0),
    maxOrderValue: data.maxOrderValue ?? null,
    totalQuota: Number(data.totalQuota || 100),
    claimedCount: 0,
    redeemedCount: 0,
    perUserQuota: Number(data.perUserQuota || 1),
    stackable: Boolean(data.stackable),
    claimStartAt: String(data.claimStartAt || new Date().toISOString()),
    claimEndAt: String(
      data.claimEndAt || new Date(Date.now() + 7 * 86400000).toISOString(),
    ),
    validFrom: String(data.validFrom || new Date().toISOString()),
    validTo: String(
      data.validTo || new Date(Date.now() + 7 * 86400000).toISOString(),
    ),
    status: data.status || "DRAFT",
    priority: Number(data.priority || 100),
    id: `v${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  MOCK_VOUCHERS.unshift(item);
  return item;
};

export const updateVoucher = async (
  id: string,
  data: Partial<AdminVoucher>,
): Promise<AdminVoucher> => {
  await delay(800);
  const idx = MOCK_VOUCHERS.findIndex((v) => v.id === id);
  if (idx < 0) throw new Error("Voucher not found");
  MOCK_VOUCHERS[idx] = { ...MOCK_VOUCHERS[idx], ...data };
  return autoStatus(MOCK_VOUCHERS[idx]);
};

export const deleteVoucher = async (id: string): Promise<boolean> => {
  await delay(500);
  const idx = MOCK_VOUCHERS.findIndex((v) => v.id === id);
  if (idx < 0) return false;
  MOCK_VOUCHERS.splice(idx, 1);
  return true;
};

export const getVoucherAdminStats = async (): Promise<VoucherAdminStats> => {
  await delay(300);
  const items = MOCK_VOUCHERS.map(autoStatus);
  const total = items.length;
  const active = items.filter((v) => v.status === "ACTIVE").length;
  const claimed = items.reduce((sum, v) => sum + v.claimedCount, 0);
  const redeemed = items.reduce((sum, v) => sum + v.redeemedCount, 0);
  const redemptionRate = claimed > 0 ? (redeemed / claimed) * 100 : 0;
  const discountFromFixed = items
    .filter((v) => v.discountType === "FIXED")
    .reduce((sum, v) => sum + (v.discountAmount || 0) * v.redeemedCount, 0);

  return {
    totalVouchers: total,
    activeVouchers: active,
    redemptionRate: Number(redemptionRate.toFixed(2)),
    totalDiscountAmount: discountFromFixed,
  };
};

export const updateVoucherStatus = async (
  id: string,
  status: VoucherStatus,
): Promise<AdminVoucher> => {
  return updateVoucher(id, { status });
};

export const getVoucherRules = async (
  voucherId: string,
): Promise<VoucherRulesPayload> => {
  await delay(350);
  if (!RULES_DB[voucherId]) {
    RULES_DB[voucherId] = { scopeRules: [], segmentRules: [] };
  }
  return RULES_DB[voucherId];
};

export const saveVoucherRules = async (
  voucherId: string,
  payload: VoucherRulesPayload,
): Promise<VoucherRulesPayload> => {
  await delay(500);
  const normalizedScope: VoucherScopeRule[] = payload.scopeRules.map(
    (r, idx) => ({
      ...r,
      id: r.id || `${voucherId}-scope-${idx + 1}`,
      voucherId,
      createdAt: r.createdAt || new Date().toISOString(),
    }),
  );
  const normalizedSegments: VoucherSegmentRule[] = payload.segmentRules.map(
    (r, idx) => ({
      ...r,
      id: r.id || `${voucherId}-segment-${idx + 1}`,
      voucherId,
    }),
  );
  RULES_DB[voucherId] = {
    scopeRules: normalizedScope,
    segmentRules: normalizedSegments,
  };
  return RULES_DB[voucherId];
};

export const getVoucherRedemptions = async (
  voucherId: string,
): Promise<VoucherRedemptionEvent[]> => {
  await delay(300);
  return REDemptionTimeline(voucherId);
};

export const getVoucherAuditLogs = async (
  voucherId: string,
): Promise<VoucherAuditEvent[]> => {
  await delay(280);
  return AUDIT_TIMELINE(voucherId);
};
