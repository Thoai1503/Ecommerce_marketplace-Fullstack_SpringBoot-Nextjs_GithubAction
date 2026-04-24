"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarRange, Search, Wallet } from "lucide-react";
import { useRevenueSnapshots } from "@/hooks/admin/useFinance";
import { PaymentTxnType } from "@/types/index";

const TXN_TYPES: Array<PaymentTxnType | ""> = [
  "",
  "ORDER_PAYMENT",
  "WALLET_TOPUP",
  "WALLET_WITHDRAW",
  "SETTLEMENT_PAYOUT",
  "REFUND_PAYOUT",
  "PLATFORM_FEE",
  "ADJUSTMENT",
];

const currency = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", { hour12: false });
};

const toStartOfDay = (value: string) =>
  value ? new Date(`${value}T00:00:00`).toISOString() : undefined;

const toEndOfDay = (value: string) =>
  value ? new Date(`${value}T23:59:59`).toISOString() : undefined;

export default function FinanceRevenueSnapshotsPage() {
  const [txnType, setTxnType] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const filters = useMemo(
    () => ({
      txnType: txnType || undefined,
      fromTime: toStartOfDay(fromDate),
      toTime: toEndOfDay(toDate),
    }),
    [fromDate, toDate, txnType],
  );

  const { snapshots, summary, isLoading } = useRevenueSnapshots(filters);

  const filteredSnapshots = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return snapshots;

    return snapshots.filter((snapshot) =>
      [
        snapshot.txnCode,
        snapshot.txnType,
        snapshot.orderNumber,
        String(snapshot.transactionId),
        String(snapshot.orderId || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [search, snapshots]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Revenue Snapshot Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi từng dòng snapshot doanh thu đã được ghi nhận từ
          payment_revenue_snapshot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Số snapshot"
          value={summary?.successCount?.toLocaleString("vi-VN") || "0"}
          icon={<BarChart3 className="text-blue-600" size={20} />}
        />
        <StatCard
          title="Gross"
          value={currency(summary?.grossAmount || 0)}
          icon={<Wallet className="text-emerald-600" size={20} />}
        />
        <StatCard
          title="Fee"
          value={currency(summary?.feeAmount || 0)}
          icon={<Wallet className="text-rose-600" size={20} />}
        />
        <StatCard
          title="Net"
          value={currency(summary?.netAmount || 0)}
          icon={<CalendarRange className="text-amber-600" size={20} />}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <select
          value={txnType}
          onChange={(e) => setTxnType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
        >
          {TXN_TYPES.map((type) => (
            <option key={type || "ALL"} value={type}>
              {type || "ALL_TYPES"}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />

        <div className="xl:col-span-2 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm txnCode, orderNumber, transactionId"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600 flex items-center justify-between gap-3">
          <span>
            Kỳ lọc:{" "}
            <span className="font-bold">
              {formatDateTime(summary?.fromTime)}
            </span>
            {" -> "}
            <span className="font-bold">{formatDateTime(summary?.toTime)}</span>
          </span>
          <span>
            Ghi nhận mới nhất:{" "}
            <span className="font-bold">
              {formatDateTime(summary?.latestRecognizedAt)}
            </span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">Recognized At</th>
                <th className="text-left px-4 py-3">Txn Code</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-right px-4 py-3">Gross</th>
                <th className="text-right px-4 py-3">Discount</th>
                <th className="text-right px-4 py-3">Fee</th>
                <th className="text-right px-4 py-3">Net</th>
                <th className="text-right px-4 py-3">Cum. Count</th>
                <th className="text-right px-4 py-3">Cum. Net</th>
                <th className="text-center px-4 py-3">Txn Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={12}>
                    Đang tải revenue snapshots...
                  </td>
                </tr>
              ) : filteredSnapshots.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={12}>
                    Không có snapshot phù hợp.
                  </td>
                </tr>
              ) : (
                filteredSnapshots.map((snapshot) => (
                  <tr
                    key={snapshot.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(snapshot.recognizedAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {snapshot.txnCode}
                    </td>
                    <td className="px-4 py-3">{snapshot.txnType}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">
                        {snapshot.orderNumber || "-"}
                      </div>
                      <div className="text-xs text-slate-400">
                        Txn #{snapshot.transactionId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {snapshot.paymentMethod || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currency(snapshot.grossAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-700">
                      {currency(snapshot.discountAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-rose-600">
                      {currency(snapshot.feeAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">
                      {currency(snapshot.netAmount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {snapshot.cumulativeSuccessCount.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {currency(snapshot.cumulativeNetAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                        {snapshot.transactionStatus || "UNKNOWN"}
                      </span>
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

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
          {title}
        </p>
        {icon}
      </div>
      <p className="text-xl font-black text-slate-800 mt-3">{value}</p>
    </div>
  );
}
