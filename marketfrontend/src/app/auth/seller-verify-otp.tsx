"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, RefreshCw, TrendingUp, ShoppingBag, Users, Globe } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/Logo';
import http from '@/lib/http';

export default function SellerVerifyOtpPage() {
  const router = useRouter();
  const toast = useToast();

  // Lấy email từ sessionStorage (được lưu từ trang forgot-password)
  const [email, setEmail] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('forgot_email');
    if (!stored) {
      // Nếu không có email → redirect về forgot-password
      router.replace('/seller/forgot-password');
      return;
    }
    setEmail(stored);
  }, [router]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // Focus ô đầu tiên khi mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Đếm ngược 60 giây
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Tự động focus ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setOtpError("Vui lòng nhập đủ 6 chữ số OTP");
      inputRefs.current[otp.findIndex(d => !d)]?.focus();
      return;
    }
    setOtpError('');

    setIsLoading(true);
    try {
      const res = await http.post<{ resetToken: string }>('/auth/verify-otp', {
        email,
        otp: otpValue,
      });
      // Lưu reset token để trang reset-password dùng
      sessionStorage.setItem('reset_token', res.data.resetToken);
      toast.success("Xác thực OTP thành công!");
      router.push('/seller/reset-password');
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
    if (timeLeft > 0 || isResending) return;

    setIsResending(true);
    try {
      await http.post('/auth/forgot-password', { email });
      setTimeLeft(60);
      toast.success("Đã gửi lại mã OTP!");
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

      {/* LEFT SIDE - SELLER MARKETING (Blue Theme) */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 relative overflow-hidden flex-col justify-between p-16 text-white">

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
              <Logo variant="white" size={32} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block leading-none">VietCommerce Hub</span>
              <span className="text-sm font-medium text-blue-200 tracking-widest uppercase">Seller Center</span>
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
              Bảo mật là <span className="text-yellow-300">ưu tiên hàng đầu</span>.
            </h1>
            <p className="text-lg text-blue-100 mb-10 font-medium leading-relaxed">
              Xác thực 2 lớp giúp bảo vệ tài khoản và cửa hàng của bạn khỏi các truy cập trái phép.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Tăng trưởng doanh thu</h4>
                  <p className="text-blue-100 text-sm">Công cụ phân tích và marketing thông minh.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg">
                  <ShoppingBag size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Quản lý đa kênh</h4>
                  <p className="text-blue-100 text-sm">Đồng bộ tồn kho và đơn hàng tập trung.</p>
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

      {/* RIGHT SIDE - OTP FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">

        <div className="max-w-[480px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white relative">

          {/* Back Link */}
          <Link
            href="/seller/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700 mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Xác thực OTP</h2>
            <p className="text-slate-500 font-medium">
              Nhập mã 6 số chúng tôi vừa gửi tới email
              <br />
              <span className="font-bold text-slate-800">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-slate-800 ${
                    otpError && !digit
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/10'
                  }`}
                />
              ))}
            </div>
            {otpError && <p className="text-xs text-red-500 font-medium text-center -mt-4">⚠ {otpError}</p>}

            <button
              type="submit"
              disabled={isLoading || otp.some((d) => !d)}
              className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                'Xác nhận'
              )}
            </button>

            <div className="text-center">
              <p className="text-slate-500 text-sm font-medium mb-2">Bạn không nhận được mã?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || isResending}
                className={`flex items-center justify-center gap-2 mx-auto font-bold text-sm ${
                  timeLeft > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700 hover:underline'
                }`}
              >
                <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                {timeLeft > 0 ? `Gửi lại sau ${timeLeft}s` : 'Gửi lại mã'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
