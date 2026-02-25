
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomers } from '../../../hooks/admin/useCustomers';
import { 
  Search, Trash2, Eye, Mail, Phone, Ban, CheckCircle, Edit3, Download, Lock, Unlock, Copy,
  Crown, Star, MapPin
} from 'lucide-react';
import { CustomerStatus } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { Skeleton } from '../../../components/ui/Skeleton';
import { BlockCustomerModal, DeleteCustomerModal } from '../../../components/admin/customers/CustomerModals';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import Pagination from '../../../components/ui/Pagination';
import EmptyState from '../../../components/ui/EmptyState';

const StatusConfig: Record<CustomerStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-50', icon: <CheckCircle size={14} /> },
  INACTIVE: { label: 'Inactive', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: <Ban size={14} /> },
  BANNED: { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-50', icon: <Lock size={14} /> },
};

const ITEMS_PER_PAGE = 10;

// Helper to calculate Tier
const getCustomerTier = (spent: number) => {
  if (spent > 100000000) return { label: 'Platinum', color: 'text-purple-600 bg-purple-50 border-purple-100', icon: <Crown size={12} fill="currentColor" /> };
  if (spent > 10000000) return { label: 'Gold', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <Star size={12} fill="currentColor" /> };
  if (spent > 2000000) return { label: 'Silver', color: 'text-slate-600 bg-slate-100 border-slate-200', icon: <Star size={12} /> };
  return { label: 'Member', color: 'text-slate-500 bg-slate-50 border-slate-100', icon: null };
};

export default function CustomersPage() {
  const router = useRouter();
  const { customers, isLoading, deleteCustomers, toggleBlockStatus, isDeleting } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | CustomerStatus>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [blockModal, setBlockModal] = useState<{ isOpen: boolean; id: string; name: string; isBlocked: boolean }>({ isOpen: false, id: '', name: '', isBlocked: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ids: string[]; name?: string }>({ isOpen: false, ids: [] });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchTab = activeTab === 'ALL' || c.status === activeTab;
      const matchSearch = c.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          c.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          c.phone.includes(debouncedSearch);
      return matchTab && matchSearch;
    });
  }, [customers, activeTab, debouncedSearch]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- HANDLERS ---

  // 1. Bulk Delete
  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({ isOpen: true, ids: selectedIds });
  };

  // 2. Single Delete
  const handleSingleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, ids: [id], name });
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomers(deleteModal.ids);
      setToast({ message: `Đã xóa ${deleteModal.ids.length} khách hàng!`, type: 'success' });
      setSelectedIds([]);
      setDeleteModal({ isOpen: false, ids: [] });
    } catch (err) {
      setToast({ message: 'Lỗi khi xóa khách hàng.', type: 'error' });
    }
  };

  // 3. Block / Unblock
  const handleBlockClick = (id: string, name: string, status: CustomerStatus) => {
    const isBlocked = status === 'BANNED';
    setBlockModal({ isOpen: true, id, name, isBlocked });
  };

  const confirmBlock = async () => {
    const { id, isBlocked } = blockModal;
    const action = isBlocked ? 'bỏ chặn' : 'chặn'; // isBlocked=true means we are Unblocking
    try {
      // Toggle logic: If currently blocked (isBlocked=true), we send isBlocked=false to API (Unblock)
      await toggleBlockStatus({ id, isBlocked: !isBlocked });
      setToast({ message: `Đã ${action} khách hàng thành công.`, type: 'success' });
      setBlockModal({ ...blockModal, isOpen: false });
    } catch (err) {
      setToast({ message: `Lỗi khi ${action} khách hàng.`, type: 'error' });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: `Đã sao chép ${label}`, type: 'success' });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCustomers.map(c => c.id));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab('ALL');
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      {toast && <ToastComponent toast={{ id: 'toast-1', message: toast.message, type: toast.type }} onClose={() => setToast(null)} />}

      {/* MODALS */}
      <BlockCustomerModal 
        isOpen={blockModal.isOpen}
        onClose={() => setBlockModal({ ...blockModal, isOpen: false })}
        onConfirm={confirmBlock}
        customerName={blockModal.name}
        isBlocked={blockModal.isBlocked}
      />

      <DeleteCustomerModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        customerName={deleteModal.name}
        count={deleteModal.ids.length}
      />

      <Breadcrumbs items={[{ label: 'Customers' }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             👥 Quản lý Khách hàng
          </h1>
          <p className="text-sm text-slate-500 font-medium">Quản lý thông tin và lịch sử mua hàng của khách.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
               {(['ALL', 'ACTIVE', 'BANNED'] as const).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab === 'ALL' ? 'Tất cả' : StatusConfig[tab as CustomerStatus].label}
                 </button>
               ))}
            </div>

            <button className="hidden sm:flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                <Download size={18} /> <span>Export</span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
              <span className="text-sm font-bold text-slate-500">Đã chọn {selectedIds.length}</span>
              <button 
                onClick={handleBulkDeleteClick}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all border-0"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          )}
        </div>

        {/* Title Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                Danh sách khách hàng
             </h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {filteredCustomers.length} khách hàng
             </span>
        </div>

        {/* --- MOBILE CARD VIEW --- */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
           {isLoading ? (
              <div className="p-4"><Skeleton className="h-24 w-full rounded-xl" /></div>
           ) : filteredCustomers.length === 0 ? (
              <EmptyState 
                 title="Không tìm thấy khách hàng"
                 description="Thử thay đổi từ khóa tìm kiếm."
                 actionLabel="Xóa bộ lọc"
                 onAction={clearFilters}
                 type="search"
              />
           ) : (
              paginatedCustomers.map(customer => {
                 const tier = getCustomerTier(customer.totalSpent);
                 return (
                    <div key={customer.id} className="p-4 bg-white hover:bg-slate-50 transition-colors" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                                <img src={customer.avatar} alt={customer.fullName} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-800">{customer.fullName}</p>
                                <p className="text-[10px] text-slate-400">{customer.accountCode}</p>
                             </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${StatusConfig[customer.status].bgColor} ${StatusConfig[customer.status].color}`}>
                             {StatusConfig[customer.status].icon} {StatusConfig[customer.status].label}
                          </span>
                       </div>
                       
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Chi tiêu</span>
                             <span className="text-sm font-black text-slate-800">{customer.totalSpent.toLocaleString()}₫</span>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Hạng</span>
                             <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${tier.color}`}>
                                {tier.icon} {tier.label}
                             </span>
                          </div>
                       </div>

                       <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-50">
                          <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold" onClick={(e) => { e.stopPropagation(); router.push(`/admin/customers/${customer.id}`) }}>
                             Chi tiết
                          </button>
                       </div>
                    </div>
                 );
              })
           )}
        </div>

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Đơn hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Chi tiêu & Hạng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn cuối</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState 
                       title="Không tìm thấy khách hàng"
                       description="Thử thay đổi từ khóa hoặc bộ lọc."
                       actionLabel="Xóa bộ lọc"
                       onAction={clearFilters}
                       type="search"
                    />
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => {
                  const tier = getCustomerTier(customer.totalSpent);
                  return (
                  <tr key={customer.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(customer.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(customer.id)}
                        onChange={() => toggleSelect(customer.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    
                    {/* Customer Info (Avatar + Name + ID) */}
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                             <img src={customer.avatar} alt={customer.fullName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 hover:text-blue-600 cursor-pointer" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                              {customer.fullName}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">{customer.accountCode}</p>
                          </div>
                       </div>
                    </td>

                    {/* Contact Info (Merged) */}
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 group/copy">
                            <Mail size={12} className="text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 truncate max-w-[180px]">{customer.email}</span>
                            <button onClick={() => copyToClipboard(customer.email, 'Email')} className="text-slate-300 hover:text-blue-600 opacity-0 group-hover/copy:opacity-100 transition-opacity" title="Copy Email">
                              <Copy size={10} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 group/copy">
                            <Phone size={12} className="text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 font-mono">{customer.phone}</span>
                            <button onClick={() => copyToClipboard(customer.phone, 'Phone')} className="text-slate-300 hover:text-blue-600 opacity-0 group-hover/copy:opacity-100 transition-opacity" title="Copy Phone">
                              <Copy size={10} />
                            </button>
                          </div>
                       </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                        <span className="text-sm font-black text-slate-800">{customer.totalOrders}</span>
                    </td>
                    
                    {/* Spent & Tier */}
                    <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-sm font-black text-slate-800">{customer.totalSpent.toLocaleString()}₫</span>
                           <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${tier.color}`}>
                             {tier.icon} {tier.label}
                           </span>
                        </div>
                    </td>

                    <td className="px-6 py-5">
                       <span className="text-xs font-bold text-slate-500">
                         {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Chưa có'}
                       </span>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${StatusConfig[customer.status].bgColor} ${StatusConfig[customer.status].color}`}>
                        {StatusConfig[customer.status].icon}
                        {StatusConfig[customer.status].label}
                      </span>
                    </td>
                    
                    {/* --- ACTIONS COLUMN --- */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => router.push(`/admin/customers/${customer.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                          title="Xem chi tiết"
                          aria-label="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                           onClick={() => router.push(`/admin/customers/${customer.id}/edit`)}
                           className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border-0 bg-transparent"
                           title="Chỉnh sửa"
                           aria-label="Edit Customer"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        {customer.status === 'BANNED' ? (
                          <button 
                             onClick={() => handleBlockClick(customer.id, customer.fullName, customer.status)}
                             className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all border-0 bg-transparent"
                             title="Mở khóa tài khoản"
                             aria-label="Unblock Customer"
                          >
                             <Unlock size={16} />
                          </button>
                        ) : (
                          <button 
                             onClick={() => handleBlockClick(customer.id, customer.fullName, customer.status)}
                             className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-0 bg-transparent"
                             title="Chặn tài khoản"
                             aria-label="Block Customer"
                          >
                             <Ban size={16} />
                          </button>
                        )}

                        <button 
                           onClick={() => handleSingleDeleteClick(customer.id, customer.fullName)}
                           className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-0 bg-transparent group/del"
                           title="Xóa khách hàng"
                           aria-label="Delete Customer"
                        >
                           <Trash2 size={16} className="group-hover/del:fill-red-100" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && filteredCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredCustomers.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>
    </div>
  );
}
