import { mockGet } from "../lib/http";
<<<<<<< HEAD
import { Order, OrderItem, OrderStatus, Shipment } from "@/types/index";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
=======
import { http2 } from "../lib/http";
import { Order, OrderItem, OrderStatus } from "@/types/index";

// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
>>>>>>> c0a1f7cc9a8518c42e84670ceef22ecdc13e67da

const BASE_ORDERS: Order[] = [
  {
    id: "1",
    orderCode: "#ORD-0001",
    customerName: "Nguyễn Văn A",
    customerEmail: "abc@email.com",
    customerPhone: "0901234567",
    shippingAddress: "123 Đường ABC, Quận 1, TP.HCM",
    totalAmount: 2500000,
    subtotalAmount: 2200000,
    discountAmount: 50000,
    shippingAmount: 30000,
    taxAmount: 220000, // 10%
    itemsCount: 2,
    paymentStatus: "PAID",
    paymentMethod: "Mastercard (**** 7812)",
    transactionId: "#TXN-123456",
    deliveryNumber: "",
    status: "PENDING",
    priority: "NORMAL",
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
    items: [
      {
        id: "i1",
        productName: "iPhone 15 Pro Max",
        productImage:
          "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&q=80",
        sku: "APL-IP15PM-256-TI",
        variant: "Titan Tự Nhiên, 256GB",
        quantity: 1,
        price: 25000000,
        status: "Ready",
      },
      {
        id: "i2",
        productName: "Tai nghe Sony WH-1000XM5",
        productImage:
          "https://images.unsplash.com/photo-1670054131709-646738c80084?w=100&q=80",
        sku: "SNY-WH1000XM5-B",
        variant: "Black",
        quantity: 1,
        price: 8500000,
        status: "Packaging",
      },
    ],
<<<<<<< HEAD
    shipments: [
      {
        id: "ship-001",
        order_id: "1",
        shop_id: "shop-101",
        shopName: "📱 Shop Điện Tử A",
        tracking_number: "GHTK123456789",
        carrier_name: "GHTK",
        shipping_status: "SHIPPING",
        shipping_fee: 15000,
        estimated_delivery_at: "2024-03-17T18:00:00Z",
        created_at: "2024-03-15T10:30:00Z",
        updated_at: "2024-03-16T08:00:00Z",
        items: [
          {
            id: "i1",
            productName: "iPhone 15 Pro Max",
            productImage:
              "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&q=80",
            sku: "APL-IP15PM-256-TI",
            variant: "Titan Tự Nhiên, 256GB",
            quantity: 1,
            price: 25000000,
            status: "Ready",
          },
        ],
        statusHistory: [
          {
            status: "CONFIRMED",
            description: "Đơn hàng đã được xác nhận từ Shop",
            updatedAt: "2024-03-15T10:35:00Z",
          },
          {
            status: "PICKED_UP",
            description: "GHTK đã lấy hàng từ kho",
            updatedAt: "2024-03-15T14:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Gói hàng đang trong quá trình vận chuyển",
            updatedAt: "2024-03-16T08:00:00Z",
          },
        ],
      },
      {
        id: "ship-002",
        order_id: "1",
        shop_id: "shop-202",
        shopName: "👕 Shop Thời Trang B",
        tracking_number: "GHN987654321",
        carrier_name: "GHN",
        shipping_status: "CONFIRMED",
        shipping_fee: 15000,
        estimated_delivery_at: "2024-03-18T20:00:00Z",
        created_at: "2024-03-15T11:00:00Z",
        updated_at: "2024-03-15T14:30:00Z",
        items: [
          {
            id: "i2",
            productName: "Tai nghe Sony WH-1000XM5",
            productImage:
              "https://images.unsplash.com/photo-1670054131709-646738c80084?w=100&q=80",
            sku: "SNY-WH1000XM5-B",
            variant: "Black",
            quantity: 1,
            price: 8500000,
            status: "Packaging",
          },
        ],
        statusHistory: [
          {
            status: "CONFIRMED",
            description: "Đơn hàng đã được xác nhận từ Shop",
            updatedAt: "2024-03-15T11:05:00Z",
          },
        ],
      },
    ],
=======
>>>>>>> c0a1f7cc9a8518c42e84670ceef22ecdc13e67da
    isFlagged: true,
    internalNote: "Khách hàng yêu cầu giao trước 5h chiều",
  },
  {
    id: "2",
    orderCode: "#ORD-0002",
    customerName: "Trần Thị B",
    customerEmail: "b@email.com",
    customerPhone: "0912345678",
    shippingAddress: "456 Lê Lợi, Quận Hải Châu, Đà Nẵng",
    totalAmount: 1250000,
    subtotalAmount: 1200000,
    discountAmount: 0,
    shippingAmount: 50000,
    taxAmount: 0,
    itemsCount: 1,
    paymentStatus: "UNPAID",
    paymentMethod: "Thanh toán khi nhận hàng (COD)",
    transactionId: "",
    deliveryNumber: "",
    status: "CONFIRMED",
    priority: "HIGH",
    createdAt: "2024-03-14T08:30:00Z",
    updatedAt: "2024-03-14T09:00:00Z",
    items: [],
    isFlagged: false,
  },
  {
    id: "3",
    orderCode: "#ORD-0003",
    customerName: "Lê Văn C",
    customerEmail: "c@email.com",
    customerPhone: "0987654321",
    shippingAddress: "789 Cầu Giấy, Hà Nội",
    totalAmount: 5600000,
    subtotalAmount: 5500000,
    discountAmount: 0,
    shippingAmount: 100000,
    taxAmount: 0,
    itemsCount: 3,
    paymentStatus: "PAID",
    paymentMethod: "Chuyển khoản ngân hàng",
    transactionId: "TXN-998877",
    deliveryNumber: "GHN-123456",
    status: "SHIPPED",
    priority: "NORMAL",
    createdAt: "2024-03-12T14:20:00Z",
    updatedAt: "2024-03-13T10:00:00Z",
    items: [],
    trackingNumber: "GHN-123456",
  },
  {
    id: "4",
    orderCode: "#ORD-0004",
    customerName: "Phạm Minh D",
    customerEmail: "d@email.com",
    customerPhone: "0933445566",
    shippingAddress: "101 Võ Văn Kiệt, Quận 1, TP.HCM",
    totalAmount: 890000,
    subtotalAmount: 850000,
    discountAmount: 0,
    shippingAmount: 40000,
    taxAmount: 0,
    itemsCount: 1,
    paymentStatus: "REFUNDED",
    paymentMethod: "Ví MoMo",
    transactionId: "TXN-MOMO-001",
    deliveryNumber: "",
    status: "CANCELED",
    priority: "NORMAL",
    createdAt: "2024-03-11T09:15:00Z",
    updatedAt: "2024-03-11T10:00:00Z",
    items: [],
    internalNote: "Khách hàng đổi ý, đã hoàn tiền qua MoMo",
  },
  {
    id: "5",
    orderCode: "#ORD-0005",
    customerName: "Hoàng Thị E",
    customerEmail: "e@email.com",
    customerPhone: "0944556677",
    shippingAddress: "Resort 5 Sao, Phú Quốc",
    totalAmount: 15200000,
    subtotalAmount: 15200000,
    discountAmount: 0,
    shippingAmount: 0,
    taxAmount: 0,
    itemsCount: 5,
    paymentStatus: "PAID",
    paymentMethod: "Visa Credit (**** 4242)",
    transactionId: "TXN-VISA-999",
    deliveryNumber: "DHL-888999",
    status: "COMPLETED",
    priority: "NORMAL",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-05T16:00:00Z",
    items: [],
  },
  {
    id: "6",
    orderCode: "#ORD-0006",
    customerName: "Vũ Văn F",
    customerEmail: "f@email.com",
    customerPhone: "0955667788",
    shippingAddress: "22 Lý Tự Trọng, Quận 1, TP.HCM",
    totalAmount: 450000,
    subtotalAmount: 420000,
    discountAmount: 0,
    shippingAmount: 30000,
    taxAmount: 0,
    itemsCount: 1,
    paymentStatus: "PAID",
    paymentMethod: "ZaloPay",
    transactionId: "TXN-ZALO-222",
    deliveryNumber: "",
    status: "PROCESSING",
    priority: "NORMAL",
    createdAt: "2024-03-15T08:00:00Z",
    updatedAt: "2024-03-15T08:30:00Z",
    items: [],
  },
  {
    id: "7",
    orderCode: "#ORD-0007",
    customerName: "Ngô Thị G",
    customerEmail: "g@email.com",
    customerPhone: "0966778899",
    shippingAddress: "12 Nguyễn Văn Linh, Đà Nẵng",
    totalAmount: 2100000,
    subtotalAmount: 2000000,
    discountAmount: 0,
    shippingAmount: 100000,
    taxAmount: 0,
    itemsCount: 2,
    paymentStatus: "REFUNDED",
    paymentMethod: "Chuyển khoản ngân hàng",
    transactionId: "TXN-BANK-555",
    deliveryNumber: "JnT-555666",
    status: "REFUNDED",
    priority: "NORMAL",
    createdAt: "2024-02-28T14:00:00Z",
    updatedAt: "2024-03-05T09:00:00Z",
    items: [],
    internalNote: "Sản phẩm lỗi, đã hoàn tiền 100%",
  },
];

//Generate 125 mock orders to test pagination (about 12-13 pages)
const MOCK_ORDERS: Order[] = Array.from({ length: 125 }, (_, i) => {
  const base = BASE_ORDERS[i % BASE_ORDERS.length];
  return {
    ...base,
    id: `${base.id}-${i}`,
    orderCode: `#ORD-${String(1000 + i)}`,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Spread dates
  };
});

export const getOrders = async (): Promise<Order[]> => {
  return await mockGet("/admin/orders", MOCK_ORDERS);
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const orders = await getOrders();
  return orders.find((o) => o.id === id) || orders[0];
};

<<<<<<< HEAD
=======
// export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
//   await delay(600);
//   return true;
// };

>>>>>>> c0a1f7cc9a8518c42e84670ceef22ecdc13e67da
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<boolean> => {
<<<<<<< HEAD
  await delay(600);
  return true;
};

export const updateOrderFlag = async (
  id: string,
  isFlagged: boolean,
=======
  await http2(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  return true;
};

// export const updateOrderFlag = async (id: string, isFlagged: boolean): Promise<boolean> => {
//   await delay(500);
//   return true;
// };

export const updateOrderNote = async (
  id: string,
  note: string,
>>>>>>> c0a1f7cc9a8518c42e84670ceef22ecdc13e67da
): Promise<boolean> => {
  await delay(500);
  return true;
};

<<<<<<< HEAD
export const updateOrderNote = async (
  id: string,
  note: string,
): Promise<boolean> => {
  await delay(500);
  return true;
};

export const updateTrackingNumber = async (
  id: string,
  trackingNumber: string,
): Promise<boolean> => {
  await delay(500);
  return true;
};

export const updateOrderItems = async (
  id: string,
  items: OrderItem[],
  totalAmount: number,
): Promise<boolean> => {
  await delay(800);
  return true;
};
=======
// export const updateTrackingNumber = async (id: string, trackingNumber: string): Promise<boolean> => {
//   await delay(500);
//   return true;
// };

export const updateTrackingNumber = async (
  id: string,
  trackingNumber: string,
): Promise<boolean> => {
  await http2(`/admin/orders/${id}/tracking`, {
    method: "PUT",
    body: JSON.stringify({ trackingNumber }),
  });

  return true;
};

export default {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateTrackingNumber,
  // updateOrderFlag,
  //  updateOrderNote,
  // updateOrderItems
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
>>>>>>> c0a1f7cc9a8518c42e84670ceef22ecdc13e67da
