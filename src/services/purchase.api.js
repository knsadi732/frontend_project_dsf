import { createCrudApi } from '@/services/api/createCrudApi';
import { apiClient } from '@/services/api/axios';

const baseApi = createCrudApi('purchase-orders');

// Backend's purchaseOrder.validator.js (POST /purchase-orders) only knows
// {branchId, warehouseId (required guid), vendorId (required guid),
// items:[{productId (guid), quantity, unitCost}]} — no supplier
// name/priority/sourceType. Status changes only go through
// PATCH /purchase-orders/:id/status with status in
// ['approved','ordered','received','completed'] — not the UI's
// draft/pending/in_progress/cancelled/rejected enum, and there's no
// generic PATCH for vendor/items/dates at all, and no DELETE either.
// Anything that doesn't map is echoed back from what was submitted so the
// UI keeps rendering it, but it won't persist — mismatched requests (e.g.
// a status the backend doesn't recognize) surface as a normal error toast.
function toBackendPayload(payload) {
  return {
    branchId: payload.branchId || null,
    poNumber: payload.poNumber,
    warehouseId: payload.warehouseId,
    vendorId: payload.vendorId,
    items: (payload.items ?? []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.rate,
    })),
  };
}

// Responses come straight from `SELECT * FROM purchase_orders` /
// `RETURNING *` (purchaseOrder.repository.js) — raw Postgres columns, so
// snake_case (po_number, total_amount, created_at), not the camelCase the
// Joi validators expect on the way in. There's no case-conversion layer on
// the backend, so this has to read the snake_case keys explicitly.
function fromBackendPurchaseOrder(order, submitted = {}) {
  return {
    ...submitted,
    ...order,
    poNumber: order.po_number || submitted.poNumber || order.id,
    total: order.total_amount ?? submitted.total,
    orderDate: submitted.orderDate || order.created_at?.slice(0, 10),
    items:
      submitted.items ??
      order.items?.map((item) => ({ productId: item.product_id, quantity: item.quantity, rate: item.unit_cost })),
  };
}

export const purchaseApi = {
  // purchaseOrder.routes.js GET /purchase-orders/generate-number — the
  // next PO number is server-generated (sequence-backed), not client-typed.
  generateNumber: () => apiClient.get('/purchase-orders/generate-number').then((res) => res.data.data.poNumber),
  list: (params) =>
    baseApi.list(params).then(({ data, total }) => ({ data: data.map((order) => fromBackendPurchaseOrder(order)), total })),
  get: (id) => baseApi.get(id).then((order) => fromBackendPurchaseOrder(order)),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then((order) => fromBackendPurchaseOrder(order, payload)),
  // No generic edit endpoint exists — only a status transition. Kept as
  // `update(id, payload)` so the existing edit modal / PO-Request "convert"
  // flow don't need to change call shape; only `status` actually reaches
  // the backend, everything else is a local-only echo.
  update: (id, payload) => {
    if (!payload.status) return Promise.resolve({ id, ...payload });
    return apiClient
      .patch(`/purchase-orders/${id}/status`, { status: payload.status })
      .then((res) => fromBackendPurchaseOrder(res.data.data, payload));
  },
  // purchaseOrder.routes.js has no DELETE — this will 404 with a normal
  // error toast rather than silently no-op.
  remove: (id) => baseApi.remove(id),
};
