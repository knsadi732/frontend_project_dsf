import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppModal } from '@/components/ui/AppModal';
import { useThemeStore } from '@/store/themeStore';
import { productTrendByDate } from '@/features/dashboard/utils/salesChartData';

const BLUE = { light: '#2a78d6', dark: '#3987e5' };

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{formatDate(label)}</p>
      <p className="text-text-muted">{Number(payload[0].value).toLocaleString('en-IN')} units</p>
    </div>
  );
}

// Opened when a pie slice is clicked (SalesProductPieChart) — the same
// order data, filtered to just that product, re-plotted as its own trend
// line so "which day did this product actually move" is one click away.
export function ProductSalesTrendModal({ open, onClose, orders, productName }) {
  const theme = useThemeStore((s) => s.theme);
  const color = theme === 'dark' ? BLUE.dark : BLUE.light;
  const data = productName ? productTrendByDate(orders, productName) : [];

  return (
    <AppModal open={open} onClose={onClose} title={productName ? `Sales trend — ${productName}` : 'Sales trend'} className="max-w-2xl">
      {data.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="productTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.1} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={44} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
            <Area
              type="monotone"
              dataKey="quantity"
              stroke={color}
              strokeWidth={2}
              fill="url(#productTrendFill)"
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-10 text-center text-sm text-text-muted">No sales recorded for this product in range.</p>
      )}
    </AppModal>
  );
}
