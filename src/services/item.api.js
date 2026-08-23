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

export const itemCategoryApi = {
  list: (params) =>
    categoriesBase.list(params).then(({ data, total }) => ({ data: data.map(fromBackendItemCategory), total })),
  get: (id) => categoriesBase.get(id).then(fromBackendItemCategory),
  create: (payload) => categoriesBase.create(payload).then(fromBackendItemCategory),
  update: (id, payload) => categoriesBase.update(id, payload).then(fromBackendItemCategory),
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

export const itemApi = {
  // itemCategoryId is the only filter GET /items supports besides
  // pagination/search — item.routes.js reads it as `item_category_id`.
  list: ({ itemCategoryId, ...params } = {}) =>
    itemsBase
      .list({ ...params, ...(itemCategoryId && { item_category_id: itemCategoryId }) })
      .then(({ data, total }) => ({ data: data.map(fromBackendItem), total })),
  get: (id) => itemsBase.get(id).then(fromBackendItem),
  create: (payload) => itemsBase.create(payload).then(fromBackendItem),
  update: (id, payload) => itemsBase.update(id, payload).then(fromBackendItem),
};

// Item Stock (Chapter 8 stock outcome for Raw Material/Packaging/
// Consumables/Spare Parts) — read-only balances + a manual "receive"
// action (GRN-equivalent quick entry) and internal "consume". Fixed Assets
// and Services never appear here (see Chapter 8 outcome routing).

function fromBackendStock(row) {
  return {
    ...row,
    itemId: row.item_id,
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
    itemId: row.item_id,
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
  list: ({ pageSize, warehouseId, itemId, ...params } = {}) =>
    apiClient
      .get('/items/stock', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(warehouseId && { warehouse_id: warehouseId }),
          ...(itemId && { item_id: itemId }),
        },
      })
      .then((res) => ({
        data: res.data.data.map(fromBackendStock),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  listMovements: ({ pageSize, itemId, ...params } = {}) =>
    apiClient
      .get('/items/stock/movements', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(itemId && { item_id: itemId }),
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
