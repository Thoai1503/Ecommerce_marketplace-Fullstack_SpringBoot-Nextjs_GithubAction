
"use client";

import React, { useState } from 'react';
import { X, Truck, Save, ExternalLink } from 'lucide-react';
import { Order } from '@/types/index';
import { updateTrackingNumber } from '@/service/orders';

interface ShippingCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess: () => void;
}

export default function ShippingCodeModal({ isOpen, onClose, order, onSuccess }: ShippingCodeModalProps) {
  const [code, setCode] = useState(order.trackingNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!code.trim()) return;
    setIsSaving(true);
    const success = await updateTrackingNumber(order.id, code);
    if (success) {
      onSuccess();
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Mã vận đơn</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Đang giao hàng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 border-0 bg-transparent transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Thông tin khách hàng</p>
            <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
            <p className="text-xs text-slate-500 mt-1">{order.shippingAddress}</p>
          </div>

          <label className="block text-sm font-bold text-slate-700 mb-2">Nhập Mã Tracking *</label>
          <div className="relative">
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: SPX123456789, GHN987..."
              className="w-full pl-4 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-black tracking-widest uppercase transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
              <ExternalLink size={18} />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent"
          >
            Bỏ qua
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !code.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-50"
          >
            {isSaving ? "Đang xử lý..." : <><Save size={18} /> Cập nhật mã</>}
          </button>
        </div>
      </div>
    </div>
  );
}
