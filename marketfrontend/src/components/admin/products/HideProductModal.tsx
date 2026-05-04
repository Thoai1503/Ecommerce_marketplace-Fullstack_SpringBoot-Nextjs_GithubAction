"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, EyeOff, X } from "lucide-react";
import { z } from "zod";

interface HideProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  productName: string;
  isSubmitting?: boolean;
}

const hideReasonSchema = z
  .string()
  .trim()
  .min(5, "Lý do ẩn phải có ít nhất 5 ký tự")
  .max(500, "Lý do ẩn không được vượt quá 500 ký tự");

const quickReasons = [
  "Vi phạm quy định",
  "Hết hàng dài hạn",
  "Yêu cầu seller",
  "Vấn đề chất lượng",
];

export default function HideProductModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isSubmitting = false,
}: HideProductModalProps) {
  const [reason, setReason] = useState("");
  const validation = useMemo(() => hideReasonSchema.safeParse(reason), [reason]);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => setReason(""));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && validation.success) {
        onConfirm(validation.data);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onConfirm, validation]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!validation.success) return;
    await onConfirm(validation.data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <EyeOff className="text-slate-600" size={20} />
            Tạm ẩn sản phẩm
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg border-0 bg-transparent p-2 text-slate-400 transition-colors hover:bg-slate-100"
            title="Đóng (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Sản phẩm
            </p>
            <p className="line-clamp-1 text-sm font-bold text-slate-800">{productName}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Lý do ẩn <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="VD: Vi phạm quy định về hình ảnh sản phẩm..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-500/10"
              autoFocus
            />
            {!validation.success && reason.trim().length > 0 && (
              <p className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                <AlertTriangle size={12} />
                {validation.error.issues[0]?.message}
              </p>
            )}
            <p className="text-[11px] italic text-slate-400">
              Lý do này sẽ hiển thị cho seller và được lưu vào lịch sử kiểm duyệt.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickReasons.map((quickReason) => (
              <button
                key={quickReason}
                type="button"
                onClick={() => setReason(quickReason)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                {quickReason}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border-0 bg-transparent px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 disabled:opacity-60"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!validation.success || isSubmitting}
            className="rounded-xl border-0 bg-slate-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-500/20 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            title="Ctrl + Enter"
          >
            {isSubmitting ? "Đang ẩn..." : "Tạm ẩn sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}
