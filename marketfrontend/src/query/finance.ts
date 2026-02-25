
import { queryOptions } from '@tanstack/react-query';
import { getFinanceStats, getRevenueChartData, getTransactions, getRecentTransactions, getSellerPayments } from '@/service/finance';

export const financeQuery = {
  stats: () => queryOptions({
    queryKey: ['admin', 'finance', 'stats'],
    queryFn: getFinanceStats,
  }),
  chart: (period: string) => queryOptions({
    queryKey: ['admin', 'finance', 'chart', period],
    queryFn: () => getRevenueChartData(period),
  }),
  recentTransactions: () => queryOptions({
    queryKey: ['admin', 'finance', 'transactions', 'recent'],
    queryFn: getRecentTransactions,
  }),
  transactions: () => queryOptions({
    queryKey: ['admin', 'finance', 'transactions', 'all'],
    queryFn: getTransactions,
  }),
  payments: () => queryOptions({
    queryKey: ['admin', 'finance', 'payments'],
    queryFn: getSellerPayments,
  }),
};
