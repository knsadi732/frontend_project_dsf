import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { breakEvenAnalysisByProduct, breakEvenAnalysisForCompany } from '@/features/production/utils/unitCost';

const COMPANY_OPTION_ID = '__company__';

// Revenue / Total Cost — validated blue+orange pair (same as Sales vs
// Inventory), consistent hue-to-job mapping: blue = money coming in
// (Revenue, matches Credit), orange = money going out (Total Cost = Fixed +
// Variable×Qty — the classic break-even chart's 3rd line). Variable Cost is
// drawn as its own 4th, muted line (0 at qty 0, not stacked on Fixed) purely
// so Fixed vs Variable is visible at a glance instead of only inferrable
// from the gap between the Fixed Cost reference line and Total Cost — it's
// redundant with Total Cost - Fixed Cost by construction, an explicit aid,
// not a 4th independent quantity. Fixed Cost stays a dashed neutral
// reference line — a constant threshold, not a trend.
const REVENUE = { light: '#2a78d6', dark: '#3987e5' };
const TOTAL_COST = { light: '#eb6834', dark: '#d95926' };
const VARIABLE_COST = { light: '#9c9c94', dark: '#7a7a72' };

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

// Classic break-even chart, at the PRODUCT level (all variants of a product
// rolled into one line — a size/colour split isn't the useful granularity
// for "is this product profitable"): Fixed Cost (flat reference), Total Cost
// (Fixed + Variable×Qty), Revenue (Price×Qty) — where Total Cost and Revenue
// cross is the break-even point.
export function BreakEvenChart({ products, workOrders, orders, variantsById, productsById, companyFixedCost = 0, height = 220 }) {
  const [productId, setProductId] = useState(COMPANY_OPTION_ID);
  const theme = useThemeStore((s) => s.theme);
  const revenueColor = theme === 'dark' ? REVENUE.dark : REVENUE.light;
  const costColor = theme === 'dark' ? TOTAL_COST.dark : TOTAL_COST.light;
  const variableColor = theme === 'dark' ? VARIABLE_COST.dark : VARIABLE_COST.light;

  if (!products.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No product has both a manufacturing cost and a selling price to analyze yet.</p>;
  }

  const activeProductId = productId || COMPANY_OPTION_ID;
  // "Overall (Company)" blends every product into one line (real monthly
  // overhead as Fixed Cost) — the default view, since "when does the
  // business break even" is usually the more useful question than any one
  // product's own line.
  const analysis =
    activeProductId === COMPANY_OPTION_ID
      ? breakEvenAnalysisForCompany(workOrders, orders, variantsById, productsById, companyFixedCost)
      : breakEvenAnalysisByProduct(workOrders, variantsById, productsById, activeProductId);

  return (
    <div className="flex flex-col gap-2">
      <AppComboSelect
        aria-label="Select product for break-even analysis"
        className="w-full sm:w-64"
        options={[{ value: COMPANY_OPTION_ID, label: 'Overall (Company) — all products' }, ...products.map((p) => ({ value: p.id, label: p.name }))]}
        value={activeProductId}
        onChange={setProductId}
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
          {analysis.fixedCost === 0 && (
            <p className="text-xs text-text-muted">
              Fixed cost is ₹0 this period (no logged overhead/labour/machine cost yet) — its reference line sits flat on the x-axis rather than as a separate band.
            </p>
          )}

          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={analysis.points} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="qty" tickFormatter={formatQty} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} label={{ value: 'Units', position: 'insideBottom', offset: -2, fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <YAxis tickFormatter={formatMoney} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={56} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
              <ReferenceLine y={analysis.fixedCost} stroke="var(--color-text-muted)" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Fixed cost (${formatMoney(analysis.fixedCost)})`, position: 'insideTopLeft', fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <Line type="monotone" dataKey="variableCost" name="Variable Cost" stroke={variableColor} strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="totalCost" name="Total Cost (Fixed + Variable)" stroke={costColor} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenue" name="Revenue (Sales)" stroke={revenueColor} strokeWidth={2} dot={false} />
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
