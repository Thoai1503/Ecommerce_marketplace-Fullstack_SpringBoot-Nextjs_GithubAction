<<<<<<< HEAD

import { mockGet } from '../lib/http';
import { Order, OrderItem, OrderStatus } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const BASE_ORDERS: Order[] = [
    { 
      id: '1', 
      orderCode: '#ORD-0001', 
      customerName: 'Nguyễn Văn A', 
      customerEmail: 'abc@email.com',
      customerPhone: '0901234567',
      shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
      totalAmount: 2500000, 
      subtotalAmount: 2200000,
      discountAmount: 50000,
      shippingAmount: 30000,
      taxAmount: 220000, // 10%
      itemsCount: 2,
      paymentStatus: 'PAID',
      paymentMethod: 'Mastercard (**** 7812)',
      transactionId: '#TXN-123456',
      deliveryNumber: '',
      status: 'PENDING', 
      priority: 'NORMAL',
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
      items: [
        { 
          id: 'i1', 
          productName: 'iPhone 15 Pro Max', 
          productImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&q=80',
          sku: 'APL-IP15PM-256-TI',
          variant: 'Titan Tự Nhiên, 256GB',
          quantity: 1, 
          price: 25000000, 
          status: 'Ready' 
        },
        { 
          id: 'i2', 
          productName: 'Tai nghe Sony WH-1000XM5', 
          productImage: 'https://images.unsplash.com/photo-1670054131709-646738c80084?w=100&q=80',
          sku: 'SNY-WH1000XM5-B',
          variant: 'Black',
          quantity: 1, 
          price: 8500000, 
          status: 'Packaging' 
        }
      ],
      isFlagged: true,
      internalNote: 'Khách hàng yêu cầu giao trước 5h chiều'
    },
    { 
      id: '2', 
      orderCode: '#ORD-0002', 
      customerName: 'Trần Thị B', 
      customerEmail: 'b@email.com',
      customerPhone: '0912345678',
      shippingAddress: '456 Lê Lợi, Quận Hải Châu, Đà Nẵng',
      totalAmount: 1250000, 
      subtotalAmount: 1200000,
      discountAmount: 0,
      shippingAmount: 50000,
      taxAmount: 0,
      itemsCount: 1,
      paymentStatus: 'UNPAID',
      paymentMethod: 'Thanh toán khi nhận hàng (COD)',
      transactionId: '',
      deliveryNumber: '',
      status: 'CONFIRMED', 
      priority: 'HIGH',
      createdAt: '2024-03-14T08:30:00Z',
      updatedAt: '2024-03-14T09:00:00Z',
      items: [],
      isFlagged: false
    },
    { 
      id: '3', 
      orderCode: '#ORD-0003', 
      customerName: 'Lê Văn C', 
      customerEmail: 'c@email.com',
      customerPhone: '0987654321',
      shippingAddress: '789 Cầu Giấy, Hà Nội',
      totalAmount: 5600000, 
      subtotalAmount: 5500000,
      discountAmount: 0,
      shippingAmount: 100000,
      taxAmount: 0,
      itemsCount: 3,
      paymentStatus: 'PAID',
      paymentMethod: 'Chuyển khoản ngân hàng',
      transactionId: 'TXN-998877',
      deliveryNumber: 'GHN-123456',
      status: 'SHIPPED', 
      priority: 'NORMAL',
      createdAt: '2024-03-12T14:20:00Z',
      updatedAt: '2024-03-13T10:00:00Z',
      items: [],
      trackingNumber: 'GHN-123456'
    },
    { 
      id: '4', 
      orderCode: '#ORD-0004', 
      customerName: 'Phạm Minh D', 
      customerEmail: 'd@email.com',
      customerPhone: '0933445566',
      shippingAddress: '101 Võ Văn Kiệt, Quận 1, TP.HCM',
      totalAmount: 890000, 
      subtotalAmount: 850000,
      discountAmount: 0,
      shippingAmount: 40000,
      taxAmount: 0,
      itemsCount: 1,
      paymentStatus: 'REFUNDED',
      paymentMethod: 'Ví MoMo',
      transactionId: 'TXN-MOMO-001',
      deliveryNumber: '',
      status: 'CANCELED', 
      priority: 'NORMAL',
      createdAt: '2024-03-11T09:15:00Z',
      updatedAt: '2024-03-11T10:00:00Z',
      items: [],
      internalNote: 'Khách hàng đổi ý, đã hoàn tiền qua MoMo'
    },
    { 
      id: '5', 
      orderCode: '#ORD-0005', 
      customerName: 'Hoàng Thị E', 
      customerEmail: 'e@email.com',
      customerPhone: '0944556677',
      shippingAddress: 'Resort 5 Sao, Phú Quốc',
      totalAmount: 15200000, 
      subtotalAmount: 15200000,
      discountAmount: 0,
      shippingAmount: 0,
      taxAmount: 0,
      itemsCount: 5,
      paymentStatus: 'PAID',
      paymentMethod: 'Visa Credit (**** 4242)',
      transactionId: 'TXN-VISA-999',
      deliveryNumber: 'DHL-888999',
      status: 'COMPLETED', 
      priority: 'NORMAL',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-05T16:00:00Z',
      items: []
    },
    { 
      id: '6', 
      orderCode: '#ORD-0006', 
      customerName: 'Vũ Văn F', 
      customerEmail: 'f@email.com',
      customerPhone: '0955667788',
      shippingAddress: '22 Lý Tự Trọng, Quận 1, TP.HCM',
      totalAmount: 450000, 
      subtotalAmount: 420000,
      discountAmount: 0,
      shippingAmount: 30000,
      taxAmount: 0,
      itemsCount: 1,
      paymentStatus: 'PAID',
      paymentMethod: 'ZaloPay',
      transactionId: 'TXN-ZALO-222',
      deliveryNumber: '',
      status: 'PROCESSING', 
      priority: 'NORMAL',
      createdAt: '2024-03-15T08:00:00Z',
      updatedAt: '2024-03-15T08:30:00Z',
      items: []
    },
    { 
      id: '7', 
      orderCode: '#ORD-0007', 
      customerName: 'Ngô Thị G', 
      customerEmail: 'g@email.com',
      customerPhone: '0966778899',
      shippingAddress: '12 Nguyễn Văn Linh, Đà Nẵng',
      totalAmount: 2100000, 
      subtotalAmount: 2000000,
      discountAmount: 0,
      shippingAmount: 100000,
      taxAmount: 0,
      itemsCount: 2,
      paymentStatus: 'REFUNDED',
      paymentMethod: 'Chuyển khoản ngân hàng',
      transactionId: 'TXN-BANK-555',
      deliveryNumber: 'JnT-555666',
      status: 'REFUNDED', 
      priority: 'NORMAL',
      createdAt: '2024-02-28T14:00:00Z',
      updatedAt: '2024-03-05T09:00:00Z',
      items: [],
      internalNote: 'Sản phẩm lỗi, đã hoàn tiền 100%'
    }
];

// Generate 125 mock orders to test pagination (about 12-13 pages)
=======
import { mockGet } from "../lib/http";
import { http2 } from "../lib/http";
import { Order, OrderItem, OrderStatus } from "@/types/index";

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
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
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
<<<<<<< HEAD
  return await mockGet('/admin/orders', MOCK_ORDERS);
=======
  return await mockGet("/admin/orders", MOCK_ORDERS);
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const orders = await getOrders();
<<<<<<< HEAD
  return orders.find(o => o.id === id) || orders[0];
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
  await delay(600);
  return true;
};

export const updateOrderFlag = async (id: string, isFlagged: boolean): Promise<boolean> => {
=======
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
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  await delay(500);
  return true;
};

<<<<<<< HEAD
export const updateOrderNote = async (id: string, note: string): Promise<boolean> => {
  await delay(500);
  return true;
};

export const updateTrackingNumber = async (id: string, trackingNumber: string): Promise<boolean> => {
  await delay(500);
  return true;
};

export const updateOrderItems = async (id: string, items: OrderItem[], totalAmount: number): Promise<boolean> => {
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
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
