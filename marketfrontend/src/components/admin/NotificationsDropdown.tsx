
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, ShoppingBag, AlertTriangle, Info, Check, Settings, MessageSquare, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/admin/useNotifications';
import { useRouter } from 'next/navigation';
import { AppNotification } from '@/types/index';

// Helper to format relative time (simplified)
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

const TypeIcon = ({ type }: { type: AppNotification['type'] }) => {
  switch (type) {
    case 'ORDER': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><ShoppingBag size={16} /></div>;
    case 'ALERT': return <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertTriangle size={16} /></div>;
    case 'SYSTEM': return <div className="p-2 bg-slate-100 text-slate-600 rounded-full"><Settings size={16} /></div>;
    case 'INFO': default: return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><Info size={16} /></div>;
  }
};

export default function NotificationsDropdown() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all border-0 ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      >
        <Bell size={22} strokeWidth={2} className={isOpen ? 'animate-tada' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Check size={12} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                <div className="p-4 bg-slate-50 rounded-full mb-3">
                   <Bell size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="shrink-0 pt-1">
                       <TypeIcon type={notif.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-0.5">
                          <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                             {notif.title}
                          </p>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 ml-2"></span>}
                       </div>
                       <p className="text-xs text-slate-500 line-clamp-2 mb-1.5 leading-relaxed">
                          {notif.message}
                       </p>
                       <p className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
                          {formatTime(notif.createdAt)}
                          {notif.link && (
                             <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 flex items-center gap-0.5">
                               • Xem ngay <ExternalLink size={10} />
                             </span>
                          )}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
             <button onClick={() => router.push('/admin/settings')} className="text-xs font-bold text-slate-500 hover:text-slate-800 py-1 transition-colors">
               Xem cài đặt thông báo
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
