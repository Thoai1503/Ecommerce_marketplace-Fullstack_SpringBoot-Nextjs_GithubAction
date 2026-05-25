"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import http from "@/lib/http";
import { AlertTriangle } from "lucide-react";

const currency = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

type WalletView = {
  id?: number;
  userId?: number;
  availableBalance?: number;
  balance?: number;
  lockedBalance?: number;
  status?: string;
  walletStatus?: string;
  isActive?: boolean;
};

type WalletTransactionView = {
  id: number;
  txnType?: string;
  transactionType?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
};

export default function WalletsPanel() {
  const searchParams = useSearchParams();
  const partnerParam = searchParams.get("partner");
  const amountParam = searchParams.get("amount");
  const transactionTypeParam = searchParams.get("transaction_type");
  const sourceTypeParam = searchParams.get("source_type");
  const sourceIdParam = searchParams.get("source_id");
  const initialPartnerId = Number(partnerParam);
  const initialAmount = Number(amountParam);
  const initialSourceId = Number(sourceIdParam);
  const isDebitRequested = Number.isFinite(initialAmount) && initialAmount < 0;

  const [userIdInput, setUserIdInput] = useState(
    Number.isFinite(initialPartnerId) && initialPartnerId > 0
      ? String(initialPartnerId)
      : "1",
  );
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(
    Number.isFinite(initialPartnerId) && initialPartnerId > 0
      ? initialPartnerId
      : 1,
  );
  const payoutAmount = useMemo(
    () =>
      Number.isFinite(initialAmount) && initialAmount !== 0
        ? Math.abs(initialAmount)
        : 0,
    [initialAmount],
  );
  const payoutTransactionType = useMemo(
    () => (transactionTypeParam || "MANUAL").trim() || "MANUAL",
    [transactionTypeParam],
  );
  const payoutSourceType = useMemo(
    () => (sourceTypeParam || "MANUAL").trim() || "MANUAL",
    [sourceTypeParam],
  );
  const payoutSourceId = useMemo(
    () =>
      Number.isFinite(initialSourceId) && initialSourceId > 0
        ? initialSourceId
        : undefined,
    [initialSourceId],
  );

  const [wallet, setWallet] = useState<WalletView | null>(null);
  const [history, setHistory] = useState<WalletTransactionView[]>([]);
  const [isLoadingWalletData, setIsLoadingWalletData] = useState(false);

  const [creditMessage, setCreditMessage] = useState<string>("");
  const [isProcessingCredit, setIsProcessingCredit] = useState(false);
  const [isProcessingDebit, setIsProcessingDebit] = useState(false);
  const [isCheckingShipmentPayout, setIsCheckingShipmentPayout] =
    useState(false);
  const [isShipmentPayoutSettled, setIsShipmentPayoutSettled] = useState(false);

  const shouldCheckShipmentPayout = useMemo(
    () => payoutSourceType === "ORDER_SHIPMENT" && !!payoutSourceId,
    [payoutSourceType, payoutSourceId],
  );

  const loadWalletDataByUserId = useCallback(async (userId: number) => {
    setIsLoadingWalletData(true);
    try {
      const walletResp = await http.get(`/api/wallets/user/${userId}`);
      const walletData = (walletResp?.data || null) as WalletView | null;
      setWallet(walletData);

      const walletId = Number(walletData?.id || 0);
      if (!walletId) {
        setHistory([]);
        return;
      }

      const txResp = await http.get(`/api/wallets/${walletId}/transactions`, {
        params: { page: 0, size: 100 },
      });
      const txContent = Array.isArray(txResp?.data?.content)
        ? txResp.data.content
        : [];
      setHistory(txContent as WalletTransactionView[]);
    } catch {
      setWallet(null);
      setHistory([]);
      setCreditMessage("Không tải được ví hoặc lịch sử giao dịch.");
    } finally {
      setIsLoadingWalletData(false);
    }
  }, []);

  const walletStatus = useMemo(() => {
    if (!wallet) return "-";

    const rawStatus = String(wallet.status ?? wallet.walletStatus ?? "")
      .trim()
      .toUpperCase();

    if (rawStatus) return rawStatus;

    if (typeof wallet.isActive === "boolean") {
      return wallet.isActive ? "ACTIVE" : "SUSPENDED";
    }

    return "-";
  }, [wallet]);

  useEffect(() => {
    if (Number.isFinite(initialPartnerId) && initialPartnerId > 0) {
      setUserIdInput(String(initialPartnerId));
      setResolvedUserId(initialPartnerId);
      loadWalletDataByUserId(initialPartnerId);
    }
  }, [initialPartnerId, loadWalletDataByUserId]);

  useEffect(() => {
    let active = true;

    const checkShipmentPayout = async () => {
      if (!shouldCheckShipmentPayout || !payoutSourceId) {
        if (active) {
          setIsShipmentPayoutSettled(false);
        }
        return;
      }

      setIsCheckingShipmentPayout(true);
      try {
        const resp = await http.get(`/api/orders/shipments/${payoutSourceId}`);
        const data = resp?.data || {};
        const isSettled = Boolean(
          data?.is_payout_settled ??
          data?.isPayoutSettled ??
          data?.payoutSettled ??
          false,
        );

        if (active) {
          setIsShipmentPayoutSettled(isSettled);
          if (isSettled) {
            setCreditMessage(
              "Shipment này đã payout rồi. Hệ thống chặn thao tác Credit.",
            );
          }
        }
      } catch {
        if (active) {
          setIsShipmentPayoutSettled(false);
        }
      } finally {
        if (active) {
          setIsCheckingShipmentPayout(false);
        }
      }
    };

    checkShipmentPayout();

    return () => {
      active = false;
    };
  }, [shouldCheckShipmentPayout, payoutSourceId]);

  const onApplyUser = async () => {
    const value = Number(userIdInput);
    if (Number.isNaN(value) || value <= 0) return;

    setCreditMessage("");

    if (value === resolvedUserId) {
      await loadWalletDataByUserId(value);
      return;
    }

    setResolvedUserId(value);
    await loadWalletDataByUserId(value);
  };

  const onCredit = async () => {
    if (!resolvedUserId) return;

    if (shouldCheckShipmentPayout && isShipmentPayoutSettled) {
      setCreditMessage("Shipment này đã payout rồi. Không thể Credit lại.");
      return;
    }

    setCreditMessage("");
    setIsProcessingCredit(true);

    const creditAmount = payoutAmount > 0 ? payoutAmount : 100000;

    try {
      let walletId = Number((wallet as any)?.id || 0);

      if (!walletId) {
        const walletResp = await http.get(
          `/api/wallets/user/${resolvedUserId}`,
        );
        walletId = Number(walletResp?.data?.id || 0);
      }

      if (!walletId) {
        throw new Error("Wallet not found");
      }

      await http.post("/api/wallets/credit", {
        walletId,
        amount: creditAmount,
        feeAmount: 0,
        transactionType: payoutTransactionType,
        sourceType: payoutSourceType,
        sourceId: payoutSourceId,
        idempotencyKey: `admin-credit-${resolvedUserId}-${Date.now()}`,
        note: `Admin credit (${payoutTransactionType})`,
      });

      await loadWalletDataByUserId(resolvedUserId);
      setCreditMessage("Credit thành công.");
    } catch (error: any) {
      const status = Number(error?.response?.status || 0);
      const rawMessage = String(error?.response?.data || error?.message || "");
      const message = rawMessage.toLowerCase();
      const isWalletNotFound =
        status === 404 ||
        message.includes("wallet not found") ||
        message.includes("ví") ||
        message.includes("not found");

      if (!isWalletNotFound) {
        setCreditMessage("Credit thất bại. Vui lòng thử lại.");
        return;
      }

      const walletCode = `WALLET-U${resolvedUserId}`;

      try {
        await http.post("/api/wallets", {
          userId: resolvedUserId,
          walletCode,
          currency: "VND",
          status: "SUSPENDED",
        });
      } catch (createErr: any) {
        const createStatus = Number(createErr?.response?.status || 0);
        if (createStatus !== 409) {
          setCreditMessage("Không thể tạo ví mới cho partner.");
          return;
        }

        await http.post("/api/wallets", {
          userId: resolvedUserId,
          walletCode: `${walletCode}-${Date.now()}`,
          currency: "VND",
          status: "SUSPENDED",
        });
      }

      const walletResp = await http.get(`/api/wallets/user/${resolvedUserId}`);
      const createdWalletId = Number(walletResp?.data?.id || 0);
      if (!createdWalletId) {
        setCreditMessage(
          "Đã tạo ví SUSPENDED nhưng chưa lấy được walletId để credit.",
        );
        return;
      }

      await http.post("/api/wallets/credit", {
        walletId: createdWalletId,
        amount: creditAmount,
        feeAmount: 0,
        transactionType: payoutTransactionType,
        sourceType: payoutSourceType,
        sourceId: payoutSourceId,
        idempotencyKey: `admin-credit-${resolvedUserId}-${Date.now()}-retry`,
        note: `Admin credit (${payoutTransactionType})`,
      });

      await loadWalletDataByUserId(resolvedUserId);
      setCreditMessage(
        "Partner chưa có ví. Đã tạo ví SUSPENDED và tạo wallet transaction credit thành công.",
      );
    } finally {
      setIsProcessingCredit(false);
    }
  };

  const onDebit = async () => {
    if (!resolvedUserId) return;
    if (!wallet?.id) {
      setCreditMessage("Chưa có walletId. Hãy bấm Tải ví trước khi Debit.");
      return;
    }

    setIsProcessingDebit(true);
    setCreditMessage("");
    const debitAmount =
      isDebitRequested && payoutAmount > 0 ? payoutAmount : 50000;
    try {
      await http.post("/api/wallets/debit", {
        walletId: wallet.id,
        amount: debitAmount,
        feeAmount: 0,
        transactionType: "MANUAL_ADJUSTMENT",
        sourceType: "ADMIN_MANUAL",
        note: "Admin debit",
        idempotencyKey: `admin-debit-${wallet.id}-${Date.now()}`,
      });
      await loadWalletDataByUserId(resolvedUserId);
      setCreditMessage("Debit thành công.");
    } catch {
      setCreditMessage("Debit thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessingDebit(false);
    }
  };

  const isCreditBlockedByShipmentPayout =
    shouldCheckShipmentPayout && isShipmentPayoutSettled;

  const isCreditButtonDisabled =
    isProcessingCredit ||
    !resolvedUserId ||
    isCheckingShipmentPayout ||
    isCreditBlockedByShipmentPayout ||
    isDebitRequested;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Quản lý ví người dùng
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dữ liệu theo endpoint /api/wallets/user/{resolvedUserId}.
        </p>
      </div>

      {(partnerParam || amountParam) && (
        <div
          className={`rounded-2xl p-4 text-sm ${
            isDebitRequested
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p
                className={`text-xs uppercase tracking-wider font-bold ${
                  isDebitRequested ? "text-red-600" : "text-emerald-600"
                }`}
              >
                Partner
              </p>
              <p className="font-black text-lg">{partnerParam || "-"}</p>
            </div>
            <div>
              <p
                className={`text-xs uppercase tracking-wider font-bold ${
                  isDebitRequested ? "text-red-600" : "text-emerald-600"
                }`}
              >
                Amount
              </p>
              <p className="font-black text-lg">
                {payoutAmount > 0 ? currency(payoutAmount) : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

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
          disabled={isCreditButtonDisabled}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold disabled:opacity-60"
        >
          {isCheckingShipmentPayout
            ? "Đang kiểm tra shipment..."
            : isProcessingCredit
              ? "Đang Credit..."
              : "+ Credit"}{" "}
          {payoutAmount > 0 ? currency(payoutAmount) : "100,000 VND"}
        </button>
        <button
          onClick={onDebit}
          disabled={isProcessingDebit || !resolvedUserId || !wallet?.id}
          className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-bold disabled:opacity-60"
        >
          {isProcessingDebit
            ? "Đang Debit..."
            : isDebitRequested
              ? `- Debit ${payoutAmount > 0 ? currency(payoutAmount) : ""}`
              : "- Debit 50,000"}
        </button>
      </div>

      {isCreditBlockedByShipmentPayout && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Credit đã bị khóa</p>
              <p className="mt-1">
                Shipment nguồn đã được payout trước đó (is_payout_settled =
                true). Để tránh chuyển tiền trùng, hệ thống chặn thao tác
                Credit.
              </p>
            </div>
          </div>
        </div>
      )}

      {creditMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3 text-sm">
          {creditMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          title="User ID"
          value={resolvedUserId ? String(resolvedUserId) : "-"}
        />
        <Card title="Trạng thái ví" value={walletStatus} />
        <Card
          title="Số dư khả dụng"
          value={
            wallet
              ? currency(Number(wallet.availableBalance ?? wallet.balance ?? 0))
              : "-"
          }
        />
        <Card
          title="Số dư tạm giữ"
          value={wallet ? currency(Number(wallet.lockedBalance ?? 0)) : "-"}
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
              {isLoadingWalletData ? (
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
                    <td className="px-4 py-3">
                      {item.txnType || item.transactionType || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {currency(Number(item.amount || 0))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currency(Number(item.balanceBefore || 0))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currency(Number(item.balanceAfter || 0))}
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
