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
    // Chapter 3 (Employee Domain): every employee belongs to one primary
    // department. Not confirmed yet whether /auth/login or /auth/me
    // actually echoes this back (the /users list endpoint only returns a
    // display-name string, no id — see user.api.js's fromBackendUser
    // comment) — read defensively and let callers (e.g. the Purchase
    // Request form, which auto-fills Department from the logged-in user)
    // fall back to a manual pick when it's missing.
    departmentId: user.departmentId ?? user.department_id ?? null,
    departmentName: user.department ?? user.departmentName ?? null,
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
  //
  // latitude/longitude/locationLabel are optional: when present, the
  // backend marks that day's attendance check-in (first login of the day)
  // against this location. There is no separate "mark attendance" endpoint
  // — it's a side effect of login itself.
  login: ({ phone, password, latitude, longitude, locationLabel }) =>
    apiClient
      .post('/auth/login', {
        identifier: phone,
        password,
        ...(latitude != null && { latitude }),
        ...(longitude != null && { longitude }),
        ...(locationLabel && { locationLabel }),
      })
      .then((res) => {
        const { accessToken, refreshToken, user } = res.data.data;
        return { accessToken, refreshToken, user: fromBackendUser(user, phone) };
      }),
  logout: () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    return apiClient.post('/auth/logout', { refreshToken });
  },
  me: () => apiClient.get('/auth/me').then((res) => fromBackendUser(res.data.data)),
};
