import { z } from 'zod';

export const designationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});
