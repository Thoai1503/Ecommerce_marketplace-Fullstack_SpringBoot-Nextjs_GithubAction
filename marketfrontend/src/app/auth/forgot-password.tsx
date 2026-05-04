"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Logo } from "@/components/Logo";
import http from "@/lib/http";

export default function UserForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Vui lòng nhập email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email không đúng định dạng";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }

    setIsLoading(true);
    try {
      await http.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
      sessionStorage.setItem("user_forgot_email", email);
      toast.success("Mã xác thực đã được gửi đến email của bạn!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      <div className="hidden lg:flex w-1/2 bg-sky-600 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
              <Logo variant="white" size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                VietCommerce Hub
              </span>
              <span className="text-xs font-bold text-sky-200 tracking-widest uppercase mt-1">
                Customer Portal
              </span>
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
              Khôi phục <span className="text-yellow-300">quyền truy cập</span> của bạn.
            </h1>
            <p className="text-lg text-sky-100 mb-10 font-medium leading-relaxed">
              Đừng lo lắng! Chỉ mất một phút để lấy lại mật khẩu và tiếp tục trải nghiệm mua sắm tuyệt vời tại VietCommerce Hub.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-yellow-300" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Bảo mật tuyệt đối</h4>
                  <p className="text-sm text-sky-200">
                    Chúng tôi bảo vệ tài khoản của bạn bằng các lớp xác thực mã hóa cao cấp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="text-yellow-300" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Nhanh chóng &amp; Dễ dàng</h4>
                  <p className="text-sm text-sky-200">
                    Quy trình 3 bước đơn giản: Nhập Email - Xác thực OTP - Đổi mật khẩu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-sky-200/60">
          © 2026 VietCommerce Hub. Giao diện Người dùng.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">
        <div className="max-w-[480px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white">
          {isSubmitted ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">Kiểm tra email của bạn</h2>
              <p className="text-slate-500 font-medium mb-8">
                Chúng tôi đã gửi mã OTP đến{" "}
                <span className="font-bold text-slate-800">{email}</span>.
                <br />
                Mã có hiệu lực trong <span className="font-bold text-orange-500">10 phút</span>.
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Không nhận được email?{" "}
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-sky-600 font-bold hover:underline"
                >
                  Thử lại
                </button>{" "}
                hoặc kiểm tra thư mục Spam.
              </p>
              <button
                type="button"
                onClick={() => router.push("/verify-otp")}
                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold shadow-xl shadow-sky-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Nhập mã OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-3">Quên mật khẩu?</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Nhập email liên kết với tài khoản của bạn để nhận mã xác thực OTP.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">Địa chỉ Email</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      onBlur={() => setEmailError(validateEmail(email))}
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 ${
                        emailError
                          ? "border-red-400 focus:ring-red-500/10 focus:border-red-500"
                          : "border-slate-100 focus:ring-sky-500/10 focus:border-sky-600"
                      }`}
                      placeholder="username@email.com"
                    />
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailError ? "text-red-400" : "text-slate-400 group-focus-within:text-sky-600"}`} size={20} />
                  </div>
                  {emailError && <p className="text-xs text-red-500 font-medium mt-1">⚠ {emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold shadow-xl shadow-sky-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 mt-4 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang gửi mã...</span>
                    </>
                  ) : (
                    <>
                      Gửi mã xác thực <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-sky-600 transition-colors"
                  >
                    <ArrowLeft size={16} /> Quay lại trang đăng nhập
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
