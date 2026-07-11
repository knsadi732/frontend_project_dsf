import { createCrudApi } from '@/services/api/createCrudApi';
import { invoices } from '@/services/api/mockDb';

export const financeApi = createCrudApi('finance', invoices, { dateField: 'dueDate' });
