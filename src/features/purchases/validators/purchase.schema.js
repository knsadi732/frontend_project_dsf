import { z } from 'zod';

// Backend's purchase order pipeline (purchaseOrder.service.js /
// PURCHASE_ORDER_STATUS_PIPELINE) — draft -> approved -> ordered ->
// received (stock is added to on-hand here) -> completed. Strictly
// sequential; a status may only advance to the very next step
// (utils/stateMachine.js assertTransition), never skip ahead.
export const PURCHASE_ORDER_STATUS_PIPELINE = ['draft', 'approved', 'ordered', 'received', 'completed'];

// Static purchase-type list for the item row's "Product Type" filter — not
// fetched from the Categories API. Each label is matched by name (case
// insensitive) against the real product_categories the company has set up,
// to resolve which category's products to show; a type with no matching
// category yet just shows an empty product list until one is created.
export const PRODUCT_TYPE_OPTIONS = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'packaging_material', label: 'Packaging Material' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'stores_item', label: 'Stores Item' },
  { value: 'spare_parts', label: 'Spare Parts' },
  { value: 'tool_and_die', label: 'Tool & Die' },
  { value: 'machinery_and_equipment', label: 'Machinery & Equipment' },
  { value: 'fixed_asset', label: 'Fixed Asset' },
  { value: 'civil_material', label: 'Civil Material' },
  { value: 'electrical_material', label: 'Electrical Material' },
  { value: 'instrumentation_material', label: 'Instrumentation Material' },
  { value: 'safety_material', label: 'Safety Material' },
  { value: 'office_stationery', label: 'Office Stationery' },
  { value: 'it_hardware', label: 'IT Hardware' },
  { value: 'it_software_license', label: 'IT Software / License' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'vehicle_spare_parts', label: 'Vehicle Spare Parts' },
  { value: 'fuel_and_lubricants', label: 'Fuel & Lubricants' },
  { value: 'service', label: 'Service' },
  { value: 'utility', label: 'Utility' },
  { value: 'professional_service', label: 'Professional Service' },
  { value: 'contract_job_work', label: 'Contract / Job Work' },
  { value: 'marketing_and_branding', label: 'Marketing & Branding' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'employee_welfare', label: 'Employee Welfare' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
];

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
});

export const purchaseSchema = z.object({
  poNumber: z.string().min(1, 'PO number is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(PURCHASE_ORDER_STATUS_PIPELINE).default('draft'),
  items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
});
