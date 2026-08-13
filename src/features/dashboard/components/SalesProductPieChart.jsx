import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

// Fixed categorical order (dataviz skill reference palette, slots 1-6) —
// validated via validate_palette.js for this exact 6-hue subset in both
// modes (adjacent pairlist, which is what a pie's ring of touching wedges
// needs). "Other" gets a neutral gray, never a 7th categorical hue.
const SLOT_COLORS = [
  { light: '#2a78d6', dark: '#3987e5' }, // blue
  { light: '#eb6834', dark: '#d95926' }, // orange
  { light: '#1baf7a', dark: '#199e70' }, // aqua
  { light: '#eda100', dark: '#c98500' }, // yellow
  { light: '#e87ba4', dark: '#d55181' }, // magenta
  { light: '#008300', dark: '#008300' }, // green
];
const OTHER_COLOR = { light: '#9c9c94', dark: '#7a7a72' };

function formatQty(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{point.name}</p>
      <p className="text-text-muted">{formatQty(point.value)} units</p>
    </div>
  );
}

// Part-to-whole by product, units sold. Pie explicitly requested — kept to
// ≤6 real wedges + "Other" so it stays legible (a 9th color is never a
// generated hue). Legend always present for ≥2 series; clicking a wedge
// drills into that product's own trend (see ProductSalesTrendModal).
export function SalesProductPieChart({ data, onSliceClick, height = 170 }) {
  const theme = useThemeStore((s) => s.theme);

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No sales orders in range.</p>;
  }

  const colored = data.map((entry, index) => ({
    ...entry,
    color: entry.name === 'Other' ? (theme === 'dark' ? OTHER_COLOR.dark : OTHER_COLOR.light) : theme === 'dark' ? SLOT_COLORS[index].dark : SLOT_COLORS[index].light,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }}
        />
        <Pie
          data={colored}
          dataKey="quantity"
          nameKey="name"
          innerRadius={0}
          outerRadius={55}
          paddingAngle={2}
          onClick={(entry) => entry.name !== 'Other' && onSliceClick?.(entry.name)}
          label={({ percent }) => (percent >= 0.12 ? `${(percent * 100).toFixed(0)}%` : '')}
          labelLine={false}
        >
          {colored.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="var(--color-surface)" strokeWidth={2} className={entry.name !== 'Other' ? 'cursor-pointer' : undefined} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
