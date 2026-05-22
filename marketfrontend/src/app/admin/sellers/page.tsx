
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellers } from '../../../hooks/admin/useSellers';
import { 
  Search, Plus, Filter, Trash2, Edit3, Eye, Ban, CheckCircle, 
  MapPin, ShoppingBag, DollarSign, LayoutGrid, List, AlertTriangle, Lock, Unlock, Mail, Phone
} from 'lucide-react';
import { SellerStatus } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { Skeleton } from '../../../components/ui/Skeleton';
import { BlockSellerModal, DeleteSellerModal } from '../../../components/admin/sellers/SellerModals';
import Pagination from '../../../components/ui/Pagination';

// --- CONFIGS ---
const StatusConfig: Record<SellerStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  ACTIVE: { label: 'Work', color: 'text-green-700', bgColor: 'bg-green-50', icon: <CheckCircle size={14} /> },
  PENDING: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: <AlertTriangle size={14} /> },
  BLOCKED: { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-50', icon: <Lock size={14} /> },
};

const ITEMS_PER_PAGE_GRID = 8;
const ITEMS_PER_PAGE_TABLE = 10;

export default function SellersPage() {
  const router = useRouter();
  const { sellers, isLoading, deleteSellers, updateStatus, isDeleting } = useSellers();
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | SellerStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  // Modal States
  const [blockModal, setBlockModal] = useState<{ isOpen: boolean; id: string; name: string; isBlocked: boolean }>({ isOpen: false, id: '', name: '', isBlocked: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ids: string[]; name?: string }>({ isOpen: false, ids: [] });
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
  const handleBlockClick = (e: React.MouseEvent, id: string, name: string, status: SellerStatus) => {
    e.stopPropagation();
    const isBlocked = status === 'BLOCKED';
    setBlockModal({ isOpen: true, id, name, isBlocked });
  };

  const confirmBlock = async () => {
    const { id, isBlocked } = blockModal;
    const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
    const action = isBlocked ? 'unblock' : 'block';
    try {
      await updateStatus({ id, status: newStatus });
      setToast({ id: Date.now().toString(), message: `Already ${action} successful salesperson.`, type: 'success' });
      setBlockModal({ ...blockModal, isOpen: false });
    } catch (err) {
      setToast({ id: Date.now().toString(), message: `Error when ${action} seller.`, type: 'error' });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, ids: [id], name });
  };

  const confirmDelete = async () => {
    try {
      await deleteSellers(deleteModal.ids);
      setToast({ id: Date.now().toString(), message: `Successfully deleted ${deleteModal.ids.length} sellers.`, type: 'success' });
      setDeleteModal({ ...deleteModal, isOpen: false });
      setSelectedIds([]);
    } catch (err) {
      setToast({ id: Date.now().toString(), message: `Error when deleting seller.`, type: 'error' });
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
      />
      <DeleteSellerModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        sellerName={deleteModal.name}
        count={deleteModal.ids.length}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             🏪 Sellers
          </h1>
          <p className="text-sm text-slate-500 font-medium">Manage all seller partners in the system.</p>
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
             <Plus size={16} /> Add Seller
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: <ShoppingBag size={18} />, color: 'bg-blue-50 text-blue-600', tab: 'ALL' },
          { label: 'Pending', value: stats.pending, icon: <AlertTriangle size={18} />, color: 'bg-amber-50 text-amber-600', tab: 'PENDING' },
          { label: 'Active', value: stats.active, icon: <CheckCircle size={18} />, color: 'bg-green-50 text-green-600', tab: 'ACTIVE' },
          { label: 'Blocked', value: stats.blocked, icon: <Ban size={18} />, color: 'bg-red-50 text-red-600', tab: 'BLOCKED' },
          { label: 'Revenue', value: `${(stats.revenue / 1000000).toFixed(1)}M`, icon: <DollarSign size={18} />, color: 'bg-purple-50 text-purple-600', tab: 'ALL' },
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
                placeholder="Search by name, email, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
               {['ALL', 'PENDING', 'ACTIVE', 'BLOCKED'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab === 'ALL' ? 'ALL' : StatusConfig[tab as SellerStatus].label}
                 </button>
               ))}
            </div>
          </div>
        </div>
        
        {/* Title Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                Seller List
             </h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {filteredSellers.length} sellers
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
               <p className="text-slate-400 font-bold">No sellers found.</p>
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
                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${StatusConfig[seller.status].bgColor} ${StatusConfig[seller.status].color}`}>
                              {StatusConfig[seller.status].icon} {StatusConfig[seller.status].label}
                           </span>
                        </div>
                        
                        <div className="mb-4">
                           <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{seller.brandTitle}</h3>
                           <p className="text-xs text-slate-500 font-medium mb-1">{seller.category}</p>
                           <div className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin size={12} /> <span className="truncate">{seller.location}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 mb-4">
                           <div className="text-center">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Products</p>
                              <p className="text-sm font-black text-slate-800">{seller.totalProducts}</p>
                           </div>
                           <div className="text-center border-l border-slate-100">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Orders</p>
                              <p className="text-sm font-black text-slate-800">{seller.totalOrders}</p>
                           </div>
                           <div className="text-center border-l border-slate-100">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Revenue</p>
                              <p className="text-sm font-black text-slate-800">{(seller.totalRevenue / 1000000).toFixed(0)}M</p>
                           </div>
                        </div>

                        <div className="mt-auto flex gap-2 pt-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                           <button 
                             onClick={(e) => { e.stopPropagation(); router.push(`/admin/sellers/${seller.id}`); }}
                             className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border-0"
                           >
                             View
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); router.push(`/admin/sellers/${seller.id}/edit`); }}
                             className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border-0"
                           >
                             Edit
                           </button>
                           {seller.status === 'BLOCKED' ? (
                              <button 
                                onClick={(e) => handleBlockClick(e, seller.id, seller.brandTitle, seller.status)}
                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg border-0"
                                title="Unblock"
                              >
                                <Unlock size={14} />
                              </button>
                           ) : (
                              <button 
                                onClick={(e) => handleBlockClick(e, seller.id, seller.brandTitle, seller.status)}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border-0"
                                title="Block"
                              >
                                <Ban size={14} />
                              </button>
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
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner / Contact</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statistics</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${StatusConfig[seller.status].bgColor} ${StatusConfig[seller.status].color}`}>
                                     {StatusConfig[seller.status].label}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1">
                                     <button onClick={() => router.push(`/admin/sellers/${seller.id}`)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border-0 bg-transparent" title="See details"><Eye size={16} /></button>
                                     <button onClick={() => router.push(`/admin/sellers/${seller.id}/edit`)} className="p-2 text-slate-400 hover:text-amber-600 rounded-lg transition-colors border-0 bg-transparent" title="Edit"><Edit3 size={16} /></button>
                                     <button 
                                       onClick={(e) => handleBlockClick(e, seller.id, seller.brandTitle, seller.status)}
                                       className={`p-2 rounded-lg transition-colors border-0 bg-transparent ${seller.status === 'BLOCKED' ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                       title={seller.status === 'BLOCKED' ? "Unblock" : "Block account"}
                                     >
                                        {seller.status === 'BLOCKED' ? <Unlock size={16} /> : <Ban size={16} />}
                                     </button>
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
