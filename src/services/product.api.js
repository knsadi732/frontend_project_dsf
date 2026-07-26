import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('products');

// Writes already match the real backend's field names 1:1
// (product.validator.js: categoryId, brandId, productCode, name,
// description, gender, uom, hsnCode, gstPercentage, productType,
// bomRequired, productionRequired, packagingRequired, status) — no rename
// needed. Pricing (mrp/sellingPrice/costPrice/etc.) doesn't exist on
// Product at all — it lives on Product Variants (see productVariant.api.js).

// Responses are raw `SELECT * FROM products` rows (product.repository.js)
// — snake_case Postgres columns, no case-conversion layer on the backend.
function fromBackendProduct(product) {
  return {
    ...product,
    categoryId: product.category_id,
    brandId: product.brand_id,
    productCode: product.product_code,
    hsnCode: product.hsn_code,
    gstPercentage: product.gst_percentage,
    productType: product.product_type,
    bomRequired: product.bom_required,
    productionRequired: product.production_required,
    packagingRequired: product.packaging_required,
  };
}

export const productApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendProduct), total })),
  get: (id) => baseApi.get(id).then(fromBackendProduct),
  create: (payload) => baseApi.create(payload).then(fromBackendProduct),
  update: (id, payload) => baseApi.update(id, payload).then(fromBackendProduct),
};
