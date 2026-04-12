"use client";

import { useSellerAuth } from "@/context/SellerAuthContext";
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

// ─── mock data (DEV_USE_MOCK = false để dùng API thật) ────────────────────────
const DEV_USE_MOCK = true;

const MOCK_SHIPMENT: IOrderShipment = {
  shipmentId: 1001,
  orderId: 5023,
  shopId: 2,
  shippingFee: 35_000,
  totalAmount: 1_250_000,
  carrierName: "Giao Hàng Nhanh (GHN)",
  trackingNumber: "SGHN1234567890VN",
  shippingStatus: "DELIVERING",
  order: {
    orderNumber: "ORD-20260412-5023",
    userId: 77,
    addressId: 33,
    totalAmount: 1_250_000,
    shippingFee: 35_000,
    discountAmount: 50_000,
    finalAmount: 1_235_000,
    paymentMethod: "COD",
    paymentStatus: "UNPAID",
    orderStatus: "SHIPPING",
  },
  recipient: {
    recipientName: "Nguyễn Văn Thoại",
    recipientPhone: "0901 234 567",
    addressLine: "123 Đường Lê Lợi",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    postalCode: "70000",
  },
  items: [
    {
      id: 1,
      productId: 201,
      variantId: 501,
      productName: "Áo thun nam basic",
      variantName: "Trắng / XL",
      image: null,
      quantity: 2,
      price: 250_000,
      totalPrice: 500_000,
    },
    {
      id: 2,
      productId: 202,
      variantId: null,
      productName: "Quần jeans slim fit",
      variantName: null,
      image: null,
      quantity: 1,
      price: 450_000,
      totalPrice: 450_000,
    },
    {
      id: 3,
      productId: 203,
      variantId: 502,
      productName: "Giày thể thao nam Air Max",
      variantName: "Đen / 42",
      image: null,
      quantity: 1,
      price: 300_000,
      totalPrice: 300_000,
    },
  ],
  statusHistory: [
    {
      id: 1,
      status: "PENDING",
      note: "Đơn hàng được tạo, chờ người bán xác nhận",
      changedAt: "2026-04-10T08:12:00",
      changedBy: "SYSTEM",
    },
    {
      id: 2,
      status: "CONFIRMED",
      note: "Người bán đã xác nhận và chuẩn bị đóng gói",
      changedAt: "2026-04-10T10:45:00",
      changedBy: "SELLER",
    },
    {
      id: 3,
      status: "PICKED_UP",
      note: "GHN đã lấy hàng thành công tại kho người bán",
      changedAt: "2026-04-11T09:20:00",
      changedBy: "GHN",
    },
    {
      id: 4,
      status: "DELIVERING",
      note: "Đang trên đường giao đến địa chỉ người nhận",
      changedAt: "2026-04-12T07:55:00",
      changedBy: "GHN",
    },
  ],
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = Number(params?.shipmentId);
  const { shop } = useSellerAuth();

  const queryOpts = OrderShipments.getById(shipmentId);
  const {
    data: fetchedShipment,
    isLoading,
    isError,
  } = useQuery<IOrderShipment>({
    ...queryOpts,
    enabled: !DEV_USE_MOCK && !!shipmentId,
  });
  const shipment = DEV_USE_MOCK ? MOCK_SHIPMENT : fetchedShipment;

  // Guard: seller can only view their own shipments
  React.useEffect(() => {
    if (shipment && shop && shipment.shopId !== shop.id) {
      router.replace("/seller/orders");
    }
  }, [shipment, shop, router]);

  if (isLoading && !DEV_USE_MOCK) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  if (!DEV_USE_MOCK && (isError || !shipment)) {
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
    carrierName,
    trackingNumber,
    shippingStatus,
    shippingFee,
    totalAmount,
    order,
    recipient,
    items,
    statusHistory,
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
                        <span className="fw-semibold">{order.orderNumber}</span>
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
                      <td>{carrierName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <Tag size={13} />
                          Mã tracking
                        </span>
                      </td>
                      <td>
                        {trackingNumber ? (
                          <span className="font-monospace">
                            {trackingNumber}
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
                      <td>{getStatusBadge(shippingStatus)}</td>
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
              {(statusHistory ?? []).length} cập nhật
            </span>
          </div>
          <div className="card-body py-3 px-4">
            {(statusHistory ?? []).length === 0 ? (
              <p className="text-muted small fst-italic text-center mb-0 py-2">
                Chưa có lịch sử trạng thái.
              </p>
            ) : (
              (statusHistory ?? []).map(
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
                <span className="fw-semibold">{recipient.recipientName}</span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted d-block d-flex align-items-center gap-1">
                  <Phone size={13} />
                  Số điện thoại
                </span>
                <span>{recipient.recipientPhone}</span>
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
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div
                className="d-flex justify-content-between"
                style={{ minWidth: 260 }}
              >
                <span className="text-muted d-flex align-items-center gap-1">
                  <Truck size={13} />
                  Phí vận chuyển (shipment)
                </span>
                <span>{formatCurrency(shippingFee)}</span>
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
                  {formatCurrency(totalAmount + shippingFee)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
