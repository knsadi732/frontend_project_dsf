import { z } from 'zod';

// Real backend pipeline (order.service.js transitionOrder / order.validator.js
// transitionStatus): pending -> confirmed -> packed -> dispatched -> delivered
// -> completed, strictly one step at a time (assertTransition). No draft/
// approved/rejected/cancelled states exist here — those were mock-era values.
export const ORDER_STATUS_PIPELINE = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'completed'];
export const PAYMENT_STATUS_OPTIONS = ['partial', 'paid', 'refunded'];

export const salesOrderItemSchema = z.object({
  productVariantId: z.string().min(1, 'Product variant is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
});

// Real backend body (order.validator.js createOrder): { branchId?, warehouseId
// (required), customerId (required), items: [{productVariantId, quantity}] }.
// unitPrice/taxRate/lineTotal are computed server-side from the variant's
// selling_price/gst_percentage — never sent by the client, and there's no
// soNumber/rate field at all (order.service.js createOrder).
export const salesOrderSchema = z.object({
  branchId: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  customerId: z.string().min(1, 'Customer is required'),
  // OTIF (On Time In Full) tracking — the sales-committed delivery date.
  promisedDeliveryDate: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, 'Add at least one item'),
  // Only present/used in edit mode (see SalesOrderFormModal's status
  // dropdown) — zod strips unlisted keys by default, so without this field
  // here the chosen status would silently never reach the submit handler.
  status: z.string().optional(),
});
