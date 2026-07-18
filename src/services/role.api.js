import { apiClient } from '@/services/api/axios';

// GET /roles — real backend, no other verbs documented/needed here (roles
// are seeded per-tenant, not created from this UI yet).
export const roleApi = {
  list: (params) =>
    apiClient.get('/roles', { params }).then((res) => ({
      data: res.data.data,
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
};
