import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_WAREHOUSES = [
  { id: '1', name: 'Meerut Main Warehouse', branchId: '1', status: 'active' },
  { id: '2', name: 'Delhi Warehouse', branchId: '2', status: 'active' },
];

export const warehouseApi = createCrudApi('warehouses', MOCK_WAREHOUSES);
