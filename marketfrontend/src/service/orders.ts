import http from "@/lib/http";
import { Order, OrderStatus, Shipment, ShipmentStatus } from "@/types/index";

/**
 * Admin Orders service — wired to real backend (AdminOrderController).
 * Handles snake_case → camelCase mapping in one place via mapOrder().
 */

export interface OrderListParams {
  status?: string; // ALL | PENDING | CONFIRMED | ...
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface OrderListResult {
  data: Order[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  statusStats: Record<string, number>;
}

// Map BE legacy values to FE OrderStatus enum (FE uses CANCELED — single L)
const normalizeStatus = (raw: any): OrderStatus => {
  const s = String(raw ?? "PENDING").toUpperCase();
  if (s === "CANCELLED") return "CANCELED";
  if (s === "CANCEL") return "CANCELED";
  if (
    [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "COMPLETED",
      "CANCELED",
      "REFUNDED",
    ].includes(s)
  ) {
    return s as OrderStatus;
  }
  return "PENDING";
};

const normalizePayment = (raw: any): "PAID" | "UNPAID" | "REFUNDED" => {
  const s = String(raw ?? "UNPAID").toUpperCase();
  if (s === "PAID" || s === "SUCCESS" || s === "COMPLETED") return "PAID";
  if (s === "REFUNDED") return "REFUNDED";
  return "UNPAID";
};

const mapShipment = (raw: any): Shipment => ({
  id: String(raw.id ?? raw.shipmentId),
  order_id: String(raw.orderId ?? raw.order_id ?? ""),
  shop_id: String(raw.shopId ?? raw.shop_id ?? ""),
  shopName: raw.shopName ?? `Shop #${raw.shopId ?? raw.shop_id ?? ""}`,
  tracking_number: raw.trackingNumber ?? raw.tracking_number ?? "",
  carrier_name: raw.carrierName ?? raw.carrier_name ?? "",
  shipping_status: ((raw.shippingStatus ?? raw.shipping_status ?? "PENDING") as string).toUpperCase() as ShipmentStatus,
  estimated_delivery_at: raw.estimated_delivery_at ?? raw.estimatedDeliveryAt,
  items: raw.items ?? [],
  statusHistory: raw.statusHistory ?? [],
  shipping_fee: Number(raw.shippingFee ?? raw.shipping_fee ?? 0),
  created_at: raw.created_at ?? raw.createdAt ?? "",
  updated_at: raw.updated_at ?? raw.updatedAt ?? "",
});

export const mapOrder = (raw: any): Order => {
  const items = Array.isArray(raw.items)
    ? raw.items.map((it: any) => ({
        id: String(it.id ?? it.orderItemId),
        productName: it.productName ?? "",
        productImage: it.productImage ?? "https://placehold.co/100x100?text=No+Image",
        sku: it.sku ?? "",
        variant: it.variant ?? it.variantName ?? "",
        quantity: Number(it.quantity ?? 0),
        price: Number(it.price ?? 0),
        status: it.status ?? "Ready",
      }))
    : undefined;

  const shipments = Array.isArray(raw.shipments) ? raw.shipments.map(mapShipment) : undefined;

  return {
    id: String(raw.id ?? raw.orderId),
    orderCode: raw.orderCode ?? raw.orderNumber ?? `#ORD-${raw.id ?? ""}`,
    customerName: raw.customerName ?? "",
    customerEmail: raw.customerEmail ?? "",
    customerPhone: raw.customerPhone ?? "",
    shippingAddress: raw.shippingAddress ?? "",
    totalAmount: Number(raw.totalAmount ?? raw.finalAmount ?? 0),
    subtotalAmount: Number(raw.subtotalAmount ?? raw.totalAmount ?? 0),
    discountAmount: Number(raw.discountAmount ?? 0),
    shippingAmount: Number(raw.shippingAmount ?? raw.shippingFee ?? 0),
    taxAmount: Number(raw.taxAmount ?? 0),
    itemsCount: Number(raw.itemsCount ?? items?.length ?? 0),
    paymentStatus: normalizePayment(raw.paymentStatus),
    paymentMethod: raw.paymentMethod ?? "",
    transactionId: raw.transactionId ?? "",
    deliveryNumber: raw.deliveryNumber ?? raw.trackingNumber ?? "",
    status: normalizeStatus(raw.status ?? raw.orderStatus),
    priority: (raw.priority ?? "NORMAL") as "NORMAL" | "HIGH",
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
    items,
    shipments,
    internalNote: raw.internalNote ?? raw.note ?? undefined,
    isFlagged: !!raw.isFlagged,
    trackingNumber: raw.trackingNumber ?? undefined,
  } as Order;
};

const extractError = (e: any, fallback: string): string => {
  const msg = e?.response?.data?.message ?? e?.response?.data ?? e?.message;
  if (!msg) return fallback;
  const s = typeof msg === "string" ? msg : JSON.stringify(msg);
  // chặn SQL/internal leak
  if (/SQL|sql|java\.|Exception|Stack/i.test(s)) return fallback;
  return s;
};

export const getOrders = async (params?: OrderListParams): Promise<OrderListResult> => {
  try {
    const res = await http.get("/admin/orders", { params });
    const body = res.data ?? {};
    const list = Array.isArray(body) ? body : (body.data ?? []);
    return {
      data: list.map(mapOrder),
      total: body.total ?? list.length,
      page: body.page ?? params?.page ?? 1,
      size: body.size ?? params?.size ?? 20,
      totalPages: body.totalPages ?? 1,
      statusStats: body.statusStats ?? {},
    };
  } catch (e) {
    throw new Error(extractError(e, "Không tải được danh sách đơn hàng"));
  }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const res = await http.get(`/admin/orders/${id}`);
    return mapOrder(res.data);
  } catch (e) {
    throw new Error(extractError(e, "Không tải được chi tiết đơn hàng"));
  }
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  note?: string,
): Promise<boolean> => {
  // FE uses CANCELED, BE expects CANCELLED (UPPERCASE double-L)
  const beStatus = status === "CANCELED" ? "CANCELLED" : status;
  try {
    await http.put(`/admin/orders/${id}/status`, { status: beStatus, note });
    return true;
  } catch (e) {
    throw new Error(extractError(e, "Cập nhật trạng thái thất bại"));
  }
};

export const updateTracking = async (
  id: string,
  payload: { trackingNumber: string; carrier?: string; shipmentId?: string | number },
): Promise<boolean> => {
  try {
    await http.put(`/admin/orders/${id}/tracking`, payload);
    return true;
  } catch (e) {
    throw new Error(extractError(e, "Cập nhật mã vận đơn thất bại"));
  }
};

// Backward-compat alias
export const updateTrackingNumber = async (id: string, trackingNumber: string) =>
  updateTracking(id, { trackingNumber });

export const cancelOrder = async (id: string, reason: string): Promise<boolean> => {
  try {
    await http.post(`/admin/orders/${id}/cancel`, { reason });
    return true;
  } catch (e) {
    throw new Error(extractError(e, "Hủy đơn thất bại"));
  }
};

export const refundOrder = async (
  id: string,
  amount: number,
  reason: string,
): Promise<boolean> => {
  try {
    await http.post(`/admin/orders/${id}/refund`, { amount, reason });
    return true;
  } catch (e) {
    throw new Error(extractError(e, "Hoàn tiền thất bại"));
  }
};

export const updateShipmentStatus = async (
  shipmentId: string,
  status: ShipmentStatus,
): Promise<boolean> => {
  try {
    await http.put(`/admin/orders/shipments/${shipmentId}/status`, { status });
    return true;
  } catch (e) {
    throw new Error(extractError(e, "Cập nhật trạng thái kiện hàng thất bại"));
  }
};

export interface UpdateOrderItemPayload {
  itemId?: string | number;
  productId: string | number;
  variantId?: string | number | null;
  quantity: number;
  price: number;
}

export const updateOrderItems = async (
  id: string,
  items: UpdateOrderItemPayload[],
  reason?: string,
): Promise<Order | null> => {
  try {
    const payload = {
      items: items.map((it) => ({
        itemId: it.itemId != null ? Number(it.itemId) : undefined,
        productId: Number(it.productId),
        variantId: it.variantId != null ? Number(it.variantId) : null,
        quantity: Number(it.quantity),
        price: Number(it.price),
      })),
      reason,
    };
    const res = await http.put(`/admin/orders/${id}/items`, payload);
    return mapOrder(res.data);
  } catch (e) {
    throw new Error(extractError(e, "Cập nhật sản phẩm đơn hàng thất bại"));
  }
};

export const updateOrderNote = async (id: string, note: string): Promise<boolean> => {
  // Note: BE doesn't have explicit endpoint — reuse status update with note (no-op transition rejected),
  // so for now we simply succeed locally. Caller can wire to a dedicated endpoint when added.
  return true;
};

export default {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateTracking,
  updateTrackingNumber,
  cancelOrder,
  refundOrder,
  updateShipmentStatus,
  updateOrderNote,
  updateOrderItems,
};
