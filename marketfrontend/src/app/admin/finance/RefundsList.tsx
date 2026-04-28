"use client";

import { useMemo, useState } from "react";
import { useRefunds } from "@/hooks/admin/useFinance";
import { RefundStatus } from "@/types/index";

const STATUSES: RefundStatus[] = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
];
const currency = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

export default function RefundsList() {
  const [status, setStatus] = useState<RefundStatus>("REQUESTED");
  const [search, setSearch] = useState("");
  const { refunds, isLoading, updateStatus, isUpdatingStatus } =
    useRefunds(status);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return refunds;
    return refunds.filter(
      (item) =>
        item.refundCode.toLowerCase().includes(keyword) ||
        item.orderNumber.toLowerCase().includes(keyword),
    );
  }, [refunds, search]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Quản lý hoàn tiền
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dữ liệu theo endpoint /api/v1/refunds/status/{status}.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RefundStatus)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
        >
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm refundCode hoặc orderNumber"
          className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">Refund Code</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-center px-4 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Đang tải hoàn tiền...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Không có yêu cầu hoàn tiền.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.refundCode}
                    </td>
                    <td className="px-4 py-3">{item.orderNumber}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {currency(item.refundAmount)}
                    </td>
                    <td className="px-4 py-3">{item.refundType}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={item.status}
                        disabled={isUpdatingStatus}
                        onChange={(e) =>
                          updateStatus({
                            id: item.id,
                            payload: {
                              status: e.target.value as RefundStatus,
                              changedBy: "ADMIN",
                            },
                          })
                        }
                        className="px-2 py-1 rounded border border-slate-300 text-xs"
                      >
                        {STATUSES.map((candidate) => (
                          <option key={candidate} value={candidate}>
                            {candidate}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
