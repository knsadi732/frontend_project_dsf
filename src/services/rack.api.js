import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_RACKS = [];

export const rackApi = createCrudApi('racks', MOCK_RACKS);
