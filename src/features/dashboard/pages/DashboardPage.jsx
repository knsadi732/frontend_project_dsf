import { useDashboardQuery } from '@/features/dashboard/queries/useDashboardQuery';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ChartWidget } from '@/features/dashboard/components/ChartWidget';
import { ForecastChartWidget } from '@/features/dashboard/components/ForecastChartWidget';
import { BreakEvenChartWidget } from '@/features/dashboard/components/BreakEvenChartWidget';
import { PeriodComparisonChartWidget } from '@/features/dashboard/components/PeriodComparisonChartWidget';
import { ReturnRateChartWidget } from '@/features/dashboard/components/ReturnRateChartWidget';
import { RecentActivityList } from '@/features/dashboard/components/RecentActivityList';
import { BaseLoader } from '@/components/ui/BaseLoader';

// Read-only by design: every widget below is computed from live data
// (see dashboard.api.js) — there is no edit affordance anywhere on this
// page, for any role.
export function DashboardPage() {
  const { data, isLoading } = useDashboardQuery();

  if (isLoading) return <BaseLoader label="Loading dashboard…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">Overview of today's operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map(({ key, ...stat }) => (
          <StatCard key={key} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartWidget data={data.salesTrend} />
        </div>
        <RecentActivityList items={data.recentActivity} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ForecastChartWidget forecast={data.forecast} />
        <BreakEvenChartWidget breakEven={data.breakEven} />
        <PeriodComparisonChartWidget periodComparison={data.periodComparison} />
        <ReturnRateChartWidget returnRate={data.returnRate} />
      </div>
    </div>
  );
}
