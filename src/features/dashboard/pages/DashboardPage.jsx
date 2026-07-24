import { RefreshCw } from 'lucide-react';
import { useDashboardQuery } from '@/features/dashboard/queries/useDashboardQuery';
import { useRegenerateAnalytics } from '@/features/dashboard/mutations/useRegenerateAnalytics';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { BaseCard } from '@/components/ui/BaseCard';
import { AppButton } from '@/components/ui/AppButton';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { useAuth } from '@/hooks/useAuth';
import { MODULES, ACTIONS } from '@/constants/roles';

// Role-scoped by construction: each section below is gated by the same
// module permission used everywhere else in the app (can()), so e.g. an
// Accountant (Finance-visible, no Sales/Inventory access) only ever sees
// the Ledger Balance card here — not because the backend sent them less
// data, but because /analytics/dashboard has no per-role scoping at all
// (one flat `analytics.view` permission covers everyone — see
// analytics.api.js) and the frontend decides what to render.
export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardQuery();
  const { can } = useAuth();
  const regenerate = useRegenerateAnalytics();

  const canViewSales = can(MODULES.SALES, ACTIONS.VIEW);
  const canViewInventory = can(MODULES.INVENTORY, ACTIONS.VIEW);
  const canViewFinance = can(MODULES.FINANCE, ACTIONS.VIEW);
  const canRegenerate = can(MODULES.DASHBOARD, ACTIONS.CREATE);

  if (isLoading) return <BaseLoader label="Loading dashboard…" />;
  if (isError || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        </div>
        <BaseCard className="p-4">
          <p className="text-sm text-text-muted">Couldn't load the dashboard right now.</p>
        </BaseCard>
      </div>
    );
  }

  const { salesSummary, inventoryStatus, ledgerBalance, ledgerMonth, collectionsTotal } = data;
  const hasFinanceData = ledgerBalance != null || ledgerMonth || collectionsTotal != null;
  const noWidgetsVisible = !canViewSales && !canViewInventory && !(canViewFinance && hasFinanceData);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted">Overview of today's operations.</p>
        </div>
        {canRegenerate && (
          <AppButton variant="secondary" loading={regenerate.isPending} onClick={() => regenerate.mutate()}>
            <RefreshCw className="size-4" />
            Regenerate snapshot
          </AppButton>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {canViewSales && (
          salesSummary?.data ? (
            <>
              <StatCard label="Sales Orders" value={String(salesSummary.data.order_count ?? 0)} />
              <StatCard label="Total Sales" value={`₹${(salesSummary.data.total_sales ?? 0).toLocaleString('en-IN')}`} />
            </>
          ) : (
            <BaseCard className="p-4">
              <p className="text-sm text-text-muted">Sales snapshot not generated yet.</p>
            </BaseCard>
          )
        )}

        {canViewInventory && (
          inventoryStatus?.data ? (
            <>
              <StatCard label="Inventory On Hand" value={String(inventoryStatus.data.total_on_hand ?? 0)} />
              <StatCard label="Inventory Reserved" value={String(inventoryStatus.data.total_reserved ?? 0)} />
            </>
          ) : (
            <BaseCard className="p-4">
              <p className="text-sm text-text-muted">Inventory snapshot not generated yet.</p>
            </BaseCard>
          )
        )}

        {canViewFinance && (
          hasFinanceData ? (
            <>
              {ledgerBalance != null && (
                <StatCard label="Ledger Balance (all-time)" value={`₹${Math.abs(ledgerBalance).toLocaleString('en-IN')} ${ledgerBalance >= 0 ? 'Cr' : 'Dr'}`} />
              )}
              {ledgerMonth && (
                <>
                  <StatCard label="Credit This Month" value={`₹${ledgerMonth.credit.toLocaleString('en-IN')}`} />
                  <StatCard label="Debit This Month" value={`₹${ledgerMonth.debit.toLocaleString('en-IN')}`} />
                </>
              )}
              {collectionsTotal != null && (
                <StatCard label="Collections (Receivables)" value={`₹${collectionsTotal.toLocaleString('en-IN')}`} />
              )}
            </>
          ) : (
            <BaseCard className="p-4">
              <p className="text-sm text-text-muted">Ledger data isn't available right now.</p>
            </BaseCard>
          )
        )}

        {noWidgetsVisible && (
          <BaseCard className="p-4 sm:col-span-2 xl:col-span-3">
            <p className="text-sm text-text-muted">No dashboard widgets available for your role.</p>
          </BaseCard>
        )}
      </div>
    </div>
  );
}
