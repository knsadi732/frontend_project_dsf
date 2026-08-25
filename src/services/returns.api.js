import { apiClient } from '@/services/api/axios';

// Customer/courier returns against a Sales Order — real backend now (was
// previously a frontend-only mock, see git history). Status transitions
// (approve -> pickup -> warehouse_received -> inspection_completed ->
// resolved) fire real side effects server-side (return.service.js):
// restock on decision='restock', an auto-issued Credit Note on
// resolutionType='refund'.
function fromBackendReturn(row) {
  return {
    id: row.id,
    returnNumber: row.returnNumber ?? row.return_number,
    salesOrderId: row.orderId ?? row.order_id,
    soNumber: row.orderNumber ?? row.order_number,
    customer: row.customerName ?? row.customer_name,
    productVariantId: row.productVariantId ?? row.product_variant_id,
    productLabel: row.productName && row.variantSku ? `${row.variantSku} — ${row.productName}` : (row.productName ?? row.product_name),
    warehouseId: row.warehouseId ?? row.warehouse_id,
    quantity: Number(row.quantity),
    type: row.type,
    reason: row.reason,
    amount: Number(row.amount),
    createdDate: (row.createdAt ?? row.created_at ?? '').slice?.(0, 10),
    status: row.status,
    courierPartner: row.courierPartner ?? row.courier_partner,
    pickupDate: row.pickupDate ?? row.pickup_date,
    trackingNumber: row.trackingNumber ?? row.tracking_number,
    inspectionResult: row.inspectionResult ?? row.inspection_result,
    inspectionNotes: row.inspectionNotes ?? row.inspection_notes,
    decision: row.decision,
    resolutionType: row.resolutionType ?? row.resolution_type,
    refundAmount: Number(row.refundAmount ?? row.refund_amount ?? 0),
    refundMethod: row.refundMethod ?? row.refund_method,
    refundReference: row.refundReference ?? row.refund_reference,
    refundDate: row.refundDate ?? row.refund_date,
    refundStatus: row.refundStatus ?? row.refund_status,
    replacementOrderId: row.replacementOrderId ?? row.replacement_order_id,
    remarks: row.remarks,
  };
}

export const returnsApi = {
  generateNumber: () => apiClient.get('/returns/generate-number').then((res) => res.data.data.returnNumber),
  list: ({ pageSize, status, type, ...params } = {}) =>
    apiClient
      .get('/returns', { params: { ...params, ...(pageSize !== undefined && { limit: pageSize }), ...(status && { status }), ...(type && { type }) } })
      .then((res) => ({
        data: (res.data.data ?? []).map(fromBackendReturn),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  summary: (params = {}) => apiClient.get('/returns/summary', { params }).then((res) => res.data.data),
  summaryByProduct: (params = {}) =>
    apiClient.get('/returns/summary/by-product', { params }).then((res) =>
      (res.data.data ?? []).map((row) => ({
        productId: row.productId,
        productName: row.productName,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        productVariantId: row.productVariantId,
        variantSku: row.variantSku,
        totalReturns: row.totalReturns,
        customerReturnPercent: row.customerReturnPercent,
        rtoPercent: row.rtoPercent,
        damagePercent: row.damagePercent,
        scrappedAmount: Number(row.scrappedAmount),
      })),
    ),
  get: (id) => apiClient.get(`/returns/${id}`).then((res) => fromBackendReturn(res.data.data)),
  create: (payload) =>
    apiClient
      .post('/returns', {
        orderId: payload.salesOrderId,
        productVariantId: payload.productVariantId,
        warehouseId: payload.warehouseId || null,
        quantity: payload.quantity,
        type: payload.type,
        reason: payload.reason,
        amount: payload.amount,
        ...(payload.remarks && { remarks: payload.remarks }),
      })
      .then((res) => fromBackendReturn(res.data.data)),
  update: (id, payload) =>
    apiClient
      .patch(`/returns/${id}`, {
        ...(payload.quantity != null && { quantity: payload.quantity }),
        ...(payload.type && { type: payload.type }),
        ...(payload.reason && { reason: payload.reason }),
        ...(payload.amount != null && { amount: payload.amount }),
        ...(payload.status && { status: payload.status }),
        ...(payload.warehouseId !== undefined && { warehouseId: payload.warehouseId || null }),
        ...(payload.courierPartner !== undefined && { courierPartner: payload.courierPartner || null }),
        ...(payload.pickupDate && { pickupDate: payload.pickupDate }),
        ...(payload.trackingNumber !== undefined && { trackingNumber: payload.trackingNumber || null }),
        ...(payload.inspectionResult !== undefined && { inspectionResult: payload.inspectionResult || null }),
        ...(payload.inspectionNotes !== undefined && { inspectionNotes: payload.inspectionNotes || null }),
        ...(payload.decision !== undefined && { decision: payload.decision || null }),
        ...(payload.resolutionType && { resolutionType: payload.resolutionType }),
        ...(payload.refundAmount != null && { refundAmount: payload.refundAmount }),
        ...(payload.refundMethod !== undefined && { refundMethod: payload.refundMethod || null }),
        ...(payload.refundReference !== undefined && { refundReference: payload.refundReference || null }),
        ...(payload.refundDate && { refundDate: payload.refundDate }),
        ...(payload.replacementOrderId !== undefined && { replacementOrderId: payload.replacementOrderId || null }),
      })
      .then((res) => fromBackendReturn(res.data.data)),
  remove: (id) => apiClient.delete(`/returns/${id}`).then((res) => res.data.data),
};
