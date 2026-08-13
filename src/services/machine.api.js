import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('machines');

function fromBackendMachine(machine) {
  return {
    ...machine,
    warehouseId: machine.warehouse_id,
    warehouseName: machine.warehouse_name,
    machineType: machine.machine_type,
  };
}

function toBackendPayload(payload) {
  return {
    warehouseId: payload.warehouseId || null,
    name: payload.name,
    machineType: payload.machineType || undefined,
    status: payload.status,
    remarks: payload.remarks || undefined,
  };
}

function fromBackendDowntimeEvent(event) {
  return {
    ...event,
    machineId: event.machine_id,
    machineName: event.machine_name,
    startedAt: event.started_at,
    endedAt: event.ended_at,
  };
}

export const machineApi = {
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendMachine), total })),
  get: (id) => baseApi.get(id).then(fromBackendMachine),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendMachine),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendMachine),
  remove: (id) => baseApi.remove(id),
  // machine.manage — opens a downtime event and flips status to "down".
  reportDown: (id, reason) => apiClient.patch(`/machines/${id}/report-down`, { reason }).then((res) => fromBackendMachine(res.data.data.machine)),
  // Closes the open downtime event and flips status back to "running".
  resolveDowntime: (id) => apiClient.patch(`/machines/${id}/resolve-downtime`).then((res) => fromBackendMachine(res.data.data)),
  listDowntimeEvents: (params) =>
    apiClient.get('/machines/downtime-events', { params }).then((res) => ({
      data: res.data.data.map(fromBackendDowntimeEvent),
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
};
