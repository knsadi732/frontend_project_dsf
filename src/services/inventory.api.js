import { createCrudApi } from '@/services/api/createCrudApi';
import { inventory } from '@/services/api/mockDb';

export const inventoryApi = createCrudApi('inventory', inventory);
