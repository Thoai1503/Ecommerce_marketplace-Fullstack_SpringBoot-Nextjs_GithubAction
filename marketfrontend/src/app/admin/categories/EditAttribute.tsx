
"use client";

import React, { useState, useEffect } from 'react';
import { useParams,  useRouter } from 'next/navigation';
import { useAttributeDetail } from '../../../hooks/admin/useAttributes';
import { useUnits } from '../../../hooks/admin/useUnits';
import { ChevronLeft, Save, Scale, AlertCircle, Eye, MousePointerClick, List } from 'lucide-react';
import { AttributeOptionType } from '../../../types/index';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function EditAttribute() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = !!id;
  const { attribute, isLoading, createAttribute, updateAttribute, isSaving } = useAttributeDetail(id || '');
  const { units, isLoading: isLoadingUnits } = useUnits();
  
  const [formData, setFormData] = useState({
    name: '',
    attributeCode: '',
    option: 'DROPDOWN' as AttributeOptionType,
    published: true,
    valuesCount: 0,
    createdAt: '',
    unitId: '' as string,
  });

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (isEditMode && attribute) {
      setFormData({
        name: attribute.name,
        attributeCode: attribute.attributeCode,
        option: attribute.option,
        published: attribute.published,
        valuesCount: attribute.valuesCount,
        createdAt: attribute.createdAt,
        unitId: attribute.unitId || '',
      });
    }
  }, [isEditMode, attribute]);

  const handleNameChange = (newName: string) => {
    if (!isEditMode) {
      setFormData(prev => ({
        ...prev,
        name: newName,
        attributeCode: "AT-XXXX", 
      }));
    } else {
      setFormData(prev => ({ ...prev, name: newName }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setToast({ message: "Attribute Name is required.", type: "error" });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        option: formData.option,
        published: formData.published,
        unitId: formData.unitId || undefined,
      };

      if (isEditMode) {
        await updateAttribute(payload);
        setToast({ message: "Attribute updated successfully!", type: "success" });
        setTimeout(() => router.push('/admin/categories/attributes'), 1000);
      } else {
        await createAttribute(payload);
        setToast({ message: "Attribute created successfully!", type: "success" });
        setTimeout(() => router.push('/admin/categories/attributes'), 1000);
      }
    } catch (e) {
      setToast({ message: "An error occurred.", type: "error" });
    }
  };

  if (isEditMode && isLoading) return (
    <div className="p-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-24 space-y-6">
      {toast && <ToastComponent toast={{ id: '1', message: toast.message, type: toast.type }} onClose={() => setToast(null)} />}

      <Breadcrumbs items={[
        { label: 'Attributes', path: '/admin/categories/attributes' },
        { label: isEditMode ? 'Edit' : 'New' }
      ]} />

      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/categories/attributes')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{isEditMode ? `Edit Attribute` : 'Add Attribute'}</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Configure attribute details and options.</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/categories/attributes')} className="px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl border-0 bg-transparent transition-all">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left: Form */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
               {isEditMode && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-6 mb-6">
                     <div className="flex-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID (Code)</p>
                        <p className="text-sm font-black text-slate-800 font-mono">{formData.attributeCode}</p>
                     </div>
                     <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Values</p>
                        <p className="text-sm font-black text-blue-600">{formData.valuesCount} items</p>
                     </div>
                  </div>
               )}

               <div className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Attribute Name <span className="text-red-500">*</span></label>
                     <input 
                       type="text" 
                       value={formData.name}
                       onChange={(e) => handleNameChange(e.target.value)}
                       className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold"
                       placeholder="e.g. Brand, Color, Size"
                     />
                  </div>

                  {/* Option Type */}
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Display Type</label>
                     <div className="grid grid-cols-2 gap-4">
                        <div 
                           onClick={() => setFormData({...formData, option: 'DROPDOWN'})}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${formData.option === 'DROPDOWN' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                        >
                           <List size={24} />
                           <span className="text-xs font-bold uppercase">Dropdown List</span>
                        </div>
                        <div 
                           onClick={() => setFormData({...formData, option: 'RADIO'})}
                           className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${formData.option === 'RADIO' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                        >
                           <MousePointerClick size={24} />
                           <span className="text-xs font-bold uppercase">Radio Button</span>
                        </div>
                     </div>
                  </div>

                  {/* Unit Selection */}
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Measurement Unit (Optional)</label>
                     <div className="relative">
                        <select 
                           value={formData.unitId}
                           onChange={(e) => setFormData({...formData, unitId: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium appearance-none cursor-pointer"
                        >
                           <option value="">No Unit (None)</option>
                           {isLoadingUnits ? (
                              <option disabled>Loading units...</option>
                           ) : (
                              units.map(u => (
                                 <option key={u.id} value={u.id}>{u.label} ({u.symbol})</option>
                              ))
                           )}
                        </select>
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                     </div>
                     <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <AlertCircle size={10} /> Link to a unit (e.g. Weight - kg) to display symbol automatically.
                     </p>
                  </div>

                  {/* Published */}
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Status</label>
                     <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <button 
                           onClick={() => setFormData({...formData, published: !formData.published})}
                           className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.published ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                           <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.published ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-sm font-bold ${formData.published ? 'text-green-700' : 'text-slate-500'}`}>
                           {formData.published ? 'Active' : 'Hidden'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Preview */}
         <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Eye size={14} /> Frontend Preview
               </h3>
               
               <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-full max-w-[200px]">
                     <label className="text-sm font-bold text-slate-700 mb-2 block">{formData.name || 'Attribute Name'}</label>
                     
                     {formData.option === 'DROPDOWN' ? (
                        <div className="relative">
                           <div className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 flex justify-between items-center shadow-sm">
                              <span>Select value...</span>
                              <span className="text-[10px] text-slate-400">▼</span>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-2">
                           {['Option 1', 'Option 2', 'Option 3'].map((opt, i) => (
                              <div key={i} className="flex items-center gap-2">
                                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${i === 0 ? 'border-blue-500' : 'border-slate-300 bg-white'}`}>
                                    {i === 0 && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                 </div>
                                 <span className="text-sm text-slate-600">{opt}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-8 text-center">
                     Đây là minh họa cách hiển thị thuộc tính <br/> trên trang chi tiết sản phẩm.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
