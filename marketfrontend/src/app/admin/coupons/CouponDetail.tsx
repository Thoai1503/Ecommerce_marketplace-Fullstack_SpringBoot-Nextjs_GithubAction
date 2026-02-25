
"use client";

import React from 'react';
import { useParams,  useRouter } from 'next/navigation';
import { useCouponDetail } from '../../../hooks/admin/useCoupons';
import { ChevronLeft, Edit3, Calendar, Ticket, DollarSign, BarChart3, Clock } from 'lucide-react';
import { CouponStatus } from '../../../types/index';

const StatusConfig: Record<CouponStatus, { label: string; color: string; bgColor: string; }> = {
  ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-50' },
  EXPIRED: { label: 'Expired', color: 'text-red-700', bgColor: 'bg-red-50' },
  INACTIVE: { label: 'Inactive', color: 'text-slate-500', bgColor: 'bg-slate-100' },
};

export default function CouponDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { coupon, isLoading } = useCouponDetail(id || '');

  if (isLoading) return <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!coupon) return <div className="p-20 text-center font-bold text-slate-400">Coupon not found</div>;

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/coupons')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">{coupon.name}</h1>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${StatusConfig[coupon.status].bgColor} ${StatusConfig[coupon.status].color}`}>
                     {StatusConfig[coupon.status].label}
                  </span>
               </div>
               <p className="text-sm text-slate-500 font-mono font-bold mt-1 tracking-wide">{coupon.code}</p>
            </div>
         </div>
         <button 
           onClick={() => router.push(`/admin/coupons/${coupon.id}/edit`)}
           className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
         >
           <Edit3 size={16} /> Chỉnh sửa
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Main Info Card */}
         <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
               <Ticket size={16} /> Chi tiết ưu đãi
            </h3>
            
            <div className="space-y-6">
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-500">Loại giảm giá</span>
                  <span className="text-sm font-bold text-slate-800">
                     {coupon.discountType === 'PERCENTAGE' ? 'Theo %' : 'Số tiền cố định'}
                  </span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-500">Giá trị</span>
                  <span className="text-xl font-black text-blue-600">
                     {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}₫`}
                  </span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-sm font-medium text-slate-500">Đơn tối thiểu</span>
                  <span className="text-sm font-bold text-slate-800">
                     {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString()}₫` : 'Không giới hạn'}
                  </span>
               </div>
            </div>
         </div>

         {/* Usage & Date Card */}
         <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <BarChart3 size={16} /> Thống kê sử dụng
               </h3>
               
               <div className="flex items-center gap-6">
                  <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                     <p className="text-2xl font-black text-slate-800">{coupon.usedCount}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Đã dùng</p>
                  </div>
                  <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                     <p className="text-2xl font-black text-slate-800">{coupon.usageLimit === null ? '∞' : coupon.usageLimit}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Tổng giới hạn</p>
                  </div>
               </div>
               
               {coupon.usageLimit !== null && (
                  <div className="mt-6">
                     <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-500">Tiến độ</span>
                        <span className="text-blue-600">{Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-blue-500 rounded-full transition-all" 
                           style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                        ></div>
                     </div>
                  </div>
               )}
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Clock size={16} /> Thời gian
               </h3>
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-500">Bắt đầu</span>
                     <span className="text-sm font-bold text-slate-800">{new Date(coupon.startDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-slate-500">Kết thúc</span>
                     <span className="text-sm font-bold text-slate-800">{new Date(coupon.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
