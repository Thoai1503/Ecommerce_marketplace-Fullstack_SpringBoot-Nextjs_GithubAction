"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVoucherRules } from "@/hooks/admin/useVouchers";
import { API_URL } from "@/helper/api";
import {
  VoucherRulesPayload,
  VoucherScopeRule,
  VoucherSegmentRule,
} from "@/types";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  SlidersHorizontal,
  Users,
  Shield,
  Layers,
  UserCheck,
  Link2,
} from "lucide-react";

const scopeTypes = [
  "SHOP",
  "CATEGORY",
  "PRODUCT",
  "BRAND",
  "PAYMENT_METHOD",
  "SHIPPING_METHOD",
] as const;

const segmentTypes = [
  "NEW_USER",
  "VIP",
  "APP_ONLY",
  "MEMBERSHIP_TIER",
  "FIRST_ORDER",
] as const;

type ScopeOption = {
  id: number;
  label: string;
};

const paymentMethodOptions: ScopeOption[] = [
  { id: 1, label: "COD" },
  { id: 2, label: "VNPay" },
  { id: 3, label: "Momo" },
  { id: 4, label: "ZaloPay" },
];

const shippingMethodOptions: ScopeOption[] = [
  { id: 1, label: "Giao hang tiet kiem" },
  { id: 2, label: "Giao hang nhanh" },
  { id: 3, label: "Hoa toc" },
  { id: 4, label: "Nhan tai cua hang" },
];

const emptyScope = (voucherId: string): VoucherScopeRule => ({
  id: "",
  voucherId,
  scopeType: "CATEGORY",
  scopeId: 0,
  includeExclude: "INCLUDE",
  createdAt: new Date().toISOString(),
});

const emptySegment = (voucherId: string): VoucherSegmentRule => ({
  id: "",
  voucherId,
  segmentType: "NEW_USER",
  segmentValue: null,
});

export default function VoucherRuleBuilderPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { rules, isLoading, saveRules, isSaving } = useVoucherRules(id);

  const [form, setForm] = useState<VoucherRulesPayload>({
    scopeRules: [],
    segmentRules: [],
  });
  const [scopeOptions, setScopeOptions] = useState<
    Record<string, ScopeOption[]>
  >({
    SHOP: [],
    CATEGORY: [],
    PRODUCT: [],
    BRAND: [],
    PAYMENT_METHOD: paymentMethodOptions,
    SHIPPING_METHOD: shippingMethodOptions,
  });

  useEffect(() => {
    if (rules) {
      setForm(rules);
    }
  }, [rules]);

  useEffect(() => {
    const loadScopeOptions = async () => {
      try {
        const [brandsRes, categoriesRes, productsRes, shopsRes] =
          await Promise.all([
            fetch(`${API_URL}/api/brands`),
            fetch(`${API_URL}/api/categories`),
            fetch(`${API_URL}/product`),
            fetch(`${API_URL}/shops`),
          ]);

        const [brandsJson, categoriesJson, productsJson, shopsJson] =
          await Promise.all([
            brandsRes.json(),
            categoriesRes.json(),
            productsRes.json(),
            shopsRes.json(),
          ]);

        const brands = Array.isArray(brandsJson) ? brandsJson : [];
        const categories = Array.isArray(categoriesJson) ? categoriesJson : [];
        const products = Array.isArray(productsJson)
          ? productsJson
          : Array.isArray(productsJson?.data)
            ? productsJson.data
            : [];
        const shops = Array.isArray(shopsJson) ? shopsJson : [];

        setScopeOptions({
          SHOP: shops.map((shop: any) => ({
            id: Number(shop.id),
            label: shop.shop_name || `Shop #${shop.id}`,
          })),
          CATEGORY: categories.map((category: any) => ({
            id: Number(category.id),
            label: category.category_name || `Category #${category.id}`,
          })),
          PRODUCT: products.map((product: any) => ({
            id: Number(product.id),
            label: product.product_name || `Product #${product.id}`,
          })),
          BRAND: brands.map((brand: any) => ({
            id: Number(brand.id),
            label: brand.name || `Brand #${brand.id}`,
          })),
          PAYMENT_METHOD: paymentMethodOptions,
          SHIPPING_METHOD: shippingMethodOptions,
        });
      } catch (error) {
        console.error("Load scope options failed", error);
      }
    };

    loadScopeOptions();
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      scopeRules: prev.scopeRules.map((rule) => {
        const options = getScopeOptionsByType(rule.scopeType);

        if (options.length === 0) return rule;

        const hasCurrent = options.some(
          (option) => Number(option.id) === Number(rule.scopeId),
        );

        if (hasCurrent) return rule;

        return {
          ...rule,
          scopeId: options[0].id,
        };
      }),
    }));
  }, [scopeOptions]);

  const addScope = () => {
    setForm((prev) => ({
      ...prev,
      scopeRules: [...prev.scopeRules, emptyScope(id)],
    }));
  };

  const addSegment = () => {
    setForm((prev) => ({
      ...prev,
      segmentRules: [...prev.segmentRules, emptySegment(id)],
    }));
  };

  const updateScope = (index: number, patch: Partial<VoucherScopeRule>) => {
    setForm((prev) => {
      const next = [...prev.scopeRules];
      next[index] = { ...next[index], ...patch };
      return { ...prev, scopeRules: next };
    });
  };

  const getScopeOptionsByType = (
    scopeType: VoucherScopeRule["scopeType"],
  ): ScopeOption[] => {
    return scopeOptions[scopeType] || [];
  };

  const updateScopeType = (
    index: number,
    scopeType: VoucherScopeRule["scopeType"],
  ) => {
    const options = getScopeOptionsByType(scopeType);

    updateScope(index, {
      scopeType,
      scopeId: options.length > 0 ? options[0].id : 0,
    });
  };

  const renderScopeIdField = (rule: VoucherScopeRule, index: number) => {
    const options = getScopeOptionsByType(rule.scopeType);

    if (options.length > 0) {
      return (
        <select
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
          value={rule.scopeId}
          onChange={(e) =>
            updateScope(index, {
              scopeId: Number(e.target.value || 0),
            })
          }
        >
          {options.map((option) => (
            <option key={`${rule.scopeType}-${option.id}`} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="number"
        className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
        value={rule.scopeId}
        onChange={(e) =>
          updateScope(index, {
            scopeId: Number(e.target.value || 0),
          })
        }
        placeholder="scope_id"
      />
    );
  };

  const updateSegment = (index: number, patch: Partial<VoucherSegmentRule>) => {
    setForm((prev) => {
      const next = [...prev.segmentRules];
      next[index] = { ...next[index], ...patch };
      return { ...prev, segmentRules: next };
    });
  };

  const removeScope = (index: number) => {
    setForm((prev) => ({
      ...prev,
      scopeRules: prev.scopeRules.filter((_, i) => i !== index),
    }));
  };

  const removeSegment = (index: number) => {
    setForm((prev) => ({
      ...prev,
      segmentRules: prev.segmentRules.filter((_, i) => i !== index),
    }));
  };

  const onSave = async () => {
    try {
      await saveRules(form);
      window.alert("Da luu rule thanh cong");
      router.push(`/admin/vouchers/${id}`);
    } catch {
      window.alert("Luu rule that bai");
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading rule builder...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/admin/vouchers/${id}`)}
              className="p-2 rounded-xl border border-slate-200 bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">
                Voucher V2
              </p>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-blue-600" /> Rule
                Builder
              </h1>
              <p className="text-sm text-slate-600">
                Cau hinh scope va user segment cho voucher
              </p>
            </div>
          </div>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={16} /> {isSaving ? "Dang luu..." : "Luu rule"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Scope rules
          </p>
          <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <Layers size={18} className="text-emerald-600" />{" "}
            {form.scopeRules.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Segment rules
          </p>
          <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <UserCheck size={18} className="text-violet-600" />{" "}
            {form.segmentRules.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs uppercase text-slate-500 font-bold">
            Rule relation
          </p>
          <p className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <Link2 size={18} className="text-blue-600" />
            {form.scopeRules.length + form.segmentRules.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Shield size={15} className="text-emerald-600" /> Scope Rules
            </h2>
            <button
              onClick={addScope}
              className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {form.scopeRules.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chua co scope rule, voucher ap dung global.
            </p>
          ) : (
            <div className="space-y-3">
              {form.scopeRules.map((rule, idx) => (
                <div
                  key={`${rule.id || "new"}-${idx}`}
                  className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                      value={rule.scopeType}
                      onChange={(e) =>
                        updateScopeType(
                          idx,
                          e.target.value as VoucherScopeRule["scopeType"],
                        )
                      }
                    >
                      {scopeTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {renderScopeIdField(rule, idx)}
                    <select
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                      value={rule.includeExclude}
                      onChange={(e) =>
                        updateScope(idx, {
                          includeExclude: e.target
                            .value as VoucherScopeRule["includeExclude"],
                        })
                      }
                    >
                      <option value="INCLUDE">INCLUDE</option>
                      <option value="EXCLUDE">EXCLUDE</option>
                    </select>
                  </div>
                  <button
                    onClick={() => removeScope(idx)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Users size={15} className="text-violet-600" /> Segment Rules
            </h2>
            <button
              onClick={addSegment}
              className="px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {form.segmentRules.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chua co segment rule, voucher mo cho moi user hop le.
            </p>
          ) : (
            <div className="space-y-3">
              {form.segmentRules.map((rule, idx) => (
                <div
                  key={`${rule.id || "new"}-${idx}`}
                  className="rounded-xl border border-violet-200 bg-violet-50/40 p-3 space-y-2"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <select
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                      value={rule.segmentType}
                      onChange={(e) =>
                        updateSegment(idx, {
                          segmentType: e.target
                            .value as VoucherSegmentRule["segmentType"],
                        })
                      }
                    >
                      {segmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                      value={rule.segmentValue || ""}
                      onChange={(e) =>
                        updateSegment(idx, {
                          segmentValue: e.target.value || null,
                        })
                      }
                      placeholder="segment_value (optional)"
                    />
                  </div>
                  <button
                    onClick={() => removeSegment(idx)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
