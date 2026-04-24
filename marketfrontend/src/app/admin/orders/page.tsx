"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/admin/useOrders";
import { useOrderFilters } from "@/hooks/admin/useOrderFilters";
import { getOrdersWithFilters } from "@/service/orders";
import { useToast } from "@/context/ToastContext";
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pencil,
  CheckSquare,
  Truck,
  Clock,
  Ban,
  MapPin,
  Check,
  FileText,
  Filter,
  History,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { OrderStatus, PaymentStatus } from "@/types";
import { updateOrderStatus } from "@/service/orders";
import { OrderTableSkeleton, Skeleton } from "@/components/ui/Skeleton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ConfirmationModal, {
  ModalVariant,
} from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { Suspense } from "react";

const ITEMS_PER_PAGE = 10;

const StatusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  PENDING: {
    label: "Pending",
    color: "text-[#ffc107]",
    bgColor: "bg-[#ffc107]/10",
    icon: <AlertTriangle size={12} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-[#2b8cee]",
    bgColor: "bg-[#2b8cee]/10",
    icon: <CheckCircle2 size={12} />,
  },
  PROCESSING: {
    label: "Processing",
    color: "text-[#fd7e14]",
    bgColor: "bg-[#fd7e14]/10",
    icon: <Pencil size={12} />,
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-[#6f42c1]",
    bgColor: "bg-[#6f42c1]/10",
    icon: <Truck size={12} />,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-[#28a745]",
    bgColor: "bg-[#28a745]/10",
    icon: <CheckCircle2 size={12} />,
  },
  CANCELED: {
    label: "Canceled",
    color: "text-[#dc3545]",
    bgColor: "bg-[#dc3545]/10",
    icon: <XCircle size={12} />,
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-[#6c757d]",
    bgColor: "bg-[#6c757d]/10",
    icon: <XCircle size={12} />,
  },
};

const PaymentConfig: Record<
  PaymentStatus,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  PAID: {
    label: "Paid",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <Check size={12} />,
  },
  UNPAID: {
    label: "Unpaid",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: <Clock size={12} />,
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    icon: <History size={12} />,
  },
};

function OrdersPageContent() {
  const router = useRouter();
  const toast = useToast();
  const {
    filters,
    updateFilter,
    updatePage,
    clearFilters: clearAllFilters,
    getApiParams,
    isHydrated,
  } = useOrderFilters();

  // Fetch orders with current filters
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
  });

  // Fetch orders whenever filters change
  useEffect(() => {
    if (!isHydrated) return; // Wait for URL hydration

    const fetchOrders = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const apiParams = getApiParams();
        const result = await getOrdersWithFilters(apiParams);
        setOrders(result.orders || []);
        setPagination({
          totalPages: result.totalPages || 1,
          totalRecords: result.totalRecords || 0,
        });
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [filters, isHydrated, getApiParams]);

  const refetch = () => {
    if (isHydrated) {
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          const apiParams = getApiParams();
          const result = await getOrdersWithFilters(apiParams);
          setOrders(result.orders || []);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  };

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: ModalVariant;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
    confirmLabel: "Confirm",
    onConfirm: () => {},
  });

  // Calculate Pending Stats for Banner
  const pendingOrders = useMemo(
    () => orders.filter((o: any) => o.status === "PENDING"),
    [orders],
  );
  const pendingCount = pendingOrders.length;
  const pendingTotal = useMemo(
    () => pendingOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0),
    [pendingOrders],
  );

  const stats = useMemo(() => {
    const s: Record<string, number> = { ALL: orders.length };
    Object.keys(StatusConfig).forEach((status) => {
      s[status] = orders.filter((o: any) => o.status === status).length;
    });
    return s;
  }, [orders]);

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length && orders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o: any) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const openConfirmation = (
    title: string,
    description: string,
    onConfirm: () => void,
    variant: ModalVariant = "info",
    confirmLabel = "Xác nhận",
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant,
      confirmLabel,
    });
  };

  const handleBulkApproveClick = () => {
    openConfirmation(
      "Duyệt đơn hàng hàng loạt?",
      `Bạn có chắc chắn muốn duyệt ${selectedOrders.length} đơn hàng đã chọn?`,
      async () => {
        await new Promise((r) => setTimeout(r, 500));
        toast.success(
          `Đã phê duyệt thành công ${selectedOrders.length} đơn hàng!`,
        );
        setSelectedOrders([]);
        refetch();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
      "success",
      "Duyệt ngay",
    );
  };

  const handleStatusUpdateClick = (id: string, status: OrderStatus) => {
    const isCancel = status === "CANCELED";
    openConfirmation(
      isCancel ? "Hủy đơn hàng?" : "Cập nhật trạng thái?",
      isCancel
        ? "Hành động này không thể hoàn tác. Bạn có chắc chắn?"
        : `Chuyển trạng thái đơn hàng sang ${status}?`,
      async () => {
        const success = await updateOrderStatus(id, status);
        if (success) {
          toast.success(`Cập nhật trạng thái thành công: ${status}`);
          refetch();
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
      isCancel ? "danger" : "info",
      isCancel ? "Hủy đơn" : "Cập nhật",
    );
  };

  const handlePaymentStatusFilterClick = (status: string) => {
    updateFilter("paymentStatus", status as any);
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    updateFilter("sortBy", sortBy as any);
    updateFilter("sortOrder", sortOrder as any);
  };

  const clearFilters = () => {
    clearAllFilters();
  };

  return (
    <div className="p-4 lg:p-8 animate-in fade-in duration-500 space-y-6 no-print">
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
      />

      <Breadcrumbs items={[{ label: "Orders" }]} />

      {/* --- URGENT PENDING BANNER --- */}
      {pendingCount > 0 && (
        <div
          onClick={() => updateFilter("status", "PENDING")}
          className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-[24px] p-6 shadow-xl shadow-orange-500/20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ShoppingBag size={120} />
          </div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0 border border-white/10">
              <AlertTriangle size={28} className="animate-pulse text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white border border-white/10">
                  Cần xử lý gấp
                </span>
              </div>
              <h4 className="font-bold text-2xl mb-1">
                Có {pendingCount} đơn hàng chờ xử lý
              </h4>
              <p className="text-sm font-medium text-white/90">
                Tổng giá trị cần duyệt:{" "}
                <span className="font-black text-white text-lg">
                  {pendingTotal.toLocaleString()}₫
                </span>
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <button className="px-6 py-3 bg-white text-orange-600 text-sm font-bold rounded-xl hover:bg-orange-50 transition-all shadow-sm border-0 whitespace-nowrap flex items-center gap-2">
              Duyệt đơn hàng ngay <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-2 no-scrollbar">
        {(
          [
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "COMPLETED",
            "CANCELED",
            "REFUNDED",
          ] as OrderStatus[]
        ).map((status) => (
          <button
            key={status}
            onClick={() => updateFilter("status", status)}
            className={`flex flex-col p-3 lg:p-4 rounded-2xl border transition-all text-left group shadow-sm min-w-[120px] ${filters.status === status ? "bg-blue-600 border-blue-600 text-white shadow-blue-200 shadow-lg" : "bg-white border-slate-100 hover:border-blue-200"}`}
          >
            <p
              className={`text-[10px] font-black uppercase tracking-widest mb-2 ${filters.status === status ? "text-blue-100" : "text-slate-400"}`}
            >
              {StatusConfig[status].label}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <h4 className="text-lg lg:text-xl font-black">
                {isLoading ? <Skeleton className="h-6 w-8" /> : stats[status]}
              </h4>
              <div
                className={`p-1.5 rounded-lg ${filters.status === status ? "bg-white/20" : "bg-slate-50"}`}
              >
                {React.cloneElement(StatusConfig[status].icon, {
                  size: 14,
                  className: filters.status === status ? "text-white" : "",
                })}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 2. Main Content */}
      <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Header Toolbar */}
        <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-slate-800">
                🛒 Order Management
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Hiển thị {orders.length} đơn hàng
              </p>
            </div>

            {selectedOrders.length > 0 ? (
              <div className="flex items-center gap-2 animate-in zoom-in duration-200">
                <button
                  onClick={handleBulkApproveClick}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg border-0"
                >
                  <Check size={16} /> Duyệt ({selectedOrders.length})
                </button>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all border-0"
                  aria-label="Clear selection"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-lg border-0 self-start md:self-auto">
                <Download size={16} /> Export
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Tìm mã đơn, tên khách hàng..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm font-medium"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                  className="pl-3 pr-2 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 h-full"
                />
              </div>
              <span className="self-center text-slate-400">-</span>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                  className="pl-3 pr-2 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 h-full"
                />
              </div>

              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  updateFilter("paymentStatus", e.target.value as any)
                }
                className="pl-3 pr-2 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="all">Tất cả thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="REFUNDED">Hoàn tiền</option>
              </select>

              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  handleSortChange(sortBy, sortOrder);
                }}
                className="pl-3 pr-2 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="date-desc">Ngày mới nhất</option>
                <option value="date-asc">Ngày cũ nhất</option>
                <option value="amount-desc">Giá cao nhất</option>
                <option value="amount-asc">Giá thấp nhất</option>
                <option value="status-asc">Trạng thái A-Z</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => updateFilter("minAmount", e.target.value)}
                placeholder="Min"
                className="px-3 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => updateFilter("maxAmount", e.target.value)}
                placeholder="Max"
                className="px-3 py-2.5 bg-slate-50 border-0 rounded-xl text-sm font-bold text-slate-600 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>

        {/* 3. Responsive Content */}

        {/* Loading State */}
        {isLoading ? (
          <div className="p-4">
            <OrderTableSkeleton />
          </div>
        ) : isError ? (
          <div className="p-20">
            <ErrorState
              type="error"
              actionLabel="Thử lại"
              onAction={() => refetch()}
            />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="Không tìm thấy đơn hàng"
            description="Thử thay đổi bộ lọc, từ khóa hoặc kiểm tra khoảng thời gian."
            actionLabel="Xóa bộ lọc"
            onAction={() => clearFilters()}
            type="search"
          />
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {orders.map((order: any) => (
                <div
                  key={order.id}
                  className="p-4 bg-white hover:bg-slate-50 transition-colors"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-700">
                        {order.orderCode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        •{" "}
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${StatusConfig[order.status as OrderStatus].bgColor} ${StatusConfig[order.status as OrderStatus].color}`}
                    >
                      {StatusConfig[order.status as OrderStatus].icon}
                      {StatusConfig[order.status as OrderStatus].label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0">
                      {order.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin size={10} /> {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Tổng tiền
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        {order.totalAmount.toLocaleString()}₫
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === "PENDING" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdateClick(order.id, "CONFIRMED");
                          }}
                          className="p-2 bg-green-50 text-green-600 rounded-lg"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/orders/${order.id}`);
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto flex-1">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                    <th className="px-4 py-4 w-12 text-center">
                      <div
                        onClick={toggleSelectAll}
                        className={`w-5 h-5 mx-auto rounded-md flex items-center justify-center cursor-pointer transition-all ${selectedOrders.length === orders.length ? "bg-blue-600 text-white" : "bg-white border-2 border-slate-300"}`}
                      >
                        {selectedOrders.length === orders.length && (
                          <CheckSquare size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Mã đơn hàng
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Khách hàng
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Thanh toán
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Trạng thái
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order: any) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-all group ${selectedOrders.includes(order.id) ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <div
                          onClick={() => toggleSelectOrder(order.id)}
                          className={`w-5 h-5 mx-auto rounded-md flex items-center justify-center cursor-pointer transition-all ${selectedOrders.includes(order.id) ? "bg-blue-600 text-white" : "bg-white border-2 border-slate-200"}`}
                        >
                          {selectedOrders.includes(order.id) && (
                            <CheckSquare size={14} />
                          )}
                        </div>
                      </td>
                      <td
                        className="px-4 py-4 font-black text-slate-800 text-sm hover:text-blue-600 cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        {order.orderCode}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                            {order.customerName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800 text-sm truncate max-w-[150px]">
                            {order.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-slate-900 text-sm">
                        {order.totalAmount.toLocaleString()}₫
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${PaymentConfig[order.paymentStatus as PaymentStatus].bgColor} ${PaymentConfig[order.paymentStatus as PaymentStatus].color}`}
                        >
                          {
                            PaymentConfig[order.paymentStatus as PaymentStatus]
                              .icon
                          }{" "}
                          {
                            PaymentConfig[order.paymentStatus as PaymentStatus]
                              .label
                          }
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${StatusConfig[order.status as OrderStatus].bgColor} ${StatusConfig[order.status as OrderStatus].color}`}
                        >
                          {StatusConfig[order.status as OrderStatus].label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push(`/admin/orders/${order.id}`)
                            }
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                            title="Xem chi tiết"
                            aria-label="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {order.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdateClick(order.id, "CONFIRMED")
                                }
                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all border-0 bg-transparent"
                                title="Xác nhận đơn"
                                aria-label="Approve Order"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdateClick(order.id, "CANCELED")
                                }
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border-0 bg-transparent"
                                title="Hủy đơn"
                                aria-label="Cancel Order"
                              >
                                <Ban size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={filters.page}
              totalPages={pagination.totalPages}
              onPageChange={updatePage}
              totalItems={pagination.totalRecords}
              itemsPerPage={filters.pageSize}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <OrderTableSkeleton />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
