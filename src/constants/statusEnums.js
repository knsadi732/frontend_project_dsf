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
  REJECTED: 'rejected',
};

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

export const WORK_ORDER_STAGE_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'blocked_on_material', label: 'Blocked on material' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const RETURN_STATUS = {
  REPORTED: 'reported',
  WAREHOUSE_VERIFICATION: 'warehouse_verification',
  VERIFIED: 'verified',
  PROCESSED: 'processed',
  REJECTED: 'rejected',
};

export const RETURN_STATUS_OPTIONS = [
  { value: 'reported', label: 'Reported' },
  { value: 'warehouse_verification', label: 'Warehouse verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'processed', label: 'Processed' },
  { value: 'rejected', label: 'Rejected' },
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
  [ORDER_STATUS.REJECTED]: 'danger',
  [PAYMENT_STATUS.UNPAID]: 'danger',
  [PAYMENT_STATUS.PARTIAL]: 'warning',
  [PAYMENT_STATUS.PAID]: 'success',
  [PAYMENT_STATUS.OVERDUE]: 'danger',
  blocked_on_material: 'danger',
  [RETURN_STATUS.REPORTED]: 'warning',
  [RETURN_STATUS.WAREHOUSE_VERIFICATION]: 'info',
  [RETURN_STATUS.VERIFIED]: 'info',
  [RETURN_STATUS.PROCESSED]: 'success',
  [RETURN_STATUS.REJECTED]: 'danger',
};
