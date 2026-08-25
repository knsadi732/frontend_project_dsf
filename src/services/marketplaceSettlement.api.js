import { apiClient } from '@/services/api/axios';

// One row per marketplace Payment Advice line item — the real, itemized
// actual cost data (courier/return/RTO/ads/TCS/TDS) that eventually replaces
// marketplace_channels.default_cost_per_unit with a real per-channel average.
function fromBackendSettlement(row) {
  return {
    id: row.id,
    settlementNumber: row.settlementNumber ?? row.settlement_number,
    channelId: row.channelId ?? row.channel_id,
    channelName: row.channelName ?? row.channel_name,
    orderId: row.orderId ?? row.order_id,
    orderNumber: row.orderNumber ?? row.order_number,
    billId: row.billId ?? row.bill_id,
    invoiceNumber: row.invoiceNumber ?? row.invoice_number,
    productVariantId: row.productVariantId ?? row.product_variant_id,
    settlementDate: row.settlementDate ?? row.settlement_date,
    returnType: row.returnType ?? row.return_type,
    grossSaleAmount: Number(row.grossSaleAmount ?? row.gross_sale_amount ?? 0),
    commissionAmount: Number(row.commissionAmount ?? row.commission_amount ?? 0),
    shippingCharge: Number(row.shippingCharge ?? row.shipping_charge ?? 0),
    returnCharge: Number(row.returnCharge ?? row.return_charge ?? 0),
    adsCharge: Number(row.adsCharge ?? row.ads_charge ?? 0),
    tcsAmount: Number(row.tcsAmount ?? row.tcs_amount ?? 0),
    tdsAmount: Number(row.tdsAmount ?? row.tds_amount ?? 0),
    netAmountReceived: Number(row.netAmountReceived ?? row.net_amount_received ?? 0),
    remarks: row.remarks,
  };
}

function fromMonthlyChannelCost(row) {
  return {
    channelId: row.channelId,
    channelName: row.channelName,
    totalOrders: row.totalOrders,
    customerReturnPercent: row.customerReturnPercent,
    rtoPercent: row.rtoPercent,
    actualCostPerUnit: Number(row.actualCostPerUnit),
    totalTcs: Number(row.totalTcs),
    totalTds: Number(row.totalTds),
    totalNetReceived: Number(row.totalNetReceived),
  };
}

function fromMonthlyProductCost(row) {
  return {
    productId: row.productId,
    productName: row.productName,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    productVariantId: row.productVariantId,
    variantSku: row.variantSku,
    totalOrders: row.totalOrders,
    customerReturnPercent: row.customerReturnPercent,
    rtoPercent: row.rtoPercent,
    actualCostPerUnit: Number(row.actualCostPerUnit),
  };
}

export const marketplaceSettlementApi = {
  generateNumber: () => apiClient.get('/marketplace-settlements/generate-number').then((res) => res.data.data.settlementNumber),
  list: ({ pageSize, channelId, ...params } = {}) =>
    apiClient
      .get('/marketplace-settlements', { params: { ...params, ...(pageSize !== undefined && { limit: pageSize }), ...(channelId && { channelId }) } })
      .then((res) => ({
        data: (res.data.data ?? []).map(fromBackendSettlement),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  get: (id) => apiClient.get(`/marketplace-settlements/${id}`).then((res) => fromBackendSettlement(res.data.data)),
  create: (payload) =>
    apiClient
      .post('/marketplace-settlements', {
        channelId: payload.channelId,
        orderId: payload.orderId || null,
        billId: payload.billId || null,
        productVariantId: payload.productVariantId || null,
        settlementDate: payload.settlementDate,
        returnType: payload.returnType,
        grossSaleAmount: payload.grossSaleAmount,
        commissionAmount: payload.commissionAmount,
        shippingCharge: payload.shippingCharge,
        returnCharge: payload.returnCharge,
        adsCharge: payload.adsCharge,
        tcsAmount: payload.tcsAmount,
        tdsAmount: payload.tdsAmount,
        netAmountReceived: payload.netAmountReceived,
        ...(payload.remarks && { remarks: payload.remarks }),
      })
      .then((res) => fromBackendSettlement(res.data.data)),
  monthlyChannelCost: (month) =>
    apiClient.get('/marketplace-settlements/monthly-channel-cost', { params: month ? { month } : {} }).then((res) => (res.data.data ?? []).map(fromMonthlyChannelCost)),
  monthlyProductCost: (month) =>
    apiClient.get('/marketplace-settlements/monthly-product-cost', { params: month ? { month } : {} }).then((res) => (res.data.data ?? []).map(fromMonthlyProductCost)),
};
