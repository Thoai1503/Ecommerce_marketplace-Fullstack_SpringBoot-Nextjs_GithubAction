"use client";

import React, { useState, useMemo } from "react";
import { X, Minus, Plus, Trash2, Save, ShoppingBag } from "lucide-react";
import { Order, OrderItem } from "@/types/index";
import { useUpdateOrderItems } from "@/hooks/admin/useOrders";
import { useToast } from "@/context/ToastContext";

interface EditItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess: () => void;
}

// Translate common backend errors to Vietnamese
const extractErrorMessage = (e: any, fallback: string): string => {
  const data = e?.response?.data;
  if (typeof data === "object" && data?.message) return data.message;
  if (typeof data === "string" && data) {
    if (/SQLException|SQL|java\./i.test(data)) return fallback;
    return data;
  }
  return e?.message || fallback;
};

export default function EditItemsModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: EditItemsModalProps) {
  const [items, setItems] = useState<OrderItem[]>(order.items || []);
  const toast = useToast();
  const updateItemsMutation = useUpdateOrderItems();
  const isSaving = updateItemsMutation.isPending;

  // Tính toán lại tổng tiền khi items thay đổi
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  if (!isOpen) return null;

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast.error("Đơn hàng phải có ít nhất 1 sản phẩm.");
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!items.length) {
      toast.error("Đơn hàng phải có ít nhất 1 sản phẩm.");
      return;
    }
    for (const it of items) {
      if (!it.quantity || it.quantity < 1) {
        toast.error(`Số lượng "${it.productName}" phải >= 1.`);
        return;
      }
    }

    try {
      await updateItemsMutation.mutateAsync({
        id: order.id,
        items: items.map((it: any) => ({
          itemId: it.id,
          productId: it.productId ?? it.product_id ?? it.id,
          variantId: it.variantId ?? it.variant_id ?? null,
          quantity: it.quantity,
          price: it.price,
        })),
      });
      toast.success("Cập nhật sản phẩm đơn hàng thành công!");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(extractErrorMessage(e, "Cập nhật sản phẩm đơn hàng thất bại"));
    }
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
              <h3 className="text-lg font-bold text-slate-800">
                Chỉnh sửa sản phẩm
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {order.orderCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 border-0 bg-transparent transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-blue-600 font-black mt-1">
                    {item.price.toLocaleString()}₫
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-0 bg-transparent"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="w-24 text-right">
                    <p className="text-sm font-black text-slate-900">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </p>
                  </div>

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
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Tổng tiền mới:
            </span>
            <span className="text-2xl font-black text-blue-600">
              {subtotal.toLocaleString()}₫
            </span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || items.length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                "Đang cập nhật..."
              ) : (
                <>
                  <Save size={18} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
