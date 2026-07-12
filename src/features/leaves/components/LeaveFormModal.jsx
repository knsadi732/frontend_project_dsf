import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveSchema, LEAVE_TYPE_OPTIONS, LEAVE_STATUS_OPTIONS } from '@/features/leaves/validators/leave.schema';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';

const DEFAULT_VALUES = {
  employeeId: '',
  leaveType: 'casual',
  fromDate: '',
  toDate: '',
  reason: '',
  status: 'pending',
  appliedDate: '',
};

export function LeaveFormModal({ open, onClose, initialValues, employeeOptions, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) reset(initialValues ?? { ...DEFAULT_VALUES, appliedDate: new Date().toISOString().slice(0, 10) });
  }, [open, initialValues, reset]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={initialValues ? 'Edit leave request' : 'New leave request'}
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" form="leave-form" loading={isSubmitting}>
            Save
          </AppButton>
        </>
      }
    >
      <form id="leave-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <AppSelect
            label="Employee"
            placeholder="Select employee"
            required
            options={employeeOptions}
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />
          <AppSelect label="Leave type" options={LEAVE_TYPE_OPTIONS} error={errors.leaveType?.message} {...register('leaveType')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AppInput label="From date" type="date" required error={errors.fromDate?.message} {...register('fromDate')} />
          <AppInput label="To date" type="date" required error={errors.toDate?.message} {...register('toDate')} />
        </div>
        <AppInput label="Reason" error={errors.reason?.message} {...register('reason')} />
        <AppSelect label="Status" options={LEAVE_STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
      </form>
    </AppModal>
  );
}
