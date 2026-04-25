
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellers } from '../../../hooks/admin/useSellers';
import {
  Search, Plus, Filter, Trash2, Edit3, Eye, Ban, CheckCircle,
  MapPin, ShoppingBag, DollarSign, LayoutGrid, List, AlertTriangle, Lock, Unlock, Mail, Phone,
  ThumbsUp, ThumbsDown, X, Clock, ShieldCheck
} from 'lucide-react';
import { SellerStatus } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { Skeleton } from '../../../components/ui/Skeleton';
import { BlockSellerModal, DeleteSellerModal } from '../../../components/admin/sellers/SellerModals';
import Pagination from '../../../components/ui/Pagination';

// --- CONFIGS ---
const StatusConfig: Record<SellerStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  ACTIVE: { label: 'Hoạt động', color: 'text-green-700', bgColor: 'bg-green-50', icon: <CheckCircle size={14} /> },
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: <AlertTriangle size={14} /> },
  BLOCKED: { label: 'Đã khóa', color: 'text-red-700', bgColor: 'bg-red-50', icon: <Lock size={14} /> },
  REJECTED: { label: 'Đã từ chối', color: 'text-rose-700', bgColor: 'bg-rose-50', icon: <Ban size={14} /> },
};

// Fallback để phòng trường hợp backend trả status lạ (null, "UNKNOWN", viết thường, ...)
const DEFAULT_STATUS_CONFIG = { label: 'N/A', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: <AlertTriangle size={14} /> };
const getStatusConfig = (status: SellerStatus | string | null | undefined) => {
  if (!status) return DEFAULT_STATUS_CONFIG;
  const key = String(status).toUpperCase() as SellerStatus;
  return StatusConfig[key] ?? DEFAULT_STATUS_CONFIG;
};

// Tính SLA cho shop PENDING (cam kết duyệt trong 24h)
// Returns { hoursWaited, label, color, bgColor, pulse }
const getSLA = (createdAt?: string | null) => {
  if (!createdAt) return { hoursWaited: 0, label: 'Vừa đăng ký', color: 'text-emerald-700', bgColor: 'bg-emerald-50', pulse: false };
  const ms = Date.now() - new Date(createdAt).getTime();
  const hours = Math.max(0, Math.floor(ms / 36e5));
  let label = '';
  if (hours < 1) {
    const mins = Math.max(0, Math.floor(ms / 60000));
    label = `Đã chờ ${mins} phút`;
  } else if (hours < 24) {
    label = `Đã chờ ${hours} giờ`;
  } else {
    const days = Math.floor(hours / 24);
    label = `Đã chờ ${days} ngày`;
  }
  if (hours >= 24) return { hoursWaited: hours, label: `${label} · QUÁ HẠN`, color: 'text-red-700', bgColor: 'bg-red-50 border border-red-200', pulse: true };
  if (hours >= 6) return { hoursWaited: hours, label, color: 'text-amber-700', bgColor: 'bg-amber-50', pulse: false };
  return { hoursWaited: hours, label, color: 'text-emerald-700', bgColor: 'bg-emerald-50', pulse: false };
};

// VN phone regex check
const isValidVNPhone = (phone?: string) => !!phone && /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone.trim());

// Row trong modal Approve preview
const InfoRow = ({ icon, label, value, ok, warnText }: { icon: React.ReactNode; label: string; value: string; ok?: boolean; warnText?: string }) => (
  <div className="flex items-start gap-2 text-xs">
    <div className={`${ok ? 'text-emerald-600' : 'text-amber-600'} shrink-0 mt-0.5`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">{label}</span>
        {ok ? <ShieldCheck size={11} className="text-emerald-500" /> : <AlertTriangle size={11} className="text-amber-500" />}
      </div>
      <p className="text-sm text-slate-800 font-semibold truncate">{value}</p>
      {warnText && <p className="text-[10px] text-amber-700 font-medium">{warnText}</p>}
    </div>
  </div>
);

const ITEMS_PER_PAGE_GRID = 8;
const ITEMS_PER_PAGE_TABLE = 10;

export default function SellersPage() {
  const router = useRouter();
  const { sellers, isLoading, deleteSellers, updateStatus, isDeleting, approveSeller, rejectSeller, blockSeller, unblockSeller, isApproving, isRejecting, isBlocking, isUnblocking } = useSellers();
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | SellerStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  // Modal States
  const [blockModal, setBlockModal] = useState<{ isOpen: boolean; id: string; name: string; isBlocked: boolean; productCount: number; pendingOrderCount: number }>({ isOpen: false, id: '', name: '', isBlocked: false, productCount: 0, pendingOrderCount: 0 });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ids: string[]; name?: string }>({ isOpen: false, ids: [] });
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; id: string; name: string; reason: string }>({ isOpen: false, id: '', name: '', reason: '' });
  const [approveModal, setApproveModal] = useState<{ isOpen: boolean; id: string; seller: any }>({ isOpen: false, id: '', seller: null });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, viewMode]);

  const stats = useMemo(() => {
    const total = sellers.length;
    const pending = sellers.filter(s => s.status === 'PENDING').length;
    const active = sellers.filter(s => s.status === 'ACTIVE').length;
    const blocked = sellers.filter(s => s.status === 'BLOCKED').length;
    const revenue = sellers.reduce((sum, s) => sum + s.totalRevenue, 0);
    return { total, pending, active, blocked, revenue };
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      const matchTab = activeTab === 'ALL' || s.status === activeTab;
      const matchSearch = s.brandTitle.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          s.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          s.location.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [sellers, activeTab, debouncedSearch]);

  const itemsPerPage = viewMode === 'grid' ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_TABLE;
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const paginatedSellers = filteredSellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- HANDLERS ---
  const handleBlockClick = (e: React.MouseEvent, id: string, name: string, status: SellerStatus, productCount = 0, pendingOrderCount = 0) => {
    e.stopPropagation();
    const isBlocked = status === 'BLOCKED';
    setBlockModal({ isOpen: true, id, name, isBlocked, productCount, pendingOrderCount });
  };

  const confirmBlock = async (reason?: string) => {
    const { id, isBlocked, name } = blockModal;
    try {
      if (isBlocked) {
        await unblockSeller(id);
        setToast({ id: Date.now().toString(), message: `Đã mở khóa "${name}".`, type: 'success' });
      } else {
        if (!reason || !reason.trim()) {
          setToast({ id: Date.now().toString(), message: 'Vui lòng nhập lý do khóa.', type: 'error' });
          return;
        }
        await blockSeller({ id, reason: reason.trim() });
        setToast({ id: Date.now().toString(), message: `Đã khóa "${name}". Email thông báo đã được gửi.`, type: 'success' });
      }
      setBlockModal({ ...blockModal, isOpen: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || `Lỗi khi ${isBlocked ? 'mở khóa' : 'khóa'} nhà bán hàng.`;
      setToast({ id: Date.now().toString(), message: typeof msg === 'string' ? msg : 'Thao tác thất bại.', type: 'error' });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, ids: [id], name });
  };

  const confirmDelete = async () => {
    try {
      await deleteSellers(deleteModal.ids);
      setToast({ id: Date.now().toString(), message: `Đã xóa ${deleteModal.ids.length} nhà bán hàng!`, type: 'success' });
      setDeleteModal({ ...deleteModal, isOpen: false });
      setSelectedIds([]);
    } catch (err) {
      setToast({ id: Date.now().toString(), message: 'Lỗi khi xóa nhà bán hàng.', type: 'error' });
    }
  };

  // --- APPROVE / REJECT HANDLERS ---
  const handleApproveClick = (e: React.MouseEvent, seller: any) => {
    e.stopPropagation();
    setApproveModal({ isOpen: true, id: seller.id, seller });
  };

  const confirmApprove = async () => {
    const { id, seller } = approveModal;
    if (!id || !seller) return;
    try {
      await approveSeller(id);
      setToast({ id: Date.now().toString(), message: `Đã duyệt "${seller.brandTitle}". Email thông báo đã được gửi.`, type: 'success' });
      setApproveModal({ isOpen: false, id: '', seller: null });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Duyệt thất bại.';
      setToast({ id: Date.now().toString(), message: typeof msg === 'string' ? msg : 'Duyệt thất bại.', type: 'error' });
    }
  };

  const handleRejectClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setRejectModal({ isOpen: true, id, name, reason: '' });
  };

  const confirmReject = async () => {
    if (!rejectModal.reason.trim()) {
      setToast({ id: Date.now().toString(), message: 'Vui lòng nhập lý do từ chối.', type: 'error' });
      return;
    }
    try {
      await rejectSeller({ id: rejectModal.id, reason: rejectModal.reason.trim() });
      setToast({ id: Date.now().toString(), message: `Đã từ chối "${rejectModal.name}".`, type: 'success' });
      setRejectModal({ isOpen: false, id: '', name: '', reason: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Từ chối thất bại.';
      setToast({ id: Date.now().toString(), message: typeof msg === 'string' ? msg : 'Từ chối thất bại.', type: 'error' });
    }
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === paginatedSellers.length && paginatedSellers.length > 0) {
        setSelectedIds([]);
      } else {
        setSelectedIds(paginatedSellers.map(s => s.id));
      }
  };
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6 pb-20">
      {toast && <ToastComponent toast={toast} onClose={(id) => setToast(null)} />}
      
      {/* Modals */}
      <BlockSellerModal
        isOpen={blockModal.isOpen}
        onClose={() => setBlockModal({ ...blockModal, isOpen: false })}
        onConfirm={confirmBlock}
        sellerName={blockModal.name}
        isBlocked={blockModal.isBlocked}
        productCount={blockModal.productCount}
        pendingOrderCount={blockModal.pendingOrderCount}
        isSubmitting={isBlocking || isUnblocking}
      />
      <DeleteSellerModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        sellerName={deleteModal.name}
        count={deleteModal.ids.length}
      />

      {/* Reject Modal (inline) */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                  <ThumbsDown size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Từ chối seller</h3>
                  <p className="text-xs text-slate-500 font-medium">{rejectModal.name}</p>
                </div>
              </div>
              <button onClick={() => setRejectModal({ ...rejectModal, isOpen: false })} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                rows={4}
                placeholder="VD: Thiếu giấy phép kinh doanh, thông tin không chính xác..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 text-sm resize-none"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 mt-1">Lý do này sẽ được lưu vào hồ sơ seller.</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border-0 bg-transparent"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                disabled={isRejecting || !rejectModal.reason.trim()}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 border-0 flex items-center gap-2"
              >
                {isRejecting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Đang xử lý...</>
                ) : (
                  <><ThumbsDown size={14} /> Từ chối</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal với preview thông tin */}
      {approveModal.isOpen && approveModal.seller && (() => {
        const s = approveModal.seller;
        const sla = getSLA(s.createdAt);
        const phoneValid = isValidVNPhone(s.phone);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setApproveModal({ isOpen: false, id: '', seller: null })}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
                    <ThumbsUp size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">Duyệt nhà bán hàng</h3>
                    <p className="text-xs text-slate-500 font-medium">Xác nhận thông tin trước khi duyệt</p>
                  </div>
                </div>
                <button onClick={() => setApproveModal({ isOpen: false, id: '', seller: null })} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-5 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <img src={s.logoUrl} alt="" className="w-12 h-12 rounded-xl border border-slate-200 object-cover" />
                  <div>
                    <p className="text-sm font-black text-slate-800">{s.brandTitle}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{s.category} · {s.accountCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-200">
                  <InfoRow icon={<Mail size={14} />} label="Email" value={s.email} ok />
                  <InfoRow icon={<Phone size={14} />} label="SĐT" value={s.phone || 'Chưa có'} ok={phoneValid} warnText={!phoneValid ? 'Format VN không hợp lệ' : undefined} />
                  <InfoRow icon={<Clock size={14} />} label="SLA" value={sla.label} ok={sla.hoursWaited < 24} warnText={sla.hoursWaited >= 24 ? 'Quá hạn cam kết 24h' : undefined} />
                  {s.location && <InfoRow icon={<MapPin size={14} />} label="Địa chỉ" value={s.location} ok />}
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium leading-relaxed">
                <strong>Lưu ý:</strong> Sau khi duyệt, seller sẽ nhận email thông báo và có thể đăng nhập để đăng sản phẩm.
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setApproveModal({ isOpen: false, id: '', seller: null })}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border-0 bg-transparent"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={isApproving}
                  className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 border-0 flex items-center gap-2"
                >
                  {isApproving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Đang xử lý...</>
                  ) : (
                    <><ThumbsUp size={14} /> Xác nhận duyệt</>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             🏪 Nhà bán hàng
          </h1>
          <p className="text-sm text-slate-500 font-medium">Quản lý tất cả đối tác bán hàng trong hệ thống.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             title="Grid View"
           >
             <LayoutGrid size={18} />
           </button>
           <button 
             onClick={() => setViewMode('table')}
             className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             title="List View"
           >
             <List size={18} />
           </button>
           <div className="w-px h-6 bg-slate-100 mx-1"></div>
           <button 
             onClick={() => router.push('/admin/sellers/new')}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 border-0"
           >
             <Plus size={16} /> Thêm nhà bán hàng
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Tổng số', value: stats.total, icon: <ShoppingBag size={18} />, color: 'bg-blue-50 text-blue-600', tab: 'ALL' },
          { label: 'Chờ duyệt', value: stats.pending, icon: <AlertTriangle size={18} />, color: 'bg-amber-50 text-amber-600', tab: 'PENDING' },
          { label: 'Hoạt động', value: stats.active, icon: <CheckCircle size={18} />, color: 'bg-green-50 text-green-600', tab: 'ACTIVE' },
          { label: 'Đã khóa', value: stats.blocked, icon: <Ban size={18} />, color: 'bg-red-50 text-red-600', tab: 'BLOCKED' },
          { label: 'Doanh thu', value: `${(stats.revenue / 1000000).toFixed(1)}M`, icon: <DollarSign size={18} />, color: 'bg-purple-50 text-purple-600', tab: 'ALL' },
        ].map((stat, idx) => (
          <button 
             key={idx}
             onClick={() => setActiveTab(stat.tab as any)}
             className={`p-4 rounded-2xl border bg-white flex flex-col items-start gap-3 transition-all hover:shadow-md ${activeTab === stat.tab ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-100'}`}
          >
             <div className={`p-2 rounded-xl ${stat.color}`}>{stat.icon}</div>
             <div>
                <span className="text-2xl font-black text-slate-800">{stat.value}</span>
                <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
             </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm kiếm theo tên, email, vị trí..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
          </div>
        </div>

        {/* STATUS TABS với count — đặt phía trên grid content để nổi bật */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-100 flex flex-wrap gap-2">
          {([
            { key: 'ALL',      label: 'Tất cả',     count: stats.total,   color: 'slate' },
            { key: 'PENDING',  label: 'Chờ duyệt',  count: stats.pending, color: 'amber' },
            { key: 'ACTIVE',   label: 'Đã duyệt',   count: stats.active,  color: 'green' },
            { key: 'REJECTED', label: 'Đã từ chối', count: sellers.filter(s => s.status === 'REJECTED').length, color: 'rose' },
            { key: 'BLOCKED',  label: 'Đã khóa',    count: stats.blocked, color: 'red' },
          ] as const).map(tab => {
            const isActive = activeTab === tab.key;
            const baseColors = isActive
              ? (tab.color === 'amber' ? 'bg-amber-500 text-white border-amber-500'
                : tab.color === 'green' ? 'bg-green-600 text-white border-green-600'
                : tab.color === 'rose'  ? 'bg-rose-600 text-white border-rose-600'
                : tab.color === 'red'   ? 'bg-red-600 text-white border-red-600'
                : 'bg-slate-800 text-white border-slate-800')
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50';
            const countColors = isActive
              ? 'bg-white/20 text-white'
              : (tab.color === 'amber' ? 'bg-amber-100 text-amber-700'
                : tab.color === 'green' ? 'bg-green-100 text-green-700'
                : tab.color === 'rose'  ? 'bg-rose-100 text-rose-700'
                : tab.color === 'red'   ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-700');
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border transition-all ${baseColors} ${tab.key === 'PENDING' && tab.count > 0 && !isActive ? 'ring-2 ring-amber-200' : ''}`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${countColors}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Title Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                Danh sách nhà bán hàng
             </h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {filteredSellers.length} nhà bán
             </span>
        </div>

        {/* Content Area */}
        {isLoading ? (
             <div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>
        ) : filteredSellers.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Search size={32} className="text-slate-300" />
               </div>
               <p className="text-slate-400 font-bold">Không tìm thấy nhà bán hàng nào.</p>
            </div>
        ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {paginatedSellers.map(seller => (
                     <div 
                        key={seller.id} 
                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col relative"
                        onClick={() => router.push(`/admin/sellers/${seller.id}`)}
                     >
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-16 h-16 rounded-full border border-slate-100 overflow-hidden bg-slate-50 group-hover:shadow-md transition-shadow">
                             <img src={seller.logoUrl} alt={seller.brandTitle} className="w-full h-full object-cover" />
                           </div>
                           {(() => { const cfg = getStatusConfig(seller.status); return (
                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${cfg.bgColor} ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                           </span>
                           ); })()}
                        </div>
                        
                        <div className="mb-4">
                           <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{seller.brandTitle}</h3>
                           <p className="text-xs text-slate-500 font-medium mb-1">{seller.category}</p>
                           <div className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin size={12} /> <span className="truncate">{seller.location}</span>
                           </div>
                        </div>

                        {seller.status === 'PENDING' ? (
                          // PENDING: hiển thị thông tin cần để duyệt + SLA badge
                          <div className="py-3 border-t border-slate-100 mb-4 space-y-2">
                            {(() => { const sla = getSLA(seller.createdAt); return (
                              <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold ${sla.bgColor} ${sla.color} ${sla.pulse ? 'animate-pulse' : ''}`}>
                                <Clock size={12} /> {sla.label}
                              </div>
                            ); })()}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium truncate" title={seller.email}>
                              <Mail size={12} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{seller.email}</span>
                              <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                            </div>
                            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isValidVNPhone(seller.phone) ? 'text-slate-600' : 'text-amber-700'}`}>
                              <Phone size={12} className="shrink-0" />
                              <span className="truncate">{seller.phone || 'Chưa có SĐT'}</span>
                              {!isValidVNPhone(seller.phone) && <AlertTriangle size={12} className="text-amber-500 shrink-0" />}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 mb-4">
                             <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Sản phẩm</p>
                                <p className="text-sm font-black text-slate-800">{seller.totalProducts}</p>
                             </div>
                             <div className="text-center border-l border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Đơn hàng</p>
                                <p className="text-sm font-black text-slate-800">{seller.totalOrders}</p>
                             </div>
                             <div className="text-center border-l border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Doanh thu</p>
                                <p className="text-sm font-black text-slate-800">{(seller.totalRevenue / 1000000).toFixed(0)}M</p>
                             </div>
                          </div>
                        )}

                        <div className="mt-auto flex gap-2 pt-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex-wrap">
                           {seller.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/sellers/${seller.id}`); }}
                                  className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border-0 flex items-center justify-center gap-1"
                                  title="Xem hồ sơ"
                                >
                                  <Eye size={12} /> Xem
                                </button>
                                <button
                                  onClick={(e) => handleApproveClick(e, seller)}
                                  disabled={isApproving}
                                  className="flex-1 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors border-0 flex items-center justify-center gap-1 disabled:opacity-50"
                                  title="Duyệt"
                                >
                                  <ThumbsUp size={12} /> Duyệt
                                </button>
                                <button
                                  onClick={(e) => handleRejectClick(e, seller.id, seller.brandTitle)}
                                  className="flex-1 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border-0 flex items-center justify-center gap-1"
                                  title="Từ chối"
                                >
                                  <ThumbsDown size={12} /> Từ chối
                                </button>
                              </>
                           ) : (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/sellers/${seller.id}`); }}
                                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border-0"
                                >
                                  Xem
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/sellers/${seller.id}/edit`); }}
                                  className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border-0"
                                >
                                  Sửa
                                </button>
                                {seller.status === 'BLOCKED' ? (
                                   <button
                                     onClick={(e) => handleBlockClick(e, seller.id, seller.brandTitle, seller.status, seller.totalProducts, seller.totalOrders)}
                                     className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg border-0"
                                     title="Mở khóa"
                                   >
                                     <Unlock size={14} />
                                   </button>
                                ) : (
                                   <button
                                     onClick={(e) => handleBlockClick(e, seller.id, seller.brandTitle, seller.status, seller.totalProducts, seller.totalOrders)}
                                     className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border-0"
                                     title="Khóa"
                                   >
                                     <Ban size={14} />
                                   </button>
                                )}
                              </>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                         <tr className="bg-white border-b border-slate-100">
                            <th className="px-6 py-4 w-12 text-center">
                               <input type="checkbox" className="rounded border-slate-300" onChange={toggleSelectAll} checked={selectedIds.length === paginatedSellers.length && paginatedSellers.length > 0} />
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhà bán hàng</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chủ sở hữu / Liên hệ</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thống kê</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {paginatedSellers.map(seller => (
                            <tr key={seller.id} className="hover:bg-slate-50/50 group cursor-pointer" onClick={() => router.push(`/admin/sellers/${seller.id}`)}>
                               <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300"
                                    checked={selectedIds.includes(seller.id)} 
                                    onChange={() => toggleSelect(seller.id)} 
                                  />
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                     <img src={seller.logoUrl} alt="" className="w-10 h-10 rounded-lg border border-slate-200 object-cover" />
                                     <div>
                                        <p className="text-sm font-bold text-slate-800">{seller.brandTitle}</p>
                                        <p className="text-xs text-slate-500">{seller.category}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                     <p className="text-xs font-bold text-slate-700">{seller.ownerName}</p>
                                     <p className="text-[10px] text-slate-400 flex items-center gap-1"><Mail size={10} /> {seller.email}</p>
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="text-xs text-slate-600 truncate max-w-[150px]">{seller.location}</p>
                               </td>
                               <td className="px-6 py-4 text-center">
                                  <div className="text-xs">
                                     <span className="font-bold text-slate-800">{seller.totalProducts}</span> SP / 
                                     <span className="font-bold text-slate-800 ml-1">{seller.totalOrders}</span> Đơn
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-center">
                                  {(() => { const cfg = getStatusConfig(seller.status); return (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${cfg.bgColor} ${cfg.color}`}>
                                     {cfg.label}
                                  </span>
                                  ); })()}
                               </td>
                               <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1">
                                     {seller.status === 'PENDING' && (
                                        <>
                                          <button
                                            onClick={(e) => handleApproveClick(e, seller)}
                                            disabled={isApproving}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border-0 bg-transparent disabled:opacity-50"
                                            title="Duyệt seller"
                                          >
                                            <ThumbsUp size={16} />
                                          </button>
                                          <button
                                            onClick={(e) => handleRejectClick(e, seller.id, seller.brandTitle)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-0 bg-transparent"
                                            title="Từ chối"
                                          >
                                            <ThumbsDown size={16} />
                                          </button>
                                          <div className="w-px h-5 bg-slate-200 mx-1" />
                                        </>
                                     )}
                                     <button onClick={() => router.push(`/admin/sellers/${seller.id}`)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border-0 bg-transparent" title="Xem chi tiết"><Eye size={16} /></button>
                                     <button onClick={() => router.push(`/admin/sellers/${seller.id}/edit`)} className="p-2 text-slate-400 hover:text-amber-600 rounded-lg transition-colors border-0 bg-transparent" title="Chỉnh sửa"><Edit3 size={16} /></button>
                                     {seller.status !== 'PENDING' && (
                                        <button
                                          onClick={(e) => handleBlockClick(e, seller.id, seller.brandTitle, seller.status, seller.totalProducts, seller.totalOrders)}
                                          className={`p-2 rounded-lg transition-colors border-0 bg-transparent ${seller.status === 'BLOCKED' ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                          title={seller.status === 'BLOCKED' ? "Mở khóa" : "Khóa tài khoản"}
                                        >
                                          {seller.status === 'BLOCKED' ? <Unlock size={16} /> : <Ban size={16} />}
                                        </button>
                                     )}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}
              
              {!isLoading && filteredSellers.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredSellers.length}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
        )}
      </div>
    </div>
  );
}
