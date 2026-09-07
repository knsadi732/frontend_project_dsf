import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';

const BLUE = { light: '#2a78d6', dark: '#3987e5' };
const OTHER_COLOR = { light: '#9c9c94', dark: '#7a7a72' };

function formatQty(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{point.name}</p>
      <p className="text-text-muted">{formatQty(point.quantity)} units</p>
    </div>
  );
}

// Units sold by product, top sellers first (+ "Other" for the remainder) —
// click a point to drill into that product's own trend (see
// ProductSalesTrendModal). "Other" isn't clickable, dimmed a neutral gray.
export function SalesProductPieChart({ data, onSliceClick, height = 170 }) {
  const theme = useThemeStore((s) => s.theme);
  const color = theme === 'dark' ? BLUE.dark : BLUE.light;
  const otherColor = theme === 'dark' ? OTHER_COLOR.dark : OTHER_COLOR.light;

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No sales orders in range.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={44} tickFormatter={formatQty} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
        <Line
          type="monotone"
          dataKey="quantity"
          stroke={color}
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload, index } = props;
            const isOther = payload.name === 'Other';
            return (
              <circle
                key={`dot-${payload.name}-${index}`}
                cx={cx}
                cy={cy}
                r={5}
                fill={isOther ? otherColor : color}
                stroke="var(--color-surface)"
                strokeWidth={2}
                className={isOther ? undefined : 'cursor-pointer'}
                onClick={() => !isOther && onSliceClick?.(payload.name)}
              />
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
