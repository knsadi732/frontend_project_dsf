import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  cin: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  financialYearStart: z.string().optional(),
  financialYearEnd: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});
