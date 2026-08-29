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

// Exactly one of productVariantId (sellable Product) / itemId (Item &
// Material Master — raw material, packaging, consumable, spare, tool,
// service) — mirrors the backend's xor validation.
export const purchaseRequestItemSchema = z
  .object({
    productVariantId: z.string().optional(),
    itemId: z.string().optional(),
    quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
    remarks: z.string().optional(),
  })
  .refine((item) => Boolean(item.productVariantId) !== Boolean(item.itemId), {
    message: 'Select a product variant or an item',
    path: ['productVariantId'],
  });

// Real backend body: { warehouseId, departmentId?, branchId?, priority?,
// requiredDate?, remarks?, items: [{ productVariantId | itemId, quantity, remarks? }] }
// — confirmed against purchaseRequest.validator.js / purchase_request_items table.
export const purchaseRequestSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  requiredDate: z.string().optional(),
  items: z.array(purchaseRequestItemSchema).min(1, 'Add at least one item'),
  remarks: z.string().optional(),
});
