"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { ProductStats } from "@/services/productStats";

type RevenueCardProps = {
  revenue: ProductStats["revenue"];
};

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export default function RevenueCard({ revenue }: RevenueCardProps) {
  const percent = Math.round(revenue.comparePrev * 100);

  return (
    <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Doanh thu</p>
      <p className="mt-2 text-2xl font-black text-slate-800">{currency(revenue.total)}</p>
      <p className={`mt-1 text-xs font-bold ${percent >= 0 ? "text-emerald-600" : "text-red-600"}`}>
        {percent >= 0 ? "Tăng" : "Giảm"} {Math.abs(percent)}% so với kỳ trước
      </p>
      <div className="mt-4 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenue.trend}>
            <Tooltip formatter={(value) => currency(Number(value))} labelFormatter={(label) => `Ngày ${label}`} />
            <Area type="monotone" dataKey="value" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
