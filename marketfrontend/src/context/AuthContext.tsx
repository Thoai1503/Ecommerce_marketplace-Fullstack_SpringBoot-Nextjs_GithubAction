"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import http, { baseURL, setAccessToken } from "@/lib/http";
import { ToastProvider } from "@/context/ToastContext";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "SELLER" | "CUSTOMER";
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

// ─── JWT Console Logger (DEV only) ───────────────────────────────────────────
const decodeExp = (token: string): number => {
  try {
    return JSON.parse(atob(token.split(".")[1])).exp as number;
  } catch {
    return 0;
  }
};

const shortToken = (token: string) => token.substring(0, 28) + "...";

const logTokenReceived = (token: string, user: AuthUser, label = "AccessToken") => {
  const exp = decodeExp(token);
  const secs = Math.max(0, exp - Math.floor(Date.now() / 1000));
  // console.log(
  //   "%c╔══════════════════════════════════════════╗\n" +
  //   "║   🔐 JWT Auth Logger — VietCommerce Hub   ║\n" +
  //   "╚══════════════════════════════════════════╝",
  //   "color:#6366f1;font-weight:bold"
  // );
  // console.log(`%c🔑 ${label}:`, "color:#10b981;font-weight:bold", shortToken(token));
  // console.log("%c👤 User:", "color:#10b981;font-weight:bold", `${user.email} (${user.role})`);
  // console.log(`%c⏱️  Hết hạn sau: ${secs}s`, "color:#f59e0b;font-weight:bold"); 
};
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUserRef = useRef<AuthUser | null>(null);

  // Khởi động đồng hồ đếm ngược hết hạn token
  const startCountdown = (token: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const exp = decodeExp(token);

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, exp - Math.floor(Date.now() / 1000));
      if (remaining > 0) {
        // 🎓 BẬT KHI THUYẾT TRÌNH — comment lại khi dev
        // console.log(
        //   `%c⏱️  AccessToken hết hạn sau: ${remaining}s`,
        //   remaining <= 3
        //     ? "color:#ef4444;font-weight:bold"
        //     : "color:#f59e0b;font-weight:bold"
        // );
      } else {
        clearInterval(countdownRef.current!);
        // console.log("%c🔴 AccessToken đã hết hạn — Interceptor sẽ tự refresh!", "color:#ef4444;font-weight:bold;font-size:13px");
      }
    }, 1000);
  };

  // Bước 10: session-expired → logout
  useEffect(() => {
    const handleExpired = () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setAccessToken(null);
      setUser(null);
      console.log("%c🚪 Session hết hạn — Đã đăng xuất tự động", "color:#ef4444;font-weight:bold");
    };
    window.addEventListener("auth:session-expired", handleExpired);
    return () => window.removeEventListener("auth:session-expired", handleExpired);
  }, []);

  // Lắng nghe token mới từ interceptor refresh
  useEffect(() => {
    const handleRefreshed = (e: Event) => {
      const { token } = (e as CustomEvent).detail;
      if (currentUserRef.current) {
        console.log("%c✅ [Interceptor] RefreshToken → NewAccessToken:", "color:#10b981;font-weight:bold;font-size:13px", shortToken(token));
        startCountdown(token);
      }
    };
    window.addEventListener("auth:token-refreshed", handleRefreshed);
    return () => window.removeEventListener("auth:token-refreshed", handleRefreshed);
  }, []);

  useEffect(() => {
    let mounted = true;
    const bootstrapAuth = async () => {
      try {
        const refreshRes = await axios.post<{ accessToken: string }>(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const token = refreshRes.data.accessToken;
        setAccessToken(token);
        const meRes = await http.get<AuthUser>("/auth/me");
        if (mounted) {
          setUser(meRes.data);
          currentUserRef.current = meRes.data;
          logTokenReceived(token, meRes.data, "AccessToken (bootstrap)");
          startCountdown(token);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    bootstrapAuth();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await http.post<{ accessToken: string; user: AuthUser }>(
      "/auth/login",
      { email, password },
    );
    const token = res.data.accessToken;
    const userData = res.data.user;
    setAccessToken(token);
    setUser(userData);
    currentUserRef.current = userData;
    logTokenReceived(token, userData, "AccessToken (login)");
    startCountdown(token);
    return userData;
  };

  const logout = async () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    try {
      await http.post("/auth/logout");
    } catch (e) {
      console.warn("[auth] logout failed, clearing anyway", e);
    }
    setAccessToken(null);
    setUser(null);
    currentUserRef.current = null;
    console.log("%c🚪 Đã đăng xuất thành công", "color:#6366f1;font-weight:bold");
  };

  return (
    <ToastProvider>
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
    </ToastProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
