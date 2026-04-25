"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { API_URL } from "@/helper/api";

type VerifyState =
  | { status: "loading" }
  | { status: "valid"; email: string; fullName?: string }
  | { status: "invalid"; reason: string };

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const strengthLabels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
const strengthColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-emerald-600",
];

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [verify, setVerify] = useState<VerifyState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify token once on mount
  useEffect(() => {
    if (!token) {
      setVerify({ status: "invalid", reason: "Link không có token" });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${API_URL}/auth/verify-token?token=${encodeURIComponent(token)}`,
        );
        const data = await res.json();
        if (data.valid) {
          setVerify({
            status: "valid",
            email: data.email,
            fullName: data.fullName,
          });
        } else {
          setVerify({
            status: "invalid",
            reason: data.reason || "Token không hợp lệ",
          });
        }
      } catch (e) {
        setVerify({
          status: "invalid",
          reason: "Không kết nối được server",
        });
      }
    })();
  }, [token]);

  const strength = useMemo(() => scorePassword(password), [password]);

  const checks = {
    len: password.length >= 8,
    upper: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    match: confirm.length > 0 && password === confirm,
  };

  const canSubmit =
    checks.len && checks.upper && checks.digit && checks.match && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!checks.len || !checks.upper || !checks.digit) {
      setErrorMsg("Mật khẩu chưa đủ mạnh");
      return;
    }
    if (!checks.match) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Không thiết lập được mật khẩu");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login?setupSuccess=1"), 2000);
    } catch (e) {
      setErrorMsg("Không kết nối được server");
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================ RENDER ============================ */

  // LOADING — đang verify token
  if (verify.status === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Đang kiểm tra link...</p>
        </div>
      </Shell>
    );
  }

  // INVALID — token xấu / hết hạn
  if (verify.status === "invalid") {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={40} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Link không hợp lệ
          </h1>
          <p className="text-slate-600 mb-6 max-w-sm">{verify.reason}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left max-w-sm">
            <p className="text-xs text-amber-900 font-bold mb-1">
              Có thể do:
            </p>
            <ul className="list-disc ml-4 text-xs text-amber-800 space-y-1">
              <li>Link đã hết hạn (24 giờ kể từ khi gửi)</li>
              <li>Link đã được sử dụng</li>
              <li>Link bị sai khi copy từ email</li>
            </ul>
          </div>
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-700 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"
          >
            Về trang đăng nhập
          </Link>
          <p className="text-xs text-slate-500 mt-4">
            Cần hỗ trợ? Liên hệ{" "}
            <a
              href="mailto:support@vietcommerce.vn"
              className="text-blue-600 font-bold"
            >
              support@vietcommerce.vn
            </a>
          </p>
        </div>
      </Shell>
    );
  }

  // SUCCESS — đã set xong
  if (success) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 size={44} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Thiết lập thành công! 🎉
          </h1>
          <p className="text-slate-600 mb-2">
            Mật khẩu đã được lưu. Đang chuyển tới trang đăng nhập...
          </p>
          <Loader2 size={20} className="text-blue-600 animate-spin mt-4" />
        </div>
      </Shell>
    );
  }

  // VALID — hiện form
  return (
    <Shell>
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
          <ShieldCheck size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Thiết lập mật khẩu
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Cho tài khoản{" "}
          <span className="font-bold text-blue-700">{verify.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm text-slate-900"
              placeholder="Nhập mật khẩu"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength meter */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full ${
                      i < strength ? strengthColors[strength] : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-slate-500">
                Độ mạnh:{" "}
                <span className="font-bold text-slate-700">
                  {strengthLabels[strength]}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
          <Rule ok={checks.len} label="Ít nhất 8 ký tự" />
          <Rule ok={checks.upper} label="Có ít nhất 1 chữ in hoa (A-Z)" />
          <Rule ok={checks.digit} label="Có ít nhất 1 chữ số (0-9)" />
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full h-12 pl-10 pr-11 rounded-xl border-2 focus:outline-none text-sm text-slate-900 ${
                confirm.length === 0
                  ? "border-slate-200 focus:border-blue-500"
                  : checks.match
                  ? "border-green-400 focus:border-green-500"
                  : "border-red-400 focus:border-red-500"
              }`}
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirm.length > 0 && !checks.match && (
            <p className="text-xs text-red-600 font-medium mt-1">
              Mật khẩu xác nhận không khớp
            </p>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Thiết lập mật khẩu
            </>
          )}
        </button>
      </form>
    </Shell>
  );
}

const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
  <div className="flex items-center gap-2 text-xs">
    {ok ? (
      <CheckCircle2 size={14} className="text-green-600" />
    ) : (
      <XCircle size={14} className="text-slate-300" />
    )}
    <span
      className={`font-medium ${ok ? "text-green-700" : "text-slate-500"}`}
    >
      {label}
    </span>
  </div>
);

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-blue-500/10 border border-white p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="relative z-10">{children}</div>
    </div>
  </div>
);

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
