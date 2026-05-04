"use client";

import { useState } from "react";
import { Bot, ShieldAlert } from "lucide-react";
import { Product } from "@/types";
import { useToast } from "@/context/ToastContext";
import { useFraudCheck } from "@/hooks/admin/useFraudCheck";
import FraudCheckDetailModal from "./FraudCheckDetailModal";

type AIFraudWarningProps = {
  product: Product;
};

const recommendationLabel = (value: string) => {
  if (value === "reject") return "Nên từ chối";
  if (value === "review") return "Review kỹ";
  return "Có thể duyệt";
};

export default function AIFraudWarning({ product }: AIFraudWarningProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const toast = useToast();
  const { data, isLoading, isError, rerun, isRerunning } = useFraudCheck(
    product.id,
    product.status === "PENDING",
  );

  if (product.status !== "PENDING") return null;

  if (isLoading) {
    return <div className="mb-4 h-24 animate-pulse rounded-2xl bg-white/70" />;
  }

  if (isError) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-200 bg-white p-3 text-xs font-semibold text-amber-700">
        Không tải được phân tích rủi ro.
      </div>
    );
  }

  if (!data || data.fraudScore < 30) return null;

  const highRisk = data.fraudScore >= 61;
  const color = highRisk
    ? "border-red-300 bg-red-50 text-red-800"
    : "border-amber-300 bg-amber-50 text-amber-800";

  const handleRerun = async () => {
    try {
      await rerun();
      toast.success("Đã chạy lại phân tích rủi ro");
    } catch {
      toast.error("Không thể chạy lại phân tích");
    }
  };

  return (
    <>
      <div className={`mb-4 rounded-2xl border-2 p-4 ${color} ${highRisk ? "animate-pulse" : ""}`}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white/70 p-2">
            {highRisk ? <ShieldAlert size={20} /> : <Bot size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-black">AI Fraud Detection</h4>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span>Risk Score</span>
                <span>{data.fraudScore}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className={highRisk ? "h-full bg-red-600" : "h-full bg-amber-500"}
                  style={{ width: `${data.fraudScore}%` }}
                />
              </div>
            </div>
            <p className="mt-2 text-xs font-bold">Khuyến nghị: {recommendationLabel(data.recommendation)}</p>
            <ul className="mt-3 space-y-1">
              {data.concerns.slice(0, 3).map((concern) => (
                <li key={concern} className="text-xs leading-relaxed">• {concern}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setIsDetailOpen(true)}
              className="mt-3 text-xs font-black underline underline-offset-4"
            >
              Xem phân tích chi tiết
            </button>
          </div>
        </div>
      </div>

      <FraudCheckDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        fraudCheck={data}
        onRerun={handleRerun}
        isRerunning={isRerunning}
      />
    </>
  );
}
