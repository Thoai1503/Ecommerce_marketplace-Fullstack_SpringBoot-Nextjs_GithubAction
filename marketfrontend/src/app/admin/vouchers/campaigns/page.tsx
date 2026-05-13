"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useVouchers } from "@/hooks/admin/useVouchers";
import {
  ChevronLeft,
  Megaphone,
  CalendarClock,
  Sparkles,
  BadgeCheck,
  PauseCircle,
  CircleDashed,
} from "lucide-react";

export default function VoucherCampaignsPage() {
  const router = useRouter();
  const { campaigns, isLoading } = useVouchers();

  const campaignStatusClass = (status: string) => {
    if (status === "ACTIVE")
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (status === "PAUSED")
      return "bg-amber-100 text-amber-700 border border-amber-200";
    if (status === "DRAFT")
      return "bg-slate-100 text-slate-700 border border-slate-200";
    return "bg-blue-100 text-blue-700 border border-blue-200";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/vouchers")}
            className="p-2 rounded-xl border border-slate-200 bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Megaphone size={22} className="text-orange-600" />
              Voucher Campaigns
            </h1>
            <p className="text-sm text-slate-500">Quan ly danh sach campaign</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase font-bold text-slate-500">
            Tong campaign
          </p>
          <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <CircleDashed size={18} className="text-slate-500" />
            {campaigns.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-600" /> Dang active
          </p>
          <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <BadgeCheck size={18} className="text-emerald-600" />
            {campaigns.filter((c) => c.status === "ACTIVE").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2">
            <CalendarClock size={14} className="text-blue-600" /> Tam dung
          </p>
          <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <PauseCircle size={18} className="text-amber-600" />
            {campaigns.filter((c) => c.status === "PAUSED").length}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
              <th className="px-4 py-3 text-[10px] uppercase font-black text-slate-400">
                Code
              </th>
              <th className="px-4 py-3 text-[10px] uppercase font-black text-slate-400">
                Name
              </th>
              <th className="px-4 py-3 text-[10px] uppercase font-black text-slate-400">
                Duration
              </th>
              <th className="px-4 py-3 text-[10px] uppercase font-black text-slate-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={4}>
                  No campaign data
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 text-sm font-black text-slate-800">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-700">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {new Date(c.startAt).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(c.endAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-xs font-black">
                    <span
                      className={`px-2 py-1 rounded-lg ${campaignStatusClass(c.status)}`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
