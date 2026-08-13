import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('approval-requests');

function fromBackendRequest(request) {
  return {
    ...request,
    requestType: request.request_type,
    referenceType: request.reference_type,
    referenceId: request.reference_id,
    requestedBy: request.requested_by,
    requestedByName: request.requested_by_name,
    approvedBy: request.approved_by,
    approvedByName: request.approved_by_name,
    approvedAt: request.approved_at,
    // JSONB column — pg returns it already parsed as an object.
    payload: request.payload ?? {},
  };
}

export const approvalRequestApi = {
  list: ({ requestType, ...params } = {}) =>
    baseApi.list({ ...params, ...(requestType && { request_type: requestType }) }).then(({ data, total }) => ({
      data: data.map(fromBackendRequest),
      total,
    })),
  get: (id) => baseApi.get(id).then(fromBackendRequest),
  // approval_request.create — raises a request, doesn't act yet.
  createVendorPayment: ({ vendorBillId, amount, utrNumber, remarks }) =>
    apiClient.post('/approval-requests/vendor-payment', { vendorBillId, amount, utrNumber, remarks }).then((res) => fromBackendRequest(res.data.data)),
  createCreditLimitOverride: ({ customerId, requestedLimit, remarks }) =>
    apiClient.post('/approval-requests/credit-limit-override', { customerId, requestedLimit, remarks }).then((res) => fromBackendRequest(res.data.data)),
  // approval_request.approve (Owner/Superadmin) — executes the real action
  // (posts the vendor payment, or changes the customer's credit limit)
  // atomically with the status flip.
  approve: (id) => apiClient.patch(`/approval-requests/${id}/approve`).then((res) => fromBackendRequest(res.data.data)),
  reject: (id) => apiClient.patch(`/approval-requests/${id}/reject`).then((res) => fromBackendRequest(res.data.data)),
};
