import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';
import { createMockCrudApi } from '@/services/api/mockCrudApi';

/**
 * Builds a standard list/get/create/update/remove wrapper around one
 * REST resource so every services/*.api.js file stays a 1:1 mirror of its
 * backend service (see summary.md "API Layer Convention").
 *
 * When VITE_MOCK_AUTH=true and mockSeed is provided, requests are served
 * from an in-memory store instead of hitting the (likely absent) backend.
 * mockOptions lets a resource say which field holds its status
 * (defaults to "status") and, if it supports date-range filtering, which
 * field holds the relevant date (e.g. "orderDate").
 */
export function createCrudApi(resource, mockSeed, mockOptions) {
  if (env.mockAuth && mockSeed) {
    return createMockCrudApi(resource, mockSeed, mockOptions);
  }

  const base = `/${resource}`;

  return {
    list: (params) => apiClient.get(base, { params }).then((res) => res.data),
    get: (id) => apiClient.get(`${base}/${id}`).then((res) => res.data),
    create: (payload) => apiClient.post(base, payload).then((res) => res.data),
    update: (id, payload) => apiClient.put(`${base}/${id}`, payload).then((res) => res.data),
    remove: (id) => apiClient.delete(`${base}/${id}`).then((res) => res.data),
  };
}
