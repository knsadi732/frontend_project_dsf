import { z } from 'zod';

export const addFundSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});
