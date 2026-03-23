/**
 * Axios HTTP Client with Authentication Interceptors
 *
 * Features:
 * - Auto-attach access token to requests
 * - Auto-refresh token on 401
 * - Handle token expiration
 * - Clear auth on refresh failure
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/helper/api";

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  EXPIRES_AT: "expiresAt",
  REMEMBER_ME: "rememberMe",
} as const;

// Create axios instance
const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});
const addressAPI = axios.create({
  baseURL: "https://provinces.open-api.vn/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get token from storage
 */
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token from storage
 */
const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Check if token is expired
 */
const isTokenExpired = (): boolean => {
  if (typeof window === "undefined") return true;
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

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
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
    const error = new Error("No refresh token available") as AxiosError;
    processQueue(error);
    return null;
  }

  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, expiresIn } = response.data;

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

    // Redirect to login if we're in browser
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }

    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearAuth = () => {
  if (typeof window === "undefined") return;
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
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
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
  },
);

/**
 * Mock GET function for development/testing
 * Simulates an async HTTP GET request with a delay
 */
export const mockGet = async <T>(url: string, data: T): Promise<T> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return data;
};

export default http;
export { addressAPI };
