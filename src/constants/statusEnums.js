export const RECORD_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
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

export const STATUS_BADGE_VARIANT = {
  [RECORD_STATUS.ACTIVE]: 'success',
  [RECORD_STATUS.INACTIVE]: 'default',
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
