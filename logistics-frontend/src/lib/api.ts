import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_LOGISTIC_URL ?? "http://localhost:8007";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ShipmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKED_UP"
  | "SHIPPING"
  | "DELIVERING"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface Shipment {
  id: number;
  trackingCode: string;
  orderShipmentRefId: number;
  shopRefId: number;
  partnerId: number;
  recipientId: number;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  recipient?: ShipmentRecipient;
  items?: ShipmentItem[];
}

export interface ShipmentRecipient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  province?: number;
  district?: number;
  ward?: number;
}

export interface ShipmentItem {
  id: number;
  productName: string;
  sku?: string;
  quantity: number;
  price?: number;
}

export interface ShipmentStatusHistory {
  id: number;
  shipmentId: number;
  status: ShipmentStatus;
  description?: string;
  location?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

const FIRST_MOCK_TIMELINE_SHIPMENT_ID = 1;

const firstShipmentMockTimeline: ShipmentStatusHistory[] = [
  {
    id: 900001,
    shipmentId: FIRST_MOCK_TIMELINE_SHIPMENT_ID,
    status: "PENDING",
    description: "Đơn hàng đã được tạo",
    location: "Hệ thống",
    updatedBy: "system",
    updatedAt: "2026-04-01T08:00:00",
  },
  {
    id: 900002,
    shipmentId: FIRST_MOCK_TIMELINE_SHIPMENT_ID,
    status: "CONFIRMED",
    description: "Đã xác nhận thông tin vận đơn",
    location: "Kho tổng HCM",
    updatedBy: "admin",
    updatedAt: "2026-04-01T09:30:00",
  },
  {
    id: 900003,
    shipmentId: FIRST_MOCK_TIMELINE_SHIPMENT_ID,
    status: "SHIPPING",
    description: "Kiện hàng đang được trung chuyển",
    location: "Trạm phân loại Quận 7",
    updatedBy: "system",
    updatedAt: "2026-04-01T14:45:00",
  },
];

export function getTracking(trackingCode: string) {
  return api.get<Shipment>(`/api/logistics/shipments/tracking/${trackingCode}`);
}

export function getShipmentTimeline(shipmentId: number) {
  if (shipmentId === FIRST_MOCK_TIMELINE_SHIPMENT_ID) {
    return Promise.resolve({ data: firstShipmentMockTimeline });
  }
  return api.get<ShipmentStatusHistory[]>(
    `/api/logistics/shipments/${shipmentId}/timeline`,
  );
}

export function listShipments(params?: {
  status?: ShipmentStatus;
  trackingCode?: string;
  shopRefId?: number;
  page?: number;
  size?: number;
}) {
  return api.get<PageResponse<Shipment>>("/api/logistics/shipments", {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      status: params?.status,
      trackingCode: params?.trackingCode,
      shopRefId: params?.shopRefId,
    },
  });
}

export function updateShipmentStatus(
  orderShipmentRefId: number,
  status: ShipmentStatus,
) {
  return api.post("/api/logistics/shipments", {
    orderShipmentRefId,
    status,
  });
}
