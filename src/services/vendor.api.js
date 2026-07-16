import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_VENDORS = [];

export const vendorApi = createCrudApi('vendors', MOCK_VENDORS);
