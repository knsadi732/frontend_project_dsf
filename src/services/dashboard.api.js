import { analyticsApi } from '@/services/analytics.api';
import { ledgerApi } from '@/services/ledger.api';
import { paymentApi } from '@/services/payment.api';
import { loanApi } from '@/services/loan.api';
import { payableApi } from '@/services/payable.api';

function firstDayOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

// GET /loans (list) doesn't include the derived outstandingBalance — only
// GET /loans/:id does — so totalling outstanding debt needs one detail
// call per active loan. Fine at the scale of a company's active loan
// count; would need a dedicated backend aggregate if that ever grows large.
function totalOutstandingDebt() {
  return loanApi.list({ status: 'active', pageSize: 100 }).then((res) =>
    Promise.allSettled(res.data.map((loan) => loanApi.get(loan.id))).then((results) =>
      results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.outstandingBalance ?? 0 : 0), 0),
    ),
  );
}

// Payables (Dues) module — informal amounts owed outside the loan/PO flow
// (e.g. Owner Advance Reimbursement). amount_due is a generated column
// (total_amount - amount_paid) that a status change alone never touches, so
// a 'written_off' payable still carries its old non-zero amount_due — it
// must be excluded explicitly, not inferred from the amount being zero.
function totalPayablesDue() {
  return payableApi
    .list({ pageSize: 200 })
    .then((res) => res.data.filter((payable) => payable.status === 'pending' || payable.status === 'partial'))
    .then((rows) => rows.reduce((sum, payable) => sum + payable.amountDue, 0));
}

// Real backend has no single "/dashboard/summary" endpoint — a dashboard is
// composed client-side from whatever the caller's role can see:
// /analytics/dashboard's two widgets (sales_summary, inventory_status),
// /finance/ledger/summary, /finance/payment-slips for collections, and
// /loans for outstanding debt. Role-based hiding happens entirely on the
// frontend (DashboardPage's `can()` checks) since analytics.view is a
// single flat permission with no server-side per-widget scoping (see
// analytics.api.js).
//
// Balance is deliberately all-time — a balance is cumulative by nature (like
// a bank balance), not "today's balance". Credit/Debit/Collections are
// scoped to the current month instead, so the dashboard also shows this
// period's activity rather than just repeating the all-time totals.
//
// Balance itself comes from cashBalance(), not summary() — summary() is the
// CA/compliance-scope total (every rupee, including a funding source paying a
// vendor directly out of pocket, which never touches the company's own
// account); a real bank-balance-like figure must only count rows that
// actually moved the company's own cash (see financeTransaction.repository.js
// getCashBalance / affects_company_cash).
//
// "Outstanding Debt" is loan debt (bank/vendor/other lenders via the Loans
// module); totalPayablesDue() above is the separate Payables (Dues) module
// (informal dues outside the loan/PO flow). The Owner overview combines both
// into one "Payable (Loan or Debt)" figure — see ExecutiveOverview.
export const dashboardApi = {
  // allSettled, not all — a role without `analytics.view` (e.g. seeded
  // Accountant/CA per ApiList.md) or without finance access 403s on one of
  // these; that must not blank out whatever the caller *can* see.
  summary: () =>
    Promise.allSettled([
      analyticsApi.dashboard(),
      ledgerApi.cashBalance(),
      ledgerApi.summary({ from: firstDayOfCurrentMonth() }),
      paymentApi.list({ pageSize: 500 }),
      totalOutstandingDebt(),
      totalPayablesDue(),
    ]).then(([widgetsResult, cashBalanceResult, monthResult, paymentsResult, debtResult, payablesResult]) => {
      const widgets = widgetsResult.status === 'fulfilled' ? widgetsResult.value : [];
      const widgetsByKey = Object.fromEntries(widgets.map((w) => [w.key, w]));

      // Payment-slip rows carry no confirmed date field to filter by, so
      // this is a best-effort total over whatever the list endpoint
      // returns (up to 500 rows) — not strictly "this month".
      const collectionsTotal =
        paymentsResult.status === 'fulfilled'
          ? paymentsResult.value.data.reduce((sum, slip) => sum + slip.amount, 0)
          : null;

      return {
        salesSummary: widgetsByKey.sales_summary ?? null,
        inventoryStatus: widgetsByKey.inventory_status ?? null,
        ledgerBalance: cashBalanceResult.status === 'fulfilled' ? cashBalanceResult.value : null,
        ledgerMonth: monthResult.status === 'fulfilled' ? monthResult.value : null,
        collectionsTotal,
        outstandingDebt: debtResult.status === 'fulfilled' ? debtResult.value : null,
        payablesDue: payablesResult.status === 'fulfilled' ? payablesResult.value : null,
      };
    }),
  regenerate: () => analyticsApi.regenerate(),
};
