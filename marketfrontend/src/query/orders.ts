
import { queryOptions } from '@tanstack/react-query';
import { getOrders } from '@/service/orders';

export const ordersQuery = {
  all: () => queryOptions({
    queryKey: ['admin', 'orders'],
    queryFn:() => getOrders(),
  }),
};
