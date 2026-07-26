import { createCrudApi } from '@/services/api/createCrudApi';
import { apiClient } from '@/services/api/axios';

const baseApi = createCrudApi('purchase-orders');

// Real backend body (purchaseOrder.validator.js createPurchaseOrder):
// { branchId?, poNumber?, purchaseRequestId (required), warehouseId
// (required), vendorId (required), deliveryAddress?, taxAmount? (default 0),
// paymentTerms?, expectedDeliveryDate?, items:[{productVariantId, quantity,
// unitCost}] }. `totalAmount` is computed server-side from
// quantity*unitCost + taxAmount — never sent by the client.
function toBackendPayload(payload) {
  return {
    branchId: payload.branchId || null,
    poNumber: payload.poNumber,
    purchaseRequestId: payload.purchaseRequestId,
    warehouseId: payload.warehouseId,
    vendorId: payload.vendorId,
    ...(payload.deliveryAddress && { deliveryAddress: payload.deliveryAddress }),
    ...(payload.taxAmount !== undefined && payload.taxAmount !== '' && { taxAmount: payload.taxAmount }),
    ...(payload.paymentTerms && { paymentTerms: payload.paymentTerms }),
    ...(payload.expectedDeliveryDate && { expectedDeliveryDate: payload.expectedDeliveryDate }),
    items: (payload.items ?? []).map((item) => ({
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitCost: item.unitCost,
    })),
  };
}

// Responses are raw `SELECT * FROM purchase_orders` /
// `purchase_order_items` rows (purchaseOrder.repository.js) — snake_case
// Postgres columns, no case-conversion layer on the backend. `list` doesn't
// join items at all (only `get` does), so list rows won't carry `items`.
function fromBackendPurchaseOrder(order, submitted = {}) {
  return {
    ...submitted,
    ...order,
    poNumber: order.poNumber ?? order.po_number ?? submitted.poNumber,
    purchaseRequestId: order.purchaseRequestId ?? order.purchase_request_id ?? submitted.purchaseRequestId,
    warehouseId: order.warehouseId ?? order.warehouse_id ?? submitted.warehouseId,
    vendorId: order.vendorId ?? order.vendor_id ?? submitted.vendorId,
    branchId: order.branchId ?? order.branch_id ?? submitted.branchId,
    total: order.totalAmount ?? order.total_amount ?? submitted.total,
    taxAmount: order.taxAmount ?? order.tax_amount ?? submitted.taxAmount,
    deliveryAddress: order.deliveryAddress ?? order.delivery_address ?? submitted.deliveryAddress,
    paymentTerms: order.paymentTerms ?? order.payment_terms ?? submitted.paymentTerms,
    expectedDeliveryDate: order.expectedDeliveryDate ?? order.expected_delivery_date ?? submitted.expectedDeliveryDate,
    orderDate: submitted.orderDate || order.created_at?.slice(0, 10),
    items:
      submitted.items ??
      (order.items ?? []).map((item) => ({
        id: item.id,
        productVariantId: item.productVariantId ?? item.product_variant_id,
        quantity: item.quantity,
        unitCost: item.unitCost ?? item.unit_cost,
      })),
  };
}

export const purchaseApi = {
  // purchaseOrder.routes.js GET /purchase-orders/generate-number — the next
  // PO number is server-generated (sequence-backed), not client-typed.
  generateNumber: () => apiClient.get('/purchase-orders/generate-number').then((res) => res.data.data.poNumber),
  list: (params) =>
    baseApi.list(params).then(({ data, total }) => ({ data: data.map((order) => fromBackendPurchaseOrder(order)), total })),
  get: (id) => baseApi.get(id).then((order) => fromBackendPurchaseOrder(order)),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then((order) => fromBackendPurchaseOrder(order, payload)),
  // No generic edit endpoint exists — only a status transition
  // (PATCH /:id/status). `cancelled` is also sent through this same
  // endpoint; the backend allows it from any non-completed/cancelled state
  // regardless of pipeline position (see transitionPurchaseOrder).
  transitionStatus: (id, status) =>
    apiClient.patch(`/purchase-orders/${id}/status`, { status }).then((res) => fromBackendPurchaseOrder(res.data.data)),
  // purchaseOrder.routes.js has no DELETE and no generic PATCH for
  // vendor/items/dates — a saved PO can only move forward via status.
};
