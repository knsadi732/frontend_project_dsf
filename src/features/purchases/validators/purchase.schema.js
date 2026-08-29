import { z } from 'zod';

// Real backend pipeline (constants/enums.js PURCHASE_ORDER_STATUS_PIPELINE,
// purchaseOrder.service.js transitionPurchaseOrder): draft -> pending_approval
// -> approved -> sent -> acknowledged -> partially_received (stock is added
// to on-hand here) -> completed. Strictly sequential — a status may only
// advance to the very next step. `cancelled` is not part of the pipeline: it
// can fork off any state except completed/cancelled itself.
export const PURCHASE_ORDER_STATUS_PIPELINE = [
  'draft',
  'pending_approval',
  'approved',
  'sent',
  'acknowledged',
  'partially_received',
  'completed',
];
export const PURCHASE_ORDER_CANCELLED = 'cancelled';

// Exactly one of productVariantId (sellable Product) / itemId (Item &
// Material Master) — mirrors the backend's xor validation.
export const purchaseItemSchema = z
  .object({
    productVariantId: z.string().optional(),
    itemId: z.string().optional(),
    quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
    unitCost: z.coerce.number().min(0, 'Unit cost cannot be negative'),
  })
  .refine((item) => Boolean(item.productVariantId) !== Boolean(item.itemId), {
    message: 'Missing a product variant or item reference',
    path: ['productVariantId'],
  });

// Real backend body (purchaseOrder.validator.js): a PO can only be created
// against an approved Purchase Request — `purchaseRequestId` is required,
// there's no standalone PO creation (plan.md Chapter 11.20).
export const purchaseSchema = z.object({
  poNumber: z.string().min(1, 'PO number is required'),
  purchaseRequestId: z.string().min(1, 'An approved purchase request is required'),
  // Only set when the PO is created off a selected RFQ quotation (see
  // PurchasesPage.jsx handleCreatePoFromQuotation) — zod strips unlisted
  // keys by default, so without this field here rfqId would silently never
  // reach purchaseApi.create's toBackendPayload.
  rfqId: z.string().optional(),
  vendorId: z.string().min(1, 'Vendor is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  branchId: z.string().optional(),
  deliveryAddress: z.string().optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  paymentTerms: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  status: z.string().default('draft'),
  items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
});
