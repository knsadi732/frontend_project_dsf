import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Factory, TrendingUp, Landmark, PackageCheck, ScrollText } from 'lucide-react';
import { StatCard } from '@/features/dashboard/components/StatCard';

function fmtCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// Pre-seed the target page's own persisted tab (see usePersistedTab) before
// navigating, so the click actually lands on the relevant sub-tab instead of
// whatever tab that page last remembered.
function presetTab(storageKey, tab) {
  try {
    localStorage.setItem(`tab:${storageKey}`, tab);
  } catch {
    // ignore — navigation still works, just lands on whatever tab was last open
  }
}

/**
 * CEO/Owner-level "at a glance" tiles — the NetSuite-style Home tiles pattern
 * requested: 6 headline numbers here, each a click-through into the existing
 * dedicated page for the full detail (no separate detail views are built —
 * Sales/Production/Finance/Inventory already are the "detail pages").
 */
export function ExecutiveOverview({
  salesThisMonth,
  ordersThisMonth,
  dailyOutput,
  dailyTarget,
  revenueThisMonth,
  cashBalance,
  inventoryOnHand,
  payableTotal,
}) {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-text">Overview</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Sales"
          value={fmtCurrency(salesThisMonth)}
          subtitle={`${ordersThisMonth ?? 0} orders this month`}
          icon={ShoppingCart}
          tone="navy"
          onClick={() => navigate('/sales')}
        />
        <StatCard
          label="Production"
          value={dailyOutput.toLocaleString('en-IN')}
          subtitle={dailyTarget != null ? `of ${dailyTarget.toLocaleString('en-IN')}/day target` : "today's output"}
          icon={Factory}
          tone="steel"
          onClick={() => navigate('/production')}
        />
        <StatCard
          label="Revenue"
          value={fmtCurrency(revenueThisMonth)}
          subtitle="this month, from books"
          icon={TrendingUp}
          tone="blue"
          onClick={() => {
            presetTab('finance', 'compliance');
            presetTab('compliance', 'reports');
            navigate('/finance');
          }}
        />
        <StatCard
          label="Company Fund Available"
          value={cashBalance != null ? fmtCurrency(cashBalance) : '—'}
          subtitle="DSF bank/cash balance"
          icon={Landmark}
          tone={cashBalance == null || cashBalance >= 0 ? 'sky' : 'charcoal'}
          onClick={() => {
            presetTab('finance', 'ledger');
            navigate('/finance');
          }}
        />
        <StatCard
          label="Inventory"
          value={String(inventoryOnHand ?? 0)}
          subtitle="units on hand"
          icon={PackageCheck}
          tone="silver"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          label="Payable (Loan / Debt)"
          value={fmtCurrency(payableTotal)}
          subtitle="loans + dues owed"
          icon={ScrollText}
          tone="charcoal"
          onClick={() => {
            presetTab('finance', 'payables');
            navigate('/finance');
          }}
        />
      </div>
    </div>
  );
}
