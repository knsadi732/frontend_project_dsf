import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('material-issue-requests');

// Responses are raw `material_issue_requests` rows (materialIssueRequest.
// repository.js) — snake_case Postgres columns, plus work_order_number/
// product_id/product_variant_id/product_name/warehouse_name/requested_by_name/
// approved_by_name joined in on list/get. approve/reject return the bare row
// (RETURNING *, no joins) — see materialIssueRequest.repository.js updateStatus.
function fromBackendMir(mir, submitted = {}) {
  return {
    ...submitted,
    ...mir,
    mirNumber: mir.mir_number ?? submitted.mirNumber,
    workOrderId: mir.work_order_id ?? submitted.workOrderId,
    workOrderNumber: mir.work_order_number ?? submitted.workOrderNumber,
    productId: mir.product_id ?? submitted.productId,
    productName: mir.product_name ?? submitted.productName,
    productVariantId: mir.product_variant_id ?? submitted.productVariantId,
    warehouseId: mir.warehouse_id ?? submitted.warehouseId,
    warehouseName: mir.warehouse_name ?? submitted.warehouseName,
    requestedBy: mir.requested_by ?? submitted.requestedBy,
    requestedByName: mir.requested_by_name ?? submitted.requestedByName,
    approvedBy: mir.approved_by ?? submitted.approvedBy,
    approvedByName: mir.approved_by_name ?? submitted.approvedByName,
    approvedAt: mir.approved_at ?? submitted.approvedAt,
    items:
      submitted.items ??
      (mir.items ?? []).map((item) => ({
        id: item.id,
        rawMaterialVariantId: item.raw_material_variant_id,
        rawMaterialName: item.raw_material_name,
        sku: item.sku,
        size: item.size,
        color: item.color,
        quantityRequired: Number(item.quantity_required ?? 0),
        quantityReserved: Number(item.quantity_reserved ?? 0),
      })),
  };
}

export const materialIssueRequestApi = {
  list: (params) =>
    baseApi.list(params).then(({ data, total }) => ({ data: data.map((mir) => fromBackendMir(mir)), total })),
  get: (id) => baseApi.get(id).then((mir) => fromBackendMir(mir)),
  // material_issue_request.approve — Production Manager only. No request
  // body; the backend checks real stock per BOM line, reserves whatever's
  // on hand, and auto-raises a high-priority Purchase Request for any
  // shortfall, all atomic with the status flip.
  approve: (id) => apiClient.patch(`/material-issue-requests/${id}/approve`).then((res) => fromBackendMir(res.data.data)),
  reject: (id) => apiClient.patch(`/material-issue-requests/${id}/reject`).then((res) => fromBackendMir(res.data.data)),
  // material_issue_request.issue — warehouse staff, only once "approved".
  // The explicit "material physically left the warehouse" step: deducts
  // on-hand by exactly what got reserved per line at approval (never the
  // full quantityRequired — the shortfall portion isn't issuable).
  issue: (id) => apiClient.patch(`/material-issue-requests/${id}/issue`).then((res) => fromBackendMir(res.data.data)),
};
