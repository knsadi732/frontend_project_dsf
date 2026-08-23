import { apiClient } from '@/services/api/axios';

// Fixed Asset Register (Chapter 13) — deliberately its own service, not
// createCrudApi('fixed-assets') verbatim: create/list/get all need
// snake_case <-> camelCase translation, and several actions (reassign,
// maintenance, dispose) aren't plain CRUD. Never confuse this with
// src/services/asset.api.js, which is the unrelated, stale employee-assigned
// "assets" feature (see AppRoutes.jsx comment for that module).

function fromBackendAssignment(row) {
  return {
    ...row,
    branchId: row.branch_id,
    warehouseId: row.warehouse_id,
    custodianUserId: row.custodian_user_id,
    custodianName: row.custodian_name,
    locationNote: row.location_note,
    assignedAt: row.assigned_at,
  };
}

function fromBackendAsset(row) {
  return {
    ...row,
    assetTag: row.asset_tag,
    assetName: row.asset_name,
    itemId: row.item_id,
    itemName: row.item_name,
    itemCode: row.item_code,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    serialNumber: row.serial_number,
    purchaseDate: row.purchase_date,
    purchaseCost: row.purchase_cost != null ? Number(row.purchase_cost) : null,
    warrantyExpiry: row.warranty_expiry,
    branchId: row.branch_id,
    branchName: row.branch_name,
    warehouseId: row.warehouse_id,
    warehouseName: row.warehouse_name,
    custodianUserId: row.custodian_user_id,
    custodianName: row.custodian_name,
    locationNote: row.location_note,
    depreciationMethod: row.depreciation_method,
    usefulLifeYears: row.useful_life_years != null ? Number(row.useful_life_years) : null,
    salvageValue: row.salvage_value != null ? Number(row.salvage_value) : null,
    accumulatedDepreciation: row.accumulated_depreciation != null ? Number(row.accumulated_depreciation) : 0,
    netBookValue: row.net_book_value != null ? Number(row.net_book_value) : null,
    disposalType: row.disposal_type,
    disposalDate: row.disposal_date,
    disposalValue: row.disposal_value != null ? Number(row.disposal_value) : null,
    assignments: Array.isArray(row.assignments) ? row.assignments.map(fromBackendAssignment) : undefined,
  };
}

function fromBackendMaintenanceLog(row) {
  return {
    ...row,
    assetId: row.asset_id,
    assetName: row.asset_name,
    assetTag: row.asset_tag,
    maintenanceType: row.maintenance_type,
    maintenanceDate: row.maintenance_date,
    vendorName: row.vendor_name,
    cost: row.cost != null ? Number(row.cost) : null,
    downtimeHours: row.downtime_hours != null ? Number(row.downtime_hours) : null,
    nextScheduledDate: row.next_scheduled_date,
    createdAt: row.created_at,
  };
}

export const fixedAssetApi = {
  list: ({ pageSize, status, itemCategoryId, ...params } = {}) =>
    apiClient
      .get('/fixed-assets', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(status && { status }),
          ...(itemCategoryId && { item_category_id: itemCategoryId }),
        },
      })
      .then((res) => ({
        data: res.data.data.map(fromBackendAsset),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  get: (id) => apiClient.get(`/fixed-assets/${id}`).then((res) => fromBackendAsset(res.data.data)),
  // "Register Asset" — purchaseCost posts as a Finance expense in the same
  // call, so the response carries both the asset and the (optional) expense.
  create: (payload) =>
    apiClient.post('/fixed-assets', payload).then((res) => ({
      asset: fromBackendAsset(res.data.data.asset),
      expense: res.data.data.expense,
    })),
  // Creates a new assignment history entry and updates current location/custodian.
  reassign: (id, payload) => apiClient.patch(`/fixed-assets/${id}/reassign`, payload).then((res) => fromBackendAsset(res.data.data)),
  // Expense posted only when `cost` is given.
  addMaintenance: (id, payload) =>
    apiClient.post(`/fixed-assets/${id}/maintenance`, payload).then((res) => ({
      log: fromBackendMaintenanceLog(res.data.data.log),
      expense: res.data.data.expense,
    })),
  listMaintenanceLogs: ({ pageSize, assetId, ...params } = {}) =>
    apiClient
      .get('/fixed-assets/maintenance-logs', {
        params: {
          ...params,
          ...(pageSize !== undefined && { limit: pageSize }),
          ...(assetId && { asset_id: assetId }),
        },
      })
      .then((res) => ({
        data: res.data.data.map(fromBackendMaintenanceLog),
        total: res.data.meta?.total_records ?? res.data.data.length,
      })),
  // Permanently closes the asset (status -> 'disposed'); row is never deleted.
  dispose: (id, payload) => apiClient.post(`/fixed-assets/${id}/dispose`, payload).then((res) => fromBackendAsset(res.data.data)),
};
