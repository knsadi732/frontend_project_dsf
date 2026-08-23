import { z } from 'zod';

export const fundingSourceSchema = z.object({
  partyName: z.string().min(1, 'Name is required'),
  partyType: z.enum(['individual', 'bank', 'vendor', 'other']).default('individual'),
  defaultFundingType: z.enum(['advance', 'loan', 'equity', 'other']).default('advance'),
  contactInfo: z.string().optional(),
});
