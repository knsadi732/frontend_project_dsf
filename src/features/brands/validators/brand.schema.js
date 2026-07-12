import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  country: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});
