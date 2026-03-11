export type UserRole = 'USER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export interface User {
  id: string;           // FE dùng string, map từ id (number) của DB
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;       // map từ user_type
  status: UserStatus;   // map từ is_active
  createdAt: string;
  lastLogin?: string;
}
