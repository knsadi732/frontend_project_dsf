import axios from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(token) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      resolve(apiClient(config));
    } else {
      reject(new Error('Session expired'));
    }
  });
  pendingQueue = [];
}

async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error('No refresh token');

  // Response is enveloped (`{ success, message, data }`, see
  // backend_project_dsf/src/utils/response.js) and the backend rotates the
  // refresh token on every call, so both tokens from `data.data` must be
  // persisted or the next refresh will be rejected as already-used.
  const { data } = await axios.post(`${env.apiBaseUrl}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: nextRefreshToken } = data.data;
  useAuthStore.getState().setAccessToken(accessToken, nextRefreshToken);
  return accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response) {
      pushToast('error', TOAST_MESSAGES.NETWORK_ERROR);
      return Promise.reject(error);
    }

    const isAuthEndpoint = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh');

    if (response.status === 401 && !config._retry && !isAuthEndpoint) {
      config._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config });
        });
      }

      isRefreshing = true;
      try {
        const token = await refreshAccessToken();
        isRefreshing = false;
        resolveQueue(token);
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient(config);
      } catch (refreshError) {
        isRefreshing = false;
        resolveQueue(null);
        useAuthStore.getState().logout();
        pushToast('error', TOAST_MESSAGES.SESSION_EXPIRED);
        return Promise.reject(refreshError);
      }
    }

    if (response.status === 403) {
      pushToast('error', TOAST_MESSAGES.UNAUTHORIZED);
    } else if (response.status >= 500) {
      pushToast('error', TOAST_MESSAGES.GENERIC_ERROR);
    } else if (response.status !== 401) {
      pushToast('error', response.data?.message ?? TOAST_MESSAGES.GENERIC_ERROR);
    }

    return Promise.reject(error);
  },
);
