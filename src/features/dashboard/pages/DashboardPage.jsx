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
  HandCoins,
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
import { useSalesTargetsQuery } from '@/features/dashboard/queries/useSalesTargetsQuery';
import { useUpsertSalesTarget } from '@/features/dashboard/mutations/useUpsertSalesTarget';
import { ExecutiveOverview } from '@/features/dashboard/components/ExecutiveOverview';
import { PeriodSelectorBar } from '@/features/compliance/components/PeriodSelectorBar';
import { KpiComparisonTable } from '@/features/dashboard/components/KpiComparisonTable';
import { usePnlReportQuery } from '@/features/compliance/queries/usePnlReportQuery';
import { usePeriodSelector } from '@/features/compliance/utils/usePeriodSelector';
import { previousPeriodRange, currentPeriodLabel, previousPeriodLabel } from '@/features/compliance/utils/reportPeriod';
import { ChartCard } from '@/features/dashboard/components/ChartCard';
import { DashboardLineChart } from '@/features/dashboard/components/DashboardLineChart';
import { SalesTrendChart } from '@/features/dashboard/components/SalesTrendChart';
import { SalesProductPieChart } from '@/features/dashboard/components/SalesProductPieChart';
import { SalesVsInventoryChart } from '@/features/dashboard/components/SalesVsInventoryChart';
import { InventorySplitPieChart } from '@/features/dashboard/components/InventorySplitPieChart';
import { SalesTargetChart } from '@/features/dashboard/components/SalesTargetChart';
import { MarginChart } from '@/features/dashboard/components/MarginChart';
import { BreakEvenChart } from '@/features/dashboard/components/BreakEvenChart';
import { ProductLifecycleChart } from '@/features/dashboard/components/ProductLifecycleChart';
import { ProductSalesTrendModal } from '@/features/dashboard/components/ProductSalesTrendModal';
import { SalesForecastChart } from '@/features/dashboard/components/SalesForecastChart';
import { salesTrendByDate, productMix, salesVsInventory, salesTotalsInRange, salesUnitsInRange, salesTargetProgress } from '@/features/dashboard/utils/salesChartData';
import { marginByVariant, breakEvenEligibleVariants } from '@/features/production/utils/unitCost';
import {
  wipTotal,
  receivablesByBucket,
  avgCostPerPair,
  otifRate,
  productionOutputInRange,
  inventoryByVariant,
  lifecycleEligibleProducts,
} from '@/features/dashboard/utils/ownerOverview';
import { receivableAging } from '@/features/reports/utils/reportAggregations';
import { BaseCard } from '@/components/ui/BaseCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
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

  // Same YTD/Quarterly/Monthly/Custom picker as Compliance → Reports (see
  // usePeriodSelector) — "Sales"/"Production"/"Revenue" below are scoped to
  // this, each paired against the equivalent prior period (last month for
  // Monthly, last quarter for Quarterly, last FY for YTD).
  const periodSelector = usePeriodSelector({ defaultType: 'monthly', monthMode: 'fy-anchored' });
  const previousRange = useMemo(
    () => previousPeriodRange(periodSelector),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [periodSelector.periodType, periodSelector.monthValue, periodSelector.fyStartYear, periodSelector.quarter, periodSelector.range.from, periodSelector.range.to],
  );
  const { data: pnlCurrent } = usePnlReportQuery(periodSelector.range);
  const { data: pnlPrevious } = usePnlReportQuery(previousRange);

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
  const { data: salesTargetsData } = useSalesTargetsQuery();
  const { data: forecastData, isLoading: isForecastLoading } = useSalesForecastQuery(canViewForecast);
  const { data: channelForecastData } = useChannelForecastQuery(canViewForecast);
  const updateSettings = useUpdateSettings();
  const upsertSalesTarget = useUpsertSalesTarget();
  const [salesTargetDraft, setSalesTargetDraft] = useState(null);
  const [forecastTargetDraft, setForecastTargetDraft] = useState(null);
  const [salesUnitsTargetDraft, setSalesUnitsTargetDraft] = useState(null);

  const orders = useMemo(() => salesOrdersData?.data ?? [], [salesOrdersData]);
  const salesTrend = useMemo(() => salesTrendByDate(orders), [orders]);
  const salesMix = useMemo(() => productMix(orders), [orders]);
  const productsById = useMemo(() => new Map((productsData?.data ?? []).map((p) => [p.id, p])), [productsData]);
  const variantsById = useMemo(() => new Map((variantsData?.data ?? []).map((v) => [v.id, v])), [variantsData]);
  const soldVsStock = useMemo(
    () => salesVsInventory(orders, stockData?.data ?? [], variantsById, productsById),
    [orders, stockData, variantsById, productsById],
  );
  const inventoryVariants = useMemo(() => inventoryByVariant(stockData?.data ?? []), [stockData]);
  const margins = useMemo(
    () => marginByVariant(workOrdersData?.data ?? [], variantsById),
    [workOrdersData, variantsById],
  );
  const workOrders = useMemo(() => workOrdersData?.data ?? [], [workOrdersData]);
  const breakEvenVariants = useMemo(
    () => breakEvenEligibleVariants(workOrders, variantsById),
    [workOrders, variantsById],
  );

  const salesCurrent = useMemo(
    () => salesTotalsInRange(orders, periodSelector.range.from, periodSelector.range.to),
    [orders, periodSelector.range.from, periodSelector.range.to],
  );
  const salesPrevious = useMemo(
    () => salesTotalsInRange(orders, previousRange.from, previousRange.to),
    [orders, previousRange.from, previousRange.to],
  );
  const productionCurrent = useMemo(
    () => productionOutputInRange(workOrders, periodSelector.range.from, periodSelector.range.to),
    [workOrders, periodSelector.range.from, periodSelector.range.to],
  );
  const productionPrevious = useMemo(
    () => productionOutputInRange(workOrders, previousRange.from, previousRange.to),
    [workOrders, previousRange.from, previousRange.to],
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
  // The Sales forecast card's own ₹ baseline (company_settings.monthly_sales_target,
  // a forecasting bootstrap) — distinct from the Sales target card's per-month
  // revenue target in sales_targets, so the two keep separate drafts.
  const forecastBaselineTarget = settingsData?.monthlySalesTarget ?? null;
  const forecastTargetInputValue =
    forecastTargetDraft ?? (forecastBaselineTarget != null ? String(forecastBaselineTarget) : '');
  const lifecycleProducts = useMemo(
    () => lifecycleEligibleProducts(productsData?.data ?? [], orders),
    [productsData, orders],
  );
  const machinesDown = machinesDownData?.data ?? [];

  // Calendar month the "Sales target" widget tracks — always the current
  // month (e.g. September), not the Overview period selector above it.
  // Built from local y/m/d components directly, never via toISOString() on a
  // local Date — that converts to UTC first, and in a positive-offset zone
  // (e.g. IST) midnight-local-on-the-1st lands on the previous UTC day,
  // shifting `from` into the prior month and, downstream in
  // salesTargetProgress()'s from.slice(0,7) reconstruction, the whole chart.
  const currentMonth = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const y = now.getFullYear();
    const m = now.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const from = `${y}-${pad(m + 1)}-01`;
    const to = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
    return { from, to, label: now.toLocaleString('en-US', { month: 'long' }) };
  }, []);
  const salesUnitsThisMonth = useMemo(
    () => salesUnitsInRange(orders, currentMonth.from, currentMonth.to),
    [orders, currentMonth],
  );
  // Targets are per-month rows (the FY26-27 plan ramps 150 pairs in Sep to
  // 1200 in Mar), so the widget reads this month's row rather than one
  // company-wide figure.
  const currentMonthTarget = useMemo(
    () => (salesTargetsData ?? []).find((target) => target.targetMonth === currentMonth.from) ?? null,
    [salesTargetsData, currentMonth],
  );
  const salesUnitsTarget = currentMonthTarget?.unitsTarget ?? null;
  const salesRevenueTarget = currentMonthTarget?.revenueTarget ?? null;
  const salesUnitsTargetInputValue = salesUnitsTargetDraft ?? (salesUnitsTarget != null ? String(salesUnitsTarget) : '');
  const salesTargetInputValue = salesTargetDraft ?? (salesRevenueTarget != null ? String(salesRevenueTarget) : '');
  const salesRevenueThisMonth = useMemo(
    () => salesTotalsInRange(orders, currentMonth.from, currentMonth.to).total,
    [orders, currentMonth],
  );
  const salesTargetProgressRows = useMemo(
    () => salesTargetProgress(orders, currentMonth.from, currentMonth.to, salesUnitsTarget, salesRevenueTarget),
    [orders, currentMonth, salesUnitsTarget, salesRevenueTarget],
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

  const { inventoryStatus, ledgerBalance, ledgerMonth, collectionsTotal, outstandingDebt, payablesDue } = data;
  const hasFinanceData = ledgerBalance != null || ledgerMonth || collectionsTotal != null || outstandingDebt != null;
  const noWidgetsVisible = !canViewSales && !canViewInventory && !(canViewFinance && hasFinanceData);
  const payableTotal = (outstandingDebt ?? 0) + (payablesDue ?? 0);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Deliberately flat and quiet: the previous banner cut two bright
          diagonal blades with near-white 55%-opacity bevel slivers across a
          near-black panel — that local contrast is the single harshest thing
          on the page to look at all day. One soft muted gradient instead. */}
      <div className="relative isolate flex shrink-0 flex-wrap items-center justify-between gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#243447] to-[#2f4b6b] px-5 py-3.5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white/95">Dashboard</h1>
          <p className="text-xs text-white/60">Overview of today's operations — DS Footwear.</p>
        </div>

        {(canViewSales || canViewInventory || canViewFinance) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-white/70">Overview</span>
            <PeriodSelectorBar state={periodSelector} showRangeLabel={false} />
          </div>
        )}

        {canRegenerate && (
          <AppButton
            variant="secondary"
            loading={regenerate.isPending}
            onClick={() => regenerate.mutate()}
            className="border-white/20 bg-white/10 text-white/90 hover:bg-white/15"
          >
            <RefreshCw className="size-4" />
            Regenerate snapshot
          </AppButton>
        )}
      </div>

      {machinesDown.length > 0 && (
        <div className="flex shrink-0 items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">
            {machinesDown.length} machine{machinesDown.length > 1 ? 's' : ''} down:{' '}
            {machinesDown.map((m) => m.name).join(', ')}
          </p>
        </div>
      )}

      {/* 12-col-style split (lg+): sidebar is the app's own left nav (outside
          this page); here it's 6/10 middle (Details) : 4/10 right (Charts),
          each an independently-scrollable pane. Below lg, both stack full-width
          and just flow normally with the page. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-10">
      <div className="flex flex-col gap-3 lg:col-span-6 lg:h-full lg:overflow-y-auto lg:pr-1">
        <ExecutiveOverview
          hideHeader
          periodSelector={periodSelector}
          canViewSales={canViewSales}
          canViewInventory={canViewInventory}
          canViewFinance={canViewFinance}
          salesInPeriod={salesCurrent.total}
          ordersInPeriod={salesCurrent.count}
          productionInPeriod={productionCurrent}
          revenueInPeriod={pnlCurrent?.totalSales}
          cashBalance={ledgerBalance}
          inventoryOnHand={inventoryStatus?.data?.total_on_hand}
          payableTotal={payableTotal}
          opsStats={[
            { label: 'Work In Progress', value: wip.toLocaleString('en-IN'), icon: Boxes, tone: 'navy' },
            { label: 'Pending Approvals', value: String(pendingApprovalsCount), icon: ClipboardCheck, tone: 'sky' },
            {
              label: 'Attendance Today',
              value: activeUserCount > 0 ? `${attendanceTodayCount} / ${activeUserCount}` : String(attendanceTodayCount),
              icon: Users,
              tone: 'steel',
            },
            ...(cpp > 0
              ? [{ label: 'Avg Cost / Pair', value: `₹${cpp.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, icon: IndianRupee, tone: 'blue' }]
              : []),
            ...(otif != null ? [{ label: 'OTIF Rate', value: `${otif}%`, icon: Target, tone: 'steel' }] : []),
            ...(canViewFinance && collectionsTotal != null
              ? [{ label: 'Collections', value: `₹${collectionsTotal.toLocaleString('en-IN')}`, icon: HandCoins, tone: 'steel' }]
              : []),
          ]}
        />

        {(canViewSales || canViewFinance) && (
          <KpiComparisonTable
            currentLabel={currentPeriodLabel(periodSelector.periodType)}
            previousLabel={previousPeriodLabel(periodSelector.periodType)}
            rows={[
              ...(canViewSales ? [{ label: 'Sales', unit: 'currency', current: salesCurrent.total, previous: salesPrevious.total }] : []),
              { label: 'Production', unit: 'units', current: productionCurrent, previous: productionPrevious },
              ...(canViewFinance
                ? [{ label: 'Revenue', unit: 'currency', current: pnlCurrent?.totalSales ?? 0, previous: pnlPrevious?.totalSales ?? 0 }]
                : []),
            ]}
          />
        )}

        {noWidgetsVisible && (
          <BaseCard className="p-4">
            <p className="text-sm text-text-muted">No dashboard widgets available for your role.</p>
          </BaseCard>
        )}
      </div>

      {/* Right rail: Charts only, its own independently-scrollable pane. */}
      <div className="flex min-h-[260px] flex-col gap-3 lg:col-span-4 lg:h-full lg:overflow-y-auto lg:pr-1">
      <h2 className="shrink-0 text-sm font-semibold text-text">Charts</h2>

      <BaseCard className="group relative shrink-0 overflow-hidden p-4 transition-shadow duration-200 hover:shadow-md">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2a78d6] via-[#5b8fc7] to-[#9ca3af]"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium text-text">Sales target ({currentMonth.label})</h2>
            <p className="text-xs text-text-muted">
              Actual sales: <span className="font-medium text-text">{salesUnitsThisMonth.toLocaleString('en-IN')}</span>
              {salesUnitsTarget != null && <> of {salesUnitsTarget.toLocaleString('en-IN')}</>} pairs ·{' '}
              <span className="font-medium text-text">₹{Math.round(salesRevenueThisMonth).toLocaleString('en-IN')}</span>
              {salesRevenueTarget != null && <> of ₹{salesRevenueTarget.toLocaleString('en-IN')}</>}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <AppInput
              label="Target (pairs/month)"
              type="number"
              value={salesUnitsTargetInputValue}
              onChange={(e) => setSalesUnitsTargetDraft(e.target.value)}
            />
            <AppInput
              label="Target (₹/month)"
              type="number"
              value={salesTargetInputValue}
              onChange={(e) => setSalesTargetDraft(e.target.value)}
            />
            <AppButton
              variant="secondary"
              loading={upsertSalesTarget.isPending}
              disabled={
                (salesUnitsTargetDraft === null || salesUnitsTargetDraft === '') &&
                (salesTargetDraft === null || salesTargetDraft === '')
              }
              onClick={() => {
                const payload = { targetMonth: currentMonth.from };
                if (salesUnitsTargetDraft !== null && salesUnitsTargetDraft !== '') {
                  payload.unitsTarget = Number(salesUnitsTargetDraft);
                }
                if (salesTargetDraft !== null && salesTargetDraft !== '') {
                  payload.revenueTarget = Number(salesTargetDraft);
                }
                upsertSalesTarget.mutate(payload, {
                  onSuccess: () => {
                    setSalesUnitsTargetDraft(null);
                    setSalesTargetDraft(null);
                  },
                });
              }}
            >
              Save
            </AppButton>
          </div>
        </div>
        <div className="mt-3">
          <SalesTargetChart data={salesTargetProgressRows} height={190} />
        </div>
      </BaseCard>

      {/* Charts, last on the page — each one full-width, stacked one below
          another (not side-by-side), so every chart gets its full width to
          read clearly. */}
      <div className="flex flex-col gap-3">
        {canViewInventory && (
          <ChartCard title="Inventory split — by variant" tone="blue">
            <InventorySplitPieChart height={150} variants={inventoryVariants} />
          </ChartCard>
        )}

        {canViewSales && (
          <ChartCard title="Sales trend" tone="navy">
            <SalesTrendChart data={salesTrend} height={130} />
          </ChartCard>
        )}

        {canViewSales && (
          <ChartCard title="Product mix — click a point" tone="navy">
            <SalesProductPieChart data={salesMix} onSliceClick={setSelectedProduct} height={170} />
          </ChartCard>
        )}

        {canViewSales && canViewInventory && (
          <ChartCard title="Sales vs inventory (units)" tone="steel">
            <SalesVsInventoryChart data={soldVsStock} height={170} />
          </ChartCard>
        )}

        {canViewSales && (
          <ChartCard title="Profit / loss per unit" tone="blue">
            <MarginChart data={margins} height={170} />
          </ChartCard>
        )}

        {canViewFinance && (
          <ChartCard title="Receivables aging" tone="sky">
            <DashboardLineChart height={170} data={receivables} />
          </ChartCard>
        )}
      </div>

      {canViewForecast && (
        <BaseCard className="group relative overflow-hidden p-4 transition-shadow duration-200 hover:shadow-md">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2a78d6] via-[#5b8fc7] to-[#9ca3af]"
            aria-hidden="true"
          />
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
                  value={forecastTargetInputValue}
                  onChange={(e) => setForecastTargetDraft(e.target.value)}
                />
                <AppButton
                  variant="secondary"
                  loading={updateSettings.isPending}
                  disabled={forecastTargetDraft === null || forecastTargetDraft === ''}
                  onClick={() => {
                    updateSettings.mutate(
                      { monthlySalesTarget: Number(forecastTargetDraft) },
                      {
                        onSuccess: () => {
                          setForecastTargetDraft(null);
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
          tone="sky"
          subtitle="Fixed cost (salary + machine + overhead) vs. Total Cost vs. Revenue, by quantity — where Total Cost and Revenue cross is the no-loss-no-profit point for the selected SKU."
        >
          <BreakEvenChart variants={breakEvenVariants} workOrders={workOrders} variantsById={variantsById} height={220} />
        </ChartCard>
      )}

      {canViewSales && (
        <ChartCard
          title="Product life cycle"
          tone="navy"
          subtitle="Monthly units sold, staged into Introduction / Growth / Maturity / Decline — inferred from the product's own sales trend relative to its peak month."
        >
          <ProductLifecycleChart products={lifecycleProducts} orders={orders} height={220} />
        </ChartCard>
      )}
      </div>
      </div>

      <ProductSalesTrendModal
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        orders={orders}
        productName={selectedProduct}
      />
    </div>
  );
}
