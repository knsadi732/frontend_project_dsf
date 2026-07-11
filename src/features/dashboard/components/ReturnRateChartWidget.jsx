import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartCard } from '@/components/ui/ChartCard';

const COLORS = ['var(--app-warning)', 'var(--app-info)'];

export function ReturnRateChartWidget({ returnRate }) {
  return (
    <ChartCard title={`Return rate (${returnRate.totalReturns} total returns)`}>
      <PieChart>
        <Pie data={returnRate.data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {returnRate.data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, item) => [`${value} (${item.payload.pct}%)`, name]}
          contentStyle={{
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ChartCard>
  );
}
