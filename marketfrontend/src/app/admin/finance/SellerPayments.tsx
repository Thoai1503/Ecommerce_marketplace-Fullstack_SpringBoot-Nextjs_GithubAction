<<<<<<< HEAD

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerPayments } from '../../../hooks/admin/useFinance';
import { 
  Search, CheckCircle, AlertTriangle, XCircle, ChevronLeft, Wallet, 
  Banknote, Calendar, CheckSquare, Building2, Filter, ArrowUpRight
} from 'lucide-react';
import { PaymentRequestStatus, SellerPayment } from '../../../types/index';
import { Skeleton } from '../../../components/ui/Skeleton';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import ApprovePaymentModal from '../../../components/admin/finance/ApprovePaymentModal';
import Pagination from '../../../components/ui/Pagination';

const StatusConfig: Record<PaymentRequestStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: <CheckCircle size={14} /> },
  PENDING: { label: 'Chờ duyệt chi', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: <AlertTriangle size={14} /> },
  CANCELLED: { label: 'Đã hủy', color: 'text-rose-700', bgColor: 'bg-rose-50', icon: <XCircle size={14} /> },
};

const ITEMS_PER_PAGE = 10;

export default function SellerPayments() {
  const router = useRouter();
  const { payments, isLoading, approvePayment, isApproving } = useSellerPayments();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | PaymentRequestStatus>('ALL');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SellerPayment | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // --- LOGIC ---
  
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchTab = activeTab === 'ALL' || p.status === activeTab;
      const matchSearch = p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [payments, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate Summary Stats
  const stats = useMemo(() => {
    const pendingList = payments.filter(p => p.status === 'PENDING');
    const pendingAmount = pendingList.reduce((sum, p) => sum + p.amount, 0);
    const pendingCount = pendingList.length;
    
    const paidList = payments.filter(p => p.status === 'PAID');
    const paidAmount = paidList.reduce((sum, p) => sum + p.amount, 0);

    return { pendingAmount, pendingCount, paidAmount };
  }, [payments]);

  // Bulk Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedPayments.length && paginatedPayments.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedPayments.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedTotalAmount = useMemo(() => {
    return payments
      .filter(p => selectedIds.includes(p.id))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [selectedIds, payments]);

  // Actions
  const handleApproveClick = (payment: SellerPayment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const handleBulkApprove = async () => {
    const pendingSelected = payments.filter(p => selectedIds.includes(p.id) && p.status === 'PENDING');
    if (pendingSelected.length === 0) {
        setToast({ message: 'Vui lòng chọn ít nhất 1 khoản "Chờ duyệt" để thao tác.', type: 'warning' });
        return;
    }

    if (confirm(`Xác nhận duyệt chi ${pendingSelected.length} khoản thanh toán với tổng giá trị ${selectedTotalAmount.toLocaleString()}₫?`)) {
       try {
          // In real app, send array of IDs
          for (const p of pendingSelected) {
             await approvePayment(p.id);
          }
          setToast({ message: `Đã duyệt thành công ${pendingSelected.length} khoản thanh toán!`, type: 'success' });
          setSelectedIds([]);
       } catch (err) {
          setToast({ message: 'Có lỗi xảy ra khi duyệt hàng loạt.', type: 'error' });
       }
    }
  };

  const confirmApprove = async () => {
    if (!selectedPayment) return;
    try {
      await approvePayment(selectedPayment.id);
      setToast({ message: 'Đã duyệt thanh toán thành công!', type: 'success' });
      setModalOpen(false);
      setSelectedPayment(null);
    } catch (err) {
      setToast({ message: 'Lỗi khi duyệt thanh toán.', type: 'error' });
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6 pb-24 relative">
      {toast && <ToastComponent toast={{ id: 'toast-1', message: toast.message, type: toast.type }} onClose={() => setToast(null)} />}
      
      {selectedPayment && (
        <ApprovePaymentModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onConfirm={confirmApprove} 
          payment={selectedPayment}
          isProcessing={isApproving}
        />
      )}

      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/finance')}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Thanh toán Seller</h1>
              <p className="text-sm text-slate-500 font-medium">Quản lý đối soát và chi trả hoa hồng định kỳ.</p>
            </div>
         </div>
      </div>

      {/* 2. Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Pending Card (Actionable) */}
         <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[24px] p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Wallet size={100} /></div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">Cần xử lý</span>
                  <span className="text-orange-100 text-xs font-medium">{stats.pendingCount} yêu cầu</span>
               </div>
               <p className="text-sm text-orange-100 font-medium">Tổng tiền chờ chi (Pending)</p>
               <h3 className="text-4xl font-black mt-1 tracking-tight">{stats.pendingAmount.toLocaleString()}₫</h3>
               <button 
                  onClick={() => setActiveTab('PENDING')}
                  className="mt-6 px-4 py-2 bg-white text-orange-600 text-xs font-bold rounded-xl shadow-sm hover:bg-orange-50 transition-colors inline-flex items-center gap-2"
               >
                  Lọc danh sách chờ <ArrowUpRight size={14} />
               </button>
            </div>
         </div>

         {/* Paid Card (Information) */}
         <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Đã chi trả (Tháng này)</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.paidAmount.toLocaleString()}₫</h3>
               </div>
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <CheckCircle size={24} />
               </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
               <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Đã thanh toán 65% tổng nợ tháng này.</p>
         </div>
      </div>

      {/* 3. Main Content */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full lg:max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm tên Seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            {/* Status Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
               {['ALL', 'PENDING', 'PAID'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab === 'ALL' ? 'Tất cả' : StatusConfig[tab as PaymentRequestStatus].label}
                 </button>
               ))}
            </div>
          </div>

          {/* Bulk Action Bar (Shows when items selected) */}
          {selectedIds.length > 0 && (
             <div className="flex items-center gap-4 bg-slate-900 text-white px-4 py-2 rounded-2xl animate-in slide-in-from-bottom-2 shadow-xl">
                <span className="text-xs font-bold pl-1">Đã chọn {selectedIds.length}</span>
                <div className="h-4 w-px bg-slate-700"></div>
                <span className="text-sm font-black text-emerald-400">{selectedTotalAmount.toLocaleString()}₫</span>
                <button 
                   onClick={handleBulkApprove}
                   className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors border-0"
                >
                   Duyệt nhanh
                </button>
                <button 
                   onClick={() => setSelectedIds([])}
                   className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                   <XCircle size={16} />
                </button>
             </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 w-12 text-center">
                   <div 
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${selectedIds.length === paginatedPayments.length && paginatedPayments.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}
                      onClick={toggleSelectAll}
                   >
                      {selectedIds.length === paginatedPayments.length && paginatedPayments.length > 0 && <CheckSquare size={12} className="text-white" />}
                   </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đối tác (Seller)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kỳ đối soát</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Doanh thu</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Phí sàn</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thực nhận (Net)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                         <Wallet size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">Không tìm thấy yêu cầu thanh toán nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr 
                     key={payment.id} 
                     className={`hover:bg-blue-50/20 transition-colors group ${selectedIds.includes(payment.id) ? 'bg-blue-50/40' : ''}`}
                     onClick={() => toggleSelect(payment.id)}
                  >
                    <td className="px-6 py-5 text-center">
                       <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors mx-auto ${selectedIds.includes(payment.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 bg-white group-hover:border-blue-300'}`}
                       >
                          {selectedIds.includes(payment.id) && <CheckSquare size={12} className="text-white" />}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-500 text-xs">
                             {payment.sellerName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-800 truncate">{payment.sellerName}</p>
                             <p className="text-[10px] text-slate-400 flex items-center gap-1"><Building2 size={10} /> ID: {payment.sellerId}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200">
                          <Calendar size={12} /> {payment.period}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-slate-500">
                       {payment.revenue.toLocaleString()}₫
                    </td>
                    <td className="px-6 py-5 text-right text-xs text-red-500 font-bold bg-red-50/50 rounded-l-lg">
                       -{payment.commission.toLocaleString()}₫
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className={`text-sm font-black ${payment.status === 'PAID' ? 'text-emerald-600' : 'text-slate-900'}`}>
                         {payment.amount.toLocaleString()}₫
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${StatusConfig[payment.status].bgColor} ${StatusConfig[payment.status].color}`}>
                        {StatusConfig[payment.status].icon}
                        {StatusConfig[payment.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                       {payment.status === 'PENDING' ? (
                          <button 
                            onClick={() => handleApproveClick(payment)}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 border-0"
                          >
                            Duyệt chi
                          </button>
                       ) : (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1">
                             <CheckCircle size={12} /> Hoàn tất
                          </span>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredPayments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredPayments.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>
    </div>
  );
}
=======
"use client";

import SettlementsList from "./SettlementsList";

export default function SellerPayments() {
  return <SettlementsList />;
}
>>>>>>> c9d4b1976cb5b3a10edc460d55b593d2cd8808dc
