"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ProductStats } from "@/services/productStats";

type OrdersCardProps = {
  orders: ProductStats["orders"];
  viewsTotal: number;
};

const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function OrdersCard({ orders, viewsTotal }: OrdersCardProps) {
  const data = labels.map((label, index) => ({ label, value: orders.byDayOfWeek[index] ?? 0 }));
  const conversion = viewsTotal > 0 ? (orders.total / viewsTotal) * 100 : 0;

  return (
    <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Đơn hàng</p>
      <p className="mt-2 text-2xl font-black text-slate-800">{orders.total.toLocaleString("vi-VN")}</p>
      <p className="mt-1 text-xs font-bold text-blue-600">Tỷ lệ chuyển đổi: {conversion.toFixed(1)}%</p>
      <div className="mt-4 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
