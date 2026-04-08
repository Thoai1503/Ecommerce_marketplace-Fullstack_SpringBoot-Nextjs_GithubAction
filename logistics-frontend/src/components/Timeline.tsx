"use client";

import { ShipmentStatus, ShipmentStatusHistory } from "@/lib/api";

const statusLabels: Record<ShipmentStatus, string> = {
  PENDING: "Đang chờ xử lý",
  CONFIRMED: "Đơn hàng đã xác nhận",
  PICKED_UP: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  OUT_FOR_DELIVERY: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  FAILED: "Thất bại",
  RETURNED: "Đã trả lại",
};

const statusColors: Record<ShipmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PICKED_UP: "bg-sky-100 text-sky-800 border-sky-200",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
  RETURNED: "bg-rose-100 text-rose-800 border-rose-200",
};

interface TimelineProps {
  history: ShipmentStatusHistory[];
}

export function Timeline({ history }: TimelineProps) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  );

  return (
    <div className="space-y-4">
      {sortedHistory.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                statusColors[item.status]
              }`}
            >
              <span className="text-xs font-semibold">{index + 1}</span>
            </div>
            {index < sortedHistory.length - 1 && (
              <div className="mt-2 h-8 w-px bg-zinc-200" />
            )}
          </div>
          <div className="flex-1 pb-8">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  statusColors[item.status]
                }`}
              >
                {statusLabels[item.status]}
              </span>
              <time className="text-xs text-zinc-500">
                {new Date(item.updatedAt).toLocaleString("vi-VN")}
              </time>
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-zinc-700">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
