import { z } from 'zod';

export const loanEsignRequestSchema = z.object({
  partyName: z.string().min(1, 'Party name is required'),
  email: z.string().email('Enter a valid email'),
  loanAmount: z.coerce.number().positive('Loan amount must be greater than 0'),
  interestRatePercent: z.coerce.number().nonnegative('Interest rate cannot be negative'),
  termsNote: z.string().optional(),
});
