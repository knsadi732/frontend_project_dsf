import { analyticsApi } from '@/services/analytics.api';
import { ledgerApi } from '@/services/ledger.api';
import { paymentApi } from '@/services/payment.api';

function firstDayOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

// Real backend has no single "/dashboard/summary" endpoint — a dashboard is
// composed client-side from whatever the caller's role can see:
// /analytics/dashboard's two widgets (sales_summary, inventory_status),
// /finance/ledger/summary, and /finance/payment-slips for collections.
// Role-based hiding happens entirely on the frontend (DashboardPage's
// `can()` checks) since analytics.view is a single flat permission with no
// server-side per-widget scoping (see analytics.api.js).
//
// Balance is deliberately all-time — a balance is cumulative by nature (like
// a bank balance), not "today's balance". Credit/Debit/Collections are
// scoped to the current month instead, so the dashboard also shows this
// period's activity rather than just repeating the all-time totals.
//
// There is no Accounts-Payable/vendor-bill tracking anywhere in this
// backend (confirmed against ApiList.md — /finance/bills is customer sales
// invoices, not vendor bills; Purchase Orders have no payable-tracking or
// GRN either) — "how much debt the company owes" cannot be shown until a
// real backend module exists for it.
export const dashboardApi = {
  // allSettled, not all — a role without `analytics.view` (e.g. seeded
  // Accountant/CA per ApiList.md) or without finance access 403s on one of
  // these; that must not blank out whatever the caller *can* see.
  summary: () =>
    Promise.allSettled([
      analyticsApi.dashboard(),
      ledgerApi.summary(),
      ledgerApi.summary({ from: firstDayOfCurrentMonth() }),
      paymentApi.list({ pageSize: 500 }),
    ]).then(([widgetsResult, allTimeResult, monthResult, paymentsResult]) => {
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
        ledgerBalance: allTimeResult.status === 'fulfilled' ? allTimeResult.value.balance : null,
        ledgerMonth: monthResult.status === 'fulfilled' ? monthResult.value : null,
        collectionsTotal,
      };
    }),
  regenerate: () => analyticsApi.regenerate(),
};
