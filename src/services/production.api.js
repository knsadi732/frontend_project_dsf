import { createCrudApi } from '@/services/api/createCrudApi';
import { workOrders } from '@/services/api/mockDb';
import { onWorkOrderStageChange } from '@/services/api/businessRules';

export const productionApi = createCrudApi('production', workOrders, {
  statusField: 'stage',
  dateField: 'dueDate',
  hooks: { afterUpdate: onWorkOrderStageChange },
});
