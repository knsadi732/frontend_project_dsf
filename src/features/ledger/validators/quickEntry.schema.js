import { z } from 'zod';

// Mirrors backend finance.validator.js's quickEntry Joi schema — one
// spreadsheet-shaped entry point covering the owner's manual ledger columns
// (Nature, Credit/Debit, Category, Purpose, Fund Source, Paid By, Payment
// Mode, Invoice/Order ID, Party, GST).
export const quickEntrySchema = z
  .object({
    transactionNature: z.enum(['expense', 'sale', 'manual']),
    transactionDate: z.string().min(1, 'Date is required'),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    direction: z.enum(['debit', 'credit', '']).optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    partyName: z.string().optional(),
    utrReference: z.string().optional(),
    paymentMode: z.enum(['', 'cash', 'upi', 'card', 'bank_transfer', 'cheque', 'credit_card']).optional(),
    fundingSourceId: z.string().optional(),
    fundingType: z.enum(['', 'advance', 'loan', 'equity', 'other']).optional(),
    paidReceivedBy: z.string().optional(),
    gstApplicable: z.boolean().optional(),
    gstAmount: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
    gstTaxableValue: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
    gstPartyType: z.enum(['', 'b2b', 'b2c']).optional(),
  })
  .refine((data) => data.transactionNature !== 'manual' || data.direction, {
    message: 'Direction is required for a manual entry',
    path: ['direction'],
  });
