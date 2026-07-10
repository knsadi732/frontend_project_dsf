import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartCard } from '@/components/ui/ChartCard';

export function ChartWidget({ data }) {
  return (
    <ChartCard title="Sales trend (6 months)">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--app-primary)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--app-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
        <XAxis dataKey="month" stroke="var(--app-text-muted)" fontSize={12} />
        <YAxis stroke="var(--app-text-muted)" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="var(--app-primary)"
          fill="url(#salesFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartCard>
  );
}
