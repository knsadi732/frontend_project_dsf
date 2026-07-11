import { Check, X } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { getEmployeeFullName } from '@/utils/employeeName';

const DOCUMENT_FIELDS = [
  { key: 'aadhaar', label: 'Aadhaar' },
  { key: 'pan', label: 'PAN' },
  { key: 'bank', label: 'Bank proof' },
  { key: 'photo', label: 'Photo' },
  { key: 'signature', label: 'Signature' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'experience', label: 'Experience letter' },
];

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text">{value || '—'}</span>
    </div>
  );
}

export function UserDetailModal({ open, onClose, user, departmentsById, designationsById, branchesById, warehousesById }) {
  if (!user) return null;

  return (
    <AppModal open={open} onClose={onClose} title="Employee details" className="max-w-xl">
      <div className="mb-5 flex items-center gap-3">
        <BaseAvatar name={getEmployeeFullName(user)} src={user.photo} size="lg" />
        <div>
          <p className="text-base font-semibold text-text">{getEmployeeFullName(user)}</p>
          <p className="text-sm text-text-muted">{user.employeeCode}</p>
        </div>
      </div>

      <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Personal</h3>
          <DetailRow label="Phone" value={user.phone} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Address" value={user.address} />
        </div>

        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Employment</h3>
          <DetailRow label="Department" value={departmentsById?.[user.departmentId]?.name} />
          <DetailRow label="Designation" value={designationsById?.[user.designationId]?.title} />
          <DetailRow label="Branch" value={branchesById?.[user.branchId]?.name} />
          <DetailRow label="Warehouse" value={warehousesById?.[user.warehouseId]?.name} />
          <DetailRow label="Role" value={<BaseBadge variant="info">{user.role}</BaseBadge>} />
          <DetailRow label="Joining date" value={user.joiningDate} />
          <DetailRow
            label="Employment status"
            value={
              <BaseBadge variant={STATUS_BADGE_VARIANT[user.employmentStatus] ?? 'default'}>
                {user.employmentStatus}
              </BaseBadge>
            }
          />
        </div>

        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Government ID &amp; bank</h3>
          <DetailRow label="Aadhaar number" value={user.aadhaarNumber} />
          <DetailRow label="PAN number" value={user.panNumber} />
          <DetailRow label="Bank account" value={user.bankAccount} />
          <DetailRow label="IFSC" value={user.ifsc} />
          <DetailRow label="Salary structure" value={user.salaryStructure} />
        </div>

        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Documents</h3>
          <div className="grid grid-cols-2 gap-2">
            {DOCUMENT_FIELDS.map((doc) => {
              const uploaded = Boolean(user.documents?.[doc.key]);
              return (
                <div key={doc.key} className="flex items-center gap-2 text-sm">
                  {uploaded ? <Check className="size-4 text-success" /> : <X className="size-4 text-text-muted" />}
                  <span className={uploaded ? 'text-text' : 'text-text-muted'}>{doc.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppModal>
  );
}
