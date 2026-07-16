import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_PRODUCTION_REQUESTS = [];

export const productionRequestApi = createCrudApi('productionRequests', MOCK_PRODUCTION_REQUESTS, { dateField: 'requiredDate' });
