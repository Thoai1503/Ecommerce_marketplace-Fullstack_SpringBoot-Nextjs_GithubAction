import { mockGet } from "../lib/http";
import { http2 } from "../lib/http";
import { Order, OrderItem, OrderStatus, Shipment } from "@/types/index";

// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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
    shipments: [
      {
        id: "ship1-1",
        order_id: "1",
        shop_id: "shop-apple",
        shopName: "Apple Store Official VN",
        tracking_number: "GHN-2024-123456",
        carrier_name: "Giao Hàng Nhanh",
        shipping_status: "CONFIRMED",
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
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-15T10:00:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-03-15T10:30:00Z",
          },
        ],
        shipping_fee: 15000,
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T10:30:00Z",
      },
      {
        id: "ship1-2",
        order_id: "1",
        shop_id: "shop-sony",
        shopName: "Sony Vietnam Store",
        tracking_number: "VTP-2024-789012",
        carrier_name: "Viettel Post",
        shipping_status: "PICKED_UP",
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
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-15T10:00:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-03-15T10:15:00Z",
          },
          {
            status: "PICKED_UP",
            description: "Nhà vận chuyển đã nhận hàng",
            updatedAt: "2024-03-15T14:00:00Z",
          },
        ],
        shipping_fee: 0,
        created_at: "2024-03-15T10:00:00Z",
        updated_at: "2024-03-15T14:00:00Z",
      },
    ],
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
    shipments: [
      {
        id: "ship2-1",
        order_id: "2",
        shop_id: "shop-samsung",
        shopName: "Samsung Mobile Store",
        tracking_number: "JNT-2024-456789",
        carrier_name: "J&T Express",
        shipping_status: "SHIPPING",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-14T08:30:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-03-14T09:00:00Z",
          },
          {
            status: "PICKED_UP",
            description: "Nhà vận chuyển đã lấy hàng",
            updatedAt: "2024-03-14T15:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hàng đang trong quá trình vận chuyển",
            updatedAt: "2024-03-15T08:00:00Z",
          },
        ],
        shipping_fee: 50000,
        created_at: "2024-03-14T08:30:00Z",
        updated_at: "2024-03-15T08:00:00Z",
      },
    ],
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
    shipments: [
      {
        id: "ship3-1",
        order_id: "3",
        shop_id: "shop-laptop",
        shopName: "Laptop Store Hà Nội",
        tracking_number: "GHN-2024-234567",
        carrier_name: "Giao Hàng Nhanh",
        shipping_status: "DELIVERING",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-12T14:20:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-03-12T15:00:00Z",
          },
          {
            status: "PICKED_UP",
            description: "Nhà vận chuyển đã nhận hàng",
            updatedAt: "2024-03-12T18:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hàng đang vận chuyển đến Hà Nội",
            updatedAt: "2024-03-13T08:00:00Z",
          },
          {
            status: "DELIVERING",
            description: "Hàng đã đến điểm giao cuối cùng, đang giao tận nơi",
            updatedAt: "2024-03-15T09:00:00Z",
          },
        ],
        shipping_fee: 50000,
        created_at: "2024-03-12T14:20:00Z",
        updated_at: "2024-03-15T09:00:00Z",
      },
      {
        id: "ship3-2",
        order_id: "3",
        shop_id: "shop-accessories",
        shopName: "Laptop Accessories Pro",
        tracking_number: "VTP-2024-345678",
        carrier_name: "Viettel Post",
        shipping_status: "DELIVERING",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-12T14:20:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-03-12T14:45:00Z",
          },
          {
            status: "PICKED_UP",
            description: "Nhà vận chuyển đã nhận hàng",
            updatedAt: "2024-03-13T09:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hàng đang vận chuyển",
            updatedAt: "2024-03-13T14:00:00Z",
          },
          {
            status: "DELIVERING",
            description: "Hàng sẽ đến trong vòng 2 giờ",
            updatedAt: "2024-03-15T14:30:00Z",
          },
        ],
        shipping_fee: 30000,
        created_at: "2024-03-12T14:20:00Z",
        updated_at: "2024-03-15T14:30:00Z",
      },
    ],
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
    shipments: [
      {
        id: "ship4-1",
        order_id: "4",
        shop_id: "shop-phone",
        shopName: "Mobile Phone Shop",
        tracking_number: "GHN-2024-567890",
        carrier_name: "Giao Hàng Nhanh",
        shipping_status: "FAILED",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-11T09:15:00Z",
          },
          {
            status: "FAILED",
            description: "Khách hàng đã hủy đơn, yêu cầu hoàn hoàn tiền",
            updatedAt: "2024-03-11T10:00:00Z",
          },
        ],
        shipping_fee: 0,
        created_at: "2024-03-11T09:15:00Z",
        updated_at: "2024-03-11T10:00:00Z",
      },
    ],
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
    shipments: [
      {
        id: "ship5-1",
        order_id: "5",
        shop_id: "shop-luxury",
        shopName: "Luxury Electronics Boutique",
        tracking_number: "DHL-2024-888999",
        carrier_name: "DHL Express",
        shipping_status: "DELIVERED",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-01T10:00:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-03-01T10:30:00Z",
          },
          {
            status: "PICKED_UP",
            description: "DHL Express đã nhận hàng",
            updatedAt: "2024-03-01T14:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hàng đang vận chuyển đến Phú Quốc",
            updatedAt: "2024-03-02T08:00:00Z",
          },
          {
            status: "DELIVERING",
            description: "Hàng đã đến, đặt lịch giao với khách hàng",
            updatedAt: "2024-03-04T10:00:00Z",
          },
          {
            status: "DELIVERED",
            description: "Khách hàng đã nhận hàng vào 2024-03-05 14:30",
            updatedAt: "2024-03-05T14:30:00Z",
          },
        ],
        shipping_fee: 0,
        created_at: "2024-03-01T10:00:00Z",
        updated_at: "2024-03-05T14:30:00Z",
      },
      {
        id: "ship5-2",
        order_id: "5",
        shop_id: "shop-luxury-acc",
        shopName: "Luxury Accessories Vietnam",
        tracking_number: "DHL-2024-999000",
        carrier_name: "DHL Express",
        shipping_status: "DELIVERED",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-03-01T10:00:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-03-01T10:15:00Z",
          },
          {
            status: "PICKED_UP",
            description: "DHL Express đã nhận hàng",
            updatedAt: "2024-03-01T15:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hàng đang vận chuyển",
            updatedAt: "2024-03-02T09:00:00Z",
          },
          {
            status: "DELIVERED",
            description: "Khách hàng đã nhận hàng vào 2024-03-05 15:00",
            updatedAt: "2024-03-05T15:00:00Z",
          },
        ],
        shipping_fee: 0,
        created_at: "2024-03-01T10:00:00Z",
        updated_at: "2024-03-05T15:00:00Z",
      },
    ],
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
    shipments: [
      {
        id: "ship6-1",
        order_id: "6",
        shop_id: "shop-tech-small",
        shopName: "Tech Store Saigon",
        tracking_number: "JNT-2024-678901",
        carrier_name: "J&T Express",
        shipping_status: "PENDING",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ shop xác nhận đơn hàng",
            updatedAt: "2024-03-15T08:00:00Z",
          },
        ],
        shipping_fee: 30000,
        created_at: "2024-03-15T08:00:00Z",
        updated_at: "2024-03-15T08:00:00Z",
      },
    ],
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
    shipments: [
      {
        id: "ship7-1",
        order_id: "7",
        shop_id: "shop-camera",
        shopName: "Camera Pro Shop",
        tracking_number: "JNT-2024-555666",
        carrier_name: "J&T Express",
        shipping_status: "DELIVERED",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-02-28T14:00:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-02-28T15:00:00Z",
          },
          {
            status: "PICKED_UP",
            description: "J&T Express đã nhận hàng",
            updatedAt: "2024-02-28T18:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hàng đang vận chuyển đến Đà Nẵng",
            updatedAt: "2024-03-01T10:00:00Z",
          },
          {
            status: "DELIVERING",
            description: "Hàng đã đến điểm giao",
            updatedAt: "2024-03-02T09:00:00Z",
          },
          {
            status: "DELIVERED",
            description: "Khách hàng nhận hàng, phát hiện sản phẩm lỗi",
            updatedAt: "2024-03-02T14:00:00Z",
          },
        ],
        shipping_fee: 50000,
        created_at: "2024-02-28T14:00:00Z",
        updated_at: "2024-03-02T14:00:00Z",
      },
      {
        id: "ship7-2",
        order_id: "7",
        shop_id: "shop-lens",
        shopName: "Lens Store Vietnam",
        tracking_number: "JNT-2024-666777",
        carrier_name: "J&T Express",
        shipping_status: "RETURNED",
        items: [],
        statusHistory: [
          {
            status: "PENDING",
            description: "Chờ xác nhận từ shop",
            updatedAt: "2024-02-28T14:00:00Z",
          },
          {
            status: "CONFIRMED",
            description: "Shop đã xác nhận đơn hàng",
            updatedAt: "2024-02-28T14:30:00Z",
          },
          {
            status: "PICKED_UP",
            description: "J&T Express đã nhận hàng",
            updatedAt: "2024-02-29T09:00:00Z",
          },
          {
            status: "SHIPPING",
            description: "Hàng đang vận chuyển",
            updatedAt: "2024-03-01T11:00:00Z",
          },
          {
            status: "DELIVERED",
            description: "Khách hàng nhận hàng nhưng muốn trả lại",
            updatedAt: "2024-03-02T15:00:00Z",
          },
          {
            status: "RETURNED",
            description: "Hàng đã được trả lại cho shop, hoàn tiền 100%",
            updatedAt: "2024-03-05T09:00:00Z",
          },
        ],
        shipping_fee: 50000,
        created_at: "2024-02-28T14:00:00Z",
        updated_at: "2024-03-05T09:00:00Z",
      },
    ],
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

// export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
//   await delay(600);
//   return true;
// };

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<boolean> => {
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
): Promise<boolean> => {
  await delay(500);
  return true;
};

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
