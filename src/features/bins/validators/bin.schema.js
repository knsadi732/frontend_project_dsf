import { z } from 'zod';

export const binSchema = z.object({
  shelfId: z.string().min(1, 'Shelf is required'),
  code: z.string().min(1, 'Code is required'),
  capacity: z.coerce.number().nonnegative().default(0),
  currentQuantity: z.coerce.number().nonnegative().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});
