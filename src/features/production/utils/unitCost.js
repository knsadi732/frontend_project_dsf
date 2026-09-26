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
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const qty = Math.round(stepSize * i);
    return { qty, totalCost: fixedCost + variableCostPerUnit * qty, revenue: sellingPrice * qty };
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
export function unitCostByProduct(workOrders, variantsById, productsById) {
  const groups = new Map();
  unitCostByVariant(workOrders, variantsById).forEach((entry) => {
    if (!entry.productVariantId) return;
    const variant = variantsById.get(entry.productVariantId);
    if (!variant) return;
    const sellingPrice = Number(variant.sellingPrice ?? 0);
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
    group.weightedVariableCost += entry.variableCostPerUnit * weight;
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

export function breakEvenAnalysisByProduct(workOrders, variantsById, productsById, productId, steps = 20) {
  const entry = unitCostByProduct(workOrders, variantsById, productsById).find((row) => row.productId === productId);
  if (!entry) return null;
  return computeBreakEven({ name: entry.name, fixedCost: entry.fixedCost, variableCostPerUnit: entry.variableCostPerUnit, sellingPrice: entry.sellingPrice, quantity: entry.quantity }, steps);
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
export function unitCostForCompany(workOrders, orders, variantsById, productsById, companyFixedCost = 0) {
  const products = unitCostByProduct(workOrders, variantsById, productsById).filter((entry) => entry.sellingPrice > 0);
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
  let totalQuantity = 0;
  products.forEach((entry) => {
    const realQty = salesQtyByProduct.get(entry.productId) ?? 0;
    const weight = hasAnySalesHistory ? realQty : 1;
    totalQuantity += entry.quantity;
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
    quantity: totalQuantity,
    fixedCost: companyFixedCost,
    variableCostPerUnit,
    sellingPrice,
  };
}

export function breakEvenAnalysisForCompany(workOrders, orders, variantsById, productsById, companyFixedCost, steps = 20) {
  const entry = unitCostForCompany(workOrders, orders, variantsById, productsById, companyFixedCost);
  if (!entry) return null;
  return computeBreakEven(entry, steps);
}
