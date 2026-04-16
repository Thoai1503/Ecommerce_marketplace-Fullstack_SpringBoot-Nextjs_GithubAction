import React from "react";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELED"
  | "REFUNDED";
export type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED";
export type ProductStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "HIDDEN";
export type ItemStatus = "Ready" | "Packaging" | "Out of Stock";
export type CustomerStatus = "ACTIVE" | "BANNED" | "INACTIVE";
export type SellerStatus = "ACTIVE" | "BLOCKED" | "PENDING";

// --- USER MANAGEMENT TYPES ---
export type UserRole = "USER" | "SELLER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string; // Optional for Phase 2
}

// --- NOTIFICATION TYPES (NEW) ---
export type NotificationType = "ORDER" | "ALERT" | "SYSTEM" | "INFO";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string; // URL to navigate when clicked
}

// --- SETTINGS TYPES ---
export interface GeneralSettings {
  storeName: string;
  storeLogo: string | null;
  storeDescription: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "ADMIN";
}

export interface NotificationSettings {
  emailOrder: boolean; // Email khi có đơn mới
  emailStock: boolean; // Email cảnh báo hết hàng
  emailWeeklyReport: boolean; // Email báo cáo tuần
  systemSound: boolean; // Âm thanh thông báo
  systemPopup: boolean; // Popup trên màn hình
  securityLogin: boolean; // Cảnh báo đăng nhập lạ
}

// --- UNIT TYPES ---
export type UnitStatus = "ACTIVE" | "INACTIVE";
export type UnitType = "WEIGHT" | "LENGTH" | "VOLUME" | "QUANTITY" | "OTHER";

export interface Unit {
  id: string;
  label: string;
  symbol: string;
  type: UnitType;
  status: UnitStatus;
  createdAt: string;
}

// --- ATTRIBUTE TYPES ---
export type AttributeOptionType = "DROPDOWN" | "RADIO";

export interface Attribute {
  id: string;
  attributeCode: string;
  name: string;
  option: AttributeOptionType;
  unitId?: string;
  published: boolean;
  valuesCount: number;
  createdAt: string;
}

export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
  displayOrder: number;
  createdAt: string;
}

// --- CATEGORY TYPES ---
export type CategoryStatus = "ACTIVE" | "HIDDEN";

export interface Category {
  id: string;
  categoryCode: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl: string;
  status: CategoryStatus;
  productStock: number;
  attributeIds?: string[];
  createdAt: string;
}

// --- COUPON TYPES ---
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  minOrderAmount: number | null;
  status: CouponStatus;
  createdAt: string;
}

// --- FINANCE TYPES ---
export type TransactionStatus = "PAID" | "PENDING" | "CANCELLED";
export type PaymentRequestStatus = "PENDING" | "PAID" | "CANCELLED";

export interface Transaction {
  id: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  sellerName: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod: string;
}

export interface SellerPayment {
  id: string;
  sellerId: string;
  sellerName: string;
  period: string;
  revenue: number;
  commission: number;
  commissionRate: number;
  amount: number;
  status: PaymentRequestStatus;
  paidAt?: string;
  createdAt: string;
}

export interface FinanceStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingPayoutsCount: number;
  pendingPayoutsValue: number;
  revenueTrend: number;
  monthTrend: number;
  payoutsTrend: number;
}
// --------------------

export interface OrderLog {
  id: string;
  action: string;
  note: string;
  performedBy: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  sku: string;
  variant?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  status: ItemStatus;
}

// Shipment interface for multi-tracking support
export type ShipmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKED_UP"
  | "SHIPPING"
  | "DELIVERING"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface ShipmentStatusHistory {
  status: ShipmentStatus;
  description?: string;
  updatedAt: string;
}

export type AdjustmentStatus =
  | "PENDING_BUYER"
  | "ACCEPTED_BY_BUYER"
  | "REJECTED_BY_BUYER"
  | "CANCELLED_BY_SHOP"
  | "EXPIRED";

export interface AdjustmentItem {
  id: string;
  order_item_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name?: string;
  old_quantity: number;
  new_quantity: number;
  unit_price: number;
  old_total: number;
  new_total: number;
  diff_total: number;
}

export interface AdjustmentRequest {
  id: string;
  request_code: string;
  order_shipment_id: string;
  order_id: string;
  shop_id: string;
  status: AdjustmentStatus;
  shop_reason?: string;
  buyer_note?: string;
  total_original_amount: number;
  total_adjusted_amount: number;
  total_diff_amount: number;
  expires_at?: string;
  responded_at?: string;
  items: AdjustmentItem[];
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  shop_id: string;
  shopName: string;
  tracking_number: string;
  carrier_name?: string;
  shipping_status: ShipmentStatus;
  estimated_delivery_at?: string;
  items: OrderItem[];
  statusHistory?: ShipmentStatusHistory[];
  shipping_fee?: number;
  created_at: string;
  updated_at: string;
  adjustment_request?: AdjustmentRequest;
  adjustment_required?: boolean;
  business_status?: string;
  recipient?: any;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  sku: string;
  images: string[];
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: ProductStatus;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  attributes?: Record<string, string>;
  createdAt: string;
  rejectReason?: string;
  viewCount?: number;
}

export interface Address {
  id: string;
  fullAddress: string;
  city: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  accountCode: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: CustomerStatus;
  joinedAt: string;
  addresses: Address[];
  note?: string;
}

export interface Seller {
  id: string;
  accountCode: string;
  brandTitle: string;
  category: string;
  website?: string;
  location: string;
  email: string;
  phone: string;
  logoUrl: string;
  status: SellerStatus;
  createdAt: string;
  ownerName: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  itemsCount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  deliveryNumber: string;
  status: OrderStatus;
  priority: "NORMAL" | "HIGH";
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  shipments?: Shipment[]; // New: Multi-tracking support
  logs?: OrderLog[];
  internalNote?: string;
  isFlagged?: boolean;
  trackingNumber?: string; // Deprecated: use shipments[].tracking_number instead
}

// --- DASHBOARD TYPES (PHASE 1) ---
export type DashboardPeriod = "today" | "week" | "month";

export interface DashboardStats {
  revenue: number;
  orders: number;
  newCustomers: number;
  activeProducts: number;
  changes: {
    revenue: number; // percentage
    orders: number;
    newCustomers: number;
    activeProducts: number;
  };
  lastUpdated: string;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  prevRevenue: number; // For comparison in Phase 2
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  sold: number;
  price: number;
  category: string;
  growth: number; // percentage growth
  stock: number;
  totalRevenue: number;
}

export interface CalculateFeePayload {
  from_district_id: number;
  from_ward_code: string;
  service_id?: number;
  service_type_id?: number | null;
  to_district_id: number;
  to_ward_code: string;
  height: number;
  length: number;
  weight: number;
  width: number;
  insurance_value?: number;
  cod_failed_amount: number;
  coupon: null;
  items: Package[];
}
export interface Package {
  name: string;
  quantity: number;
  height: number;
  weight: number;
  length: number;
  width: number;
}
