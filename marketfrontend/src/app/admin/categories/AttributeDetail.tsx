"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAttributeDetail } from "@/hooks/admin/useAttributes";
import { useCategories } from "@/hooks/admin/useCategories";
import { useUnits } from "@/hooks/admin/useUnits";
import {
  ChevronLeft,
  Plus,
  Edit3,
  Trash2,
  Settings,
  List,
  ArrowLeft,
  Layers,
  Scale,
  Sparkles,
} from "lucide-react";
import AttributeValueModal from "@/components/admin/attributes/AttributeValueModal";
import { AttributeValue } from "@/types";
import { useToast } from "@/context/ToastContext";

// Helper to detect valid color
const isColorValue = (str: string) => {
  const s = new Option().style;
  s.color = str;
  return s.color !== "";
};

// Helper to check if attribute is color-related
const isColorAttribute = (name: string) => {
  const n = name.toLowerCase();
  return n.includes("color") || n.includes("màu") || n.includes("colour");
};

export default function AttributeDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const router = useRouter();
  const {
    attribute,
    values,
    isLoading,
    createValue,
    updateValue,
    deleteValue,
    isUpdatingValues,
  } = useAttributeDetail(id || "");
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { units } = useUnits();
  const { success, error } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingValue, setEditingValue] = React.useState<AttributeValue | null>(
    null,
  );

  // Quick Add State
  const [quickValue, setQuickValue] = React.useState("");
  const [isQuickAdding, setIsQuickAdding] = React.useState(false);

  // Filter Categories
  const linkedCategories = useMemo(() => {
    if (!categories || !id) return [];
    return categories.filter((cat) => cat.attributeIds?.includes(id));
  }, [categories, id]);

  // Find linked Unit
  const linkedUnit = useMemo(() => {
    if (!attribute || !attribute.unitId || !units) return null;
    return units.find((u) => u.id === attribute.unitId);
  }, [attribute, units]);

  if (isLoading)
    return (
      <div className="p-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!attribute)
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-xl font-bold text-slate-800">
          Attribute not found
        </h3>
        <button
          onClick={() => router.push("/admin/categories/attributes")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to list
        </button>
      </div>
    );

  const isColor = isColorAttribute(attribute.name);

  // Modal Handlers
  const handleOpenEdit = (val: AttributeValue) => {
    setEditingValue(val);
    setIsModalOpen(true);
  };

  const handleDeleteValue = async (valueId: string) => {
    if (confirm("Are you sure you want to delete this value?")) {
      try {
        await deleteValue(valueId);
        success("Value deleted.");
      } catch (e) {
        console.error(e);
        error("Failed to delete.");
      }
    }
  };

  const handleSaveModalValue = async (data: {
    value: string;
    displayOrder: number;
  }) => {
    try {
      if (editingValue) {
        await updateValue({ valueId: editingValue.id, data });
        success("Value updated.");
      }
    } catch (e) {
      console.error(e);
      error("Operation failed.");
    }
  };

  // Quick Add Handler
  const handleQuickAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!quickValue.trim()) return;

    setIsQuickAdding(true);
    try {
      const newValues = quickValue
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      for (const val of newValues) {
        const maxOrder =
          values.length > 0
            ? Math.max(...values.map((v) => v.displayOrder))
            : 0;
        await createValue({
          attributeId: attribute.id,
          value: val,
          displayOrder: maxOrder + 1,
        });
      }
      setQuickValue("");
      success(`Added ${newValues.length} value(s) successfully.`);
    } catch (err) {
      console.error(err);
      error("Failed to add values.");
    } finally {
      setIsQuickAdding(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-24 space-y-8">
      <AttributeValueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attribute={attribute as any}
        initialValues={
          editingValue ? [editingValue.value] : values.map((v) => v.value)
        }
        onSave={async (newValues) => {
          try {
            for (let i = 0; i < newValues.length && i < values.length; i++) {
              await updateValue({
                valueId: values[i].id,
                data: {
                  value: newValues[i],
                  displayOrder: values[i].displayOrder,
                },
              });
            }
            success("Values updated.");
          } catch (e) {
            console.error(e);
            error("Operation failed.");
          }
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/categories/attributes")}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-1">
              <span
                className="hover:text-blue-600 cursor-pointer"
                onClick={() => router.push("/admin/categories/attributes")}
              >
                Attribute
              </span>
              <span>/</span>
              <span>{attribute.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Attribute: {attribute.name}
              </h1>
              {attribute.published ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                  Hidden
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              router.push(`/admin/categories/attributes/${attribute.id}/edit`)
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Edit3 size={18} /> Edit Attribute
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Summary
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Code ID
                </p>
                <p className="text-lg font-mono font-black text-slate-800">
                  {attribute.attributeCode}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Option Type
                </p>
                <p className="text-sm font-bold text-slate-700 bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100 mt-1">
                  {attribute.option === "DROPDOWN"
                    ? "Dropdown Select"
                    : "Radio Button"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Unit
                </p>
                {linkedUnit ? (
                  <div className="flex items-center gap-2 mt-1 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <Scale size={16} className="text-blue-500" />
                    <p className="text-sm font-bold text-blue-700">
                      {linkedUnit.label}{" "}
                      <span className="text-blue-400 font-mono">
                        ({linkedUnit.symbol})
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-slate-400">
                      None (No unit linked)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Values Count
                </p>
                <p className="text-lg font-black text-blue-600">
                  {values.length}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Categories Card */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={14} /> Used in Categories
            </h3>
            {isLoadingCategories ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : linkedCategories.length > 0 ? (
              <div className="space-y-2">
                {linkedCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() =>
                      router.push(`/admin/categories/industries/${cat.id}`)
                    }
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    {cat.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-xs text-slate-400">
                  Not assigned to any category yet.
                </p>
                <button
                  onClick={() => router.push("/admin/categories/industries")}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Go to Categories
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Values Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4">
                <List size={16} /> Attribute Values
              </h3>

              <form onSubmit={handleQuickAdd} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={quickValue}
                    onChange={(e) => setQuickValue(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                    placeholder={
                      linkedUnit
                        ? `Enter value (e.g. 10, 20)...`
                        : `Enter value (e.g. Red, Blue, Green)...`
                    }
                  />
                  {linkedUnit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      {linkedUnit.symbol}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isQuickAdding || !quickValue.trim()}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  {isQuickAdding ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus size={16} /> Quick Add
                    </>
                  )}
                </button>
              </form>
            </div>

            {values.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-400">
                <Settings size={48} className="mb-3 opacity-20" />
                <p className="text-sm font-bold">No values added yet.</p>
                <p className="text-xs mt-1">
                  Use the Quick Add above to start.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white">
                      <th className="px-6 py-4 w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Order
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Value
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Created
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {values.map((val) => (
                      <tr
                        key={val.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono font-bold text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {val.displayOrder}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isColor && isColorValue(val.value) && (
                              <div
                                className="w-4 h-4 rounded-full border border-slate-200 shadow-sm"
                                style={{ backgroundColor: val.value }}
                              ></div>
                            )}
                            <span className="text-sm font-bold text-slate-800">
                              {val.value}{" "}
                              {linkedUnit ? (
                                <span className="text-slate-400 font-normal">
                                  ({linkedUnit.symbol})
                                </span>
                              ) : (
                                ""
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-medium text-slate-500">
                            {new Date(val.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(val)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteValue(val.id)}
                              disabled={isUpdatingValues}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => router.push("/admin/categories/attributes")}
              className="flex items-center gap-2 px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Attribute List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
