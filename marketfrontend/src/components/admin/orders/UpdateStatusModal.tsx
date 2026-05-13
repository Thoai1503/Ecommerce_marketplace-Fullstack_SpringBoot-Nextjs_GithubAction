
"use client";

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types/index';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
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

export default function UpdateStatusModal({ isOpen, onClose, order }: UpdateStatusModalProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleUpdate = () => {
    // In a real app, call API here
    console.log(`Updating ${order.id} to ${newStatus} with note: ${note}`);
    onClose();
  };

  const nextSteps = ALLOWED_TRANSITIONS[order.status];

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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
            >
              <option value={order.status} disabled>-- Chọn trạng thái --</option>
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
            disabled={newStatus === order.status || nextSteps.length === 0}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0"
          >
            Cập nhật ngay
          </button>
        </div>
      </div>
    </div>
  );
}
