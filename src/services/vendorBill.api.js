import { apiClient } from '@/services/api/axios';

// Real backend rows are `vendor_bills.*` plus vendor/PO/PR/GRN names joined
// in server-side (vendorBill.repository.js SELECT_WITH_NAMES) — no separate
// lookups needed on the client.
function toClientBill(row) {
  const totalAmount = Number(row.total_amount ?? 0);
  const amountPaid = Number(row.amount_paid ?? 0);
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorPhone: row.vendor_phone,
    vendorEmail: row.vendor_email,
    vendorGstin: row.vendor_gstin,
    vendorBankAccountNumber: row.vendor_bank_account_number,
    vendorBankIfsc: row.vendor_bank_ifsc,
    purchaseOrderId: row.purchase_order_id,
    poNumber: row.po_number,
    prNumber: row.pr_number,
    grnId: row.grn_id,
    grnNumber: row.grn_number,
    totalAmount,
    amountPaid,
    amountDue: row.amount_due !== undefined ? Number(row.amount_due) : totalAmount - amountPaid,
    invoiceUrl: row.invoice_url,
    paymentDueDate: row.payment_due_date,
    status: row.status,
    utrNumber: row.utr_number,
    paidAt: row.paid_at,
  };
}

// Vendor Bills are Accounts Payable rows auto-created the moment a GRN is
// generated (grn.service.js, same transaction as GRN creation) — there is
// no create/delete endpoint, only list/detail/record-payment.
export const vendorBillApi = {
  list: ({ pageSize, ...params } = {}) =>
    apiClient
      .get('/vendor-bills', { params: { ...params, ...(pageSize !== undefined && { limit: pageSize }) } })
      .then((res) => ({
        data: res.data.data.map(toClientBill),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  get: (id) => apiClient.get(`/vendor-bills/${id}`).then((res) => toClientBill(res.data.data)),
  // Body: { amount, utrNumber } — utrNumber is required by the backend
  // validator, amounts over the remaining balance are rejected (VB_002).
  recordPayment: (id, { amount, utrNumber }) =>
    apiClient.post(`/vendor-bills/${id}/payment`, { amount, utrNumber }).then((res) => toClientBill(res.data.data)),
};
