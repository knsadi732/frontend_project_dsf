/**
 * Employee Create Flow (plan.md Chapter 9) generates the code after role/
 * department/designation are assigned, before the temporary password.
 */
export function generateEmployeeCode(existingEmployees) {
  const next = existingEmployees.reduce((max, employee) => {
    const match = /^EMP-(\d+)$/.exec(employee.employeeCode ?? '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;

  return `EMP-${String(next).padStart(4, '0')}`;
}

export function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
