import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsQuery } from '@/query/notifications';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/service/notifications';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(notificationsQuery.all());

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  const unreadCount = data ? data.filter(n => !n.isRead).length : 0;

  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    isError,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutateAsync,
  };
};
