
import { useQuery } from '@tanstack/react-query';
import { ordersQuery } from '@/query/orders';

export const useOrders = () => {
  const { data, isLoading, isError, refetch } = useQuery(ordersQuery.all());

  return {
    orders: data || [],
    isLoading,
    isError,
    refetch
  };
};
