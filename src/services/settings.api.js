import { apiClient } from '@/services/api/axios';

// No frontend feature consumes this yet — added at the service layer to
// mirror ApiList.md; wiring up a Settings page is a separate feature-build
// task. Mirrors company.api.js's singleton GET/PATCH pattern.
export const settingsApi = {
  get: () => apiClient.get('/settings').then((res) => res.data.data),
  update: (payload) => apiClient.patch('/settings', payload).then((res) => res.data.data),
};
