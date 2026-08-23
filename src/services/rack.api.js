import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('racks');

function fromBackendRack(rack) {
  return {
    ...rack,
    zoneId: rack.zone_id,
    maxCapacity: Number(rack.max_capacity ?? 0),
  };
}

function toBackendPayload(payload) {
  return {
    zoneId: payload.zoneId,
    code: payload.code,
    maxCapacity: payload.maxCapacity,
    status: payload.status,
  };
}

export const rackApi = {
  // `zoneId` narrows the list to one zone's racks (RacksPanel's zone picker) —
  // translated to the backend's `zone_id` query param.
  list: ({ zoneId, ...params } = {}) =>
    baseApi.list({ ...params, ...(zoneId && { zone_id: zoneId }) }).then(({ data, total }) => ({ data: data.map(fromBackendRack), total })),
  get: (id) => baseApi.get(id).then(fromBackendRack),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendRack),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendRack),
  remove: (id) => baseApi.remove(id),
};
