import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_ASSETS = [
  { id: '1', employeeId: '1', assetType: 'laptop', assetName: 'Dell Latitude 5440', serialNumber: 'DL5440-001', assignedDate: '2024-01-05', returnedDate: '', status: 'assigned' },
  { id: '2', employeeId: '2', assetType: 'laptop', assetName: 'MacBook Air M2', serialNumber: 'MBA-M2-014', assignedDate: '2024-02-05', returnedDate: '', status: 'assigned' },
  { id: '3', employeeId: '3', assetType: 'mobile', assetName: 'Samsung Galaxy A54', serialNumber: 'SGA54-092', assignedDate: '2024-03-05', returnedDate: '', status: 'assigned' },
  { id: '4', employeeId: '3', assetType: 'id_card', assetName: 'Employee ID Card', serialNumber: 'ID-EMP0003', assignedDate: '2024-03-01', returnedDate: '', status: 'assigned' },
  { id: '5', employeeId: '4', assetType: 'sim_card', assetName: 'Company SIM', serialNumber: 'SIM-0004', assignedDate: '2024-04-01', returnedDate: '2026-06-01', status: 'returned' },
];

export const assetApi = createCrudApi('assets', MOCK_ASSETS);
