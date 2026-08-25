import { z } from 'zod';
import { RETURN_STATUS } from '@/constants/statusEnums';

export const returnSchema = z.object({
  salesOrderId: z.string().min(1, 'Sales order is required'),
  productVariantId: z.string().min(1, 'Product variant is required'),
  warehouseId: z.string().optional().or(z.literal('')),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  type: z.enum(['customer', 'courier']).default('customer'),
  reason: z.string().min(1, 'Reason is required'),
  amount: z.coerce.number().nonnegative(),
  status: z.enum(Object.values(RETURN_STATUS)).default(RETURN_STATUS.REQUESTED),
  courierPartner: z.string().optional(),
  pickupDate: z.string().optional(),
  trackingNumber: z.string().optional(),
  inspectionResult: z.string().optional(),
  inspectionNotes: z.string().optional(),
  decision: z.string().optional(),
  resolutionType: z.enum(['none', 'refund', 'replacement']).default('none'),
  refundAmount: z.coerce.number().nonnegative().default(0),
  refundMethod: z.string().optional(),
  refundReference: z.string().optional(),
  refundDate: z.string().optional(),
  replacementOrderId: z.string().nullable().optional(),
});
