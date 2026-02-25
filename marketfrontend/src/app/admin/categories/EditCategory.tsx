
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCategoryDetail } from '../../../hooks/admin/useCategories';
import { useAttributes } from '../../../hooks/admin/useAttributes';
import { useUnits } from '../../../hooks/admin/useUnits';
import { generateCategoryCode, generateSlug } from '../../../service/categories';
import { ChevronLeft, Save, UploadCloud, Layers, Info, X, Tag, FileText, Image as ImageIcon, Settings, Search, CheckCircle } from 'lucide-react';
import { CategoryStatus } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { Skeleton } from '../../../components/ui/Skeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function EditCategory() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = !!id;
  const { category, isLoading, createCategory, updateCategory, isSaving } = useCategoryDetail(id || '');
  const { attributes, isLoading: isLoadingAttributes } = useAttributes();
  const { units } = useUnits();
  
  const [formData, setFormData] = useState({
    name: '',
    categoryCode: '',
    slug: '',
    description: '',
    thumbnailUrl: '',
    status: 'ACTIVE' as CategoryStatus,
    productStock: 0,
    createdAt: '',
    attributeIds: [] as string[],
  });

  const [attrSearch, setAttrSearch] = useState(''); // NEW: Search state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        name: category.name,
        categoryCode: category.categoryCode,
        slug: category.slug,
        description: category.description || '',
        thumbnailUrl: category.thumbnailUrl,
        status: category.status,
        productStock: category.productStock,
        createdAt: category.createdAt,
        attributeIds: category.attributeIds || [],
      });
      setPreviewUrl(category.thumbnailUrl);
    }
  }, [isEditMode, category]);

  // Filter attributes based on search
  const filteredAttributes = useMemo(() => {
    return attributes.filter(attr => 
      attr.name.toLowerCase().includes(attrSearch.toLowerCase()) || 
      attr.attributeCode.toLowerCase().includes(attrSearch.toLowerCase())
    );
  }, [attributes, attrSearch]);

  const handleNameChange = (newName: string) => {
    if (!isEditMode) {
      setFormData(prev => ({
        ...prev,
        name: newName,
        categoryCode: generateCategoryCode(newName),
        slug: generateSlug(newName),
      }));
    } else {
      setFormData(prev => ({ ...prev, name: newName }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    }
  };

  const toggleAttribute = (attrId: string) => {
    setFormData(prev => {
      const newIds = prev.attributeIds.includes(attrId) 
        ? prev.attributeIds.filter(id => id !== attrId) 
        : [...prev.attributeIds, attrId];
      return { ...prev, attributeIds: newIds };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.thumbnailUrl) {
      setToast({ message: "Name and Thumbnail are required.", type: "error" });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        thumbnailUrl: formData.thumbnailUrl,
        status: formData.status,
        attributeIds: formData.attributeIds,
      };

      if (isEditMode) {
        await updateCategory(payload);
        setToast({ message: "Category updated successfully!", type: "success" });
      } else {
        await createCategory({
          ...payload,
          categoryCode: formData.categoryCode,
        });
        setToast({ message: "Category created successfully!", type: "success" });
      }
      setTimeout(() => router.push('/admin/categories/industries'), 1000);
    } catch (e) {
      setToast({ message: "An error occurred.", type: "error" });
    }
  };

  if (isEditMode && isLoading) return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-4xl mx-auto pb-24 space-y-6">
      {toast && <ToastComponent toast={{ id: '1', message: toast.message, type: toast.type }} onClose={() => setToast(null)} />}

      <Breadcrumbs items={[
        { label: 'Industries', path: '/admin/categories/industries' },
        { label: isEditMode ? 'Edit' : 'New' }
      ]} />

      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/categories/industries')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{isEditMode ? `Edit Category` : 'Add Category'}</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                 Manage industry categories and their attributes.
              </p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/categories/industries')} className="px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl border-0 bg-transparent transition-all">
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 border-0 transition-all disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? 'Saving...' : (isEditMode ? 'Edit Change' : 'Save Change')}
            </button>
         </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-8">
         
         {isEditMode && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-6">
               <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID (Code)</p>
                  <p className="text-sm font-black text-slate-800 font-mono">{formData.categoryCode}</p>
               </div>
               <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Stock</p>
                  <p className="text-sm font-black text-blue-600">{formData.productStock} products</p>
               </div>
               <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Created At</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(formData.createdAt).toLocaleDateString()}</p>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold"
                    placeholder="Enter category name"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {!isEditMode && (
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">ID (Auto)</label>
                        <input 
                          type="text" 
                          value={formData.categoryCode}
                          readOnly
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-500 cursor-not-allowed"
                        />
                     </div>
                  )}
                  <div className={`space-y-2 ${isEditMode ? 'col-span-2' : ''}`}>
                     <label className="text-sm font-bold text-slate-700">Slug</label>
                     <input 
                       type="text" 
                       value={formData.slug}
                       onChange={(e) => setFormData({...formData, slug: e.target.value})}
                       className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium resize-none"
                    placeholder="Enter description..."
                  />
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Thumbnail Image <span className="text-red-500">*</span></label>
                  <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full h-64 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500 transition-all relative overflow-hidden group"
                  >
                     {previewUrl ? (
                        <>
                           <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                              <ImageIcon size={32} className="mb-2" />
                              <span className="text-xs font-bold">Change Image</span>
                           </div>
                        </>
                     ) : (
                        <>
                           <UploadCloud size={40} className="mb-3 text-slate-400" />
                           <span className="text-sm font-bold text-slate-500">Choose Image</span>
                           <span className="text-xs text-slate-400 mt-1">Max 5MB, JPG/PNG</span>
                        </>
                     )}
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                     <button 
                        onClick={() => setFormData({...formData, status: formData.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE'})}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}
                     >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                     <span className={`text-sm font-bold ${formData.status === 'ACTIVE' ? 'text-green-700' : 'text-slate-500'}`}>
                        {formData.status === 'ACTIVE' ? 'Active' : 'Hidden'}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* Attributes Section */}
         <div className="pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
               <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                     <Settings size={16} /> Associated Attributes
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Select specifications that apply to this category.</p>
               </div>
               
               {/* Search Box */}
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                     type="text" 
                     value={attrSearch}
                     onChange={(e) => setAttrSearch(e.target.value)}
                     placeholder="Search attributes..." 
                     className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 w-full sm:w-64"
                  />
               </div>
            </div>
            
            {isLoadingAttributes ? (
               <div className="py-4 text-center text-slate-400">Loading attributes...</div>
            ) : filteredAttributes.length === 0 ? (
               <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p>No attributes found matching "{attrSearch}".</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredAttributes.map(attr => {
                     const isSelected = formData.attributeIds.includes(attr.id);
                     const unit = units?.find(u => u.id === attr.unitId);
                     return (
                        <div 
                           key={attr.id}
                           onClick={() => toggleAttribute(attr.id)}
                           className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                 ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200' 
                                 : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                           }`}
                        >
                           <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                           }`}>
                              {isSelected && <CheckCircle size={14} className="text-white" />}
                           </div>
                           <div className="min-w-0">
                              <p className={`text-sm font-bold truncate ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                                 {attr.name}
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                 {attr.attributeCode} 
                                 {unit && <span className="bg-slate-100 px-1 rounded text-slate-600 font-medium">{unit.symbol}</span>}
                              </p>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
