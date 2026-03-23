/**
 * Axios HTTP Client with Authentication Interceptors
<<<<<<< HEAD
 * 
=======
 *
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
 * Features:
 * - Auto-attach access token to requests
 * - Auto-refresh token on 401
 * - Handle token expiration
 * - Clear auth on refresh failure
 */

<<<<<<< HEAD
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/helper/api';

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  EXPIRES_AT: 'expiresAt',
  REMEMBER_ME: 'rememberMe',
=======
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/helper/api";

const API_BASE = "http://localhost:8080/api";

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  EXPIRES_AT: "expiresAt",
  REMEMBER_ME: "rememberMe",
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
} as const;

// Create axios instance
const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
<<<<<<< HEAD
    'Content-Type': 'application/json',
=======
    "Content-Type": "application/json",
  },
});
const addressAPI = axios.create({
  baseURL: "https://provinces.open-api.vn/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  },
});

/**
 * Get token from storage
 */
const getToken = (): string | null => {
<<<<<<< HEAD
  if (typeof window === 'undefined') return null;
=======
  if (typeof window === "undefined") return null;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token from storage
 */
const getRefreshToken = (): string | null => {
<<<<<<< HEAD
  if (typeof window === 'undefined') return null;
=======
  if (typeof window === "undefined") return null;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Check if token is expired
 */
const isTokenExpired = (): boolean => {
<<<<<<< HEAD
  if (typeof window === 'undefined') return true;
=======
  if (typeof window === "undefined") return true;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  const expiresAt = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT);
  if (!expiresAt) return false; // No expiration set
  return Date.now() >= parseInt(expiresAt, 10);
};

/**
 * Refresh access token
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null | PromiseLike<string | null>) => void;
  reject: (reason?: unknown) => void;
}> = [];

<<<<<<< HEAD
const processQueue = (error: AxiosError | null, token: string | null = null) => {
=======
const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    // Wait for ongoing refresh
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }) as Promise<string | null>;
  }

  isRefreshing = true;
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    isRefreshing = false;
<<<<<<< HEAD
    const error = new Error('No refresh token available') as AxiosError;
=======
    const error = new Error("No refresh token available") as AxiosError;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
    processQueue(error);
    return null;
  }

  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, expiresIn } = response.data;
<<<<<<< HEAD
    
=======

>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
    // Store new token
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString());
    }

    isRefreshing = false;
    processQueue(null, accessToken);
    return accessToken;
  } catch (error) {
    // Refresh failed - clear all tokens and redirect to login
    clearAuth();
    isRefreshing = false;
    processQueue(error as AxiosError);
<<<<<<< HEAD
    
    // Redirect to login if we're in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    
=======

    // Redirect to login if we're in browser
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }

>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearAuth = () => {
<<<<<<< HEAD
  if (typeof window === 'undefined') return;
=======
  if (typeof window === "undefined") return;
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  localStorage.removeItem(TOKEN_KEYS.REMEMBER_ME);
};

/**
 * Request Interceptor: Attach token to requests
 */
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach token if available
    const token = getToken();
    if (token && !isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData
    if (config.data instanceof FormData) {
<<<<<<< HEAD
      delete config.headers['Content-Type'];
=======
      delete config.headers["Content-Type"];
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
    }

    return config;
  },
<<<<<<< HEAD
  (error) => Promise.reject(error)
=======
  (error) => Promise.reject(error),
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
);

/**
 * Response Interceptor: Handle 401 and refresh token
 */
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      }
    }

    return Promise.reject(error);
<<<<<<< HEAD
  }
=======
  },
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
);

/**
 * Mock GET function for development/testing
 * Simulates an async HTTP GET request with a delay
 */
export const mockGet = async <T>(url: string, data: T): Promise<T> => {
  // Simulate network delay
<<<<<<< HEAD
  await new Promise(resolve => setTimeout(resolve, 300));
  return data;
};

export default http;
=======
  await new Promise((resolve) => setTimeout(resolve, 300));
  return data;
};

export const http2 = async (url: string, options?: RequestInit) => {
  const res = await fetch(API_BASE + url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) throw new Error("API error");

  return res.json();
};

export default http;
export { addressAPI };
>>>>>>> a1ca836ab366b9e638f7e8f5f45978e34bac9691
