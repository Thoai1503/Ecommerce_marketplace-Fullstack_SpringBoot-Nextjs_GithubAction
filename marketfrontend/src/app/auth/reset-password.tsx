"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Logo } from "@/components/Logo";
import http from "@/lib/http";

export default function UserResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("user_reset_token");
    if (!token) {
      router.replace("/forgot-password");
      return;
    }
    setResetToken(token);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    if (password.length < 8) { setPasswordError("Mật khẩu phải có ít nhất 8 ký tự"); valid = false; }
    else setPasswordError("");
    if (password !== confirmPassword) { setConfirmError("Mật khẩu xác nhận không khớp"); valid = false; }
    else setConfirmError("");
    if (!valid) return;

    setIsLoading(true);
    try {
      await http.post("/auth/reset-password", {
        resetToken,
        newPassword: password,
      });
      sessionStorage.removeItem("user_forgot_email");
      sessionStorage.removeItem("user_reset_token");
      setIsSuccess(true);
      toast.success("Mật khẩu đã được thay đổi thành công!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();

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
              Thiết lập mật khẩu <span className="text-yellow-300">mới</span>.
            </h1>
            <p className="text-lg text-sky-100 mb-10 font-medium leading-relaxed">
              Sử dụng mật khẩu mới để bảo vệ tài khoản mua sắm và các ưu đãi thành viên của bạn tại VietCommerce Hub.
            </p>

            <div className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <h4 className="font-bold flex items-center gap-2 mb-3">
                <ShieldCheck size={20} className="text-yellow-300" /> Tiêu chuẩn mật khẩu:
              </h4>
              <ul className="space-y-2 text-sm text-sky-100">
                <li className="flex items-center gap-2">• Độ dài tối thiểu 8 ký tự</li>
                <li className="flex items-center gap-2">• Có ít nhất 1 chữ cái hoa</li>
                <li className="flex items-center gap-2">• Có ít nhất 1 con số</li>
                <li className="flex items-center gap-2">• Nên có ký tự đặc biệt</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-sky-200/60">
          © 2026 VietCommerce Hub. Bảo vệ quyền lợi người dùng.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">
        <div className="max-w-[480px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white relative">
          {isSuccess ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3">Hoàn tất!</h2>
              <p className="text-slate-500 font-medium mb-10">
                Chúc mừng! Mật khẩu của bạn đã được thay đổi. Hãy sử dụng mật khẩu mới này cho lần đăng nhập tiếp theo.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold shadow-xl shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
              >
                Đăng nhập ngay <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-3">Đặt mật khẩu mới</h2>
                <p className="text-slate-500 font-medium">
                  Nhập mật khẩu mới an toàn cho tài khoản cá nhân của bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">Mật khẩu mới</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                      className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 ${
                        passwordError ? "border-red-400 focus:ring-red-500/10 focus:border-red-500" : "border-slate-100 focus:ring-sky-500/10 focus:border-sky-600"
                      }`}
                      placeholder="Ít nhất 8 ký tự"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={20} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 focus:outline-none p-2 rounded-xl hover:bg-sky-50 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {passwordError && <p className="text-xs text-red-500 font-medium mt-1">⚠ {passwordError}</p>}

                  <div className="pt-2 px-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Độ bảo mật
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        strength <= 25 ? "text-red-500" :
                        strength <= 50 ? "text-amber-500" :
                        strength <= 75 ? "text-sky-500" : "text-green-500"
                      }`}>
                        {strength <= 25 ? "Yếu" : strength <= 50 ? "Vừa" : strength <= 75 ? "Tốt" : "Rất mạnh"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full transition-all duration-500 ${strength >= 25 ? (strength === 25 ? "bg-red-500" : "bg-green-500") : "bg-transparent"} flex-1`} />
                      <div className={`h-full transition-all duration-500 ${strength >= 50 ? (strength === 50 ? "bg-amber-500" : "bg-green-500") : "bg-transparent"} flex-1`} />
                      <div className={`h-full transition-all duration-500 ${strength >= 75 ? (strength === 75 ? "bg-sky-500" : "bg-green-500") : "bg-transparent"} flex-1`} />
                      <div className={`h-full transition-all duration-500 ${strength >= 100 ? "bg-green-500" : "bg-transparent"} flex-1`} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">Xác nhận mật khẩu</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 ${
                        confirmError ? "border-red-400 focus:ring-red-500/10 focus:border-red-500" : "border-slate-100 focus:ring-sky-500/10 focus:border-sky-600"
                      }`}
                      placeholder="Nhập lại mật khẩu"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={20} />
                  </div>
                  {confirmError && <p className="text-xs text-red-500 font-medium mt-1">⚠ {confirmError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold shadow-xl shadow-sky-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 mt-4 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      Cập nhật mật khẩu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ArrowLeft size={16} /> Hủy bỏ
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
