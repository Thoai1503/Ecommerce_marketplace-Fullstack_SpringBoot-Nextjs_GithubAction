
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, TrendingUp, Users, Globe, ShieldCheck, ShoppingBag, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { setAccessToken } from '@/lib/http';
import { Logo } from '@/components/Logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống").min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const mapError = (err: unknown) => {
  const code = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
  if (code === 'INVALID_CREDENTIALS') return 'Email hoặc mật khẩu không đúng';
  if (code === 'ACCOUNT_DISABLED') return 'Tài khoản đã bị khóa';
  if (code === 'ROLE_NOT_ALLOWED') return 'Tài khoản này không phải Seller';
  return 'Đăng nhập thất bại. Vui lòng thử lại.';
};

export default function SellerLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login, logout } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved email từ localStorage sau khi mount (tránh SSR hydration error)
  useEffect(() => {
    const savedEmail = localStorage.getItem('seller_savedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const handleLogin = async ({ email, password }: LoginFormValues) => {
    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem('seller_savedEmail', email);
    } else {
      localStorage.removeItem('seller_savedEmail');
    }

    try {
      const user = await login(email, password);
      if (user.role !== 'SELLER') {
        await logout();
        setAccessToken(null);
        toast.error('Tài khoản này không phải Seller. Vui lòng dùng trang đăng nhập phù hợp.');
        return;
      }
      toast.success('Đăng nhập thành công! Chào mừng trở lại Kênh Người Bán.');
      router.push('/seller');
    } catch (err) {
      toast.error(mapError(err));
    } finally {
      setIsLoading(false);
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
                <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tight text-white leading-none">VietCommerce Hub</span>
                    <span className="text-xs font-bold text-blue-200 tracking-widest uppercase mt-1">Seller Center</span>
                </div>
            </div>

            <div className="max-w-xl">
                <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
                    Đưa sản phẩm của bạn đến <span className="text-yellow-300">hàng triệu</span> khách hàng.
                </h1>
                <p className="text-lg text-blue-100 mb-10 font-medium leading-relaxed">
                    Nền tảng thương mại điện tử hàng đầu giúp bạn quản lý đơn hàng, tối ưu vận hành và gia tăng doanh thu vượt trội.
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

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50">
        
        {/* Register Link */}
        <div className="absolute top-8 right-8 flex items-center gap-2 text-sm font-medium text-slate-600">
            Bạn chưa có cửa hàng?
            <a href="/seller/register" className="text-blue-700 font-bold hover:underline">Đăng ký ngay</a>
        </div>

        <div className="max-w-[480px] w-full bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-white relative">
            
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-3">Xin chào! 👋</h2>
                <p className="text-slate-500 font-medium">Đăng nhập để quản lý cửa hàng của bạn.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleLogin)} noValidate className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">Email hoặc Số điện thoại</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            {...register('email')}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                            placeholder="seller@store.com"
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    </div>
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700 block">Mật khẩu</label>
                        <a href="/seller/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">Quên mật khẩu?</a>
                    </div>
                    <div className="relative group">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            {...register('password')}
                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                            placeholder="••••••••"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-2 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className="flex items-center gap-2.5 group cursor-pointer border-0 bg-transparent p-0"
                    >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            rememberMe
                                ? 'bg-blue-700 border-blue-700'
                                : 'border-slate-300 group-hover:border-blue-500'
                        }`}>
                            {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-medium text-slate-600 select-none">Duy trì đăng nhập</span>
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 mt-2 group"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Đang xác thực...</span>
                        </>
                    ) : (
                        <>
                            Đăng nhập Kênh Người Bán <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10">
                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t-2 border-slate-100"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Hoặc đăng nhập với</span>
                    <div className="flex-grow border-t-2 border-slate-100"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-600 text-sm">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-600 text-sm">
                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                        Facebook
                    </button>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 pt-6 border-t border-slate-50 text-slate-400">
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
