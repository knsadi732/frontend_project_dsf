import { apiClient } from '@/services/api/axios';

// Backend only exposes GET /attendance — there is no create/update/delete
// endpoint. A record is created automatically as a side effect of
// POST /auth/login (first login of the day = check-in); see
// authApi.login / useLoginMutation. Requires the `attendance.view`
// permission (granted to admin/owner/super_admin already).
function fromBackendRecord(record) {
  return {
    ...record,
    employeeId: record.employeeId ?? record.user_id ?? record.userId,
    checkIn: record.checkIn ?? record.check_in,
    checkOut: record.checkOut ?? record.check_out,
    lateEntry: record.lateEntry ?? record.late_entry ?? false,
  };
}

export const attendanceApi = {
  // Backend query params: user_id, from, to, page, limit — translate the
  // feature layer's {employeeId, dateFrom, dateTo, pageSize} names here so
  // callers keep the same shape every other list() uses.
  list: ({ employeeId, dateFrom, dateTo, pageSize, ...params } = {}) =>
    apiClient
      .get('/attendance', {
        params: {
          ...params,
          ...(employeeId && { user_id: employeeId }),
          ...(dateFrom && { from: dateFrom }),
          ...(dateTo && { to: dateTo }),
          ...(pageSize !== undefined && { limit: pageSize }),
        },
      })
      .then((res) => ({
        data: (res.data.data ?? []).map(fromBackendRecord),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
};
