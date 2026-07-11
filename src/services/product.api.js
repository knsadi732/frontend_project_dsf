import { createCrudApi } from '@/services/api/createCrudApi';
import { products } from '@/services/api/mockDb';

export const productApi = createCrudApi('products', products);
