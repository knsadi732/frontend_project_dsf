import { apiClient } from '@/services/api/axios';

// Voucher-type display label for each of finance_transactions' 4 possible
// reference_type values (finance.validator.js) — there's no separate
// "Purchase Return" reference_type on the backend, only these 4.
const VOUCHER_LABELS = {
  order: 'Sales',
  purchase_order: 'Purchase',
  expense: 'Expense',
  manual: 'Payment',
};

// GET /finance/transactions rows DO carry a running balance (financeTransaction.repository.js's
// window-function SUM ... OVER, ordered oldest-first) — the "CA Impact" column
// of the owner's manual spreadsheet this ledger mirrors.
function fromBackendTransaction(row) {
  return {
    id: row.transaction_id,
    date: row.date,
    particulars: row.description || VOUCHER_LABELS[row.type] || row.type,
    voucher: VOUCHER_LABELS[row.type] || row.type,
    transactionNature: row.transaction_nature,
    category: row.category,
    partyName: row.party_name,
    utrReference: row.utr_reference,
    invoiceNumber: row.invoice_number,
    // reference_id only means "order id" when type is 'order' — orderNumber
    // comes pre-resolved from the backend's join, null otherwise. orderId is a
    // separate free-text field (e.g. a vendor's own order number, like an Amazon
    // order id on a purchase) distinct from the linked Sales Order's order_number.
    referenceType: row.type,
    referenceId: row.reference_id,
    orderNumber: row.order_number,
    orderId: row.order_id,
    paymentMode: row.payment_mode,
    fundingSourceId: row.funding_source_id,
    fundingSourceName: row.funding_source_name,
    fundingType: row.funding_type,
    paidReceivedBy: row.paid_received_by,
    paidReceivedByName: row.paid_received_by_name,
    isGstApplicable: row.is_gst_applicable ?? false,
    gstRate: row.gst_rate != null ? Number(row.gst_rate) : null,
    taxableValue: row.taxable_value != null ? Number(row.taxable_value) : null,
    gstAmount: Number(row.gst_amount ?? 0),
    debit: Number(row.debit),
    credit: Number(row.credit),
    balance: Number(row.balance),
  };
}

function fromBackendFundingSource(source) {
  return {
    id: source.id,
    partyName: source.party_name,
    partyType: source.party_type,
    defaultFundingType: source.default_funding_type,
    contactInfo: source.contact_info,
    entryCount: Number(source.entry_count ?? 0),
    totalFunded: Number(source.total_funded ?? 0),
  };
}

export const ledgerApi = {
  list: () =>
    apiClient.get('/finance/transactions', { params: { limit: 200 } }).then((res) => {
      const data = res.data.data.map(fromBackendTransaction);
      return { data, total: res.data.meta?.total_records ?? data.length };
    }),
  listFundingSources: () =>
    apiClient.get('/finance/funding-sources', { params: { limit: 200 } }).then((res) => ({
      data: res.data.data.map(fromBackendFundingSource),
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  createFundingSource: ({ partyName, partyType, defaultFundingType, contactInfo }) =>
    apiClient
      .post('/finance/funding-sources', { partyName, partyType, defaultFundingType, contactInfo })
      .then((res) => fromBackendFundingSource(res.data.data)),
  // POST /finance/quick-entry — the single spreadsheet-shaped entry point
  // (finance.service.js's quickEntry) covering the owner's manual ledger:
  // Nature/Credit-Debit/Category/Purpose/Fund Source/Paid By/Payment Mode/
  // Invoice-Order ID/Party/GST, all in one row.
  quickEntry: (payload) =>
    apiClient
      .post('/finance/quick-entry', {
        transactionNature: payload.transactionNature,
        transactionDate: payload.transactionDate,
        amount: payload.amount,
        direction: payload.direction || undefined,
        category: payload.category || undefined,
        description: payload.description || undefined,
        partyName: payload.partyName || undefined,
        utrReference: payload.utrReference || undefined,
        paymentMode: payload.paymentMode || undefined,
        invoiceOrderId: payload.invoiceOrderId || undefined,
        fundingSourceId: payload.fundingSourceId || undefined,
        fundingType: payload.fundingType || undefined,
        paidReceivedBy: payload.paidReceivedBy || undefined,
        ...(payload.gstApplicable && {
          gst: { applicable: true, gstAmount: payload.gstAmount, taxableValue: payload.gstTaxableValue, partyType: payload.gstPartyType },
        }),
      })
      // Raw finance_transactions row, not list-shaped (no running balance /
      // joined names) — callers just invalidate the ledger list to refetch
      // properly-shaped rows rather than rendering this response directly.
      .then((res) => res.data.data),
  // GET /finance/ledger/summary — flat sum over the (optionally
  // date-filtered) range: { debit, credit, balance } where
  // balance = credit - debit. No opening/closing carry-forward.
  summary: ({ from, to } = {}) =>
    apiClient
      .get('/finance/ledger/summary', { params: { ...(from && { from }), ...(to && { to }) } })
      .then((res) => ({
        debit: Number(res.data.data.debit),
        credit: Number(res.data.data.credit),
        balance: Number(res.data.data.balance),
      })),
  // CA scope — re-derives the ledger summary and stamps it verified
  // (finance.routes.js GET /finance/ledger/cross-verify).
  crossVerify: () => apiClient.get('/finance/ledger/cross-verify').then((res) => res.data.data),
  // POST /finance/transactions (finance.validator.js's recordTransaction).
  // Only `referenceType: 'manual'` lets the caller pick `direction` — every
  // other type ('order'/'purchase_order'/'expense') has its direction
  // forced server-side (finance.service.js), so this is only ever used for
  // hand-entered transactions like "Add Fund" (a manual credit — see
  // AddFundModal). Posting date must fall inside an open fiscal period or
  // the backend rejects it.
  recordTransaction: ({ amount, direction, description, branchId, referenceId }) =>
    apiClient
      .post('/finance/transactions', {
        referenceType: 'manual',
        direction,
        amount,
        ...(description && { description }),
        ...(branchId && { branchId }),
        ...(referenceId && { referenceId }),
      })
      .then((res) => fromBackendTransaction(res.data.data)),
};
