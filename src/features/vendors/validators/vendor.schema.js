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

// Matches the real backend shape exactly (party.validator.js: `addresses:
// [{ label?, address (required) }]`) — a JSONB array, not a rich structured
// address record. Sending the previous richer shape (type/contactPerson/
// city/state/postalCode) had no `address` key, so it would fail the
// backend's `address: required()` validation on save.
export const vendorAddressSchema = z.object({
  label: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
});

export const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  vendorType: z.enum(['raw_material', 'finished_goods', 'packaging', 'machinery', 'service', 'transport', 'logistics', 'maintenance']).default('raw_material'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  creditDays: z.coerce.number().int().nonnegative().optional(),
  addresses: z.array(vendorAddressSchema).default([]),
  qualityRating: z.coerce.number().min(1).max(5).default(3),
  status: z.enum(['active', 'inactive']).default('active'),
});
