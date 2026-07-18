import { apiClient } from '@/services/api/axios';

// The real backend writes audit log entries itself, server-side, on every
// request (backend's app.js auditLogger middleware). Kept as a no-op so
// existing call sites (auth.api.js, user.api.js, authStore.js) don't need
// to change — the entry they'd record is already written server-side.
export function addAuditLog() {}

export const auditLogApi = {
  list: (params) => apiClient.get('/audit-logs', { params }).then((res) => res.data),
};
