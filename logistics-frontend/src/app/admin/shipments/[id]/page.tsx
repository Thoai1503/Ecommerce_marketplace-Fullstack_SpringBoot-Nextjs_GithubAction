"use client";

import { useParams, useRouter } from "next/navigation";
import { ShipmentStatus } from "@/lib/api";
import {
  useShipmentDetail,
  useShipmentTimeline,
  useUpdateShipmentStatus,
} from "@/lib/hooks";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

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

const statusOptions: ShipmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
];

function statusBadge(status: ShipmentStatus) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const palettes: Record<ShipmentStatus, string> = {
    PENDING: "bg-yellow-50 text-yellow-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PICKED_UP: "bg-sky-50 text-sky-700",
    IN_TRANSIT: "bg-indigo-50 text-indigo-700",
    OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
    DELIVERED: "bg-green-50 text-green-700",
    FAILED: "bg-red-50 text-red-700",
    RETURNED: "bg-rose-50 text-rose-700",
  };
  return (
    <span className={`${base} ${palettes[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = Number(params.id);

  const {
    data: shipment,
    isFetching: isLoading,
    isError,
  } = useShipmentDetail(shipmentId);
  const { data: timeline, isFetching: isTimelineFetching } =
    useShipmentTimeline(shipmentId);
  const updateStatus = useUpdateShipmentStatus();
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus | null>(
    null,
  );

  const onUpdateStatus = (status: ShipmentStatus) => {
    if (!shipment) return;
    updateStatus.mutate(
      { orderShipmentRefId: shipment.orderShipmentRefId, status },
      {
        onSuccess: () => {
          setSelectedStatus(null);
        },
        onError: (error) => {
          alert(`Cập nhật trạng thái thất bại: ${String(error)}`);
        },
      },
    );
  };

  if (isError) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Không thể tải thông tin vận đơn. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  if (isLoading || !shipment) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>
        <div className="text-center py-10">
          <p className="text-sm text-zinc-500">Đang tải thông tin vận đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 text-zinc-600 hover:text-zinc-900"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Chi tiết vận đơn
          </h1>
          <p className="text-sm text-zinc-600">
            Mã vận đơn: <strong>{shipment.trackingCode}</strong>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Thông tin cơ bản */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Thông tin cơ bản
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-zinc-600">
                  Trạng thái hiện tại
                </div>
                <div className="mt-1">{statusBadge(shipment.status)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-600">
                  Order Ref ID
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {shipment.orderShipmentRefId}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-600">Shop ID</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {shipment.shopRefId}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-600">
                  Partner ID
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {shipment.partnerId}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-600">
                  Ngày tạo
                </div>
                <div className="mt-1 text-sm text-zinc-700">
                  {new Date(shipment.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-600">
                  Cập nhật lần cuối
                </div>
                <div className="mt-1 text-sm text-zinc-700">
                  {new Date(shipment.updatedAt).toLocaleString("vi-VN")}
                </div>
              </div>
              {shipment.estimatedDeliveryAt && (
                <div>
                  <div className="text-sm font-medium text-zinc-600">
                    Dự kiến giao
                  </div>
                  <div className="mt-1 text-sm text-zinc-700">
                    {new Date(shipment.estimatedDeliveryAt).toLocaleString(
                      "vi-VN",
                    )}
                  </div>
                </div>
              )}
              {shipment.deliveredAt && (
                <div>
                  <div className="text-sm font-medium text-zinc-600">
                    Đã giao lúc
                  </div>
                  <div className="mt-1 text-sm text-zinc-700">
                    {new Date(shipment.deliveredAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Thông tin người nhận */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Thông tin người nhận
            </h2>
            {shipment.recipient ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-zinc-600">
                    Tên người nhận
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    {shipment.recipient.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-600">
                    Số điện thoại
                  </div>
                  <div className="mt-1 text-sm text-zinc-700">
                    {shipment.recipient.phone}
                  </div>
                </div>
                {shipment.recipient.email && (
                  <div>
                    <div className="text-sm font-medium text-zinc-600">
                      Email
                    </div>
                    <div className="mt-1 text-sm text-zinc-700">
                      {shipment.recipient.email}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-zinc-600">
                    Địa chỉ
                  </div>
                  <div className="mt-1 text-sm text-zinc-700">
                    {shipment.recipient.address}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Không có thông tin người nhận
              </p>
            )}
          </section>

          {/* Thông tin sản phẩm */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Sản phẩm trong kiện hàng
            </h2>
            {shipment.items && shipment.items.length > 0 ? (
              <div className="space-y-3">
                {shipment.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-zinc-900">
                          {item.productName}
                        </div>
                        {item.sku && (
                          <div className="mt-1 text-xs text-zinc-600">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-zinc-900">
                          SL: {item.quantity}
                        </div>
                        {item.price !== undefined && (
                          <div className="mt-1 text-sm text-zinc-600">
                            đ{item.price.toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Không có sản phẩm trong kiên hàng
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Status Management & Timeline */}
        <div className="space-y-6">
          {/* Cập nhật trạng thái */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Cập nhật trạng thái
            </h2>
            <div className="space-y-2">
              <select
                value={selectedStatus || shipment.status}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as ShipmentStatus)
                }
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (selectedStatus && selectedStatus !== shipment.status) {
                    onUpdateStatus(selectedStatus);
                  }
                }}
                disabled={
                  !selectedStatus ||
                  selectedStatus === shipment.status ||
                  updateStatus.isPending
                }
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-zinc-800"
              >
                {updateStatus.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </section>

          {/* Lịch sử thay đổi trạng thái */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Lịch sử thay đổi trạng thái
            </h2>
            {isTimelineFetching ? (
              <p className="text-sm text-zinc-500">Đang tải lịch sử...</p>
            ) : timeline && timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    {index < timeline.length - 1 && (
                      <div className="absolute left-2 top-7 w-px bg-zinc-200 h-12" />
                    )}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white text-xs">
                          ✓
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-semibold text-zinc-900">
                          {statusLabels[entry.status]}
                        </div>
                        {entry.description && (
                          <div className="mt-1 text-xs text-zinc-600">
                            {entry.description}
                          </div>
                        )}
                        {entry.location && (
                          <div className="mt-1 text-xs text-zinc-500">
                            📍 {entry.location}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-zinc-500">
                          {new Date(entry.updatedAt).toLocaleString("vi-VN")}
                        </div>
                        {entry.updatedBy && (
                          <div className="mt-1 text-xs text-zinc-500">
                            Cập nhật bởi: {entry.updatedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Chưa có lịch sử thay đổi trạng thái
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
