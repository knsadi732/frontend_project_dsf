import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('designations');

// Backend's designations table (migrations/0036_create_designations.sql)
// only has {name, status} — no department_id column, so a designation
// isn't actually scoped to a department there. `title` here is `name`
// there.
function toBackendPayload({ title, status }) {
  return { name: title, status };
}

function fromBackendDesignation(row) {
  return { id: row.id, title: row.name, status: row.status };
}

export const designationApi = {
  list: (params) =>
    baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendDesignation), total })),
  get: (id) => baseApi.get(id).then(fromBackendDesignation),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendDesignation),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendDesignation),
  remove: (id) => baseApi.remove(id),
};
