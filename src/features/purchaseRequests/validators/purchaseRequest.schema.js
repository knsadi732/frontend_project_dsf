import { z } from 'zod';

// ApiList.md: PATCH /purchase-requests/:id/status only accepts
// approved/rejected — both terminal (a decided PR can't be re-decided,
// raise a new one instead). pending is the initial state assigned by the
// backend on create, never something the UI sets directly.
export const PR_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const purchaseRequestItemSchema = z.object({
  productVariantId: z.string().min(1, 'Product variant is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  remarks: z.string().optional(),
});

// Real backend body: { warehouseId, departmentId?, branchId?, remarks?,
// items: [{ productVariantId, quantity, remarks? }] } — confirmed against
// purchaseRequest.validator.js / purchase_request_items table.
export const purchaseRequestSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  items: z.array(purchaseRequestItemSchema).min(1, 'Add at least one item'),
  remarks: z.string().optional(),
});
