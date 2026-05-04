
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GeneralSettings from './GeneralSettings';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import AuditLogsSettings from './AuditLogsSettings';
import { Settings, CreditCard, Truck, Bell, Shield, ChevronRight, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type SettingsTab = 'general' | 'profile' | 'payment' | 'shipping' | 'notifications' | 'audit-logs';

// Nội dung chính của trang Settings, dùng useSearchParams bên trong Suspense
function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab;
    const valid: SettingsTab[] = ['general', 'profile', 'payment', 'shipping', 'notifications', 'audit-logs'];
    if (tabParam && valid.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/admin/settings?tab=${tab}`);
  };

  const tabs = [
    { id: 'general', label: 'Cấu hình chung', icon: <Settings size={18} />, desc: 'Thông tin cửa hàng & hệ thống' },
    { id: 'profile', label: 'Hồ sơ & Bảo mật', icon: <Shield size={18} />, desc: 'Tài khoản admin & mật khẩu' },
    { id: 'notifications', label: 'Thông báo', icon: <Bell size={18} />, desc: 'Email & Cảnh báo hệ thống' },
    { id: 'payment', label: 'Thanh toán', icon: <CreditCard size={18} />, disabled: true },
    { id: 'shipping', label: 'Vận chuyển', icon: <Truck size={18} />, disabled: true },
    ...(isSuperAdmin ? [{ id: 'audit-logs', label: 'Audit Log Hệ Thống', icon: <ClipboardList size={18} />, desc: 'Lịch sử hoạt động toàn hệ thống' }] : []),
  ] as Array<{ id: string; label: string; icon: React.ReactNode; desc?: string; disabled?: boolean }>;

  return (
    <div className="min-h-screen pb-20">
      {/* Header Background */}
      <div className="bg-white border-b border-slate-200 px-6 py-8 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="font-bold text-slate-800">Cài đặt hệ thống</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
             ⚙️ Cài đặt
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            Quản lý thông tin cửa hàng, cấu hình hệ thống và thiết lập bảo mật cho tài khoản quản trị viên.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation (Desktop) / Horizontal Scroll (Mobile) */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-1">
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 hidden lg:block">Menu Cài đặt</h3>
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && handleTabChange(tab.id as SettingsTab)}
                    disabled={tab.disabled}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal group ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent hover:border-slate-200'
                    } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={activeTab === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}>
                      {tab.icon}
                    </div>
                    <div className="text-left">
                      <div className="leading-none">{tab.label}</div>
                      {activeTab === tab.id && (
                        <div className="text-[10px] font-medium opacity-80 mt-1 hidden lg:block">{tab.desc}</div>
                      )}
                    </div>
                    {tab.disabled && <span className="ml-auto text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">Soon</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'audit-logs' && isSuperAdmin && <AuditLogsSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Bọc SettingsContent trong Suspense để tuân thủ yêu cầu của Next.js với useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải cấu hình...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
