"use client";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { useOrderPage } from "@/feature/admin/hooks/useOrderPage";
import { OrderShipments } from "@/types/data/OrderShipment";
import { IOrder } from "@/validators/order";
import { IOrderShipment } from "@/validators/orderShipment";
import { convertAddressToNames } from "@/services/addressService";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Hash,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { useOrderShipmentFilter } from "@/hooks/seller/useOrderShipmentFilter";
import { useRouter } from "next/navigation";

type PendingShipmentOrder = {
  shipmentId: number;

  orderId: number;
  orderNumber?: string;
  totalPrice?: number;
  buyerName: string;
  recipient: Record<string, unknown> | null | undefined;
  items: any[];
};

type LogisticsConfirmSuccess = {
  trackingCode: string;
  shippingStatus: string;
  message?: string;
};

type AdjustmentDraftItem = {
  orderItemId: number;
  productName: string;
  variantName?: string;
  oldQuantity: number;
  newQuantity: number;
  unitPrice: number;
};

const mapShippingStatusToUiStatus = (shippingStatus?: string) => {
  switch ((shippingStatus || "").toUpperCase()) {
    case "PENDING":
      return "pending_shipment";
    case "CONFIRMED":
      return "confirmed";
    case "PICKED_UP":
      return "picked_up";
    case "IN_TRANSIT":
      return "in_transit";
    case "OUT_FOR_DELIVERY":
      return "out_for_delivery";
    case "DELIVERED":
      return "delivered";
    case "FAILED":
      return "failed";
    case "RETURNED":
      return "returned";
    case "COMPLETED":
      return "completed";
    case "CANCELED":
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending_shipment";
  }
};

const mapOrderStatusToUiStatus = (orderStatus?: string) => {
  switch ((orderStatus || "").toUpperCase()) {
    case "CANCELED":
    case "CANCELLED":
    case "CANCEL":
      return "cancelled";
    default:
      return null;
  }
};

const resolveShipmentUiStatus = (
  orderStatus?: string,
  shippingStatus?: string,
) => {
  const orderUiStatus = mapOrderStatusToUiStatus(orderStatus);
  if (orderUiStatus) {
    return orderUiStatus;
  }
  return mapShippingStatusToUiStatus(shippingStatus);
};

const getStatusLabel = (status?: string): string => {
  switch (status) {
    case "pending_shipment":
      return "Chờ xác nhận";
    case "confirmed":
      return "Chờ lấy hàng";
    case "picked_up":
      return "Đã giao cho ĐVVC";
    case "in_transit":
      return "Đang vận chuyển";
    case "out_for_delivery":
      return "Đang giao";
    case "delivered":
      return "Đã giao";
    case "failed":
      return "Thất bại";
    case "returned":
      return "Trả hàng";
    case "completed":
      return "Hoàn thành";
    case "pending_payment":
      return "Chờ thanh toán";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Chờ xác nhận";
  }
};

type RecipientShape = {
  recipientName?: string;
  recipientPhone?: string;
  addressLine?: string;
  ward?: string | number;
  district?: string | number;
  city?: string | number;
  postalCode?: string | null;
  name?: string;
};

function ConfirmLogisticsModal({
  data,
  success,
  onClose,
  onConfirm,
  isConfirming,
}: {
  data: PendingShipmentOrder;
  success: LogisticsConfirmSuccess | null;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
}) {
  const r = data.recipient as RecipientShape | null | undefined;
  const addressInfo =
    r &&
    convertAddressToNames(
      r.city ?? "",
      r.district ?? "",
      r.ward ?? "",
      r.addressLine ?? "",
    );
  const recipientName = r?.recipientName || r?.name || "—";
  const recipientPhone = r?.recipientPhone || "—";

  const itemsLinesTotal = data.items.reduce((sum, it) => {
    const q = it.quantity ?? 1;
    const p = it.price ?? 0;
    return sum + p * q;
  }, 0);

  const successUiStatus = success
    ? mapShippingStatusToUiStatus(success.shippingStatus)
    : null;
  const successStatusLabel = successUiStatus
    ? getStatusLabel(successUiStatus)
    : "";

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-2"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      onClick={() => !isConfirming && onClose()}
    >
      <div
        className="bg-white rounded-3 shadow border"
        style={{ width: "720px", maxWidth: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-bottom bg-light rounded-top px-4 py-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                success
                  ? "bg-success bg-opacity-10 text-success"
                  : "bg-danger bg-opacity-10 text-danger"
              }`}
              style={{ width: 52, height: 52 }}
            >
              {success ? (
                <CheckCircle size={28} strokeWidth={1.75} />
              ) : (
                <Package size={26} strokeWidth={1.75} />
              )}
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1 fw-bold d-flex align-items-center gap-2">
                {success
                  ? "Đã xác nhận và gửi logistics"
                  : "Xác nhận đóng gói và gửi logistics"}
                {!success && (
                  <Truck size={18} className="text-danger" strokeWidth={2} />
                )}
              </h5>
              <p className="text-muted small mb-0">
                {success
                  ? "Thông tin vận đơn đã được cập nhật. Bạn có thể đóng cửa sổ này."
                  : "Kiểm tra lại thông tin người nhận và kiện hàng trước khi bàn giao cho đơn vị vận chuyển."}
              </p>
            </div>
          </div>
        </div>

        <div
          className="px-4 py-3 position-relative"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {isConfirming && !success && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded"
              style={{
                zIndex: 10,
                background: "rgba(255,255,255,0.92)",
                minHeight: 240,
              }}
            >
              <div
                className="spinner-border text-danger mb-3"
                style={{ width: "2.5rem", height: "2.5rem" }}
                role="status"
              >
                <span className="visually-hidden">Đang xử lý...</span>
              </div>
              <span className="fw-medium text-dark small text-center px-3">
                Đang gửi yêu cầu đến logistics...
              </span>
            </div>
          )}

          {success && (
            <div className="alert alert-success border-0 mb-3 py-3">
              <div className="fw-semibold mb-2 d-flex align-items-center gap-2">
                <Truck size={18} />
                Thông tin vận chuyển mới
              </div>
              <div className="small mb-2">
                <span className="text-muted">Mã vận đơn (tracking):</span>{" "}
                <span className="fw-bold text-dark user-select-all">
                  {success.trackingCode || "—"}
                </span>
              </div>
              <div className="small mb-2">
                <span className="text-muted">Trạng thái giao hàng:</span>{" "}
                <span className="badge bg-success">{successStatusLabel}</span>
                <span className="text-muted ms-2">
                  ({success.shippingStatus})
                </span>
              </div>
              {success.message ? (
                <div className="small text-dark mb-0 border-top pt-2 mt-2">
                  {success.message}
                </div>
              ) : null}
            </div>
          )}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
              <Hash size={12} />
              Đơn #{data.orderId}
              {data.orderNumber ? ` · ${data.orderNumber}` : ""}
            </span>
            <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
              <ShoppingBag size={12} />
              Mã lô giao: {data.shipmentId}
            </span>
            {(data.totalPrice != null || itemsLinesTotal > 0) && (
              <span className="badge bg-danger d-inline-flex align-items-center gap-1">
                Tổng: đ{(data.totalPrice ?? itemsLinesTotal).toLocaleString()}
              </span>
            )}
          </div>

          <div className="rounded border bg-white mb-3">
            <div className="bg-light px-3 py-2 border-bottom small fw-semibold text-secondary d-flex align-items-center gap-2">
              <User size={16} className="text-danger" />
              Người mua / liên hệ đặt hàng
            </div>
            <div className="px-3 py-2 small">
              <span className="fw-medium text-dark">{data.buyerName}</span>
            </div>
          </div>

          <div className="rounded border bg-white mb-3">
            <div className="bg-light px-3 py-2 border-bottom small fw-semibold text-secondary d-flex align-items-center gap-2">
              <MapPin size={16} className="text-danger" />
              Người nhận & địa chỉ giao
            </div>
            <div className="px-3 py-3 small">
              <div className="d-flex align-items-start gap-2 mb-2">
                <User size={16} className="text-muted mt-1 flex-shrink-0" />
                <div>
                  <div className="fw-semibold text-dark">{recipientName}</div>
                  <div className="d-flex align-items-center gap-2 text-muted mt-1">
                    <Phone size={14} />
                    <span>{recipientPhone}</span>
                  </div>
                </div>
              </div>
              {addressInfo && (
                <div className="d-flex align-items-start gap-2 ps-1">
                  <MapPin size={16} className="text-muted mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-dark">{addressInfo.fullAddress}</div>
                    {r?.postalCode ? (
                      <div className="text-muted mt-1">
                        Mã bưu điện: {r.postalCode}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded border bg-white mb-2">
            <div className="bg-light px-3 py-2 border-bottom small fw-semibold text-secondary d-flex align-items-center gap-2">
              <ShoppingBag size={16} className="text-danger" />
              Kiện hàng / sản phẩm
            </div>
            <div className="p-0">
              {data.items.length === 0 ? (
                <div className="px-3 py-4 text-center text-muted small">
                  Không có thông tin sản phẩm.
                </div>
              ) : (
                data.items.map((item, idx) => {
                  const productName =
                    item.product_name || item.productName || "Sản phẩm";
                  const variantName = item.variantName || item.variant_name;
                  const qty = item.quantity ?? 1;
                  const price = item.price ?? 0;
                  const line = price * qty;
                  return (
                    <div
                      key={`${item.id ?? idx}-${idx}`}
                      className={`d-flex align-items-start gap-3 px-3 py-3 ${
                        idx < data.items.length - 1 ? "border-bottom" : ""
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          width={64}
                          height={64}
                          className="rounded border flex-shrink-0"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-light border rounded d-flex align-items-center justify-content-center flex-shrink-0 text-muted"
                          style={{ width: 64, height: 64 }}
                        >
                          <Package size={28} strokeWidth={1.25} />
                        </div>
                      )}
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-medium text-dark">{productName}</div>
                        {variantName ? (
                          <div className="text-muted small mt-1">
                            Phiên bản: {variantName}
                          </div>
                        ) : null}
                        <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
                          <span>
                            Đơn giá:{" "}
                            <span className="text-dark">
                              đ{price.toLocaleString()}
                            </span>
                          </span>
                          <span>
                            SL: <strong className="text-dark">{qty}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <div className="small text-muted">Thành tiền</div>
                        <div className="fw-bold text-dark">
                          đ{line.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-light border-top d-flex justify-content-end gap-2 rounded-bottom">
          {success ? (
            <button
              type="button"
              className="btn btn-success px-4"
              onClick={onClose}
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isConfirming}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger d-inline-flex align-items-center gap-2"
                onClick={onConfirm}
                disabled={isConfirming}
              >
                <Truck size={18} />
                {isConfirming ? "Đang xác nhận..." : "Xác nhận gửi logistics"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OutOfStockAdjustmentModal({
  data,
  onClose,
  onSubmitAdjustment,
  onCancelShipment,
  isSubmitting,
}: {
  data: PendingShipmentOrder;
  onClose: () => void;
  onSubmitAdjustment: (payload: {
    reason: string;
    items: Array<{ orderItemId: number; newQuantity: number }>;
  }) => Promise<void>;
  onCancelShipment: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState("");
  const [draftItems, setDraftItems] = useState<AdjustmentDraftItem[]>([]);

  useEffect(() => {
    const initItems: AdjustmentDraftItem[] = (data.items ?? []).map(
      (item, idx) => ({
        orderItemId: Number(item.id ?? idx + 1),
        productName: String(
          item.product_name || item.productName || "Sản phẩm",
        ),
        variantName: item.variantName || item.variant_name || undefined,
        oldQuantity: Number(item.quantity ?? 0),
        newQuantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.price ?? 0),
      }),
    );
    setDraftItems(initItems);
    setReason("");
  }, [data]);

  const changedItems = useMemo(
    () =>
      draftItems
        .filter((item) => item.newQuantity !== item.oldQuantity)
        .map((item) => ({
          orderItemId: item.orderItemId,
          newQuantity: item.newQuantity,
        })),
    [draftItems],
  );

  const summary = useMemo(() => {
    const oldTotal = draftItems.reduce(
      (sum, item) => sum + item.oldQuantity * item.unitPrice,
      0,
    );
    const newTotal = draftItems.reduce(
      (sum, item) => sum + item.newQuantity * item.unitPrice,
      0,
    );
    return {
      oldTotal,
      newTotal,
      diffTotal: oldTotal - newTotal,
    };
  }, [draftItems]);

  const setNewQuantity = (orderItemId: number, value: number) => {
    setDraftItems((prev) =>
      prev.map((item) =>
        item.orderItemId === orderItemId
          ? {
              ...item,
              newQuantity: Math.max(0, Math.min(item.oldQuantity, value)),
            }
          : item,
      ),
    );
  };

  const handleSubmitAdjustment = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do thiếu hàng.");
      return;
    }
    if (changedItems.length === 0) {
      alert("Vui lòng chỉnh số lượng ít nhất 1 sản phẩm.");
      return;
    }
    await onSubmitAdjustment({
      reason: reason.trim(),
      items: changedItems,
    });
  };

  const handleCancelShipment = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do hủy kiện.");
      return;
    }
    const confirmed = window.confirm(
      "Xác nhận hủy kiện do thiếu hàng? Hành động này sẽ thông báo cho buyer.",
    );
    if (!confirmed) return;
    await onCancelShipment(reason.trim());
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-2"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="bg-white rounded-3 shadow border"
        style={{ width: "860px", maxWidth: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-bottom bg-light rounded-top px-4 py-3">
          <h5 className="mb-1 fw-bold d-flex align-items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            Thiếu hàng: Điều chỉnh số lượng hoặc hủy kiện
          </h5>
          <p className="text-muted small mb-0">
            Đơn #{data.orderId}{" "}
            {data.orderNumber ? `· ${data.orderNumber}` : ""} - Kiện #
            {data.shipmentId}
          </p>
        </div>

        <div
          className="px-4 py-3"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <div className="alert alert-warning small py-2 mb-3">
            Giảm số lượng xuống <strong>0</strong> để bỏ item khỏi kiện.
          </div>
          <div className="table-responsive border rounded">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Sản phẩm</th>
                  <th className="text-center">SL đặt</th>
                  <th className="text-center">SL mới</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-end">Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {draftItems.map((item) => {
                  const diff =
                    (item.oldQuantity - item.newQuantity) * item.unitPrice;
                  return (
                    <tr key={item.orderItemId}>
                      <td>
                        <div className="fw-medium">{item.productName}</div>
                        {item.variantName ? (
                          <small className="text-muted">
                            {item.variantName}
                          </small>
                        ) : null}
                      </td>
                      <td className="text-center">{item.oldQuantity}</td>
                      <td className="text-center">
                        <input
                          type="number"
                          min={0}
                          max={item.oldQuantity}
                          value={item.newQuantity}
                          onChange={(e) =>
                            setNewQuantity(
                              item.orderItemId,
                              Number(e.target.value || 0),
                            )
                          }
                          className="form-control form-control-sm text-center mx-auto"
                          style={{ width: 90 }}
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="text-end">
                        đ{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="text-end text-danger">
                        {diff > 0 ? `- đ${diff.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-8">
              <label className="form-label small fw-semibold mb-1">
                Lý do thiếu hàng <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ví dụ: Hết màu/size này ở kho, chỉ còn số lượng như đã cập nhật..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="col-md-4">
              <div className="border rounded p-3 bg-light small h-100">
                <div className="d-flex justify-content-between">
                  <span>Tổng ban đầu</span>
                  <strong>đ{summary.oldTotal.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>Tổng sau chỉnh</span>
                  <strong>đ{summary.newTotal.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mt-2 pt-2 border-top text-danger">
                  <span>Giảm trừ</span>
                  <strong>- đ{summary.diffTotal.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-light border-top d-flex justify-content-between gap-2 rounded-bottom">
          <button
            type="button"
            className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
            onClick={handleCancelShipment}
            disabled={isSubmitting}
          >
            <XCircle size={16} />
            {isSubmitting ? "Đang xử lý..." : "Hủy kiện do thiếu hàng"}
          </button>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Đóng
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleSubmitAdjustment}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Đang gửi..."
                : "Gửi đề xuất điều chỉnh cho buyer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const page = () => {
  const { shop: shopData } = useSellerAuth();
  const {
    apiParams,
    filters,
    updateFilters,

    updatePage,
    isHydrated,
    clearFilters,
  } = useOrderShipmentFilter();
  const router = useRouter();

  const [allOrderShipments, setAllOrderShipments] = useState<IOrderShipment[]>(
    [],
  );
  console.log("Shop Data in Order Page:", JSON.stringify(shopData, null, 2));
  OrderShipments.setup({ path: "/seller/order-shipment" });
  const { data: orderShipments, refetch } = useQuery({
    ...OrderShipments.getByShopId(shopData?.id || 0, apiParams),
    enabled: !!shopData?.id && isHydrated,
  });

  useEffect(() => {
    if (orderShipments && allOrderShipments.length === 0) {
      setAllOrderShipments( orderShipments);
    }
  }, [orderShipments, allOrderShipments.length]);

  console.log("Order Shipments Data:", JSON.stringify(orderShipments, null, 2));
  const { shop, orders: mockOrders } = useOrderPage();

  // Combine API data (top) + Mock data (bottom)
  const combinedOrders = useMemo(() => {
    const apiOrders =
      orderShipments?.map((shipment: any) => ({
        shipmentId: shipment.shipmentId,
        id: shipment.orderId,
        order_number: shipment.order?.orderNumber,
        order_code: shipment.order?.orderNumber,
        total_price: shipment.totalAmount,
        status: resolveShipmentUiStatus(
          shipment.order?.orderStatus,
          shipment.shippingStatus,
        ),
        buyer_name: shipment.recipient?.recipientName,
        orders_items: shipment.items,
        tracking_number: shipment.trackingNumber,
        tracking_carrier: shipment.carrierName,
        recipient: shipment.recipient,
        _source: "api",
      })) ?? [];

    const mockOrders_ = mockOrders.map((order: any) => ({
      ...order,
      _source: "mock",
    }));

    return [
      ...apiOrders,
      //, ...mockOrders_
    ];
  }, [orderShipments, mockOrders]);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingShipmentOrder, setPendingShipmentOrder] =
    useState<PendingShipmentOrder | null>(null);
  const [isConfirmingLogistics, setIsConfirmingLogistics] = useState(false);
  const [logisticsConfirmSuccess, setLogisticsConfirmSuccess] =
    useState<LogisticsConfirmSuccess | null>(null);
  const [adjustmentShipmentOrder, setAdjustmentShipmentOrder] =
    useState<PendingShipmentOrder | null>(null);
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);

  const openPendingShipmentModal = (order: any) => {
    setLogisticsConfirmSuccess(null);
    setPendingShipmentOrder({
      shipmentId: Number(order.shipmentId),
      orderId: Number(order.id),
      orderNumber: order.order_code || order.order_number,
      totalPrice: order.total_price,
      buyerName: order.buyer_name || order.recipient?.name || "Khach mua",
      recipient: order.recipient,
      items: order.orders_items || [],
    });
  };

  const closePendingShipmentModal = () => {
    if (isConfirmingLogistics) return;
    setLogisticsConfirmSuccess(null);
    setPendingShipmentOrder(null);
  };

  const openAdjustmentModal = (order: any) => {
    setAdjustmentShipmentOrder({
      shipmentId: Number(order.shipmentId),
      orderId: Number(order.id),
      orderNumber: order.order_code || order.order_number,
      totalPrice: order.total_price,
      buyerName: order.buyer_name || order.recipient?.name || "Khach mua",
      recipient: order.recipient,
      items: order.orders_items || [],
    });
  };

  const closeAdjustmentModal = () => {
    if (isSubmittingAdjustment) return;
    setAdjustmentShipmentOrder(null);
  };

  const handleConfirmLogistics = async () => {
    if (!pendingShipmentOrder) return;
    try {
      setIsConfirmingLogistics(true);
      const res = await OrderShipments.confirmPackaged(
        pendingShipmentOrder.shipmentId,
      );
      const raw = (res as { data?: unknown })?.data ?? res;
      const payload = raw as Record<string, unknown>;
      const nested =
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        payload.data &&
        typeof payload.data === "object"
          ? (payload.data as Record<string, unknown>)
          : payload;

      const trackingCode = String(nested?.trackingCode ?? "");
      const shippingStatus = String(nested?.shippingStatus ?? "");
      const message =
        nested?.message != null ? String(nested.message) : undefined;

      await refetch();
      setLogisticsConfirmSuccess({
        trackingCode,
        shippingStatus,
        message,
      });
    } catch (error) {
      console.error("Confirm logistics failed", error);
      alert("Không thể xác nhận logistics. Vui lòng thử lại.");
    } finally {
      setIsConfirmingLogistics(false);
    }
  };

  const handleSubmitAdjustment = async (payload: {
    reason: string;
    items: Array<{ orderItemId: number; newQuantity: number }>;
  }) => {
    if (!adjustmentShipmentOrder) return;
    try {
      setIsSubmittingAdjustment(true);
      await OrderShipments.createAdjustmentRequest(
        adjustmentShipmentOrder.shipmentId,
        {
          shopReason: payload.reason,
          items: payload.items,
        },
      );
      await refetch();
      alert("Đã gửi đề xuất điều chỉnh số lượng cho buyer.");
      setAdjustmentShipmentOrder(null);
    } catch (error) {
      console.error("Create adjustment request failed", error);
      alert(
        "Chưa gửi được đề xuất điều chỉnh. Vui lòng kiểm tra endpoint /adjustment-request ở order-service.",
      );
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  const handleCancelShipmentByOos = async (reason: string) => {
    if (!adjustmentShipmentOrder) return;
    try {
      setIsSubmittingAdjustment(true);
      await OrderShipments.cancelByOutOfStock(
        adjustmentShipmentOrder.shipmentId,
        {
          reason,
        },
      );
      await refetch();
      alert("Đã hủy kiện do thiếu hàng.");
      setAdjustmentShipmentOrder(null);
    } catch (error) {
      console.error("Cancel shipment by OOS failed", error);
      alert(
        "Chưa hủy được kiện. Vui lòng kiểm tra endpoint /cancel-by-oos ở order-service.",
      );
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex-grow-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h5 className="mb-0 me-3">Đơn hàng</h5>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="#" className="text-decoration-none">
                  Trang chủ
                </a>
              </li>
              <li className="breadcrumb-item active">Đơn hàng</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary">
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="me-1"
            >
              <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z" />
            </svg>
            Cài đặt đơn hàng
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            Công cụ xử lý hàng loạt
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mx-3 border-bottom">
        <ul className="nav nav-tabs border-0">
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "all"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => {
                router.push("/seller/orders?status=ALL");
                setActiveTab("all");
              }}
            >
              Tất cả
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "waiting-for-payment"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => {
                router.push("/seller/orders?paymentStatus=PENDING");
                setActiveTab("waiting-for-payment");
              }}
            >
              Chờ thanh toán{" "}
              <span className="badge bg-danger rounded-circle ms-1">
                {
                  allOrderShipments?.filter(
                    (shipment: any) =>
                      shipment.order.paymentStatus === "PENDING",
                  ).length
                }
              </span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "waiting-for-shipping"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => {
                router.push("/seller/orders?status=CONFIRMED");
                setActiveTab("waiting-for-shipping");
              }}
            >
              Chờ gửi hàng{" "}
              <span className="badge bg-danger rounded-circle ms-1">
                {
                  allOrderShipments?.filter(
                    (shipment: any) => shipment.shippingStatus === "CONFIRMED",
                  ).length
                }
              </span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "shipped"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => setActiveTab("shipped")}
            >
              Đã gửi hàng
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "delivered"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => setActiveTab("delivered")}
            >
              Đã giao
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "cancelled"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => setActiveTab("cancelled")}
            >
              Đã hủy
            </button>
          </li>
        </ul>
      </div>

      {/* Filters */}
      <div className="bg-white mx-3 p-3 border-bottom">
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm Mã đơn hàng, Tên khách hàng"
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              placeholder="Chọn ngày"
            />
          </div>
          <div className="col-md-3">
            <select className="form-select">
              <option>Trạng thái đơn</option>
              <option>Chờ thanh toán</option>
              <option>Chờ gửi hàng</option>
              <option>Đã gửi hàng</option>
              <option>Đã giao</option>
              <option>Đã hủy</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-danger w-100">Áp dụng</button>
          </div>
        </div>
      </div>

      {/* Order Count */}
      <div className="bg-white mx-3 p-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <span className="fw-bold">{combinedOrders.length} Đơn hàng</span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
            Sắp xếp theo gợi ý
          </button>
          <button className="btn btn-sm btn-outline-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white mx-3 mb-3">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {/* checkbox + expand icon */}
              <th style={{ width: "40px" }}></th>
              <th>Mã đơn / Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Vận chuyển</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {combinedOrders
              .filter((order) => order.id !== undefined)
              .map((order: any) => {
                const hasItems = (order.orders_items?.length ?? 0) > 0;
                const orderKey = `${order.id}-${order._source}`;
                const isExpanded = expandedOrderIds.has(orderKey);
                const buyerName =
                  order.buyer_name || order.recipient?.name || "Khach mua";
                const buyerAvatar =
                  order.buyer_avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    buyerName,
                  )}&background=0D8ABC&color=fff`;
                const orderCode =
                  order.order_code || order.order_number || "N/A";

                // Get address info from recipient if available
                const addressInfo = order.recipient
                  ? convertAddressToNames(
                      order.recipient.city,
                      order.recipient.district,
                      order.recipient.ward,
                      order.recipient.addressLine,
                    )
                  : null;

                // Hàng chính (parent)
                const renderMainRow = () => (
                  <tr key={orderKey} className={isExpanded ? "bg-light" : ""}>
                    <td>
                      <div className="d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                        />
                        {hasItems && (
                          <button
                            className="btn btn-sm btn-link p-0 text-muted"
                            onClick={() => toggleExpand(orderKey)}
                            style={{ lineHeight: 1 }}
                          >
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={buyerAvatar}
                              alt={buyerName}
                              width="32"
                              height="32"
                              className="rounded-circle border"
                              style={{ objectFit: "cover" }}
                            />
                            <div className="d-flex flex-column">
                              <strong className="mb-0">{buyerName}</strong>
                              <small className="text-muted">
                                Mã đơn hàng:{" "}
                                <span className="fw-semibold">{orderCode}</span>
                              </small>
                              {addressInfo && (
                                <small className="text-muted">
                                  Địa chỉ: {addressInfo.fullAddress}
                                </small>
                              )}
                              {order._source === "api" && (
                                <span className="badge bg-success ms-auto">
                                  API
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <small className="text-muted d-block">
                          {order.orders_items && order.orders_items.length > 0
                            ? order.orders_items[0]?.product_name
                            : "N/A"}
                        </small>
                        {order.orders_items &&
                          order.orders_items.length > 1 && (
                            <small className="text-muted d-block">
                              +{order.orders_items.length - 1} sản phẩm khác
                            </small>
                          )}
                      </div>
                    </td>

                    <td>
                      <div className="fw-bold">
                        đ{(order.total_price ?? 0).toLocaleString()}
                      </div>
                      <small className="text-muted d-block mt-1">
                        Thanh toán Khi Nhận Hàng
                      </small>
                    </td>
                    <td>
                      <div className="fw-medium text-dark">
                        {getStatusLabel(order.status)}
                      </div>
                      <small className="text-muted d-block mt-1">
                        {order.status_change_reason}
                      </small>
                    </td>
                    <td>
                      <div>
                        <small className="text-muted">
                          {order.tracking_number ? (
                            <>
                              <div>
                                <strong className="text-dark">
                                  {order.tracking_carrier || "LOG"}
                                </strong>
                              </div>
                              <div className="text-dark">
                                {order.tracking_number}
                              </div>
                            </>
                          ) : order.tracking_carrier ? (
                            <div className="text-dark">
                              <strong>{order.tracking_carrier}</strong>
                            </div>
                          ) : (
                            "Chưa có vận chuyển"
                          )}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <a
                          href={`/seller/orders/${order.shipmentId}`}
                          className="text-primary text-decoration-none small"
                        >
                          Xem chi tiết
                        </a>
                        {order._source === "api" &&
                          order.status === "pending_shipment" &&
                          !order.tracking_number && (
                            <>
                              <button
                                type="button"
                                className="btn btn-link p-0 text-primary text-decoration-none small text-start"
                                onClick={() => {
                                  openPendingShipmentModal(order);
                                }}
                              >
                                Chờ lấy hàng
                              </button>
                              <button
                                type="button"
                                className="btn btn-link p-0 text-warning text-decoration-none small text-start"
                                onClick={() => openAdjustmentModal(order)}
                              >
                                Thiếu hàng: chỉnh SL / bỏ item
                              </button>
                            </>
                          )}
                        <a
                          href="#"
                          className="text-primary text-decoration-none small"
                        >
                          In đơn hàng
                        </a>
                      </div>
                    </td>
                  </tr>
                );

                // Các hàng items (nếu có)
                const renderItemRows = () =>
                  isExpanded &&
                  order.orders_items?.map((item: any, index: number) => (
                    <tr
                      key={`${orderKey}-${item.id}`}
                      className="item-row bg-light-subtle"
                    >
                      {/* để trống cột checkbox + expand */}
                      <td></td>
                      <td>
                        <div className="d-flex align-items-start ps-5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="rounded me-3"
                              width="60"
                              height="60"
                              style={{ objectFit: "cover" }}
                            />
                          )}
                          <div>
                            <div className="fw-medium text-muted">
                              {item.product_name}
                            </div>
                            {item.variantName && (
                              <small className="text-muted">
                                Phiên bản: {item.variantName}
                              </small>
                            )}
                            <br />
                            <small className="text-muted">
                              Số lượng: <strong>{item.quantity}</strong>
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <small>
                            đơn giá: đ{item.price?.toLocaleString() ?? 0}
                          </small>
                          <strong className="text-dark">
                            Tổng: đ
                            {(
                              (item.price ?? 0) * (item.quantity ?? 1)
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </td>
                      {/* để trống các cột còn lại */}
                      <td colSpan={4}></td>
                    </tr>
                  ));

                return (
                  <React.Fragment key={orderKey}>
                    {renderMainRow()}
                    {renderItemRows()}
                  </React.Fragment>
                );
              })}
          </tbody>
          <tbody>
            {combinedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-5 text-center text-muted">
                  <p>Không có đơn hàng nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingShipmentOrder && (
        <ConfirmLogisticsModal
          data={pendingShipmentOrder}
          success={logisticsConfirmSuccess}
          onClose={closePendingShipmentModal}
          onConfirm={handleConfirmLogistics}
          isConfirming={isConfirmingLogistics}
        />
      )}
      {adjustmentShipmentOrder && (
        <OutOfStockAdjustmentModal
          data={adjustmentShipmentOrder}
          onClose={closeAdjustmentModal}
          onSubmitAdjustment={handleSubmitAdjustment}
          onCancelShipment={handleCancelShipmentByOos}
          isSubmitting={isSubmittingAdjustment}
        />
      )}
    </div>
  );
};

export default page;
