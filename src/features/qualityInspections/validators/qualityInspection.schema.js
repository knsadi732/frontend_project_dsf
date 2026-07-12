import { z } from 'zod';

export const qualityInspectionSchema = z.object({
  workOrderId: z.string().min(1, 'Work order is required'),
  inspectedQty: z.coerce.number().int().nonnegative(),
  acceptedQty: z.coerce.number().int().nonnegative(),
  reworkQty: z.coerce.number().int().nonnegative().default(0),
  rejectedQty: z.coerce.number().int().nonnegative().default(0),
  result: z.enum(['accepted', 'rework_required', 'rejected']).default('accepted'),
  inspectedDate: z.string().min(1, 'Date is required'),
  remarks: z.string().optional(),
});
