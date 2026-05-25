import http from "@/lib/http";

const asNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asBooleanOrNull = (value: unknown): boolean | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return null;
};

export type ReturnRequestStatusAdmin =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "SHIPPING"
  | "RECEIVED"
  | "REFUNDED"
  | "INSPECTION_PASSED"
  | "INSPECTION_FAILED"
  | "CANCELED"
  | string;

export interface ReturnRequestItemAdmin {
  id: number;
  returnRequestId: number;
  orderItemId: number;
  quantity: number;
  requestedAmount: number;
  refundedAmount: number;
  productName?: string | null;
  variantName?: string | null;
  productImage?: string | null;
  price?: number | null;
  totalPrice?: number | null;
  totalAfterShopVoucher?: number | null;
  totalAfterAllVouchers?: number | null;
  orderQuantity?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ReturnRequestAttachmentAdmin {
  id: number;
  returnRequestId: number;
  fileUrl: string;
  fileType: string;
  description?: string | null;
  createdAt?: string | null;
}

export interface ReturnShipmentAdmin {
  id?: number;
  returnRequestId?: number;
  trackingCode?: string | null;
  status?: string | null;
  pickupAddressId?: number | null;
  returnAddressId?: number | null;
  scheduledPickupDate?: string | null;
  actualPickupDate?: string | null;
  deliveryDate?: string | null;
  courierId?: number | null;
  courierName?: string | null;
  logisticsWebhookCount?: number | null;
  notes?: string | null;
  failedReason?: string | null;
  retryCount?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ReturnShipmentHistoryAdmin {
  id?: number;
  returnShipmentId?: number;
  status?: string | null;
  description?: string | null;
  location?: string | null;
  eventCode?: string | null;
  source?: string | null;
  externalEventId?: string | null;
  timestamp?: string | null;
  createdAt?: string | null;
}

export interface ReturnRequestTimelineAdmin {
  id?: number;
  returnRequestId?: number;
  eventType?: string | null;
  eventDetails?: string | null;
  actorId?: number | null;
  actorType?: string | null;
  timestamp?: string | null;
}

export interface ReturnRequestAdmin {
  id: number;
  orderId: number;
  shopId: number;
  customerId: number;
  orderShipmentId?: number | null;
  status: ReturnRequestStatusAdmin;
  reason?: string | null;
  quantity: number;
  requestedAmount: number;
  approvedAmount?: number | null;
  finalRequestedAmount?: number | null;
  refundedAmount: number;
  voucherClawbackAmount?: number | null;
  platformVoucherClawbackAmount?: number | null;
  shopVoucherInvalidated?: boolean | null;
  firstShopVoucherInvalidation?: boolean | null;
  showShopVoucherInvalidationSignal?: boolean | null;
  orderNumber?: string | null;
  orderTrackingNumber?: string | null;
  shipmentTrackingNumber?: string | null;
  carrierName?: string | null;
  shippingStatus?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAvatarUrl?: string | null;
  shopName?: string | null;
  shopLogo?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items: ReturnRequestItemAdmin[];
  attachments: ReturnRequestAttachmentAdmin[];
  returnShipment?: ReturnShipmentAdmin | null;
  returnShipmentHistory?: ReturnShipmentHistoryAdmin[];
  timeline?: ReturnRequestTimelineAdmin[];
}

export interface ReturnRequestListResponse {
  data: ReturnRequestAdmin[];
  meta: {
    page: number;
    total: number;
    perPage: number;
  };
  stats: {
    total: number;
    pending: number;
    refunded: number;
    amount: number;
    byStatus?: Record<string, number>;
  };
}

const normalizeReturnRequest = (raw: any): ReturnRequestAdmin => {
  const voucherClawbackAmount =
    asNumberOrNull(
      raw?.voucherClawbackAmount ?? raw?.voucher_clawback_amount,
    ) ?? 0;
  const platformVoucherClawbackAmount =
    asNumberOrNull(
      raw?.platformVoucherClawbackAmount ??
        raw?.platform_voucher_clawback_amount,
    ) ?? null;

  return {
    ...raw,
    voucherClawbackAmount,
    platformVoucherClawbackAmount,
    shopVoucherInvalidated: asBooleanOrNull(
      raw?.shopVoucherInvalidated ?? raw?.shop_voucher_invalidated,
    ),
    firstShopVoucherInvalidation: asBooleanOrNull(
      raw?.firstShopVoucherInvalidation ?? raw?.first_shop_voucher_invalidation,
    ),
    showShopVoucherInvalidationSignal: asBooleanOrNull(
      raw?.showShopVoucherInvalidationSignal ??
        raw?.show_shop_voucher_invalidation_signal,
    ),
  } as ReturnRequestAdmin;
};

type VoucherRedemptionByOrder = {
  id?: number | null;
  voucherId?: number | null;
  discountAmountApplied?: number | null;
};

const normalizeVoucherRedemptionByOrder = (
  raw: any,
): VoucherRedemptionByOrder => ({
  id: asNumberOrNull(raw?.id),
  voucherId: asNumberOrNull(raw?.voucherId ?? raw?.voucher_id),
  discountAmountApplied: asNumberOrNull(
    raw?.discountAmountApplied ?? raw?.discount_amount_applied,
  ),
});

const isPlatformVoucher = async (voucherId: number): Promise<boolean> => {
  try {
    const { data } = await http.get(`/api/vouchers/${voucherId}`);
    const issuerType = String(data?.issuerType ?? data?.issuer_type ?? "")
      .trim()
      .toUpperCase();
    return issuerType === "PLATFORM";
  } catch {
    return false;
  }
};

export const getPlatformVoucherDiscountAppliedFromRedemption = async (
  orderId: number,
): Promise<any> => {
  const { data } = await http.get(`/api/voucher-redemptions/order/${orderId}`);
  const redemptions: VoucherRedemptionByOrder[] = Array.isArray(data)
    ? data.map(normalizeVoucherRedemptionByOrder)
    : [];

  const sortedByNewest = [...redemptions].sort(
    (a, b) => Number(b.id ?? 0) - Number(a.id ?? 0),
  );

  for (const redemption of sortedByNewest) {
    const voucherId = Number(redemption.voucherId ?? 0);
    if (voucherId <= 0) {
      continue;
    }

    if (await isPlatformVoucher(voucherId)) {
      return redemption;
    }
  }

  return null;
};

export const getAdminReturnRequests = async (params?: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  shopId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ReturnRequestListResponse> => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page || 1));
  query.set("size", String(params?.size || 10));
  if (params?.status && params.status !== "ALL")
    query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.shopId) query.set("shopId", params.shopId);
  if (params?.customerId) query.set("customerId", params.customerId);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);

  const { data } = await http.get(
    `/api/refunds${query.toString() ? `?${query.toString()}` : ""}`,
  );
  return {
    data: Array.isArray(data?.data)
      ? data.data.map(normalizeReturnRequest)
      : [],
    meta: data?.meta || { page: 1, total: 0, perPage: params?.size || 10 },
    stats: data?.stats || {
      total: 0,
      pending: 0,
      refunded: 0,
      amount: 0,
      byStatus: {},
    },
  };
};

export const getSellerReturnRequests = async (
  shopId: number,
  params?: {
    page?: number;
    size?: number;
    status?: string;
    search?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<ReturnRequestListResponse> => {
  const query = new URLSearchParams();
  query.set("page", String(params?.page || 1));
  query.set("size", String(params?.size || 10));
  if (params?.status && params.status !== "ALL")
    query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.customerId) query.set("customerId", params.customerId);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);

  const { data } = await http.get(
    `/api/refunds/shop/${shopId}${query.toString() ? `?${query.toString()}` : ""}`,
  );
  return {
    data: Array.isArray(data?.data)
      ? data.data.map(normalizeReturnRequest)
      : [],
    meta: data?.meta || { page: 1, total: 0, perPage: params?.size || 10 },
    stats: data?.stats || {
      total: 0,
      pending: 0,
      refunded: 0,
      amount: 0,
      byStatus: {},
    },
  };
};

export const getReturnRequestById = async (
  id: number,
): Promise<ReturnRequestAdmin> => {
  try {
    const { data } = await http.get(`/api/refunds/${id}/detail`);
    return normalizeReturnRequest(data);
  } catch {
    const { data } = await http.get(`/api/refunds/${id}`);
    return normalizeReturnRequest(data);
  }
};

export const updateReturnRequestStatus = async (
  id: number,
  status: ReturnRequestStatusAdmin,
  refundedAmount?: number,
): Promise<ReturnRequestAdmin> => {
  const { data } = await http.patch(`/api/refunds/${id}/status`, null, {
    params: {
      status,
      refundedAmount,
    },
  });

  return data;
};
