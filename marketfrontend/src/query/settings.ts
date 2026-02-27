
import { queryOptions } from '@tanstack/react-query';
import { getGeneralSettings, getAdminProfile, getNotificationSettings } from '@/service/settings';

export const settingsQuery = {
  general: () => queryOptions({
    queryKey: ['admin', 'settings', 'general'],
    queryFn: getGeneralSettings,
  }),
  profile: () => queryOptions({
    queryKey: ['admin', 'settings', 'profile'],
    queryFn: getAdminProfile,
  }),
  notifications: () => queryOptions({
    queryKey: ['admin', 'settings', 'notifications'],
    queryFn: getNotificationSettings,
  }),
};
