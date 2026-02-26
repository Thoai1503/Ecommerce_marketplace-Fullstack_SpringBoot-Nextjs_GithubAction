
import { queryOptions } from '@tanstack/react-query';
import { getCoupons, getCouponById } from '@/service/coupons';

export const couponsQuery = {
  all: () => queryOptions({
    queryKey: ['admin', 'coupons'],
    queryFn: getCoupons,
  }),
  detail: (id: string) => queryOptions({
    queryKey: ['admin', 'coupons', id],
    queryFn: () => getCouponById(id),
    enabled: !!id,
  }),
};
