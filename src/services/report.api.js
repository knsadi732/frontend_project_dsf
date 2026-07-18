import { apiClient } from '@/services/api/axios';

// No backend route exists for reports yet (not in backend_project_dsf/src/routes) —
// these calls will 404 until the backend adds a /reports service.
export const reportApi = {
  list: (params) => apiClient.get('/reports', { params }).then((res) => res.data),
  generate: (payload) => apiClient.post('/reports/generate', payload).then((res) => res.data),
  download: (id) => apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }).then((res) => res.data),
};
