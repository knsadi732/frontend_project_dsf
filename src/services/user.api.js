import { createCrudApi } from '@/services/api/createCrudApi';
import { generateEmployeeCode, generateTempPassword } from '@/utils/generateEmployeeCode';
import { addNotification } from '@/services/notification.api';
import { getEmployeeFullName } from '@/utils/employeeName';

const MOCK_USERS = [
  {
    id: '1',
    employeeCode: 'EMP-0001',
    firstName: 'Ronak',
    middleName: '',
    lastName: 'Singh',
    phone: '9000000001',
    email: 'ronak@meratractor.com',
    tempPassword: 'welcome123',
    role: 'SUPER_ADMIN',
    departmentId: '1',
    designationId: '1',
    branchId: '1',
    warehouseId: '1',
    joiningDate: '2024-01-01',
    employmentStatus: 'active',
    photo: null,
    aadhaarNumber: '',
    panNumber: '',
    bankAccount: '',
    ifsc: '',
    salaryStructure: '',
    address: '',
    documents: {},
    lastLogin: null,
  },
  {
    id: '2',
    employeeCode: 'EMP-0002',
    firstName: 'Aditya',
    middleName: 'Kumar',
    lastName: 'Singh',
    phone: '9000000002',
    email: 'aditya@dsfootwear.com',
    tempPassword: 'welcome123',
    role: 'ADMIN',
    departmentId: '1',
    designationId: '2',
    branchId: '1',
    warehouseId: '1',
    joiningDate: '2024-02-01',
    employmentStatus: 'active',
    photo: null,
    aadhaarNumber: '',
    panNumber: '',
    bankAccount: '',
    ifsc: '',
    salaryStructure: '',
    address: '',
    documents: {},
    lastLogin: null,
  },
  {
    id: '3',
    employeeCode: 'EMP-0003',
    firstName: 'Priya',
    middleName: '',
    lastName: 'Sharma',
    phone: '9000000003',
    email: 'priya@dsfootwear.com',
    tempPassword: 'welcome123',
    role: 'MANAGER',
    departmentId: '2',
    designationId: '3',
    branchId: '2',
    warehouseId: '2',
    joiningDate: '2024-03-01',
    employmentStatus: 'active',
    photo: null,
    aadhaarNumber: '',
    panNumber: '',
    bankAccount: '',
    ifsc: '',
    salaryStructure: '',
    address: '',
    documents: {},
    lastLogin: null,
  },
  {
    id: '4',
    employeeCode: 'EMP-0004',
    firstName: 'Rahul',
    middleName: '',
    lastName: 'Verma',
    phone: '9000000004',
    email: 'rahul@dsfootwear.com',
    tempPassword: 'welcome123',
    role: 'STAFF',
    departmentId: '6',
    designationId: '7',
    branchId: '1',
    warehouseId: '1',
    joiningDate: '2024-04-01',
    employmentStatus: 'terminated',
    photo: null,
    aadhaarNumber: '',
    panNumber: '',
    bankAccount: '',
    ifsc: '',
    salaryStructure: '',
    address: '',
    documents: {},
    lastLogin: null,
  },
];

export function findEmployeeByPhone(phone) {
  return MOCK_USERS.find((employee) => employee.phone === phone);
}

/**
 * Employee Create Flow (plan.md Chapter 9): once department/designation/role
 * are assigned, generate the employee code and a temporary password, then
 * "send" it — simulated here as a notification since there's no SMS gateway.
 */
function onboardEmployee(record) {
  const employeeCode = generateEmployeeCode(MOCK_USERS);
  const tempPassword = generateTempPassword();
  const next = { ...record, employeeCode, tempPassword };

  addNotification({
    title: 'Employee onboarded',
    message: `SMS sent to ${next.phone}: Welcome ${getEmployeeFullName(next)}, your employee code is ${employeeCode} and temporary password is ${tempPassword}.`,
  });

  return next;
}

export const userApi = createCrudApi('users', MOCK_USERS, {
  statusField: 'employmentStatus',
  hooks: { afterCreate: onboardEmployee },
});
