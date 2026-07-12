import { z } from 'zod';

export const PRODUCT_TYPE_OPTIONS = [
  { value: 'finished_goods', label: 'Finished goods' },
  { value: 'raw_material', label: 'Raw material' },
  { value: 'packaging', label: 'Packaging material' },
  { value: 'semi_finished', label: 'Semi finished goods' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'service', label: 'Service' },
];

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  productType: z.enum(['finished_goods', 'raw_material', 'packaging', 'semi_finished', 'consumable', 'service']).default('finished_goods'),
  hsnCode: z.string().optional(),
  gstPercent: z.coerce.number().nonnegative().optional(),
  unitOfMeasure: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
  status: z.enum(['active', 'inactive']).default('active'),
});
