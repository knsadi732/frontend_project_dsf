import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Ranked magnitude, not identity — so a single-hue sequential blue ramp
// (darkest = biggest holding) rather than a categorical rainbow, which also
// keeps the card inside the app's blue/grey family instead of adding six
// competing hues to a page that's meant to be easy on the eyes. "Other"
// takes the neutral grey, never a seventh blue.
const RAMP = ['#1c4c8f', '#2a78d6', '#3d8ce8', '#6fb0f5', '#9cc8f5', '#c3dcf9'];
const OTHER_COLOR = '#9ca3af';

function formatQty(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function ChartTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload;
  const share = total > 0 ? Math.round((slice.value / total) * 100) : 0;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text">{slice.name}</p>
      <p className="text-text-muted">
        {formatQty(slice.value)} units · {share}%
        {slice.reserved > 0 && <> · {formatQty(slice.reserved)} reserved</>}
      </p>
    </div>
  );
}

/**
 * On-hand stock broken down by product *variant* (size/colour) — one slice
 * per variant, biggest first, tail folded into "Other" (see
 * inventoryByVariant). The legend carries the names and numbers directly, so
 * identity never rests on colour alone.
 */
export function InventorySplitPieChart({ variants = [], height = 170 }) {
  const total = variants.reduce((sum, variant) => sum + Number(variant.onHand ?? 0), 0);

  if (total <= 0) {
    return <p className="py-10 text-center text-sm text-text-muted">No stock on hand.</p>;
  }

  const data = variants.map((variant, index) => ({
    name: variant.name,
    value: Number(variant.onHand ?? 0),
    reserved: Number(variant.reserved ?? 0),
    color: variant.sku === null ? OTHER_COLOR : RAMP[index % RAMP.length],
  }));

  // Stacked, not side-by-side: this card lives in the narrow right rail, and
  // splitting the width two ways truncated every variant name to "Women
  // Sandals — UK …". Full width for the legend keeps them readable.
  return (
    <div className="flex flex-col gap-3">
      <div>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} stroke="var(--color-surface)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="mb-0.5">
          <p className="text-xs text-text-muted">On hand · {variants.length} variants</p>
          <p className="text-lg font-semibold leading-tight text-text">{formatQty(total)}</p>
        </div>
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.color }} aria-hidden="true" />
            <span className="truncate text-xs text-text-muted" title={slice.name}>
              {slice.name}
            </span>
            <span className="ml-auto shrink-0 text-xs font-medium text-text">
              {formatQty(slice.value)} ({Math.round((slice.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
