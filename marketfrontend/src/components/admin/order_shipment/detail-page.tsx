"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Hash,
  MapPin,
  MessageSquareText,
  Package,
  PackageCheck,
  Phone,
  ReceiptText,
  RotateCcw,
  Store,
  Truck,
  User,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ErrorState from "@/components/ui/ErrorState";
import { OrderTableSkeleton } from "@/components/ui/Skeleton";
import { OrderShipments } from "@/types/data/OrderShipment";
import { API_URL } from "@/helper/api";
import {
  getReturnRequestById,
  ReturnRequestAdmin,
} from "@/service/returnRequests";
import {
  IOrderItemInfo,
  IOrderShipment,
  IShipmentStatusLog,
} from "@/validators/orderShipment";

type IOrderShipmentDetail = IOrderShipment & {
  shopName?: string;
  shop_name?: string;
  lastReturnRequestId?: number | null;
  last_return_request_id?: number | null;
};

const formatMoney = (value?: number | null) =>
  Number(value || 0).toLocaleString("vi-VN");

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

const normalizeShipment = (raw: any): IOrderShipmentDetail => {
  const order = raw?.order ?? {};
  const recipient = raw?.recipient ?? {};
  const items = Array.isArray(raw?.items) ? raw.items : [];

  return {
    shipmentId: Number(raw?.shipmentId ?? raw?.id ?? 0),
    orderId: Number(raw?.orderId ?? raw?.order_id ?? 0),
    shop_id: Number(raw?.shop_id ?? raw?.shopId ?? 0),
    shopId: Number(raw?.shopId ?? raw?.shop_id ?? 0),
    shopName: String(raw?.shopName ?? raw?.shop_name ?? ""),
    shop_name: String(raw?.shop_name ?? raw?.shopName ?? ""),
    shipping_fee: Number(raw?.shipping_fee ?? raw?.shippingFee ?? 0),
    shippingFee: Number(raw?.shippingFee ?? raw?.shipping_fee ?? 0),
    subtotal: Number(raw?.subtotal ?? 0),
    total_amount: Number(raw?.total_amount ?? raw?.totalAmount ?? 0),
    totalAmount: Number(raw?.totalAmount ?? raw?.total_amount ?? 0),
    totalAfterVoucher: Number(
      raw?.totalAfterVoucher ??
        raw?.total_after_voucher ??
        raw?.totalAfterDiscount ??
        raw?.total_after_discount ??
        0,
    ),
    total_after_voucher: Number(
      raw?.total_after_voucher ?? raw?.totalAfterVoucher ?? 0,
    ),
    total_after_discount: Number(
      raw?.total_after_discount ?? raw?.totalAfterDiscount ?? 0,
    ),
    carrier_name: String(raw?.carrier_name ?? raw?.carrierName ?? ""),
    carrierName: String(raw?.carrierName ?? raw?.carrier_name ?? ""),
    tracking_number: raw?.tracking_number ?? raw?.trackingNumber ?? null,
    trackingNumber: raw?.trackingNumber ?? raw?.tracking_number ?? null,
    shipping_status: String(raw?.shipping_status ?? raw?.shippingStatus ?? ""),
    shippingStatus: String(raw?.shippingStatus ?? raw?.shipping_status ?? ""),
    lastReturnRequestId:
      raw?.lastReturnRequestId == null
        ? (raw?.last_return_request_id ?? null)
        : Number(raw?.lastReturnRequestId),
    last_return_request_id:
      raw?.last_return_request_id == null
        ? (raw?.lastReturnRequestId ?? null)
        : Number(raw?.last_return_request_id),
    order: {
      orderNumber: String(order?.orderNumber ?? order?.order_number ?? ""),
      userId: Number(order?.userId ?? order?.user_id ?? 0),
      addressId: Number(order?.addressId ?? order?.address_id ?? 0),
      totalAmount: Number(order?.totalAmount ?? order?.total_amount ?? 0),
      shippingFee: Number(order?.shippingFee ?? order?.shipping_fee ?? 0),
      discountAmount: Number(
        order?.discountAmount ?? order?.discount_amount ?? 0,
      ),
      totalAfterDiscount: Number(
        order?.totalAfterDiscount ?? order?.total_after_discount ?? 0,
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
      shopVoucherDiscountAmount: Number(
        item?.shopVoucherDiscountAmount ??
          item?.shop_voucher_discount_amount ??
          0,
      ),
      platformVoucherDiscountAmount: Number(
        item?.platformVoucherDiscountAmount ??
          item?.platform_voucher_discount_amount ??
          0,
      ),
      totalVoucherDiscountAmount: Number(
        item?.totalVoucherDiscountAmount ??
          item?.total_voucher_discount_amount ??
          0,
      ),
      totalAfterShopVoucher: Number(
        item?.totalAfterShopVoucher ?? item?.total_after_shop_voucher ?? 0,
      ),
      totalAfterAllVouchers: Number(
        item?.totalAfterAllVouchers ?? item?.total_after_all_vouchers ?? 0,
      ),
      platformCommissionRate: Number(
        item?.platformCommissionRate ?? item?.platform_commission_rate ?? 0,
      ),
      platformCommissionAmount: Number(
        item?.platformCommissionAmount ?? item?.platform_commission_amount ?? 0,
      ),
      sellerReceivableAmount: Number(
        item?.sellerReceivableAmount ?? item?.seller_receivable_amount ?? 0,
      ),
    })),
    statusHistory: Array.isArray(raw?.statusHistory)
      ? raw.statusHistory
      : Array.isArray(raw?.status_history)
        ? raw.status_history
        : undefined,
  };
};

const statusUiMap: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PICKED_UP: "bg-cyan-50 text-cyan-700",
  IN_TRANSIT: "bg-indigo-50 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-teal-50 text-teal-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELED: "bg-red-50 text-red-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const renderStatusChip = (status?: string | null) => {
  const normalized = (status || "").toUpperCase();
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${statusUiMap[normalized] || "bg-slate-100 text-slate-600"}`}
    >
      {normalized || "UNKNOWN"}
    </span>
  );
};

export default function AdminOrderShipmentDetailPage() {
  const router = useRouter();
  const params = useParams();

  const rawShipmentId = Array.isArray(params?.shipmentId)
    ? params.shipmentId[0]
    : params?.shipmentId;
  const shipmentId = Number(rawShipmentId);
  const isValidShipmentId = Number.isFinite(shipmentId) && shipmentId > 0;

  OrderShipments.setup({ path: "/admin/order-shipment", baseUrl: API_URL });

  const queryOpts = OrderShipments.getById(shipmentId);
  const {
    data: fetchedShipment,
    isLoading,
    isError,
    refetch,
  } = useQuery<any>({
    ...queryOpts,
    enabled: !!queryOpts.enabled && isValidShipmentId,
  });

  const shipment = React.useMemo(
    () => (fetchedShipment ? normalizeShipment(fetchedShipment) : undefined),
    [fetchedShipment],
  );

  const lastReturnRequestId =
    shipment?.lastReturnRequestId ?? shipment?.last_return_request_id ?? null;

  const {
    data: returnRequest,
    isLoading: isReturnRequestLoading,
    isError: isReturnRequestError,
  } = useQuery<ReturnRequestAdmin>({
    queryKey: ["ADMIN_RETURN_REQUEST_BY_ID", lastReturnRequestId],
    enabled: !!lastReturnRequestId,
    queryFn: () => getReturnRequestById(Number(lastReturnRequestId)),
  });

  const displayStatus = shipment?.shippingStatus ?? shipment?.shipping_status;
  const displayTotal =
    shipment?.totalAfterVoucher ??
    shipment?.total_after_voucher ??
    shipment?.total_after_discount ??
    shipment?.totalAmount ??
    shipment?.total_amount ??
    shipment?.order?.finalAmount ??
    0;

  if (!isValidShipmentId) {
    return (
      <div className="p-8">
        <ErrorState
          type="error"
          title="Shipment ID khong hop le"
          actionLabel="Quay lai danh sach"
          onAction={() => router.push("/admin/order-shipment")}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <OrderTableSkeleton />
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="p-8">
        <ErrorState
          type="error"
          title="Khong tim thay shipment"
          actionLabel="Thu lai"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: "Admin", path: "/admin" },
            { label: "Order Shipment", path: "/admin/order-shipment" },
            { label: `Chi tiet #${shipment.shipmentId}` },
          ]}
        />
        <button
          onClick={() => router.push("/admin/order-shipment")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Quay lai
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">
            Thong tin shipment
          </p>
          <div className="text-sm text-slate-600 space-y-2">
            <p className="flex items-center gap-2">
              <Package size={15} /> Shipment:{" "}
              <span className="font-semibold text-slate-800">
                #{shipment.shipmentId}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Truck size={15} /> Carrier:{" "}
              <span className="font-semibold text-slate-800">
                {shipment.carrierName || shipment.carrier_name || "-"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <BadgeDollarSign size={15} /> Tracking:{" "}
              <span className="font-semibold text-slate-800">
                {shipment.trackingNumber || shipment.tracking_number || "-"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Store size={15} /> Shop:{" "}
              <span className="font-semibold text-slate-800">
                {shipment.shopName ||
                  shipment.shop_name ||
                  (shipment.shopId || shipment.shop_id
                    ? `#${shipment.shopId || shipment.shop_id}`
                    : "-")}
              </span>
            </p>
            <div className="pt-1">{renderStatusChip(displayStatus)}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">
            Thong tin don hang
          </p>
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              Order ID:{" "}
              <span className="font-semibold text-slate-800">
                #{shipment.orderId}
              </span>
            </p>
            <p>
              Order Number:{" "}
              <span className="font-semibold text-slate-800">
                {shipment.order?.orderNumber || "-"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <CreditCard size={15} /> Payment Method:{" "}
              <span className="font-semibold text-slate-800">
                {shipment.order?.paymentMethod || "-"}
              </span>
            </p>
            <p>
              Payment Status: {renderStatusChip(shipment.order?.paymentStatus)}
            </p>
            <p>Order Status: {renderStatusChip(shipment.order?.orderStatus)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">Tong thanh toan</p>
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              Subtotal:{" "}
              <span className="font-semibold text-slate-800">
                {formatMoney(shipment.subtotal)} đ
              </span>
            </p>
            <p>
              Shipping Fee:{" "}
              <span className="font-semibold text-slate-800">
                {formatMoney(shipment.shippingFee ?? shipment.shipping_fee)} đ
              </span>
            </p>
            <p>
              Order Discount:{" "}
              <span className="font-semibold text-red-600">
                - {formatMoney(shipment.order?.discountAmount)} đ
              </span>
            </p>
            <p className="pt-1 text-base">
              Total:{" "}
              <span className="font-black text-emerald-700">
                {formatMoney(displayTotal)} đ
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <p className="text-sm font-black text-slate-700">
          Thong tin nguoi nhan
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <User size={15} /> {shipment.recipient?.recipientName || "-"}
          </p>
          <p className="flex items-center gap-2">
            <Phone size={15} /> {shipment.recipient?.recipientPhone || "-"}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={15} />{" "}
            {[
              shipment.recipient?.addressLine,
              shipment.recipient?.ward,
              shipment.recipient?.district,
              shipment.recipient?.city,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </p>
        </div>
      </div>

      {lastReturnRequestId ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-700 flex items-center gap-2">
              <RotateCcw size={16} className="text-orange-600" />
              Yêu cầu trả hàng & hoàn tiền
            </p>
            <span className="text-xs text-slate-500 inline-flex items-center gap-1">
              <Hash size={12} />
              ID: #{lastReturnRequestId}
            </span>
          </div>

          {isReturnRequestLoading ? (
            <p className="text-sm text-slate-500">Dang tai return request...</p>
          ) : isReturnRequestError ? (
            <p className="text-sm text-red-600">
              Khong tai duoc thong tin return request.
            </p>
          ) : !returnRequest ? (
            <p className="text-sm text-slate-500">
              Khong tim thay return request.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <BadgeDollarSign size={12} />
                  Status
                </p>
                <div className="mt-1">
                  {renderStatusChip(returnRequest.status)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <ReceiptText size={12} />
                  Requested Amount
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {formatMoney(returnRequest.requestedAmount)} đ
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <BadgeDollarSign size={12} />
                  Refunded Amount
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {formatMoney(returnRequest.refundedAmount)} đ
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <CalendarClock size={12} />
                  Created At
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {formatDateTime(returnRequest.createdAt)}
                </p>
              </div>

              <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <MessageSquareText size={12} />
                  Reason
                </p>
                <p className="mt-1 text-slate-700">
                  {returnRequest.reason || "-"}
                </p>
              </div>
              <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <PackageCheck size={12} />
                  Items
                </p>
                <p className="mt-1 text-slate-700">
                  {Array.isArray(returnRequest.items)
                    ? `${returnRequest.items.length} item(s)`
                    : "0 item(s)"}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-black text-slate-700">
            Danh sach san pham
          </p>
          <p className="text-xs text-slate-500">
            {shipment.items.length} items
          </p>
        </div>

        {shipment.items.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            Khong co item trong shipment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wide">
                  <th className="text-left px-4 py-3 font-bold">Product</th>
                  <th className="text-right px-4 py-3 font-bold">Unit</th>
                  <th className="text-center px-4 py-3 font-bold">Qty</th>
                  <th className="text-right px-4 py-3 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {shipment.items.map((item: IOrderItemInfo) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Variant: {item.variantName || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.price)} đ
                    </td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">
                      {formatMoney(item.totalPrice)} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-black text-slate-700">
            Lich su trang thai
          </p>
        </div>
        <div className="p-4 space-y-3">
          {(shipment.statusHistory || []).length === 0 ? (
            <p className="text-sm text-slate-500">
              Chua co lich su trang thai.
            </p>
          ) : (
            (shipment.statusHistory || []).map((log: IShipmentStatusLog) => (
              <div
                key={`${log.id}-${log.changedAt}`}
                className="rounded-xl border border-slate-200 p-3 text-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusChip(log.status)}
                    <span className="text-slate-500">
                      {log.changedBy || "system"}
                    </span>
                  </div>
                  <span className="text-slate-500">
                    {formatDateTime(log.changedAt)}
                  </span>
                </div>
                {log.note && <p className="mt-2 text-slate-600">{log.note}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
