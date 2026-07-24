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

// GET /finance/transactions rows carry no running-balance field (confirmed
// against ApiList.md — the only authoritative balance source is GET
// /finance/ledger/summary's flat {debit, credit, balance} sum). Don't
// fabricate one here.
function fromBackendTransaction(row) {
  return {
    id: row.transaction_id,
    date: row.date,
    particulars: row.description || VOUCHER_LABELS[row.type] || row.type,
    voucher: VOUCHER_LABELS[row.type] || row.type,
    debit: Number(row.debit),
    credit: Number(row.credit),
  };
}

export const ledgerApi = {
  list: () =>
    apiClient.get('/finance/transactions', { params: { limit: 200 } }).then((res) => {
      const data = res.data.data.map(fromBackendTransaction);
      return { data, total: res.data.meta?.total_records ?? data.length };
    }),
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
