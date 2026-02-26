
import { mockGet } from '../lib/http';
import { User, UserRole, UserStatus } from '@/types/index';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const BASE_USERS: User[] = [
  { id: 'U-0001', email: 'admin@venton.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2023-01-01T08:00:00Z', lastLogin: '2024-03-15T10:00:00Z' },
  { id: 'U-0002', email: 'seller@store.com', role: 'SELLER', status: 'ACTIVE', createdAt: '2023-02-15T09:30:00Z', lastLogin: '2024-03-14T15:30:00Z' },
  { id: 'U-0003', email: 'buyer1@gmail.com', role: 'USER', status: 'ACTIVE', createdAt: '2023-03-10T14:20:00Z', lastLogin: '2024-03-10T09:00:00Z' },
  { id: 'U-0004', email: 'spammer@fake.com', role: 'USER', status: 'BLOCKED', createdAt: '2023-04-05T11:00:00Z', lastLogin: '2023-04-06T11:00:00Z' },
  { id: 'U-0005', email: 'support@venton.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2023-01-02T08:00:00Z', lastLogin: '2024-03-15T08:30:00Z' },
  { id: 'U-0006', email: 'fashion_store@biz.vn', role: 'SELLER', status: 'ACTIVE', createdAt: '2023-05-20T10:00:00Z', lastLogin: '2024-03-12T14:00:00Z' },
  { id: 'U-0007', email: 'john.doe@email.com', role: 'USER', status: 'ACTIVE', createdAt: '2023-06-15T16:00:00Z', lastLogin: '2024-02-28T10:00:00Z' },
  { id: 'U-0008', email: 'jane.smith@email.com', role: 'USER', status: 'ACTIVE', createdAt: '2023-07-01T09:00:00Z', lastLogin: '2024-03-01T11:00:00Z' },
  { id: 'U-0009', email: 'bad.actor@hack.net', role: 'USER', status: 'BLOCKED', createdAt: '2023-08-12T23:00:00Z', lastLogin: '2023-08-13T00:00:00Z' },
  { id: 'U-0010', email: 'tech_gadgets@shop.com', role: 'SELLER', status: 'ACTIVE', createdAt: '2023-09-05T10:30:00Z', lastLogin: '2024-03-15T13:00:00Z' },
];

const MOCK_USERS: User[] = Array.from({ length: 100 }, (_, i) => {
  const base = BASE_USERS[i % BASE_USERS.length];
  return {
    ...base,
    id: `${base.id}_${i}`,
    email: `${i}_${base.email}`,
  };
});

export const getUsers = async (): Promise<User[]> => {
  return await mockGet('/admin/users', MOCK_USERS);
};

export const updateUserRole = async (id: string, newRole: UserRole): Promise<boolean> => {
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
