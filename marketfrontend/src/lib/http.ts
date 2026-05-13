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
import { ADDRESS_LOOKUP_API_URL, API_URL } from "@/helper/api";
import {
  clearAuth,
  getValidAccessToken,
  refreshAccessToken,
  shouldRedirectToLoginOnAuthFailure,
} from "@/lib/authSession";

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
  baseURL: ADDRESS_LOOKUP_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const shouldAttachAuth = (url?: string) => {
  if (!url) return true;

  return !(
    url.includes("/auth/login") ||
    url.includes("/auth/refresh") ||
    url.includes("/users/login")
  );
};

export { clearAuth };

/**
 * Request Interceptor: Attach token to requests
 */
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = shouldAttachAuth(config.url)
      ? await getValidAccessToken()
      : null;

    if (token) {
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
      const redirectOnAuthFailure = shouldRedirectToLoginOnAuthFailure();
      const newToken = await refreshAccessToken({
        clearOnFailure: true,
        redirectOnFailure: redirectOnAuthFailure,
      });

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

export const http2 = async (url: string, options?: RequestInit) => {
  const res = await fetch(API_URL + url, {
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
