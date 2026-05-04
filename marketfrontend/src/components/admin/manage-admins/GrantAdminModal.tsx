"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Search, UserCheck, AlertCircle } from 'lucide-react';
import { getUsers } from '@/service/users';
import { User } from '@/types';

interface GrantAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: number) => Promise<void>;
  isLoading: boolean;
  existingAdminEmails?: string[];
}

const GrantAdminModal: React.FC<GrantAdminModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  existingAdminEmails = [],
}) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    setSelectedUser(null);
    setError(null);
    setLoadingUsers(true);
    getUsers()
      .then((data) => {
        // Chỉ show USER thường (không phải admin)
        setUsers(data.filter((u) => u.role === 'USER' || u.role === 'SELLER'));
      })
      .catch(() => setError('Không thể tải danh sách người dùng'))
      .finally(() => setLoadingUsers(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = users.filter(
    (u) =>
      !existingAdminEmails.includes(u.email) &&
      (u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedUser) {
      setError('Vui lòng chọn một người dùng');
      return;
    }
    try {
      await onConfirm(Number(selectedUser.id));
      setSearch('');
      setSelectedUser(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cấp quyền');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-[500px] rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Cấp quyền Admin</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all border-0 bg-transparent cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-xs font-bold leading-relaxed">
              Người dùng sẽ có quyền truy cập bảng điều khiển Admin. Xác nhận đúng danh tính trước khi cấp quyền.
            </p>
          </div>

          {/* Search input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
              Tìm người dùng
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedUser(null); }}
                placeholder="Tìm theo email hoặc ID..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-800 text-sm transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          {/* User list */}
          <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-100 divide-y divide-slate-50">
            {loadingUsers ? (
              <div className="p-4 text-center text-xs text-slate-400 font-bold">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-bold">
                {search ? 'Không tìm thấy người dùng' : 'Không có người dùng phù hợp'}
              </div>
            ) : (
              filtered.slice(0, 20).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-0 cursor-pointer ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black uppercase shrink-0">
                    {user.email.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-400 font-medium">ID: {user.id}</p>
                  </div>
                  {selectedUser?.id === user.id && (
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {selectedUser && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700">
              Đã chọn: <span className="text-blue-900">{selectedUser.email}</span>
            </div>
          )}

          {error && <p className="text-xs font-bold text-red-500 px-1">{error}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl transition-all border-0 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedUser}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border-0 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserCheck size={20} /> Cấp quyền ngay</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrantAdminModal;
