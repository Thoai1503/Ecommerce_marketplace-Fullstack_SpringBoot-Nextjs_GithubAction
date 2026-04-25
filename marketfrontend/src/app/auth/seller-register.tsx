
"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Store, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';

export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.shopName.trim()) newErrors.shopName = "Vui lòng nhập tên cửa hàng";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Giả lập call API
    setTimeout(() => {
      setIsLoading(false);
      
      // Giả lập đăng ký thành công
      toast.success("Đăng ký thành công! Vui lòng xác thực OTP.");
      
      setTimeout(() => {
        navigate('/seller/verify-otp', { state: { email: formData.email } }); 
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      
      {/* LEFT SIDE - SELLER MARKETING (Blue Theme) */}
      <div className="hidden lg:flex w-5/12 bg-blue-700 relative overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        
        {/* Content */}
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white text-blue-700 rounded-xl flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="font-black text-xl text-blue-700 italic">V</span>';
                    }} />
                </div>
                <div>
                    <span className="text-xl font-black tracking-tight block leading-none">VietCommerce Hub</span>
                    <span className="text-xs font-bold text-amber-300 tracking-widest uppercase flex items-center gap-1">
                        Connecting Vietnam
                    </span>
                </div>
            </div>

            <div className="max-w-md">
                <h1 className="text-4xl font-black mb-4 leading-[1.1] tracking-tight">
                    Bắt đầu hành trình kinh doanh <span className="text-yellow-300">đột phá</span>.
                </h1>
                <p className="text-base text-blue-100 mb-8 font-medium leading-relaxed">
                    Đăng ký ngay để tiếp cận hàng triệu khách hàng tiềm năng và sử dụng bộ công cụ quản lý chuyên nghiệp.
                </p>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center shrink-0 mt-1">
                            <CheckCircle size={16} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-base">Miễn phí đăng ký</h4>
                            <p className="text-blue-100 text-sm">Không phí duy trì, chỉ trả phí khi có đơn hàng.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center shrink-0 mt-1">
                            <CheckCircle size={16} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-base">Hỗ trợ 24/7</h4>
                            <p className="text-blue-100 text-sm">Đội ngũ hỗ trợ tận tâm luôn sẵn sàng giúp đỡ bạn.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center shrink-0 mt-1">
                            <CheckCircle size={16} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-base">Thanh toán nhanh chóng</h4>
                            <p className="text-blue-100 text-sm">Chu kỳ đối soát linh hoạt, dòng tiền ổn định.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="relative z-10 text-xs font-medium text-blue-200/60 mt-8">
            © 2024 VietCommerce Seller Center. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - REGISTER FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-12 relative bg-slate-50 overflow-y-auto h-screen">
        
        {/* Login Link */}
        <div className="absolute top-8 right-8 flex items-center gap-2 text-sm font-medium text-slate-600 z-20">
            Đã có tài khoản?
            <Link to="/seller/login" className="text-blue-700 font-bold hover:underline">Đăng nhập</Link>
        </div>

        <div className="max-w-[600px] w-full bg-white p-8 lg:p-12 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white relative my-auto">
            
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Đăng ký Nhà bán hàng</h2>
                <p className="text-slate-500 font-medium text-sm">Điền thông tin bên dưới để tạo cửa hàng của bạn.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Họ và tên</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-100 focus:border-blue-600'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 text-sm`}
                                placeholder="Nguyễn Văn A"
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.fullName}</p>}
                    </div>

                    {/* Shop Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Tên cửa hàng</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                name="shopName"
                                value={formData.shopName}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 ${errors.shopName ? 'border-red-500 focus:border-red-500' : 'border-slate-100 focus:border-blue-600'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 text-sm`}
                                placeholder="Cửa hàng ABC"
                            />
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        </div>
                        {errors.shopName && <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.shopName}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-100 focus:border-blue-600'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 text-sm`}
                                placeholder="email@example.com"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Số điện thoại</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-100 focus:border-blue-600'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 text-sm`}
                                placeholder="0912345678"
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phone}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Mật khẩu</label>
                        <div className="relative group">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border-2 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-100 focus:border-blue-600'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 text-sm`}
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
                        <div className="relative group">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border-2 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-100 focus:border-blue-600'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 text-sm`}
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs font-bold ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.confirmPassword}</p>}
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-700/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base border-0 group"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                Đăng ký ngay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4 px-8">
                        Bằng việc đăng ký, bạn đồng ý với <a href="#" className="text-blue-600 font-bold hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-blue-600 font-bold hover:underline">Chính sách bảo mật</a> của chúng tôi.
                    </p>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
