import { queryOptions } from '@tanstack/react-query';
import { getUsers } from '@/service/users';

export const usersQuery = {
  all: () => queryOptions({
    queryKey: ['admin', 'users'],
    queryFn: getUsers,
  }),
};