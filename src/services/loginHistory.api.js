import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_LOGIN_HISTORY = [
  { id: '1', userId: '1', loginAt: '2026-07-11T09:02:00', device: 'Chrome on Windows', ip: '49.36.12.5', status: 'success' },
  { id: '2', userId: '1', loginAt: '2026-07-10T18:41:00', device: 'Chrome on Windows', ip: '49.36.12.5', status: 'success' },
  { id: '3', userId: '1', loginAt: '2026-07-09T08:15:00', device: 'Safari on iPhone', ip: '106.51.20.9', status: 'success' },
  { id: '4', userId: '2', loginAt: '2026-07-11T08:30:00', device: 'Edge on Windows', ip: '103.22.14.3', status: 'success' },
  { id: '5', userId: '3', loginAt: '2026-07-08T11:05:00', device: 'Chrome on Android', ip: '117.98.4.21', status: 'failed' },
];

export const loginHistoryApi = createCrudApi('login-history', MOCK_LOGIN_HISTORY);
