"use client";

import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff, Info, Key, Lock, Mail } from "lucide-react";

interface Props {
  authMethod: "invite" | "manual";
  onAuthMethodChange: (m: "invite" | "manual") => void;
  email: string;
  manualPassword: string;
  onManualPasswordChange: (v: string) => void;
  errorPassword?: string;
}

export default function AuthMethodSection({
  authMethod,
  onAuthMethodChange,
  email,
  manualPassword,
  onManualPasswordChange,
  errorPassword,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-4 animate-in slide-in-from-right-4 duration-500">
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
        <Key size={18} className="text-slate-600" /> Thiết lập mật khẩu
      </h3>

      <div className="space-y-4">
        {/* Method toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onAuthMethodChange("invite")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMethod === "invite"
                ? "bg-white shadow-sm text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Gửi Email Mời
          </button>
          <button
            type="button"
            onClick={() => onAuthMethodChange("manual")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMethod === "manual"
                ? "bg-white shadow-sm text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Tạo Thủ Công
          </button>
        </div>

        {authMethod === "invite" ? (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Email kích hoạt</p>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Hệ thống sẽ gửi link đặt mật khẩu đến{" "}
                  <strong>{email || "email này"}</strong>. Nhà bán hàng tự thiết lập mật khẩu khi đăng nhập lần đầu.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Mật khẩu khởi tạo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={manualPassword}
                onChange={(e) => onManualPasswordChange(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 text-sm font-bold tracking-wider ${
                  errorPassword
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:ring-blue-500/10"
                }`}
                placeholder="Nhập mật khẩu..."
              />
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errorPassword ? (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertCircle size={10} /> {errorPassword}
              </p>
            ) : (
              <div className="flex gap-2">
                <span
                  className={`h-1 flex-1 rounded-full ${
                    manualPassword.length > 0
                      ? manualPassword.length < 8
                        ? "bg-red-200"
                        : "bg-green-400"
                      : "bg-slate-100"
                  }`}
                />
                <span
                  className={`h-1 flex-1 rounded-full ${
                    manualPassword.length >= 8 ? "bg-green-400" : "bg-slate-100"
                  }`}
                />
                <span
                  className={`h-1 flex-1 rounded-full ${
                    manualPassword.length >= 12 ? "bg-green-400" : "bg-slate-100"
                  }`}
                />
              </div>
            )}
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Info size={10} /> Hãy chia sẻ mật khẩu này cho nhà bán hàng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
