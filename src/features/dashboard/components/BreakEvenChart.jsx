import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/cn';
import { AppComboSelect } from '@/components/ui/AppComboSelect';
import { AppButton } from '@/components/ui/AppButton';
import { breakEvenAnalysisByProduct, breakEvenAnalysisForCompany, breakEvenOverTime } from '@/features/production/utils/unitCost';

const COMPANY_OPTION_ID = '__company__';

// Revenue / Total Cost — validated blue+orange pair (same as Sales vs
// Inventory), consistent hue-to-job mapping: blue = money coming in
// (Revenue, always starts at the origin), orange = money going out (Total
// Cost — starts AT the Fixed Cost line and rises from there, since a
// company already spends the fixed amount regardless of volume; every
// variable cost stacks on top of that baseline, never from zero — this line
// IS "fixed cost, then variable cost building on top of it" in one series,
// not two separate ones). Fixed Cost is a dashed neutral reference line — a
// constant threshold, not a trend.
const REVENUE = { light: '#2a78d6', dark: '#3987e5' };
const TOTAL_COST = { light: '#eb6834', dark: '#d95926' };

function formatMoney(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatQty(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function ChartTooltip({ active, payload, label, xFormatter, xSuffix }) {
  if (!active || !payload?.length) return null;
  // Actual/projected are two series sharing one legend name (see the Line
  // pairs below) — at the exact boundary point both have the same value, so
  // dedupe by name/value instead of showing it twice.
  const seen = new Set();
  const rows = payload.filter((entry) => {
    if (entry.value == null) return false;
    const key = `${entry.name}:${entry.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{xFormatter(label)}{xSuffix ?? ''}</p>
      {rows.map((entry) => (
        <p key={entry.dataKey} className="text-text-muted">
          {entry.name}: <span className="text-text">{formatMoney(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

function StatusBanner({ hasReachedBreakEven, children }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold',
        hasReachedBreakEven ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
      )}
    >
      {hasReachedBreakEven ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
      {children}
    </div>
  );
}

// Classic break-even chart, at the PRODUCT level (all variants of a product
// rolled into one line — a size/colour split isn't the useful granularity
// for "is this product profitable"): Fixed Cost (flat reference), Total Cost
// (Fixed + Variable×Qty), Revenue (Price×Qty) — where Total Cost and Revenue
// cross is the break-even point. Two views: "Units" (how many units) and
// "Time" (which date, using real sales-per-day so far) — same underlying
// numbers, different x-axis for the two different questions "how many" vs
// "when".
export function BreakEvenChart({ products, workOrders, orders, variantsById, productsById, companyFixedCost = 0, channelCostPerUnit = 0, rangeFrom, rangeTo, height = 220 }) {
  const [productId, setProductId] = useState(COMPANY_OPTION_ID);
  const [mode, setMode] = useState('units');
  const theme = useThemeStore((s) => s.theme);
  const revenueColor = theme === 'dark' ? REVENUE.dark : REVENUE.light;
  const costColor = theme === 'dark' ? TOTAL_COST.dark : TOTAL_COST.light;

  if (!products.length) {
    return <p className="py-10 text-center text-sm text-text-muted">No product has both a manufacturing cost and a selling price to analyze yet.</p>;
  }

  const activeProductId = productId || COMPANY_OPTION_ID;
  // "Overall (Company)" blends every product into one line (real monthly
  // overhead as Fixed Cost) — the default view, since "when does the
  // business break even" is usually the more useful question than any one
  // product's own line. Time mode only makes sense company-wide (a single
  // product's daily sales are too sparse to read), so it ignores the picker.
  const analysis =
    mode === 'time' || activeProductId === COMPANY_OPTION_ID
      ? breakEvenAnalysisForCompany(workOrders, orders, variantsById, productsById, companyFixedCost, channelCostPerUnit)
      : breakEvenAnalysisByProduct(workOrders, orders, variantsById, productsById, activeProductId, channelCostPerUnit);

  const timeAnalysis =
    mode === 'time' ? breakEvenOverTime(workOrders, orders, variantsById, productsById, companyFixedCost, rangeFrom, rangeTo, channelCostPerUnit) : null;

  // "Have we actually reached it" — the chart's crossing point alone answers
  // "how many units", not "are we there today"; this compares that target
  // against real units sold so far this period.
  const currentRevenue = analysis ? analysis.sellingPrice * analysis.currentQuantity : 0;
  const hasReachedBreakEven = analysis?.breakEvenQty != null && analysis.currentQuantity >= analysis.breakEvenQty;
  const unitsShort = analysis?.breakEvenQty != null ? Math.max(Math.ceil(analysis.breakEvenQty) - analysis.currentQuantity, 0) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <AppComboSelect
          aria-label="Select product for break-even analysis"
          className="w-full sm:w-64"
          options={[{ value: COMPANY_OPTION_ID, label: 'Overall (Company) — all products' }, ...products.map((p) => ({ value: p.id, label: p.name }))]}
          value={activeProductId}
          onChange={setProductId}
          disabled={mode === 'time'}
        />
        <div className="flex overflow-hidden rounded-md border border-border">
          <AppButton
            variant={mode === 'units' ? 'primary' : 'ghost'}
            className="h-8 rounded-none px-3 text-xs"
            onClick={() => setMode('units')}
          >
            Units
          </AppButton>
          <AppButton
            variant={mode === 'time' ? 'primary' : 'ghost'}
            className="h-8 rounded-none px-3 text-xs"
            onClick={() => setMode('time')}
          >
            Time
          </AppButton>
        </div>
      </div>

      {mode === 'units' && analysis && (
        <>
          {analysis.breakEvenQty != null && (
            <StatusBanner hasReachedBreakEven={hasReachedBreakEven}>
              {hasReachedBreakEven ? (
                <span>Break-even reached — {formatQty(analysis.currentQuantity)} of {formatQty(Math.ceil(analysis.breakEvenQty))} units sold this period.</span>
              ) : (
                <span>
                  Not yet at break-even — {formatQty(analysis.currentQuantity)} of {formatQty(Math.ceil(analysis.breakEvenQty))} units sold,{' '}
                  <span className="underline">{formatQty(unitsShort)} more needed</span>.
                </span>
              )}
            </StatusBanner>
          )}
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
              <Tooltip content={<ChartTooltip xFormatter={formatQty} xSuffix=" units" />} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
              {/* Dotted, not dashed — dashed now specifically means "projection past
                  real data" on the two trend lines below. Fixed Cost is a known,
                  already-real constant at every quantity (not a trend that becomes
                  hypothetical further right), so reusing that dash pattern here would
                  wrongly read as "this number is also just a guess." Dotted keeps it
                  visually distinct from both solid-real and dashed-projected. */}
              <ReferenceLine y={analysis.fixedCost} stroke="var(--color-text-muted)" strokeWidth={2} strokeDasharray="1 3" label={{ value: `Fixed cost (${formatMoney(analysis.fixedCost)})`, position: 'insideTopLeft', fill: 'var(--color-text-muted)', fontSize: 11 }} />
              {/* Solid = real (qty already sold this period); dashed = projection past
                  today's real data — each pair shares one legend entry via the same
                  `name`, Recharts folds matching names into a single legend row. */}
              <Line type="monotone" dataKey="totalCostActual" name="Total Cost (Fixed + Variable)" stroke={costColor} strokeWidth={2} dot={false} legendType="plainline" />
              <Line type="monotone" dataKey="totalCostProjected" name="Total Cost (Fixed + Variable)" stroke={costColor} strokeWidth={2} strokeDasharray="5 4" dot={false} legendType="none" />
              <Line type="monotone" dataKey="revenueActual" name="Revenue (Sales)" stroke={revenueColor} strokeWidth={2} dot={false} legendType="plainline" />
              <Line type="monotone" dataKey="revenueProjected" name="Revenue (Sales)" stroke={revenueColor} strokeWidth={2} strokeDasharray="5 4" dot={false} legendType="none" />
              {analysis.breakEvenQty != null && (
                <ReferenceDot
                  x={Math.round(analysis.breakEvenQty)}
                  y={analysis.breakEvenRevenue}
                  r={5}
                  fill="var(--color-text)"
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                  label={{ value: 'Break-even', position: 'top', fill: 'var(--color-text-muted)', fontSize: 11 }}
                />
              )}
              {analysis.currentQuantity > 0 && (
                <ReferenceDot
                  x={analysis.currentQuantity}
                  y={currentRevenue}
                  r={5}
                  fill={hasReachedBreakEven ? 'var(--color-success)' : 'var(--color-danger)'}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                  label={{ value: `You are here (${formatQty(analysis.currentQuantity)})`, position: 'bottom', fill: hasReachedBreakEven ? 'var(--color-success)' : 'var(--color-danger)', fontSize: 11 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {mode === 'time' && (
        !timeAnalysis ? (
          <p className="py-10 text-center text-sm text-text-muted">No date range selected yet.</p>
        ) : (
          <>
            <StatusBanner hasReachedBreakEven={timeAnalysis.hasReachedBreakEven}>
              {timeAnalysis.hasReachedBreakEven ? (
                <span>Break-even reached on <span className="font-medium">{formatDate(timeAnalysis.breakEvenDate)}</span> — real revenue {formatMoney(timeAnalysis.currentRevenue)} already covers cost {formatMoney(timeAnalysis.currentCost)}.</span>
              ) : timeAnalysis.breakEvenDate ? (
                <span>
                  Not yet — projected to break even around <span className="font-medium">{formatDate(timeAnalysis.breakEvenDate)}</span>
                  {timeAnalysis.isProjectedCrossing ? ' (estimate, at the current average daily sales pace)' : ''}. Real so far: {formatMoney(timeAnalysis.currentRevenue)} of {formatMoney(timeAnalysis.currentCost)}.
                </span>
              ) : (
                <span>Not on track to break even within this period at the current sales pace — real so far: {formatMoney(timeAnalysis.currentRevenue)} of {formatMoney(timeAnalysis.currentCost)}.</span>
              )}
            </StatusBanner>
            <p className="text-xs text-text-muted">
              Fixed cost {formatMoney(timeAnalysis.fixedCost)} (this period, flat) · Solid = real days so far · Dashed = projected at today's average daily pace, for the rest of the selected period.
            </p>

            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={timeAnalysis.points} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} minTickGap={24} />
                <YAxis tickFormatter={formatMoney} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={56} />
                <Tooltip content={<ChartTooltip xFormatter={formatDate} />} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
                <ReferenceLine y={timeAnalysis.fixedCost} stroke="var(--color-text-muted)" strokeWidth={2} strokeDasharray="1 3" label={{ value: `Fixed cost (${formatMoney(timeAnalysis.fixedCost)})`, position: 'insideTopLeft', fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Line type="monotone" dataKey="costActual" name="Total Cost (Fixed + Variable)" stroke={costColor} strokeWidth={2} dot={false} legendType="plainline" connectNulls={false} />
                <Line type="monotone" dataKey="costProjected" name="Total Cost (Fixed + Variable)" stroke={costColor} strokeWidth={2} strokeDasharray="5 4" dot={false} legendType="none" connectNulls={false} />
                <Line type="monotone" dataKey="revenueActual" name="Revenue (Sales)" stroke={revenueColor} strokeWidth={2} dot={false} legendType="plainline" connectNulls={false} />
                <Line type="monotone" dataKey="revenueProjected" name="Revenue (Sales)" stroke={revenueColor} strokeWidth={2} strokeDasharray="5 4" dot={false} legendType="none" connectNulls={false} />
                <ReferenceDot
                  x={timeAnalysis.todayKey}
                  y={timeAnalysis.currentRevenue}
                  r={5}
                  fill={timeAnalysis.hasReachedBreakEven ? 'var(--color-success)' : 'var(--color-danger)'}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                  label={{ value: 'Today', position: 'bottom', fill: timeAnalysis.hasReachedBreakEven ? 'var(--color-success)' : 'var(--color-danger)', fontSize: 11 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )
      )}
    </div>
  );
}
