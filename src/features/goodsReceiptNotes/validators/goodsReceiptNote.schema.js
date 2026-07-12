import { z } from 'zod';

export const grnItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  receivedQty: z.coerce.number().int().nonnegative().default(0),
  acceptedQty: z.coerce.number().int().nonnegative().default(0),
  rejectedQty: z.coerce.number().int().nonnegative().default(0),
  damagedQty: z.coerce.number().int().nonnegative().default(0),
});

export const goodsReceiptNoteSchema = z.object({
  grnNumber: z.string().min(1, 'GRN number is required'),
  purchaseOrderId: z.string().min(1, 'Purchase order is required'),
  vendorId: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  items: z.array(grnItemSchema).min(1, 'Add at least one item'),
  remarks: z.string().optional(),
  status: z.enum(['pending', 'approved']).default('pending'),
});
