"use client";

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Server, 
  Users, 
  Activity, 
  LayoutDashboard 
} from 'lucide-react';
import { useLogin } from '@/hooks/auth/useLogin';
import Image from 'next/image';

export default function LoginPage() {
  const loginMutation = useLogin();
  
  // Load saved email if remember me was checked
  const getInitialEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('savedEmail') || '';
    }
    return '';
  };

  const getInitialRememberMe = () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('savedEmail');
    }
    return false;
  };

  // Form state
  const [email, setEmail] = useState(getInitialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(getInitialRememberMe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!email || !password) {
      return;
    }

    // Save email if remember me is checked
    if (rememberMe && typeof window !== 'undefined') {
      localStorage.setItem('savedEmail', email);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('savedEmail');
    }

    // Call login mutation
    loginMutation.mutate({
      email,
      password,
      rememberMe,
    });
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900">
      {/* LEFT SIDE - BRANDING AREA (ADMIN THEME) */}
      <div className="hidden lg:flex w-7/12 bg-[#0f172a] relative overflow-hidden flex-col justify-between p-16 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
            alt="System Architecture"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0f172a]/95 to-indigo-950/80 mix-blend-multiply"></div>
        </div>

        {/* Decorative Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

        {/* Header Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              STAY-GO <span className="text-indigo-400 font-medium">Administrator</span>
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-xl mb-12">
          <h2 className="text-5xl font-black mb-8 leading-tight tracking-tight text-white">
            Trung tâm điều hành <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              hệ thống toàn cầu.
            </span>
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-5 group">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors duration-300">
                <Users size={24} className="text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 text-white">Quản trị người dùng</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Kiểm soát phân quyền, xác thực danh tính và quản lý hồ sơ Seller/Customer tập trung.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5 group">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors duration-300">
                <Activity size={24} className="text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 text-white">Giám sát vận hành</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Theo dõi sức khỏe hệ thống, lưu lượng truy cập và các chỉ số hiệu suất chính (KPIs) theo thời gian thực.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5 group">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors duration-300">
                <Server size={24} className="text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 text-white">Cấu hình hệ thống</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Thiết lập tham số toàn cục, quản lý danh mục ngành hàng và các thiết lập bảo mật cấp cao.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-8">
          <span>© 2024 STAY-GO Inc.</span>
          <div className="flex gap-4 items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-500">System Operational</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="max-w-[420px] w-full bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative">
          
          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Admin Portal</h1>
            <p className="text-slate-500 font-medium text-sm">
              Đăng nhập để truy cập quyền quản trị cấp cao.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tài khoản quản trị
              </label>
              <div className="relative group">
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 text-sm"
                  placeholder="admin@staygo.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mật khẩu bảo mật
              </label>
              <div className="relative group">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md hover:bg-slate-200 transition-colors"
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-400'
                }`}>
                  {rememberMe && <ArrowRight size={10} className="text-white -rotate-45 -mt-px" strokeWidth={4} />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={rememberMe} 
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={isLoading}
                />
                <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                  Duy trì đăng nhập
                </span>
              </label>
              <a 
                href="/forgot-password"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm border-0 mt-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  Truy cập Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer / Security Badge */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <ShieldCheck size={14} /> 256-bit SSL Encrypted Connection
            </div>
            <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
              Truy cập trái phép vào khu vực này được giám sát và ghi lại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
