import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  Info,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { AuditLog } from '@/types';
import Pagination from '@/components/ui/Pagination';

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}

const actionLabels: Record<string, string> = {
  APPROVE_PRODUCT: 'Duyệt sản phẩm',
  REJECT_PRODUCT: 'Từ chối sản phẩm',
  APPROVE_PAYMENT: 'Duyệt thanh toán',
  BLOCK_SELLER: 'Khóa nhà bán',
  UNBLOCK_SELLER: 'Mở khóa nhà bán',
  DELETE_SELLER: 'Xóa nhà bán',
  BLOCK_USER: 'Khóa người dùng',
  UNBLOCK_USER: 'Mở khóa người dùng',
  BLOCK_ADMIN: 'Khóa Admin',
  UNBLOCK_ADMIN: 'Mở khóa Admin',
  GRANT_ADMIN_ROLE: 'Cấp quyền Admin',
  REVOKE_ADMIN_ROLE: 'Gỡ quyền Admin',
  RESET_ADMIN_PASSWORD: 'Cấp lại mật khẩu',
  RESET_USER_PASSWORD: 'Cấp lại mật khẩu người dùng',
  RESET_SELLER_PASSWORD: 'Cấp lại mật khẩu nhà bán',
  CREATE_ADMIN_ACCOUNT: 'Tạo tài khoản Admin',
  CHANGE_USER_ROLE: 'Đổi vai trò người dùng',
  UPDATE_SETTINGS: 'Cập nhật cài đặt',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILURE: 'Đăng nhập thất bại',
};

const resourceLabels: Record<string, string> = {
  PRODUCT: 'Sản phẩm',
  SHOP: 'Nhà bán',
  USER: 'Người dùng',
  ADMIN: 'Admin',
  ORDER: 'Đơn hàng',
  SYSTEM: 'Hệ thống',
};

function actionStyle(action: string) {
  if (action.includes('APPROVE') || action.includes('UNBLOCK') || action === 'LOGIN_SUCCESS') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }
  if (action.includes('REJECT') || action.includes('BLOCK') || action.includes('REVOKE') || action.includes('DELETE') || action === 'LOGIN_FAILURE') {
    return 'bg-red-50 text-red-700 border-red-100';
  }
  if (action.includes('RESET') || action.includes('PASSWORD')) {
    return 'bg-blue-50 text-blue-700 border-blue-100';
  }
  if (action.includes('SETTINGS') || action.includes('CREATE') || action.includes('GRANT')) {
    return 'bg-purple-50 text-purple-700 border-purple-100';
  }
  return 'bg-slate-50 text-slate-700 border-slate-100';
}

function detailLabel(key: string) {
  const labels: Record<string, string> = {
    targetUserId: 'Tài khoản bị tác động',
    targetEmail: 'Email bị tác động',
    email: 'Email',
    fromRole: 'Vai trò cũ',
    toRole: 'Vai trò mới',
    roleName: 'Vai trò',
    reason: 'Lý do',
    revokedSessions: 'Số phiên bị thu hồi',
    status: 'Trạng thái',
    resetTokenSent: 'Đã gửi link reset',
    amount: 'Số tiền',
    note: 'Ghi chú',
  };
  return labels[key] ?? key;
}

function detailValue(value: any) {
  if (value === true) return 'Có';
  if (value === false) return 'Không';
  if (value === null || value === undefined || value === '') return '--';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function detailEntries(log: AuditLog) {
  const details = log.details ?? {};
  const entries = Object.entries(details);
  if (log.resourceId !== undefined && !details.resourceId) {
    entries.unshift(['resourceId', log.resourceId]);
  }
  return entries;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const itemsPerPage = 15;

  const totalPages = Math.max(1, Math.ceil(logs.length / itemsPerPage));
  const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người thực hiện</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài nguyên</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-6 py-5"><div className="h-8 bg-slate-100 rounded-xl w-full" /></td>
                </tr>
              ))
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">Không tìm thấy ghi chú hoạt động nào.</td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => toggleExpand(log.id)}
                    className={`cursor-pointer transition-colors ${expandedId === log.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400 text-center">#{log.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 capitalize text-xs font-black">
                          {(log.actorName || log.actorEmail || '?').charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-900 truncate tracking-tight">{log.actorName || `User #${log.actorId}`}</span>
                          <span className="text-[10px] text-slate-400 font-bold truncate">{log.actorEmail || log.actorRole}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${actionStyle(log.action)}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-0.5">{resourceLabels[log.resourceType] || log.resourceType}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">ID: {log.resourceId || '--'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <CheckCircle2 size={12} strokeWidth={3} /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                          <XCircle size={12} strokeWidth={3} /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">{new Date(log.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span className="text-[10px] font-bold text-slate-400 leading-none mt-0.5">{new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer">
                        {expandedId === log.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-slate-50/80 border-t border-slate-100/50">
                      <td colSpan={7} className="px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Info size={14} className="text-blue-500" /> Chi tiết hoạt động
                            </h5>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                              {detailEntries(log).length === 0 ? (
                                <p className="text-xs font-bold text-slate-400">Không có dữ liệu bổ sung</p>
                              ) : (
                                detailEntries(log).map(([key, value]) => (
                                  <div key={key} className="flex items-start justify-between gap-4 border-b border-slate-50 last:border-b-0 pb-2 last:pb-0">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{detailLabel(key)}</span>
                                    <span className="text-xs font-bold text-slate-700 text-right break-all">{detailValue(value)}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Globe size={14} className="text-blue-500" /> Thông tin môi trường
                            </h5>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">IP Address</span>
                                <span className="text-xs font-mono font-black text-slate-700">{log.ipAddress || '--'}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actor Email</span>
                                <span className="text-xs font-bold text-slate-700">{log.actorEmail || '--'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actor Role</span>
                                <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-600">
                                  <ShieldAlert size={13} /> {log.actorRole || '--'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs font-bold text-slate-400 italic">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, logs.length)} trên {logs.length} bản ghi
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={logs.length}
        />
      </div>
    </div>
  );
};

export default AuditLogTable;
