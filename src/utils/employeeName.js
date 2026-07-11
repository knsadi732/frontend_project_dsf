export function getEmployeeFullName(employee) {
  if (!employee) return '';
  return [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' ');
}
