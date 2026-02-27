
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCustomerDetail } from '../../../hooks/admin/useCustomers';
import { 
  ChevronLeft, Edit3, Ban, Unlock, Mail, Phone, MapPin, 
  CreditCard, ShoppingBag, Hash, Save, StickyNote, Copy, 
  Plus, Calendar, CheckCircle2, AlertTriangle, Pencil, Truck, XCircle, Clock, CheckCircle, Lock, Trash2,
  BrainCircuit, Sparkles, TrendingUp, Activity, Target, Zap, ArrowRight
} from 'lucide-react';
import { CustomerStatus, OrderStatus, Customer } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { BlockCustomerModal, DeleteCustomerModal } from '../../../components/admin/customers/CustomerModals';
import { ProfileSkeleton } from '../../../components/ui/Skeleton';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';

// --- CONFIGS ---
const OrderStatusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'text-[#ffc107]', bgColor: 'bg-[#ffc107]/10', icon: <AlertTriangle size={12} /> },
  CONFIRMED: { label: 'Confirmed', color: 'text-[#2b8cee]', bgColor: 'bg-[#2b8cee]/10', icon: <CheckCircle2 size={12} /> },
  PROCESSING: { label: 'Processing', color: 'text-[#fd7e14]', bgColor: 'bg-[#fd7e14]/10', icon: <Pencil size={12} /> },
  SHIPPED: { label: 'Shipped', color: 'text-[#6f42c1]', bgColor: 'bg-[#6f42c1]/10', icon: <Truck size={12} /> },
  COMPLETED: { label: 'Completed', color: 'text-[#28a745]', bgColor: 'bg-[#28a745]/10', icon: <CheckCircle2 size={12} /> },
  CANCELED: { label: 'Canceled', color: 'text-[#dc3545]', bgColor: 'bg-[#dc3545]/10', icon: <XCircle size={12} /> },
  REFUNDED: { label: 'Refunded', color: 'text-[#6c757d]', bgColor: 'bg-[#6c757d]/10', icon: <XCircle size={12} /> },
};

// Synced with List Page
const CustomerStatusConfig: Record<CustomerStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-50', icon: <CheckCircle size={12} /> },
  INACTIVE: { label: 'Inactive', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: <Ban size={12} /> },
  BANNED: { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-50', icon: <Lock size={12} /> },
};

// --- AI INSIGHTS COMPONENT ---
const AICustomerInsights = ({ customer, onAction }: { customer: Customer, onAction: (msg: string) => void }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    // Simulate AI Analysis
    const timer = setTimeout(() => {
      // Mock Data Calculation
      const daysInactive = customer.lastOrderDate 
        ? Math.floor((new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 3600 * 24))
        : 999;
      
      const isChurnRisk = daysInactive > 60; // Inactive for 60 days = Risk
      
      const churnProbability = isChurnRisk 
        ? Math.min(95, 50 + (daysInactive / 30) * 10) 
        : Math.max(5, 20 - (customer.totalOrders * 2));

      const predictedLTV = customer.totalSpent * 1.25; // Simple projection
      
      let strategy = '';
      let actionLabel = '';
      
      if (churnProbability > 70) {
        strategy = 'Khách hàng có nguy cơ rời bỏ cao. Cần kích hoạt lại ngay.';
        actionLabel = 'Gửi Email Win-back (-15%)';
      } else if (customer.totalSpent > 10000000) {
        strategy = 'Khách hàng VIP tiềm năng. Có thể upsell các sản phẩm cao cấp.';
        actionLabel = 'Mời vào nhóm Private VIP';
      } else {
        strategy = 'Khách hàng ổn định. Nên duy trì tương tác định kỳ.';
        actionLabel = 'Gửi thông báo hàng mới';
      }

      setInsights({
        churnProbability: Math.round(churnProbability),
        predictedLTV,
        strategy,
        actionLabel,
        trend: churnProbability > 50 ? 'down' : 'up'
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [customer]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden mb-6">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <BrainCircuit size={120} />
      </div>
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <Sparkles className="text-yellow-400 animate-pulse" size={20} />
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100">AI Customer Intelligence</h3>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse relative z-10">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-12 bg-white/10 rounded-xl w-full"></div>
          <div className="grid grid-cols-2 gap-4">
             <div className="h-20 bg-white/10 rounded-xl"></div>
             <div className="h-20 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Churn Prediction */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
               <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className={insights.churnProbability > 50 ? 'text-red-400' : 'text-green-400'} />
                  <p className="text-xs font-bold text-indigo-200 uppercase">Rủi ro rời bỏ (Churn)</p>
               </div>
               <div className="flex items-end gap-2">
                  <span className={`text-3xl font-black ${insights.churnProbability > 50 ? 'text-red-300' : 'text-green-300'}`}>
                    {insights.churnProbability}%
                  </span>
                  <span className="text-xs font-medium text-white/60 mb-1.5">xác suất</span>
               </div>
               {/* Progress Bar */}
               <div className="w-full h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${insights.churnProbability > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${insights.churnProbability}%` }}
                  ></div>
               </div>
            </div>

            {/* LTV Forecast */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
               <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-blue-300" />
                  <p className="text-xs font-bold text-indigo-200 uppercase">Dự báo LTV (1 năm)</p>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {(insights.predictedLTV / 1000000).toFixed(1)}M₫
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                     <TrendingUp size={12} className="text-green-400" />
                     <span className="text-[10px] font-bold text-green-400">+25% tiềm năng</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-500/30 flex flex-col gap-3">
             <div className="flex gap-3">
               <div className="p-1.5 bg-yellow-500/20 rounded-lg h-fit text-yellow-400 shrink-0">
                  <Zap size={16} />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">AI Recommendation</p>
                 <p className="text-xs font-medium text-indigo-100 leading-relaxed">
                   {insights.strategy}
                 </p>
               </div>
             </div>
             
             <button 
                onClick={() => onAction(`Đã thực hiện: ${insights.actionLabel}`)}
                className="w-full py-2.5 bg-white text-indigo-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20 mt-1"
             >
                {insights.actionLabel} <ArrowRight size={14} />
             </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default function CustomerDetail() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const router = useRouter();
  const { customer, orders, isLoading, updateCustomer } = useCustomerDetail(id);
  const [note, setNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Modal States
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  React.useEffect(() => {
    if (customer?.note) setNote(customer.note);
  }, [customer]);

  if (isLoading) return <ProfileSkeleton />;

  if (!customer) return <div className="p-20 text-center text-slate-400 font-bold">Customer not found</div>;

  const handleConfirmBlock = async () => {
    const isBlocked = customer.status === 'BANNED';
    try {
      await updateCustomer({ status: isBlocked ? 'ACTIVE' : 'BANNED' });
      setToast({ message: `Customer ${isBlocked ? 'unblocked' : 'blocked'} successfully`, type: 'success' });
      setIsBlockModalOpen(false);
    } catch (e) {
      setToast({ message: "Action failed", type: "error" });
    }
  };

  const handleConfirmDelete = async () => {
    // In a real app, call delete API here.
    // await deleteCustomer(id);
    setToast({ message: "Customer deleted successfully", type: "success" });
    setIsDeleteModalOpen(false);
    setTimeout(() => router.push('/admin/customers'), 1000);
  };

  const handleSaveNote = async () => {
    try {
      await updateCustomer({ note });
      setIsEditingNote(false);
      setToast({ message: "Internal note updated", type: 'success' });
    } catch (e) {
      setToast({ message: "Failed to update note", type: 'error' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: "Copied to clipboard", type: 'success' });
  };

  const memberSince = new Date(customer.joinedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - memberSince.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const memberDuration = diffDays > 365 
    ? `${Math.floor(diffDays / 365)} năm` 
    : `${diffDays} ngày`;

  const statusConfig = CustomerStatusConfig[customer.status];

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20 space-y-8">
      {toast && <ToastComponent toast={{ id: "customer-toast", ...toast }} onClose={() => setToast(null)} />}
      
      {/* Modals */}
      <BlockCustomerModal 
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        customerName={customer.fullName}
        isBlocked={customer.status === 'BANNED'}
      />
      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        customerName={customer.fullName}
      />

      <Breadcrumbs items={[
        { label: 'Customers', path: '/admin/customers' },
        { label: 'Detail' }
      ]} />

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/customers')} 
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              {customer.fullName}
              <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                {memberDuration}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsDeleteModalOpen(true)}
             className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all shadow-sm"
           >
             <Trash2 size={18} /> Xóa
           </button>
           <button 
             onClick={() => setToast({ message: "Tính năng tạo đơn hàng sẽ sớm ra mắt (Phase 2)", type: "info" })}
             className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 border-0"
           >
             <Plus size={18} /> Tạo đơn hàng
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile & Info */}
        <div className="space-y-8">
          
          {/* 2. Profile Card */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 text-center relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:scale-105 transition-transform duration-500"></div>
             
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mb-4 relative">
                   <img src={customer.avatar} alt={customer.fullName} className="w-full h-full object-cover" />
                   {customer.status === 'BANNED' && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                       <Ban className="text-white" size={32} />
                     </div>
                   )}
                </div>
                
                <h2 className="text-xl font-black text-slate-800 mb-1">{customer.fullName}</h2>
                <p className="text-xs font-bold text-slate-400 font-mono mb-4">{customer.accountCode}</p>
                <div className="mb-6">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.bgColor} ${statusConfig.color}`}>
                     {statusConfig.icon}
                     {statusConfig.label}
                   </span>
                </div>

                <div className="w-full space-y-3 text-left">
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group/item hover:bg-blue-50 hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Mail size={16} className="text-slate-400 shrink-0 group-hover/item:text-blue-500" />
                        <span className="text-sm font-bold text-slate-700 truncate">{customer.email}</span>
                      </div>
                      <button onClick={() => copyToClipboard(customer.email)} className="text-slate-300 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <Copy size={14} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group/item hover:bg-blue-50 hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-400 shrink-0 group-hover/item:text-blue-500" />
                        <span className="text-sm font-bold text-slate-700">{customer.phone}</span>
                      </div>
                      <button onClick={() => copyToClipboard(customer.phone)} className="text-slate-300 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <Copy size={14} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-slate-700">{new Date(customer.joinedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3 w-full mt-6 pt-6 border-t border-slate-100">
                   <button 
                     onClick={() => router.push(`/admin/customers/${customer.id}/edit`)}
                     className="flex-1 py-2.5 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-2"
                   >
                     <Edit3 size={14} /> Edit Info
                   </button>
                   {customer.status === 'BANNED' ? (
                      <button 
                        onClick={() => setIsBlockModalOpen(true)}
                        className="flex-1 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-xs font-bold transition-all border border-green-100 flex items-center justify-center gap-2"
                      >
                        <Unlock size={14} /> Unblock
                      </button>
                   ) : (
                      <button 
                        onClick={() => setIsBlockModalOpen(true)}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all border border-red-100 flex items-center justify-center gap-2"
                      >
                        <Ban size={14} /> Block
                      </button>
                   )}
                </div>
             </div>
          </div>

          {/* 3. Internal Notes (CRM) */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <StickyNote size={64} className="text-amber-500" />
             </div>
             <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <StickyNote size={14} /> Ghi chú nội bộ
                </h3>
                {!isEditingNote && (
                  <button onClick={() => setIsEditingNote(true)} className="text-xs font-bold text-blue-600 hover:underline">Sửa</button>
                )}
             </div>
             
             {isEditingNote ? (
               <div className="space-y-3 relative z-10">
                 <textarea 
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-amber-50/50 min-h-[100px]"
                   placeholder="Nhập ghi chú về khách hàng (Sở thích, lưu ý giao hàng)..."
                 />
                 <div className="flex gap-2 justify-end">
                   <button onClick={() => setIsEditingNote(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Hủy</button>
                   <button onClick={handleSaveNote} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm border-0">
                     <Save size={12} /> Lưu
                   </button>
                 </div>
               </div>
             ) : (
               <div className={`text-sm p-4 rounded-xl border relative z-10 ${note ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-400 italic'}`}>
                 {note || "Chưa có ghi chú."}
               </div>
             )}
          </div>

          {/* 4. Addresses */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sổ địa chỉ ({customer.addresses?.length || 0})</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">+ Thêm mới</button>
             </div>
             
             <div className="space-y-3">
                {customer.addresses && customer.addresses.length > 0 ? (
                  customer.addresses.map((addr, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border transition-all ${addr.isDefault ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                       <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <MapPin size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="flex items-center justify-between mb-1">
                               <p className="text-xs text-slate-500 font-bold uppercase">{addr.city}</p>
                               {addr.isDefault && (
                                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Mặc định</span>
                               )}
                             </div>
                             <p className="text-sm font-bold text-slate-800 leading-snug">{addr.fullAddress}</p>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <MapPin className="mx-auto text-slate-300 mb-2" size={24} />
                      <p className="text-xs text-slate-400 font-medium">Chưa có địa chỉ nào.</p>
                   </div>
                )}
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Stats & Orders */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Customer Insights */}
          <AICustomerInsights customer={customer} onAction={(msg) => setToast({ message: msg, type: 'success' })} />

          {/* 5. Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-blue-300 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <ShoppingBag size={24} />
                </div>
                <span className="text-3xl font-black text-slate-800 tracking-tight">{customer.totalOrders}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Tổng đơn hàng</span>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-green-300 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <CreditCard size={24} />
                </div>
                <span className="text-3xl font-black text-slate-800 tracking-tight">{customer.totalSpent.toLocaleString()}₫</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Tổng chi tiêu</span>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-purple-300 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Hash size={24} />
                </div>
                <span className="text-3xl font-black text-slate-800 tracking-tight">
                  {customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders).toLocaleString() : 0}₫
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Giá trị trung bình</span>
             </div>
          </div>

          {/* 6. Order History */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={18} /></div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lịch sử mua hàng</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{orders.length} đơn</span>
             </div>
             
             <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Mã đơn</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng tiền</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Ngày đặt</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {orders.length > 0 ? (
                        orders.map(order => (
                          <tr 
                            key={order.id} 
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group" 
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                          >
                             <td className="px-6 py-4 pl-8">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{order.orderCode}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <span className="text-sm font-black text-slate-900">{order.totalAmount.toLocaleString()}₫</span>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${OrderStatusConfig[order.status].bgColor} ${OrderStatusConfig[order.status].color}`}>
                                   {OrderStatusConfig[order.status].icon}
                                   {OrderStatusConfig[order.status].label}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right pr-8">
                                <span className="text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                             </td>
                          </tr>
                        ))
                      ) : (
                         <tr>
                            <td colSpan={4} className="px-6 py-20 text-center text-slate-400 text-sm flex flex-col items-center justify-center">
                               <ShoppingBag size={40} className="mb-3 opacity-20" />
                               Chưa có đơn hàng nào.
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
             
             {orders.length > 5 && (
               <div className="p-4 border-t border-slate-100 text-center">
                 <button className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả đơn hàng</button>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
