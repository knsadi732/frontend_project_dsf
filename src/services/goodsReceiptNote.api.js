import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('grn');

// Responses are raw `SELECT * FROM grn` / `grn_items` rows — snake_case
// Postgres columns, no case-conversion layer on the backend.
function fromBackendGrn(grn) {
  return {
    ...grn,
    grnNumber: grn.grnNumber ?? grn.grn_number,
    purchaseOrderId: grn.purchaseOrderId ?? grn.purchase_order_id,
    warehouseId: grn.warehouseId ?? grn.warehouse_id,
    vendorId: grn.vendorId ?? grn.vendor_id,
    branchId: grn.branchId ?? grn.branch_id,
    vendorInvoiceNumber: grn.vendorInvoiceNumber ?? grn.vendor_invoice_number,
    vendorInvoiceUrl: grn.vendorInvoiceUrl ?? grn.vendor_invoice_url,
    // Falls back to createdAt when receivedDate isn't set on the record —
    // still the best available "when was this received" signal.
    receivedDate: grn.receivedDate ?? grn.received_date ?? grn.createdAt ?? grn.created_at,
    items: (grn.items ?? []).map((item) => ({
      purchaseOrderItemId: item.purchaseOrderItemId ?? item.purchase_order_item_id,
      productVariantId: item.productVariantId ?? item.product_variant_id,
      orderedQuantity: item.orderedQuantity ?? item.ordered_quantity,
      receivedQuantity: item.receivedQuantity ?? item.received_quantity,
      acceptedQuantity: item.acceptedQuantity ?? item.accepted_quantity,
      rejectedQuantity: item.rejectedQuantity ?? item.rejected_quantity,
      rejectionReason: item.rejectionReason ?? item.rejection_reason,
      unitCost: item.unitCost ?? item.unit_cost,
    })),
  };
}

export const goodsReceiptNoteApi = {
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendGrn), total })),
  get: (id) => baseApi.get(id).then(fromBackendGrn),
  // GRN creation is always scoped to a specific Purchase Order — there's
  // no standalone POST /grn (see purchaseOrder.routes.js pattern: goods can
  // only be received against an order that already exists).
  createForPurchaseOrder: (poId, payload) =>
    apiClient.post(`/purchase-orders/${poId}/grn`, payload).then((res) => fromBackendGrn(res.data.data)),
  // Pipeline: draft -> inspected -> completed, with rejected forking off
  // inspected. No generic edit/delete endpoint exists — only this status
  // transition.
  transitionStatus: (id, status) =>
    apiClient.patch(`/grn/${id}/status`, { status }).then((res) => fromBackendGrn(res.data.data)),
  // Dedicated upload endpoint (not the generic Documents API) — keyed by
  // grnNumber, not id. Only application/pdf|image/jpeg|image/png are
  // accepted; anything else 422s with GRN_002.
  uploadInvoice: ({ grnNumber, file }) => {
    const formData = new FormData();
    formData.append('grnNumber', grnNumber);
    formData.append('file', file);
    return apiClient.post('/grn/invoice', formData).then((res) => fromBackendGrn(res.data.data));
  },
};
