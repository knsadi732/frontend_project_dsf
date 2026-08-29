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
    ...(payload.rfqId && { rfqId: payload.rfqId }),
    // Set only when this PO was decided through RFQ -> Vendor Quotation ->
    // Comparison -> Vendor Selection (see rfqs feature) — direct/manual PO
    // creation from an approved PR (no RFQ) leaves this out entirely.
    warehouseId: payload.warehouseId,
    vendorId: payload.vendorId,
    ...(payload.deliveryAddress && { deliveryAddress: payload.deliveryAddress }),
    ...(payload.taxAmount !== undefined && payload.taxAmount !== '' && { taxAmount: payload.taxAmount }),
    ...(payload.paymentTerms && { paymentTerms: payload.paymentTerms }),
    ...(payload.expectedDeliveryDate && { expectedDeliveryDate: payload.expectedDeliveryDate }),
    // Exactly one of productVariantId / itemVariantId per line — see Chapter
    // 8/12 (Item & Material Master rows can now be ordered through Purchase too).
    items: (payload.items ?? []).map((item) => ({
      ...(item.itemVariantId ? { itemVariantId: item.itemVariantId } : { productVariantId: item.productVariantId }),
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
    rfqId: order.rfqId ?? order.rfq_id ?? submitted.rfqId,
    deliveryAddress: order.deliveryAddress ?? order.delivery_address ?? submitted.deliveryAddress,
    paymentTerms: order.paymentTerms ?? order.payment_terms ?? submitted.paymentTerms,
    expectedDeliveryDate: order.expectedDeliveryDate ?? order.expected_delivery_date ?? submitted.expectedDeliveryDate,
    orderDate: submitted.orderDate || order.created_at?.slice(0, 10),
    items:
      submitted.items ??
      (order.items ?? []).map((item) => ({
        id: item.id,
        productVariantId: item.productVariantId ?? item.product_variant_id,
        itemVariantId: item.itemVariantId ?? item.item_variant_id,
        quantity: item.quantity,
        unitCost: item.unitCost ?? item.unit_cost,
        // Backend joins these from products/product_variants at read time,
        // with no is_deleted filter — so they still resolve even if the
        // variant/product was later deleted, unlike a separate variants-list
        // lookup keyed by id (which only contains active variants).
        productName: item.productName ?? item.product_name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        hsnCode: item.hsnCode ?? item.hsn_code,
        uom: item.uom,
        // Item Master side (mutually exclusive with the product fields above).
        itemCode: item.itemCode ?? item.item_code,
        itemName: item.itemName ?? item.item_name,
        itemUom: item.itemUom ?? item.item_uom,
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
