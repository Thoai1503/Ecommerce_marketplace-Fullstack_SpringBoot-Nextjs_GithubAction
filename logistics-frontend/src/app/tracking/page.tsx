"use client";

import { Timeline } from "@/components/Timeline";
import { ShipmentStatus } from "@/lib/api";
import { useShipmentTimeline, useTracking } from "@/lib/hooks";
import { useState } from "react";

const statusLabels: Record<ShipmentStatus, string> = {
  PENDING: "Đang chờ xử lý",
  CONFIRMED: "Đơn hàng đã xác nhận",
  PICKED_UP: "Đã lấy hàng",
  SHIPPING: "Đang vận chuyển",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  FAILED: "Thất bại",
  RETURNED: "Đã trả lại",
};

function statusBadge(status: ShipmentStatus) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const palettes: Record<ShipmentStatus, string> = {
    PENDING: "bg-yellow-50 text-yellow-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PICKED_UP: "bg-sky-50 text-sky-700",
    SHIPPING: "bg-indigo-50 text-indigo-700",
    DELIVERING: "bg-orange-50 text-orange-700",
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

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { data, isFetching, isError, error, refetch } =
    useTracking(trackingCode);
  const { data: timelineData, isFetching: isTimelineFetching } =
    useShipmentTimeline(data?.id);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Theo dõi vận đơn
        </h1>
        <p className="text-sm text-zinc-600">
          Nhập mã theo dõi để xem trạng thái giao hàng và tiến trình vận chuyển.
        </p>
      </header>

      <form
        className="flex flex-col gap-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          refetch();
        }}
      >
        <label className="sr-only" htmlFor="trackingCode">
          Mã theo dõi
        </label>
        <input
          id="trackingCode"
          value={trackingCode}
          onChange={(event) => setTrackingCode(event.target.value.trim())}
          placeholder="Nhập mã theo dõi"
          className="w-full rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        />
        <button
          type="submit"
          disabled={!trackingCode || isFetching}
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isFetching ? "Đang tải..." : "Tra cứu"}
        </button>
      </form>

      {submitted && !trackingCode ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          Vui lòng nhập mã theo dõi để tiếp tục.
        </div>
      ) : null}

      {submitted && isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Không thể tìm thấy vận đơn. Vui lòng kiểm tra lại mã theo dõi và thử
          lại.
          <div className="mt-2 text-xs text-zinc-500">{String(error)}</div>
        </div>
      ) : null}

      {data ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-500">
                Mã theo dõi
              </div>
              <div className="text-xl font-semibold text-zinc-900">
                {data.trackingCode}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-zinc-500">
                Trạng thái hiện tại
              </div>
              <div className="mt-1">{statusBadge(data.status)}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold text-zinc-700">
                Thông tin giao hàng
              </h2>
              <dl className="mt-3 space-y-2 text-sm text-zinc-600">
                <div>
                  <dt className="font-medium text-zinc-800">Order Ref</dt>
                  <dd>{data.orderShipmentRefId}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-800">Người nhận</dt>
                  <dd>{data.recipient?.name ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-800">Số điện thoại</dt>
                  <dd>{data.recipient?.phone ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-800">Địa chỉ</dt>
                  <dd>{data.recipient?.address ?? "N/A"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold text-zinc-700">
                Sản phẩm trong kiện hàng
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                {data.items && data.items.length > 0 ? (
                  data.items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-2"
                    >
                      <div className="font-medium text-zinc-800">
                        {item.productName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        SL: {item.quantity}
                        {item.price !== undefined
                          ? ` | Giá: ${item.price.toLocaleString("vi-VN")}`
                          : ""}
                      </div>
                    </li>
                  ))
                ) : (
                  <li>Không có dữ liệu sản phẩm</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold text-zinc-700">
                Tiến trình giao hàng
              </h2>
              <div className="mt-3">
                {isTimelineFetching ? (
                  <p className="text-sm text-zinc-500">Đang tải timeline...</p>
                ) : timelineData && timelineData.length > 0 ? (
                  <Timeline history={timelineData} />
                ) : (
                  <p className="text-sm text-zinc-500">
                    Không có lịch sử trạng thái
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
