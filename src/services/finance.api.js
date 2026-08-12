import { apiClient } from '@/services/api/axios';

// Real backend: invoices ARE bills (bill.repository.js, extended with
// customer_id/due_date/balance_due — see migration 0074). A bill only ever
// gets created by order.service.js the moment an order's status first
// reaches "dispatched" (or manually via POST /finance/bills/print) — there's
// no freeform create/delete, so this only exposes list/get/status-update.
function fromBackendBill(bill) {
  return {
    id: bill.id,
    invoiceNumber: bill.bill_number,
    orderId: bill.order_id,
    salesOrderNumber: bill.sales_order_number,
    party: bill.party,
    amount: Number(bill.total_amount),
    gstAmount: Number(bill.gst_amount),
    gstRate: Number(bill.total_amount) > 0 ? Math.round((Number(bill.gst_amount) / (Number(bill.total_amount) - Number(bill.gst_amount))) * 100) : 0,
    balanceDue: Number(bill.balance_due),
    dueDate: bill.due_date,
    status: bill.status,
  };
}

export const financeApi = {
  list: (params = {}) =>
    apiClient
      .get('/finance/bills', {
        params: {
          search: params.search,
          status: params.status,
          date_from: params.dateFrom,
          date_to: params.dateTo,
          page: params.page,
          limit: params.pageSize,
        },
      })
      .then((res) => ({
        data: res.data.data.map(fromBackendBill),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  get: (id) => apiClient.get(`/finance/bills/${id}`).then((res) => fromBackendBill(res.data.data)),
  // status: 'unpaid' | 'partial' | 'paid'; paidAmount: total received so far
  // (backend derives balance_due = amount - paidAmount).
  updateStatus: (id, { status, paidAmount }) =>
    apiClient.patch(`/finance/bills/${id}/status`, { status, paidAmount }).then((res) => fromBackendBill(res.data.data)),
};
