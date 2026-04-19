"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useVoucherDetail } from "@/hooks/admin/useVouchers";
import {
  ChevronLeft,
  Edit3,
  Activity,
  CalendarClock,
  Sparkles,
  ShieldCheck,
  GitBranch,
  History,
  ListChecks,
  Settings2,
  BadgeCheck,
  CircleDot,
  AlertTriangle,
} from "lucide-react";

const discountLabel = (v: any) => {
  if (v.discountType === "PERCENT") return `${v.discountPercent || 0}%`;
  if (v.discountType === "FIXED")
    return `${Number(v.discountAmount || 0).toLocaleString()}d`;
  if (v.discountType === "FREE_SHIPPING") return "Free Shipping";
  return "Gift Item";
};

export default function VoucherDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { voucher, redemptions, audits, isLoading } = useVoucherDetail(id);

  if (isLoading) return <div className="p-20 text-center">Loading...</div>;
  if (!voucher)
    return (
      <div className="p-20 text-center text-slate-400 font-bold">
        Voucher not found
      </div>
    );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="relative rounded-3xl p-6 border border-blue-100 bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-200/30" />
        <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-cyan-200/30" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/vouchers")}
              className="p-2 rounded-xl border border-slate-200 bg-white"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Voucher Profile
              </p>
              <h1 className="text-2xl font-black text-slate-800">
                {voucher.title}
              </h1>
              <p className="text-sm text-slate-500 font-bold">{voucher.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/vouchers/${voucher.id}/rules`)}
              className="px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center gap-2"
            >
              <Settings2 size={16} /> Rule Builder
            </button>
            <button
              onClick={() => router.push(`/admin/vouchers/${voucher.id}/edit`)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold flex items-center gap-2"
            >
              <Edit3 size={16} /> Edit
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-[11px] text-slate-500 font-bold uppercase">
              Status
            </p>
            <p className="text-lg font-black text-slate-800 mt-1 flex items-center gap-1">
              <BadgeCheck size={16} className="text-emerald-600" />
              {voucher.status}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-[11px] text-slate-500 font-bold uppercase">
              Redeemed
            </p>
            <p className="text-lg font-black text-slate-800 mt-1">
              {voucher.redeemedCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-[11px] text-slate-500 font-bold uppercase">
              Claimed
            </p>
            <p className="text-lg font-black text-slate-800 mt-1">
              {voucher.claimedCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-[11px] text-slate-500 font-bold uppercase">
              Priority
            </p>
            <p className="text-lg font-black text-slate-800 mt-1">
              {voucher.priority}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <Sparkles size={15} className="text-cyan-600" /> General
          </h3>
          <p className="text-sm">
            <span className="font-bold">Issuer:</span> {voucher.issuerType}{" "}
            {voucher.issuerName ? `- ${voucher.issuerName}` : ""}
          </p>
          <p className="text-sm">
            <span className="font-bold">Campaign:</span>{" "}
            {voucher.campaignCode || "N/A"}
          </p>
          <p className="text-sm">
            <span className="font-bold">Status:</span> {voucher.status}
          </p>
          <p className="text-sm">
            <span className="font-bold">Priority:</span> {voucher.priority}
          </p>
          <p className="text-sm">
            <span className="font-bold">Stackable:</span>{" "}
            {voucher.stackable ? "Yes" : "No"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <ShieldCheck size={15} className="text-indigo-600" />
            Discount and Quota
          </h3>
          <p className="text-sm">
            <span className="font-bold">Discount:</span>{" "}
            {discountLabel(voucher)}
          </p>
          <p className="text-sm">
            <span className="font-bold">Min order:</span>{" "}
            {Number(voucher.minOrderValue).toLocaleString()}d
          </p>
          <p className="text-sm">
            <span className="font-bold">Quota:</span> {voucher.redeemedCount}/
            {voucher.totalQuota} redeemed
          </p>
          <p className="text-sm">
            <span className="font-bold">Claimed:</span> {voucher.claimedCount}
          </p>
          <p className="text-sm">
            <span className="font-bold">Per user:</span> {voucher.perUserQuota}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 md:col-span-2">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <CalendarClock size={15} className="text-blue-600" /> Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p>
              <span className="font-bold">Claim:</span>{" "}
              {new Date(voucher.claimStartAt).toLocaleString("vi-VN")} -{" "}
              {new Date(voucher.claimEndAt).toLocaleString("vi-VN")}
            </p>
            <p>
              <span className="font-bold">Valid:</span>{" "}
              {new Date(voucher.validFrom).toLocaleString("vi-VN")} -{" "}
              {new Date(voucher.validTo).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 md:col-span-2">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <Activity size={15} className="text-emerald-600" /> Redemption
            Timeline
          </h3>
          <div className="space-y-2">
            {redemptions.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <CircleDot size={13} className="text-cyan-600" />
                    {item.orderCode} - {item.userName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.redeemedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Discount applied</p>
                  <p className="text-sm font-black text-slate-800">
                    {item.discountAmountApplied.toLocaleString()}d
                  </p>
                  <span className="text-[11px] font-bold text-blue-700 px-2 py-1 rounded-md bg-white border border-slate-200 inline-block mt-1">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
            {redemptions.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 p-3 text-sm font-medium flex items-center gap-2">
                <AlertTriangle size={14} /> Chua co redemption data cho voucher
                nay.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 md:col-span-2">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <History size={15} className="text-violet-600" /> Audit Log
          </h3>
          <div className="space-y-2">
            {audits.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <ListChecks size={14} className="text-violet-600" />
                    {log.eventType}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {log.actorType} - {log.actorName}
                </p>
                {log.note && (
                  <p className="text-xs text-slate-500 mt-1">{log.note}</p>
                )}
              </div>
            ))}
            {audits.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 p-3 text-sm font-medium flex items-center gap-2">
                <AlertTriangle size={14} /> Chua co audit log cho voucher nay.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:col-span-2">
          <button
            onClick={() => router.push(`/admin/vouchers/${voucher.id}/rules`)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2"
          >
            <GitBranch size={16} /> Mo Rule Builder de cau hinh scope va segment
          </button>
        </div>
      </div>
    </div>
  );
}
