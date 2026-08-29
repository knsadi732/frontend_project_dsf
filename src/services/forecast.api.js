import { apiClient } from '@/services/api/axios';

// Owner/Super Admin only (permission `forecast.view`, granted only to the
// backend admin role) — a simple linear-trend projection of next month's
// sales from actual monthly totals, not a seasonal/ML forecast.
export const forecastApi = {
  getSalesForecast: (params = {}) =>
    apiClient.get('/forecast/sales', { params }).then((res) => res.data.data),
};
