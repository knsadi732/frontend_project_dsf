import { z } from 'zod';

export const rackSchema = z.object({
  zoneId: z.string().min(1, 'Zone is required'),
  code: z.string().min(1, 'Code is required'),
  maxCapacity: z.coerce.number().nonnegative().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});
