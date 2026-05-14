"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import {
  usePaymentTransactions,
  useTransactionDetail,
} from "@/hooks/admin/useFinance";
import { PaymentTxnStatus, PaymentTxnType } from "@/types/index";
import { TransactionDetailModal } from "@/components/admin/finance/TransactionDetailModal";
import { Button } from "@/components/ui/button";

const TXN_TYPES: PaymentTxnType[] = [
  "ORDER_PAYMENT",
  "WALLET_TOPUP",
  "WALLET_WITHDRAW",
  "SETTLEMENT_PAYOUT",
  "REFUND_PAYOUT",
  "PLATFORM_FEE",
  "ADJUSTMENT",
];
 
const TXN_STATUSES: PaymentTxnStatus[] = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
];

const currency = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

export default function TransactionsList() {
  const [selectedType, setSelectedType] =
    useState<PaymentTxnType>("ORDER_PAYMENT");
  const [selectedStatus, setSelectedStatus] =
    useState<PaymentTxnStatus>("PENDING");
  const [search, setSearch] = useState("");
  const [selectedTxnCode, setSelectedTxnCode] = useState<string | null>(null);

  const { transactions, isLoading, updateStatus, isUpdatingStatus } =
    usePaymentTransactions(selectedType, selectedStatus);

  const {
    transaction: detailTransaction,
    history,
    isLoading: isLoadingDetail,
    updateStatus: updateDetailStatus,
    isUpdatingStatus: isUpdatingDetailStatus,
  } = useTransactionDetail(selectedTxnCode || "");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return transactions;
    return transactions.filter(
      (tx) =>
        tx.txnCode.toLowerCase().includes(keyword) ||
        (tx.orderNumber || "").toLowerCase().includes(keyword) ||
        String(tx.id).includes(keyword),
    );
  }, [transactions, search]);

  const onUpdateStatus = async (id: number, status: PaymentTxnStatus) => {
    await updateStatus({
      id,
      payload: {
        status,
        changedBy: "ADMIN",
      },
    });
  };

  const handleDetailStatusChange = async (
    status: PaymentTxnStatus,
    reason?: string,
  ) => {
    if (!detailTransaction) return;
    await updateDetailStatus({
      id: detailTransaction.id,
      payload: {
        status,
        reason,
        changedBy: "ADMIN",
      },
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Quản lý giao dịch
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dữ liệu theo endpoint /api/payments/transactions/search.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as PaymentTxnType)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
        >
          {TXN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(e.target.value as PaymentTxnStatus)
          }
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
        >
          {TXN_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo txnCode, orderNumber, id"
          className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600">
          Tổng bản ghi: <span className="font-bold">{filtered.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-4 py-3">Txn Code</th>
                <th className="text-left px-4 py-3">Loại</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-right px-4 py-3">Gross</th>
                <th className="text-right px-4 py-3">Net</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-center px-4 py-3">Cập nhật</th>
                <th className="text-center px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={8}>
                    Đang tải dữ liệu giao dịch...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={8}>
                    Không có giao dịch phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {tx.txnCode}
                    </td>
                    <td className="px-4 py-3">{tx.txnType}</td>
                    <td className="px-4 py-3">{tx.orderNumber || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {currency(tx.grossAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {currency(tx.netAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 font-bold text-xs">
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        disabled={isUpdatingStatus}
                        value={tx.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            tx.id,
                            e.target.value as PaymentTxnStatus,
                          )
                        }
                        className="px-2 py-1 rounded border border-slate-300 text-xs"
                      >
                        {TXN_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTxnCode(tx.txnCode)}
                        className="flex items-center gap-1 h-8 px-3 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionDetailModal
        transaction={detailTransaction}
        history={history}
        isOpen={!!selectedTxnCode}
        onClose={() => setSelectedTxnCode(null)}
        isLoading={isLoadingDetail}
        onStatusChange={handleDetailStatusChange}
        isUpdating={isUpdatingDetailStatus}
      />
    </div>
  );
}
