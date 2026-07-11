import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { findEmployeeByPhone } from '@/services/user.api';
import { getEmployeeFullName } from '@/utils/employeeName';

function toSessionUser(employee) {
  return {
    id: employee.id,
    name: getEmployeeFullName(employee),
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
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
    return Promise.reject(new Error('Invalid phone number or password. Please enter the correct credentials.'));
  }

  return Promise.resolve({
    user: toSessionUser(employee),
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  });
}

export const authApi = {
  login: (payload) => {
    if (env.mockAuth) return mockLogin(payload);
    return apiClient.post('/auth/login', payload).then((res) => res.data);
  },
  logout: () => {
    if (env.mockAuth) return Promise.resolve();
    return apiClient.post('/auth/logout');
  },
  me: () => {
    if (env.mockAuth) return Promise.resolve(toSessionUser(findEmployeeByPhone('9000000001')));
    return apiClient.get('/auth/me').then((res) => res.data);
  },
};
