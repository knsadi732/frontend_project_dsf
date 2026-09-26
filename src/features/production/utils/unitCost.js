// Shared between the Production Cost Report (Reports > Production) and the
// Dashboard's margin/break-even charts — one aggregation, several views.
export const COST_FIELDS = ['rawMaterialCost', 'labourCost', 'machineCost', 'electricityCost', 'packagingCost', 'overheadCost'];

// Fixed vs variable classification (user-confirmed): salary/machine/overhead
// don't scale with how many units get produced in a batch — variable costs
// do. This split is what break-even analysis actually needs; a flat "total
// cost" (as the Production Cost Report shows) can't answer "how many units
// until this pays for itself."
export const FIXED_COST_FIELDS = ['labourCost', 'machineCost', 'overheadCost'];
export const VARIABLE_COST_FIELDS = ['rawMaterialCost', 'electricityCost', 'packagingCost'];

export function totalCost(row) {
  return COST_FIELDS.reduce((sum, field) => sum + Number(row[field] ?? 0), 0);
}

function sumFields(row, fields) {
  return fields.reduce((sum, field) => sum + Number(row[field] ?? 0), 0);
}

// Unit cost per SKU/variant = every non-cancelled work order's costs for
// that variant, summed and divided by the quantity actually produced across
// those work orders. Work orders with no specific productVariantId (a
// product-level batch, not tied to one size/color) fall into their own
// "product:<id>" bucket rather than being dropped.
//
// `variantsById` (optional) seeds a variant that has a real mfg cost
// (product_variants.cost_price, entered directly rather than built up from a
// work order's raw-material/labour/etc breakdown) but no work-order cost
// data yet — without this, that cost sits unused and the margin/break-even
// charts stay empty until a work order happens to exist for it. Such a
// variant shows quantity 0 (nothing produced/logged here yet); its stored
// cost is already a per-unit figure, not a batch total needing division.
export function unitCostByVariant(workOrders, variantsById = new Map()) {
  const groups = new Map();
  workOrders
    .filter((wo) => wo.stage !== 'cancelled')
    .forEach((wo) => {
      const key = wo.productVariantId ?? `product:${wo.productId}`;
      const entry = groups.get(key) ?? {
        id: key,
        productId: wo.productId,
        productVariantId: wo.productVariantId ?? null,
        sku: wo.sku,
        size: wo.size,
        color: wo.color,
        quantity: 0,
        rawMaterialCost: 0,
        labourCost: 0,
        machineCost: 0,
        electricityCost: 0,
        packagingCost: 0,
        overheadCost: 0,
        hasProductionData: true,
      };
      entry.quantity += Number(wo.quantity ?? 0);
      COST_FIELDS.forEach((field) => {
        entry[field] += Number(wo[field] ?? 0);
      });
      groups.set(key, entry);
    });

  variantsById.forEach((variant) => {
    if (groups.has(variant.id)) return;
    const costPrice = Number(variant.costPrice ?? 0);
    if (costPrice <= 0) return;
    groups.set(variant.id, {
      id: variant.id,
      productId: variant.productId,
      productVariantId: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      quantity: 0,
      rawMaterialCost: costPrice,
      labourCost: 0,
      machineCost: 0,
      electricityCost: 0,
      packagingCost: 0,
      overheadCost: 0,
      hasProductionData: false,
    });
  });

  return Array.from(groups.values())
    .map((entry) => {
      const total = totalCost(entry);
      const fixedCost = sumFields(entry, FIXED_COST_FIELDS);
      const variableCost = sumFields(entry, VARIABLE_COST_FIELDS);
      // Real work-order data divides by quantity actually produced; a
      // cost_price-only entry (hasProductionData: false) has no batch to
      // divide — its stored total is already per-unit.
      const divisor = entry.quantity > 0 ? entry.quantity : entry.hasProductionData === false ? 1 : 0;
      return {
        ...entry,
        totalCost: total,
        unitPrice: divisor > 0 ? total / divisor : 0,
        fixedCost,
        variableCost,
        variableCostPerUnit: divisor > 0 ? variableCost / divisor : 0,
      };
    })
    .sort((a, b) => b.totalCost - a.totalCost);
}

// Margin = variant's selling price - its production unit cost. Only
// variant-level entries are included (the "product-level, no variant"
// bucket has no single selling price to compare against) — top `maxItems`
// by |margin| so the biggest wins/losses lead the chart.
export function marginByVariant(workOrders, variantsById, maxItems = 8) {
  return unitCostByVariant(workOrders, variantsById)
    .filter((entry) => entry.productVariantId)
    .map((entry) => {
      const variant = variantsById.get(entry.productVariantId);
      const sellingPrice = Number(variant?.sellingPrice ?? 0);
      return {
        name: [entry.sku, entry.size, entry.color].filter(Boolean).join(' — ') || entry.productVariantId,
        unitCost: entry.unitPrice,
        sellingPrice,
        margin: sellingPrice - entry.unitPrice,
      };
    })
    .filter((entry) => entry.sellingPrice > 0)
    .sort((a, b) => Math.abs(b.margin) - Math.abs(a.margin))
    .slice(0, maxItems);
}

// Every variant with real cost + selling-price data — feeds the SKU picker
// on the break-even chart. Same eligibility as marginByVariant, unsorted
// (caller decides ordering).
export function breakEvenEligibleVariants(workOrders, variantsById) {
  return unitCostByVariant(workOrders, variantsById)
    .filter((entry) => entry.productVariantId && Number(variantsById.get(entry.productVariantId)?.sellingPrice ?? 0) > 0)
    .map((entry) => ({
      id: entry.productVariantId,
      name: [entry.sku, entry.size, entry.color].filter(Boolean).join(' — ') || entry.productVariantId,
      quantity: entry.quantity,
    }));
}

// Shared by the variant- and product-level break-even functions below: given
// a resolved {fixedCost, variableCostPerUnit, sellingPrice, quantity}, build
// the {qty, totalCost, revenue} point series and the break-even marker.
function computeBreakEven({ name, fixedCost, variableCostPerUnit, sellingPrice, quantity }, steps) {
  const contributionPerUnit = sellingPrice - variableCostPerUnit;
  // contributionPerUnit <= 0: every extra unit loses more money — there is
  // no break-even quantity, it's a structural loss regardless of volume.
  const breakEvenQty = contributionPerUnit > 0 ? fixedCost / contributionPerUnit : null;

  // A floor of 1 unit collapsed the x-axis to ~1-2 units whenever both
  // breakEvenQty and quantity were 0 (e.g. fixed cost ₹0 this month, no
  // production logged yet) — stepSize then rounded to the same 2-3 integers
  // repeatedly, drawing a meaningless staircase instead of a line. A 30-unit
  // floor keeps the chart legible even when there's nothing to scale off yet.
  const maxQty = Math.max(breakEvenQty ?? 0, quantity, 30) * 1.5;
  const stepSize = maxQty / steps;
  const rawQtys = Array.from({ length: steps + 1 }, (_, i) => Math.round(stepSize * i));
  // Inject the exact current-quantity point (real data ends here) so the
  // actual/projected split below lands precisely instead of snapping to the
  // nearest sampled step — a plain rounded step could sit short of or past
  // it, either clipping real data off early or bleeding projection into it.
  const qtys = Array.from(new Set([...rawQtys, quantity])).sort((a, b) => a - b);

  // Engineering convention: a line is only solid where it reflects real,
  // already-happened data (qty <= actual units sold this period) — beyond
  // that it's a hypothetical projection and must read as one, so it's drawn
  // dashed via a separate series. Both series carry the boundary point
  // (qty === quantity) so the solid and dashed segments visually connect
  // with no gap.
  const points = qtys.map((qty) => {
    const totalCost = fixedCost + variableCostPerUnit * qty;
    const revenue = sellingPrice * qty;
    const isActual = qty <= quantity;
    const isProjected = qty >= quantity;
    return {
      qty,
      totalCost,
      revenue,
      totalCostActual: isActual ? totalCost : null,
      totalCostProjected: isProjected ? totalCost : null,
      revenueActual: isActual ? revenue : null,
      revenueProjected: isProjected ? revenue : null,
    };
  });

  return {
    name,
    fixedCost,
    variableCostPerUnit,
    sellingPrice,
    breakEvenQty,
    breakEvenRevenue: breakEvenQty != null ? breakEvenQty * sellingPrice : null,
    currentQuantity: quantity,
    points,
  };
}

// Classic break-even analysis for one variant: Fixed Cost, Variable Cost
// per unit, and Selling Price — Break-Even Qty = Fixed / (Price - Variable).
export function breakEvenAnalysis(workOrders, variantsById, variantId, steps = 20) {
  const entry = unitCostByVariant(workOrders, variantsById).find((row) => row.productVariantId === variantId);
  if (!entry) return null;
  const variant = variantsById.get(variantId);
  const sellingPrice = Number(variant?.sellingPrice ?? 0);
  const name = entry.sku ? [entry.sku, entry.size, entry.color].filter(Boolean).join(' — ') : variantId;
  return computeBreakEven({ name, fixedCost: entry.fixedCost, variableCostPerUnit: entry.variableCostPerUnit, sellingPrice, quantity: entry.quantity }, steps);
}

// Rolls every variant of a product into one line: quantity and fixed cost
// (a real period total) are summed across variants; variable cost/unit and
// selling price are averaged, weighted by each variant's own quantity (or 1
// for a variant with no production logged yet, so a cost_price-only variant
// still counts instead of vanishing) — an approximation given the app has no
// per-product cost breakdown, but the right level for "is this PRODUCT
// profitable" rather than one specific size/colour.
// `orders` (optional): when a product has real sales, its actual average
// selling price (realSellingPriceByProduct) overrides the configured
// product_variants.selling_price, which is just a static MRP that can go
// stale — this system's configured selling_price sat at ₹799/₹399 while
// the real Amazon price was ₹649/₹599. `channelCostPerUnit` (optional):
// the marketplace channel's own real blended per-pair cost (Amazon
// fee + ads + return-charge — see marketplaceMargin.js /
// marketplace_channels.default_cost_per_unit) is ALSO a variable cost
// (it's charged per unit sold, same as raw material), so it's added into
// variableCostPerUnit here rather than only ever showing up in the
// Marketplace Margin panel — omitting it understated true variable cost
// for a channel-sold product.
export function unitCostByProduct(workOrders, variantsById, productsById, orders = [], channelCostPerUnit = 0) {
  const realPriceByProduct = realSellingPriceByProduct(orders, variantsById);
  const groups = new Map();
  unitCostByVariant(workOrders, variantsById).forEach((entry) => {
    if (!entry.productVariantId) return;
    const variant = variantsById.get(entry.productVariantId);
    if (!variant) return;
    const sellingPrice = realPriceByProduct.get(variant.productId) ?? Number(variant.sellingPrice ?? 0);
    const weight = Math.max(entry.quantity, 1);

    const group = groups.get(variant.productId) ?? {
      productId: variant.productId,
      quantity: 0,
      fixedCost: 0,
      weightedVariableCost: 0,
      weightTotal: 0,
      weightedSellingPrice: 0,
      sellingWeightTotal: 0,
    };
    group.quantity += entry.quantity;
    group.fixedCost += entry.fixedCost;
    group.weightedVariableCost += (entry.variableCostPerUnit + channelCostPerUnit) * weight;
    group.weightTotal += weight;
    if (sellingPrice > 0) {
      group.weightedSellingPrice += sellingPrice * weight;
      group.sellingWeightTotal += weight;
    }
    groups.set(variant.productId, group);
  });

  return Array.from(groups.values()).map((group) => ({
    productId: group.productId,
    name: productsById.get(group.productId)?.name ?? group.productId,
    quantity: group.quantity,
    fixedCost: group.fixedCost,
    variableCostPerUnit: group.weightTotal > 0 ? group.weightedVariableCost / group.weightTotal : 0,
    sellingPrice: group.sellingWeightTotal > 0 ? group.weightedSellingPrice / group.sellingWeightTotal : 0,
  }));
}

// Every product with real cost + selling-price data — feeds the product
// picker on the break-even chart.
export function breakEvenEligibleProducts(workOrders, variantsById, productsById) {
  return unitCostByProduct(workOrders, variantsById, productsById)
    .filter((entry) => entry.sellingPrice > 0)
    .map((entry) => ({ id: entry.productId, name: entry.name, quantity: entry.quantity }));
}

export function breakEvenAnalysisByProduct(workOrders, orders, variantsById, productsById, productId, channelCostPerUnit = 0, steps = 20) {
  const entry = unitCostByProduct(workOrders, variantsById, productsById, orders, channelCostPerUnit).find((row) => row.productId === productId);
  if (!entry) return null;
  // Real units sold (order history), not production quantity — same reason
  // unitCostForCompany uses it: work orders are empty, so "how close to
  // break-even" has to mean "given what's actually sold" to mean anything.
  const realSoldQuantity = realSalesQuantityByProduct(orders, variantsById).get(productId) ?? 0;
  return computeBreakEven({ name: entry.name, fixedCost: entry.fixedCost, variableCostPerUnit: entry.variableCostPerUnit, sellingPrice: entry.sellingPrice, quantity: realSoldQuantity }, steps);
}

// Real units sold per product, from actual order history (order_items'
// sku -> variant -> productId), NOT production data — this is the sales
// MIX a multi-product break-even blend has to weight by. A product with no
// real sales yet falls back to 0 here (the caller decides what to do with
// that, see unitCostForCompany).
export function realSalesQuantityByProduct(orders, variantsById) {
  const variantBySku = new Map(Array.from(variantsById.values()).map((v) => [v.sku, v]));
  const totals = new Map();
  (orders ?? [])
    .filter((order) => order.status !== 'cancelled')
    .forEach((order) => {
      (order.items ?? []).forEach((item) => {
        const variant = item.productVariantId ? variantsById.get(item.productVariantId) : variantBySku.get(item.sku);
        const productId = variant?.productId ?? item.productId;
        if (!productId) return;
        totals.set(productId, (totals.get(productId) ?? 0) + Number(item.quantity ?? 0));
      });
    });
  return totals;
}

/**
 * Real average selling price per product, from actual order totals (GST-
 * inclusive, matching product_variants.selling_price's own convention) —
 * NOT the product_variants.selling_price config field, which is a static
 * MRP that can go stale (this system's real Amazon price is ₹649/₹599;
 * the configured selling_price sat at ₹799/₹399, an old figure). A product
 * with no real sales yet falls back to null here (the caller decides what
 * to do with that — see unitCostByProduct, which falls back to the
 * configured selling_price only in that case).
 */
export function realSellingPriceByProduct(orders, variantsById) {
  // The orders LIST endpoint's item rows are a lightweight summary
  // (sku/productName/quantity only, no unitPrice) — order.total (a real
  // orders-table column, always present) is the only per-order revenue
  // figure available here, so it's allocated across that order's items by
  // quantity share, same technique marketplaceMargin.js uses.
  const variantBySku = new Map(Array.from(variantsById.values()).map((v) => [v.sku, v]));
  const revenue = new Map();
  const quantity = new Map();
  (orders ?? [])
    .filter((order) => order.status !== 'cancelled')
    .forEach((order) => {
      const items = order.items ?? [];
      const orderQty = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0) || 1;
      const orderTotal = Number(order.total ?? 0);
      items.forEach((item) => {
        const variant = item.productVariantId ? variantsById.get(item.productVariantId) : variantBySku.get(item.sku);
        const productId = variant?.productId ?? item.productId;
        if (!productId) return;
        const qty = Number(item.quantity ?? 0);
        revenue.set(productId, (revenue.get(productId) ?? 0) + orderTotal * (qty / orderQty));
        quantity.set(productId, (quantity.get(productId) ?? 0) + qty);
      });
    });
  const prices = new Map();
  revenue.forEach((total, productId) => {
    const qty = quantity.get(productId) ?? 0;
    if (qty > 0) prices.set(productId, total / qty);
  });
  return prices;
}

/**
 * Whole-company break-even using the textbook multi-product method: the
 * Weighted Average Contribution Margin Ratio, weighted by each product's
 * REAL sales mix (actual units sold, from order history) — not a plain
 * average of each product's price/cost, which silently assumes every
 * product sells in equal numbers (wrong here: DS-WS-001 outsells DS-WS-002
 * roughly 4:1 in the real recorded orders). A product with no sales history
 * yet falls back to equal weight (1) among the no-history group only, so it
 * still contributes to the blend without distorting products that DO have
 * real sales data.
 *
 *   BEP Revenue = Fixed Cost / Weighted-Average CM Ratio
 *   Weighted-Average CM Ratio = Σ (sales-mix % × that product's own CM ratio)
 *
 * Fixed cost is the REAL monthly overhead total (loan interest + recurring
 * charges + rent, from overheadAllocation.service.js via
 * useOverheadPerUnitQuery), not work orders' own fixedCost fields — those
 * stay ₹0 until production batches log labour/machine/overhead costs.
 */
export function unitCostForCompany(workOrders, orders, variantsById, productsById, companyFixedCost = 0, channelCostPerUnit = 0) {
  const products = unitCostByProduct(workOrders, variantsById, productsById, orders, channelCostPerUnit).filter((entry) => entry.sellingPrice > 0);
  if (!products.length) return null;

  const salesQtyByProduct = realSalesQuantityByProduct(orders, variantsById);
  const hasAnySalesHistory = Array.from(salesQtyByProduct.values()).some((qty) => qty > 0);

  // Weight by real units sold per product wherever sales history exists —
  // the ratio of (Σ weight×contribution) / (Σ weight×price) below is then
  // exactly the textbook revenue-weighted average CM ratio. A product with
  // no sales yet falls back to weight 1 so it still contributes.
  let totalWeight = 0;
  let weightedSellingPrice = 0;
  let weightedContribution = 0;
  let realSoldQuantity = 0;
  products.forEach((entry) => {
    const realQty = salesQtyByProduct.get(entry.productId) ?? 0;
    const weight = hasAnySalesHistory ? realQty : 1;
    realSoldQuantity += realQty;
    if (weight <= 0) return;
    totalWeight += weight;
    weightedSellingPrice += entry.sellingPrice * weight;
    weightedContribution += (entry.sellingPrice - entry.variableCostPerUnit) * weight;
  });
  // Every product had real sales history but happened to have none of it in
  // this particular call's product list — nothing to weight by; fall back
  // to an unweighted average across products instead of dividing by zero.
  if (totalWeight === 0) {
    products.forEach((entry) => {
      totalWeight += 1;
      weightedSellingPrice += entry.sellingPrice;
      weightedContribution += entry.sellingPrice - entry.variableCostPerUnit;
    });
  }

  // Weighted-average selling price and weighted-average contribution/unit,
  // both normalized by the same totalWeight — variableCostPerUnit backed out
  // from the two so contributionPerUnit downstream reproduces the correct
  // weighted CM ratio exactly.
  const sellingPrice = weightedSellingPrice / totalWeight;
  const variableCostPerUnit = sellingPrice - weightedContribution / totalWeight;

  return {
    name: 'Overall (Company)',
    // Real units actually SOLD this period (order history), not production
    // quantity — work orders are empty right now, so "quantity" has to mean
    // "how close are we to break-even given real sales" for this to be
    // useful at all (see breakEvenAnalysisForCompany's "you are here" marker).
    quantity: realSoldQuantity,
    fixedCost: companyFixedCost,
    variableCostPerUnit,
    sellingPrice,
  };
}

export function breakEvenAnalysisForCompany(workOrders, orders, variantsById, productsById, companyFixedCost, channelCostPerUnit = 0, steps = 20) {
  const entry = unitCostForCompany(workOrders, orders, variantsById, productsById, companyFixedCost, channelCostPerUnit);
  if (!entry) return null;
  return computeBreakEven(entry, steps);
}

function toDateKey(value) {
  return value ? String(value).slice(0, 10) : null;
}

/**
 * Break-even against a CALENDAR (when, not how many): cumulative real
 * revenue and cumulative real cost (Fixed + Variable×units-sold-so-far)
 * for every day in [rangeFrom, rangeTo], solid up to `referenceDate`
 * (today), then extrapolated (dashed) for the rest of the range using the
 * average daily rate observed in the real days elapsed so far — same
 * actual/projected convention as the units-based chart, just walking
 * dates instead of quantities. Uses the same blended per-unit rate
 * unitCostForCompany derives (real sales-mix weighted).
 */
export function breakEvenOverTime(workOrders, orders, variantsById, productsById, companyFixedCost, rangeFrom, rangeTo, channelCostPerUnit = 0, referenceDate = new Date()) {
  const blend = unitCostForCompany(workOrders, orders, variantsById, productsById, companyFixedCost, channelCostPerUnit);
  if (!blend || !rangeFrom || !rangeTo) return null;

  const todayKey = toDateKey(referenceDate);
  const dailyRevenue = new Map();
  const dailyUnits = new Map();
  (orders ?? [])
    .filter((order) => order.status !== 'cancelled')
    .forEach((order) => {
      const dateKey = toDateKey(order.orderDate);
      if (!dateKey || dateKey < rangeFrom || dateKey > rangeTo) return;
      const qty = (order.items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
      dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) ?? 0) + Number(order.total ?? 0));
      dailyUnits.set(dateKey, (dailyUnits.get(dateKey) ?? 0) + qty);
    });

  const days = [];
  for (let d = new Date(rangeFrom); toDateKey(d) <= rangeTo; d.setDate(d.getDate() + 1)) {
    days.push(toDateKey(d));
  }

  // Pass 1: real cumulative totals through the last day <= today (or the
  // whole range, if today is past the range end — a closed prior period).
  let cumRevenue = 0;
  let cumUnits = 0;
  let daysElapsed = 0;
  const boundaryKey = days.find((day) => day > todayKey) ? todayKey : days[days.length - 1];
  days.forEach((day) => {
    if (day > boundaryKey) return;
    cumRevenue += dailyRevenue.get(day) ?? 0;
    cumUnits += dailyUnits.get(day) ?? 0;
    daysElapsed += 1;
  });
  const avgDailyRevenue = daysElapsed > 0 ? cumRevenue / daysElapsed : 0;
  const avgDailyUnits = daysElapsed > 0 ? cumUnits / daysElapsed : 0;

  // Pass 2: walk the full range building both series, carrying real
  // cumulative totals through the boundary day then switching to the
  // extrapolated rate — both series carry the boundary point so the solid
  // and dashed segments visually connect.
  let runningRevenue = 0;
  let runningUnits = 0;
  let boundaryRevenue = 0;
  let boundaryUnits = 0;
  const points = days.map((day) => {
    const isPast = day <= boundaryKey;
    if (isPast) {
      runningRevenue += dailyRevenue.get(day) ?? 0;
      runningUnits += dailyUnits.get(day) ?? 0;
      if (day === boundaryKey) {
        boundaryRevenue = runningRevenue;
        boundaryUnits = runningUnits;
      }
    } else {
      runningRevenue = boundaryRevenue + avgDailyRevenue * (days.indexOf(day) - days.indexOf(boundaryKey));
      runningUnits = boundaryUnits + avgDailyUnits * (days.indexOf(day) - days.indexOf(boundaryKey));
    }
    const cost = companyFixedCost + blend.variableCostPerUnit * runningUnits;
    return {
      date: day,
      revenueActual: isPast ? runningRevenue : null,
      revenueProjected: day >= boundaryKey ? runningRevenue : null,
      costActual: isPast ? cost : null,
      costProjected: day >= boundaryKey ? cost : null,
    };
  });

  const crossing = points.find((p) => (p.revenueActual ?? p.revenueProjected) >= (p.costActual ?? p.costProjected));

  return {
    fixedCost: companyFixedCost,
    variableCostPerUnit: blend.variableCostPerUnit,
    sellingPrice: blend.sellingPrice,
    todayKey: boundaryKey,
    currentRevenue: cumRevenue,
    currentCost: companyFixedCost + blend.variableCostPerUnit * cumUnits,
    hasReachedBreakEven: cumRevenue >= companyFixedCost + blend.variableCostPerUnit * cumUnits,
    breakEvenDate: crossing?.date ?? null,
    isProjectedCrossing: crossing ? crossing.date > boundaryKey : false,
    points,
  };
}
