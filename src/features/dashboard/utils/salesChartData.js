// Derived entirely from already-fetched Sales Order list rows — no new
// backend calls. Order list rows carry total/orderDate directly, plus a
// lightweight items summary (sku/productName/quantity, no pricing — see
// ApiList.md "Orders"), so product-level charts here are quantity-based,
// not revenue-based.

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
