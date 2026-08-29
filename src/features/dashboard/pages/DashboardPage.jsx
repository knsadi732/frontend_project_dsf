import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  Users,
  IndianRupee,
  Target,
  Factory,
  ShoppingCart,
  Wallet,
  PackageCheck,
  PackageSearch,
  Landmark,
  ArrowDownToLine,
  ArrowUpFromLine,
  HandCoins,
  ScrollText,
} from 'lucide-react';
import { useDashboardQuery } from '@/features/dashboard/queries/useDashboardQuery';
import { useSalesForecastQuery } from '@/features/dashboard/queries/useSalesForecastQuery';
import { useChannelForecastQuery } from '@/features/dashboard/queries/useChannelForecastQuery';
import { useRegenerateAnalytics } from '@/features/dashboard/mutations/useRegenerateAnalytics';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useProductStockQuery } from '@/features/inventory/queries/useProductStockQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useWorkOrdersQuery } from '@/features/production/queries/useWorkOrdersQuery';
import { usePurchaseRequestsQuery } from '@/features/purchaseRequests/queries/usePurchaseRequestsQuery';
import { useMaterialIssueRequestsQuery } from '@/features/materialIssueRequests/queries/useMaterialIssueRequestsQuery';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useAttendanceQuery } from '@/features/attendance/queries/useAttendanceQuery';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { useMachinesQuery } from '@/features/machines/queries/useMachinesQuery';
import { useApprovalRequestsQuery } from '@/features/approvalRequests/queries/useApprovalRequestsQuery';
import { useSettingsQuery } from '@/features/settings/queries/useSettingsQuery';
import { useUpdateSettings } from '@/features/settings/mutations/useUpdateSettings';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ChartCard } from '@/features/dashboard/components/ChartCard';
import { DashboardBarChart } from '@/features/dashboard/components/DashboardBarChart';
import { SalesTrendChart } from '@/features/dashboard/components/SalesTrendChart';
import { SalesProductPieChart } from '@/features/dashboard/components/SalesProductPieChart';
import { SalesVsInventoryChart } from '@/features/dashboard/components/SalesVsInventoryChart';
import { MarginChart } from '@/features/dashboard/components/MarginChart';
import { BreakEvenChart } from '@/features/dashboard/components/BreakEvenChart';
import { ProductLifecycleChart } from '@/features/dashboard/components/ProductLifecycleChart';
import { ProductSalesTrendModal } from '@/features/dashboard/components/ProductSalesTrendModal';
import { SalesForecastChart } from '@/features/dashboard/components/SalesForecastChart';
import { salesTrendByDate, productMix, salesVsInventory } from '@/features/dashboard/utils/salesChartData';
import { marginByVariant, breakEvenEligibleVariants } from '@/features/production/utils/unitCost';
import {
  wipTotal,
  receivablesByBucket,
  avgCostPerPair,
  otifRate,
  dailyProductionOutput,
  lifecycleEligibleProducts,
} from '@/features/dashboard/utils/ownerOverview';
import { receivableAging } from '@/features/reports/utils/reportAggregations';
import { BaseCard } from '@/components/ui/BaseCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { useAuth } from '@/hooks/useAuth';
import { MODULES, ACTIONS } from '@/constants/roles';

const AMBER_RAMP_LIGHT = ['#fde68a', '#fbbf24', '#d97706', '#b91c1c'];
const AMBER_RAMP_DARK = ['#fcd34d', '#f59e0b', '#c2410c', '#dc2626'];

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
  const queryClient = useQueryClient();
  const regenerate = useRegenerateAnalytics();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const canViewSales = can(MODULES.SALES, ACTIONS.VIEW);
  const canViewInventory = can(MODULES.INVENTORY, ACTIONS.VIEW);
  const canViewFinance = can(MODULES.FINANCE, ACTIONS.VIEW);
  const canRegenerate = can(MODULES.DASHBOARD, ACTIONS.CREATE);
  // Owner/Super Admin only — no other role gets a FORECASTING entry, so
  // hasPermission() defaults them to denied; Owner/SuperAdmin bypass the
  // matrix entirely (FULL_ACCESS_ROLES).
  const canViewForecast = can(MODULES.FORECASTING, ACTIONS.VIEW);

  // Called unconditionally (Rules of Hooks) regardless of canViewSales/
  // canViewInventory — cheap read-only fetches, only their *results* are
  // gated in the JSX below, same "just try, don't block the rest of the
  // page" approach dashboard.api.js already takes for finance/loans.
  const { data: salesOrdersData } = useSalesOrdersQuery({ pageSize: 300 });
  const { data: stockData } = useProductStockQuery({ pageSize: 500 });
  const { data: productsData } = useProductsQuery({ pageSize: 300 });
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500 });
  const { data: workOrdersData } = useWorkOrdersQuery({ pageSize: 500 });
  const { data: pendingPRData } = usePurchaseRequestsQuery({ status: 'pending_approval', pageSize: 200 });
  const { data: pendingMIRData } = useMaterialIssueRequestsQuery({ status: 'pending_approval', pageSize: 200 });
  const { data: pendingApprovalsData } = useApprovalRequestsQuery({ status: 'pending_approval', pageSize: 200 });
  const { data: invoicesData } = useInvoicesQuery({ pageSize: 300 });
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { data: attendanceTodayData } = useAttendanceQuery({ dateFrom: today, dateTo: today, pageSize: 500 });
  const { data: usersData } = useUsersQuery({ pageSize: 500 });
  const { data: machinesDownData } = useMachinesQuery({ status: 'down', pageSize: 50 });
  const { data: settingsData } = useSettingsQuery();
  const { data: forecastData, isLoading: isForecastLoading } = useSalesForecastQuery(canViewForecast);
  const { data: channelForecastData } = useChannelForecastQuery(canViewForecast);
  const updateSettings = useUpdateSettings();
  const [targetDraft, setTargetDraft] = useState(null);
  const [salesTargetDraft, setSalesTargetDraft] = useState(null);

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

  const pendingApprovalsCount =
    (pendingPRData?.total ?? pendingPRData?.data?.length ?? 0) +
    (pendingMIRData?.total ?? pendingMIRData?.data?.length ?? 0) +
    (pendingApprovalsData?.total ?? pendingApprovalsData?.data?.length ?? 0);
  const wip = useMemo(() => wipTotal(workOrders), [workOrders]);
  const receivables = useMemo(
    () => receivablesByBucket(receivableAging(invoicesData?.data ?? [])),
    [invoicesData],
  );
  const activeUserCount = (usersData?.data ?? []).filter((u) => u.employmentStatus === 'active').length;
  const attendanceTodayCount = useMemo(
    () => new Set((attendanceTodayData?.data ?? []).map((a) => a.employeeId)).size,
    [attendanceTodayData],
  );
  const cpp = useMemo(() => avgCostPerPair(workOrders), [workOrders]);
  const otif = useMemo(() => otifRate(orders), [orders]);
  const dailyOutput = useMemo(() => dailyProductionOutput(workOrders), [workOrders]);
  const dailyTarget = settingsData?.dailyProductionTarget ?? null;
  const monthlySalesTarget = settingsData?.monthlySalesTarget ?? null;
  const lifecycleProducts = useMemo(
    () => lifecycleEligibleProducts(productsData?.data ?? [], orders),
    [productsData, orders],
  );
  const machinesDown = machinesDownData?.data ?? [];
  const targetInputValue = targetDraft ?? (dailyTarget != null ? String(dailyTarget) : '');
  const salesTargetInputValue = salesTargetDraft ?? (monthlySalesTarget != null ? String(monthlySalesTarget) : '');

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

      {machinesDown.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">
            {machinesDown.length} machine{machinesDown.length > 1 ? 's' : ''} down:{' '}
            {machinesDown.map((m) => m.name).join(', ')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        <StatCard label="Work In Progress (units)" value={wip.toLocaleString('en-IN')} icon={Boxes} tone="primary" />
        <StatCard label="Pending Approvals" value={String(pendingApprovalsCount)} icon={ClipboardCheck} tone="warning" />
        <StatCard
          label="Attendance Today"
          value={activeUserCount > 0 ? `${attendanceTodayCount} / ${activeUserCount}` : String(attendanceTodayCount)}
          icon={Users}
          tone="info"
        />
        {cpp > 0 && (
          <StatCard
            label="Avg Cost Per Pair"
            value={`₹${cpp.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            icon={IndianRupee}
            tone="success"
          />
        )}
        {otif != null && <StatCard label="OTIF Rate" value={`${otif}%`} icon={Target} tone="info" />}
        <StatCard label="Daily Production Output" value={dailyOutput.toLocaleString('en-IN')} icon={Factory} tone="primary" />
      </div>

      <BaseCard className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-text">Daily production target</h2>
            <p className="text-xs text-text-muted">
              Today's output: <span className="font-medium text-text">{dailyOutput.toLocaleString('en-IN')}</span>
              {dailyTarget != null && <> of {dailyTarget.toLocaleString('en-IN')}</>}
            </p>
          </div>
          <div className="flex items-end gap-2">
            <AppInput
              label="Target (units/day)"
              type="number"
              value={targetInputValue}
              onChange={(e) => setTargetDraft(e.target.value)}
            />
            <AppButton
              variant="secondary"
              loading={updateSettings.isPending}
              disabled={targetDraft === null || targetDraft === ''}
              onClick={() => {
                updateSettings.mutate(
                  { dailyProductionTarget: Number(targetDraft) },
                  { onSuccess: () => setTargetDraft(null) },
                );
              }}
            >
              Save
            </AppButton>
          </div>
        </div>
        {dailyTarget != null && (
          <div className="mt-3">
            <DashboardBarChart
              height={100}
              data={[
                { name: 'Actual', value: dailyOutput, light: '#2a78d6', dark: '#3987e5' },
                { name: 'Target', value: dailyTarget, light: '#9c9c94', dark: '#7a7a72' },
              ]}
            />
          </div>
        )}
      </BaseCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        {canViewSales && (
          salesSummary?.data ? (
            <>
              <StatCard label="Sales Orders" value={String(salesSummary.data.order_count ?? 0)} icon={ShoppingCart} tone="primary" />
              <StatCard label="Total Sales" value={`₹${(salesSummary.data.total_sales ?? 0).toLocaleString('en-IN')}`} icon={Wallet} tone="success" />
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
              <StatCard label="Inventory On Hand" value={String(inventoryStatus.data.total_on_hand ?? 0)} icon={PackageCheck} tone="info" />
              <StatCard label="Inventory Reserved" value={String(inventoryStatus.data.total_reserved ?? 0)} icon={PackageSearch} tone="warning" />
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
                <StatCard
                  label="Ledger Balance (all-time)"
                  value={`₹${Math.abs(ledgerBalance).toLocaleString('en-IN')} ${ledgerBalance >= 0 ? 'Cr' : 'Dr'}`}
                  icon={Landmark}
                  tone={ledgerBalance >= 0 ? 'success' : 'danger'}
                />
              )}
              {ledgerMonth && (
                <>
                  <StatCard label="Credit This Month" value={`₹${ledgerMonth.credit.toLocaleString('en-IN')}`} icon={ArrowDownToLine} tone="success" />
                  <StatCard label="Debit This Month" value={`₹${ledgerMonth.debit.toLocaleString('en-IN')}`} icon={ArrowUpFromLine} tone="danger" />
                </>
              )}
              {collectionsTotal != null && (
                <StatCard label="Collections (Receivables)" value={`₹${collectionsTotal.toLocaleString('en-IN')}`} icon={HandCoins} tone="info" />
              )}
              {outstandingDebt != null && (
                <StatCard label="Outstanding Debt (Loans)" value={`₹${outstandingDebt.toLocaleString('en-IN')}`} icon={ScrollText} tone="warning" />
              )}
            </>
          ) : (
            <BaseCard className="p-4">
              <p className="text-sm text-text-muted">Ledger data isn't available right now.</p>
            </BaseCard>
          )
        )}

        {noWidgetsVisible && (
          <BaseCard className="p-4 col-span-full">
            <p className="text-sm text-text-muted">No dashboard widgets available for your role.</p>
          </BaseCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {canViewInventory && inventoryStatus?.data && (
          <ChartCard title="Inventory split" tone="success">
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
          </ChartCard>
        )}

        {canViewFinance && ledgerMonth && (
          <ChartCard title="Credit vs debit (this month)" tone="info">
            {/* blue/red, not green/red — validated pair; red/green fails CVD
                separation outright (deutan ΔE 5.0, below the hard floor) */}
            <DashboardBarChart
              height={130}
              data={[
                { name: 'Credit', value: ledgerMonth.credit ?? 0, light: '#2a78d6', dark: '#3987e5' },
                { name: 'Debit', value: ledgerMonth.debit ?? 0, light: '#e34948', dark: '#e66767' },
              ]}
            />
          </ChartCard>
        )}

        {canViewSales && (
          <ChartCard title="Sales trend" tone="primary">
            <SalesTrendChart data={salesTrend} height={130} />
          </ChartCard>
        )}

        {canViewSales && (
          <ChartCard title="Product mix — click a slice" tone="primary">
            <SalesProductPieChart data={salesMix} onSliceClick={setSelectedProduct} height={170} />
          </ChartCard>
        )}

        {canViewSales && canViewInventory && (
          <ChartCard title="Sales vs inventory (units)" tone="info">
            <SalesVsInventoryChart data={soldVsStock} height={170} />
          </ChartCard>
        )}

        {canViewSales && (
          <ChartCard title="Profit / loss per unit" tone="success">
            <MarginChart data={margins} height={170} />
          </ChartCard>
        )}

        {canViewFinance && (
          <ChartCard title="Receivables aging" tone="warning">
            {/* single-hue sequential ramp (amber) — magnitude-by-age-bucket,
                not identity, so a categorical palette would be wrong here */}
            <DashboardBarChart
              height={170}
              data={receivables.map((bucket, i) => ({
                ...bucket,
                light: AMBER_RAMP_LIGHT[i],
                dark: AMBER_RAMP_DARK[i],
              }))}
            />
          </ChartCard>
        )}
      </div>

      {canViewForecast && (
        <BaseCard className="p-4 transition-shadow duration-200 hover:shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-medium text-text">
                <span className="size-1.5 shrink-0 rounded-full bg-info" />
                Sales forecast
              </h2>
              <p className="mt-1 max-w-2xl text-xs text-text-muted">
                Owner/Super Admin only. {forecastData?.disclaimer ?? 'Linear trend projection from recent monthly sales — not a seasonal or ML forecast.'}
              </p>
            </div>
            {forecastData?.basis !== 'actual_data' && (
              <div className="flex items-end gap-2">
                <AppInput
                  label="Monthly sales target (₹)"
                  type="number"
                  value={salesTargetInputValue}
                  onChange={(e) => setSalesTargetDraft(e.target.value)}
                />
                <AppButton
                  variant="secondary"
                  loading={updateSettings.isPending}
                  disabled={salesTargetDraft === null || salesTargetDraft === ''}
                  onClick={() => {
                    updateSettings.mutate(
                      { monthlySalesTarget: Number(salesTargetDraft) },
                      {
                        onSuccess: () => {
                          setSalesTargetDraft(null);
                          queryClient.invalidateQueries({ queryKey: ['forecast'] });
                        },
                      },
                    );
                  }}
                >
                  Save
                </AppButton>
              </div>
            )}
          </div>

          {isForecastLoading ? (
            <p className="py-10 text-center text-sm text-text-muted">Loading forecast…</p>
          ) : (
            <SalesForecastChart history={forecastData?.history} forecast={forecastData?.forecast} height={220} />
          )}

          {channelForecastData?.channels?.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <h3 className="mb-1 text-xs font-medium uppercase text-text-muted">
                Channel mix {channelForecastData.basis === 'actual_data' ? '(DS Footwear actuals)' : '(market assumption)'}
              </h3>
              <div className="flex flex-wrap gap-4">
                {channelForecastData.channels.map((c) => (
                  <div key={c.channelId} className="text-sm">
                    <span className="font-medium text-text">{c.channelName}</span>{' '}
                    <span className="text-text-muted">{c.sharePercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </BaseCard>
      )}

      {canViewSales && (
        <ChartCard
          title="Break-even analysis"
          tone="warning"
          subtitle="Fixed cost (salary + machine + overhead) vs. Total Cost vs. Revenue, by quantity — where Total Cost and Revenue cross is the no-loss-no-profit point for the selected SKU."
        >
          <BreakEvenChart variants={breakEvenVariants} workOrders={workOrders} variantsById={variantsById} height={220} />
        </ChartCard>
      )}

      {canViewSales && (
        <ChartCard
          title="Product life cycle"
          tone="primary"
          subtitle="Monthly units sold, staged into Introduction / Growth / Maturity / Decline — inferred from the product's own sales trend relative to its peak month."
        >
          <ProductLifecycleChart products={lifecycleProducts} orders={orders} height={220} />
        </ChartCard>
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
