"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Landmark,
  Package,
  Search,
  Smartphone,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import { OrderShipments } from "@/types/data/OrderShipment";
import { IOrderShipment } from "@/validators/orderShipment";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { OrderTableSkeleton } from "@/components/ui/Skeleton";

const ITEMS_PER_PAGE = 10;

const ShippingStatusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "text-[#ffc107]",
    bgColor: "bg-[#ffc107]/10",
    icon: <Clock size={12} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-[#2b8cee]",
    bgColor: "bg-[#2b8cee]/10",
    icon: <CheckCircle2 size={12} />,
  },
  PICKED_UP: {
    label: "Picked Up",
    color: "text-[#0ea5e9]",
    bgColor: "bg-[#0ea5e9]/10",
    icon: <Package size={12} />,
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "text-[#6366f1]",
    bgColor: "bg-[#6366f1]/10",
    icon: <Truck size={12} />,
  },
  OUT_FOR_DELIVERY: {
    label: "Out For Delivery",
    color: "text-[#8b5cf6]",
    bgColor: "bg-[#8b5cf6]/10",
    icon: <Truck size={12} />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-[#14b8a6]",
    bgColor: "bg-[#14b8a6]/10",
    icon: <CheckCircle2 size={12} />,
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
  CANCELLED: {
    label: "Canceled",
    color: "text-[#dc3545]",
    bgColor: "bg-[#dc3545]/10",
    icon: <XCircle size={12} />,
  },
};

const PaymentMethodConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  COD: {
    label: "COD",
    icon: <Truck size={11} />,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  VNPAY: {
    label: "VNPay",
    icon: <CreditCard size={11} />,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  MOMO: {
    label: "MoMo",
    icon: <Smartphone size={11} />,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
  },
  ZALOPAY: {
    label: "ZaloPay",
    icon: <Wallet size={11} />,
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
  },
  BANK_TRANSFER: {
    label: "Chuyen khoan",
    icon: <Landmark size={11} />,
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
};

const defaultPaymentMethodConfig = {
  label: "Khac",
  icon: <Landmark size={11} />,
  color: "text-slate-600",
  bgColor: "bg-slate-100",
};

const formatMoney = (value?: number | null) =>
  Number(value || 0).toLocaleString("vi-VN");

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

const normalizeStatus = (value?: string | null) => (value || "").toUpperCase();

const getShippingStatusConfig = (status?: string | null) => {
  const key = normalizeStatus(status);
  return (
    ShippingStatusConfig[key] || {
      label: key || "Unknown",
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      icon: <AlertTriangle size={12} />,
    }
  );
};

const getPaymentMethodConfig = (method?: string | null) => {
  if (!method) return defaultPaymentMethodConfig;
  const key = method.trim().toUpperCase().replace(/[\s-]/g, "_");
  return (
    PaymentMethodConfig[key] || { ...defaultPaymentMethodConfig, label: method }
  );
};

export default function AdminOrderShipmentPage() {
  OrderShipments.setup({ path: "/admin/order-shipment" });

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedShipmentIds, setExpandedShipmentIds] = useState<Set<number>>(
    new Set(),
  );

  const { data, isLoading, isError, refetch } = useQuery({
    ...OrderShipments.getAll({
      status: statusFilter,
      paymentStatus: paymentFilter,
      search: searchTerm.trim() || undefined,
      sortOrder: "desc",
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    }),
  });

  const shipments = (data?.data || []) as IOrderShipment[];
  const totalRecords = data?.meta?.total || 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalRecords / (data?.meta?.perPage || ITEMS_PER_PAGE)),
  );
  const statusStats = useMemo(() => {
    const base: Record<string, number> = { ALL: totalRecords };
    for (const [key, value] of Object.entries(data?.statusStats || {})) {
      base[normalizeStatus(key)] = value;
    }
    return base;
  }, [data, totalRecords]);

  const toggleExpand = (shipmentId: number) => {
    setExpandedShipmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(shipmentId)) {
        next.delete(shipmentId);
      } else {
        next.add(shipmentId);
      }
      return next;
    });
  };

  const resetPageAndSet = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 lg:p-8 animate-in fade-in duration-500 space-y-6 no-print">
      <Breadcrumbs items={[{ label: "Order Shipments" }]} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-2 no-scrollbar">
        {[
          "ALL",
          "PENDING",
          "CONFIRMED",
          "PICKED_UP",
          "IN_TRANSIT",
          "OUT_FOR_DELIVERY",
          "COMPLETED",
        ].map((statusKey) => {
          const cfg = getShippingStatusConfig(statusKey);
          return (
            <button
              key={statusKey}
              onClick={() => resetPageAndSet(setStatusFilter, statusKey)}
              className={`flex flex-col p-3 lg:p-4 rounded-2xl border transition-all text-left group shadow-sm min-w-[120px] ${statusFilter === statusKey ? "bg-blue-600 border-blue-600 text-white shadow-blue-200 shadow-lg" : "bg-white border-slate-100 hover:border-blue-200"}`}
            >
              <span className="text-[11px] uppercase tracking-wider font-bold opacity-80">
                {statusKey === "ALL" ? "All" : cfg.label}
              </span>
              <span className="text-2xl font-black mt-1">
                {statusStats[statusKey] || 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[560px]">
        <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Danh sach tat ca order shipment
            </h2>
            <button
              onClick={() => refetch()}
              className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Reload
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tim theo ma don, tracking, nguoi nhan..."
                className="h-11 w-full pl-10 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) =>
                resetPageAndSet(setPaymentFilter, e.target.value)
              }
              className="h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="ALL">Tat ca payment status</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <OrderTableSkeleton />
          </div>
        ) : isError ? (
          <div className="p-20">
            <ErrorState
              type="error"
              actionLabel="Thu lai"
              onAction={() => refetch()}
            />
          </div>
        ) : shipments.length === 0 ? (
          <EmptyState
            title="Khong tim thay shipment"
            description="Thu doi bo loc hoac tu khoa tim kiem."
            actionLabel="Xoa bo loc"
            onAction={() => {
              setStatusFilter("ALL");
              setPaymentFilter("ALL");
              setSearchTerm("");
              setCurrentPage(1);
            }}
            type="search"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-wide">
                    <th className="text-left px-4 py-3 font-bold">Shipment</th>
                    <th className="text-left px-4 py-3 font-bold">Order</th>
                    <th className="text-left px-4 py-3 font-bold">Recipient</th>
                    <th className="text-left px-4 py-3 font-bold">Payment</th>
                    <th className="text-left px-4 py-3 font-bold">Status</th>
                    <th className="text-right px-4 py-3 font-bold">Total</th>
                    <th className="text-center px-4 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => {
                    const expanded = expandedShipmentIds.has(
                      shipment.shipmentId,
                    );
                    const displayShippingStatus =
                      shipment.shippingStatus ?? shipment.shipping_status;
                    const displayTotal =
                      shipment.totalAfterVoucher ??
                      shipment.total_after_voucher ??
                      shipment.total_after_discount ??
                      shipment.totalAmount ??
                      shipment.total_amount ??
                      shipment.order?.finalAmount ??
                      0;
                    const displayShippingFee =
                      shipment.shippingFee ?? shipment.shipping_fee ?? 0;
                    const statusCfg = getShippingStatusConfig(
                      displayShippingStatus,
                    );
                    const paymentMethodCfg = getPaymentMethodConfig(
                      shipment.order?.paymentMethod,
                    );

                    return (
                      <React.Fragment key={shipment.shipmentId}>
                        <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 align-top">
                            <button
                              onClick={() => toggleExpand(shipment.shipmentId)}
                              className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-700"
                            >
                              {expanded ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                              #{shipment.shipmentId}
                            </button>
                            <div className="text-xs text-slate-500 mt-1">
                              Tracking: {shipment.tracking_number || "-"}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Carrier: {shipment.carrier_name || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-slate-700">
                              #{shipment.orderId}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {shipment.order?.orderNumber || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-slate-700">
                              {shipment.recipient?.recipientName || "-"}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {shipment.recipient?.recipientPhone || "-"}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {[
                                shipment.recipient?.addressLine,
                                shipment.recipient?.ward,
                                shipment.recipient?.district,
                                shipment.recipient?.city,
                              ]
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${paymentMethodCfg.color} ${paymentMethodCfg.bgColor}`}
                            >
                              {paymentMethodCfg.icon}
                              {paymentMethodCfg.label}
                            </span>
                            <div className="text-xs text-slate-500 mt-1">
                              {shipment.order?.paymentStatus || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusCfg.color} ${statusCfg.bgColor}`}
                            >
                              {statusCfg.icon}
                              {statusCfg.label}
                            </span>
                            <div className="text-xs text-slate-500 mt-1">
                              {normalizeStatus(displayShippingStatus)}
                            </div>
                          </td>

                          <td className="px-4 py-3 align-top text-right">
                            <div className="font-black text-slate-800">
                              {formatMoney(displayTotal)} đ
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Ship fee: {formatMoney(displayShippingFee)} đ
                            </div>
                          </td>

                          <td className="px-4 py-3 align-top text-center">
                            <Link
                              href={`/admin/order-shipment/${shipment.shipmentId}`}
                              className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold"
                            >
                              Xem chi tiet
                            </Link>
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="bg-slate-50/40 border-t border-slate-100">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                  <p className="text-sm font-bold text-slate-700">
                                    Order items ({shipment.items.length})
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Order status:{" "}
                                    {shipment.order?.orderStatus || "-"}
                                  </p>
                                </div>

                                {shipment.items.length === 0 ? (
                                  <div className="p-4 text-sm text-slate-500">
                                    Khong co item.
                                  </div>
                                ) : (
                                  <div className="divide-y divide-slate-100">
                                    {shipment.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between"
                                      >
                                        <div className="flex items-start gap-3 min-w-0">
                                          {item.image ? (
                                            <img
                                              src={item.image}
                                              alt={item.productName}
                                              className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                                            />
                                          ) : (
                                            <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400">
                                              <Package size={18} />
                                            </div>
                                          )}

                                          <div className="min-w-0">
                                            <p className="font-semibold text-slate-800 truncate">
                                              {item.productName}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 truncate">
                                              Variant: {item.variantName || "-"}{" "}
                                              | Qty: {item.quantity}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="text-right text-sm">
                                          <p className="font-bold text-slate-700">
                                            {formatMoney(item.totalPrice)} đ
                                          </p>
                                          <p className="text-xs text-slate-500 mt-1">
                                            Unit: {formatMoney(item.price)} đ
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 lg:px-6 py-4 border-t border-slate-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalRecords}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </>
        )}
      </div>

      <div className="text-xs text-slate-400 px-1">
        Last refresh: {formatDateTime(new Date().toISOString())}
      </div>
    </div>
  );
}
