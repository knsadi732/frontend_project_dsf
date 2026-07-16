import { useDashboardQuery } from '@/features/dashboard/queries/useDashboardQuery';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ChartWidget } from '@/features/dashboard/components/ChartWidget';
import { ForecastChartWidget } from '@/features/dashboard/components/ForecastChartWidget';
import { BreakEvenChartWidget } from '@/features/dashboard/components/BreakEvenChartWidget';
import { PeriodComparisonChartWidget } from '@/features/dashboard/components/PeriodComparisonChartWidget';
import { ReturnRateChartWidget } from '@/features/dashboard/components/ReturnRateChartWidget';
import { RecentActivityList } from '@/features/dashboard/components/RecentActivityList';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { useAuth } from '@/hooks/useAuth';
import { MODULES, ACTIONS } from '@/constants/roles';

// Read-only by design: every widget below is computed from live data
// (see dashboard.api.js) — there is no edit affordance anywhere on this
// page, for any role. Stats/charts are also gated by module permission so a
// role without Sales/Products access (e.g. Accountant) only sees its own
// department's numbers here, same as the rest of the app.
export function DashboardPage() {
  const { data, isLoading } = useDashboardQuery();
  const { can } = useAuth();

  if (isLoading) return <BaseLoader label="Loading dashboard…" />;

  const canViewSales = can(MODULES.SALES, ACTIONS.VIEW);
  const canViewReturns = can(MODULES.RETURNS, ACTIONS.VIEW);
  const visibleStats = data.stats.filter((stat) => can(stat.module, ACTIONS.VIEW));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">Overview of today's operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleStats.map(({ key, ...stat }) => (
          <StatCard key={key} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {canViewSales && (
          <div className="xl:col-span-2">
            <ChartWidget data={data.salesTrend} />
          </div>
        )}
        <div className={canViewSales ? '' : 'xl:col-span-3'}>
          <RecentActivityList items={data.recentActivity} />
        </div>
      </div>

      {(canViewSales || canViewReturns) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {canViewSales && <ForecastChartWidget forecast={data.forecast} />}
          {canViewSales && <BreakEvenChartWidget breakEven={data.breakEven} />}
          {canViewSales && <PeriodComparisonChartWidget periodComparison={data.periodComparison} />}
          {canViewReturns && <ReturnRateChartWidget returnRate={data.returnRate} />}
        </div>
      )}
    </div>
  );
}
