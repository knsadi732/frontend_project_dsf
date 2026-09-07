import { apiClient } from '@/services/api/axios';

// Backend rows are raw snake_case (no auto camelCase layer). target_month comes
// back as a timestamp; keep only the date part so month lookups are plain
// string compares rather than timezone-sensitive Date maths.
function fromBackendTarget(target) {
  return {
    ...target,
    targetMonth: String(target.target_month).slice(0, 10),
    unitsTarget: target.units_target != null ? Number(target.units_target) : null,
    revenueTarget: target.revenue_target != null ? Number(target.revenue_target) : null,
  };
}

export const salesTargetApi = {
  list: (params = {}) =>
    apiClient.get('/sales-targets', { params }).then((res) => (res.data.data ?? []).map(fromBackendTarget)),
  upsert: (payload) => apiClient.put('/sales-targets', payload).then((res) => fromBackendTarget(res.data.data)),
};
