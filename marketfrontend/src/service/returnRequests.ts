import http from "@/lib/http";

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

export const getAdminReturnRequests = async (): Promise<
  ReturnRequestAdmin[]
> => {
  const { data } = await http.get("/api/refunds");
  return Array.isArray(data) ? data : [];
};

export const getSellerReturnRequests = async (
  shopId: number,
): Promise<ReturnRequestAdmin[]> => {
  const { data } = await http.get(`/api/refunds/shop/${shopId}`);
  return Array.isArray(data) ? data : [];
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
