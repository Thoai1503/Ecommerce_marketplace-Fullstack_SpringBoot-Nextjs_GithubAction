"use client";

import React from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface SellerPaymentPreview {
  sellerName: string;
  period: string;
  revenue: number;
  commissionRate: number;
  commission: number;
  amount: number;
}

interface ApprovePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment: SellerPaymentPreview;
  isProcessing: boolean;
}

export default function ApprovePaymentModal({
  isOpen,
  onClose,
  onConfirm,
  payment,
  isProcessing,
}: ApprovePaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <CheckCircle size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Duyệt thanh toán?
          </h3>

          <p className="text-slate-500 text-sm font-medium mb-6">
            Xác nhận thanh toán hoa hồng cho đối tác.
          </p>

          <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-bold">Đối tác:</span>
              <span className="text-slate-800 font-bold">
                {payment.sellerName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-bold">Kỳ đối soát:</span>
              <span className="text-slate-800 font-bold">{payment.period}</span>
            </div>
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-bold">Doanh thu:</span>
              <span className="text-slate-700">
                {payment.revenue.toLocaleString()}₫
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-bold">
                Hoa hồng ({payment.commissionRate}%):
              </span>
              <span className="text-red-500">
                -{payment.commission.toLocaleString()}₫
              </span>
            </div>
            <div className="flex justify-between text-lg mt-2 pt-2 border-t border-slate-200">
              <span className="text-slate-800 font-black">Thực nhận:</span>
              <span className="text-blue-600 font-black">
                {payment.amount.toLocaleString()}₫
              </span>
            </div>
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2 text-left w-full">
            <AlertCircle size={16} className="shrink-0" />
            Hệ thống sẽ ghi nhận thanh toán và gửi thông báo cho Seller.
          </p>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0 disabled:opacity-70"
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
}
