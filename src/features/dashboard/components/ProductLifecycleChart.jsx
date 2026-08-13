import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { AppSelect } from '@/components/ui/AppSelect';
import { productMonthlySales, classifyLifecycleStages } from '@/features/dashboard/utils/ownerOverview';

// Validated categorical set (first 3 slots reused from the sales pie chart's
// palette, "Decline" gets the same neutral gray already used for "Other"
// elsewhere) — not a new pair invented for this widget.
const STAGES = [
  { key: 'introduction', label: 'Introduction', light: '#2a78d6', dark: '#3987e5' },
  { key: 'growth', label: 'Growth', light: '#eb6834', dark: '#d95926' },
  { key: 'maturity', label: 'Maturity', light: '#1baf7a', dark: '#199e70' },
  { key: 'decline', label: 'Decline', light: '#9c9c94', dark: '#7a7a72' },
];

function formatQty(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function formatMonth(month) {
  if (!month) return '';
  const [y, m] = month.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload.find((p) => p.value != null) ?? payload[0];
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{formatMonth(label)}</p>
      <p className="text-text-muted">
        {formatQty(point.value)} units — <span className="text-text">{STAGES.find((s) => s.key === point.dataKey)?.label}</span>
      </p>
    </div>
  );
}

// Builds one row per month carrying all 4 stage keys, each populated only
// for points in that stage plus the single boundary point where the curve
// transitions (so each stage's <Line> connects into the next one instead of
// leaving a visible gap) — a standard trick for stage-colored single curves
// in Recharts, which has no native per-segment line coloring.
function toChartRows(classified) {
  return classified.map((point, i) => {
    const row = { month: point.month };
    STAGES.forEach((s) => {
      row[s.key] = null;
    });
    row[point.stage] = point.quantity;
    const prevStage = classified[i - 1]?.stage;
    if (prevStage && prevStage !== point.stage) row[prevStage] = point.quantity;
    return row;
  });
}

// The classic Introduction/Growth/Maturity/Decline sales curve, per product
// — not a snapshot bucket count. Stage boundaries are inferred from the
// product's own monthly sales trend (see classifyLifecycleStages), since no
// backend field marks a product's lifecycle stage explicitly.
export function ProductLifecycleChart({ products, orders, height = 220 }) {
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const theme = useThemeStore((s) => s.theme);

  if (!products.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No product has enough sales history for a lifecycle curve yet.</p>;
  }

  const selected = products.find((p) => p.id === productId) ?? products[0];
  const monthly = productMonthlySales(orders, selected.name);
  const classified = classifyLifecycleStages(monthly);
  const rows = toChartRows(classified);
  const currentStage = classified[classified.length - 1]?.stage;

  return (
    <div className="flex flex-col gap-2">
      <AppSelect
        aria-label="Select product for lifecycle curve"
        className="w-full sm:w-64"
        options={products.map((p) => ({ value: p.id, label: p.name }))}
        value={productId || products[0].id}
        onChange={(event) => setProductId(event.target.value)}
      />

      {monthly.length < 2 ? (
        <p className="py-10 text-center text-sm text-text-muted">Not enough months of sales yet to plot a curve.</p>
      ) : (
        <>
          <p className="text-xs text-text-muted">
            Current stage:{' '}
            <span className="font-medium text-text">{STAGES.find((s) => s.key === currentStage)?.label ?? '—'}</span>
          </p>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={rows} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tickFormatter={formatMonth} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
              <YAxis tickFormatter={formatQty} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
              {STAGES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={theme === 'dark' ? s.dark : s.light}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
