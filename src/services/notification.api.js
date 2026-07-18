import { apiClient } from '@/services/api/axios';

// `type` (Ch17.10): information/success/warning/error/approval/reminder — the
// notification's display category. `category` is the separate, older
// action-button routing key (e.g. 'sales_order_review') used by
// NotificationList to decide which inline actions to render — unrelated to
// display type. `entityId` is exclusively a Sales Order id today (every
// call site in businessRules.js that sets it refers to a sales order) — the
// Communication Log's Delivery Status column looks it up as such
// (CommunicationLogTable.jsx). If entityId is ever used for another entity
// type, that lookup needs an accompanying `entityType` field to disambiguate.
export function addNotification({ title, message, type = 'information', category, entityId }) {
  return apiClient.post('/notifications', { title, message, type, category, entityId });
}

export const notificationApi = {
  list: (params) => apiClient.get('/notifications', { params }).then((res) => res.data),
  // notification.routes.js only implements GET/POST — no read/archive
  // route exists yet on the backend, so these can't be persisted server-side.
  markRead: (id) => Promise.resolve({ id, status: 'read' }),
  markAllRead: () => Promise.resolve({ success: true }),
  archive: (id) => Promise.resolve({ id, status: 'archived' }),
};
