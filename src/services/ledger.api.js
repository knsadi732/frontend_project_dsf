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

function fromBackendTransaction(row) {
  return {
    id: row.transaction_id,
    date: row.date,
    particulars: row.description || VOUCHER_LABELS[row.type] || row.type,
    voucher: VOUCHER_LABELS[row.type] || row.type,
    debit: Number(row.debit),
    credit: Number(row.credit),
    balance: Number(row.balance),
  };
}

// Per-row ledger — GET /finance/transactions (finance.routes.js) returns rows
// already shaped as {transaction_id, date, type, description, debit, credit,
// balance}, oldest first, with the running balance computed server-side via
// a SQL window function (financeTransaction.repository.js). No client-side
// recomputation needed.
export const ledgerApi = {
  list: () =>
    apiClient.get('/finance/transactions', { params: { limit: 200 } }).then((res) => {
      const data = res.data.data.map(fromBackendTransaction);
      return { data, total: res.data.meta?.total_records ?? data.length };
    }),
  // CA scope — re-derives the ledger summary and stamps it verified
  // (finance.routes.js GET /finance/ledger/cross-verify).
  crossVerify: () => apiClient.get('/finance/ledger/cross-verify').then((res) => res.data.data),
};
