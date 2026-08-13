import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

const BLUE = { light: '#2a78d6', dark: '#3987e5' };

function formatValue(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{formatDate(label)}</p>
      <p className="text-text-muted">{formatValue(payload[0].value)}</p>
    </div>
  );
}

// Trend over time, single series → sequential blue, no legend (the card
// title already says what's plotted). Area wash at ~10% opacity per the
// dataviz skill's mark spec, 2px line, no per-point dots except the last.
export function SalesTrendChart({ data, height = 130 }) {
  const theme = useThemeStore((s) => s.theme);
  const color = theme === 'dark' ? BLUE.dark : BLUE.light;

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No sales orders in range.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.1} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={56} tickFormatter={formatValue} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
        <Area
          type="monotone"
          dataKey="total"
          stroke={color}
          strokeWidth={2}
          fill="url(#salesTrendFill)"
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
