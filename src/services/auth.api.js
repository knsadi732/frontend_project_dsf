import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { ROLES } from '@/constants/roles';

function mockLogin({ email }) {
  return Promise.resolve({
    user: {
      id: 'mock-user-1',
      name: email?.split('@')[0] || 'Demo User',
      email: email || 'demo@dsfootwear.com',
      role: ROLES.SUPER_ADMIN,
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
