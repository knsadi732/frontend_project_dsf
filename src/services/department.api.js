import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_DEPARTMENTS = [
  { id: '1', name: 'Executive', status: 'active' },
  { id: '2', name: 'Sales', status: 'active' },
  { id: '3', name: 'Purchase', status: 'active' },
  { id: '4', name: 'Production', status: 'active' },
  { id: '5', name: 'Finance', status: 'active' },
  { id: '6', name: 'Warehouse', status: 'active' },
];

export const departmentApi = createCrudApi('departments', MOCK_DEPARTMENTS);
