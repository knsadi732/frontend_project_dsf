import { createCrudApi } from '@/services/api/createCrudApi';

// Real backend exposes categories nested under /products/categories
// (product.routes.js), not a bare /categories resource.
export const categoryApi = createCrudApi('products/categories');
