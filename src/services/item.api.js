import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

const categoriesBase = createCrudApi('items/categories');
const itemsBase = createCrudApi('items');

// Item Categories (Chapter 8) — same parent/child hierarchy pattern as the
// Product Category domain, just scoped to non-sellable items. Backend rows
// are raw snake_case Postgres columns (item.repository.js), request bodies
// already camelCase (item.validator.js) so writes pass straight through.
function fromBackendItemCategory(row) {
  return {
    ...row,
    parentCategoryId: row.parent_category_id,
    parentCategoryName: row.parent_category_name,
    categoryCode: row.category_code,
    categoryName: row.category_name,
    stockKind: row.stock_kind,
  };
}

// parentCategoryId is an optional GUID column (top-level categories have
// none) — the backend's Joi validator accepts null but not '' (empty string
// isn't a valid GUID), so a cleared/never-chosen parent select (which
// yields '') must be normalized to null before it leaves the browser.
// stockKind is an enum column with no '' in its allowed list either — an
// unselected dropdown must be OMITTED entirely (not sent as ''), so the
// backend's own `stockKind || 'raw_material'` default applies instead of a
// Joi validation error.
function toBackendItemCategoryPayload(payload) {
  const { stockKind, ...rest } = payload;
  return { ...rest, parentCategoryId: payload.parentCategoryId || null, ...(stockKind && { stockKind }) };
}

export const itemCategoryApi = {
  // GET /items/categories/generate-code — previews (does not consume) the
  // next category code, e.g. CAT-00001.
  generateCode: () => apiClient.get('/items/categories/generate-code').then((res) => res.data.data.categoryCode),
  list: (params) =>
    categoriesBase.list(params).then(({ data, total }) => ({ data: data.map(fromBackendItemCategory), total })),
  get: (id) => categoriesBase.get(id).then(fromBackendItemCategory),
  create: (payload) => categoriesBase.create(toBackendItemCategoryPayload(payload)).then(fromBackendItemCategory),
  update: (id, payload) => categoriesBase.update(id, toBackendItemCategoryPayload(payload)).then(fromBackendItemCategory),
};

// Item Master --------------------------------------------------------------

function fromBackendItem(row) {
  return {
    ...row,
    itemCode: row.item_code,
    itemName: row.item_name,
    itemCategoryId: row.item_category_id,
    itemCategoryName: row.item_category_name,
    stockKind: row.stock_kind,
    preferredVendorId: row.preferred_vendor_id,
    preferredVendorName: row.preferred_vendor_name,
    hsnCode: row.hsn_code,
    gstPercentage: row.gst_percentage != null ? Number(row.gst_percentage) : null,
    standardCost: row.standard_cost != null ? Number(row.standard_cost) : null,
    reorderLevel: row.reorder_level != null ? Number(row.reorder_level) : null,
    specification: row.specification ?? {},
  };
}

// preferredVendorId is an optional GUID column — same '' -> null issue as
// parentCategoryId above (a cleared/never-chosen vendor select yields '',
// which the backend's Joi validator rejects as an invalid GUID). The three
// optional number fields have the same problem one level worse: ItemFormModal
// has no zod/resolver, so a blank <input type="number"> stays the raw string
// '' (React Hook Form doesn't coerce it), and Joi's plain `.number()` (no
// `.allow('')`) rejects an empty string outright — omit them entirely when blank.
function toBackendItemPayload(payload) {
  const { gstPercentage, standardCost, reorderLevel, uom, ...rest } = payload;
  return {
    ...rest,
    preferredVendorId: payload.preferredVendorId || null,
    ...(gstPercentage !== '' && gstPercentage != null && { gstPercentage }),
    ...(standardCost !== '' && standardCost != null && { standardCost }),
    ...(reorderLevel !== '' && reorderLevel != null && { reorderLevel }),
    ...(uom && { uom }),
  };
}

export const itemApi = {
  // GET /items/generate-code — previews (does not consume) the next item
  // code, e.g. ITM-00001.
  generateCode: () => apiClient.get('/items/generate-code').then((res) => res.data.data.itemCode),
  // itemCategoryId is the only filter GET /items supports besides
  // pagination/search — item.routes.js reads it as `item_category_id`.
  list: ({ itemCategoryId, ...params } = {}) =>
    itemsBase
      .list({ ...params, ...(itemCategoryId && { item_category_id: itemCategoryId }) })
      .then(({ data, total }) => ({ data: data.map(fromBackendItem), total })),
  get: (id) => itemsBase.get(id).then(fromBackendItem),
  create: (payload) => itemsBase.create(toBackendItemPayload(payload)).then(fromBackendItem),
  update: (id, payload) => itemsBase.update(id, toBackendItemPayload(payload)).then(fromBackendItem),
};

// Item Variants (Chapter 8 — Item -> Variant -> SKU, mirrors Product -> Product Variant).

function fromBackendItemVariant(row) {
  return {
    ...row,
    itemId: row.item_id,
    sku: row.sku,
    size: row.size,
    color: row.color,
    standardCost: row.standard_cost != null ? Number(row.standard_cost) : null,
    itemName: row.item_name,
    itemCode: row.item_code,
    uom: row.uom,
    itemCategoryId: row.item_category_id,
    itemCategoryName: row.item_category_name,
    stockKind: row.stock_kind,
  };
}

const itemVariantsBase = createCrudApi('items/variants');

// standardCost is a plain Joi.number() (no .allow('')) on both create and
// update — a blank <input type="number"> must be omitted, not sent as ''.
// itemId is only accepted on create; updateItemVariant's Joi schema has no
// itemId key at all (Joi objects reject unknown keys by default), so it
// must never be sent on update even though the edit form keeps the field
// visible (disabled) for context.
function toBackendItemVariantCreatePayload(payload) {
  const { standardCost, sku, ...rest } = payload;
  return {
    ...rest,
    ...(sku && { sku }),
    ...(standardCost !== '' && standardCost != null && { standardCost }),
  };
}

function toBackendItemVariantUpdatePayload(payload) {
  const { itemId, sku, standardCost, ...rest } = payload;
  return {
    ...rest,
    ...(standardCost !== '' && standardCost != null && { standardCost }),
  };
}

export const itemVariantApi = {
  generateSku: () => apiClient.get('/items/variants/generate-sku').then((res) => res.data.data.sku),
  list: ({ itemId, ...params } = {}) =>
    itemVariantsBase
      .list({ ...params, ...(itemId && { item_id: itemId }) })
      .then(({ data, total }) => ({ data: data.map(fromBackendItemVariant), total })),
  get: (id) => itemVariantsBase.get(id).then(fromBackendItemVariant),
  create: (payload) => itemVariantsBase.create(toBackendItemVariantCreatePayload(payload)).then(fromBackendItemVariant),
  update: (id, payload) => itemVariantsBase.update(id, toBackendItemVariantUpdatePayload(payload)).then(fromBackendItemVariant),
};

// Item Stock (Chapter 8 stock outcome for Raw Material/Packaging/
// Consumables/Spare Parts) — read-only balances + a manual "receive"
// action (GRN-equivalent quick entry) and internal "consume". Fixed Assets
// and Services never appear here (see Chapter 8 outcome routing).

function fromBackendStock(row) {
  return {
    ...row,
    itemVariantId: row.item_variant_id,
    sku: row.sku,
    size: row.size,
    color: row.color,
    itemName: row.item_name,
    itemCode: row.item_code,
    uom: row.uom,
    warehouseId: row.warehouse_id,
    warehouseName: row.warehouse_name,
    quantityOnHand: Number(row.quantity_on_hand ?? 0),
    quantityReserved: Number(row.quantity_reserved ?? 0),
  };
}

function fromBackendStockMovement(row) {
  return {
    ...row,
    itemVariantId: row.item_variant_id,
    sku: row.sku,
    size: row.size,
    color: row.color,
    itemName: row.item_name,
    itemCode: row.item_code,
    warehouseName: row.warehouse_name,
    movementType: row.movement_type,
    quantityChange: Number(row.quantity_change ?? 0),
    quantityOnHandAfter: row.quantity_on_hand_after != null ? Number(row.quantity_on_hand_after) : null,
    referenceType: row.reference_type,
    createdAt: row.created_at,
  };
}

export const itemStockApi = {
  list: ({ pageSize, warehouseId, itemVariantId, ...params } = {}) =>
    apiClient
      .get('/items/stock', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(warehouseId && { warehouse_id: warehouseId }),
          ...(itemVariantId && { item_variant_id: itemVariantId }),
        },
      })
      .then((res) => ({
        data: res.data.data.map(fromBackendStock),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  listMovements: ({ pageSize, itemVariantId, ...params } = {}) =>
    apiClient
      .get('/items/stock/movements', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(itemVariantId && { item_variant_id: itemVariantId }),
        },
      })
      .then((res) => ({
        data: res.data.data.map(fromBackendStockMovement),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  // "Receive Stock" — manual GRN-equivalent. When unitCost is given the
  // backend also posts a Finance expense in the same call, so the response
  // carries both the movement and the (optional) expense.
  receive: (payload) =>
    apiClient.post('/items/stock/receive', payload).then((res) => ({
      movement: res.data.data.movement ? fromBackendStockMovement(res.data.data.movement) : res.data.data.movement,
      expense: res.data.data.expense,
    })),
  // Internal consumption — no Finance posting.
  consume: (payload) => apiClient.post('/items/stock/consume', payload).then((res) => res.data.data),
};
