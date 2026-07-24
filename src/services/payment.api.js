import { apiClient } from '@/services/api/axios';

// POST /finance/payment-slips (finance.validator.js) — customer collections
// (Accounts Receivable), NOT vendor payments. `orderId` is optional (a
// payment can be recorded independent of any order); `customerId`/`amount`
// are required. `paymentMode` is only cash|upi|card|bank_transfer on this
// endpoint (narrower than Chapter 15's fuller payment-method list). Also
// auto-creates a linked manual/credit finance_transaction.
function toBackendPayload(payload) {
  return {
    customerId: payload.customerId,
    amount: payload.amount,
    ...(payload.orderId && { orderId: payload.orderId }),
    ...(payload.paymentMode && { paymentMode: payload.paymentMode }),
  };
}

function fromBackendSlip(row) {
  return {
    id: row.id ?? row.slipNumber ?? row.slip_number,
    slipNumber: row.slipNumber ?? row.slip_number,
    customerId: row.customerId ?? row.customer_id,
    orderId: row.orderId ?? row.order_id,
    amount: Number(row.amount),
    paymentMode: row.paymentMode ?? row.payment_mode,
    issuedBy: row.issuedBy ?? row.issued_by,
    createdAt: row.createdAt ?? row.created_at,
  };
}

export const paymentApi = {
  list: (params) =>
    apiClient.get('/finance/payment-slips', { params }).then((res) => ({
      data: (res.data.data ?? []).map(fromBackendSlip),
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  create: (payload) =>
    apiClient.post('/finance/payment-slips', toBackendPayload(payload)).then((res) => fromBackendSlip(res.data.data)),
};
