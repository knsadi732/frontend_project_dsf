import { z } from 'zod';
import { ORDER_STATUS } from '@/constants/statusEnums';

export const salesOrderSchema = z.object({
  soNumber: z.string().min(1, 'SO number is required'),
  customer: z.string().min(1, 'Customer is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  total: z.coerce.number().positive('Total must be greater than 0'),
  status: z.enum(Object.values(ORDER_STATUS)).default(ORDER_STATUS.DRAFT),
});
