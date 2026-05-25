export interface IOrderItemInfo {
  id: number;
  productId: number;
  variantId: number | null;
  productName: string;
  variantName: string | null;
  image: string | null;
  quantity: number;
  price: number;
  totalPrice: number;
  shopVoucherDiscountAmount?: number;
  platformVoucherDiscountAmount?: number;
  totalVoucherDiscountAmount?: number;
  totalAfterShopVoucher?: number;
  totalAfterAllVouchers?: number;
  platformCommissionRate?: number;
  platformCommissionAmount?: number;
  sellerReceivableAmount?: number;
}

export interface IOrderInfo {
  orderNumber: string;
  userId: number;
  addressId: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAfterDiscount?: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
}

export interface IRecipientInfo {
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string | null;
}

export interface IShipmentStatusLog {
  id: number;
  status: string;
  note: string | null;
  changedAt: string; // ISO date string
  changedBy: string | null;
}

export interface IOrderShipment {
  shipmentId: number;
  orderId: number;
  shop_id: number;
  shopId?: number;
  shop_name?: string;
  shopName?: string;
  shopUserId?: number | null;
  shop_user_id?: number | null;
  shipping_fee: number;
  shippingFee?: number;
  subtotal: number;
  total_amount: number;
  totalAmount?: number;
  totalAfterVoucher?: number;
  total_after_voucher?: number;
  carrier_name: string;
  carrierName?: string;
  tracking_number: string | null;
  trackingNumber?: string | null;
  shipping_status: string;
  shippingStatus?: string;
  is_payout_settled?: boolean;
  isPayoutSettled?: boolean;
  payoutSettled?: boolean;
  payout_settled_at?: string | null;
  payoutSettledAt?: string | null;
  total_after_discount?: number;
  lastReturnRequestId?: number | null;
  last_return_request_id?: number | null;
  order: IOrderInfo;
  recipient: IRecipientInfo;
  items: IOrderItemInfo[];
  statusHistory?: IShipmentStatusLog[];
}

// Legacy flat shape kept for backward-compat
export interface IOrderShipmentFlat {
  id: number;
  order_id: number;
  shop_id: number;
  shipment_code: string;
  shipping_fee: number;
  total_amount: number;
  carrier_name: string;
  tracking_number: string;
  shipping_status: string;
}
