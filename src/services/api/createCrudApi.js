import { apiClient } from '@/services/api/axios';

/**
 * Builds a standard list/get/create/update/remove wrapper around one
 * REST resource so every services/*.api.js file stays a 1:1 mirror of its
 * backend service (see summary.md "API Layer Convention").
 */
export function createCrudApi(resource) {
  const base = `/${resource}`;

  return {
    list: (params) => apiClient.get(base, { params }).then((res) => res.data),
    get: (id) => apiClient.get(`${base}/${id}`).then((res) => res.data),
    create: (payload) => apiClient.post(base, payload).then((res) => res.data),
    update: (id, payload) => apiClient.put(`${base}/${id}`, payload).then((res) => res.data),
    remove: (id) => apiClient.delete(`${base}/${id}`).then((res) => res.data),
  };
}
