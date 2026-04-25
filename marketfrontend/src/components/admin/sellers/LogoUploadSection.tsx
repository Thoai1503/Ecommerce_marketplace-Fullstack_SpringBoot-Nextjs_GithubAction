"use client";

import React from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileImage,
  RotateCw,
  Store,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { LogoFileMetadata } from "@/hooks/admin/useLogoUpload";

interface Props {
  logoUrl: string;
  isUploading: boolean;
  uploadProgress: number;
  fileMetadata: LogoFileMetadata | null;
  isDragging: boolean;
  lastFile: File | null;
  uploadError: string | null;
  formatBytes: (b: number) => string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onRetry: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function LogoUploadSection(props: Props) {
  const {
    logoUrl,
    isUploading,
    uploadProgress,
    fileMetadata,
    isDragging,
    lastFile,
    uploadError,
    formatBytes,
    fileInputRef,
    onFileChange,
    onClick,
    onRemove,
    onRetry,
    onDragOver,
    onDragLeave,
    onDrop,
  } = props;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 border rounded-2xl transition-all ${
          isDragging
            ? "bg-blue-50 border-blue-400 border-dashed ring-4 ring-blue-100"
            : "bg-gradient-to-br from-blue-50/50 to-slate-50 border-slate-100"
        }`}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }}
            aria-label="Tải logo thương hiệu"
            aria-busy={isUploading}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all cursor-pointer overflow-hidden relative group ring-2 ring-slate-200 hover:ring-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="Logo thương hiệu"
                  className="w-full h-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                    <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                    <span className="text-[10px] font-black">{uploadProgress}%</span>
                  </div>
                )}
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={28} className="text-white" />
                  </div>
                )}
              </>
            ) : isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1" />
                <span className="text-[10px] font-black text-blue-600">
                  {uploadProgress}%
                </span>
              </div>
            ) : (
              <Store size={34} strokeWidth={1.5} />
            )}
          </div>
          {!isUploading && !logoUrl && (
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-md pointer-events-none">
              <Camera size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* Info + actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-black text-slate-800">Logo thương hiệu</h4>
            {logoUrl && !isUploading && !uploadError && (
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={10} /> Đã tải lên
              </span>
            )}
            {isUploading && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                Đang tải {uploadProgress}%
              </span>
            )}
            {uploadError && !isUploading && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle size={10} /> Lỗi
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-2">
            {isDragging
              ? "🎯 Thả file vào đây để tải lên..."
              : "Hình đại diện hiển thị trên trang chủ. Kéo-thả ảnh vào đây hoặc nhấn nút bên dưới. Ảnh sẽ được auto-crop vuông."}
          </p>

          {isUploading && (
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {fileMetadata && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium mb-2 truncate">
              <FileImage size={12} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[180px]" title={fileMetadata.name}>
                {fileMetadata.name}
              </span>
              <span className="text-slate-300">·</span>
              <span>{formatBytes(fileMetadata.size)}</span>
              <span className="text-slate-300">·</span>
              <span>
                {fileMetadata.width}×{fileMetadata.height}px
              </span>
            </div>
          )}

          {uploadError && !isUploading && (
            <div className="flex items-center gap-2 text-[11px] text-rose-700 font-medium mb-2">
              <AlertCircle size={12} className="shrink-0" />
              <span className="truncate">{uploadError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClick}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all disabled:opacity-50"
            >
              <UploadCloud size={14} />
              {logoUrl ? "Đổi ảnh khác" : "Tải ảnh lên"}
            </button>
            {uploadError && lastFile && !isUploading && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
              >
                <RotateCw size={14} />
                Thử lại
              </button>
            )}
            {logoUrl && !isUploading && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-all"
              >
                <Trash2 size={14} />
                Xóa
              </button>
            )}
            <span className="text-[11px] text-slate-400 font-medium ml-1">
              PNG, JPG, WEBP · Tối đa 5MB · Tối thiểu 200×200px
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
