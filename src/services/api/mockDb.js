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
    name: 'Classic Leather Loafer',
    sku: 'DSF-LTH-101',
    categoryId: '5',
    brandId: '1',
    productType: 'finished_goods',
    hsnCode: '6403',
    gstPercent: 18,
    unitOfMeasure: 'PAIR',
    price: 2499,
    stock: 120,
    status: 'active',
    baseCost: Math.round(2499 * 0.55),
    returnSurcharge: 0,
    damageCost: 0,
  },
  {
    id: '2',
    name: 'Running Sport Shoe',
    sku: 'DSF-RUN-42',
    categoryId: '3',
    brandId: '1',
    productType: 'finished_goods',
    hsnCode: '6404',
    gstPercent: 18,
    unitOfMeasure: 'PAIR',
    price: 1899,
    stock: 8,
    status: 'active',
    baseCost: Math.round(1899 * 0.55),
    returnSurcharge: 180 * 3,
    damageCost: Math.round(3 * 1899 * 0.1),
  },
  {
    id: '3',
    name: 'Casual Canvas Sneaker',
    sku: 'DSF-CAS-77',
    categoryId: '4',
    brandId: '1',
    productType: 'finished_goods',
    hsnCode: '6404',
    gstPercent: 18,
    unitOfMeasure: 'PAIR',
    price: 1299,
    stock: 60,
    status: 'active',
    baseCost: Math.round(1299 * 0.55),
    returnSurcharge: 0,
    damageCost: 0,
  },
  {
    id: '4',
    name: 'Safety Work Boot',
    sku: 'DSF-SFT-15',
    categoryId: '8',
    brandId: '1',
    productType: 'finished_goods',
    hsnCode: '6403',
    gstPercent: 18,
    unitOfMeasure: 'PAIR',
    price: 2999,
    stock: 0,
    status: 'inactive',
    baseCost: Math.round(2999 * 0.55),
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
  { id: '1', productId: '1', sku: 'DSF-LTH-101', productName: 'Classic Leather Loafer', warehouse: 'Main Warehouse - Agra', quantity: 120, reorderLevel: 30, reservedQuantity: 0, damagedQuantity: 0, returnedQuantity: 0, inTransitQuantity: 0, repairQuantity: 0, binLocationId: '1' },
  { id: '2', productId: '2', sku: 'DSF-RUN-42', productName: 'Running Sport Shoe', warehouse: 'Main Warehouse - Agra', quantity: 8, reorderLevel: 25, reservedQuantity: 0, damagedQuantity: 0, returnedQuantity: 0, inTransitQuantity: 0, repairQuantity: 0, binLocationId: '2' },
  { id: '3', productId: '3', sku: 'DSF-CAS-77', productName: 'Casual Canvas Sneaker', warehouse: 'Delhi Distribution Center', quantity: 60, reorderLevel: 20, reservedQuantity: 0, damagedQuantity: 0, returnedQuantity: 0, inTransitQuantity: 0, repairQuantity: 0, binLocationId: '3' },
];

// Raw materials feeding Production's bill of materials. `defaultSupplier`
// is who an auto-raised urgent Purchase Order goes to when a work order is
// blocked for lack of this material.
export const rawMaterials = [
  { id: 'rm1', name: 'Finished Leather - Full Grain (sq ft)', unit: 'sq ft', quantity: 500, reorderLevel: 200, defaultSupplier: 'Leo Leathers', rate: 210 },
  { id: 'rm2', name: 'Leather Dye - Black (litre)', unit: 'litre', quantity: 20, reorderLevel: 15, defaultSupplier: 'Leo Leathers', rate: 425 },
  { id: 'rm3', name: 'PU Sole - Size 8 (pair)', unit: 'pair', quantity: 300, reorderLevel: 150, defaultSupplier: 'Sole Components Pvt Ltd', rate: 65 },
  { id: 'rm4', name: 'PU Sole - Size 9 (pair)', unit: 'pair', quantity: 40, reorderLevel: 150, defaultSupplier: 'Sole Components Pvt Ltd', rate: 55 },
  { id: 'rm5', name: 'Shoe Box - Standard', unit: 'pcs', quantity: 1000, reorderLevel: 300, defaultSupplier: 'Metro Packaging Co', rate: 18 },
  { id: 'rm6', name: 'Packing Tape Roll', unit: 'roll', quantity: 100, reorderLevel: 50, defaultSupplier: 'Metro Packaging Co', rate: 42 },
  { id: 'rm7', name: 'Mesh Fabric - Sport Upper (sq ft)', unit: 'sq ft', quantity: 10, reorderLevel: 30, defaultSupplier: 'Apex Textile Mills', rate: 95 },
];

// Simple bill of materials: how much of each raw material one finished unit
// of a product consumes.
export const productBom = {
  1: [
    { rawMaterialId: 'rm1', qtyPerUnit: 2 },
    { rawMaterialId: 'rm2', qtyPerUnit: 0.05 },
    { rawMaterialId: 'rm3', qtyPerUnit: 1 },
    { rawMaterialId: 'rm5', qtyPerUnit: 1 },
  ],
  2: [
    { rawMaterialId: 'rm7', qtyPerUnit: 1.5 },
    { rawMaterialId: 'rm4', qtyPerUnit: 1 },
    { rawMaterialId: 'rm5', qtyPerUnit: 1 },
  ],
  3: [
    { rawMaterialId: 'rm7', qtyPerUnit: 1 },
    { rawMaterialId: 'rm3', qtyPerUnit: 1 },
    { rawMaterialId: 'rm5', qtyPerUnit: 1 },
  ],
  4: [
    { rawMaterialId: 'rm1', qtyPerUnit: 3 },
    { rawMaterialId: 'rm3', qtyPerUnit: 1 },
  ],
};

export const salesOrders = [
  {
    id: '1',
    soNumber: 'SO-1042',
    customer: 'Metro Footwear',
    orderDate: '2026-07-05',
    items: [
      { productId: '1', quantity: 80, rate: 2499 },
      { productId: '3', quantity: 20, rate: 1299 },
    ],
    total: 80 * 2499 + 20 * 1299,
    status: 'approved',
    _stockReserved: true,
    dispatchDate: '2026-07-06',
    productionEta: null,
    pickListGeneratedAt: '2026-07-05T10:00:00.000Z',
    packedAt: '2026-07-06T09:00:00.000Z',
    dispatchNoteNumber: 'DN-1',
    dispatchNoteGeneratedAt: '2026-07-06T09:30:00.000Z',
  },
  {
    id: '2',
    soNumber: 'SO-1043',
    customer: 'City Shoe Mart',
    orderDate: '2026-07-08',
    items: [{ productId: '2', quantity: 30, rate: 1899 }],
    total: 30 * 1899,
    status: 'in_progress',
    _stockReserved: false,
    linkedWorkOrders: ['WO-502'],
    dispatchDate: null,
    productionEta: '2026-07-25',
    pickListGeneratedAt: null,
    packedAt: null,
    dispatchNoteNumber: null,
    dispatchNoteGeneratedAt: null,
  },
  {
    id: '3',
    soNumber: 'SO-1044',
    customer: 'Sharma Footwear Traders',
    orderDate: '2026-07-10',
    items: [{ productId: '2', quantity: 20, rate: 1899 }],
    total: 20 * 1899,
    status: 'pending',
    _stockReserved: false,
    dispatchDate: null,
    productionEta: null,
    pickListGeneratedAt: null,
    packedAt: null,
    dispatchNoteNumber: null,
    dispatchNoteGeneratedAt: null,
  },
];

export const workOrders = [
  { id: '1', workOrderNumber: 'WO-501', productId: '2', quantity: 500, stage: 'in_progress', dueDate: '2026-07-18', salesOrderId: null, salesOrderNumber: null },
  { id: '2', workOrderNumber: 'WO-502', productId: '2', quantity: 22, stage: 'pending', dueDate: '2026-07-25', salesOrderId: '2', salesOrderNumber: 'SO-1043' },
  { id: '3', workOrderNumber: 'WO-503', productId: '3', quantity: 400, stage: 'completed', dueDate: '2026-07-05', salesOrderId: null, salesOrderNumber: null },
];

export const invoices = [
  { id: '1', invoiceNumber: 'INV-2201', party: 'Metro Footwear', amount: 245000, dueDate: '2026-07-20', status: 'unpaid', salesOrderId: null, salesOrderNumber: null, orderDate: null, items: [], taxableAmount: null, gstRate: null, gstAmount: null, advanceAmount: null, balanceDue: 245000, paidAmount: 0 },
  { id: '2', invoiceNumber: 'INV-2202', party: 'Leo Leathers', amount: 185000, dueDate: '2026-07-15', status: 'partial', salesOrderId: null, salesOrderNumber: null, orderDate: null, items: [], taxableAmount: null, gstRate: null, gstAmount: null, advanceAmount: null, balanceDue: 92500, paidAmount: 92500 },
  { id: '3', invoiceNumber: 'INV-2203', party: 'City Shoe Mart', amount: 98000, dueDate: '2026-06-30', status: 'paid', salesOrderId: null, salesOrderNumber: null, orderDate: null, items: [], taxableAmount: null, gstRate: null, gstAmount: null, advanceAmount: null, balanceDue: 0, paidAmount: 98000 },
  { id: '4', invoiceNumber: 'INV-2204', party: 'Sole Components Pvt Ltd', amount: 34200, dueDate: '2026-06-25', status: 'overdue', salesOrderId: null, salesOrderNumber: null, orderDate: null, items: [], taxableAmount: null, gstRate: null, gstAmount: null, advanceAmount: null, balanceDue: 34200, paidAmount: 0 },
];

export const purchases = [
  {
    id: '1',
    poNumber: 'PO-1001',
    supplier: 'Leo Leathers',
    orderDate: '2026-06-20',
    status: 'approved',
    items: [
      { product: 'Finished Leather - Full Grain (sq ft)', quantity: 800, rate: 210 },
      { product: 'Leather Dye - Black (litre)', quantity: 40, rate: 425 },
    ],
    total: 185000,
    priority: 'normal',
    sourceType: 'manual',
    linkedWorkOrderId: null,
  },
  {
    id: '2',
    poNumber: 'PO-1002',
    supplier: 'Sole Components Pvt Ltd',
    orderDate: '2026-06-28',
    status: 'pending',
    items: [
      { product: 'PU Sole - Size 8 (pair)', quantity: 1000, rate: 65 },
      { product: 'PU Sole - Size 9 (pair)', quantity: 500, rate: 55 },
    ],
    total: 92500,
    priority: 'normal',
    sourceType: 'manual',
    linkedWorkOrderId: null,
  },
  {
    id: '3',
    poNumber: 'PO-1003',
    supplier: 'Metro Packaging Co',
    orderDate: '2026-07-02',
    status: 'draft',
    items: [
      { product: 'Shoe Box - Standard', quantity: 1200, rate: 18 },
      { product: 'Packing Tape Roll', quantity: 300, rate: 42 },
    ],
    total: 34200,
    priority: 'normal',
    sourceType: 'manual',
    linkedWorkOrderId: null,
  },
];

export const returns = [
  {
    id: '1',
    returnNumber: 'RET-101',
    salesOrderId: '1',
    soNumber: 'SO-1042',
    customer: 'Metro Footwear',
    productId: '2',
    quantity: 3,
    type: 'customer',
    reason: 'wrong_size',
    status: 'resolved',
    amount: 3 * 1899,
    createdDate: '2026-06-15',
    courierPartner: 'Delhivery',
    pickupDate: '2026-06-16',
    trackingNumber: 'DLV-88213',
    inspectionResult: 'passed',
    inspectionNotes: 'Unused, original packaging intact',
    decision: 'restock',
    resolutionType: 'refund',
    refundAmount: 3 * 1899,
    refundMethod: 'upi',
    refundReference: 'UPI-REF-77410',
    refundDate: '2026-06-18',
    refundStatus: 'completed',
    replacementOrderId: null,
  },
  {
    id: '2',
    returnNumber: 'RET-102',
    salesOrderId: '1',
    soNumber: 'SO-1042',
    customer: 'Metro Footwear',
    productId: '1',
    quantity: 2,
    type: 'courier',
    reason: 'damaged_in_transit',
    status: 'requested',
    amount: 2 * 2499,
    createdDate: '2026-07-09',
    courierPartner: '',
    pickupDate: '',
    trackingNumber: '',
    inspectionResult: '',
    inspectionNotes: '',
    decision: '',
    resolutionType: 'none',
    refundAmount: 0,
    refundMethod: 'original_method',
    refundReference: '',
    refundDate: '',
    refundStatus: 'pending',
    replacementOrderId: null,
  },
];

export const creditNotes = [];

export const customerCommunications = [];

export const qualityInspections = [];

export function nextId(records) {
  return String(records.reduce((max, record) => Math.max(max, Number(record.id) || 0), 0) + 1);
}

export function nextDocNumber(records, field, prefix) {
  const highest = records.reduce((max, record) => {
    const match = String(record[field] ?? '').match(/(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${highest + 1}`;
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
