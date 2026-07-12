import { z } from 'zod';

export const ASSET_TYPE_OPTIONS = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile phone' },
  { value: 'sim_card', label: 'SIM card' },
  { value: 'id_card', label: 'ID card' },
  { value: 'biometric_device', label: 'Biometric device' },
  { value: 'vehicle', label: 'Company vehicle' },
];

export const assetSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  assetType: z.enum(['laptop', 'desktop', 'mobile', 'sim_card', 'id_card', 'biometric_device', 'vehicle']).default('laptop'),
  assetName: z.string().min(1, 'Asset name is required'),
  serialNumber: z.string().optional(),
  assignedDate: z.string().optional(),
  returnedDate: z.string().optional(),
  status: z.enum(['assigned', 'returned']).default('assigned'),
});
