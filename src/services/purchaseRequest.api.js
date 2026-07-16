import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_PURCHASE_REQUESTS = [];

export const purchaseRequestApi = createCrudApi('purchaseRequests', MOCK_PURCHASE_REQUESTS, { dateField: 'requiredDate' });
