"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { SellerStatus } from "@/types/index";

const OPTIONS: Array<{ id: SellerStatus; label: string; desc: string; hint?: string }> = [
  {
    id: "PENDING",
    label: "PENDING (Chờ duyệt)",
    desc: "Chưa thể đăng bán, chờ admin duyệt hồ sơ.",
    hint: "Chọn nếu chưa verify xong, sẽ duyệt sau.",
  },
  { id: "ACTIVE", label: "ACTIVE (Hoạt động)", desc: "Được phép đăng bán và truy cập hệ thống." },
  { id: "BLOCKED", label: "BLOCKED (Khóa)", desc: "Tài khoản bị vô hiệu hóa tạm thời." },
];

const colorFor = (id: SellerStatus, selected: boolean) => {
  if (!selected) return { box: "bg-white border-slate-100 hover:border-slate-300", text: "text-slate-600" };
  if (id === "ACTIVE") return { box: "bg-green-50 border-green-500", text: "text-green-700" };
  if (id === "BLOCKED") return { box: "bg-red-50 border-red-500", text: "text-red-700" };
  return { box: "bg-amber-50 border-amber-500", text: "text-amber-700" };
};

interface Props {
  value: SellerStatus;
  onChange: (v: SellerStatus) => void;
  /** Ẩn BLOCKED khi CREATE mode (tạo mới rồi khóa ngay là vô nghĩa) */
  hideBlocked?: boolean;
}

export default function StatusSelector({ value, onChange, hideBlocked = false }: Props) {
  const visibleOptions = hideBlocked ? OPTIONS.filter((o) => o.id !== "BLOCKED") : OPTIONS;

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-6">
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
        <ShieldCheck size={18} className="text-green-500" /> Trạng thái hoạt động
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {visibleOptions.map((st) => {
          const selected = value === st.id;
          const c = colorFor(st.id, selected);
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onChange(st.id)}
              className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left relative ${c.box}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-black uppercase ${c.text}`}>{st.label}</span>
                {selected && <CheckCircle2 size={16} className="text-current" />}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">
                {st.desc}
              </span>
              {st.hint && (
                <span className="text-[10px] text-blue-600 mt-1.5 font-bold leading-tight flex items-center gap-1">
                  <Info size={10} /> {st.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
