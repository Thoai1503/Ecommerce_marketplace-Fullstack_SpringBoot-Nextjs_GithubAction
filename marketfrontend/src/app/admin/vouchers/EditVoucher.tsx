"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVoucherDetail } from "@/hooks/admin/useVouchers";
import { VoucherDiscountType, VoucherIssuerType, VoucherStatus } from "@/types";
import {
  ChevronLeft,
  Save,
  SlidersHorizontal,
  Sparkles,
  Tag,
  FileText,
  Store,
  Shield,
  Coins,
  Clock3,
  Ticket,
  CalendarClock,
} from "lucide-react";
import { z } from "zod";
import { useBrands } from "@/hooks/admin/useBrands";

const schema = z
  .object({
    code: z.string().min(3),
    title: z.string().min(3),
    issuerType: z.enum(["PLATFORM", "SHOP", "BRAND"]),
    discountType: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING", "GIFT_ITEM"]),
    discountPercent: z.number().nullable(),
    discountAmount: z.number().nullable(),
    minOrderValue: z.number().min(0),
    totalQuota: z.number().min(0),
    perUserQuota: z.number().min(1),
    claimStartAt: z.string().min(1),
    claimEndAt: z.string().min(1),
    validFrom: z.string().min(1),
    validTo: z.string().min(1),
    status: z.enum([
      "DRAFT",
      "ACTIVE",
      "PAUSED",
      "EXPIRED",
      "DEPLETED",
      "ARCHIVED",
    ]),
  })
  .superRefine((v, ctx) => {
    if (
      v.discountType === "PERCENT" &&
      (v.discountPercent === null ||
        v.discountPercent <= 0 ||
        v.discountPercent > 100)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountPercent"],
        message: "The percentage should be in the range of 1 to 100.",
      });
    }
    if (
      v.discountType === "FIXED" &&
      (v.discountAmount === null || v.discountAmount <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountAmount"],
        message: "Decreasing value must be > 0.",
      });
    }
    if (
      new Date(v.claimEndAt).getTime() <= new Date(v.claimStartAt).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["claimEndAt"],
        message: "claimEndAt must be after claimStartAt",
      });
    }
    if (new Date(v.validTo).getTime() < new Date(v.validFrom).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validTo"],
        message: "validTo must be >= validFrom",
      });
    }
  });

const toInputDateTime = (value: string) => {
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function EditVoucher() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = !!id;
  const router = useRouter();

  const {
    voucher,
    campaigns,
    isLoading,
    createVoucher,
    updateVoucher,
    isSaving,
  } = useVoucherDetail(id || "");

  const { brands = [] } = useBrands();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<any>({
    campaignId: null,
    code: "",
    title: "",
    description: "",
    issuerType: "PLATFORM" as VoucherIssuerType,
    issuerId: "",
    discountType: "PERCENT" as VoucherDiscountType,
    discountPercent: 10,
    discountAmount: null,
    maxDiscountAmount: null,
    minOrderValue: 0,
    maxOrderValue: null,
    totalQuota: 100,
    perUserQuota: 1,
    stackable: false,
    claimStartAt: "",
    claimEndAt: "",
    validFrom: "",
    validTo: "",
    status: "DRAFT" as VoucherStatus,
    priority: 100,
  });

  useEffect(() => {
    if (isEdit && voucher) {
      setForm({
        campaignId: voucher.campaignId || null,
        code: voucher.code,
        title: voucher.title,
        description: voucher.description || "",
        issuerType: voucher.issuerType,
        issuerId: voucher.issuerId || "",
        discountType: voucher.discountType,
        discountPercent: voucher.discountPercent,
        discountAmount: voucher.discountAmount,
        maxDiscountAmount: voucher.maxDiscountAmount,
        minOrderValue: voucher.minOrderValue,
        maxOrderValue: voucher.maxOrderValue,
        totalQuota: voucher.totalQuota,
        perUserQuota: voucher.perUserQuota,
        stackable: voucher.stackable,
        claimStartAt: toInputDateTime(voucher.claimStartAt),
        claimEndAt: toInputDateTime(voucher.claimEndAt),
        validFrom: toInputDateTime(voucher.validFrom),
        validTo: toInputDateTime(voucher.validTo),
        status: voucher.status,
        priority: voucher.priority,
      });
      return;
    }

    if (!isEdit) {
      const now = new Date();
      const end = new Date(now.getTime() + 7 * 86400000);
      setForm((prev: any) => ({
        ...prev,
        claimStartAt: toInputDateTime(now.toISOString()),
        claimEndAt: toInputDateTime(end.toISOString()),
        validFrom: toInputDateTime(now.toISOString()),
        validTo: toInputDateTime(end.toISOString()),
      }));
    }
  }, [isEdit, voucher]);

  const save = async () => {
    const toNullableNumber = (v: any) =>
      v === "" || v === null ? null : Number(v);
    const payload = {
      ...form,
      claimStartAt: form.claimStartAt + ":00",
      claimEndAt: form.claimEndAt + ":00",
      validFrom: form.validFrom + ":00",
      validTo: form.validTo + ":00",

      code: String(form.code).toUpperCase().trim(),
      title: String(form.title).trim(),

      issuerId:
        form.issuerType === "PLATFORM"
          ? null
          : !form.issuerId
            ? null
            : Number(form.issuerId),

      discountPercent:
        form.discountType === "PERCENT"
          ? toNullableNumber(form.discountPercent)
          : null,

      discountAmount:
        form.discountType === "FIXED"
          ? toNullableNumber(form.discountAmount)
          : null,

      maxDiscountAmount:
        form.discountType === "PERCENT"
          ? toNullableNumber(form.maxDiscountAmount)
          : null,

      minOrderValue: form.minOrderValue === "" ? 0 : Number(form.minOrderValue),
      totalQuota: Number(form.totalQuota || 0),
      perUserQuota: Number(form.perUserQuota || 1),

      claimedCount: 0,
      redeemedCount: 0,
      createdBy: 1,
    };
    console.log("TYPE discountPercent:", typeof payload.discountPercent);
    console.log("TYPE maxDiscountAmount:", typeof payload.maxDiscountAmount);
    console.log("PAYLOAD:", payload);

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        map[String(i.path[0])] = i.message;
      });
      setErrors(map);
      window.alert("Please check the form.");
      return;
    }

    try {
      if (isEdit) {
        await updateVoucher(payload);
        window.alert("Voucher updated successfully.");
      } else {
        await createVoucher(payload);
        window.alert("Voucher created successfully.");
      }
      setTimeout(() => router.push("/admin/vouchers"), 700);
    } catch {
      window.alert("Failed to save voucher.");
    }
  };

  if (isEdit && isLoading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/vouchers")}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-600" />
                {isEdit ? "Edit Voucher" : "New Voucher"}
              </h1>
              <p className="text-sm text-slate-500">
                Configure vouchers according to the Voucher V2 schema.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEdit && (
              <button
                onClick={() => router.push(`/admin/vouchers/${id}/rules`)}
                className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center gap-2"
              >
                <SlidersHorizontal size={16} /> Rule Builder
              </button>
            )}
            <button
              onClick={save}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50 shadow-sm hover:bg-blue-700"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs uppercase font-bold text-slate-500">
            Voucher type
          </p>
          <p className="text-sm font-black text-slate-800 mt-2 flex items-center gap-2">
            <Ticket size={16} className="text-blue-600" /> {form.discountType}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs uppercase font-bold text-slate-500">
            Status
          </p>
          <p className="text-sm font-black text-slate-800 mt-2 flex items-center gap-2">
            <Shield size={16} className="text-emerald-600" /> {form.status}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs uppercase font-bold text-slate-500">
            Timeline
          </p>
          <p className="text-sm font-black text-slate-800 mt-2 flex items-center gap-2">
            <CalendarClock size={16} className="text-indigo-600" />
            {form.claimStartAt ? "Configured" : "Not configured"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-cyan-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <Tag size={15} className="text-cyan-600" />
            Basic Information
          </h3>
          <label className="text-[11px] uppercase tracking-wide font-bold text-slate-500">
            Voucher code
          </label>
          <input
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-400 focus:outline-none"
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          {errors.code && (
            <p className="text-xs text-rose-600">{errors.code}</p>
          )}
          <label className="text-[11px] uppercase tracking-wide font-bold text-slate-500 flex items-center gap-1">
            <FileText size={12} /> Voucher Title
          </label>
          <input
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-400 focus:outline-none"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          {errors.title && (
            <p className="text-xs text-rose-600">{errors.title}</p>
          )}
          <textarea
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-400 focus:outline-none"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-cyan-400 focus:outline-none"
            value={form.campaignId || ""}
            onChange={(e) =>
              setForm({ ...form, campaignId: e.target.value || null })
            }
          >
            <option value="">No campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <Store size={15} className="text-emerald-600" />
            Issuer and Status
          </h3>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-400 focus:outline-none"
            value={form.issuerType}
            onChange={(e) => {
              const value = e.target.value as VoucherIssuerType;

              setForm({
                ...form,
                issuerType: value,
                issuerId: value === "PLATFORM" ? "" : form.issuerId,
              });
            }}
          >
            <option value="PLATFORM">PLATFORM</option>
            <option value="BRAND">BRAND</option>
          </select>

          {form.issuerType === "BRAND" && (
            <select
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-400 focus:outline-none"
              value={form.issuerId || ""}
              onChange={(e) => setForm({ ...form, issuerId: e.target.value })}
            >
              <option value="">Select Brand</option>
              {brands.map((b: { id: number; name: string }) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-400 focus:outline-none"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as VoucherStatus })
            }
          >
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={form.stackable}
              onChange={(e) =>
                setForm({ ...form, stackable: e.target.checked })
              }
            />{" "}
            Stackable
          </label>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <Coins size={15} className="text-amber-600" /> Discount setup
          </h3>

          {/* Discount Type */}
          <label className="text-xs font-bold text-slate-500">
            Discount Type
          </label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none"
            value={form.discountType}
            onChange={(e) =>
              setForm({
                ...form,
                discountType: e.target.value as VoucherDiscountType,
              })
            }
          >
            <option value="PERCENT">PERCENT</option>
            <option value="FIXED">FIXED</option>
            <option value="FREE_SHIPPING">FREE_SHIPPING</option>
            <option value="GIFT_ITEM">GIFT_ITEM</option>
          </select>

          {/* Discount Percent */}
          {form.discountType === "PERCENT" && (
            <>
              <label className="text-xs font-bold text-slate-500">
                Discount Percent (%)
              </label>
              <input
                type="number"
                value={form.discountPercent ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountPercent:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none"
              />
            </>
          )}

          {/* Discount Amount */}
          {form.discountType === "FIXED" && (
            <>
              <label className="text-xs font-bold text-slate-500">
                Discount Amount
              </label>
              <input
                type="number"
                value={form.discountAmount ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountAmount:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none"
              />
            </>
          )}

          {form.discountType === "PERCENT" && (
            <>
              <label className="text-xs font-bold text-slate-500">
                Max Discount Amount
              </label>
              <input
                type="number"
                value={form.maxDiscountAmount ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxDiscountAmount:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none"
              />
            </>
          )}

          {/* Min Order */}
          <label className="text-xs font-bold text-slate-500">
            Min Order Value
          </label>
          <input
            type="number"
            value={form.minOrderValue}
            onChange={(e) =>
              setForm({
                ...form,
                minOrderValue: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none"
          />

          {/* Total Quota */}
          <label className="text-xs font-bold text-slate-500">
            Total Quota
          </label>
          <input
            type="number"
            value={form.totalQuota}
            onChange={(e) =>
              setForm({
                ...form,
                totalQuota: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none"
          />

          {/* Per User */}
          <label className="text-xs font-bold text-slate-500">
            Per User Quota
          </label>
          <input
            type="number"
            value={form.perUserQuota}
            onChange={(e) =>
              setForm({
                ...form,
                perUserQuota: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="bg-white border border-indigo-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <Clock3 size={15} className="text-indigo-600" /> Timeline
          </h3>
          <label className="text-xs font-bold text-slate-500">
            claim_start_at
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-400 focus:outline-none"
            value={form.claimStartAt}
            onChange={(e) => setForm({ ...form, claimStartAt: e.target.value })}
          />
          <label className="text-xs font-bold text-slate-500">
            claim_end_at
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-400 focus:outline-none"
            value={form.claimEndAt}
            onChange={(e) => setForm({ ...form, claimEndAt: e.target.value })}
          />
          <label className="text-xs font-bold text-slate-500">valid_from</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-400 focus:outline-none"
            value={form.validFrom}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
          />
          <label className="text-xs font-bold text-slate-500">valid_to</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-400 focus:outline-none"
            value={form.validTo}
            onChange={(e) => setForm({ ...form, validTo: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
