import { z } from 'zod';

export const inventorySchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  productName: z.string().min(1, 'Product name is required'),
  warehouse: z.string().min(1, 'Warehouse is required'),
  quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative'),
  reorderLevel: z.coerce.number().int().nonnegative('Reorder level cannot be negative'),
});
