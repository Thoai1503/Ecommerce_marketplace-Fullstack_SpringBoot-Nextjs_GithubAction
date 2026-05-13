
"use client";

import React from 'react';
import { PackageOpen, Plus, Search, FolderOpen, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'search' | 'data' | 'error';
  className?: string;
}

export default function EmptyState({ 
  title, 
  description, 
  icon, 
  actionLabel, 
  onAction,
  type = 'data',
  className = ''
}: EmptyStateProps) {
  
  // Default configurations based on type
  const defaultConfig = {
    search: {
      title: 'Không tìm thấy kết quả',
      description: 'Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn.',
      icon: <Search size={48} className="text-slate-300" />
    },
    data: {
      title: 'Chưa có dữ liệu',
      description: 'Hiện chưa có bản ghi nào trong danh sách.',
      icon: <PackageOpen size={48} className="text-slate-300" />
    },
    error: {
      title: 'Đã xảy ra lỗi',
      description: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
      icon: <AlertCircle size={48} className="text-red-300" />
    }
  };

  const config = defaultConfig[type];

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in duration-300 ${className}`}>
      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-slate-100">
        {icon || config.icon}
      </div>
      
      <h3 className="text-lg font-black text-slate-800 mb-2">
        {title || config.title}
      </h3>
      
      <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed mb-6">
        {description || config.description}
      </p>
      
      {actionLabel && onAction && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAction();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-1 border-0"
        >
          {type === 'search' ? null : <Plus size={18} />} {actionLabel}
        </button>
      )}
    </div>
  );
}
