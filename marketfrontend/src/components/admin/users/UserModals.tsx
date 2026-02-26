
"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, AlertTriangle, UserCog, AlertCircle, ShoppingBag, User as UserIcon } from 'lucide-react';
import { UserRole, User } from '@/types';

// --- CONFIG FOR ROLES UX ---
const RoleUX: Record<UserRole, { label: string; description: string; icon: any; color: string; border: string; bg: string }> = {
  USER: { 
    label: 'Khách hàng (User)', 
    description: 'Có thể mua hàng, xem đơn hàng cá nhân.',
    icon: <UserIcon size={20} />,
    color: 'text-slate-600',
    border: 'border-slate-200',
    bg: 'bg-slate-50'
  },
  SELLER: { 
    label: 'Đối tác bán hàng (Seller)', 
    description: 'Quản lý sản phẩm, đơn hàng & doanh thu.',
    icon: <ShoppingBag size={20} />,
    color: 'text-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50'
  },
  ADMIN: { 
    label: 'Quản trị viên (Admin)', 
    description: 'Toàn quyền hệ thống & cài đặt.',
    icon: <Shield size={20} />,
    color: 'text-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50'
  }
};

// --- CHANGE ROLE MODAL ---
interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: UserRole) => Promise<void>;
  user: User;
  isProcessing: boolean;
}

export const ChangeRoleModal = ({ isOpen, onClose, onConfirm, user, isProcessing }: ChangeRoleModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setSelectedRole(user.role);
        setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
      setError(null);
      try {
          await onConfirm(selectedRole);
      } catch (err: any) {
          setError(err.message || "Lỗi cập nhật vai trò.");
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-full mx-auto mb-4 border-4 border-blue-100">
              <UserCog size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-800">Đổi vai trò người dùng</h3>
            <p className="text-sm text-slate-500 font-medium mt-1 bg-slate-100 inline-block px-3 py-1 rounded-full border border-slate-200">
              {user.email}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {(['USER', 'SELLER', 'ADMIN'] as UserRole[]).map((role) => {
              const config = RoleUX[role];
              const isSelected = selectedRole === role;
              
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
                    isSelected 
                      ? `${config.border} ${config.bg} ring-1 ring-offset-2 ring-blue-500/20` 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-white shadow-sm' : 'bg-slate-200 text-slate-500 group-hover:bg-white group-hover:text-slate-600'
                  } ${isSelected ? config.color : ''}`}>
                    {config.icon}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {config.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm absolute top-4 right-4">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedRole === 'SELLER' && user.role !== 'SELLER' && !error && (
             <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl flex gap-2 items-start border border-amber-100">
               <AlertTriangle size={16} className="shrink-0 mt-0.5" />
               <span>Lưu ý: Vui lòng đảm bảo người dùng đã hoàn tất xác minh KYC (CCCD/SĐT) trước khi nâng cấp lên Seller.</span>
             </div>
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent">Hủy bỏ</button>
          <button 
            onClick={handleConfirm}
            disabled={isProcessing || selectedRole === user.role}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all border-0"
          >
            {isProcessing ? 'Đang lưu...' : 'Xác nhận đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- BLOCK USER MODAL ---
interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User;
  isProcessing: boolean;
}

export const BlockUserModal = ({ isOpen, onClose, onConfirm, user, isProcessing }: BlockUserModalProps) => {
  if (!isOpen) return null;
  
  const isBlocking = user.status === 'ACTIVE'; // If active, action is to BLOCK

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 shadow-sm ${isBlocking ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-500 border-green-100'}`}>
            {isBlocking ? <Lock size={36} /> : <Unlock size={36} />}
          </div>
          
          <h3 className="text-xl font-black text-slate-800 mb-2">
            {isBlocking ? 'Khóa truy cập?' : 'Khôi phục truy cập?'}
          </h3>
          <p className="text-slate-500 text-sm font-medium mb-4 px-2">
            Bạn có chắc chắn muốn {isBlocking ? 'chặn (khóa)' : 'bỏ chặn (mở khóa)'} tài khoản <br/>
            <span className="font-bold text-slate-800">{user.email}</span>?
          </p>

          {isBlocking && (
            <div className="text-left bg-red-50 p-3 rounded-xl border border-red-100 mb-2">
                <p className="text-xs text-red-700 font-bold flex items-center gap-2 mb-1">
                   <AlertTriangle size={14} /> Hành động bảo mật:
                </p>
                <ul className="text-[10px] text-red-600 list-disc pl-5 space-y-0.5">
                   <li>Hệ thống sẽ buộc đăng xuất ngay lập tức.</li>
                   <li>Thu hồi toàn bộ token đang hoạt động.</li>
                </ul>
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all border-0 bg-transparent">Hủy bỏ</button>
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 py-3 text-white text-sm font-bold rounded-xl shadow-lg transition-all border-0 ${
              isBlocking 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
            }`}
          >
            {isProcessing ? 'Đang xử lý...' : (isBlocking ? 'Xác nhận khóa' : 'Xác nhận mở khóa')}
          </button>
        </div>
      </div>
    </div>
  );
};
