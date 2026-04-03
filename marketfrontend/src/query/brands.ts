import { queryOptions } from '@tanstack/react-query';
import { getBrands, getBrandById } from '@/service/brands';

export const brandsQuery = {
  all: () => queryOptions({
    queryKey: ['admin', 'brands'],
    queryFn: getBrands,
  }),

  detail: (id: number) => queryOptions({
    queryKey: ['admin', 'brands', id],
    queryFn: () => getBrandById(id),
  }),
};