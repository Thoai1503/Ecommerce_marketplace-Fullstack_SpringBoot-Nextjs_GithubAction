"use client";

import React from "react";
import { Shipment, ShipmentStatus } from "../../../types/index";
import {
  Truck,
  Package,
  Check,
  Clock,
  AlertCircle,
  MapPin,
} from "lucide-react";

interface ShipmentCardProps {
  shipment: Shipment;
  onStatusUpdate?: (shipmentId: string) => void;
}

const ShipmentStatusConfig: Record<
  ShipmentStatus,
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  PENDING: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    icon: <Clock size={16} />,
    label: "Đang chờ xử lý",
  },
  CONFIRMED: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    icon: <Check size={16} />,
    label: "Đã xác nhận",
  },
  PICKED_UP: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    icon: <Package size={16} />,
    label: "Đã lấy hàng",
  },
  SHIPPING: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    icon: <Truck size={16} />,
    label: "Đang vận chuyển",
  },
  DELIVERING: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    icon: <Truck size={16} />,
    label: "Đang giao hàng",
  },
  DELIVERED: {
    bg: "bg-green-100",
    text: "text-green-600",
    icon: <Check size={16} />,
    label: "Đã giao hàng",
  },
  FAILED: {
    bg: "bg-red-100",
    text: "text-red-600",
    icon: <AlertCircle size={16} />,
    label: "Giao hàng thất bại",
  },
  RETURNED: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    icon: <MapPin size={16} />,
    label: "Đã trả lại",
  },
  COMPLETED: {
    bg: "bg-green-100",
    text: "text-green-600",
    icon: <Check size={16} />,
    label: "Đã hoàn thành",
  },
};

export default function ShipmentCard({
  shipment,
  onStatusUpdate,
}: ShipmentCardProps) {
  const statusConfig = ShipmentStatusConfig[shipment.shipping_status];
  const estimatedDate = shipment.estimated_delivery_at
    ? new Date(shipment.estimated_delivery_at).toLocaleDateString("vi-VN")
    : null;

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-black text-slate-800 mb-1">
            📦 {shipment.shopName}
          </h4>
          <p className="text-xs font-bold text-slate-400 tracking-wider">
            Mã vận đơn:{" "}
            <span className="text-blue-600">{shipment.tracking_number}</span>
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${statusConfig.bg}`}
        >
          {statusConfig.icon}
          <span
            className={`text-xs font-black uppercase tracking-wider ${statusConfig.text}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      {shipment.statusHistory && shipment.statusHistory.length > 0 && (
        <div className="mb-6 pb-6 border-b border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
            Lịch sử cập nhật:
          </p>
          <div className="space-y-2">
            {shipment.statusHistory.map((history, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">
                    {ShipmentStatusConfig[history.status].label}
                  </p>
                  {history.description && (
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {history.description}
                    </p>
                  )}
                  <p className="text-slate-400 text-[10px] mt-1">
                    {new Date(history.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipment Items */}
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
          Sản phẩm ({shipment.items.length} item
          {shipment.items.length > 1 ? "s" : ""}):
        </p>
        <div className="space-y-2">
          {shipment.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs bg-slate-50/50 p-3 rounded-xl"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-slate-400 text-[10px]">{item.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-600 font-bold">
                  ×{item.quantity}
                </span>
                <span className="text-slate-800 font-black">
                  {item.price.toLocaleString()}₫
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50/50 p-3 rounded-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Hãng vận chuyển
          </p>
          <p className="text-sm font-bold text-slate-800">
            {shipment.carrier_name || "N/A"}
          </p>
        </div>
        <div className="bg-slate-50/50 p-3 rounded-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Dự kiến giao
          </p>
          <p className="text-sm font-bold text-slate-800">
            {estimatedDate || "Chưa cập nhật"}
          </p>
        </div>
        {shipment.shipping_fee && (
          <div className="bg-slate-50/50 p-3 rounded-xl col-span-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Phí vận chuyển
            </p>
            <p className="text-sm font-black text-blue-600">
              {shipment.shipping_fee.toLocaleString()}₫
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {onStatusUpdate && (
        <button
          onClick={() => onStatusUpdate(shipment.id.toString())}
          className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          Cập nhật trạng thái
        </button>
      )}
    </div>
  );
}
