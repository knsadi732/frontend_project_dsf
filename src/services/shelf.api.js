import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_SHELVES = [
  { id: '1', rackId: '1', code: 'SHELF-01', capacity: 100, status: 'active' },
  { id: '2', rackId: '1', code: 'SHELF-02', capacity: 100, status: 'active' },
  { id: '3', rackId: '2', code: 'SHELF-01', capacity: 100, status: 'active' },
];

export const shelfApi = createCrudApi('shelves', MOCK_SHELVES);
