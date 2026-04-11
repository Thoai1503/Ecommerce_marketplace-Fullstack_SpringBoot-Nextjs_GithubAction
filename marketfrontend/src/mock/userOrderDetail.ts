import { Order } from "@/types";

const USER_ORDER_DETAILS: Record<string, Order> = {
  "1001": {
    id: "1001",
    orderCode: "#U-1001",
    customerName: "Thoai Nguyen",
    customerEmail: "thoai.user@example.com",
    customerPhone: "0909 123 456",
    shippingAddress:
      "12 Nguyen Trai, Phuong Ben Thanh, Quan 1, TP. Ho Chi Minh",
    totalAmount: 3490000,
    subtotalAmount: 3250000,
    discountAmount: 100000,
    shippingAmount: 240000,
    taxAmount: 100000,
    itemsCount: 3,
    paymentStatus: "PAID",
    paymentMethod: "VNPay",
    transactionId: "VNP-20260411-1001",
    deliveryNumber: "GHN-981277",
    status: "SHIPPED",
    priority: "NORMAL",
    createdAt: "2026-04-10T08:20:00Z",
    updatedAt: "2026-04-11T03:10:00Z",
    items: [
      {
        id: "oi-1001-1",
        productName: "Tai nghe Bluetooth Pro X",
        productImage:
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&q=80",
        sku: "TH-PROX-BLK",
        variant: "Black",
        quantity: 1,
        price: 1650000,
        status: "Packaging",
      },
      {
        id: "oi-1001-2",
        productName: "Chuot khong day HyperLight",
        productImage:
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&q=80",
        sku: "MS-HL-WHT",
        variant: "White",
        quantity: 1,
        price: 900000,
        status: "Ready",
      },
      {
        id: "oi-1001-3",
        productName: "Ban phim Co RGB K68",
        productImage:
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&q=80",
        sku: "KB-K68-RGB",
        variant: "White - Brown Switch",
        quantity: 1,
        price: 700000,
        status: "Ready",
      },
    ],
    shipments: [
      {
        id: "shp-1001-a",
        order_id: "1001",
        shop_id: "11",
        shopName: "Tech Hub Store",
        tracking_number: "GHN-981277",
        carrier_name: "LOG",
        shipping_status: "SHIPPING",
        estimated_delivery_at: "2026-04-12T09:00:00Z",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Don da tao thanh cong",
            updatedAt: "2026-04-10T08:21:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop da xac nhan don",
            updatedAt: "2026-04-10T08:45:00Z",
          },
          {
            status: "PICKED_UP",
            description: "Don vi van chuyen da lay hang",
            updatedAt: "2026-04-10T11:20:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hang dang duoc trung chuyen",
            updatedAt: "2026-04-11T03:10:00Z",
          },
        ],
        shipping_fee: 140000,
        created_at: "2026-04-10T08:30:00Z",
        updated_at: "2026-04-11T03:10:00Z",
      },
      {
        id: "shp-1001-b",
        order_id: "1001",
        shop_id: "27",
        shopName: "Gear Daily",
        tracking_number: "GHTK-778921",
        carrier_name: "LOG",
        shipping_status: "PICKED_UP",
        estimated_delivery_at: "2026-04-13T16:00:00Z",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Don da tao thanh cong",
            updatedAt: "2026-04-10T08:24:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop da xac nhan don",
            updatedAt: "2026-04-10T09:10:00Z",
          },
          {
            status: "PICKED_UP",
            description: "Don vi van chuyen da lay hang tai shop",
            updatedAt: "2026-04-11T02:00:00Z",
          },
        ],
        shipping_fee: 100000,
        created_at: "2026-04-10T08:35:00Z",
        updated_at: "2026-04-11T02:00:00Z",
      },
    ],
    logs: [
      {
        id: "log-1001-1",
        action: "ORDER_CREATED",
        note: "Ban da dat don thanh cong",
        performedBy: "System",
        createdAt: "2026-04-10T08:20:00Z",
      },
      {
        id: "log-1001-2",
        action: "PAYMENT_CONFIRMED",
        note: "He thong da ghi nhan thanh toan",
        performedBy: "Payment Gateway",
        createdAt: "2026-04-10T08:22:00Z",
      },
    ],
  },
  "1002": {
    id: "1002",
    orderCode: "#U-1002",
    customerName: "Thoai Nguyen",
    customerEmail: "thoai.user@example.com",
    customerPhone: "0909 123 456",
    shippingAddress: "28 Ly Thuong Kiet, Phuong 14, Quan 10, TP. Ho Chi Minh",
    totalAmount: 890000,
    subtotalAmount: 850000,
    discountAmount: 0,
    shippingAmount: 40000,
    taxAmount: 0,
    itemsCount: 1,
    paymentStatus: "UNPAID",
    paymentMethod: "COD",
    transactionId: "",
    deliveryNumber: "",
    status: "PENDING",
    priority: "NORMAL",
    createdAt: "2026-04-11T07:10:00Z",
    updatedAt: "2026-04-11T07:10:00Z",
    items: [
      {
        id: "oi-1002-1",
        productName: "Ban phim Co K87",
        productImage:
          "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&q=80",
        sku: "KB-K87-BLU",
        variant: "Blue Switch",
        quantity: 1,
        price: 850000,
        status: "Ready",
      },
    ],
    shipments: [
      {
        id: "shp-1002-a",
        order_id: "1002",
        shop_id: "19",
        shopName: "Gear Daily",
        tracking_number: "",
        carrier_name: "LOG",
        shipping_status: "PENDING",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Dang cho shop xac nhan",
            updatedAt: "2026-04-11T07:10:00Z",
          },
        ],
        shipping_fee: 40000,
        created_at: "2026-04-11T07:10:00Z",
        updated_at: "2026-04-11T07:10:00Z",
      },
    ],
    logs: [
      {
        id: "log-1002-1",
        action: "ORDER_CREATED",
        note: "Don hang da duoc tao",
        performedBy: "System",
        createdAt: "2026-04-11T07:10:00Z",
      },
    ],
  },
};

export async function getMockUserOrderById(id: string): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return USER_ORDER_DETAILS[id] ?? null;
}
