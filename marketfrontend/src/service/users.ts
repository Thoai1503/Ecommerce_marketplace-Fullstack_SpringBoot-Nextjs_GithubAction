
import http, { mockGet } from '../lib/http';
import { User, UserRole, UserStatus } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const BASE_USERS: User[] = [
  { id: '1',  email: 'admin@vietcommerce.vn',       fullName: 'Nguyễn Văn Admin',      role: 'ADMIN',       status: 'ACTIVE',   createdAt: '2023-01-01T08:00:00Z' },
  { id: '2',  email: 'seller.thoidai@gmail.com',    fullName: 'Trần Thị Lan',          role: 'SELLER',      status: 'ACTIVE',   createdAt: '2023-02-15T09:30:00Z' },
  { id: '3',  email: 'nguyen.minh.tuan@gmail.com',  fullName: 'Nguyễn Minh Tuấn',      role: 'USER',        status: 'ACTIVE',   createdAt: '2023-03-10T14:20:00Z' },
  { id: '4',  email: 'lequocbao99@gmail.com',       fullName: 'Lê Quốc Bảo',           role: 'USER',        status: 'BLOCKED',  createdAt: '2023-04-05T11:00:00Z' },
  { id: '5',  email: 'support@vietcommerce.vn',     fullName: 'Phạm Hữu Nghĩa',        role: 'ADMIN',       status: 'ACTIVE',   createdAt: '2023-01-02T08:00:00Z' },
  { id: '6',  email: 'shop.thoitrang.abc@gmail.com',fullName: 'Hoàng Thị Mai',          role: 'SELLER',      status: 'ACTIVE',   createdAt: '2023-05-20T10:00:00Z' },
  { id: '7',  email: 'tranvanlong@yahoo.com',       fullName: 'Trần Văn Long',          role: 'USER',        status: 'ACTIVE',   createdAt: '2023-06-15T16:00:00Z' },
  { id: '8',  email: 'vuthihuong2001@gmail.com',    fullName: 'Vũ Thị Hương',           role: 'USER',        status: 'ACTIVE',   createdAt: '2023-07-01T09:00:00Z' },
  { id: '9',  email: 'baduser.blocked@tempmail.io', fullName: 'Tài khoản vi phạm',      role: 'USER',        status: 'BLOCKED',  createdAt: '2023-08-12T23:00:00Z' },
  { id: '10', email: 'shop.congnghe.hcm@gmail.com', fullName: 'Đinh Công Nghệ',         role: 'SELLER',      status: 'ACTIVE',   createdAt: '2023-09-05T10:30:00Z' },
  { id: '11', email: 'phamthithao@gmail.com',       fullName: 'Phạm Thị Thảo',          role: 'USER',        status: 'ACTIVE',   createdAt: '2023-10-12T08:00:00Z' },
  { id: '12', email: 'shop.my.pham.luxury@gmail.com',fullName: 'Lý Thị Mỹ',             role: 'SELLER',      status: 'ACTIVE',   createdAt: '2023-11-01T10:00:00Z' },
  { id: '13', email: 'dovankhoa1995@gmail.com',     fullName: 'Đỗ Văn Khoa',            role: 'USER',        status: 'ACTIVE',   createdAt: '2023-11-20T09:00:00Z' },
  { id: '14', email: 'nguyenthikim@gmail.com',      fullName: 'Nguyễn Thị Kim',         role: 'USER',        status: 'BLOCKED',  createdAt: '2023-12-05T11:00:00Z' },
  { id: '15', email: 'superadmin@vietcommerce.vn',  fullName: 'Super Admin System',     role: 'SUPER_ADMIN', status: 'ACTIVE',   createdAt: '2023-01-01T00:00:00Z' },
];

const MOCK_USERS: User[] = Array.from({ length: 100 }, (_, i) => {
  const base = BASE_USERS[i % BASE_USERS.length];
  const uid = (i + 1).toString();
  return {
    ...base,
    id: uid,
  };
});

export const getUsers = async (): Promise<User[]> => {
  if (USE_MOCK) {
    return await mockGet('/admin/users', MOCK_USERS);
  }

  const res = await http.get<User[]>('/admin/users');
  return res.data.map(normalizeUser);
};

export const updateUserRole = async (id: string, newRole: UserRole): Promise<boolean> => {
  if (!USE_MOCK) {
    try {
      await http.patch(`/admin/users/${id}/role`, { role: newRole });
      return true;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể cập nhật vai trò người dùng.');
    }
  }

  await delay(800);
  const user = MOCK_USERS.find(u => u.id === id);
  if (user) {
    // --- Business Logic: Check KYC before upgrading to SELLER ---
    // For demo purposes, we assume emails containing "buyer" or "incomplete" lack KYC info
    if (newRole === 'SELLER' && (user.email.includes('buyer') || user.email.includes('incomplete'))) {
      throw new Error("User missing KYC information (Phone/ID). Cannot upgrade to SELLER.");
    }

    user.role = newRole;
    return true;
  }
  return false;
};

export const toggleUserStatus = async (id: string, newStatus: UserStatus): Promise<boolean> => {
  if (!USE_MOCK) {
    try {
      await http.patch(`/admin/users/${id}/status`, { status: newStatus });
      return true;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể cập nhật trạng thái người dùng.');
    }
  }

  await delay(800);
  const user = MOCK_USERS.find(u => u.id === id);
  if (user) {
    user.status = newStatus;
    
    // --- Business Logic: Revoke Token & Socket ---
    if (newStatus === 'BLOCKED') {
      console.log(`[SECURITY AUDIT] Blocking User ${id}:`);
      console.log(` - Revoking Access Tokens... DONE`);
      console.log(` - Terminating Socket Connections... DONE`);
      console.log(` - Clearing User Sessions... DONE`);
    }
    
    return true;
  }
  return false;
};

export const resetUserPassword = async (id: string): Promise<boolean> => {
  if (!USE_MOCK) {
    try {
      await http.post(`/admin/users/${id}/reset-password`);
      return true;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Không thể gửi email cấp lại mật khẩu.');
    }
  }

  await delay(800);
  const user = MOCK_USERS.find(u => u.id === id);
  if (user) {
    console.log(`[SECURITY AUDIT] Reset password link sent to ${user.email}`);
    return true;
  }
  return false;
};

const normalizeUser = (user: User): User => ({
  ...user,
  id: String(user.id),
  role: normalizeRole(user.role),
  status: user.status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
});

const normalizeRole = (role: UserRole | 'CUSTOMER' | string): UserRole => {
  if (role === 'CUSTOMER') return 'USER';
  if (role === 'SELLER' || role === 'ADMIN' || role === 'SUPER_ADMIN') return role;
  return 'USER';
};
