"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, TrendingUp, ShoppingBag, Users, Globe } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Logo } from '@/components/Logo';
import http from '@/lib/http';

export default function SellerForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Vui lòng nhập email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không đúng định dạng';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }

    setIsLoading(true);
    try {
      await http.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success("Đã gửi mã OTP đến email của bạn!");
      // Lưu email để trang verify-otp dùng
      sessionStorage.setItem('forgot_email', email);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoVerify = () => {
    router.push('/seller/verify-otp');
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
              Khôi phục quyền truy cập <span className="text-yellow-300">dễ dàng</span>.
            </h1>
            <p className="text-lg text-blue-100 mb-10 font-medium leading-relaxed">
              Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại mật khẩu chỉ trong vài bước đơn giản để bạn tiếp tục kinh doanh.
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

      {/* RIGHT SIDE - FORGOT PASSWORD FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">

        <div className="max-w-[480px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white relative">

          {/* Back Link */}
          <Link
            href="/seller/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700 mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại đăng nhập
          </Link>

          {isSubmitted ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">Kiểm tra email của bạn</h2>
              <p className="text-slate-500 font-medium mb-8">
                Chúng tôi đã gửi mã OTP đến{' '}
                <span className="font-bold text-slate-800">{email}</span>.
                <br />Mã có hiệu lực trong <span className="font-bold text-orange-500">10 phút</span>.
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Không nhận được email?{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Thử lại
                </button>{' '}
                hoặc kiểm tra thư mục Spam.
              </p>
              <button
                onClick={handleGoVerify}
                className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Nhập mã OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-3">Quên mật khẩu? 🔒</h2>
                <p className="text-slate-500 font-medium">
                  Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để xác thực.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">Email đăng ký</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      onBlur={() => setEmailError(validateEmail(email))}
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 ${
                        emailError
                          ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500'
                          : 'border-slate-100 focus:ring-blue-500/10 focus:border-blue-600'
                      }`}
                      placeholder="seller@store.com"
                    />
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} size={20} />
                  </div>
                  {emailError && <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">⚠ {emailError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 mt-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang gửi OTP...</span>
                    </>
                  ) : (
                    <>
                      Gửi mã OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
