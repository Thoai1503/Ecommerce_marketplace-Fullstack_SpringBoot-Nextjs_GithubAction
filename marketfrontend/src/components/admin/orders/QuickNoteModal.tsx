
"use client";

import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { Order } from '@/types/index';
import { updateOrderNote } from '@/service/orders';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess: () => void;
}

export default function QuickNoteModal({ isOpen, onClose, order, onSuccess }: QuickNoteModalProps) {
  const [note, setNote] = useState(order.internalNote || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateOrderNote(order.id, note);
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
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Ghi chú nội bộ</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{order.orderCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 border-0 bg-transparent transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung ghi chú</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú chỉ dành cho nhân viên quản lý..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm leading-relaxed"
          ></textarea>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent">Hủy</button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg border-0 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : <><Save size={18} /> Lưu ghi chú</>}
          </button>
        </div>
      </div>
    </div>
  );
}
