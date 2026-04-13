"use client";

import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Unit, UnitStatus } from "@/types/index";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Unit>) => Promise<void>;
  initialData?: Unit | null;
  isSaving: boolean;
}

export default function UnitModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
}: UnitModalProps) {
  const [formData, setFormData] = useState<Partial<Unit>>({
    label: "",
    symbol: "",
    status: "ACTIVE",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          label: initialData.label,
          symbol: initialData.symbol,
          status: initialData.status,
        });
      } else {
        setFormData({
          label: "",
          symbol: "",
          status: "ACTIVE",
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label || !formData.symbol) return;

    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? "Edit Unit" : "Add New Unit"}
          </h3>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors border-0 bg-transparent"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* INPUT */}
            <div className="grid grid-cols-2 gap-6">
              {/* LABEL */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all focus:bg-white"
                  placeholder="e.g. Kilogram"
                  autoFocus
                />
              </div>

              {/* SYMBOL */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.symbol || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all focus:bg-white"
                  placeholder="e.g. kg"
                />
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span
                className={`text-sm font-bold ${
                  formData.status === "ACTIVE"
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              >
                {formData.status === "ACTIVE" ? "Active" : "Hidden"}
              </span>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    status:
                      formData.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  formData.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    formData.status === "ACTIVE"
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !formData.label || !formData.symbol}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all border-0"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} /> Save Unit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
