"use client";

import { useEffect, useMemo, useState } from "react";
import { useShipmentList, useUpdateShipmentStatus } from "@/lib/hooks";
import { ShipmentStatus } from "@/lib/api";

const statusOptions: Array<{ label: string; value: ShipmentStatus | "" }> = [
  { label: "Tất cả", value: "" },
  { label: "Đang chờ xử lý", value: "PENDING" },
  { label: "Đơn hàng đã xác nhận", value: "CONFIRMED" },
  { label: "Đã lấy hàng", value: "PICKED_UP" },
  { label: "Đang vận chuyển", value: "SHIPPING" },
  { label: "Đang giao hàng", value: "DELIVERING" },
  { label: "Đã giao hàng", value: "DELIVERED" },
  { label: "Thất bại", value: "FAILED" },
  { label: "Đã trả lại", value: "RETURNED" },
];

const statusLabel: Record<ShipmentStatus, string> = {
  PENDING: "Đang chờ xử lý",
  CONFIRMED: "Đơn hàng đã xác nhận",
  PICKED_UP: "Đã lấy hàng",
  SHIPPING: "Đang vận chuyển",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  FAILED: "Thất bại",
  RETURNED: "Đã trả lại",
};

export default function AdminPage() {
  const [trackingSearch, setTrackingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "">("");
  const [shopFilter, setShopFilter] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data, isFetching, refetch } = useShipmentList({
    trackingCode: trackingSearch || undefined,
    status: statusFilter || undefined,
    shopRefId:
      shopFilter && !Number.isNaN(Number(shopFilter))
        ? Number(shopFilter)
        : undefined,
    page,
    size,
  });

  useEffect(() => {
    setPage(0);
  }, [trackingSearch, statusFilter, shopFilter]);

  const updateStatus = useUpdateShipmentStatus();

  const shipments = data?.content ?? [];

  const onUpdateStatus = (
    orderShipmentRefId: number,
    status: ShipmentStatus,
  ) => {
    updateStatus.mutate(
      { orderShipmentRefId, status },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const hasFilter = useMemo(
    () => Boolean(trackingSearch || statusFilter || shopFilter),
    [trackingSearch, statusFilter, shopFilter],
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Dashboard Logistics
        </h1>
        <p className="text-sm text-zinc-600">
          Quản lý danh sách vận đơn, tìm kiếm theo mã và cập nhật trạng thái.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-700">Mã theo dõi</span>
            <input
              value={trackingSearch}
              onChange={(event) => setTrackingSearch(event.target.value)}
              placeholder="Nhập mã theo dõi"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-700">Trạng thái</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ShipmentStatus | "")
              }
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-700">Shop ID</span>
            <input
              value={shopFilter}
              onChange={(event) => setShopFilter(event.target.value)}
              placeholder="Nhập Shop ID"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          Lọc
        </button>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Danh sách vận đơn
          </h2>
          {isFetching ? (
            <span className="text-sm text-zinc-500">Đang tải…</span>
          ) : hasFilter ? (
            <button
              type="button"
              onClick={() => {
                setTrackingSearch("");
                setStatusFilter("");
                setShopFilter("");
                refetch();
              }}
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              Xóa bộ lọc
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Mã theo dõi
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Shop ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Order Ref ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {shipments?.length ? (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-800">
                      {shipment.trackingCode}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {shipment.shopRefId}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {shipment.orderShipmentRefId}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {statusLabel[shipment.status]}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(shipment.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={shipment.status}
                        onChange={(event) =>
                          onUpdateStatus(
                            shipment.orderShipmentRefId,
                            event.target.value as ShipmentStatus,
                          )
                        }
                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                      >
                        {statusOptions
                          .filter((option) => option.value !== "")
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-zinc-500"
                  >
                    {isFetching
                      ? "Đang tải dữ liệu..."
                      : "Không có vận đơn phù hợp."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-zinc-600">
          Trang {data ? data.page + 1 : 1} / {data?.totalPages ?? 1} - Tổng{" "}
          {data?.totalElements ?? 0} vận đơn
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!data || data.first || isFetching}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!data || data.last || isFetching}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
