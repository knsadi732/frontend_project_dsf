import { z } from 'zod';
import { EMPLOYMENT_STATUS } from '@/constants/statusEnums';

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
  // Only shown/used on create (UserFormModal) — left blank and defaulted to
  // '123456' by UsersPage if HR doesn't set one; not present at all when
  // editing an existing employee.
  password: z.union([z.string().min(6, 'Password must be at least 6 characters'), z.literal('')]).optional(),
  confirmPassword: z.string().optional(),
  // Real role GUIDs from GET /roles (see UsersPage's useRolesQuery) — not a
  // fixed enum, since roles are seeded per-tenant on the backend.
  primaryRole: z.string().min(1, 'Role is required'),
  additionalRoles: z.array(z.string()).default([]),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  branchId: z.string().optional(),
  warehouseId: z.string().optional(),
  reportingManagerId: z.string().optional(),
  joiningDate: z.string().optional(),
  employmentStatus: z.enum(Object.values(EMPLOYMENT_STATUS)).default('probation'),
  dob: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  drivingLicense: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  upiId: z.string().optional(),
  salaryStructure: z.string().optional(),
  permanentAddress: z.string().optional(),
  currentAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
