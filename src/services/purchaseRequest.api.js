import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('purchase-requests');

// ApiList.md's POST /purchase-requests body: { warehouseId, departmentId?,
// branchId?, remarks?, items: [{ productId, quantity, remarks? }] }. No
// prNumber in the body — that's server-generated (see generateNumber).
function toBackendPayload(payload) {
  return {
    warehouseId: payload.warehouseId,
    ...(payload.departmentId && { departmentId: payload.departmentId }),
    ...(payload.branchId && { branchId: payload.branchId }),
    ...(payload.remarks && { remarks: payload.remarks }),
    items: (payload.items ?? []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      ...(item.remarks && { remarks: item.remarks }),
    })),
  };
}

// Same backend as purchase-orders, so responses are likely raw Postgres
// columns (snake_case) rather than the camelCase the Joi body expects —
// read both forms defensively until a real response sample confirms it.
function fromBackendPurchaseRequest(request, submitted = {}) {
  return {
    ...submitted,
    ...request,
    prNumber: request.prNumber ?? request.pr_number ?? submitted.prNumber,
    warehouseId: request.warehouseId ?? request.warehouse_id ?? submitted.warehouseId,
    departmentId: request.departmentId ?? request.department_id ?? submitted.departmentId,
    branchId: request.branchId ?? request.branch_id ?? submitted.branchId,
    status: request.status ?? 'pending',
    items:
      submitted.items ??
      (request.items ?? []).map((item) => ({
        productId: item.productId ?? item.product_id,
        quantity: item.quantity,
        remarks: item.remarks,
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
  // No generic edit endpoint — only PATCH /purchase-requests/:id/status with
  // status in ['approved','rejected']. pending -> decided is a one-way,
  // terminal move (a decided PR can't be re-decided; raise a new one).
  updateStatus: (id, status) =>
    apiClient.patch(`/purchase-requests/${id}/status`, { status }).then((res) => fromBackendPurchaseRequest(res.data.data)),
};
