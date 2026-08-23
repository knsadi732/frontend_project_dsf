import { apiClient } from '@/services/api/axios';

// In-app notification feed (bell icon) — `app_notifications` table,
// distinct from the backend's separate `/notifications` outbound email/SMS/
// push delivery queue (which requires a pre-registered template and isn't
// what this app-wide "you've been notified" feed needs). `type` (Ch17.10):
// information/success/warning/error/approval/reminder — the notification's
// display category. `category` is the separate, older action-button
// routing key (e.g. 'sales_order_review') used by NotificationList to
// decide which inline actions to render — unrelated to display type.
// `entityId` is exclusively a Sales Order id today (every call site in
// businessRules.js that sets it refers to a sales order) — the
// Communication Log's Delivery Status column looks it up as such
// (CommunicationLogTable.jsx). If entityId is ever used for another entity
// type, that lookup needs an accompanying `entityType` field to disambiguate.
export function addNotification({ title, message, type = 'information', category, entityId }) {
  return apiClient.post('/app-notifications', { title, message, type, category, entityId });
}

function fromBackendNotification(row) {
  return {
    ...row,
    entityId: row.entity_id,
    createdAt: row.created_at,
  };
}

export const notificationApi = {
  list: (params) =>
    apiClient.get('/app-notifications', { params }).then((res) => ({
      data: res.data.data.map(fromBackendNotification),
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  markRead: (id) => apiClient.patch(`/app-notifications/${id}/read`).then((res) => fromBackendNotification(res.data.data)),
  markAllRead: () => apiClient.patch('/app-notifications/mark-all-read'),
  archive: (id) => apiClient.patch(`/app-notifications/${id}/archive`).then((res) => fromBackendNotification(res.data.data)),
};
