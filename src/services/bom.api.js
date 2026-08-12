import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('bom');

// Responses are raw `bill_of_materials` rows (bom.repository.js) —
// snake_case Postgres columns, plus raw-material variant (sku/size/color/
// raw_material_name) and finished product (product_name) display fields
// joined in on list/get; create/update return the bare row (RETURNING *).
function fromBackendBomLine(line) {
  return {
    ...line,
    productId: line.product_id,
    productName: line.product_name,
    rawMaterialVariantId: line.raw_material_variant_id,
    rawMaterialName: line.raw_material_name,
    quantityPerUnit: Number(line.quantity_per_unit ?? 0),
  };
}

// Backend's bom.validator.js: create wants {productId, rawMaterialVariantId,
// quantityPerUnit, remarks}; update only {quantityPerUnit, remarks} — the
// product/raw-material pairing is fixed at creation (delete + recreate to
// change it, per ApiList.md).
function toCreatePayload(payload) {
  return {
    productId: payload.productId,
    rawMaterialVariantId: payload.rawMaterialVariantId,
    quantityPerUnit: payload.quantityPerUnit,
    remarks: payload.remarks || undefined,
  };
}

function toUpdatePayload(payload) {
  return { quantityPerUnit: payload.quantityPerUnit, remarks: payload.remarks || undefined };
}

export const bomApi = {
  // query: product_id? (snake_case — bom.controller.js reads req.query.product_id)
  list: ({ productId, ...params } = {}) =>
    baseApi.list({ ...params, ...(productId && { product_id: productId }) }).then(({ data, total }) => ({
      data: data.map(fromBackendBomLine),
      total,
    })),
  get: (id) => baseApi.get(id).then(fromBackendBomLine),
  create: (payload) => baseApi.create(toCreatePayload(payload)).then(fromBackendBomLine),
  update: (id, payload) => baseApi.update(id, toUpdatePayload(payload)).then(fromBackendBomLine),
  remove: (id) => baseApi.remove(id),
};
