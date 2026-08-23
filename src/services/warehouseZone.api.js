import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('warehouse-zones');

function fromBackendZone(zone) {
  return {
    ...zone,
    warehouseId: zone.warehouse_id,
    zoneType: zone.zone_type,
  };
}

function toBackendPayload(payload) {
  return {
    warehouseId: payload.warehouseId,
    name: payload.name,
    zoneType: payload.zoneType,
    status: payload.status,
  };
}

export const warehouseZoneApi = {
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendZone), total })),
  get: (id) => baseApi.get(id).then(fromBackendZone),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendZone),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendZone),
  remove: (id) => baseApi.remove(id),
};
