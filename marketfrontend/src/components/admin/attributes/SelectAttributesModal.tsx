import { useEffect, useState, useMemo } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  attributes: any[];
  existingIds: number[];
  onSubmit: (selectedIds: number[]) => Promise<void>;
};

export default function SelectAttributesModal({
  open,
  onClose,
  attributes,
  existingIds,
  onSubmit,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelected([]);
      setSearch(""); // reset search
    }
  }, [open]);

  const toggle = (id: number) => {
    if (existingIds.includes(id)) return;

    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // 🔥 filter attributes
  const filteredAttributes = useMemo(() => {
    return attributes.filter((attr) =>
      attr.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [attributes, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-lg">Select Attributes</h2>

        {/* 🔥 SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search attribute..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <span className="absolute left-2 top-2 text-gray-400">🔍</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {filteredAttributes.map((attr) => {
            const id = Number(attr.id);

            const isSelected =
              selected.includes(id) || existingIds.includes(id);
            const isDisabled = existingIds.includes(id);

            return (
              <div
                key={id}
                onClick={() => toggle(id)}
                className={`
                  p-3 rounded-xl border transition-all flex justify-between items-center
                  ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 ring-2 ring-blue-300"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }
                  ${
                    isDisabled
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                <span>{attr.name}</span>

                {isDisabled && (
                  <span className="text-xs text-gray-500">
                    Đã thêm
                  </span>
                )}

                {!isDisabled && selected.includes(id) && (
                  <span className="text-blue-600 font-bold">✓</span>
                )}
              </div>
            );
          })}

          {/* 🔥 empty state */}
          {filteredAttributes.length === 0 && (
            <p className="text-sm text-gray-400 text-center">
              No attributes found
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            disabled={loading || selected.length === 0}
            onClick={async () => {
              try {
                setLoading(true);
                await onSubmit(selected);
                onClose();
              } finally {
                setLoading(false);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}