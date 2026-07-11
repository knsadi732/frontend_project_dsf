import { createCrudApi } from '@/services/api/createCrudApi';
import { returns } from '@/services/api/mockDb';
import { onReturnStatusChange } from '@/services/api/businessRules';

export const returnsApi = createCrudApi('returns', returns, {
  dateField: 'createdDate',
  hooks: { afterUpdate: onReturnStatusChange },
});
