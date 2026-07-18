import { createCrudApi } from '@/services/api/createCrudApi';
import { addNotification } from '@/services/notification.api';
import { addAuditLog } from '@/services/auditLog.api';
import { getEmployeeFullName } from '@/utils/employeeName';

const baseApi = createCrudApi('users');

// Backend's user.validator.js only knows {branchId, warehouseId, roleId,
// additionalRoleIds, employeeId, fullName, email, phone, password,
// department, jobTitle, status} — a much leaner model than the UI's rich
// employee record. `roleId`/`additionalRoleIds` need real role GUIDs, and
// ApiList.md exposes no /roles lookup to resolve a role key (e.g. "SALES")
// into one — so the UI's role key is sent through as-is and the backend
// rejects it; that failure surfaces via the normal apiClient error toast
// rather than being faked here. Personal/HR fields (DOB, Aadhaar, bank
// details, documents, etc.) have no backend column at all — see
// fromBackendUser, which echoes back whatever was submitted so the
// form/table keep showing them, even though they never persist server-side.
function toBackendPayload(payload) {
  return {
    branchId: payload.branchId || null,
    warehouseId: payload.warehouseId || null,
    roleId: payload.primaryRole,
    additionalRoleIds: payload.additionalRoles ?? [],
    employeeId: payload.employeeCode,
    fullName: getEmployeeFullName(payload) || payload.fullName,
    email: payload.email,
    phone: payload.phone,
    ...(payload.password ? { password: payload.password } : {}),
    department: payload.departmentId,
    jobTitle: payload.designationId,
    status: payload.employmentStatus,
  };
}

// Raw DB rows come back snake_case (no case-conversion layer on the
// backend) — only request bodies are camelCase (user.validator.js). The
// list endpoint also has no department_id/job_title id, just the
// already-resolved `department`/`job_title` display strings, so those
// can't be matched against departmentsById/designationsById by id; expose
// them as *Name/*Title too so the table/CSV can fall back to showing them.
function fromBackendUser(user, submitted = {}) {
  return {
    ...submitted,
    ...user,
    firstName: submitted.firstName ?? user.full_name ?? '',
    middleName: submitted.middleName ?? '',
    lastName: submitted.lastName ?? '',
    employeeCode: user.employee_id,
    primaryRole: user.role_id,
    additionalRoles: submitted.additionalRoles ?? [],
    branchId: user.branch_id ?? submitted.branchId,
    warehouseId: user.warehouse_id ?? submitted.warehouseId,
    departmentId: submitted.departmentId,
    departmentName: user.department,
    designationId: submitted.designationId,
    designationTitle: user.job_title,
    employmentStatus: user.status,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export const userApi = {
  list: (params) =>
    baseApi.list(params).then(({ data, total }) => ({ data: data.map((user) => fromBackendUser(user)), total })),
  get: (id) => baseApi.get(id).then((user) => fromBackendUser(user)),
  create: (payload) =>
    baseApi.create(toBackendPayload(payload)).then((user) => {
      const record = fromBackendUser(user, payload);
      addNotification({
        title: 'Employee onboarded',
        message: `${getEmployeeFullName(record)} onboarded as ${record.employeeCode ?? record.id}`,
      });
      addAuditLog({
        employeeId: record.id,
        action: 'employee_created',
        description: `${getEmployeeFullName(record)} onboarded`,
      });
      return record;
    }),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then((user) => fromBackendUser(user, payload)),
  remove: (id) => baseApi.remove(id),
};
