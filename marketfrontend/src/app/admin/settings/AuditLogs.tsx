"use client";

import React, { useEffect, useState } from 'react';
import { Activity, History } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getAuditLogs } from '@/service/audit-logs';
import { AuditLog } from '@/types';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import AuditLogTable from '@/components/admin/audit-logs/AuditLogTable';
import AuditLogFilters from '@/components/admin/audit-logs/AuditLogFilters';

const DEFAULT_SIZE = 50;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    search: '',
    action: 'ALL',
    resourceType: 'ALL',
    size: DEFAULT_SIZE,
  });

  const toast = useToast();

  const fetchLogs = async (currentFilters: any) => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs({ size: DEFAULT_SIZE, ...currentFilters });
      setLogs(data);
    } catch {
      toast.error('Không thể tải lịch sử hoạt động');
    } finally {
      setIsLoading(false);
    }
  };

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
    toast.success('Đang chuẩn bị file xuất bản ghi hoạt động (PDF)...');
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Cài đặt', path: '/admin/settings' },
              { label: 'Audit Log' }
            ]}
          />
          <h1 className="text-4xl font-black text-slate-900 mt-2 flex items-center gap-4">
            Lịch sử hoạt động <History className="text-blue-600" size={32} />
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Theo dõi hoạt động của người dùng, nhà bán hàng, sản phẩm, đơn hàng và hệ thống.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(filters)}
          className="p-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl shadow-sm transition-all cursor-pointer"
          title="Làm mới"
        >
          <Activity size={24} />
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
