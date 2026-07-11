import { createCrudApi } from '@/services/api/createCrudApi';
import { salesOrders } from '@/services/api/mockDb';
import { onSalesOrderStatusChange } from '@/services/api/businessRules';

export const salesApi = createCrudApi('sales', salesOrders, {
  dateField: 'orderDate',
  hooks: { afterUpdate: onSalesOrderStatusChange },
});
