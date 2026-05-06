"use client";

import { API_URL } from "@/helper/api";
import axios from "axios";
import { useEffect } from "react";

const getStoredToken = () =>
  localStorage.getItem("accessToken") || localStorage.getItem("token");

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

const clearBrowserAuth = () => {
  [
    "accessToken",
    "refreshToken",
    "expiresAt",
    "expiresIn",
    "refreshExpiresAt",
    "idleTimeoutSeconds",
    "lastActivityAt",
    "rememberMe",
    "token",
    "user",
  ].forEach((key) => localStorage.removeItem(key));

  ["token", "refreshToken", "role", "user"].forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
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
      if (!getStoredToken()) return;

      const now = Date.now();
      if (now - lastActivityWrite < 5000) return;

      lastActivityWrite = now;
      localStorage.setItem("lastActivityAt", String(now));
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
        clearBrowserAuth();
        if (redirectToLogin) {
          window.location.href = "/login";
        }
      }
    };

    const axiosInterceptor = axios.interceptors.request.use((config) => {
      markActivity();

      const token = getStoredToken();
      const requestUrl = new URL(
        config.url || "",
        config.baseURL || window.location.origin,
      ).toString();

      if (token && shouldAttachAuth(requestUrl)) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      markActivity();

      const requestUrl =
        typeof input === "string" || input instanceof URL ? String(input) : input.url;
      const token = getStoredToken();

      if (!token || !shouldAttachAuth(requestUrl)) {
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
      const token = getStoredToken();
      if (!token) return;

      const lastActivityAt = Number(
        localStorage.getItem("lastActivityAt") || Date.now(),
      );
      const idleTimeoutMs = getIdleTimeoutSeconds() * 1000;

      if (Date.now() - lastActivityAt >= idleTimeoutMs) {
        void logoutForIdle(originalFetch);
      }
    }, 15000);

    return () => {
      axios.interceptors.request.eject(axiosInterceptor);
      window.fetch = originalFetch;
      window.clearInterval(idleTimer);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, markActivity),
      );
    };
  }, []);

  return null;
}
