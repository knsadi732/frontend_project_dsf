import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_LEAVES = [];

export const leaveApi = createCrudApi('leaves', MOCK_LEAVES, { statusField: 'status' });
