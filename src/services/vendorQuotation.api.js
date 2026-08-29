import { apiClient } from '@/services/api/axios';

// Real backend body (vendorQuotation.validator.js recordVendorQuotation):
// { rfqId, vendorId, items: [{productVariantId, unitPrice, gstPercentage?}],
// deliveryTimeDays?, paymentTerms?, validityDate?, freightAmount?, discountAmount?,
// remarks? }. Only POST exists (vendorQuotation.routes.js) — quotations are always
// read back through GET /rfqs/:id's `quotations` array, never listed standalone.
function toBackendPayload(payload) {
  return {
    rfqId: payload.rfqId,
    vendorId: payload.vendorId,
    deliveryTimeDays: payload.deliveryTimeDays || null,
    ...(payload.paymentTerms && { paymentTerms: payload.paymentTerms }),
    ...(payload.validityDate && { validityDate: payload.validityDate }),
    freightAmount: payload.freightAmount || 0,
    discountAmount: payload.discountAmount || 0,
    ...(payload.remarks && { remarks: payload.remarks }),
    // Exactly one of productVariantId / itemVariantId per line — mirrors
    // whatever the RFQ's own material line (from its source PR) actually is.
    items: (payload.items ?? []).map((item) => ({
      ...(item.itemVariantId ? { itemVariantId: item.itemVariantId } : { productVariantId: item.productVariantId }),
      unitPrice: item.unitPrice,
      gstPercentage: item.gstPercentage || 0,
    })),
  };
}

export const vendorQuotationApi = {
  record: (payload) => apiClient.post('/vendor-quotations', toBackendPayload(payload)).then((res) => res.data.data),
};
