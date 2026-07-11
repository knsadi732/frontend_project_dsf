import { createCrudApi } from '@/services/api/createCrudApi';
import { salesOrders } from '@/services/api/mockDb';
import { onSalesOrderCreate, onSalesOrderStatusChange } from '@/services/api/businessRules';

export const salesApi = createCrudApi('sales', salesOrders, {
  dateField: 'orderDate',
  hooks: { afterCreate: onSalesOrderCreate, afterUpdate: onSalesOrderStatusChange },
});
