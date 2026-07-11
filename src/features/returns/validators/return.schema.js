import { z } from 'zod';
import { RETURN_STATUS } from '@/constants/statusEnums';

export const returnSchema = z.object({
  returnNumber: z.string().min(1, 'Return number is required'),
  salesOrderId: z.string().min(1, 'Sales order is required'),
  soNumber: z.string().min(1),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  type: z.enum(['customer', 'courier']).default('customer'),
  reason: z.string().min(1, 'Reason is required'),
  amount: z.coerce.number().nonnegative(),
  createdDate: z.string().min(1, 'Date is required'),
  status: z.enum(Object.values(RETURN_STATUS)).default(RETURN_STATUS.REPORTED),
});
