
"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/context/ToastContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const queryClient = new QueryClient();

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="flex bg-white min-h-screen overflow-hidden">
        {/* Sidebar Component */}
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          isMobileOpen={isMobileOpen}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
        
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header with Menu Trigger for Mobile */}
          <AdminHeader onMenuClick={() => setIsMobileOpen(true)} />
          
          <main className="flex-1 overflow-y-auto bg-[#f8fafc] custom-scrollbar">
            <div className="max-w-[1600px] mx-auto min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}
