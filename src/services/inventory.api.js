import { createCrudApi } from '@/services/api/createCrudApi';
import { apiClient } from '@/services/api/axios';

export const inventoryApi = createCrudApi('inventory');

function toClientStock(row) {
  return {
    id: row.id,
    warehouseId: row.warehouse_id ?? row.warehouseId,
    productVariantId: row.product_variant_id ?? row.productVariantId,
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
  list: ({ pageSize, warehouseId, ...params } = {}) =>
    apiClient
      .get('/products/stock', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(warehouseId && { warehouse_id: warehouseId }),
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
};
