
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAttributes } from '@/hooks/admin/useAttributes';
import { 
  Search, Plus, Eye, Edit3, Trash2, CheckCircle, XCircle, 
  Settings, List, MousePointerClick, Link as LinkIcon, AlertCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const ITEMS_PER_PAGE = 10;

export default function AttributeList() {
  const router = useRouter();
  const { attributes, isLoading, deleteAttribute, updateAttribute, isDeleting } = useAttributes();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'HIDDEN'>('ALL');
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; hasValues: boolean }>({ isOpen: false, id: null, hasValues: false });

  const filteredAttributes = useMemo(() => {
    return attributes.filter(attr => {
      const isPublished = attr.published;
      const matchTab = activeTab === 'ALL' || (activeTab === 'ACTIVE' && isPublished) || (activeTab === 'HIDDEN' && !isPublished);
      const matchSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          attr.attributeCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [attributes, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredAttributes.length / ITEMS_PER_PAGE);
  const paginatedAttributes = filteredAttributes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openDeleteModal = (e: React.MouseEvent, id: string, hasValues: boolean) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id, hasValues });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteAttribute(deleteModal.id);
      toast.success('Đã xóa thuộc tính thành công!');
      setDeleteModal({ isOpen: false, id: null, hasValues: false });
    } catch (err) {
      toast.error('Lỗi khi xóa thuộc tính.');
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      await updateAttribute({ id, data: { published: !currentStatus } });
      toast.success(`Đã ${!currentStatus ? 'kích hoạt' : 'ẩn'} thuộc tính thành công!`);
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái.');
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, hasValues: false })}
        onConfirm={confirmDelete}
        title="Xóa thuộc tính?"
        description={`Hành động này sẽ xóa thuộc tính ${deleteModal.hasValues ? 'và các giá trị liên quan' : ''} vĩnh viễn. Bạn có chắc chắn không?`}
        confirmLabel="Xóa ngay"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             ✨ Thuộc tính sản phẩm (Attributes)
          </h1>
          <p className="text-sm text-slate-500 font-medium">Quản lý các thông số như Màu sắc, Kích thước, Thương hiệu.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/categories/attributes/new')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all border-0"
        >
          <Plus size={20} /> Thêm thuộc tính
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm theo tên hoặc mã..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
               {['ALL', 'ACTIVE', 'HIDDEN'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border-0 ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab === 'ALL' ? 'Tất cả' : tab === 'ACTIVE' ? 'Hoạt động' : 'Đã ẩn'}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Title Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Settings size={16} /> Danh sách thuộc tính
             </h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {filteredAttributes.length} thuộc tính
             </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 w-12 text-center">
                   <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MÃ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TÊN THUỘC TÍNH</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">KIỂU HIỂN THỊ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GIÁ TRỊ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">SỬ DỤNG</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">TRẠNG THÁI</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                         <Search size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">Không tìm thấy thuộc tính nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAttributes.map((attr) => (
                  <tr 
                    key={attr.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/admin/categories/attributes/${attr.id}`)}
                  >
                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </td>
                    <td className="px-6 py-5">
                       <span className="font-mono text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-wider">
                         {attr.attributeCode}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-bold text-slate-800">{attr.name}</p>
                       {attr.unitId && <p className="text-[10px] text-blue-500 font-medium">Có đơn vị tính</p>}
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border ${attr.option === 'DROPDOWN' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                         {attr.option === 'DROPDOWN' ? <List size={12} /> : <MousePointerClick size={12} />}
                         {attr.option === 'DROPDOWN' ? 'Dropdown' : 'Radio'}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="text-sm font-black text-slate-800">{attr.valuesCount}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       {/* Mock Usage Data */}
                       <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-medium">
                          <LinkIcon size={12} />
                          <span>{attr.valuesCount > 0 ? Math.floor(Math.random() * 5) + 1 : 0} danh mục</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                       <div 
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${attr.published ? 'bg-green-500' : 'bg-slate-300'}`}
                          onClick={(e) => handleToggleStatus(e, attr.id, attr.published)}
                       >
                          <span 
                             className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${attr.published ? 'translate-x-6' : 'translate-x-1'}`} 
                          />
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => router.push(`/admin/categories/attributes/${attr.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                          title="Quản lý giá trị"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/categories/attributes/${attr.id}/edit`)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all border-0 bg-transparent"
                          title="Sửa thuộc tính"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                           onClick={(e) => openDeleteModal(e, attr.id, attr.valuesCount > 0)}
                           disabled={isDeleting}
                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-0 bg-transparent"
                           title="Xóa thuộc tính"
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

        {/* Pagination */}
        {!isLoading && filteredAttributes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAttributes.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>
    </div>
  );
}
