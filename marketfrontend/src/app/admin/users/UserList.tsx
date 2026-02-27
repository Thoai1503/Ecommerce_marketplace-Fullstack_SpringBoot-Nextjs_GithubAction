
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, Shield, MoreVertical, CheckCircle, XCircle, 
  Lock, Unlock, UserCog, Filter, User as UserIcon, ShieldCheck
} from 'lucide-react';
import { useUsers } from '@/hooks/admin/useUsers';
import { User, UserRole, UserStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChangeRoleModal, BlockUserModal } from '@/components/admin/users/UserModals';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

// MOCK CONSTANT: Assume this is the ID of the currently logged-in Admin
const CURRENT_ADMIN_ID = 'U-0001'; 

const RoleConfig: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  ADMIN: { label: 'Quản trị viên', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  SELLER: { label: 'Người bán', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  USER: { label: 'Khách hàng', color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

const StatusLabel: Record<string, string> = {
  ALL: 'Tất cả',
  ACTIVE: 'Hoạt động',
  BLOCKED: 'Đã khóa'
};

export default function UserList() {
  const { users, isLoading, updateUserRole, toggleUserStatus, isUpdating } = useUsers();
  const { success, error } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null); // For handling the [⋮] menu

  // Modal States
  const [changeRoleModal, setChangeRoleModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [blockUserModal, setBlockUserModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Close menus when clicking outside
  React.useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // --- Handlers ---

  const handleRoleUpdate = async (role: UserRole) => {
    if (!changeRoleModal.user) return;
    try {
      await updateUserRole({ id: changeRoleModal.user.id, role });
      success('Cập nhật vai trò người dùng thành công.');
      setChangeRoleModal({ isOpen: false, user: null });
    } catch (error: any) {
      error(error.message || 'Lỗi khi cập nhật vai trò.');
      throw error;
    }
  };

  const handleBlockToggle = async () => {
    if (!blockUserModal.user) return;
    const newStatus = blockUserModal.user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await toggleUserStatus({ id: blockUserModal.user.id, status: newStatus });
      success(`Đã ${newStatus === 'BLOCKED' ? 'khóa' : 'mở khóa'} người dùng thành công.`);
      setBlockUserModal({ isOpen: false, user: null });
    } catch (err) {
      console.error(err);
      error('Lỗi khi cập nhật trạng thái.');
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500 space-y-6 pb-24">
      {/* MODALS */}
      {changeRoleModal.user && (
        <ChangeRoleModal 
          isOpen={changeRoleModal.isOpen}
          onClose={() => setChangeRoleModal({ isOpen: false, user: null })}
          onConfirm={handleRoleUpdate}
          user={changeRoleModal.user}
          isProcessing={isUpdating}
        />
      )}
      
      {blockUserModal.user && (
        <BlockUserModal 
          isOpen={blockUserModal.isOpen}
          onClose={() => setBlockUserModal({ isOpen: false, user: null })}
          onConfirm={handleBlockToggle}
          user={blockUserModal.user}
          isProcessing={isUpdating}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
           👤 Quản lý Người dùng (Users)
        </h1>
        <p className="text-sm text-slate-500 font-medium">Quản lý phân quyền, vai trò và trạng thái tài khoản.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-visible flex flex-col min-h-[600px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full lg:max-w-4xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm theo email hoặc ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-sm font-medium transition-shadow"
              />
            </div>
            
            {/* Role Filter */}
            <div className="relative hidden md:block">
               <select 
                 value={roleFilter}
                 onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1); }}
                 className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 cursor-pointer hover:bg-slate-50"
               >
                 <option value="ALL">Tất cả vai trò</option>
                 <option value="USER">Khách hàng</option>
                 <option value="SELLER">Người bán</option>
                 <option value="ADMIN">Quản trị viên</option>
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <Filter size={14} />
               </div>
            </div>

            {/* Status Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
               {['ALL', 'ACTIVE', 'BLOCKED'].map((status) => (
                 <button
                   key={status}
                   onClick={() => { setStatusFilter(status as any); setCurrentPage(1); }}
                   className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 ${statusFilter === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {StatusLabel[status]}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Title Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                Danh sách tài khoản
             </h3>
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {filteredUsers.length} tài khoản
             </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">EMAIL</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">VAI TRÒ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TRẠNG THÁI</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">NGÀY TẠO</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><Skeleton className="h-12 w-full" /></td></tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                         <Search size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">Không tìm thấy người dùng nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const roleStyle = RoleConfig[user.role];
                  const isCurrentUser = user.id === CURRENT_ADMIN_ID;
                  const isAdmin = user.role === 'ADMIN';

                  return (
                  <tr key={user.id} className={`hover:bg-slate-50/50 group ${isCurrentUser ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-6 py-5 text-center"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-6 py-5">
                       <span className="font-mono text-xs font-bold text-slate-500">{user.id}</span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
                             {isAdmin ? <ShieldCheck size={14} /> : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <p className={`text-sm font-bold ${isAdmin ? 'text-purple-700' : 'text-slate-800'}`}>
                                {user.email}
                             </p>
                             {isCurrentUser && <span className="text-[9px] font-bold text-blue-600">(Bạn)</span>}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${roleStyle.bgColor} ${roleStyle.color}`}>
                         {roleStyle.label}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       {user.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700">
                             <CheckCircle size={14} /> Hoạt động
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                             <XCircle size={14} /> Đã khóa
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="text-[10px] text-slate-400">Tham gia</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right relative">
                       <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === user.id ? null : user.id); }}
                          disabled={isCurrentUser}
                          className={`p-2 rounded-lg transition-all ${
                             isCurrentUser 
                             ? 'text-slate-200 cursor-not-allowed' 
                             : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                          }`}
                          title={isCurrentUser ? "Không thể chỉnh sửa chính mình" : "Quản lý"}
                       >
                          <MoreVertical size={18} />
                       </button>

                       {/* Context Menu */}
                       {activeMenu === user.id && !isCurrentUser && (
                          <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                             <button 
                               onClick={() => setChangeRoleModal({ isOpen: true, user })}
                               className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
                             >
                                <UserCog size={16} className="text-slate-400" /> Đổi vai trò...
                             </button>
                             {user.status === 'ACTIVE' ? (
                                <button 
                                  onClick={() => setBlockUserModal({ isOpen: true, user })}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                   <Lock size={16} /> Khóa tài khoản
                                </button>
                             ) : (
                                <button 
                                  onClick={() => setBlockUserModal({ isOpen: true, user })}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-green-600 hover:bg-green-50 flex items-center gap-2"
                                >
                                   <Unlock size={16} /> Mở khóa tài khoản
                                </button>
                             )}
                          </div>
                       )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>
    </div>
  );
}
