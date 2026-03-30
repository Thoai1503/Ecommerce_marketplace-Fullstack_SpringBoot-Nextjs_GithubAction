"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react"; // 👈 thêm

type Props = {
  open: boolean;
  onClose: () => void;
  attribute: any;
  unit: any;
  onSubmit: (value: string) => Promise<void>;
};

export default function CreateValueModal({
  open,
  onClose,
  attribute,
  unit,
  onSubmit,
}: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false); // 👈 dùng toast

  // 🔥 reset khi mở modal
  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    const v = value.trim();
    if (!v || loading) return;

    try {
      setLoading(true);

      await onSubmit(v);


      setValue("");
      onClose(); // 🔥 đóng modal sau khi save
    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[400px] bg-white rounded-xl p-5 space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Add Value</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* INFO */}
        <div className="text-sm text-gray-500">
          {attribute?.name} ({unit?.symbol})
        </div>

        {/* INPUT */}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value..."
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />

        {/* ACTION */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            disabled={!value.trim() || loading}
            onClick={handleSubmit}
            className={`px-4 py-1 text-white rounded transition
              ${
                value.trim() && !loading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}