import { z } from 'zod';

export const PRODUCTION_REQUEST_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted_to_production_order', label: 'Converted to work order' },
];

export const productionRequestSchema = z.object({
  prNumber: z.string().min(1, 'PR number is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  requiredDate: z.string().min(1, 'Required date is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  priority: z.enum(['low', 'normal', 'urgent']).default('normal'),
  requestedBy: z.string().min(1, 'Requested by is required'),
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'converted_to_production_order']).default('draft'),
});
