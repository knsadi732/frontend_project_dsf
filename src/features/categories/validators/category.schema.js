import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryCode: z.string().min(1, 'Category code is required'),
  parentId: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});
