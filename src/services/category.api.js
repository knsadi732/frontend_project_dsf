import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Footwear', categoryCode: 'FOOTWEAR', status: 'active' },
];

export const categoryApi = createCrudApi('categories', MOCK_CATEGORIES);
