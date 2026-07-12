import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  branchId: z.string().min(1, 'Branch is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});
