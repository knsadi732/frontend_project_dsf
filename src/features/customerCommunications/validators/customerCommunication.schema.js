import { z } from 'zod';

export const COMMUNICATION_CHANNEL_OPTIONS = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'note', label: 'Support Note' },
];

export const customerCommunicationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  channel: z.enum(['call', 'email', 'sms', 'whatsapp', 'note']).default('call'),
  notes: z.string().min(1, 'Notes are required'),
  contactedBy: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});
