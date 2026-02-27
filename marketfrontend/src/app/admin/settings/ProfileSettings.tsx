
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAdminProfile } from '../../../hooks/admin/useSettings';
import { Save, User, Mail, Phone, Lock, ShieldCheck, AlertCircle, Camera, Check } from 'lucide-react';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { FormSkeleton } from '../../../components/ui/Skeleton';

export default function ProfileSettings() {
  const { profile, isLoading, updateProfile, changePassword, isUpdating, isChangingPassword } = useAdminProfile();
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });

  // Password Form
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Inline Errors
  const [passErrors, setPassErrors] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  // Handle Avatar Change (Mock)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar: url }));
      setToast({ id: Date.now().toString(), message: "Đã chọn ảnh mới. Nhấn Lưu để cập nhật.", type: 'info' });
    }
  };

  const handleProfileSubmit = async () => {
    if (!profileData.name) {
      setToast({ id: Date.now().toString(), message: "Họ tên không được để trống.", type: 'error' });
      return;
    }
    try {
      await updateProfile(profileData);
      setToast({ id: Date.now().toString(), message: "Cập nhật hồ sơ thành công!", type: 'success' });
    } catch (e) {
      setToast({ id: Date.now().toString(), message: "Lỗi khi cập nhật hồ sơ.", type: 'error' });
    }
  };

  const handlePasswordSubmit = async () => {
    // Reset Errors
    const errors = [];
    if (!passData.currentPassword) errors.push("Thiếu mật khẩu hiện tại.");
    if (passData.newPassword.length < 8) errors.push("Mật khẩu mới quá ngắn (tối thiểu 8 ký tự).");
    if (passData.newPassword !== passData.confirmPassword) errors.push("Mật khẩu xác nhận không khớp.");
    
    if (errors.length > 0) {
      setPassErrors(errors);
      return;
    }
    setPassErrors([]);

    try {
      await changePassword({ current: passData.currentPassword, new: passData.newPassword });
      setToast({ id: Date.now().toString(), message: "Đổi mật khẩu thành công!", type: 'success' });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      setToast({ id: Date.now().toString(), message: e.message || "Lỗi khi đổi mật khẩu.", type: 'error' });
    }
  };

  // Helper for password strength visual
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 8) return 1;
    if (pass.length < 12) return 2;
    return 3;
  };
  const strength = getPasswordStrength(passData.newPassword);

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {toast && <ToastComponent toast={toast} onClose={(id) => setToast(null)} />}

      {/* 1. Personal Info Card */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={20} /></div>
          <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
        </div>
        
        <div className="p-8">
           <div className="flex flex-col md:flex-row gap-10">
              
              {/* Avatar Uploader */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50">
                       <img 
                         src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random`} 
                         alt="Avatar" 
                         className="w-full h-full object-cover"
                       />
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                       <Camera className="text-white" size={28} />
                    </div>
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                       <User size={14} />
                    </div>
                 </div>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-xs font-bold text-blue-600 hover:underline"
                 >
                   Thay đổi ảnh đại diện
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                       <div className="relative group">
                          <input 
                            type="text" 
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-shadow"
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Số điện thoại</label>
                       <div className="relative group">
                          <input 
                            type="text" 
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-shadow"
                          />
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email đăng nhập <span className="text-slate-400 font-normal">(Chỉ xem)</span></label>
                    <div className="relative">
                       <input 
                         type="email" 
                         value={profileData.email}
                         disabled
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                       />
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 border border-green-200">
                          <ShieldCheck size={12} /> Verified
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <button 
                      onClick={handleProfileSubmit}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-50"
                    >
                      <Save size={18} /> Lưu thông tin
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Change Password Card */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Lock size={20} /></div>
          <h3 className="text-lg font-bold text-slate-800">Đổi mật khẩu</h3>
        </div>

        <div className="p-8">
           <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
                 <input 
                   type="password" 
                   value={passData.currentPassword}
                   onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-medium transition-shadow"
                   placeholder="Nhập mật khẩu hiện tại"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mật khẩu mới <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      value={passData.newPassword}
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-medium transition-shadow"
                      placeholder="Min 8 ký tự"
                    />
                    {/* Password Strength Indicator */}
                    {passData.newPassword.length > 0 && (
                        <div className="flex gap-1 h-1 mt-2">
                            <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-red-400' : 'bg-slate-200'}`}></div>
                            <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                            <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                        </div>
                    )}
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                      className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-sm font-medium transition-shadow ${passData.confirmPassword && passData.newPassword !== passData.confirmPassword ? 'border-red-300' : 'border-slate-200'}`}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                 </div>
              </div>

              {passErrors.length > 0 && (
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    {passErrors.map((err, i) => (
                       <p key={i} className="text-xs text-red-600 font-bold flex items-center gap-2">
                          <AlertCircle size={12} /> {err}
                       </p>
                    ))}
                 </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                 <p className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={14} /> Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ và số.
                 </p>
                 <button 
                   onClick={handlePasswordSubmit}
                   disabled={isChangingPassword}
                   className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg transition-all border-0 disabled:opacity-50"
                 >
                   {isChangingPassword ? 'Đang xử lý...' : <><Check size={18} /> Cập nhật mật khẩu</>}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
