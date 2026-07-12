import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_BINS = [
  { id: '1', shelfId: '1', code: 'BIN-01', capacity: 50, currentQuantity: 30, status: 'active' },
  { id: '2', shelfId: '1', code: 'BIN-02', capacity: 50, currentQuantity: 10, status: 'active' },
  { id: '3', shelfId: '2', code: 'BIN-01', capacity: 50, currentQuantity: 0, status: 'active' },
];

export const binApi = createCrudApi('bins', MOCK_BINS);
