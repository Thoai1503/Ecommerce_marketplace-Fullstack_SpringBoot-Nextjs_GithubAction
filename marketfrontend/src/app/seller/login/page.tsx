"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Store,
  Users,
  Globe,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { API_URL } from "@/helper/api";

function SellerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/seller";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email không được để trống";
    if (!password) newErrors.password = "Mật khẩu không được để trống";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      if (!res.ok) {
        setErrors({ general: text || "Đăng nhập thất bại" });
        return;
      }

      const body = JSON.parse(text);
      const user = body.user || body;
      const shop = body.shop;

      // Chỉ cho phép seller vào trang này
      if (user.userType !== "seller") {
        setErrors({
          general:
            "Tài khoản này không phải nhà bán hàng. Vui lòng dùng trang đăng nhập thông thường.",
        });
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      if (shop) {
        localStorage.setItem("shop", JSON.stringify(shop));
      } else {
        localStorage.removeItem("shop");
      }

      document.cookie = `token=${
        (user as { token?: string }).token || "logged-in"
      }; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

      // Redirect theo shop status
      if (shop && (shop.status === "PENDING" || shop.status === "REJECTED")) {
        router.push(
          `/seller/pending?email=${encodeURIComponent(user.email || "")}`
        );
        return;
      }

      router.push(redirectPath);
    } catch {
      setErrors({ general: "Không kết nối được server" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white text-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-black/10">
              <Store size={26} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block leading-none">
                VietCommerce Hub
              </span>
              <span className="text-sm font-medium text-blue-200 tracking-widest uppercase">
                Seller Center
              </span>
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
              Đưa sản phẩm của bạn đến{" "}
              <span className="text-yellow-300">hàng triệu</span> khách hàng.
            </h1>
            <p className="text-lg text-blue-100 mb-10 font-medium leading-relaxed">
              Nền tảng thương mại điện tử hàng đầu giúp bạn quản lý đơn hàng,
              tối ưu vận hành và gia tăng doanh thu vượt trội.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Tăng trưởng doanh thu</h4>
                  <p className="text-blue-100 text-sm">
                    Công cụ phân tích và marketing thông minh.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg">
                  <ShoppingBag size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Quản lý đa kênh</h4>
                  <p className="text-blue-100 text-sm">
                    Đồng bộ tồn kho và đơn hàng tập trung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-sm font-bold text-blue-200">
          <div className="flex items-center gap-2">
            <Users size={18} /> 50k+ Nhà bán hàng
          </div>
          <div className="flex items-center gap-2">
            <Globe size={18} /> Phủ sóng toàn quốc
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">
        <div className="absolute top-8 right-8 flex items-center gap-2 text-sm font-medium text-slate-600">
          Bạn chưa có cửa hàng?
          <Link
            href="/seller/register"
            className="text-blue-700 font-bold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>

        <div className="max-w-[480px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white relative">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              Xin chào! 👋
            </h2>
            <p className="text-slate-500 font-medium">
              Đăng nhập để quản lý cửa hàng của bạn.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">
                Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({
                      ...p,
                      email: undefined,
                      general: undefined,
                    }));
                  }}
                  autoComplete="email"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-100 focus:border-blue-600"
                  }`}
                  placeholder="seller@example.com"
                  required
                />
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-semibold">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 block">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({
                      ...p,
                      password: undefined,
                      general: undefined,
                    }));
                  }}
                  autoComplete="current-password"
                  className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-100 focus:border-blue-600"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-2 rounded-xl hover:bg-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-semibold">
                  {errors.password}
                </p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 mt-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  Đăng nhập Kênh Người Bán{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-6 pt-6 border-t border-slate-100 text-slate-400">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <ShieldCheck size={14} className="text-green-500" /> Secure SSL
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Globe size={14} className="text-blue-500" /> Global Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center">Đang tải trang đăng nhập...</div>
      }
    >
      <SellerLoginForm />
    </Suspense>
  );
}
