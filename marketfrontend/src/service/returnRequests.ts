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
}

export const getAdminReturnRequests = async (): Promise<
  ReturnRequestAdmin[]
> => {
  const { data } = await http.get("/api/refunds");
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
