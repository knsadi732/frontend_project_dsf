import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useDashboardQuery } from '@/features/dashboard/queries/useDashboardQuery';
import { useRegenerateAnalytics } from '@/features/dashboard/mutations/useRegenerateAnalytics';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useProductStockQuery } from '@/features/inventory/queries/useProductStockQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useWorkOrdersQuery } from '@/features/production/queries/useWorkOrdersQuery';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { DashboardBarChart } from '@/features/dashboard/components/DashboardBarChart';
import { SalesTrendChart } from '@/features/dashboard/components/SalesTrendChart';
import { SalesProductPieChart } from '@/features/dashboard/components/SalesProductPieChart';
import { SalesVsInventoryChart } from '@/features/dashboard/components/SalesVsInventoryChart';
import { MarginChart } from '@/features/dashboard/components/MarginChart';
import { BreakEvenChart } from '@/features/dashboard/components/BreakEvenChart';
import { ProductSalesTrendModal } from '@/features/dashboard/components/ProductSalesTrendModal';
import { salesTrendByDate, productMix, salesVsInventory } from '@/features/dashboard/utils/salesChartData';
import { marginByVariant, breakEvenEligibleVariants } from '@/features/production/utils/unitCost';
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
  const [selectedProduct, setSelectedProduct] = useState(null);

  const canViewSales = can(MODULES.SALES, ACTIONS.VIEW);
  const canViewInventory = can(MODULES.INVENTORY, ACTIONS.VIEW);
  const canViewFinance = can(MODULES.FINANCE, ACTIONS.VIEW);
  const canRegenerate = can(MODULES.DASHBOARD, ACTIONS.CREATE);

  // Called unconditionally (Rules of Hooks) regardless of canViewSales/
  // canViewInventory — cheap read-only fetches, only their *results* are
  // gated in the JSX below, same "just try, don't block the rest of the
  // page" approach dashboard.api.js already takes for finance/loans.
  const { data: salesOrdersData } = useSalesOrdersQuery({ pageSize: 300 });
  const { data: stockData } = useProductStockQuery({ pageSize: 500 });
  const { data: productsData } = useProductsQuery({ pageSize: 300 });
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500 });
  const { data: workOrdersData } = useWorkOrdersQuery({ pageSize: 500 });

  const orders = useMemo(() => salesOrdersData?.data ?? [], [salesOrdersData]);
  const salesTrend = useMemo(() => salesTrendByDate(orders), [orders]);
  const salesMix = useMemo(() => productMix(orders), [orders]);
  const productsById = useMemo(() => new Map((productsData?.data ?? []).map((p) => [p.id, p])), [productsData]);
  const variantsById = useMemo(() => new Map((variantsData?.data ?? []).map((v) => [v.id, v])), [variantsData]);
  const soldVsStock = useMemo(
    () => salesVsInventory(orders, stockData?.data ?? [], variantsById, productsById),
    [orders, stockData, variantsById, productsById],
  );
  const margins = useMemo(
    () => marginByVariant(workOrdersData?.data ?? [], variantsById),
    [workOrdersData, variantsById],
  );
  const workOrders = useMemo(() => workOrdersData?.data ?? [], [workOrdersData]);
  const breakEvenVariants = useMemo(
    () => breakEvenEligibleVariants(workOrders, variantsById),
    [workOrders, variantsById],
  );

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

  const { salesSummary, inventoryStatus, ledgerBalance, ledgerMonth, collectionsTotal, outstandingDebt } = data;
  const hasFinanceData = ledgerBalance != null || ledgerMonth || collectionsTotal != null || outstandingDebt != null;
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
              {outstandingDebt != null && (
                <StatCard label="Outstanding Debt (Loans)" value={`₹${outstandingDebt.toLocaleString('en-IN')}`} />
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {canViewInventory && inventoryStatus?.data && (
          <BaseCard className="p-3">
            <h2 className="mb-1 text-sm font-medium text-text">Inventory split</h2>
            {/* green/amber — validated pair (dataviz skill), same hex both
                modes since the app's lightened dark shades fail the
                dark-surface lightness band as an adjacent chart pair */}
            <DashboardBarChart
              height={130}
              data={[
                { name: 'On Hand', value: inventoryStatus.data.total_on_hand ?? 0, light: '#16a34a', dark: '#16a34a' },
                { name: 'Reserved', value: inventoryStatus.data.total_reserved ?? 0, light: '#d97706', dark: '#d97706' },
              ]}
            />
          </BaseCard>
        )}

        {canViewFinance && ledgerMonth && (
          <BaseCard className="p-3">
            <h2 className="mb-1 text-sm font-medium text-text">Credit vs debit (this month)</h2>
            {/* blue/red, not green/red — validated pair; red/green fails CVD
                separation outright (deutan ΔE 5.0, below the hard floor) */}
            <DashboardBarChart
              height={130}
              data={[
                { name: 'Credit', value: ledgerMonth.credit ?? 0, light: '#2a78d6', dark: '#3987e5' },
                { name: 'Debit', value: ledgerMonth.debit ?? 0, light: '#e34948', dark: '#e66767' },
              ]}
            />
          </BaseCard>
        )}

        {canViewSales && (
          <BaseCard className="p-3">
            <h2 className="mb-1 text-sm font-medium text-text">Sales trend</h2>
            <SalesTrendChart data={salesTrend} height={130} />
          </BaseCard>
        )}

        {canViewSales && (
          <BaseCard className="p-3">
            <h2 className="mb-1 text-sm font-medium text-text">Product mix — click a slice</h2>
            <SalesProductPieChart data={salesMix} onSliceClick={setSelectedProduct} height={170} />
          </BaseCard>
        )}

        {canViewSales && canViewInventory && (
          <BaseCard className="p-3">
            <h2 className="mb-1 text-sm font-medium text-text">Sales vs inventory (units)</h2>
            <SalesVsInventoryChart data={soldVsStock} height={170} />
          </BaseCard>
        )}

        {canViewSales && (
          <BaseCard className="p-3">
            <h2 className="mb-1 text-sm font-medium text-text">Profit / loss per unit</h2>
            <MarginChart data={margins} height={170} />
          </BaseCard>
        )}
      </div>

      {canViewSales && (
        <BaseCard className="p-4">
          <h2 className="mb-1 text-sm font-medium text-text">Break-even analysis</h2>
          <p className="mb-2 text-xs text-text-muted">
            Fixed cost (salary + machine + overhead) vs. Total Cost vs. Revenue, by quantity — where Total Cost and
            Revenue cross is the no-loss-no-profit point for the selected SKU.
          </p>
          <BreakEvenChart variants={breakEvenVariants} workOrders={workOrders} variantsById={variantsById} height={220} />
        </BaseCard>
      )}

      <ProductSalesTrendModal
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        orders={orders}
        productName={selectedProduct}
      />
    </div>
  );
}
