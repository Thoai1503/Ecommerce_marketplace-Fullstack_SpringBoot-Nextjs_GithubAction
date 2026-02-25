
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminQuery } from '@/query/admin';
import { DashboardPeriod } from '@/types/index';

export const useAdminDashboard = () => {
  const [period, setPeriod] = useState<DashboardPeriod>('today');

  const statsQuery = useQuery(adminQuery.stats(period));
  const chartQuery = useQuery(adminQuery.revenueChart(period));
  const topProductsQuery = useQuery(adminQuery.topProducts(period));
  const ordersQuery = useQuery(adminQuery.recentOrders());

  return {
    period,
    setPeriod,
    stats: statsQuery.data,
    chartData: chartQuery.data || [],
    topProducts: topProductsQuery.data || [],
    recentOrders: ordersQuery.data || [],
    isLoading: statsQuery.isLoading || chartQuery.isLoading || topProductsQuery.isLoading || ordersQuery.isLoading,
    isError: statsQuery.isError || chartQuery.isError || topProductsQuery.isError || ordersQuery.isError,
    lastUpdated: statsQuery.data?.lastUpdated ? new Date(statsQuery.data.lastUpdated) : new Date(),
  };
};
