import { z } from 'zod';

export const shelfSchema = z.object({
  rackId: z.string().min(1, 'Rack is required'),
  code: z.string().min(1, 'Code is required'),
  capacity: z.coerce.number().nonnegative().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});
