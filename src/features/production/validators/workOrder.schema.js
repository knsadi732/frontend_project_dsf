import { z } from 'zod';

export const workOrderSchema = z.object({
  workOrderNumber: z.string().min(1, 'Work order number is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  stage: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  dueDate: z.string().min(1, 'Due date is required'),
  salesOrderId: z.string().optional().nullable(),
  salesOrderNumber: z.string().optional().nullable(),
});
