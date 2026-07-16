import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_ZONES = [];

export const warehouseZoneApi = createCrudApi('warehouseZones', MOCK_ZONES);
