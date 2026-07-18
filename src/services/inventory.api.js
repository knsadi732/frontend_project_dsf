import { createCrudApi } from '@/services/api/createCrudApi';
import { apiClient } from '@/services/api/axios';

export const inventoryApi = createCrudApi('inventory');

// Real backend exposes stock under /products/stock (product.routes.js),
// separate from the /inventory resource above.
export const productStockApi = {
  list: (params) =>
    apiClient.get('/products/stock', { params }).then((res) => ({
      data: res.data.data,
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  receive: ({ warehouseId, productId, quantity }) =>
    apiClient.post('/products/stock/receive', { warehouseId, productId, quantity }).then((res) => res.data.data),
};
