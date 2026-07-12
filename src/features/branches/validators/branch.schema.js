import { z } from 'zod';

export const branchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});
