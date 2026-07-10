import { z } from 'zod';
import { ROLES } from '@/constants/roles';

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(Object.values(ROLES)).default('STAFF'),
  status: z.enum(['active', 'inactive']).default('active'),
});
