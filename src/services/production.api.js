import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('work-orders');

// Responses are raw `work_orders` rows (workOrder.repository.js) — snake_case
// Postgres columns, plus product_name/sales_order_number joined in on
// list/get (not on create, which only RETURNING *s the row itself).
function fromBackendWorkOrder(workOrder) {
  return {
    ...workOrder,
    workOrderNumber: workOrder.work_order_number,
    productId: workOrder.product_id,
    productName: workOrder.product_name,
    productVariantId: workOrder.product_variant_id,
    sku: workOrder.sku,
    size: workOrder.size,
    color: workOrder.color,
    warehouseId: workOrder.warehouse_id,
    warehouseName: workOrder.warehouse_name,
    salesOrderId: workOrder.sales_order_id,
    salesOrderNumber: workOrder.sales_order_number,
    quantity: Number(workOrder.quantity),
    dueDate: workOrder.due_date,
    rawMaterialCost: Number(workOrder.raw_material_cost ?? 0),
    labourCost: Number(workOrder.labour_cost ?? 0),
    machineCost: Number(workOrder.machine_cost ?? 0),
    electricityCost: Number(workOrder.electricity_cost ?? 0),
    packagingCost: Number(workOrder.packaging_cost ?? 0),
    overheadCost: Number(workOrder.overhead_cost ?? 0),
    actualQuantity: workOrder.actual_quantity != null ? Number(workOrder.actual_quantity) : null,
    completedAt: workOrder.completed_at ?? null,
    floorStage: workOrder.floor_stage ?? null,
  };
}

// Backend's workOrder.validator.js only knows {productId, productVariantId,
// warehouseId, salesOrderId, workOrderNumber, quantity, stage, dueDate,
// *Cost fields, remarks}. warehouseId is what lets the backend reserve raw
// material (per the product's BOM) and flag any shortfall as a Purchase
// Request the moment this work order is created.
function toBackendPayload(payload) {
  const { workOrderNumber, productId, productVariantId, warehouseId, quantity, stage, dueDate, rawMaterialCost, labourCost, machineCost, electricityCost, packagingCost, overheadCost, remarks, actualQuantity } = payload;
  // '' means "leave blank" (backend defaults to planned quantity on
  // completion) — must not be sent as a literal value, Joi's number()
  // validator rejects an empty string outright.
  return { workOrderNumber, productId, productVariantId, warehouseId, quantity, stage, dueDate, rawMaterialCost, labourCost, machineCost, electricityCost, packagingCost, overheadCost, remarks, actualQuantity: actualQuantity === '' ? undefined : actualQuantity };
}

export const productionApi = {
  // ProductionPage.jsx's filter state is named `status` (matching every
  // other module's convention) but the backend's stage field/query param is
  // `stage` (workOrder.controller.js reads req.query.stage) — translate here.
  list: ({ status, ...params } = {}) =>
    baseApi.list({ ...params, ...(status && { stage: status }) }).then(({ data, total }) => ({ data: data.map(fromBackendWorkOrder), total })),
  get: (id) => baseApi.get(id).then(fromBackendWorkOrder),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendWorkOrder),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendWorkOrder),
  remove: (id) => baseApi.remove(id),
  // work_order.manage — floor_stage is separate from `stage` (shop-floor
  // position vs coarse lifecycle), only valid while stage = 'in_progress'.
  advanceFloorStage: (id, floorStage) =>
    apiClient.patch(`/work-orders/${id}/floor-stage`, { floorStage }).then((res) => fromBackendWorkOrder(res.data.data)),
  // Read-only current-month overhead/unit — same ratio overheadAllocation.service.js
  // applies to completed work orders, without writing anything.
  overheadPerUnit: () =>
    apiClient.get('/work-orders/overhead-per-unit').then((res) => ({
      totalOverhead: Number(res.data.data.totalOverhead),
      totalProduction: Number(res.data.data.totalProduction),
      overheadPerUnit: Number(res.data.data.overheadPerUnit),
    })),
};
