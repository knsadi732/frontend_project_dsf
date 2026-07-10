import { apiClient } from '@/services/api/axios';

export const reportApi = {
  list: (params) => apiClient.get('/reports', { params }).then((res) => res.data),
  generate: (payload) => apiClient.post('/reports/generate', payload).then((res) => res.data),
  download: (id) =>
    apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }).then((res) => res.data),
};
