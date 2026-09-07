import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

// Diverging by definition (dataviz skill: "Above/below a baseline → diverging
// bar") — blue↔red poles (the skill's own default diverging pair; blue↔aqua
// was rejected there because both read as "cool" and lose the "opposite"
// signal, and red↔green fails CVD separation outright), neutral gray for the
// break-even band around zero.
const PROFIT = { light: '#2a78d6', dark: '#3987e5' };
const LOSS = { light: '#e34948', dark: '#e66767' };
const BREAK_EVEN = { light: '#9c9c94', dark: '#7a7a72' };

function formatMoney(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const label = point.margin > 0 ? 'Profit' : point.margin < 0 ? 'Loss' : 'No loss, no profit';
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{point.name}</p>
      <p className="text-text-muted">
        Cost {formatMoney(point.unitCost)} · Selling {formatMoney(point.sellingPrice)}
      </p>
      <p className="text-text-muted">
        {label}: <span className="text-text">{formatMoney(Math.abs(point.margin))}</span> / unit
      </p>
    </div>
  );
}

// Margin per SKU/variant = selling price - production unit cost, plotted
// against a zero reference line — a ~2% band around zero reads as "no loss,
// no profit" (break-even) rather than forcing every near-zero rounding
// difference into a false profit/loss color.
export function MarginChart({ data, height = 170 }) {
  const theme = useThemeStore((s) => s.theme);

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No production cost + selling price data to compare yet.</p>;
  }

  const colored = data.map((entry) => {
    const breakEvenBand = Math.abs(entry.unitCost) * 0.02;
    const status = entry.margin > breakEvenBand ? 'profit' : entry.margin < -breakEvenBand ? 'loss' : 'breakEven';
    const palette = status === 'profit' ? PROFIT : status === 'loss' ? LOSS : BREAK_EVEN;
    return { ...entry, status, color: theme === 'dark' ? palette.dark : palette.light };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={colored} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis tickFormatter={formatMoney} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={64} />
        <ReferenceLine y={0} stroke="var(--color-border)" />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
        <Line
          type="monotone"
          dataKey="margin"
          stroke={theme === 'dark' ? PROFIT.dark : PROFIT.light}
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload, index } = props;
            return <circle key={`dot-${payload.name}-${index}`} cx={cx} cy={cy} r={4} fill={payload.color} stroke="var(--color-surface)" strokeWidth={2} />;
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
