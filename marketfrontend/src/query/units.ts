
import { queryOptions } from '@tanstack/react-query';
import { getUnits, getUnitById } from '@/service/units';

export const unitsQuery = {
  all: () => queryOptions({
    queryKey: ['admin', 'units'],
    queryFn: getUnits,
  }),
  detail: (id: string) => queryOptions({
    queryKey: ['admin', 'units', id],
    queryFn: () => getUnitById(id),
    enabled: !!id,
  }),
};
