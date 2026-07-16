import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';

let mockReports = [];
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
