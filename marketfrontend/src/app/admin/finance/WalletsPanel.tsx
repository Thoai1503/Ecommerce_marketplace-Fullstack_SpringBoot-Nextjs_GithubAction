"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/admin/useFinance";

const currency = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

export default function WalletsPanel() {
  const [userIdInput, setUserIdInput] = useState("1");
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(1);

  const { wallet, history, isLoading, credit, debit, isCrediting, isDebiting } =
    useWallet(resolvedUserId);

  const onApplyUser = () => {
    const value = Number(userIdInput);
    if (Number.isNaN(value) || value <= 0) return;
    setResolvedUserId(value);
  };

  const onCredit = async () => {
    if (!resolvedUserId) return;
    await credit({
      amount: 100000,
      refType: "MANUAL",
      description: "Admin credit",
    });
  };

  const onDebit = async () => {
    if (!resolvedUserId) return;
    await debit({
      amount: 50000,
      refType: "MANUAL",
      description: "Admin debit",
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Quản lý ví người dùng
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dữ liệu theo endpoint /api/v1/wallets/user/{resolvedUserId}.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <input
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          placeholder="Nhập userId"
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-full md:w-[280px]"
        />
        <button
          onClick={onApplyUser}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold"
        >
          Tải ví
        </button>
        <button
          onClick={onCredit}
          disabled={isCrediting || !resolvedUserId}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold disabled:opacity-60"
        >
          + Credit 100,000
        </button>
        <button
          onClick={onDebit}
          disabled={isDebiting || !resolvedUserId}
          className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-bold disabled:opacity-60"
        >
          - Debit 50,000
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="User ID"
          value={resolvedUserId ? String(resolvedUserId) : "-"}
        />
        <Card
          title="Số dư khả dụng"
          value={wallet ? currency(wallet.balance) : "-"}
        />
        <Card
          title="Số dư tạm giữ"
          value={wallet ? currency(wallet.lockedBalance) : "-"}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-700">
          Lịch sử ví
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Txn Type</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-right px-4 py-3">Before</th>
                <th className="text-right px-4 py-3">After</th>
                <th className="text-left px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Đang tải ví...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Chưa có lịch sử ví.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">{item.txnType}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {currency(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currency(item.balanceBefore)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currency(item.balanceAfter)}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
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

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
        {title}
      </p>
      <p className="text-lg font-black text-slate-800 mt-2">{value}</p>
    </div>
  );
}
