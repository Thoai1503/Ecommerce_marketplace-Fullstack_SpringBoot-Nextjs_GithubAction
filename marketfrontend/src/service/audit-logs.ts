import http from '@/lib/http';
import { AuditLog } from '@/types';

export interface AuditLogFilter {
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  search?: string;
  actorId?: number | string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

function mapLog(item: any): AuditLog {
  return {
    id: String(item.id),
    actorId: item.actorId,
    actorName: item.actorName ?? `User #${item.actorId}`,
    actorEmail: item.actorEmail ?? '',
    actorRole: item.actorRole ?? '',
    action: item.action ?? '',
    resourceType: item.resourceType ?? item.resource ?? '',
    resource: item.resourceType ?? item.resource ?? '',
    resourceId: item.resourceId,
    details: item.details ?? null,
    status: item.status ?? 'SUCCESS',
    ipAddress: item.ipAddress ?? '',
    createdAt: item.createdAt ?? '',
  };
}

export async function getAuditLogs(filters?: AuditLogFilter): Promise<AuditLog[]> {
  const params: Record<string, any> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 50,
  };
  if (filters?.action && filters.action !== 'ALL') params.action = filters.action;
  if (filters?.resourceType && filters.resourceType !== 'ALL') params.resourceType = filters.resourceType;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  if (filters?.actorId) params.actorId = filters.actorId;

  const res = await http.get('/admin/audit-logs/all', { params });
  const body = res.data;
  const items: any[] = Array.isArray(body) ? body : (body?.data ?? []);

  let logs = items.map(mapLog);

  // Client-side search filter (backend không hỗ trợ search by name)
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.actorName?.toLowerCase().includes(q) ||
        l.actorEmail?.toLowerCase().includes(q) ||
        l.actorId?.toString().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.resourceType.toLowerCase().includes(q) ||
        l.resourceId?.toString().includes(q) ||
        l.ipAddress?.toLowerCase().includes(q) ||
        JSON.stringify(l.details ?? {}).toLowerCase().includes(q)
    );
  }

  return logs;
}

export async function getMyAuditLogs(filters?: AuditLogFilter): Promise<AuditLog[]> {
  const params: Record<string, any> = {
    page: filters?.page ?? 0,
    size: filters?.size ?? 50,
  };
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;

  const res = await http.get('/admin/audit-logs/my-logs', { params });
  const body = res.data;
  const items: any[] = Array.isArray(body) ? body : (body?.data ?? []);
  return items.map(mapLog);
}
