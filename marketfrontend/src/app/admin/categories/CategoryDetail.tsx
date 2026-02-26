
"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCategoryDetail } from '@/hooks/admin/useCategories';
import { useProducts } from '@/hooks/admin/useProducts';
import { useAttributes } from '@/hooks/admin/useAttributes';
import { useUnits } from '@/hooks/admin/useUnits'; // Import Units hook
import { 
  ChevronLeft, Edit3, Trash2, CheckCircle, XCircle, 
  Layers, Package, Settings, List, CircleDot, Scale
} from 'lucide-react';
import { CategoryStatus } from '@/types';
import { useToast } from '@/context/ToastContext';

const StatusConfig: Record<CategoryStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-50', icon: <CheckCircle size={14} /> },
  HIDDEN: { label: 'Hidden', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: <XCircle size={14} /> },
};

export default function CategoryDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const router = useRouter();
  const { category, isLoading: isLoadingCategory } = useCategoryDetail(id || '');
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { attributes, isLoading: isLoadingAttributes } = useAttributes();
  const { units } = useUnits(); // Get units to map symbols
  const { info } = useToast();

  // Filter products by this category
  const categoryProducts = useMemo(() => {
    if (!category || !products) return [];
    return products.filter(p => p.category === category.name || p.category.includes(category.name));
  }, [category, products]);

  // Find linked attributes and enrich with Unit data
  const linkedAttributes = useMemo(() => {
    if (!category || !attributes || !category.attributeIds) return [];
    
    return attributes
      .filter(attr => category.attributeIds?.includes(attr.id))
      .map(attr => {
        const unit = units?.find(u => u.id === attr.unitId);
        return {
          ...attr,
          unitSymbol: unit ? unit.symbol : null,
          unitLabel: unit ? unit.label : null
        };
      });
  }, [category, attributes, units]);

  if (isLoadingCategory) return (
    <div className="p-20 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-400">Loading details...</p>
    </div>
  );

  if (!category) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="text-6xl mb-4">📁</div>
      <h3 className="text-xl font-bold text-slate-800">Category not found</h3>
      <button onClick={() => router.push('/admin/categories/industries')} className="mt-4 text-blue-600 hover:underline">Back to list</button>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-8 pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/categories/industries')}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-1">
              <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/admin/categories/industries')}>Category</span>
              <span>/</span>
              <span>Details</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{category.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/admin/categories/industries/${category.id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Edit3 size={18} /> <span className="hidden sm:inline">Edit</span>
          </button>
          <button 
            onClick={() => info("Delete logic here")}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-all shadow-sm"
          >
            <Trash2 size={18} /> <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info Card & Attributes */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="aspect-[4/3] w-full bg-slate-100 relative">
                 <img src={category.thumbnailUrl} alt={category.name} className="w-full h-full object-cover" />
                 <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm border ${StatusConfig[category.status].bgColor} ${StatusConfig[category.status].color} border-white`}>
                       {StatusConfig[category.status].icon}
                       {StatusConfig[category.status].label}
                    </span>
                 </div>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID (Code)</p>
                    <p className="text-lg font-mono font-black text-slate-800">{category.categoryCode}</p>
                 </div>
                 
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{category.description || "No description provided."}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Products</p>
                       <p className="text-xl font-black text-slate-800">{category.productStock}</p>
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Created</p>
                       <p className="text-sm font-bold text-slate-800">{new Date(category.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Linked Attributes Card - IMPROVED LAYOUT */}
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Settings size={16} /> Specifications
                 </h3>
                 {linkedAttributes.length > 0 && (
                    <button 
                       onClick={() => router.push(`/admin/categories/industries/${category.id}/edit`)}
                       className="text-xs font-bold text-blue-600 hover:underline"
                    >
                       Manage
                    </button>
                 )}
              </div>
              
              {isLoadingAttributes ? (
                 <p className="text-sm text-slate-400">Loading attributes...</p>
              ) : linkedAttributes.length === 0 ? (
                 <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-bold">No attributes linked.</p>
                    <button 
                       onClick={() => router.push(`/admin/categories/industries/${category.id}/edit`)}
                       className="text-xs text-blue-600 font-bold mt-2 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                       Add Attributes
                    </button>
                 </div>
              ) : (
                 <div className="space-y-2">
                    {linkedAttributes.map(attr => (
                       <div 
                          key={attr.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                          onClick={() => router.push(`/admin/categories/attributes/${attr.id}`)}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors`}>
                                {attr.option === 'DROPDOWN' ? <List size={14} /> : <CircleDot size={14} />}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{attr.name}</p>
                                <p className="text-[10px] text-slate-400">{attr.option === 'DROPDOWN' ? 'Selection' : 'Radio Choice'}</p>
                             </div>
                          </div>
                          
                          {attr.unitSymbol ? (
                             <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                                <Scale size={10} /> {attr.unitSymbol}
                             </span>
                          ) : (
                             <span className="text-[10px] font-medium text-slate-400 italic">No unit</span>
                          )}
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* Right: Products Table */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={18} /> Products in this category
                 </h3>
                 <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                    {categoryProducts.length} items
                 </span>
              </div>

              {isLoadingProducts ? (
                 <div className="p-10 flex justify-center"><div className="spinner-border text-primary"></div></div>
              ) : categoryProducts.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-400">
                    <Package size={48} className="mb-3 opacity-20" />
                    <p className="text-sm font-bold">No products found in {category.name}.</p>
                 </div>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                             <th className="px-6 py-4 w-10"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {categoryProducts.map(product => (
                             <tr 
                               key={product.id} 
                               className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                               onClick={() => router.push(`/admin/products/${product.id}`)}
                             >
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                         <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</p>
                                         <p className="text-[10px] text-slate-400 font-mono">{product.sku}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <span className="text-sm font-black text-slate-800">{product.price.toLocaleString()}₫</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   <span className={`text-xs font-bold ${product.stock < 10 ? 'text-amber-600' : 'text-slate-600'}`}>
                                      {product.stock}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                   <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                      {product.status}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <ChevronLeft size={16} className="text-slate-300 rotate-180" />
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
