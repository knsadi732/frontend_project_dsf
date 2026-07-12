import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@/features/users/validators/user.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { DocumentUploadField } from '@/features/users/components/DocumentUploadField';
import { ROLES } from '@/constants/roles';
import { EMPLOYMENT_STATUS, toStatusOptions } from '@/constants/statusEnums';

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: role }));
const EMPLOYMENT_STATUS_OPTIONS = toStatusOptions(EMPLOYMENT_STATUS);
const DOCUMENT_FIELDS = [
  { key: 'aadhaar', label: 'Aadhaar' },
  { key: 'pan', label: 'PAN' },
  { key: 'bank', label: 'Bank proof' },
  { key: 'photo', label: 'Photo' },
  { key: 'signature', label: 'Signature' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'experience', label: 'Experience letter' },
];

const DEFAULT_VALUES = {
  firstName: '',
  middleName: '',
  lastName: '',
  phone: '',
  email: '',
  primaryRole: 'EMPLOYEE',
  additionalRoles: [],
  departmentId: '',
  designationId: '',
  branchId: '',
  warehouseId: '',
  reportingManagerId: '',
  joiningDate: '',
  employmentStatus: 'probation',
  dob: '',
  gender: '',
  bloodGroup: '',
  maritalStatus: '',
  nationality: '',
  passportNumber: '',
  drivingLicense: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  aadhaarNumber: '',
  panNumber: '',
  bankAccount: '',
  ifsc: '',
  salaryStructure: '',
  address: '',
  emailNotifications: true,
  smsNotifications: true,
  inAppNotifications: true,
};

export function UserFormModal({
  open,
  onClose,
  initialValues,
  departmentOptions,
  designationOptions,
  branchOptions,
  warehouseOptions,
  employeeOptions,
  onSubmit,
  isSubmitting,
}) {
  const [documents, setDocuments] = useState(() => initialValues?.documents ?? {});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: initialValues ?? DEFAULT_VALUES,
  });

  const submit = (values) => {
    onSubmit({ ...values, documents });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit employee' : 'New employee'}
      className="max-w-2xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="user-form" loading={isSubmitting}>
            Save employee
          </AppButton>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(submit)} className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1" noValidate>
        {initialValues?.employeeCode && (
          <p className="text-xs text-text-muted">
            Employee code <span className="font-medium text-text">{initialValues.employeeCode}</span>
          </p>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Personal details</h3>
          <div className="grid grid-cols-3 gap-4">
            <AppInput label="First name" required error={errors.firstName?.message} {...register('firstName')} />
            <AppInput label="Middle name" error={errors.middleName?.message} {...register('middleName')} />
            <AppInput label="Last name" required error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Phone" required error={errors.phone?.message} {...register('phone')} />
            <AppInput label="Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>
          <AppInput label="Address" error={errors.address?.message} {...register('address')} />
          <div className="grid grid-cols-3 gap-4">
            <AppInput label="Date of birth" type="date" error={errors.dob?.message} {...register('dob')} />
            <AppSelect
              label="Gender"
              placeholder="Select gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              error={errors.gender?.message}
              {...register('gender')}
            />
            <AppInput label="Blood group" error={errors.bloodGroup?.message} {...register('bloodGroup')} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AppSelect
              label="Marital status"
              placeholder="Select status"
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
              ]}
              error={errors.maritalStatus?.message}
              {...register('maritalStatus')}
            />
            <AppInput label="Nationality" error={errors.nationality?.message} {...register('nationality')} />
            <AppInput label="Passport number" error={errors.passportNumber?.message} {...register('passportNumber')} />
          </div>
          <AppInput label="Driving license" error={errors.drivingLicense?.message} {...register('drivingLicense')} />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Emergency contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Name" error={errors.emergencyContactName?.message} {...register('emergencyContactName')} />
            <AppInput label="Number" error={errors.emergencyContactNumber?.message} {...register('emergencyContactNumber')} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Employment</h3>
          <div className="grid grid-cols-2 gap-4">
            <AppSelect label="Department" error={errors.departmentId?.message} options={departmentOptions} placeholder="Select department" {...register('departmentId')} />
            <AppSelect label="Designation" error={errors.designationId?.message} options={designationOptions} placeholder="Select designation" {...register('designationId')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppSelect label="Branch" error={errors.branchId?.message} options={branchOptions} placeholder="Select branch" {...register('branchId')} />
            <AppSelect label="Warehouse" error={errors.warehouseId?.message} options={warehouseOptions} placeholder="Select warehouse" {...register('warehouseId')} />
          </div>
          <AppSelect
            label="Reporting manager"
            placeholder="Select reporting manager"
            options={employeeOptions}
            error={errors.reportingManagerId?.message}
            {...register('reportingManagerId')}
          />
          <div className="grid grid-cols-2 gap-4">
            <AppSelect label="Primary role" error={errors.primaryRole?.message} options={ROLE_OPTIONS} {...register('primaryRole')} />
            <AppSelect
              label="Additional roles"
              multiple
              helperText="Ctrl/Cmd-click to select more than one"
              error={errors.additionalRoles?.message}
              options={ROLE_OPTIONS}
              {...register('additionalRoles')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Joining date" type="date" error={errors.joiningDate?.message} {...register('joiningDate')} />
            <AppSelect
              label="Employment status"
              error={errors.employmentStatus?.message}
              options={EMPLOYMENT_STATUS_OPTIONS}
              {...register('employmentStatus')}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Government ID &amp; bank</h3>
          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Aadhaar number" error={errors.aadhaarNumber?.message} {...register('aadhaarNumber')} />
            <AppInput label="PAN number" error={errors.panNumber?.message} {...register('panNumber')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Bank account number" error={errors.bankAccount?.message} {...register('bankAccount')} />
            <AppInput label="IFSC code" error={errors.ifsc?.message} {...register('ifsc')} />
          </div>
          <AppInput label="Salary structure" helperText="e.g. 25000 fixed + incentives" error={errors.salaryStructure?.message} {...register('salaryStructure')} />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Notification preferences</h3>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" className="size-4" {...register('emailNotifications')} />
              Email
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" className="size-4" {...register('smsNotifications')} />
              SMS
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" className="size-4" {...register('inAppNotifications')} />
              In-app
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Documents <span className="normal-case text-text-muted">(uploaded once, reused across HR, Accounts, Payroll, Finance, Dispatch)</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {DOCUMENT_FIELDS.map((doc) => (
              <DocumentUploadField
                key={doc.key}
                label={doc.label}
                fileName={documents[doc.key]}
                onChange={(fileName) => setDocuments((prev) => ({ ...prev, [doc.key]: fileName ?? prev[doc.key] }))}
              />
            ))}
          </div>
        </section>
      </form>
    </AppModal>
  );
}
