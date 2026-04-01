<<<<<<< HEAD
"use client";

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Unit, UnitStatus } from '@/types/index';
=======

"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Scale, Ruler, Box, Droplets, HelpCircle } from 'lucide-react';
import { Unit, UnitType, UnitStatus } from '@/types/index';
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Unit>) => Promise<void>;
  initialData?: Unit | null;
  isSaving: boolean;
}

<<<<<<< HEAD
export default function UnitModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving
}: UnitModalProps) {

  const [formData, setFormData] = useState<Partial<Unit>>({
    label: '',
    symbol: '',
    status: 'ACTIVE',
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          label: initialData.label,
          symbol: initialData.symbol,
          status: initialData.status,
        });
      } else {
        setFormData({
          label: '',
          symbol: '',
          status: 'ACTIVE',
        });
=======
const TypeConfig: Record<UnitType, { label: string; icon: any; color: string; bgColor: string }> = {
  WEIGHT: { label: 'Weight', icon: <Scale size={18} />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  LENGTH: { label: 'Length', icon: <Ruler size={18} />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  VOLUME: { label: 'Volume', icon: <Droplets size={18} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  QUANTITY: { label: 'Quantity', icon: <Box size={18} />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  OTHER: { label: 'Other', icon: <HelpCircle size={18} />, color: 'text-slate-500', bgColor: 'bg-slate-50' },
};

export default function UnitModal({ isOpen, onClose, onSave, initialData, isSaving }: UnitModalProps) {
  const [formData, setFormData] = useState<Partial<Unit>>({
    label: '',
    symbol: '',
    type: 'WEIGHT',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ label: '', symbol: '', type: 'WEIGHT', status: 'ACTIVE' });
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

<<<<<<< HEAD
  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label || !formData.symbol) return;

=======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.symbol) return;
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
<<<<<<< HEAD

      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Unit' : 'Add New Unit'}
          </h3>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors border-0 bg-transparent"
          >
=======
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Unit' : 'Add New Unit'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors border-0 bg-transparent">
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
<<<<<<< HEAD

            {/* INPUT */}
            <div className="grid grid-cols-2 gap-6">

              {/* LABEL */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all focus:bg-white"
                  placeholder="e.g. Kilogram"
                  autoFocus
                />
              </div>

              {/* SYMBOL */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.symbol || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all focus:bg-white"
                  placeholder="e.g. kg"
                />
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">

              <span className={`text-sm font-bold ${
                formData.status === 'ACTIVE'
                  ? 'text-green-600'
                  : 'text-slate-400'
              }`}>
                {formData.status === 'ACTIVE' ? 'Active' : 'Hidden'}
              </span>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    status:
                      formData.status === 'ACTIVE'
                        ? 'INACTIVE'
                        : 'ACTIVE',
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  formData.status === 'ACTIVE'
                    ? 'bg-green-500'
                    : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    formData.status === 'ACTIVE'
                      ? 'translate-x-6'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* FOOTER */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">

            <button
=======
            {/* Type Selection */}
            <div className="space-y-3">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Category</label>
               <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(Object.keys(TypeConfig) as UnitType[]).map((type) => {
                     const config = TypeConfig[type];
                     const isSelected = formData.type === type;
                     return (
                        <div 
                           key={type}
                           onClick={() => setFormData({...formData, type})}
                           className={`cursor-pointer p-2 rounded-xl border transition-all flex flex-col items-center gap-1 text-center ${isSelected ? `border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200` : 'border-slate-100 hover:border-slate-300 text-slate-400 hover:bg-slate-50'}`}
                        >
                           <div className={isSelected ? 'scale-110 transition-transform' : ''}>{config.icon}</div>
                           <span className="text-[9px] font-bold uppercase">{config.label}</span>
                        </div>
                     );
                  })}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Unit Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all focus:bg-white"
                    placeholder="e.g. Kilogram"
                    autoFocus
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Symbol <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all focus:bg-white"
                    placeholder="e.g. kg"
                  />
               </div>
            </div>

            {/* Preview & Status */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Preview</p>
                  <p className="text-lg font-black text-slate-800">
                     10 <span className="text-blue-600">{formData.symbol || '...'}</span>
                  </p>
               </div>
               <div className="w-px h-10 bg-slate-200"></div>
               <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${formData.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400'}`}>
                     {formData.status === 'ACTIVE' ? 'Active' : 'Hidden'}
                  </span>
                  <button 
                     type="button"
                     onClick={() => setFormData({...formData, status: formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'})}
                     className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                     <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
               </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button 
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent"
            >
              Cancel
            </button>
<<<<<<< HEAD

            <button
=======
            <button 
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
              type="submit"
              disabled={isSaving || !formData.label || !formData.symbol}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0"
            >
<<<<<<< HEAD
              {isSaving ? 'Saving...' : (
                <>
                  <Save size={18} /> Save Unit
                </>
              )}
            </button>

=======
              {isSaving ? 'Saving...' : <><Save size={18} /> Save Unit</>}
            </button>
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
          </div>
        </form>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
