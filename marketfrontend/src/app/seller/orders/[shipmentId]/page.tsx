"use client";

import { useSellerAuth } from "@/context/SellerAuthContext";
import { API_URL } from "@/helper/api";
import { OrderShipments } from "@/types/data/OrderShipment";
import {
  IOrderItemInfo,
  IOrderShipment,
  IShipmentStatusLog,
} from "@/validators/orderShipment";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  CreditCard,
  Hash,
  History,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Tag,
  Truck,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Chờ xác nhận", cls: "bg-secondary text-white" },
    CONFIRMED: { label: "Chờ lấy hàng", cls: "bg-warning text-dark" },
    PICKED_UP: { label: "Đã giao cho ĐVVC", cls: "bg-warning text-dark" },
    IN_TRANSIT: { label: "Đang vận chuyển", cls: "bg-warning text-dark" },
    OUT_FOR_DELIVERY: { label: "Đang giao", cls: "bg-warning text-dark" },
    SHIPPING: { label: "Đang vận chuyển", cls: "bg-warning text-dark" },
    DELIVERING: { label: "Đang giao", cls: "bg-warning text-dark" },
    DELIVERED: { label: "Đã giao", cls: "bg-success text-white" },
    FAILED: { label: "Thất bại", cls: "bg-danger text-white" },
    RETURNED: { label: "Hoàn hàng", cls: "bg-secondary text-white" },
    CANCELED: { label: "Đã hủy", cls: "bg-danger text-white" },
  };
  const s = map[status?.toUpperCase()] ?? {
    label: status,
    cls: "bg-secondary text-white",
  };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

const getPaymentStatusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Chưa thanh toán", cls: "bg-warning text-dark" },
    UNPAID: { label: "Chưa thanh toán", cls: "bg-warning text-dark" },
    PAID: { label: "Đã thanh toán", cls: "bg-success text-white" },
    REFUNDED: { label: "Đã hoàn tiền", cls: "bg-secondary text-white" },
  };
  const s = map[status?.toUpperCase()] ?? {
    label: status,
    cls: "bg-secondary text-white",
  };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

type ILogisticsTrackingDetail = {
  id: number;
};

type ILogisticsTimelineItem = {
  id: number;
  status: string;
  description?: string | null;
  updatedBy?: string | null;
  updatedAt: string;
};

const normalizeShipment = (raw: any): IOrderShipment => {
  const order = raw?.order ?? {};
  const recipient = raw?.recipient ?? {};
  const items = Array.isArray(raw?.items) ? raw.items : [];

  return {
    shipmentId: Number(raw?.shipmentId ?? raw?.id ?? 0),
    orderId: Number(raw?.orderId ?? raw?.order_id ?? 0),
    shop_id: Number(raw?.shop_id ?? raw?.shopId ?? 0),
    shipping_fee: Number(raw?.shipping_fee ?? raw?.shippingFee ?? 0),
    total_amount: Number(raw?.total_amount ?? raw?.totalAmount ?? 0),
    carrier_name: String(raw?.carrier_name ?? raw?.carrierName ?? ""),
    tracking_number: raw?.tracking_number ?? raw?.trackingNumber ?? null,
    shipping_status: String(raw?.shipping_status ?? raw?.shippingStatus ?? ""),
    order: {
      orderNumber: String(order?.orderNumber ?? order?.order_number ?? ""),
      userId: Number(order?.userId ?? order?.user_id ?? 0),
      addressId: Number(order?.addressId ?? order?.address_id ?? 0),
      totalAmount: Number(order?.totalAmount ?? order?.total_amount ?? 0),
      shippingFee: Number(order?.shippingFee ?? order?.shipping_fee ?? 0),
      discountAmount: Number(
        order?.discountAmount ?? order?.discount_amount ?? 0,
      ),
      finalAmount: Number(order?.finalAmount ?? order?.final_amount ?? 0),
      paymentMethod: String(
        order?.paymentMethod ?? order?.payment_method ?? "-",
      ),
      paymentStatus: String(
        order?.paymentStatus ?? order?.payment_status ?? "PENDING",
      ),
      orderStatus: String(
        order?.orderStatus ?? order?.order_status ?? "PENDING",
      ),
    },
    recipient: {
      recipientName: String(
        recipient?.recipientName ?? recipient?.recipient_name ?? "-",
      ),
      recipientPhone: String(
        recipient?.recipientPhone ?? recipient?.recipient_phone ?? "-",
      ),
      addressLine: String(
        recipient?.addressLine ?? recipient?.address_line ?? "",
      ),
      ward: String(recipient?.ward ?? ""),
      district: String(recipient?.district ?? ""),
      city: String(recipient?.city ?? ""),
      postalCode: recipient?.postalCode ?? recipient?.postal_code ?? null,
    },
    items: items.map((item: any) => ({
      id: Number(item?.id ?? 0),
      productId: Number(item?.productId ?? item?.product_id ?? 0),
      variantId:
        item?.variantId === null || item?.variant_id === null
          ? null
          : Number(item?.variantId ?? item?.variant_id ?? 0),
      productName: String(item?.productName ?? item?.product_name ?? "-"),
      variantName: item?.variantName ?? item?.variant_name ?? null,
      image: item?.image ?? item?.image_url ?? null,
      quantity: Number(item?.quantity ?? 0),
      price: Number(item?.price ?? 0),
      totalPrice: Number(item?.totalPrice ?? item?.total_price ?? 0),
    })),
    statusHistory: Array.isArray(raw?.statusHistory)
      ? raw.statusHistory
      : undefined,
  };
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawShipmentId = Array.isArray(params?.shipmentId)
    ? params.shipmentId[0]
    : params?.shipmentId;
  const shipmentId = Number(rawShipmentId);
  const isValidShipmentId = Number.isFinite(shipmentId) && shipmentId > 0;
  const { shop } = useSellerAuth();

  OrderShipments.setup({ path: "/seller/order-shipment", baseUrl: API_URL });

  const queryOpts = OrderShipments.getById(shipmentId);
  const {
    data: fetchedShipment,
    isLoading,
    isError,
  } = useQuery<any>({
    ...queryOpts,
    enabled: !!queryOpts.enabled && isValidShipmentId,
  });

  const shipment = React.useMemo(
    () => (fetchedShipment ? normalizeShipment(fetchedShipment) : undefined),
    [fetchedShipment],
  );

  const { data: timelineHistory = [] } = useQuery<IShipmentStatusLog[]>({
    queryKey: ["SHIPMENT_TIMELINE_QUERY", shipment?.tracking_number],
    enabled: !!shipment?.tracking_number,
    queryFn: async () => {
      const trackingCode = shipment?.tracking_number;
      if (!trackingCode) return [];

      const trackingRes =
        await OrderShipments.api.get<ILogisticsTrackingDetail>({
          url: `/api/logistics/shipments/tracking/${encodeURIComponent(trackingCode)}`,
        });
      const logisticsShipmentId = trackingRes?.data?.id;
      if (!logisticsShipmentId) return [];

      const timelineRes = await OrderShipments.api.get<
        ILogisticsTimelineItem[]
      >({
        url: `/api/logistics/shipments/${logisticsShipmentId}/timeline`,
      });

      return (timelineRes?.data ?? []).map((item: ILogisticsTimelineItem) => ({
        id: Number(item.id),
        status: String(item.status ?? ""),
        note: item.description ?? null,
        changedAt: item.updatedAt,
        changedBy: item.updatedBy ?? null,
      }));
    },
  });

  const statusHistory = React.useMemo(() => {
    const baseHistory =
      timelineHistory.length > 0
        ? timelineHistory
        : (shipment?.statusHistory ?? []);

    const pendingFromApi = baseHistory.find(
      (log) => String(log.status).toUpperCase() === "PENDING",
    );

    const defaultPending: IShipmentStatusLog = pendingFromApi
      ? {
          ...pendingFromApi,
          note: pendingFromApi.note || "Chờ xác nhận từ shop",
        }
      : {
          id: 0,
          status: "PENDING",
          note: "Chờ xác nhận từ shop",
          changedAt: baseHistory[0]?.changedAt || new Date().toISOString(),
          changedBy: null,
        };

    if (baseHistory.length === 0) {
      return [defaultPending];
    }

    if (String(baseHistory[0]?.status).toUpperCase() === "PENDING") {
      return [
        {
          ...baseHistory[0],
          note: baseHistory[0].note || "Chờ xác nhận từ shop",
        },
        ...baseHistory.slice(1),
      ];
    }

    return [
      defaultPending,
      ...baseHistory.filter((log) => log.id !== pendingFromApi?.id),
    ];
  }, [timelineHistory, shipment?.statusHistory]);

  // Guard: seller can only view their own shipments
  React.useEffect(() => {
    if (shipment && shop && shipment.shop_id !== shop.id) {
      router.replace("/seller/orders");
    }
  }, [shipment, shop, router]);

  if (!isValidShipmentId) {
    return (
      <div className="alert alert-danger m-4">Shipment ID không hợp lệ.</div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="alert alert-danger m-4">
        Không tìm thấy thông tin đơn vận chuyển.
      </div>
    );
  }

  if (!shipment) return null;

  const {
    shipmentId: id,
    orderId,
    carrier_name,
    tracking_number,
    shipping_status,
    shipping_fee,
    total_amount,
    order,
    recipient,
    items,
  } = shipment;

  return (
    <div className="flex-grow-1 overflow-auto">
      {/* ── breadcrumb header ── */}
      <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft size={15} />
            Quay lại
          </button>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/seller/orders" className="text-decoration-none">
                  Đơn hàng
                </a>
              </li>
              <li className="breadcrumb-item active">
                Chi tiết vận chuyển #{id}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="p-4 d-flex flex-column gap-4">
        {/* ── row 1: shipment info + order info ── */}
        <div className="row g-4">
          {/* Shipment card */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header fw-bold d-flex align-items-center gap-2">
                <Truck size={16} className="text-danger" />
                Thông tin vận chuyển
              </div>
              <div className="card-body">
                <table className="table table-borderless mb-0 small">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: "45%" }}>
                        <span className="d-flex align-items-center gap-1">
                          <Hash size={13} />
                          Mã shipment
                        </span>
                      </td>
                      <td className="fw-semibold">#{id}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <ShoppingBag size={13} />
                          Thuộc đơn hàng
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold">
                          {order.orderNumber || `#${orderId}`}
                        </span>
                        <span className="text-muted ms-1">(#{orderId})</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <Truck size={13} />
                          Đơn vị vận chuyển
                        </span>
                      </td>
                      <td>{carrier_name || "-"}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <Tag size={13} />
                          Mã tracking
                        </span>
                      </td>
                      <td>
                        {tracking_number ? (
                          <span className="font-monospace">
                            {tracking_number}
                          </span>
                        ) : (
                          <span className="text-secondary fst-italic">
                            Chưa có
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <CheckCircle2 size={13} />
                          Trạng thái
                        </span>
                      </td>
                      <td>{getStatusBadge(shipping_status)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order summary card */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header fw-bold d-flex align-items-center gap-2">
                <ShoppingBag size={16} className="text-muted" />
                Thông tin đơn hàng
              </div>
              <div className="card-body">
                <table className="table table-borderless mb-0 small">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: "45%" }}>
                        <span className="d-flex align-items-center gap-1">
                          <CheckCircle2 size={13} />
                          Trạng thái đơn
                        </span>
                      </td>
                      <td>{getStatusBadge(order.orderStatus)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <CreditCard size={13} />
                          Thanh toán
                        </span>
                      </td>
                      <td>
                        {getPaymentStatusBadge(order.paymentStatus)}
                        <span className="ms-2 text-muted">
                          ({order.paymentMethod})
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <Box size={13} />
                          Tiền hàng
                        </span>
                      </td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <Truck size={13} />
                          Phí vận chuyển
                        </span>
                      </td>
                      <td>{formatCurrency(order.shippingFee)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <Tag size={13} />
                          Giảm giá
                        </span>
                      </td>
                      <td className="text-success">
                        -{formatCurrency(order.discountAmount)}
                      </td>
                    </tr>
                    <tr className="border-top">
                      <td className="text-muted fw-semibold">
                        <span className="d-flex align-items-center gap-1">
                          <CircleDollarSign size={13} />
                          Tổng thanh toán
                        </span>
                      </td>
                      <td className="fw-bold text-danger fs-6">
                        {formatCurrency(order.finalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── status history timeline ── */}
        <div className="card shadow-sm">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center">
            <span className="d-flex align-items-center gap-2">
              <History size={16} className="text-danger" />
              Lịch sử trạng thái vận chuyển
            </span>
            <span className="text-muted fw-normal small d-flex align-items-center gap-1">
              <Clock size={13} />
              {statusHistory.length} cập nhật
            </span>
          </div>
          <div className="card-body py-3 px-4">
            {statusHistory.length === 0 ? (
              <p className="text-muted small fst-italic text-center mb-0 py-2">
                Chưa có lịch sử trạng thái.
              </p>
            ) : (
              statusHistory.map(
                (
                  log: IShipmentStatusLog,
                  idx: number,
                  arr: IShipmentStatusLog[],
                ) => {
                  const isLatest = idx === arr.length - 1;
                  return (
                    <div key={log.id} className="d-flex gap-3">
                      {/* connector column */}
                      <div
                        className="d-flex flex-column align-items-center flex-shrink-0"
                        style={{ width: 28 }}
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                            isLatest
                              ? "bg-danger text-white"
                              : "bg-white border text-muted"
                          }`}
                          style={{ width: 28, height: 28 }}
                        >
                          {isLatest ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <span style={{ fontSize: 12 }}>{idx + 1}</span>
                          )}
                        </div>
                        {!isLatest && (
                          <div
                            style={{
                              width: 2,
                              flexGrow: 1,
                              background: "#dee2e6",
                              minHeight: 20,
                              margin: "3px 0",
                            }}
                          />
                        )}
                      </div>
                      {/* log content */}
                      <div className="pb-3" style={{ flex: 1, minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          {getStatusBadge(log.status)}
                          <small className="text-muted">
                            {formatDateTime(log.changedAt)}
                          </small>
                          {log.changedBy && (
                            <small
                              className="text-secondary border rounded px-1"
                              style={{ fontSize: 11 }}
                            >
                              {log.changedBy}
                            </small>
                          )}
                        </div>
                        {log.note && (
                          <div className="text-muted small">{log.note}</div>
                        )}
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </div>

        {/* ── row 2: recipient ── */}
        <div className="card shadow-sm">
          <div className="card-header fw-bold d-flex align-items-center gap-2">
            <User size={16} className="text-muted" />
            Thông tin người nhận
          </div>
          <div className="card-body">
            <div className="row g-3 small">
              <div className="col-sm-4">
                <span className="text-muted d-block d-flex align-items-center gap-1">
                  <User size={13} />
                  Tên người nhận
                </span>
                <span className="fw-semibold">
                  {recipient.recipientName || "-"}
                </span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted d-block d-flex align-items-center gap-1">
                  <Phone size={13} />
                  Số điện thoại
                </span>
                <span>{recipient.recipientPhone || "-"}</span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted d-block d-flex align-items-center gap-1">
                  <MapPin size={13} />
                  Địa chỉ
                </span>
                <span>
                  {[
                    recipient.addressLine,
                    recipient.ward,
                    recipient.district,
                    recipient.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── row 3: items ── */}
        <div className="card shadow-sm">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center">
            <span className="d-flex align-items-center gap-2">
              <Package size={16} className="text-danger" />
              Sản phẩm trong shipment
            </span>
            <span className="text-muted fw-normal small d-flex align-items-center gap-1">
              <Box size={13} />
              {items.length} sản phẩm
            </span>
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-center">Số lượng</th>
                  <th className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: IOrderItemInfo, idx: number) => (
                  <tr key={item.id}>
                    <td className="text-muted small align-middle">{idx + 1}</td>
                    <td className="align-middle">
                      <div className="fw-semibold">{item.productName}</div>
                      {item.variantName && (
                        <div className="text-muted small">
                          Phân loại: {item.variantName}
                        </div>
                      )}
                    </td>
                    <td className="text-end align-middle">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="text-center align-middle">
                      {item.quantity}
                    </td>
                    <td className="text-end align-middle fw-semibold">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── summary footer ── */}
          <div className="card-footer bg-white">
            <div className="d-flex flex-column align-items-end gap-1 small">
              <div
                className="d-flex justify-content-between"
                style={{ minWidth: 260 }}
              >
                <span className="text-muted d-flex align-items-center gap-1">
                  <Box size={13} />
                  Tổng tiền hàng
                </span>
                <span>{formatCurrency(total_amount)}</span>
              </div>
              <div
                className="d-flex justify-content-between"
                style={{ minWidth: 260 }}
              >
                <span className="text-muted d-flex align-items-center gap-1">
                  <Truck size={13} />
                  Phí vận chuyển (shipment)
                </span>
                <span>{formatCurrency(shipping_fee)}</span>
              </div>
              <div
                className="d-flex justify-content-between fw-bold fs-6 pt-1 border-top"
                style={{ minWidth: 260 }}
              >
                <span className="d-flex align-items-center gap-1">
                  <CircleDollarSign size={14} />
                  Tổng shipment
                </span>
                <span className="text-danger">
                  {formatCurrency(total_amount + shipping_fee)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
