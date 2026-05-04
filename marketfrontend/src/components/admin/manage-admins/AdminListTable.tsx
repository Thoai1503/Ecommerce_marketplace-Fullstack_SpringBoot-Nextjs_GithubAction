
import React, { useState } from 'react';
import { Activity, MoreVertical, Shield, ShieldCheck, Mail, Calendar, Key, UserMinus, Lock, Unlock } from 'lucide-react';
import { AdminUser } from '@/types';
import Pagination from '@/components/ui/Pagination';

interface AdminListTableProps {
  admins: AdminUser[];
  isLoading: boolean;
  onRevoke: (admin: AdminUser) => void;
  onResetPassword: (admin: AdminUser) => void;
  onToggleStatus: (admin: AdminUser) => void;
  onViewActivity: (admin: AdminUser) => void;
}

const AdminListTable: React.FC<AdminListTableProps> = ({ 
  admins, 
  isLoading, 
  onRevoke, 
  onResetPassword,
  onToggleStatus,
  onViewActivity
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const paginatedAdmins = admins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const closeDropdown = () => setActiveDropdown(null);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quyền hạn</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày tạo</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Truy cập cuối</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-full"></div></td>
                </tr>
              ))
            ) : paginatedAdmins.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">Chưa có quản trị viên nào.</td>
              </tr>
            ) : (
              paginatedAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400 text-center">{admin.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 font-black text-sm uppercase">
                        {admin.email.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 truncate tracking-tight">{admin.email}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Mail size={10} /> Contact Email
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {admin.role === 'SUPER_ADMIN' ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-w-[104px] items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 cursor-not-allowed"
                        title="Super Admin không thể bị khóa tại màn hình này"
                      >
                        <ShieldCheck size={12} /> Bảo vệ
                      </button>
                    ) : admin.accountActive === false ? (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(admin)}
                        className="inline-flex min-w-[104px] items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100/70 hover:bg-red-100 transition-all cursor-pointer"
                        title="Mở khóa Admin"
                      >
                        <Lock size={12} /> Blocked
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(admin)}
                        className="inline-flex min-w-[104px] items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100/70 hover:bg-emerald-100 transition-all cursor-pointer"
                        title="Khóa Admin"
                      >
                        <Unlock size={12} /> Active
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {admin.role === 'SUPER_ADMIN' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                        <ShieldCheck size={12} /> Super Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                        <Shield size={12} /> Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(admin.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Chưa có'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-flex items-center justify-end gap-2 text-left">
                      <button
                        type="button"
                        onClick={() => onResetPassword(admin)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-black border border-blue-100 hover:bg-blue-100 transition-all cursor-pointer"
                        title="Gửi email cấp lại mật khẩu"
                      >
                        <Key size={15} /> Cấp lại mật khẩu
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewActivity(admin)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-black border border-indigo-100 hover:bg-indigo-100 transition-all cursor-pointer"
                        title="Xem lịch sử hoạt động"
                      >
                        <Activity size={15} /> Xem hoạt động
                      </button>
                      <button 
                        onClick={(e) => toggleDropdown(e, admin.id)}
                        className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all border-0 bg-transparent cursor-pointer"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {activeDropdown === admin.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 p-2 z-[60] animate-in fade-in zoom-in duration-200">
                          {admin.role !== 'SUPER_ADMIN' && (
                            <button
                               onClick={() => onRevoke(admin)}
                               className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                            >
                              <UserMinus size={16} /> Bỏ quyền Admin
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={admins.length}
          />
        </div>
      )}
    </div>
  );
};

export default AdminListTable;
