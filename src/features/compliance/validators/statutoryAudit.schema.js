import { z } from 'zod';

export const statutoryAuditSchema = z.object({
  auditorName: z.string().min(1, 'Auditor name is required'),
  conductedAt: z.string().min(1, 'Conducted date is required'),
  findings: z.string().optional(),
  remarks: z.string().optional(),
});
