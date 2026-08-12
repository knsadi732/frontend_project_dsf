import { z } from 'zod';

// Real backend body (bom.validator.js): productId + rawMaterialVariantId are
// fixed at creation (bom.controller.js update only accepts quantityPerUnit/
// remarks) — unique per (productId, rawMaterialVariantId), a second line for
// the same pair should PATCH the existing one instead of creating another.
export const bomLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  rawMaterialVariantId: z.string().min(1, 'Raw material variant is required'),
  quantityPerUnit: z.coerce.number().positive('Quantity per unit must be greater than 0'),
  remarks: z.string().optional(),
});
