"use client";

import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  units: any[];
  attribute: any;
  existingUnitIds: number[];
  onSubmit: (unitId: number) => void;
};

export default function SelectUnitModal({
  open,
  onClose,
  units,
  attribute,
  existingUnitIds,
  onSubmit,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState(""); // 🔥 thêm

  useEffect(() => {
    if (open) {
      setSelected(null);
      setSearch("");
    }
  }, [attribute?.id, open]);

  if (!open) return null;

  // 🔥 FILTER
  const filteredUnits = units?.filter((u: any) => {
    const keyword = search.trim().toLowerCase();
    const label = String(u.label ?? u.name ?? "").toLowerCase();
    const symbol = String(u.symbol ?? "").toLowerCase();

    return (
      !keyword || label.includes(keyword) || symbol.includes(keyword)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] bg-white rounded-2xl shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Select Unit</h3>

          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* ATTRIBUTE NAME */}
        <div className="text-sm text-gray-500">
          Attribute: <span className="font-semibold">{attribute?.name}</span>
        </div>

        {/* 🔥 SEARCH */}
        <input
          type="text"
          placeholder="Search unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* LIST UNIT */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {filteredUnits?.map((u: any) => {
            const unitId = Number(u.id);
            const label = String(u.label ?? u.name ?? `Unit #${u.id}`);
            const symbol = String(u.symbol ?? "");
            const isUsed = existingUnitIds.includes(unitId);

            return (
              <div
                key={u.id}
                onClick={() => {
                  if (isUsed) return;
                  setSelected(unitId);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition border
                  ${
                    isUsed
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                      : selected === unitId
                      ? "bg-blue-50 border-blue-500"
                      : "hover:bg-gray-50 border-transparent"
                  }
                `}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{label}</span>
                  {symbol && (
                    <span className="text-xs text-gray-400">
                      Symbol: {symbol}
                    </span>
                  )}
                </div>

                {/* trạng thái */}
                {isUsed ? (
                  <span className="text-xs text-gray-400">Used</span>
                ) : selected === unitId ? (
                  <Check size={16} className="text-blue-600" />
                ) : null}
              </div>
            );
          })}

          {filteredUnits?.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-6">
              No units found
            </div>
          )}
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            disabled={!selected}
            onClick={() => selected && onSubmit(selected)}
            className={`px-4 py-1.5 text-sm rounded-lg text-white transition
              ${
                selected
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
