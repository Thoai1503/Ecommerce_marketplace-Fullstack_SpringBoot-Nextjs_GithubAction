"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { ProductStats } from "@/services/productStats";

type ViewsCardProps = {
  views: ProductStats["views"];
};

export default function ViewsCard({ views }: ViewsCardProps) {
  return (
    <div className="rounded-lg border border-cyan-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Lượt xem</p>
      <p className="mt-2 text-2xl font-black text-slate-800">{views.total.toLocaleString("vi-VN")}</p>
      <p className="mt-1 text-xs font-bold text-cyan-700">
        {views.uniqueVisitors.toLocaleString("vi-VN")} khách truy cập duy nhất
      </p>
      <div className="mt-4 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={views.trend}>
            <Tooltip labelFormatter={(label) => `Ngày ${label}`} />
            <Line type="monotone" dataKey="value" stroke="#0891b2" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
