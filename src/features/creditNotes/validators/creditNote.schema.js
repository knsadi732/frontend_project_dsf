import { z } from 'zod';

export const creditNoteSchema = z.object({
  creditNoteNumber: z.string().min(1, 'Credit note number is required'),
  invoiceId: z.string().optional(),
  customer: z.string().min(1, 'Customer is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  gstAmount: z.coerce.number().nonnegative().default(0),
  createdDate: z.string().min(1, 'Date is required'),
});
