import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('purchase-requests');

// Real backend body (purchaseRequest.validator.js): { warehouseId,
// departmentId?, branchId?, remarks?, items: [{ productVariantId, quantity,
// remarks? }] }. No prNumber in the body — that's server-generated (see
// generateNumber).
function toBackendPayload(payload) {
  return {
    warehouseId: payload.warehouseId,
    ...(payload.departmentId && { departmentId: payload.departmentId }),
    ...(payload.branchId && { branchId: payload.branchId }),
    ...(payload.priority && { priority: payload.priority }),
    ...(payload.requiredDate && { requiredDate: payload.requiredDate }),
    ...(payload.remarks && { remarks: payload.remarks }),
    // Exactly one of productVariantId (sellable Product) / itemVariantId
    // (Item & Material Master variant — raw material, packaging,
    // consumable, spare, tool, service) per line, per the backend's xor
    // validation.
    items: (payload.items ?? []).map((item) => ({
      ...(item.itemVariantId ? { itemVariantId: item.itemVariantId } : { productVariantId: item.productVariantId }),
      quantity: item.quantity,
      ...(item.remarks && { remarks: item.remarks }),
    })),
  };
}

// Responses are raw `SELECT * FROM purchase_requests` /
// `purchase_request_items` rows (purchaseRequest.repository.js) —
// snake_case Postgres columns, no case-conversion layer on the backend.
function fromBackendPurchaseRequest(request, submitted = {}) {
  return {
    ...submitted,
    ...request,
    prNumber: request.prNumber ?? request.pr_number ?? submitted.prNumber,
    warehouseId: request.warehouseId ?? request.warehouse_id ?? submitted.warehouseId,
    departmentId: request.departmentId ?? request.department_id ?? submitted.departmentId,
    branchId: request.branchId ?? request.branch_id ?? submitted.branchId,
    priority: request.priority ?? submitted.priority,
    requiredDate: request.requiredDate ?? request.required_date ?? submitted.requiredDate,
    status: request.status ?? 'draft',
    items:
      submitted.items ??
      (request.items ?? []).map((item) => ({
        productVariantId: item.productVariantId ?? item.product_variant_id,
        itemVariantId: item.itemVariantId ?? item.item_variant_id,
        quantity: item.quantity,
        remarks: item.remarks,
        // Display fields — whichever side (Product Variant vs Item Master) the line references.
        sku: item.sku,
        productName: item.productName ?? item.product_name,
        itemCode: item.itemCode ?? item.item_code,
        itemName: item.itemName ?? item.item_name,
        size: item.itemSize ?? item.item_size,
        color: item.itemColor ?? item.item_color,
      })),
  };
}

export const purchaseRequestApi = {
  // GET /purchase-requests/generate-number — reserves and returns the next
  // PR number (DSF-PR-0001), same pattern as purchase-orders.
  generateNumber: () => apiClient.get('/purchase-requests/generate-number').then((res) => res.data.data.prNumber),
  list: ({ status, ...params } = {}) =>
    baseApi.list({ ...params, ...(status && { status }) }).then(({ data, total }) => ({
      data: data.map((request) => fromBackendPurchaseRequest(request)),
      total,
    })),
  get: (id) => baseApi.get(id).then((request) => fromBackendPurchaseRequest(request)),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then((request) => fromBackendPurchaseRequest(request, payload)),
  // Real pipeline (purchaseRequest.service.js decidePurchaseRequest):
  // draft -> submitted -> pending_approval -> approved -> converted_to_rfq,
  // strictly one step at a time; rejected forks off pending_approval only.
  // A freshly created PR always starts at `draft` (createPurchaseRequest
  // Joi schema has no `status` field — the backend silently strips one if
  // sent) — the table's "Submit" action moves it to `submitted` via this
  // same endpoint.
  updateStatus: (id, status) =>
    apiClient.patch(`/purchase-requests/${id}/status`, { status }).then((res) => fromBackendPurchaseRequest(res.data.data)),
};
