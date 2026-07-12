import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';

let mockMovements = [];
let nextMovementId = 1;

export function addInventoryMovement({ productId, warehouse, movementType, quantity, reference }) {
  if (!env.mockAuth) return;
  mockMovements = [
    { id: String(nextMovementId++), productId, warehouse, movementType, quantity, reference, createdAt: new Date().toISOString() },
    ...mockMovements,
  ];
}

export const inventoryMovementApi = {
  list: (params) => {
    if (env.mockAuth) return Promise.resolve({ data: mockMovements, total: mockMovements.length });
    return apiClient.get('/inventory-movements', { params }).then((res) => res.data);
  },
};
