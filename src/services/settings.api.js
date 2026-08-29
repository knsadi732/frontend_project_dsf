import { apiClient } from '@/services/api/axios';

// Mirrors company.api.js's singleton GET/PATCH pattern. Backend rows are raw
// snake_case (no auto camelCase layer) — map the one field the Dashboard's
// Daily Production Output widget needs.
function fromBackendSettings(settings) {
  return {
    ...settings,
    dailyProductionTarget:
      settings.daily_production_target != null ? Number(settings.daily_production_target) : null,
    monthlySalesTarget:
      settings.monthly_sales_target != null ? Number(settings.monthly_sales_target) : null,
  };
}

export const settingsApi = {
  get: () => apiClient.get('/settings').then((res) => fromBackendSettings(res.data.data)),
  update: (payload) => apiClient.patch('/settings', payload).then((res) => fromBackendSettings(res.data.data)),
};
