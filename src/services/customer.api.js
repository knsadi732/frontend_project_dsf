import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_CUSTOMERS = [];

export const customerApi = createCrudApi('customers', MOCK_CUSTOMERS);
