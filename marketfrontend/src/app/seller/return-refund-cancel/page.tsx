"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSellerAuth } from "@/context/SellerAuthContext";
import {
  getSellerReturnRequests,
  ReturnRequestAdmin,
  ReturnRequestAttachmentAdmin,
  updateReturnRequestStatus,
} from "@/service/returnRequests";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  Image as ImageIcon,
  Package,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";

type StatusFilter =
  | "ALL"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "SHIPPING"
  | "RECEIVED"
  | "REFUNDED"
  | "INSPECTION_PASSED"
  | "INSPECTION_FAILED"
  | "CANCELED";

const STATUS_META: Record<
  string,
  {
    label: string;
    badge: string;
    icon: React.ReactNode;
  }
> = {
  PENDING_APPROVAL: {
    label: "Chờ phê duyệt",
    badge: "bg-amber-100 text-amber-700",
    icon: <Clock3 size={14} />,
  },
  APPROVED: {
    label: "Đã duyệt",
    badge: "bg-blue-100 text-blue-700",
    icon: <CheckCircle2 size={14} />,
  },
  REJECTED: {
    label: "Từ chối",
    badge: "bg-rose-100 text-rose-700",
    icon: <XCircle size={14} />,
  },
  SHIPPING: {
    label: "Đang trả hàng",
    badge: "bg-violet-100 text-violet-700",
    icon: <Truck size={14} />,
  },
  RECEIVED: {
    label: "Đã nhận hàng trả",
    badge: "bg-cyan-100 text-cyan-700",
    icon: <Package size={14} />,
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    badge: "bg-emerald-100 text-emerald-700",
    icon: <Wallet size={14} />,
  },
  INSPECTION_PASSED: {
    label: "Kiểm tra đạt",
    badge: "bg-green-100 text-green-700",
    icon: <ShieldCheck size={14} />,
  },
  INSPECTION_FAILED: {
    label: "Kiểm tra không đạt",
    badge: "bg-orange-100 text-orange-700",
    icon: <AlertTriangle size={14} />,
  },
  CANCELED: {
    label: "Đã hủy",
    badge: "bg-slate-200 text-slate-700",
    icon: <XCircle size={14} />,
  },
};

const STATUS_TABS: Array<{ key: StatusFilter; label: string }> = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "SHIPPING", label: "Đang trả hàng" },
  { key: "RECEIVED", label: "Đã nhận hàng" },
  { key: "REFUNDED", label: "Đã hoàn tiền" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number.isFinite(amount) ? amount : 0);

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRequestCode = (id: number) => `RR-${String(id).padStart(6, "0")}`;

const normalizeText = (value?: string | null) => value?.trim() || "";

const getStatusMeta = (status: string) =>
  STATUS_META[status] || {
    label: status || "Không xác định",
    badge: "bg-slate-100 text-slate-700",
    icon: <Clock3 size={14} />,
  };

const getRequestSearchText = (request: ReturnRequestAdmin) =>
  [
    formatRequestCode(request.id),
    request.orderNumber,
    request.shipmentTrackingNumber,
    request.orderTrackingNumber,
    request.customerName,
    request.customerEmail,
    request.customerPhone,
    request.reason,
    request.items?.map((item) => item.productName).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const isImageAttachment = (attachment: ReturnRequestAttachmentAdmin) =>
  attachment.fileType?.toLowerCase().startsWith("image/") ||
  /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.fileUrl);

function SummaryCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black text-slate-800">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SellerReturnRequestDetail({
  request,
  onClose,
  onOpenShipment,
  onApprove,
  onMarkInspectionPassed,
  isApproving,
  isMarkingInspection,
}: {
  request: ReturnRequestAdmin | null;
  onClose: () => void;
  onOpenShipment: (shipmentId?: number | null) => void;
  onApprove: (requestId: number, refundAmount: number) => void;
  onMarkInspectionPassed: (requestId: number) => void;
  isApproving: boolean;
  isMarkingInspection: boolean;
}) {
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  if (!request) return null;

  const status = getStatusMeta(request.status);
  const returnShipmentStatusMeta = getStatusMeta(
    request.returnShipment?.status || "",
  );
  const canMarkInspectionPassed =
    ["DELIVERD", "DELIVERED"].includes(
      String(request.returnShipment?.status || "").toUpperCase(),
    ) && request.status !== "INSPECTION_PASSED";
  const returnShipmentHistory = request.returnShipmentHistory || [];
  const returnTimeline = request.timeline || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[28px] border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Chi tiết yêu cầu
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-800">
              {formatRequestCode(request.id)}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-bold ${status.badge}`}
              >
                {status.icon}
                {status.label}
              </span>
              <span className="text-sm text-slate-500">
                Tạo lúc {formatDateTime(request.createdAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-8 p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SummaryCard
              label="Tiền yêu cầu"
              value={formatCurrency(request.requestedAmount)}
              hint="Số tiền người mua yêu cầu hoàn"
              icon={<Wallet className="text-emerald-600" size={20} />}
              tone="bg-emerald-50 text-emerald-600"
            />
            <SummaryCard
              label="Đã hoàn"
              value={formatCurrency(request.refundedAmount)}
              hint="Số tiền đã xử lý hoàn"
              icon={<CheckCircle2 className="text-blue-600" size={20} />}
              tone="bg-blue-50 text-blue-600"
            />
            <SummaryCard
              label="Sản phẩm"
              value={String(request.items?.length || 0)}
              hint="Số dòng sản phẩm trong yêu cầu"
              icon={<Package className="text-violet-600" size={20} />}
              tone="bg-violet-50 text-violet-600"
            />
            <SummaryCard
              label="Đính kèm"
              value={String(request.attachments?.length || 0)}
              hint="Ảnh hoặc video người mua gửi"
              icon={<ImageIcon className="text-amber-600" size={20} />}
              tone="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-lg font-black text-slate-800">
                Thông tin yêu cầu
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField
                  label="Mã yêu cầu"
                  value={formatRequestCode(request.id)}
                />
                <InfoField
                  label="Mã đơn hàng"
                  value={
                    normalizeText(request.orderNumber) || `#${request.orderId}`
                  }
                />
                <InfoField
                  label="Mã vận đơn"
                  value={
                    normalizeText(request.shipmentTrackingNumber) ||
                    normalizeText(request.orderTrackingNumber) ||
                    "-"
                  }
                />
                <InfoField
                  label="Khách hàng"
                  value={
                    normalizeText(request.customerName) ||
                    `#${request.customerId}`
                  }
                />
                <InfoField
                  label="Email"
                  value={normalizeText(request.customerEmail) || "-"}
                />
                <InfoField
                  label="Số điện thoại"
                  value={normalizeText(request.customerPhone) || "-"}
                />
                <InfoField
                  label="Tổng số lượng"
                  value={String(request.quantity)}
                />
                <InfoField
                  label="Ngày tạo"
                  value={formatDateTime(request.createdAt)}
                />
                <InfoField
                  label="Số tiền duyệt"
                  value={
                    request.approvedAmount != null
                      ? formatCurrency(Number(request.approvedAmount))
                      : "-"
                  }
                />
                <InfoField
                  label="Số tiền đã hoàn"
                  value={
                    Number(request.refundedAmount || 0) > 0
                      ? formatCurrency(Number(request.refundedAmount))
                      : "-"
                  }
                />
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Lý do
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {normalizeText(request.reason) ||
                    "Người mua chưa cung cấp lý do."}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Return shipment
                </p>

                {!request.returnShipment ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Chưa có dữ liệu return_shipment cho yêu cầu này.
                  </p>
                ) : (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-bold ${returnShipmentStatusMeta.badge}`}
                      >
                        {returnShipmentStatusMeta.icon}
                        {returnShipmentStatusMeta.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoField
                        label="Mã vận đơn trả"
                        value={
                          normalizeText(request.returnShipment.trackingCode) ||
                          "-"
                        }
                      />
                      <InfoField
                        label="Đơn vị vận chuyển"
                        value={
                          normalizeText(request.returnShipment.courierName) ||
                          "-"
                        }
                      />
                      <InfoField
                        label="Ngày lấy hàng dự kiến"
                        value={formatDateTime(
                          request.returnShipment.scheduledPickupDate,
                        )}
                      />
                      <InfoField
                        label="Ngày lấy hàng thực tế"
                        value={formatDateTime(
                          request.returnShipment.actualPickupDate,
                        )}
                      />
                      <InfoField
                        label="Ngày giao hoàn"
                        value={formatDateTime(
                          request.returnShipment.deliveryDate,
                        )}
                      />
                      <InfoField
                        label="Cập nhật gần nhất"
                        value={formatDateTime(request.returnShipment.updatedAt)}
                      />
                    </div>

                    {(normalizeText(request.returnShipment.notes) ||
                      normalizeText(request.returnShipment.failedReason)) && (
                      <div className="mt-3 space-y-2">
                        {normalizeText(request.returnShipment.notes) && (
                          <p className="text-sm text-slate-700">
                            <span className="font-bold">Ghi chú:</span>{" "}
                            {request.returnShipment.notes}
                          </p>
                        )}
                        {normalizeText(request.returnShipment.failedReason) && (
                          <p className="text-sm text-rose-600">
                            <span className="font-bold">Lý do thất bại:</span>{" "}
                            {request.returnShipment.failedReason}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <p className="mb-0 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Return shipment history
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsTimelineModalOpen(true)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Xem timeline trả hàng
                      </button>
                    </div>

                    {returnShipmentHistory.length === 0 ? (
                      <div className="mt-2 rounded-xl border border-dashed border-slate-200 px-3 py-3 text-sm text-slate-500">
                        Chưa có return_shipment_history.
                      </div>
                    ) : (
                      <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="table mb-0 table-sm align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Thời gian</th>
                              <th>Trạng thái</th>
                              <th>Mô tả</th>
                              <th>Vị trí</th>
                              <th>Nguồn</th>
                            </tr>
                          </thead>
                          <tbody>
                            {returnShipmentHistory.map((entry, index) => (
                              <tr
                                key={`${request.id}-shipment-history-${entry.id ?? index}`}
                              >
                                <td>
                                  {formatDateTime(
                                    entry.timestamp || entry.createdAt,
                                  )}
                                </td>
                                <td>
                                  <span className="badge bg-slate-100 text-slate-700">
                                    {normalizeText(entry.status) || "-"}
                                  </span>
                                </td>
                                <td>
                                  {normalizeText(entry.description) || "-"}
                                </td>
                                <td>{normalizeText(entry.location) || "-"}</td>
                                <td>{normalizeText(entry.source) || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {request.status === "PENDING_APPROVAL" && (
                  <button
                    type="button"
                    onClick={() =>
                      onApprove(
                        request.id,
                        Number(request.requestedAmount || 0),
                      )
                    }
                    disabled={isApproving}
                    className="rounded-2xl bg-success px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isApproving ? "Đang chấp nhận..." : "Chấp nhận yêu cầu"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenShipment(request.orderShipmentId)}
                  disabled={!request.orderShipmentId}
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Xem chi tiết vận đơn
                </button>
                {canMarkInspectionPassed && (
                  <button
                    type="button"
                    onClick={() => onMarkInspectionPassed(request.id)}
                    disabled={isMarkingInspection}
                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isMarkingInspection
                      ? "Đang cập nhật..."
                      : "Đã nhận và kiểm tra đầy đủ"}
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black text-slate-800">
                Sản phẩm trả hàng
              </h3>
              <div className="mt-4 space-y-4">
                {(request.items || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    Chưa có chi tiết sản phẩm trong yêu cầu này.
                  </div>
                ) : (
                  request.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-800">
                            {normalizeText(item.productName) ||
                              `Order Item #${item.orderItemId}`}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {normalizeText(item.variantName) ||
                              "Không có phân loại"}
                          </p>
                        </div>
                        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <MiniMetric
                          label="Đơn giá"
                          value={formatCurrency(Number(item.price || 0))}
                        />
                        <MiniMetric
                          label="Tổng"
                          value={formatCurrency(Number(item.totalPrice || 0))}
                        />
                        <MiniMetric
                          label="Yêu cầu"
                          value={formatCurrency(
                            Number(item.requestedAmount || 0),
                          )}
                        />
                        <MiniMetric
                          label="Đã hoàn"
                          value={formatCurrency(
                            Number(item.refundedAmount || 0),
                          )}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-black text-slate-800">Tệp đính kèm</h3>
            {(request.attachments || []).length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
                Người mua chưa gửi ảnh hoặc video minh chứng.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {request.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-400">
                      {isImageAttachment(attachment) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={attachment.fileUrl}
                          alt={
                            attachment.description ||
                            `Attachment ${attachment.id}`
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={36} />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-1 text-sm font-bold text-slate-800">
                        {attachment.description || `Tệp #${attachment.id}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {attachment.fileType || "Không rõ loại tệp"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {isTimelineModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setIsTimelineModalOpen(false)}
        >
          <div
            className="max-h-[86vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 d-flex align-items-start justify-content-between gap-3">
              <div>
                <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Timeline trả hàng
                </p>
                <h3 className="mb-0 text-xl font-black text-slate-800">
                  {formatRequestCode(request.id)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTimelineModalOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 p-4">
                <h4 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                  return_shipment_history
                </h4>
                {returnShipmentHistory.length === 0 ? (
                  <p className="mb-0 text-sm text-slate-500">
                    Chưa có dữ liệu.
                  </p>
                ) : (
                  <ul className="mb-0 d-flex flex-column gap-3 list-unstyled">
                    {returnShipmentHistory.map((entry, index) => (
                      <li
                        key={`${request.id}-timeline-history-${entry.id ?? index}`}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <p className="mb-1 text-xs text-slate-500">
                          {formatDateTime(entry.timestamp || entry.createdAt)}
                        </p>
                        <p className="mb-1 text-sm font-bold text-slate-800">
                          {normalizeText(entry.status) || "-"}
                        </p>
                        <p className="mb-1 text-sm text-slate-700">
                          {normalizeText(entry.description) || "Không có mô tả"}
                        </p>
                        <p className="mb-0 text-xs text-slate-500">
                          {normalizeText(entry.location) || "-"} |{" "}
                          {normalizeText(entry.source) || "-"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <h4 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                  return_request_timeline
                </h4>
                {returnTimeline.length === 0 ? (
                  <p className="mb-0 text-sm text-slate-500">
                    Chưa có dữ liệu.
                  </p>
                ) : (
                  <ul className="mb-0 d-flex flex-column gap-3 list-unstyled">
                    {returnTimeline.map((entry, index) => (
                      <li
                        key={`${request.id}-timeline-request-${entry.id ?? index}`}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <p className="mb-1 text-xs text-slate-500">
                          {formatDateTime(entry.timestamp)}
                        </p>
                        <p className="mb-1 text-sm font-bold text-slate-800">
                          {normalizeText(entry.eventType) || "EVENT"}
                        </p>
                        <p className="mb-1 text-sm text-slate-700">
                          {normalizeText(entry.eventDetails) ||
                            "Không có chi tiết"}
                        </p>
                        <p className="mb-0 text-xs text-slate-500">
                          Actor: {normalizeText(entry.actorType) || "SYSTEM"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <Skeleton className="h-6 w-72" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-3xl" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export default function SellerReturnRefundCancelPage() {
  const router = useRouter();
  const { shop } = useSellerAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<ReturnRequestAdmin | null>(null);
  const [expandedRequestIds, setExpandedRequestIds] = useState<Set<number>>(
    new Set(),
  );
  const [approvingRequestId, setApprovingRequestId] = useState<number | null>(
    null,
  );
  const [markingInspectionRequestId, setMarkingInspectionRequestId] = useState<
    number | null
  >(null);
  const approvingInFlightRef = useRef<Set<number>>(new Set());

  const shopId = Number(shop?.id ?? 0);

  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<ReturnRequestAdmin[]>({
    queryKey: ["seller", "return-requests", shopId],
    enabled: shopId > 0,
    queryFn: () => getSellerReturnRequests(shopId),
  });

  const filteredRequests = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return requests
      .filter((request) => {
        const matchStatus =
          statusFilter === "ALL" || request.status === statusFilter;
        const matchSearch =
          search.length === 0 || getRequestSearchText(request).includes(search);

        return matchStatus && matchSearch;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt || "").getTime();
        const rightTime = new Date(right.createdAt || "").getTime();

        if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
          if (rightTime !== leftTime) {
            return rightTime - leftTime;
          }
        }

        return Number(right.id || 0) - Number(left.id || 0);
      });
  }, [keyword, requests, statusFilter]);

  const stats = useMemo(() => {
    const totalRequested = requests.reduce(
      (sum, request) => sum + Number(request.requestedAmount || 0),
      0,
    );
    const pendingCount = requests.filter(
      (request) => request.status === "PENDING_APPROVAL",
    ).length;
    const refundedCount = requests.filter(
      (request) => request.status === "REFUNDED",
    ).length;
    const openCount = requests.filter(
      (request) =>
        !["REFUNDED", "REJECTED", "CANCELED"].includes(request.status),
    ).length;

    return {
      total: requests.length,
      totalRequested,
      pendingCount,
      refundedCount,
      openCount,
    };
  }, [requests]);

  const openShipment = (shipmentId?: number | null) => {
    if (!shipmentId) return;
    router.push(`/seller/orders/${shipmentId}`);
  };

  const handleApproveRequest = async (
    requestId: number,
    refundAmount: number,
  ) => {
    if (approvingInFlightRef.current.has(requestId)) {
      return;
    }

    try {
      approvingInFlightRef.current.add(requestId);
      setApprovingRequestId(requestId);
      await updateReturnRequestStatus(requestId, "APPROVED", refundAmount);
      await refetch();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể chấp nhận yêu cầu lúc này.";
      window.alert(message);
    } finally {
      approvingInFlightRef.current.delete(requestId);
      setApprovingRequestId(null);
    }
  };

  const handleMarkInspectionPassed = async (requestId: number) => {
    try {
      setMarkingInspectionRequestId(requestId);
      await updateReturnRequestStatus(requestId, "INSPECTION_PASSED");
      await refetch();
      setSelectedRequest((prev) =>
        prev && prev.id === requestId
          ? {
              ...prev,
              status: "INSPECTION_PASSED",
              approvedAmount: prev.requestedAmount,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái kiểm tra lúc này.";
      window.alert(message);
    } finally {
      setMarkingInspectionRequestId(null);
    }
  };

  if (!shop && !isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <EmptyState
          type="error"
          title="Chưa tải được thông tin shop"
          description="Cần có thông tin shop để lấy danh sách return request. Vui lòng tải lại hoặc kiểm tra tài khoản seller."
          actionLabel="Tải lại dữ liệu"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex-grow-1 overflow-auto">
        <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-3">Return/Refund</h5>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="#" className="text-decoration-none">
                    Trang chủ
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/seller/orders" className="text-decoration-none">
                    Đơn hàng
                  </a>
                </li>
                <li className="breadcrumb-item active">Return/Refund</li>
              </ol>
            </nav>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
          >
            <RefreshCcw
              size={14}
              className={isFetching ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>

        <div className="bg-white mx-3 border-bottom">
          <ul className="nav nav-tabs border-0">
            {STATUS_TABS.map((tab) => {
              const active = tab.key === statusFilter;
              return (
                <li className="nav-item" key={tab.key}>
                  <button
                    className={`nav-link ${
                      active ? "active border-danger text-danger" : "text-dark"
                    } border-0 border-bottom-3`}
                    onClick={() => setStatusFilter(tab.key)}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white mx-3 p-3 border-bottom">
          <div className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm mã yêu cầu, đơn hàng, vận đơn, khách hàng hoặc sản phẩm"
              />
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => setKeyword("")}
                >
                  Xóa lọc
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => refetch()}
                >
                  Tải lại dữ liệu
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white mx-3 p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-bold">{filteredRequests.length} Yêu cầu</span>
            <small className="text-muted ms-2">Tổng: {stats.total}</small>
          </div>
          <div className="d-flex gap-2 text-muted small">
            <span>Chờ duyệt: {stats.pendingCount}</span>
            <span>|</span>
            <span>Đang mở: {stats.openCount}</span>
            <span>|</span>
            <span>Đã hoàn: {stats.refundedCount}</span>
          </div>
        </div>

        <div className="bg-white mx-3 mb-3">
          {isLoading ? (
            <PageSkeleton />
          ) : isError ? (
            <div className="p-4">
              <EmptyState
                type="error"
                title="Không thể tải danh sách yêu cầu"
                description="Endpoint return request đang lỗi hoặc chưa phản hồi. Hãy thử tải lại sau."
                actionLabel="Thử lại"
                onAction={() => refetch()}
              />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-4">
              <EmptyState
                type={requests.length === 0 ? "data" : "search"}
                title={
                  requests.length === 0
                    ? "Chưa có return request"
                    : "Không có yêu cầu phù hợp"
                }
                description={
                  requests.length === 0
                    ? "Shop hiện chưa có yêu cầu trả hàng hoặc hoàn tiền nào."
                    : "Thử đổi từ khóa hoặc tab trạng thái để xem dữ liệu khác."
                }
              />
            </div>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mã yêu cầu / Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Vận chuyển</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const status = getStatusMeta(request.status);
                  const requestItems = request.items || [];
                  const firstItem = requestItems[0];
                  const hasMoreItems = requestItems.length >= 2;
                  const isExpanded = expandedRequestIds.has(request.id);

                  return (
                    <Fragment key={request.id}>
                      <tr>
                        <td>
                          <div className="d-flex flex-column">
                            <strong>{formatRequestCode(request.id)}</strong>
                            <small className="text-muted">
                              KH:{" "}
                              {normalizeText(request.customerName) ||
                                `#${request.customerId}`}
                            </small>
                            <small className="text-muted">
                              Đơn:{" "}
                              {normalizeText(request.orderNumber) ||
                                `#${request.orderId}`}
                            </small>
                            <small className="text-muted">
                              {formatDateTime(request.createdAt)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <div className="flex-shrink-0">
                              {firstItem?.productImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={firstItem.productImage}
                                  alt={
                                    firstItem.productName ||
                                    `Product ${firstItem.orderItemId}`
                                  }
                                  width={48}
                                  height={48}
                                  className="rounded border"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <div
                                  className="rounded border d-flex align-items-center justify-content-center bg-light"
                                  style={{ width: 48, height: 48 }}
                                >
                                  <Package size={18} className="text-muted" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <div
                                className="fw-medium text-dark text-truncate"
                                style={{ maxWidth: "260px" }}
                                title={
                                  normalizeText(firstItem?.productName) ||
                                  "Chưa có tên sản phẩm"
                                }
                              >
                                {normalizeText(firstItem?.productName) ||
                                  "Chưa có tên sản phẩm"}
                              </div>
                              <small
                                className="text-muted d-block text-truncate"
                                style={{ maxWidth: "260px" }}
                                title={
                                  normalizeText(firstItem?.variantName) ||
                                  "Không có phân loại"
                                }
                              >
                                {normalizeText(firstItem?.variantName) ||
                                  "Không có phân loại"}
                              </small>
                              <small className="text-muted d-block">
                                {requestItems.length} dòng sản phẩm, tổng SL{" "}
                                {request.quantity}
                              </small>
                              {hasMoreItems && (
                                <button
                                  type="button"
                                  className="btn btn-link p-0 mt-1 text-primary text-decoration-none small"
                                  onClick={() =>
                                    setExpandedRequestIds((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(request.id)) {
                                        next.delete(request.id);
                                      } else {
                                        next.add(request.id);
                                      }
                                      return next;
                                    })
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronDown size={14} className="me-1" />
                                  ) : (
                                    <ChevronRight size={14} className="me-1" />
                                  )}
                                  {isExpanded
                                    ? "Thu gọn sản phẩm"
                                    : `Xem thêm ${requestItems.length - 1} sản phẩm`}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">
                            {Number(request.requestedAmount || 0) > 0
                              ? `Trả lại: ${formatCurrency(request.requestedAmount)}`
                              : `Khách trả thêm: ${formatCurrency(
                                  -Number(request.requestedAmount || 0),
                                )}`}
                          </div>
                          <small className="text-primary d-block mt-1">
                            Duyệt:{" "}
                            {request.approvedAmount != null
                              ? formatCurrency(Number(request.approvedAmount))
                              : "-"}
                          </small>
                          {Number(request.refundedAmount || 0) > 0 && (
                            <small className="text-success d-block mt-1">
                              Đã hoàn: {formatCurrency(request.refundedAmount)}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${status.badge}`}>
                            {status.label}
                          </span>
                          <small className="text-muted d-block mt-2">
                            {normalizeText(request.reason) || "Không có lý do"}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted d-block">
                            Mã vận đơn:{" "}
                            {normalizeText(request.shipmentTrackingNumber) ||
                              normalizeText(request.orderTrackingNumber) ||
                              "-"}
                          </small>
                          <small className="text-muted d-block">
                            Đính kèm: {request.attachments?.length || 0} tệp
                          </small>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            {request.status === "PENDING_APPROVAL" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleApproveRequest(
                                    request.id,
                                    Number(request.requestedAmount || 0),
                                  )
                                }
                                disabled={approvingRequestId === request.id}
                                className="btn btn-link p-0 text-success text-decoration-none small text-start"
                              >
                                {approvingRequestId === request.id
                                  ? "Đang chấp nhận..."
                                  : "Chấp nhận"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(request)}
                              className="btn btn-link p-0 text-primary text-decoration-none small text-start"
                            >
                              <Eye size={14} className="me-1" />
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openShipment(request.orderShipmentId)
                              }
                              disabled={!request.orderShipmentId}
                              className="btn btn-link p-0 text-primary text-decoration-none small text-start disabled text-muted"
                            >
                              Mở đơn vận chuyển
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded &&
                        requestItems.slice(1).map((item, index) => (
                          <tr
                            key={`request-${request.id}-item-${item.id ?? index}`}
                            className="table-light"
                          >
                            <td></td>
                            <td>
                              <div className="d-flex gap-2 ps-3">
                                <div className="flex-shrink-0">
                                  {item.productImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.productImage}
                                      alt={
                                        item.productName ||
                                        `Product ${item.orderItemId}`
                                      }
                                      width={40}
                                      height={40}
                                      className="rounded border"
                                      style={{ objectFit: "cover" }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded border d-flex align-items-center justify-content-center bg-white"
                                      style={{ width: 40, height: 40 }}
                                    >
                                      <Package
                                        size={16}
                                        className="text-muted"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div
                                    className="text-dark text-truncate"
                                    style={{ maxWidth: "240px" }}
                                    title={
                                      normalizeText(item.productName) ||
                                      `Order Item #${item.orderItemId}`
                                    }
                                  >
                                    {normalizeText(item.productName) ||
                                      `Order Item #${item.orderItemId}`}
                                  </div>
                                  <small
                                    className="text-muted d-block text-truncate"
                                    style={{ maxWidth: "240px" }}
                                    title={
                                      normalizeText(item.variantName) ||
                                      "Không có phân loại"
                                    }
                                  >
                                    {normalizeText(item.variantName) ||
                                      "Không có phân loại"}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <small className="text-muted d-block">
                                Yêu cầu: {formatCurrency(item.requestedAmount)}
                              </small>
                              <small className="text-success d-block">
                                Đã hoàn: {formatCurrency(item.refundedAmount)}
                              </small>
                            </td>
                            <td colSpan={3}></td>
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <SellerReturnRequestDetail
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onOpenShipment={openShipment}
        onApprove={handleApproveRequest}
        onMarkInspectionPassed={handleMarkInspectionPassed}
        isApproving={
          !!selectedRequest && approvingRequestId === selectedRequest.id
        }
        isMarkingInspection={
          !!selectedRequest && markingInspectionRequestId === selectedRequest.id
        }
      />
    </>
  );
}
