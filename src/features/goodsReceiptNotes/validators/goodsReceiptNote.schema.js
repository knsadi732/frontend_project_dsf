import { z } from 'zod';

// Real backend pipeline: draft -> inspected -> completed, with `rejected`
// forking off inspected only (a GRN is created as `draft` by
// POST /purchase-orders/:poId/grn, never chosen client-side).
export const GRN_STATUS_PIPELINE = ['draft', 'inspected', 'completed'];
export const GRN_REJECTED = 'rejected';

export const grnItemSchema = z.object({
  purchaseOrderItemId: z.string().min(1),
  productVariantId: z.string().min(1),
  orderedQuantity: z.coerce.number().int().nonnegative().optional(),
  receivedQuantity: z.coerce.number().int().nonnegative(),
  acceptedQuantity: z.coerce.number().int().nonnegative(),
  rejectedQuantity: z.coerce.number().int().nonnegative().default(0),
  rejectionReason: z.string().optional(),
});

// Real backend body (POST /purchase-orders/:poId/grn): { warehouseId,
// vendorInvoiceNumber?, receivedDate, remarks?, items: [{
// purchaseOrderItemId, productVariantId, receivedQuantity,
// acceptedQuantity, rejectedQuantity, rejectionReason? }] }. `grnNumber` is
// server-generated (DSF-GRN-0001, sequence-backed), never sent by the
// client — there's no preview/generate-number endpoint for it either, so
// it's only known after the record is created.
export const grnSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  vendorInvoiceNumber: z.string().optional(),
  receivedDate: z.string().min(1, 'Received date is required'),
  remarks: z.string().optional(),
  items: z.array(grnItemSchema).min(1, 'Add at least one item'),
});
