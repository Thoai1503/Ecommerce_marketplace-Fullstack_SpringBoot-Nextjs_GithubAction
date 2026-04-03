"use client";
import { useState, useMemo, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  brands: any[];
  onSubmit: (ids: number[]) => Promise<void>;
  existingIds?: number[];
  loading?: boolean;
};

export default function SelectBrandModal({
  open,
  onClose,
  brands,
  onSubmit,
  existingIds = [],
  loading = false,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  // 🔍 luôn đặt trước return
  const filteredBrands = useMemo(() => {
    return brands.filter((b: any) =>
      b.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [brands, search]);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setSearch("");
    }
  }, [open]);

  if (!open) return null;

  // 🔁 toggle chọn
  const toggle = (id: number) => {
    if (existingIds.includes(id)) return; // ❌ không cho chọn lại

    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // 🔥 submit
  const handleSubmit = async () => {
    if (selected.length === 0) return;

    await onSubmit(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] rounded-2xl shadow-xl p-6 animate-fadeIn">
        {/* HEADER */}
        <h2 className="text-lg font-semibold mb-4">Add Brand to Category</h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {/* LIST */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {filteredBrands.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">
              No brands found
            </p>
          )}

          {filteredBrands.map((b: any) => {
            const id = Number(b.id);
            const isSelected = selected.includes(id);
            const isExisting = existingIds.includes(id);

            return (
              <div
                key={b.id}
                onClick={() => toggle(id)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border cursor-pointer transition
                  ${
                    isExisting
                      ? "bg-green-100 border-green-500 cursor-not-allowed"
                      : isSelected
                        ? "bg-purple-100 border-purple-500"
                        : "hover:bg-gray-50"
                  }
                `}
              >
                {/* LEFT */}
                <div className="flex items-center gap-2">
                  {b.logo && (
                    <img src={b.logo} className="w-5 h-5 object-contain" />
                  )}
                  <span className="text-sm">{b.name}</span>
                </div>

                {/* RIGHT STATUS */}
                {isExisting && (
                  <span className="text-xs text-green-600 font-medium">
                    Added
                  </span>
                )}

                {!isExisting && isSelected && (
                  <span className="text-xs text-purple-600 font-medium">
                    Selected
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-slate-400">
            {selected.length} selected
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={selected.length === 0 || loading}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-700 transition"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
