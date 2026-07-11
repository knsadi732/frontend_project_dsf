import { createCrudApi } from '@/services/api/createCrudApi';
import { purchases } from '@/services/api/mockDb';
import { onPurchaseOrderStatusChange } from '@/services/api/businessRules';

export const purchaseApi = createCrudApi('purchases', purchases, {
  dateField: 'orderDate',
  hooks: { afterUpdate: onPurchaseOrderStatusChange },
});
