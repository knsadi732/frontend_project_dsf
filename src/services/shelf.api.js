import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('shelves');

function fromBackendShelf(shelf) {
  return {
    ...shelf,
    rackId: shelf.rack_id,
    capacity: Number(shelf.capacity ?? 0),
  };
}

function toBackendPayload(payload) {
  return {
    rackId: payload.rackId,
    code: payload.code,
    capacity: payload.capacity,
    status: payload.status,
  };
}

export const shelfApi = {
  list: ({ rackId, ...params } = {}) =>
    baseApi.list({ ...params, ...(rackId && { rack_id: rackId }) }).then(({ data, total }) => ({ data: data.map(fromBackendShelf), total })),
  get: (id) => baseApi.get(id).then(fromBackendShelf),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendShelf),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendShelf),
  remove: (id) => baseApi.remove(id),
};
