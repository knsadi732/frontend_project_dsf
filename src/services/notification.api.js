import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';

let mockNotifications = [
  { id: '1', title: 'Low stock alert', message: 'SKU DSF-RUN-42 is below reorder level', read: false, createdAt: '2026-07-11T08:00:00' },
  { id: '2', title: 'New sales order', message: 'Order SO-1044 received from Sharma Footwear Traders', read: false, createdAt: '2026-07-10T16:45:00' },
  { id: '3', title: 'Purchase order approved', message: 'PO-1001 approved by Finance', read: true, createdAt: '2026-07-08T11:20:00' },
  { id: '4', title: 'Report ready', message: 'Sales Summary - June 2026 is ready to download', read: true, createdAt: '2026-07-01T10:16:00' },
];

let nextNotificationId = mockNotifications.length + 1;

export function addNotification({ title, message }) {
  if (!env.mockAuth) return;
  mockNotifications = [
    { id: String(nextNotificationId++), title, message, read: false, createdAt: new Date().toISOString() },
    ...mockNotifications,
  ];
}

export const notificationApi = {
  list: (params) => {
    if (env.mockAuth) return Promise.resolve({ data: mockNotifications, total: mockNotifications.length });
    return apiClient.get('/notifications', { params }).then((res) => res.data);
  },
  markRead: (id) => {
    if (env.mockAuth) {
      mockNotifications = mockNotifications.map((item) => (item.id === id ? { ...item, read: true } : item));
      return Promise.resolve(mockNotifications.find((item) => item.id === id));
    }
    return apiClient.patch(`/notifications/${id}/read`).then((res) => res.data);
  },
  markAllRead: () => {
    if (env.mockAuth) {
      mockNotifications = mockNotifications.map((item) => ({ ...item, read: true }));
      return Promise.resolve({ success: true });
    }
    return apiClient.patch('/notifications/read-all').then((res) => res.data);
  },
};
