
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCouponDetail } from '../../../hooks/admin/useCoupons';
import { ChevronLeft, Save, Ticket, Calendar, DollarSign, Percent, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { CouponStatus, DiscountType } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { z } from 'zod';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

// --- ZOD SCHEMA DEFINITION ---
const couponSchema = z.object({
  name: z.string().min(1, "Tên chương trình là bắt buộc").max(100, "Tên quá dài"),
  code: z.string()
    .min(3, "Mã phải có ít nhất 3 ký tự")
    .regex(/^[A-Z0-9_]+$/, "Mã chỉ chứa chữ hoa, số và dấu gạch dưới (_)"),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number({ message: "Vui lòng nhập số hợp lệ" })
    .min(1, "Giá trị giảm giá phải lớn hơn 0"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  usageLimit: z.union([z.string(), z.number(), z.null()]).transform(val => (val === '' || val === null) ? null : Number(val)), 
  minOrderAmount: z.number().min(0, "Giá trị đơn tối thiểu không hợp lệ"),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']),
}).superRefine((data, ctx) => {
  // 1. Validate Percentage limit
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Phần trăm giảm giá không được quá 100%",
      path: ["discountValue"],
    });
  }
  
  // 2. Validate Date Range
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["endDate"],
      });
    }
  }
});

export default function EditCoupon() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = !!id;
  const { coupon, isLoading, createCoupon, updateCoupon, isSaving } = useCouponDetail(id || '');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 0,
    startDate: '',
    endDate: '',
    usageLimit: '' as string | number, // Use string for input handling
    minOrderAmount: 0,
    status: 'ACTIVE' as CouponStatus,
  });

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && coupon) {
      setFormData({
        name: coupon.name,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        startDate: coupon.startDate.split('T')[0],
        endDate: coupon.endDate.split('T')[0],
        usageLimit: coupon.usageLimit === null ? '' : coupon.usageLimit,
        minOrderAmount: coupon.minOrderAmount || 0,
        status: coupon.status,
      });
    } else if (!isEditMode) {
       // Set defaults for create mode
       const today = new Date().toISOString().split('T')[0];
       setFormData(prev => ({ ...prev, startDate: today }));
    }
  }, [isEditMode, coupon]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
    // Clear code error if exists
    if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
  };

  const handleSubmit = async () => {
    // 1. Prepare data for Zod validation (convert types)
    const rawData = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      code: formData.code.toUpperCase().replace(/\s/g, ''), // Ensure code format before validation
    };

    // 2. Validate with Zod
    const result = couponSchema.safeParse(rawData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        newErrors[fieldName] = issue.message;
      });
      setErrors(newErrors);
      setToast({ message: "Vui lòng kiểm tra lại thông tin", type: "error" });
      return;
    }

    // 3. Clear errors and Proceed
    setErrors({});
    
    // Use the transformed/validated data from Zod if needed, or refine payload
    const payload = {
      ...rawData,
      usageLimit: rawData.usageLimit === '' ? null : Number(rawData.usageLimit), // Ensure number or null
    };

    try {
      if (isEditMode) {
        await updateCoupon(payload);
        setToast({ message: "Cập nhật thành công!", type: "success" });
      } else {
        await createCoupon(payload);
        setToast({ message: "Tạo coupon thành công!", type: "success" });
      }
      setTimeout(() => router.push('/admin/coupons'), 1000);
    } catch (e) {
      setToast({ message: "Đã có lỗi xảy ra", type: "error" });
    }
  };

  if (isEditMode && isLoading) return (
    <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-4xl mx-auto pb-24 space-y-6">
      {toast && <ToastComponent toast={{ id: '1', message: toast.message, type: toast.type }} onClose={() => setToast(null)} />}

      <Breadcrumbs items={[
        { label: 'Coupons', path: '/admin/coupons' },
        { label: isEditMode ? 'Edit Coupon' : 'New Coupon' }
      ]} />

      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/coupons')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{isEditMode ? 'Chỉnh sửa Coupon' : 'Thêm Coupon Mới'}</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Thiết lập thông tin mã giảm giá và quy tắc áp dụng.</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/coupons')} className="px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl border-0 bg-transparent">Hủy</button>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 border-0 disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu Coupon'}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Left Column */}
         <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Ticket size={18} className="text-blue-500" /> Thông tin cơ bản
               </h3>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Tên chương trình *</label>
                     <input 
                       type="text" 
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold ${errors.name ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                       placeholder="VD: Summer Sale 2024"
                     />
                     {errors.name && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Mã Coupon (Code) *</label>
                     <div className="relative">
                        <input 
                          type="text" 
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                          disabled={isEditMode}
                          className={`w-full pl-4 pr-32 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-black tracking-widest uppercase ${isEditMode ? 'bg-slate-100 text-slate-500' : ''} ${errors.code ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-500/10'}`}
                          placeholder="VD: SUMMER24"
                        />
                        {!isEditMode && (
                           <button 
                             onClick={generateCode}
                             className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                           >
                             <RefreshCw size={12} /> Auto
                           </button>
                        )}
                     </div>
                     {errors.code && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10} /> {errors.code}</p>}
                     <p className="text-[10px] text-slate-400">Mã duy nhất, viết liền không dấu (A-Z, 0-9).</p>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Calendar size={18} className="text-purple-500" /> Thời gian hiệu lực
               </h3>
               
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Ngày bắt đầu *</label>
                     <input 
                       type="date"
                       value={formData.startDate}
                       onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                       className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium ${errors.startDate ? 'border-red-300' : 'border-slate-200 focus:ring-purple-500/10'}`}
                     />
                     {errors.startDate && <p className="text-xs text-red-500 font-bold">{errors.startDate}</p>}
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Ngày kết thúc *</label>
                     <input 
                       type="date"
                       value={formData.endDate}
                       onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                       className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium ${errors.endDate ? 'border-red-300' : 'border-slate-200 focus:ring-purple-500/10'}`}
                     />
                     {errors.endDate && <p className="text-xs text-red-500 font-bold">{errors.endDate}</p>}
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column */}
         <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                  <DollarSign size={18} className="text-green-500" /> Giá trị giảm giá
               </h3>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Loại giảm giá</label>
                     <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button 
                          onClick={() => setFormData({...formData, discountType: 'PERCENTAGE'})}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.discountType === 'PERCENTAGE' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Theo Phần Trăm (%)
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, discountType: 'FIXED_AMOUNT'})}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.discountType === 'FIXED_AMOUNT' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Số Tiền Cố Định (VNĐ)
                        </button>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Giá trị *</label>
                     <div className="relative">
                        <input 
                          type="number" 
                          value={formData.discountValue}
                          onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                          className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-lg font-black ${errors.discountValue ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-green-500/10'}`}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                           {formData.discountType === 'PERCENTAGE' ? <Percent size={18} /> : <span className="text-xs font-bold">VNĐ</span>}
                        </div>
                     </div>
                     {errors.discountValue && <p className="text-xs text-red-500 font-bold">{errors.discountValue}</p>}
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Đơn tối thiểu</label>
                     <div className="relative">
                        <input 
                          type="number" 
                          value={formData.minOrderAmount}
                          onChange={(e) => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                          className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-medium ${errors.minOrderAmount ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-green-500/10'}`}
                          placeholder="0 = Không giới hạn"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">VNĐ</span>
                     </div>
                     {errors.minOrderAmount && <p className="text-xs text-red-500 font-bold">{errors.minOrderAmount}</p>}
                     <p className="text-[10px] text-slate-400">Giá trị đơn hàng tối thiểu để áp dụng mã.</p>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                  <AlertCircle size={18} className="text-orange-500" /> Giới hạn & Trạng thái
               </h3>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Giới hạn số lần dùng</label>
                     <input 
                       type="number" 
                       value={formData.usageLimit}
                       onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                       className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 text-sm font-medium"
                       placeholder="Để trống = Không giới hạn"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Trạng thái</label>
                     <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as CouponStatus})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 text-sm font-bold appearance-none cursor-pointer"
                     >
                        <option value="ACTIVE">Active (Hoạt động)</option>
                        <option value="INACTIVE">Inactive (Tạm ẩn)</option>
                     </select>
                  </div>
                  
                  {isEditMode && (
                     <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 items-center">
                        <Info size={18} className="text-slate-400" />
                        <div>
                           <p className="text-xs font-bold text-slate-500 uppercase">Đã sử dụng</p>
                           <p className="text-sm font-black text-slate-800">{coupon?.usedCount || 0} lần</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
