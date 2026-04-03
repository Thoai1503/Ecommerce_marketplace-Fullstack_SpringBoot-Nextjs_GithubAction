import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_LOGISTICS_API_BASE_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ShipmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RECEIVED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface ShipmentItem {
  id?: string;
  shipmentId?: string;
  productName: string;
  quantity: number;
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  address: string;
}

export interface Shipment {
  id: string;
  trackingCode: string;
  orderId: string;
  shopId: string;
  customer: Customer;
  status: ShipmentStatus;
  createdAt: string;
  expectedDeliveryAt?: string;
  items?: ShipmentItem[];
  statusHistory?: ShipmentStatusHistory[];
}

export interface ShipmentStatusHistory {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description?: string;
  updatedAt: string;
}

// Mock data
const mockShipments: Shipment[] = [
  {
    id: "1",
    trackingCode: "LOG123456789",
    orderId: "ORD001",
    shopId: "SHOP001",
    customer: {
      id: "CUST001",
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    status: "DELIVERED",
    createdAt: "2024-03-10T10:00:00Z",
    expectedDeliveryAt: "2024-03-12T14:00:00Z",
    items: [
      { id: "1", productName: "iPhone 15", quantity: 1 },
      { id: "2", productName: "Ốp lưng silicone", quantity: 1 },
    ],
    statusHistory: [
      {
        id: "1",
        shipmentId: "1",
        status: "PENDING",
        description: "Đơn hàng đã được tạo",
        updatedAt: "2024-03-10T10:00:00Z",
      },
      {
        id: "2",
        shipmentId: "1",
        status: "CONFIRMED",
        description: "Đơn hàng đã được xác nhận",
        updatedAt: "2024-03-10T11:00:00Z",
      },
      {
        id: "3",
        shipmentId: "1",
        status: "RECEIVED",
        description: "Đã nhận hàng từ shop",
        updatedAt: "2024-03-10T14:00:00Z",
      },
      {
        id: "4",
        shipmentId: "1",
        status: "IN_TRANSIT",
        description: "Đang vận chuyển đến kho đích",
        updatedAt: "2024-03-11T09:00:00Z",
      },
      {
        id: "5",
        shipmentId: "1",
        status: "OUT_FOR_DELIVERY",
        description: "Đang giao hàng",
        updatedAt: "2024-03-12T10:00:00Z",
      },
      {
        id: "6",
        shipmentId: "1",
        status: "DELIVERED",
        description: "Đã giao hàng thành công",
        updatedAt: "2024-03-12T14:30:00Z",
      },
    ],
  },
  {
    id: "2",
    trackingCode: "LOG987654321",
    orderId: "ORD002",
    shopId: "SHOP002",
    customer: {
      id: "CUST002",
      name: "Trần Thị B",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
    },
    status: "IN_TRANSIT",
    createdAt: "2024-03-13T08:00:00Z",
    expectedDeliveryAt: "2024-03-15T16:00:00Z",
    items: [{ id: "3", productName: 'MacBook Pro 16"', quantity: 1 }],
    statusHistory: [
      {
        id: "7",
        shipmentId: "2",
        status: "PENDING",
        description: "Đơn hàng đã được tạo",
        updatedAt: "2024-03-13T08:00:00Z",
      },
      {
        id: "8",
        shipmentId: "2",
        status: "CONFIRMED",
        description: "Đơn hàng đã được xác nhận",
        updatedAt: "2024-03-13T09:00:00Z",
      },
      {
        id: "9",
        shipmentId: "2",
        status: "RECEIVED",
        description: "Đã nhận hàng từ shop",
        updatedAt: "2024-03-13T12:00:00Z",
      },
      {
        id: "10",
        shipmentId: "2",
        status: "IN_TRANSIT",
        description: "Đang vận chuyển đến kho đích",
        updatedAt: "2024-03-14T10:00:00Z",
      },
    ],
  },
  {
    id: "3",
    trackingCode: "LOG555666777",
    orderId: "ORD003",
    shopId: "SHOP001",
    customer: {
      id: "CUST003",
      name: "Lê Văn C",
      phone: "0912345678",
      address: "789 Đường DEF, Quận 3, TP.HCM",
    },
    status: "FAILED",
    createdAt: "2024-03-12T15:00:00Z",
    expectedDeliveryAt: "2024-03-14T12:00:00Z",
    items: [{ id: "4", productName: "AirPods Pro", quantity: 2 }],
    statusHistory: [
      {
        id: "11",
        shipmentId: "3",
        status: "PENDING",
        description: "Đơn hàng đã được tạo",
        updatedAt: "2024-03-12T15:00:00Z",
      },
      {
        id: "12",
        shipmentId: "3",
        status: "CONFIRMED",
        description: "Đơn hàng đã được xác nhận",
        updatedAt: "2024-03-12T16:00:00Z",
      },
      {
        id: "13",
        shipmentId: "3",
        status: "RECEIVED",
        description: "Đã nhận hàng từ shop",
        updatedAt: "2024-03-12T18:00:00Z",
      },
      {
        id: "14",
        shipmentId: "3",
        status: "IN_TRANSIT",
        description: "Đang vận chuyển đến kho đích",
        updatedAt: "2024-03-13T08:00:00Z",
      },
      {
        id: "15",
        shipmentId: "3",
        status: "OUT_FOR_DELIVERY",
        description: "Đang giao hàng",
        updatedAt: "2024-03-13T14:00:00Z",
      },
      {
        id: "16",
        shipmentId: "3",
        status: "FAILED",
        description: "Giao hàng thất bại - Khách hàng không có nhà",
        updatedAt: "2024-03-13T16:00:00Z",
      },
    ],
  },
];

// Mock API functions
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTracking(trackingCode: string) {
  return delay(500).then(() => {
    const shipment = mockShipments.find((s) => s.trackingCode === trackingCode);
    if (!shipment) {
      throw new Error("Shipment not found");
    }
    return { data: shipment };
  });
}

export function listShipments(params?: {
  status?: string;
  trackingCode?: string;
  shopId?: string;
}) {
  return delay(300).then(() => {
    let filtered = mockShipments;

    if (params?.status) {
      filtered = filtered.filter((s) => s.status === params.status);
    }
    if (params?.trackingCode) {
      filtered = filtered.filter((s) =>
        s.trackingCode
          .toLowerCase()
          .includes(params.trackingCode!.toLowerCase()),
      );
    }
    if (params?.shopId) {
      filtered = filtered.filter((s) => s.shopId === params.shopId);
    }

    return { data: filtered };
  });
}

export function updateShipmentStatus(id: string, status: ShipmentStatus) {
  return delay(200).then(() => {
    const shipment = mockShipments.find((s) => s.id === id);
    if (!shipment) {
      throw new Error("Shipment not found");
    }

    shipment.status = status;
    const newHistory: ShipmentStatusHistory = {
      id: Date.now().toString(),
      shipmentId: id,
      status,
      description: `Trạng thái cập nhật thành ${status}`,
      updatedAt: new Date().toISOString(),
    };
    shipment.statusHistory = shipment.statusHistory || [];
    shipment.statusHistory.push(newHistory);

    return { data: null };
  });
}
