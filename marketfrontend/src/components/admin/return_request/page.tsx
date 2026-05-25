"use client";

import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useToast } from "@/context/ToastContext";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  Image as ImageIcon,
  Package,
  RefreshCcw,
  Search,
  ShieldCheck,
  Truck,
  Video,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  getAdminReturnRequests,
  ReturnRequestAdmin,
  ReturnRequestAttachmentAdmin,
  ReturnRequestItemAdmin,
  ReturnRequestStatusAdmin,
  updateReturnRequestStatus,
} from "@/service/returnRequests";
import Pagination from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
  }
> = {
  PENDING_APPROVAL: {
    label: "Chờ phê duyệt",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: <Clock3 size={12} />,
  },
  APPROVED: {
    label: "Đã phê duyệt",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    label: "Đã từ chối",
    color: "text-rose-700",
    bgColor: "bg-rose-100",
    icon: <XCircle size={12} />,
  },
  SHIPPING: {
    label: "Đang vận chuyển",
    color: "text-violet-700",
    bgColor: "bg-violet-100",
    icon: <Truck size={12} />,
  },
  RECEIVED: {
    label: "Đã nhận hàng trả",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
    icon: <Package size={12} />,
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: <Wallet size={12} />,
  },
  INSPECTION_PASSED: {
    label: "Kiểm tra đạt",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <ShieldCheck size={12} />,
  },
  INSPECTION_FAILED: {
    label: "Kiểm tra không đạt",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: <AlertTriangle size={12} />,
  },
  CANCELED: {
    label: "Đã hủy",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    icon: <XCircle size={12} />,
  },
};

const currency = (value: number) => `${value.toLocaleString("vi-VN")}₫`;

const toFiniteNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getItemFinalAmount = (item: ReturnRequestItemAdmin) => {
  const requestedAmount = toFiniteNumber(item.requestedAmount);
  if (requestedAmount !== 0) return requestedAmount;

  const orderQuantity = toFiniteNumber(item.orderQuantity);
  const returnQuantity = toFiniteNumber(item.quantity);
  const lineQuantity = orderQuantity || returnQuantity || 1;
  const lineAmount =
    toFiniteNumber(item.totalAfterAllVouchers) ||
    toFiniteNumber(item.totalPrice) ||
    toFiniteNumber(item.price) * Math.max(1, lineQuantity);

  if (lineAmount <= 0 || returnQuantity <= 0) return 0;
  if (orderQuantity <= 0) return lineAmount;
  return (lineAmount * Math.min(returnQuantity, orderQuantity)) / orderQuantity;
};

const getRequestFinalAmount = (request: ReturnRequestAdmin) => {
  const finalRequestedAmount = toFiniteNumber(request.finalRequestedAmount);
  if (finalRequestedAmount !== 0) return finalRequestedAmount;

  const requestedAmount = toFiniteNumber(request.requestedAmount);
  if (requestedAmount !== 0) return requestedAmount;

  return (request.items || []).reduce(
    (sum, item) => sum + getItemFinalAmount(item),
    0,
  );
};

const formatRequestCode = (id: number) =>
  `RR-${id.toString().padStart(5, "0")}`;

const textOrEmpty = (value?: string | null) => value?.trim() || "";

const getOrderLabel = (request: ReturnRequestAdmin) =>
  textOrEmpty(request.orderNumber) || `Đơn #${request.orderId}`;

const getShipmentLabel = (request: ReturnRequestAdmin) =>
  textOrEmpty(request.shipmentTrackingNumber) ||
  textOrEmpty(request.orderTrackingNumber) ||
  (request.orderShipmentId
    ? `Kiện #${request.orderShipmentId}`
    : "Chưa có mã kiện");

const getCustomerLabel = (request: ReturnRequestAdmin) =>
  textOrEmpty(request.customerName) || `KH #${request.customerId}`;

const getShopLabel = (request: ReturnRequestAdmin) =>
  textOrEmpty(request.shopName) || `Shop #${request.shopId}`;

const getItemLabel = (item: ReturnRequestAdmin["items"][number]) =>
  textOrEmpty(item.productName) || `Order Item #${item.orderItemId}`;

const getPrimaryItemLabel = (request: ReturnRequestAdmin) =>
  request.items?.[0] ? getItemLabel(request.items[0]) : "Chưa có sản phẩm";

const isVideoAttachment = (attachment: ReturnRequestAttachmentAdmin) =>
  attachment.fileType?.toLowerCase().startsWith("video/") ||
  attachment.fileUrl?.toLowerCase().match(/\.(mp4|mov|webm|m4v)$/);

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
      </div>
    </div>
  );
}

function ReturnRequestDetailModal({
  request,
  onClose,
  onStatusAction,
  actionLoading,
}: {
  request: ReturnRequestAdmin | null;
  onClose: () => void;
  onStatusAction: (
    request: ReturnRequestAdmin,
    status: ReturnRequestStatusAdmin,
  ) => void;
  actionLoading: boolean;
}) {
  if (!request) return null;

  const statusConfig = STATUS_CONFIG[request.status] || {
    label: request.status,
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    icon: <Clock3 size={12} />,
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-[28px] shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 rounded-t-[28px]">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Yêu cầu trả hàng hoàn tiền
            </p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {formatRequestCode(request.id)}
            </h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tạo lúc {new Date(request.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => onStatusAction(request, "APPROVED")}
                disabled={actionLoading || request.status === "APPROVED"}
                className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 border-0"
              >
                Duyệt
              </button>
              <button
                onClick={() => onStatusAction(request, "REJECTED")}
                disabled={actionLoading || request.status === "REJECTED"}
                className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 disabled:opacity-50 border-0"
              >
                Từ chối
              </button>
              {request.status === "INSPECTION_PASSED" && (
                <button
                  onClick={() => onStatusAction(request, "REFUNDED")}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 border-0"
                >
                  Hoàn tiền
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-0"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              label="Tiền yêu cầu"
              value={currency(getRequestFinalAmount(request))}
              icon={<Banknote className="text-green-600" size={20} />}
              color="bg-green-50 text-green-600"
            />
            <SummaryCard
              label="Đã hoàn"
              value={currency(request.refundedAmount)}
              icon={<Wallet className="text-blue-600" size={20} />}
              color="bg-blue-50 text-blue-600"
            />
            <SummaryCard
              label="Số lượng"
              value={request.quantity}
              icon={<Package className="text-violet-600" size={20} />}
              color="bg-violet-50 text-violet-600"
            />
            <SummaryCard
              label="Tệp đính kèm"
              value={request.attachments?.length || 0}
              icon={<ImageIcon className="text-amber-600" size={20} />}
              color="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">
                Thông tin chính
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Mã yêu cầu
                  </p>
                  <p className="text-sm font-mono font-black text-slate-800 mt-1">
                    {formatRequestCode(request.id)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Mã đơn hàng
                  </p>
                  <p className="text-sm font-black text-slate-800 mt-1">
                    {getOrderLabel(request)}
                  </p>
                  {request.orderNumber && (
                    <p className="text-xs text-slate-400 mt-1">
                      ID đơn: #{request.orderId}
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Mã vận đơn
                  </p>
                  <p className="text-sm font-black text-slate-800 mt-1">
                    {getShipmentLabel(request)}
                  </p>
                  {(request.carrierName || request.shippingStatus) && (
                    <p className="text-xs text-slate-400 mt-1">
                      {[request.carrierName, request.shippingStatus]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Khách hàng
                  </p>
                  <p className="text-sm font-black text-slate-800 mt-1">
                    {getCustomerLabel(request)}
                  </p>
                  {(request.customerEmail || request.customerPhone) && (
                    <p className="text-xs text-slate-400 mt-1 break-all">
                      {[request.customerEmail, request.customerPhone]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Shop
                  </p>
                  <p className="text-sm font-black text-slate-800 mt-1">
                    {getShopLabel(request)}
                  </p>
                  {request.shopName && (
                    <p className="text-xs text-slate-400 mt-1">
                      Shop ID: #{request.shopId}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Lý do trả hàng
                </p>
                <p className="text-sm text-slate-700 leading-6">
                  {request.reason || "Không có mô tả"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">
                Mốc thời gian
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Tạo lúc
                  </p>
                  <p className="font-bold text-slate-800 mt-1">
                    {new Date(request.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Cập nhật lần cuối
                  </p>
                  <p className="font-bold text-slate-800 mt-1">
                    {request.updatedAt
                      ? new Date(request.updatedAt).toLocaleString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h4 className="font-black text-slate-800">
                Danh sách sản phẩm yêu cầu hoàn
              </h4>
            </div>
            <div className="divide-y divide-slate-100">
              {request.items?.length ? (
                request.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={getItemLabel(item)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 line-clamp-2">
                          {getItemLabel(item)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {textOrEmpty(item.variantName) ||
                            `Order Item #${item.orderItemId}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs font-bold">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                        SL trả: {item.quantity}
                      </span>
                      {!!item.orderQuantity && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                          Đã mua: {item.orderQuantity}
                        </span>
                      )}
                      {!!item.price && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                          Giá: {currency(item.price)}
                        </span>
                      )}
                      {!!item.totalPrice && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                          Tổng dòng: {currency(item.totalPrice)}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700">
                        Item #{item.orderItemId}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700">
                        Yêu cầu: {currency(getItemFinalAmount(item))}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-green-50 text-green-700">
                        Đã hoàn: {currency(item.refundedAmount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-sm text-slate-400">
                  Không có item đính kèm.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h4 className="font-black text-slate-800">
                Hình ảnh / Video đính kèm
              </h4>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {request.attachments?.length ? (
                request.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50"
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      {isVideoAttachment(attachment) ? (
                        <video
                          src={attachment.fileUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={attachment.fileUrl}
                          alt={attachment.description || "Return attachment"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        {isVideoAttachment(attachment) ? (
                          <Video size={12} />
                        ) : (
                          <ImageIcon size={12} />
                        )}
                        <span>{attachment.fileType}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 line-clamp-2">
                        {attachment.description || "Không có mô tả"}
                      </p>
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        <Eye size={12} /> Xem tệp gốc
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">
                  Không có tệp đính kèm.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReturnRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<ReturnRequestAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [serverStats, setServerStats] = useState({
    total: 0,
    pending: 0,
    refunded: 0,
    amount: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [shopFilter, setShopFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<ReturnRequestAdmin | null>(null);

  const loadRequests = async (page = currentPage) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await getAdminReturnRequests({
        page,
        size: ITEMS_PER_PAGE,
        status: statusFilter,
        search: search.trim() || undefined,
        shopId: shopFilter.trim() || undefined,
        customerId: customerFilter.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setRequests(response.data);
      setTotalRecords(response.meta.total || 0);
      setServerStats(
        response.stats || { total: 0, pending: 0, refunded: 0, amount: 0 },
      );
    } catch (error) {
      console.error("Failed to fetch return requests:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, shopFilter, customerFilter, startDate, endDate]);

  useEffect(() => {
    loadRequests(currentPage);
  }, [
    currentPage,
    statusFilter,
    search,
    shopFilter,
    customerFilter,
    startDate,
    endDate,
  ]);

  const handleStatusAction = async (
    request: ReturnRequestAdmin,
    nextStatus: ReturnRequestStatusAdmin,
  ) => {
    try {
      setActionLoadingId(request.id);
      const updated = await updateReturnRequestStatus(
        request.id,
        nextStatus,
        nextStatus === "REFUNDED" ? getRequestFinalAmount(request) : undefined,
      );

      setRequests((prev) =>
        prev.map((item) => (item.id === request.id ? updated : item)),
      );
      setSelectedRequest((prev) => (prev?.id === request.id ? updated : prev));
      await loadRequests(currentPage);
      toast.success(
        `Đã cập nhật trạng thái sang ${STATUS_CONFIG[nextStatus]?.label || nextStatus}`,
      );
    } catch (error) {
      console.error("Failed to update return request status:", error);
      toast.error("Không thể cập nhật trạng thái yêu cầu.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = {
    total: serverStats.total,
    pending: serverStats.pending,
    refunded: serverStats.refunded,
    amount: serverStats.amount,
  };

  const statusOptions = ["ALL", ...Object.keys(STATUS_CONFIG)];

  return (
    <div className="p-4 lg:p-8 space-y-6 no-print animate-in fade-in duration-500">
      <ReturnRequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onStatusAction={handleStatusAction}
        actionLoading={
          selectedRequest ? actionLoadingId === selectedRequest.id : false
        }
      />

      <Breadcrumbs
        items={[
          { label: "Quản lý đơn hàng", path: "/admin/orders" },
          { label: "Trả hàng hoàn tiền" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Trả hàng hoàn tiền
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hiển thị toàn bộ dữ liệu từ endpoint /api/refunds, bao gồm item hoàn
          trả và tệp đính kèm.
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Tổng yêu cầu"
          value={stats.total}
          icon={<Package size={20} className="text-blue-600" />}
          color="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Chờ phê duyệt"
          value={stats.pending}
          icon={<Clock3 size={20} className="text-amber-600" />}
          color="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          label="Đã hoàn tiền"
          value={stats.refunded}
          icon={<Wallet size={20} className="text-emerald-600" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Tổng tiền yêu cầu"
          value={currency(stats.amount)}
          icon={<Banknote size={20} className="text-violet-600" />}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-800">
              Danh sách yêu cầu
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Đang hiển thị {requests.length} / {totalRecords} yêu cầu
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:min-w-[920px]">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã yêu cầu, mã đơn, khách hàng, lý do..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL"
                      ? "Tất cả trạng thái"
                      : STATUS_CONFIG[status]?.label || status}
                  </option>
                ))}
              </select>
              <input
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                placeholder="Lọc Shop ID"
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none w-full md:w-36"
              />
              <input
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="Lọc KH ID"
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none w-full md:w-36"
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none"
              />
              <button
                onClick={() => loadRequests(currentPage)}
                className="px-4 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 border-0 flex items-center gap-2 justify-center"
              >
                <RefreshCcw size={16} /> Làm mới
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-100"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <Skeleton className="h-16 rounded-2xl" />
                  <Skeleton className="h-16 rounded-2xl" />
                  <Skeleton className="h-16 rounded-2xl" />
                  <Skeleton className="h-16 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-16">
            <ErrorState
              type="error"
              actionLabel="Tải lại"
              onAction={loadRequests}
            />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="Không có yêu cầu trả hàng hoàn tiền"
            description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm để xem dữ liệu khác."
            actionLabel="Xóa bộ lọc"
            onAction={() => {
              setSearch("");
              setStatusFilter("ALL");
              setShopFilter("");
              setCustomerFilter("");
              setStartDate("");
              setEndDate("");
            }}
            type="search"
          />
        ) : (
          <>
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {requests.map((request) => {
                const statusConfig = STATUS_CONFIG[request.status] || {
                  label: request.status,
                  color: "text-slate-700",
                  bgColor: "bg-slate-100",
                  icon: <Clock3 size={12} />,
                };

                return (
                  <div key={request.id} className="p-4 bg-white space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono font-black text-slate-800">
                          {formatRequestCode(request.id)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {getOrderLabel(request)} • {getShipmentLabel(request)}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                          <Package size={11} />
                          <span className="line-clamp-1">
                            {request.items?.length || 0} sản phẩm •{" "}
                            {request.attachments?.length || 0} tệp •{" "}
                            {getPrimaryItemLabel(request)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusConfig.bgColor} ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Khách hàng / Shop
                        </p>
                        <p className="font-black text-slate-800 mt-1">
                          {getCustomerLabel(request)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {getShopLabel(request)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Tiền yêu cầu
                        </p>
                        <p className="font-black text-slate-800 mt-1">
                          {currency(getRequestFinalAmount(request))}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Lý do
                      </p>
                      <p className="text-sm text-slate-700">
                        {request.reason || "Không có mô tả"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-400">
                        {new Date(request.createdAt).toLocaleString("vi-VN")}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleStatusAction(request, "APPROVED")
                          }
                          disabled={
                            actionLoadingId === request.id ||
                            request.status === "APPROVED"
                          }
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border-0 disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border-0"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[1180px] text-sm">
                <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Yêu cầu
                    </th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Đơn hàng
                    </th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Khách / Shop
                    </th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Lý do
                    </th>
                    <th className="text-center px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Sản phẩm / Tệp
                    </th>
                    <th className="text-right px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Số tiền
                    </th>
                    <th className="text-center px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Trạng thái
                    </th>
                    <th className="text-right px-5 py-4 text-[10px] font-black uppercase tracking-widest">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((request) => {
                    const statusConfig = STATUS_CONFIG[request.status] || {
                      label: request.status,
                      color: "text-slate-700",
                      bgColor: "bg-slate-100",
                      icon: <Clock3 size={12} />,
                    };

                    return (
                      <tr
                        key={request.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-mono font-black text-slate-800">
                              {formatRequestCode(request.id)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(request.createdAt).toLocaleString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-slate-800">
                              {getOrderLabel(request)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {getShipmentLabel(request)}
                            </p>
                            {request.carrierName && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                {request.carrierName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-slate-800">
                              {getCustomerLabel(request)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {getShopLabel(request)}
                            </p>
                            {request.customerEmail && (
                              <p className="text-[11px] text-slate-400 mt-1 max-w-[180px] truncate">
                                {request.customerEmail}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-[260px]">
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {request.reason || "Không có mô tả"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex flex-col items-center gap-1 text-xs font-bold">
                            <p className="max-w-[190px] truncate text-slate-700">
                              {getPrimaryItemLabel(request)}
                            </p>
                            <div className="inline-flex gap-1">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                {request.items?.length || 0} sản phẩm
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                                {request.attachments?.length || 0} tệp
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div>
                            <p className="font-black text-slate-800">
                              {getRequestFinalAmount(request) > 0
                                ? `Trả lại: ${currency(getRequestFinalAmount(request))}`
                                : `Khách trả thêm: ${currency(-getRequestFinalAmount(request))}`}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Đã hoàn: {currency(request.refundedAmount)}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusConfig.bgColor} ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleStatusAction(request, "APPROVED")
                              }
                              disabled={
                                actionLoadingId === request.id ||
                                request.status === "APPROVED"
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 border-0 disabled:opacity-50"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() =>
                                handleStatusAction(request, "REJECTED")
                              }
                              disabled={
                                actionLoadingId === request.id ||
                                request.status === "REJECTED"
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 border-0 disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                            {request.status === "INSPECTION_PASSED" && (
                              <button
                                onClick={() =>
                                  handleStatusAction(request, "REFUNDED")
                                }
                                disabled={actionLoadingId === request.id}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 border-0 disabled:opacity-50"
                              >
                                Hoàn tiền
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 border-0"
                            >
                              <Eye size={14} /> Chi tiết
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE))}
              onPageChange={setCurrentPage}
              totalItems={totalRecords}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>
    </div>
  );
}
