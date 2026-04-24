
import { queryOptions } from '@tanstack/react-query';
import { getCategories, getCategoryById } from '@/service/categories';

export const categoriesQuery = {
  all: () => queryOptions({
    queryKey: ['admin', 'categories'],
    queryFn: getCategories,
  }),
  detail: (id: string) => queryOptions({
    queryKey: ['admin', 'categories', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  }),
};
