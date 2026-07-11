import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_DESIGNATIONS = [
  { id: '1', title: 'CEO', departmentId: '1', status: 'active' },
  { id: '2', title: 'Admin Manager', departmentId: '1', status: 'active' },
  { id: '3', title: 'Sales Manager', departmentId: '2', status: 'active' },
  { id: '4', title: 'Purchase Executive', departmentId: '3', status: 'active' },
  { id: '5', title: 'Production Supervisor', departmentId: '4', status: 'active' },
  { id: '6', title: 'Accountant', departmentId: '5', status: 'active' },
  { id: '7', title: 'Warehouse Staff', departmentId: '6', status: 'active' },
];

export const designationApi = createCrudApi('designations', MOCK_DESIGNATIONS);
