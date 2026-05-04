import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE = "http://localhost:8080/api";
export const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  EXPIRES_AT: "expiresAt",
  REMEMBER_ME: "rememberMe",
} as const;

let accessToken: string | null = null;

export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

export const getAccessToken = () => accessToken;

const http = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

const addressAPI = axios.create({
  baseURL: "https://provinces.open-api.vn/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = (): string | null => accessToken;

let isRefreshing = false;
let refreshQueue: Array<(t: string | null) => void> = [];

const flushQueue = (t: string | null) => {
  refreshQueue.forEach((cb) => cb(t));
  refreshQueue = [];
};

export const clearAuth = () => {
  setAccessToken(null);
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  localStorage.removeItem(TOKEN_KEYS.REMEMBER_ME);
};

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;
    const url = original?.url || "";

    if (
      !original ||
      status !== 401 ||
      original._retry ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/login")
    ) {
      return Promise.reject(err);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(http(original));
          } else {
            reject(err);
          }
        });
      });
    }

    isRefreshing = true;
    console.log("%c🔄 [Interceptor] Token hết hạn → Đang gọi POST /auth/refresh...", "color:#f59e0b;font-weight:bold;font-size:13px");
    try {
      const r = await axios.post<{ accessToken: string }>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = r.data.accessToken;
      setAccessToken(newToken);
      flushQueue(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      // Thông báo AuthContext để restart countdown
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: { token: newToken } }));
      }
      console.log("%c✅ [Interceptor] NewAccessToken nhận được → Retry request", "color:#10b981;font-weight:bold;font-size:13px");
      return http(original);
    } catch (refreshErr) {
      // Bước 10: Refresh token không hợp lệ → force logout toàn bộ
      flushQueue(null);
      setAccessToken(null);
      if (typeof window !== "undefined") {
        // Dispatch event để AuthContext lắng nghe và clear user state
        window.dispatchEvent(new Event("auth:session-expired"));
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export const mockGet = async <T>(url: string, data: T): Promise<T> => {
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
