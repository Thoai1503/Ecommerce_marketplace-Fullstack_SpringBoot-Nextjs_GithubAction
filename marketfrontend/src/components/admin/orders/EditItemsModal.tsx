
"use client";

import React, { useState, useMemo } from 'react';
import { X, Minus, Plus, Trash2, Save, ShoppingBag } from 'lucide-react';
import { Order, OrderItem } from '@/types/index';
import { updateOrderItems } from '@/service/orders';

interface EditItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess: () => void;
}

export default function EditItemsModal({ isOpen, onClose, order, onSuccess }: EditItemsModalProps) {
  const [items, setItems] = useState<OrderItem[]>(order.items || []);
  const [isSaving, setIsSaving] = useState(false);

  // Tính toán lại tổng tiền khi items thay đổi
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  if (!isOpen) return null;

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      alert("Đơn hàng phải có ít nhất 1 sản phẩm.");
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateOrderItems(order.id, items, subtotal);
    if (success) {
      onSuccess();
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa sản phẩm</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{order.orderCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 border-0 bg-transparent transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.productName}</p>
                  <p className="text-xs text-blue-600 font-black mt-1">{item.price.toLocaleString()}₫</p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Quantity Controller */}
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal for item */}
                  <div className="w-24 text-right">
                    <p className="text-sm font-black text-slate-900">{(item.price * item.quantity).toLocaleString()}₫</p>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-0 bg-transparent"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tổng tiền mới:</span>
            <span className="text-2xl font-black text-blue-600">{subtotal.toLocaleString()}₫</span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-50"
            >
              {isSaving ? "Đang cập nhật..." : <><Save size={18} /> Lưu thay đổi</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
