import { z } from 'zod';

export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'retail', label: 'Retail (B2C)' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'dealer', label: 'Dealer' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'marketplace', label: 'Online marketplace' },
];

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  customerType: z.enum(['retail', 'wholesale', 'distributor', 'dealer', 'corporate', 'franchise', 'marketplace']).default('retail'),
  companyName: z.string().optional(),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  gstNumber: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  creditDays: z.coerce.number().int().nonnegative().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});
