import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_PRODUCTION_REQUESTS = [
  {
    id: '1',
    prNumber: 'PPR-1001',
    productId: '2',
    quantity: 200,
    requiredDate: '2026-07-30',
    warehouseId: '1',
    priority: 'urgent',
    requestedBy: 'Priya Sharma',
    status: 'pending_approval',
    linkedWorkOrderId: null,
  },
];

export const productionRequestApi = createCrudApi('productionRequests', MOCK_PRODUCTION_REQUESTS, { dateField: 'requiredDate' });
