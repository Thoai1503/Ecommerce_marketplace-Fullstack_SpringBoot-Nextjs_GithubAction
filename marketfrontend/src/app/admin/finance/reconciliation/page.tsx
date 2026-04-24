"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw, ShieldCheck } from "lucide-react";
import { useRevenueReconciliation } from "@/hooks/admin/useFinance";
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

export default function FinanceReconciliationPage() {
  const [txnType, setTxnType] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filters = useMemo(
    () => ({
      txnType: txnType || undefined,
      fromTime: toStartOfDay(fromDate),
      toTime: toEndOfDay(toDate),
    }),
    [fromDate, toDate, txnType],
  );

  const { reconciliation, isLoading } = useRevenueReconciliation(filters);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Revenue Reconciliation
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          So khớp transaction SUCCESS với payment_revenue_snapshot để phát hiện
          thiếu dòng, snapshot lỗi hoặc cumulative lệch.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
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

        <div className="md:col-span-2 xl:col-span-2 flex items-center text-sm text-slate-500">
          Latest snapshot:{" "}
          {formatDateTime(reconciliation?.latestSnapshot?.recognizedAt)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <HealthCard
          title="Missing Snapshots"
          value={String(reconciliation?.missingSnapshotCount || 0)}
          tone="amber"
          icon={<AlertTriangle size={18} />}
        />
        <HealthCard
          title="Invalid Snapshots"
          value={String(reconciliation?.invalidSnapshotCount || 0)}
          tone="rose"
          icon={<AlertTriangle size={18} />}
        />
        <HealthCard
          title="Cumulative Count Gap"
          value={String(reconciliation?.cumulativeCountGap || 0)}
          tone="blue"
          icon={<RefreshCcw size={18} />}
        />
        <HealthCard
          title="Cumulative Net Gap"
          value={currency(reconciliation?.cumulativeNetGap || 0)}
          tone="emerald"
          icon={<ShieldCheck size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800">
              Missing snapshot transactions
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              SUCCESS transaction chưa có dòng snapshot tương ứng.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3">Txn Code</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-right px-4 py-3">Net</th>
                  <th className="text-left px-4 py-3">Completed</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={5}>
                      Đang kiểm tra missing snapshots...
                    </td>
                  </tr>
                ) : !reconciliation ||
                  reconciliation.missingTransactions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={5}>
                      Không phát hiện missing snapshot trong bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  reconciliation.missingTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {transaction.txnCode}
                      </td>
                      <td className="px-4 py-3">{transaction.txnType}</td>
                      <td className="px-4 py-3">
                        {transaction.orderNumber || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        {currency(transaction.netAmount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDateTime(
                          transaction.completedAt || transaction.updatedAt,
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800">Invalid snapshots</h2>
            <p className="text-sm text-slate-500 mt-1">
              Snapshot có transaction không tồn tại hoặc transaction không còn ở
              trạng thái SUCCESS.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3">Recognized</th>
                  <th className="text-left px-4 py-3">Txn Code</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">Net</th>
                  <th className="text-center px-4 py-3">Txn Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={5}>
                      Đang kiểm tra invalid snapshots...
                    </td>
                  </tr>
                ) : !reconciliation ||
                  reconciliation.invalidSnapshots.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={5}>
                      Không phát hiện invalid snapshot trong bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  reconciliation.invalidSnapshots.map((snapshot) => (
                    <tr key={snapshot.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDateTime(snapshot.recognizedAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {snapshot.txnCode}
                      </td>
                      <td className="px-4 py-3">{snapshot.txnType}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700">
                        {currency(snapshot.netAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                          {snapshot.transactionStatus || "MISSING_TXN"}
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

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="font-black text-slate-800">Overall health snapshot</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
          <Metric
            label="Overall SUCCESS tx"
            value={String(reconciliation?.overallSuccessTransactionCount || 0)}
          />
          <Metric
            label="Overall snapshots"
            value={String(reconciliation?.overallSnapshotCount || 0)}
          />
          <Metric
            label="Filtered SUCCESS tx"
            value={String(reconciliation?.filteredSuccessTransactionCount || 0)}
          />
          <Metric
            label="Filtered snapshots"
            value={String(reconciliation?.filteredSnapshotCount || 0)}
          />
          <Metric
            label="Gross gap"
            value={currency(reconciliation?.cumulativeGrossGap || 0)}
          />
          <Metric
            label="Discount gap"
            value={currency(reconciliation?.cumulativeDiscountGap || 0)}
          />
          <Metric
            label="Fee gap"
            value={currency(reconciliation?.cumulativeFeeGap || 0)}
          />
          <Metric
            label="Net gap"
            value={currency(reconciliation?.cumulativeNetGap || 0)}
          />
        </div>
      </div>
    </div>
  );
}

function HealthCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: "amber" | "rose" | "blue" | "emerald";
}) {
  const toneClass = {
    amber: "text-amber-600 bg-amber-50",
    rose: "text-rose-600 bg-rose-50",
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
  }[tone];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
          {title}
        </p>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${toneClass}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-slate-800 mt-3">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-slate-800 text-base font-black mt-1">{value}</p>
    </div>
  );
}
