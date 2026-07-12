import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_ZONES = [
  { id: '1', warehouseId: '1', name: 'Receiving Zone', zoneType: 'receiving', status: 'active' },
  { id: '2', warehouseId: '1', name: 'Storage Zone', zoneType: 'storage', status: 'active' },
  { id: '3', warehouseId: '1', name: 'Dispatch Zone', zoneType: 'dispatch', status: 'active' },
  { id: '4', warehouseId: '2', name: 'Storage Zone', zoneType: 'storage', status: 'active' },
];

export const warehouseZoneApi = createCrudApi('warehouseZones', MOCK_ZONES);
