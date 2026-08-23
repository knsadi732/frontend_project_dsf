import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('bins');

function fromBackendBin(bin) {
  return {
    ...bin,
    shelfId: bin.shelf_id,
    capacity: Number(bin.capacity ?? 0),
    currentQuantity: Number(bin.current_quantity ?? 0),
  };
}

function toBackendPayload(payload) {
  return {
    shelfId: payload.shelfId,
    code: payload.code,
    capacity: payload.capacity,
    currentQuantity: payload.currentQuantity,
    status: payload.status,
  };
}

export const binApi = {
  list: ({ shelfId, ...params } = {}) =>
    baseApi.list({ ...params, ...(shelfId && { shelf_id: shelfId }) }).then(({ data, total }) => ({ data: data.map(fromBackendBin), total })),
  get: (id) => baseApi.get(id).then(fromBackendBin),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendBin),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendBin),
  remove: (id) => baseApi.remove(id),
};
