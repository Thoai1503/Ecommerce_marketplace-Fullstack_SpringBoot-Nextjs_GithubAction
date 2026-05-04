import http from '@/lib/http';
import { AdminUser } from '@/types';

export interface CreateAdminPayload {
  email: string;
  fullName: string;
  phone?: string;
}

export async function getAdmins(): Promise<AdminUser[]> {
  const res = await http.get('/admin/super/users');
  const data = res.data?.data ?? res.data ?? [];
  return (data as any[]).map((item: any) => ({
    id: String(item.id),
    userId: item.userId,
    email: item.userEmail ?? '',
    userName: item.userName ?? '',
    role: item.roleName as 'ADMIN' | 'SUPER_ADMIN',
    createdAt: item.createdAt ?? '',
    createdByName: item.createdByName ?? '',
    isActive: item.isActive ?? true,
    accountActive: item.accountActive ?? true,
    lastLogin: item.lastLogin ?? undefined,
  }));
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminUser> {
  const res = await http.post('/admin/super/users', payload);
  const item = res.data?.data ?? res.data;
  return {
    id: String(item.id),
    userId: item.userId,
    email: item.userEmail ?? '',
    userName: item.userName ?? '',
    role: item.roleName as 'ADMIN' | 'SUPER_ADMIN',
    createdAt: item.createdAt ?? '',
    isActive: true,
    accountActive: item.accountActive ?? true,
    lastLogin: item.lastLogin ?? undefined,
  };
}

export async function grantAdmin(userId: number): Promise<AdminUser> {
  const res = await http.post('/admin/super/roles/grant', { userId });
  const item = res.data?.data ?? res.data;
  return {
    id: String(item.id),
    userId: item.userId,
    email: item.userEmail ?? '',
    userName: item.userName ?? '',
    role: item.roleName as 'ADMIN' | 'SUPER_ADMIN',
    createdAt: item.createdAt ?? '',
    isActive: true,
    accountActive: item.accountActive ?? true,
    lastLogin: item.lastLogin ?? undefined,
  };
}

export async function revokeAdmin(userId: number | string): Promise<void> {
  await http.delete(`/admin/super/roles/${userId}`);
}

export async function resetAdminPassword(adminId: number | string): Promise<void> {
  await http.post('/admin/super/reset-password', { adminId: Number(adminId) });
}

export async function updateAdminStatus(adminId: number | string, status: 'ACTIVE' | 'BLOCKED'): Promise<AdminUser> {
  const res = await http.patch(`/admin/super/users/${Number(adminId)}/status`, { status });
  const item = res.data?.data ?? res.data;
  return {
    id: String(item.id),
    userId: item.userId,
    email: item.userEmail ?? '',
    userName: item.userName ?? '',
    role: item.roleName as 'ADMIN' | 'SUPER_ADMIN',
    createdAt: item.createdAt ?? '',
    createdByName: item.createdByName ?? '',
    isActive: item.isActive ?? true,
    accountActive: item.accountActive ?? status === 'ACTIVE',
    lastLogin: item.lastLogin ?? undefined,
  };
}
