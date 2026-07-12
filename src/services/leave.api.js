import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_LEAVES = [
  { id: '1', employeeId: '3', leaveType: 'casual', fromDate: '2026-07-20', toDate: '2026-07-21', reason: 'Family function', status: 'approved', appliedDate: '2026-07-05' },
  { id: '2', employeeId: '7', leaveType: 'sick', fromDate: '2026-07-11', toDate: '2026-07-12', reason: 'Fever', status: 'pending', appliedDate: '2026-07-10' },
  { id: '3', employeeId: '6', leaveType: 'earned', fromDate: '2026-08-01', toDate: '2026-08-05', reason: 'Personal travel', status: 'pending', appliedDate: '2026-07-11' },
];

export const leaveApi = createCrudApi('leaves', MOCK_LEAVES, { statusField: 'status' });
