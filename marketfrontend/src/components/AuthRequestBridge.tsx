"use client";

import { API_URL } from "@/helper/api";
import {
  clearAuth,
  getStoredAccessToken,
  getValidAccessToken,
  markAuthActivity,
} from "@/lib/authSession";
import axios from "axios";
import { useEffect } from "react";

const normalizeRole = (role?: string | null) => {
  const value = role?.trim().toLowerCase();

  if (value === "admin") return "admin";
  if (value === "seller" || value === "both") return "seller";
  return "buyer";
};

const getStoredRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return normalizeRole(user?.userType ?? user?.role);
  } catch {
    return "buyer";
  }
};

const getIdleTimeoutSeconds = () => {
  const configured = Number(localStorage.getItem("idleTimeoutSeconds") || 0);
  if (configured > 0) return configured;

  const role = getStoredRole();
  if (role === "admin") return 30 * 60;
  return 60 * 60;
};

const shouldAttachAuth = (url: string) => {
  if (!url || url.includes("/auth/login") || url.includes("/auth/refresh")) {
    return false;
  }

  try {
    const targetUrl = new URL(url, window.location.origin);
    const apiUrl = new URL(API_URL, window.location.origin);
    return targetUrl.origin === apiUrl.origin;
  } catch {
    return url.startsWith(API_URL);
  }
};

export default function AuthRequestBridge() {
  useEffect(() => {
    let lastActivityWrite = 0;
    let isIdleLogoutRunning = false;

    const markActivity = () => {
      if (!getStoredAccessToken()) return;

      const now = Date.now();
      if (now - lastActivityWrite < 5000) return;

      lastActivityWrite = now;
      markAuthActivity();
    };

    const isIdleExpired = () => {
      const lastActivityAt = Number(
        localStorage.getItem("lastActivityAt") || Date.now(),
      );
      const idleTimeoutMs = getIdleTimeoutSeconds() * 1000;

      return Date.now() - lastActivityAt >= idleTimeoutMs;
    };

    const logoutForIdle = async (
      fetchFn: typeof window.fetch,
      redirectToLogin = true,
    ) => {
      if (isIdleLogoutRunning) return;

      isIdleLogoutRunning = true;

      try {
        await fetchFn(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Client state still needs to be cleared even if the logout request fails.
      } finally {
        clearAuth();
        if (redirectToLogin) {
          window.location.href = "/login";
        }
      }
    };

    const axiosInterceptor = axios.interceptors.request.use(async (config) => {
      markActivity();

      const requestUrl = new URL(
        config.url || "",
        config.baseURL || window.location.origin,
      ).toString();

      if (!shouldAttachAuth(requestUrl)) {
        return config;
      }

      const token = await getValidAccessToken();

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      markActivity();

      const requestUrl =
        typeof input === "string" || input instanceof URL ? String(input) : input.url;

      if (!shouldAttachAuth(requestUrl)) {
        return originalFetch(input, init);
      }

      const token = await getValidAccessToken();

      if (!token) {
        return originalFetch(input, init);
      }

      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );

      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return originalFetch(input, {
        ...init,
        headers,
      });
    };

    const activityEvents = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
      "visibilitychange",
    ] as const;

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, markActivity, { passive: true }),
    );

    markActivity();

    const idleTimer = window.setInterval(() => {
      const token = getStoredAccessToken();
      if (!token) return;

      if (isIdleExpired()) {
        void logoutForIdle(originalFetch);
      }
    }, 15000);

    const refreshTimer = window.setInterval(() => {
      const token = getStoredAccessToken();
      if (!token || isIdleExpired()) return;

      void getValidAccessToken();
    }, 30000);

    return () => {
      axios.interceptors.request.eject(axiosInterceptor);
      window.fetch = originalFetch;
      window.clearInterval(idleTimer);
      window.clearInterval(refreshTimer);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, markActivity),
      );
    };
  }, []);

  return null;
}
