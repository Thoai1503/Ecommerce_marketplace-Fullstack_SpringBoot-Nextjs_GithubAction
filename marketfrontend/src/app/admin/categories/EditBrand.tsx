"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useBrands } from "@/hooks/admin/useBrands";
import { generateSlug } from "@/service/brands";
import { ChevronLeft, Save, UploadCloud } from "lucide-react";
import { API_URL } from "@/helper/api";

export default function EditBrand() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id as string;
  const isEditMode = !!id;
  const autoAddCategoryId = searchParams?.get("autoAddCategoryId");
  const initialBrandName = searchParams?.get("brandName") || "";

  const { brands, createBrand, updateBrand } = useBrands();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    name: initialBrandName,
    slug: "",
    logo: "",
    status: "ACTIVE",
  });

  // ================= LOAD DATA (EDIT) =================
  useEffect(() => {
    if (!isEditMode) {
      // For new brand, generate slug from initial name if provided
      if (initialBrandName) {
        setFormData((prev) => ({
          ...prev,
          name: initialBrandName,
          slug: generateSlug(initialBrandName),
        }));
      }
      return;
    }

    const found = brands.find((b: any) => b.id === id);
    if (!found) return;

    setFormData({
      name: found.name || "",
      slug: found.slug || "",
      logo: found.logo || "",
      status:
        found.status === 1 || found.status === "ACTIVE" ? "ACTIVE" : "HIDDEN",
    });

    setPreviewUrl(found.logo || "");
  }, [id, brands, isEditMode, initialBrandName]);

  // ================= NAME CHANGE =================
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  // ================= UPLOAD =================
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("file", file);

      // Gọi API backend (Marketplace-platform) thay vì API local
      const res = await fetch(`${API_URL}/api/upload/brand`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      setPreviewUrl(data.url);

      setFormData((prev) => ({
        ...prev,
        logo: data.url,
      }));
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Brand name is required");
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      logo: formData.logo,
      status: formData.status === "ACTIVE" ? 1 : 0,
    };

    try {
      setLoading(true);

      if (isEditMode) {
        await updateBrand({
          id,
          data: payload,
        });
        router.push("/admin/categories/brands");
      } else {
        // 🔥 Nếu có autoAddCategoryId, gọi API với param này
        if (autoAddCategoryId) {
          const response = await fetch(
            `${API_URL}/api/brands?autoAddCategoryId=${autoAddCategoryId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error("Create brand failed");
          }

          // ✅ Redirect trở lại trang Category Detail
          router.push(`/admin/categories/industries/${autoAddCategoryId}`);
        } else {
          await createBrand(payload);
          router.push("/admin/categories/brands");
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/categories/brands")}
            className="p-2 border rounded"
          >
            <ChevronLeft size={18} />
          </button>

          <h1 className="text-xl font-bold">
            {isEditMode ? "Edit Brand" : "Create Brand"}
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl space-y-4 border">
        {/* NAME */}
        <div>
          <label className="text-sm font-semibold">Brand Name *</label>
          <input
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="text-sm font-semibold">Slug</label>
          <input
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                slug: e.target.value,
              }))
            }
            className="w-full border px-3 py-2 rounded mt-1"
          />
        </div>

        {/* LOGO */}
        <div>
          <label className="text-sm font-semibold">Logo</label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 h-40 border-2 border-dashed flex items-center justify-center cursor-pointer rounded overflow-hidden"
          >
            {previewUrl ? (
              <img src={previewUrl} className="h-full object-contain" />
            ) : (
              <UploadCloud />
            )}

            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleUpload}
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
            className={`w-10 h-5 rounded-full ${
              formData.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span>{formData.status}</span>
        </div>
      </div>
    </div>
  );
}
