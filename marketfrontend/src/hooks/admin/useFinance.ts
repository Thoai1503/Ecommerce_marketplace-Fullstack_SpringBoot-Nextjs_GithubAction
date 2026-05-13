import { useMemo } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { financeQuery } from "@/query/finance";
import {
  creditWallet,
  debitWallet,
  resolveDispute,
  updatePaymentTransactionStatus,
  updateRefundStatus,
  updateSettlementStatus,
} from "@/service/finance";
import {
  DisputeResolvePayload,
  PaymentRevenueFilters,
  PaymentTxnStatus,
  PaymentTxnType,
  RefundStatus,
  SettlementStatus,
  TransactionStatusUpdatePayload,
  WalletOperationPayload,
} from "@/types/index";

const DEFAULT_TXN_TYPES: PaymentTxnType[] = [
  "ORDER_PAYMENT",
  "WALLET_TOPUP",
  "WALLET_WITHDRAW",
  "SETTLEMENT_PAYOUT",
  "REFUND_PAYOUT",
  "PLATFORM_FEE",
  "ADJUSTMENT",
];

const DEFAULT_TXN_STATUSES: PaymentTxnStatus[] = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
];

export const usePaymentTransactions = (
  txnType: PaymentTxnType,
  status: PaymentTxnStatus,
) => {
  const queryClient = useQueryClient();
  const query = useQuery(
    financeQuery.transactionsByTypeStatus(txnType, status),
  );

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: TransactionStatusUpdatePayload;
    }) => updatePaymentTransactionStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "transactions"],
      });
    },
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateStatus: updateMutation.mutateAsync,
    isUpdatingStatus: updateMutation.isPending,
  };
};

export const useTransactionAggregate = () => {
  const perTypeQueries = useQueries({
    queries: DEFAULT_TXN_TYPES.map((txnType) =>
      financeQuery.transactionsByTypeStatus(txnType, "SUCCESS"),
    ),
  });

  const allTransactions = useMemo(
    () => perTypeQueries.flatMap((q) => q.data ?? []),
    [perTypeQueries],
  );

  return {
    transactions: allTransactions,
    isLoading: perTypeQueries.some((q) => q.isLoading),
    isError: perTypeQueries.some((q) => q.isError),
  };
};

export const useTransactionDetail = (txnCode: string) => {
  const queryClient = useQueryClient();
  const detailQuery = useQuery(financeQuery.transactionByCode(txnCode));

  const historyQuery = useQuery({
    ...financeQuery.transactionHistoryByTxnId(detailQuery.data?.id ?? 0),
    enabled: !!detailQuery.data?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: TransactionStatusUpdatePayload;
    }) => updatePaymentTransactionStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "transactions"],
      });
    },
  });

  return {
    transaction: detailQuery.data,
    history: historyQuery.data ?? [],
    isLoading: detailQuery.isLoading || historyQuery.isLoading,
    isError: detailQuery.isError || historyQuery.isError,
    refetch: () => {
      detailQuery.refetch();
      historyQuery.refetch();
    },
    updateStatus: updateMutation.mutateAsync,
    isUpdatingStatus: updateMutation.isPending,
  };
};

export const useRefunds = (status: RefundStatus) => {
  const queryClient = useQueryClient();
  const query = useQuery(financeQuery.refundsByStatus(status));

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        status: RefundStatus;
        reason?: string;
        changedBy: string;
        actorId?: number;
      };
    }) => updateRefundStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "refunds"],
      });
    },
  });

  return {
    refunds: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateStatus: updateMutation.mutateAsync,
    isUpdatingStatus: updateMutation.isPending,
  };
};

export const useDisputes = (status: string) => {
  const queryClient = useQueryClient();
  const query = useQuery(financeQuery.disputesByStatus(status));

  const resolveMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: DisputeResolvePayload;
    }) => resolveDispute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "disputes"],
      });
    },
  });

  return {
    disputes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    resolve: resolveMutation.mutateAsync,
    isResolving: resolveMutation.isPending,
  };
};

export const useSettlements = (status: SettlementStatus) => {
  const queryClient = useQueryClient();
  const query = useQuery(financeQuery.settlementsByStatus(status));

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status: nextStatus,
    }: {
      id: number;
      status: SettlementStatus;
    }) => updateSettlementStatus(id, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "settlements"],
      });
    },
  });

  return {
    settlements: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateStatus: updateMutation.mutateAsync,
    isUpdatingStatus: updateMutation.isPending,
  };
};

export const useWallet = (userId: number | null) => {
  const queryClient = useQueryClient();
  const walletQuery = useQuery({
    ...financeQuery.walletByUserId(userId ?? 0),
    enabled: userId !== null,
  });
  const historyQuery = useQuery({
    ...financeQuery.walletHistoryByUserId(userId ?? 0),
    enabled: userId !== null,
  });

  const creditMutation = useMutation({
    mutationFn: (payload: WalletOperationPayload) => {
      if (userId === null) throw new Error("userId is required");
      return creditWallet(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "wallet"],
      });
    },
  });

  const debitMutation = useMutation({
    mutationFn: (payload: WalletOperationPayload) => {
      if (userId === null) throw new Error("userId is required");
      return debitWallet(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "finance", "wallet"],
      });
    },
  });

  return {
    wallet: walletQuery.data,
    history: historyQuery.data ?? [],
    isLoading: walletQuery.isLoading || historyQuery.isLoading,
    isError: walletQuery.isError || historyQuery.isError,
    refetch: () => {
      walletQuery.refetch();
      historyQuery.refetch();
    },
    credit: creditMutation.mutateAsync,
    debit: debitMutation.mutateAsync,
    isCrediting: creditMutation.isPending,
    isDebiting: debitMutation.isPending,
  };
};

export const useFinanceOverview = () => {
  const queries = useQueries({
    queries: DEFAULT_TXN_STATUSES.map((status) =>
      financeQuery.transactionsByTypeStatus("ORDER_PAYMENT", status),
    ),
  });

  const allTransactions = useMemo(
    () => queries.flatMap((q) => q.data ?? []),
    [queries],
  );

  const totalRevenue = allTransactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((sum, t) => sum + (t.netAmount || 0), 0);

  const pendingCount = allTransactions.filter(
    (t) => t.status === "PENDING",
  ).length;

  return {
    stats: {
      totalRevenue,
      thisMonthRevenue: totalRevenue,
      pendingPayoutsCount: pendingCount,
      pendingPayoutsValue: allTransactions
        .filter((t) => t.status === "PENDING")
        .reduce((sum, t) => sum + (t.netAmount || 0), 0),
    },
    recentTransactions: allTransactions.slice(0, 8),
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
};

export const useRevenueSnapshots = (filters?: PaymentRevenueFilters) => {
  const snapshotsQuery = useQuery(financeQuery.revenueSnapshots(filters));
  const summaryQuery = useQuery(financeQuery.revenueSnapshotSummary(filters));

  return {
    snapshots: snapshotsQuery.data ?? [],
    summary: summaryQuery.data,
    isLoading: snapshotsQuery.isLoading || summaryQuery.isLoading,
    isError: snapshotsQuery.isError || summaryQuery.isError,
    refetch: () => {
      snapshotsQuery.refetch();
      summaryQuery.refetch();
    },
  };
};

export const useRevenueReconciliation = (filters?: PaymentRevenueFilters) => {
  const query = useQuery(financeQuery.revenueReconciliation(filters));

  return {
    reconciliation: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
