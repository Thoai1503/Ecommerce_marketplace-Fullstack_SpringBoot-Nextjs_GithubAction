"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useVouchers } from "@/hooks/admin/useVouchers";
import { VoucherStatus } from "@/types";
import { useToast } from "@/context/ToastContext";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  PauseCircle,
  PlayCircle,
  Trash2,
  Ticket,
  Calendar,
  BarChart3,
  Layers,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  Gauge,
  BadgeCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const STATUS_OPTIONS: Array<"ALL" | VoucherStatus> = [
  "ALL",
  "ACTIVE",
  "DRAFT",
  "PAUSED",
  "DEPLETED",
  "EXPIRED",
  "ARCHIVED",
];

const STATUS_STYLE: Record<VoucherStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border border-slate-200",
  ACTIVE: "bg-green-100 text-green-700 border border-green-200",
  PAUSED: "bg-amber-100 text-amber-700 border border-amber-200",
  EXPIRED: "bg-rose-100 text-rose-700 border border-rose-200",
  DEPLETED: "bg-orange-100 text-orange-700 border border-orange-200",
  ARCHIVED: "bg-purple-100 text-purple-700 border border-purple-200",
};

const renderDiscount = (voucher: any) => {
  if (voucher.discountType === "PERCENT")
    return `${voucher.discountPercent || 0}%`;
  if (voucher.discountType === "FIXED")
    return `${Number(voucher.discountAmount || 0).toLocaleString()}d`;
  if (voucher.discountType === "FREE_SHIPPING") return "Free Shipping";
  return "Gift Item";
};

export default function VouchersPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    vouchers,
    stats,
    isLoading,
    deleteVoucher,
    updateStatus,
    isDeleting,
    isUpdatingStatus,
  } = useVouchers();

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | VoucherStatus>(
    "ALL",
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const filtered = useMemo(() => {
    return vouchers.filter((v) => {
      const hitStatus = statusFilter === "ALL" || v.status === statusFilter;
      const q = keyword.toLowerCase();
      const hitText =
        v.code.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        (v.campaignCode || "").toLowerCase().includes(q) ||
        (v.issuerName || "").toLowerCase().includes(q);
      return hitStatus && hitText;
    });
  }, [vouchers, statusFilter, keyword]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVoucher(deleteTarget.id);
      toast.success("Da xoa voucher thanh cong");
      setDeleteTarget(null);
    } catch {
      toast.error("Khong the xoa voucher");
    }
  };

  const toggleStatus = async (id: string, current: VoucherStatus) => {
    const next = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await updateStatus({ id, status: next });
      toast.success(`Da chuyen trang thai sang ${next}`);
    } catch {
      toast.error("Cap nhat trang thai that bai");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xoa voucher?"
        description={
          deleteTarget ? `Ban chac chan muon xoa ${deleteTarget.title}?` : ""
        }
        confirmLabel="Xoa"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles size={22} className="text-cyan-600" />
              Voucher Management
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Quan ly voucher theo mo hinh Voucher V2
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin/vouchers/campaigns")}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2"
            >
              <Layers size={16} /> Campaigns
            </button>
            <button
              onClick={() => router.push("/admin/vouchers/analytics")}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2"
            >
              <BarChart3 size={16} /> Analytics
            </button>
            <button
              onClick={() => router.push("/admin/vouchers/new")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center gap-2"
            >
              <Plus size={16} /> Tao voucher
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
          : [
              {
                label: "Tong voucher",
                value: stats?.totalVouchers ?? 0,
                icon: Ticket,
                accent: "from-cyan-500 to-blue-500",
              },
              {
                label: "Dang active",
                value: stats?.activeVouchers ?? 0,
                icon: BadgeCheck,
                accent: "from-emerald-500 to-green-500",
              },
              {
                label: "Redemption rate",
                value: `${stats?.redemptionRate ?? 0}%`,
                icon: Gauge,
                accent: "from-indigo-500 to-blue-500",
              },
              {
                label: "Tong giam gia (fixed)",
                value: `${Number(stats?.totalDiscountAmount || 0).toLocaleString()}d`,
                icon: Wallet,
                accent: "from-amber-500 to-orange-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    {item.label}
                  </p>
                  <item.icon size={16} className="text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-800 mt-2">
                  {item.value}
                </p>
              </div>
            ))}
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tim theo code, title, campaign, issuer..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1 md:mr-2">
            <Filter size={13} /> Loc nhanh
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-bold rounded-lg ${statusFilter === s ? "bg-white text-slate-800" : "text-slate-500"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="text-left border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-[10px] uppercase text-slate-400 font-black">
                  Voucher
                </th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-400 font-black">
                  Issuer
                </th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-400 font-black">
                  Discount
                </th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-400 font-black">
                  Quota
                </th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-400 font-black">
                  Validity
                </th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-400 font-black">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] uppercase text-slate-400 font-black text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 font-bold"
                  >
                    Khong co voucher phu hop
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {v.code}
                        </p>
                        <p className="text-xs text-slate-500">{v.title}</p>
                        {v.campaignCode && (
                          <p className="text-[11px] text-blue-600 font-bold mt-1">
                            {v.campaignCode}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700">
                      {v.issuerType} {v.issuerName ? `- ${v.issuerName}` : ""}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700">
                      {renderDiscount(v)}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600">
                      {v.redeemedCount}/{v.totalQuota} redeemed
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {new Date(v.validFrom).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(v.validTo).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black ${STATUS_STYLE[v.status]}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                          onClick={() => router.push(`/admin/vouchers/${v.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-cyan-50 text-slate-500 hover:text-cyan-600"
                          onClick={() =>
                            router.push(`/admin/vouchers/${v.id}/rules`)
                          }
                          title="Rule builder"
                        >
                          <SlidersHorizontal size={15} />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600"
                          onClick={() =>
                            router.push(`/admin/vouchers/${v.id}/edit`)
                          }
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
                          disabled={isUpdatingStatus}
                          onClick={() => toggleStatus(v.id, v.status)}
                        >
                          {v.status === "ACTIVE" ? (
                            <PauseCircle size={15} />
                          ) : (
                            <PlayCircle size={15} />
                          )}
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                          onClick={() =>
                            setDeleteTarget({ id: v.id, title: v.title })
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
