import { z } from 'zod';

// Real backend body for POST /vendor-bills/:id/payment (vendorBill.validator.js
// recordPayment) — utrNumber is required, not optional, since every payment
// needs a bank reference for reconciliation.
export const vendorPaymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  utrNumber: z.string().min(1, 'UTR / transaction number is required').max(100),
});
