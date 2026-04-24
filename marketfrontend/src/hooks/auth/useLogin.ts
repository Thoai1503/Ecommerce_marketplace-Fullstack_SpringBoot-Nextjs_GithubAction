/**
 * useLogin Hook
 * React Query mutation for login
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/auth';
import type { LoginRequest, LoginResponse } from '@/types/auth';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  EXPIRES_AT: 'expiresAt',
  REMEMBER_ME: 'rememberMe',
} as const;

/**
 * Store tokens securely
 */
const storeTokens = (data: LoginResponse, rememberMe: boolean) => {
  if (typeof window === 'undefined') return;

  // Store access token
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.accessToken);

  // Store refresh token if provided
  if (data.refreshToken) {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, data.refreshToken);
  }

  // Store expiration if provided
  if (data.expiresIn) {
    const expiresAt = Date.now() + data.expiresIn * 1000;
    localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString());
  }

  // Store remember me preference
  localStorage.setItem(TOKEN_KEYS.REMEMBER_ME, rememberMe.toString());

  // If not remember me, use sessionStorage for additional security
  if (!rememberMe) {
    sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.accessToken);
  }
};

export const useLogin = () => {
  const router = useRouter();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    
    onSuccess: (data, variables) => {
      // Store tokens
      storeTokens(data, variables.rememberMe ?? false);

      // Show success message
      success(`Xin chào, ${data.user.name}! Đang chuyển hướng...`);

      // Determine redirect based on role
      const redirectPath = getRedirectPath(data.user.role);
      
      // Small delay for UX (toast visibility)
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    },

    onError: (err: any) => {
      // Extract error message
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Đăng nhập thất bại. Vui lòng thử lại.';
      
      error(errorMessage);
    },
  });
};

/**
 * Get redirect path based on user role
 */
const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'seller':
      return '/seller';
    case 'user':
      return '/';
    default:
      return '/';
  }
};
