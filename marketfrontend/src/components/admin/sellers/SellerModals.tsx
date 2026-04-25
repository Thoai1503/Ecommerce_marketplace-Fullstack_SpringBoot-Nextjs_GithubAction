
"use client";

import React, { useState, useEffect } from 'react';
import { X, Ban, Unlock, Trash2, AlertTriangle, Package, ShoppingCart, ThumbsUp, RotateCcw, Loader2 } from 'lucide-react';

// --- BLOCK / UNBLOCK MODAL ---
interface BlockSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Khi khóa: reason bắt buộc. Khi mở khóa: reason bỏ qua. */
  onConfirm: (reason?: string) => void;
  sellerName: string;
  isBlocked: boolean; // True if currently blocked (so action is Unblock)
  /** Số sản phẩm đang active sẽ bị ẩn khi khóa */
  productCount?: number;
  /** Số đơn đang xử lý */
  pendingOrderCount?: number;
  isSubmitting?: boolean;
}

const BLOCK_REASON_PRESETS = [
  'Vi phạm chính sách bán hàng',
  'Nhiều khiếu nại từ khách hàng chưa xử lý',
  'Gian lận / Hàng giả, hàng nhái',
  'Không phản hồi hỗ trợ quá lâu',
];

export const BlockSellerModal = ({
  isOpen,
  onClose,
  onConfirm,
  sellerName,
  isBlocked,
  productCount = 0,
  pendingOrderCount = 0,
  isSubmitting = false,
}: BlockSellerModalProps) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (isBlocked) {
      onConfirm();
      return;
    }
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError('Vui lòng nhập lý do ít nhất 10 ký tự.');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 flex flex-col items-center text-center overflow-y-auto">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 ${isBlocked ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
            {isBlocked ? <Unlock size={32} /> : <Ban size={32} />}
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {isBlocked ? 'Mở khóa Nhà bán hàng?' : 'Khóa Nhà bán hàng?'}
          </h3>

          <p className="text-slate-500 text-sm font-medium mb-2">
            Bạn có chắc muốn {isBlocked ? 'mở khóa' : 'khóa'} đối tác này không?
          </p>

          <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-full truncate">
            "{sellerName}"
          </p>

          {!isBlocked && (
            <>
              {/* Impact summary */}
              <div className="w-full mt-4 grid grid-cols-2 gap-2">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-left">
                  <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-bold uppercase tracking-wide">
                    <Package size={12} /> Sản phẩm sẽ ẩn
                  </div>
                  <div className="text-lg font-black text-red-700 mt-0.5">{productCount}</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-left">
                  <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-bold uppercase tracking-wide">
                    <ShoppingCart size={12} /> Đơn cần review
                  </div>
                  <div className="text-lg font-black text-amber-700 mt-0.5">{pendingOrderCount}</div>
                </div>
              </div>

              {/* Warning */}
              <p className="text-xs text-red-500 mt-3 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 text-left w-full">
                <AlertTriangle size={16} className="shrink-0" />
                Sản phẩm sẽ bị ẩn khỏi storefront. Email thông báo sẽ được gửi cho nhà bán hàng.
              </p>

              {/* Reason textarea */}
              <div className="w-full mt-4 text-left">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Lý do khóa <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {BLOCK_REASON_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setReason(p); setError(''); }}
                      className="text-[11px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); if (error) setError(''); }}
                  rows={3}
                  maxLength={500}
                  placeholder="Mô tả cụ thể lý do khóa (gửi kèm trong email cho nhà bán hàng)..."
                  className={`w-full px-3 py-2 text-sm rounded-lg border-2 focus:outline-none focus:ring-2 ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-red-200 focus:border-red-400'}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {error ? (
                    <span className="text-[11px] text-red-600 font-bold">{error}</span>
                  ) : <span />}
                  <span className="text-[10px] text-slate-400">{reason.length}/500</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all border-0 disabled:opacity-60 ${
              isBlocked
                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
            }`}
          >
            {isSubmitting ? 'Đang xử lý...' : isBlocked ? 'Mở khóa ngay' : 'Khóa ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DELETE MODAL ---
interface DeleteSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sellerName?: string;
  count?: number;
}

export const DeleteSellerModal = ({ isOpen, onClose, onConfirm, sellerName, count = 1 }: DeleteSellerModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <Trash2 size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">Xóa Nhà bán hàng?</h3>
          
          <p className="text-slate-500 text-sm font-medium mb-2">
            Hành động này sẽ xóa dữ liệu nhà bán hàng khỏi hệ thống.
          </p>
          
          {sellerName && (
             <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-full truncate">
               "{sellerName}"
             </p>
          )}

          {count > 1 && (
             <p className="text-slate-800 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mt-2">
               Số lượng: {count} nhà bán hàng
             </p>
          )}

          <p className="text-xs text-amber-600 mt-4 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2 text-left">
            <AlertTriangle size={16} className="shrink-0" />
            Lưu ý: Dữ liệu sản phẩm và đơn hàng liên quan có thể bị ảnh hưởng.
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

// --- REOPEN SELLER MODAL ---
interface ReopenSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sellerName: string;
  rejectionReason?: string | null;
  isSubmitting?: boolean;
}

export const ReopenSellerModal = ({
  isOpen,
  onClose,
  onConfirm,
  sellerName,
  rejectionReason,
  isSubmitting = false,
}: ReopenSellerModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/80 hover:text-slate-700 transition-all disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <ThumbsUp size={26} />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Cho phép tái đăng ký?
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Nhà bán hàng sẽ được chuyển về trạng thái chờ duyệt.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Seller info */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nhà bán hàng</p>
            <p className="text-sm font-bold text-slate-800 truncate">{sellerName}</p>
          </div>

          {/* Current rejection reason */}
          {rejectionReason && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-1">Lý do từ chối trước đó</p>
              <p className="text-sm text-rose-700 font-medium leading-relaxed">{rejectionReason}</p>
            </div>
          )}

          {/* Impact summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw size={14} />
              Thay đổi sau khi xác nhận
            </p>
            <ul className="text-sm text-amber-900 font-medium space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Trạng thái: <b>REJECTED</b> → <b>PENDING</b></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Lý do từ chối sẽ bị <b>xoá</b></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Nhà bán hàng có thể cập nhật hồ sơ và gửi duyệt lại</span>
              </li>
            </ul>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-slate-400" />
            <span className="font-medium">
              Hành động này không gửi email tự động. Bạn nên liên hệ nhà bán hàng để hướng dẫn cập nhật hồ sơ.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent disabled:opacity-50"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all border-0 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <ThumbsUp size={16} />
                Xác nhận
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
