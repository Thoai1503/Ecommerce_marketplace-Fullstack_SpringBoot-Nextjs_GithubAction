import http from "@/lib/http";
import {
  DisputeResolvePayload,
  PaymentDisputeAdmin,
  PaymentTransaction,
  PaymentTxnStatus,
  PaymentTxnType,
  PaymentWalletAdmin,
  RefundRequestAdmin,
  RefundStatus,
  RefundStatusUpdatePayload,
  SellerSettlementAdmin,
  SettlementStatus,
  TransactionStatusUpdatePayload,
  WalletOperationPayload,
  WalletTransactionAdmin,
} from "@/types/index";

const PAYMENT_BASE = "/api/payments";
const PAYMENT_V1_BASE = "/api/v1";

export const searchPaymentTransactions = async (
  txnType: PaymentTxnType,
  status: PaymentTxnStatus,
): Promise<PaymentTransaction[]> => {
  const { data } = await http.get(`${PAYMENT_BASE}/transactions/search`, {
    params: { txnType, status },
  });
  return data ?? [];
};

export const getPaymentTransactionByCode = async (
  txnCode: string,
): Promise<PaymentTransaction> => {
  const { data } = await http.get(`${PAYMENT_BASE}/transactions/${txnCode}`);
  return data;
};

export const getPaymentTransactionByOrderId = async (
  orderId: number,
): Promise<PaymentTransaction> => {
  const { data } = await http.get(
    `${PAYMENT_BASE}/transactions/order/${orderId}`,
  );
  return data;
};

export const getUserPaymentTransactions = async (
  userId: number,
): Promise<PaymentTransaction[]> => {
  const { data } = await http.get(
    `${PAYMENT_BASE}/transactions/user/${userId}`,
  );
  return data ?? [];
};

export const updatePaymentTransactionStatus = async (
  id: number,
  payload: TransactionStatusUpdatePayload,
): Promise<PaymentTransaction> => {
  const { data } = await http.put(
    `${PAYMENT_BASE}/transactions/${id}/status`,
    null,
    {
      params: {
        status: payload.status,
        reason: payload.reason,
        changedBy: payload.changedBy,
        actorId: payload.actorId,
      },
    },
  );
  return data;
};

export const getRefundsByStatus = async (
  status: RefundStatus,
): Promise<RefundRequestAdmin[]> => {
  const { data } = await http.get(
    `${PAYMENT_V1_BASE}/refunds/status/${status}`,
  );
  return data ?? [];
};

export const getRefundByCode = async (
  refundCode: string,
): Promise<RefundRequestAdmin> => {
  const { data } = await http.get(`${PAYMENT_V1_BASE}/refunds/${refundCode}`);
  return data;
};

export const getRefundsByUserId = async (
  userId: number,
): Promise<RefundRequestAdmin[]> => {
  const { data } = await http.get(`${PAYMENT_V1_BASE}/refunds/user/${userId}`);
  return data ?? [];
};

export const updateRefundStatus = async (
  id: number,
  payload: RefundStatusUpdatePayload,
): Promise<RefundRequestAdmin> => {
  const { data } = await http.put(
    `${PAYMENT_V1_BASE}/refunds/${id}/status`,
    null,
    {
      params: {
        status: payload.status,
        reason: payload.reason,
        changedBy: payload.changedBy,
        actorId: payload.actorId,
      },
    },
  );
  return data;
};

export const getDisputesByStatus = async (
  status: PaymentDisputeAdmin["status"],
): Promise<PaymentDisputeAdmin[]> => {
  const { data } = await http.get(
    `${PAYMENT_V1_BASE}/disputes/status/${status}`,
  );
  return data ?? [];
};

export const getDisputeByCode = async (
  disputeCode: string,
): Promise<PaymentDisputeAdmin> => {
  const { data } = await http.get(`${PAYMENT_V1_BASE}/disputes/${disputeCode}`);
  return data;
};

export const getDisputesByUserId = async (
  userId: number,
): Promise<PaymentDisputeAdmin[]> => {
  const { data } = await http.get(`${PAYMENT_V1_BASE}/disputes/user/${userId}`);
  return data ?? [];
};

export const resolveDispute = async (
  id: number,
  payload: DisputeResolvePayload,
): Promise<PaymentDisputeAdmin> => {
  const { data } = await http.put(
    `${PAYMENT_V1_BASE}/disputes/${id}/resolve`,
    null,
    {
      params: {
        resolution: payload.resolution,
        resolutionNote: payload.resolutionNote,
        resolvedBy: payload.resolvedBy,
      },
    },
  );
  return data;
};

export const getSettlementsByStatus = async (
  status: SettlementStatus,
): Promise<SellerSettlementAdmin[]> => {
  const { data } = await http.get(
    `${PAYMENT_V1_BASE}/settlements/status/${status}`,
  );
  return data ?? [];
};

export const getSettlementByCode = async (
  settlementCode: string,
): Promise<SellerSettlementAdmin> => {
  const { data } = await http.get(
    `${PAYMENT_V1_BASE}/settlements/${settlementCode}`,
  );
  return data;
};

export const getShopSettlements = async (
  shopId: number,
): Promise<SellerSettlementAdmin[]> => {
  const { data } = await http.get(
    `${PAYMENT_V1_BASE}/settlements/shop/${shopId}`,
  );
  return data ?? [];
};

export const updateSettlementStatus = async (
  id: number,
  status: SettlementStatus,
): Promise<SellerSettlementAdmin> => {
  const { data } = await http.put(
    `${PAYMENT_V1_BASE}/settlements/${id}/status`,
    null,
    {
      params: { status },
    },
  );
  return data;
};

export const getWalletByUserId = async (
  userId: number,
): Promise<PaymentWalletAdmin> => {
  const { data } = await http.get(`${PAYMENT_V1_BASE}/wallets/user/${userId}`);
  return data;
};

export const getWalletHistory = async (
  userId: number,
): Promise<WalletTransactionAdmin[]> => {
  const { data } = await http.get(
    `${PAYMENT_V1_BASE}/wallets/${userId}/history`,
  );
  return data ?? [];
};

export const creditWallet = async (
  userId: number,
  payload: WalletOperationPayload,
): Promise<{ status: string; message: string }> => {
  const { data } = await http.post(
    `${PAYMENT_V1_BASE}/wallets/${userId}/credit`,
    null,
    {
      params: {
        amount: payload.amount,
        refType: payload.refType,
        refId: payload.refId,
        description: payload.description,
      },
    },
  );
  return data;
};

export const debitWallet = async (
  userId: number,
  payload: WalletOperationPayload,
): Promise<{ status: string; message: string }> => {
  const { data } = await http.post(
    `${PAYMENT_V1_BASE}/wallets/${userId}/debit`,
    null,
    {
      params: {
        amount: payload.amount,
        refType: payload.refType,
        refId: payload.refId,
        description: payload.description,
      },
    },
  );
  return data;
};
