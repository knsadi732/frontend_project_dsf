import { apiClient } from '@/services/api/axios';

// CA scope — finance.routes.js GET/POST /finance/audits. Rows come back
// snake_case (no case-conversion layer on the backend), so map them here.
function fromBackendAudit(row) {
  return {
    id: row.id,
    fiscalPeriodId: row.fiscal_period_id,
    auditorName: row.auditor_name,
    conductedAt: row.conducted_at,
    findings: row.findings,
    remarks: row.remarks,
    createdAt: row.created_at,
  };
}

export const statutoryAuditApi = {
  list: (params) =>
    apiClient.get('/finance/audits', { params }).then((res) => ({
      data: res.data.data.map(fromBackendAudit),
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  record: (payload) => apiClient.post('/finance/audits', payload).then((res) => fromBackendAudit(res.data.data)),
};
