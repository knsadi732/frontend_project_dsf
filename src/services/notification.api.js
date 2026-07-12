import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { logNotificationEvent, markCommunicationLogRead } from '@/services/communicationLog.api';

// `type` (Ch17.10): information/success/warning/error/approval/reminder — the
// notification's display category. `category` is the separate, older
// action-button routing key (e.g. 'sales_order_review') used by
// NotificationList to decide which inline actions to render — unrelated to
// display type.
let mockNotifications = [
  { id: '1', title: 'Low stock alert', message: 'SKU DSF-RUN-42 is below reorder level', type: 'warning', status: 'unread', createdAt: '2026-07-11T08:00:00' },
  { id: '2', title: 'New sales order', message: 'Order SO-1044 received from Sharma Footwear Traders', type: 'approval', category: 'sales_order_review', status: 'unread', createdAt: '2026-07-10T16:45:00' },
  { id: '3', title: 'Purchase order approved', message: 'PO-1001 approved by Finance', type: 'success', status: 'read', createdAt: '2026-07-08T11:20:00' },
  { id: '4', title: 'Report ready', message: 'Sales Summary - June 2026 is ready to download', type: 'information', status: 'read', createdAt: '2026-07-01T10:16:00' },
];

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
