"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useToast } from "@/context/ToastContext";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
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
    label: "Wait for approval",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: <Clock3 size={12} />,
  },
  APPROVED: {
    label: "Approved",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-700",
    bgColor: "bg-rose-100",
    icon: <XCircle size={12} />,
  },
  SHIPPING: {
    label: "Shipping requested",
    color: "text-violet-700",
    bgColor: "bg-violet-100",
    icon: <Truck size={12} />,
  },
  RECEIVED: {
    label: "Received at warehouse",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
    icon: <Package size={12} />,
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: <Wallet size={12} />,
  },
  INSPECTION_PASSED: {
    label: "Inspection passed",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <ShieldCheck size={12} />,
  },
  INSPECTION_FAILED: {
    label: "Inspection failed",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: <AlertTriangle size={12} />,
  },
  CANCELED: {
    label: "Canceled",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    icon: <XCircle size={12} />,
  },
};

const REQUESTS_PER_PAGE = 10;

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
    ? `Sue #${request.orderShipmentId}`
    : "No case code yet");

const getCustomerLabel = (request: ReturnRequestAdmin) =>
  textOrEmpty(request.customerName) || `KH #${request.customerId}`;

const getShopLabel = (request: ReturnRequestAdmin) =>
  textOrEmpty(request.shopName) || `Shop #${request.shopId}`;

const getItemLabel = (item: ReturnRequestAdmin["items"][number]) =>
  textOrEmpty(item.productName) || `Order Item #${item.orderItemId}`;

const getPrimaryItemLabel = (request: ReturnRequestAdmin) =>
  request.items?.[0] ? getItemLabel(request.items[0]) : "There are no products yet";

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
              Request a return and refund.
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
                Created at {new Date(request.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => onStatusAction(request, "APPROVED")}
                disabled={actionLoading || request.status === "APPROVED"}
                className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 border-0"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusAction(request, "REJECTED")}
                disabled={actionLoading || request.status === "REJECTED"}
                className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 disabled:opacity-50 border-0"
              >
                Reject
              </button>
              <button
                onClick={() => onStatusAction(request, "REFUNDED")}
                disabled={actionLoading || request.status === "REFUNDED"}
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 border-0"
              >
                Refund
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center border-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              label="Requested Amount"
              value={currency(getRequestFinalAmount(request))}
              icon={<Banknote className="text-green-600" size={20} />}
              color="bg-green-50 text-green-600"
            />
            <SummaryCard
              label="Refunded Amount"
              value={currency(request.refundedAmount)}
              icon={<Wallet className="text-blue-600" size={20} />}
              color="bg-blue-50 text-blue-600"
            />
            <SummaryCard
              label="Requested Quantity"
              value={request.quantity}
              icon={<Package className="text-violet-600" size={20} />}
              color="bg-violet-50 text-violet-600"
            />
            <SummaryCard
              label="Attachments"
              value={request.attachments?.length || 0}
              icon={<ImageIcon className="text-amber-600" size={20} />}
              color="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">
                Key information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Request code
                  </p>
                  <p className="text-sm font-mono font-black text-slate-800 mt-1">
                    {formatRequestCode(request.id)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Order code
                  </p>
                  <p className="text-sm font-black text-slate-800 mt-1">
                    {getOrderLabel(request)}
                  </p>
                  {request.orderNumber && (
                    <p className="text-xs text-slate-400 mt-1">
                      ID Order: #{request.orderId}
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Shipment code
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
                    Client
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
                  Reason for return
                </p>
                <p className="text-sm text-slate-700 leading-6">
                  {request.reason || "No description available"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">
                Timeline
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Created at
                  </p>
                  <p className="font-bold text-slate-800 mt-1">
                    {new Date(request.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Last updated
                  </p>
                  <p className="font-bold text-slate-800 mt-1">
                    {request.updatedAt
                      ? new Date(request.updatedAt).toLocaleString("vi-VN")
                      : "Not updated"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h4 className="font-black text-slate-800">
                Product list for return
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
                        Quantity paid: {item.quantity}
                      </span>
                      {!!item.orderQuantity && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                          Purchased: {item.orderQuantity}
                        </span>
                      )}
                      {!!item.price && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                          Price: {currency(item.price)}
                        </span>
                      )}
                      {!!item.totalPrice && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                          Total: {currency(item.totalPrice)}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700">
                        Item #{item.orderItemId}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700">
                        Request: {currency(getItemFinalAmount(item))}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-green-50 text-green-700">
                        Refunded: {currency(item.refundedAmount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-sm text-slate-400">
                  No items attached.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h4 className="font-black text-slate-800">
               Image / Video Attachments
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
                        {attachment.description || "No description available"}
                      </p>
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        <Eye size={12} /> View original file
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">
                  No attachments available.
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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [shopFilter, setShopFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<ReturnRequestAdmin | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await getAdminReturnRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch return requests:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "ALL" || request.status === statusFilter;
      if (!matchesStatus) return false;
      if (shopFilter && String(request.shopId) !== shopFilter.trim())
        return false;
      if (
        customerFilter &&
        String(request.customerId) !== customerFilter.trim()
      )
        return false;

      const createdDate = request.createdAt
        ? request.createdAt.slice(0, 10)
        : "";
      if (startDate && createdDate < startDate) return false;
      if (endDate && createdDate > endDate) return false;

      if (!keyword) return true;

      return [
        formatRequestCode(request.id),
        getOrderLabel(request),
        getShipmentLabel(request),
        getCustomerLabel(request),
        getShopLabel(request),
        String(request.orderId),
        String(request.shopId),
        String(request.customerId),
        String(request.orderShipmentId || ""),
        request.customerEmail || "",
        request.customerPhone || "",
        request.carrierName || "",
        request.shippingStatus || "",
        request.reason || "",
        request.status,
        ...(request.items || []).flatMap((item) => [
          getItemLabel(item),
          item.variantName || "",
          String(item.orderItemId),
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [
    requests,
    search,
    statusFilter,
    shopFilter,
    customerFilter,
    startDate,
    endDate,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE),
  );
  const paginatedRequests = useMemo(() => {
    const firstRequestIndex = (currentPage - 1) * REQUESTS_PER_PAGE;
    return filteredRequests.slice(
      firstRequestIndex,
      firstRequestIndex + REQUESTS_PER_PAGE,
    );
  }, [currentPage, filteredRequests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, shopFilter, customerFilter, startDate, endDate]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
      toast.success(
        `Status has been updated to ${STATUS_CONFIG[nextStatus]?.label || nextStatus}`,
      );
    } catch (error) {
      console.error("Failed to update return request status:", error);
      toast.error("Failed to update return request status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((item) => item.status === "PENDING_APPROVAL")
      .length,
    refunded: requests.filter((item) => item.status === "REFUNDED").length,
    amount: requests.reduce(
      (sum, item) => sum + getRequestFinalAmount(item),
      0,
    ),
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
          { label: "Order Management", path: "/admin/orders" },
          { label: "Return Requests" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Return Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Displaying item return requests, returned products, and attached files.
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Requests"
          value={stats.total}
          icon={<Package size={20} className="text-blue-600" />}
          color="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Pending Approval"
          value={stats.pending}
          icon={<Clock3 size={20} className="text-amber-600" />}
          color="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          label="Refunded"
          value={stats.refunded}
          icon={<Wallet size={20} className="text-emerald-600" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Total Request Amount"
          value={currency(stats.amount)}
          icon={<Banknote size={20} className="text-violet-600" />}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-800">
              Return Requests
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Displaying {filteredRequests.length} / {requests.length} requests
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
                placeholder="Search by request ID, order ID, customer, reason..."
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
                      ? "All Statuses"
                      : STATUS_CONFIG[status]?.label || status}
                  </option>
                ))}
              </select>
              <input
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                placeholder="Filter Shop ID"
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none w-full md:w-36"
              />
              <input
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="Filter Customer ID"
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
                onClick={loadRequests}
                className="px-4 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 border-0 flex items-center gap-2 justify-center"
              >
                <RefreshCcw size={16} /> Refresh
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
              actionLabel="Reload"
              onAction={loadRequests}
            />
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            title="No return requests found"
            description="Try adjusting the filters or search terms to see other data."
            actionLabel="Clear Filters"
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
              {paginatedRequests.map((request) => {
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
                            {request.items?.length || 0} products •{" "}
                            {request.attachments?.length || 0} files •{" "}
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
                          Customer / Shop
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
                          Requested Amount
                        </p>
                        <p className="font-black text-slate-800 mt-1">
                          {currency(getRequestFinalAmount(request))}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Reason
                      </p>
                      <p className="text-sm text-slate-700">
                        {request.reason || "No description available"}
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
                          Browse
                        </button>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border-0"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-hidden">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[8%]" />
                  <col className="w-[15%]" />
                  <col className="w-[16%]" />
                  <col className="w-[10%]" />
                  <col className="w-[17%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[13%]" />
                </colgroup>
                <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                     Request
                    </th>
                    <th className="text-left px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                      Order
                    </th>
                    <th className="text-left px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                      Customer / Shop
                    </th>
                    <th className="text-left px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                      Reason
                    </th>
                    <th className="text-center px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                      Products / Files
                    </th>
                    <th className="text-right px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                      Requested Amount
                    </th>
                    <th className="text-center px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                     Status
                    </th>
                    <th className="text-right px-3 py-4 text-[10px] font-black uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRequests.map((request) => {
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
                        <td className="px-3 py-4">
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
                        <td className="px-3 py-4">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-800">
                              {getOrderLabel(request)}
                            </p>
                            <p className="truncate text-xs text-slate-500 mt-1">
                              {getShipmentLabel(request)}
                            </p>
                            {request.carrierName && (
                              <p className="truncate text-[11px] text-slate-400 mt-1">
                                {request.carrierName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-800">
                              {getCustomerLabel(request)}
                            </p>
                            <p className="truncate text-xs text-slate-500 mt-1">
                              {getShopLabel(request)}
                            </p>
                            {request.customerEmail && (
                              <p className="truncate text-[11px] text-slate-400 mt-1">
                                {request.customerEmail}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {request.reason || "No description available"}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="flex min-w-0 flex-col items-center gap-1 text-xs font-bold">
                            <p className="w-full truncate text-slate-700">
                              {getPrimaryItemLabel(request)}
                            </p>
                            <div className="flex flex-wrap justify-center gap-1">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                {request.items?.length || 0} products
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                                {request.attachments?.length || 0} files
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <div>
                            <p className="font-black text-slate-800">
                              {currency(getRequestFinalAmount(request))}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Refunded: {currency(request.refundedAmount)}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span
                            className={`inline-flex max-w-full items-center justify-center gap-1 px-2.5 py-1 text-center text-[10px] font-bold leading-4 rounded-lg ${statusConfig.bgColor} ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
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
                              Approve
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
                              Reject
                            </button>
                            <button
                              onClick={() =>
                                handleStatusAction(request, "REFUNDED")
                              }
                              disabled={
                                actionLoadingId === request.id ||
                                request.status === "REFUNDED"
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 border-0 disabled:opacity-50"
                            >
                              Refund
                            </button>
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 border-0"
                            >
                              <Eye size={14} /> Details
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
              totalPages={totalPages}
              totalItems={filteredRequests.length}
              itemsPerPage={REQUESTS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
