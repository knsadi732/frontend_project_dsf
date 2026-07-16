import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_BRANDS = [
  { id: '1', name: 'DSF House Brand', country: 'India', status: 'active' },
];

export const brandApi = createCrudApi('brands', MOCK_BRANDS);
