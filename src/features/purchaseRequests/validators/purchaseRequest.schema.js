import { z } from 'zod';

export const PR_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted_to_po', label: 'Converted to PO' },
];

export const purchaseRequestItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
});

export const purchaseRequestSchema = z.object({
  prNumber: z.string().min(1, 'PR number is required'),
  departmentId: z.string().min(1, 'Department is required'),
  requestedBy: z.string().min(1, 'Requested by is required'),
  priority: z.enum(['low', 'normal', 'urgent']).default('normal'),
  requiredDate: z.string().min(1, 'Required date is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  items: z.array(purchaseRequestItemSchema).min(1, 'Add at least one item'),
  remarks: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'converted_to_po']).default('draft'),
});
