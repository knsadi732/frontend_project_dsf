import { apiClient } from '@/services/api/axios';

// Marketplace/channel master (Meesho, Flipkart, Amazon, Myntra, ...) —
// default_cost_per_unit is the bootstrap-mode blended cost assumption
// (courier + return/RTO-weighted + ads + GST, all-in per pair sold) used by
// the Pricing Calculator until real marketplace_settlements data replaces it
// with an actual average.
function fromBackendChannel(channel) {
  return {
    id: channel.id,
    name: channel.name,
    defaultCommissionPercent: Number(channel.defaultCommissionPercent ?? channel.default_commission_percent ?? 0),
    defaultCostPerUnit: Number(channel.defaultCostPerUnit ?? channel.default_cost_per_unit ?? 0),
    assumedCustomerReturnPercent: Number(channel.assumedCustomerReturnPercent ?? channel.assumed_customer_return_percent ?? 0),
    assumedRtoPercent: Number(channel.assumedRtoPercent ?? channel.assumed_rto_percent ?? 0),
    marginMin: Number(channel.marginMin ?? channel.margin_min ?? 0),
    marginMax: Number(channel.marginMax ?? channel.margin_max ?? 0),
    isActive: channel.isActive ?? channel.is_active,
    remarks: channel.remarks,
  };
}

export const marketplaceChannelApi = {
  list: (params = {}) => apiClient.get('/marketplace-channels', { params }).then((res) => (res.data.data ?? []).map(fromBackendChannel)),
  get: (id) => apiClient.get(`/marketplace-channels/${id}`).then((res) => fromBackendChannel(res.data.data)),
  create: (payload) => apiClient.post('/marketplace-channels', payload).then((res) => fromBackendChannel(res.data.data)),
  update: (id, payload) => apiClient.patch(`/marketplace-channels/${id}`, payload).then((res) => fromBackendChannel(res.data.data)),
};
