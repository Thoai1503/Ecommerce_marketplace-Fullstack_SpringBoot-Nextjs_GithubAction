
"use client";

import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string; // Tên sản phẩm để hiển thị cho rõ (Option)
  count?: number; // Nếu xóa nhiều
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, productName, count = 1 }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 flex flex-col items-center text-center">
          {/* Icon cảnh báo lớn */}
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <Trash2 size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa?</h3>
          
          <p className="text-slate-500 text-sm font-medium mb-1">
            Bạn có muốn xóa sản phẩm này hay không?
          </p>
          
          {productName && (
             <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-full truncate mt-2">
               "{productName}"
             </p>
          )}

          {count > 1 && (
             <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mt-2">
               Số lượng: {count} sản phẩm
             </p>
          )}

          <p className="text-xs text-red-400 mt-4 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertTriangle size={12} />
            Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all border-0"
          >
            Xóa ngay
          </button>
        </div>
      </div>
    </div>
  );
}
