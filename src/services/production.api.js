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
  };
}

// Backend's workOrder.validator.js only knows {productId, productVariantId,
// warehouseId, salesOrderId, workOrderNumber, quantity, stage, dueDate,
// *Cost fields, remarks}. warehouseId is what lets the backend reserve raw
// material (per the product's BOM) and flag any shortfall as a Purchase
// Request the moment this work order is created.
function toBackendPayload(payload) {
  const { workOrderNumber, productId, productVariantId, warehouseId, quantity, stage, dueDate, rawMaterialCost, labourCost, machineCost, electricityCost, packagingCost, overheadCost, remarks } = payload;
  return { workOrderNumber, productId, productVariantId, warehouseId, quantity, stage, dueDate, rawMaterialCost, labourCost, machineCost, electricityCost, packagingCost, overheadCost, remarks };
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
};
