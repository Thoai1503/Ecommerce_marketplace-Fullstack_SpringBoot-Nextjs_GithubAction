"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail, Send, ShieldCheck } from "lucide-react";

import { API_URL } from "@/helper/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccess(null);
    setError(null);

    if (!email.trim()) {
      setError("Email không được để trống");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const message = await res.text();
      if (!res.ok) {
        setError(message || "Không thể gửi yêu cầu đặt lại mật khẩu");
        return;
      }

      setSuccess(
        message || "Nếu email tồn tại, hệ thống đã gửi link đặt lại mật khẩu",
      );
    } catch {
      setError("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

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
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            Quên mật khẩu
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Nhập email tài khoản để nhận link đặt lại mật khẩu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className={`h-12 w-full rounded-lg border bg-white px-4 pl-11 text-sm outline-none transition focus:ring-2 ${
                  error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Gửi link đặt lại"}
            {!loading && <Send size={16} />}
          </button>
        </form>
      </section>
    </main>
  );
}
