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
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  remarks: z.string().optional(),
});

// ApiList.md POST /purchase-requests body: { warehouseId, departmentId?,
// branchId?, remarks?, items: [{ productId, quantity, remarks? }] }.
export const purchaseRequestSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  items: z.array(purchaseRequestItemSchema).min(1, 'Add at least one item'),
  remarks: z.string().optional(),
});
