
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSellerDetail } from '../../../hooks/admin/useSellers';
import { useProducts } from '../../../hooks/admin/useProducts'; // Import hooks sản phẩm
import http from '../../../lib/http';
import {
  ChevronLeft, Edit3, Ban, Unlock, Mail, Phone, MapPin, Globe,
  ShoppingBag, Truck, DollarSign, Star, Calendar, CheckCircle,
  ExternalLink, MoreHorizontal, ArrowUpRight, ShieldCheck, Package, AlertCircle, XCircle,
  BrainCircuit, Sparkles, MessageSquare, ThumbsUp, ThumbsDown, Send, Loader2,
  Clock, X, AlertTriangle
} from 'lucide-react';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { BlockSellerModal, ReopenSellerModal } from '../../../components/admin/sellers/SellerModals';
import { ProductStatus, Seller } from '../../../types/index';
import { ProfileSkeleton } from '../../../components/ui/Skeleton';

// Helper for status badge style (Synced with Products Page)
const ProductStatusConfig: Record<ProductStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  HIDDEN: 'bg-indigo-50 text-indigo-700',
};

// --- AI COMPONENT: REVIEW ANALYST ---
const AISellerAnalyst = ({ seller }: { seller: Seller }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    setAnalyzing(true);
    // Simulate AI Processing Time based on review count
    const timer = setTimeout(() => {
      // Mock logic based on rating to generate realistic looking AI summary
      let summary = "";
      let sentimentScore = 0;
      let pros: string[] = [];
      let cons: string[] = [];

      if (seller.rating >= 4.5) {
        summary = "Shop có chỉ số uy tín rất cao. Dữ liệu từ 3 tháng gần nhất cho thấy khách hàng đặc biệt hài lòng về chất lượng sản phẩm chính hãng và tốc độ giao hàng. AI không phát hiện dấu hiệu seeding đánh giá ảo.";
        sentimentScore = 94;
        pros = ["Giao hàng siêu tốc", "Hàng chuẩn auth", "Đóng gói kỹ 2 lớp"];
        cons = ["Rep inbox hơi chậm (T7-CN)"];
      } else if (seller.rating >= 4.0) {
        summary = "Đánh giá tổng quan ở mức Khá. Sản phẩm đúng mô tả và giá cả cạnh tranh là điểm mạnh. Tuy nhiên, AI phát hiện cụm từ 'hộp móp' xuất hiện trong 15% đánh giá gần đây, cần cải thiện khâu đóng gói.";
        sentimentScore = 78;
        pros = ["Giá rẻ hơn thị trường", "Đúng mô tả"];
        cons = ["Hộp hay bị móp", "Giao hàng lâu"];
      } else {
        summary = "CẢNH BÁO: AI phát hiện nhiều tín hiệu tiêu cực. Khách hàng phàn nàn nhiều về việc giao sai mẫu và thái độ phục vụ khi khiếu nại. Tỷ lệ quay lại mua hàng (Retention) dự báo rất thấp.";
        sentimentScore = 42;
        pros = ["Giá rẻ nhất sàn"];
        cons = ["Giao sai màu", "CSKH kém", "Khó đổi trả", "Thái độ lồi lõm"];
      }

      setAnalysis({ summary, sentimentScore, pros, cons });
      setAnalyzing(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [seller]);

  return (
    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-800 rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden mb-6 group">
      {/* Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <BrainCircuit size={100} />
      </div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full opacity-10 blur-3xl"></div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10 flex-wrap">
        <Sparkles className="text-yellow-300 animate-pulse" size={20} />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">AI Review Sentiment</h3>
        <span className="ml-1 px-2 py-0.5 bg-yellow-400/90 text-yellow-950 rounded-md text-[10px] font-black uppercase tracking-wider border border-yellow-300">
          DEMO · Mock data
        </span>
      </div>
      <p className="text-[11px] text-white/70 font-medium mb-3 relative z-10">
        Tính năng AI đang ở giai đoạn preview — dữ liệu hiển thị là minh họa, chưa nối với mô hình phân tích thực tế.
      </p>

      {analyzing ? (
        <div className="space-y-4 animate-pulse relative z-10">
           <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></div>
              </div>
              <span className="text-xs font-bold text-white/90">Đang đọc {seller.reviewCount.toLocaleString()} đánh giá & comment...</span>
           </div>
           <div className="h-16 bg-white/10 rounded-xl w-full border border-white/5"></div>
           <div className="flex gap-2">
              <div className="h-6 bg-white/10 rounded w-20"></div>
              <div className="h-6 bg-white/10 rounded w-24"></div>
           </div>
        </div>
      ) : (
        <div className="relative z-10 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* Summary Text */}
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
              <p className="text-sm font-medium leading-relaxed text-white/95">
                "{analysis.summary}"
              </p>
           </div>

           {/* Score & Tags */}
           <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Chỉ số cảm xúc (Sentiment Score)</span>
                 <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${analysis.sentimentScore >= 80 ? 'text-green-300' : analysis.sentimentScore >= 50 ? 'text-yellow-300' : 'text-red-300'}`}>
                      {analysis.sentimentScore}/100
                    </span>
                    <span className="text-xs font-bold opacity-80 mb-1">
                      {analysis.sentimentScore >= 80 ? 'Rất tích cực' : analysis.sentimentScore >= 50 ? 'Trung bình' : 'Tiêu cực'}
                    </span>
                 </div>
              </div>
              
              <div className="flex-1 flex flex-col sm:items-end gap-2">
                 <div className="flex flex-wrap sm:justify-end gap-2">
                    {analysis.pros.map((tag: string, i: number) => (
                       <span key={i} className="px-2.5 py-1 bg-green-500/20 border border-green-400/30 text-green-100 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                          <ThumbsUp size={10} className="text-green-300" /> {tag}
                       </span>
                    ))}
                 </div>
                 <div className="flex flex-wrap sm:justify-end gap-2">
                    {analysis.cons.map((tag: string, i: number) => (
                       <span key={i} className="px-2.5 py-1 bg-red-500/20 border border-red-400/30 text-red-100 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                          <ThumbsDown size={10} className="text-red-300" /> {tag}
                       </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default function SellerDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  // Fetch Seller Info
  const { seller, isLoading: isLoadingSeller, updateSeller, approveSeller, rejectSeller, blockSeller, unblockSeller, reopenSeller, isApproving, isRejecting, isBlocking, isUnblocking, isReopening } = useSellerDetail(id || '');

  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; reason: string }>({ isOpen: false, reason: '' });
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  
  // Fetch All Products (In real app, we would fetch /products?sellerId=...)
  const { products, isLoading: isLoadingProducts } = useProducts();

  const [toast, setToast] = React.useState<{ id: string; message: string; type: ToastType } | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = React.useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = React.useState(false);
  const [isSendingInvite, setIsSendingInvite] = React.useState(false);

  // Global ESC handler — đóng các modal đang mở (approve / reject) khi nhấn Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (rejectModal.isOpen && !isRejecting) setRejectModal({ isOpen: false, reason: '' });
      if (approveModalOpen && !isApproving) setApproveModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rejectModal.isOpen, approveModalOpen, isRejecting, isApproving]);

  // Filter products belonging to this seller
  const sellerProducts = useMemo(() => {
    if (!products || !id) return [];
    return products.filter(p => p.sellerId === id).slice(0, 5); // Take top 5 recent
  }, [products, id]);

  if (isLoadingSeller) return <ProfileSkeleton />;
  
  if (!seller) return <div className="p-20 text-center text-slate-400 font-bold">Không tìm thấy nhà bán hàng</div>;

  const handleResendInvite = async () => {
    if (!seller?.email) return;
    setIsSendingInvite(true);
    try {
      await http.post('/auth/request-password-setup', {
        email: seller.email,
        shopName: seller.brandTitle,
      });
      setToast({
        id: Date.now().toString(),
        message: `Đã gửi email reset password tới ${seller.email}`,
        type: 'success',
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Lỗi không xác định';
      setToast({
        id: Date.now().toString(),
        message: `Không gửi được email: ${msg}`,
        type: 'error',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  // SLA helper: remaining time from createdAt + 24h
  const getSLA = (createdAt: string) => {
    const deadline = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = deadline - Date.now();
    if (diff <= 0) return { text: 'Quá hạn', overdue: true, hours: 0 };
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return { text: `${hours}h ${mins}m`, overdue: false, hours };
  };

  const handleApproveConfirm = async () => {
    try {
      await approveSeller();
      setToast({ id: Date.now().toString(), message: `Đã duyệt "${seller.brandTitle}". Email thông báo đã gửi.`, type: 'success' });
      setApproveModalOpen(false);
    } catch (e: any) {
      setToast({ id: Date.now().toString(), message: `Duyệt thất bại: ${e?.message || 'lỗi'}`, type: 'error' });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) return;
    try {
      await rejectSeller(rejectModal.reason.trim());
      setToast({ id: Date.now().toString(), message: `Đã từ chối "${seller.brandTitle}".`, type: 'success' });
      setRejectModal({ isOpen: false, reason: '' });
    } catch (e: any) {
      setToast({ id: Date.now().toString(), message: `Từ chối thất bại: ${e?.message || 'lỗi'}`, type: 'error' });
    }
  };

  const handleReopen = () => setIsReopenModalOpen(true);

  const handleReopenConfirm = async () => {
    try {
      await reopenSeller();
      setToast({ id: Date.now().toString(), message: `Đã mở lại hồ sơ "${seller.brandTitle}" — chờ duyệt lại.`, type: 'success' });
      setIsReopenModalOpen(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Thao tác thất bại.';
      setToast({ id: Date.now().toString(), message: typeof msg === 'string' ? msg : 'Thao tác thất bại.', type: 'error' });
    }
  };

  const handleBlockConfirm = async (reason?: string) => {
    const isCurrentlyBlocked = seller.status === 'BLOCKED';
    try {
      if (isCurrentlyBlocked) {
        await unblockSeller();
        setToast({ id: Date.now().toString(), message: `Đã mở khóa "${seller.brandTitle}".`, type: 'success' });
      } else {
        if (!reason || !reason.trim()) {
          setToast({ id: Date.now().toString(), message: 'Vui lòng nhập lý do khóa.', type: 'error' });
          return;
        }
        await blockSeller(reason.trim());
        setToast({ id: Date.now().toString(), message: `Đã khóa "${seller.brandTitle}". Email thông báo đã gửi.`, type: 'success' });
      }
      setIsBlockModalOpen(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Thao tác thất bại.';
      setToast({ id: Date.now().toString(), message: typeof msg === 'string' ? msg : 'Thao tác thất bại.', type: 'error' });
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {toast && <ToastComponent toast={toast} onClose={(id) => setToast(null)} />}
      
      <BlockSellerModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleBlockConfirm}
        sellerName={seller.brandTitle}
        isBlocked={seller.status === 'BLOCKED'}
        productCount={seller.totalProducts ?? sellerProducts.length}
        pendingOrderCount={seller.totalOrders ?? 0}
        isSubmitting={isBlocking || isUnblocking}
      />

      <ReopenSellerModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onConfirm={handleReopenConfirm}
        sellerName={seller.brandTitle}
        rejectionReason={(seller as any).rejection_reason || (seller as any).rejectionReason}
        isSubmitting={isReopening}
      />

      {/* 1. Cover Image & Header Area */}
      <div className="relative h-64 bg-slate-900 overflow-hidden group">
         {/* Simulated Cover Image - Gradient & Noise */}
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
         
         <div className="absolute top-6 left-6 lg:left-10 z-10">
            <button 
              onClick={() => router.push('/admin/sellers')} 
              className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 -mt-20 relative z-10">
         {/* D: REJECTION BANNER */}
         {seller.status === 'REJECTED' && (
           <div className="bg-rose-50 border border-rose-200 border-l-4 border-l-rose-500 rounded-2xl p-5 mb-6 flex items-start gap-4">
             <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
               <XCircle size={20} className="text-rose-600" />
             </div>
             <div className="flex-1">
               <p className="text-sm font-black text-rose-900 uppercase tracking-wider mb-1">Hồ sơ đã bị từ chối</p>
               <p className="text-sm text-rose-800 font-medium leading-relaxed whitespace-pre-wrap">
                 {(seller as any).rejection_reason || (seller as any).rejectionReason || 'Không có lý do chi tiết.'}
               </p>
             </div>
           </div>
         )}

         {/* BLOCK BANNER */}
         {seller.status === 'BLOCKED' && (
           <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-600 rounded-2xl p-5 mb-6 flex items-start gap-4">
             <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
               <Ban size={20} className="text-red-600" />
             </div>
             <div className="flex-1">
               <p className="text-sm font-black text-red-900 uppercase tracking-wider mb-1">Shop đang bị khóa</p>
               <p className="text-sm text-red-800 font-medium leading-relaxed whitespace-pre-wrap">
                 {(seller as any).block_reason || (seller as any).blockReason || 'Không có lý do chi tiết.'}
               </p>
               <p className="text-[11px] text-red-700 mt-2 font-medium">
                 Sản phẩm của shop đang bị ẩn khỏi sàn. Nhà bán hàng không thể đăng sản phẩm mới hoặc nhận đơn.
               </p>
             </div>
           </div>
         )}

         <div className="flex flex-col lg:flex-row items-start gap-6 mb-8">
            {/* Logo */}
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl border-[6px] border-white bg-white shadow-2xl overflow-hidden shrink-0 relative">
               <img src={seller.logoUrl} alt={seller.brandTitle} className="w-full h-full object-cover" />
               {seller.status === 'BLOCKED' && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                    <Ban size={40} className="text-white" />
                 </div>
               )}
            </div>

            {/* Title Info */}
            <div className="flex-1 pt-2 lg:pt-24 text-slate-800">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <h1 className="text-3xl font-black tracking-tight mb-1 flex items-center gap-3">
                        {seller.brandTitle}
                        {seller.status === 'ACTIVE' && (
                           <ShieldCheck size={24} className="text-blue-500 fill-blue-100" />
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border ${seller.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : seller.status === 'BLOCKED' ? 'bg-red-50 text-red-700 border-red-200' : seller.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                           {seller.status}
                        </span>
                     </h1>
                     <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Globe size={14} /> {seller.category}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5 font-mono">ID: {seller.accountCode}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> Tham gia {new Date(seller.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                     {seller.status === 'PENDING' ? (
                       <>
                         <button
                           onClick={() => setApproveModalOpen(true)}
                           disabled={isApproving}
                           className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-60"
                         >
                           {isApproving ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
                           Duyệt
                         </button>
                         <button
                           onClick={() => setRejectModal({ isOpen: true, reason: '' })}
                           className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                         >
                           <ThumbsDown size={16} /> Từ chối
                         </button>
                         <button
                           onClick={() => router.push(`/admin/sellers/${seller.id}/edit`)}
                           className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                         >
                           <Edit3 size={16} /> Chỉnh sửa
                         </button>
                       </>
                     ) : (
                       <>
                         {seller.status === 'ACTIVE' && (
                           <button
                             onClick={() => window.open(`/sellers/${seller.id}`, '_blank')}
                             className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                             title="Mở storefront trong tab mới"
                           >
                             <ExternalLink size={16} /> Xem storefront
                           </button>
                         )}
                         <button
                           onClick={() => router.push(`/admin/sellers/${seller.id}/edit`)}
                           className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                         >
                           <Edit3 size={16} /> Chỉnh sửa
                         </button>
                         {seller.status === 'REJECTED' && (
                           <button
                             onClick={handleReopen}
                             disabled={isReopening}
                             className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60"
                             title="Chuyển shop về PENDING để seller gửi lại hồ sơ"
                           >
                             {isReopening ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
                             Cho phép tái đăng ký
                           </button>
                         )}
                         {seller.status === 'ACTIVE' && (
                           <button
                             onClick={handleResendInvite}
                             disabled={isSendingInvite}
                             className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm disabled:opacity-60"
                             title="Gửi email link đặt lại mật khẩu cho seller"
                           >
                             {isSendingInvite ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                             {isSendingInvite ? 'Đang gửi...' : 'Reset password'}
                           </button>
                         )}
                         {seller.status !== 'REJECTED' && (
                           <button
                              onClick={() => setIsBlockModalOpen(true)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                                 seller.status === 'BLOCKED'
                                 ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                                 : 'bg-slate-800 hover:bg-slate-900 shadow-slate-500/20'
                              }`}
                           >
                              {seller.status === 'BLOCKED' ? <Unlock size={16} /> : <Ban size={16} />}
                              {seller.status === 'BLOCKED' ? 'Mở khóa' : 'Khóa'}
                           </button>
                         )}
                       </>
                     )}
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Contact & Info */}
            <div className="space-y-6">
               <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Thông tin liên hệ</h3>
                  <div className="space-y-4">
                     {seller.website && (
                        <div className="flex items-start gap-4 group">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Globe size={20} />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Website</p>
                              <a href={`https://${seller.website}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline truncate block">
                                 {seller.website} <ExternalLink size={10} className="inline ml-1" />
                              </a>
                           </div>
                        </div>
                     )}
                     <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                           <Mail size={20} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                           <p className="text-sm font-bold text-slate-800 truncate">{seller.email}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                           <Phone size={20} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Hotline</p>
                           <p className="text-sm font-bold text-slate-800">{seller.phone}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                           <MapPin size={20} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Địa chỉ</p>
                           <p className="text-sm font-bold text-slate-800 leading-snug">{seller.location}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {seller.status === 'ACTIVE' ? (
                 <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Star size={100} />
                    </div>
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Đánh giá Shop</h3>
                          <div className="p-2 bg-white/10 rounded-lg text-yellow-400">
                             <Star size={18} fill="currentColor" />
                          </div>
                       </div>
                       <div className="text-center py-4">
                          <span className="text-5xl font-black tracking-tighter">{seller.rating}</span>
                          <span className="text-xl text-white/40 font-medium">/5</span>
                       </div>
                       <div className="text-center text-sm font-medium text-white/60 pb-4 border-b border-white/10">
                          Dựa trên <strong>{seller.reviewCount}</strong> lượt đánh giá
                       </div>
                       <button
                         onClick={() => setToast({ id: Date.now().toString(), message: 'Trang chi tiết đánh giá đang được phát triển.', type: 'info' })}
                         className="w-full mt-4 py-3 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-50 transition-colors"
                       >
                          Xem chi tiết đánh giá
                       </button>
                    </div>
                 </div>
               ) : seller.status === 'PENDING' ? (() => {
                 const sla = getSLA(seller.createdAt);
                 return (
                   <div className={`rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden ${sla.overdue ? 'bg-gradient-to-br from-rose-600 to-rose-800' : sla.hours < 6 ? 'bg-gradient-to-br from-amber-500 to-orange-700' : 'bg-gradient-to-br from-blue-700 to-indigo-900'}`}>
                     <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={100} /></div>
                     <div className="relative z-10">
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">SLA Duyệt hồ sơ</h3>
                         <div className="p-2 bg-white/10 rounded-lg"><Clock size={18} /></div>
                       </div>
                       <div className="text-center py-4">
                         <span className="text-5xl font-black tracking-tighter">{sla.text}</span>
                       </div>
                       <div className="text-center text-sm font-medium text-white/80 pb-4 border-b border-white/10">
                         {sla.overdue ? 'Hồ sơ đã quá hạn 24h — cần xử lý gấp' : 'Thời gian còn lại trong cam kết 24h'}
                       </div>
                       <div className="mt-4 text-xs font-medium text-white/70 flex items-center gap-2">
                         <Calendar size={14} /> Đăng ký: {new Date(seller.createdAt).toLocaleString('vi-VN')}
                       </div>
                     </div>
                   </div>
                 );
               })() : seller.status === 'REJECTED' ? (
                 <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><XCircle size={100} /></div>
                   <div className="relative z-10">
                     <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Trạng thái hồ sơ</h3>
                     <p className="text-2xl font-black mb-2">Đã từ chối</p>
                     <p className="text-sm font-medium text-white/80">Nhà bán hàng có thể đăng ký lại sau khi cập nhật thông tin.</p>
                   </div>
                 </div>
               ) : (
                 <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Ban size={100} /></div>
                   <div className="relative z-10">
                     <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Trạng thái hồ sơ</h3>
                     <p className="text-2xl font-black mb-2">Đã khóa</p>
                     <p className="text-sm font-medium text-white/80">Shop đang bị chặn, không hiển thị trên sàn.</p>
                   </div>
                 </div>
               )}
            </div>

            {/* RIGHT COLUMN: Metrics & Content */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* AI Review Analyst: chỉ hiện khi ACTIVE + có đơn hàng */}
               {seller.status === 'ACTIVE' && seller.totalOrders > 0 ? (
                 <AISellerAnalyst seller={seller} />
               ) : (
                 <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[24px] p-6 text-center">
                   <p className="text-sm font-bold text-slate-500">AI Review Sentiment chưa có dữ liệu</p>
                   <p className="text-xs text-slate-400 mt-1 font-medium">
                     {seller.status === 'PENDING'
                       ? 'Shop đang chờ duyệt — AI sẽ phân tích khi shop đi vào hoạt động và có đơn hàng.'
                       : seller.status === 'REJECTED'
                       ? 'Hồ sơ bị từ chối — chưa có dữ liệu để phân tích.'
                       : seller.status === 'BLOCKED'
                       ? 'Shop đang bị khóa — AI tạm ngưng phân tích đánh giá.'
                       : 'Cần ít nhất 1 đơn hàng để AI phân tích cảm xúc khách hàng.'}
                   </p>
                 </div>
               )}

               {/* Metrics Row — ẩn badge % tăng trưởng khi shop chưa ACTIVE */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <ShoppingBag size={24} />
                        </div>
                        {/* Growth % cần so sánh period — tạm ẩn cho đến khi có dữ liệu lịch sử */}
                     </div>
                     <span className="text-3xl font-black text-slate-800 tracking-tight">{seller.totalProducts}</span>
                     <p className="text-xs font-bold text-slate-400 uppercase mt-1">Sản phẩm</p>
                  </div>

                  <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-green-300 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <Truck size={24} />
                        </div>
                        {/* Growth % — ẩn cho đến khi có dữ liệu period-over-period */}
                     </div>
                     <span className="text-3xl font-black text-slate-800 tracking-tight">{seller.totalOrders.toLocaleString()}</span>
                     <p className="text-xs font-bold text-slate-400 uppercase mt-1">Đơn hàng</p>
                  </div>

                  <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-purple-300 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <DollarSign size={24} />
                        </div>
                        {/* Growth % — ẩn cho đến khi có dữ liệu period-over-period */}
                     </div>
                     <span className="text-3xl font-black text-slate-800 tracking-tight">{(seller.totalRevenue / 1000000).toFixed(1)}M</span>
                     <p className="text-xs font-bold text-slate-400 uppercase mt-1">Doanh thu</p>
                  </div>
               </div>

               {/* Products Table (Dynamic) — chỉ hiện khi shop ACTIVE */}
               {seller.status !== 'ACTIVE' ? (
                 <div className="bg-white rounded-[32px] border border-dashed border-slate-200 shadow-sm p-10 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Package size={28} className="text-slate-300" />
                   </div>
                   <p className="text-sm font-bold text-slate-600 mb-1">Chưa có sản phẩm</p>
                   <p className="text-xs text-slate-400 font-medium">
                     {seller.status === 'PENDING'
                       ? 'Shop chưa được duyệt nên chưa có sản phẩm.'
                       : seller.status === 'REJECTED'
                       ? 'Hồ sơ bị từ chối — shop chưa được kích hoạt.'
                       : 'Shop đang bị khóa.'}
                   </p>
                 </div>
               ) : (
               <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <ShoppingBag size={18} className="text-slate-400" /> Sản phẩm gần đây
                     </h3>
                     <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                        {sellerProducts.length} hiển thị
                     </span>
                  </div>
                  
                  {isLoadingProducts ? (
                     <div className="p-10 flex justify-center">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                     </div>
                  ) : sellerProducts.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Package size={40} className="mb-2 opacity-20" />
                        <p className="text-sm font-medium">Chưa có sản phẩm nào.</p>
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100">
                                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Sản phẩm</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá bán</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Lượt xem</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {sellerProducts.map((item) => (
                                <tr 
                                  key={item.id} 
                                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                                  onClick={() => router.push(`/admin/products/${item.id}`)}
                                >
                                   <td className="px-6 py-4 pl-8">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                         </div>
                                         <div className="min-w-0">
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors block truncate max-w-[200px]">{item.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">{item.price.toLocaleString()}₫</td>
                                   <td className="px-6 py-4 text-center">
                                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${ProductStatusConfig[item.status] || 'bg-slate-100 text-slate-500'}`}>
                                        {item.status}
                                      </span>
                                   </td>
                                   <td className="px-6 py-4 text-right pr-8 text-sm font-medium text-slate-500">{item.viewCount || 0}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                        <div className="p-4 text-center border-t border-slate-50">
                           <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto transition-all">
                             Xem toàn bộ danh mục <ArrowUpRight size={12} />
                           </button>
                        </div>
                     </div>
                  )}
               </div>
               )}
            </div>
         </div>
      </div>

      {/* REJECT MODAL */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setRejectModal({ isOpen: false, reason: '' })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center"><ThumbsDown size={20} className="text-rose-600" /></div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Từ chối hồ sơ</h3>
                  <p className="text-xs text-slate-500 font-medium">{seller.brandTitle}</p>
                </div>
              </div>
              <button onClick={() => setRejectModal({ isOpen: false, reason: '' })} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Lý do từ chối <span className="text-rose-500">*</span></label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              rows={4}
              placeholder="VD: Giấy phép kinh doanh không hợp lệ, thông tin thiếu..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-2 font-medium">Lý do sẽ được gửi qua email cho seller.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRejectModal({ isOpen: false, reason: '' })} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Hủy</button>
              <button
                onClick={handleRejectConfirm}
                disabled={isRejecting || !rejectModal.reason.trim()}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRejecting && <Loader2 size={14} className="animate-spin" />}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setApproveModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><ThumbsUp size={20} className="text-green-600" /></div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Duyệt hồ sơ</h3>
                  <p className="text-xs text-slate-500 font-medium">{seller.brandTitle}</p>
                </div>
              </div>
              <button onClick={() => setApproveModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2 mb-4">
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Email:</span><span className="font-bold text-slate-800">{seller.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Hotline:</span><span className="font-bold text-slate-800">{seller.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Danh mục:</span><span className="font-bold text-slate-800">{seller.category}</span></div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 font-medium mb-4 flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>Email thông báo duyệt sẽ được gửi tới seller sau khi xác nhận.</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApproveModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Hủy</button>
              <button
                onClick={handleApproveConfirm}
                disabled={isApproving}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isApproving && <Loader2 size={14} className="animate-spin" />}
                Xác nhận duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
