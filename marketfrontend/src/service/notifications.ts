
import { mockGet } from '../lib/http';
import { AppNotification } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Đơn hàng mới #ORD-0001',
    message: 'Khách hàng Nguyễn Văn A vừa đặt đơn hàng trị giá 2.500.000₫',
    type: 'ORDER',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    link: '/admin/orders/1'
  },
  {
    id: 'n2',
    title: 'Cảnh báo tồn kho',
    message: 'Sản phẩm "iPhone 15 Pro Max" sắp hết hàng (Còn 2 sp).',
    type: 'ALERT',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    link: '/admin/products/p1'
  },
  {
    id: 'n3',
    title: 'Yêu cầu rút tiền mới',
    message: 'Seller Samsung Official yêu cầu rút 154.000.000₫',
    type: 'INFO',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    link: '/admin/finance/payments'
  },
  {
    id: 'n4',
    title: 'Hệ thống bảo trì',
    message: 'Hệ thống sẽ bảo trì vào 00:00 ngày mai để nâng cấp server.',
    type: 'SYSTEM',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'n5',
    title: 'Đánh giá 1 sao mới',
    message: 'Khách hàng vừa đánh giá 1 sao cho sản phẩm "Áo thun nam".',
    type: 'ALERT',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    link: '/admin/products/p5'
  }
];

export const getNotifications = async (): Promise<AppNotification[]> => {
  // Simulate fetching notifications
  // In a real app, this might accept pagination
  return await mockGet('/admin/notifications', MOCK_NOTIFICATIONS);
};

export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  await delay(300);
  const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
  if (notif) notif.isRead = true;
  return true;
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  await delay(500);
  MOCK_NOTIFICATIONS.forEach(n => n.isRead = true);
  return true;
};
