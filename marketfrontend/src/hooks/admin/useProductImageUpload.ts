import { useCallback, useRef, useState } from "react";
import http from "@/lib/http";

interface UseProductImageUploadOptions {
  onAppend: (urls: string[]) => void;
  onToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

/**
 * Hook upload ảnh sản phẩm — tái sử dụng endpoint /admin/upload,
 * hỗ trợ upload nhiều file cùng lúc, hiển thị progress tổng thể.
 */
export function useProductImageUpload({ onAppend, onToast }: UseProductImageUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadOne = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      onToast(`"${file.name}" không phải file ảnh.`, "error");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast(`"${file.name}" vượt quá 5MB.`, "error");
      return null;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await http.post("/admin/upload", fd, {
        onUploadProgress: (evt: any) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      return res.data?.url ?? null;
    } catch (err: any) {
      console.error("[useProductImageUpload] failed", err);
      const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
      onToast(`Upload "${file.name}" thất bại: ${apiMsg || "lỗi không xác định"}`, "error");
      return null;
    }
  }, [onToast]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    const uploaded: string[] = [];
    for (const f of arr) {
      const url = await uploadOne(f);
      if (url) uploaded.push(url);
    }
    setIsUploading(false);
    setUploadProgress(0);
    if (uploaded.length > 0) {
      onAppend(uploaded);
      onToast(`Đã tải lên ${uploaded.length} ảnh.`, "success");
    }
  }, [uploadOne, onAppend, onToast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) await uploadFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clickFileInput = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    isUploading,
    uploadProgress,
    handleFileChange,
    clickFileInput,
    uploadFiles,
  };
}
