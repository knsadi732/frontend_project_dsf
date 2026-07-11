import { z } from 'zod';
import { ORDER_STATUS } from '@/constants/statusEnums';

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  rate: z.coerce.number().positive('Rate must be greater than 0'),
});

export const salesOrderSchema = z.object({
  soNumber: z.string().min(1, 'SO number is required'),
  customer: z.string().min(1, 'Customer is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(Object.values(ORDER_STATUS)).default(ORDER_STATUS.DRAFT),
  items: z.array(salesOrderItemSchema).min(1, 'Add at least one item'),
});
