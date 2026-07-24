import { apiClient } from '@/services/api/axios';
import { createCrudApi } from '@/services/api/createCrudApi';

// Backend is being rebuilt against Chapter-11.md (Purchase & Procurement
// Domain) — §11.4 Purchase Request Information: PR Number, Request Date,
// Requested By, Department, Priority, Required Date, Warehouse, Items,
// Remarks, Status. Full CRUD (a Draft PR should be editable/deletable
// before it's submitted for approval), same pattern as every other
// services/*.api.js resource.
export const purchaseRequestApi = {
  ...createCrudApi('purchase-requests'),
  // Mirrors purchase-orders' generate-number endpoint (ApiList.md) — reserves
  // and returns the next PR number so it can be shown before save.
  generateNumber: () => apiClient.get('/purchase-requests/generate-number').then((res) => res.data.data.prNumber),
};
