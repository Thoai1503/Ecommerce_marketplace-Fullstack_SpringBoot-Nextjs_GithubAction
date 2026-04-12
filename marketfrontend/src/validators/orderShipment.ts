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
}

export interface IOrderInfo {
  orderNumber: string;
  userId: number;
  addressId: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
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
  shopId: number;
  shippingFee: number;
  totalAmount: number;
  carrierName: string;
  trackingNumber: string | null;
  shippingStatus: string;
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
