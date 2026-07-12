import { z } from 'zod';

export const LEAVE_TYPE_OPTIONS = [
  { value: 'casual', label: 'Casual leave' },
  { value: 'sick', label: 'Sick leave' },
  { value: 'earned', label: 'Earned leave' },
  { value: 'paid', label: 'Paid leave' },
  { value: 'unpaid', label: 'Unpaid leave' },
  { value: 'maternity_paternity', label: 'Maternity / Paternity leave' },
  { value: 'emergency', label: 'Emergency leave' },
];

export const LEAVE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const leaveSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  leaveType: z.enum(['casual', 'sick', 'earned', 'paid', 'unpaid', 'maternity_paternity', 'emergency']).default('casual'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  reason: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  appliedDate: z.string().optional(),
});
