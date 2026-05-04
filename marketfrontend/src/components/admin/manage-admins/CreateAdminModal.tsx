"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Mail, Phone, Shield, User, UserPlus, X } from "lucide-react";
import { CreateAdminPayload } from "@/service/admin-management";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: CreateAdminPayload) => Promise<void>;
  isLoading: boolean;
}

export default function CreateAdminModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CreateAdminModalProps) {
  const [form, setForm] = useState<CreateAdminPayload>({
    email: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ email: "", fullName: "", phone: "" });
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = (field: keyof CreateAdminPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const email = form.email.trim().toLowerCase();
    const fullName = form.fullName.trim();
    const phone = form.phone?.trim();

    if (!email || !fullName) {
      setError("Vui lòng nhập đầy đủ email và họ tên.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    try {
      await onConfirm({ email, fullName, phone });
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể tạo tài khoản Admin.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[520px] rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Tạo Admin mới</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Super Admin Only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all border-0 bg-transparent cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 text-indigo-700">
            <Shield size={20} className="shrink-0" />
            <p className="text-xs font-bold leading-relaxed">
              Hệ thống sẽ tạo tài khoản Admin, gửi link thiết lập mật khẩu và ghi lại audit log.
            </p>
          </div>

          <Field label="Email Admin" icon={<Mail size={18} />}>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="admin@example.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800 text-sm transition-all"
            />
          </Field>

          <Field label="Họ tên" icon={<User size={18} />}>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Nguyễn Văn Admin"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800 text-sm transition-all"
            />
          </Field>

          <Field label="Số điện thoại" icon={<Phone size={18} />}>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="0901234567"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800 text-sm transition-all"
            />
          </Field>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-xs font-bold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl transition-all border-0 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border-0 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={20} /> Tạo Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        {children}
      </div>
    </div>
  );
}
