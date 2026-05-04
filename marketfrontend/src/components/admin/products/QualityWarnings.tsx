"use client";

import { AlertTriangle, CheckCircle2, Info, Search } from "lucide-react";
import { Product } from "@/types";
import {
  checkProductQuality,
  QualityIssue,
  QualityIssueSeverity,
} from "@/lib/productQualityCheck";

type QualityWarningsProps = {
  product: Product;
  issues?: QualityIssue[];
};

const severityStyle: Record<
  QualityIssueSeverity,
  { row: string; icon: string; label: string }
> = {
  critical: {
    row: "bg-red-50 border-red-200 text-red-800",
    icon: "bg-red-100 text-red-700",
    label: "Nghiêm trọng",
  },
  warning: {
    row: "bg-amber-50 border-amber-200 text-amber-800",
    icon: "bg-amber-100 text-amber-700",
    label: "Cảnh báo",
  },
  info: {
    row: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "bg-blue-100 text-blue-700",
    label: "Gợi ý",
  },
};

const iconBySeverity: Record<QualityIssueSeverity, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

function scrollToField(field: string) {
  const target = document.querySelector(`[data-quality-field="${field}"]`);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.classList.add("ring-4");
  window.setTimeout(() => target.classList.remove("ring-4"), 1200);
}

export default function QualityWarnings({ product, issues }: QualityWarningsProps) {
  const qualityIssues = issues ?? checkProductQuality(product);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700">
          <Search size={15} /> Phân tích chất lượng
        </h4>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
          {qualityIssues.length} vấn đề
        </span>
      </div>

      {qualityIssues.length === 0 ? (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span className="font-semibold">Không phát hiện vấn đề rõ ràng</span>
        </div>
      ) : (
        <div className="space-y-2">
          {qualityIssues.map((issue) => {
            const Icon = iconBySeverity[issue.severity];
            const style = severityStyle[issue.severity];

            return (
              <button
                key={issue.code}
                type="button"
                onClick={() => scrollToField(issue.field)}
                className={`w-full rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${style.row}`}
              >
                <div className="flex gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.icon}`}
                    title={style.label}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black">{issue.message}</span>
                    <span className="mt-1 block text-xs leading-relaxed opacity-85">
                      Gợi ý: {issue.suggestion}
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
