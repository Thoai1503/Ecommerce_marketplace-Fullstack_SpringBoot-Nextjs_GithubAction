
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useGeneralSettings } from '../../../hooks/admin/useSettings';
import { Save, UploadCloud, Store, Mail, Phone, MapPin, Globe, Clock, Image as ImageIcon, RotateCcw, AlertCircle } from 'lucide-react';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { FormSkeleton } from '../../../components/ui/Skeleton';
import { z } from 'zod';

// Zod Schema for validation
const generalSettingsSchema = z.object({
  storeName: z.string().min(1, "Tên cửa hàng không được để trống"),
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại tối thiểu 10 số").regex(/^[0-9]+$/, "Chỉ được nhập số"),
  address: z.string().min(5, "Địa chỉ quá ngắn"),
  storeDescription: z.string().optional(),
  storeLogo: z.any().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

export default function GeneralSettings() {
  const { settings, isLoading, updateSettings, isUpdating } = useGeneralSettings();
  
  // Form State
  const [formData, setFormData] = useState({
    storeName: '',
    storeLogo: null as string | null,
    storeDescription: '',
    email: '',
    phone: '',
    address: '',
    currency: '',
    timezone: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Initial Data
  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  // Check for changes (Dirty State)
  useEffect(() => {
    if (!settings) return;
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(settings);
    setIsDirty(hasChanged);
  }, [formData, settings]);

  const validateField = (field: string, value: any) => {
    try {
      (generalSettingsSchema.shape as any)[field].parse(value);
      setErrors(prev => ({ ...prev, [field]: '' })); // Clear error if valid
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.issues[0].message }));
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleReset = () => {
    if (settings) {
      setFormData({ ...settings });
      setErrors({});
      setIsDirty(false);
      setToast({ id: Date.now().toString(), message: "Đã khôi phục cài đặt gốc.", type: 'info' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({ id: Date.now().toString(), message: "File ảnh quá lớn (Max 2MB)", type: 'error' });
        return;
      }
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, storeLogo: url }));
    }
  };

  const handleSubmit = async () => {
    // Final validation before submit
    const result = generalSettingsSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
      setToast({ id: Date.now().toString(), message: "Vui lòng kiểm tra lại các trường báo lỗi.", type: 'error' });
      
      // Scroll to top error
      const firstError = document.querySelector('.error-message');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      await updateSettings(formData);
      setToast({ id: Date.now().toString(), message: "Lưu cài đặt thành công!", type: 'success' });
      setIsDirty(false);
      setErrors({});
    } catch (e) {
      setToast({ id: Date.now().toString(), message: "Lỗi khi lưu cài đặt.", type: 'error' });
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-6">
      {toast && <ToastComponent toast={toast} onClose={(id) => setToast(null)} />}

      {/* Floating Action Bar */}
      <div className={`fixed bottom-6 right-6 lg:right-10 z-50 flex items-center gap-3 p-2 bg-slate-900/90 backdrop-blur text-white rounded-2xl shadow-2xl transition-all duration-300 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
         <span className="text-sm font-bold pl-3 pr-2">Có thay đổi chưa lưu</span>
         <button 
           onClick={handleReset}
           className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
           title="Khôi phục"
         >
           <RotateCcw size={18} />
         </button>
         <button 
           onClick={handleSubmit} 
           disabled={isUpdating}
           className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all disabled:opacity-70"
         >
           {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
         </button>
      </div>

      {/* SECTION 1: Store Branding */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Store size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin cửa hàng</h3>
              <p className="text-xs text-slate-500 font-medium">Logo, tên và mô tả hiển thị trên trang chủ.</p>
           </div>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Logo Upload */}
            <div className="w-full md:w-auto flex flex-col items-center md:items-start gap-3">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo cửa hàng</label>
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-40 h-40 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-all relative overflow-hidden group shadow-inner"
               >
                  {formData.storeLogo ? (
                     <>
                        <img src={formData.storeLogo} alt="Logo" className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-sm">
                           <ImageIcon size={24} className="mb-1" />
                           <span className="text-[10px] font-bold uppercase">Thay đổi</span>
                        </div>
                     </>
                  ) : (
                     <>
                        <UploadCloud size={32} className="mb-2 text-slate-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-500">Upload Logo</span>
                        <span className="text-[9px] text-slate-400 mt-1">Max 2MB</span>
                     </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
               </div>
            </div>
            
            {/* Text Inputs */}
            <div className="flex-1 space-y-6 w-full">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên cửa hàng <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.storeName}
                    onChange={(e) => handleChange('storeName', e.target.value)}
                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold transition-shadow ${errors.storeName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                    placeholder="Nhập tên cửa hàng của bạn"
                  />
                  {errors.storeName && <p className="text-xs text-red-500 font-bold flex items-center gap-1 error-message"><AlertCircle size={12}/> {errors.storeName}</p>}
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mô tả ngắn</label>
                  <textarea 
                    rows={4}
                    value={formData.storeDescription}
                    onChange={(e) => handleChange('storeDescription', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium resize-none transition-shadow"
                    placeholder="Giới thiệu ngắn gọn về cửa hàng..."
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Contact Information */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
           <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Phone size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin liên hệ</h3>
              <p className="text-xs text-slate-500 font-medium">Thông tin này sẽ hiển thị trong email và trang liên hệ.</p>
           </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email công khai <span className="text-red-500">*</span></label>
                <div className="relative group">
                   <input 
                     type="email" 
                     value={formData.email}
                     onChange={(e) => handleChange('email', e.target.value)}
                     className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-shadow ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-purple-500/10'}`}
                     placeholder="contact@store.com"
                   />
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-bold flex items-center gap-1 error-message"><AlertCircle size={12}/> {errors.email}</p>}
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative group">
                   <input 
                     type="text" 
                     value={formData.phone}
                     onChange={(e) => handleChange('phone', e.target.value)}
                     className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-shadow ${errors.phone ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-purple-500/10'}`}
                     placeholder="0901234567"
                   />
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                </div>
                {errors.phone && <p className="text-xs text-red-500 font-bold flex items-center gap-1 error-message"><AlertCircle size={12}/> {errors.phone}</p>}
             </div>
             <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Địa chỉ văn phòng <span className="text-red-500">*</span></label>
                <div className="relative group">
                   <input 
                     type="text" 
                     value={formData.address}
                     onChange={(e) => handleChange('address', e.target.value)}
                     className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium transition-shadow ${errors.address ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-purple-500/10'}`}
                     placeholder="VD: 123 Đường Lê Lợi, Quận 1, TP.HCM"
                   />
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                </div>
                {errors.address && <p className="text-xs text-red-500 font-bold flex items-center gap-1 error-message"><AlertCircle size={12}/> {errors.address}</p>}
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: System (Read-only) */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
           <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
              <Globe size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-800">Cấu hình khu vực</h3>
              <p className="text-xs text-slate-500 font-medium">Các thiết lập này được định sẵn bởi hệ thống.</p>
           </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2 opacity-70">
                <label className="text-sm font-bold text-slate-500">Đơn vị tiền tệ (Mặc định)</label>
                <div className="relative">
                   <div className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed flex items-center">
                      {formData.currency}
                   </div>
                   <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
             </div>
             <div className="space-y-2 opacity-70">
                <label className="text-sm font-bold text-slate-500">Múi giờ hệ thống</label>
                <div className="relative">
                   <div className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed flex items-center">
                      {formData.timezone}
                   </div>
                   <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
