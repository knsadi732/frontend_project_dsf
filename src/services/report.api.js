import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';

let mockReports = [
  { id: '1', name: 'Sales Summary - June 2026', type: 'sales', generatedAt: '2026-07-01T10:15:00', status: 'ready' },
  { id: '2', name: 'Inventory Valuation - Q2', type: 'inventory', generatedAt: '2026-07-03T09:00:00', status: 'ready' },
  { id: '3', name: 'Finance P&L - June 2026', type: 'finance', generatedAt: '2026-07-05T14:30:00', status: 'pending' },
];
let nextReportId = mockReports.length + 1;

export const reportApi = {
  list: (params) => {
    if (env.mockAuth) {
      const { page = 1, pageSize = 20 } = params ?? {};
      const start = (page - 1) * pageSize;
      return Promise.resolve({ data: mockReports.slice(start, start + pageSize), total: mockReports.length });
    }
    return apiClient.get('/reports', { params }).then((res) => res.data);
  },
  generate: (payload) => {
    if (env.mockAuth) {
      const report = {
        id: String(nextReportId++),
        name: `${payload.type[0].toUpperCase()}${payload.type.slice(1)} Report (${payload.dateFrom} to ${payload.dateTo})`,
        type: payload.type,
        generatedAt: new Date().toISOString(),
        status: 'ready',
      };
      mockReports = [report, ...mockReports];
      return Promise.resolve(report);
    }
    return apiClient.post('/reports/generate', payload).then((res) => res.data);
  },
  download: (id) => {
    if (env.mockAuth) {
      const report = mockReports.find((item) => item.id === id);
      return Promise.resolve(new Blob([`Demo report: ${report?.name ?? id}`], { type: 'text/plain' }));
    }
    return apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }).then((res) => res.data);
  },
};
