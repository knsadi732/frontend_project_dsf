import { apiClient } from '@/services/api/axios';

// No backend route exists for inventory movements yet (not in
// backend_project_dsf/src/routes) — list() will 404 until the backend adds
// a /inventory-movements service. addInventoryMovement is a no-op kept so
// existing call sites (businessRules.js) don't need to change.
export function addInventoryMovement() {}

export const inventoryMovementApi = {
  list: (params) => apiClient.get('/inventory-movements', { params }).then((res) => res.data),
};
