"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { useFinanceOverview } from "@/hooks/admin/useFinance";

const currency = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

export default function FinanceOverviewPage() {
  const { stats, recentTransactions, isLoading } = useFinanceOverview();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Quản trị giao dịch thanh toán
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý transaction, hoàn tiền, tranh chấp, đối soát và ví theo dữ
          liệu từ payment-service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Tổng doanh thu thành công"
          value={currency(stats.totalRevenue)}
          icon={<Wallet className="text-blue-600" size={20} />}
        />
        <StatCard
          title="Doanh thu tháng hiện tại"
          value={currency(stats.thisMonthRevenue)}
          icon={<CheckCircle2 className="text-emerald-600" size={20} />}
        />
        <StatCard
          title="Số giao dịch chờ xử lý"
          value={stats.pendingPayoutsCount.toString()}
          icon={<Clock3 className="text-amber-600" size={20} />}
        />
        <StatCard
          title="Giá trị đang pending"
          value={currency(stats.pendingPayoutsValue)}
          icon={<AlertTriangle className="text-rose-600" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-800">Giao dịch gần đây</h2>
            <Link
              href="/admin/finance/transactions"
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3">Mã giao dịch</th>
                  <th className="text-left px-5 py-3">Loại</th>
                  <th className="text-right px-5 py-3">Net Amount</th>
                  <th className="text-center px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-400" colSpan={4}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : recentTransactions.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-400" colSpan={4}>
                      Chưa có giao dịch.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">
                        {tx.txnCode}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{tx.txnType}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800">
                        {currency(tx.netAmount)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 font-bold">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-black text-slate-800">Điều hướng nhanh</h3>
          <div className="mt-4 space-y-2 text-sm">
            <QuickLink
              href="/admin/finance/transactions"
              label="Quản lý giao dịch"
            />
            <QuickLink
              href="/admin/finance/revenue-snapshots"
              label="Revenue snapshot"
            />
            <QuickLink
              href="/admin/finance/reconciliation"
              label="Reconciliation"
            />
            <QuickLink
              href="/admin/finance/refunds"
              label="Quản lý hoàn tiền"
            />
            <QuickLink
              href="/admin/finance/disputes"
              label="Quản lý tranh chấp"
            />
            <QuickLink
              href="/admin/finance/settlements"
              label="Đối soát seller"
            />
            <QuickLink href="/admin/finance/wallets" label="Ví người dùng" />
          </div>
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

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
    >
      {label}
    </Link>
  );
}
