import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('product-variants');

// Responses are raw `SELECT * FROM product_variants` rows
// (productVariant.repository.js) — snake_case Postgres columns for
// product_id/selling_price/wholesale_price/dealer_price/cost_price, no
// case-conversion layer on the backend.
function fromBackendVariant(variant) {
  return {
    ...variant,
    productId: variant.product_id,
    sellingPrice: variant.selling_price,
    wholesalePrice: variant.wholesale_price,
    dealerPrice: variant.dealer_price,
    costPrice: variant.cost_price,
  };
}

export const productVariantApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendVariant), total })),
  get: (id) => baseApi.get(id).then(fromBackendVariant),
  create: (payload) => baseApi.create(payload).then(fromBackendVariant),
  update: (id, payload) => baseApi.update(id, payload).then(fromBackendVariant),
  // GET /product-variants/generate-sku — reserves and returns the next
  // variant SKU, same pattern as purchase-orders'/purchase-requests'
  // generate-number.
  generateSku: () => apiClient.get('/product-variants/generate-sku').then((res) => res.data.data.sku),
};
