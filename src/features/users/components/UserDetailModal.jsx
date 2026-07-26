import { Check, X } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
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

export function UserDetailModal({ open, onClose, user, departmentsById, designationsById, branchesById, warehousesById, employeesById, rolesById }) {
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
          <DetailRow label="Permanent address" value={user.permanentAddress} />
          <DetailRow label="Current address" value={user.currentAddress} />
          <DetailRow label="City / State" value={[user.city, user.state].filter(Boolean).join(', ')} />
          <DetailRow label="Country / Postal code" value={[user.country, user.postalCode].filter(Boolean).join(' - ')} />
          <DetailRow label="Date of birth" value={user.dob} />
          <DetailRow label="Gender" value={user.gender} />
          <DetailRow label="Blood group" value={user.bloodGroup} />
          <DetailRow label="Marital status" value={user.maritalStatus} />
          <DetailRow label="Nationality" value={user.nationality} />
          <DetailRow label="Passport number" value={user.passportNumber} />
          <DetailRow label="Driving license" value={user.drivingLicense} />
        </div>

        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Emergency contact</h3>
          <DetailRow label="Name" value={user.emergencyContactName} />
          <DetailRow label="Number" value={user.emergencyContactNumber} />
        </div>

        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Employment</h3>
          <DetailRow label="Department" value={departmentsById?.[user.departmentId]?.name ?? user.departmentName} />
          <DetailRow label="Designation" value={designationsById?.[user.designationId]?.title ?? user.designationTitle} />
          <DetailRow label="Branch" value={branchesById?.[user.branchId]?.name} />
          <DetailRow label="Warehouse" value={warehousesById?.[user.warehouseId]?.name} />
          <DetailRow label="Reporting manager" value={employeesById?.[user.reportingManagerId] ? getEmployeeFullName(employeesById[user.reportingManagerId]) : undefined} />
          <DetailRow
            label="Role"
            value={
              <div className="flex flex-wrap justify-end gap-1">
                <BaseBadge variant="info">{rolesById?.[user.primaryRole]?.name ?? user.primaryRole}</BaseBadge>
                {user.additionalRoles?.map((role) => (
                  <BaseBadge key={role} variant="default">
                    {rolesById?.[role]?.name ?? role}
                  </BaseBadge>
                ))}
              </div>
            }
          />
          <DetailRow label="Joining date" value={user.joiningDate} />
          <DetailRow label="Employment status" value={<StatusBadge status={user.employmentStatus} />} />
        </div>

        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Government ID &amp; bank</h3>
          <DetailRow label="Aadhaar number" value={user.aadhaarNumber} />
          <DetailRow label="PAN number" value={user.panNumber} />
          <DetailRow label="Bank name" value={user.bankName} />
          <DetailRow label="Account holder name" value={user.accountHolderName} />
          <DetailRow label="Bank account" value={user.bankAccount} />
          <DetailRow label="IFSC" value={user.ifsc} />
          <DetailRow label="UPI ID" value={user.upiId} />
          <DetailRow label="Salary structure" value={user.salaryStructure} />
        </div>

        <div className="flex flex-col">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">System</h3>
          <DetailRow label="Last login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : undefined} />
          <DetailRow label="Password last changed" value={user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleString() : undefined} />
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
