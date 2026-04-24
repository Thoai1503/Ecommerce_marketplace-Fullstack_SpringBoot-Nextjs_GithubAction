
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeQuery } from '@/query/finance';
import { approveSellerPayment } from '@/service/finance';

export const useFinanceOverview = (period: string) => {
  const stats = useQuery(financeQuery.stats());
  const chart = useQuery(financeQuery.chart(period));
  const recentTransactions = useQuery(financeQuery.recentTransactions());

  return {
    stats: stats.data,
    chartData: chart.data || [],
    recentTransactions: recentTransactions.data || [],
    isLoading: stats.isLoading || chart.isLoading || recentTransactions.isLoading,
    isError: stats.isError || chart.isError || recentTransactions.isError,
    refetch: () => {
      stats.refetch();
      chart.refetch();
      recentTransactions.refetch();
    }
  };
};

export const useTransactions = () => {
  const { data, isLoading, isError, refetch } = useQuery(financeQuery.transactions());
  return {
    transactions: data || [],
    isLoading,
    isError,
    refetch
  };
};

export const useSellerPayments = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery(financeQuery.payments());

  const approveMutation = useMutation({
    mutationFn: approveSellerPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'payments'] });
    },
  });

  return {
    payments: data || [],
    isLoading,
    isError,
    refetch,
    approvePayment: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
  };
};
