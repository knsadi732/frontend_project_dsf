import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { AppSelect } from '@/components/ui/AppSelect';
import { breakEvenAnalysis } from '@/features/production/utils/unitCost';

// Total Cost / Revenue — validated blue+orange pair (same as Sales vs
// Inventory), consistent hue-to-job mapping: blue = money coming in
// (Revenue, matches Credit), orange = money going out as it scales with
// volume (Total Cost). Fixed Cost is a dashed neutral reference line, not a
// third categorical series — it's a constant threshold, not a trend.
const REVENUE = { light: '#2a78d6', dark: '#3987e5' };
const TOTAL_COST = { light: '#eb6834', dark: '#d95926' };

function formatMoney(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatQty(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{formatQty(label)} units</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-text-muted">
          {entry.name}: <span className="text-text">{formatMoney(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

// Classic break-even chart: Fixed Cost (flat reference), Total Cost (Fixed +
// Variable×Qty), Revenue (Price×Qty) — where Total Cost and Revenue cross is
// the break-even point (dataviz skill: "line vs baseline" job → diverging/
// threshold treatment, legend required for 2+ series).
export function BreakEvenChart({ variants, workOrders, variantsById, height = 220 }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '');
  const theme = useThemeStore((s) => s.theme);
  const revenueColor = theme === 'dark' ? REVENUE.dark : REVENUE.light;
  const costColor = theme === 'dark' ? TOTAL_COST.dark : TOTAL_COST.light;

  if (!variants.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No SKU has both production cost and a selling price to analyze yet.</p>;
  }

  const analysis = breakEvenAnalysis(workOrders, variantsById, variantId || variants[0].id);

  return (
    <div className="flex flex-col gap-2">
      <AppSelect
        aria-label="Select SKU for break-even analysis"
        className="w-full sm:w-64"
        options={variants.map((v) => ({ value: v.id, label: v.name }))}
        value={variantId || variants[0].id}
        onChange={(event) => setVariantId(event.target.value)}
      />

      {analysis && (
        <>
          <p className="text-xs text-text-muted">
            Fixed cost {formatMoney(analysis.fixedCost)} · Variable cost/unit {formatMoney(analysis.variableCostPerUnit)} · Selling price {formatMoney(analysis.sellingPrice)}
            {analysis.breakEvenQty != null ? (
              <> · Break-even at <span className="font-medium text-text">{formatQty(Math.ceil(analysis.breakEvenQty))} units</span></>
            ) : (
              <span className="text-danger"> · Never breaks even — variable cost per unit exceeds selling price</span>
            )}
          </p>

          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={analysis.points} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="qty" tickFormatter={formatQty} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} label={{ value: 'Units', position: 'insideBottom', offset: -2, fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <YAxis tickFormatter={formatMoney} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={56} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
              <ReferenceLine y={analysis.fixedCost} stroke="var(--color-text-muted)" strokeDasharray="4 4" label={{ value: 'Fixed cost', position: 'insideTopLeft', fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <Line type="monotone" dataKey="totalCost" name="Total Cost" stroke={costColor} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke={revenueColor} strokeWidth={2} dot={false} />
              {analysis.breakEvenQty != null && (
                <ReferenceDot
                  x={Math.round(analysis.breakEvenQty)}
                  y={analysis.breakEvenRevenue}
                  r={5}
                  fill="var(--color-text)"
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
