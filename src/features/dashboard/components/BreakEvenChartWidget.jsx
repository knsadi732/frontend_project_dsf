import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ChartCard } from '@/components/ui/ChartCard';

export function BreakEvenChartWidget({ breakEven }) {
  return (
    <ChartCard title={`Break-even analysis (₹${breakEven.fixedCost.toLocaleString('en-IN')} fixed cost/mo)`}>
      <BarChart data={breakEven.data}>
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
        <Bar dataKey="units" radius={[4, 4, 0, 0]}>
          <Cell fill="var(--app-warning)" />
          <Cell fill="var(--app-success)" />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}
