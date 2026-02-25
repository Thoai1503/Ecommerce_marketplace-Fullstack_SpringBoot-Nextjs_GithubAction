
import { mockGet } from '../lib/http';
import { GeneralSettings, AdminProfile, NotificationSettings } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- MOCK DATA ---
let MOCK_GENERAL_SETTINGS: GeneralSettings = {
  storeName: 'Venton Marketplace',
  storeLogo: null,
  storeDescription: 'Marketplace hàng đầu Việt Nam cung cấp sản phẩm chính hãng.',
  email: 'contact@venton.com',
  phone: '1900123456',
  address: '123 Đường ABC, Quận XYZ, TP.HCM',
  currency: 'VND (₫) - Vietnamese Dong',
  timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
};

let MOCK_ADMIN_PROFILE: AdminProfile = {
  id: 'admin-01',
  name: 'Nguyễn Văn Admin',
  email: 'admin@venton.com',
  phone: '0901234567',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  role: 'ADMIN',
};

let MOCK_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailOrder: true,
  emailStock: true,
  emailWeeklyReport: false,
  systemSound: true,
  systemPopup: true,
  securityLogin: true,
};

// --- GENERAL SETTINGS API ---

export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  return await mockGet('/admin/settings/general', MOCK_GENERAL_SETTINGS);
};

export const updateGeneralSettings = async (data: Partial<GeneralSettings>): Promise<GeneralSettings> => {
  await delay(1000);
  MOCK_GENERAL_SETTINGS = { ...MOCK_GENERAL_SETTINGS, ...data };
  return MOCK_GENERAL_SETTINGS;
};

// --- ADMIN PROFILE API ---

export const getAdminProfile = async (): Promise<AdminProfile> => {
  return await mockGet('/admin/settings/profile', MOCK_ADMIN_PROFILE);
};

export const updateAdminProfile = async (data: Partial<AdminProfile>): Promise<AdminProfile> => {
  await delay(1000);
  MOCK_ADMIN_PROFILE = { ...MOCK_ADMIN_PROFILE, ...data };
  return MOCK_ADMIN_PROFILE;
};

export const changePassword = async (data: { current: string; new: string }): Promise<boolean> => {
  await delay(1500);
  // Mock validation
  if (data.current !== '12345678') { // Mock current password check
    throw new Error('Mật khẩu hiện tại không đúng.');
  }
  return true;
};

// --- NOTIFICATION SETTINGS API ---

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  return await mockGet('/admin/settings/notifications', MOCK_NOTIFICATION_SETTINGS);
};

export const updateNotificationSettings = async (data: Partial<NotificationSettings>): Promise<NotificationSettings> => {
  await delay(800);
  MOCK_NOTIFICATION_SETTINGS = { ...MOCK_NOTIFICATION_SETTINGS, ...data };
  return MOCK_NOTIFICATION_SETTINGS;
};
