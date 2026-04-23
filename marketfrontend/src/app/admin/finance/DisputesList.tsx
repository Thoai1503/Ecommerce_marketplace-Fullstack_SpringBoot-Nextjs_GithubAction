"use client";

import { useMemo, useState } from "react";
import { useDisputes } from "@/hooks/admin/useFinance";
import { DisputeStatus } from "@/types/index";

const STATUSES: DisputeStatus[] = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED_BUYER",
  "RESOLVED_SELLER",
  "CLOSED",
];

const currency = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

export default function DisputesList() {
  const [status, setStatus] = useState<DisputeStatus>("OPEN");
  const [search, setSearch] = useState("");
  const { disputes, isLoading, resolve, isResolving } = useDisputes(status);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return disputes;
    return disputes.filter(
      (item) =>
        item.disputeCode.toLowerCase().includes(keyword) ||
        String(item.orderId).includes(keyword),
    );
  }, [disputes, search]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Quản lý tranh chấp
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dữ liệu theo endpoint /api/v1/disputes/status/{status}.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DisputeStatus)}
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
          placeholder="Tìm disputeCode hoặc orderId"
          className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">Dispute Code</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-center px-4 py-3">Resolve</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Đang tải tranh chấp...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Không có tranh chấp.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.disputeCode}
                    </td>
                    <td className="px-4 py-3">{item.orderId}</td>
                    <td className="px-4 py-3">{item.disputeType}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {currency(item.disputeAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          disabled={isResolving}
                          onClick={() =>
                            resolve({
                              id: item.id,
                              payload: {
                                resolution: "RESOLVED_BUYER",
                                resolvedBy: 1,
                              },
                            })
                          }
                          className="px-2 py-1 rounded border border-emerald-300 text-emerald-700 text-xs font-bold"
                        >
                          Buyer
                        </button>
                        <button
                          disabled={isResolving}
                          onClick={() =>
                            resolve({
                              id: item.id,
                              payload: {
                                resolution: "RESOLVED_SELLER",
                                resolvedBy: 1,
                              },
                            })
                          }
                          className="px-2 py-1 rounded border border-blue-300 text-blue-700 text-xs font-bold"
                        >
                          Seller
                        </button>
                        <button
                          disabled={isResolving}
                          onClick={() =>
                            resolve({
                              id: item.id,
                              payload: { resolution: "CLOSED", resolvedBy: 1 },
                            })
                          }
                          className="px-2 py-1 rounded border border-slate-300 text-slate-700 text-xs font-bold"
                        >
                          Close
                        </button>
                      </div>
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
