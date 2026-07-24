import { z } from 'zod';

export const LOAN_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'written_off', label: 'Written off' },
];

export const LENDER_TYPE_OPTIONS = [
  { value: 'bank', label: 'Bank' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'other', label: 'Other' },
];

export const INTEREST_TYPE_OPTIONS = [
  { value: 'flat', label: 'Flat' },
  { value: 'reducing', label: 'Reducing balance' },
];

export const loanSchema = z.object({
  lenderName: z.string().min(1, 'Lender name is required'),
  lenderType: z.enum(['bank', 'vendor', 'other']).default('bank'),
  principalAmount: z.coerce.number().positive('Principal amount must be greater than 0'),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative').max(100, 'Interest rate cannot exceed 100%').default(0),
  interestType: z.enum(['flat', 'reducing']).default('flat'),
  startDate: z.string().min(1, 'Start date is required'),
  tenureMonths: z.coerce.number().int().positive().optional().or(z.literal('')),
  remarks: z.string().optional(),
});

// principalComponent must be between 0 and amount — server enforces this
// too (loan.validator.js), checked here so the form catches it before a
// round trip.
export const repaymentSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    principalComponent: z.coerce.number().min(0, 'Cannot be negative'),
    paidAt: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine((values) => values.principalComponent <= values.amount, {
    message: 'Principal component cannot exceed the total amount',
    path: ['principalComponent'],
  });
