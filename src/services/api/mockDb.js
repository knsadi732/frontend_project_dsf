/**
 * Shared in-memory store for the mock ERP data. Unlike the old per-module
 * MOCK_* arrays, these are exported directly and mutated in place, so
 * sales/production/inventory/finance all read and write the same records —
 * that's what makes cross-module business rules (see businessRules.js)
 * possible without a real backend.
 */

export const products = [
  { id: '1', name: 'Classic Leather Loafer', sku: 'DSF-LTH-101', category: 'Formal', price: 2499, stock: 120, status: 'active' },
  { id: '2', name: 'Running Sport Shoe', sku: 'DSF-RUN-42', category: 'Sports', price: 1899, stock: 8, status: 'active' },
  { id: '3', name: 'Casual Canvas Sneaker', sku: 'DSF-CAS-77', category: 'Casual', price: 1299, stock: 60, status: 'active' },
  { id: '4', name: 'Safety Work Boot', sku: 'DSF-SFT-15', category: 'Industrial', price: 2999, stock: 0, status: 'inactive' },
];

export const inventory = [
  { id: '1', productId: '1', sku: 'DSF-LTH-101', productName: 'Classic Leather Loafer', warehouse: 'Main Warehouse - Agra', quantity: 120, reorderLevel: 30 },
  { id: '2', productId: '2', sku: 'DSF-RUN-42', productName: 'Running Sport Shoe', warehouse: 'Main Warehouse - Agra', quantity: 8, reorderLevel: 25 },
  { id: '3', productId: '3', sku: 'DSF-CAS-77', productName: 'Casual Canvas Sneaker', warehouse: 'Delhi Distribution Center', quantity: 60, reorderLevel: 20 },
];

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
  },
];

export const workOrders = [
  { id: '1', workOrderNumber: 'WO-501', productId: '2', quantity: 500, stage: 'in_progress', dueDate: '2026-07-18', salesOrderId: null, salesOrderNumber: null },
  { id: '2', workOrderNumber: 'WO-502', productId: '2', quantity: 22, stage: 'pending', dueDate: '2026-07-25', salesOrderId: '2', salesOrderNumber: 'SO-1043' },
  { id: '3', workOrderNumber: 'WO-503', productId: '3', quantity: 400, stage: 'completed', dueDate: '2026-07-05', salesOrderId: null, salesOrderNumber: null },
];

export const invoices = [
  { id: '1', invoiceNumber: 'INV-2201', party: 'Metro Footwear', amount: 245000, dueDate: '2026-07-20', status: 'unpaid', salesOrderId: null, salesOrderNumber: null },
  { id: '2', invoiceNumber: 'INV-2202', party: 'Leo Leathers', amount: 185000, dueDate: '2026-07-15', status: 'partial', salesOrderId: null, salesOrderNumber: null },
  { id: '3', invoiceNumber: 'INV-2203', party: 'City Shoe Mart', amount: 98000, dueDate: '2026-06-30', status: 'paid', salesOrderId: null, salesOrderNumber: null },
  { id: '4', invoiceNumber: 'INV-2204', party: 'Sole Components Pvt Ltd', amount: 34200, dueDate: '2026-06-25', status: 'overdue', salesOrderId: null, salesOrderNumber: null },
];

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
    };
    inventory.unshift(row);
  }
  row.quantity = Math.max(0, Number(row.quantity) + delta);

  const product = getProductById(productId);
  if (product) product.stock = getStockQuantity(productId);
}
