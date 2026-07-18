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
    id: row.id,
    date: row.created_at,
    particulars: row.description || VOUCHER_LABELS[row.reference_type] || row.reference_type,
    voucher: VOUCHER_LABELS[row.reference_type] || row.reference_type,
    direction: row.direction,
    amount: Number(row.amount),
  };
}

// Per-row ledger — GET /finance/transactions (finance.routes.js) is the
// only endpoint with per-transaction detail; /finance/ledger/summary only
// returns a {debit, credit, balance} aggregate. Running balance is
// computed client-side from the real rows, oldest first, Dr/Cr notation.
export const ledgerApi = {
  list: () =>
    apiClient.get('/finance/transactions', { params: { limit: 200, sort_by: 'created_at', sort_order: 'asc' } }).then((res) => {
      const rows = res.data.data.map(fromBackendTransaction).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

      let balance = 0;
      const data = rows.map((entry) => {
        balance += entry.direction === 'credit' ? entry.amount : -entry.amount;
        return { ...entry, balance };
      });

      return { data, total: res.data.meta?.total_records ?? data.length };
    }),
  // CA scope — re-derives the ledger summary and stamps it verified
  // (finance.routes.js GET /finance/ledger/cross-verify).
  crossVerify: () => apiClient.get('/finance/ledger/cross-verify').then((res) => res.data.data),
};
