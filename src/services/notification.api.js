import { apiClient } from '@/services/api/axios';

export const notificationApi = {
  list: (params) => apiClient.get('/notifications', { params }).then((res) => res.data),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => apiClient.patch('/notifications/read-all').then((res) => res.data),
};
