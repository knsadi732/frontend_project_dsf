import { z } from 'zod';

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'half_day', label: 'Half day' },
  { value: 'on_leave', label: 'On leave' },
];

export const attendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  shift: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  lateEntry: z.boolean().default(false),
  earlyExit: z.boolean().default(false),
  overtimeHours: z.coerce.number().nonnegative().default(0),
  totalHours: z.coerce.number().nonnegative().default(0),
  status: z.enum(['present', 'absent', 'half_day', 'on_leave']).default('present'),
});
