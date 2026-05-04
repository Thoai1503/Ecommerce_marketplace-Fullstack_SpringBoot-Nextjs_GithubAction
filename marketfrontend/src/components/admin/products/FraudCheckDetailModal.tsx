"use client";

import { useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import { FraudCheckResult } from "@/services/productFraud";

type FraudCheckDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fraudCheck: FraudCheckResult;
  onRerun: () => Promise<void>;
  isRerunning?: boolean;
};

const recommendationLabel = (value: string) => {
  if (value === "reject") return "Nên từ chối";
  if (value === "review") return "Cần kiểm tra kỹ";
  return "Có thể duyệt";
};

export default function FraudCheckDetailModal({
  isOpen,
  onClose,
  fraudCheck,
  onRerun,
  isRerunning = false,
}: FraudCheckDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-black text-slate-800">Phân tích rủi ro</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {recommendationLabel(fraudCheck.recommendation)} • {fraudCheck.fraudScore}/100
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Dấu hiệu</p>
            <div className="space-y-2">
              {fraudCheck.triggeredRules?.length ? (
                fraudCheck.triggeredRules.map((rule) => (
                  <div key={rule.rule} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-800">{rule.message}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      {rule.rule} • {rule.severity} • +{rule.score}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-slate-500">Không có rule nào bị kích hoạt.</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Lý giải</p>
            <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700">
              {fraudCheck.reasoning || "Chưa có phân tích chi tiết."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-5">
          <button
            onClick={onRerun}
            disabled={isRerunning}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60"
          >
            <RefreshCw size={16} className={isRerunning ? "animate-spin" : ""} />
            Chạy lại phân tích
          </button>
        </div>
      </div>
    </div>
  );
}
