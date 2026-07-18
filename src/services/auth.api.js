import { apiClient } from '@/services/api/axios';
import { useAuthStore } from '@/store/authStore';

// Maps the real backend's lean session-user shape (backend_project_dsf's
// authService.login / GET /auth/me) onto the fields useAuthStore/useAuth
// expect. The backend has no concept of additional roles yet, and doesn't
// echo phone back, so the submitted phone is threaded through for login.
// Role key casing/naming (backend's lowercase 'admin' vs frontend's
// ROLES.SUPER_ADMIN) is normalized centrally in hasPermission
// (src/constants/roles.js), not here.
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
  login: ({ phone, password }) =>
    apiClient.post('/auth/login', { identifier: phone, password }).then((res) => {
      const { accessToken, refreshToken, user } = res.data.data;
      return { accessToken, refreshToken, user: fromBackendUser(user, phone) };
    }),
  logout: () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    return apiClient.post('/auth/logout', { refreshToken });
  },
  me: () => apiClient.get('/auth/me').then((res) => fromBackendUser(res.data.data)),
};
