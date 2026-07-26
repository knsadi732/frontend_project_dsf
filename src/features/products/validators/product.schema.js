import { z } from 'zod';

// Mirrors the real backend (product.validator.js) exactly. Pricing
// (mrp/sellingPrice/wholesalePrice/dealerPrice/costPrice) lives entirely on
// Product Variants, not here — see productVariant.schema.js.
export const PRODUCT_TYPE_OPTIONS = [
  { value: 'finished_goods', label: 'Finished goods' },
  { value: 'raw_material', label: 'Raw material' },
  { value: 'packaging_material', label: 'Packaging material' },
  { value: 'semi_finished_goods', label: 'Semi finished goods' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'service', label: 'Service' },
];

export const PRODUCT_GENDER_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids_boys', label: 'Kids (Boys)' },
  { value: 'kids_girls', label: 'Kids (Girls)' },
  { value: 'unisex', label: 'Unisex' },
];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'discontinued', label: 'Discontinued' },
];

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  productCode: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  gender: z.enum(['men', 'women', 'kids_boys', 'kids_girls', 'unisex']).optional(),
  productType: z
    .enum(['finished_goods', 'raw_material', 'packaging_material', 'semi_finished_goods', 'consumable', 'service'])
    .default('finished_goods'),
  uom: z.string().optional(),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  gstPercentage: z.coerce.number().min(0).max(100).optional(),
  bomRequired: z.boolean().default(false),
  productionRequired: z.boolean().default(false),
  packagingRequired: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
});
