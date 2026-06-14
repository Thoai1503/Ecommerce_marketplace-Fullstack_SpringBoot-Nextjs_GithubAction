import axios, { AxiosError } from "axios";
import { API_URL } from "@/helper/api";

const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  EXPIRES_AT: "expiresAt",
  REMEMBER_ME: "rememberMe",
} as const;

const ACCESS_REFRESH_WINDOW_MS = 2 * 60 * 1000;
const DEFAULT_COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60;
const AUTH_REQUIRED_PATH_PREFIXES = [
  "/checkout",
  "/purchase",
  "/profile",
  "/orders",
  "/admin",
  "/seller",
] as const;

let refreshPromise: Promise<string | null> | null = null;

const isBrowser = () => typeof window !== "undefined";

const isPathOrChild = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`);

export const isAuthRequiredPathname = (pathname?: string | null) => {
  const value = pathname || "/";
  return AUTH_REQUIRED_PATH_PREFIXES.some((path) => isPathOrChild(value, path));
};

export const shouldRedirectToLoginOnAuthFailure = () =>
  isBrowser() && isAuthRequiredPathname(window.location.pathname);

export const getLoginRedirectUrl = () => {
  if (!isBrowser()) return "/login";

  const target = `${window.location.pathname}${window.location.search}`;
  return `/login?redirect=${encodeURIComponent(target)}`;
};

const normalizeRole = (role?: string | null) => {
  const value = role?.trim().toLowerCase();

  if (value === "admin") return "admin";
  if (value === "seller" || value === "both") return "seller";
  return "buyer";
};

const readStoredUser = () => {
  if (!isBrowser()) return {};

  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${value}; path=/; max-age=${Math.max(
    0,
    Math.floor(maxAge),
  )}; SameSite=Lax`;
};

export const getStoredAccessToken = () => {
  if (!isBrowser()) return null;
  return (
    localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) ||
    localStorage.getItem("token")
  );
};

export const getStoredRefreshToken = () => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

export const getAccessTokenExpiresAt = () => {
  if (!isBrowser()) return 0;

  const expiresAt = Number(localStorage.getItem(TOKEN_KEYS.EXPIRES_AT) || 0);
  return Number.isFinite(expiresAt) ? expiresAt : 0;
};

export const isAccessTokenExpiring = (
  minValidityMs = ACCESS_REFRESH_WINDOW_MS,
) => {
  const expiresAt = getAccessTokenExpiresAt();
  if (!expiresAt) return false;
  return Date.now() + minValidityMs >= expiresAt;
};

export const clearAuth = () => {
  if (!isBrowser()) return;

  [
    TOKEN_KEYS.ACCESS_TOKEN,
    TOKEN_KEYS.REFRESH_TOKEN,
    TOKEN_KEYS.EXPIRES_AT,
    TOKEN_KEYS.REMEMBER_ME,
    "expiresIn",
    "refreshExpiresAt",
    "idleTimeoutSeconds",
    "lastActivityAt",
    "token",
    "user",
  ].forEach((key) => localStorage.removeItem(key));

  ["token", "refreshToken", "role", "user"].forEach((name) =>
    setCookie(name, "", 0),
  );

  window.dispatchEvent(new CustomEvent("auth:cleared"));
};

export const markAuthActivity = () => {
  if (!isBrowser() || !getStoredAccessToken()) return;
  localStorage.setItem("lastActivityAt", String(Date.now()));
};

export const storeAuthTokens = (payload: any) => {
  if (!isBrowser() || !payload) return null;

  const data = payload?.data ?? payload;
  const accessToken = data?.accessToken ?? data?.token ?? "";
  const refreshToken =
    data?.refreshToken ?? data?.refresh_token ?? getStoredRefreshToken();
  const expiresIn = Number(data?.expiresIn ?? 0);
  const refreshExpiresIn = Number(data?.refreshExpiresIn ?? 0);
  const idleTimeoutSeconds = Number(data?.idleTimeoutSeconds ?? 0);

  if (!accessToken) return null;

  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem("token", accessToken);

  if (refreshToken) {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  }

  if (expiresIn > 0) {
    localStorage.setItem(
      TOKEN_KEYS.EXPIRES_AT,
      String(Date.now() + expiresIn * 1000),
    );
  }

  if (refreshExpiresIn > 0) {
    localStorage.setItem(
      "refreshExpiresAt",
      String(Date.now() + refreshExpiresIn * 1000),
    );
  }

  if (idleTimeoutSeconds > 0) {
    localStorage.setItem("idleTimeoutSeconds", String(idleTimeoutSeconds));
  }

  localStorage.setItem("lastActivityAt", String(Date.now()));

  const storedUser = readStoredUser();
  const role = normalizeRole(
    data?.userType ?? data?.role ?? storedUser?.userType ?? storedUser?.role,
  );
  const userId = Number(data?.id ?? data?.userId ?? storedUser?.id ?? 0);
  const sessionMaxAge =
    refreshExpiresIn > 0 ? refreshExpiresIn : DEFAULT_COOKIE_MAX_AGE_SECONDS;

  setCookie(
    "token",
    accessToken,
    expiresIn > 0 ? expiresIn : DEFAULT_COOKIE_MAX_AGE_SECONDS,
  );
  setCookie("role", role, sessionMaxAge);

  if (Number.isFinite(userId) && userId > 0) {
    setCookie("user", String(userId), sessionMaxAge);
  }

  window.dispatchEvent(new CustomEvent("auth:token-refreshed"));
  return accessToken;
};

export const refreshAccessToken = async ({
  clearOnFailure = false,
  redirectOnFailure = false,
}: {
  clearOnFailure?: boolean;
  redirectOnFailure?: boolean;
} = {}) => {
  if (!isBrowser()) return null;

  if (refreshPromise) return refreshPromise;

  const refreshToken = getStoredRefreshToken();

  refreshPromise = axios
    .post(`${API_URL}/auth/refresh`, refreshToken ? { refreshToken } : {}, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    })
    .then((response) => storeAuthTokens(response.data))
    .catch((error: AxiosError) => {
      if (clearOnFailure) {
        clearAuth();

        if (redirectOnFailure) {
          window.location.href = getLoginRedirectUrl();
        }
      }

      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const getValidAccessToken = async (
  minValidityMs = ACCESS_REFRESH_WINDOW_MS,
) => {
  const token = getStoredAccessToken();

  if (!token) return null;
  if (!isAccessTokenExpiring(minValidityMs)) return token;

  const refreshedToken = await refreshAccessToken();
  if (refreshedToken) return refreshedToken;

  return isAccessTokenExpiring(0) ? null : token;
};
