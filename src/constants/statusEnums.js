export const RECORD_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const EMPLOYMENT_STATUS = {
  PROBATION: 'probation',
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated',
};

export const ORDER_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

export const WORK_ORDER_STAGE_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function toStatusOptions(statusEnum) {
  return Object.values(statusEnum).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
}

export const STATUS_BADGE_VARIANT = {
  [RECORD_STATUS.ACTIVE]: 'success',
  [RECORD_STATUS.INACTIVE]: 'default',
  [EMPLOYMENT_STATUS.PROBATION]: 'warning',
  [EMPLOYMENT_STATUS.ON_LEAVE]: 'info',
  [EMPLOYMENT_STATUS.TERMINATED]: 'danger',
  [ORDER_STATUS.DRAFT]: 'default',
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.APPROVED]: 'info',
  [ORDER_STATUS.IN_PROGRESS]: 'info',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger',
  [PAYMENT_STATUS.UNPAID]: 'danger',
  [PAYMENT_STATUS.PARTIAL]: 'warning',
  [PAYMENT_STATUS.PAID]: 'success',
  [PAYMENT_STATUS.OVERDUE]: 'danger',
};
