import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

// Was pointed at the non-existent `/productVariants` (camelCase) — real
// backend resource is `/product-variants` (ApiList.md).
export const productVariantApi = {
  ...createCrudApi('product-variants'),
  // GET /product-variants/generate-sku — reserves and returns the next
  // variant SKU, same pattern as purchase-orders'/purchase-requests'
  // generate-number.
  generateSku: () => apiClient.get('/product-variants/generate-sku').then((res) => res.data.data.sku),
};
