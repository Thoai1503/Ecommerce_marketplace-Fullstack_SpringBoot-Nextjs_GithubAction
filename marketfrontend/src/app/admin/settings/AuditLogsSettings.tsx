"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardList, RefreshCcw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getAuditLogs } from '@/service/audit-logs';
import { AuditLog } from '@/types';
import AuditLogFilters from '@/components/admin/audit-logs/AuditLogFilters';
import AuditLogTable from '@/components/admin/audit-logs/AuditLogTable';

const DEFAULT_SIZE = 50;

export default function AuditLogsSettings() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    search: '',
    action: 'ALL',
    resourceType: 'ALL',
    size: DEFAULT_SIZE,
  });
  const toast = useToast();

  const fetchLogs = useCallback(async (currentFilters: any) => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs({ size: DEFAULT_SIZE, ...currentFilters });
      setLogs(data);
    } catch {
      setLogs([]);
      toast.error('Không thể tải lịch sử hoạt động');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLogs(filters);
  }, []);

  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...filters, ...newFilters, size: DEFAULT_SIZE };
    setFilters(updatedFilters);
    fetchLogs(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = { search: '', action: 'ALL', resourceType: 'ALL', size: DEFAULT_SIZE };
    setFilters(resetFilters);
    fetchLogs(resetFilters);
  };

  const handleExport = () => {
    toast.success('Đang chuẩn bị file xuất bản ghi hoạt động (CSV)...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <ClipboardList size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Audit Log Toàn Hệ Thống</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Theo dõi hoạt động liên quan người dùng, nhà bán hàng, sản phẩm, đơn hàng và hệ thống.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(filters)}
          className="ml-auto p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all border-0 bg-white cursor-pointer"
          title="Làm mới"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <AuditLogFilters
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        onExport={handleExport}
      />

      <AuditLogTable logs={logs} isLoading={isLoading} />
    </div>
  );
}
