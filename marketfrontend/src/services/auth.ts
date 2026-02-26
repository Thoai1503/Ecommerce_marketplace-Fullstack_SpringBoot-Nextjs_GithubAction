/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import http from '@/lib/http';
import type { LoginRequest, LoginResponse, AuthError } from '@/types/auth';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
} as const;

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  /**
   * Get current user info
   */
  async getCurrentUser() {
    const response = await http.get(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await http.post(AUTH_ENDPOINTS.REFRESH, { refreshToken });
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await http.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Even if API call fails, we should clear local state
      console.error('Logout API call failed:', error);
    }
  },
};
