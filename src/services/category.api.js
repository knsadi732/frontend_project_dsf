import { createCrudApi } from '@/services/api/createCrudApi';

// Real backend exposes categories nested under /products/categories
// (product.routes.js), not a bare /categories resource.
const baseApi = createCrudApi('products/categories');

// Responses are raw `SELECT * FROM categories` rows (snake_case Postgres
// columns), unlike the camelCase the Joi validators expect on writes — no
// case-conversion layer on the backend.
function fromBackendCategory(category) {
  return {
    ...category,
    parentId: category.parent_id,
    categoryCode: category.category_code,
  };
}

// parentId is an optional GUID column (top-level categories have none) —
// the backend's Joi validator accepts null but not '' (empty string isn't a
// valid GUID), so a cleared/never-chosen parent select (which yields '')
// must be normalized to null before it leaves the browser.
function toBackendPayload(payload) {
  return { ...payload, parentId: payload.parentId || null };
}

export const categoryApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendCategory), total })),
  get: (id) => baseApi.get(id).then(fromBackendCategory),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendCategory),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendCategory),
};
