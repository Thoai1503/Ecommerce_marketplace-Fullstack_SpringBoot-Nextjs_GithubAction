
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsQuery } from '@/query/settings';
import { updateGeneralSettings, updateAdminProfile, changePassword, updateNotificationSettings } from '@/service/settings';

export const useGeneralSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(settingsQuery.general());

  const updateMutation = useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'general'] });
    },
  });

  return {
    settings: data,
    isLoading,
    isError,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const useAdminProfile = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(settingsQuery.profile());

  const updateMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'profile'] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
  });

  return {
    profile: data,
    isLoading,
    isError,
    updateProfile: updateMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
};

export const useNotificationSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(settingsQuery.notifications());

  const updateMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'notifications'] });
    },
  });

  return {
    notifications: data,
    isLoading,
    isError,
    updateNotifications: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
