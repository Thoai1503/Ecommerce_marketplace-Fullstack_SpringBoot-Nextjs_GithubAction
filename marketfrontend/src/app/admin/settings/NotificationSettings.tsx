
"use client";

import React, { useState, useEffect } from 'react';
import { useNotificationSettings } from '../../../hooks/admin/useSettings';
import { Bell, Mail, ShieldAlert, Volume2, Layout, Save, RotateCcw, ShoppingBag, Package } from 'lucide-react';
import ToastComponent, { ToastType } from '../../../components/ui/Toast';
import { FormSkeleton } from '../../../components/ui/Skeleton';

// Toggle Component
const ToggleSwitch = ({ checked, onChange, disabled }: { checked: boolean; onChange: (val: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div
      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}
    />
  </button>
);

export default function NotificationSettings() {
  const { notifications, isLoading, updateNotifications, isUpdating } = useNotificationSettings();
  const [formData, setFormData] = useState({
    emailOrder: false,
    emailStock: false,
    emailWeeklyReport: false,
    systemSound: false,
    systemPopup: false,
    securityLogin: false,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (notifications) {
      setFormData({ ...notifications });
    }
  }, [notifications]);

  useEffect(() => {
    if (!notifications) return;
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(notifications);
    setIsDirty(hasChanged);
  }, [formData, notifications]);

  const handleToggle = (key: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    if (notifications) {
      setFormData({ ...notifications });
      setIsDirty(false);
      setToast({ id: Date.now().toString(), message: "Đã khôi phục cài đặt gốc.", type: 'info' });
    }
  };

  const handleSubmit = async () => {
    try {
      await updateNotifications(formData);
      setToast({ id: Date.now().toString(), message: "Cập nhật thông báo thành công!", type: 'success' });
      setIsDirty(false);
    } catch (e) {
      setToast({ id: Date.now().toString(), message: "Lỗi khi lưu cài đặt.", type: 'error' });
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {toast && <ToastComponent toast={toast} onClose={(id) => setToast(null)} />}

      {/* Floating Action Bar */}
      <div className={`fixed bottom-6 right-6 lg:right-10 z-50 flex items-center gap-3 p-2 bg-slate-900/90 backdrop-blur text-white rounded-2xl shadow-2xl transition-all duration-300 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
         <span className="text-sm font-bold pl-3 pr-2">Có thay đổi chưa lưu</span>
         <button 
           onClick={handleReset}
           className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
           title="Khôi phục"
         >
           <RotateCcw size={18} />
         </button>
         <button 
           onClick={handleSubmit} 
           disabled={isUpdating}
           className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all disabled:opacity-70"
         >
           {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
         </button>
      </div>

      {/* SECTION 1: Email Notifications */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Mail size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-800">Thông báo qua Email</h3>
              <p className="text-xs text-slate-500 font-medium">Quản lý các email tự động gửi đến hòm thư quản trị viên.</p>
           </div>
        </div>
        
        <div className="p-8 space-y-6">
           {/* Item 1 */}
           <div className="flex items-center justify-between group">
              <div className="flex gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ShoppingBag size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Đơn hàng mới</p>
                    <p className="text-xs text-slate-500 mt-0.5">Nhận email ngay khi có khách đặt hàng thành công.</p>
                 </div>
              </div>
              <ToggleSwitch checked={formData.emailOrder} onChange={() => handleToggle('emailOrder')} />
           </div>
           
           <div className="h-px bg-slate-100 w-full"></div>

           {/* Item 2 */}
           <div className="flex items-center justify-between group">
              <div className="flex gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <Package size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Cảnh báo tồn kho</p>
                    <p className="text-xs text-slate-500 mt-0.5">Thông báo khi sản phẩm sắp hết hàng (dưới 10 sản phẩm).</p>
                 </div>
              </div>
              <ToggleSwitch checked={formData.emailStock} onChange={() => handleToggle('emailStock')} />
           </div>

           <div className="h-px bg-slate-100 w-full"></div>

           {/* Item 3 */}
           <div className="flex items-center justify-between group">
              <div className="flex gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    <Layout size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Báo cáo tuần</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tổng hợp doanh thu và hiệu quả kinh doanh mỗi sáng Thứ 2.</p>
                 </div>
              </div>
              <ToggleSwitch checked={formData.emailWeeklyReport} onChange={() => handleToggle('emailWeeklyReport')} />
           </div>
        </div>
      </div>

      {/* SECTION 2: System Notifications */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
           <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Bell size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-800">Thông báo hệ thống</h3>
              <p className="text-xs text-slate-500 font-medium">Tùy chỉnh trải nghiệm thông báo ngay trên Dashboard.</p>
           </div>
        </div>

        <div className="p-8 space-y-6">
           {/* Item 1 */}
           <div className="flex items-center justify-between group">
              <div className="flex gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Volume2 size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Âm thanh thông báo</p>
                    <p className="text-xs text-slate-500 mt-0.5">Phát âm thanh "Ding" khi có thông báo mới.</p>
                 </div>
              </div>
              <ToggleSwitch checked={formData.systemSound} onChange={() => handleToggle('systemSound')} />
           </div>

           <div className="h-px bg-slate-100 w-full"></div>

           {/* Item 2 */}
           <div className="flex items-center justify-between group">
              <div className="flex gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Layout size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Hiển thị Popup (Toast)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hiện hộp thông báo nhỏ góc màn hình khi thao tác thành công.</p>
                 </div>
              </div>
              <ToggleSwitch checked={formData.systemPopup} onChange={() => handleToggle('systemPopup')} />
           </div>
        </div>
      </div>

      {/* SECTION 3: Security */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
           <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ShieldAlert size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-slate-800">Bảo mật</h3>
              <p className="text-xs text-slate-500 font-medium">Cảnh báo an toàn cho tài khoản Admin.</p>
           </div>
        </div>

        <div className="p-8">
           <div className="flex items-center justify-between group">
              <div className="flex gap-4">
                 <div className="p-2 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    <ShieldAlert size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Cảnh báo đăng nhập lạ</p>
                    <p className="text-xs text-slate-500 mt-0.5">Gửi email khi phát hiện đăng nhập từ thiết bị hoặc IP mới.</p>
                 </div>
              </div>
              <ToggleSwitch checked={formData.securityLogin} onChange={() => handleToggle('securityLogin')} />
           </div>
        </div>
      </div>

    </div>
  );
}
