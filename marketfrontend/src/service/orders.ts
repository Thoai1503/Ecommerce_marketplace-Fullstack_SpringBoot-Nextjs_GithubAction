// import { mockGet } from "../lib/http";
// import { http2 } from "../lib/http";
// import { Order, OrderItem, OrderStatus, Shipment } from "@/types/index";

// import { mockGet } from '../lib/http';
import { http2 } from "../lib/http";
import { Order, OrderItem, OrderStatus, PaymentStatus } from "@/types/index";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface OrderResponse {
  orders: any[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  statusStats: Record<string, number>;
  pendingAmount: number;
}

/**
 * Chuyển đổi status thanh toán từ API sang Frontend
 * API: PENDING, PAID, REFUNDED
 * Frontend: UNPAID, PAID, REFUNDED
 */
export const normalizePaymentStatus = (
  apiStatus: string | null,
): PaymentStatus => {
  if (!apiStatus) return "UNPAID";

  const statusMap: Record<string, PaymentStatus> = {
    PENDING: "UNPAID",
    UNPAID: "UNPAID",
    PAID: "PAID",
    REFUNDED: "REFUNDED",
  };

  return statusMap[apiStatus.toUpperCase()] || "UNPAID";
};

/**
 * Chuyển đổi trạng thái đơn hàng từ API sang Frontend
 * Đảm bảo format uppercase
 */
export const normalizeOrderStatus = (apiStatus: string | null): OrderStatus => {
  if (!apiStatus) return "PENDING";

  const status = apiStatus.toUpperCase();
  const validStatuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELED",
    "REFUNDED",
  ];

  return validStatuses.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : "PENDING";
};

/**
 * Xác định mức độ ưu tiên dựa trên trạng thái thanh toán và đơn hàng
 * - HIGH: PENDING order có giá trị cao (> 5,000,000)
 * - NORMAL: others
 */
export const determinePriority = (
  totalAmount: number,
  orderStatus: string,
): "NORMAL" | "HIGH" => {
  // Nếu đơn hàng đang pending và có giá trị cao, ưu tiên cao
  if (orderStatus === "PENDING" && totalAmount > 5000000) {
    return "HIGH";
  }
  return "NORMAL";
};

/**
 * Map API Order sang Frontend Order Interface
 *
 * Note on missing fields:
 * - customerName, customerEmail, customerPhone: Needs to fetch from User service
 * - shippingAddress: Needs to fetch from Address service
 * - itemsCount, items: Needs to fetch from Order Items service
 * - taxAmount: Should be calculated or provided by backend
 * - transactionId: Should fetch from Payment service
 */
export const mapOrder = (o: any): Order => {
  const totalAmount = o.finalAmount || 0;
  const subtotalAmount = o.totalAmount || 0;
  const orderStatus = normalizeOrderStatus(o.orderStatus);

  return {
    // Basic identifiers
    id: (o.orderId || o.id)?.toString(),
    orderCode: o.orderNumber || o.orderCode || "",

    // Customer information (⚠️ Currently placeholder - needs service integration)
    customerName: "Customer", // TODO: Fetch from User service using userId
    customerEmail: "", // TODO: Fetch from User service using userId
    customerPhone: "", // TODO: Fetch from User service using userId

    // Address (⚠️ Currently empty - needs service integration)
    shippingAddress: "", // TODO: Fetch from Address service using addressId

    // Financial information
    totalAmount, // finalAmount (total to pay)
    subtotalAmount, // totalAmount (product total)
    discountAmount: o.discountAmount || 0,
    shippingAmount: o.shippingFee || 0, // shipping fee
    taxAmount: 0, // TODO: Calculate or fetch tax amount

    // Items
    itemsCount: 0, // TODO: Fetch from Order Items service

    // Payment
    paymentStatus: normalizePaymentStatus(o.paymentStatus),
    paymentMethod: o.paymentMethod || "",
    transactionId: "", // TODO: Fetch from Payment service

    // Delivery
    deliveryNumber: o.trackingNumber || "",
    trackingNumber: o.trackingNumber || "",

    // Order status
    status: orderStatus,
    priority: determinePriority(totalAmount, orderStatus),

    // Timestamps
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,

    // Additional fields
    items: [], // TODO: Fetch from Order Items service
    internalNote: o.note || undefined, // Map note to internalNote
  };
};

// const BASE_ORDERS: Order[] = [
//     {
//       id: '1',
//       orderCode: '#ORD-0001',
//       customerName: 'Nguyễn Văn A',
//       customerEmail: 'abc@email.com',
//       customerPhone: '0901234567',
//       shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
//       totalAmount: 2500000,
//       subtotalAmount: 2200000,
//       discountAmount: 50000,
//       shippingAmount: 30000,
//       taxAmount: 220000, // 10%
//       itemsCount: 2,
//       paymentStatus: 'PAID',
//       paymentMethod: 'Mastercard (**** 7812)',
//       transactionId: '#TXN-123456',
//       deliveryNumber: '',
//       status: 'PENDING',
//       priority: 'NORMAL',
//       createdAt: '2024-03-15T10:00:00Z',
//       updatedAt: '2024-03-15T10:00:00Z',
//       items: [
//         {
//           id: 'i1',
//           productName: 'iPhone 15 Pro Max',
//           productImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&q=80',
//           sku: 'APL-IP15PM-256-TI',
//           variant: 'Titan Tự Nhiên, 256GB',
//           quantity: 1,
//           price: 25000000,
//           status: 'Ready'
//         },
//         {
//           id: 'i2',
//           productName: 'Tai nghe Sony WH-1000XM5',
//           productImage: 'https://images.unsplash.com/photo-1670054131709-646738c80084?w=100&q=80',
//           sku: 'SNY-WH1000XM5-B',
//           variant: 'Black',
//           quantity: 1,
//           price: 8500000,
//           status: 'Packaging'
//         }
//       ],
//       isFlagged: true,
//       internalNote: 'Khách hàng yêu cầu giao trước 5h chiều'
//     },
//     {
//       id: '2',
//       orderCode: '#ORD-0002',
//       customerName: 'Trần Thị B',
//       customerEmail: 'b@email.com',
//       customerPhone: '0912345678',
//       shippingAddress: '456 Lê Lợi, Quận Hải Châu, Đà Nẵng',
//       totalAmount: 1250000,
//       subtotalAmount: 1200000,
//       discountAmount: 0,
//       shippingAmount: 50000,
//       taxAmount: 0,
//       itemsCount: 1,
//       paymentStatus: 'UNPAID',
//       paymentMethod: 'Thanh toán khi nhận hàng (COD)',
//       transactionId: '',
//       deliveryNumber: '',
//       status: 'CONFIRMED',
//       priority: 'HIGH',
//       createdAt: '2024-03-14T08:30:00Z',
//       updatedAt: '2024-03-14T09:00:00Z',
//       items: [],
//       isFlagged: false
//     },
//     {
//       id: '3',
//       orderCode: '#ORD-0003',
//       customerName: 'Lê Văn C',
//       customerEmail: 'c@email.com',
//       customerPhone: '0987654321',
//       shippingAddress: '789 Cầu Giấy, Hà Nội',
//       totalAmount: 5600000,
//       subtotalAmount: 5500000,
//       discountAmount: 0,
//       shippingAmount: 100000,
//       taxAmount: 0,
//       itemsCount: 3,
//       paymentStatus: 'PAID',
//       paymentMethod: 'Chuyển khoản ngân hàng',
//       transactionId: 'TXN-998877',
//       deliveryNumber: 'GHN-123456',
//       status: 'SHIPPED',
//       priority: 'NORMAL',
//       createdAt: '2024-03-12T14:20:00Z',
//       updatedAt: '2024-03-13T10:00:00Z',
//       items: [],
//       trackingNumber: 'GHN-123456'
//     },
//     {
//       id: '4',
//       orderCode: '#ORD-0004',
//       customerName: 'Phạm Minh D',
//       customerEmail: 'd@email.com',
//       customerPhone: '0933445566',
//       shippingAddress: '101 Võ Văn Kiệt, Quận 1, TP.HCM',
//       totalAmount: 890000,
//       subtotalAmount: 850000,
//       discountAmount: 0,
//       shippingAmount: 40000,
//       taxAmount: 0,
//       itemsCount: 1,
//       paymentStatus: 'REFUNDED',
//       paymentMethod: 'Ví MoMo',
//       transactionId: 'TXN-MOMO-001',
//       deliveryNumber: '',
//       status: 'CANCELED',
//       priority: 'NORMAL',
//       createdAt: '2024-03-11T09:15:00Z',
//       updatedAt: '2024-03-11T10:00:00Z',
//       items: [],
//       internalNote: 'Khách hàng đổi ý, đã hoàn tiền qua MoMo'
//     },
//     {
//       id: '5',
//       orderCode: '#ORD-0005',
//       customerName: 'Hoàng Thị E',
//       customerEmail: 'e@email.com',
//       customerPhone: '0944556677',
//       shippingAddress: 'Resort 5 Sao, Phú Quốc',
//       totalAmount: 15200000,
//       subtotalAmount: 15200000,
//       discountAmount: 0,
//       shippingAmount: 0,
//       taxAmount: 0,
//       itemsCount: 5,
//       paymentStatus: 'PAID',
//       paymentMethod: 'Visa Credit (**** 4242)',
//       transactionId: 'TXN-VISA-999',
//       deliveryNumber: 'DHL-888999',
//       status: 'COMPLETED',
//       priority: 'NORMAL',
//       createdAt: '2024-03-01T10:00:00Z',
//       updatedAt: '2024-03-05T16:00:00Z',
//       items: []
//     },
//     {
//       id: '6',
//       orderCode: '#ORD-0006',
//       customerName: 'Vũ Văn F',
//       customerEmail: 'f@email.com',
//       customerPhone: '0955667788',
//       shippingAddress: '22 Lý Tự Trọng, Quận 1, TP.HCM',
//       totalAmount: 450000,
//       subtotalAmount: 420000,
//       discountAmount: 0,
//       shippingAmount: 30000,
//       taxAmount: 0,
//       itemsCount: 1,
//       paymentStatus: 'PAID',
//       paymentMethod: 'ZaloPay',
//       transactionId: 'TXN-ZALO-222',
//       deliveryNumber: '',
//       status: 'PROCESSING',
//       priority: 'NORMAL',
//       createdAt: '2024-03-15T08:00:00Z',
//       updatedAt: '2024-03-15T08:30:00Z',
//       items: []
//     },
//     {
//       id: '7',
//       orderCode: '#ORD-0007',
//       customerName: 'Ngô Thị G',
//       customerEmail: 'g@email.com',
//       customerPhone: '0966778899',
//       shippingAddress: '12 Nguyễn Văn Linh, Đà Nẵng',
//       totalAmount: 2100000,
//       subtotalAmount: 2000000,
//       discountAmount: 0,
//       shippingAmount: 100000,
//       taxAmount: 0,
//       itemsCount: 2,
//       paymentStatus: 'REFUNDED',
//       paymentMethod: 'Chuyển khoản ngân hàng',
//       transactionId: 'TXN-BANK-555',
//       deliveryNumber: 'JnT-555666',
//       status: 'REFUNDED',
//       priority: 'NORMAL',
//       createdAt: '2024-02-28T14:00:00Z',
//       updatedAt: '2024-03-05T09:00:00Z',
//       items: [],
//       internalNote: 'Sản phẩm lỗi, đã hoàn tiền 100%'
//     }
// ];

// Generate 125 mock orders to test pagination (about 12-13 pages)
// const MOCK_ORDERS: Order[] = Array.from({ length: 125 }, (_, i) => {
//   const base = BASE_ORDERS[i % BASE_ORDERS.length];
//   return {
//     ...base,
//     id: `${base.id}-${i}`,
//     orderCode: `#ORD-${String(1000 + i)}`,
//     createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Spread dates
//   };
// });

// export const getOrders = async (): Promise<Order[]> => {
//   return await mockGet('/admin/orders', MOCK_ORDERS);
// };

// export const getOrderById = async (id: string): Promise<Order | null> => {
//   const orders = await getOrders();
//   return orders.find(o => o.id === id) || orders[0];
// };

/**
 * Fetch orders with optional filters and pagination
 * @param filters Object containing status, search, paymentStatus, dates, amounts, sortBy, sortOrder, page, size
 * @returns OrderResponse with mapped orders
 */
export const getOrdersWithFilters = async (
  filters: {
    status?: string;
    search?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
  } = {},
) => {
  const params = new URLSearchParams();

  // Add non-empty filters to query params
  if (filters.status && filters.status !== "ALL")
    params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.paymentStatus && filters.paymentStatus !== "all")
    params.set("paymentStatus", filters.paymentStatus);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.minAmount !== undefined && filters.minAmount > 0)
    params.set("minAmount", filters.minAmount.toString());
  if (filters.maxAmount !== undefined && filters.maxAmount > 0)
    params.set("maxAmount", filters.maxAmount.toString());
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.page) params.set("page", filters.page.toString());
  if (filters.size) params.set("size", filters.size.toString());

  const queryString = params.toString();
  const url = `/api/admin/orders${queryString ? `?${queryString}` : ""}`;

  const res = await http2(url);

  console.log("Orders response with filters:", res);

  return {
    ...res,
    orders: (res.orders || []).map(mapOrder),
  };
};

export const getOrders = async () => {
  return getOrdersWithFilters();
};

const MOCK_ORDER_DETAIL: Order = {
  id: "1",
  orderCode: "#ORD-0001",
  customerName: "Nguyen Van A",
  customerEmail: "abc@email.com",
  customerPhone: "0901234567",
  shippingAddress: "123 Duong ABC, Quan 1, TP.HCM",
  totalAmount: 2500000,
  subtotalAmount: 2200000,
  discountAmount: 50000,
  shippingAmount: 30000,
  taxAmount: 220000,
  itemsCount: 2,
  paymentStatus: "PAID",
  paymentMethod: "Mastercard (**** 7812)",
  transactionId: "#TXN-123456",
  deliveryNumber: "GHN-789654",
  trackingNumber: "GHN-789654",
  status: "CONFIRMED",
  priority: "NORMAL",
  createdAt: "2024-03-15T10:00:00Z",
  updatedAt: "2024-03-15T10:30:00Z",
  items: [
    {
      id: "i1",
      productName: "iPhone 15 Pro Max",
      productImage:
        "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&q=80",
      sku: "APL-IP15PM-256-TI",
      variant: "Titan Tu Nhien, 256GB",
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
      id: "s1",
      order_id: "1",
      shop_id: "2",
      shopName: "Tech Store",
      tracking_number: "GHN-789654",
      carrier_name: "GHN",
      shipping_status: "CONFIRMED",
      estimated_delivery_at: "2024-03-17T18:00:00Z",
      items: [
        {
          id: "i1",
          productName: "iPhone 15 Pro Max",
          productImage:
            "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&q=80",
          sku: "APL-IP15PM-256-TI",
          variant: "Titan Tu Nhien, 256GB",
          quantity: 1,
          price: 25000000,
          status: "Ready",
        },
      ],
      statusHistory: [
        {
          status: "PENDING",
          description: "Da tao van don",
          updatedAt: "2024-03-15T10:05:00Z",
        },
        {
          status: "CONFIRMED",
          description: "Shop da xac nhan va ban giao cho logistics",
          updatedAt: "2024-03-15T10:30:00Z",
        },
      ],
      shipping_fee: 30000,
      created_at: "2024-03-15T10:05:00Z",
      updated_at: "2024-03-15T10:30:00Z",
    },
  ],
  logs: [
    {
      id: "l1",
      action: "ORDER_CREATED",
      note: "Don hang duoc tao",
      performedBy: "System",
      createdAt: "2024-03-15T10:00:00Z",
    },
    {
      id: "l2",
      action: "ORDER_CONFIRMED",
      note: "Admin da xac nhan don hang",
      performedBy: "Admin",
      createdAt: "2024-03-15T10:20:00Z",
    },
  ],
  internalNote: "Khach hang yeu cau giao truoc 5h chieu",
  isFlagged: true,
};

export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const res = await http2(`/api/admin/orders/${id}`);
    const mapped = mapOrder(res);

    // Fallback to baseline mock detail when API returns incomplete detail data.
    const hasMinimumDetail =
      !!mapped.customerName &&
      !!mapped.shippingAddress &&
      Array.isArray(mapped.items) &&
      mapped.items.length > 0;

    if (!hasMinimumDetail) {
      return {
        ...MOCK_ORDER_DETAIL,
        id,
        orderCode: mapped.orderCode || MOCK_ORDER_DETAIL.orderCode,
      };
    }

    return mapped;
  } catch (error) {
    console.warn("Using mock order detail because API is unavailable", error);
    return {
      ...MOCK_ORDER_DETAIL,
      id,
    };
  }
};

// export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
//   await delay(600);
//   return true;
// };

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<boolean> => {
  await http2(`/api/admin/orders/${id}/status`, {
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
  await http2(`/api/admin/orders/${id}/tracking`, {
    method: "PUT",
    body: JSON.stringify({ trackingNumber }),
  });

  return true;
};

// ============================================================
// HELPER FUNCTIONS FOR ENRICHING ORDER DATA
// ============================================================

/**
 * Fetch user information to populate customerName, customerEmail, customerPhone
 * @param userId User ID from order
 * @returns User info or fallback object
 */
export const fetchUserInfo = async (
  userId: number,
): Promise<{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}> => {
  try {
    const res = await http2(`/api/admin/users/${userId}`);
    return {
      customerName: res.name || res.username || "Unknown Customer",
      customerEmail: res.email || "",
      customerPhone: res.phone || "",
    };
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    return {
      customerName: "Unknown Customer",
      customerEmail: "",
      customerPhone: "",
    };
  }
};

/**
 * Fetch address information for shipping address
 * @param addressId Address ID from order
 * @returns Full address or fallback
 */
export const fetchAddressInfo = async (addressId: number) => {
  try {
    const res = await http2(`/api/admin/addresses/${addressId}`);
    // Construct full address from components
    const address = [res.detailAddress, res.ward, res.district, res.city]
      .filter(Boolean)
      .join(", ");

    return address || "Unknown Address";
  } catch (error) {
    console.error(`Failed to fetch address ${addressId}:`, error);
    return "Unknown Address";
  }
};

/**
 * Fetch order items to populate items and itemsCount
 * @param orderId Order ID
 * @returns Array of order items
 */
export const fetchOrderItems = async (
  orderId: number,
): Promise<OrderItem[]> => {
  try {
    const res = await http2(`/api/admin/orders/${orderId}/items`);
    return res.items || [];
  } catch (error) {
    console.error(`Failed to fetch items for order ${orderId}:`, error);
    return [];
  }
};

/**
 * Enhanced mapOrder that can fetch related data
 * Use this when you need complete order information
 * @param o Raw order from API
 * @param fetchRelated If true, will fetch user, address, and items data (slower but complete)
 * @returns Fully populated Order object
 */
export const mapOrderEnhanced = async (
  o: any,
  fetchRelated: boolean = false,
): Promise<Order> => {
  const baseOrder = mapOrder(o);

  if (fetchRelated) {
    try {
      // Fetch all related data in parallel
      const [userInfo, address, items] = await Promise.all([
        o.userId
          ? fetchUserInfo(o.userId)
          : Promise.resolve({
              customerName: "",
              customerEmail: "",
              customerPhone: "",
            }),
        o.addressId ? fetchAddressInfo(o.addressId) : Promise.resolve(""),
        o.orderId ? fetchOrderItems(o.orderId) : Promise.resolve([]),
      ]);

      return {
        ...baseOrder,
        customerName: userInfo.customerName || baseOrder.customerName,
        customerEmail: userInfo.customerEmail || baseOrder.customerEmail,
        customerPhone: userInfo.customerPhone || baseOrder.customerPhone,
        shippingAddress: address || baseOrder.shippingAddress,
        items: items || [],
        itemsCount: items?.length || 0,
      };
    } catch (error) {
      console.error("Error enriching order data:", error);
      return baseOrder;
    }
  }

  return baseOrder;
};

/**
 * Get orders with optional data enrichment
 * @param enrichData If true, fetches related data for each order (slower)
 * @returns OrderResponse with mapped orders
 */
export const getOrdersEnhanced = async (enrichData: boolean = false) => {
  const res = await http2("/api/admin/orders");

  console.log("Raw orders response:", res);

  if (enrichData) {
    // Fetch enhanced data for all orders (in parallel batches)
    const enhancedOrders = await Promise.all(
      (res.orders || []).map((order: any) =>
        mapOrderEnhanced(order, true).catch((err) => {
          console.error("Error enriching order:", err);
          return mapOrder(order);
        }),
      ),
    );

    return {
      ...res,
      orders: enhancedOrders,
    };
  }

  // Fast path: just basic mapping without fetching related data
  return {
    ...res,
    orders: (res.orders || []).map(mapOrder),
  };
};

// export const updateOrderItems = async (id: string, items: OrderItem[], totalAmount: number): Promise<boolean> => {
//   await delay(800);
//   return true;
// };
