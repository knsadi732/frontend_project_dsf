import { z } from 'zod';

export const VENDOR_TYPE_OPTIONS = [
  { value: 'raw_material', label: 'Raw material supplier' },
  { value: 'finished_goods', label: 'Finished goods supplier' },
  { value: 'packaging', label: 'Packaging material supplier' },
  { value: 'machinery', label: 'Machinery supplier' },
  { value: 'service', label: 'Service provider' },
  { value: 'transport', label: 'Transport vendor' },
  { value: 'logistics', label: 'Logistics partner' },
  { value: 'maintenance', label: 'Maintenance contractor' },
];

export const VENDOR_ADDRESS_TYPE_OPTIONS = [
  { value: 'registered_office', label: 'Registered office' },
  { value: 'factory', label: 'Factory' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'billing', label: 'Billing' },
  { value: 'shipping', label: 'Shipping' },
];

export const vendorAddressSchema = z.object({
  type: z.enum(['registered_office', 'factory', 'warehouse', 'billing', 'shipping']).default('registered_office'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  addressLine: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  vendorType: z.enum(['raw_material', 'finished_goods', 'packaging', 'machinery', 'service', 'transport', 'logistics', 'maintenance']).default('raw_material'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  creditDays: z.coerce.number().int().nonnegative().optional(),
  addresses: z.array(vendorAddressSchema).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
});
