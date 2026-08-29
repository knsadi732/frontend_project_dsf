import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

const BLUE = { light: '#2a78d6', dark: '#3987e5' };
const AMBER = { light: '#d97706', dark: '#f59e0b' };

function formatValue(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{label}</p>
      {payload.map((entry) => (
        entry.value != null && (
          <p key={entry.dataKey} className="text-text-muted">
            {entry.name}: {formatValue(entry.value)}
          </p>
        )
      ))}
    </div>
  );
}

// Owner/Super Admin only widget (see DashboardPage gating) — actual monthly
// sales as a solid line, the linear-trend projection as a dashed line in a
// distinct color, joined at the last actual month so the projection visibly
// continues from where real data ends rather than floating separately.
export function SalesForecastChart({ history, forecast, height = 170 }) {
  const theme = useThemeStore((s) => s.theme);
  const actualColor = theme === 'dark' ? BLUE.dark : BLUE.light;
  const projectedColor = theme === 'dark' ? AMBER.dark : AMBER.light;

  if (!history?.length) {
    return <p className="py-10 text-center text-sm text-text-muted">Not enough sales history to project a forecast yet.</p>;
  }

  const lastActual = history[history.length - 1];
  const data = [
    ...history.map((h) => ({ month: h.month, actual: h.totalSales, projected: null })),
    { month: lastActual.month, actual: lastActual.totalSales, projected: lastActual.totalSales },
    ...(forecast ?? []).map((f) => ({ month: f.month, actual: null, projected: f.projectedSales })),
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={56} tickFormatter={formatValue} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
        <Line type="monotone" dataKey="actual" name="Actual" stroke={actualColor} strokeWidth={2} dot={{ r: 3, fill: actualColor }} connectNulls={false} />
        <Line type="monotone" dataKey="projected" name="Projected" stroke={projectedColor} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: projectedColor }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
