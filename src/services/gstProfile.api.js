import { apiClient } from '@/services/api/axios';

// CA scope — finance.routes.js GET /finance/gst. Read-only, no mutation route.
export const gstProfileApi = {
  get: () => apiClient.get('/finance/gst').then((res) => res.data.data),
};
