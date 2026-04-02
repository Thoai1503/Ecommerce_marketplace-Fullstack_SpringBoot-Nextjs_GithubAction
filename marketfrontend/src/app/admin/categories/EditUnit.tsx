"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUnitDetail } from "@/hooks/admin/useUnits";
import {
  ChevronLeft,
  Save,
  Scale,
  Ruler,
  Box,
  Droplets,
  HelpCircle,
  Eye,
} from "lucide-react";
import { UnitStatus, UnitType } from "@/types";
import { useToast } from "@/context/ToastContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Reusing config for consistency
const TypeConfig: Record<
  UnitType,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  WEIGHT: {
    label: "Weight",
    icon: <Scale size={20} />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  LENGTH: {
    label: "Length",
    icon: <Ruler size={20} />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  VOLUME: {
    label: "Volume",
    icon: <Droplets size={20} />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  QUANTITY: {
    label: "Quantity",
    icon: <Box size={20} />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  OTHER: {
    label: "Other",
    icon: <HelpCircle size={20} />,
    color: "text-slate-500",
    bgColor: "bg-slate-50",
  },
};

export default function EditUnit() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const router = useRouter();
  const isEditMode = !!id;
  const { unit, isLoading, createUnit, updateUnit, isSaving } = useUnitDetail(
    id || "",
  );

  const [formData, setFormData] = useState({
    label: "",
    symbol: "",
    type: "WEIGHT" as UnitType,
    status: "ACTIVE" as UnitStatus,
    id: "", // For display only
    createdAt: "", // For display only
  });

  const { success, error } = useToast();

  useEffect(() => {
    if (isEditMode && unit) {
      setFormData({
        label: unit.label,
        symbol: unit.symbol,
        type: unit.type || "WEIGHT", // Default fallback
        status: unit.status,
        id: unit.id,
        createdAt: unit.createdAt,
      });
    }
  }, [isEditMode, unit]);

  const handleSubmit = async () => {
    if (!formData.label || !formData.symbol) {
      error("Unit Label and Symbol are required.");
      return;
    }

    try {
      if (isEditMode) {
        await updateUnit({
          label: formData.label,
          symbol: formData.symbol,
          type: formData.type,
          status: formData.status,
        });
        success("Unit updated successfully!");
      } else {
        await createUnit({
          label: formData.label,
          symbol: formData.symbol,
          type: formData.type,
          status: formData.status,
        });
        success("Unit created successfully!");
      }
      setTimeout(() => router.push("/admin/categories/units"), 1000);
    } catch (e) {
      console.error(e);
      error("An error occurred.");
    }
  };

  if (isEditMode && isLoading)
    return (
      <div className="p-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-24 space-y-6">
      <Breadcrumbs
        items={[
          { label: "Units", path: "/admin/categories/units" },
          { label: isEditMode ? "Edit" : "New" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/categories/units")}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              {isEditMode ? "Edit Unit" : "Add Unit"}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Standardize how product quantities are measured.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/categories/units")}
            className="px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl border-0 bg-transparent transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 border-0 transition-all disabled:opacity-50"
          >
            <Save size={18} />{" "}
            {isSaving ? "Saving..." : isEditMode ? "Edit Unit" : "Save Unit"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-8">
            {isEditMode && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Internal ID
                  </p>
                  <p className="text-sm font-black text-slate-800 font-mono">
                    {formData.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Created At
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(formData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Unit Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.keys(TypeConfig) as UnitType[]).map((type) => {
                    const config = TypeConfig[type];
                    const isSelected = formData.type === type;
                    return (
                      <div
                        key={type}
                        onClick={() => setFormData({ ...formData, type })}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${isSelected ? `border-current ${config.color} ${config.bgColor}` : "border-slate-100 hover:border-slate-300 text-slate-500 hover:bg-slate-50"}`}
                      >
                        {config.icon}
                        <span className="text-xs font-bold uppercase">
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Unit Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold"
                    placeholder="e.g. Kilogram"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Symbol <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) =>
                        setFormData({ ...formData, symbol: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium"
                      placeholder="e.g. kg"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {TypeConfig[formData.type].icon}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    This will be displayed next to product attributes.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Status
                </label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status:
                          formData.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.status === "ACTIVE" ? "translate-x-6" : "translate-x-0"}`}
                    ></div>
                  </button>
                  <span
                    className={`text-sm font-bold ${formData.status === "ACTIVE" ? "text-green-700" : "text-slate-500"}`}
                  >
                    {formData.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sticky top-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Eye size={14} /> Live Preview
            </h3>

            <div className="space-y-6">
              {/* Product Card Preview */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 text-center">
                  Product Detail View
                </p>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-3"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-blue-50 rounded-lg"></div>
                    <div className="h-6 w-16 bg-slate-100 rounded-lg"></div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">
                      {formData.label || "Attribute"}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      10{" "}
                      <span className="text-blue-600">
                        {formData.symbol || "..."}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Attribute Selector Preview */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 text-center">
                  Attribute Selection
                </p>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex gap-2 flex-wrap">
                    {["5", "10", "25"].map((val, i) => (
                      <div
                        key={val}
                        className={`px-3 py-2 rounded-lg border text-sm font-bold ${i === 1 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
                      >
                        {val} {formData.symbol}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
