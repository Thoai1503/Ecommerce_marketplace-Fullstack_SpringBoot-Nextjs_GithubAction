
import { queryOptions } from '@tanstack/react-query';
import { getDashboardStats, getRecentOrders, getRevenueChartData, getTopProducts } from '@/service/admin';
import { DashboardPeriod } from '@/types/index';

export const adminQuery = {
  stats: (period: DashboardPeriod) => queryOptions({
    queryKey: ['admin', 'stats', period],
    queryFn: () => getDashboardStats(period),
  }),
  revenueChart: (period: DashboardPeriod) => queryOptions({
    queryKey: ['admin', 'revenue-chart', period],
    queryFn: () => getRevenueChartData(period),
  }),
  topProducts: (period: DashboardPeriod) => queryOptions({
    queryKey: ['admin', 'top-products', period],
    queryFn: () => getTopProducts(period),
  }),
  recentOrders: () => queryOptions({
    queryKey: ['admin', 'recent-orders'],
    queryFn: getRecentOrders,
  })
};
