import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_ATTENDANCE = [
  { id: '1', employeeId: '3', date: '2026-07-10', shift: 'Day', checkIn: '09:58', checkOut: '18:32', lateEntry: false, earlyExit: false, overtimeHours: 0.5, totalHours: 8.5, status: 'present' },
  { id: '2', employeeId: '3', date: '2026-07-11', shift: 'Day', checkIn: '10:15', checkOut: '18:30', lateEntry: true, earlyExit: false, overtimeHours: 0, totalHours: 8, status: 'present' },
  { id: '3', employeeId: '5', date: '2026-07-11', shift: 'Day', checkIn: '10:00', checkOut: '18:00', lateEntry: false, earlyExit: false, overtimeHours: 0, totalHours: 8, status: 'present' },
  { id: '4', employeeId: '6', date: '2026-07-11', shift: 'Day', checkIn: '09:45', checkOut: '17:15', lateEntry: false, earlyExit: true, overtimeHours: 0, totalHours: 7.5, status: 'present' },
  { id: '5', employeeId: '7', date: '2026-07-11', shift: 'Day', checkIn: '', checkOut: '', lateEntry: false, earlyExit: false, overtimeHours: 0, totalHours: 0, status: 'on_leave' },
];

export const attendanceApi = createCrudApi('attendance', MOCK_ATTENDANCE);
