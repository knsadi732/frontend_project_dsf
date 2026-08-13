import { unitCostByVariant } from '@/features/production/utils/unitCost';

// Floor-wise (Cutting/Stitching/Lasting/Finishing) stages don't exist in the
// Work Order model yet — everything non-terminal is just "in progress" for
// now, so WIP is a single total, not a per-station breakdown.
export function wipTotal(workOrders) {
  return workOrders
    .filter((wo) => wo.stage === 'pending' || wo.stage === 'in_progress')
    .reduce((sum, wo) => sum + Number(wo.quantity ?? 0), 0);
}

const AGING_BUCKET_ORDER = ['Current', '1-30 days', '31-60 days', '60+ days'];

// Sums receivableAging()'s per-invoice rows into one total per bucket —
// feeds a single-hue sequential bar (aging is a magnitude-by-category job).
export function receivablesByBucket(agedInvoices) {
  const totals = new Map(AGING_BUCKET_ORDER.map((bucket) => [bucket, 0]));
  agedInvoices.forEach((inv) => {
    totals.set(inv.bucket, (totals.get(inv.bucket) ?? 0) + Number(inv.balanceDue ?? 0));
  });
  return AGING_BUCKET_ORDER.map((bucket) => ({ name: bucket, value: totals.get(bucket) ?? 0 }));
}

// Average actual cost-per-pair across every variant with real production
// history — the CPP figure an owner checks against the selling price.
export function avgCostPerPair(workOrders) {
  const rows = unitCostByVariant(workOrders).filter((row) => row.productVariantId && row.quantity > 0);
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + row.unitPrice, 0) / rows.length;
}

// OTIF (On Time In Full) — % of dispatched orders that shipped by their
// promised_delivery_date. Only counts orders that actually have both a
// promise and a dispatch timestamp; an order with no promise was never
// committed to a date, so it can't be judged late.
export function otifRate(orders) {
  const judged = orders.filter((o) => o.promisedDeliveryDate && o.dispatchedAt);
  if (!judged.length) return null;
  const onTime = judged.filter((o) => new Date(o.dispatchedAt) <= new Date(`${o.promisedDeliveryDate}T23:59:59`));
  return Math.round((onTime.length / judged.length) * 100);
}

// Today's actual production output — sum of `actualQuantity` (falling back
// to planned `quantity`) across work orders that reached "completed" today
// (by completedAt, not updated_at — see 0084 migration note).
export function dailyProductionOutput(workOrders) {
  const todayStr = new Date().toISOString().slice(0, 10);
  return workOrders
    .filter((wo) => wo.stage === 'completed' && wo.completedAt?.slice(0, 10) === todayStr)
    .reduce((sum, wo) => sum + Number(wo.actualQuantity ?? wo.quantity ?? 0), 0);
}

// Products with at least one month of real sales — the population the
// lifecycle-curve picker offers (a product with zero orders has no curve to
// draw).
export function lifecycleEligibleProducts(products, orders) {
  const soldNames = new Set();
  orders.forEach((order) => {
    (order.items ?? []).forEach((item) => {
      const name = item.productName || item.sku;
      if (name) soldNames.add(name);
    });
  });
  return products.filter((p) => soldNames.has(p.name));
}

// Units sold per calendar month for one product, oldest first — the raw
// series the classic Introduction/Growth/Maturity/Decline curve is drawn
// from (see ProductLifecycleChart.jsx).
export function productMonthlySales(orders, productName) {
  const totals = new Map();
  orders.forEach((order) => {
    const month = (order.orderDate || order.createdAt || '').slice(0, 7);
    if (!month) return;
    const qty = (order.items ?? [])
      .filter((item) => (item.productName || item.sku) === productName)
      .reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
    if (qty > 0) totals.set(month, (totals.get(month) ?? 0) + qty);
  });
  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, quantity]) => ({ month, quantity }));
}

// Heuristic stage classification off the monthly series itself — no
// separate "lifecycle" field exists anywhere, so a product's stage is
// inferred the way the textbook curve defines it: Introduction (low volume,
// still below a quarter of its peak), Growth (rising toward the peak),
// Maturity (at/near the peak, ~85%+), Decline (falling back off the peak
// after maturity was reached). A short series that never really grows just
// stays "Introduction" throughout — nothing to call Decline without a peak.
export function classifyLifecycleStages(monthly) {
  if (!monthly.length) return [];
  const peak = Math.max(...monthly.map((m) => m.quantity));
  let stage = 'introduction';
  let reachedMaturity = false;
  return monthly.map((point, i) => {
    const ratio = peak > 0 ? point.quantity / peak : 0;
    const prev = monthly[i - 1];
    const rising = prev ? point.quantity >= prev.quantity : true;
    if (stage === 'introduction' && ratio >= 0.25 && rising) stage = 'growth';
    else if (stage === 'growth' && ratio >= 0.85) {
      stage = 'maturity';
      reachedMaturity = true;
    } else if (stage === 'maturity' && reachedMaturity && !rising && ratio < 0.7) stage = 'decline';
    return { ...point, stage };
  });
}
