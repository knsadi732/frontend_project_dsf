import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

// Diverging by definition (dataviz skill: "Above/below a baseline → diverging
// bar") — blue↔red poles (the skill's own default diverging pair; blue↔aqua
// was rejected there because both read as "cool" and lose the "opposite"
// signal, and red↔green fails CVD separation outright), neutral gray for the
// break-even band around zero. Same blue/red hexes as the Credit/Debit chart
// for consistency, already validated in both modes.
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

// Margin per SKU/variant = selling price - production unit cost. A ~2% band
// around zero reads as "no loss, no profit" (break-even) rather than forcing
// every near-zero rounding difference into a false profit/loss color.
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
      <BarChart data={colored} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }} barCategoryGap="30%">
        <XAxis type="number" tickFormatter={formatMoney} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={110} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
        <ReferenceLine x={0} stroke="var(--color-border)" />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-hover)' }} />
        <Bar dataKey="margin" maxBarSize={16} radius={[4, 4, 4, 4]}>
          {colored.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
