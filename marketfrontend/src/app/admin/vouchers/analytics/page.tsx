"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVouchers } from "@/hooks/admin/useVouchers";
import {
  ChevronLeft,
  PieChart,
  Trophy,
  Flame,
  CircleDollarSign,
  BarChart4,
  Target,
  Activity,
} from "lucide-react";

export default function VoucherAnalyticsPage() {
  const router = useRouter();
  const { vouchers, isLoading } = useVouchers();

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    vouchers.forEach((v) => {
      map[v.discountType] = (map[v.discountType] || 0) + 1;
    });
    return Object.entries(map);
  }, [vouchers]);

  const topRedeem = useMemo(() => {
    return [...vouchers]
      .sort((a, b) => b.redeemedCount - a.redeemedCount)
      .slice(0, 10);
  }, [vouchers]);

  const totalRedeemed = useMemo(
    () => vouchers.reduce((sum, v) => sum + v.redeemedCount, 0),
    [vouchers],
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/vouchers")}
            className="p-2 rounded-xl border border-slate-200 bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <PieChart size={22} className="text-indigo-600" />
              Voucher Analytics
            </h1>
            <p className="text-sm text-slate-500">
              Thong ke tong quan voucher cho admin
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs uppercase font-bold text-slate-500">
                Tong voucher
              </p>
              <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
                <BarChart4 size={18} className="text-indigo-600" />{" "}
                {vouchers.length}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs uppercase font-bold text-slate-500">
                Tong redeemed
              </p>
              <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />{" "}
                {totalRedeemed}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs uppercase font-bold text-slate-500">
                Top performer
              </p>
              <p className="text-sm font-black text-slate-800 mt-2 flex items-center gap-2 truncate">
                <Target size={16} className="text-amber-600" />{" "}
                {topRedeem[0]?.code || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                <CircleDollarSign size={15} className="text-emerald-600" />
                Voucher by discount type
              </h3>
              <div className="space-y-2">
                {byType.map(([type, count]) => (
                  <div
                    key={type}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">
                        {type}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {count}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                        style={{
                          width: `${Math.max(6, (count / Math.max(vouchers.length, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                <Trophy size={15} className="text-amber-600" />
                Top redeemed vouchers
              </h3>
              <div className="space-y-2">
                {topRedeem.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <p className="text-sm font-black text-slate-800">
                      {v.code}
                    </p>
                    <p className="text-xs text-slate-500">{v.title}</p>
                    <p className="text-xs font-bold text-blue-700 mt-1 flex items-center gap-1">
                      <Flame size={12} className="text-orange-500" />
                      Redeemed: {v.redeemedCount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
