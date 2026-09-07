// Derived entirely from already-fetched Sales Order list rows — no new
// backend calls. Order list rows carry total/orderDate directly, plus a
// lightweight items summary (sku/productName/quantity, no pricing — see
// ApiList.md "Orders"), so product-level charts here are quantity-based,
// not revenue-based.

// Sales revenue + order count within [from, to] (inclusive, "YYYY-MM-DD") —
// powers the Executive Overview's period-scoped Sales tile, since the
// analytics `sales_summary` widget is a fixed "today only" daily snapshot.
export function salesTotalsInRange(orders, from, to) {
  if (!from || !to) return { total: 0, count: 0 };
  const inRange = orders.filter((order) => {
    const date = (order.orderDate || order.createdAt || '').slice(0, 10);
    return date >= from && date <= to;
  });
  return { total: inRange.reduce((sum, order) => sum + Number(order.total ?? 0), 0), count: inRange.length };
}

// Units (pairs) sold within [from, to] (inclusive, "YYYY-MM-DD") — powers the
// Dashboard's Sales target widget, which tracks pairs against a monthly
// units target rather than revenue.
export function salesUnitsInRange(orders, from, to) {
  if (!from || !to) return 0;
  return orders.reduce((sum, order) => {
    const date = (order.orderDate || order.createdAt || '').slice(0, 10);
    if (date < from || date > to) return sum;
    const orderUnits = (order.items ?? []).reduce((qty, item) => qty + Number(item.quantity ?? 0), 0);
    return sum + orderUnits;
  }, 0);
}

// Day-by-day cumulative progress toward the month's pair and revenue targets,
// one row per calendar day in [from, to]. Actuals accumulate only up to today
// (later days carry null so the line stops rather than flat-lining to the
// month end); targets ramp linearly across every day, so the vertical gap at
// today reads directly as "how far behind we are".
export function salesTargetProgress(orders, from, to, unitsTarget, revenueTarget) {
  if (!from || !to) return [];

  const unitsByDate = new Map();
  const revenueByDate = new Map();
  orders.forEach((order) => {
    const date = (order.orderDate || order.createdAt || '').slice(0, 10);
    if (date < from || date > to) return;
    const units = (order.items ?? []).reduce((qty, item) => qty + Number(item.quantity ?? 0), 0);
    unitsByDate.set(date, (unitsByDate.get(date) ?? 0) + units);
    revenueByDate.set(date, (revenueByDate.get(date) ?? 0) + Number(order.total ?? 0));
  });

  const totalDays = new Date(`${to}T00:00:00Z`).getUTCDate();
  // A day counts as elapsed if it's on or before today *or* it already has
  // orders on it — `today` is a UTC date while order dates are the viewer's,
  // so on either side of midnight one of them is a day ahead of the other,
  // and a day with real sales must never be treated as still in the future.
  const lastElapsed = [new Date().toISOString().slice(0, 10), ...unitsByDate.keys()].reduce((a, b) => (a > b ? a : b));
  const rows = [];
  let cumulativeUnits = 0;
  let cumulativeRevenue = 0;

  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${from.slice(0, 7)}-${String(day).padStart(2, '0')}`;
    cumulativeUnits += unitsByDate.get(date) ?? 0;
    cumulativeRevenue += revenueByDate.get(date) ?? 0;
    const elapsed = date <= lastElapsed;
    rows.push({
      day,
      date,
      actualUnits: elapsed ? cumulativeUnits : null,
      actualRevenue: elapsed ? cumulativeRevenue : null,
      targetUnits: unitsTarget != null ? (unitsTarget / totalDays) * day : null,
      targetRevenue: revenueTarget != null ? (revenueTarget / totalDays) * day : null,
    });
  }
  return rows;
}

export function salesTrendByDate(orders) {
  const totals = new Map();
  orders.forEach((order) => {
    const date = (order.orderDate || order.createdAt || '').slice(0, 10);
    if (!date) return;
    totals.set(date, (totals.get(date) ?? 0) + Number(order.total ?? 0));
  });
  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));
}

// Top `maxSlices` products by quantity sold, remainder folded into "Other" —
// a pie/donut can't stay legible past a handful of wedges (dataviz skill:
// "a 9th series is never a generated hue — it folds into Other").
export function productMix(orders, maxSlices = 6) {
  const totals = new Map();
  orders.forEach((order) => {
    (order.items ?? []).forEach((item) => {
      const key = item.productName || item.sku || 'Unknown';
      totals.set(key, (totals.get(key) ?? 0) + Number(item.quantity ?? 0));
    });
  });
  const sorted = Array.from(totals.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);

  if (sorted.length <= maxSlices) return sorted;
  const top = sorted.slice(0, maxSlices);
  const otherQuantity = sorted.slice(maxSlices).reduce((sum, entry) => sum + entry.quantity, 0);
  return [...top, { name: 'Other', quantity: otherQuantity }];
}

// Units sold (from orders) vs current on-hand stock (from warehouse_stock,
// joined variant -> product client-side) for the same top-N products the pie
// chart shows — cross-references three already-fetched lists, no new calls.
export function salesVsInventory(orders, stockRows, variantsById, productsById, maxProducts = 6) {
  const soldByProduct = new Map();
  orders.forEach((order) => {
    (order.items ?? []).forEach((item) => {
      const key = item.productName || item.sku || 'Unknown';
      soldByProduct.set(key, (soldByProduct.get(key) ?? 0) + Number(item.quantity ?? 0));
    });
  });

  const stockByProduct = new Map();
  stockRows.forEach((row) => {
    const variant = variantsById.get(row.productVariantId);
    const productName = variant ? productsById.get(variant.productId)?.name : null;
    if (!productName) return;
    stockByProduct.set(productName, (stockByProduct.get(productName) ?? 0) + Number(row.quantityOnHand ?? 0));
  });

  const topProducts = Array.from(soldByProduct.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxProducts)
    .map(([name]) => name);

  return topProducts.map((name) => ({
    name,
    sold: soldByProduct.get(name) ?? 0,
    stock: stockByProduct.get(name) ?? 0,
  }));
}

// Quantity-sold-by-date trend for one specific product — feeds the line
// chart opened when a pie slice is clicked.
export function productTrendByDate(orders, productName) {
  const totals = new Map();
  orders.forEach((order) => {
    const date = (order.orderDate || order.createdAt || '').slice(0, 10);
    if (!date) return;
    const qty = (order.items ?? [])
      .filter((item) => (item.productName || item.sku) === productName)
      .reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
    if (qty > 0) totals.set(date, (totals.get(date) ?? 0) + qty);
  });
  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, quantity]) => ({ date, quantity }));
}
