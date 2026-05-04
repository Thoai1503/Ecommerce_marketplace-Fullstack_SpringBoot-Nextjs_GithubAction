"use client";

import { ProductStats } from "@/services/productStats";

type StockVelocityCardProps = {
  stockVelocity: ProductStats["stockVelocity"];
};

export default function StockVelocityCard({ stockVelocity }: StockVelocityCardProps) {
  const stockBase = Math.max(stockVelocity.currentStock + stockVelocity.avgPerDay * 30, 1);
  const stockPercent = Math.min(100, Math.round((stockVelocity.currentStock / stockBase) * 100));

  return (
    <div className="rounded-lg border border-amber-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Tốc độ bán</p>
      <p className="mt-2 text-2xl font-black text-slate-800">{stockVelocity.avgPerDay.toFixed(1)} SP/ngày</p>
      <p className="mt-1 text-xs font-bold text-amber-700">
        {stockVelocity.daysRemaining ? `Hết hàng trong khoảng ${stockVelocity.daysRemaining} ngày` : "Chưa đủ dữ liệu dự báo"}
      </p>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Tồn kho hiện tại</span>
          <span>{stockVelocity.currentStock.toLocaleString("vi-VN")} SP</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${stockPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
