
import { queryOptions } from '@tanstack/react-query';
import { getNotifications } from '@/service/notifications';

export const notificationsQuery = {
  all: () => queryOptions({
    queryKey: ['admin', 'notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000, // Auto refetch every 30s to simulate real-time
  }),
};
