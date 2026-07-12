import { z } from 'zod';
import { ORDER_STATUS } from '@/constants/statusEnums';

export const purchaseItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  rate: z.coerce.number().positive('Rate must be greater than 0'),
});

export const purchaseSchema = z.object({
  poNumber: z.string().min(1, 'PO number is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(Object.values(ORDER_STATUS)).default(ORDER_STATUS.DRAFT),
  items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
});
