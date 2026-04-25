
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Store, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';

export default function SellerVerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Lấy email từ state khi navigate từ trang register
  const email = location.state?.email || 'email@example.com';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Backspace
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
    
    // Focus last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
        toast.error("Vui lòng nhập đủ 6 số OTP");
        return;
    }

    setIsLoading(true);

    // Giả lập call API verify
    setTimeout(() => {
      setIsLoading(false);
      
      // Giả lập verify thành công
      if (otpValue === '123456') { // Mock OTP
        toast.success("Xác thực thành công! Đang chuyển hướng...");
        setTimeout(() => {
            navigate('/seller/login'); 
        }, 1000);
      } else {
        toast.error("Mã OTP không chính xác. Vui lòng thử lại (Gợi ý: 123456)");
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }, 1500);
  };

  const handleResend = () => {
    if (timeLeft > 0) return;
    
    setIsLoading(true);
    // Mock resend API
    setTimeout(() => {
        setIsLoading(false);
        setTimeLeft(60);
        toast.success("Đã gửi lại mã OTP!");
    }, 1000);
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
                <div className="w-12 h-12 bg-white text-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="font-black text-xl text-blue-700 italic">V</span>';
                    }} />
                </div>
                <div>
                    <span className="text-2xl font-black tracking-tight block leading-none">VietCommerce Hub</span>
                    <span className="text-sm font-bold text-amber-300 tracking-widest uppercase flex items-center gap-1">
                        Connecting Vietnam
                    </span>
                </div>
            </div>

            <div className="max-w-xl">
                <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
                    Bảo mật là <span className="text-yellow-300">ưu tiên hàng đầu</span>.
                </h1>
                <p className="text-lg text-blue-100 mb-10 font-medium leading-relaxed">
                    Xác thực 2 lớp giúp bảo vệ tài khoản và cửa hàng của bạn khỏi các truy cập trái phép.
                </p>
            </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-blue-200/60">
            © 2024 VietCommerce Seller Center. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - OTP FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">
        
        <div className="max-w-[480px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white relative">
            
            {/* Back Link */}
            <Link to="/seller/register" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700 mb-8 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại đăng ký
            </Link>

            {/* Header */}
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-3">Xác thực OTP</h2>
                <p className="text-slate-500 font-medium">
                    Nhập mã 6 số chúng tôi vừa gửi tới email <br/>
                    <span className="font-bold text-slate-800">{email}</span>
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleVerify} className="space-y-8">
                <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800"
                        />
                    ))}
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading || otp.some(d => !d)}
                    className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 group"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Đang xác thực...</span>
                        </>
                    ) : (
                        <>
                            Xác nhận
                        </>
                    )}
                </button>

                <div className="text-center">
                    <p className="text-slate-500 text-sm font-medium mb-2">Bạn không nhận được mã?</p>
                    <button 
                        type="button"
                        onClick={handleResend}
                        disabled={timeLeft > 0 || isLoading}
                        className={`flex items-center justify-center gap-2 mx-auto font-bold text-sm ${timeLeft > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700 hover:underline'}`}
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        {timeLeft > 0 ? `Gửi lại sau ${timeLeft}s` : 'Gửi lại mã'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
