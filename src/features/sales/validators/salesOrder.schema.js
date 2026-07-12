import { z } from 'zod';
import { ORDER_STATUS } from '@/constants/statusEnums';

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  rate: z.coerce.number().positive('Rate must be greater than 0'),
});

export const SALES_CHANNEL_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'pos', label: 'Retail POS' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'manual', label: 'Manual' },
];

export const salesOrderSchema = z.object({
  soNumber: z.string().min(1, 'SO number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  customer: z.string().min(1, 'Customer is required'),
  salesChannel: z.enum(['website', 'marketplace', 'pos', 'wholesale', 'manual']).default('manual'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(Object.values(ORDER_STATUS)).default(ORDER_STATUS.DRAFT),
  items: z.array(salesOrderItemSchema).min(1, 'Add at least one item'),
});
