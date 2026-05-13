"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from "lucide-react";

import { API_URL } from "@/helper/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccess(null);
    setError(null);

    if (!token) {
      setError("Link đặt lại mật khẩu không hợp lệ");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const message = await res.text();
      if (!res.ok) {
        setError(message || "Không thể đổi mật khẩu");
        return;
      }

      setSuccess(message || "Đổi mật khẩu thành công");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `h-12 w-full rounded-lg border bg-white px-4 pl-11 pr-12 text-sm outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-500 focus:ring-red-500"
        : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
    }`;

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4 py-10 text-slate-950"
      style={{
        backgroundImage: "url('/image/ecommerce.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm" />

      <section className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl shadow-slate-950/20">
        <Link
          href="/login"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <KeyRound size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            Đặt lại mật khẩu
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chọn mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {!token && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Link đặt lại mật khẩu không hợp lệ
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className={inputClass(Boolean(error))}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                disabled={loading || !token}
              />
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                disabled={loading || !token}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className={inputClass(Boolean(error))}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                disabled={loading || !token}
              />
              <ShieldCheck
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                disabled={loading || !token}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
              {success}. Bạn có thể đăng nhập bằng mật khẩu mới.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token || Boolean(success)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            {!loading && <KeyRound size={16} />}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
