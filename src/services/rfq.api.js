import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('rfqs');

// Real backend body (rfq.validator.js createRfq): { branchId?, purchaseRequestId,
// vendorIds: [guid], deliveryLocation?, deliveryDate?, paymentTerms?,
// technicalSpecifications?, remarks? }. No rfqNumber in the body — server-generated.
function toBackendPayload(payload) {
  return {
    ...(payload.branchId && { branchId: payload.branchId }),
    purchaseRequestId: payload.purchaseRequestId,
    vendorIds: payload.vendorIds ?? [],
    ...(payload.deliveryLocation && { deliveryLocation: payload.deliveryLocation }),
    ...(payload.deliveryDate && { deliveryDate: payload.deliveryDate }),
    ...(payload.paymentTerms && { paymentTerms: payload.paymentTerms }),
    ...(payload.technicalSpecifications && { technicalSpecifications: payload.technicalSpecifications }),
    ...(payload.remarks && { remarks: payload.remarks }),
  };
}

// Responses are raw Postgres rows (rfq.repository.js SELECT_WITH_NAMES) —
// snake_case columns, no case-conversion layer on the backend. GET /rfqs/:id
// (rfq.service.js getRfq) additionally attaches vendors/materialItems/quotations
// arrays, whose own rows are still raw snake_case and get mapped here too.
function fromBackendVendor(row) {
  return {
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorEmail: row.vendor_email,
    qualityRating: row.quality_rating,
    sentAt: row.sent_at,
  };
}

function fromBackendMaterialItem(row) {
  return {
    id: row.id,
    productVariantId: row.product_variant_id ?? row.productVariantId,
    sku: row.sku,
    size: row.size,
    color: row.color,
    productName: row.product_name,
    // Item Master side (mutually exclusive with the product fields above).
    itemVariantId: row.item_variant_id ?? row.itemVariantId,
    itemCode: row.item_code,
    itemName: row.item_name,
    itemUom: row.item_uom,
    quantity: row.quantity,
    remarks: row.remarks,
  };
}

function fromBackendQuotation(row) {
  return {
    id: row.id,
    rfqId: row.rfq_id,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    qualityRating: row.quality_rating,
    deliveryTimeDays: row.delivery_time_days,
    paymentTerms: row.payment_terms,
    validityDate: row.validity_date,
    freightAmount: Number(row.freight_amount ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    remarks: row.remarks,
    createdAt: row.created_at,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      productVariantId: item.product_variant_id,
      sku: item.sku,
      size: item.size,
      color: item.color,
      productName: item.product_name,
      itemVariantId: item.item_variant_id,
      itemCode: item.item_code,
      itemName: item.item_name,
      unitPrice: Number(item.unit_price ?? 0),
      gstPercentage: Number(item.gst_percentage ?? 0),
    })),
  };
}

function fromBackendRfq(rfq, submitted = {}) {
  return {
    ...submitted,
    id: rfq.id,
    rfqNumber: rfq.rfq_number ?? submitted.rfqNumber,
    status: rfq.status ?? 'draft',
    purchaseRequestId: rfq.purchase_request_id ?? submitted.purchaseRequestId,
    prNumber: rfq.pr_number,
    warehouseId: rfq.warehouse_id,
    branchId: rfq.branch_id ?? submitted.branchId,
    deliveryLocation: rfq.delivery_location ?? submitted.deliveryLocation,
    deliveryDate: rfq.delivery_date ?? submitted.deliveryDate,
    paymentTerms: rfq.payment_terms ?? submitted.paymentTerms,
    technicalSpecifications: rfq.technical_specifications ?? submitted.technicalSpecifications,
    remarks: rfq.remarks ?? submitted.remarks,
    selectedVendorQuotationId: rfq.selected_vendor_quotation_id,
    version: rfq.version,
    createdAt: rfq.created_at,
    vendors: (rfq.vendors ?? []).map(fromBackendVendor),
    materialItems: (rfq.materialItems ?? []).map(fromBackendMaterialItem),
    quotations: (rfq.quotations ?? []).map(fromBackendQuotation),
  };
}

export const rfqApi = {
  // GET /rfqs/generate-number — reserves and returns the next RFQ number
  // (DSF-RFQ-0001), same pattern as purchase-orders/purchase-requests.
  generateNumber: () => apiClient.get('/rfqs/generate-number').then((res) => res.data.data.rfqNumber),
  list: ({ status, purchaseRequestId, ...params } = {}) =>
    baseApi.list({ ...params, ...(status && { status }), ...(purchaseRequestId && { purchaseRequestId }) }).then(({ data, total }) => ({
      data: data.map((rfq) => fromBackendRfq(rfq)),
      total,
    })),
  get: (id) => baseApi.get(id).then((rfq) => fromBackendRfq(rfq)),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then((rfq) => fromBackendRfq(rfq, payload)),
  // rfq.routes.js has no generic PATCH — only these two lifecycle actions.
  send: (id) => apiClient.patch(`/rfqs/${id}/send`).then((res) => fromBackendRfq(res.data.data)),
  selectVendor: (id, vendorQuotationId) =>
    apiClient.patch(`/rfqs/${id}/select-vendor`, { vendorQuotationId }).then((res) => fromBackendRfq(res.data.data)),
};
