
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/admin/useProducts';
import { useToast } from '@/context/ToastContext';
import {
  Search, Plus, Filter, Trash2, Edit3, Eye, CheckCircle, XCircle,
  AlertCircle, Package, ArrowUpDown, Copy, X
} from 'lucide-react';
import { Product, ProductStatus } from '@/types';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import RejectProductModal from '@/components/admin/products/RejectProductModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Pagination from '@/components/ui/Pagination';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

const StatusConfig: Record<ProductStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: any }> = {
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: <AlertCircle size={14} /> },
  APPROVED: { label: 'Đang bán', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: <CheckCircle size={14} /> },
  REJECTED: { label: 'Từ chối', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', icon: <XCircle size={14} /> },
  DRAFT: { label: 'Nháp', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200', icon: <Edit3 size={14} /> },
  HIDDEN: { label: 'Đang ẩn', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', icon: <Package size={14} /> },
};

// Stock-status helper
const stockMeta = (stock: number) => {
  if (stock === 0) return { color: 'text-red-700', barColor: 'bg-red-500', tooltip: 'Hết hàng' };
  if (stock < 5) return { color: 'text-red-600', barColor: 'bg-red-400', tooltip: 'Sắp hết hàng (<5)' };
  return { color: 'text-slate-700', barColor: 'bg-emerald-500', tooltip: 'Còn hàng' };
};

const formatDateVN = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ProductsPage() {
  const router = useRouter();
  const { products, isLoading, isError, refetch, deleteProducts, approveProduct, rejectProduct, duplicateProduct } = useProducts();
  const toast = useToast();

  // --- Table State ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // --- Modal States ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [productToReject, setProductToReject] = useState<{ id: string; name: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ids: string[]; name?: string }>({ isOpen: false, ids: [] });
  const [bulkConfirm, setBulkConfirm] = useState<{ isOpen: boolean; action: 'approve' | 'reject' | null }>({ isOpen: false, action: null });

  // --- Handlers ---
  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await approveProduct(id);
      toast.success('Đã duyệt sản phẩm thành công!');
    } catch { toast.error('Lỗi khi duyệt sản phẩm.'); }
  };

  const openDeleteModal = (ids: string[], name?: string) => {
    setDeleteModal({ isOpen: true, ids, name });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.ids.length === 0) return;
    try {
      await deleteProducts(deleteModal.ids);
      toast.success(`Đã xóa ${deleteModal.ids.length} sản phẩm`);
      setDeleteModal({ isOpen: false, ids: [] });
      setRowSelection({});
    } catch {
      toast.error('Lỗi khi xóa sản phẩm.');
    }
  };

  const resetFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
  };

  // --- Table Definitions ---
  const columnHelper = createColumnHelper<Product>();

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Thông tin sản phẩm',
      cell: ({ row }) => {
        const firstImage = row.original.images?.[0];
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center" title={firstImage ? row.original.name : 'Chưa có ảnh'}>
              {firstImage ? (
                <img src={firstImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package size={22} className="text-slate-300" aria-label="Chưa có ảnh" />
              )}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors max-w-[250px]"
                title={row.original.name}
              >
                {row.original.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200 truncate max-w-[200px] inline-block"
                  title={row.original.sku || row.original.productCode}
                >
                  #{row.original.sku || row.original.productCode}
                </span>
                <span
                  className="text-[10px] bg-white text-slate-500 border border-slate-200 px-1.5 rounded truncate max-w-[120px] inline-block"
                  title={row.original.category}
                >
                  {row.original.category}
                </span>
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('sellerName', {
      header: 'Nhà bán hàng',
      cell: ({ row }) => (
        <span
          className="text-sm font-semibold text-slate-700 truncate max-w-[180px] inline-block"
          title={row.original.sellerName || '—'}
        >
          {row.original.sellerName || '—'}
        </span>
      ),
    }),
    columnHelper.accessor('price', {
      header: 'Giá bán',
      cell: ({ getValue }) => <span className="font-black text-slate-800 text-sm">{getValue().toLocaleString()}₫</span>,
    }),
    columnHelper.accessor('stock', {
      header: 'Kho hàng',
      cell: ({ getValue }) => {
        const stock = getValue();
        const meta = stockMeta(stock);
        return (
          <div className="flex flex-col items-center w-20" title={meta.tooltip}>
            <span className={`font-bold text-sm ${meta.color}`}>{stock}</span>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div className={`h-full ${meta.barColor}`} style={{ width: `${Math.min(100, stock)}%` }}></div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Trạng thái',
      cell: ({ getValue }) => {
        const status = getValue();
        const config = StatusConfig[status];
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${config.bgColor} ${config.color} ${config.borderColor}`}>
            {config.icon} {config.label}
          </span>
        );
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Ngày tạo',
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{formatDateVN(getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Hành động',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {p.status === 'PENDING' && (
              <>
                <button
                  title="Duyệt sản phẩm"
                  onClick={(e) => handleApprove(e, p.id)}
                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  title="Từ chối"
                  onClick={(e) => { e.stopPropagation(); setProductToReject({ id: p.id, name: p.name }); setIsRejectModalOpen(true); }}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                >
                  <XCircle size={16} />
                </button>
              </>
            )}
            <button
              title="Xem chi tiết"
              onClick={() => router.push(`/admin/products/${p.id}`)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Eye size={16} />
            </button>
            <button
              title="Chỉnh sửa"
              onClick={() => router.push(`/admin/products/${p.id}/edit`)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit3 size={16} />
            </button>
            <button
              title="Nhân bản"
              onClick={async () => {
                try {
                  await duplicateProduct(p);
                  toast.success('Đã nhân bản sản phẩm');
                } catch { toast.error('Lỗi khi nhân bản.'); }
              }}
              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              <Copy size={16} />
            </button>
            <button
              title="Xóa"
              onClick={(e) => { e.stopPropagation(); openDeleteModal([p.id], p.name); }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedIds = Object.keys(rowSelection);
  const selectedCount = selectedIds.length;

  const runBulk = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    try {
      if (action === 'approve') {
        await Promise.all(selectedIds.map((id) => approveProduct(id)));
        toast.success(`Đã duyệt ${selectedIds.length} sản phẩm`);
      } else if (action === 'reject') {
        await Promise.all(selectedIds.map((id) => rejectProduct({ id, reason: 'Từ chối hàng loạt bởi quản trị viên' })));
        toast.success(`Đã từ chối ${selectedIds.length} sản phẩm`);
      } else if (action === 'delete') {
        await deleteProducts(selectedIds);
        toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
      }
      setRowSelection({});
    } catch {
      toast.error('Thao tác hàng loạt thất bại.');
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">

      <RejectProductModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={async (reason) => {
          if (productToReject) {
            await rejectProduct({ id: productToReject.id, reason });
            toast.success('Đã từ chối sản phẩm.');
          }
          setIsRejectModalOpen(false);
        }}
        productName={productToReject?.name || ''}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, ids: [] })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa?"
        description={`Bạn có chắc chắn muốn xóa ${deleteModal.ids.length > 1 ? `${deleteModal.ids.length} sản phẩm` : `sản phẩm "${deleteModal.name}"`} không? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa ngay"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={bulkConfirm.isOpen}
        onClose={() => setBulkConfirm({ isOpen: false, action: null })}
        onConfirm={async () => {
          if (bulkConfirm.action) await runBulk(bulkConfirm.action);
          setBulkConfirm({ isOpen: false, action: null });
        }}
        title={bulkConfirm.action === 'approve' ? 'Duyệt hàng loạt?' : 'Từ chối hàng loạt?'}
        description={`Bạn sắp ${bulkConfirm.action === 'approve' ? 'duyệt' : 'từ chối'} ${selectedCount} sản phẩm. Tiếp tục?`}
        confirmLabel={bulkConfirm.action === 'approve' ? 'Duyệt tất cả' : 'Từ chối tất cả'}
        variant={bulkConfirm.action === 'approve' ? 'primary' : 'danger'}
      />

      <Breadcrumbs items={[{ label: 'Sản phẩm' }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">📦 Quản lý Sản phẩm</h1>
          <p className="text-sm text-slate-500 font-medium">Kiểm duyệt và quản lý toàn bộ sản phẩm.</p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all border-0"
        >
          <Plus size={20} /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-3xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm, SKU..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={(table.getColumn('status')?.getFilterValue() as string) || 'ALL'}
                  onChange={(e) => table.getColumn('status')?.setFilterValue(e.target.value === 'ALL' ? undefined : e.target.value)}
                  className="pl-4 pr-10 py-3 bg-white border rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 cursor-pointer appearance-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  {Object.entries(StatusConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bulk Action Bar */}
        {selectedCount > 0 && (
          <div className="sticky top-0 z-20 bg-blue-600 text-white px-6 py-3 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">Đã chọn {selectedCount}</span>
              <span className="text-xs text-blue-100">sản phẩm</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkConfirm({ isOpen: true, action: 'approve' })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold transition-all"
              >
                <CheckCircle size={14} /> Duyệt tất cả
              </button>
              <button
                onClick={() => setBulkConfirm({ isOpen: true, action: 'reject' })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold transition-all"
              >
                <XCircle size={14} /> Từ chối tất cả
              </button>
              <button
                onClick={() => openDeleteModal(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Trash2 size={14} /> Xóa
              </button>
              <button
                onClick={() => setRowSelection({})}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all"
              >
                <X size={14} /> Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Content Table Area */}
        <div className="overflow-x-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-100">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-transparent cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} className="opacity-50" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <TableRowSkeleton rows={5} cells={columns.length} />
              ) : isError ? (
                <tr>
                  <td colSpan={columns.length} className="py-20">
                    <ErrorState type="error" actionLabel="Thử lại" onAction={() => refetch()} />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      title="Chưa có sản phẩm nào"
                      description="Bắt đầu kinh doanh bằng cách thêm sản phẩm đầu tiên của bạn."
                      actionLabel="Thêm sản phẩm mới"
                      onAction={() => router.push('/admin/products/new')}
                      type="data"
                    />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      title="Không tìm thấy kết quả"
                      description="Không có sản phẩm nào phù hợp với bộ lọc hiện tại."
                      actionLabel="Xóa bộ lọc"
                      onAction={resetFilters}
                      type="search"
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/products/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — always render when there is data */}
        {!isLoading && !isError && products.length > 0 && (
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={Math.max(1, table.getPageCount())}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            totalItems={table.getFilteredRowModel().rows.length}
            itemsPerPage={table.getState().pagination.pageSize}
          />
        )}
      </div>
    </div>
  );
}
