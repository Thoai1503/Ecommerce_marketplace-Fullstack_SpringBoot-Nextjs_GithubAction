
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      
      {/* Icon Graphic */}
      <div className="relative mb-8 group cursor-default">
        <div className="w-32 h-32 bg-red-50 rounded-[2.5rem] flex items-center justify-center shadow-sm border border-red-100 relative z-10 transition-transform group-hover:scale-105 duration-300">
          <ShieldAlert size={64} className="text-red-500 drop-shadow-sm" />
        </div>
        <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 z-20 rotate-12 group-hover:rotate-0 transition-transform duration-300">
           <Lock size={24} className="text-slate-400" />
        </div>
        {/* Decor circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-100/30 rounded-full blur-2xl -z-10 group-hover:bg-red-100/50 transition-colors"></div>
      </div>
      
      <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">403</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Quyền truy cập bị từ chối</h2>
      
      <p className="text-slate-500 font-medium max-w-md mb-10 leading-relaxed text-lg">
        Xin lỗi, bạn không có quyền truy cập vào trang này. 
        Vui lòng kiểm tra lại tài khoản hoặc liên hệ quản trị viên để được hỗ trợ.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        
        <button 
          onClick={() => router.push('/admin')}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 border-0 active:scale-95"
        >
          <Home size={20} /> Trang chủ
        </button>
      </div>

      <div className="mt-16 py-3 px-6 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-3">
         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Error Code: ACCESS_DENIED_403
         </p>
      </div>
    </div>
  );
}
