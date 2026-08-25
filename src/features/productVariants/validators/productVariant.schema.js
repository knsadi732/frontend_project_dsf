import { z } from 'zod';

// Mirrors the real backend (productVariant.validator.js) exactly. This is
// where all pricing lives now — Product itself has no price fields.
export const productVariantSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  mrp: z.coerce.number().nonnegative().optional(),
  sellingPrice: z.coerce.number().nonnegative().optional(),
  wholesalePrice: z.coerce.number().nonnegative().optional(),
  dealerPrice: z.coerce.number().nonnegative().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
  manufacturingRatePerUnit: z.coerce.number().nonnegative().optional(),
  packagingMaterialCostPerUnit: z.coerce.number().nonnegative().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
});
