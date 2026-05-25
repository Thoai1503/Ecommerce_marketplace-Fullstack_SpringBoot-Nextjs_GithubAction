
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/admin/useProducts';
import { useToast } from '@/context/ToastContext';
import {
  Search, Filter, Edit3, Eye, CheckCircle, XCircle,
  AlertCircle, Package, ArrowUpDown, Power
} from 'lucide-react';
import { Product, ProductStatus } from '@/types';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import RejectProductModal from '@/components/admin/products/RejectProductModal';
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
  PENDING: { label: 'Waiting for approval', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: <AlertCircle size={14} /> },
  APPROVED: { label: 'On Sale', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: <CheckCircle size={14} /> },
  REJECTED: { label: 'Rejected', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', icon: <XCircle size={14} /> },
  DRAFT: { label: 'Draft', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-200', icon: <Edit3 size={14} /> },
  HIDDEN: { label: 'Hidden', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', icon: <Package size={14} /> },
};

export default function ProductsPage() {
  const router = useRouter();
  const { products, isLoading, isError, refetch, approveProduct, rejectProduct, updateProductActive } = useProducts();
  const toast = useToast();

  // --- Table State ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // --- Modal States ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [productToReject, setProductToReject] = useState<{ id: string; name: string } | null>(null);

  // --- Handlers ---
  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
        await approveProduct(id);
        toast.success('Product approved successfully!');
    } catch(e) { toast.error('Error occurred while approving the product.'); }
  };

  const handleToggleActive = async (e: React.MouseEvent, id: string, current: boolean) => {
    e.stopPropagation();
    const nextActive = !current;
    await updateProductActive({ id, isActive: nextActive });
    toast.success(nextActive ? 'Product enabled.' : 'The product has been turned off.');
  };

  const resetFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
  };

  // --- Table Definitions ---
  const columnHelper = createColumnHelper<Product>();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Product Information',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img src={row.original.images[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors max-w-[250px]">{row.original.name}</p>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200">
                 #{row.original.sku}
               </span>
               <span className="text-[10px] bg-white text-slate-500 border border-slate-200 px-1.5 rounded">{row.original.category}</span>
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('price', {
      header: 'Selling Price',
      cell: ({ getValue }) => <span className="font-black text-slate-800 text-sm">{getValue().toLocaleString()}₫</span>,
    }),
    columnHelper.accessor(
      (product) => `${product.sellerName} ${product.sellerEmail || ''} ${product.sellerPhone || ''}`,
      {
        id: 'sellerContact',
        header: 'Shop',
        cell: ({ row }) => (
          <div className="min-w-[190px] max-w-[240px]">
            <p className="truncate text-sm font-bold text-slate-700">{row.original.sellerName}</p>
            <p className="truncate text-xs text-slate-500">{row.original.sellerEmail || 'No email available'}</p>
            <p className="truncate text-xs text-slate-500">{row.original.sellerPhone || 'No phone number available'}</p>
          </div>
        ),
      }
    ),
    columnHelper.accessor('stock', {
      header: 'Inventory',
      cell: ({ getValue }) => {
        const stock = getValue();
        return (
          <div className="flex flex-col items-center w-20">
             <span className={`font-bold text-sm ${stock === 0 ? 'text-red-600' : stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>{stock}</span>
             <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div className={`h-full ${stock===0?'bg-red-500':stock<10?'bg-amber-500':'bg-emerald-500'}`} style={{width: `${Math.min(100, stock)}%`}}></div>
             </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('soldCount', {
      header: 'Sold',
      cell: ({ getValue }) => (
        <span className="inline-flex min-w-16 justify-center rounded-lg bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
          {getValue().toLocaleString('vi-VN')}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        const config = StatusConfig[status];
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${config.bgColor} ${config.color} ${config.borderColor}`}>
            {config.icon} {config.label}
          </span>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
           <button
             onClick={() => router.push(`/admin/products/${row.original.id}`)}
             className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
             title="View Details"
           >
             <Eye size={16} />
           </button>
           {row.original.status === 'PENDING' ? (
             <>
               <button onClick={(e) => handleApprove(e, row.original.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"><CheckCircle size={16} /></button>
               <button onClick={(e) => { e.stopPropagation(); setProductToReject(row.original); setIsRejectModalOpen(true); }} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><XCircle size={16} /></button>
             </>
           ) : (
             <>
               <button onClick={(e) => handleToggleActive(e, row.original.id, row.original.isActive)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Power size={16} /></button>
             </>
           )}
        </div>
      ),
    })
  ], []);

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6">
      
      <RejectProductModal 
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={async (reason) => {
           if(productToReject) {
             await rejectProduct({id: productToReject.id, reason});
             toast.success('Product rejected.');
           }
           setIsRejectModalOpen(false);
        }}
        productName={productToReject?.name || ''}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">📦 Management Products</h1>
          <p className="text-sm text-slate-500 font-medium">Review and manage all products.</p>
        </div>
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
                  placeholder="Search products, SKU, email or shop phone..."
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
                    <option value="ALL">All status</option>
                    {Object.entries(StatusConfig).map(([k, v]) => (
                       <option key={k} value={k}>{v.label}</option>
                    ))}
                 </select>
                 <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Content Table Area */}
        <div className="overflow-x-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-slate-100">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-transparent cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
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
                       <ErrorState type="error" actionLabel="Retry" onAction={() => refetch()} />
                    </td>
                 </tr>
              ) : products.length === 0 ? (
                 <tr>
                    <td colSpan={columns.length}>
                       <EmptyState 
                          title="No products yet." 
                          description="Get started by adding your first product."
                          actionLabel="Add New Product"
                          onAction={() => router.push('/admin/products/new')}
                          type="data"
                       />
                    </td>
                 </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                 <tr>
                    <td colSpan={columns.length}>
                       <EmptyState 
                          title="No results found." 
                          description="No products match the current filters."
                          actionLabel="Clear Filters"
                          onAction={resetFilters}
                          type="search"
                       />
                    </td>
                 </tr>
              ) : (
                 table.getRowModel().rows.map(row => (
                   <tr key={row.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => router.push(`/admin/products/${row.original.id}`)}>
                      {row.getVisibleCells().map(cell => (
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

        {/* Pagination */}
        {!isLoading && !isError && table.getRowModel().rows.length > 0 && (
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            totalItems={table.getFilteredRowModel().rows.length}
            itemsPerPage={table.getState().pagination.pageSize}
          />
        )}
      </div>
    </div>
  );
}
