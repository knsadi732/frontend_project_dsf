import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_BRANCHES = [
  { id: '1', name: 'Meerut HQ', status: 'active' },
  { id: '2', name: 'Delhi Branch', status: 'active' },
];

export const branchApi = createCrudApi('branches', MOCK_BRANCHES);
