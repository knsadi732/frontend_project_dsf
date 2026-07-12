import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_RACKS = [
  { id: '1', zoneId: '2', code: 'RACK-01', maxCapacity: 500, status: 'active' },
  { id: '2', zoneId: '2', code: 'RACK-02', maxCapacity: 500, status: 'active' },
  { id: '3', zoneId: '4', code: 'RACK-01', maxCapacity: 300, status: 'active' },
];

export const rackApi = createCrudApi('racks', MOCK_RACKS);
