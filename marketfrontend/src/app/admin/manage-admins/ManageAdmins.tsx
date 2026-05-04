
"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Plus, ShieldAlert, Sparkles, RefreshCcw, ShieldOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { CreateAdminPayload, createAdmin, getAdmins, grantAdmin, revokeAdmin, resetAdminPassword, updateAdminStatus } from '@/service/admin-management';
import { AdminUser } from '@/types';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import AdminListTable from '@/components/admin/manage-admins/AdminListTable';
import CreateAdminModal from '@/components/admin/manage-admins/CreateAdminModal';
import GrantAdminModal from '@/components/admin/manage-admins/GrantAdminModal';
import AdminActivityModal from '@/components/admin/manage-admins/AdminActivityModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function ManageAdminsPage() {
  const { user } = useAuth();
  const toast = useToast();

  // ── tất cả hooks phải khai báo trước mọi return có điều kiện ──
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [revokeModal, setRevokeModal] = useState<{ isOpen: boolean; admin: AdminUser | null }>({
    isOpen: false,
    admin: null,
  });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; admin: AdminUser | null }>({
    isOpen: false,
    admin: null,
  });
  const [resetModal, setResetModal] = useState<{ isOpen: boolean; admin: AdminUser | null }>({
    isOpen: false,
    admin: null,
  });
  const [activityModal, setActivityModal] = useState<{ isOpen: boolean; admin: AdminUser | null }>({
    isOpen: false,
    admin: null,
  });
  const [isRevoking, setIsRevoking] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canAccess = isSuperAdmin;
  // Chỉ SUPER_ADMIN được quản lý phân quyền Admin.
  const canManage = isSuperAdmin;

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error('Không thể tải danh sách admin');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) fetchAdmins();
  }, [canAccess]);

  const handleGrantAdmin = async (userId: number) => {
    setIsGranting(true);
    try {
      await grantAdmin(userId);
      toast.success('Đã cấp quyền Admin thành công');
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cấp quyền');
      throw error;
    } finally {
      setIsGranting(false);
    }
  };

  const handleCreateAdmin = async (payload: CreateAdminPayload) => {
    setIsCreating(true);
    try {
      await createAdmin(payload);
      toast.success('Đã tạo tài khoản Admin và gửi email thiết lập mật khẩu');
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tạo tài khoản Admin');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeModal.admin) return;
    setIsRevoking(true);
    try {
      await revokeAdmin(revokeModal.admin.userId ?? revokeModal.admin.id);
      toast.success(`Đã gỡ quyền Admin của ${revokeModal.admin.email}`);
      setRevokeModal({ isOpen: false, admin: null });
      fetchAdmins();
    } catch (error) {
      toast.error('Lỗi khi gỡ quyền');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleResetPasswordConfirm = async () => {
    if (!resetModal.admin) return;
    setIsResettingPassword(true);
    try {
      await resetAdminPassword(resetModal.admin.userId ?? resetModal.admin.id);
      toast.success(`Đã gửi link cấp lại mật khẩu đến ${resetModal.admin.email}`);
      setResetModal({ isOpen: false, admin: null });
    } catch {
      toast.error('Không thể gửi email cấp lại mật khẩu');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleStatusConfirm = async () => {
    if (!statusModal.admin) return;
    const nextStatus = statusModal.admin.accountActive === false ? 'ACTIVE' : 'BLOCKED';
    setIsUpdatingStatus(true);
    try {
      await updateAdminStatus(statusModal.admin.userId ?? statusModal.admin.id, nextStatus);
      toast.success(
        nextStatus === 'ACTIVE'
          ? `Đã mở khóa Admin ${statusModal.admin.email}`
          : `Đã khóa Admin ${statusModal.admin.email} và thu hồi phiên đăng nhập`
      );
      setStatusModal({ isOpen: false, admin: null });
      fetchAdmins();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể cập nhật trạng thái Admin');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ── guard: chặn user không có quyền ──
  if (user && !canAccess) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-5 bg-red-50 rounded-full">
          <ShieldOff size={48} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Không có quyền truy cập</h2>
        <p className="text-slate-500 font-medium text-center max-w-md">
          Trang này chỉ dành cho <span className="font-black text-indigo-600">Super Admin</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Admin', path: '/admin' },
              { label: 'Quản lý Admin' },
            ]}
          />
          <h1 className="text-4xl font-black text-slate-900 mt-2 flex items-center gap-4">
            Quản lý Admin <Shield className="text-blue-600" size={32} />
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Quản lý quyền Admin, cấp quyền mới và theo dõi hoạt động nội bộ.
          </p>
        </div>

        {/* Chỉ SUPER_ADMIN thấy nút Cấp quyền */}
        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-0 cursor-pointer"
          >
            <Plus size={20} /> Tạo Admin
          </button>
        )}

        {canManage && (
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-0 cursor-pointer"
          >
            <Plus size={20} /> Cấp quyền Admin
          </button>
        )}
      </div>

      {/* Info Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[32px] text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1">Tổng cộng</p>
            <h3 className="text-4xl font-black">{admins.length}</h3>
            <p className="text-xs font-bold text-blue-100/60 mt-2 italic">Tài khoản quản trị viên</p>
          </div>
          <Shield className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Bảo mật</p>
            <h3 className="text-xl font-black text-slate-900">2FA Active</h3>
            <p className="text-xs font-bold text-emerald-500 mt-1">Toàn hệ thống an toàn</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Hệ thống</p>
            <h3 className="text-xl font-black text-slate-900">v3.4.0</h3>
            <button
              onClick={fetchAdmins}
              className="text-xs font-bold text-blue-600 hover:underline mt-1 flex items-center gap-1 border-0 bg-transparent cursor-pointer"
            >
              <RefreshCcw size={12} /> Làm mới danh sách
            </button>
          </div>
        </div>
      </div>

      <AdminListTable
        admins={admins}
        isLoading={isLoading}
        onRevoke={(admin) => setRevokeModal({ isOpen: true, admin })}
        onResetPassword={(admin) => setResetModal({ isOpen: true, admin })}
        onToggleStatus={(admin) => setStatusModal({ isOpen: true, admin })}
        onViewActivity={(admin) => setActivityModal({ isOpen: true, admin })}
      />

      {/* Modals — chỉ SUPER_ADMIN được dùng */}
      {canManage && (
        <>
          <CreateAdminModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onConfirm={handleCreateAdmin}
            isLoading={isCreating}
          />

          <GrantAdminModal
            isOpen={isGrantModalOpen}
            onClose={() => setIsGrantModalOpen(false)}
            onConfirm={handleGrantAdmin}
            isLoading={isGranting}
            existingAdminEmails={admins.map((a) => a.email)}
          />

          <ConfirmationModal
            isOpen={revokeModal.isOpen}
            onClose={() => setRevokeModal({ isOpen: false, admin: null })}
            onConfirm={handleRevokeConfirm}
            title="Gỡ quyền Quản trị?"
            description={`Bạn có chắc chắn muốn gỡ quyền Admin của tài khoản ${revokeModal.admin?.email}? Tài khoản này sẽ không còn quyền truy cập vào bảng điều khiển.`}
            confirmLabel="Gỡ quyền ngay"
            variant="danger"
            isLoading={isRevoking}
          />

          <ConfirmationModal
            isOpen={statusModal.isOpen}
            onClose={() => setStatusModal({ isOpen: false, admin: null })}
            onConfirm={handleStatusConfirm}
            title={statusModal.admin?.accountActive === false ? 'Mở khóa Admin?' : 'Khóa Admin?'}
            description={
              statusModal.admin?.accountActive === false
                ? `Tài khoản ${statusModal.admin?.email} sẽ được phép đăng nhập lại vào bảng điều khiển.`
                : `Tài khoản ${statusModal.admin?.email} sẽ bị chặn đăng nhập và toàn bộ phiên đăng nhập hiện tại sẽ bị thu hồi.`
            }
            confirmLabel={statusModal.admin?.accountActive === false ? 'Mở khóa ngay' : 'Khóa ngay'}
            variant={statusModal.admin?.accountActive === false ? 'success' : 'warning'}
            isLoading={isUpdatingStatus}
          />

          <ConfirmationModal
            isOpen={resetModal.isOpen}
            onClose={() => setResetModal({ isOpen: false, admin: null })}
            onConfirm={handleResetPasswordConfirm}
            title="Cấp lại mật khẩu?"
            description={`Hệ thống sẽ gửi email đặt lại mật khẩu đến ${resetModal.admin?.email}. Link có thời hạn ngắn và chỉ dùng được một lần.`}
            confirmLabel="Gửi email"
            variant="info"
            isLoading={isResettingPassword}
          />

          <AdminActivityModal
            isOpen={activityModal.isOpen}
            admin={activityModal.admin}
            onClose={() => setActivityModal({ isOpen: false, admin: null })}
          />
        </>
      )}
    </div>
  );
}
