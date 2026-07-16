import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { logNotificationEvent, markCommunicationLogRead } from '@/services/communicationLog.api';

// `type` (Ch17.10): information/success/warning/error/approval/reminder — the
// notification's display category. `category` is the separate, older
// action-button routing key (e.g. 'sales_order_review') used by
// NotificationList to decide which inline actions to render — unrelated to
// display type. `entityId` is exclusively a Sales Order id today (every
// call site in businessRules.js that sets it refers to a sales order) — the
// Communication Log's Delivery Status column looks it up as such
// (CommunicationLogTable.jsx). If entityId is ever used for another entity
// type, that lookup needs an accompanying `entityType` field to disambiguate.
let mockNotifications = [];

let nextNotificationId = mockNotifications.length + 1;

export function addNotification({ title, message, type = 'information', category, entityId }) {
  if (!env.mockAuth) return;
  const notification = {
    id: String(nextNotificationId++),
    title,
    message,
    type,
    category,
    entityId,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };
  mockNotifications = [notification, ...mockNotifications];
  logNotificationEvent(notification);
}

export const notificationApi = {
  list: (params) => {
    if (env.mockAuth) return Promise.resolve({ data: mockNotifications, total: mockNotifications.length });
    return apiClient.get('/notifications', { params }).then((res) => res.data);
  },
  markRead: (id) => {
    if (env.mockAuth) {
      mockNotifications = mockNotifications.map((item) => (item.id === id ? { ...item, status: 'read' } : item));
      markCommunicationLogRead(id);
      return Promise.resolve(mockNotifications.find((item) => item.id === id));
    }
    return apiClient.patch(`/notifications/${id}/read`).then((res) => res.data);
  },
  markAllRead: () => {
    if (env.mockAuth) {
      mockNotifications = mockNotifications.map((item) => (item.status === 'unread' ? { ...item, status: 'read' } : item));
      return Promise.resolve({ success: true });
    }
    return apiClient.patch('/notifications/read-all').then((res) => res.data);
  },
  archive: (id) => {
    if (env.mockAuth) {
      mockNotifications = mockNotifications.map((item) => (item.id === id ? { ...item, status: 'archived' } : item));
      return Promise.resolve(mockNotifications.find((item) => item.id === id));
    }
    return apiClient.patch(`/notifications/${id}/archive`).then((res) => res.data);
  },
};
