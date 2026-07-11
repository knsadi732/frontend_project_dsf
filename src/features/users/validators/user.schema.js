import { z } from 'zod';
import { ROLES } from '@/constants/roles';
import { EMPLOYMENT_STATUS } from '@/constants/statusEnums';

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  role: z.enum(Object.values(ROLES)).default('EMPLOYEE'),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  branchId: z.string().optional(),
  warehouseId: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentStatus: z.enum(Object.values(EMPLOYMENT_STATUS)).default('probation'),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  salaryStructure: z.string().optional(),
  address: z.string().optional(),
});
