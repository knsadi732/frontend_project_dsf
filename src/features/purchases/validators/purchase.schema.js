import { z } from 'zod';

// Backend's purchase order pipeline (purchaseOrder.service.js /
// PURCHASE_ORDER_STATUS_PIPELINE) — draft -> approved -> ordered ->
// received (stock is added to on-hand here) -> completed. Strictly
// sequential; a status may only advance to the very next step
// (utils/stateMachine.js assertTransition), never skip ahead.
export const PURCHASE_ORDER_STATUS_PIPELINE = ['draft', 'approved', 'ordered', 'received', 'completed'];

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
});

export const purchaseSchema = z.object({
  poNumber: z.string().min(1, 'PO number is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(PURCHASE_ORDER_STATUS_PIPELINE).default('draft'),
  items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
});
