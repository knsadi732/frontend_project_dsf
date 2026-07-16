/**
 * Shared in-memory store for the mock ERP data. Unlike the old per-module
 * MOCK_* arrays, these are exported directly and mutated in place, so
 * sales/purchases/production/inventory/finance/returns all read and write
 * the same records — that's what makes cross-module business rules (see
 * businessRules.js) possible without a real backend.
 */
import { addInventoryMovement } from '@/services/inventoryMovement.api';

// Documented assumption (no cost data exists anywhere in the app): monthly
// fixed overhead used only for the dashboard's break-even chart.
export const MONTHLY_FIXED_COST = 250000;

export const products = [
  {
    id: '1',
    name: 'Flat Sandals',
    sku: 'DSF-SNDL-101',
    categoryId: '1',
    brandId: '1',
    productType: 'finished_goods',
    unitOfMeasure: 'PAIR',
    gstPercent: 12,
    price: 899,
    stock: 50,
    status: 'active',
    baseCost: Math.round(899 * 0.55),
    returnSurcharge: 0,
    damageCost: 0,
  },
];
products.forEach((product) => {
  product.effectiveCost = product.baseCost + product.returnSurcharge + product.damageCost;
});

// `quantity` keeps meaning "available quantity" (every existing stock call
// below reads/writes this field unchanged); the typed fields below are
// additive tracking alongside it. Total = quantity + reserved + damaged + inTransit.
export const inventory = [
  {
    id: '1',
    productId: '1',
    sku: 'DSF-SNDL-101',
    productName: 'Flat Sandals',
    warehouse: 'Main Warehouse - Agra',
    quantity: 50,
    reorderLevel: 20,
  },
];

// Raw materials feeding Production's bill of materials. `defaultSupplier`
// is who an auto-raised urgent Purchase Order goes to when a work order is
// blocked for lack of this material.
export const rawMaterials = [
  { id: 'rm1', name: 'EVA Sole Sheet', unit: 'pair', quantity: 300, reorderLevel: 100, defaultSupplier: 'Sole Components Pvt Ltd', rate: 45 },
  { id: 'rm2', name: 'PU Strap / Upper Rexine', unit: 'sq ft', quantity: 200, reorderLevel: 80, defaultSupplier: 'Apex Textile Mills', rate: 65 },
  { id: 'rm3', name: 'Fabric Lining', unit: 'sq ft', quantity: 150, reorderLevel: 60, defaultSupplier: 'Apex Textile Mills', rate: 30 },
  { id: 'rm4', name: 'Adhesive', unit: 'litre', quantity: 25, reorderLevel: 10, defaultSupplier: 'Leo Leathers', rate: 380 },
  { id: 'rm5', name: 'Buckle / Strap Fastener', unit: 'pcs', quantity: 500, reorderLevel: 200, defaultSupplier: 'Metro Packaging Co', rate: 8 },
  { id: 'rm6', name: 'Packaging Box', unit: 'pcs', quantity: 200, reorderLevel: 80, defaultSupplier: 'Metro Packaging Co', rate: 18 },
];

// Simple bill of materials: how much of each raw material one finished unit
// of a product consumes.
export const productBom = {
  1: [
    { rawMaterialId: 'rm1', qtyPerUnit: 1 },
    { rawMaterialId: 'rm2', qtyPerUnit: 0.5 },
    { rawMaterialId: 'rm3', qtyPerUnit: 0.3 },
    { rawMaterialId: 'rm4', qtyPerUnit: 0.02 },
    { rawMaterialId: 'rm5', qtyPerUnit: 2 },
    { rawMaterialId: 'rm6', qtyPerUnit: 1 },
  ],
};

export const salesOrders = [];

export const workOrders = [];

export const invoices = [];

export const purchases = [];

export const returns = [];

export const creditNotes = [];

export const customerCommunications = [];

export const qualityInspections = [];

export function nextId(records) {
  return String(records.reduce((max, record) => Math.max(max, Number(record.id) || 0), 0) + 1);
}

export function nextDocNumber(records, field, prefix, padLength = 0) {
  const highest = records.reduce((max, record) => {
    const match = String(record[field] ?? '').match(/(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const nextNumber = highest + 1;
  const numberStr = padLength ? String(nextNumber).padStart(padLength, '0') : String(nextNumber);
  return `${prefix}-${numberStr}`;
}

export function getProductById(productId) {
  return products.find((product) => product.id === productId);
}

export function getRawMaterialById(rawMaterialId) {
  return rawMaterials.find((material) => material.id === rawMaterialId);
}

export function getRawMaterialByName(name) {
  return rawMaterials.find((material) => material.name === name);
}

export function getStockQuantity(productId) {
  return inventory
    .filter((row) => row.productId === productId)
    .reduce((sum, row) => sum + Number(row.quantity), 0);
}

export function adjustStock(productId, delta) {
  let row = inventory.find((item) => item.productId === productId);
  if (!row) {
    const product = getProductById(productId);
    row = {
      id: nextId(inventory),
      productId,
      sku: product?.sku ?? '',
      productName: product?.name ?? '',
      warehouse: 'Main Warehouse - Agra',
      quantity: 0,
      reorderLevel: 10,
      reservedQuantity: 0,
      damagedQuantity: 0,
      returnedQuantity: 0,
      inTransitQuantity: 0,
      repairQuantity: 0,
      binLocationId: null,
    };
    inventory.unshift(row);
  }
  row.quantity = Math.max(0, Number(row.quantity) + delta);

  const product = getProductById(productId);
  if (product) product.stock = getStockQuantity(productId);

  addInventoryMovement({
    productId,
    warehouse: row.warehouse,
    movementType: delta >= 0 ? 'stock_in' : 'stock_out',
    quantity: Math.abs(delta),
    reference: product?.sku ?? productId,
  });
}

// Increments a typed inventory bucket other than the default "available"
// quantity (e.g. repairQuantity/damagedQuantity from a return inspection
// decision) without touching `quantity`/stock-availability logic.
export function adjustInventoryBucket(productId, field, delta) {
  let row = inventory.find((item) => item.productId === productId);
  if (!row) {
    const product = getProductById(productId);
    row = {
      id: nextId(inventory),
      productId,
      sku: product?.sku ?? '',
      productName: product?.name ?? '',
      warehouse: 'Main Warehouse - Agra',
      quantity: 0,
      reorderLevel: 10,
      reservedQuantity: 0,
      damagedQuantity: 0,
      returnedQuantity: 0,
      inTransitQuantity: 0,
      repairQuantity: 0,
      binLocationId: null,
    };
    inventory.unshift(row);
  }
  row[field] = Math.max(0, Number(row[field] ?? 0) + delta);

  addInventoryMovement({
    productId,
    warehouse: row.warehouse,
    movementType: field,
    quantity: Math.abs(delta),
    reference: row.sku ?? productId,
  });
}

export function adjustRawMaterial(rawMaterialId, delta) {
  const row = getRawMaterialById(rawMaterialId);
  if (row) {
    row.quantity = Math.max(0, Number(row.quantity) + delta);
    addInventoryMovement({
      productId: rawMaterialId,
      warehouse: 'Raw Material Store',
      movementType: delta >= 0 ? 'material_in' : 'material_out',
      quantity: Math.abs(delta),
      reference: row.name,
    });
  }
}

// Checks whether making `quantity` units of `productId` is possible with
// the raw materials currently on hand. Returns per-material shortfalls (0
// or negative means that material is not a blocker).
export function checkBomAvailability(productId, quantity) {
  const recipe = productBom[productId] ?? [];
  const shortages = recipe
    .map((entry) => {
      const material = getRawMaterialById(entry.rawMaterialId);
      const needed = entry.qtyPerUnit * quantity;
      const shortfall = needed - (material?.quantity ?? 0);
      return { rawMaterialId: entry.rawMaterialId, needed, shortfall };
    })
    .filter((entry) => entry.shortfall > 0);
  return { sufficient: shortages.length === 0, shortages };
}

export function consumeBom(productId, quantity) {
  const recipe = productBom[productId] ?? [];
  recipe.forEach((entry) => adjustRawMaterial(entry.rawMaterialId, -entry.qtyPerUnit * quantity));
}

export function recomputeProductCost(product) {
  product.effectiveCost = product.baseCost + product.returnSurcharge + product.damageCost;
}
