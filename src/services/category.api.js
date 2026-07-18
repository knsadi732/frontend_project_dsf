import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Footwear', categoryCode: 'FOOTWEAR', status: 'active' },
];

// Real backend exposes categories nested under /products/categories
// (product.routes.js), not a bare /categories resource.
export const categoryApi = createCrudApi('products/categories', MOCK_CATEGORIES);
