import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';

let mockAuditLogs = [
  { id: '1', employeeId: '1', action: 'login_success', description: 'Signed in successfully', ipAddress: '49.36.12.5', device: 'Chrome on Windows', createdAt: '2026-07-11T09:02:00' },
  { id: '2', employeeId: '3', action: 'login_failed', description: 'Invalid password attempt', ipAddress: '117.98.4.21', device: 'Chrome on Android', createdAt: '2026-07-08T11:05:00' },
];

let nextAuditLogId = mockAuditLogs.length + 1;

export function addAuditLog({ employeeId, action, description, ipAddress = 'mock-client', device = 'Web' }) {
  if (!env.mockAuth) return;
  mockAuditLogs = [
    { id: String(nextAuditLogId++), employeeId, action, description, ipAddress, device, createdAt: new Date().toISOString() },
    ...mockAuditLogs,
  ];
}

export const auditLogApi = {
  list: (params) => {
    if (env.mockAuth) return Promise.resolve({ data: mockAuditLogs, total: mockAuditLogs.length });
    return apiClient.get('/audit-logs', { params }).then((res) => res.data);
  },
};
