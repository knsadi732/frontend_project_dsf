import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_BINS = [];

export const binApi = createCrudApi('bins', MOCK_BINS);
