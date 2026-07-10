import { z } from 'zod';
import { ORDER_STATUS } from '@/constants/statusEnums';

export const purchaseSchema = z.object({
  poNumber: z.string().min(1, 'PO number is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  total: z.coerce.number().positive('Total must be greater than 0'),
  status: z.enum(Object.values(ORDER_STATUS)).default(ORDER_STATUS.DRAFT),
});
