import { apiClient } from '@/services/api/axios';

// CA scope — gstReport.routes.js, mounted at /finance/reports. All four
// endpoints accept optional { from, to } (ISO dates) and return a plain
// aggregate object in res.data.data (not a paginated list), so these are
// passed straight through with no row-shape mapping.
function dateParams({ from, to } = {}) {
  return { ...(from && { from }), ...(to && { to }) };
}

export const financeReportsApi = {
  gstr1: (range) => apiClient.get('/finance/reports/gstr1', { params: dateParams(range) }).then((res) => res.data.data),
  gstr3b: (range) => apiClient.get('/finance/reports/gstr3b', { params: dateParams(range) }).then((res) => res.data.data),
  gstr2bProxy: (range) => apiClient.get('/finance/reports/gstr2b-proxy', { params: dateParams(range) }).then((res) => res.data.data),
  pnl: (range) => apiClient.get('/finance/reports/pnl', { params: dateParams(range) }).then((res) => res.data.data),
};
