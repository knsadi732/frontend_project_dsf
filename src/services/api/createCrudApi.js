import { apiClient } from '@/services/api/axios';

/**
 * Builds a standard list/get/create/update/remove wrapper around one
 * REST resource so every services/*.api.js file stays a 1:1 mirror of its
 * backend service (see summary.md "API Layer Convention"). Always hits the
 * real backend — no mock/in-memory fallback.
 */
export function createCrudApi(resource) {
  const base = `/${resource}`;

  // Every backend response is enveloped as `{ success, message, data, meta }`
  // (backend_project_dsf/src/utils/response.js) — unwrap it here so every
  // caller keeps getting the same `{ data, total }` / bare-record shapes it
  // already gets from the mock branch above.
  return {
    // Backend's pagination middleware (parsePagination) reads `limit`, not
    // `pageSize` — every feature page filters with {page, pageSize}, so
    // translate here rather than in every caller.
    list: ({ pageSize, ...params } = {}) =>
      apiClient.get(base, { params: { ...params, ...(pageSize !== undefined && { limit: pageSize }) } }).then((res) => ({
        data: res.data.data,
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
    get: (id) => apiClient.get(`${base}/${id}`).then((res) => res.data.data),
    create: (payload) => apiClient.post(base, payload).then((res) => res.data.data),
    update: (id, payload) => apiClient.patch(`${base}/${id}`, payload).then((res) => res.data.data),
    remove: (id) => apiClient.delete(`${base}/${id}`).then((res) => res.data.data),
  };
}
