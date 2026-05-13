
"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface RejectProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  productName: string;
}

export default function RejectProductModal({ isOpen, onClose, onConfirm, productName }: RejectProductModalProps) {
  const [reason, setReason] = useState('');

  // Reset reason when modal opens to ensure fresh state
  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            Từ chối sản phẩm
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors border-0 bg-transparent">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sản phẩm</p>
            <p className="text-sm font-bold text-slate-800 line-clamp-1">{productName}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Lý do từ chối <span className="text-red-500">*</span></label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Hình ảnh mờ, thông tin không chính xác..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 text-sm font-medium resize-none"
              autoFocus
            ></textarea>
            <p className="text-[11px] text-slate-400 italic">Lý do này sẽ được gửi thông báo đến Nhà bán hàng.</p>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
