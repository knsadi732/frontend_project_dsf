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
export function unitCostByVariant(workOrders) {
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
      };
      entry.quantity += Number(wo.quantity ?? 0);
      COST_FIELDS.forEach((field) => {
        entry[field] += Number(wo[field] ?? 0);
      });
      groups.set(key, entry);
    });

  return Array.from(groups.values())
    .map((entry) => {
      const total = totalCost(entry);
      const fixedCost = sumFields(entry, FIXED_COST_FIELDS);
      const variableCost = sumFields(entry, VARIABLE_COST_FIELDS);
      return {
        ...entry,
        totalCost: total,
        unitPrice: entry.quantity > 0 ? total / entry.quantity : 0,
        fixedCost,
        variableCost,
        variableCostPerUnit: entry.quantity > 0 ? variableCost / entry.quantity : 0,
      };
    })
    .sort((a, b) => b.totalCost - a.totalCost);
}

// Margin = variant's selling price - its production unit cost. Only
// variant-level entries are included (the "product-level, no variant"
// bucket has no single selling price to compare against) — top `maxItems`
// by |margin| so the biggest wins/losses lead the chart.
export function marginByVariant(workOrders, variantsById, maxItems = 8) {
  return unitCostByVariant(workOrders)
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
  return unitCostByVariant(workOrders)
    .filter((entry) => entry.productVariantId && Number(variantsById.get(entry.productVariantId)?.sellingPrice ?? 0) > 0)
    .map((entry) => ({
      id: entry.productVariantId,
      name: [entry.sku, entry.size, entry.color].filter(Boolean).join(' — ') || entry.productVariantId,
      quantity: entry.quantity,
    }));
}

// Classic break-even analysis for one variant: Fixed Cost, Variable Cost
// per unit, and Selling Price — Break-Even Qty = Fixed / (Price - Variable).
// Returns a set of {qty, totalCost, revenue} points spanning 0 to comfortably
// past the break-even point (or past current production, whichever is
// larger) so the crossing is actually visible on the line chart, plus the
// break-even qty/revenue for the marker.
export function breakEvenAnalysis(workOrders, variantsById, variantId, steps = 20) {
  const entry = unitCostByVariant(workOrders).find((row) => row.productVariantId === variantId);
  if (!entry) return null;

  const variant = variantsById.get(variantId);
  const sellingPrice = Number(variant?.sellingPrice ?? 0);
  const { fixedCost, variableCostPerUnit, quantity } = entry;
  const contributionPerUnit = sellingPrice - variableCostPerUnit;
  // contributionPerUnit <= 0: every extra unit loses more money — there is
  // no break-even quantity, it's a structural loss regardless of volume.
  const breakEvenQty = contributionPerUnit > 0 ? fixedCost / contributionPerUnit : null;

  const maxQty = Math.max(breakEvenQty ?? 0, quantity, 1) * 1.5;
  const stepSize = maxQty / steps;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const qty = Math.round(stepSize * i);
    return { qty, totalCost: fixedCost + variableCostPerUnit * qty, revenue: sellingPrice * qty };
  });

  return {
    name: entry.sku ? [entry.sku, entry.size, entry.color].filter(Boolean).join(' — ') : variantId,
    fixedCost,
    variableCostPerUnit,
    sellingPrice,
    breakEvenQty,
    breakEvenRevenue: breakEvenQty != null ? breakEvenQty * sellingPrice : null,
    currentQuantity: quantity,
    points,
  };
}
