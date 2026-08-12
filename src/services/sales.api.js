import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('orders');

// Real backend body (order.validator.js createOrder): { branchId?,
// warehouseId (required), customerId (required), items: [{productVariantId,
// quantity}] }. No orderNumber in the body — server-generated
// (order.repository.js generateOrderNumber).
function toBackendPayload(payload) {
  return {
    branchId: payload.branchId || null,
    warehouseId: payload.warehouseId,
    customerId: payload.customerId,
    items: (payload.items ?? []).map((item) => ({
      productVariantId: item.productVariantId,
      quantity: item.quantity,
    })),
  };
}

// Responses are raw `SELECT * FROM orders` / `order_items` rows
// (order.repository.js) — snake_case Postgres columns, no case-conversion
// layer on the backend. `list` rows carry a lightweight items summary
// (sku/productName/categoryName/quantity, via attachItemSummaries) so the
// grid can show what's being sold without a per-row detail fetch; `get`
// carries the full priced item rows (unit_price/tax_rate/line_total) instead.
function fromBackendOrder(order, submitted = {}) {
  return {
    ...submitted,
    ...order,
    orderNumber: order.orderNumber ?? order.order_number ?? submitted.orderNumber,
    warehouseId: order.warehouseId ?? order.warehouse_id ?? submitted.warehouseId,
    customerId: order.customerId ?? order.customer_id ?? submitted.customerId,
    branchId: order.branchId ?? order.branch_id ?? submitted.branchId,
    subtotal: order.subtotal ?? submitted.subtotal,
    taxAmount: order.taxAmount ?? order.tax_amount ?? submitted.taxAmount,
    total: order.totalAmount ?? order.total_amount ?? submitted.total,
    paymentStatus: order.paymentStatus ?? order.payment_status ?? submitted.paymentStatus,
    orderDate: submitted.orderDate || order.created_at?.slice(0, 10),
    // Set the moment status first reaches "dispatched" (order.repository.js
    // updateStatus) — null until then, which is what tells the invoice PDF
    // whether to print as a Proforma Invoice or a final Tax Invoice.
    dispatchedAt: order.dispatchedAt ?? order.dispatched_at ?? submitted.dispatchedAt ?? null,
    items:
      submitted.items ??
      (order.items ?? []).map((item) => ({
        id: item.id,
        productVariantId: item.productVariantId ?? item.product_variant_id,
        sku: item.sku,
        productName: item.productName ?? item.product_name,
        categoryName: item.categoryName ?? item.category_name,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? item.unit_price,
        taxRate: item.taxRate ?? item.tax_rate,
        lineTotal: item.lineTotal ?? item.line_total,
      })),
  };
}

export const salesApi = {
  list: (params) =>
    baseApi.list(params).then(({ data, total }) => ({ data: data.map((order) => fromBackendOrder(order)), total })),
  get: (id) => baseApi.get(id).then((order) => fromBackendOrder(order)),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then((order) => fromBackendOrder(order, payload)),
  // No generic edit endpoint exists — only two status-transition endpoints
  // (order.routes.js): fulfillment pipeline and payment status, each its own
  // PATCH. There's no DELETE either.
  transitionStatus: (id, status) =>
    apiClient.patch(`/orders/${id}/status`, { status }).then((res) => fromBackendOrder(res.data.data)),
  transitionPaymentStatus: (id, paymentStatus) =>
    apiClient.patch(`/orders/${id}/payment-status`, { paymentStatus }).then((res) => fromBackendOrder(res.data.data)),
};
