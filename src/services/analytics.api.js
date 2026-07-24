import { apiClient } from '@/services/api/axios';

// GET /analytics/dashboard returns every widget as an array; widgets are
// read from a 15-min Redis cache backed by nightly-precomputed snapshot
// rows (never live-aggregated), and numeric fields come back as strings
// (Postgres NUMERIC/COUNT via pg) — parse them here. `data`/`generatedAt`
// are both null if no snapshot has been generated yet for the company.
// Only 2 widgets exist today: sales_summary, inventory_status. All 3
// analytics routes sit behind one flat `analytics.view` permission — there
// is no per-widget/per-role scoping on the backend, so role-based hiding of
// individual widgets is entirely a frontend decision (see dashboard.api.js).
function parseWidget(widget) {
  if (!widget?.data) return { key: widget?.widgetKey, data: null, generatedAt: null };
  return {
    key: widget.widgetKey,
    generatedAt: widget.generatedAt,
    data: Object.fromEntries(Object.entries(widget.data).map(([k, v]) => [k, Number(v)])),
  };
}

export const analyticsApi = {
  dashboard: () => apiClient.get('/analytics/dashboard').then((res) => res.data.data.map(parseWidget)),
  widget: (key) => apiClient.get(`/analytics/dashboard/${key}`).then((res) => parseWidget(res.data.data)),
  // Forces the nightly snapshot job to run immediately — no body, returns
  // { companies: <count regenerated> }.
  regenerate: () => apiClient.post('/analytics/regenerate').then((res) => res.data.data),
};
