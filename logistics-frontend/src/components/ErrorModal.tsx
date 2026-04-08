"use client";

interface ErrorModalProps {
  open: boolean;
  title: string;
  detail?: string;
  onClose: () => void;
}

export function ErrorModal({ open, title, detail, onClose }: ErrorModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
        {/* Icon + header */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a.875.875 0 100-1.75.875.875 0 000 1.75z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          <div className="flex-1">
            <h2
              id="error-modal-title"
              className="text-base font-semibold text-zinc-900"
            >
              Có lỗi xảy ra
            </h2>
            <p className="mt-1 text-sm text-zinc-700">{title}</p>
            {detail && (
              <p className="mt-2 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                Chi tiết: {detail}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
