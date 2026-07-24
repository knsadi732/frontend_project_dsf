import { z } from 'zod';

// Chapter-11.md §11.4 Purchase Request Status — the six-state workflow the
// Purchase & Procurement Domain defines (backend is being rebuilt against
// this chapter). RFQ isn't its own feature here yet, so "Converted to RFQ"
// is what a PR moves to once an approved request is actioned into a
// Purchase Order (see PurchasesPage.handleConvertToPo).
export const PR_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted_to_rfq', label: 'Converted to RFQ' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
];

// §11.4: items carry a Product reference (Business_Data_Model.md Ch.20 —
// Purchase always references the Product/Variant master) and a quantity;
// remarks is per Chapter-11's general "Remarks" field, kept per-item since
// an item-level note (e.g. "match existing brand") is common in practice.
export const purchaseRequestItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  remarks: z.string().optional(),
});

// §11.4 Purchase Request Information: PR Number, Request Date, Requested
// By, Department, Priority, Required Date, Warehouse, Items, Remarks,
// Status.
export const purchaseRequestSchema = z.object({
  prNumber: z.string().min(1, 'PR number is required'),
  requestDate: z.string().min(1, 'Request date is required'),
  requestedBy: z.string().min(1, 'Requested by is required'),
  departmentId: z.string().min(1, 'Department is required'),
  priority: z.enum(['low', 'normal', 'urgent']).default('normal'),
  requiredDate: z.string().min(1, 'Required date is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  items: z.array(purchaseRequestItemSchema).min(1, 'Add at least one item'),
  remarks: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'converted_to_rfq']).default('draft'),
});
