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
  parentId?: number;
  parent_id?: number;
  level?: number;
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

// --- VOUCHER V2 ADMIN TYPES ---
export type VoucherIssuerType = "PLATFORM" | "SHOP" | "BRAND";
export type VoucherDiscountType =
  | "PERCENT"
  | "FIXED"
  | "FREE_SHIPPING"
  | "GIFT_ITEM";
export type VoucherStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "DEPLETED"
  | "ARCHIVED";

export interface VoucherCampaign {
  id: string;
  code: string;
  name: string;
  description?: string;
  startAt: string;
  endAt: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED" | "CANCELLED";
  createdAt: string;
}

export interface AdminVoucher {
  id: string;
  campaignId?: string | null;
  campaignCode?: string | null;
  code: string;
  title: string;
  description?: string;
  issuerType: VoucherIssuerType;
  issuerId?: number | null;
  issuerName?: string | null;
  discountType: VoucherDiscountType;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  maxOrderValue?: number | null;
  totalQuota: number;
  claimedCount: number;
  redeemedCount: number;
  perUserQuota: number;
  stackable: boolean;
  claimStartAt: string;
  claimEndAt: string;
  validFrom: string;
  validTo: string;
  status: VoucherStatus;
  scopeRule?: VoucherScopeRule;
  priority: number;
  createdAt: string;
}

export interface VoucherScopeRule {
  id: string;
  voucherId: string;
  scopeType: "SHOP" | "CATEGORY" | "PRODUCT" | "BRAND" | "PAYMENT_METHOD";
  scopeId: number;
  includeExclude: "INCLUDE" | "EXCLUDE";
  createdAt: string;
}

export interface VoucherAdminStats {
  totalVouchers: number;
  activeVouchers: number;
  redemptionRate: number;
  totalDiscountAmount: number;
}

export type VoucherScopeType =
  | "SHOP"
  | "CATEGORY"
  | "PRODUCT"
  | "BRAND"
  | "PAYMENT_METHOD"
  | "SHIPPING_METHOD";

export interface VoucherSegmentRule {
  id: string;
  voucherId: string;
  segmentType:
    | "NEW_USER"
    | "VIP"
    | "APP_ONLY"
    | "MEMBERSHIP_TIER"
    | "FIRST_ORDER";
  segmentValue?: string | null;
}

export interface VoucherRulesPayload {
  scopeRules: VoucherScopeRule[];
  segmentRules: VoucherSegmentRule[];
}

export interface VoucherRedemptionEvent {
  id: string;
  voucherId: string;
  userName: string;
  orderCode: string;
  discountAmountApplied: number;
  finalOrderAmount: number;
  status: "SUCCESS" | "FAILED" | "ROLLED_BACK";
  redeemedAt: string;
}

export interface VoucherAuditEvent {
  id: string;
  voucherId: string;
  eventType: string;
  actorType: "ADMIN" | "SYSTEM" | "USER";
  actorName: string;
  note?: string;
  createdAt: string;
}

// --- FINANCE TYPES (PAYMENT SERVICE) ---
export type PaymentTxnType =
  | "ORDER_PAYMENT"
  | "WALLET_TOPUP"
  | "WALLET_WITHDRAW"
  | "SETTLEMENT_PAYOUT"
  | "REFUND_PAYOUT"
  | "PLATFORM_FEE"
  | "ADJUSTMENT";

export type PaymentTxnStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export interface PaymentTransaction {
  id: number;
  txnCode: string;
  txnType: PaymentTxnType;
  refType?: string | null;
  refId?: number | null;
  refCode?: string | null;
  payerType?: string | null;
  payerId?: number | null;
  payeeType?: string | null;
  payeeId?: number | null;
  orderId?: number | null;
  orderNumber?: string | null;
  userId?: number | null;
  grossAmount: number;
  feeAmount: number;
  discountAmount: number;
  netAmount: number;
  currency: string;
  paymentMethod?: string | null;
  gatewayCode?: string | null;
  gatewayTxnId?: string | null;
  gatewayOrderId?: string | null;
  gatewayRefCode?: string | null;
  gatewayResponseCode?: string | null;
  gatewayResponseMsg?: string | null;
  paymentUrl?: string | null;
  bankCode?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  cardType?: string | null;
  status: PaymentTxnStatus;
  failureReason?: string | null;
  expiredAt?: string | null;
  completedAt?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  initiatedBy?: string | null;
  initiatorId?: number | null;
  note?: string | null;
}

export interface TransactionStatusUpdatePayload {
  status: PaymentTxnStatus;
  reason?: string;
  changedBy: string;
  actorId?: number;
}

export interface PaymentStatusHistory {
  id: number;
  transactionId: number;
  fromStatus: string | null; // NULL = first creation
  toStatus: PaymentTxnStatus;
  changedBy: "USER" | "SYSTEM" | "GATEWAY" | "ADMIN" | "WEBHOOK";
  actorId?: number | null;
  reason?: string | null;
  gatewayData?: Record<string, any> | null;
  createdAt: string;
}

export interface PaymentRevenueSnapshotAdmin {
  id: number;
  transactionId: number;
  txnCode: string;
  txnType: PaymentTxnType | string;
  currency: string;
  recognizedAt: string;
  grossAmount: number;
  discountAmount: number;
  feeAmount: number;
  netAmount: number;
  cumulativeSuccessCount: number;
  cumulativeGrossAmount: number;
  cumulativeDiscountAmount: number;
  cumulativeFeeAmount: number;
  cumulativeNetAmount: number;
  createdAt: string;
  orderId?: number | null;
  orderNumber?: string | null;
  paymentMethod?: string | null;
  transactionStatus?: PaymentTxnStatus | string | null;
}

export interface PaymentRevenueSummaryAdmin {
  txnType?: string | null;
  fromTime?: string | null;
  toTime?: string | null;
  successCount: number;
  grossAmount: number;
  discountAmount: number;
  feeAmount: number;
  netAmount: number;
  latestRecognizedAt?: string | null;
}

export interface PaymentRevenueReconciliationAdmin {
  txnType?: string | null;
  filteredSuccessTransactionCount: number;
  filteredSnapshotCount: number;
  missingSnapshotCount: number;
  invalidSnapshotCount: number;
  overallSuccessTransactionCount: number;
  overallSnapshotCount: number;
  cumulativeCountGap: number;
  cumulativeGrossGap: number;
  cumulativeDiscountGap: number;
  cumulativeFeeGap: number;
  cumulativeNetGap: number;
  latestSnapshot?: PaymentRevenueSnapshotAdmin | null;
  missingTransactions: PaymentTransaction[];
  invalidSnapshots: PaymentRevenueSnapshotAdmin[];
}

export interface PaymentRevenueFilters {
  txnType?: string;
  fromTime?: string;
  toTime?: string;
}

export type RefundStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface RefundRequestAdmin {
  id: number;
  refundCode: string;
  transaction?: { id: number; txnCode?: string } | null;
  orderId: number;
  orderNumber: string;
  userId: number;
  shopId?: number | null;
  refundAmount: number;
  shippingRefund: number;
  currency: string;
  refundType: string;
  reason?: string | null;
  refundMethod: string;
  status: RefundStatus;
  reviewNote?: string | null;
  requestedAt: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface RefundStatusUpdatePayload {
  status: RefundStatus;
  reason?: string;
  changedBy: string;
  actorId?: number;
}

export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED_BUYER"
  | "RESOLVED_SELLER"
  | "CLOSED";

export interface PaymentDisputeAdmin {
  id: number;
  disputeCode: string;
  transaction?: { id: number; txnCode?: string } | null;
  orderId: number;
  userId: number;
  shopId?: number | null;
  disputeType: string;
  disputeAmount: number;
  description?: string | null;
  status: DisputeStatus;
  resolutionNote?: string | null;
  resolvedBy?: number | null;
  openedAt: string;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface DisputeResolvePayload {
  resolution: "RESOLVED_BUYER" | "RESOLVED_SELLER" | "CLOSED";
  resolutionNote?: string;
  resolvedBy: number;
}

export type SettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "ON_HOLD"
  | "CANCELLED";

export interface SellerSettlementAdmin {
  id: number;
  settlementCode: string;
  shopId: number;
  periodFrom: string;
  periodTo: string;
  grossAmount: number;
  platformFee: number;
  shippingSubsidy: number;
  voucherCost: number;
  adjustmentAmount: number;
  netAmount: number;
  currency: string;
  bankCode?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  status: SettlementStatus;
  onHoldReason?: string | null;
  paidAt?: string | null;
  bankTransferRef?: string | null;
  processedBy?: number | null;
  is_verified: number;
  createdAt: string;
}

export interface SettlementStatusUpdatePayload {
  status: SettlementStatus;
}

export interface PaymentWalletAdmin {
  id: number;
  userId: number;
  balance: number;
  lockedBalance: number;
  currency: string;
  isActive: boolean;
  status?: "ACTIVE" | "SUSPENDED" | "CLOSED";
  walletStatus?: "ACTIVE" | "SUSPENDED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionAdmin {
  id: number;
  wallet?: { id: number } | null;
  userId: number;
  txnType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  refType?: string | null;
  refId?: number | null;
  description?: string | null;
  createdAt: string;
}

export interface WalletOperationPayload {
  amount: number;
  refType?: string;
  refId?: number;
  description?: string;
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
  lastReturnRequestId?: number;
  discount?: number;
  shopVoucherDiscountAmount?: number;
  platformVoucherDiscountAmount?: number;
  totalVoucherDiscountAmount?: number;
  totalAfterShopVoucher?: number;
  totalAfterAllVouchers?: number;
  platformCommissionAmount?: number;
  sellerReceivableAmount?: number;
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
  | "COMPLETED"
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
  id: number;
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
  // Return request fields
  returnStatusSummary?: string;
  returnRequestMedia?: Array<{
    file_type: string;
    url: string;
    file_url?: string;
    file_name?: string;
  }>;
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
  isActive: boolean;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  attributes?: Record<string, string>;
  createdAt: string;
  rejectReason?: string;
  viewCount?: number;
  soldCount: number;
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
  userId?: string;
  idCardFront?: string;
  idCardBack?: string;
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
  shipmentsCount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  deliveryNumber: string;
  status: OrderStatus;
  priority: "NORMAL" | "HIGH";
  createdAt: string;
  updatedAt: string;
  lastReturnRequestId?: number;
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
