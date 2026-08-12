import { createCrudApi } from '@/services/api/createCrudApi';
import { apiClient } from '@/services/api/axios';

export const inventoryApi = createCrudApi('inventory');

// GET /products/stock joins variant/product/category/warehouse (stock.repository.js
// listByWarehouse) so the list already carries names — no need to resolve
// productVariantId/warehouseId against separate list endpoints for display.
function toClientStock(row) {
  return {
    id: row.id,
    warehouseId: row.warehouse_id ?? row.warehouseId,
    warehouseName: row.warehouse_name ?? row.warehouseName,
    productVariantId: row.product_variant_id ?? row.productVariantId,
    sku: row.variant_sku ?? row.sku,
    variantSize: row.variant_size ?? row.variantSize,
    variantColor: row.variant_color ?? row.variantColor,
    productName: row.product_name ?? row.productName,
    categoryName: row.category_name ?? row.categoryName,
    productType: row.product_type ?? row.productType,
    isSellable: row.is_sellable ?? row.isSellable,
    // 'salable' | 'office_consumable' | 'raw_material' — see
    // stock.repository.js's INVENTORY_CATEGORY_CASE for the derivation.
    inventoryCategory: row.inventory_category ?? row.inventoryCategory,
    quantityOnHand: Number(row.quantity_on_hand ?? row.quantityOnHand ?? 0),
    quantityReserved: Number(row.quantity_reserved ?? row.quantityReserved ?? 0),
    status: row.status,
    remarks: row.remarks,
  };
}

// Real backend exposes stock under GET /products/stock (product.routes.js,
// requirePermission('product.manage')), separate from the /inventory
// resource above. Pagination params are `page`/`limit` (parsePagination),
// and the warehouse filter is read directly off req.query.warehouse_id
// (snake_case) rather than through the pagination middleware — so it needs
// translating here same as `pageSize` -> `limit`.
export const productStockApi = {
  list: ({ pageSize, warehouseId, inventoryCategory, ...params } = {}) =>
    apiClient
      .get('/products/stock', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(warehouseId && { warehouse_id: warehouseId }),
          ...(inventoryCategory && { inventory_category: inventoryCategory }),
        },
      })
      .then((res) => ({
        data: res.data.data.map(toClientStock),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  receive: ({ warehouseId, productVariantId, quantity }) =>
    apiClient
      .post('/products/stock/receive', { warehouseId, productVariantId, quantity })
      .then((res) => toClientStock(res.data.data)),
  // { inventory_category, sku_count, total_on_hand, total_reserved }[] — one
  // row per Salable / Office Consumable / Raw Material bucket.
  summary: ({ warehouseId } = {}) =>
    apiClient
      .get('/products/stock/summary', { params: { ...(warehouseId && { warehouse_id: warehouseId }) } })
      .then((res) => res.data.data),
};
