import { z } from 'zod';

// One product, many raw material lines added together in one screen —
// each line still becomes its own `bill_of_materials` row on submit
// (create-many, one POST /bom per line), matching the real backend shape
// (bom.validator.js only knows single-line create).
const lineSchema = z.object({
  rawMaterialVariantId: z.string().min(1, 'Raw material is required'),
  quantityPerUnit: z.coerce.number().positive('Quantity per unit must be greater than 0'),
  remarks: z.string().optional(),
});

export const bomBuilderSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  lines: z.array(lineSchema).min(1, 'Add at least one raw material line'),
});
