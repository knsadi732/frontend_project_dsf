import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_PURCHASE_REQUESTS = [
  {
    id: '1',
    prNumber: 'PR-1001',
    departmentId: '3',
    requestedBy: 'Vikram Mehta',
    priority: 'normal',
    requiredDate: '2026-07-25',
    warehouseId: '1',
    items: [{ product: 'Finished Leather - Full Grain (sq ft)', quantity: 400 }],
    remarks: 'Stock running low for upcoming production run',
    status: 'pending_approval',
    linkedPurchaseOrderId: null,
  },
];

export const purchaseRequestApi = createCrudApi('purchaseRequests', MOCK_PURCHASE_REQUESTS, { dateField: 'requiredDate' });
