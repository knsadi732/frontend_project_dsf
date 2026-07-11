import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ChartCard } from '@/components/ui/ChartCard';

export function ForecastChartWidget({ forecast }) {
  return (
    <ChartCard title={`Future prediction (${forecast.growthRate >= 0 ? '+' : ''}${forecast.growthRate}% avg growth)`}>
      <BarChart data={forecast.data}>
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
        <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
          {forecast.data.map((entry) => (
            <Cell key={entry.month} fill="var(--app-primary)" fillOpacity={entry.projected ? 0.45 : 1} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}
