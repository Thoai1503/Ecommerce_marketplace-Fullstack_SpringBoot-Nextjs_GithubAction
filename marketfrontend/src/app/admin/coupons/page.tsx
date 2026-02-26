
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCoupons } from '../../../hooks/admin/useCoupons';
import { 
  Search, Plus, Filter, Trash2, Edit3, Eye, CheckCircle, 
  XCircle, Ban, Calendar, AlertTriangle
} from 'lucide-react';
import { CouponStatus, Coupon } from '../../../types/index';
import { useToast } from '../../../context/ToastContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

const StatusConfig: Record<CouponStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  ACTIVE: { label: 'Hoạt động', color: 'text-green-700', bgColor: 'bg-green-50', icon: <CheckCircle size={14} /> },
  EXPIRED: { label: 'Hết hạn', color: 'text-red-700', bgColor: 'bg-red-50', icon: <XCircle size={14} /> },
  INACTIVE: { label: 'Ngừng hoạt động', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: <Ban size={14} /> },
};

export default function CouponsPage() {
  const router = useRouter();
  const { coupons, isLoading, deleteCoupon, isDeleting } = useCoupons();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | CouponStatus>('ALL');
  const toast = useToast();

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchTab = activeTab === 'ALL' || c.status === activeTab;
      const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [coupons, activeTab, searchQuery]);

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteCoupon(deleteModal.id);
      toast.success('Đã xóa mã giảm giá thành công!');
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Lỗi khi xóa mã giảm giá.');
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Xóa mã giảm giá?"
        description="Bạn có chắc muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa ngay"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             🎫 Mã giảm giá (Coupons)
          </h1>
          <p className="text-sm text-slate-500 font-medium">Quản lý các chương trình khuyến mãi và mã giảm giá.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/coupons/new')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all border-0"
        >
          <Plus size={20} /> Tạo mã mới
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm theo mã coupon, tên chương trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
               {['ALL', 'ACTIVE', 'EXPIRED', 'INACTIVE'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab === 'ALL' ? 'Tất cả' : StatusConfig[tab as CouponStatus].label}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã Coupon</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên chương trình</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thời gian áp dụng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lượt dùng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                         <Search size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">Không tìm thấy mã giảm giá nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon, idx) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => router.push(`/admin/coupons/${coupon.id}`)}>
                    <td className="px-6 py-5 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-5">
                       <span className="font-mono font-black text-sm text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 tracking-wider">
                         {coupon.code}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-bold text-slate-700">{coupon.name}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-xs font-medium text-slate-600 px-2 py-1 rounded-lg border border-slate-100 bg-white">
                         {coupon.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className="text-sm font-black text-blue-600">
                         {coupon.discountType === 'PERCENTAGE' 
                           ? `${coupon.discountValue}%` 
                           : `${coupon.discountValue.toLocaleString()}₫`}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex flex-col text-xs font-medium text-slate-500">
                          <span>{new Date(coupon.startDate).toLocaleDateString('vi-VN')}</span>
                          <span className="text-slate-300 mx-1">↓</span>
                          <span>{new Date(coupon.endDate).toLocaleDateString('vi-VN')}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="text-xs font-bold text-slate-700">
                         {coupon.usedCount} <span className="text-slate-400">/ {coupon.usageLimit === null ? '∞' : coupon.usageLimit}</span>
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${StatusConfig[coupon.status].bgColor} ${StatusConfig[coupon.status].color}`}>
                        {StatusConfig[coupon.status].icon}
                        {StatusConfig[coupon.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); router.push(`/admin/coupons/${coupon.id}`); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                        >
                          <Eye size={16} />
                        </button>
                        {coupon.usedCount === 0 && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); router.push(`/admin/coupons/${coupon.id}/edit`); }}
                             className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border-0 bg-transparent"
                           >
                             <Edit3 size={16} />
                           </button>
                        )}
                        <button 
                           onClick={(e) => openDeleteModal(e, coupon.id)}
                           disabled={isDeleting}
                           className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-0 bg-transparent"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
