
"use client";

import React from 'react';
import { X, Ban, Unlock, Trash2, AlertTriangle } from 'lucide-react';

// --- BLOCK / UNBLOCK MODAL ---
interface BlockCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  isBlocked: boolean; // True if currently blocked (so action is Unblock)
}

export const BlockCustomerModal = ({ isOpen, onClose, onConfirm, customerName, isBlocked }: BlockCustomerModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 ${isBlocked ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
            {isBlocked ? <Unlock size={32} /> : <Ban size={32} />}
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {isBlocked ? 'Mở khóa tài khoản?' : 'Chặn khách hàng?'}
          </h3>
          
          <p className="text-slate-500 text-sm font-medium mb-2">
            Bạn có chắc muốn {isBlocked ? 'bỏ chặn' : 'chặn'} khách hàng này không?
          </p>
          
          <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-full truncate">
            "{customerName}"
          </p>

          {!isBlocked && (
            <p className="text-xs text-red-500 mt-4 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 text-left">
              <AlertTriangle size={16} className="shrink-0" />
              Khách hàng sẽ không thể đăng nhập hoặc đặt hàng sau khi bị chặn.
            </p>
          )}
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
            className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all border-0 ${
              isBlocked 
                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
            }`}
          >
            {isBlocked ? 'Mở khóa ngay' : 'Chặn ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DELETE MODAL ---
interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName?: string;
  count?: number;
}

export const DeleteCustomerModal = ({ isOpen, onClose, onConfirm, customerName, count = 1 }: DeleteCustomerModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <Trash2 size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">Xóa khách hàng?</h3>
          
          <p className="text-slate-500 text-sm font-medium mb-2">
            Hành động này sẽ xóa dữ liệu khách hàng khỏi hệ thống.
          </p>
          
          {customerName && (
             <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-full truncate">
               "{customerName}"
             </p>
          )}

          {count > 1 && (
             <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mt-2">
               Số lượng: {count} khách hàng
             </p>
          )}

          <p className="text-xs text-amber-600 mt-4 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2 text-left">
            <AlertTriangle size={16} className="shrink-0" />
            Lưu ý: Dữ liệu đơn hàng lịch sử có thể bị ảnh hưởng.
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
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
};
