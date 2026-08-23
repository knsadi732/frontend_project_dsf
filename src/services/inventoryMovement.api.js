import { apiClient } from '@/services/api/axios';

// No-op kept only so the still-mock-era `mockDb.js` (imported transitively
// by the not-yet-rebuilt Returns module) keeps resolving this import —
// real movements are now recorded server-side by stock.service.js, never
// from the frontend. Safe to delete once Returns is rebuilt against a real
// backend and mockDb.js/businessRules.js are retired.
export function addInventoryMovement() {}

// Read-only stock movement audit trail (plan.md Ch10.8/Ch11 "Stock Ledger") —
// rows are written internally by stock.service.js's mutators (receive/
// reserve/dispatch/adjust), never via a client-callable create route.
function fromBackendMovement(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    warehouseId: row.warehouse_id,
    warehouseName: row.warehouse_name,
    productVariantId: row.product_variant_id,
    sku: row.sku,
    productName: row.product_name,
    reference: [row.sku, row.product_name].filter(Boolean).join(' — ') || row.product_variant_id,
    movementType: row.movement_type,
    quantityChange: Number(row.quantity_change ?? 0),
    quantityReservedChange: Number(row.quantity_reserved_change ?? 0),
    quantityOnHandAfter: row.quantity_on_hand_after != null ? Number(row.quantity_on_hand_after) : null,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    remarks: row.remarks,
  };
}

export const inventoryMovementApi = {
  list: ({ pageSize, warehouseId, productVariantId, movementType, ...params } = {}) =>
    apiClient
      .get('/inventory-movements', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(warehouseId && { warehouse_id: warehouseId }),
          ...(productVariantId && { product_variant_id: productVariantId }),
          ...(movementType && { movement_type: movementType }),
        },
      })
      .then((res) => ({
        data: res.data.data.map(fromBackendMovement),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
};
