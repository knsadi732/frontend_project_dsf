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
  REQUESTED: 'requested',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  PICKUP_SCHEDULED: 'pickup_scheduled',
  WAREHOUSE_RECEIVED: 'warehouse_received',
  INSPECTION_COMPLETED: 'inspection_completed',
  RESOLVED: 'resolved',
};

export const RETURN_STATUS_OPTIONS = [
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'partially_approved', label: 'Partially approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pickup_scheduled', label: 'Pickup scheduled' },
  { value: 'warehouse_received', label: 'Warehouse received' },
  { value: 'inspection_completed', label: 'Inspection completed' },
  { value: 'resolved', label: 'Resolved' },
];

export const RETURN_REASON_OPTIONS = [
  { value: 'wrong_product', label: 'Wrong Product' },
  { value: 'wrong_size', label: 'Wrong Size' },
  { value: 'wrong_color', label: 'Wrong Color' },
  { value: 'manufacturing_defect', label: 'Manufacturing Defect' },
  { value: 'damaged_in_transit', label: 'Damaged in Transit' },
  { value: 'packaging_damage', label: 'Packaging Damage' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'customer_changed_mind', label: 'Customer Changed Mind' },
  { value: 'duplicate_order', label: 'Duplicate Order' },
  { value: 'other', label: 'Other' },
];

export const INSPECTION_RESULT_OPTIONS = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'repairable', label: 'Repairable' },
  { value: 'scrap', label: 'Scrap' },
];

export const RETURN_DECISION_OPTIONS = [
  { value: 'restock', label: 'Restock' },
  { value: 'repair', label: 'Repair' },
  { value: 'scrap', label: 'Scrap' },
  { value: 'reject', label: 'Reject' },
];

export const RESOLUTION_TYPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'refund', label: 'Refund' },
  { value: 'replacement', label: 'Replacement' },
];

export const REFUND_METHOD_OPTIONS = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'original_method', label: 'Original Payment Method' },
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
  [RETURN_STATUS.REQUESTED]: 'warning',
  [RETURN_STATUS.APPROVED]: 'info',
  [RETURN_STATUS.PARTIALLY_APPROVED]: 'info',
  [RETURN_STATUS.REJECTED]: 'danger',
  [RETURN_STATUS.CANCELLED]: 'danger',
  [RETURN_STATUS.PICKUP_SCHEDULED]: 'info',
  [RETURN_STATUS.WAREHOUSE_RECEIVED]: 'info',
  [RETURN_STATUS.INSPECTION_COMPLETED]: 'info',
  [RETURN_STATUS.RESOLVED]: 'success',
  passed: 'success',
  failed: 'danger',
  repairable: 'warning',
  scrap: 'danger',
};
