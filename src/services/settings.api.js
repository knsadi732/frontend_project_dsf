import { apiClient } from '@/services/api/axios';

// Mirrors company.api.js's singleton GET/PATCH pattern. Backend rows are raw
// snake_case (no auto camelCase layer) — map the fields the Dashboard's
// widgets need.
function fromBackendSettings(settings) {
  return {
    ...settings,
    monthlySalesTarget:
      settings.monthly_sales_target != null ? Number(settings.monthly_sales_target) : null,
    monthlySalesUnitsTarget:
      settings.monthly_sales_units_target != null ? Number(settings.monthly_sales_units_target) : null,
  };
}

export const settingsApi = {
  get: () => apiClient.get('/settings').then((res) => fromBackendSettings(res.data.data)),
  update: (payload) => apiClient.patch('/settings', payload).then((res) => fromBackendSettings(res.data.data)),
};
