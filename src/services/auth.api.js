import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { findEmployeeByPhone } from '@/services/user.api';
import { getEmployeeFullName } from '@/utils/employeeName';
import { addAuditLog } from '@/services/auditLog.api';
import { useAuthStore } from '@/store/authStore';

function toSessionUser(employee) {
  return {
    id: employee.id,
    name: getEmployeeFullName(employee),
    email: employee.email,
    phone: employee.phone,
    primaryRole: employee.primaryRole,
    additionalRoles: employee.additionalRoles ?? [],
  };
}

/**
 * Mock Login Flow (plan.md Chapter 9): Phone → Employee Table → Password
 * Verify → Role → Permission → JWT → Dashboard. There's no real backend in
 * mock mode, so the phone must match a record and the password must match
 * that employee's tempPassword — otherwise it's a generic "invalid
 * credentials" rejection (never reveal whether the phone or password was
 * the wrong part).
 */
function mockLogin({ phone, password }) {
  const employee = findEmployeeByPhone(phone);

  if (!employee || employee.tempPassword !== password) {
    addAuditLog({
      employeeId: employee?.id,
      action: 'login_failed',
      description: `Failed login attempt for phone ${phone}`,
    });
    return Promise.reject(new Error('Invalid phone number or password. Please enter the correct credentials.'));
  }

  addAuditLog({
    employeeId: employee.id,
    action: 'login_success',
    description: `${getEmployeeFullName(employee)} signed in`,
  });

  return Promise.resolve({
    user: toSessionUser(employee),
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  });
}

// Maps the real backend's lean session-user shape (backend_project_dsf's
// authService.login / GET /auth/me) onto the fields useAuthStore/useAuth
// expect — see toSessionUser above for the mock equivalent. The backend has
// no concept of additional roles yet, and doesn't echo phone back, so the
// submitted phone is threaded through for login.
function fromBackendUser(user, phone) {
  return {
    id: user.id,
    name: user.fullName ?? user.full_name,
    email: user.email,
    phone: phone ?? user.phone ?? '',
    primaryRole: user.roleKey ?? user.role?.key,
    additionalRoles: user.additionalRoles ?? [],
  };
}

export const authApi = {
  // Real backend contract: POST /auth/login { identifier, password } — the
  // login form's field stays named `phone` (Ch3.5: phone is the primary
  // login credential, no UI change requested), mapped to `identifier` here
  // since the real endpoint accepts either an email or a phone number.
  // Every response is enveloped as `{ success, message, data }`
  // (backend_project_dsf/src/utils/response.js), so the actual payload is
  // `res.data.data`.
  login: ({ phone, password }) => {
    if (env.mockLogin) return mockLogin({ phone, password });
    return apiClient.post('/auth/login', { identifier: phone, password }).then((res) => {
      const { accessToken, refreshToken, user } = res.data.data;
      return { accessToken, refreshToken, user: fromBackendUser(user, phone) };
    });
  },
  logout: () => {
    if (env.mockLogin) return Promise.resolve();
    const refreshToken = useAuthStore.getState().refreshToken;
    return apiClient.post('/auth/logout', { refreshToken });
  },
  me: () => {
    if (env.mockLogin) return Promise.resolve(toSessionUser(findEmployeeByPhone('9000000001')));
    return apiClient.get('/auth/me').then((res) => fromBackendUser(res.data.data));
  },
};
