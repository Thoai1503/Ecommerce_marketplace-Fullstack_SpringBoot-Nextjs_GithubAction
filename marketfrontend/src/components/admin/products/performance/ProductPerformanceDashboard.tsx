"use client";

import { useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Product } from "@/types";
import { useProductStats } from "@/hooks/admin/useProductStats";
import RevenueCard from "./RevenueCard";
import OrdersCard from "./OrdersCard";
import ViewsCard from "./ViewsCard";
import StockVelocityCard from "./StockVelocityCard";

type ProductPerformanceDashboardProps = {
  product: Product;
};

const ranges = [
  { label: "7 ngày", value: 7 },
  { label: "30 ngày", value: 30 },
  { label: "90 ngày", value: 90 },
  { label: "1 năm", value: 365 },
];

export default function ProductPerformanceDashboard({ product }: ProductPerformanceDashboardProps) {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, refetch, isFetching } = useProductStats(
    product.id,
    days,
    product.status === "APPROVED",
  );

  if (product.status !== "APPROVED") return null;

  const hasData = data
    ? data.revenue.total > 0 || data.orders.total > 0 || data.views.total > 0
    : false;

  return (
    <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-600">
            <BarChart3 size={18} /> Hiệu suất sản phẩm
          </h3>
          <p className="mt-1 text-xs text-slate-500">Theo dõi doanh thu, đơn hàng và lượt xem.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10"
          >
            {ranges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Không tải được dữ liệu hiệu suất. Vui lòng thử lại sau.
        </div>
      )}

      {data && !isLoading && !isError && !hasData && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500">
          Chưa có dữ liệu trong {days} ngày qua.
        </div>
      )}

      {data && !isLoading && !isError && hasData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <RevenueCard revenue={data.revenue} />
          <OrdersCard orders={data.orders} viewsTotal={data.views.total} />
          <ViewsCard views={data.views} />
          <StockVelocityCard stockVelocity={data.stockVelocity} />
        </div>
      )}
    </section>
  );
}
