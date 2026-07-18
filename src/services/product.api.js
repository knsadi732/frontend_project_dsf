import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('products');

// The real backend's product schema (product.validator.js) only knows
// {categoryId, sku, name, description, uom, unitPrice, costPrice, taxRate,
// status} — map the UI's richer mock field names onto it for writes, and
// merge them back onto the response for reads. Fields with no backend
// equivalent (brandId, productType, thumbnailUrl, galleryUrls, stock —
// stock lives under /products/stock instead) are passed through unchanged
// but won't persist server-side.
function toBackendPayload(payload) {
  const { unitOfMeasure, gstPercent, price, baseCost, ...rest } = payload;
  return {
    ...rest,
    ...(unitOfMeasure !== undefined && { uom: unitOfMeasure }),
    ...(gstPercent !== undefined && { taxRate: gstPercent }),
    ...(price !== undefined && { unitPrice: price }),
    ...(baseCost !== undefined && { costPrice: baseCost }),
  };
}

// Responses are raw `SELECT * FROM products` / `RETURNING *` rows
// (product.repository.js) — snake_case Postgres columns (unit_price,
// cost_price, tax_rate), unlike the camelCase the Joi validators expect on
// writes. No case-conversion layer exists on the backend.
function fromBackendProduct(product) {
  return {
    ...product,
    categoryId: product.category_id,
    unitOfMeasure: product.uom,
    gstPercent: product.tax_rate,
    price: product.unit_price,
    baseCost: product.cost_price,
  };
}

export const productApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendProduct), total })),
  get: (id) => baseApi.get(id).then(fromBackendProduct),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendProduct),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendProduct),
};
