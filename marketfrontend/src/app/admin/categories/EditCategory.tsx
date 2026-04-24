"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCategoryDetail } from "../../../hooks/admin/useCategories";
import { generateSlug } from "../../../service/categories";
import { ChevronLeft, Save, UploadCloud } from "lucide-react";
import ToastComponent, { ToastType } from "../../../components/ui/Toast";
import { Skeleton } from "../../../components/ui/Skeleton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function CategoryForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params?.id as string;
  const parentIdQuery = searchParams.get("parentId");

  const isEditMode = !!id;

  const { category, isLoading, createCategory, updateCategory, isSaving } =
    useCategoryDetail(id || "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    thumbnailUrl: "",
    status: "ACTIVE",
    parentId: parentIdQuery ? Number(parentIdQuery) : 0,
    level: parentIdQuery ? 1 : 0,
  });

  /* ================= LOAD CATEGORY ================= */

  useEffect(() => {
    if (!isEditMode || !category) return;

    const c: any = category;

    const mapped = {
      name: c.name || c.category_name || "",
      slug: c.slug || c.category_slug || "",
      thumbnailUrl: c.thumbnailUrl || c.category_icon || "",
      status: c.status || (c.is_active === 1 ? "ACTIVE" : "HIDDEN"),
      parentId: c.parent_id ?? c.parentId ?? 0,
      level: c.level ?? 0,
    };

    setFormData(mapped);
    setPreviewUrl(mapped.thumbnailUrl);
  }, [category, isEditMode]);

  /* ================= NAME CHANGE ================= */

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  /* ================= IMAGE UPLOAD ================= */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload/category", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      setPreviewUrl(data.url);

      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: data.url,
      }));
    } catch (error) {
      console.error(error);

      setToast({
        message: "Upload image failed",
        type: "error",
      });
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setToast({
        message: "Category name is required",
        type: "error",
      });
      return;
    }
    // 🔥 FIX: khai báo ở đây
    const parentId =
      (category as any)?.parent_id ?? (category as any)?.parentId ?? 0;

    const level = (category as any)?.level ?? formData.level ?? 0;

    const payload = {
      parent_id: isEditMode ? parentId : formData.parentId,
      category_name: formData.name,
      category_slug: formData.slug,
      category_icon: formData.thumbnailUrl,
      level: isEditMode ? level : formData.level,
      is_active: formData.status === "ACTIVE" ? 1 : 0,
    };

    try {
      if (isEditMode) {
        await updateCategory(payload);
      } else {
        await createCategory(payload);
      }

      setTimeout(() => {
        if (isEditMode && parentId > 0) {
          router.push(`/admin/categories/industries/${parentId}`);
        } else {
          router.push("/admin/categories/industries");
        }
      }, 800);
    } catch (error) {
      console.error(error);
    }
  };
  /* ================= LOADING ================= */

  if (isEditMode && isLoading) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6 pb-24">
        {toast && (
          <ToastComponent
            toast={{ id: "1", message: toast.message, type: toast.type }}
            onClose={() => setToast(null)}
          />
        )}

        <Breadcrumbs
          items={[
            { label: "Industries", path: "/admin/categories/industries" },
            { label: isEditMode ? "Edit Category" : "Create Category" },
          ]}
        />

        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/categories/industries")}
              className="p-2 bg-white border rounded-xl"
            >
              <ChevronLeft size={20} />
            </button>

            <h1 className="text-2xl font-black">
              {isEditMode ? "Edit Category" : "Create Category"}
            </h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* FORM */}

        <div className="bg-white p-8 rounded-2xl border space-y-6">
          {!isEditMode && formData.parentId !== 0 && (
            <div className="text-sm text-slate-500">
              Parent Category ID :
              <span className="font-bold ml-2">{formData.parentId}</span>
            </div>
          )}

          {/* NAME */}

          <div className="space-y-2">
            <label className="text-sm font-bold">Category Name *</label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>

          {/* SLUG */}

          <div className="space-y-2">
            <label className="text-sm font-bold">Slug</label>

            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  slug: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>

          {/* IMAGE */}

          <div className="space-y-2">
            <label className="text-sm font-bold">Thumbnail</label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-50"
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <>
                  <UploadCloud size={40} className="text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">
                    Click to upload image
                  </p>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                hidden
              />
            </div>
          </div>

          {/* STATUS */}

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  status: prev.status === "ACTIVE" ? "HIDDEN" : "ACTIVE",
                }))
              }
              className={`relative w-12 h-6 rounded-full ${
                formData.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                  formData.status === "ACTIVE" ? "translate-x-6" : ""
                }`}
              />
            </button>

            <span className="font-bold text-sm">
              {formData.status === "ACTIVE" ? "Active" : "Hidden"}
            </span>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
