/**
 * Authentication Types
 */

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'seller' | 'user';
  };
  expiresIn?: number; // seconds
  refreshExpiresIn?: number; // seconds
  idleTimeoutSeconds?: number; // seconds
}

export interface AuthError {
  message: string;
  code?: string;
  field?: 'email' | 'password' | 'general';
}

export interface TokenStorage {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // timestamp
  rememberMe?: boolean;
}
