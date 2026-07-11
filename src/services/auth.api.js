import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { findEmployeeByPhone } from '@/services/user.api';
import { getEmployeeFullName } from '@/utils/employeeName';

/**
 * Mock Login Flow (plan.md Chapter 9): Phone → Employee Table → Password
 * Verify → Role → Permission → JWT → Dashboard. There's no real backend in
 * mock mode, so any password is accepted once the phone matches a record.
 */
function mockLogin({ phone }) {
  const employee = findEmployeeByPhone(phone) ?? findEmployeeByPhone('9000000001');

  return Promise.resolve({
    user: {
      id: employee.id,
      name: getEmployeeFullName(employee),
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
    },
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
    if (env.mockAuth) return mockLogin({}).then((res) => res.user);
    return apiClient.get('/auth/me').then((res) => res.data);
  },
};
