import { queryOptions } from "@tanstack/react-query";
import {
  getDisputeByCode,
  getDisputesByStatus,
  getDisputesByUserId,
  getPaymentTransactionByCode,
  getPaymentTransactionByOrderId,
  getRefundByCode,
  getRefundsByStatus,
  getRefundsByUserId,
  getSettlementByCode,
  getSettlementsByStatus,
  getShopSettlements,
  getUserPaymentTransactions,
  getWalletByUserId,
  getWalletHistory,
  searchPaymentTransactions,
} from "@/service/finance";
import {
  PaymentTxnStatus,
  PaymentTxnType,
  RefundStatus,
  SettlementStatus,
} from "@/types/index";

export const financeQuery = {
  transactionsByTypeStatus: (
    txnType: PaymentTxnType,
    status: PaymentTxnStatus,
  ) =>
    queryOptions({
      queryKey: ["admin", "finance", "transactions", "search", txnType, status],
      queryFn: () => searchPaymentTransactions(txnType, status),
    }),
  transactionByCode: (txnCode: string) =>
    queryOptions({
      queryKey: ["admin", "finance", "transactions", "code", txnCode],
      queryFn: () => getPaymentTransactionByCode(txnCode),
    }),
  transactionByOrderId: (orderId: number) =>
    queryOptions({
      queryKey: ["admin", "finance", "transactions", "order", orderId],
      queryFn: () => getPaymentTransactionByOrderId(orderId),
    }),
  transactionByUserId: (userId: number) =>
    queryOptions({
      queryKey: ["admin", "finance", "transactions", "user", userId],
      queryFn: () => getUserPaymentTransactions(userId),
    }),

  refundsByStatus: (status: RefundStatus) =>
    queryOptions({
      queryKey: ["admin", "finance", "refunds", "status", status],
      queryFn: () => getRefundsByStatus(status),
    }),
  refundByCode: (refundCode: string) =>
    queryOptions({
      queryKey: ["admin", "finance", "refunds", "code", refundCode],
      queryFn: () => getRefundByCode(refundCode),
    }),
  refundsByUserId: (userId: number) =>
    queryOptions({
      queryKey: ["admin", "finance", "refunds", "user", userId],
      queryFn: () => getRefundsByUserId(userId),
    }),

  disputesByStatus: (status: string) =>
    queryOptions({
      queryKey: ["admin", "finance", "disputes", "status", status],
      queryFn: () => getDisputesByStatus(status as any),
    }),
  disputeByCode: (disputeCode: string) =>
    queryOptions({
      queryKey: ["admin", "finance", "disputes", "code", disputeCode],
      queryFn: () => getDisputeByCode(disputeCode),
    }),
  disputesByUserId: (userId: number) =>
    queryOptions({
      queryKey: ["admin", "finance", "disputes", "user", userId],
      queryFn: () => getDisputesByUserId(userId),
    }),

  settlementsByStatus: (status: SettlementStatus) =>
    queryOptions({
      queryKey: ["admin", "finance", "settlements", "status", status],
      queryFn: () => getSettlementsByStatus(status),
    }),
  settlementByCode: (settlementCode: string) =>
    queryOptions({
      queryKey: ["admin", "finance", "settlements", "code", settlementCode],
      queryFn: () => getSettlementByCode(settlementCode),
    }),
  settlementsByShopId: (shopId: number) =>
    queryOptions({
      queryKey: ["admin", "finance", "settlements", "shop", shopId],
      queryFn: () => getShopSettlements(shopId),
    }),

  walletByUserId: (userId: number) =>
    queryOptions({
      queryKey: ["admin", "finance", "wallet", "user", userId],
      queryFn: () => getWalletByUserId(userId),
    }),
  walletHistoryByUserId: (userId: number) =>
    queryOptions({
      queryKey: ["admin", "finance", "wallet", "history", userId],
      queryFn: () => getWalletHistory(userId),
    }),
};
