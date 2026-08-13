import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

// Two-category magnitude comparison — each bar names its own category on the
// x-axis (the identity channel), so no legend box is needed; color adds
// status-semantic emphasis (good/booked, in/out) rather than carrying
// identity on its own.
//
// Colors are resolved per-mode explicitly (not the app's raw --color-success/
// --color-warning/--color-danger tokens) because those specific pairs fail
// the CVD/lightness validator as an adjacent chart pair — see
// dataviz skill validate_palette.js output: success+warning passes light,
// fails dark-surface lightness with the app's lightened dark shade; red+green
// fails CVD separation outright in both modes. `data[].light`/`data[].dark`
// must be pre-validated pairs (run the validator before changing these).
export function DashboardBarChart({ data, height = 130 }) {
  const theme = useThemeStore((s) => s.theme);
  const resolved = data.map((entry) => ({ ...entry, color: theme === 'dark' ? entry.dark : entry.light }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={resolved} margin={{ top: 20, right: 12, left: 4, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={44} tickFormatter={formatValue} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-hover)' }} />
        <Bar dataKey="value" maxBarSize={24} radius={[4, 4, 0, 0]}>
          {resolved.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="top" formatter={formatValue} fill="var(--color-text)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
