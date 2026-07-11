import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ChartCard } from '@/components/ui/ChartCard';

export function PeriodComparisonChartWidget({ periodComparison }) {
  const subtitleParts = [];
  if (periodComparison.pctVsLastMonth != null) {
    subtitleParts.push(`${periodComparison.pctVsLastMonth >= 0 ? '+' : ''}${periodComparison.pctVsLastMonth}% vs last month`);
  }
  if (periodComparison.pctVsLastYear != null) {
    subtitleParts.push(`${periodComparison.pctVsLastYear >= 0 ? '+' : ''}${periodComparison.pctVsLastYear}% vs last year`);
  }

  return (
    <ChartCard title={`Period comparison${subtitleParts.length ? ' — ' + subtitleParts.join(', ') : ''}`}>
      <BarChart data={periodComparison.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
        <XAxis dataKey="label" stroke="var(--app-text-muted)" fontSize={11} />
        <YAxis stroke="var(--app-text-muted)" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
          <Cell fill="var(--app-text-muted)" fillOpacity={0.5} />
          <Cell fill="var(--app-info)" />
          <Cell fill="var(--app-primary)" />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}
