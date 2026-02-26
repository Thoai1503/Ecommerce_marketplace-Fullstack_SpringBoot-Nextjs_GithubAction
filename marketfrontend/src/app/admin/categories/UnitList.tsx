
"use client";

import React, { useState, useMemo } from 'react';
import { useUnits } from '@/hooks/admin/useUnits';
import { 
  Search, Plus, Edit3, Trash2, Scale, Ruler, Box, Droplets, HelpCircle, Filter, Link as LinkIcon
} from 'lucide-react';
import { Unit, UnitType, UnitStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';
import UnitModal from '@/components/admin/categories/UnitModal';
import Pagination from '@/components/ui/Pagination';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const ITEMS_PER_PAGE = 10;

const TypeConfig: Record<UnitType, { label: string; icon: any; color: string; bgColor: string }> = {
  WEIGHT: { label: 'Weight', icon: <Scale size={14} />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  LENGTH: { label: 'Length', icon: <Ruler size={14} />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  VOLUME: { label: 'Volume', icon: <Droplets size={14} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  QUANTITY: { label: 'Quantity', icon: <Box size={14} />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  OTHER: { label: 'Other', icon: <HelpCircle size={14} />, color: 'text-slate-500', bgColor: 'bg-slate-50' },
};

export default function UnitList() {
  const { units, isLoading, createUnit, updateUnit, deleteUnit, isDeleting, isSaving } = useUnits();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<'ALL' | UnitStatus>('ALL');
  const [activeType, setActiveType] = useState<'ALL' | UnitType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchStatus = activeStatus === 'ALL' || u.status === activeStatus;
      const matchType = activeType === 'ALL' || u.type === activeType;
      const matchSearch = u.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchType && matchSearch;
    });
  }, [units, searchQuery, activeStatus, activeType]);

  const totalPages = Math.ceil(filteredUnits.length / ITEMS_PER_PAGE);
  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Handlers ---

  const handleOpenCreate = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleSaveUnit = async (data: Partial<Unit>) => {
    try {
      if (editingUnit) {
        await updateUnit({ id: editingUnit.id, data });
        toast.success('Đã cập nhật đơn vị thành công!');
      } else {
        await createUnit(data as any);
        toast.success('Đã tạo đơn vị mới thành công!');
      }
    } catch (e) {
      toast.error('Thao tác thất bại.');
    }
  };

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteUnit(deleteModal.id);
      toast.success('Đã xóa đơn vị thành công!');
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Lỗi khi xóa đơn vị.');
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, unit: Unit) => {
    e.stopPropagation();
    try {
      const newStatus = unit.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateUnit({ id: unit.id, data: { status: newStatus } });
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'ẩn'} đơn vị`);
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái.');
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      <UnitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUnit}
        initialData={editingUnit}
        isSaving={isSaving}
      />

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Xóa đơn vị tính?"
        description="Hành động này sẽ xóa đơn vị vĩnh viễn và có thể ảnh hưởng đến các sản phẩm liên quan."
        confirmLabel="Xóa ngay"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             ⚖️ Đơn vị tính (Units)
          </h1>
          <p className="text-sm text-slate-500 font-medium">Chuẩn hóa đơn vị đo lường cho sản phẩm.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all border-0"
        >
          <Plus size={20} /> Thêm đơn vị
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm tên đơn vị hoặc ký hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
               {['ALL', 'ACTIVE', 'INACTIVE'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveStatus(tab as any)}
                   className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 ${activeStatus === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab === 'ALL' ? 'Tất cả' : tab === 'ACTIVE' ? 'Hoạt động' : 'Đã ẩn'}
                 </button>
               ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 xl:pb-0 no-scrollbar">
             <span className="text-xs font-bold text-slate-400 uppercase mr-1">Loại:</span>
             <button
               onClick={() => setActiveType('ALL')}
               className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeType === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
             >
               Tất cả
             </button>
             {Object.keys(TypeConfig).map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type as UnitType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                     activeType === type 
                     ? `${TypeConfig[type as UnitType].bgColor} ${TypeConfig[type as UnitType].color} border-current` 
                     : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                   {TypeConfig[type as UnitType].icon} {TypeConfig[type as UnitType].label}
                </button>
             ))}
          </div>
        </div>

        {/* Title Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Scale size={16} /> Danh sách đơn vị
             </h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {filteredUnits.length} đơn vị
             </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 w-12 text-center">
                   <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">LOẠI</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TÊN ĐƠN VỊ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">KÝ HIỆU</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">SỬ DỤNG</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">TRẠNG THÁI</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                         <Filter size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">Không tìm thấy đơn vị nào.</p>
                      <button onClick={() => { setSearchQuery(''); setActiveStatus('ALL'); setActiveType('ALL'); }} className="text-blue-600 text-xs font-bold hover:underline">Xóa bộ lọc</button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUnits.map((unit) => {
                  const typeInfo = TypeConfig[unit.type] || TypeConfig.OTHER;
                  const isActive = unit.status === 'ACTIVE';
                  // Mock Usage
                  const usageCount = Math.floor(Math.random() * 20);

                  return (
                  <tr 
                    key={unit.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenEdit(unit)}
                  >
                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </td>
                    <td className="px-6 py-5">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${typeInfo.bgColor} ${typeInfo.color} border-transparent`}>
                         {typeInfo.icon} {typeInfo.label}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <div>
                          <p className="text-sm font-bold text-slate-800">{unit.label}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{unit.id}</p>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                          {unit.symbol}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex items-center justify-center gap-1 text-xs text-slate-500 font-medium">
                          <LinkIcon size={12} />
                          {usageCount} thuộc tính
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div 
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                          onClick={(e) => handleToggleStatus(e, unit)}
                       >
                          <span 
                             className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} 
                          />
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenEdit(unit)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                           onClick={(e) => openDeleteModal(e, unit.id)}
                           disabled={isDeleting}
                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-0 bg-transparent"
                           title="Xóa"
                        >
                           <Trash2 size={16} />
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
        {!isLoading && filteredUnits.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUnits.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>
    </div>
  );
}
