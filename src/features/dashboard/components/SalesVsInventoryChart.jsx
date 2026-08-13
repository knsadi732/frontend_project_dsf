import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

// Two real series across shared product categories → categorical, legend
// required (dataviz skill: "legend always present for two or more series").
// Validated pair (validate_palette.js, both modes) — distinct from the
// pie's palette so the two charts never visually blend together.
const SOLD = { light: '#2a78d6', dark: '#3987e5' };
const STOCK = { light: '#eb6834', dark: '#d95926' };

function formatQty(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-text">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-text-muted">
          {entry.name}: <span className="text-text">{formatQty(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

// Units sold vs current on-hand stock, per top product — a fast-mover with
// low stock (tall blue, short orange) or a slow-mover with excess (short
// blue, tall orange) both read at a glance.
export function SalesVsInventoryChart({ data, height = 170 }) {
  const theme = useThemeStore((s) => s.theme);
  const soldColor = theme === 'dark' ? SOLD.dark : SOLD.light;
  const stockColor = theme === 'dark' ? STOCK.dark : STOCK.light;

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No sales orders in range.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barCategoryGap="25%" barGap={2}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={44} tickFormatter={formatQty} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-hover)' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
        <Bar dataKey="sold" name="Units Sold" fill={soldColor} maxBarSize={20} radius={[4, 4, 0, 0]} />
        <Bar dataKey="stock" name="Current Stock" fill={stockColor} maxBarSize={20} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
