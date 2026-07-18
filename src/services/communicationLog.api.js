import { apiClient } from '@/services/api/axios';

// No backend route exists for communication logs yet (not in
// backend_project_dsf/src/routes) — list() will 404 until the backend adds
// a /communication-logs service. addCommunicationLog/logNotificationEvent/
// markCommunicationLogRead are no-ops kept so existing call sites
// (businessRules.js, notification.api.js) don't need to change.
export function addCommunicationLog() {}

export function logNotificationEvent() {}

export function markCommunicationLogRead() {}

export const communicationLogApi = {
  list: (params) => apiClient.get('/communication-logs', { params }).then((res) => res.data),
};
