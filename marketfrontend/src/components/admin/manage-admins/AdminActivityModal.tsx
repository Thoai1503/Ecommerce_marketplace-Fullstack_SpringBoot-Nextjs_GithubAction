"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarClock, CheckCircle2, Clock, FileText, Loader2, Shield, UserRound, X } from 'lucide-react';
import { AdminUser, AuditLog } from '@/types';
import { getAuditLogs } from '@/service/audit-logs';

interface AdminActivityModalProps {
  isOpen: boolean;
  admin: AdminUser | null;
  onClose: () => void;
}

const actionLabels: Record<string, string> = {
  APPROVE_PRODUCT: 'Duyệt sản phẩm',
  REJECT_PRODUCT: 'Từ chối sản phẩm',
  APPROVE_PAYMENT: 'Duyệt thanh toán',
  BLOCK_SELLER: 'Khóa nhà bán',
  UNBLOCK_SELLER: 'Mở khóa nhà bán',
  BLOCK_USER: 'Khóa người dùng',
  UNBLOCK_USER: 'Mở khóa người dùng',
  BLOCK_ADMIN: 'Khóa Admin',
  UNBLOCK_ADMIN: 'Mở khóa Admin',
  GRANT_ADMIN_ROLE: 'Cấp quyền Admin',
  REVOKE_ADMIN_ROLE: 'Gỡ quyền Admin',
  RESET_ADMIN_PASSWORD: 'Cấp lại mật khẩu',
  CREATE_ADMIN_ACCOUNT: 'Tạo tài khoản Admin',
  CHANGE_USER_ROLE: 'Đổi vai trò người dùng',
  UPDATE_SETTINGS: 'Cập nhật cài đặt',
};

const resourceLabels: Record<string, string> = {
  PRODUCT: 'Sản phẩm',
  SHOP: 'Nhà bán',
  USER: 'Người dùng',
  ADMIN: 'Admin',
  ORDER: 'Đơn hàng',
  SYSTEM: 'Hệ thống',
};

function formatTime(value?: string) {
  if (!value) return 'Chưa ghi nhận';
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function summarizeDetails(details?: Record<string, any> | null) {
  if (!details || Object.keys(details).length === 0) return 'Không có dữ liệu bổ sung';
  if (details.targetEmail) return `Tài khoản: ${details.targetEmail}`;
  if (details.status) return `Trạng thái: ${details.status}`;
  if (details.reason) return `Lý do: ${details.reason}`;
  if (details.roleName) return `Vai trò: ${details.roleName}`;
  if (details.resetTokenSent) return 'Đã gửi link đặt lại mật khẩu';
  if (details.revokedSessions !== undefined) return `Thu hồi phiên: ${details.revokedSessions}`;
  return JSON.stringify(details);
}

export default function AdminActivityModal({ isOpen, admin, onClose }: AdminActivityModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminId = admin?.userId ?? admin?.id;
  const startDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString();
  }, []);

  useEffect(() => {
    if (!isOpen || !adminId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, adminId, onClose]);

  useEffect(() => {
    if (!isOpen || !adminId) return;

    setIsLoading(true);
    setError(null);
    getAuditLogs({
      actorId: adminId,
      startDate,
      endDate: new Date().toISOString(),
      size: 30,
    })
      .then(setLogs)
      .catch(() => setError('Không thể tải lịch sử hoạt động của Admin này.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, adminId, startDate]);

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[86vh] bg-white rounded-3xl shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Activity size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-black text-slate-900">Lịch sử hoạt động</h3>
              <p className="text-sm font-bold text-slate-500 truncate">{admin.email}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <Shield size={13} /> {admin.role}
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <CalendarClock size={13} /> 3 tháng gần nhất
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-0 bg-transparent cursor-pointer transition-all"
            title="Đóng"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(86vh-132px)]">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <p className="text-sm font-bold">Đang tải lịch sử hoạt động...</p>
            </div>
          ) : error ? (
            <div className="py-14 text-center text-red-500 text-sm font-bold">{error}</div>
          ) : logs.length === 0 ? (
            <div className="py-14 text-center">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-500">Admin này chưa có hoạt động nào trong 3 tháng gần nhất.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center border border-slate-100 shrink-0">
                        <UserRound size={17} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-900">{actionLabels[log.action] || log.action}</p>
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            {resourceLabels[log.resourceType] || log.resourceType}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Resource ID: <span className="font-mono font-bold">{log.resourceId ?? '--'}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-2 break-words">{summarizeDetails(log.details)}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-left md:text-right">
                      <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} /> {log.status}
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-500 flex md:justify-end items-center gap-1.5">
                        <Clock size={13} /> {formatTime(log.createdAt)}
                      </p>
                      {log.ipAddress && <p className="mt-1 text-[10px] font-mono text-slate-400">{log.ipAddress}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
