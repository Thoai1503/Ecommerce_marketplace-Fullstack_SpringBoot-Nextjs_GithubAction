"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/helper/api';

/**
 * User interface
 */
export interface User {
  id: number;
  email: string;
  role: 'admin' | 'seller' | 'user';
  name: string;
}

/**
 * useAuth Hook
 * 
 * Sử dụng để:
 * - Check authentication status
 * - Get current user info
 * - Check user role
 * - Logout
 * 
 * @param requiredRole - Role bắt buộc (optional)
 * @returns { user, isAuthenticated, isLoading, logout }
 */
export const useAuth = (requiredRole?: 'admin' | 'seller' | 'user') => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify token với backend
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Check role nếu có yêu cầu
          if (requiredRole && userData.role !== requiredRole) {
            // Không đúng role → redirect về unauthorized
            router.push('/unauthorized');
            setIsLoading(false);
            return;
          }

          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token không hợp lệ → xóa token
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  /**
   * Logout function
   * - Xóa token
   - Clear user state
   * - Redirect về login
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
};
