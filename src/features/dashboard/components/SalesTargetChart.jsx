import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

// One measure, one axis, two lines — so hue no longer has to carry "which
// unit is this", and line style alone says target vs actual.
const COLORS = {
  light: { actual: '#2a78d6', target: '#8a94a3' },
  dark: { actual: '#3987e5', target: '#8a94a3' },
};

const formatFull = (value) => Number(value ?? 0).toLocaleString('en-IN');
const formatMoney = (value) => {
  const n = Number(value ?? 0);
  return n >= 1000 ? `₹${Math.round(n / 1000)}k` : `₹${Math.round(n)}`;
};

function ChartTooltip({ active, payload, colors }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const rows = [
    { label: 'Actual', value: `₹${formatFull(Math.round(row.actualRevenue))}`, color: colors.actual, show: row.actualRevenue != null },
    { label: 'Target', value: `₹${formatFull(Math.round(row.targetRevenue))}`, color: colors.target, show: row.targetRevenue != null },
  ].filter((r) => r.show);

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-text">Day {row.day}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-1.5 text-text-muted">
          <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: r.color }} aria-hidden="true" />
          {r.label}: <span className="font-medium text-text">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

function LegendKey({ color, dashed, label }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
      <svg width="16" height="2" aria-hidden="true">
        <line x1="0" y1="1" x2="16" y2="1" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '3 2' : undefined} />
      </svg>
      {label}
    </span>
  );
}

/**
 * Cumulative month-to-date revenue against the month's target pace — two
 * lines on one ₹ axis: where the actual line sits against the dashed target
 * line *is* the whole "are we on pace" calculation.
 *
 * Revenue, not pairs, because it carries both halves of the number (volume
 * × realised price) — a pairs-only line hides discounting. The pairs figure
 * stays on the card's header text, so nothing is lost by not plotting it;
 * plotting both meant two units, two axes and four lines to read.
 */
export function SalesTargetChart({ data, height = 190 }) {
  const theme = useThemeStore((s) => s.theme);
  const colors = theme === 'dark' ? COLORS.dark : COLORS.light;
  const hasTarget = data.some((row) => row.targetRevenue != null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <LegendKey color={colors.actual} label="Actual sales (₹)" />
        {hasTarget && <LegendKey color={colors.target} dashed label="Target (₹)" />}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            interval={4}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            width={48}
            tickFormatter={formatMoney}
          />
          <Tooltip content={<ChartTooltip colors={colors} />} cursor={{ stroke: 'var(--color-border)' }} />

          <Line
            type="monotone"
            dataKey="targetRevenue"
            stroke={colors.target}
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="actualRevenue"
            stroke={colors.actual}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
