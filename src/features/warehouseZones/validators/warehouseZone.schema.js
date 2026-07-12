import { z } from 'zod';

export const ZONE_TYPE_OPTIONS = [
  { value: 'receiving', label: 'Receiving' },
  { value: 'storage', label: 'Storage' },
  { value: 'production', label: 'Production' },
  { value: 'packing', label: 'Packing' },
  { value: 'dispatch', label: 'Dispatch' },
  { value: 'return', label: 'Return' },
  { value: 'damage', label: 'Damage' },
];

export const warehouseZoneSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  name: z.string().min(1, 'Name is required'),
  zoneType: z.enum(['receiving', 'storage', 'production', 'packing', 'dispatch', 'return', 'damage']).default('storage'),
  status: z.enum(['active', 'inactive']).default('active'),
});
