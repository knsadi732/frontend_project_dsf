import { apiClient } from '@/services/api/axios';

// A due amount owed to any party outside the PO/GRN flow (e.g. a rent
// deposit owed to a landlord, paid off over time instead of up front).
// amount_due is derived server-side as total_amount - amount_paid.
function fromBackendPayable(payable) {
  return {
    id: payable.id,
    payableNumber: payable.payableNumber ?? payable.payable_number,
    branchId: payable.branchId ?? payable.branch_id,
    partyName: payable.partyName ?? payable.party_name,
    purpose: payable.purpose,
    totalAmount: Number(payable.totalAmount ?? payable.total_amount),
    amountPaid: Number(payable.amountPaid ?? payable.amount_paid ?? 0),
    amountDue: Number(payable.amountDue ?? payable.amount_due ?? 0),
    dueDate: payable.dueDate ?? payable.due_date,
    status: payable.status,
    remarks: payable.remarks,
  };
}

function fromBackendPayment(row) {
  return {
    id: row.id,
    payableId: row.payableId ?? row.payable_id,
    amount: Number(row.amount),
    paidAt: row.paidAt ?? row.paid_at,
    remarks: row.remarks,
  };
}

export const payableApi = {
  generateNumber: () => apiClient.get('/payables/generate-number').then((res) => res.data.data.payableNumber),
  list: ({ status, ...params } = {}) =>
    apiClient.get('/payables', { params: { ...params, ...(status && { status }) } }).then((res) => ({
      data: (res.data.data ?? []).map(fromBackendPayable),
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  get: (id) => apiClient.get(`/payables/${id}`).then((res) => fromBackendPayable(res.data.data)),
  create: (payload) =>
    apiClient
      .post('/payables', {
        partyName: payload.partyName,
        purpose: payload.purpose,
        totalAmount: payload.totalAmount,
        ...(payload.dueDate && { dueDate: payload.dueDate }),
        ...(payload.remarks && { remarks: payload.remarks }),
        ...(payload.branchId && { branchId: payload.branchId }),
      })
      .then((res) => fromBackendPayable(res.data.data)),
  writeOff: (id) => apiClient.patch(`/payables/${id}/write-off`).then((res) => fromBackendPayable(res.data.data)),
  listPayments: (id) =>
    apiClient.get(`/payables/${id}/payments`).then((res) => (res.data.data ?? []).map(fromBackendPayment)),
  // Payable auto-closes to 'paid' once the due balance hits 0 — no separate
  // close call needed. Fails with PAYABLE_002 if the payable isn't open.
  createPayment: (id, { amount, paidAt, remarks }) =>
    apiClient
      .post(`/payables/${id}/payments`, {
        amount,
        ...(paidAt && { paidAt }),
        ...(remarks && { remarks }),
      })
      .then((res) => fromBackendPayment(res.data.data)),
};
