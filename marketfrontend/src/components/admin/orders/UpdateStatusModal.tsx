"use client";

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types/index';
import { useOrderDetail } from '@/hooks/admin/useOrders';
import { useToast } from '@/context/ToastContext';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess?: () => void;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['COMPLETED', 'CANCELED'],
  COMPLETED: ['REFUNDED'],
  CANCELED: [],
  REFUNDED: [],
};

const StatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị hàng',
  SHIPPED: 'Đã giao vận chuyển',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Hủy đơn hàng',
  REFUNDED: 'Hoàn tiền',
};

export default function UpdateStatusModal({ isOpen, onClose, order, onSuccess }: UpdateStatusModalProps) {
  const nextSteps = ALLOWED_TRANSITIONS[order.status];
  const [newStatus, setNewStatus] = useState<OrderStatus>(nextSteps[0] ?? order.status);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { updateStatus, cancelOrder, refundOrder } = useOrderDetail(order.id);
  const toast = useToast();

  if (!isOpen) return null;

  const handleUpdate = async () => {
    if (newStatus === order.status) return;
    setSubmitting(true);
    try {
      if (newStatus === 'CANCELED') {
        await cancelOrder(note?.trim() || 'Hủy bởi quản trị viên');
      } else if (newStatus === 'REFUNDED') {
        await refundOrder({ amount: order.totalAmount, reason: note?.trim() || 'Hoàn tiền' });
      } else {
        await updateStatus({ status: newStatus, note: note?.trim() || undefined });
      }
      toast.success(`Đã cập nhật trạng thái: ${StatusLabels[newStatus]}`);
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Cập nhật đơn hàng</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors border-0 bg-transparent">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-blue-500 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-bold text-blue-900">Đơn hàng: {order.orderCode}</p>
              <p className="text-xs text-blue-700 mt-1">Trạng thái hiện tại: <span className="font-bold uppercase">{StatusLabels[order.status]}</span></p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Trạng thái mới *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              disabled={nextSteps.length === 0}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
            >
              {nextSteps.length === 0 && <option>-- Không thể chuyển trạng thái --</option>}
              {nextSteps.map(status => (
                <option key={status} value={status}>{StatusLabels[status]}</option>
              ))}
            </select>
            {nextSteps.length === 0 && (
              <p className="text-xs text-red-500 font-medium">Không thể thay đổi trạng thái của đơn hàng này nữa.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Ghi chú (Tùy chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do thay đổi..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm"
            ></textarea>
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
            onClick={handleUpdate}
            disabled={submitting || newStatus === order.status || nextSteps.length === 0}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0"
          >
            {submitting ? 'Đang cập nhật...' : 'Cập nhật ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
