import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

function formatValue(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{point.name}</p>
      <p className="text-text-muted">{formatValue(point.value)}</p>
    </div>
  );
}

// Small category-comparison charts (2-4 points) rendered as a line for a
// consistent look across the Charts section — each point still names its own
// category on the x-axis, dot-labeled with its value since there's no bar
// height to read the value off of.
export function DashboardLineChart({ data, height = 130 }) {
  const theme = useThemeStore((s) => s.theme);
  const color = theme === 'dark' ? '#3987e5' : '#2a78d6';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 24, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={44} tickFormatter={formatValue} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
          activeDot={{ r: 5 }}
          label={{ position: 'top', fill: 'var(--color-text)', fontSize: 12, formatter: formatValue }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
