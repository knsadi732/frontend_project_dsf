import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_SHELVES = [];

export const shelfApi = createCrudApi('shelves', MOCK_SHELVES);
