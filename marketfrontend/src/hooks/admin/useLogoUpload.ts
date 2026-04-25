import { useCallback, useEffect, useRef, useState } from "react";
import http from "@/lib/http";

export interface LogoFileMetadata {
  name: string;
  size: number;
  width: number;
  height: number;
}

interface UseLogoUploadOptions {
  /** Gọi khi upload xong → parent cập nhật formData.logoUrl */
  onUrlChange: (url: string) => void;
  /** Toast helper do parent truyền vào (đã có format sẵn). */
  onToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

/**
 * Quản lý toàn bộ state + logic cho upload logo: validate, auto-crop vuông,
 * preview bằng blob URL, progress, retry khi fail, drag & drop.
 */
export function useLogoUpload({ onUrlChange, onToast }: UseLogoUploadOptions) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileMetadata, setFileMetadata] = useState<LogoFileMetadata | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const revokePreviousUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokePreviousUrl();
  }, [revokePreviousUrl]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const loadImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const dims = { width: img.width, height: img.height };
        URL.revokeObjectURL(url);
        resolve(dims);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Không đọc được ảnh"));
      };
      img.src = url;
    });

  const cropImageToSquare = (file: File) =>
    new Promise<File>((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error("Trình duyệt không hỗ trợ canvas"));
        }
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("Crop thất bại"));
            resolve(new File([blob], file.name, { type: file.type || "image/jpeg" }));
          },
          file.type || "image/jpeg",
          0.92,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Không load được ảnh"));
      };
      img.src = url;
    });

  const uploadToServer = useCallback(
    async (file: File) => {
      setUploadError(null);
      try {
        setIsUploading(true);
        setUploadProgress(0);
        const fd = new FormData();
        fd.append("file", file);
        const res = await http.post("/admin/upload", fd, {
          onUploadProgress: (evt: any) => {
            if (evt.total) {
              setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
            }
          },
        });
        const uploadedUrl = res.data?.url;
        if (uploadedUrl) {
          revokePreviousUrl();
          onUrlChange(uploadedUrl);
          onToast("Tải ảnh lên thành công.", "success");
        }
      } catch (err: any) {
        console.error("[useLogoUpload] upload error:", err);
        const apiMsg =
          err?.response?.data?.message || err?.response?.data || err?.message;
        const friendly = typeof apiMsg === "string" && apiMsg ? apiMsg : "Tải ảnh lên thất bại";
        setUploadError(friendly);
        onToast(`Upload lỗi: ${friendly}. Nhấn "Thử lại".`, "error");
      } finally {
        setIsUploading(false);
      }
    },
    [onUrlChange, onToast, revokePreviousUrl],
  );

  const processFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      if (!file.type.startsWith("image/")) {
        onToast("Chỉ hỗ trợ file ảnh (PNG, JPG, WEBP).", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onToast("Ảnh tối đa 5MB.", "error");
        return;
      }

      let dims: { width: number; height: number };
      try {
        dims = await loadImageDimensions(file);
      } catch {
        onToast("Không đọc được ảnh. File có thể bị lỗi.", "error");
        return;
      }
      if (dims.width < 200 || dims.height < 200) {
        onToast(
          `Ảnh tối thiểu 200×200px (hiện tại ${dims.width}×${dims.height}).`,
          "error",
        );
        return;
      }

      let finalFile = file;
      if (dims.width !== dims.height) {
        try {
          finalFile = await cropImageToSquare(file);
        } catch (err) {
          console.warn("[useLogoUpload] crop failed, dùng file gốc:", err);
        }
      }

      const finalDims =
        finalFile === file ? dims : await loadImageDimensions(finalFile).catch(() => dims);
      setFileMetadata({
        name: file.name,
        size: finalFile.size,
        width: finalDims.width,
        height: finalDims.height,
      });
      setLastFile(finalFile);

      revokePreviousUrl();
      const previewUrl = URL.createObjectURL(finalFile);
      previewUrlRef.current = previewUrl;
      onUrlChange(previewUrl);

      await uploadToServer(finalFile);
    },
    [onToast, onUrlChange, revokePreviousUrl, uploadToServer],
  );

  const clickFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    revokePreviousUrl();
    onUrlChange("");
    setFileMetadata(null);
    setLastFile(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const retry = () => {
    if (lastFile && !isUploading) uploadToServer(lastFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  /** Reset toàn bộ state về rỗng (dùng sau khi create thành công). */
  const reset = () => {
    revokePreviousUrl();
    setFileMetadata(null);
    setLastFile(null);
    setUploadError(null);
    setUploadProgress(0);
  };

  return {
    fileInputRef,
    isUploading,
    uploadProgress,
    fileMetadata,
    isDragging,
    lastFile,
    uploadError,
    formatBytes,
    clickFileInput,
    handleFileChange,
    removeLogo,
    retry,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset,
  };
}
