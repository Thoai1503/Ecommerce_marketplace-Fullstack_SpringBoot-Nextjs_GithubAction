"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { API_URL } from "@/helper/api";

const LoginForm = () => {
  const normalizeRoleForCookie = (user: any) => {
    const rawRole = String(
      user?.role ?? user?.userType ?? user?.type ?? "buyer",
    ).toLowerCase();

    if (rawRole === "seller") return "seller";
    if (rawRole === "both") return "both";
    if (rawRole === "admin") return "admin";
    return "buyer";
  };

  const getUserId = (user: any) => {
    const value = Number(user?.id ?? user?.userId ?? user?.user_id ?? 0);
    return Number.isFinite(value) ? value : 0;
  };

  const getFullName = (user: any) =>
    user?.fullName ?? user?.name ?? user?.email ?? "User";

  const getRedirectTarget = (redirect: string | null) => {
    if (!redirect) return null;

    const value = redirect.trim();

    if (
      !value ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("//")
    ) {
      return null;
    }

    return value.startsWith("/") ? value : `/${value}`;
  };

  const getDefaultRedirectByRole = (role: string) => {
    if (role === "admin") return "/admin";
    return "/";
  };

  const getAccessToken = (payload: any) =>
    payload?.accessToken ?? payload?.token ?? "";

  const getRefreshToken = (payload: any) => payload?.refreshToken ?? "";

  const persistAuthTokens = (payload: any) => {
    const accessToken = getAccessToken(payload);
    const refreshToken = getRefreshToken(payload);
    const expiresIn = Number(payload?.expiresIn ?? 0);
    const refreshExpiresIn = Number(payload?.refreshExpiresIn ?? 0);
    const idleTimeoutSeconds = Number(payload?.idleTimeoutSeconds ?? 0);

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("token", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (expiresIn > 0) {
      localStorage.setItem("expiresAt", String(Date.now() + expiresIn * 1000));
      localStorage.setItem(
        "expiresIn",
        JSON.stringify({
          value: expiresIn,
          expiresAt: Date.now() + expiresIn * 1000,
        }),
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

    return accessToken;
  };

  useEffect(() => {
    //Debug api
    console.log("API_URL:", API_URL);
  }, []);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const redirectTarget = getRedirectTarget(redirectPath);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear error khi user nhập lại
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      general: undefined,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (loading) return;

    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();

      if (!res.ok) {
        setErrors({ general: text });
        return;
      }

      const loginData = JSON.parse(text);
      const authUser = loginData?.user ?? {};
      const mergedUser = { ...loginData, ...authUser };
      const roleCookie = normalizeRoleForCookie(mergedUser);
      const userId = getUserId(mergedUser);
      const normalizedUser = {
        id: userId,
        email: mergedUser.email,
        fullName: getFullName(mergedUser),
        userType: loginData?.userType ?? authUser?.userType ?? roleCookie,
        role: roleCookie,
      };
      const accessToken = persistAuthTokens(loginData);
      const accessCookieMaxAge = Number(loginData?.expiresIn ?? 0) || 60 * 30;
      const sessionCookieMaxAge =
        Number(loginData?.refreshExpiresIn ?? 0) || 60 * 60 * 24;

      // Lưu thông tin user ở client
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      // Đặt cookie để middleware đọc được trạng thái đăng nhập.
      document.cookie = `token=${accessToken || "logged-in"}; path=/; max-age=${
        accessCookieMaxAge
      }; SameSite=Lax`;
      document.cookie = `role=${roleCookie}; path=/; max-age=${
        sessionCookieMaxAge
      }; SameSite=Lax`;
      document.cookie = `user=${userId}; path=/; max-age=${
        sessionCookieMaxAge
      }; SameSite=Lax`;

      // Sau khi login thành công, điều hướng về trang mong muốn (nếu có ?redirect=...)
      window.location.href =
        redirectTarget ?? getDefaultRedirectByRole(roleCookie);
    } catch (err) {
      setErrors({ general: "Không kết nối được server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/image/ecommerce.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm" />

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[420px] bg-white rounded-xl shadow-xl px-8 py-10"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
        <p className="text-center text-gray-500 mt-1 mb-8">Welcome back!</p>

        {/* EMAIL */}
        <div className="mb-5 text-black">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            name="email"
            type="text"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoFocus
            className={`w-full h-12 rounded-lg border px-4
              focus:outline-none focus:ring-2
              ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="mb-3 text-black">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full h-12 rounded-lg border px-4 pr-12
                focus:outline-none focus:ring-2
                ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              👁
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}

          <div className="flex justify-end mt-2">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* GENERAL ERROR */}
        {errors.general && (
          <div className="mt-3 text-sm text-red-600 text-center">
            {errors.general}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-4 rounded-lg bg-blue-600 text-white font-semibold
                     hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-sm text-gray-400">hoặc</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* GOOGLE LOGIN */}
        <button
          type="button"
          onClick={() => {
            window.location.href = `${API_URL}/auth/google`;
          }}
          className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.15 0 5.64 1.08 7.73 2.85l5.74-5.74C33.91 3.45 29.27 1.5 24 1.5 14.82 1.5 7.07 7.1 3.9 15.01l6.7 5.2C12.24 14.12 17.63 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.44c-.54 2.9-2.18 5.36-4.64 7.02l7.1 5.52C43.18 37.13 46.1 31.27 46.1 24.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.6 28.79A14.6 14.6 0 0 1 9.5 24c0-1.66.28-3.26.78-4.76l-6.7-5.2A22.48 22.48 0 0 0 1.5 24c0 3.62.87 7.04 2.4 10.06l6.7-5.27z"
            />
            <path
              fill="#34A853"
              d="M24 46.5c5.27 0 9.7-1.74 12.93-4.73l-7.1-5.52c-1.8 1.2-4.1 1.9-5.83 1.9-6.37 0-11.76-4.6-13.4-10.79l-6.7 5.27C7.07 40.9 14.82 46.5 24 46.5z"
            />
          </svg>
          Đăng nhập bằng Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account?
            <a
              href={
                `/register` +
                (redirectPath
                  ? `${redirectPath ? "?redirect=" + encodeURIComponent(redirectPath) : ""}`
                  : "")
              }
              className="ml-1 text-blue-600 font-semibold hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center">Đang tải trang đăng nhập...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
