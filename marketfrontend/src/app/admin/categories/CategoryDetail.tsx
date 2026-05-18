"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useCategoryDetail } from "@/hooks/admin/useCategories";
import { useSubCategories } from "@/hooks/admin/useSubCategories";
import { useAttributes } from "@/hooks/admin/useAttributes";
import { useUnits } from "@/hooks/admin/useUnits";

import {
  ChevronLeft,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  List,
  CircleDot,
  Scale,
  Plus,
  Layers,
} from "lucide-react";

import { CategoryStatus } from "@/types";
import { useToast } from "@/context/ToastContext";
import { useCategoryAttributes } from "@/hooks/admin/useCategoryAttributes";
import SelectAttributesModal from "@/components/admin/attributes/SelectAttributesModal";
import SelectUnitModal from "@/components/admin/units/SelectUnitModal";
import { useAttributeValues } from "@/hooks/admin/useAttributeValues";
import { useAttributeUnits } from "@/hooks/admin/useAttributeUnits";
import CreateValueModal from "@/components/admin/value/CreateValueModal";
import SelectBrandModal from "@/components/admin/brands/SelectBrandModal";
import { useBrands } from "@/hooks/admin/useBrands";
import { useCategoryBrands } from "@/hooks/admin/userCategoryBrands";
import { API_URL } from "@/helper/api";

const VALUE_EXISTS_MESSAGE = "This value already exists for this attribute.";

const getErrorMessage = (err: unknown, fallback: string) => {
  return err instanceof Error && err.message ? err.message : fallback;
};

const normalizeAttributeValue = (value: unknown) => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

const StatusConfig: Record<
  CategoryStatus,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  ACTIVE: {
    label: "Active",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <CheckCircle size={14} />,
  },
  HIDDEN: {
    label: "Hidden",
    color: "text-slate-500",
    bgColor: "bg-slate-100",
    icon: <XCircle size={14} />,
  },
};

export default function CategoryDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const router = useRouter();
  const { info, error: showError } = useToast();
  const [adding, setAdding] = useState(false);
  const { category, isLoading, deleteCategory } = useCategoryDetail(id);
  const { subCategories, loading: loadingSub } = useSubCategories(id);
  const categoryParentId = Number(
    (category as any)?.parentId ?? (category as any)?.parent_id ?? 0,
  );
  const categoryLevel = Number((category as any)?.level ?? 0);
  const isChildCategory =
    Boolean(category) && (categoryParentId > 0 || categoryLevel > 0);
  const { attributes } = useAttributes();
  const { units } = useUnits();
  const [selectedAttr, setSelectedAttr] = useState<any>(null);
  const [openUnitModal, setOpenUnitModal] = useState(false);
  const { attributeUnits, deleteAttributeUnit } = useAttributeUnits();
  const [collapsedAttrs, setCollapsedAttrs] = useState<number[]>([]);

  useEffect(() => {
    if (attributes && attributes.length > 0) {
      setCollapsedAttrs(attributes.map((a: any) => a.id));
    }
  }, [attributes]);

  const [openValueModal, setOpenValueModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [openBrandModal, setOpenBrandModal] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const { brands } = useBrands();
  const {
    categoryBrands,
    isLoading: loadingBrand,
    refresh: refreshBrand,
  } = useCategoryBrands(isChildCategory ? category?.id || "" : "");

  const { values, createValue, deleteValue } = useAttributeValues();
  const handleOpenUnitModal = (attr: any) => {
    setSelectedAttr(attr);
    setOpenUnitModal(true);
  };

  const linkedBrands = useMemo(() => {
    if (!categoryBrands || !brands) return [];

    return categoryBrands
      .map((cb: any) => {
        const brand = brands.find(
          (b: any) => Number(b.id) === Number(cb.brand_id),
        );

        if (!brand) return null;

        return {
          ...brand,
          categoryBrandId: cb.id,
          status: cb.status,
        };
      })
      .filter(Boolean);
  }, [categoryBrands, brands]);

  const displayedBrands = useMemo(() => {
    return showAllBrands ? linkedBrands : linkedBrands.slice(0, 5);
  }, [linkedBrands, showAllBrands]);

  const toggleAttr = (attrId: number) => {
    setCollapsedAttrs((prev) =>
      prev.includes(attrId)
        ? prev.filter((id) => id !== attrId)
        : [...prev, attrId],
    );
  };
  const handleRemoveValue = async (v: any) => {
    const ok = confirm("Delete this value?");
    if (!ok) return;

    try {
      await deleteValue(v.id);
      info("Value removed");
    } catch (err) {
      console.error(err);
      info("Delete failed");
    }
  };
  const handleRemoveUnit = async (unit: any) => {
    const ok = confirm("Delete this unit?");
    if (!ok) return;

    try {
      await deleteAttributeUnit(unit.attributeUnitId); // 🔥 FIX
      info("Unit removed");
    } catch (err) {
      console.error(err);
      info("Delete failed");
    }
  };

  const handleOpenValueModal = (attr: any, unit: any) => {
    setSelectedAttr(attr);
    setSelectedUnit(unit);
    setOpenValueModal(true);
  };
  const addAttributeUnit = async (attributeId: number, unitId: number) => {
    const res = await fetch(`${API_URL}/api/attribute-unit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attribute_id: attributeId,
        unit_id: unitId,
        status: 1,
      }),
    });

    const text = await res.text();
    console.log("ADD ATTRIBUTE UNIT:", res.status, text);

    if (!res.ok) {
      throw new Error(text || "Add failed");
    }
  };

  const {
    categoryAttributes,
    loading: loadingAttr,
    addAttributes,
    removeAttribute,
  } = useCategoryAttributes(isChildCategory ? category?.id : undefined);
  const [openAttributeModal, setOpenAttributeModal] = useState(false);

  // 🔥 DELETE ATTRIBUTE
  const handleRemoveAttribute = async (attr: any) => {
    const record = categoryAttributes.find(
      (ca: any) => Number(ca.attributeId) === Number(attr.id),
    );

    if (!record) return;

    const ok = confirm("Are you sure you want to delete this attribute?");
    if (!ok) return;

    try {
      await removeAttribute(record.id);
      info("Attribute removed");
    } catch (err) {
      console.error(err);
      info("Remove failed");
    }
  };

  // 🔥 DELETE CATEGORY
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory();
      info("Category deleted successfully");
      router.push("/admin/categories/industries");
    } catch (error) {
      console.error(error);
      info("Delete failed");
    }
  };

  // 🔥 MAP ATTRIBUTES
  const linkedAttributes = useMemo(() => {
    if (!categoryAttributes || !attributes) return [];

    return categoryAttributes
      .map((ca: any) => {
        const attr = attributes.find(
          (a: any) => Number(a.id) === Number(ca.attributeId),
        );

        if (!attr) return null;

        const unitsOfAttr = attributeUnits
          .filter((au: any) => Number(au.attribute_id) === Number(attr.id))
          .map((au: any) => {
            const unit = units.find(
              (u: any) => Number(u.id) === Number(au.unit_id),
            );

            if (!unit) return null;
            const valuesOfUnit = values.filter(
              (v: any) =>
                Number(v.attribute_id) === Number(attr.id) &&
                Number(v.unit_id) === Number(unit.id),
            );

            return {
              ...unit,
              attributeUnitId: au.id,
              values: valuesOfUnit, // 🔥 giữ pivot id
            };
          })
          .filter(Boolean);

        return {
          ...attr,
          units: unitsOfAttr, // 👈 MANY units
        };
      })
      .filter(Boolean);
  }, [categoryAttributes, attributes, units, attributeUnits, values]);

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-20 text-center">
        <h3 className="text-xl font-bold">Category not found</h3>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/categories/industries")}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition"
          >
            <ChevronLeft size={20} />
          </button>

          <h1 className="text-2xl font-black">{category.name}</h1>
        </div>

        <div className="flex gap-3">
          {!isChildCategory && (
            <button
              onClick={() =>
                router.push(
                  `/admin/categories/industries/create?parentId=${category.id}`,
                )
              }
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:shadow-md transition"
            >
              <Plus size={16} />
              Subcategory
            </button>
          )}

          {isChildCategory && (
            <>
              {/* ATTRIBUTE */}
              <button
                onClick={() => setOpenAttributeModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:shadow-md transition"
              >
                <Plus size={16} />
                Attribute
              </button>

              {/* 🔥 BRAND */}
              <button
                onClick={() => setOpenBrandModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl shadow hover:shadow-md transition"
              >
                <Plus size={16} />
                Brand
              </button>
            </>
          )}

          <button
            onClick={() =>
              router.push(`/admin/categories/industries/${category.id}/edit`)
            }
            className="flex items-center gap-2 px-5 py-2 bg-white rounded-xl shadow hover:shadow-md transition"
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2 bg-white text-red-600 rounded-xl shadow hover:shadow-md transition"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="relative">
              <img
                src={category.thumbnailUrl}
                className="w-full h-60 object-cover"
              />

              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${StatusConfig[category.status].bgColor} ${StatusConfig[category.status].color}`}
                >
                  {StatusConfig[category.status].icon}
                  {StatusConfig[category.status].label}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-2">
              <div className="font-mono text-sm">{category.categoryCode}</div>

              <div className="text-sm text-slate-500">
                {category.description || "No description"}
              </div>
            </div>
          </div>
          {/* ===== BRAND ===== */}
          {isChildCategory && (
            <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                  🏷️ Brands
                </h3>

                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {linkedBrands.length}
                </span>
              </div>

              {loadingBrand ? (
                <p className="text-sm text-slate-400">Loading...</p>
              ) : linkedBrands.length === 0 ? (
                <p className="text-sm text-slate-400">No brands</p>
              ) : (
                <div className="space-y-2">
                  {displayedBrands.map((b: any) => {
                    return (
                      <div
                        key={b.categoryBrandId}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
                      >
                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                          {b.logo && (
                            <img
                              src={b.logo}
                              className="w-10 h-6 object-contain"
                            />
                          )}
                          <span className="text-sm font-semibold">
                            {b.name}
                          </span>
                        </div>

                        {/* RIGHT */}
                        <button
                          onClick={async () => {
                            const ok = confirm("Remove this brand?");
                            if (!ok) return;

                            await fetch(
                              `${API_URL}/api/category-brand/${b.categoryBrandId}`,
                              { method: "DELETE" },
                            );

                            refreshBrand();
                          }}
                          className="text-red-500 hover:text-red-700 text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {linkedBrands.length > 5 && (
                    <div className="text-center mt-3">
                      <button
                        onClick={() => setShowAllBrands(!showAllBrands)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {showAllBrands ? "Collapse" : "See more"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black uppercase flex items-center gap-2">
                {isChildCategory ? (
                  <Settings size={16} />
                ) : (
                  <Layers size={16} />
                )}
                {isChildCategory ? "Attributes" : "Subcategories"}
              </h3>

              {!isChildCategory && (
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {subCategories.length}
                </span>
              )}
            </div>

            {/* SUBCATEGORY */}
            {!isChildCategory && (
              <div className="space-y-2">
                {loadingSub ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : subCategories.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No subcategories found
                  </p>
                ) : (
                  <>
                    {subCategories.map((sub: any) => {
                      const isActive = Number(sub.is_active ?? 1) === 1;

                      return (
                        <div
                          key={sub.id}
                          onClick={() =>
                            router.push(
                              `/admin/categories/industries/${sub.id}`,
                            )
                          }
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition bg-white"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <span className="block font-bold text-sm text-slate-800 truncate">
                                {sub.category_name}
                              </span>
                              <span className="block text-[11px] text-slate-400">
                                CAT-{sub.id}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg ${isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {isActive ? "Active" : "Hidden"}
                            </span>

                            <ChevronLeft
                              size={14}
                              className="rotate-180 text-gray-400"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* ATTRIBUTES */}
            {isChildCategory &&
              (loadingAttr ? (
                <p className="text-sm text-slate-400">Loading attributes...</p>
              ) : linkedAttributes.length === 0 ? (
                <p className="text-sm text-slate-400">No attributes linked</p>
              ) : (
                <div className="space-y-2">
                  {linkedAttributes.map((attr: any) => {
                    if (!attr) return null;

                    return (
                      <div key={attr.id}>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => toggleAttr(attr.id)}
                          >
                            <span className="text-xs">
                              {collapsedAttrs.includes(attr.id) ? "▶" : "▼"}
                            </span>

                            {attr.option === "DROPDOWN" ? (
                              <List size={14} />
                            ) : (
                              <CircleDot size={14} />
                            )}

                            <span className="text-sm font-bold">
                              {attr.name}
                            </span>
                          </div>

                          {/* UNIT + ACTION */}
                          <div className="flex items-center gap-2">
                            {/* 🔥 ADD UNIT */}
                            <button
                              onClick={() => handleOpenUnitModal(attr)}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              + Unit
                            </button>

                            {/* 🔥 ADD VALUE (NO UNIT) */}
                            <button
                              onClick={() => handleOpenValueModal(attr, null)}
                              className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            >
                              + Value
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() => handleRemoveAttribute(attr)}
                              className="p-1 rounded hover:bg-red-100 text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {!collapsedAttrs.includes(attr.id) && (
                          <>
                            {attr.units && attr.units.length > 0 && (
                              <div className="flex flex-col gap-1 mt-1 ml-6">
                                {attr.units.map((u: any) => (
                                  <div key={u.id}>
                                    {/* UNIT */}
                                    <div className="flex items-center justify-between text-xs bg-white shadow-sm px-2 py-1 rounded">
                                      <div className="flex items-center gap-1">
                                        <Scale size={10} />
                                        {u.symbol}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() =>
                                            handleOpenValueModal(attr, u)
                                          }
                                          className="text-blue-500 hover:text-blue-700 text-[11px]"
                                        >
                                          + Value
                                        </button>

                                        <button
                                          onClick={() => handleRemoveUnit(u)}
                                          className="text-red-400 hover:text-red-600"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>

                                    {/* 🔥 VALUE LIST */}
                                    {u.values && u.values.length > 0 && (
                                      <div className="ml-6 mt-1 flex flex-col gap-1">
                                        {u.values.map((v: any) => (
                                          <div
                                            key={v.id}
                                            className="flex items-center justify-between text-[11px] px-2 py-1 bg-slate-100 rounded"
                                          >
                                            <span>{v.value}</span>

                                            {/* 🔥 NÚT XOÁ */}
                                            <button
                                              onClick={() =>
                                                handleRemoveValue(v)
                                              }
                                              className="text-red-400 hover:text-red-600 ml-2"
                                              title="Delete value"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {(!attr.units || attr.units.length === 0) && (
                              <div className="flex flex-col gap-1 mt-1 ml-6">
                                {values
                                  .filter(
                                    (v: any) =>
                                      Number(v.attribute_id) ===
                                      Number(attr.id),
                                  )
                                  .map((v: any) => (
                                    <div
                                      key={v.id}
                                      className="flex items-center justify-between text-[11px] px-2 py-1 bg-slate-100 rounded"
                                    >
                                      <span>{v.value}</span>

                                      <button
                                        onClick={() => handleRemoveValue(v)}
                                        className="text-red-400 hover:text-red-600"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <SelectAttributesModal
        open={openAttributeModal}
        onClose={() => setOpenAttributeModal(false)}
        attributes={attributes}
        existingIds={categoryAttributes.map((a) => Number(a.attributeId))}
        categoryId={category?.id}
        onSubmit={async (ids) => {
          try {
            await addAttributes(ids);
            info("Attributes added successfully");
            setOpenAttributeModal(false);
          } catch (err) {
            console.error(err);
            info("Add attributes failed");
          }
        }}
      />

      <SelectUnitModal
        open={openUnitModal}
        onClose={() => setOpenUnitModal(false)}
        units={units}
        attribute={selectedAttr}
        existingUnitIds={
          selectedAttr?.units?.map((u: any) => Number(u.id)) || []
        }
        onSubmit={async (unitId) => {
          if (!selectedAttr) return;

          try {
            await addAttributeUnit(Number(selectedAttr.id), Number(unitId));
            info("Unit added successfully");
            setOpenUnitModal(false);
          } catch (err) {
            console.error(err);
            info("Add unit failed");
          }
        }}
      />
      <CreateValueModal
        open={openValueModal}
        onClose={() => setOpenValueModal(false)}
        attribute={selectedAttr}
        unit={selectedUnit}
        onSubmit={async (value) => {
          if (!selectedAttr) return;

          const trimmedValue = value.trim();
          const alreadyExists = values.some(
            (item: any) =>
              Number(item.attribute_id) === Number(selectedAttr.id) &&
              normalizeAttributeValue(item.value) ===
                normalizeAttributeValue(trimmedValue),
          );

          if (alreadyExists) {
            showError(VALUE_EXISTS_MESSAGE);
            throw new Error(VALUE_EXISTS_MESSAGE);
          }

          try {
            await createValue({
              attribute_id: selectedAttr.id,
              unit_id: selectedUnit?.id ?? null,
              value: trimmedValue,
            });

            const label = selectedUnit
              ? `${trimmedValue} ${selectedUnit.symbol}`
              : trimmedValue;

            info(`Added: ${label}`);

            setOpenValueModal(false);
          } catch (err) {
            const message = getErrorMessage(err, "Add value failed");
            showError(message);
            throw new Error(message);
          }
        }}
      />
      <SelectBrandModal
        open={openBrandModal}
        onClose={() => setOpenBrandModal(false)}
        brands={brands}
        existingIds={linkedBrands.map((b: any) => Number(b.id))}
        categoryId={category?.id}
        loading={adding}
        onSubmit={async (ids: number[]) => {
          if (ids.length === 0) return;

          try {
            setAdding(true);

            await Promise.all(
              ids.map((brandId) =>
                fetch(`${API_URL}/api/category-brand`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    category_id: Number(category.id),
                    brand_id: brandId,
                    status: 1,
                  }),
                }),
              ),
            );

            refreshBrand?.();

            setOpenBrandModal(false);
          } catch (err) {
            console.error("Add brand failed:", err);
            alert("Add brand failed!");
          } finally {
            setAdding(false);
          }
        }}
      />
    </div>
  );
}
