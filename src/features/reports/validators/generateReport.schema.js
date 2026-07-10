import { z } from 'zod';

export const generateReportSchema = z.object({
  type: z.enum(['sales', 'inventory', 'finance', 'production']),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
});
