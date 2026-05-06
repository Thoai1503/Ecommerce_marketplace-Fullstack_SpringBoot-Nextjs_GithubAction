"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAttributeDetail } from "../../../hooks/admin/useAttributes";
import { ChevronLeft, Save, AlertCircle, Eye } from "lucide-react";
import ToastComponent, { ToastType } from "../../../components/ui/Toast";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { API_URL } from "@/helper/api";

export default function EditAttribute() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = !!id;

  // 🔥 Get params from URL
  const autoAddCategoryId = searchParams?.get("autoAddCategoryId");
  const autoAddCategoryIdNum = autoAddCategoryId ? parseInt(autoAddCategoryId, 10) : null;
  const initialAttributeName = searchParams?.get("name") || "";

  const { attribute, isLoading, createAttribute, updateAttribute, isSaving } =
    useAttributeDetail(id || "");

  const [formData, setFormData] = useState({
    name: initialAttributeName,
    published: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (isEditMode && attribute) {
      setFormData({
        name: attribute.name,
        published: attribute.status === "ACTIVE",
      });
    } else if (!isEditMode && initialAttributeName) {
      // Pre-fill name for new attribute
      setFormData((prev) => ({
        ...prev,
        name: initialAttributeName,
      }));
    }
  }, [isEditMode, attribute, initialAttributeName]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!formData.name) {
      setToast({ message: "Attribute Name is required.", type: "error" });
      return;
    }

    // Prevent double submit
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name,
        status: formData.published ? 1 : 0,
      };

      if (isEditMode) {
        await updateAttribute(payload);
        setToast({ message: "Updated successfully!", type: "success" });
        setTimeout(() => router.push("/admin/categories/attributes"), 1000);
      } else {
        // 🔥 If autoAddCategoryId, call API with param
        if (autoAddCategoryIdNum) {
          const response = await fetch(
            `${API_URL}/api/attributes?autoAddCategoryId=${autoAddCategoryIdNum}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error("Create attribute failed");
          }

          setToast({ message: "Created successfully!", type: "success" });

          // ✅ Redirect back to Category Detail
          setTimeout(
            () => router.push(`/admin/categories/industries/${autoAddCategoryIdNum}`),
            1000
          );
        } else {
          await createAttribute(payload);
          setToast({ message: "Created successfully!", type: "success" });
          setTimeout(() => router.push("/admin/categories/attributes"), 1000);
        }
      }
    } catch {
      setToast({ message: "Error occurred.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="p-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 max-w-3xl mx-auto pb-24 space-y-6">
      {toast && (
        <ToastComponent
          toast={{ id: "1", message: toast.message, type: toast.type }}
          onClose={() => setToast(null)}
        />
      )}

      <Breadcrumbs
        items={[
          { label: "Attributes", path: "/admin/categories/attributes" },
          { label: isEditMode ? "Edit" : "New" },
        ]}
      />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/categories/attributes")}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-800">
              {isEditMode ? "Edit Attribute" : "Add Attribute"}
            </h1>
            <p className="text-sm text-slate-500">
              Configure attribute details.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isSubmitting || isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 space-y-6">
        {/* NAME */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
            Attribute Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl"
            placeholder="e.g. Color, Size"
          />
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Status</label>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  published: !formData.published,
                })
              }
              className={`relative w-12 h-6 rounded-full ${
                formData.published ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full ${
                  formData.published ? "translate-x-6" : ""
                }`}
              />
            </button>

            <span className="text-sm font-bold">
              {formData.published ? "Active" : "Hidden"}
            </span>
          </div>
        </div>

        {/* NOTE */}
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <AlertCircle size={12} />
          The slug will be automatically generated from the name.
        </p>
      </div>

      {/* PREVIEW */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
        <h3 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
          <Eye size={14} /> Preview
        </h3>

        <div className="p-6 bg-slate-50 border rounded-2xl text-center">
          <label className="text-sm font-bold block mb-2">
            {formData.name || "Attribute Name"}
          </label>

          <div className="px-3 py-2 bg-white border rounded-lg">
            Select value...
          </div>
        </div>
      </div>
    </div>
  );
}
