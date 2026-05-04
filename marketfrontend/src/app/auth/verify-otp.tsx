"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, RotateCw, ArrowLeft, Smartphone } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/Logo';
import http from '@/lib/http';

export default function UserVerifyOtpPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('user_forgot_email');
    if (!stored) {
      router.replace('/forgot-password');
      return;
    }
    setEmail(stored);
  }, [router]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setOtpError("Vui lòng nhập đủ 6 chữ số OTP");
      inputRefs.current[otp.findIndex(d => !d)]?.focus();
      return;
    }
    setOtpError('');

    setIsLoading(true);
    try {
      const res = await http.post<{ resetToken: string }>('/auth/verify-otp', {
        email,
        otp: otpCode,
      });
      sessionStorage.setItem('user_reset_token', res.data.resetToken);
      toast.success("Xác thực mã OTP thành công!");
      router.push('/reset-password');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
      toast.error(msg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    try {
      await http.post('/auth/forgot-password', { email });
      setTimer(60);
      toast.success("Đã gửi lại mã OTP mới đến email của bạn");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message || "Không thể gửi lại OTP. Vui lòng thử lại sau.";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">

      {/* LEFT SIDE MARKETING */}
      <div className="hidden lg:flex w-1/2 bg-sky-600 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
              <Logo variant="white" size={32} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block leading-none">VietCommerce Hub</span>
              <span className="text-sm font-medium text-sky-200 tracking-widest uppercase">Customer Portal</span>
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
              Chỉ còn <span className="text-yellow-300">một bước</span> nữa.
            </h1>
            <p className="text-lg text-sky-100 mb-10 font-medium leading-relaxed">
              Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến{' '}
              <span className="font-black text-white">{email}</span>.
              <br />Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).
            </p>

            <div className="inline-flex items-center gap-4 p-4 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-sm">
              <Smartphone className="text-yellow-300" size={32} />
              <div>
                <p className="font-bold text-white leading-none mb-1">Xác thực 1-lần</p>
                <p className="text-xs text-sky-200">Mã này sẽ hết hạn sau 10 phút.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-sky-200/60">
          © 2026 VietCommerce Hub. Bảo mật hai lớp.
        </div>
      </div>

      {/* RIGHT SIDE - VERIFY OTP FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">
        <div className="max-w-[520px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white">

          {/* Back Link */}
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600 mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Thay đổi địa chỉ Email
          </Link>

          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Xác thực OTP 🔐</h2>
            <p className="text-slate-500 font-medium">Nhập mã xác thực vừa được gửi đến email của bạn</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-10">
            <div className="flex justify-between gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-full h-16 text-center text-2xl font-black bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 text-sky-700 transition-all ${
                    otpError && !digit
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-slate-100 focus:ring-sky-500/10 focus:border-sky-600'
                  }`}
                />
              ))}
            </div>

            {otpError && <p className="text-xs text-red-500 font-medium text-center -mt-6">⚠ {otpError}</p>}

            <div className="space-y-6">
              <button
                type="submit"
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold shadow-xl shadow-sky-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    Xác nhận OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0 || isResending}
                  className={`flex items-center justify-center gap-2 mx-auto text-sm font-bold transition-colors ${
                    timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-sky-600 hover:text-sky-800'
                  }`}
                >
                  <RotateCw size={16} className={isResending ? 'animate-spin' : ''} />
                  {timer > 0 ? `Gửi lại mã sau (${timer}s)` : 'Gửi lại mã mới'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
