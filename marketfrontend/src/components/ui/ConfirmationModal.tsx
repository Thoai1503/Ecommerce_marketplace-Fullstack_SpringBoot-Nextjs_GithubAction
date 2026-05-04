
import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

export type ModalVariant = 'danger' | 'success' | 'warning' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmLabel = "Xác nhận", 
  cancelLabel = "Hủy bỏ",
  variant = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen || isLoading) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const config = {
    danger: { icon: <XCircle size={32} />, color: 'text-red-500', bg: 'bg-red-50', btnBg: 'bg-red-600 hover:bg-red-700 shadow-red-500/20' },
    success: { icon: <CheckCircle size={32} />, color: 'text-green-500', bg: 'bg-green-50', btnBg: 'bg-green-600 hover:bg-green-700 shadow-green-500/20' },
    warning: { icon: <AlertTriangle size={32} />, color: 'text-amber-500', bg: 'bg-amber-50', btnBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' },
    info: { icon: <HelpCircle size={32} />, color: 'text-blue-500', bg: 'bg-blue-50', btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' },
  };

  const style = config[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 ${style.bg} ${style.color} rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300`}>
            {style.icon}
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          
          <p className="text-slate-500 text-sm font-medium mb-4 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all border-0 disabled:opacity-50 ${style.btnBg}`}
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
