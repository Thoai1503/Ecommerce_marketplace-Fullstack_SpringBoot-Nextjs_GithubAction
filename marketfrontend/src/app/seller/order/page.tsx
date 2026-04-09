"use client";
import { useSellerAuth } from "@/context/SellerAuthContext";
import { useOrderPage } from "@/feature/admin/hooks/useOrderPage";
import { OrderShipments } from "@/types/data/OrderShipment";
import { IOrder } from "@/validators/order";
import { IOrderShipment } from "@/validators/orderShipment";
import { convertAddressToNames } from "@/services/addressService";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState, useMemo } from "react";

type PendingShipmentOrder = {
  shipmentId: number;
  orderId: number;
  buyerName: string;
  recipient: any;
  items: any[];
};

const mapShippingStatusToUiStatus = (shippingStatus?: string) => {
  switch ((shippingStatus || "").toUpperCase()) {
    case "PENDING":
      return "pending_shipment";
    case "CONFIRMED":
      return "confirmed";
    case "SHIPPED":
      return "shipped";
    case "IN_TRANSIT":
      return "in_transit";
    case "DELIVERED":
      return "delivered";
    case "CANCELED":
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending_shipment";
  }
};

const page = () => {
  const { shop: shopData } = useSellerAuth();
  console.log("Shop Data in Order Page:", JSON.stringify(shopData, null, 2));
  OrderShipments.setup({ path: "/seller/order-shipment" });
  const { data: orderShipments, refetch: refetchOrderShipments } = useQuery<
    IOrderShipment[]
  >(OrderShipments.getByShopId(shopData?.id || 0));

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
        total_price: shipment.order?.finalAmount,
        status: mapShippingStatusToUiStatus(shipment.shippingStatus),
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

    return [...apiOrders, ...mockOrders_];
  }, [orderShipments, mockOrders]);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingShipmentOrder, setPendingShipmentOrder] =
    useState<PendingShipmentOrder | null>(null);
  const [isConfirmingLogistics, setIsConfirmingLogistics] = useState(false);

  const openPendingShipmentModal = (order: any) => {
    setPendingShipmentOrder({
      shipmentId: Number(order.shipmentId),
      orderId: Number(order.id),
      buyerName: order.buyer_name || order.recipient?.name || "Khach mua",
      recipient: order.recipient,
      items: order.orders_items || [],
    });
  };

  const closePendingShipmentModal = () => {
    if (!isConfirmingLogistics) {
      setPendingShipmentOrder(null);
    }
  };

  const handleConfirmLogistics = async () => {
    if (!pendingShipmentOrder) return;
    try {
      setIsConfirmingLogistics(true);
      await OrderShipments.confirmPackaged(pendingShipmentOrder.shipmentId);
      await refetchOrderShipments();
      setPendingShipmentOrder(null);
      alert("Logistics da xac nhan dong goi. Tracking code da duoc cap nhat.");
    } catch (error) {
      console.error("Confirm logistics failed", error);
      alert("Khong the xac nhan logistics. Vui long thu lai.");
    } finally {
      setIsConfirmingLogistics(false);
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
              onClick={() => setActiveTab("all")}
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
              onClick={() => setActiveTab("waiting-for-payment")}
            >
              Chờ thanh toán{" "}
              <span className="badge bg-danger rounded-circle ms-1">0</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "waiting-for-shipping"
                  ? "active border-danger text-danger"
                  : "text-dark"
              } border-0 border-bottom-3`}
              onClick={() => setActiveTab("waiting-for-shipping")}
            >
              Chờ gửi hàng{" "}
              <span className="badge bg-danger rounded-circle ms-1">0</span>
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
              <th style={{ width: "40px" }}></th> {/* checkbox + expand icon */}
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
                        {order.status === "pending_shipment" && "Chờ xác nhận"}
                        {order.status === "confirmed" && "Đã xác nhận"}
                        {order.status === "shipped" && "Đã gửi"}
                        {order.status === "in_transit" && "Đang vận chuyển"}
                        {order.status === "delivered" && "Đã giao"}
                        {order.status === "pending_payment" && "Chờ thanh toán"}
                        {order.status === "cancelled" && "Đã hủy"}
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
                          href={`/seller/order/${order.id}`}
                          className="text-primary text-decoration-none small"
                        >
                          Xem chi tiết
                        </a>
                        {order._source === "api" &&
                          order.status === "pending_shipment" &&
                          !order.tracking_number && (
                            <button
                              type="button"
                              className="btn btn-link p-0 text-primary text-decoration-none small text-start"
                              onClick={() => {
                                alert(
                                  "Chờ lấy hàng " +
                                    order.id +
                                    " - " +
                                    order.shipmentId,
                                );
                                openPendingShipmentModal(order);
                              }}
                            >
                              Chờ lấy hàng
                            </button>
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
                      <td></td> {/* để trống cột checkbox + expand */}
                      <td>
                        <div className="d-flex align-items-start ps-5">
                          {item.image_url && (
                            <img
                              src={item.image_url}
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
                            {item.variant_name && (
                              <small className="text-muted">
                                Phiên bản: {item.variant_name}
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
                      <td colSpan={4}></td> {/* để trống các cột còn lại */}
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
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
          onClick={closePendingShipmentModal}
        >
          <div
            className="bg-white rounded-3 shadow p-4"
            style={{ width: "680px", maxWidth: "95vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="mb-3">Xác nhận đóng gói và gửi logistics</h5>
            <p className="text-muted mb-2">
              Đơn hàng: <strong>#{pendingShipmentOrder.orderId}</strong>
            </p>
            <p className="text-muted mb-2">
              Người mua: <strong>{pendingShipmentOrder.buyerName}</strong>
            </p>
            <p className="text-muted mb-3">
              Người nhận:{" "}
              <strong>
                {pendingShipmentOrder.recipient?.recipientName || "N/A"}
              </strong>{" "}
              - {pendingShipmentOrder.recipient?.recipientPhone || "N/A"}
            </p>
            <div
              className="border rounded p-3 mb-3"
              style={{ maxHeight: "220px", overflowY: "auto" }}
            >
              {pendingShipmentOrder.items.length === 0 && (
                <small className="text-muted">
                  Không có thông tin sản phẩm.
                </small>
              )}
              {pendingShipmentOrder.items.map((item, idx) => (
                <div
                  key={`${item.id ?? idx}-${idx}`}
                  className="d-flex justify-content-between align-items-center py-1 border-bottom"
                >
                  <span>{item.product_name || "Sản phẩm"}</span>
                  <span>x{item.quantity ?? 1}</span>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closePendingShipmentModal}
                disabled={isConfirmingLogistics}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmLogistics}
                disabled={isConfirmingLogistics}
              >
                {isConfirmingLogistics
                  ? "Đang xác nhận..."
                  : "Xác nhận logistics"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
