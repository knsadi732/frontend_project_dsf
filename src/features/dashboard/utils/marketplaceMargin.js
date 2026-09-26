// Product-wise (and combined) actual margin on marketplace orders — real
// mfg cost (product_variants.cost_price) + real system overhead
// (overheadAllocation.service.js, via useOverheadPerUnitQuery) + the
// channel's real blended per-pair cost (marketplace_channels.default_cost_per_unit
// — courier/Amazon-fee + ads + return-charge, kept up to date from actual
// settlement/ads data, see marketplaceChannel.api.js). Only orders carrying
// a channelOrderNumber count as "marketplace" — direct-customer orders are
// out of scope here.
export function marketplaceMarginByProduct(orders, variantsBySku, channel, overheadPerUnit = 0) {
  const channelCost = Number(channel?.defaultCostPerUnit ?? 0);
  const groups = new Map();

  orders
    .filter((order) => order.channelOrderNumber && order.status !== 'cancelled')
    .forEach((order) => {
      const items = order.items ?? [];
      const orderQty = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0) || 1;
      const orderRevenueExGst = Number(order.subtotal ?? 0);

      items.forEach((item) => {
        const itemQty = Number(item.quantity ?? 0) || 1;
        const variant = variantsBySku.get(item.sku);
        const key = item.productName ?? item.sku ?? 'Unknown product';
        const entry = groups.get(key) ?? { name: key, units: 0, revenue: 0, mfgCost: 0 };
        entry.units += itemQty;
        entry.revenue += orderRevenueExGst * (itemQty / orderQty);
        entry.mfgCost += Number(variant?.costPrice ?? 0) * itemQty;
        groups.set(key, entry);
      });
    });

  const rows = Array.from(groups.values())
    .map((entry) => {
      const avgRevenue = entry.units > 0 ? entry.revenue / entry.units : 0;
      const avgMfgCost = entry.units > 0 ? entry.mfgCost / entry.units : 0;
      const totalCost = avgMfgCost + overheadPerUnit + channelCost;
      const marginPerUnit = avgRevenue - totalCost;
      return {
        name: entry.name,
        units: entry.units,
        avgRevenue,
        avgMfgCost,
        overheadPerUnit,
        channelCost,
        totalCost,
        marginPerUnit,
        marginPercent: avgRevenue > 0 ? (marginPerUnit / avgRevenue) * 100 : 0,
      };
    })
    .sort((a, b) => b.units - a.units);

  const totalUnits = rows.reduce((sum, row) => sum + row.units, 0);
  if (totalUnits === 0) return { rows, combined: null };

  const weightedSum = (field) => rows.reduce((sum, row) => sum + row[field] * row.units, 0) / totalUnits;
  const combinedRevenue = weightedSum('avgRevenue');
  const combinedMargin = weightedSum('marginPerUnit');
  const combined = {
    name: 'Combined (all products)',
    units: totalUnits,
    avgRevenue: combinedRevenue,
    avgMfgCost: weightedSum('avgMfgCost'),
    overheadPerUnit,
    channelCost,
    totalCost: weightedSum('totalCost'),
    marginPerUnit: combinedMargin,
    marginPercent: combinedRevenue > 0 ? (combinedMargin / combinedRevenue) * 100 : 0,
  };

  return { rows, combined };
}
