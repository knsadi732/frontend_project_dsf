import { z } from 'zod';

export const productVariantSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  material: z.string().optional(),
  gender: z.string().optional(),
  width: z.string().optional(),
  pattern: z.string().optional(),
  mrp: z.coerce.number().positive('MRP must be greater than 0'),
  sellingPrice: z.coerce.number().positive('Selling price must be greater than 0'),
  status: z.enum(['active', 'inactive']).default('active'),
});
