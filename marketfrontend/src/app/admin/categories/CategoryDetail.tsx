"use client";

import React, { useMemo } from "react";
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
  const { info } = useToast();

  const { category, isLoading, deleteCategory } = useCategoryDetail(id);
  const { subCategories, loading: loadingSub } = useSubCategories(id);

  const { attributes } = useAttributes();
  const { units } = useUnits();

  /* DELETE */

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

  /* ATTRIBUTES */

  const linkedAttributes = useMemo(() => {
    if (!category || !attributes || !category.attributeIds) return [];

    return attributes
      .filter((attr: any) => category.attributeIds?.includes(attr.id))
      .map((attr: any) => {
        const unit = units?.find((u: any) => u.id === attr.unitId);

        return {
          ...attr,
          unitSymbol: unit?.symbol || null,
        };
      });
  }, [category, attributes, units]);

  /* LOADING */

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
            <ChevronLeft size={20}/>
          </button>

          <h1 className="text-2xl font-black">
            {category.name}
          </h1>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              router.push(`/admin/categories/industries/create?parentId=${category.id}`)
            }
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:shadow-md transition"
          >
            <Plus size={16}/>
            Subcategory
          </button>

          <button
            onClick={() =>
              router.push(`/admin/categories/industries/${category.id}/edit`)
            }
            className="flex items-center gap-2 px-5 py-2 bg-white rounded-xl shadow hover:shadow-md transition"
          >
            <Edit3 size={16}/>
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2 bg-white text-red-600 rounded-xl shadow hover:shadow-md transition"
          >
            <Trash2 size={16}/>
            Delete
          </button>

        </div>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT */}

        <div className="space-y-6">

          {/* CATEGORY CARD */}

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

              <div className="font-mono text-sm">
                {category.categoryCode}
              </div>

              <div className="text-sm text-slate-500">
                {category.description || "No description"}
              </div>

            </div>

          </div>

          {/* SPECIFICATIONS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h3 className="font-black text-sm uppercase flex items-center gap-2 mb-4">
              <Settings size={16}/>
              Specifications
            </h3>

            {linkedAttributes.length === 0 ? (
              <p className="text-sm text-slate-400">
                No attributes linked
              </p>
            ) : (

              <div className="space-y-2">

                {linkedAttributes.map((attr: any) => (

                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
                  >

                    <div className="flex items-center gap-2">

                      {attr.option === "DROPDOWN"
                        ? <List size={14}/>
                        : <CircleDot size={14}/>
                      }

                      <span className="text-sm font-bold">
                        {attr.name}
                      </span>

                    </div>

                    {attr.unitSymbol && (
                      <span className="text-xs bg-white shadow-sm px-2 rounded flex items-center gap-1">
                        <Scale size={10}/>
                        {attr.unitSymbol}
                      </span>
                    )}

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* RIGHT */}

        <div className="lg:col-span-2">

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-sm font-black uppercase flex items-center gap-2">
                <Layers size={16}/>
                Subcategories
              </h3>

              <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                {subCategories.length}
              </span>

            </div>

            {loadingSub ? (
              <p className="text-sm text-slate-400">
                Loading...
              </p>
            ) : subCategories.length === 0 ? (
              <p className="text-sm text-slate-400">
                No subcategories found
              </p>
            ) : (

              <div className="space-y-2">

                {subCategories.map((sub: any) => (

                  <div
                    key={sub.id}
                    onClick={() =>
                      router.push(`/admin/categories/industries/${sub.id}`)
                    }
                    className="flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition bg-white"
                  >

                    <span className="font-bold text-sm">
                      {sub.category_name}
                    </span>

                    <ChevronLeft
                      size={14}
                      className="rotate-180 text-gray-400"
                    />

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}